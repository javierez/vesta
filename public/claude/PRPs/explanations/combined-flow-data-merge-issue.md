# Combined Flow Data Merge Issue

## Problem Analysis

In the combined flow (cadastral + documents), OCR data is not being saved to the database even though it's being extracted successfully.

### Current Behavior

From the logs:
```
🔍 [DATABASE] Validating 15 extracted fields...
✅ [DATABASE] Validation completed: 15 valid, 0 invalid fields
✅ [DATABASE] Listing field prepared: price = 20000 (94.6% confidence)
ℹ️ [DATABASE] No property fields to update
💾 [OCR-ENHANCED] Database save result: SUCCESS - 1 fields saved
```

**What's happening:**
1. OCR extracts 15 fields successfully
2. Only 1 field (price) is saved to the database
3. 14 property fields are ignored because they already have values from cadastral

### Root Cause

The `saveExtractedDataToDatabase` function builds `propertyUpdateData` with ALL extracted fields, but the property already has values from the cadastral API:

- `street`: Already set from cadastral
- `squareMeter`: Already set from cadastral  
- `yearBuilt`: Already set from cadastral
- etc.

Since these fields have values, they're not included in the update.

## The Dilemma

### Option 1: Overwrite Everything (Current Implementation)
- ❌ Cadastral data (authoritative) gets overwritten by OCR (less reliable)
- ❌ Data quality degradation

### Option 2: Only Fill Empty Fields (What's Actually Happening)
- ✅ Preserves cadastral data integrity
- ❌ Misses OCR supplemental data like descriptions, amenities, etc.

### Option 3: Smart Merge (Proposed Solution)
- ✅ Cadastral fields remain untouched
- ✅ OCR fills supplemental fields
- ✅ Best of both worlds

## Proposed Solution: Field Priority System

### Field Categories

1. **Cadastral-Only Fields** (Never overwrite)
   - `cadastralReference`
   - `squareMeter`
   - `yearBuilt`
   - `street`
   - `propertyType`
   - Basic location data

2. **OCR-Supplemental Fields** (Always accept from OCR)
   - `description`
   - `title`
   - `hasElevator`
   - `hasGarage`
   - `hasStorageRoom`
   - `terrace`
   - `pool`
   - Other amenities

3. **Conflict Fields** (Need resolution)
   - `bedrooms` (if differs)
   - `bathrooms` (if differs)
   - `price` (if differs)

## Implementation Strategy

### Short-term Fix
Modify the database saver to check field names and decide whether to update:

```typescript
// In saveExtractedDataToDatabase
const CADASTRAL_PROTECTED_FIELDS = [
  'cadastralReference',
  'squareMeter',
  'yearBuilt',
  'street',
  'propertyType'
];

// Only skip update if field is protected AND has cadastral data
if (CADASTRAL_PROTECTED_FIELDS.includes(field.dbColumn) && hasCadastralData) {
  continue; // Skip this field
}
```

### Long-term Solution
1. Add metadata to track data source for each field
2. Implement field-level confidence scoring
3. Show conflicts in UI for user resolution
4. Allow manual override of specific fields

## Why This Matters

Currently in combined flow:
- **Cadastral provides**: Official data (address, size, year)
- **OCR should provide**: Sales data (price, description, amenities)
- **Reality**: OCR data is mostly ignored

This defeats the purpose of the combined flow, which is to get the best of both sources.

## User Impact

Users expect:
1. Enter cadastral → Get official property data
2. Upload documents → Get sales/marketing data
3. Result → Complete property listing

Current result: Only official data, missing the rich details from documents.

## Recommended Action

1. **Immediate**: Implement field categorization to allow OCR supplemental data
2. **Next Sprint**: Add conflict resolution UI
3. **Future**: Full field-level source tracking and confidence scoring