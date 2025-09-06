# Dynamic Cartel Database Integration Guide - Incremental Approach

## Problem Statement & Process Flow

Currently, the cartel editor system uses mock data from `getExtendedDefaultPropertyData()` which creates fake property information for template previews and PDF generation. 

**🚀 INCREMENTAL STRATEGY**: We will implement database integration step by step, starting with individual fields and testing each one before moving to the next. This allows for safe, controlled migration without breaking existing functionality.

## Phase 1: Start with Single Field - `listingType`

### Step 1.1: First Field Integration - Tipo de Listado
Our first target is the **"Tipo de Listado"** select field (lines 296-311 in cartel-editor-client.tsx):
- Currently hardcoded with manual selection between "venta"/"alquiler"
- Will be dynamized to fetch from `listings.listingType` database field
- Both database and hardcoded values will coexist during testing phase

### Step 1.2: Test & Validate
After implementing `listingType` integration:
1. ✅ Verify database value loads correctly
2. ✅ Test fallback to hardcoded when DB unavailable  
3. ✅ Confirm PDF generation works with database value
4. ✅ UI shows clear indication of data source (DB vs hardcoded)

### Step 1.3: Then Continue Incrementally
Once `listingType` is stable, proceed field by field:
- Next: `propertyType` 
- Then: Basic property data (title, price, bedrooms, etc.)
- Finally: Complex data structures and full integration

## The Target Process (Eventually):

```
[Database] → [Server Component] → [cartel-editor-client.tsx] → [EDITABLE Dynamic Template] → [Static Template] → [PDF]
                                           ↓                           ↓                        ↓
                                    [User Can Edit Data]        [Live Preview]         [Generate PDF]
```

### Key Requirements (Final Goal):

1. **cartel-editor-client.tsx receives dynamic data** from a server component (from listings table, properties table, etc.)
2. **User can edit that dynamic data** within the cartel editor interface 
3. **Dynamic template shows in live preview** with user's edits in real-time
4. **From that dynamic template, create a static component** that captures the final edited data
5. **Static component is used for PDF generation** via Puppeteer

## Benefits of Incremental Approach

✅ **Risk Mitigation**: Test each change thoroughly before proceeding  
✅ **No Breaking Changes**: Existing functionality always preserved  
✅ **Easy Rollback**: Can revert individual features if issues arise  
✅ **Clear Progress**: Tangible progress with each field integrated  
✅ **Debugging Simplicity**: Isolate issues to specific components  
✅ **Team Confidence**: Build trust through small, successful deployments

## Current System Architecture Analysis

### How It Works Now (Mock Data)

```
[cartel-editor-client.tsx] → getExtendedDefaultPropertyData() → [ClassicTemplate] → [PDF Generation]
                                      ↓                              ↓                    ↓
                                 [Mock Data]                 [Live Preview]        [Static PDF]
```

**Current Flow:**
1. **cartel-editor-client.tsx** calls `getExtendedDefaultPropertyData("piso")` in line 77-79
2. This generates fake data that matches `ExtendedTemplatePropertyData` interface
3. User can edit this mock data via the form inputs (lines 447-570)
4. Editor passes edited data to `ClassicTemplate` for live preview (line 806-813)
5. For PDF generation:
   - Editor sends edited data + config to `/api/puppet/generate-pdf` (line 156-159)
   - Puppeteer calls `/templates?config=JSON&data=JSON` 
   - Template page renders with the same edited data
   - PDF is generated

### What We Need (Real Database Data)

```
[Database] → [Server Component] → [cartel-editor-client.tsx] → [User Edits Data] → [ClassicTemplate] → [PDF Generation]
                                            ↓                          ↓                    ↓                    ↓
                                    [Real Property Data]        [Modified Data]      [Live Preview]      [Static PDF]
```

**Target Flow:**
1. **Server Component** fetches real property data from database (properties + listings tables)
2. **cartel-editor-client.tsx** receives real data as props instead of calling `getExtendedDefaultPropertyData()`
3. User can edit this real data via the existing form inputs (same UI, different data source)
4. Editor passes user-modified data to `ClassicTemplate` for live preview (same as current)
5. For PDF generation: Create a static snapshot of the current edited data and use that for PDF

