name: "Combined Method Property Creation PRP - Context-Rich Implementation"
description: |

## Purpose

Implement a "combined method" for property creation that leverages both cadastral data authority and OCR document processing to maximize data completeness while preserving data integrity.

## Core Principles

1. **Cadastral Authority**: Cadastral data takes precedence for official property characteristics
2. **OCR Supplementation**: OCR fills in marketing, amenities, and detailed features not available in cadastral
3. **Field Priority System**: Clear separation between protected cadastral fields and updatable OCR fields
4. **Data Integrity**: No UI changes needed, backend-only implementation with comprehensive logging

---

## Goal

Implement a combined method that creates properties using cadastral data first, then uploads documents with the actual property reference number, and finally runs OCR to update supplemental fields while preserving cadastral authority.

## Why

- **Business Value**: Reduces manual data entry time by combining authoritative cadastral data with rich OCR extraction
- **User Impact**: Faster property creation (4+ minutes saved from cadastral + 15 minutes from OCR)
- **Data Quality**: Maintains cadastral authority while enriching with 200+ additional property characteristics
- **Integration**: Seamless integration with existing property creation flow

## What

A backend enhancement that modifies the property creation pipeline to:
1. Create property using cadastral API data (authoritative fields)
2. Upload documents using actual property reference (not temporary)
3. Process OCR after property exists
4. Update only non-cadastral fields with OCR results
5. Maintain comprehensive audit logs

### Success Criteria

- [ ] Property created successfully using cadastral data as primary source
- [ ] Documents uploaded with actual property reference number
- [ ] OCR processes documents after property creation
- [ ] Only supplemental fields updated by OCR (200+ fields)
- [ ] Cadastral protected fields remain unchanged (15 core fields)
- [ ] Comprehensive logging shows field sources and decisions
- [ ] Existing UI continues to work without changes
- [ ] All validation gates pass (lint, typecheck, build)

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: /Users/javierperezgarcia/Downloads/vesta/src/components/crear/property-identification-form.tsx
  why: Current property creation form logic and handleCreatePropertyFromCadastral pattern
  critical: Lines 178-271 show current cadastral creation, lines 483-500 show document upload detection

- file: /Users/javierperezgarcia/Downloads/vesta/src/server/queries/properties.ts
  why: Property creation functions and patterns to follow
  critical: createPropertyFromCadastral (lines 338-419) shows current cadastral flow

- file: /Users/javierperezgarcia/Downloads/vesta/src/server/queries/textract-database-saver.ts
  why: OCR data processing and field update logic
  critical: saveExtractedDataToDatabase function shows how OCR updates are handled

- file: /Users/javierperezgarcia/Downloads/vesta/src/server/ocr/ocr-initial-form.tsx
  why: OCR processing pipeline and document handling
  critical: processDocumentInBackgroundEnhanced function for OCR trigger pattern

- doc: /Users/javierperezgarcia/Downloads/vesta/public/claude/PRPs/explanations/combined-flow-data-merge-issue.md
  why: Explains current data merge issue and field priority requirements
  critical: Shows which fields should be protected vs updated by OCR
```

### Current Codebase tree (key files only)

```bash
src/
├── components/crear/
│   └── property-identification-form.tsx    # Frontend form with creation logic
├── server/
│   ├── queries/
│   │   ├── properties.ts                   # Property CRUD and creation methods
│   │   ├── textract-database-saver.ts      # OCR data processing and saving
│   │   └── listing.ts                      # Listing creation
│   ├── ocr/
│   │   └── ocr-initial-form.tsx            # OCR processing pipeline
│   └── cadastral/
│       └── retrieve_cadastral.ts           # Cadastral API integration
└── types/
    └── textract-enhanced.ts                # OCR type definitions
```

### Desired Codebase tree with files to be added

```bash
src/
├── components/crear/
│   └── property-identification-form.tsx    # MODIFY: Add combined method logic
├── server/
│   ├── queries/
│   │   ├── properties.ts                   # ADD: createPropertyFromCombined function
│   │   └── textract-database-saver.ts      # MODIFY: Add field priority system
│   └── ocr/
│       └── ocr-combined-processor.ts       # ADD: Combined OCR processor with field filtering
└── lib/
    └── field-priority-config.ts            # ADD: Cadastral vs OCR field definitions
```

### Known Gotchas of our codebase & Library Quirks

```typescript
// CRITICAL: Next.js requires 'use server' directive for server actions
// Example: All server functions in properties.ts have 'use server' at top

// CRITICAL: Drizzle ORM uses BigInt for IDs but TypeScript numbers for operations
// Example: eq(properties.propertyId, BigInt(propertyId)) for queries

// CRITICAL: OCR processing must happen AFTER property creation
// Example: Lines 679-680 in property-identification-form.tsx show this pattern

// CRITICAL: getSecureDb() must be used for user-scoped database operations
// Example: All property creation functions use const { db: secureDb, accountId } = await getSecureDb()

