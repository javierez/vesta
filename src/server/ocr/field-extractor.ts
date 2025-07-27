"use server";

import type { Block } from "@aws-sdk/client-textract";
import type { 
  ExtractedFieldResult, 
  CompleteExtractedData,
  EnhancedExtractedPropertyData,
  EnhancedExtractedListingData,
  FieldMapping 
} from "~/types/textract-enhanced";
import { ALL_FIELD_MAPPINGS } from "./field-mapping-config";

/**
 * Enhanced Field Extraction Engine for AWS Textract
 * Uses comprehensive Spanish terminology mapping to extract property and listing data
 */

interface OCRInput {
  extractedText: string;
  detectedFields?: Record<string, { text: string; confidence: number }>;
  blocks: Block[];
  confidence: number;
}

// Fuzzy string matching function for field names
function calculateSimilarity(str1: string, str2: string): number {
  const normalize = (s: string) => s.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .trim();

  const a = normalize(str1);
  const b = normalize(str2);

  if (a === b) return 1.0;
  if (a.includes(b) || b.includes(a)) return 0.8;

  // Levenshtein distance for fuzzy matching
  const matrix: number[][] = Array.from({ length: b.length + 1 }, () => Array.from({ length: a.length + 1 }, () => 0));
  
  for (let i = 0; i <= a.length; i++) matrix[0]![i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j]![0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j]![i] = Math.min(
        (matrix[j]![i - 1] ?? 0) + 1,      // deletion
        (matrix[j - 1]![i] ?? 0) + 1,      // insertion
        (matrix[j - 1]![i - 1] ?? 0) + indicator // substitution
      );
    }
  }

  const maxLength = Math.max(a.length, b.length);
  return (maxLength - matrix[b.length]![a.length]!) / maxLength;
}

// Find best matching field for a given text
function findBestFieldMatch(fieldText: string, threshold = 0.6): { mapping: FieldMapping; alias: string; similarity: number } | null {
  let bestMatch: { mapping: FieldMapping; alias: string; similarity: number } | null = null;

  for (const mapping of ALL_FIELD_MAPPINGS) {
    for (const alias of mapping.aliases) {
      const similarity = calculateSimilarity(fieldText, alias);
      if (similarity >= threshold && (!bestMatch || similarity > bestMatch.similarity)) {
        bestMatch = { mapping, alias, similarity };
      }
    }
  }

  return bestMatch;
}

// Extract data from detected form fields
function extractFromFormFields(
  detectedFields: Record<string, { text: string; confidence: number }>
): ExtractedFieldResult[] {
  const results: ExtractedFieldResult[] = [];

  console.log(`🔍 [EXTRACTION] Processing ${Object.keys(detectedFields).length} form fields...`);

  for (const [fieldKey, fieldData] of Object.entries(detectedFields)) {
    const bestMatch = findBestFieldMatch(fieldKey);
    
    if (bestMatch) {
      const { mapping, alias, similarity } = bestMatch;
      
      // Apply validation if available
      if (mapping.validation && !mapping.validation(fieldData.text)) {
        console.log(`⚠️ [EXTRACTION] Validation failed for field "${fieldKey}": ${fieldData.text}`);
        continue;
      }

      // Convert value using converter function
      let convertedValue: string | number | boolean = fieldData.text;
      if (mapping.converter) {
        try {
          convertedValue = mapping.converter(fieldData.text);
        } catch (err) {
          console.log(`⚠️ [EXTRACTION] Conversion failed for field "${fieldKey}": ${String(err)}`);
          continue;
        }
      }

      results.push({
        dbColumn: mapping.dbColumn,
        dbTable: mapping.dbTable,
        value: convertedValue,
        originalText: fieldData.text,
        confidence: fieldData.confidence * similarity, // Adjust confidence by match quality
        extractionSource: 'form',
        fieldType: mapping.dataType,
        matched_alias: alias
      });

      console.log(`✅ [EXTRACTION] Form field match: "${fieldKey}" → ${mapping.dbColumn} (${similarity.toFixed(2)} similarity, ${fieldData.confidence.toFixed(1)}% confidence)`);
    }
  }

  return results;
}