### Current Code Structure

**Mock Data Generation (`src/lib/carteleria/mock-data.ts`):**
```typescript
export const getExtendedDefaultPropertyData = (
  propertyType: "piso" | "casa" | "local" | "garaje" | "solar" = "piso",
): ExtendedTemplatePropertyData => {
  const baseData = getDefaultPropertyData(propertyType);
  const extendedFields = extendedPropertyFields[propertyType];
  return {
    ...baseData,
    ...extendedFields,
  };
};
```

**Current Editor Usage:**
```typescript
// In cartel-editor-client.tsx
const [propertyData, setPropertyData] = useState<ExtendedTemplatePropertyData>(() =>
  getExtendedDefaultPropertyData("piso"),
);
```

**PDF Generation Flow:**
```typescript
// /api/puppet/generate-pdf/route.ts
const templateUrl = new URL("/templates", baseUrl);
templateUrl.searchParams.set("config", JSON.stringify(templateConfig));
templateUrl.searchParams.set("data", JSON.stringify(propertyData));
```

## Database Schema Understanding

### Current Database Property Structure

From `src/lib/data.ts`, we have:

```typescript
export type Property = {
  propertyId: bigint;
  referenceNumber: string;
  title?: string;
  description?: string;
  propertyType: string;
  price?: string;                    // Note: STRING in DB
  bedrooms?: number;
  bathrooms?: string;               // Note: STRING in DB  
  squareMeter?: number;
  yearBuilt?: number;
  street?: string;
  addressDetails?: string;
  postalCode?: string;
  neighborhoodId?: bigint;
  latitude?: string;
  longitude?: string;
  // ... many more fields
};

export type PropertyImage = {
  propertyImageId: bigint;
  propertyId: bigint;
  imageUrl: string;
  imageOrder: number;
  isActive: boolean;
  // ... more fields
};
```

### Template Data Structure

What the template expects (`ExtendedTemplatePropertyData`):

```typescript
interface ExtendedTemplatePropertyData {
  id: string;
  title: string;
  price: number;                    // Note: NUMBER in template
  location: {
    neighborhood: string;
    city: string;
  };
  specs: {
    bedrooms?: number;
    bathrooms?: number;            // Note: NUMBER in template
    squareMeters: number;
  };
  images: string[];               // Array of image URLs
  contact: {
    phone: string;
    email?: string;
    website?: string;
  };
  reference?: string;
  propertyType: "piso" | "casa" | "local" | "garaje" | "solar";
  // Extended fields
  energyConsumptionScale?: string;
  yearBuilt?: number;
  hasElevator?: boolean;
  // ... more extended fields
}
```

## Phase 1 Implementation: Start with `listingType` Only

### Step 1: Minimal Infrastructure for Single Field

Instead of building the full data conversion system, we start with the minimum needed for `listingType`:

**Current State (lines 296-311 in cartel-editor-client.tsx):**
```typescript
<Label htmlFor="listingType">Tipo de Listado</Label>
<Select
  value={config.listingType}  // Currently "venta" | "alquiler"
  onValueChange={(value: "venta" | "alquiler") =>
    updateConfig({ listingType: value })
  }
>
  <SelectContent>
    <SelectItem value="venta">Venta</SelectItem>
    <SelectItem value="alquiler">Alquiler</SelectItem>
  </SelectContent>
</Select>
```

**Target State (Phase 1):**
```typescript
<Label htmlFor="listingType">
  Tipo de Listado 
  {databaseListingType && (
    <Badge variant="secondary" className="ml-2">
      Desde DB
    </Badge>
  )}
</Label>
<Select
  value={config.listingType}
  onValueChange={(value: "venta" | "alquiler") =>
    updateConfig({ listingType: value })
  }
  disabled={!!databaseListingType} // Disabled when from database
>
  <SelectContent>
    <SelectItem value="venta">Venta</SelectItem>
    <SelectItem value="alquiler">Alquiler</SelectItem>
  </SelectContent>
</Select>
{databaseListingType && (
  <p className="text-sm text-muted-foreground mt-1">
    Valor cargado desde base de datos. No editable.
  </p>
)}
```

