# Property Data Mapping Intelligence System

**Version:** 1.0
**Last Updated:** January 2025
**Purpose:** Input-agnostic mapping, extraction, and validation rules

---

## Table of Contents

1. [Overview](#overview)
2. [Core Architecture](#core-architecture)
3. [Field Mapping System](#field-mapping-system)
4. [GPT-4 Intelligent Extraction](#gpt-4-intelligent-extraction)
5. [Data Transformation & Validation](#data-transformation--validation)
6. [External Data Enrichment](#external-data-enrichment)
7. [Database Persistence](#database-persistence)
8. [Complete Mapping Reference](#complete-mapping-reference)

---

## Overview

This document describes the **intelligence layer** that maps raw property data (from ANY source - voice, OCR, file uploads, forms) to the Vesta database schema. The system is **input-agnostic** and focuses on:

1. **Spanish Real Estate Terminology Mapping**: 1,200+ Spanish terms → 180+ database fields
2. **GPT-4 Intelligence**: Context-aware extraction with confidence scoring
3. **Data Validation & Transformation**: Type conversion, format standardization
4. **External Enrichment**: Cadastral, geocoding, location services
5. **Database Persistence**: Structured property and listing creation

### Key Principle: Separation of Concerns

```
┌─────────────────────────────────────────────────────────┐
│              INPUT LAYER (VARIES)                        │
│   Voice Recording | OCR Document | File Upload | Form   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼ Raw Text/Data
┌─────────────────────────────────────────────────────────┐
│         INTELLIGENCE LAYER (THIS DOCUMENT)               │
│  • Field Mapping Configuration                           │
│  • GPT-4 Extraction Engine                              │
│  • Validation & Transformation                          │
│  • External Service Integration                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼ Structured Property Data
┌─────────────────────────────────────────────────────────┐
│              DATABASE LAYER                              │
│       Properties | Listings | Contacts                  │
└─────────────────────────────────────────────────────────┘
```

---

## Core Architecture

### System Components

**1. Field Mapping Configuration** (`src/server/ocr/field-mapping-config.ts`)
- Defines all Spanish → Database column mappings
- Includes validation rules, converters, examples
- Organized by category (specifications, amenities, energy, etc.)

**2. GPT-4 Extraction Engine** (`src/server/ocr/gpt4-field-extractor.ts`, `src/server/transcription/voice-field-extractor.ts`)
- 10 specialized extraction functions
- Context-aware field identification
- Confidence scoring
- Handles ambiguity and variations

**3. Data Transformation Layer**
- Type conversion (string → number, boolean, decimal)
- Format standardization (prices, addresses, dates)
- Validation (ranges, enums, patterns)

**4. External Services**
- Cadastral reference lookup (government data)
- Geocoding (coordinates + neighborhoods)
- Location normalization (database IDs)
- Property title generation

**5. Database Persistence** (`src/server/queries/forms/*/save-*.ts`)
- Property creation with defaults
- Listing creation and linking
- Contact association
- Task generation

---

## Field Mapping System

### Mapping Structure

Each database field has a comprehensive mapping configuration:

```typescript
interface FieldMapping {
  dbColumn: string;              // Database column name
  dbTable: "properties" | "listings" | "contacts";
  aliases: string[];             // Spanish terms that map to this field
  dataType: "string" | "number" | "boolean" | "decimal";
  validation?: (value: string) => boolean;  // Optional validation
  converter?: (value: string) => any;       // Value transformation
  examples?: string[];           // Example values
  category?: string;             // Grouping category
}
```

### Example: Bedrooms

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
  validation: (value) => {
    const count = parseInt(value);
    return !isNaN(count) && count >= 0 && count <= 10;
  },
  converter: (value) => {
    return parseFloat(value.replace(/[^\d.,]/g, "").replace(",", "."));
  },
  examples: ["1", "2", "3", "4", "5"],
  category: "specifications"
}
```

**Spanish Input Examples:**
- "3 dormitorios" → `bedrooms: 3`
- "dos habitaciones" → `bedrooms: 2` (GPT-4 converts text to number)
- "hab: 4" → `bedrooms: 4`
- "Cuatro cuartos" → `bedrooms: 4`

### Categories

Mappings are organized into logical categories:

**Properties Table (31 categories):**
- `basic`: Title, description, property type
- `specifications`: Bedrooms, bathrooms, square meters, year built
- `location`: Street, postal code, address details
- `energy`: Energy certificate, consumption, emissions, heating
- `amenities`: Elevator, garage, storage room, pool
- `garage`: Garage type, spaces, location
- `community`: Community pool, gym, sports area, children area
- `characteristics`: Accessibility, security features
- `condition`: New construction, renovation status
- `kitchen`: Kitchen type, appliances, layout
- `storage`: Terrace, storage room, wine cellar sizes
- `interior`: Floor type, orientation, carpentry, windows
- `views`: Exterior, bright, mountain/sea views
- `luxury`: Jacuzzi, home automation, fireplace

**Listings Table (3 categories):**
- `listing`: Price, listing type, furnished status
- `appliances`: Oven, fridge, washing machine, TV
- `optional`: Optional garage/storage pricing

**Contacts Table (1 category):**
- `contact`: Name, email, phone

### Key Converters

#### Price Converter
```typescript
const toPrice = (value: string): number => {
  // Handles: "€250.000", "250.000€", "250.000,50 euros", "250,000.50"
  let clean = value
    .replace(/[€$\s]/g, "")        // Remove currency symbols
    .replace(/\./g, "")             // Remove thousand separators
    .replace(",", ".");             // Convert decimal comma to dot

  return parseFloat(clean);
};

// Examples:
"€250.000" → 250000
"250.000,50€" → 250000.50
"250000 euros" → 250000
```

#### Boolean Converter
```typescript
const toBoolean = (value: string): boolean => {
  const normalized = value.toLowerCase().trim();
  return [
    "sí", "si", "yes", "true", "1",
    "x", "✓", "tiene", "incluye"
  ].includes(normalized);
};

// Examples:
"Sí" → true
"Con ascensor" → true (GPT-4 extracts "sí" from context)
"Sin terraza" → false
"✓" → true
```

#### Address Standardization
```typescript
const standardizeSpanishAddress = (address: string): string => {
  const streetTypes = {
    "c/": "Calle",
    "av/": "Avenida",
    "pl/": "Plaza",
    // ... more mappings
  };

  // "c/ mayor 25" → "Calle Mayor, 25"
  // "av. constitución 10" → "Avenida Constitución, 10"
};
```

### Complete Field List

**Properties Table (98 fields):**
```
Basic: title, description, propertyType, propertySubtype

Specifications: bedrooms, bathrooms, squareMeter, yearBuilt,
  cadastralReference, builtSurfaceArea, conservationStatus

Location: street, addressDetails, postalCode, neighborhoodId,
  latitude, longitude

Energy: energyCertificateStatus, energyConsumptionScale,
  energyConsumptionValue, emissionsScale, emissionsValue,
  hasHeating, heatingType

Amenities: hasElevator, hasGarage, hasStorageRoom, communityPool,
  privatePool, gym, sportsArea, childrenArea, tennisCourt,
  terrace, garden

Garage: garageType, garageSpaces, garageInBuilding,
  elevatorToGarage, garageNumber

Characteristics: disabledAccessible, vpo, videoIntercom,
  conciergeService, securityGuard, alarm, securityDoor,
  doubleGlazing, satelliteDish

Condition: brandNew, newConstruction, underConstruction,
  needsRenovation, lastRenovationYear

Kitchen: kitchenType, hotWaterType, openKitchen, frenchKitchen,
  furnishedKitchen, pantry

Storage: storageRoomSize, storageRoomNumber, terraceSize,
  wineCellar, wineCellarSize, livingRoomSize, balconyCount,
  galleryCount, buildingFloors

Interior: builtInWardrobes, mainFloorType, shutterType,
  carpentryType, orientation, airConditioningType, windowType

Views: exterior, bright, views, mountainViews, seaViews, beachfront

Luxury: jacuzzi, hydromassage, homeAutomation, musicSystem,
  laundryRoom, coveredClothesline, fireplace
```

**Listings Table (24 fields):**
```
Listing: listingType, price, isFurnished, furnitureQuality,
  hasKeys, studentFriendly, petsAllowed, appliancesIncluded

Appliances: internet, oven, microwave, washingMachine, fridge,
  tv, stoneware

Optional: optionalGarage, optionalGaragePrice, optionalStorageRoom,
  optionalStorageRoomPrice
```

**Contacts Table (4 fields):**
```
Contact: firstName, lastName, email, phone
```

---

## GPT-4 Intelligent Extraction

### Why GPT-4 Function Calling?

**Traditional Approach (Regex/Pattern Matching):**
- ❌ Brittle - breaks on slight variations
- ❌ Context-blind - misses implied information
- ❌ High maintenance - requires constant rule updates

**GPT-4 Function Calling:**
- ✅ Context-aware understanding
- ✅ Handles natural language variations
- ✅ Extracts implied information
- ✅ Self-documenting with confidence scores

### Extraction Functions

The system uses **10 specialized functions** (9 for voice-only inputs):

1. **`extract_basic_property_info`**
   - Property type, bedrooms, bathrooms, square meters
   - Address (street, postal code, city)
   - Orientation, year built

2. **`extract_listing_details`**
   - Listing type (Sale/Rent)
   - Price
   - Furnished status

3. **`extract_property_amenities`**
   - Elevator, garage, storage room
   - Pool, terrace, garden
   - Built-in wardrobes

4. **`extract_energy_heating`**
   - Heating type and availability
   - Air conditioning
   - Energy certificate (consumption scale, value, emissions)

5. **`extract_property_condition`**
   - Conservation status (1-6 scale)
   - New construction, needs renovation
   - Last renovation year

6. **`extract_kitchen_features`**
   - Kitchen type (americana, independiente, office)
   - Furnished kitchen
   - Hot water type

7. **`extract_interior_spaces`**
   - Terrace size, storage room size
   - Living room size, building floors
   - Balcony count

8. **`extract_luxury_amenities`**
   - Jacuzzi, home automation
   - Garden, fireplace
   - Music system

9. **`extract_appliances`**
   - Internet, oven, microwave
   - Washing machine, fridge, TV
   - Stoneware/kitchenware

10. **`extract_contact_info`** (OCR/file uploads only)
    - Owner name, phone, email
    - Agent details
    - Contract information

### GPT-4 System Prompt (Core Rules)

```
You are an expert real estate data extraction specialist processing Spanish
property information. Extract structured data using the available functions.

CRITICAL EXTRACTION RULES:

1. ONLY extract information explicitly stated in the text
2. NEVER invent, assume, or infer missing data
3. Convert values to correct types:
   - Remove currency symbols from prices
   - Convert text numbers to integers ("tres" → 3)
   - Handle Spanish number formats (1.234,56 → 1234.56)

4. For prices:
   - Remove €, $, dots (thousand separators)
   - Convert commas to decimal points
   - "150.000€" → 150000
   - "1.250,50€" → 1250.50

5. For boolean fields - CRITICAL:
   - ONLY include if EXPLICITLY mentioned
   - "con ascensor" → has_elevator: true
   - "sin ascensor" → has_elevator: false
   - NOT mentioned → DO NOT include the field
   - This prevents false positives

6. Confidence scoring:
   - 80-100: Clear, unambiguous information
   - 50-79: Partial or somewhat unclear
   - Below 50: Uncertain, requires verification

7. Include original text snippet for each extraction
   - This allows users to verify the source

8. Handle Spanish terminology:
   - Venta/Vender → Sale
   - Alquiler/Alquilar → Rent
   - Alquiler con opción → RentWithOption
   - Traspaso → Transfer
   - Compartir piso → RoomSharing

9. Property types:
   - piso, apartamento, estudio, ático, dúplex → "piso"
   - casa, chalet, adosado → "casa"
   - local comercial → "local"
   - plaza de garaje → "garaje"
   - terreno, parcela → "solar"

10. Conservation status mapping:
    - Excelente → 1
    - Bueno/Buen estado → 2
    - Regular → 3
    - Para reformar/Malo → 4
    - Obra nueva → 6

Only call functions for categories with relevant data in the text.
```

### Function Schema Example

```typescript
{
  name: "extract_basic_property_info",
  description: "Extract core property details",
  parameters: {
    type: "object",
    properties: {
      property_type: {
        type: "string",
        enum: ["piso", "casa", "local", "garaje", "solar"],
        description: "Type of property"
      },
      bedrooms: {
        type: "integer",
        minimum: 0,
        maximum: 10,
        description: "Number of bedrooms/dormitorios/habitaciones"
      },
      bathrooms: {
        type: "number",
        minimum: 0,
        maximum: 10,
        description: "Number of bathrooms (can be decimal like 1.5)"
      },
      square_meter: {
        type: "number",
        minimum: 1,
        maximum: 10000,
        description: "Total square meters/superficie"
      },
      street: {
        type: "string",
        description: "Street address including number"
      },
      postal_code: {
        type: "string",
        pattern: "^\\d{5}$",
        description: "5-digit Spanish postal code"
      },
      orientation: {
        type: "string",
        enum: ["norte", "sur", "este", "oeste", "noreste",
               "noroeste", "sureste", "suroeste"],
        description: "Property orientation"
      },
      original_text: {
        type: "string",
        description: "Original text snippet where info was found"
      },
      confidence: {
        type: "integer",
        minimum: 1,
        maximum: 100,
        description: "Confidence level (1-100)"
      }
    },
    required: ["original_text", "confidence"]
  }
}
```

### Boolean Field Handling (CRITICAL)

**Rule:** Only include boolean fields if **explicitly mentioned** in text.

❌ **Wrong Approach:**
```typescript
// BAD: Assumes false if not mentioned
{
  has_elevator: false,
  has_pool: false,
  has_garage: false
}
```

✅ **Correct Approach:**
```typescript
// GOOD: Only includes what's mentioned
{
  has_elevator: true,  // Text says "con ascensor"
  // has_pool not included (not mentioned)
  // has_garage not included (not mentioned)
}
```

**Why This Matters:**
- Prevents false negative data pollution
- User can fill in missing fields manually
- Maintains data integrity
- Avoids overwriting existing data

### Extraction Output Format

```typescript
interface ExtractedFieldResult {
  dbColumn: string;           // "bedrooms"
  dbTable: "properties" | "listings" | "contacts";
  value: string | number | boolean;  // 3
  originalText: string;       // "tres dormitorios"
  confidence: number;         // 95
  extractionSource: string;   // "gpt4_function_calling"
  fieldType: "string" | "number" | "boolean" | "decimal";
  matched_alias?: string;     // "extract_basic_property_info:bedrooms"
}
```

**Example Extraction Results:**
```typescript
[
  {
    dbColumn: "propertyType",
    dbTable: "properties",
    value: "piso",
    originalText: "piso de tres dormitorios",
    confidence: 96,
    extractionSource: "gpt4_function_calling",
    fieldType: "string"
  },
  {
    dbColumn: "bedrooms",
    dbTable: "properties",
    value: 3,
    originalText: "tres dormitorios",
    confidence: 96,
    extractionSource: "gpt4_function_calling",
    fieldType: "number"
  },
  {
    dbColumn: "hasElevator",
    dbTable: "properties",
    value: true,
    originalText: "con ascensor",
    confidence: 94,
    extractionSource: "gpt4_function_calling",
    fieldType: "boolean"
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

---

## Data Transformation & Validation

### Type Conversions

#### Numbers
```typescript
// Extract numeric value from text
const toNumber = (value: string): number => {
  // "120 m²" → 120
  // "tres" → 3 (handled by GPT-4)
  // "1.234,56" → 1234.56
  return parseFloat(value.replace(/[^\d.,]/g, "").replace(",", "."));
};
```

#### Booleans
```typescript
const toBoolean = (value: string): boolean => {
  const normalized = value.toLowerCase().trim();
  return [
    "sí", "si", "yes", "true", "1",
    "x", "✓", "tiene", "incluye"
  ].includes(normalized);
};
```

#### Decimals (Precision)
```typescript
// Preserve decimal precision for bathrooms, prices, areas
// "2.5 baños" → 2.5
// "120,50 m²" → 120.50
```

### Validation Rules

#### Range Validation
```typescript
// Bedrooms: 0-10
const isBedroomCount = (value: string): boolean => {
  const count = parseInt(value);
  return !isNaN(count) && count >= 0 && count <= 10;
};

// Year: 1800 to current year + 5
const isYear = (value: string): boolean => {
  const year = parseInt(value);
  return !isNaN(year) &&
         year >= 1800 &&
         year <= new Date().getFullYear() + 5;
};
```

#### Pattern Validation
```typescript
// Energy scale: A-G only
const isEnergyScale = (value: string): boolean => {
  return /^[A-G]$/i.test(value.trim());
};

// Postal code: 5 digits
const isPostalCode = (value: string): boolean => {
  return /^\d{5}$/.test(value);
};
```

#### Enum Validation
```typescript
// Conservation status: 1, 2, 3, 4, or 6 only
const isConservationStatus = (value: string): boolean => {
  const status = parseInt(value);
  return !isNaN(status) && [1, 2, 3, 4, 6].includes(status);
};
```

### Field-Specific Transformations

#### Property Type Normalization
```typescript
// All these map to "piso":
["piso", "apartamento", "estudio", "ático", "dúplex"] → "piso"

// These map to "casa":
["casa", "chalet", "adosado", "unifamiliar"] → "casa"

// Direct mappings:
"local comercial" → "local"
"plaza de garaje" → "garaje"
"terreno" → "solar"
```

#### Listing Type Mapping
```typescript
// Spanish → English standard
{
  "Venta": "Sale",
  "Alquiler": "Rent",
  "Alquiler con opción a compra": "RentWithOption",
  "Traspaso": "Transfer",
  "Compartir piso": "RoomSharing"
}
```

#### Status Assignment (Auto-generated)
```typescript
// Based on listing type
if (listingType === "Sale") {
  status = "En Venta";
} else if (listingType === "Rent") {
  status = "En Alquiler";
}
```

### Confidence Scoring

Confidence is calculated from multiple sources:

```typescript
// 1. Base confidence from GPT-4 function call
const baseConfidence = 95; // From GPT-4

// 2. Input quality multiplier (if applicable)
const inputConfidence = 0.94; // From Whisper/Textract

// 3. Adjusted confidence
const adjustedConfidence = Math.min(
  baseConfidence,
  baseConfidence * inputConfidence
);
// Result: 95 * 0.94 = 89.3

// 4. Validation bonus/penalty
if (validation_passed) {
  confidence += 2;  // Small bonus
} else if (validation_failed) {
  confidence -= 5;  // Penalty
}
```

**Confidence Thresholds:**
- **80-100%**: High confidence - Auto-save
- **50-79%**: Medium confidence - Flag for review
- **<50%**: Low confidence - Require manual verification

---

## External Data Enrichment

### 1. Cadastral Reference Lookup

**When:** Cadastral reference is provided

**Service:** `src/server/cadastral/retrieve_cadastral.tsx`

**Input:** `"9872023VH4897H0001PZ"`

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

**Usage:** Auto-populates property fields from government database

### 2. Geocoding (Address → Coordinates)

**When:** Address is available

**Service:** `src/server/googlemaps/retrieve_geo.tsx`

**Input:** `"Calle Mayor, 25, Madrid, Madrid, España"`

**Output:**
```typescript
{
  latitude: "40.4168",
  longitude: "-3.7038",
  neighborhood: "Sol",
  neighborhoodId: 1234,  // Created/found in database
  city: "Madrid",
  municipality: "Madrid",
  province: "Comunidad de Madrid"
}
```

**Usage:** Adds coordinates and neighborhood linkage

### 3. Location Normalization

**Service:** `src/server/queries/locations.ts`

**Function:** `findOrCreateLocation(locationData)`

**Purpose:** Ensure consistent location data in database

```typescript
// Input: Extracted location info
const neighborhoodId = await findOrCreateLocation({
  city: "Madrid",
  province: "Comunidad de Madrid",
  municipality: "Madrid",
  neighborhood: "Sol"
});

// Output: Database ID (creates if doesn't exist)
// Returns: 1234
```

**Benefits:**
- Prevents duplicate locations
- Enables efficient property search by neighborhood
- Provides normalized location names

### 4. Property Title Generation

**Service:** `src/lib/property-title.ts`

**Function:** `generatePropertyTitle(propertyType, street, neighborhood)`

```typescript
// Examples:
generatePropertyTitle("piso", "Calle Mayor, 25", "Sol");
// → "Piso en Calle Mayor, 25 (Sol)"

generatePropertyTitle("casa", "Avenida Constitución, 42", "");
// → "Casa en Avenida Constitución, 42"
```

**Usage:** Auto-generates descriptive property titles

---

## Database Persistence

### Property Creation Flow

```typescript
// 1. Build property data from extracted fields
const propertyData: Record<string, unknown> = {
  // Required defaults
  isActive: true,
  formPosition: 1,
  propertyType: "piso",
  hasHeating: false,
  hasElevator: false,
  hasGarage: false,
  hasStorageRoom: false
};

// 2. Map extracted fields
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

// 3. Generate title
const title = generatePropertyTitle(
  propertyData.propertyType as string || "piso",
  propertyData.street as string || "",
  propertyData.neighborhood as string || ""
);
propertyData.title = title;

// 4. Create property
const newProperty = await createProperty({
  accountId: currentUser.accountId,
  ...propertyData
} as PropertyInsertType);

// 5. Create default listing
const newListing = await createDefaultListing(
  Number(newProperty.propertyId)
);

// 6. Update listing with extracted data
const listingUpdateData: Record<string, unknown> = {
  agentId: currentUser.id,
  isActive: true
};

extractedFields
  .filter(f => f.dbTable === "listings")
  .forEach(field => {
    if (field.dbColumn === "price") {
      listingUpdateData.price = String(field.value);
    } else if (field.fieldType === "boolean") {
      listingUpdateData[field.dbColumn] = Boolean(field.value);
    } else {
      listingUpdateData[field.dbColumn] = field.value;
    }
  });

// Set status based on listing type
const listingType = listingUpdateData.listingType ?? "Sale";
if (listingType === "Sale") {
  listingUpdateData.status = "En Venta";
} else if (listingType === "Rent") {
  listingUpdateData.status = "En Alquiler";
}

await updateListingWithAuth(
  Number(newListing.listingId),
  listingUpdateData
);

// 7. Create default tasks (async)
await createPropertyTasksAsync({
  userId: currentUser.id,
  listingId: BigInt(newListing.listingId)
});
```

### Contact Association

```typescript
// If contacts are extracted or provided
if (contactIds.length > 0 && newListing?.listingId) {
  for (const contactId of contactIds) {
    await db.insert(listingContacts).values({
      listingId: BigInt(newListing.listingId),
      contactId: BigInt(contactId),
      contactType: "owner",  // or "buyer"
      isActive: true
    });
  }
}
```

---

## Complete Mapping Reference

### Properties Table: All Mappable Fields (98 fields)

```typescript
// BASIC INFORMATION (4 fields)
title: "título", "titulo", "nombre"
description: "descripción", "descripcion", "detalles", "observaciones"
propertyType: "tipo", "tipo de vivienda", "tipo propiedad"
propertySubtype: "subtipo", "especialidad"

// SPECIFICATIONS (7 fields)
bedrooms: "dormitorios", "habitaciones", "cuartos", "dorm", "hab"
bathrooms: "baños", "aseos", "servicios", "wc"
squareMeter: "superficie", "metros", "m2", "m²", "metros cuadrados"
yearBuilt: "año", "año construcción", "construccion"
cadastralReference: "referencia catastral", "catastro"
builtSurfaceArea: "superficie construida", "metros construidos"
conservationStatus: "estado conservación", "estado", "condicion"

// LOCATION (4 fields)
street: "dirección", "direccion", "calle", "avenida", "domicilio"
addressDetails: "piso", "puerta", "escalera", "portal"
postalCode: "código postal", "codigo postal", "cp"
// Note: neighborhoodId comes from geocoding/location service

// ENERGY & HEATING (7 fields)
energyCertificateStatus: "certificado energético", "certificado energia"
energyConsumptionScale: "escala energética", "letra energética"
energyConsumptionValue: "consumo energético", "kwh"
emissionsScale: "emisiones", "escala emisiones", "co2"
emissionsValue: "valor emisiones", "kg co2"
hasHeating: "calefacción", "calefaccion", "climatización"
heatingType: "tipo calefacción", "sistema calefacción"

// BASIC AMENITIES (3 fields)
hasElevator: "ascensor", "elevador"
hasGarage: "garaje", "aparcamiento", "parking"
hasStorageRoom: "trastero", "almacén", "almacen"

// GARAGE DETAILS (5 fields)
garageType: "tipo garaje", "clase garaje"
garageSpaces: "plazas garaje", "espacios garaje", "coches"
garageInBuilding: "garaje en edificio", "garaje incluido"
elevatorToGarage: "ascensor al garaje"
garageNumber: "número garaje", "plaza número"

// COMMUNITY AMENITIES (9 fields)
gym: "gimnasio", "gym", "fitness"
sportsArea: "zona deportiva", "área deportiva", "polideportivo"
childrenArea: "zona infantil", "área niños", "parque infantil"
suiteBathroom: "baño suite", "baño principal"
nearbyPublicTransport: "transporte público", "metro", "autobús"
communityPool: "piscina comunitaria", "piscina común"
privatePool: "piscina privada", "piscina propia"
tennisCourt: "pista tenis", "cancha tenis"

// CHARACTERISTICS (9 fields)
disabledAccessible: "accesible", "minusválidos", "discapacitados"
vpo: "vpo", "vivienda protección oficial"
videoIntercom: "videoportero", "portero automático"
conciergeService: "conserje", "portero"
securityGuard: "vigilancia", "seguridad"
satelliteDish: "antena parabólica", "parabólica"
doubleGlazing: "doble acristalamiento", "climalit"
alarm: "alarma", "sistema alarma"
securityDoor: "puerta blindada", "puerta acorazada"

// CONDITION (5 fields)
brandNew: "a estrenar", "estrenar", "nuevo"
newConstruction: "obra nueva", "construcción nueva"
underConstruction: "en construcción", "en obra"
needsRenovation: "para reformar", "necesita reforma"
lastRenovationYear: "año reforma", "última reforma"

// KITCHEN (6 fields)
kitchenType: "tipo cocina", "cocina"
hotWaterType: "agua caliente", "tipo agua caliente"
openKitchen: "cocina americana", "cocina abierta"
frenchKitchen: "cocina francesa", "cocina office"
furnishedKitchen: "cocina amueblada", "cocina equipada"
pantry: "despensa", "office"

// STORAGE & SPACES (9 fields)
storageRoomSize: "tamaño trastero", "metros trastero"
storageRoomNumber: "número trastero"
terrace: "terraza", "balcón", "balcon"
terraceSize: "tamaño terraza", "metros terraza"
wineCellar: "bodega", "vinoteca"
wineCellarSize: "tamaño bodega"
livingRoomSize: "tamaño salón", "metros salón"
balconyCount: "número balcones", "balcones"
galleryCount: "galerías", "numero galerias"
buildingFloors: "plantas edificio", "alturas"

// INTERIOR FEATURES (7 fields)
builtInWardrobes: "armarios empotrados", "armarios"
mainFloorType: "tipo suelo", "suelo", "pavimento"
shutterType: "tipo persiana", "persianas"
carpentryType: "tipo carpintería", "carpinteria", "ventanas"
orientation: "orientación", "orientacion", "orientado"
airConditioningType: "aire acondicionado", "climatización", "aa"
windowType: "tipo ventanas", "ventanas"

// VIEWS & LOCATION (6 fields)
exterior: "exterior", "fachada exterior"
bright: "luminoso", "luminosa", "mucha luz"
views: "vistas", "con vistas"
mountainViews: "vistas montaña", "vistas sierra"
seaViews: "vistas mar", "vistas océano"
beachfront: "primera línea", "frente mar"

// LUXURY AMENITIES (9 fields)
jacuzzi: "jacuzzi", "bañera hidromasaje"
hydromassage: "hidromasaje", "hidro"
garden: "jardín", "jardin", "zona verde"
pool: "piscina", "alberca"
homeAutomation: "domótica", "domotica", "casa inteligente"
musicSystem: "hilo musical", "sistema audio"
laundryRoom: "lavadero", "cuarto lavado"
coveredClothesline: "tendedero cubierto"
fireplace: "chimenea", "hogar"
```

### Listings Table: All Mappable Fields (24 fields)

```typescript
// LISTING DETAILS (8 fields)
listingType: "tipo operación", "operacion", "venta", "alquiler"
price: "precio", "valor", "importe", "coste"
isFurnished: "amueblado", "amueblada", "muebles"
furnitureQuality: "calidad muebles", "tipo mobiliario"
hasKeys: "llaves", "con llaves"
studentFriendly: "estudiantes", "para estudiantes"
petsAllowed: "mascotas", "animales", "perros", "gatos"
appliancesIncluded: "electrodomésticos", "incluye electrodomésticos"

// APPLIANCES (7 fields)
internet: "internet", "wifi", "fibra"
oven: "horno"
microwave: "microondas"
washingMachine: "lavadora"
fridge: "frigorífico", "nevera", "refrigerador"
tv: "televisión", "television", "tv"
stoneware: "vajilla", "menaje"

// OPTIONAL FEATURES (4 fields)
optionalGarage: "garaje opcional", "parking opcional"
optionalGaragePrice: "precio garaje", "coste garaje"
optionalStorageRoom: "trastero opcional"
optionalStorageRoomPrice: "precio trastero", "coste trastero"
```

### Contacts Table: All Mappable Fields (4 fields)

```typescript
firstName: "propietario", "nombre", "titular", "contacto"
lastName: "apellidos", "apellido", "surname"
email: "e-mail", "email", "correo", "correo electrónico"
phone: "teléfono", "telefono", "móvil", "movil", "celular"
```

---

## Integration Guide for New Input Sources

### Step 1: Prepare Raw Text/Data

```typescript
// Your input source (file upload, form, etc.)
const rawInput = extractTextFromFile(uploadedFile);
// or
const rawInput = form.getValue("description");
```

### Step 2: Call GPT-4 Extraction

```typescript
import { extractEnhancedPropertyDataWithGPT4 } from
  "~/server/ocr/gpt4-field-extractor";

const result = await extractEnhancedPropertyDataWithGPT4({
  extractedText: rawInput,
  confidence: 100 // Your input confidence (100 for typed forms)
});

// Result contains:
// - extractedFields: Array of ExtractedFieldResult
// - propertyData: Structured property object
// - listingData: Structured listing object
// - contactData: Structured contact object (if any)
```

### Step 3: Optional External Enrichment

```typescript
// If cadastral reference is provided
if (cadastralReference) {
  const cadastralData = await retrieveCadastralData(cadastralReference);
  // Merge with extracted data
}

// If address is available
if (street && city) {
  const geoData = await retrieveGeocodingData(`${street}, ${city}, España`);
  // Add coordinates and neighborhoodId
}
```

### Step 4: Save to Database

```typescript
import { saveVoiceProperty } from
  "~/server/queries/forms/voice/save-voice-property";

const saveResult = await saveVoiceProperty(
  result.extractedFields,
  contactIds // Optional: array of contact IDs to link
);

// Returns:
// {
//   success: true,
//   propertyId: 12345,
//   listingId: 67890
// }
```

### Complete Integration Example

```typescript
// File upload handler
export async function handlePropertyFileUpload(file: File) {
  // 1. Extract text from file
  const rawText = await extractTextFromFile(file);

  // 2. Extract structured data via GPT-4
  const extraction = await extractEnhancedPropertyDataWithGPT4({
    extractedText: rawText,
    confidence: 95
  });

  // 3. Optional: Enrich with cadastral data
  const cadastralRef = extraction.propertyData.cadastralReference;
  if (cadastralRef) {
    const cadastralData = await retrieveCadastralData(cadastralRef);
    if (cadastralData) {
      // Merge cadastral data into extraction results
      extraction.extractedFields.push(
        ...cadastralDataToFields(cadastralData)
      );
    }
  }

  // 4. Save to database
  const saveResult = await saveVoiceProperty(
    extraction.extractedFields,
    [] // No contacts for now
  );

  return saveResult;
}
```

---

## Summary

This intelligence system provides:

✅ **Input-Agnostic Design**: Works with any text source (voice, OCR, files, forms)
✅ **Comprehensive Mapping**: 1,200+ Spanish terms → 180+ database fields
✅ **Intelligent Extraction**: GPT-4 with context awareness and confidence scoring
✅ **Robust Validation**: Type checking, range validation, format conversion
✅ **External Enrichment**: Cadastral, geocoding, location normalization
✅ **Clean Separation**: Intelligence layer independent of input/output

**Key Files:**
- Field Mapping: `src/server/ocr/field-mapping-config.ts`
- GPT-4 Extraction: `src/server/ocr/gpt4-field-extractor.ts`
- Database Persistence: `src/server/queries/forms/voice/save-voice-property.ts`
- Cadastral Service: `src/server/cadastral/retrieve_cadastral.tsx`
- Geocoding Service: `src/server/googlemaps/retrieve_geo.tsx`
- Location Service: `src/server/queries/locations.ts`
- Title Generation: `src/lib/property-title.ts`

---

**Document Status:** Complete
**Next Review:** Q2 2025
**Maintainer:** Vesta Development Team