// Extract data from raw text using pattern matching
function extractFromTextPatterns(extractedText: string): ExtractedFieldResult[] {
  const results: ExtractedFieldResult[] = [];
  const text = extractedText.toLowerCase();

  console.log(`🔍 [EXTRACTION] Processing text patterns from ${extractedText.length} characters...`);

  // Enhanced pattern matching with better Spanish support
  const enhancedPatterns: Record<string, RegExp[]> = {
    // Basic Information
    address: [
      /(?:dirección|direccion|calle|c\/|avenida|avda|av|paseo|plaza|pl)\s*:?\s*([^\n]{10,100})/i,
      /(?:ubicación|ubicacion)\s*:?\s*([^\n]{10,100})/i
    ],
    price: [
      /(?:precio|valor|importe|coste|costo)\s*:?\s*(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*€?/i,
      /€\s*(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)/i,
      /(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*euros?/i
    ],
    squareMeter: [
      /(?:superficie|metros|m2|m²)\s*:?\s*(\d+(?:[.,]\d+)?)/i,
      /(\d+)\s*m2/i,
      /(\d+)\s*m²/i,
      /(\d+)\s*metros?\s*cuadrados?/i
    ],
    bedrooms: [
      /(?:dormitorios?|habitaciones?|cuartos?|dorm|hab)\s*:?\s*(\d+)/i,
      /(\d+)\s*(?:dormitorios?|habitaciones?|cuartos?)/i
    ],
    bathrooms: [
      /(?:baños?|aseos?|servicios?|wc)\s*:?\s*(\d+(?:[.,]\d+)?)/i,
      /(\d+(?:[.,]\d+)?)\s*(?:baños?|aseos?)/i
    ],
    yearBuilt: [
      /(?:año|ano|construc|edificac)\s*:?\s*(\d{4})/i,
      /construido\s*en\s*(\d{4})/i,
      /del\s*año\s*(\d{4})/i
    ],
    cadastralReference: [
      /(?:referencia\s*catastral|ref\s*catastral|catastro)\s*:?\s*([a-z0-9]{14,20})/i
    ],
    propertyType: [
      /(?:tipo|class|vivienda)\s*:?\s*(piso|casa|chalet|apartamento|local|garaje|estudio|loft|duplex|ático|atico)/i
    ],
    
    // Energy and features
    energyScale: [
      /(?:escala|letra|calificación|calificacion)\s*energética?\s*:?\s*([A-G])/i,
      /energía\s*([A-G])/i
    ],
    orientation: [
      /orientación?\s*:?\s*(norte|sur|este|oeste|noreste|noroeste|sureste|suroeste|n|s|e|o|ne|no|se|so)/i
    ],
    
    // Boolean features with Spanish patterns
    hasElevator: [
      /(?:con\s+)?(?:ascensor|elevador)/i,
      /ascensor\s*:?\s*(sí|si|yes|✓)/i
    ],
    hasGarage: [
      /(?:con\s+)?(?:garaje|aparcamiento|parking|plaza)/i,
      /garaje\s*:?\s*(sí|si|yes|✓)/i
    ],
    hasStorageRoom: [
      /(?:con\s+)?trastero/i,
      /trastero\s*:?\s*(sí|si|yes|✓)/i
    ],
    terrace: [
      /(?:con\s+)?(?:terraza|balcón|balcon)/i,
      /terraza\s*:?\s*(sí|si|yes|✓)/i
    ],
    pool: [
      /(?:con\s+)?(?:piscina|alberca)/i,
      /piscina\s*:?\s*(sí|si|yes|✓)/i
    ],
    garden: [
      /(?:con\s+)?(?:jardín|jardin|zona\s*verde)/i,
      /jardín\s*:?\s*(sí|si|yes|✓)/i
    ],
    airConditioning: [
      /(?:con\s+)?(?:aire\s*acondicionado|climatización|climatizacion|aa)/i,
      /aire\s*:?\s*(sí|si|yes|✓)/i
    ],
    furnished: [
      /(?:amueblado|amueblada|con\s*muebles|mobiliario)/i,
      /muebles\s*:?\s*(sí|si|yes|✓)/i
    ]
  };

  // Process each pattern category
  for (const [category, patterns] of Object.entries(enhancedPatterns)) {
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches?.[1]) {
        const value = matches[1].trim();
        
        // Find corresponding field mapping
        const fieldMapping = ALL_FIELD_MAPPINGS.find(mapping => 
          mapping.aliases.some(alias => 
            alias.toLowerCase().includes(category.toLowerCase()) ||
            category.toLowerCase().includes(alias.toLowerCase())
          )
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
              continue;
            }
          }

          // Estimate confidence based on pattern quality and context
          const confidence = Math.min(95, 60 + (value.length > 2 ? 20 : 0) + (matches[0].includes(':') ? 15 : 0));

          results.push({
            dbColumn: fieldMapping.dbColumn,
            dbTable: fieldMapping.dbTable,
            value: convertedValue,
            originalText: value,
            confidence,
            extractionSource: 'regex',
            fieldType: fieldMapping.dataType,
            matched_alias: category
          });

          console.log(`✅ [EXTRACTION] Text pattern match: "${category}" → ${fieldMapping.dbColumn} (${confidence}% confidence)`);
        }
      }
    }
  }

  return results;
}

