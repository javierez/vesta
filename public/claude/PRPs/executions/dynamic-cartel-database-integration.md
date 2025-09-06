# PRP: Dynamic Cartel Database Integration - Incremental Approach

**Feature**: Replace hardcoded cartel editor values with database-driven dynamic data, starting with `listingType` field and proceeding incrementally.


## Executive Summary

Transform the cartel editor from using mock data to real database data through a carefully planned incremental approach. Start with a single field (`listingType`) to validate the integration pattern, then expand field-by-field to minimize risk and ensure stable deployments.

## Context & Background

### Current State
- Cartel editor uses `getExtendedDefaultPropertyData()` to generate fake property data
- "Tipo de Listado" field is hardcoded with manual selection between "venta"/"alquiler"  
- All template data is mock, preventing real-world PDF generation from actual properties
- Users must manually recreate property information that already exists in the database

### Target State (Phase 1)
- "Tipo de Listado" field populated automatically from `listings.listingType` database field
- Field becomes read-only when database data is available
- Visual indicators show data source (Database vs Manual) - if database don't say anything
- Graceful fallback to editable mode when database unavailable
- PDF generation works with database-sourced values through static template rendering

### Critical Architecture Understanding

**Two Distinct Template Systems**:
1. **Dynamic Template**: `/src/components/propiedades/detail/cartel/templates/classic-template.tsx`
   - "use client" component with interactivity
   - Uses Next.js Image optimization
   - Complex state management and interactive features
   - Used for live preview in cartel editor

2. **Static Template**: `/src/components/admin/carteleria/templates/classic/classic-vertical-template.tsx`
   - Server-rendered, static HTML
   - Uses regular `<img>` tags for Puppeteer compatibility
   - No client-side JavaScript
   - Used by `/src/app/templates/page.tsx` for PDF generation

**PDF Generation Flow**:
```
Cartel Editor → Database Data + Config → /api/puppet/generate-pdf → /templates?config=X&data=Y → Static Template → PDF
```

The dynamic template cannot be used for PDF generation because Puppeteer requires static HTML rendering.

### Strategic Approach
**Incremental Integration**: Implement database integration one field at a time, testing thoroughly before proceeding. This approach ensures:
- ✅ Zero breaking changes during rollout
- ✅ Easy rollback if issues arise  
- ✅ Clear validation checkpoints
- ✅ Team confidence building
- ✅ Production safety

## Technical Architecture

### Database Integration Foundation

**Existing Infrastructure (Already Available)**:
```typescript
// Ultra-lightweight query for CartelEditor component - only listing type needed
export async function getListingCartelData(listingId: number) {
  const accountId = await getCurrentUserAccountId();

  try {
    const [cartelData] = await db
      .select({
        listingType: listings.listingType,
      })
      .from(listings)
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId)),
          eq(listings.isActive, true),
        ),
      );

    if (!cartelData) {
      throw new Error("Listing not found");
    }

    return cartelData;
  } catch (error) {
    console.error("Error fetching listing cartel data:", error);
    throw error;
  }
}
```

### Component Architecture Pattern

**Phase 1 Target Structure**:
```
[URL: /propiedades/{listingId}/cartel-editor] 
    ↓
[CartelEditorPhase1 - Server Component]
    ↓ (fetches listingType from database)
[CartelEditorClient - Client Component]
    ↓ (receives databaseListingType prop)
[UI with Database Integration]
```

### Data Flow Pattern
```
Database Query → Type Mapping → UI State → Visual Indicators → PDF Generation
    ↓               ↓            ↓           ↓                ↓
listings.listingType → "Sale"→"venta" → Disabled Select → "Desde DB" Badge → PDF with DB value
```

## Implementation Blueprint

### Phase 1: Single Field Integration (`listingType`)

#### Step 1.1: Update CartelEditorClient Interface

**File**: `/src/components/propiedades/detail/cartel/cartel-editor-client.tsx`

**Current Interface (lines 48-52)**:
```typescript
interface CartelEditorClientProps {
  listingId: string;
  images?: PropertyImage[];
}
```

**New Interface**:
```typescript
interface CartelEditorClientProps {
  listingId: string;
  images?: PropertyImage[];
  databaseListingType?: "Sale" | "Rent"; // NEW: Optional database value
}
```

#### Step 1.2: Add Database Value Mapping Logic

