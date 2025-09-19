"use server";

import OpenAI from "openai";
import type {
  ExtractedFieldResult,
  CompleteExtractedData,
  EnhancedExtractedPropertyData,
  EnhancedExtractedListingData,
  FieldMapping,
} from "~/types/textract-enhanced";
import { ALL_FIELD_MAPPINGS } from "~/server/ocr/field-mapping-config";
import type { TranscriptionResult } from "./transcription-service";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface VoiceExtractionInput {
  transcript: string;
  confidence: number;
  language: string;
  referenceNumber?: string;
}

/**
 * Enhanced voice field extraction using GPT-4 for context-aware data extraction
 * Adapts the existing OCR field extraction pattern for voice transcripts
 */
export async function extractPropertyDataFromVoice(
  transcriptionResult: TranscriptionResult,
  referenceNumber?: string
): Promise<{
  extractedFields: ExtractedFieldResult[];
  propertyData: EnhancedExtractedPropertyData;
  listingData: EnhancedExtractedListingData;
  completeData: CompleteExtractedData;
}> {
  console.log(`🧠 [VOICE-EXTRACTION] Starting property data extraction from voice transcript...`);
  console.log(`📝 [VOICE-EXTRACTION] Transcript length: ${transcriptionResult.transcript.length} characters`);
  console.log(`🎯 [VOICE-EXTRACTION] Confidence: ${transcriptionResult.confidence}%`);

  const voiceInput: VoiceExtractionInput = {
    transcript: transcriptionResult.transcript,
    confidence: transcriptionResult.confidence,
    language: transcriptionResult.language,
    referenceNumber,
  };

  // Step 1: Use GPT-4 for intelligent extraction
  const gptExtractedFields = await extractWithGPT4(voiceInput);
  
  // Step 2: Apply pattern-based extraction as fallback/enhancement
  const patternExtractedFields = extractFromVoicePatterns(voiceInput.transcript);
  
  // Step 3: Merge and consolidate results
  const allResults = [...gptExtractedFields, ...patternExtractedFields];
  const consolidatedResults = consolidateVoiceResults(allResults);

  // Step 4: Separate property and listing data
  const propertyFields = consolidatedResults.filter(r => r.dbTable === "properties");
  const listingFields = consolidatedResults.filter(r => r.dbTable === "listings");

  // Step 5: Build structured data objects
  const propertyData: EnhancedExtractedPropertyData = {};
  const listingData: EnhancedExtractedListingData = {};

  for (const field of propertyFields) {
    (propertyData as Record<string, unknown>)[field.dbColumn] = field.value;
  }

  for (const field of listingFields) {
    (listingData as Record<string, unknown>)[field.dbColumn] = field.value;
  }

  const completeData: CompleteExtractedData = {
    property: propertyData,
    listing: listingData,
  };

  console.log(`✅ [VOICE-EXTRACTION] Extraction completed:`);
  console.log(`   - Total fields extracted: ${consolidatedResults.length}`);
  console.log(`   - Property fields: ${propertyFields.length}`);
  console.log(`   - Listing fields: ${listingFields.length}`);
  console.log(`   - Average confidence: ${(consolidatedResults.reduce((sum, r) => sum + r.confidence, 0) / consolidatedResults.length).toFixed(1)}%`);

  return {
    extractedFields: consolidatedResults,
    propertyData,
    listingData,
    completeData,
  };
}

/**
 * Use GPT-4 for intelligent, context-aware property data extraction
 */