### Phase 1 Implementation Plan

#### Step 1.1: Update CartelEditorClient Props
```typescript
interface CartelEditorClientProps {
  listingId: string;
  images?: PropertyImage[];
  databaseListingType?: "Sale" | "Rent"; // NEW: Single field from DB
}
```

#### Step 1.2: Add Database Value Mapping
```typescript
// In CartelEditorClient component
const mapDatabaseListingType = (dbType?: "Sale" | "Rent"): "venta" | "alquiler" | null => {
  if (!dbType) return null;
  return dbType === "Sale" ? "venta" : "alquiler";
};

// Initialize config with database value if available
const [config, setConfig] = useState<TemplateConfiguration>(() => {
  const mappedListingType = mapDatabaseListingType(databaseListingType);
  return {
    templateStyle: "classic",
    orientation: "vertical",
    propertyType: "piso",
    listingType: mappedListingType || "venta", // Use DB value or fallback
    // ... rest of config
  };
});
```

#### Step 1.3: Create Minimal Server Component
```typescript
// src/components/propiedades/detail/cartel/cartel-editor-phase1.tsx
import { CartelEditorClient } from "./cartel-editor-client";
import { getListingCartelData } from "~/server/queries/listing";

interface CartelEditorPhase1Props {
  listingId: string;
  images?: PropertyImage[];
}

export async function CartelEditorPhase1({ listingId, images }: CartelEditorPhase1Props) {
  let databaseListingType: "Sale" | "Rent" | undefined;
  
  try {
    const cartelData = await getListingCartelData(parseInt(listingId));
    databaseListingType = cartelData.listingType;
    console.log("✅ Loaded listingType from database:", databaseListingType);
  } catch (error) {
    console.error("❌ Failed to load listingType from database:", error);
    // Fall back to hardcoded - no databaseListingType passed
  }

  return (
    <CartelEditorClient
      listingId={listingId}
      images={images}
      databaseListingType={databaseListingType}
    />
  );
}
```

### Phase 1 Validation Checklist

After implementing Phase 1:
1. ✅ Field shows "Desde DB" badge when database value loaded
2. ✅ Field becomes disabled/non-editable when database value present  
3. ✅ Field remains editable when database unavailable (fallback)
4. ✅ PDF generation works with database-sourced listingType
5. ✅ Clear visual indication of data source
6. ✅ No breaking changes to existing functionality

### Future Phases (After Phase 1 Success)

#### Phase 2: Add `propertyType`
- Same pattern as Phase 1
- Test independently 
- Validate before proceeding

#### Phase 3: Basic Property Data
- title, price, bedrooms, bathrooms
- Incremental field-by-field approach

#### Phase 4: Full Integration  
- Complete data structures
- Full server component
- Complete database integration

### Recommended Solution (Final Goal): Database → Editable Dynamic Template → Static PDF

### Full Architecture (Eventually):

```
[Database] → [Server Component] → [cartel-editor-client.tsx] → [EDITABLE Dynamic Template] → [Static Template] → [PDF]
                                           ↓                           ↓                        ↓
                                    [User Can Edit Data]        [Live Preview]         [Generate PDF]
```

#### Step 1: Create Database-to-Template Data Converter

**New File: `src/lib/carteleria/property-data-converter.ts`**

