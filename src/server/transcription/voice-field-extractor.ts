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

  // Step 2: Separate property and listing data
  const propertyFields = gptExtractedFields.filter(r => r.dbTable === "properties");
  const listingFields = gptExtractedFields.filter(r => r.dbTable === "listings");

  // Step 3: Build structured data objects
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
  console.log(`   - Total fields extracted: ${gptExtractedFields.length}`);
  console.log(`   - Property fields: ${propertyFields.length}`);
  console.log(`   - Listing fields: ${listingFields.length}`);
  console.log(`   - Average confidence: ${(gptExtractedFields.reduce((sum, r) => sum + r.confidence, 0) / gptExtractedFields.length).toFixed(1)}%`);

  return {
    extractedFields: gptExtractedFields,
    propertyData,
    listingData,
    completeData,
  };
}

/**
 * Use GPT-4 with multiple specialized function calls for intelligent, structured property data extraction
 */
async function extractWithGPT4(voiceInput: VoiceExtractionInput): Promise<ExtractedFieldResult[]> {
  console.log(`🤖 [GPT4-FUNCTION-CALLING] Starting multi-function GPT-4 extraction...`);

  // Define multiple extraction functions for different categories
  const extractionFunctions = [
    {
      name: "extract_basic_property_info",
      description: "Extract basic property information like type, size, rooms, and location",
      parameters: {
        type: "object",
        properties: {
          property_type: { type: "string", description: "Type of property (piso, casa, chalet, apartamento, local, garaje, estudio, loft, dúplex, ático)" },
          bedrooms: { type: "integer", minimum: 0, maximum: 10, description: "Number of bedrooms/habitaciones" },
          bathrooms: { type: "number", minimum: 0, maximum: 10, description: "Number of bathrooms/baños (can be decimal like 1.5)" },
          square_meter: { type: "number", minimum: 1, maximum: 10000, description: "Total square meters/metros cuadrados" },
          year_built: { type: "integer", minimum: 1800, maximum: 2030, description: "Year the property was built" },
          street: { type: "string", description: "Street address/calle where the property is located" },
          postal_code: { type: "string", pattern: "^\\d{5}$", description: "5-digit postal code" },
          city: { type: "string", description: "City/ciudad name" },
          province: { type: "string", description: "Province/provincia name" },
          orientation: { type: "string", enum: ["norte", "sur", "este", "oeste", "noreste", "noroeste", "sureste", "suroeste"], description: "Property orientation" },
          original_text: { type: "string", description: "Original text snippet where this information was found" },
          confidence: { type: "integer", minimum: 1, maximum: 100, description: "Confidence level (1-100)" }
        },
        required: ["original_text", "confidence"]
      }
    },
    {
      name: "extract_listing_details",
      description: "Extract listing information like price, operation type, and availability",
      parameters: {
        type: "object",
        properties: {
          listing_type: { type: "string", enum: ["Sale", "Rent", "RentWithOption", "Transfer", "RoomSharing"], description: "Type of listing operation (Sale=venta, Rent=alquiler, RentWithOption=alquiler con opción a compra, Transfer=traspaso, RoomSharing=compartir habitación)" },
          price: { type: "number", minimum: 0, description: "Price in euros (remove currency symbols)" },
          is_furnished: { type: "boolean", description: "Whether the property comes furnished/amueblado" },
          has_keys: { type: "boolean", description: "Whether keys are available/con llaves" },
          pets_allowed: { type: "boolean", description: "Whether pets are allowed/mascotas permitidas" },
          student_friendly: { type: "boolean", description: "Whether suitable for students/para estudiantes" },
          internet: { type: "boolean", description: "Whether internet/WiFi is included" },
          original_text: { type: "string", description: "Original text snippet where this information was found" },
          confidence: { type: "integer", minimum: 1, maximum: 100, description: "Confidence level (1-100)" }
        },
        required: ["original_text", "confidence"]
      }
    },
    {
      name: "extract_property_features",
      description: "Extract property features and amenities like elevator, garage, pool, etc.",
      parameters: {
        type: "object",
        properties: {
          has_elevator: { type: "boolean", description: "Whether the property has elevator/ascensor - ONLY include if explicitly mentioned" },
          has_garage: { type: "boolean", description: "Whether the property has garage/parking - ONLY include if explicitly mentioned" },
          has_storage_room: { type: "boolean", description: "Whether the property has storage room/trastero - ONLY include if explicitly mentioned" },
          terrace: { type: "boolean", description: "Whether the property has terrace/terraza - ONLY include if explicitly mentioned" },
          community_pool: { type: "boolean", description: "Whether the property has community pool/piscina comunitaria - ONLY include if explicitly mentioned" },
          private_pool: { type: "boolean", description: "Whether the property has private pool/piscina privada - ONLY include if explicitly mentioned" },
          garden: { type: "boolean", description: "Whether the property has garden/jardín - ONLY include if explicitly mentioned" },
          air_conditioning_type: { type: "string", enum: ["individual", "centralizado", "no"], description: "Type of air conditioning/aire acondicionado" },
          heating_type: { type: "string", enum: ["individual", "centralizado", "gas", "eléctrico", "no"], description: "Type of heating/calefacción" },
          energy_consumption_scale: { type: "string", enum: ["A", "B", "C", "D", "E", "F", "G"], description: "Energy efficiency rating/certificado energético" },
          conservation_status: { type: "integer", enum: [1, 2, 3, 4, 6], description: "Property conservation status (1=excelente, 2=bueno, 3=regular, 4=malo, 6=obra nueva)" },
          original_text: { type: "string", description: "Original text snippet where this information was found" },
          confidence: { type: "integer", minimum: 1, maximum: 100, description: "Confidence level (1-100)" }
        },
        required: ["original_text", "confidence"]
      }
    },
    {
      name: "extract_appliances_amenities",
      description: "Extract information about appliances and additional amenities",
      parameters: {
        type: "object",
        properties: {
          oven: { type: "boolean", description: "Whether the property has oven/horno - ONLY include if explicitly mentioned" },
          microwave: { type: "boolean", description: "Whether the property has microwave/microondas - ONLY include if explicitly mentioned" },
          washing_machine: { type: "boolean", description: "Whether the property has washing machine/lavadora - ONLY include if explicitly mentioned" },
          fridge: { type: "boolean", description: "Whether the property has fridge/frigorífico - ONLY include if explicitly mentioned" },
          tv: { type: "boolean", description: "Whether the property has TV/televisión - ONLY include if explicitly mentioned" },
          dishwasher: { type: "boolean", description: "Whether the property has dishwasher/lavavajillas - ONLY include if explicitly mentioned" },
          stoneware: { type: "boolean", description: "Whether dishes/vajilla are included - ONLY include if explicitly mentioned" },
          appliances_included: { type: "boolean", description: "Whether appliances/electrodomésticos are included - ONLY include if explicitly mentioned" },
          original_text: { type: "string", description: "Original text snippet where this information was found" },
          confidence: { type: "integer", minimum: 1, maximum: 100, description: "Confidence level (1-100)" }
        },
        required: ["original_text", "confidence"]
      }
    }
  ];

  const systemPrompt = `Eres un experto en extracción de datos inmobiliarios. Tu trabajo es extraer información estructurada de descripciones de propiedades en español usando las funciones especializadas disponibles.

REGLAS DE EXTRACCIÓN:
1. Solo extrae información explícitamente mencionada en el texto
2. No inventes ni asumas datos que no estén presentes
3. Convierte valores a los tipos correctos (números, booleanos, texto)
4. Para precios, quita símbolos de moneda y separadores (ej: "€150.000" → 150000)
5. Para habitaciones/baños, extrae solo números (ej: "tres habitaciones" → 3)
6. Para características booleanas: SOLO incluye el campo si está explícitamente mencionado (true si presente, false si se menciona que NO está)
7. NO incluyas campos que no se mencionan en absoluto
8. Asigna una confianza de 1-100 basada en qué tan explícita es la información
9. Incluye el texto original exacto donde encontraste cada dato

FUNCIONES DISPONIBLES:
- extract_basic_property_info: información básica (tipo, habitaciones, metros, ubicación)
- extract_listing_details: detalles del anuncio (precio, tipo operación, disponibilidad)
- extract_property_features: características de la propiedad (ascensor, garaje, piscina, etc.)
- extract_appliances_amenities: electrodomésticos y amenidades

TIPOS DE OPERACIÓN VÁLIDOS:
- Sale: para venta
- Rent: para alquiler
- RentWithOption: para alquiler con opción a compra
- Transfer: para traspaso
- RoomSharing: para compartir habitación

Usa las funciones apropiadas para extraer SOLO los datos que estén explícitamente mencionados en la descripción.`;

  const userPrompt = `Extrae toda la información inmobiliaria posible de esta descripción de voz:

"${voiceInput.transcript}"

Extrae únicamente los datos que estén claramente mencionados en el texto.`;

  const allExtractedFields: ExtractedFieldResult[] = [];

  // Execute each function call sequentially
  for (const func of extractionFunctions) {
  try {
      console.log(`🔍 [GPT4-FUNCTION-CALLING] Executing function: ${func.name}`);
      
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
        max_tokens: 1500,
        tools: [
          {
            type: "function",
            function: func
          }
        ],
        tool_choice: {
          type: "function",
          function: { name: func.name }
        }
      });

      const message = completion.choices[0]?.message;
      if (!message || !message.tool_calls || message.tool_calls.length === 0) {
        console.warn(`⚠️ [GPT4-FUNCTION-CALLING] No function call returned for ${func.name}`);
        continue;
      }

      const functionCall = message.tool_calls[0];
      if (!functionCall || !functionCall.function) {
        console.warn(`⚠️ [GPT4-FUNCTION-CALLING] Invalid function call structure for ${func.name}`);
        continue;
      }

      if (functionCall.function.name !== func.name) {
        console.warn(`⚠️ [GPT4-FUNCTION-CALLING] Unexpected function call: ${functionCall.function.name}`);
        continue;
      }

      // Parse the function arguments
      let functionArgs: any;
        try {
        functionArgs = JSON.parse(functionCall.function.arguments);
        } catch (error) {
        console.error(`❌ [GPT4-FUNCTION-CALLING] Failed to parse function arguments for ${func.name}:`, error);
        continue;
      }

      console.log(`✅ [GPT4-FUNCTION-CALLING] ${func.name} executed successfully`);

      // Process the extracted fields from this function
      const functionFields = processFunctionResults(func.name, functionArgs, voiceInput);
      allExtractedFields.push(...functionFields);

    } catch (error) {
      console.error(`❌ [GPT4-FUNCTION-CALLING] Error executing ${func.name}:`, error);
      continue;
    }
  }

  console.log(`🤖 [GPT4-FUNCTION-CALLING] Multi-function extraction completed: ${allExtractedFields.length} total fields extracted`);
  return allExtractedFields;
}