// Extract data from table structures
function extractFromTables(blocks: Block[]): ExtractedFieldResult[] {
  const results: ExtractedFieldResult[] = [];

  // Filter table blocks
  const tableBlocks = blocks.filter(block => block.BlockType === 'TABLE');
  const cellBlocks = blocks.filter(block => block.BlockType === 'CELL');

  console.log(`🔍 [EXTRACTION] Processing ${tableBlocks.length} tables with ${cellBlocks.length} cells...`);

  if (tableBlocks.length === 0) {
    return results;
  }

  // Process each table
  for (const table of tableBlocks) {
    if (!table.Relationships) continue;

    // Get cells for this table
    const tableCellIds = table.Relationships
      .filter(rel => rel.Type === 'CHILD')
      .flatMap(rel => rel.Ids ?? []);

    const tableCells = cellBlocks.filter(cell => 
      tableCellIds.includes(cell.Id ?? '')
    );

    // Process cells as key-value pairs (assuming 2-column tables)
    for (let i = 0; i < tableCells.length - 1; i += 2) {
      const keyCell = tableCells[i];
      const valueCell = tableCells[i + 1];

      if (!keyCell?.Text || !valueCell?.Text) continue;

      const bestMatch = findBestFieldMatch(keyCell.Text);
      if (bestMatch) {
        const { mapping, alias } = bestMatch;

        // Apply validation
        if (mapping.validation && !mapping.validation(valueCell.Text)) {
          continue;
        }

        // Convert value
        let convertedValue: string | number | boolean = valueCell.Text;
        if (mapping.converter) {
          try {
            convertedValue = mapping.converter(valueCell.Text);
          } catch {
            continue;
          }
        }

        const confidence = Math.min(
          keyCell.Confidence ?? 0,
          valueCell.Confidence ?? 0
        ) * bestMatch.similarity;

        results.push({
          dbColumn: mapping.dbColumn,
          dbTable: mapping.dbTable,
          value: convertedValue,
          originalText: valueCell.Text,
          confidence,
          extractionSource: 'table',
          fieldType: mapping.dataType,
          matched_alias: alias
        });

        console.log(`✅ [EXTRACTION] Table match: "${keyCell.Text}" → ${mapping.dbColumn} (${confidence.toFixed(1)}% confidence)`);
      }
    }
  }

  return results;
}

// Consolidate and deduplicate extracted fields
function consolidateResults(results: ExtractedFieldResult[]): ExtractedFieldResult[] {
  const consolidatedMap = new Map<string, ExtractedFieldResult>();

  // Sort by confidence (highest first) to prioritize best results
  const sortedResults = results.sort((a, b) => b.confidence - a.confidence);

  for (const result of sortedResults) {
    const key = `${result.dbTable}.${result.dbColumn}`;
    
    // Keep only the highest confidence result for each field
    if (!consolidatedMap.has(key)) {
      consolidatedMap.set(key, result);
    }
  }

  const consolidated = Array.from(consolidatedMap.values());
  console.log(`🔄 [EXTRACTION] Consolidated ${results.length} raw results into ${consolidated.length} unique fields`);

  return consolidated;
}

