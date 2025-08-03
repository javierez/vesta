# Property Creation Scenarios - Combined Cadastral and Document Upload

## Overview

This document explains the changes made to handle scenarios where users provide both a cadastral reference number AND upload property documents. Previously, this would create duplicate properties. Now, the system intelligently merges both data sources into a single property.

## Key Principles

1. **Single Property Creation**: Only ONE property is created regardless of input combination
2. **Cadastral Priority**: Cadastral data always takes precedence over OCR-extracted data
3. **Data Supplementation**: OCR data fills in missing fields not provided by cadastral
4. **Silent Handling**: The system handles multiple inputs without warning the user
5. **Conflict Resolution**: When data conflicts exist, users can choose which values to keep

## Implementation Changes

### 1. Modified `nextStep` Function

The core logic now checks for all possible input combinations:

```typescript
// Scenario 1: BOTH cadastral AND documents
if (currentStep === 0 && formData.cadastralReference.trim() && uploadedDocuments.length > 0) {
  // Create property from cadastral (primary source)
  // Documents will supplement via OCR
  // Navigate with ?method=combined
}

// Scenario 2: ONLY cadastral
if (currentStep === 0 && formData.cadastralReference.trim() && uploadedDocuments.length === 0) {
  // Standard cadastral creation
  // Navigate with ?method=catastro
}

// Scenario 3: ONLY documents
if (currentStep === 0 && !formData.cadastralReference.trim() && uploadedDocuments.length > 0) {
  // Standard document creation
  // Navigate with ?method=upload
}
```

### 2. Document Upload Flow Enhancement

When a cadastral reference exists, documents are uploaded directly to the final property folder:

```typescript
// If cadastral reference exists, create property first
if (formData.cadastralReference.trim() && !tempReferenceNumber) {
  const newProperty = await createPropertyFromCadastral(formData.cadastralReference.trim());
  if (newProperty?.referenceNumber) {
    referenceNumberToUse = newProperty.referenceNumber; // Use real folder
  }
}
```

### 3. OCR Validation Enhancement

The OCR processing now validates cadastral references:

```typescript
// Check if OCR-extracted cadastral matches manual entry
const property = await db.select().from(properties)...
if (property?.cadastralReference && ocrCadastralField.value !== property.cadastralReference) {
  // Log mismatch for potential conflict resolution
}
```

### 4. Conflict Resolution UI

A new dialog component shows data conflicts:

```typescript
<Dialog open={showConflictDialog}>
  {dataConflicts.map((conflict) => (
    <div>
      <h4>{conflict.fieldLabel}</h4>
      <label>
        <input type="radio" value="cadastral" defaultChecked />
        Valor del Catastro (Recomendado): {conflict.cadastralValue}
      </label>
      <label>
        <input type="radio" value="ocr" />
        Valor del Documento: {conflict.ocrValue}
      </label>
    </div>
  ))}
</Dialog>
```

## Detailed Scenarios

### Scenario 1: Both Cadastral + Documents Provided

**User Actions:**
1. Enters cadastral reference: "1234567890ABCD"
2. Uploads property sale document (PDF/image)
3. Clicks "Siguiente"

**System Flow:**
1. Detects both inputs are present
2. Creates property using cadastral API (primary source)
3. Gets official data: address, size, year built, etc.
4. Uploads documents to property's permanent folder
5. Triggers OCR processing in background
6. OCR extracts additional data (price, description, amenities)
7. If cadastral reference in document differs → logs warning
8. If other data conflicts → stores for potential UI display
9. Redirects to `/propiedades/crear/{id}?method=combined`

**Result:**
- One property with complete official cadastral data
- Supplemented with document details (photos, descriptions, price)
- No duplicate properties created

### Scenario 2: Only Cadastral Reference

**User Actions:**
1. Enters cadastral reference: "1234567890ABCD"
2. Does NOT upload any documents
3. Clicks "Siguiente"