```typescript
import { db } from "~/server/db";
import { properties, propertyImages, neighborhoods } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import type { ExtendedTemplatePropertyData } from "~/types/template-data";
import type { Property, PropertyImage } from "~/lib/data";

/**
 * Converts database property data to template-ready format
 */
export async function convertPropertyToTemplateData(
  propertyId: string
): Promise<ExtendedTemplatePropertyData> {
  
  // 1. Fetch property from database
  const property = await db
    .select()
    .from(properties)
    .where(eq(properties.propertyId, BigInt(propertyId)))
    .limit(1);

  if (!property[0]) {
    throw new Error(`Property ${propertyId} not found`);
  }

  // 2. Fetch property images
  const images = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, BigInt(propertyId)))
    .orderBy(propertyImages.imageOrder);

  // 3. Fetch neighborhood/location data
  let locationData = { neighborhood: "", city: "" };
  if (property[0].neighborhoodId) {
    const neighborhood = await db
      .select()
      .from(neighborhoods)
      .where(eq(neighborhoods.neighborhoodId, property[0].neighborhoodId))
      .limit(1);
    
    if (neighborhood[0]) {
      locationData = {
        neighborhood: neighborhood[0].neighborhood,
        city: neighborhood[0].city,
      };
    }
  }

  // 4. Transform data with type conversions and defaults
  const templateData: ExtendedTemplatePropertyData = {
    id: property[0].propertyId.toString(),
    title: property[0].title || `${property[0].propertyType} en venta`,
    price: parseFloat(property[0].price || "0"), // STRING → NUMBER
    location: locationData,
    specs: {
      bedrooms: property[0].bedrooms || undefined,
      bathrooms: parseInt(property[0].bathrooms || "0") || undefined, // STRING → NUMBER
      squareMeters: property[0].squareMeter || 0,
    },
    images: images.filter(img => img.isActive).map(img => img.imageUrl),
    contact: {
      phone: "987 654 321", // TODO: Get from account settings
      email: "contacto@inmobiliaria-acropolis.com", // TODO: Get from account settings
      website: "www.inmobiliaria-acropolis.com", // TODO: Get from account settings
    },
    reference: property[0].referenceNumber,
    propertyType: property[0].propertyType as "piso" | "casa" | "local" | "garaje" | "solar",
    
    // Extended fields - map from database
    energyConsumptionScale: property[0].energyRating || undefined,
    yearBuilt: property[0].yearBuilt || undefined,
    hasElevator: property[0].hasElevator || false,
    hasGarage: property[0].hasGarage || false,
    // Add more field mappings as needed...
    
    // Image positioning (empty initially, user can customize)
    imagePositions: {},
  };

  return templateData;
}

/**
 * Fallback to mock data if database fetch fails
 */
export function getFallbackTemplateData(propertyType: string): ExtendedTemplatePropertyData {
  // Import the existing mock data function as fallback
  return getExtendedDefaultPropertyData(propertyType as any);
}
```

#### Step 2: Update Cartel Editor Client to Accept Real Data

**Your cartel-editor-client.tsx currently does this (lines 75-79):**
```typescript
// CURRENT: Uses mock data
const [propertyData, setPropertyData] = useState<ExtendedTemplatePropertyData>(() =>
  getExtendedDefaultPropertyData("piso"),
);
```

**We need to change it to this:**
```typescript
interface CartelEditorClientProps {
  listingId: string;
  images?: PropertyImage[];
  initialPropertyData?: ExtendedTemplatePropertyData; // NEW: Real data from server
}

export function CartelEditorClient({ 
  listingId, 
  images = [],
  initialPropertyData, // NEW PROP: Real database data
}: CartelEditorClientProps) {
  
  // MODIFIED: Use real data or fallback to mock data
  const [propertyData, setPropertyData] = useState<ExtendedTemplatePropertyData>(() => {
    if (initialPropertyData) {
      console.log("✅ Using real property data:", initialPropertyData.id);
      return initialPropertyData; // Real database data
    }
    console.log("⚠️ Fallback to mock data");
    return getExtendedDefaultPropertyData("piso"); // Fallback to mock
  });

  // Everything else stays EXACTLY the same:
  // - User editing forms (lines 447-570) ✅
  // - Live preview (line 806-813) ✅ 
  // - PDF generation (line 156-159) ✅
}
```

**Key Points:**
- ✅ User can still edit the data via existing forms
- ✅ Live preview still works with ClassicTemplate
- ✅ PDF generation still works the same way
- ✅ Only difference: data starts as real instead of mock

#### Step 3: Create Server Wrapper Component