// CRITICAL: Document keys follow format: VESTA20240000001/documents/ficha_propiedad/...
// Example: Used in getPropertyAndListingIds for reference number extraction

// CRITICAL: Field confidence threshold filtering in OCR (default 80%)
// Example: Lines 44-47 in textract-database-saver.ts show confidence filtering

// CRITICAL: Location handling requires findOrCreateLocation for address data
// Example: Lines 177-183 in textract-database-saver.ts show location creation pattern
```

## Implementation Blueprint

### Data models and structure

Create field priority configuration and enhanced OCR processing types:

```typescript
// Field categorization for combined method
interface FieldPriorityConfig {
  cadastralProtectedFields: readonly string[];
  ocrSupplementalFields: readonly string[];
  conflictResolutionFields: readonly string[];
}

// Enhanced OCR result with source tracking
interface CombinedOCRResult extends ExtractedFieldResult {
  sourceMethod: 'cadastral' | 'ocr' | 'conflict_resolved';
  isProtected: boolean;
  updateDecision: 'skipped' | 'updated' | 'conflicted';
}
```

### List of tasks to be completed to fulfill the PRP in the order they should be completed

```yaml
Task 1: CREATE Field Priority Configuration
MODIFY src/server/queries/textract-database-saver.ts:
  - FIND line: "export async function saveExtractedDataToDatabase"
  - INJECT before function: Field priority constants and logic
  - ADD: CADASTRAL_PROTECTED_FIELDS array with 15 core fields
  - ADD: isFieldProtected utility function
  - PRESERVE: Existing confidence threshold and validation logic

Task 2: ENHANCE OCR Data Processor with Field Filtering
MODIFY src/server/queries/textract-database-saver.ts:
  - FIND section: Lines 74-102 property field processing loop
  - INJECT: Field protection logic before propertyUpdateData assignment
  - ADD: Logging for skipped protected fields vs updated supplemental fields
  - PRESERVE: Existing error handling and audit trail

Task 3: CREATE Combined Property Creation Method
MODIFY src/server/queries/properties.ts:
  - FIND after line: "export async function createPropertyFromLocation"
  - INJECT: New createPropertyFromCombined function
  - MIRROR pattern from: createPropertyFromCadastral (lines 338-419)
  - MODIFY: Use actual reference number for document uploads (no temp reference)
  - KEEP: Same error handling and listing creation pattern

Task 4: UPDATE Frontend Form Logic
MODIFY src/components/crear/property-identification-form.tsx:
  - FIND line: "// If we're on the initial step and cadastral reference is filled, create property and redirect"
  - INJECT before line 462: Combined method detection logic
  - ADD: handleCreatePropertyFromCombined function
  - MODIFY: nextStep function to detect combined method scenario
  - PRESERVE: Existing redirect patterns and error handling

Task 5: CREATE Enhanced OCR Processing for Combined Method
CREATE src/server/ocr/ocr-combined-processor.ts:
  - MIRROR pattern from: processDocumentInBackgroundEnhanced
  - ADD: Field priority filtering before database save
  - ADD: Comprehensive logging for combined method decisions
  - INTEGRATE: With existing textract-database-saver patterns

Task 6: ADD Comprehensive Logging and Audit Trail
MODIFY throughout affected files:
  - ADD: Detailed console.log statements for combined method flow
  - ADD: Field-by-field decision logging (skipped/updated/conflicted)
  - ADD: Performance timing for combined method steps
  - PRESERVE: Existing logging patterns and error handling
```

### Per task pseudocode as needed added to each task

```typescript
// Task 1: Field Priority Configuration
const CADASTRAL_PROTECTED_FIELDS = [
  'cadastralReference', 'squareMeter', 'yearBuilt', 'street', 
  'propertyType', 'builtSurfaceArea', 'postalCode', 
  'latitude', 'longitude', 'neighborhoodId', 'addressDetails'
] as const;

function isFieldProtected(fieldName: string): boolean {
  return CADASTRAL_PROTECTED_FIELDS.includes(fieldName as any);
}

// Task 2: Enhanced OCR Processing
for (const field of propertyFields) {
  if (isFieldProtected(field.dbColumn)) {
    console.log(`🛡️ [COMBINED] Skipping protected cadastral field: ${field.dbColumn}`);
    continue; // Skip protected fields
  }
  
  console.log(`✅ [COMBINED] Updating supplemental field: ${field.dbColumn} = ${field.value}`);
  propertyUpdateData[key] = field.value as never;
}

// Task 3: Combined Property Creation
export async function createPropertyFromCombined(
  cadastralReference: string,
  uploadedDocuments: Array<{ docId: bigint; documentKey: string; }>
): Promise<PropertyWithListing> {
  // STEP 1: Create property using cadastral data (authoritative)
  const property = await createPropertyFromCadastral(cadastralReference);
  
  // STEP 2: Rename uploaded documents to use actual reference number
  if (uploadedDocuments.length > 0) {
    const renamedDocs = await renameDocumentFolder(
      tempReference, 
      property.referenceNumber,
      uploadedDocuments
    );
    
    // STEP 3: Trigger OCR with field filtering
    for (const doc of renamedDocs) {
      await processDocumentInBackgroundEnhancedCombined(doc.newDocumentKey);
    }
  }
  
  return property;
}