**Add after existing imports**:
```typescript
// Database to UI value mapping
const mapDatabaseListingType = (dbType?: "Sale" | "Rent"): "venta" | "alquiler" | null => {
  if (!dbType) return null;
  return dbType === "Sale" ? "venta" : "alquiler";
};
```

#### Step 1.3: Update Configuration Initialization

**Current Code (lines 55-73)**:
```typescript
const [config, setConfig] = useState<TemplateConfiguration>({
  templateStyle: "classic",
  orientation: "vertical", 
  propertyType: "piso",
  listingType: "venta", // Hardcoded
  // ... rest of config
});
```

**New Code**:
```typescript
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

#### Step 1.4: Update "Tipo de Listado" UI (lines 296-311)

**Current Code**:
```typescript
<div>
  <Label htmlFor="listingType">Tipo de Listado</Label>
  <Select
    value={config.listingType}
    onValueChange={(value: "venta" | "alquiler") =>
      updateConfig({ listingType: value })
    }
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="venta">Venta</SelectItem>
      <SelectItem value="alquiler">Alquiler</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**New Code**:
```typescript
<div>
  <Label htmlFor="listingType" className="flex items-center gap-2">
    Tipo de Listado
    {databaseListingType && (
      <Badge variant="secondary" className="text-xs">
        Desde DB
      </Badge>
    )}
  </Label>
  <Select
    value={config.listingType}
    onValueChange={(value: "venta" | "alquiler") =>
      updateConfig({ listingType: value })
    }
    disabled={!!databaseListingType}
  >
    <SelectTrigger className={databaseListingType ? "opacity-75" : ""}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="venta">Venta</SelectItem>
      <SelectItem value="alquiler">Alquiler</SelectItem>
    </SelectContent>
  </Select>
  {databaseListingType && (
    <p className="text-sm text-muted-foreground mt-1">
      Valor cargado desde base de datos - No editable
    </p>
  )}
</div>
```

#### Step 1.5: Add Required Import for Badge Component

**Add to imports at top of file**:
```typescript
import { Badge } from "~/components/ui/badge";
```

#### Step 1.6: Create Server Wrapper Component

**New File**: `/src/components/propiedades/detail/cartel/cartel-editor-phase1.tsx`

```typescript
import { CartelEditorClient } from "./cartel-editor-client";
import { getListingCartelData } from "~/server/queries/listing";
import type { PropertyImage } from "~/lib/data";

interface CartelEditorPhase1Props {
  listingId: string;
  images?: PropertyImage[];
}

/**
 * Server component that fetches listingType from database and passes to client editor
 * Phase 1: Single field integration with graceful fallback
 */
export async function CartelEditorPhase1({ 
  listingId, 
  images 
}: CartelEditorPhase1Props) {
  let databaseListingType: "Sale" | "Rent" | undefined;
  
  try {
    console.log("🔄 CartelEditorPhase1: Fetching listingType for:", listingId);
    
    const cartelData = await getListingCartelData(parseInt(listingId));
    databaseListingType = cartelData.listingType;
    
    console.log("✅ CartelEditorPhase1: Loaded listingType from database:", databaseListingType);
  } catch (error) {
    console.error("❌ CartelEditorPhase1: Failed to load listingType from database, using fallback:", error);
    // Graceful fallback: no databaseListingType passed = editable mode
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

### Database Query Integration

**Leverage Existing Infrastructure**: The `getListingCartelData()` function is already implemented in `/src/server/queries/listing.ts` (lines 1304-1331) with:
- ✅ Multi-tenant security (`getCurrentUserAccountId()`)
- ✅ Proper error handling
- ✅ Minimal field selection for performance
- ✅ Account isolation with `isActive` filtering

### PDF Generation Architecture Requirements

**Critical Understanding**: The cartel editor uses a **dynamic template** for live preview, but PDF generation requires a **static template**.

**Current PDF Flow**:
```
CartelEditorClient.generatePDF() 
  ↓ 
POST /api/puppet/generate-pdf (templateConfig + propertyData)
  ↓
Puppeteer navigates to /templates?config=JSON&data=JSON
  ↓
/src/app/templates/page.tsx renders static template
  ↓  
ClassicTemplate (from /admin/carteleria/templates/classic/) 
  ↓