/**
 * Process results from individual function calls and convert to ExtractedFieldResult format
 */
function processFunctionResults(
  functionName: string, 
  functionArgs: any, 
  voiceInput: VoiceExtractionInput
): ExtractedFieldResult[] {
  const extractedFields: ExtractedFieldResult[] = [];

  // Define field mappings for each function
  const fieldMappings: Record<string, Record<string, { dbColumn: string; dbTable: string }>> = {
    extract_basic_property_info: {
      property_type: { dbColumn: "propertyType", dbTable: "properties" },
      bedrooms: { dbColumn: "bedrooms", dbTable: "properties" },
      bathrooms: { dbColumn: "bathrooms", dbTable: "properties" },
      square_meter: { dbColumn: "squareMeter", dbTable: "properties" },
      year_built: { dbColumn: "yearBuilt", dbTable: "properties" },
      street: { dbColumn: "street", dbTable: "properties" },
      postal_code: { dbColumn: "postalCode", dbTable: "properties" },
      // NOTE: city and province are temporary fields that will be processed via findOrCreateLocation
      city: { dbColumn: "extractedCity", dbTable: "properties" },
      province: { dbColumn: "extractedProvince", dbTable: "properties" },
      orientation: { dbColumn: "orientation", dbTable: "properties" },
    },
    extract_listing_details: {
      listing_type: { dbColumn: "listingType", dbTable: "listings" },
      price: { dbColumn: "price", dbTable: "listings" },
      is_furnished: { dbColumn: "isFurnished", dbTable: "listings" },
      has_keys: { dbColumn: "hasKeys", dbTable: "listings" },
      pets_allowed: { dbColumn: "petsAllowed", dbTable: "listings" },
      student_friendly: { dbColumn: "studentFriendly", dbTable: "listings" },
      internet: { dbColumn: "internet", dbTable: "listings" },
    },
    extract_property_features: {
      has_elevator: { dbColumn: "hasElevator", dbTable: "properties" },
      has_garage: { dbColumn: "hasGarage", dbTable: "properties" },
      has_storage_room: { dbColumn: "hasStorageRoom", dbTable: "properties" },
      terrace: { dbColumn: "terrace", dbTable: "properties" },
      community_pool: { dbColumn: "communityPool", dbTable: "properties" },
      private_pool: { dbColumn: "privatePool", dbTable: "properties" },
      garden: { dbColumn: "garden", dbTable: "properties" },
      air_conditioning_type: { dbColumn: "airConditioningType", dbTable: "properties" },
      heating_type: { dbColumn: "heatingType", dbTable: "properties" },
      energy_consumption_scale: { dbColumn: "energyConsumptionScale", dbTable: "properties" },
      conservation_status: { dbColumn: "conservationStatus", dbTable: "properties" },
    },
    extract_appliances_amenities: {
      oven: { dbColumn: "oven", dbTable: "listings" },
      microwave: { dbColumn: "microwave", dbTable: "listings" },
      washing_machine: { dbColumn: "washingMachine", dbTable: "listings" },
      fridge: { dbColumn: "fridge", dbTable: "listings" },
      tv: { dbColumn: "tv", dbTable: "listings" },
      dishwasher: { dbColumn: "dishwasher", dbTable: "listings" },
      stoneware: { dbColumn: "stoneware", dbTable: "listings" },
      appliances_included: { dbColumn: "appliancesIncluded", dbTable: "listings" },
    }
  };

  const currentMapping = fieldMappings[functionName];
  if (!currentMapping) {
    console.warn(`⚠️ [GPT4-FUNCTION-CALLING] No field mapping found for function: ${functionName}`);
    return [];
  }

  // Process each field from the function result
  for (const [fieldName, fieldValue] of Object.entries(functionArgs)) {
    if (fieldName === 'original_text' || fieldName === 'confidence' || fieldValue === undefined || fieldValue === null) {
      continue;
    }

    const mapping = currentMapping[fieldName];
    if (!mapping) {
      console.warn(`⚠️ [GPT4-FUNCTION-CALLING] No mapping found for field: ${fieldName}`);
      continue;
    }

    // Find the corresponding field mapping for validation
    const fieldMapping = ALL_FIELD_MAPPINGS.find(
      fm => fm.dbColumn === mapping.dbColumn && fm.dbTable === mapping.dbTable
    );

    if (!fieldMapping) {
      console.warn(`⚠️ [GPT4-FUNCTION-CALLING] Unknown field mapping: ${mapping.dbTable}.${mapping.dbColumn}`);
      continue;
    }

    // Ensure fieldValue is a valid type
    if (typeof fieldValue !== 'string' && typeof fieldValue !== 'number' && typeof fieldValue !== 'boolean') {
      console.warn(`⚠️ [GPT4-FUNCTION-CALLING] Invalid field value type for ${mapping.dbColumn}: ${typeof fieldValue}`);
      continue;
    }

    // Apply validation if available
    const stringValue = String(fieldValue);
    if (fieldMapping.validation && !fieldMapping.validation(stringValue)) {
      console.warn(`⚠️ [GPT4-FUNCTION-CALLING] Validation failed for ${mapping.dbColumn}: ${stringValue}`);
            continue;
          }

    // Convert value using converter function
    let convertedValue: string | number | boolean = fieldValue as string | number | boolean;
          if (fieldMapping.converter) {
            try {
        const converted = fieldMapping.converter(stringValue);
        convertedValue = converted as string | number | boolean;
      } catch (error) {
        console.warn(`⚠️ [GPT4-FUNCTION-CALLING] Conversion failed for ${mapping.dbColumn}: ${stringValue}`);
        convertedValue = fieldValue as string | number | boolean;
      }
    }

    // Adjust confidence based on transcript confidence
    const adjustedConfidence = Math.min(
      functionArgs.confidence || 80,
      (functionArgs.confidence || 80) * (voiceInput.confidence / 100)
    );

    extractedFields.push({
      dbColumn: mapping.dbColumn,
      dbTable: mapping.dbTable as "properties" | "listings",
            value: convertedValue,
      originalText: functionArgs.original_text || "",
      confidence: adjustedConfidence,
      extractionSource: "gpt4_function_calling",
            fieldType: fieldMapping.dataType,
      matched_alias: `${functionName}:${fieldName}`,
          });

          console.log(
      `✅ [GPT4-FUNCTION-CALLING] ${functionName}: ${mapping.dbColumn} = ${convertedValue} (${adjustedConfidence.toFixed(1)}% confidence)`
          );
  }

  return extractedFields;
}