**New File: `src/components/propiedades/detail/cartel/cartel-editor.tsx`**

```typescript
import { Suspense } from "react";
import { CartelEditorClient } from "./cartel-editor-client";
import { convertPropertyToTemplateData, getFallbackTemplateData } from "~/lib/carteleria/property-data-converter";
import type { PropertyImage } from "~/lib/data";

interface CartelEditorProps {
  propertyId: string;
  listingId: string;
  images?: PropertyImage[];
}

/**
 * Server component that fetches real property data and passes to client editor
 */
async function CartelEditorServer({ propertyId, listingId, images }: CartelEditorProps) {
  let propertyData;
  
  try {
    // Fetch real property data from database
    propertyData = await convertPropertyToTemplateData(propertyId);
    console.log("✅ Loaded real property data for cartel editor:", propertyId);
  } catch (error) {
    console.error("❌ Failed to load property data, using fallback:", error);
    // Fallback to mock data if database fetch fails
    propertyData = getFallbackTemplateData("piso");
  }

  return (
    <CartelEditorClient 
      listingId={listingId}
      images={images}
      initialPropertyData={propertyData}
    />
  );
}

/**
 * Wrapper with loading state
 */
export function CartelEditor(props: CartelEditorProps) {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando editor de carteles...</p>
          </div>
        </div>
      }
    >
      <CartelEditorServer {...props} />
    </Suspense>
  );
}
```

#### Step 4: Create Static Template Component for PDF Generation

**The Key Innovation: Static Template from Dynamic Data**

Your requirement is that the PDF should be generated from a **static component** that captures the final edited data. Here's how:

**Current PDF Generation (line 156-159 in cartel-editor-client.tsx):**
```typescript
// CURRENT: Sends dynamic data directly to PDF API
const response = await fetch("/api/puppet/generate-pdf", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    templateConfig: config,
    propertyData: propertyData, // This is the edited data from the editor
  }),
});
```

**New Approach: Create Static Snapshot Component**

**New File: `src/components/cartel/static-cartel-snapshot.tsx`**
```typescript
import { ClassicTemplate } from "~/components/admin/carteleria/templates/classic/classic-vertical-template";
import type { ExtendedTemplatePropertyData, TemplateConfiguration } from "~/types/template-data";

interface StaticCartelSnapshotProps {
  data: ExtendedTemplatePropertyData;
  config: TemplateConfiguration;
}

/**
 * Static component that captures the final edited data for PDF generation
 * This is the "frozen" version of what the user created in the dynamic editor
 */
export function StaticCartelSnapshot({ data, config }: StaticCartelSnapshotProps) {
  return (
    <div className="static-cartel-snapshot">
      <ClassicTemplate 
        data={data}           // Final edited data
        config={config}       // Final configuration
        // NO interactive props - this is static
      />
    </div>
  );
}
```

**Updated PDF Generation Flow:**
```typescript
// In cartel-editor-client.tsx - MODIFIED generatePDF function
const generatePDF = async () => {
  setIsGenerating(true);
  try {
    // Create a static snapshot of current edited data
    const staticSnapshot = {
      data: propertyData,    // Current edited data
      config: config,        // Current configuration
    };

    console.log("🚀 Creating static snapshot for PDF:", staticSnapshot);

    const response = await fetch("/api/puppet/generate-pdf", {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateConfig: config,
        propertyData: propertyData,
        staticSnapshot: true,  // Flag to use static rendering
      }),
    });

    // Rest stays the same...
  } catch (error) {
    // Error handling...
  } finally {
    setIsGenerating(false);
  }
};
```

#### Step 5: Update PDF Generation API for Static Templates

**Modified: `src/app/templates/page.tsx`**

Add support for loading data from database if `propertyId` is provided:

