'use server'

import { TextractClient, DetectDocumentTextCommand, AnalyzeDocumentCommand, type Block } from "@aws-sdk/client-textract"

// Initialize Textract client using the same AWS configuration as S3
const textractClient = new TextractClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// Interface for OCR results
export interface OCRResult {
  success: boolean
  extractedText: string
  confidence: number
  blocks: Block[]
  error?: string
  detectedFields?: Record<string, {
    text: string
    confidence: number
  }>
}

// Interface for property data that might be extracted
export interface ExtractedPropertyData {
  address?: string
  squareMeters?: string
  propertyType?: string
  yearBuilt?: string
  bedrooms?: string
  bathrooms?: string
  price?: string
  cadastralReference?: string
  // Add more fields as needed
}

/**
 * Extract text from a document using basic text detection
 * Good for simple text extraction without forms/tables
 */
export async function extractTextFromDocument(
  documentKey: string,
  bucketName?: string
): Promise<OCRResult> {
  console.log(`🔍 [OCR] Starting basic text extraction for document: ${documentKey}`)
  
  try {
    const bucket = bucketName ?? process.env.AWS_S3_BUCKET!
    console.log(`📦 [OCR] Using bucket: ${bucket}`)
    
    const command = new DetectDocumentTextCommand({
      Document: {
        S3Object: {
          Bucket: bucket,
          Name: documentKey,
        },
      },
    })

    console.log(`🚀 [OCR] Sending DetectDocumentTextCommand to AWS Textract...`)
    const response = await textractClient.send(command)
    
    console.log(`✅ [OCR] Textract response received. Total blocks: ${response.Blocks?.length ?? 0}`)
    
    if (!response.Blocks) {
      console.warn(`⚠️ [OCR] No text blocks found in document: ${documentKey}`)
      return {
        success: false,
        extractedText: '',
        confidence: 0,
        blocks: [],
        error: 'No text blocks found in document'
      }
    }

    // Extract text from LINE blocks for better readability
    const lines = response.Blocks
      .filter((block: Block) => block.BlockType === 'LINE')
      .map((block: Block) => block.Text || '')
      .filter((text: string) => text.trim() !== '')

    console.log(`📝 [OCR] Extracted ${lines.length} text lines from document`)

    // Calculate average confidence
    const confidenceScores = response.Blocks
      .filter((block: Block) => block.Confidence !== undefined)
      .map((block: Block) => block.Confidence!)
    
    const averageConfidence = confidenceScores.length > 0 
      ? confidenceScores.reduce((sum: number, conf: number) => sum + conf, 0) / confidenceScores.length
      : 0

    console.log(`📊 [OCR] Average confidence score: ${averageConfidence.toFixed(2)}%`)
    console.log(`📄 [OCR] Extracted text preview (first 200 chars): ${lines.join('\n').substring(0, 200)}...`)

    return {
      success: true,
      extractedText: lines.join('\n'),
      confidence: averageConfidence,
      blocks: response.Blocks,
    }
  } catch (error) {
    console.error(`❌ [OCR] Error extracting text from document ${documentKey}:`, error)
    return {
      success: false,
      extractedText: '',
      confidence: 0,
      blocks: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Analyze document with advanced features (forms, tables, layout)
 * Better for structured documents like property forms
 */
export async function analyzeDocumentStructure(
  documentKey: string,
  bucketName?: string,
  enableForms = true,
  enableTables = true
): Promise<OCRResult> {
  console.log(`🔍 [OCR] Starting advanced document analysis for: ${documentKey}`)
  console.log(`⚙️ [OCR] Features enabled - Forms: ${enableForms}, Tables: ${enableTables}`)
  
  try {
    const bucket = bucketName ?? process.env.AWS_S3_BUCKET!
    
    const featureTypes = []
    if (enableForms) featureTypes.push('FORMS')
    if (enableTables) featureTypes.push('TABLES')
    
    // Always include layout analysis for better text organization
    featureTypes.push('LAYOUT')

    console.log(`🎯 [OCR] Feature types: ${featureTypes.join(', ')}`)

    const command = new AnalyzeDocumentCommand({
      Document: {
        S3Object: {
          Bucket: bucket,
          Name: documentKey,
        },
      },
      FeatureTypes: featureTypes as ('FORMS' | 'TABLES' | 'LAYOUT')[],
    })

    console.log(`🚀 [OCR] Sending AnalyzeDocumentCommand to AWS Textract...`)
    const response = await textractClient.send(command)
    
    console.log(`✅ [OCR] Textract analysis response received. Total blocks: ${response.Blocks?.length ?? 0}`)
    
    if (!response.Blocks) {
      console.warn(`⚠️ [OCR] No text blocks found in document: ${documentKey}`)
      return {
        success: false,
        extractedText: '',
        confidence: 0,
        blocks: [],
        error: 'No text blocks found in document'
      }
    }

    // Extract text with better organization using layout
    const extractedText = extractTextFromBlocks(response.Blocks)
    console.log(`📝 [OCR] Extracted organized text (${extractedText.length} characters)`)
    
    // Extract form fields if available
    const detectedFields = enableForms ? extractFormFields(response.Blocks) : undefined
    
    if (detectedFields && Object.keys(detectedFields).length > 0) {
      console.log(`📋 [OCR] Detected form fields:`, detectedFields)
    } else {
      console.log(`📋 [OCR] No form fields detected`)
    }

    // Calculate average confidence
    const confidenceScores = response.Blocks
      .filter((block: Block) => block.Confidence !== undefined)
      .map((block: Block) => block.Confidence!)
    
    const averageConfidence = confidenceScores.length > 0 
      ? confidenceScores.reduce((sum: number, conf: number) => sum + conf, 0) / confidenceScores.length
      : 0

    console.log(`📊 [OCR] Average confidence score: ${averageConfidence.toFixed(2)}%`)
    console.log(`📄 [OCR] Extracted text preview (first 300 chars): ${extractedText.substring(0, 300)}...`)

    return {
      success: true,
      extractedText,
      confidence: averageConfidence,
      blocks: response.Blocks,
      detectedFields,
    }
  } catch (error) {
    console.error(`❌ [OCR] Error analyzing document structure for ${documentKey}:`, error)
    return {
      success: false,
      extractedText: '',
      confidence: 0,
      blocks: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Extract and organize text from Textract blocks with layout awareness
 */
function extractTextFromBlocks(blocks: Block[]): string {
  // Group blocks by page
  const pageBlocks = blocks.filter((block: Block) => block.BlockType === 'PAGE')
  
  if (pageBlocks.length === 0) {
    // Fallback to line-based extraction
    return blocks
      .filter((block: Block) => block.BlockType === 'LINE')
      .map((block: Block) => block.Text || '')
      .filter((text: string) => text.trim() !== '')
      .join('\n')
  }

  let extractedText = ''

  for (const page of pageBlocks) {
    // Try to use layout blocks for better organization
    const layoutBlocks = blocks.filter((block: Block) => 
      block.BlockType?.startsWith('LAYOUT_') && 
      block.Page === page.Page
    )

    if (layoutBlocks.length > 0) {
      // Use layout-aware extraction
      for (const layoutBlock of layoutBlocks) {
        if (layoutBlock.Relationships) {
          const childTexts = getChildTexts(layoutBlock, blocks)
          if (childTexts.length > 0) {
            extractedText += childTexts.join(' ') + '\n'
          }
        }
      }
    } else {
      // Fallback to line-based extraction for this page
      const lineBlocks = blocks.filter((block: Block) => 
        block.BlockType === 'LINE' && 
        block.Page === page.Page
      )
      
      for (const line of lineBlocks) {
        if (line.Text) {
          extractedText += line.Text + '\n'
        }
      }
    }
  }

  return extractedText.trim()
}

/**
 * Get text from child blocks
 */
function getChildTexts(parentBlock: Block, allBlocks: Block[]): string[] {
  if (!parentBlock.Relationships) return []

  const childIds = parentBlock.Relationships
    .filter((rel) => rel.Type === 'CHILD')
    .flatMap((rel) => rel.Ids || [])

  return childIds
    .map((id: string) => allBlocks.find((block: Block) => block.Id === id))
    .filter((block): block is Block => block !== undefined && !!block.Text)
    .map((block: Block) => block.Text!)
}

/**
 * Extract form key-value pairs from Textract blocks
 */
function extractFormFields(blocks: Block[]): Record<string, { text: string; confidence: number }> {
  const fields: Record<string, { text: string; confidence: number }> = {}
  
  const keyValueSets = blocks.filter((block: Block) => block.BlockType === 'KEY_VALUE_SET')
  
  // Group keys and values
  const keys = keyValueSets.filter((block: Block) => 
    block.EntityTypes && block.EntityTypes.includes('KEY')
  )
  
  for (const key of keys) {
    const keyText = getBlockText(key, blocks)
    if (!keyText) continue

    // Find associated value
    const valueRelationship = key.Relationships?.find((rel) => rel.Type === 'VALUE')
    if (valueRelationship?.Ids && valueRelationship.Ids.length > 0) {
      const valueBlock = blocks.find((block: Block) => block.Id === valueRelationship.Ids![0])
      if (valueBlock) {
        const valueText = getBlockText(valueBlock, blocks)
        if (valueText) {
          fields[keyText] = {
            text: valueText,
            confidence: Math.min(key.Confidence ?? 0, valueBlock.Confidence ?? 0)
          }
        }
      }
    }
  }

  return fields
}

/**
 * Get text content from a block and its children
 */
function getBlockText(block: Block, allBlocks: Block[]): string {
  if (block.Text) return block.Text

  // Get text from child blocks
  const childTexts = getChildTexts(block, allBlocks)
  return childTexts.join(' ').trim()
}

/**
 * Parse property information from extracted text and form fields
 * This uses simple regex patterns - you can enhance this with AI/ML for better accuracy
 */
export async function parsePropertyInformation(ocrResult: OCRResult): Promise<ExtractedPropertyData> {
  console.log(`🔍 [OCR] Starting property information parsing...`)
  console.log(`📄 [OCR] Input text length: ${ocrResult.extractedText.length} characters`)
  console.log(`📋 [OCR] Form fields available: ${Object.keys(ocrResult.detectedFields || {}).length}`)
  
  const text = ocrResult.extractedText.toLowerCase()
  const fields = ocrResult.detectedFields ?? {}
  const extracted: ExtractedPropertyData = {}

  // Common Spanish property form patterns
  const patterns = {
    address: /(?:dirección|direccion|calle|c\/)\s*:?\s*([^\n]+)/i,
    squareMeters: /(?:superficie|metros|m2|m²)\s*:?\s*(\d+(?:[.,]\d+)?)/i,
    propertyType: /(?:tipo|class|vivienda)\s*:?\s*(piso|casa|chalet|apartamento|local|garaje)/i,
    yearBuilt: /(?:año|ano|construc|edificac)\s*:?\s*(\d{4})/i,
    bedrooms: /(?:dormitor|habitac|cuartos)\s*:?\s*(\d+)/i,
    bathrooms: /(?:baños?|aseos?)\s*:?\s*(\d+)/i,
    price: /(?:precio|valor|importe)\s*:?\s*(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*€?/i,
    cadastralReference: /(?:referencia\s*catastral|ref\s*catastral)\s*:?\s*([a-z0-9]+)/i,
  }

  // First, try to extract from form fields
  console.log(`🔍 [OCR] Extracting from form fields...`)
  for (const [fieldKey, fieldData] of Object.entries(fields)) {
    const normalizedKey = fieldKey.toLowerCase()
    
    if (normalizedKey.includes('direccion') || normalizedKey.includes('calle')) {
      extracted.address = fieldData.text
      console.log(`📍 [OCR] Found address from form field: ${fieldData.text}`)
    } else if (normalizedKey.includes('superficie') || normalizedKey.includes('metros')) {
      extracted.squareMeters = fieldData.text
      console.log(`📏 [OCR] Found square meters from form field: ${fieldData.text}`)
    } else if (normalizedKey.includes('tipo')) {
      extracted.propertyType = fieldData.text
      console.log(`🏠 [OCR] Found property type from form field: ${fieldData.text}`)
    } else if (normalizedKey.includes('año') || normalizedKey.includes('construc')) {
      extracted.yearBuilt = fieldData.text
      console.log(`📅 [OCR] Found year built from form field: ${fieldData.text}`)
    } else if (normalizedKey.includes('dormitor') || normalizedKey.includes('habitac')) {
      extracted.bedrooms = fieldData.text
      console.log(`🛏️ [OCR] Found bedrooms from form field: ${fieldData.text}`)
    } else if (normalizedKey.includes('baño') || normalizedKey.includes('aseo')) {
      extracted.bathrooms = fieldData.text
      console.log(`🚿 [OCR] Found bathrooms from form field: ${fieldData.text}`)
    } else if (normalizedKey.includes('precio') || normalizedKey.includes('valor')) {
      extracted.price = fieldData.text
      console.log(`💰 [OCR] Found price from form field: ${fieldData.text}`)
    } else if (normalizedKey.includes('catastral')) {
      extracted.cadastralReference = fieldData.text
      console.log(`🏛️ [OCR] Found cadastral reference from form field: ${fieldData.text}`)
    }
  }

  // Then, supplement with regex extraction from full text
  console.log(`🔍 [OCR] Extracting from text using regex patterns...`)
  for (const [key, pattern] of Object.entries(patterns)) {
    if (!extracted[key as keyof ExtractedPropertyData]) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const value = match[1].trim()
        if (value) {
          extracted[key as keyof ExtractedPropertyData] = value as string
          console.log(`🔍 [OCR] Found ${key} from text: ${value}`)
        }
      }
    }
  }

  console.log(`✅ [OCR] Property parsing completed. Extracted data:`, extracted)
  return extracted
}

/**
 * Main function to process property documents
 * This combines OCR with property data parsing
 */
export async function processPropertyDocument(
  documentKey: string,
  bucketName?: string
): Promise<{
  ocrResult: OCRResult
  extractedData: ExtractedPropertyData
}> {
  console.log(`🚀 [OCR] Starting property document processing for: ${documentKey}`)
  
  // Use the more advanced analysis for property documents
  const ocrResult = await analyzeDocumentStructure(documentKey, bucketName, true, true)
  
  let extractedData: ExtractedPropertyData = {}
  
  if (ocrResult.success) {
    console.log(`✅ [OCR] OCR successful, parsing property information...`)
    extractedData = await parsePropertyInformation(ocrResult)
  } else {
    console.error(`❌ [OCR] OCR failed, cannot parse property information`)
  }

  console.log(`🎯 [OCR] Property document processing completed for: ${documentKey}`)
  console.log(`📊 [OCR] Final extracted data:`, extractedData)

  return {
    ocrResult,
    extractedData
  }
}

/**
 * Background processing function - runs without blocking the UI
 * This is perfect for your fire-and-forget pattern
 */
export async function processDocumentInBackground(
  documentKey: string,
  bucketName?: string
): Promise<void> {
  try {
    console.log(`🔄 [OCR] Starting background OCR processing for: ${documentKey}`)
    console.log(`⏰ [OCR] Background processing started at: ${new Date().toISOString()}`)
    
    const result = await processPropertyDocument(documentKey, bucketName)
    
    if (result.ocrResult.success) {
      console.log(`✅ [OCR] Background OCR processing completed for: ${documentKey}`)
      console.log(`📊 [OCR] Processing summary:`)
      console.log(`   - Extracted text length: ${result.ocrResult.extractedText.length} characters`)
      console.log(`   - Confidence score: ${result.ocrResult.confidence.toFixed(2)}%`)
      console.log(`   - Form fields detected: ${Object.keys(result.ocrResult.detectedFields ?? {}).length}`)
      console.log(`   - Property data extracted: ${Object.keys(result.extractedData).length} fields`)
      
      console.log(`📋 [OCR] Complete extracted property data:`, JSON.stringify(result.extractedData, null, 2))
      console.log(`📄 [OCR] Full extracted text:`, result.ocrResult.extractedText)
      
      if (Object.keys(result.ocrResult.detectedFields ?? {}).length > 0) {
        console.log(`📋 [OCR] All detected form fields:`, JSON.stringify(result.ocrResult.detectedFields, null, 2))
      }
      
      // Here you could:
      // 1. Save the results to your database
      // 2. Send a notification to the user
      // 3. Pre-fill form fields in your application
      // 4. Log the results for review
      
    } else {
      console.error(`❌ [OCR] Background OCR processing failed for: ${documentKey}`)
      console.error(`❌ [OCR] Error details:`, result.ocrResult.error)
    }
    
    console.log(`⏰ [OCR] Background processing completed at: ${new Date().toISOString()}`)
  } catch (error) {
    console.error(`❌ [OCR] Background OCR processing error for: ${documentKey}`, error)
    console.error(`❌ [OCR] Error stack:`, error instanceof Error ? error.stack : 'No stack trace available')
  }
}