async function extractWithGPT4(voiceInput: VoiceExtractionInput): Promise<ExtractedFieldResult[]> {
  console.log(`🤖 [GPT4-EXTRACTION] Starting GPT-4 extraction...`);

  // Build field mappings prompt
  const fieldMappingsPrompt = ALL_FIELD_MAPPINGS
    .map(mapping => `- ${mapping.dbColumn} (${mapping.dbTable}): ${mapping.aliases.slice(0, 3).join(", ")}`)
    .join("\n");

  const systemPrompt = `Eres un experto en extracción de datos inmobiliarios. Tu trabajo es extraer información estructurada de descripciones de propiedades en español.

CAMPOS DISPONIBLES:
${fieldMappingsPrompt}

REGLAS DE EXTRACCIÓN:
1. Solo extrae información explícitamente mencionada en el texto
2. No inventes ni asumas datos que no estén presentes
3. Convierte valores a los tipos correctos (números, booleanos, texto)
4. Para precios, quita símbolos de moneda y separadores
5. Para habitaciones/baños, extrae solo números
6. Para características booleanas, determina si están presentes (true) o no mencionadas (false)
7. Asigna una confianza de 1-100 basada en qué tan explícita es la información

FORMATO DE RESPUESTA (JSON):
[
  {
    "dbColumn": "campo_base_datos",
    "dbTable": "properties" | "listings",
    "value": valor_extraido,
    "originalText": "texto_original_donde_se_encontro",
    "confidence": numero_1_100,
    "reasoning": "breve_explicacion"
  }
]`;

  const userPrompt = `Extrae toda la información inmobiliaria posible de esta descripción:

"${voiceInput.transcript}"

Extrae SOLO los datos que estén explícitamente mencionados. Responde únicamente con el JSON de los campos extraídos.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No response from GPT-4");
    }

    // Parse the JSON response
    let gptResults: any[];
    try {
      const parsed = JSON.parse(responseContent);
      gptResults = Array.isArray(parsed) ? parsed : parsed.fields || [];
    } catch (error) {
      console.error("❌ [GPT4-EXTRACTION] Failed to parse GPT-4 response:", error);
      return [];
    }

    const extractedFields: ExtractedFieldResult[] = [];

    for (const result of gptResults) {
      if (!result.dbColumn || !result.dbTable || result.value === undefined) {
        continue;
      }

      // Find the corresponding field mapping for validation
      const fieldMapping = ALL_FIELD_MAPPINGS.find(
        mapping => mapping.dbColumn === result.dbColumn && mapping.dbTable === result.dbTable
      );

      if (!fieldMapping) {
        console.warn(`⚠️ [GPT4-EXTRACTION] Unknown field: ${result.dbTable}.${result.dbColumn}`);
        continue;
      }

      // Apply validation if available
      const stringValue = String(result.value);
      if (fieldMapping.validation && !fieldMapping.validation(stringValue)) {
        console.warn(`⚠️ [GPT4-EXTRACTION] Validation failed for ${result.dbColumn}: ${stringValue}`);
        continue;
      }

      // Convert value using converter function
      let convertedValue: string | number | boolean = result.value;
      if (fieldMapping.converter) {
        try {
          convertedValue = fieldMapping.converter(stringValue);
        } catch (error) {
          console.warn(`⚠️ [GPT4-EXTRACTION] Conversion failed for ${result.dbColumn}: ${stringValue}`);
          convertedValue = result.value;
        }
      }

      // Adjust confidence based on transcript confidence
      const adjustedConfidence = Math.min(
        result.confidence || 80,
        (result.confidence || 80) * (voiceInput.confidence / 100)
      );

      extractedFields.push({
        dbColumn: result.dbColumn,
        dbTable: result.dbTable,
        value: convertedValue,
        originalText: result.originalText || "",
        confidence: adjustedConfidence,
        extractionSource: "gpt4",
        fieldType: fieldMapping.dataType,
        matched_alias: result.reasoning || "GPT-4 extraction",
      });

      console.log(
        `✅ [GPT4-EXTRACTION] Extracted: ${result.dbColumn} = ${convertedValue} (${adjustedConfidence.toFixed(1)}% confidence)`
      );
    }

    console.log(`🤖 [GPT4-EXTRACTION] Completed: ${extractedFields.length} fields extracted`);
    return extractedFields;

  } catch (error) {
    console.error("❌ [GPT4-EXTRACTION] Error in GPT-4 extraction:", error);
    return [];
  }
}

/**
 * Pattern-based extraction adapted from OCR field extractor
 * Serves as fallback and validation for GPT-4 results
 */
function extractFromVoicePatterns(transcript: string): ExtractedFieldResult[] {
  const results: ExtractedFieldResult[] = [];
  const text = transcript.toLowerCase();

  console.log(`🔍 [PATTERN-EXTRACTION] Processing voice patterns...`);

  // Enhanced patterns for voice transcripts (more natural language)
  const voicePatterns: Record<string, RegExp[]> = {
    // Price patterns - more natural speech
    price: [
      /(?:precio|cuesta|vale|por)\s+(?:unos?\s+)?(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:euros?|€)/i,
      /(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:euros?|€)/i,
      /(?:piden|pido|precio de)\s+(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)/i,
    ],
    
    // Square meters - natural speech
    squareMeter: [
      /(?:tiene|son|mide)\s+(?:unos?\s+)?(\d+(?:[.,]\d+)?)\s*(?:metros?\s*cuadrados?|m²|m2)/i,
      /(\d+(?:[.,]\d+)?)\s*(?:metros?\s*cuadrados?|m²|m2)/i,
      /superficie\s+de\s+(\d+(?:[.,]\d+)?)/i,
    ],
    
    // Rooms - natural speech
    bedrooms: [
      /(?:tiene|son|hay)\s+(\d+)\s*(?:dormitorios?|habitaciones?|cuartos?)/i,
      /(\d+)\s*(?:dormitorios?|habitaciones?|cuartos?)/i,
      /(?:de|con)\s+(\d+)\s*(?:habitaciones?|dorm)/i,
    ],
    
    bathrooms: [
      /(?:tiene|son|hay)\s+(\d+(?:[.,]\d+)?)\s*(?:baños?|aseos?)/i,
      /(\d+(?:[.,]\d+)?)\s*(?:baños?|aseos?)/i,
      /(?:de|con)\s+(\d+(?:[.,]\d+)?)\s*baños?/i,
    ],
    
    // Address - more flexible for speech
    street: [
      /(?:está en|ubicado en|dirección)\s+([^,\.]+(?:calle|avenida|plaza|paseo)[^,\.]+)/i,
      /(?:en la|en el|en)\s+(calle|avenida|plaza|paseo)\s+([^,\.]+)/i,
    ],
    
    // Year built
    yearBuilt: [
      /(?:construido|edificado|del año|año)\s+(\d{4})/i,
      /(?:de|del)\s+(\d{4})/i,
    ],
    
    // Property type
    propertyType: [
      /(?:es un|se trata de|tipo)\s+(piso|casa|chalet|apartamento|local|garaje|estudio|loft|dúplex|ático)/i,
      /(piso|casa|chalet|apartamento|local|garaje|estudio|loft|dúplex|ático)/i,
    ],
    
    // Boolean features - natural language detection
    hasElevator: [
      /(?:tiene|hay|con)\s+ascensor/i,
      /ascensor/i,
    ],
    
    hasGarage: [
      /(?:tiene|hay|con|incluye)\s+(?:garaje|parking|aparcamiento|plaza)/i,
      /(?:garaje|parking|aparcamiento)/i,
    ],
    
    hasStorageRoom: [
      /(?:tiene|hay|con|incluye)\s+trastero/i,
      /trastero/i,
    ],
    
    terrace: [
      /(?:tiene|hay|con)\s+(?:terraza|balcón)/i,
      /(?:terraza|balcón)/i,
    ],
    
    pool: [
      /(?:tiene|hay|con)\s+piscina/i,
      /piscina/i,
    ],
    
    garden: [
      /(?:tiene|hay|con)\s+jardín/i,
      /jardín/i,
    ],
    
    airConditioningType: [
      /(?:tiene|hay|con)\s+aire\s*acondicionado/i,
      /aire\s*acondicionado/i,
    ],
    
    furnished: [
      /(?:está|viene)\s+amueblado/i,
      /amueblado/i,
      /con\s+muebles/i,
    ],
    
    // Energy certification
    energyConsumptionScale: [
      /(?:certificado|eficiencia)\s+energética?\s+([A-G])/i,
      /energía\s+([A-G])/i,
    ],
    
    // Orientation
    orientation: [
      /orientación?\s+(?:al\s+)?(?:hacia\s+el\s+)?(norte|sur|este|oeste|noreste|noroeste|sureste|suroeste)/i,
      /(?:hacia\s+el\s+|orientado?\s+al\s+)(norte|sur|este|oeste)/i,
    ],
  };

  // Process each pattern category
  for (const [category, patterns] of Object.entries(voicePatterns)) {
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches?.[1]) {
        const value = matches[1].trim();

        // Find corresponding field mapping
        const fieldMapping = ALL_FIELD_MAPPINGS.find((mapping) =>
          mapping.aliases.some((alias) =>
            alias.toLowerCase().includes(category.toLowerCase()) ||
            category.toLowerCase().includes(alias.toLowerCase())
          ) ||
          mapping.dbColumn === category
        );

        if (fieldMapping) {
          // Apply validation
          if (fieldMapping.validation && !fieldMapping.validation(value)) {
            continue;
          }

          // Convert value
          let convertedValue: string | number | boolean = value;
          if (fieldMapping.converter) {
            try {
              convertedValue = fieldMapping.converter(value);
            } catch {
              convertedValue = value;
            }
          }

          // Voice patterns get higher confidence than OCR regex patterns
          const confidence = Math.min(90, 70 + (value.length > 2 ? 15 : 0) + (matches[0].includes("tiene") || matches[0].includes("con") ? 10 : 0));

          results.push({
            dbColumn: fieldMapping.dbColumn,
            dbTable: fieldMapping.dbTable,
            value: convertedValue,
            originalText: matches[0],
            confidence,
            extractionSource: "voice_pattern",
            fieldType: fieldMapping.dataType,
            matched_alias: category,
          });

          console.log(
            `✅ [PATTERN-EXTRACTION] Pattern match: "${category}" → ${fieldMapping.dbColumn} (${confidence}% confidence)`
          );
        }
      }
    }
  }

  console.log(`🔍 [PATTERN-EXTRACTION] Completed: ${results.length} fields extracted`);
  return results;
}

/**
 * Consolidate and deduplicate extracted fields with enhanced logic for voice
 */
function consolidateVoiceResults(results: ExtractedFieldResult[]): ExtractedFieldResult[] {
  const consolidatedMap = new Map<string, ExtractedFieldResult>();

  // Sort by confidence and source priority (GPT-4 > voice_pattern > others)
  const sortedResults = results.sort((a, b) => {
    // First sort by source priority
    const sourceOrder = { gpt4: 3, voice_pattern: 2, regex: 1, text: 0 };
    const aSourcePriority = sourceOrder[a.extractionSource as keyof typeof sourceOrder] || 0;
    const bSourcePriority = sourceOrder[b.extractionSource as keyof typeof sourceOrder] || 0;
    
    if (aSourcePriority !== bSourcePriority) {
      return bSourcePriority - aSourcePriority;
    }
    
    // Then by confidence
    return b.confidence - a.confidence;
  });

  for (const result of sortedResults) {
    const key = `${result.dbTable}.${result.dbColumn}`;

    // For voice extraction, be more selective about overwrites
    const existing = consolidatedMap.get(key);
    if (!existing || 
        result.extractionSource === "gpt4" || 
        (existing.extractionSource !== "gpt4" && result.confidence > existing.confidence + 10)) {
      consolidatedMap.set(key, result);
    }
  }

  const consolidated = Array.from(consolidatedMap.values());
  console.log(
    `🔄 [VOICE-EXTRACTION] Consolidated ${results.length} raw results into ${consolidated.length} unique fields`
  );

  return consolidated;
}