```typescript
interface TemplatesPageProps {
  searchParams: Promise<{
    config?: string;
    data?: string;
    propertyId?: string; // NEW: Support propertyId param
  }>;
}

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  let config: TemplateConfiguration;
  let data: ExtendedTemplatePropertyData;

  const params = await searchParams;

  try {
    // NEW: If propertyId is provided, fetch from database
    if (params.propertyId) {
      console.log("🔄 Templates page: Loading property data from database:", params.propertyId);
      
      data = await convertPropertyToTemplateData(params.propertyId);
      
      // Use config from params or default config
      if (params.config) {
        config = JSON.parse(params.config) as TemplateConfiguration;
      } else {
        config = getDefaultConfig(); // Create a default config function
      }
      
      console.log("✅ Templates page: Loaded real property data for PDF generation");
    }
    // EXISTING: Handle JSON config/data params (backward compatibility)
    else if (params.config && params.data) {
      config = JSON.parse(params.config) as TemplateConfiguration;
      data = JSON.parse(params.data) as ExtendedTemplatePropertyData;
      console.log("✅ Templates page: Using passed JSON data");
    } 
    // FALLBACK: Default mock data
    else {
      data = getExtendedDefaultPropertyData("piso");
      config = getDefaultConfig();
      console.log("⚠️ Templates page: Using fallback mock data");
    }
  } catch (error) {
    console.error("❌ Templates page error:", error);
    // Fallback to default on any error
    data = getExtendedDefaultPropertyData("piso");
    config = getDefaultConfig();
  }

  return (
    <div style={{ margin: 0, padding: 0, backgroundColor: "white" }}>
      <ClassicTemplate data={data} config={config} />
      {/* Existing script for templateReady signal... */}
    </div>
  );
}
```

#### Step 5: Update PDF Generation API to Support PropertyId

**Modified: `src/app/api/puppet/generate-pdf/route.ts`**

Add support for `propertyId` parameter:

```typescript
export async function POST(request: NextRequest) {
  try {
    const { templateConfig, propertyData, propertyId } = (await request.json()) as {
      templateConfig: TemplateConfiguration;
      propertyData?: unknown;
      propertyId?: string; // NEW: Support propertyId
    };

    // Build the template URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const templateUrl = new URL("/templates", baseUrl);

    // NEW: Support both propertyId and direct data passing
    if (propertyId) {
      // Use propertyId - templates page will fetch from database
      templateUrl.searchParams.set("propertyId", propertyId);
      templateUrl.searchParams.set("config", JSON.stringify(templateConfig));
      console.log("📄 PDF Generation: Using propertyId:", propertyId);
    } else if (propertyData) {
      // Existing flow - pass data directly
      templateUrl.searchParams.set("config", JSON.stringify(templateConfig));
      templateUrl.searchParams.set("data", JSON.stringify(propertyData));
      console.log("📄 PDF Generation: Using passed data");
    } else {
      throw new Error("Either propertyId or propertyData must be provided");
    }

    // Rest of the PDF generation logic stays the same...
    const response = await page.goto(templateUrl.toString(), {
      waitUntil: "networkidle0",
      timeout: 30000,
    });
    
    // ... existing PDF generation code
  } catch (error) {
    // ... existing error handling
  }
}
```

#### Step 6: Update Cartel Editor to Use Real Property ID

**Modified: `src/components/propiedades/detail/cartel/cartel-editor-client.tsx`**

Update the PDF generation call to use propertyId when available:

```typescript
export function CartelEditorClient({ 
  listingId, 
  images = [],
  initialPropertyData,
  propertyId, // NEW: Add propertyId prop
}: CartelEditorClientProps) {

  // Generate PDF using property ID (preferred) or property data (fallback)
  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      console.log("🚀 Starting PDF generation...");

      const requestBody: any = {
        templateConfig: config,
      };

      // NEW: Use propertyId if available, otherwise fall back to data
      if (propertyId) {
        requestBody.propertyId = propertyId;
        console.log("📄 Using propertyId for PDF generation:", propertyId);
      } else {
        requestBody.propertyData = propertyData;
        console.log("📄 Using property data for PDF generation");
      }

      const response = await fetch("/api/puppet/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // ... rest of PDF generation logic stays the same
    } catch (error) {
      // ... existing error handling
    } finally {
      setIsGenerating(false);
    }
  };

  // ... rest of component stays the same
}
```