PDF generated from static HTML
```

**Key Compatibility Points**:
1. **Data Structure**: Both dynamic and static templates must accept the same `TemplateConfiguration`
2. **Value Mapping**: Database `listingType` ("Sale"/"Rent") must map to config `listingType` ("venta"/"alquiler")
3. **Template Consistency**: Static template must render the same visual result as dynamic template
4. **URL Parameters**: `/templates` page must receive database values through JSON parameters

**No Changes Needed To**:
- `/src/app/api/puppet/generate-pdf/route.ts` (PDF API works with any config/data)
- `/src/app/templates/page.tsx` (Already handles JSON parameters)
- Static template components (Already handle `listingType` configuration)

**Phase 1 Impact**: Database `listingType` gets passed through existing PDF flow automatically.

### Error Handling Strategy

Following codebase patterns from `/src/server/queries/listing.ts`:

1. **Database Query Failure**: Graceful fallback to editable mode (no `databaseListingType` prop)
2. **Type Safety**: TypeScript interfaces prevent invalid values
3. **UI Feedback**: Clear visual indicators show data source and editability
4. **Console Logging**: Structured logging for debugging (following existing patterns)

### Security Considerations

**Multi-Tenant Isolation**: Following existing patterns in `/src/server/queries/listing.ts`:
- All queries filtered by `accountId` from `getCurrentUserAccountId()`
- Listing access restricted to active listings only
- BigInt conversion for proper database type handling

## Implementation Tasks (In Order)

### Phase 1 Tasks (listingType field)
1. **Update CartelEditorClient Props Interface**
   - Add `databaseListingType?: "Sale" | "Rent"` prop
   - Add Badge import

2. **Add Database Value Mapping Logic**
   - Create `mapDatabaseListingType()` helper function
   - Handle "Sale" → "venta" and "Rent" → "alquiler" mapping

3. **Update Configuration Initialization**
   - Modify `useState` initializer to use database value when available
   - Maintain fallback to "venta" default

4. **Modify "Tipo de Listado" UI Section**
   - Add Badge component showing "Desde DB" when database value present
   - Add `disabled` prop to Select when database value available
   - Add helper text explaining non-editable state
   - Style disabled state with opacity

5. **Create Server Wrapper Component**
   - Create `cartel-editor-phase1.tsx` server component
   - Implement database query with error handling
   - Pass fetched data to client component
   - Add structured console logging

6. **Verify PDF Generation Compatibility**
   - Confirm `/src/app/templates/page.tsx` receives `listingType` through URL params
   - Ensure database value gets properly mapped in static template rendering
   - Test PDF generation with database `listingType` values
   - Verify static template uses the same mapping as dynamic template

7. **Integration Testing**
   - Test with valid listingId (should show database value in UI)
   - Test with invalid listingId (should fallback to editable)
   - Test database connection failure (should fallback gracefully)
   - **Critical**: Verify PDF generation works with database values through static template

### Phase 2+ Tasks (Future)
- Extend pattern to `propertyType` field  
- Add basic property data (title, price, bedrooms)
- Implement full data structure integration
- Add comprehensive PDF generation support

## Validation Gates

### Pre-Implementation Checks
```bash
# Ensure clean starting state
git status --porcelain
pnpm typecheck
pnpm lint
```

### Post-Implementation Validation
```bash
# Type checking
pnpm typecheck

# Linting with auto-fix
pnpm lint:fix

# Format code
pnpm format:write

# Build verification
pnpm build

# Database connection test
echo "✓ Verify database connection works"
echo "✓ Test with existing listing ID from URL pattern"

# Manual testing checklist  
echo "✓ Database value loads correctly (Sale → venta, Rent → alquiler)"
echo "✓ Field shows 'Desde DB' badge when database value present"  
echo "✓ Field becomes disabled when database value loaded"
echo "✓ Field remains editable when database unavailable (fallback)"
echo "✓ Helper text appears explaining non-editable state"
echo "✓ Console logging shows proper success/error messages"
echo "✓ No console errors or TypeScript warnings"
echo "✓ Existing functionality unchanged (no regression)"