// Main extraction function
export async function extractEnhancedPropertyData(ocrInput: OCRInput): Promise<{
  extractedFields: ExtractedFieldResult[];
  propertyData: EnhancedExtractedPropertyData;
  listingData: EnhancedExtractedListingData;
  completeData: CompleteExtractedData;
}> {
  console.log(`🚀 [EXTRACTION] Starting enhanced property data extraction...`);
  console.log(`📄 [EXTRACTION] Input: ${ocrInput.extractedText.length} chars, ${Object.keys(ocrInput.detectedFields ?? {}).length} form fields, ${ocrInput.blocks.length} blocks`);

  const allResults: ExtractedFieldResult[] = [];

  // Extract from form fields
  if (ocrInput.detectedFields && Object.keys(ocrInput.detectedFields).length > 0) {
    const formResults = extractFromFormFields(ocrInput.detectedFields);
    allResults.push(...formResults);
    console.log(`📋 [EXTRACTION] Form fields extracted: ${formResults.length} fields`);
  }

  // Extract from text patterns
  const textResults = extractFromTextPatterns(ocrInput.extractedText);
  allResults.push(...textResults);
  console.log(`📝 [EXTRACTION] Text patterns extracted: ${textResults.length} fields`);

  // Extract from tables
  const tableResults = extractFromTables(ocrInput.blocks);
  allResults.push(...tableResults);
  console.log(`📊 [EXTRACTION] Table data extracted: ${tableResults.length} fields`);

  // Consolidate results
  const consolidatedResults = consolidateResults(allResults);

  // Separate property and listing data
  const propertyFields = consolidatedResults.filter(r => r.dbTable === 'properties');
  const listingFields = consolidatedResults.filter(r => r.dbTable === 'listings');

  // Build structured data objects
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
    listing: listingData
  };

  console.log(`✅ [EXTRACTION] Extraction completed:`);
  console.log(`   - Total fields extracted: ${consolidatedResults.length}`);
  console.log(`   - Property fields: ${propertyFields.length}`);
  console.log(`   - Listing fields: ${listingFields.length}`);
  console.log(`   - Average confidence: ${(consolidatedResults.reduce((sum, r) => sum + r.confidence, 0) / consolidatedResults.length).toFixed(1)}%`);

  return {
    extractedFields: consolidatedResults,
    propertyData,
    listingData,
    completeData
  };
}

// Helper function to filter fields by confidence threshold
export async function filterByConfidence(
  fields: ExtractedFieldResult[], 
  threshold = 50
): Promise<ExtractedFieldResult[]> {
  const filtered = fields.filter(field => field.confidence >= threshold);
  console.log(`🎯 [EXTRACTION] Filtered by ${threshold}% confidence: ${filtered.length}/${fields.length} fields above threshold`);
  return filtered;
}

// Helper function to get extraction statistics
export async function getExtractionStats(fields: ExtractedFieldResult[]): Promise<{
  total: number;
  byTable: { properties: number; listings: number };
  bySource: { form: number; table: number; regex: number; text: number };
  byType: { string: number; number: number; boolean: number; decimal: number };
  averageConfidence: number;
  confidenceRange: { min: number; max: number };
}> {
  const stats = {
    total: fields.length,
    byTable: {
      properties: fields.filter(f => f.dbTable === 'properties').length,
      listings: fields.filter(f => f.dbTable === 'listings').length
    },
    bySource: {
      form: fields.filter(f => f.extractionSource === 'form').length,
      table: fields.filter(f => f.extractionSource === 'table').length,
      regex: fields.filter(f => f.extractionSource === 'regex').length,
      text: fields.filter(f => f.extractionSource === 'text').length
    },
    byType: {
      string: fields.filter(f => f.fieldType === 'string').length,
      number: fields.filter(f => f.fieldType === 'number').length,
      boolean: fields.filter(f => f.fieldType === 'boolean').length,
      decimal: fields.filter(f => f.fieldType === 'decimal').length
    },
    averageConfidence: fields.length > 0 ? 
      fields.reduce((sum, f) => sum + f.confidence, 0) / fields.length : 0,
    confidenceRange: {
      min: fields.length > 0 ? Math.min(...fields.map(f => f.confidence)) : 0,
      max: fields.length > 0 ? Math.max(...fields.map(f => f.confidence)) : 0
    }
  };

  return stats;
}