## Integration Examples

### Example 1: Property Detail Page Integration

**Property detail page: `src/app/propiedades/[id]/page.tsx`**

```typescript
import { CartelEditor } from "~/components/propiedades/detail/cartel/cartel-editor";

export default async function PropertyDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id: propertyId } = await params;
  
  // Fetch property images (existing logic)
  const images = await getPropertyImages(propertyId);
  
  return (
    <div className="container mx-auto p-6">
      {/* Existing property detail content */}
      
      {/* NEW: Cartel Editor with real data */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Editor de Carteles</h2>
        <CartelEditor 
          propertyId={propertyId}
          listingId={propertyId} // or get actual listing ID
          images={images}
        />
      </div>
    </div>
  );
}
```

### Example 2: Database Field Mapping

```typescript
// Example of mapping specific database fields to template format
export function mapPropertyFieldsToTemplate(property: Property): Partial<ExtendedTemplatePropertyData> {
  return {
    // Basic mappings
    title: property.title || `${property.propertyType} en ${property.operationType || 'venta'}`,
    price: parseFloat(property.price || "0"),
    
    // Type conversions
    specs: {
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms ? parseInt(property.bathrooms) : undefined,
      squareMeters: property.squareMeter || 0,
    },
    
    // Extended field mappings
    energyConsumptionScale: property.energyRating,
    yearBuilt: property.yearBuilt,
    hasElevator: Boolean(property.hasElevator),
    hasGarage: Boolean(property.hasGarage),
    conservationStatus: property.conservationState,
    heatingType: property.heatingSystem,
    orientation: property.orientation,
    
    // Location handling
    location: {
      neighborhood: property.neighborhood?.neighborhood || "",
      city: property.neighborhood?.city || "",
    },
  };
}
```

### Example 3: Error Handling and Fallbacks

```typescript
export async function safeConvertPropertyToTemplateData(
  propertyId: string
): Promise<ExtendedTemplatePropertyData> {
  try {
    // Try to load from database
    return await convertPropertyToTemplateData(propertyId);
  } catch (error) {
    console.error("Failed to load property data, using fallback:", error);
    
    // Return sensible defaults
    return {
      id: propertyId,
      title: "Propiedad en venta",
      price: 0,
      location: { neighborhood: "", city: "" },
      specs: { squareMeters: 0 },
      images: [],
      contact: {
        phone: "987 654 321",
        email: "contacto@inmobiliaria-acropolis.com",
        website: "www.inmobiliaria-acropolis.com",
      },
      reference: `VESTA-${propertyId}`,
      propertyType: "piso",
      imagePositions: {},
    };
  }
}
```

## Incremental Migration Strategy

### 🚀 Phase 1: Single Field - `listingType` (CURRENT FOCUS)
1. ✅ Create minimal server query: `getListingCartelData()`
2. ✅ Update CartelEditorClient to accept `databaseListingType` prop
3. ✅ Modify "Tipo de Listado" select with database integration
4. ✅ Add visual indicators (badges) for data source
5. ✅ Test thoroughly: database load, fallback, PDF generation

**Result**: Single field dynamized, both DB and hardcoded coexist

**Validation Checklist:**
- [ ] Database value loads and maps correctly ("Sale" → "venta")
- [ ] Field becomes disabled when DB value present
- [ ] Field remains editable when DB unavailable (graceful fallback)
- [ ] Visual badge shows "Desde DB" when database value loaded
- [ ] PDF generation works with database-sourced value
- [ ] Zero breaking changes to existing functionality

### 🔄 Phase 2: Add `propertyType` Field
1. ✅ Extend server query to fetch `properties.propertyType`
2. ✅ Add `databasePropertyType` prop to CartelEditorClient  
3. ✅ Update "Tipo de Propiedad" select with same pattern as Phase 1
4. ✅ Test independently before proceeding

**Result**: Two fields dynamized and tested

### 📈 Phase 3: Basic Property Data Fields
Add incrementally, one at a time:
- `title` (property title)
- `price` (listing price)
- `bedrooms` / `bathrooms` (property specs)
- `squareMeters` (property area)