**System Flow:**
1. Standard cadastral-only flow (unchanged)
2. Creates property from cadastral API
3. Redirects to `/propiedades/crear/{id}?method=catastro`

**Result:**
- Property with official cadastral data only
- User can add documents later if needed

### Scenario 3: Only Document Upload

**User Actions:**
1. Leaves cadastral reference empty
2. Uploads property documents
3. Clicks "Siguiente"

**System Flow:**
1. Standard document-only flow (unchanged)
2. Creates property with placeholder data
3. Uploads to temporary folder, then renames
4. OCR extracts all available data
5. Redirects to `/propiedades/crear/{id}?method=upload`

**Result:**
- Property created from document data only
- May have incomplete official information

### Scenario 4: Manual Entry Only

**User Actions:**
1. Leaves cadastral reference empty
2. Does NOT upload documents
3. Clicks "Siguiente" → Goes to location form
4. Fills address manually
5. Clicks "Siguiente" again

**System Flow:**
1. Validates address with Nominatim
2. Creates property from manual data
3. Redirects to `/propiedades/crear/{id}?method=manual`

**Result:**
- Property with manually entered data
- Validated through geocoding service

## Error Handling

### Cadastral Failure with Document Fallback

```typescript
try {
  // Try cadastral creation first
  const newProperty = await handleCreatePropertyFromCadastral(cadastralReference);
} catch (error) {
  // If cadastral fails, try document-only creation
  try {
    const newProperty = await handleCreatePropertyFromDocuments();
  } catch (fallbackError) {
    // Both failed - show error to user
    alert("Error al crear la propiedad");
  }
}
```

### Benefits:
- User's documents aren't lost if cadastral lookup fails
- Graceful degradation of functionality
- Always attempts to create property if possible

## OCR Processing Changes

### Previous Behavior:
- OCR would try to update property after creation
- Could cause conflicts if cadastral data already existed

### New Behavior:
1. OCR runs after property exists
2. Checks for existing cadastral reference
3. Validates OCR-extracted cadastral matches manual entry
4. Only updates fields that are empty or supplements data
5. Logs all conflicts for potential review

## URL Parameter Strategy

The `method` parameter helps track creation source:

- `?method=catastro` - Created from cadastral only
- `?method=upload` - Created from documents only  
- `?method=manual` - Created from manual entry
- `?method=combined` - Created from BOTH cadastral + documents (new)

This helps with:
- Analytics and tracking user preferences
- Debugging issues specific to creation method
- Showing appropriate UI based on data source

## Future Enhancements

1. **Real-time Conflict Resolution**: Show conflicts immediately during creation
2. **Confidence-based Auto-selection**: Automatically choose high-confidence OCR values
3. **Cadastral Validation in Upload**: Validate cadastral before uploading documents
4. **Batch Processing**: Handle multiple documents with different properties
5. **ML-based Matching**: Use machine learning to match documents to properties

## Technical Debt Addressed

1. **Duplicate Properties**: No longer possible when using multiple input methods
2. **Race Conditions**: Property creation happens before document processing
3. **Folder Management**: Simplified by using final folders immediately when possible
4. **Type Safety**: Fixed TypeScript errors with proper bigint handling
5. **Database Queries**: Used correct Drizzle ORM syntax

## Testing Scenarios

To test the implementation:

1. **Test Combined Input**:
   - Enter valid cadastral: "1234567890ABCD"
   - Upload property document
   - Verify single property created
   - Check OCR supplements data

2. **Test Conflict Detection**:
   - Enter cadastral: "1234567890ABCD"
   - Upload document with different cadastral
   - Check console for mismatch warning

3. **Test Fallback**:
   - Enter invalid cadastral
   - Upload valid document
   - Verify falls back to document creation

4. **Test Each Individual Method**:
   - Test cadastral-only
   - Test document-only
   - Test manual-only
   - Ensure backward compatibility