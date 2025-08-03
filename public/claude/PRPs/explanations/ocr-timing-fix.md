# OCR Timing Fix - Wait for Button Click

## Problem Identified

OCR was running immediately when documents were uploaded, even before the "Siguiente" button was clicked. This caused issues in the combined flow where:

1. OCR would extract data from documents
2. This data would then be overwritten by cadastral data
3. Conflicts weren't properly handled
4. Processing happened unnecessarily if user changed their mind

## Solution Implemented

### Change Made

Removed the immediate OCR trigger from the file upload handler:

```typescript
// BEFORE: OCR triggered immediately
if (referenceNumberToUse && !referenceNumberToUse.startsWith("temp_")) {
  void processDocumentInBackgroundEnhanced(uploadedDocument.documentKey);
}

// AFTER: Just log that OCR will happen later
if (referenceNumberToUse && !referenceNumberToUse.startsWith("temp_")) {
  console.log("⏳ [COMBINED-UPLOAD] OCR will be triggered when 'Siguiente' is clicked");
}
```

## New Behavior by Flow Type

### 1. Combined Flow (Cadastral + Documents)

**User Actions:**
1. Enters cadastral reference
2. Uploads documents
3. Clicks "Siguiente"

**System Behavior:**
1. Documents are uploaded to S3 (no OCR yet)
2. When "Siguiente" clicked:
   - Property created from cadastral
   - Documents moved to property folder
   - OCR triggered on all documents
   - OCR data supplements cadastral data
   - Conflicts logged but cadastral wins

### 2. Document-Only Flow

**User Actions:**
1. Uploads documents (no cadastral)
2. Clicks "Siguiente"

**System Behavior:**
1. Documents uploaded to temp folder (no OCR yet)
2. When "Siguiente" clicked:
   - Property created with placeholder data
   - Documents renamed to property folder
   - OCR triggered on all documents
   - OCR data fills all empty fields
   
**Note:** This flow was already correct - OCR only runs after "Siguiente" is clicked, not on upload.

### 3. Cadastral-Only Flow

**User Actions:**
1. Enters cadastral reference (no documents)
2. Clicks "Siguiente"

**System Behavior:**
1. Property created from cadastral
2. No OCR processing (no documents)

## Benefits of This Change

### Performance
- ✅ No wasted OCR processing if user cancels
- ✅ Faster initial page response
- ✅ OCR only runs when actually needed

### User Experience
- ✅ More predictable behavior
- ✅ Clear separation between upload and processing
- ✅ User commits to their inputs before processing

### Data Integrity
- ✅ Cadastral data properly takes precedence
- ✅ OCR supplements rather than competes
- ✅ Clearer conflict detection

## Technical Flow

### Combined Flow Sequence
```
1. User uploads document
   → File stored in S3
   → No OCR processing
   
2. User clicks "Siguiente"
   → Property created from cadastral
   → Documents associated with property
   → OCR runs in background
   → Results supplement cadastral data
```

### Document-Only Flow Sequence
```
1. User uploads document
   → File stored in temp S3 folder
   → No OCR processing
   
2. User clicks "Siguiente"
   → Property created with placeholder
   → Documents moved to property folder
   → OCR runs and populates all fields
```

## What OCR Still Does

When OCR runs (after button click), it will:

1. Extract all available fields from documents
2. Compare with existing property data
3. Only update fields that are empty
4. Log conflicts for fields that differ
5. Never overwrite cadastral data

## Future Considerations

1. **Progress Indicator**: Show OCR processing status after clicking "Siguiente"
2. **Preview Mode**: Option to preview OCR results before committing
3. **Selective Merge**: Let users choose which OCR fields to accept
4. **Batch Processing**: Handle multiple properties at once

## Summary

The key change is that OCR is now **event-driven** (triggered by user action) rather than **upload-driven** (triggered automatically). This gives users more control and ensures the system processes data in the correct order for the combined flow.

## OCR Timing Summary

| Flow Type | When Documents Upload | When "Siguiente" Clicked | OCR Runs |
|-----------|----------------------|-------------------------|----------|
| **Combined** (Cadastral + Docs) | Store in S3, NO OCR | Create property from cadastral, then OCR | ✅ After property creation |
| **Document-Only** | Store in temp folder, NO OCR | Create property, rename docs, then OCR | ✅ After property creation |
| **Cadastral-Only** | N/A | Create property from cadastral | ❌ Never (no docs) |

**Key Point:** OCR **NEVER** runs on file upload. It **ALWAYS** waits for the "Siguiente" button click, ensuring proper data flow and user intent confirmation.