// Task 4: Frontend Combined Method Detection
const handleCreatePropertyFromCombined = async () => {
  console.log(`🔄 [COMBINED] Starting combined method with cadastral: ${formData.cadastralReference}`);
  
  const newProperty = await createPropertyFromCombined(
    formData.cadastralReference.trim(),
    uploadedDocuments
  );
  
  if (newProperty?.listingId) {
    router.push(`/propiedades/crear/${newProperty.listingId}?method=combined`);
  }
};

// Combined method detection in nextStep
if (currentStep === 0 && formData.cadastralReference.trim() && uploadedDocuments.length > 0) {
  console.log(`🎯 [COMBINED] Detected combined method scenario`);
  return await handleCreatePropertyFromCombined();
}
```

### Integration Points

```yaml
DATABASE:
  - no_migration: "Uses existing property and listing tables"
  - indexes: "Existing indexes on referenceNumber and propertyId sufficient"

CONFIG:
  - add_to: "No environment variables needed"
  - logging: "Uses existing console.log patterns for debugging"

ROUTES:
  - modify: "src/components/crear/property-identification-form.tsx nextStep logic"
  - preserve: "Existing route structure and redirect patterns"

S3_INTEGRATION:
  - modify: "Document upload flow to use actual reference numbers"
  - preserve: "Existing renameDocumentFolder and uploadDocument patterns"

OCR_PIPELINE:
  - enhance: "Add field filtering to existing OCR processing"
  - preserve: "Existing processDocumentInBackgroundEnhanced flow"
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm lint:fix                               # Auto-fix ESLint issues
pnpm typecheck                              # TypeScript compilation check
pnpm format:write                           # Prettier formatting

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Build Verification

```bash
# Ensure the application builds successfully
pnpm build

# Expected: No build errors. If errors, check imports and type definitions.
```

### Level 3: Integration Test Combined Method Flow

```typescript
// CREATE test scenario in browser development mode:
describe('Combined Method Flow', () => {
  it('should create property with cadastral + document upload', async () => {
    // 1. Fill cadastral reference: "1234567890123456789012"
    // 2. Upload property document (PDF or image)
    // 3. Click "Siguiente" 
    // 4. Verify property created with cadastral data
    // 5. Verify documents renamed to actual reference number
    // 6. Verify OCR processing logs in console
    // 7. Verify only supplemental fields updated by OCR
  });
});
```

```bash
# Manual testing steps:
pnpm dev

# Test the combined flow:
# 1. Navigate to property creation form
# 2. Enter cadastral reference AND upload document
# 3. Click "Siguiente"
# 4. Check browser console for detailed logging:
#    - "🎯 [COMBINED] Detected combined method scenario"
#    - "🛡️ [COMBINED] Skipping protected cadastral field: ..."
#    - "✅ [COMBINED] Updating supplemental field: ..."

# Expected: Property created, documents processed, logs show field decisions
```

### Level 4: Creative Validation Methods

```bash
# Field Priority Validation
echo "Testing field priority system:"
echo "✓ Cadastral fields remain unchanged after OCR"
echo "✓ OCR supplemental fields get populated"
echo "✓ Comprehensive logging shows decision process"

# Performance Validation
echo "Testing combined method performance:"
echo "✓ Property creation under 5 seconds"
echo "✓ Document upload uses actual reference"
echo "✓ OCR processing doesn't block user flow"

# Data Integrity Validation
echo "Testing data integrity:"
echo "✓ Cadastral authority preserved"
echo "✓ OCR adds value without conflicts"
echo "✓ Audit trail shows field sources"
```

## Final validation Checklist

- [ ] All tests pass: `pnpm build`
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm typecheck`
- [ ] Manual test successful: Combined method flow works end-to-end
- [ ] Cadastral fields protected from OCR overwrites
- [ ] OCR supplemental fields populated correctly
- [ ] Comprehensive logging shows field decisions
- [ ] Documents use actual property reference numbers
- [ ] Performance meets expectations (under 5 seconds for property creation)

---

## Anti-Patterns to Avoid

- ❌ Don't overwrite cadastral authoritative fields with OCR data
- ❌ Don't upload documents with temporary reference in combined method
- ❌ Don't skip field priority validation - implement proper filtering
- ❌ Don't ignore existing error handling patterns - extend them
- ❌ Don't create new UI components - use existing form logic
- ❌ Don't hardcode field lists - use constants for maintainability
- ❌ Don't skip comprehensive logging - this is critical for debugging

---

## Confidence Score: 9/10

This PRP provides comprehensive context, follows existing patterns, and includes detailed validation steps. The implementation path is clear and builds on well-understood codebase patterns. The only minor risk is ensuring the field priority system integrates seamlessly with existing OCR processing, but the detailed pseudocode and existing patterns minimize this risk.