# PDF Generation Testing (Critical)
echo "✓ Dynamic template in editor shows database listingType value"
echo "✓ PDF generation button works without errors"
echo "✓ Generated PDF shows correct listingType text (Venta/Alquiler)"
echo "✓ PDF uses database value, not hardcoded default"
echo "✓ PDF generation works when database unavailable (uses fallback value)"
echo "✓ Static template rendered at /templates?config=...&data=... shows same value"
```

### Integration Test Scenarios
1. **Happy Path**: URL with valid listing ID → Database value loads → Field disabled → PDF generates
2. **Fallback Path**: URL with invalid listing ID → Database query fails → Field editable → PDF generates
3. **Network Failure**: Database unavailable → Query fails gracefully → Field editable → No errors thrown
4. **Type Safety**: Invalid database values → Type system prevents runtime errors

## External References & Documentation

### Next.js Data Fetching Best Practices
- **Server Components**: https://nextjs.org/docs/app/getting-started/server-and-client-components
- **Data Fetching Patterns**: https://nextjs.org/docs/14/app/building-your-application/data-fetching/patterns
- **Composition Patterns**: https://nextjs.org/docs/14/app/building-your-application/rendering/composition-patterns

### React Best Practices
- **Incremental Adoption**: https://react.dev/learn/react-compiler/incremental-adoption
- **Server Component Patterns**: https://www.thegnar.com/blog/react-server-components-example-with-next-js

### Codebase Reference Files
- **Database Queries**: `/src/server/queries/listing.ts` (lines 1304-1331, 21-33)
- **Component Props**: `/src/components/propiedades/property-table.tsx` (lines 33-36)
- **UI Patterns**: `/src/components/ui/badge.tsx`
- **Error Handling**: `/src/components/propiedades/no-results.tsx`
- **Fallback Patterns**: `/src/components/propiedades/detail/cartel/cartel-mini-gallery.tsx` (lines 28-44)

### Database Schema References  
- **Listings Table**: `/src/server/db/schema.ts` (listings table with listingType field)
- **Multi-tenant Pattern**: All queries filtered by accountId for tenant isolation

## Risk Assessment & Mitigation

### Low Risk Areas
- ✅ Query function already exists and tested
- ✅ TypeScript prevents invalid values
- ✅ Existing UI patterns established
- ✅ Single field scope limits blast radius

### Medium Risk Areas  
- **Database Connection Failure**: Mitigated by graceful fallback to editable mode
- **Type Mapping Issues**: Mitigated by explicit mapping function with validation
- **UI State Confusion**: Mitigated by clear visual indicators (badges, helper text)

### Mitigation Strategies
1. **Extensive Fallback Logic**: Never break existing functionality
2. **Clear Visual Feedback**: Users always know data source and editability
3. **Structured Logging**: Easy debugging when issues arise
4. **Incremental Scope**: Single field reduces complexity and risk
5. **Type Safety**: TypeScript prevents runtime errors

## Success Metrics

### Phase 1 Success Criteria
- [ ] Database value loads correctly for valid listing IDs
- [ ] Field becomes disabled with clear visual indicators  
- [ ] Graceful fallback when database unavailable
- [ ] PDF generation works with database values
- [ ] Zero regression in existing functionality
- [ ] Clear console logging for debugging
- [ ] TypeScript compilation with no errors
- [ ] Lint and format checks pass

### Phase 1+ Success Indicators
- Users report PDFs now match actual property data
- Support requests decrease (less manual data entry confusion)  
- Development team confident in pattern for next fields
- Database integration performs well under load

## Future Expansion Plan

### Phase 2: Add propertyType
- Same pattern as Phase 1
- Extend server query to include `properties.propertyType`
- Update UI for "Tipo de Propiedad" field

### Phase 3: Basic Property Data
- title, price, bedrooms, bathrooms, squareMeters
- Each field gets individual prop and fallback logic

### Phase 4: Full Integration
- Consolidate into complete `ExtendedTemplatePropertyData`
- Implement comprehensive server component
- Complete PDF generation integration

## Confidence Score: 9/10

**High Confidence Factors**:
- ✅ Database query function already exists and tested
- ✅ Codebase patterns well-established and documented  
- ✅ TypeScript provides compile-time safety
- ✅ Incremental approach minimizes risk
- ✅ Clear fallback strategies defined
- ✅ Existing UI components and patterns available
- ✅ **PDF architecture understood**: Static template separation ensures compatibility
- ✅ **No PDF changes required**: Existing flow handles database values automatically

**Potential Challenges**:
- Database connection edge cases (handled by fallback)
- URL parameter extraction (existing patterns available)
- Template value consistency (mitigated by TypeScript and existing patterns)

**Critical Success Factor**: Understanding that the dynamic template (used in editor) and static template (used in PDF) are separate components but share the same configuration interface. Database values flow through both systems naturally.

**Recommendation**: Proceed with implementation. The incremental approach, existing infrastructure, comprehensive fallback strategies, and clear PDF architecture understanding provide high confidence for successful implementation.