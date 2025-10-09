# Complete Data Mapping Guide: Voice Recording & OCR to Database Schema

**Version:** 2.0
**Last Updated:** January 2025
**Author:** Vesta Platform Documentation

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture & Data Flow](#architecture--data-flow)
3. [Database Schema Structure](#database-schema-structure)
4. [Field Mapping Configuration](#field-mapping-configuration)
5. [Voice Recording Pipeline](#voice-recording-pipeline)
6. [OCR Processing Pipeline](#ocr-processing-pipeline)
7. [GPT-4 Intelligent Extraction](#gpt-4-intelligent-extraction)
8. [Data Transformation & Validation](#data-transformation--validation)
9. [Database Persistence Layer](#database-persistence-layer)
10. [Complete Examples](#complete-examples)
11. [Confidence Scoring System](#confidence-scoring-system)
12. [Error Handling & Edge Cases](#error-handling--edge-cases)
13. [External Services Integration](#external-services-integration)
14. [Property Title Generation](#property-title-generation)
15. [Location & Neighborhood Management](#location--neighborhood-management)

---

## Overview

The Vesta platform supports two primary methods for creating property listings:

1. **Voice Recording**: Agents record verbal property descriptions that are transcribed and processed
2. **OCR Document Upload**: Agents upload property documents (PDFs, images) that are processed via AWS Textract

Both pipelines use **GPT-4 with function calling** to intelligently extract structured property data from unstructured text, mapping Spanish real estate terminology to database schema fields.

### Key Technologies

- **OpenAI Whisper**: Audio transcription for voice recordings
- **AWS Textract**: OCR for document processing
- **GPT-4 with Function Calling**: Intelligent field extraction and mapping
- **Drizzle ORM**: Type-safe database operations
- **SingleStore MySQL**: High-performance database

---

## Architecture & Data Flow

### High-Level Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                          INPUT SOURCES                               │
├──────────────────────────┬──────────────────────────────────────────┤
│   Voice Recording        │         Document Upload (OCR)             │
│   (Audio File)           │         (PDF/Image)                       │
└──────────┬───────────────┴─────────────────────┬─────────────────────┘
           │                                     │
           ▼                                     ▼
┌──────────────────────┐          ┌──────────────────────────┐
│ OpenAI Whisper API   │          │   AWS Textract           │
│ Audio → Text         │          │   Document → Text        │
└──────────┬───────────┘          └───────────┬──────────────┘
           │                                  │
           │  Transcribed Text                │  Extracted Text
           │  + Confidence                    │  + Form Fields
           │                                  │  + Confidence
           └──────────┬───────────────────────┘
                      │
                      ▼
           ┌──────────────────────────────────┐
           │  GPT-4 Function Calling Engine   │
           │  Multiple Specialized Functions: │
           │  • extract_basic_property_info   │
           │  • extract_listing_details       │
           │  • extract_property_amenities    │
           │  • extract_energy_heating        │
           │  • extract_property_condition    │
           │  • extract_kitchen_features      │
           │  • extract_interior_spaces       │
           │  • extract_luxury_amenities      │
           │  • extract_appliances            │
           │  • extract_contact_info (OCR)    │
           └──────────┬───────────────────────┘
                      │
                      │  Structured Extraction Results
                      │  (ExtractedFieldResult[])
                      │
                      ▼
           ┌──────────────────────────────────┐
           │   Field Mapping & Validation     │
           │   • Normalize field names        │
           │   • Convert data types           │
           │   • Validate values              │
           │   • Apply converters             │
           │   • Calculate confidence         │
           └──────────┬───────────────────────┘
                      │
                      │  Validated Property/Listing Data
                      │
                      ▼
           ┌──────────────────────────────────┐
           │    Database Persistence Layer    │
           │    • Create/Update Property      │
           │    • Create/Update Listing       │
           │    • Link Contacts               │
           │    • Create Tasks                │
           └──────────┬───────────────────────┘
                      │
                      ▼
           ┌──────────────────────────────────┐
           │       Database Tables            │
           │  • properties                    │
           │  • listings                      │
           │  • contacts                      │
           │  • listing_contacts              │
           └──────────────────────────────────┘
```

---

## Database Schema Structure

### Core Tables

The system maps extracted data to three primary tables:

#### 1. **Properties Table**

Stores physical characteristics and attributes of the property itself.

**Key Categories:**
- **Basic Information**: type, title, description
- **Specifications**: bedrooms, bathrooms, square meters, year built
- **Location**: street, postal code, neighborhood
- **Energy**: energy certificate, consumption scale, emissions
- **Amenities**: elevator, garage, storage room, pool, gym
- **Condition**: new construction, needs renovation, last renovation year
- **Features**: kitchen type, heating, air conditioning, orientation
- **Views**: exterior, bright, mountain views, sea views

**Schema Reference:** `src/server/db/schema.ts` (lines 181-323)

```typescript
properties {
  propertyId: bigint (PK, autoincrement)
  accountId: bigint (FK → accounts)

  // Basic
  title: varchar(255)
  description: text
  propertyType: varchar(20)  // 'piso' | 'casa' | 'local' | 'garaje' | 'solar'
  propertySubtype: varchar(50)

  // Specifications
  bedrooms: smallint
  bathrooms: decimal(3,1)
  squareMeter: int
  yearBuilt: smallint
  cadastralReference: varchar(255)
  builtSurfaceArea: decimal(10,2)
  conservationStatus: smallint  // 1=Good, 2=Pretty good, 3=Almost new, 4=Needs renovation, 6=Renovated

  // Location
  street: varchar(255)
  addressDetails: varchar(255)
  postalCode: varchar(20)
  neighborhoodId: bigint (FK → locations)
  latitude: decimal(10,8)
  longitude: decimal(11,8)

  // Energy
  energyCertificateStatus: varchar(20)
  energyConsumptionScale: varchar(2)  // A-G
  energyConsumptionValue: decimal(6,2)  // kWh/m² año
  emissionsScale: varchar(2)  // A-G
  emissionsValue: decimal(6,2)  // kg CO2/m² año
  hasHeating: boolean
  heatingType: varchar(50)

  // Amenities (boolean flags)
  hasElevator: boolean
  hasGarage: boolean
  hasStorageRoom: boolean
  communityPool: boolean
  privatePool: boolean
  gym: boolean
  sportsArea: boolean
  childrenArea: boolean
  tennisCourt: boolean
  terrace: boolean
  garden: boolean

  // Property Characteristics (boolean flags)
  disabledAccessible: boolean
  vpo: boolean
  videoIntercom: boolean
  conciergeService: boolean
  securityGuard: boolean
  alarm: boolean
  securityDoor: boolean
  doubleGlazing: boolean

  // Condition (boolean flags)
  brandNew: boolean
  newConstruction: boolean
  underConstruction: boolean
  needsRenovation: boolean
  lastRenovationYear: smallint

  // Kitchen
  kitchenType: varchar(50)
  hotWaterType: varchar(50)
  openKitchen: boolean
  frenchKitchen: boolean
  furnishedKitchen: boolean
  pantry: boolean

  // Interior Features
  builtInWardrobes: boolean
  mainFloorType: varchar(50)
  shutterType: varchar(50)
  carpentryType: varchar(50)
  orientation: varchar(50)
  airConditioningType: varchar(50)
  windowType: varchar(50)

  // Views & Location (boolean flags)
  exterior: boolean
  bright: boolean
  views: boolean
  mountainViews: boolean
  seaViews: boolean
  beachfront: boolean

  // Luxury Amenities (boolean flags)
  jacuzzi: boolean
  hydromassage: boolean
  homeAutomation: boolean
  musicSystem: boolean
  laundryRoom: boolean
  coveredClothesline: boolean
  fireplace: boolean

  // System Fields
  createdAt: timestamp
  updatedAt: timestamp
  isActive: boolean
}
```

#### 2. **Listings Table**

Stores market-facing listing information and transaction details.

**Key Categories:**
- **Transaction Details**: listing type (Sale/Rent), price, status
- **Furnishing**: is furnished, furniture quality
- **Availability**: has keys, optional garage/storage pricing
- **Rental Specifics**: student friendly, pets allowed
- **Appliances**: oven, microwave, washing machine, fridge, TV
- **Portal Publishing**: Fotocasa, Idealista, Habitaclia flags

**Schema Reference:** `src/server/db/schema.ts` (lines 342-414)

```typescript
listings {
  listingId: bigint (PK, autoincrement)
  accountId: bigint (FK → accounts)
  propertyId: bigint (FK → properties)
  agentId: varchar(36) (FK → users)

  // Transaction Details
  listingType: varchar(20)  // 'Sale' | 'Rent' | 'RentWithOption' | 'Transfer' | 'RoomSharing'
  price: decimal(12,2)
  status: varchar(20)  // 'En Venta' | 'En Alquiler' | 'Vendido' | 'Alquilado' | 'Descartado' | 'Draft'

  // Descriptions
  description: text
  shortDescription: varchar(500)

  // Furnishing
  isFurnished: boolean
  furnitureQuality: varchar(50)  // 'basic' | 'standard' | 'high' | 'luxury'

  // Optional Features
  optionalGarage: boolean
  optionalGaragePrice: decimal(12,2)
  optionalStorageRoom: boolean
  optionalStorageRoomPrice: decimal(12,2)

  // Availability
  hasKeys: boolean
  studentFriendly: boolean
  petsAllowed: boolean
  appliancesIncluded: boolean

  // Appliances (boolean flags)
  internet: boolean
  oven: boolean
  microwave: boolean
  washingMachine: boolean
  fridge: boolean
  tv: boolean
  stoneware: boolean

  // Portal Publishing (boolean flags)
  fotocasa: boolean
  idealista: boolean
  habitaclia: boolean
  pisoscom: boolean
  yaencontre: boolean
  milanuncios: boolean
  publishToWebsite: boolean

  // Visibility
  isFeatured: boolean
  isBankOwned: boolean
  isActive: boolean
  visibilityMode: smallint  // 1=Exact location | 2=Street level | 3=Zone/neighborhood

  // Analytics
  viewCount: int
  inquiryCount: int

  // System Fields
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 3. **Contacts Table**

Stores property owner and related contact information.

**Schema Reference:** `src/server/db/schema.ts` (lines 417-433)

```typescript
contacts {
  contactId: bigint (PK, autoincrement)
  accountId: bigint (FK → accounts)

  firstName: varchar(100)
  lastName: varchar(100)
  nif: varchar(20)  // Spanish ID
  email: varchar(255)
  phone: varchar(20)
  additionalInfo: json
  orgId: bigint (FK → organizations, nullable)

  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## Field Mapping Configuration

The system uses a comprehensive field mapping configuration that translates Spanish real estate terminology to database schema fields.

**Configuration File:** `src/server/ocr/field-mapping-config.ts`

### Field Mapping Structure

Each field mapping contains:

```typescript
interface FieldMapping {
  dbColumn: string;              // Database column name (camelCase)
  dbTable: "properties" | "listings" | "contacts";
  aliases: string[];             // Spanish terms that map to this field
  dataType: "string" | "number" | "boolean" | "decimal";
  validation?: (value: string) => boolean;  // Optional validation function
  converter?: (value: string) => string | number | boolean;  // Value transformer
  examples?: string[];           // Example values
  category?: string;             // Grouping category
}
```

### Example Field Mappings

#### Bedrooms

```typescript
{
  dbColumn: "bedrooms",
  dbTable: "properties",
  aliases: [
    "dormitorios",
    "habitaciones",
    "cuartos",
    "dorm",
    "hab",
    "alcobas"
  ],
  dataType: "number",
  validation: isBedroomCount,  // 0-10 range check
  converter: toNumber,         // Extract numeric value
  examples: ["1", "2", "3", "4", "5"],
  category: "specifications"
}
```

**Spanish Input Examples:**
- "3 dormitorios" → `bedrooms: 3`
- "dos habitaciones" → `bedrooms: 2`
- "hab: 4" → `bedrooms: 4`

#### Price

```typescript
{
  dbColumn: "price",
  dbTable: "listings",
  aliases: ["precio", "valor", "importe", "coste", "costo"],
  dataType: "decimal",
  validation: isPrice,
  converter: toPrice,  // Removes €, dots, converts commas
  category: "listing"
}
```

**Spanish Input Examples:**
- "150.000€" → `price: 150000`
- "€1.250,50" → `price: 1250.50`
- "Precio: 300000" → `price: 300000`

#### Has Elevator (Boolean)

```typescript
{
  dbColumn: "hasElevator",
  dbTable: "properties",
  aliases: ["ascensor", "elevador"],
  dataType: "boolean",
  converter: toBoolean,  // Recognizes sí/no, true/false, x, ✓
  category: "amenities"
}
```

**Spanish Input Examples:**
- "Con ascensor" → `hasElevator: true`
- "Sin ascensor" → `hasElevator: false`
- "Ascensor: Sí" → `hasElevator: true`
- "Ascensor: No" → `hasElevator: false`

### Converter Functions

#### `toBoolean(value: string): boolean`

Converts Spanish affirmative/negative terms to boolean:

```typescript
const toBoolean = (value: string): boolean => {
  const normalized = value.toLowerCase().trim();
  return [
    "sí", "si", "yes", "true", "1",
    "x", "✓", "tiene", "incluye"
  ].includes(normalized);
};
```

#### `toPrice(value: string): number`

Handles Spanish number formatting:

```typescript
const toPrice = (value: string): number => {
  // "150.000,50€" → 150000.50
  const clean = value
    .replace(/[€$\s]/g, "")  // Remove currency symbols
    .replace(/\./g, "")      // Remove thousand separators
    .replace(",", ".");      // Convert decimal comma to dot
  return parseFloat(clean);
};
```

#### `standardizeSpanishAddress(address: string): string`

Standardizes Spanish addresses:

```typescript
// Input: "c/ Mayor 25"
// Output: "Calle Mayor, 25"

// Input: "av. constitución 10"
// Output: "Avenida Constitución, 10"
```

### Categories

Field mappings are organized into logical categories:

**Properties Categories:**
- `basic`: Title, description, property type
- `specifications`: Bedrooms, bathrooms, square meters
- `location`: Street, postal code, city
- `energy`: Energy certificate, consumption, emissions
- `amenities`: Elevator, garage, pool
- `garage`: Garage-specific details
- `community`: Community facilities
- `characteristics`: Security, accessibility
- `condition`: New construction, renovation status
- `kitchen`: Kitchen features
- `storage`: Terrace, storage room sizes
- `interior`: Floor type, orientation, carpentry
- `views`: Exterior, bright, views
- `luxury`: Jacuzzi, home automation

**Listings Categories:**
- `listing`: Price, listing type, furnished
- `appliances`: Oven, fridge, washing machine
- `optional`: Optional garage/storage pricing

**Contacts Categories:**
- `contact`: Name, email, phone

---

## Voice Recording Pipeline

### Step-by-Step Process

#### 1. Audio Recording

**Frontend Component:** `src/components/propiedades/registro/voice-recording-enhanced.tsx`

- Agent records verbal property description
- Audio captured in browser as WAV/WebM
- File uploaded to storage (S3)

#### 2. Audio Transcription

**Service:** `src/server/transcription/transcription-service.ts`

Uses OpenAI Whisper API to transcribe audio:

```typescript
const transcription = await openai.audio.transcriptions.create({
  file: audioFile,
  model: "whisper-1",
  language: "es",  // Spanish language
  response_format: "verbose_json"  // Includes word-level timestamps
});

// Returns:
// {
//   transcript: "Se vende piso de tres dormitorios...",
//   confidence: 0.92,
//   language: "es",
//   duration: 45.2
// }
```

**Output:**
```typescript
interface TranscriptionResult {
  transcript: string;      // Full transcribed text
  confidence: number;      // 0-1 confidence score
  language: string;        // Detected language
  duration: number;        // Audio duration in seconds
}
```

#### 3. Field Extraction with GPT-4

**Service:** `src/server/transcription/voice-field-extractor.ts`

The transcribed text is processed by GPT-4 using **multiple specialized function calls**:

```typescript
export async function extractPropertyDataFromVoice(
  transcriptionResult: TranscriptionResult,
  referenceNumber?: string
): Promise<{
  extractedFields: ExtractedFieldResult[];
  propertyData: EnhancedExtractedPropertyData;
  listingData: EnhancedExtractedListingData;
  completeData: CompleteExtractedData;
}>
```

**Process:**

1. **Sequential Function Execution**: GPT-4 calls 9 specialized extraction functions:
   - `extract_basic_property_info`
   - `extract_listing_details`
   - `extract_property_amenities`
   - `extract_energy_heating`
   - `extract_property_condition`
   - `extract_kitchen_features`
   - `extract_interior_spaces`
   - `extract_luxury_amenities`
   - `extract_appliances`

2. **Each function receives:**
   - System prompt with extraction rules
   - User prompt with the transcript
   - JSON schema defining expected fields

3. **Function response includes:**
   - Extracted field values
   - Original text snippet where info was found
   - Confidence score (1-100)

#### 4. Example Voice Extraction

**Voice Input:**
```
"Se vende piso de tres dormitorios y dos baños en la calle Mayor número 25.
Tiene 120 metros cuadrados, ascensor, y calefacción central.
El precio es de 250.000 euros.
Está en buen estado y tiene terraza de 15 metros."
```

**GPT-4 Function Calls:**

**Function: `extract_basic_property_info`**
```json
{
  "property_type": "piso",
  "bedrooms": 3,
  "bathrooms": 2,
  "square_meter": 120,
  "street": "calle Mayor 25",
  "original_text": "piso de tres dormitorios y dos baños en la calle Mayor número 25. Tiene 120 metros cuadrados",
  "confidence": 95
}
```

**Function: `extract_listing_details`**
```json
{
  "listing_type": "Sale",
  "price": 250000,
  "original_text": "Se vende... El precio es de 250.000 euros",
  "confidence": 98
}
```

**Function: `extract_property_amenities`**
```json
{
  "has_elevator": true,
  "terrace": true,
  "original_text": "ascensor... tiene terraza de 15 metros",
  "confidence": 92
}
```

**Function: `extract_energy_heating`**
```json
{
  "has_heating": true,
  "heating_type": "centralizado",
  "original_text": "calefacción central",
  "confidence": 90
}
```

**Function: `extract_property_condition`**
```json
{
  "conservation_status": 2,
  "original_text": "Está en buen estado",
  "confidence": 85
}
```

**Function: `extract_interior_spaces`**
```json
{
  "terrace_size": 15,
  "original_text": "terraza de 15 metros",
  "confidence": 93
}
```

**Consolidated Results:**

```typescript
extractedFields: [
  {
    dbColumn: "propertyType",
    dbTable: "properties",
    value: "piso",
    originalText: "piso de tres dormitorios",
    confidence: 95,
    extractionSource: "gpt4_function_calling",
    fieldType: "string",
    matched_alias: "extract_basic_property_info:property_type"
  },
  {
    dbColumn: "bedrooms",
    dbTable: "properties",
    value: 3,
    originalText: "tres dormitorios",
    confidence: 95,
    extractionSource: "gpt4_function_calling",
    fieldType: "number"
  },
  {
    dbColumn: "bathrooms",
    dbTable: "properties",
    value: 2,
    originalText: "dos baños",
    confidence: 95,
    extractionSource: "gpt4_function_calling",
    fieldType: "number"
  },
  {
    dbColumn: "squareMeter",
    dbTable: "properties",
    value: 120,
    originalText: "120 metros cuadrados",
    confidence: 95,
    extractionSource: "gpt4_function_calling",
    fieldType: "number"
  },
  {
    dbColumn: "street",
    dbTable: "properties",
    value: "Calle Mayor, 25",
    originalText: "calle Mayor número 25",
    confidence: 95,
    extractionSource: "gpt4_function_calling",
    fieldType: "string"
  },
  {
    dbColumn: "hasElevator",
    dbTable: "properties",
    value: true,
    originalText: "ascensor",
    confidence: 92,
    extractionSource: "gpt4_function_calling",
    fieldType: "boolean"
  },
  {
    dbColumn: "hasHeating",
    dbTable: "properties",
    value: true,
    originalText: "calefacción central",
    confidence: 90,
    extractionSource: "gpt4_function_calling",
    fieldType: "boolean"
  },
  {
    dbColumn: "heatingType",
    dbTable: "properties",
    value: "centralizado",
    originalText: "calefacción central",
    confidence: 90,
    extractionSource: "gpt4_function_calling",
    fieldType: "string"
  },
  {
    dbColumn: "terrace",
    dbTable: "properties",
    value: true,
    originalText: "tiene terraza",
    confidence: 92,
    extractionSource: "gpt4_function_calling",
    fieldType: "boolean"
  },
  {
    dbColumn: "terraceSize",
    dbTable: "properties",
    value: 15,
    originalText: "terraza de 15 metros",
    confidence: 93,
    extractionSource: "gpt4_function_calling",
    fieldType: "number"
  },
  {
    dbColumn: "conservationStatus",
    dbTable: "properties",
    value: 2,
    originalText: "Está en buen estado",
    confidence: 85,
    extractionSource: "gpt4_function_calling",
    fieldType: "number"
  },
  {
    dbColumn: "listingType",
    dbTable: "listings",
    value: "Sale",
    originalText: "Se vende",
    confidence: 98,
    extractionSource: "gpt4_function_calling",
    fieldType: "string"
  },
  {
    dbColumn: "price",
    dbTable: "listings",
    value: 250000,
    originalText: "El precio es de 250.000 euros",
    confidence: 98,
    extractionSource: "gpt4_function_calling",
    fieldType: "decimal"
  }
]
```

#### 5. Data Persistence

**Service:** `src/server/queries/forms/voice/save-voice-property.ts`

```typescript
export async function saveVoiceProperty(
  extractedFields: ExtractedFieldResult[],
  contactIds: string[] = []
): Promise<SaveVoicePropertyResult>
```

**Process:**

1. **Build Property Data Object**
   - Filter fields where `dbTable === "properties"`
   - Apply type conversions (boolean, number, string)
   - Set default values for required fields

2. **Generate Property Title**
   - Use `generatePropertyTitle(propertyType, street, neighborhood)`
   - Example: "Piso en Calle Mayor" or "Casa en Salamanca"

3. **Create Property Record**
   ```typescript
   const newProperty = await createProperty({
     propertyType: "piso",
     hasHeating: false,
     hasElevator: false,
     hasGarage: false,
     hasStorageRoom: false,
     isActive: true,
     ...extractedPropertyData
   });
   ```

4. **Create Default Listing**
   ```typescript
   const newListing = await createDefaultListing(newProperty.propertyId);
   ```

5. **Update Listing with Extracted Data**
   - Filter fields where `dbTable === "listings"`
   - Set agent to current user
   - Set status based on listing type:
     - `listingType === "Sale"` → `status: "En Venta"`
     - `listingType === "Rent"` → `status: "En Alquiler"`

6. **Associate Contacts**
   - Link provided contact IDs to the listing
   - Default contact type: "buyer"

7. **Create Default Tasks**
   - Asynchronously create property tasks for the agent

**Return:**
```typescript
{
  success: true,
  propertyId: 12345,
  listingId: 67890
}
```

---

## OCR Processing Pipeline

### Step-by-Step Process

#### 1. Document Upload

**Frontend Component:** `src/components/propiedades/registro/registration-options.tsx`

- Agent uploads PDF or image document (property form, contract, etc.)
- File uploaded to S3
- Document metadata stored in database

#### 2. AWS Textract Processing

**Service:** Custom Textract integration

AWS Textract extracts:
- **Raw Text**: All text content from document
- **Form Fields**: Key-value pairs (e.g., "Dormitorios: 3")
- **Table Data**: Structured table information
- **Confidence Scores**: Per-field confidence (0-100)
- **Geometry**: Bounding boxes and layout information

**Output Structure:**
```typescript
interface OCRInput {
  extractedText: string;  // Full document text
  detectedFields?: Record<string, {
    text: string;
    confidence: number;
  }>;
  blocks: Block[];  // Textract block structure
  confidence: number;  // Overall OCR confidence
}
```

**Example Textract Output:**

```typescript
{
  extractedText: `
    FICHA DE PROPIEDAD

    Tipo: Piso
    Dormitorios: 3
    Baños: 2
    Superficie: 120 m²
    Dirección: Calle Mayor, 25
    Código Postal: 28013

    Características:
    ✓ Ascensor
    ✓ Calefacción central
    ✓ Terraza (15 m²)
    ✓ Exterior

    Precio: 250.000€
    Operación: Venta
  `,
  detectedFields: {
    "Tipo": { text: "Piso", confidence: 98 },
    "Dormitorios": { text: "3", confidence: 97 },
    "Baños": { text: "2", confidence: 96 },
    "Superficie": { text: "120 m²", confidence: 95 },
    "Precio": { text: "250.000€", confidence: 99 }
  },
  confidence: 96.8
}
```

#### 3. Field Extraction with GPT-4

**Service:** `src/server/ocr/gpt4-field-extractor.ts`

Similar to voice pipeline, but with **10 specialized functions** (includes contact extraction):

```typescript
export async function extractEnhancedPropertyDataWithGPT4(
  ocrInput: OCRInput
): Promise<{
  extractedFields: ExtractedFieldResult[];
  propertyData: EnhancedExtractedPropertyData;
  listingData: EnhancedExtractedListingData;
  contactData: EnhancedExtractedContactData;
  completeData: CompleteExtractedData;
}>
```

**OCR-Specific Functions:**

All voice functions PLUS:
- `extract_contact_info`: Owner name, phone, email, agent details

**GPT-4 System Prompt (OCR-specific):**

```
You are an expert real estate data extraction specialist processing OCR text
from Spanish property documents. Extract structured information using the
available functions.

CRITICAL EXTRACTION RULES:
1. ONLY extract information explicitly stated in the OCR text
2. NEVER invent, assume, or infer missing data
3. Convert values to correct types (remove currency symbols, convert text numbers)
4. For prices: remove €, dots, and convert commas (e.g., "150.000€" → 150000)
5. For boolean fields: ONLY include if explicitly mentioned
   - If text says "con ascensor" → has_elevator: true
   - If text says "sin ascensor" → has_elevator: false
   - If ascensor is NOT mentioned → DO NOT include the field
6. Assign confidence 80-100 for clear OCR text, 50-79 for unclear/partial
7. Include the exact original text snippet for each extraction
8. Handle Spanish number formats (1.234,56 → 1234.56)

SPANISH TERMINOLOGY MAPPING:
- Venta/Vender → Sale
- Alquiler/Alquilar → Rent
- Alquiler con opción → RentWithOption
- Traspaso → Transfer
- Compartir piso → RoomSharing

PROPERTY TYPES:
- Piso, Apartamento, Casa, Chalet, Local, Garaje, Estudio, Loft, Dúplex, Ático

CONSERVATION STATUS:
1 = Excelente, 2 = Bueno, 3 = Regular, 4 = Malo, 6 = Obra nueva

Only call functions for categories that have relevant data in the OCR text.
```

#### 4. Contact Information Extraction

**Function: `extract_contact_info`**

Extracts property owner and agent information:

```json
{
  "owner_name": "Juan García Martínez",
  "owner_phone": "612345678",
  "owner_email": "juan.garcia@email.com",
  "agent_name": "María López",
  "agent_phone": "687654321",
  "commission_percentage": 3,
  "exclusive_contract": true,
  "contract_duration": 12,
  "original_text": "Propietario: Juan García Martínez, Tel: 612345678...",
  "confidence": 88
}
```

**Name Parsing:**

The system automatically splits full names:

```typescript
// Input: "Juan García Martínez"
// Output:
{
  firstName: "Juan",
  lastName: "García Martínez"
}
```

#### 5. Consolidation & Deduplication

**Function:** `consolidateResults()`

- Merges results from all function calls
- Removes duplicate fields (keeps highest confidence)
- Sorts by confidence score

```typescript
// Before consolidation: 47 raw field extractions
// After consolidation: 32 unique fields (duplicates removed)
```

#### 6. Confidence Filtering

Optional filtering by confidence threshold:

```typescript
const filtered = await filterByConfidence(extractedFields, 50);
// Removes fields below 50% confidence
```

#### 7. Database Persistence

Similar to voice pipeline, but includes contact creation:

1. Create/update property
2. Create/update listing
3. **Create contact if owner info extracted**
4. Link contact to listing
5. Create default tasks

---

## GPT-4 Intelligent Extraction

### Why GPT-4 Function Calling?

**Previous Approach (Regex/Pattern Matching):**
- ❌ Brittle pattern matching
- ❌ Failed on variations in wording
- ❌ Required extensive manual rules
- ❌ Poor handling of context

**Current Approach (GPT-4 Function Calling):**
- ✅ Context-aware understanding
- ✅ Handles natural language variations
- ✅ Adapts to different formats
- ✅ Intelligent field inference
- ✅ High accuracy with confidence scores

### Function Calling Architecture

#### 1. Specialized Functions

Each function focuses on a specific category of property data:

**Function: `extract_basic_property_info`**

Purpose: Extract core property details

Parameters:
```json
{
  "type": "object",
  "properties": {
    "property_type": {
      "type": "string",
      "description": "Type of property (piso, casa, chalet, apartamento, local, garaje, estudio, loft, dúplex, ático)"
    },
    "bedrooms": {
      "type": "integer",
      "minimum": 0,
      "maximum": 10,
      "description": "Number of bedrooms/habitaciones/dormitorios"
    },
    "bathrooms": {
      "type": "number",
      "minimum": 0,
      "maximum": 10,
      "description": "Number of bathrooms/baños (can be decimal like 1.5)"
    },
    "square_meter": {
      "type": "number",
      "minimum": 1,
      "maximum": 10000,
      "description": "Total square meters/metros cuadrados/m2/m²"
    },
    "street": {
      "type": "string",
      "description": "Street address/calle/dirección"
    },
    "postal_code": {
      "type": "string",
      "pattern": "^\\d{5}$",
      "description": "5-digit postal code/código postal"
    },
    "orientation": {
      "type": "string",
      "enum": ["norte", "sur", "este", "oeste", "noreste", "noroeste", "sureste", "suroeste"],
      "description": "Property orientation/orientación"
    },
    "original_text": {
      "type": "string",
      "description": "Original text snippet where this information was found"
    },
    "confidence": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100,
      "description": "Confidence level (1-100)"
    }
  },
  "required": ["original_text", "confidence"]
}
```

**Key Features:**
- Type constraints (integer, number, string, boolean)
- Range validation (min/max)
- Enum validation for fixed choices
- Pattern matching for specific formats (e.g., postal codes)
- Multi-language descriptions (Spanish & English)

**Function: `extract_property_amenities`**

Purpose: Extract boolean amenities (elevator, garage, pool, etc.)

**CRITICAL RULE for Boolean Fields:**

```
For boolean fields: ONLY include if explicitly mentioned
- If text says "con ascensor" → has_elevator: true
- If text says "sin ascensor" → has_elevator: false
- If ascensor is NOT mentioned → DO NOT include the field
```

This prevents false positives and ensures data quality.

#### 2. Sequential Execution

Functions are called **sequentially**, not in parallel:

```typescript
for (const func of extractionFunctions) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,  // Low temperature for consistency
      max_tokens: 1500,
      tools: [{ type: "function", function: func }],
      tool_choice: {
        type: "function",
        function: { name: func.name }
      }
    });

    // Process results...
  } catch (error) {
    console.error(`Error executing ${func.name}:`, error);
    continue;  // Continue with next function
  }
}
```

**Why Sequential?**
- More reliable than parallel execution
- Easier error handling
- Clearer logging and debugging
- Cost-effective token usage

#### 3. Response Processing

For each function call:

1. **Extract function arguments**
   ```typescript
   const functionArgs = JSON.parse(
     functionCall.function.arguments
   ) as Record<string, unknown>;
   ```

2. **Map to database fields**
   ```typescript
   const fieldMapping = fieldMappings[functionName];
   // e.g., "bedrooms" → { dbColumn: "bedrooms", dbTable: "properties" }
   ```

3. **Apply validation**
   ```typescript
   if (fieldMapping.validation &&
       !fieldMapping.validation(stringValue)) {
     console.warn(`Validation failed for ${dbColumn}`);
     continue;
   }
   ```

4. **Apply conversion**
   ```typescript
   if (fieldMapping.converter) {
     convertedValue = fieldMapping.converter(stringValue);
   }
   ```

5. **Adjust confidence**
   ```typescript
   const adjustedConfidence = Math.min(
     baseConfidence,
     baseConfidence * (inputConfidence / 100)
   );
   ```

6. **Create ExtractedFieldResult**
   ```typescript
   extractedFields.push({
     dbColumn: "bedrooms",
     dbTable: "properties",
     value: 3,
     originalText: "tres dormitorios",
     confidence: 92.5,
     extractionSource: "gpt4_function_calling",
     fieldType: "number",
     matched_alias: "extract_basic_property_info:bedrooms"
   });
   ```

---

## Data Transformation & Validation

### Type Conversions

#### String Values

No conversion needed, but may apply standardization:

```typescript
// Address standardization
"c/ Mayor 25" → "Calle Mayor, 25"

// Uppercase for location fields
"madrid" → "MADRID"
```

#### Numeric Values

Extract numbers from text:

```typescript
"120 m²" → 120
"tres habitaciones" → 3 (handled by GPT-4)
"1.234,56" → 1234.56
"€250.000" → 250000
```

#### Boolean Values

Convert Spanish affirmations:

```typescript
"Sí" → true
"No" → false
"Con ascensor" → true (for hasElevator)
"Sin terraza" → false (for terrace)
"✓" → true
"X" → true
```

#### Decimal Values

Preserve decimal precision:

```typescript
"2.5 baños" → 2.5
"120,50 m²" → 120.50
```

### Validation Rules

#### Bedroom Count

```typescript
const isBedroomCount = (value: string): boolean => {
  const count = parseInt(value);
  return !isNaN(count) && count >= 0 && count <= 10;
};
```

#### Year

```typescript
const isYear = (value: string): boolean => {
  const year = parseInt(value);
  return !isNaN(year) &&
         year >= 1800 &&
         year <= new Date().getFullYear() + 5;
};
```

#### Energy Scale

```typescript
const isEnergyScale = (value: string): boolean => {
  return /^[A-G]$/i.test(value.trim());
};
```

#### Conservation Status

```typescript
const isConservationStatus = (value: string): boolean => {
  const status = parseInt(value);
  return !isNaN(status) && [1, 2, 3, 4, 6].includes(status);
};
```

### Field-Specific Transformations

#### Property Type Normalization

Spanish terms → Standard types:

```typescript
"Piso" → "piso"
"Casa" → "casa"
"Chalet" → "casa"
"Apartamento" → "piso"
"Ático" → "piso"
"Dúplex" → "piso"
"Estudio" → "piso"
"Local Comercial" → "local"
"Plaza de Garaje" → "garaje"
```

#### Listing Type Mapping

```typescript
"Venta" → "Sale"
"Alquiler" → "Rent"
"Alquiler con opción a compra" → "RentWithOption"
"Traspaso" → "Transfer"
"Compartir piso" → "RoomSharing"
```

#### Status Mapping

Based on listing type:

```typescript
if (listingType === "Sale") {
  status = "En Venta";
} else if (listingType === "Rent") {
  status = "En Alquiler";
}
```

---

## Database Persistence Layer

### Property Creation Flow

#### 1. Prepare Property Data

```typescript
const propertyData: Record<string, unknown> = {
  // Defaults
  isActive: true,
  formPosition: 1,

  // Required fields (with fallbacks)
  propertyType: extractedData.propertyType || "piso",
  hasHeating: extractedData.hasHeating ?? false,
  hasElevator: extractedData.hasElevator ?? false,
  hasGarage: extractedData.hasGarage ?? false,
  hasStorageRoom: extractedData.hasStorageRoom ?? false
};

// Map extracted fields
extractedFields.forEach(field => {
  if (field.dbTable === "properties") {
    if (field.fieldType === "boolean") {
      propertyData[field.dbColumn] = Boolean(field.value);
    } else if (field.fieldType === "number" || field.fieldType === "decimal") {
      const numValue = typeof field.value === "string"
        ? parseFloat(field.value)
        : field.value;
      if (!isNaN(Number(numValue))) {
        propertyData[field.dbColumn] = numValue;
      }
    } else {
      propertyData[field.dbColumn] = String(field.value);
    }
  }
});
```

#### 2. Generate Title

```typescript
const generatedTitle = generatePropertyTitle(
  propertyData.propertyType as string || "piso",
  propertyData.street as string || "",
  propertyData.neighborhood as string || ""
);
// e.g., "Piso en Calle Mayor" or "Casa en Salamanca"

propertyData.title = generatedTitle;
```

#### 3. Create Property

```typescript
const newProperty = await createProperty({
  accountId: currentUser.accountId,
  ...propertyData
} as PropertyInsertType);

console.log(`Property created with ID: ${newProperty.propertyId}`);
```

#### 4. Create Listing

```typescript
const newListing = await createDefaultListing(
  Number(newProperty.propertyId)
);
```

Default listing values:
- `status`: "Draft"
- `listingType`: "Sale"
- `price`: 0
- `agentId`: Current user
- `isActive`: true

#### 5. Update Listing with Extracted Data

```typescript
const listingUpdateData: Record<string, unknown> = {};

extractedFields
  .filter(f => f.dbTable === "listings")
  .forEach(field => {
    if (field.dbColumn === "price") {
      listingUpdateData.price = String(field.value);
    } else if (field.dbColumn === "listingType") {
      listingUpdateData.listingType = String(field.value);
    } else if (field.fieldType === "boolean") {
      listingUpdateData[field.dbColumn] = Boolean(field.value);
    } else {
      listingUpdateData[field.dbColumn] = field.value;
    }
  });

// Set Spanish status based on listing type
const listingType = listingUpdateData.listingType ?? "Sale";
if (listingType === "Sale") {
  listingUpdateData.status = "En Venta";
} else if (listingType === "Rent" || listingType === "RentWithOption") {
  listingUpdateData.status = "En Alquiler";
}

await updateListingWithAuth(
  Number(newListing.listingId),
  listingUpdateData
);
```

#### 6. Associate Contacts (if provided)

```typescript
if (contactIds.length > 0 && newListing?.listingId) {
  for (const contactId of contactIds) {
    await db.insert(listingContacts).values({
      listingId: BigInt(newListing.listingId),
      contactId: BigInt(contactId),
      contactType: "buyer",  // or "owner"
      isActive: true
    });
  }
}
```

#### 7. Create Default Tasks

```typescript
await createPropertyTasksAsync({
  userId: currentUser.id,
  listingId: BigInt(newListing.listingId)
});
```

Default tasks created:
- Upload property photos
- Complete energy certificate
- Verify cadastral reference
- Schedule property visit
- Review pricing

---

## Complete Examples

### Example 1: Voice Recording (Detailed Walkthrough)

**Scenario:** Agent records a voice description of a property for sale.

#### Input (Voice Recording - 42 seconds)

**Transcript:**
```
"Hola, registrando un nuevo piso en venta.
Es un piso de cuatro dormitorios y dos baños completos,
ubicado en la Calle de Alcalá número 150, en el barrio de Salamanca.
Tiene 140 metros cuadrados construidos.
El edificio tiene ascensor y el piso cuenta con calefacción central de gas.
Además tiene una terraza de 20 metros cuadrados con orientación sur,
muy luminoso y exterior.
El piso está en buen estado, reformado hace 5 años.
La cocina es americana y está totalmente equipada.
El precio de venta es de 450.000 euros.
Tiene aire acondicionado y armarios empotrados en todas las habitaciones."
```

**Transcription Result:**
```typescript
{
  transcript: "Hola, registrando un nuevo piso en venta...",
  confidence: 0.94,
  language: "es",
  duration: 42.3
}
```

#### GPT-4 Function Extraction

**Function 1: `extract_basic_property_info`**

```json
{
  "property_type": "piso",
  "bedrooms": 4,
  "bathrooms": 2,
  "square_meter": 140,
  "built_surface_area": 140,
  "street": "Calle de Alcalá 150",
  "city": "Madrid",
  "orientation": "sur",
  "original_text": "piso de cuatro dormitorios y dos baños completos, ubicado en la Calle de Alcalá número 150... 140 metros cuadrados construidos... orientación sur",
  "confidence": 96
}
```

**Function 2: `extract_listing_details`**

```json
{
  "listing_type": "Sale",
  "price": 450000,
  "original_text": "piso en venta... El precio de venta es de 450.000 euros",
  "confidence": 98
}
```

**Function 3: `extract_property_amenities`**

```json
{
  "has_elevator": true,
  "terrace": true,
  "exterior": true,
  "bright": true,
  "original_text": "El edificio tiene ascensor... tiene una terraza de 20 metros cuadrados... muy luminoso y exterior",
  "confidence": 94
}
```

**Function 4: `extract_energy_heating`**

```json
{
  "has_heating": true,
  "heating_type": "gas",
  "air_conditioning_type": "individual",
  "original_text": "calefacción central de gas... Tiene aire acondicionado",
  "confidence": 92
}
```

**Function 5: `extract_property_condition`**

```json
{
  "last_renovation_year": 2020,
  "conservation_status": 2,
  "original_text": "El piso está en buen estado, reformado hace 5 años",
  "confidence": 88
}
```

**Function 6: `extract_kitchen_features`**

```json
{
  "open_kitchen": true,
  "furnished_kitchen": true,
  "original_text": "La cocina es americana y está totalmente equipada",
  "confidence": 93
}
```

**Function 7: `extract_interior_spaces`**

```json
{
  "terrace_size": 20,
  "built_in_wardrobes": true,
  "original_text": "terraza de 20 metros cuadrados... armarios empotrados en todas las habitaciones",
  "confidence": 91
}
```

#### Extracted Fields Array (Consolidated)

```typescript
[
  { dbColumn: "propertyType", dbTable: "properties", value: "piso", confidence: 96, fieldType: "string" },
  { dbColumn: "bedrooms", dbTable: "properties", value: 4, confidence: 96, fieldType: "number" },
  { dbColumn: "bathrooms", dbTable: "properties", value: 2, confidence: 96, fieldType: "number" },
  { dbColumn: "squareMeter", dbTable: "properties", value: 140, confidence: 96, fieldType: "number" },
  { dbColumn: "builtSurfaceArea", dbTable: "properties", value: 140, confidence: 96, fieldType: "decimal" },
  { dbColumn: "street", dbTable: "properties", value: "Calle Alcalá, 150", confidence: 96, fieldType: "string" },
  { dbColumn: "extractedCity", dbTable: "properties", value: "MADRID", confidence: 96, fieldType: "string" },
  { dbColumn: "orientation", dbTable: "properties", value: "sur", confidence: 96, fieldType: "string" },
  { dbColumn: "hasElevator", dbTable: "properties", value: true, confidence: 94, fieldType: "boolean" },
  { dbColumn: "hasHeating", dbTable: "properties", value: true, confidence: 92, fieldType: "boolean" },
  { dbColumn: "heatingType", dbTable: "properties", value: "gas", confidence: 92, fieldType: "string" },
  { dbColumn: "airConditioningType", dbTable: "properties", value: "individual", confidence: 92, fieldType: "string" },
  { dbColumn: "terrace", dbTable: "properties", value: true, confidence: 94, fieldType: "boolean" },
  { dbColumn: "terraceSize", dbTable: "properties", value: 20, confidence: 91, fieldType: "number" },
  { dbColumn: "exterior", dbTable: "properties", value: true, confidence: 94, fieldType: "boolean" },
  { dbColumn: "bright", dbTable: "properties", value: true, confidence: 94, fieldType: "boolean" },
  { dbColumn: "lastRenovationYear", dbTable: "properties", value: 2020, confidence: 88, fieldType: "number" },
  { dbColumn: "conservationStatus", dbTable: "properties", value: 2, confidence: 88, fieldType: "number" },
  { dbColumn: "openKitchen", dbTable: "properties", value: true, confidence: 93, fieldType: "boolean" },
  { dbColumn: "furnishedKitchen", dbTable: "properties", value: true, confidence: 93, fieldType: "boolean" },
  { dbColumn: "builtInWardrobes", dbTable: "properties", value: true, confidence: 91, fieldType: "boolean" },
  { dbColumn: "listingType", dbTable: "listings", value: "Sale", confidence: 98, fieldType: "string" },
  { dbColumn: "price", dbTable: "listings", value: 450000, confidence: 98, fieldType: "decimal" }
]
```

**Statistics:**
- Total fields extracted: 23
- Property fields: 21
- Listing fields: 2
- Average confidence: 93.4%
- Confidence range: 88% - 98%

#### Database Insertion

**Properties Table:**
```sql
INSERT INTO properties (
  account_id,
  property_type,
  title,
  bedrooms,
  bathrooms,
  square_meter,
  built_surface_area,
  street,
  orientation,
  has_elevator,
  has_heating,
  heating_type,
  air_conditioning_type,
  terrace,
  terrace_size,
  exterior,
  bright,
  last_renovation_year,
  conservation_status,
  open_kitchen,
  furnished_kitchen,
  built_in_wardrobes,
  is_active,
  form_position
) VALUES (
  1,
  'piso',
  'Piso en Calle Alcalá',
  4,
  2,
  140,
  140.00,
  'Calle Alcalá, 150',
  'sur',
  true,
  true,
  'gas',
  'individual',
  true,
  20,
  true,
  true,
  2020,
  2,
  true,
  true,
  true,
  true,
  1
);
-- Returns: property_id = 12345
```

**Listings Table:**
```sql
INSERT INTO listings (
  account_id,
  property_id,
  agent_id,
  listing_type,
  price,
  status,
  is_active
) VALUES (
  1,
  12345,
  'user-abc-123',
  'Sale',
  450000.00,
  'En Venta',
  true
);
-- Returns: listing_id = 67890
```

**Result:**
```typescript
{
  success: true,
  propertyId: 12345,
  listingId: 67890
}
```

---

### Example 2: OCR Document Processing

**Scenario:** Agent uploads a property information form PDF.

#### Input (OCR Document)

**Document Content (Textract Extraction):**
```
FICHA DE PROPIEDAD INMOBILIARIA

DATOS GENERALES
Tipo de inmueble: Casa Adosada
Operación: Venta
Precio: 380.000€

UBICACIÓN
Dirección: Av. Constitución, 42
Código Postal: 28922
Localidad: Alcorcón
Provincia: Madrid

CARACTERÍSTICAS
Dormitorios: 3
Baños: 2,5
Superficie útil: 180 m²
Superficie construida: 210 m²
Año construcción: 2015

DISTRIBUCIÓN
Plantas: 3
Salón-comedor: 45 m²
Cocina: 15 m² (office, amueblada)
Terraza: 25 m²
Jardín privado: 50 m²

INSTALACIONES
☑ Calefacción (gas natural)
☑ Aire acondicionado (split)
☑ Piscina comunitaria
☑ Garaje (2 plazas)
☑ Trastero (8 m²)
☑ Armarios empotrados
☐ Ascensor

ESTADO
Estado conservación: Excelente
Última reforma: 2022
Orientación: Este-Oeste

CERTIFICACIÓN ENERGÉTICA
Consumo energético: C (95 kWh/m² año)
Emisiones: C (18 kg CO2/m² año)

PROPIETARIO
Nombre: Ana Rodríguez Fernández
Teléfono: 666123456
Email: ana.rodriguez@email.com

OBSERVACIONES
Casa adosada en urbanización privada con seguridad 24h.
Muy luminosa y en perfecto estado. Ideal para familias.
```

**Textract Output:**
```typescript
{
  extractedText: "FICHA DE PROPIEDAD INMOBILIARIA...",
  detectedFields: {
    "Tipo de inmueble": { text: "Casa Adosada", confidence: 98 },
    "Operación": { text: "Venta", confidence: 99 },
    "Precio": { text: "380.000€", confidence: 99 },
    "Dirección": { text: "Av. Constitución, 42", confidence: 97 },
    "Código Postal": { text: "28922", confidence: 98 },
    "Dormitorios": { text: "3", confidence: 99 },
    "Baños": { text: "2,5", confidence: 98 },
    "Superficie útil": { text: "180 m²", confidence: 98 },
    // ... more fields
  },
  confidence: 97.2
}
```

#### GPT-4 Function Extraction

**Function 1: `extract_basic_property_info`**

```json
{
  "property_type": "casa",
  "property_subtype": "Casa Adosada",
  "description": "Casa adosada en urbanización privada con seguridad 24h. Muy luminosa y en perfecto estado. Ideal para familias.",
  "bedrooms": 3,
  "bathrooms": 2.5,
  "square_meter": 180,
  "built_surface_area": 210,
  "year_built": 2015,
  "street": "Av. Constitución, 42",
  "postal_code": "28922",
  "city": "Alcorcón",
  "province": "Madrid",
  "orientation": "este",
  "original_text": "Tipo de inmueble: Casa Adosada... Dormitorios: 3, Baños: 2,5... Dirección: Av. Constitución, 42, 28922 Alcorcón",
  "confidence": 97
}
```

**Function 2: `extract_listing_details`**

```json
{
  "listing_type": "Sale",
  "price": 380000,
  "original_text": "Operación: Venta, Precio: 380.000€",
  "confidence": 99
}
```

**Function 3: `extract_property_amenities`**

```json
{
  "has_garage": true,
  "has_storage_room": true,
  "community_pool": true,
  "garden": true,
  "terrace": true,
  "built_in_wardrobes": true,
  "original_text": "☑ Piscina comunitaria, ☑ Garaje (2 plazas), ☑ Trastero (8 m²), Jardín privado: 50 m², Terraza: 25 m², ☑ Armarios empotrados",
  "confidence": 96
}
```

**Function 4: `extract_energy_heating`**

```json
{
  "has_heating": true,
  "heating_type": "gas",
  "air_conditioning_type": "individual",
  "energy_consumption_scale": "C",
  "energy_consumption_value": 95,
  "emissions_scale": "C",
  "emissions_value": 18,
  "conservation_status": 1,
  "original_text": "Calefacción (gas natural), Aire acondicionado (split), Consumo energético: C (95 kWh/m² año), Emisiones: C (18 kg CO2/m² año), Estado conservación: Excelente",
  "confidence": 97
}
```

**Function 5: `extract_property_condition`**

```json
{
  "last_renovation_year": 2022,
  "conservation_status": 1,
  "original_text": "Estado conservación: Excelente, Última reforma: 2022",
  "confidence": 95
}
```

**Function 6: `extract_kitchen_features`**

```json
{
  "furnished_kitchen": true,
  "original_text": "Cocina: 15 m² (office, amueblada)",
  "confidence": 94
}
```

**Function 7: `extract_interior_spaces`**

```json
{
  "storage_room_size": 8,
  "terrace_size": 25,
  "living_room_size": 45,
  "building_floors": 3,
  "built_in_wardrobes": true,
  "original_text": "Plantas: 3, Salón-comedor: 45 m², Terraza: 25 m², Trastero (8 m²), ☑ Armarios empotrados",
  "confidence": 96
}
```

**Function 8: `extract_luxury_amenities`**

```json
{
  "garden": true,
  "original_text": "Jardín privado: 50 m²",
  "confidence": 97
}
```

**Function 9: `extract_contact_info`**

```json
{
  "owner_name": "Ana Rodríguez Fernández",
  "owner_phone": "666123456",
  "owner_email": "ana.rodriguez@email.com",
  "original_text": "PROPIETARIO: Nombre: Ana Rodríguez Fernández, Teléfono: 666123456, Email: ana.rodriguez@email.com",
  "confidence": 96
}
```

#### Contact Name Parsing

```typescript
// Input: "Ana Rodríguez Fernández"
// Automatic split:
{
  firstName: "Ana",
  lastName: "Rodríguez Fernández"
}
```

#### Extracted Fields Array

```typescript
[
  // Property fields (28 total)
  { dbColumn: "propertyType", dbTable: "properties", value: "casa", confidence: 97 },
  { dbColumn: "propertySubtype", dbTable: "properties", value: "Casa Adosada", confidence: 97 },
  { dbColumn: "description", dbTable: "properties", value: "Casa adosada en urbanización...", confidence: 97 },
  { dbColumn: "bedrooms", dbTable: "properties", value: 3, confidence: 97 },
  { dbColumn: "bathrooms", dbTable: "properties", value: 2.5, confidence: 97 },
  { dbColumn: "squareMeter", dbTable: "properties", value: 180, confidence: 97 },
  { dbColumn: "builtSurfaceArea", dbTable: "properties", value: 210, confidence: 97 },
  { dbColumn: "yearBuilt", dbTable: "properties", value: 2015, confidence: 97 },
  { dbColumn: "street", dbTable: "properties", value: "Avenida Constitución, 42", confidence: 97 },
  { dbColumn: "postalCode", dbTable: "properties", value: "28922", confidence: 97 },
  { dbColumn: "extractedCity", dbTable: "properties", value: "ALCORCÓN", confidence: 97 },
  { dbColumn: "extractedProvince", dbTable: "properties", value: "MADRID", confidence: 97 },
  { dbColumn: "orientation", dbTable: "properties", value: "este", confidence: 97 },
  { dbColumn: "hasGarage", dbTable: "properties", value: true, confidence: 96 },
  { dbColumn: "hasStorageRoom", dbTable: "properties", value: true, confidence: 96 },
  { dbColumn: "communityPool", dbTable: "properties", value: true, confidence: 96 },
  { dbColumn: "garden", dbTable: "properties", value: true, confidence: 96 },
  { dbColumn: "terrace", dbTable: "properties", value: true, confidence: 96 },
  { dbColumn: "builtInWardrobes", dbTable: "properties", value: true, confidence: 96 },
  { dbColumn: "hasHeating", dbTable: "properties", value: true, confidence: 97 },
  { dbColumn: "heatingType", dbTable: "properties", value: "gas", confidence: 97 },
  { dbColumn: "airConditioningType", dbTable: "properties", value: "individual", confidence: 97 },
  { dbColumn: "energyConsumptionScale", dbTable: "properties", value: "C", confidence: 97 },
  { dbColumn: "energyConsumptionValue", dbTable: "properties", value: 95, confidence: 97 },
  { dbColumn: "emissionsScale", dbTable: "properties", value: "C", confidence: 97 },
  { dbColumn: "emissionsValue", dbTable: "properties", value: 18, confidence: 97 },
  { dbColumn: "conservationStatus", dbTable: "properties", value: 1, confidence: 95 },
  { dbColumn: "lastRenovationYear", dbTable: "properties", value: 2022, confidence: 95 },
  { dbColumn: "furnishedKitchen", dbTable: "properties", value: true, confidence: 94 },
  { dbColumn: "storageRoomSize", dbTable: "properties", value: 8, confidence: 96 },
  { dbColumn: "terraceSize", dbTable: "properties", value: 25, confidence: 96 },
  { dbColumn: "livingRoomSize", dbTable: "properties", value: 45, confidence: 96 },
  { dbColumn: "buildingFloors", dbTable: "properties", value: 3, confidence: 96 },

  // Listing fields (2 total)
  { dbColumn: "listingType", dbTable: "listings", value: "Sale", confidence: 99 },
  { dbColumn: "price", dbTable: "listings", value: 380000, confidence: 99 },

  // Contact fields (3 total)
  { dbColumn: "firstName", dbTable: "contacts", value: "Ana", confidence: 96 },
  { dbColumn: "lastName", dbTable: "contacts", value: "Rodríguez Fernández", confidence: 96 },
  { dbColumn: "phone", dbTable: "contacts", value: "666123456", confidence: 96 },
  { dbColumn: "email", dbTable: "contacts", value: "ana.rodriguez@email.com", confidence: 96 }
]
```

**Statistics:**
- Total fields extracted: 36
- Property fields: 31
- Listing fields: 2
- Contact fields: 3
- Average confidence: 96.3%
- Confidence range: 94% - 99%

#### Database Insertion

**Step 1: Create Contact**
```sql
INSERT INTO contacts (
  account_id,
  first_name,
  last_name,
  phone,
  email,
  is_active
) VALUES (
  1,
  'Ana',
  'Rodríguez Fernández',
  '666123456',
  'ana.rodriguez@email.com',
  true
);
-- Returns: contact_id = 5001
```

**Step 2: Create Property**
```sql
INSERT INTO properties (
  account_id,
  property_type,
  property_subtype,
  title,
  description,
  bedrooms,
  bathrooms,
  square_meter,
  built_surface_area,
  year_built,
  street,
  postal_code,
  orientation,
  has_garage,
  has_storage_room,
  community_pool,
  garden,
  terrace,
  built_in_wardrobes,
  has_heating,
  heating_type,
  air_conditioning_type,
  energy_consumption_scale,
  energy_consumption_value,
  emissions_scale,
  emissions_value,
  conservation_status,
  last_renovation_year,
  furnished_kitchen,
  storage_room_size,
  terrace_size,
  living_room_size,
  building_floors,
  is_active
) VALUES (
  1,
  'casa',
  'Casa Adosada',
  'Casa en Avenida Constitución',
  'Casa adosada en urbanización privada con seguridad 24h. Muy luminosa y en perfecto estado. Ideal para familias.',
  3,
  2.5,
  180,
  210.00,
  2015,
  'Avenida Constitución, 42',
  '28922',
  'este',
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  'gas',
  'individual',
  'C',
  95.00,
  'C',
  18.00,
  1,
  2022,
  true,
  8,
  25,
  45,
  3,
  true
);
-- Returns: property_id = 12346
```

**Step 3: Create Listing**
```sql
INSERT INTO listings (
  account_id,
  property_id,
  agent_id,
  listing_type,
  price,
  status,
  is_active
) VALUES (
  1,
  12346,
  'user-abc-123',
  'Sale',
  380000.00,
  'En Venta',
  true
);
-- Returns: listing_id = 67891
```

**Step 4: Link Contact to Listing**
```sql
INSERT INTO listing_contacts (
  listing_id,
  contact_id,
  contact_type,
  is_active
) VALUES (
  67891,
  5001,
  'owner',
  true
);
```

**Final Result:**
```typescript
{
  success: true,
  propertyId: 12346,
  listingId: 67891,
  contactId: 5001
}
```

---

## Confidence Scoring System

### Confidence Sources

The final confidence score for each field is calculated from multiple sources:

#### 1. **Base Confidence** (from GPT-4)

Each GPT-4 function call returns a confidence score (1-100):

```json
{
  "bedrooms": 3,
  "original_text": "tres dormitorios",
  "confidence": 95
}
```

**Factors affecting GPT-4 confidence:**
- Clarity of information in source text
- Ambiguity or conflicting data
- Completeness of context

#### 2. **Input Quality Multiplier**

**For Voice:**
```typescript
const transcriptionConfidence = 0.94; // From Whisper API
const adjustedConfidence = Math.min(
  baseConfidence,
  baseConfidence * transcriptionConfidence
);

// Example: 95 * 0.94 = 89.3
```

**For OCR:**
```typescript
const ocrConfidence = 0.972; // From Textract
const adjustedConfidence = Math.min(
  baseConfidence,
  baseConfidence * (ocrConfidence / 100)
);

// Example: 95 * 0.972 = 92.34
```

#### 3. **Validation Bonus/Penalty**

Fields that pass validation get a small boost:

```typescript
if (fieldMapping.validation && fieldMapping.validation(value)) {
  confidence += 2; // Validation bonus
} else if (fieldMapping.validation) {
  confidence -= 5; // Validation failure penalty
}
```

### Confidence Thresholds

**Recommended Thresholds:**

- **High Confidence (80-100%)**: Auto-save without review
- **Medium Confidence (50-79%)**: Flag for manual review
- **Low Confidence (< 50%)**: Require manual verification

**Filtering by Threshold:**

```typescript
const highConfidenceFields = extractedFields.filter(f => f.confidence >= 80);
const mediumConfidenceFields = extractedFields.filter(f => f.confidence >= 50 && f.confidence < 80);
const lowConfidenceFields = extractedFields.filter(f => f.confidence < 50);

console.log(`High: ${highConfidenceFields.length}, Medium: ${mediumConfidenceFields.length}, Low: ${lowConfidenceFields.length}`);
```

### Confidence Display

**User Interface Indicators:**

```typescript
function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return "green";
  if (confidence >= 50) return "yellow";
  return "red";
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 80) return "Alta";
  if (confidence >= 50) return "Media";
  return "Baja";
}
```

**Example UI:**

```
Dormitorios: 3 [●●●●● 95%] Alta
Baños: 2 [●●●●● 94%] Alta
Precio: 250.000€ [●●●●● 98%] Alta
Orientación: Sur [●●●○○ 72%] Media
Año construcción: 2010 [●●○○○ 48%] Baja ⚠️
```

---

## Error Handling & Edge Cases

### Common Issues

#### 1. **Missing Required Fields**

**Problem:** Property created without essential fields (e.g., property type)

**Solution:** Set defaults

```typescript
const propertyData = {
  propertyType: extractedData.propertyType || "piso", // Default to "piso"
  hasHeating: extractedData.hasHeating ?? false, // Default to false if not mentioned
  hasElevator: extractedData.hasElevator ?? false,
  // ...
};
```

#### 2. **Ambiguous Property Type**

**Problem:** "Apartamento" vs "Piso" vs "Estudio"

**Solution:** Normalize to standard types

```typescript
// GPT-4 function parameter includes all variations:
{
  "property_type": {
    "type": "string",
    "description": "Type of property (piso, casa, chalet, apartamento, local, garaje, estudio, loft, dúplex, ático)"
  }
}

// All map to database types:
"apartamento" → "piso"
"estudio" → "piso"
"ático" → "piso"
"dúplex" → "piso"
```

#### 3. **Price Format Variations**

**Problem:** Multiple formats: "€250.000", "250000€", "250.000,00 euros"

**Solution:** Robust price converter

```typescript
const toPrice = (value: string): number => {
  // Remove all currency symbols and spaces
  let clean = value.replace(/[€$\s]/g, "");

  // Handle Spanish format: 250.000,50
  if (clean.includes(",") && clean.includes(".")) {
    clean = clean.replace(/\./g, "").replace(",", ".");
  }
  // Handle decimal comma: 1234,56
  else if (clean.includes(",")) {
    clean = clean.replace(",", ".");
  }

  return parseFloat(clean);
};

// Examples:
"€250.000" → 250000
"250.000,50€" → 250000.50
"250000 euros" → 250000
"250,000.50" → 250000.50
```

#### 4. **Boolean Ambiguity**

**Problem:** "Con posibilidad de ascensor" (has possibility of elevator)

**Solution:** GPT-4 instructions emphasize explicit mentions

```
ONLY include boolean fields if EXPLICITLY mentioned:
- "con ascensor" → has_elevator: true
- "sin ascensor" → has_elevator: false
- "posibilidad de ascensor" → DO NOT include (ambiguous)
```

#### 5. **Location Data Incomplete**

**Problem:** City/province extracted but neighborhood not found

**Solution:** Multi-step location resolution

```typescript
// Step 1: Extract city/province from text
const extractedCity = "MADRID";
const extractedProvince = "MADRID";

// Step 2: Try to find matching neighborhood in locations table
const location = await db
  .select()
  .from(locations)
  .where(and(
    eq(locations.city, extractedCity),
    eq(locations.province, extractedProvince)
  ))
  .limit(1);

// Step 3: If not found, create property without neighborhoodId
// (Can be added later manually or via geocoding)
if (!location) {
  console.warn("Location not found, property created without neighborhoodId");
}
```

#### 6. **Duplicate Field Extraction**

**Problem:** GPT-4 extracts "bedrooms" in multiple function calls

**Solution:** Consolidation with highest confidence

```typescript
function consolidateResults(results: ExtractedFieldResult[]): ExtractedFieldResult[] {
  const consolidatedMap = new Map<string, ExtractedFieldResult>();

  // Sort by confidence (highest first)
  const sortedResults = results.sort((a, b) => b.confidence - a.confidence);

  for (const result of sortedResults) {
    const key = `${result.dbTable}.${result.dbColumn}`;

    // Keep only the highest confidence result for each field
    if (!consolidatedMap.has(key)) {
      consolidatedMap.set(key, result);
    }
  }

  return Array.from(consolidatedMap.values());
}
```

#### 7. **OCR Misreads**

**Problem:** Textract reads "5" as "S" or "0" as "O"

**Solution:** Validation + Manual Review

```typescript
// Validation catches obvious errors:
const isBedroomCount = (value: string): boolean => {
  const count = parseInt(value);
  return !isNaN(count) && count >= 0 && count <= 10;
};

// If validation fails, field is rejected:
if (fieldMapping.validation && !fieldMapping.validation(stringValue)) {
  console.warn(`Validation failed for ${dbColumn}: ${stringValue}`);
  continue; // Skip this field
}
```

**Result:** Invalid field rejected, user can correct manually

#### 8. **Contact Name Parsing Edge Cases**

**Problem:** Single-word names, titles, multiple surnames

```typescript
// Input: "Dr. Juan Carlos García López de Ayala"
const fullName = "Dr. Juan Carlos García López de Ayala";
const nameParts = fullName
  .replace(/^(Dr\.|Dra\.|Sr\.|Sra\.|Don|Doña)\s+/i, "") // Remove titles
  .split(" ")
  .filter(part => part.length > 0);

if (nameParts.length >= 2) {
  const firstName = nameParts[0]; // "Juan"
  const lastName = nameParts.slice(1).join(" "); // "Carlos García López de Ayala"
}

// Special case: Single name (e.g., "Ana")
if (nameParts.length === 1) {
  const firstName = nameParts[0];
  const lastName = ""; // Empty last name
}
```

#### 9. **Voice Transcription Errors**

**Problem:** Whisper mishears "tres" as "stress"

**Solution:** GPT-4 context understanding

```typescript
// Whisper transcript: "piso de stress dormitorios"
// GPT-4 interprets context:
// - "stress" doesn't make sense for bedroom count
// - Common Spanish term is "tres" (three)
// - Likely transcription error
// → Returns: bedrooms: 3 with lower confidence (e.g., 75%)
```

**Best Practice:** Review medium-confidence fields

#### 10. **Large Text Input (Token Limits)**

**Problem:** Very long property descriptions exceed GPT-4 context

**Solution:** Text chunking or summarization

```typescript
const MAX_TRANSCRIPT_LENGTH = 4000; // Characters

if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
  // Option 1: Truncate
  const truncated = transcript.substring(0, MAX_TRANSCRIPT_LENGTH);
  console.warn("Transcript truncated to fit token limits");

  // Option 2: Summarize first (future enhancement)
  // const summary = await summarizeText(transcript);
}
```

---

## Performance Considerations

### API Costs

**OpenAI GPT-4 Pricing (as of 2025):**
- Input: $10 / 1M tokens
- Output: $30 / 1M tokens

**Typical Usage:**

**Voice Recording (45 seconds):**
- Transcription (Whisper): $0.006 per minute → ~$0.0045
- Extraction (GPT-4): ~3,000 input tokens, ~500 output tokens
  - Input cost: 3,000 * $10 / 1M = $0.03
  - Output cost: 500 * $30 / 1M = $0.015
- **Total per property: ~$0.05**

**OCR Document (1 page):**
- Textract: ~$0.015 per page
- Extraction (GPT-4): ~4,000 input tokens, ~600 output tokens
  - Input cost: $0.04
  - Output cost: $0.018
- **Total per property: ~$0.07**

**Optimization Tips:**
- Use `temperature: 0.1` for consistency (reduces wasted tokens)
- Set `max_tokens` limits to prevent runaway generation
- Cache common field mappings client-side

### Processing Time

**Typical Latency:**

1. **Voice Recording:**
   - Audio upload: 1-2 seconds
   - Transcription (Whisper): 3-8 seconds
   - GPT-4 extraction: 15-25 seconds (9 function calls)
   - Database save: 1-2 seconds
   - **Total: 20-37 seconds**

2. **OCR Document:**
   - Document upload: 2-5 seconds
   - Textract processing: 5-15 seconds
   - GPT-4 extraction: 18-30 seconds (10 function calls)
   - Database save: 1-2 seconds
   - **Total: 26-52 seconds**

**Optimization Strategies:**

```typescript
// Future: Parallel function calling (requires refactor)
const functionCalls = extractionFunctions.map(func =>
  openai.chat.completions.create({
    model: "gpt-4o",
    messages: [...],
    tools: [{ type: "function", function: func }]
  })
);

const results = await Promise.all(functionCalls);
// Reduces extraction time from 20s to ~5s
```

---

## Debugging & Monitoring

### Logging

**Structured Logging:**

```typescript
console.log(`🎤 [VOICE-EXTRACTION] Starting property data extraction...`);
console.log(`📝 [VOICE-EXTRACTION] Transcript length: ${transcript.length} chars`);
console.log(`🎯 [VOICE-EXTRACTION] Confidence: ${confidence}%`);

console.log(`🔍 [GPT4-FUNCTION-CALLING] Executing function: extract_basic_property_info`);
console.log(`✅ [GPT4-FUNCTION-CALLING] extract_basic_property_info executed successfully`);

console.log(`✅ [VOICE-EXTRACTION] Extraction completed:`);
console.log(`   - Total fields extracted: 23`);
console.log(`   - Property fields: 21`);
console.log(`   - Listing fields: 2`);
console.log(`   - Average confidence: 93.4%`);
```

### Error Tracking

**Sentry Integration (Recommended):**

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  const result = await extractPropertyDataFromVoice(transcription);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: "voice-extraction",
      source: "gpt4-function-calling"
    },
    extra: {
      transcriptLength: transcription.transcript.length,
      confidence: transcription.confidence
    }
  });

  throw error;
}
```

### Analytics

**Key Metrics to Track:**

- **Extraction Success Rate**: % of successful extractions
- **Average Confidence Score**: Overall quality metric
- **Field Coverage**: % of fields extracted per property
- **Processing Time**: P50, P95, P99 latencies
- **Error Rates**: By function, by field type
- **Cost per Property**: OpenAI API costs

**Example Dashboard Queries:**

```sql
-- Average fields extracted per property
SELECT
  AVG(fields_extracted) as avg_fields,
  AVG(confidence) as avg_confidence
FROM extraction_logs
WHERE created_at > NOW() - INTERVAL 30 DAY;

-- Most commonly extracted fields
SELECT
  db_column,
  COUNT(*) as extraction_count,
  AVG(confidence) as avg_confidence
FROM extracted_field_results
GROUP BY db_column
ORDER BY extraction_count DESC;

-- Success rate by source (voice vs OCR)
SELECT
  source,
  COUNT(*) as total,
  SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as successes,
  (SUM(CASE WHEN success = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate
FROM extraction_logs
GROUP BY source;
```

---

## External Services Integration

The Vesta platform integrates with several external services to enrich property data automatically. These services complement the voice/OCR extraction pipeline by providing authoritative data sources.

### 1. Spanish Cadastral Service (Catastro)

**Purpose:** Retrieve official property information from the Spanish government's cadastral database.

**Service File:** `src/server/cadastral/retrieve_cadastral.tsx`

**API Endpoint:** `https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCallejero.svc/json/Consulta_DNPRC`

#### How It Works

The cadastral reference (referencia catastral) is a unique 20-character identifier for every property in Spain. When provided, the system can fetch authoritative data directly from the government database.

**Input:** Cadastral Reference
```
Example: "1234567AB1234S0001AB"
```

**API Request:**
```typescript
const apiUrl = `https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCallejero.svc/json/Consulta_DNPRC?RefCat=${cadastralReference}`;

const response = await fetch(apiUrl, {
  method: "GET",
  headers: {
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0 (compatible; RealEstateApp/1.0)"
  }
});
```

#### Data Retrieved

The API returns comprehensive property information:

```typescript
interface CadastralResponse {
  consulta_dnprcResult: {
    bico: {
      bi: {
        dt: {
          np: string;        // Province (e.g., "MADRID")
          nm: string;        // Municipality (e.g., "MADRID")
          locs: {
            lous: {
              lourb: {
                dir: {
                  tv: string;  // Street type (e.g., "CL" for Calle)
                  nv: string;  // Street name (e.g., "MAYOR")
                  pnp: string; // Street number (e.g., "25")
                };
                loint: {
                  es: string;  // Staircase (e.g., "1")
                  pt: string;  // Floor (e.g., "3")
                  pu: string;  // Door (e.g., "A")
                };
                dp: string;    // Postal code (e.g., "28013")
              };
            };
          };
        };
        debi: {
          luso: string;  // Usage (e.g., "Residencial")
          sfc: string;   // Built surface area in m² (e.g., "120")
          ant: string;   // Year built (e.g., "2010")
        };
      };
      lcons: Array<{
        lcd: string;     // Construction type (e.g., "Vivienda")
      }>;
    };
  };
}
```

#### Data Mapping Process

**Step 1: Extract and Format Address**

```typescript
// Extract raw data
const dir = data.consulta_dnprcResult.bico.bi.dt.locs.lous.lourb.dir;
const loint = data.consulta_dnprcResult.bico.bi.dt.locs.lous.lourb.loint;

// Format street type (abbreviation → full name)
const streetTypes: Record<string, string> = {
  CL: "Calle",
  AV: "Avenida",
  PL: "Plaza",
  PS: "Paseo",
  // ... more types
};
const formattedStreetType = streetTypes[dir.tv] || dir.tv;

// Format street name with proper capitalization
const formattedStreetName = dir.nv
  .toLowerCase()
  .split(" ")
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

// Build complete street address
const street = `${formattedStreetType} ${formattedStreetName}, ${dir.pnp}`;
// Result: "Calle Mayor, 25"

// Build address details (floor/door)
const addressDetails = `${loint.es}ª ${loint.pt}º ${loint.pu}`;
// Result: "1ª 3º A"
```

**Step 2: Extract Property Specifications**

```typescript
const debi = data.consulta_dnprcResult.bico.bi.debi;

const squareMeter = parseFloat(debi.sfc) || 0;           // 120
const builtSurfaceArea = parseFloat(debi.sfc) || 0;     // 120
const yearBuilt = parseInt(debi.ant) || 0;              // 2010
```

**Step 3: Determine Property Type**

```typescript
const getPropertyType = (usage: string, constructionType?: string): string => {
  const usageLower = usage.toLowerCase();
  const constructionLower = constructionType?.toLowerCase() ?? "";

  if (usageLower.includes("vivienda") || usageLower.includes("residencial") ||
      constructionLower.includes("vivienda")) {
    return "piso";
  } else if (usageLower.includes("comercial") || usageLower.includes("local")) {
    return "local";
  } else if (usageLower.includes("garaje") || usageLower.includes("parking")) {
    return "garaje";
  } else if (usageLower.includes("solar") || usageLower.includes("terreno")) {
    return "solar";
  }
  return "piso"; // Default
};

const constructionType = data.consulta_dnprcResult.bico.lcons[0]?.lcd;
const propertyType = getPropertyType(debi.luso, constructionType);
```

**Step 4: Enrich with Geocoding**

After extracting cadastral data, the system calls the geocoding service to get coordinates and neighborhood information:

```typescript
// Build full address for geocoding
const fullAddress = `${street}, ${dt.nm}, ${dt.np}, España`;
// "Calle Mayor, 25, Madrid, Madrid, España"

// Get geocoding data
const geoData = await retrieveGeocodingData(fullAddress);

// Use geocoded data or fallback to cadastral data
const neighborhood = geoData?.neighborhood ?? dt.nm;
const municipality = geoData?.municipality ?? dt.nm;
const city = geoData?.city ?? dt.np;
const province = geoData?.province ?? dt.np;
const latitude = geoData?.latitude;
const longitude = geoData?.longitude;
const neighborhoodId = geoData?.neighborhoodId;
```

**Step 5: Return Formatted Data**

```typescript
interface FormattedCadastralData {
  street: string;              // "Calle Mayor, 25"
  addressDetails: string;      // "1ª 3º A"
  squareMeter: number;         // 120
  builtSurfaceArea: number;    // 120
  yearBuilt: number;           // 2010
  propertyType: string;        // "piso"
  municipality: string;        // "Madrid"
  neighborhood: string;        // "Sol"
  postalCode: string;          // "28013"
  latitude?: string;           // "40.4168"
  longitude?: string;          // "-3.7038"
  neighborhoodId?: number;     // 1234
  city?: string;               // "Madrid"
  province?: string;           // "Madrid"
}
```

#### Example Cadastral Lookup

**Input:**
```typescript
const cadastralRef = "9872023VH4897H0001PZ";
const data = await retrieveCadastralData(cadastralRef);
```

**Output:**
```typescript
{
  street: "Avenida Constitución, 42",
  addressDetails: "2ª 4º B",
  squareMeter: 180,
  builtSurfaceArea: 210,
  yearBuilt: 2015,
  propertyType: "piso",
  municipality: "Alcorcón",
  neighborhood: "Centro",
  postalCode: "28922",
  latitude: "40.3456",
  longitude: "-3.8234",
  neighborhoodId: 5678,
  city: "Alcorcón",
  province: "Madrid"
}
```

#### Usage in Property Creation

Cadastral data is typically used in two scenarios:

**1. Manual Form Entry:**
When an agent enters a cadastral reference in the property form, the system automatically fetches and populates all available fields.

**2. OCR Document Processing:**
When a property document (contract, deed) is uploaded, the OCR extractor looks for the cadastral reference and automatically enriches the property data.

```typescript
// In property creation flow
if (cadastralReference) {
  const cadastralData = await retrieveCadastralData(cadastralReference);

  if (cadastralData) {
    // Auto-populate property fields
    propertyData.street = cadastralData.street;
    propertyData.addressDetails = cadastralData.addressDetails;
    propertyData.squareMeter = cadastralData.squareMeter;
    propertyData.builtSurfaceArea = cadastralData.builtSurfaceArea;
    propertyData.yearBuilt = cadastralData.yearBuilt;
    propertyData.propertyType = cadastralData.propertyType;
    propertyData.postalCode = cadastralData.postalCode;
    propertyData.latitude = cadastralData.latitude;
    propertyData.longitude = cadastralData.longitude;
    propertyData.neighborhoodId = cadastralData.neighborhoodId;
  }
}
```

#### Benefits

✅ **Authoritative Source**: Government-verified data
✅ **Comprehensive**: Address, size, year built, property type
✅ **Automatic Enrichment**: No manual data entry required
✅ **Geocoding Integration**: Automatically fetches coordinates
✅ **Error Reduction**: Eliminates transcription errors

#### Limitations

❌ **Requires Cadastral Reference**: Not all properties have easily accessible references
❌ **Limited to Spain**: Only works for Spanish properties
❌ **Network Dependency**: Requires external API availability
❌ **Rate Limiting**: Government API may have usage limits

---

### 2. Geocoding Service (OpenStreetMap Nominatim)

**Purpose:** Convert addresses to geographic coordinates (latitude/longitude) and extract neighborhood information.

**Service File:** `src/server/googlemaps/retrieve_geo.tsx`

**API Endpoint:** `https://nominatim.openstreetmap.org/search`

#### How It Works

The geocoding service takes a human-readable address and returns precise geographic coordinates plus structured location data.

**Input:** Full Address String
```
"Calle Mayor, 25, Madrid, Madrid, España"
```

**API Request:**
```typescript
const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1&limit=1`;

const response = await fetch(url, {
  method: "GET",
  headers: {
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0 (compatible; RealEstateApp/1.0)"
  }
});
```

#### API Response Structure

```typescript
interface NominatimResponse {
  lat: string;         // Latitude: "40.4168"
  lon: string;         // Longitude: "-3.7038"
  address: {
    suburb?: string;   // Neighborhood: "Sol"
    city?: string;     // City: "Madrid"
    province?: string; // Province: "Comunidad de Madrid"
    state?: string;    // State (alternative to province)
  };
}
```

#### Data Processing

**Step 1: Extract Geographic Data**

```typescript
const result = data[0]; // First result
const latitude = result.lat;     // "40.4168"
const longitude = result.lon;    // "-3.7038"
const neighborhood = result.address.suburb; // "Sol"
```

**Step 2: Find or Create Neighborhood in Database**

```typescript
const municipality = result.address.city ?? "Unknown";
const province = result.address.province ?? result.address.state ?? "Unknown";

let neighborhoodId: number | undefined;
if (neighborhood) {
  try {
    // Calls findOrCreateLocation service
    neighborhoodId = await findOrCreateLocation({
      city: municipality,
      province: province,
      municipality: municipality,
      neighborhood: neighborhood
    });
  } catch (error) {
    // Continue without neighborhood ID if there's an error
  }
}
```

**Step 3: Return Formatted Data**

```typescript
interface FormattedGeoData {
  latitude: string;           // "40.4168"
  longitude: string;          // "-3.7038"
  neighborhood?: string;      // "Sol"
  neighborhoodId?: number;    // 1234 (from database)
  city?: string;              // "Madrid"
  municipality?: string;      // "Madrid"
  province?: string;          // "Comunidad de Madrid"
}
```

#### Example Geocoding Request

**Input:**
```typescript
const address = "Avenida Constitución, 42, Alcorcón, Madrid, España";
const geoData = await retrieveGeocodingData(address);
```

**Output:**
```typescript
{
  latitude: "40.3456",
  longitude: "-3.8234",
  neighborhood: "Centro",
  neighborhoodId: 5678,
  city: "Alcorcón",
  municipality: "Alcorcón",
  province: "Comunidad de Madrid"
}
```

#### Usage Scenarios

**1. Cadastral Data Enrichment:**
When cadastral data is retrieved, geocoding adds coordinates and neighborhood info:

```typescript
const fullAddress = `${street}, ${municipality}, ${province}, España`;
const geoData = await retrieveGeocodingData(fullAddress);
```

**2. Manual Address Entry:**
When an agent enters an address manually, geocoding can validate and enrich it:

```typescript
if (propertyData.street && propertyData.city) {
  const address = `${propertyData.street}, ${propertyData.city}, España`;
  const geoData = await retrieveGeocodingData(address);

  if (geoData) {
    propertyData.latitude = geoData.latitude;
    propertyData.longitude = geoData.longitude;
    propertyData.neighborhoodId = geoData.neighborhoodId;
  }
}
```

**3. Voice/OCR Extraction:**
Extracted city and street information can be geocoded for coordinates:

```typescript
// After GPT-4 extracts street and city
const extractedStreet = "Calle Mayor, 25";
const extractedCity = "Madrid";
const address = `${extractedStreet}, ${extractedCity}, España`;
const geoData = await retrieveGeocodingData(address);
```

#### Benefits

✅ **Free & Open Source**: OpenStreetMap Nominatim is free
✅ **Global Coverage**: Works for addresses worldwide
✅ **Neighborhood Detection**: Extracts neighborhood/suburb info
✅ **Database Integration**: Auto-creates locations in DB
✅ **No API Key Required**: No authentication needed

#### Limitations

❌ **Rate Limiting**: Max 1 request/second for free usage
❌ **Variable Accuracy**: Depends on OpenStreetMap data quality
❌ **Spanish Address Variations**: May struggle with uncommon formats
❌ **Requires Well-Formed Address**: Needs complete address string

#### Best Practices

**1. Always provide complete addresses:**
```typescript
// ✅ Good
"Calle Mayor, 25, Madrid, Madrid, España"

// ❌ Bad
"Calle Mayor 25"
```

**2. Handle missing results gracefully:**
```typescript
const geoData = await retrieveGeocodingData(address);

if (!geoData) {
  console.warn("Geocoding failed, continuing without coordinates");
  // Property can still be created without lat/lng
}
```

**3. Respect rate limits:**
```typescript
// Add delay between multiple geocoding requests
await new Promise(resolve => setTimeout(resolve, 1100)); // 1.1 seconds
```

---

## Property Title Generation

**Purpose:** Automatically generate human-readable property titles from property data.

**Service File:** `src/lib/property-title.ts`

**Function:** `generatePropertyTitle(propertyType, street, neighborhood)`

### How It Works

The title generator creates concise, descriptive titles for properties using a simple template:

```
{PropertyType} en {Street} ({Neighborhood})
```

**Implementation:**

```typescript
export function generatePropertyTitle(
  propertyType: string,
  street = "",
  neighborhood = ""
) {
  // Step 1: Convert property type to display text
  const getPropertyTypeText = (type: string) => {
    switch (type) {
      case "piso":
        return "Piso";
      case "casa":
        return "Casa";
      case "local":
        return "Local";
      case "solar":
        return "Solar";
      case "garaje":
      case "garage":
        return "Garaje";
      default:
        return type; // Return as-is if unknown
    }
  };

  const type = getPropertyTypeText(propertyType);

  // Step 2: Add neighborhood in parentheses if available
  const neighborhoodText = neighborhood ? `(${neighborhood})` : "";

  // Step 3: Combine and trim
  return `${type} en ${street} ${neighborhoodText}`.trim();
}
```

### Examples

**Full Information Available:**
```typescript
generatePropertyTitle("piso", "Calle Mayor, 25", "Sol");
// Output: "Piso en Calle Mayor, 25 (Sol)"
```

**Without Neighborhood:**
```typescript
generatePropertyTitle("casa", "Avenida Constitución, 42", "");
// Output: "Casa en Avenida Constitución, 42"
```

**Only Property Type:**
```typescript
generatePropertyTitle("local", "", "");
// Output: "Local en"
```

**Different Property Types:**
```typescript
generatePropertyTitle("garaje", "Calle Alcalá, 100", "Salamanca");
// Output: "Garaje en Calle Alcalá, 100 (Salamanca)"

generatePropertyTitle("solar", "Camino de las Huertas, s/n", "Carabanchel");
// Output: "Solar en Camino de las Huertas, s/n (Carabanchel)"
```

### Usage in System

**1. Voice Recording Pipeline:**

```typescript
// In save-voice-property.ts
const propertyType = extractedData.propertyType || "piso";
const street = extractedData.street || "";
const neighborhood = extractedData.neighborhood || "";

const generatedTitle = generatePropertyTitle(propertyType, street, neighborhood);
propertyData.title = generatedTitle;
```

**2. OCR Document Processing:**

```typescript
// In textract-database-saver.ts
const propertyType = propertyData.propertyType || "piso";
const street = propertyData.street || "";

// Get neighborhood from location if neighborhoodId exists
let neighborhood = "";
if (propertyData.neighborhoodId) {
  const location = await getLocationByNeighborhoodId(propertyData.neighborhoodId);
  neighborhood = location?.neighborhood || "";
}

const title = generatePropertyTitle(propertyType, street, neighborhood);
propertyData.title = title;
```

**3. Manual Form Entry:**

The system can auto-generate the title as the user fills in the form:

```typescript
// In property-form component
useEffect(() => {
  if (propertyType && street) {
    const autoTitle = generatePropertyTitle(propertyType, street, neighborhood);
    setTitle(autoTitle);
  }
}, [propertyType, street, neighborhood]);
```

### Title Customization

**Default Auto-Generated Titles:**
- Used as placeholder/initial value
- Can be overridden by user
- Regenerated when key fields change

**User Override:**
If an agent manually edits the title, the system respects that choice and doesn't auto-regenerate.

```typescript
// In form state
const [isManualTitle, setIsManualTitle] = useState(false);

const handleTitleChange = (newTitle: string) => {
  setTitle(newTitle);
  setIsManualTitle(true); // Mark as manually edited
};

// Only auto-generate if not manually edited
if (!isManualTitle && propertyType && street) {
  const autoTitle = generatePropertyTitle(propertyType, street, neighborhood);
  setTitle(autoTitle);
}
```

### Benefits

✅ **Consistency**: Uniform title format across all properties
✅ **Descriptive**: Contains key identifying information
✅ **SEO-Friendly**: Includes property type and location
✅ **Multi-Language Ready**: Easy to extend for different languages
✅ **Automatic**: No manual title creation needed

### Limitations

❌ **Simple Template**: Fixed format may not suit all cases
❌ **Spanish Only**: Currently designed for Spanish properties
❌ **No Customization**: Limited flexibility in title structure

### Future Enhancements

**Planned Improvements:**

1. **Keyword Optimization:**
```typescript
// Include key features in title
"Piso 3 dormitorios con terraza en Calle Mayor (Sol)"
```

2. **Multi-Language Support:**
```typescript
generatePropertyTitle(propertyType, street, neighborhood, language = "es")
// "es": "Piso en Calle Mayor"
// "en": "Apartment on Calle Mayor"
```

3. **Template Variations:**
```typescript
const templates = {
  short: "{type} en {street}",
  medium: "{type} {bedrooms}D en {street}",
  long: "{type} {bedrooms}D, {bathrooms}B con {features} en {street} ({neighborhood})"
};
```

---

## Location & Neighborhood Management

**Purpose:** Maintain a normalized database of locations (cities, provinces, neighborhoods) for consistent property addressing.

**Service File:** `src/server/queries/locations.ts`

**Database Table:** `locations`

### Database Schema

```sql
CREATE TABLE locations (
  neighborhood_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  municipality VARCHAR(100) NOT NULL,
  neighborhood VARCHAR(100) NOT NULL,
  neighborhood_clean VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_city (city),
  INDEX idx_neighborhood (neighborhood),
  UNIQUE KEY unique_city_neighborhood (city, neighborhood)
);
```

**Key Columns:**
- `neighborhoodId`: Unique identifier for the location
- `city`: City name (e.g., "Madrid", "Barcelona")
- `province`: Province/region name (e.g., "Comunidad de Madrid")
- `municipality`: Municipality name (often same as city)
- `neighborhood`: Neighborhood/district name (e.g., "Sol", "Salamanca")
- `neighborhoodClean`: Normalized version for search (future use)

### Core Function: findOrCreateLocation

**Purpose:** Ensure location exists in database, creating it if necessary.

**Usage Pattern:**

```typescript
interface LocationData {
  city: string;
  province: string;
  municipality: string;
  neighborhood: string;
}

// Returns the neighborhood ID (creates if doesn't exist)
const neighborhoodId = await findOrCreateLocation({
  city: "Madrid",
  province: "Comunidad de Madrid",
  municipality: "Madrid",
  neighborhood: "Sol"
});
// Returns: 1234 (neighborhood_id)
```

**Implementation Logic:**

```typescript
export async function findOrCreateLocation(
  locationData: LocationData
): Promise<number> {
  // Step 1: Check if location exists (using only city and neighborhood)
  const existingLocation = await db
    .select()
    .from(locations)
    .where(and(
      eq(locations.city, locationData.city),
      eq(locations.neighborhood, locationData.neighborhood)
    ))
    .limit(1);

  if (existingLocation.length > 0 && existingLocation[0]) {
    // Location exists - update province/municipality and return ID
    await db
      .update(locations)
      .set({
        province: locationData.province,
        municipality: locationData.municipality,
        updatedAt: new Date()
      })
      .where(eq(locations.neighborhoodId, existingLocation[0].neighborhoodId));

    console.log("🔄 Updated existing location:", existingLocation[0].neighborhoodId);
    return Number(existingLocation[0].neighborhoodId);
  }

  // Step 2: Location doesn't exist - create it
  await db.insert(locations).values({
    city: locationData.city,
    province: locationData.province,
    municipality: locationData.municipality,
    neighborhood: locationData.neighborhood,
    isActive: true
  });

  // Step 3: Retrieve and return the newly created location
  const [newLocation] = await db
    .select()
    .from(locations)
    .where(and(
      eq(locations.city, locationData.city),
      eq(locations.neighborhood, locationData.neighborhood)
    ))
    .limit(1);

  if (!newLocation) {
    throw new Error("Failed to create new location");
  }

  console.log("🆕 Created new location:", newLocation.neighborhoodId);
  return Number(newLocation.neighborhoodId);
}
```

**Key Design Decisions:**

1. **Lookup by City + Neighborhood Only**
   - Avoids duplicates from province/municipality variations
   - "Madrid" in "Comunidad de Madrid" vs "Madrid" in "Madrid" → same location

2. **Upsert Pattern**
   - Finds existing location first
   - Updates province/municipality if found (in case of data improvements)
   - Creates new if not found

3. **Auto-Increment ID**
   - Database generates unique `neighborhood_id`
   - Used as foreign key in `properties` table

### Usage in Data Pipeline

**1. During Geocoding (from OpenStreetMap):**

```typescript
// In retrieve_geo.tsx
const neighborhood = result.address.suburb;
const municipality = result.address.city ?? "Unknown";
const province = result.address.province ?? "Unknown";

let neighborhoodId: number | undefined;
if (neighborhood) {
  neighborhoodId = await findOrCreateLocation({
    city: municipality,
    province: province,
    municipality: municipality,
    neighborhood: neighborhood
  });
}

return {
  latitude: result.lat,
  longitude: result.lon,
  neighborhood,
  neighborhoodId,  // Now we have the DB ID
  city: municipality,
  municipality,
  province
};
```

**2. During Property Creation:**

```typescript
// In property creation flow
let neighborhoodId: number | undefined;

if (extractedCity && extractedNeighborhood) {
  neighborhoodId = await findOrCreateLocation({
    city: extractedCity,
    province: extractedProvince || extractedCity,
    municipality: extractedCity,
    neighborhood: extractedNeighborhood
  });
}

await db.insert(properties).values({
  ...propertyData,
  neighborhoodId: neighborhoodId ? BigInt(neighborhoodId) : null
});
```

**3. In Voice/OCR Extraction:**

```typescript
// After GPT-4 extraction
const extractedCity = extractedFields.find(f => f.dbColumn === "extractedCity")?.value;
const extractedNeighborhood = extractedFields.find(f => f.dbColumn === "extractedNeighborhood")?.value;

if (extractedCity && extractedNeighborhood) {
  const neighborhoodId = await findOrCreateLocation({
    city: String(extractedCity),
    province: String(extractedProvince || extractedCity),
    municipality: String(extractedCity),
    neighborhood: String(extractedNeighborhood)
  });

  propertyData.neighborhoodId = BigInt(neighborhoodId);
}
```

### Additional Location Queries

**Get all cities (for dropdowns):**
```typescript
export async function getAllCities() {
  const cities = await db
    .selectDistinct({ city: locations.city })
    .from(locations)
    .where(eq(locations.isActive, true))
    .orderBy(locations.city);

  return cities.map(c => c.city);
}
// Returns: ["Barcelona", "Madrid", "Valencia", ...]
```

**Get neighborhoods for a city:**
```typescript
export async function getNeighborhoodsByCity(city: string) {
  const neighborhoods = await db
    .select({
      neighborhoodId: locations.neighborhoodId,
      neighborhood: locations.neighborhood,
      municipality: locations.municipality,
      province: locations.province
    })
    .from(locations)
    .where(and(
      eq(locations.city, city),
      eq(locations.isActive, true)
    ))
    .orderBy(locations.neighborhood);

  return neighborhoods;
}
// Input: "Madrid"
// Returns: [
//   { neighborhoodId: 1, neighborhood: "Arganzuela", ... },
//   { neighborhoodId: 2, neighborhood: "Chamberí", ... },
//   { neighborhoodId: 3, neighborhood: "Salamanca", ... },
//   ...
// ]
```

**Get location by ID:**
```typescript
export async function getLocationByNeighborhoodId(neighborhoodId: number | bigint) {
  const [location] = await db
    .select()
    .from(locations)
    .where(eq(locations.neighborhoodId, BigInt(neighborhoodId)));

  return location;
}
// Input: 1234
// Returns: {
//   neighborhoodId: 1234n,
//   city: "Madrid",
//   province: "Comunidad de Madrid",
//   municipality: "Madrid",
//   neighborhood: "Sol",
//   ...
// }
```

### Location in Property Display

**Using neighborhoodId to show location:**

```typescript
// In property-header.tsx
const property = await getPropertyById(propertyId);

let locationText = "Ubicación no especificada";
if (property.neighborhoodId) {
  const location = await getLocationByNeighborhoodId(property.neighborhoodId);
  if (location) {
    locationText = `${location.neighborhood}, ${location.city}`;
  }
} else if (property.street) {
  locationText = property.street;
}

// Display: "Sol, Madrid" or "Calle Mayor, 25"
```

### Benefits of Location Normalization

✅ **Data Consistency**: Single source of truth for locations
✅ **Efficient Queries**: Filter properties by neighborhood ID (indexed)
✅ **Autocomplete**: Pre-populated location lists for forms
✅ **Search Optimization**: Fast neighborhood-based property search
✅ **Reporting**: Aggregate properties by location
✅ **No Duplicates**: "Salamanca" vs "salamanca" vs "SALAMANCA" → one record

### Use Cases

**1. Property Search by Neighborhood:**
```sql
SELECT * FROM properties p
JOIN locations l ON p.neighborhood_id = l.neighborhood_id
WHERE l.city = 'Madrid'
  AND l.neighborhood = 'Salamanca'
  AND p.property_type = 'piso';
```

**2. Neighborhood Analytics:**
```sql
SELECT
  l.neighborhood,
  COUNT(*) as property_count,
  AVG(listing.price) as avg_price
FROM properties p
JOIN listings listing ON p.property_id = listing.property_id
JOIN locations l ON p.neighborhood_id = l.neighborhood_id
WHERE l.city = 'Madrid'
GROUP BY l.neighborhood
ORDER BY avg_price DESC;
```

**3. Location-Based Filtering:**
```typescript
// Get all properties in Salamanca neighborhood
const salamancaLocation = await db
  .select()
  .from(locations)
  .where(and(
    eq(locations.city, "Madrid"),
    eq(locations.neighborhood, "Salamanca")
  ))
  .limit(1);

if (salamancaLocation[0]) {
  const properties = await db
    .select()
    .from(properties)
    .where(eq(properties.neighborhoodId, salamancaLocation[0].neighborhoodId));
}
```

### Data Flow Summary

```
External Source (Geocoding/Cadastral/OCR/Voice)
│
└─> Extracts: city, province, municipality, neighborhood
    │
    └─> findOrCreateLocation()
        │
        ├─> Checks if location exists (city + neighborhood)
        │   ├─> YES: Returns existing neighborhoodId
        │   └─> NO:  Creates new location, returns new neighborhoodId
        │
        └─> Property gets linked to neighborhoodId
            │
            └─> Database: properties.neighborhood_id = 1234
```

---

## Future Enhancements

### Planned Improvements

1. **Parallel Function Calling**
   - Execute GPT-4 functions concurrently
   - Reduce extraction time by 60-70%

2. **Fine-tuned Model**
   - Train custom model on Spanish real estate data
   - Improve accuracy for domain-specific terms

3. **Image Analysis**
   - Use GPT-4 Vision to analyze property photos
   - Extract additional features (e.g., modern kitchen, pool visible)

4. **Voice Commands**
   - Interactive voice recording with prompts
   - "Tell me about the bedrooms", "What's the address?"

5. **Confidence Learning**
   - Track user corrections to low-confidence fields
   - Adjust confidence thresholds based on historical accuracy

6. **Multi-language Support**
   - Extend to English, Catalan, Portuguese
   - Automatic language detection

7. **Geocoding Integration**
   - Automatically resolve addresses to coordinates
   - Enrich location data with neighborhood info

8. **Bulk Import**
   - Process multiple documents in batch
   - CSV/Excel import with intelligent mapping

---

## Summary

This guide has covered the complete data mapping pipeline from voice recordings and OCR documents to the Vesta database schema. Key takeaways:

✅ **Two Input Methods**: Voice (Whisper) and OCR (Textract)
✅ **Intelligent Extraction**: GPT-4 with specialized function calling
✅ **Comprehensive Mapping**: 1,200+ Spanish terms → 180+ database fields
✅ **Confidence Scoring**: Multi-source confidence calculation
✅ **Robust Validation**: Type checking, range validation, format conversion
✅ **Database Persistence**: Atomic operations with proper relationships
✅ **Error Handling**: Graceful degradation and user feedback

The system achieves **high accuracy** (avg 93-96% confidence) while maintaining **flexibility** to handle varied input formats and natural language variations.

---

## References

### Key Files

- **Schema**: `src/server/db/schema.ts`
- **Field Mapping**: `src/server/ocr/field-mapping-config.ts`
- **Voice Extractor**: `src/server/transcription/voice-field-extractor.ts`
- **OCR Extractor**: `src/server/ocr/gpt4-field-extractor.ts`
- **Voice Saver**: `src/server/queries/forms/voice/save-voice-property.ts`
- **Types**: `src/types/textract-enhanced.ts`

### External Documentation

- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [AWS Textract Documentation](https://docs.aws.amazon.com/textract/)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

---

**Document Status:** Complete
**Next Review:** Q2 2025
**Maintainer:** Vesta Development Team
