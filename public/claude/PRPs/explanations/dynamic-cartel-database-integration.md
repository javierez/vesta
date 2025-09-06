# Dynamic Cartel Database Integration Guide

## Problem Statement & Process Flow

Currently, the cartel editor system uses mock data from `getExtendedDefaultPropertyData()` which creates fake property information for template previews and PDF generation. 

## The Exact Process We Need:

```
[Database] → [Server Component] → [cartel-editor-client.tsx] → [EDITABLE Dynamic Template] → [Static Template] → [PDF]
                                           ↓                           ↓                        ↓
                                    [User Can Edit Data]        [Live Preview]         [Generate PDF]
```

### Key Requirements:

1. **cartel-editor-client.tsx receives dynamic data** from a server component (from listings table, properties table, etc.)
2. **User can edit that dynamic data** within the cartel editor interface 
3. **Dynamic template shows in live preview** with user's edits in real-time
4. **From that dynamic template, create a static component** that captures the final edited data
5. **Static component is used for PDF generation** via Puppeteer

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

## Recommended Solution: Database → Editable Dynamic Template → Static PDF

### Your Exact Architecture Requirements:

```
[Database] → [Server Component] → [cartel-editor-client.tsx] → [EDITABLE Dynamic Template] → [Static Template] → [PDF]
                                           ↓                           ↓                        ↓
                                    [User Can Edit Data]        [Live Preview]         [Generate PDF]
```

### Key Components:

1. **Server Component**: Fetches database data and passes to cartel editor
2. **cartel-editor-client.tsx**: Receives real data, allows editing, shows live preview
3. **Dynamic Template**: ClassicTemplate showing user's edits in real-time
4. **Static Template**: Snapshot of final edited data for PDF generation

### Implementation Plan

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

## Migration Strategy

### Phase 1: Add Database Support (No Breaking Changes)
1. ✅ Create `property-data-converter.ts`
2. ✅ Create server wrapper `cartel-editor.tsx` 
3. ✅ Update client to accept `initialPropertyData` prop
4. ✅ Keep existing mock data as fallback

**Result**: System works with both mock and real data

### Phase 2: Update PDF Generation
1. ✅ Add `propertyId` support to `/templates` page
2. ✅ Add `propertyId` support to PDF generation API
3. ✅ Update editor to pass `propertyId` for PDF generation

**Result**: PDFs can be generated with real database data

### Phase 3: Integrate in Property Pages
1. ✅ Update property detail pages to use `CartelEditor` 
2. ✅ Remove mock data dependencies where not needed
3. ✅ Add proper error handling and loading states

**Result**: Full database integration complete

### Testing Strategy

1. **Unit Tests**: Test data conversion functions
2. **Integration Tests**: Test database → template → PDF flow
3. **Manual Testing**: Verify PDFs generate correctly with real data
4. **Fallback Testing**: Ensure system still works when database is unavailable

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