**Pattern**: Each field gets its own prop, visual indicators, and fallback logic

### 🎯 Phase 4: Complex Data & Full Integration
Only after all individual fields are stable:
- Consolidate into full `ExtendedTemplatePropertyData` structure
- Implement complete server wrapper component  
- Add comprehensive PDF generation with database integration
- Remove individual field props in favor of complete data structure

### Field-by-Field Testing Strategy

**For Each Field:**
1. **Unit Tests**: Database query and data mapping
2. **Visual Tests**: UI shows correct values and indicators  
3. **Interaction Tests**: Disabled vs editable behavior
4. **Fallback Tests**: Graceful degradation when DB unavailable
5. **PDF Tests**: Generated PDFs include correct database values

**Integration Tests (After All Fields):**
1. **Full Flow**: Database → UI → PDF with real data
2. **Performance**: Page load times with database queries
3. **Error Resilience**: System behavior under various failure conditions

### Benefits of Field-by-Field Approach

✅ **Immediate Value**: See progress with each field  
✅ **Risk Isolation**: Problems affect only one field at a time  
✅ **Easy Debugging**: Simple to identify and fix issues  
✅ **Rapid Feedback**: Quick validation of each integration  
✅ **Team Learning**: Build expertise incrementally  
✅ **Production Safety**: Always have working fallbacks

## Benefits of This Approach

✅ **Minimal Changes**: Existing template and PDF generation code unchanged  
✅ **Backwards Compatible**: Mock data still works as fallback  
✅ **Type Safe**: Full TypeScript support throughout  
✅ **Error Resilient**: Graceful fallbacks when database unavailable  
✅ **Performance**: Server-side data fetching, cached queries  
✅ **Maintainable**: Clean separation of data fetching and UI logic  
✅ **Scalable**: Easy to add new property fields and template features

## Complete Data Flow - Your Exact Process

### Phase 1: Database to Editable Interface
```
[Properties DB + Listings DB] 
    ↓ (Server Component fetches real data)
[property-data-converter.ts] 
    ↓ (Transforms DB fields to ExtendedTemplatePropertyData)
[Real Property Data]
    ↓ (Passed as props)
[cartel-editor-client.tsx]
    ↓ (User can edit via forms - lines 447-570)
[User-Modified Property Data]
```

### Phase 2: Dynamic Template Live Preview
```
[User-Modified Property Data] + [Template Configuration]
    ↓ (Passed to ClassicTemplate - line 806)
[ClassicTemplate - DYNAMIC/EDITABLE] 
    ↓ (Real-time preview as user types)
[Live Preview Display]
```

### Phase 3: Static Template for PDF Generation
```
[Final Edited Data] + [Final Configuration] 
    ↓ (Create static snapshot)
[StaticCartelSnapshot Component]
    ↓ (Uses ClassicTemplate without interactive props)
[ClassicTemplate - STATIC/FROZEN]
    ↓ (Puppeteer captures this)
[PDF Generation]
```

## Key Benefits of This Approach

✅ **Exact Process Match**: Follows your specified workflow precisely  
✅ **Minimal Code Changes**: cartel-editor-client.tsx barely changes  
✅ **User Can Edit Everything**: All existing form inputs work with real data  
✅ **Dynamic Live Preview**: ClassicTemplate updates as user types  
✅ **Static PDF Generation**: Clean snapshot for Puppeteer  
✅ **Template Unchanged**: ClassicTemplate.tsx stays exactly the same  
✅ **Backwards Compatible**: Still works with mock data if needed  

## Summary: Dynamic → Static Transformation

1. **START**: Database provides real property data
2. **EDIT**: cartel-editor-client.tsx allows user to modify that data  
3. **PREVIEW**: Dynamic ClassicTemplate shows live changes
4. **SNAPSHOT**: Create static version of final edited data
5. **PDF**: Puppeteer generates PDF from static template

This gives you exactly what you requested: database-driven dynamic editing with static PDF generation, while keeping your existing template system completely intact.