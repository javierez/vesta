# Combined Flow Logging Guide

## Overview

Comprehensive logging has been added to track the combined property creation flow when users provide both cadastral reference and uploaded documents. This document explains what each log message means and how to interpret them.

## Log Categories

### 🔄 [COMBINED] - Main Flow Control
- **Purpose**: Tracks the overall combined creation flow
- **When**: Initial detection of both inputs and flow decisions

### 🏛️ [COMBINED-CADASTRAL] - Cadastral Processing 
- **Purpose**: Tracks cadastral property creation and document handling
- **When**: During primary property creation from cadastral reference

### 📄 [COMBINED-UPLOAD] - Document Upload
- **Purpose**: Tracks document upload behavior when cadastral exists
- **When**: During file upload process with existing cadastral reference

### 🔍 [OCR-ENHANCED] - OCR Processing
- **Purpose**: Tracks OCR data extraction and validation
- **When**: During background OCR processing of uploaded documents

## Complete Flow Example

### Step 1: User Provides Both Inputs
```
🔄 [COMBINED] Starting combined property creation flow
📋 [COMBINED] Cadastral Reference: 1234567890ABCD
📁 [COMBINED] Documents uploaded: 2
   📄 Document 1: property_sale.pdf (application/pdf)
   📄 Document 2: property_photo.jpg (image/jpeg)
```

### Step 2: Primary Property Creation
```
🏛️ [COMBINED] Step 1: Creating property from cadastral (primary source)
✅ [COMBINED] Property created successfully from cadastral
🏠 [COMBINED] Property ID: 123456789
🔑 [COMBINED] Reference Number: REF_2024_001
```

### Step 3: Document Processing Setup
```
📄 [COMBINED] Documents will be processed via OCR to supplement cadastral data
📂 [COMBINED] No folder renaming needed - documents already in final location
🚀 [COMBINED] Redirecting to property edit page with method=combined
```

### Step 4: Document Upload Flow (if documents uploaded after cadastral entry)
```
🏛️ [COMBINED-UPLOAD] Cadastral reference found - creating property first
📋 [COMBINED-UPLOAD] Cadastral: 1234567890ABCD
✅ [COMBINED-UPLOAD] Property created - using reference: REF_2024_001
🔑 [COMBINED-UPLOAD] Stored property ID: 123456789
🔍 [COMBINED-UPLOAD] Property exists - triggering immediate OCR
📄 [COMBINED-UPLOAD] Processing document: property_sale.pdf
🔑 [COMBINED-UPLOAD] Document key: REF_2024_001/property_sale.pdf
```

### Step 5: OCR Processing and Validation
```
🚀 [OCR-ENHANCED] Starting enhanced background processing for: REF_2024_001/property_sale.pdf
🏠 [OCR-ENHANCED] Found property ID: 123456789, listing ID: 987654321
🏛️ [OCR-ENHANCED] Found cadastral reference in OCR: 1234567890ABCD
📋 [OCR-ENHANCED] Property has manual cadastral reference: 1234567890ABCD
✅ [OCR-ENHANCED] Cadastral references match - combined flow working correctly
🔄 [OCR-ENHANCED] COMBINED FLOW: OCR data will supplement cadastral data
```

### Step 6: Data Merge Summary
```
📊 [OCR-ENHANCED] COMBINED FLOW DATA MERGE SUMMARY:
   📋 Property fields updated: 3
   📄 Listing fields updated: 5
   ✅ Total OCR fields merged: 8
   🏠 Property fields supplemented by OCR:
      - description: Beautiful apartment with sea views
      - hasElevator: true
      - hasGarage: true
   📄 Listing fields supplemented by OCR:
      - price: 350000
      - title: Piso en venta, 3 habitaciones
      - listingDescription: Property with excellent location...
      - bedrooms: 3
      - bathrooms: 2
```

## Error Scenarios

### Cadastral Failure with Document Fallback
```
❌ [COMBINED] Error creating property from cadastral: [error details]
🔄 [COMBINED] Attempting fallback to document-only creation
✅ [COMBINED] Fallback successful - property created from documents
📄 [COMBINED] Redirecting with method=upload (fallback mode)
```

### Document Upload Errors
```
❌ [COMBINED-UPLOAD] Error creating property for document upload: [error details]
⚠️ [COMBINED-UPLOAD] Falling back to temp reference
📂 [COMBINED-UPLOAD] Using temp reference: temp_1704123456789
```

### OCR Processing Errors
```
❌ [COMBINED-UPLOAD] OCR processing failed for REF_2024_001/property_sale.pdf: [error details]
❌ [COMBINED-CADASTRAL] OCR failed for REF_2024_001/property_photo.jpg: [error details]
```

## Conflict Detection

### Cadastral Reference Mismatch
```
⚠️ [OCR-ENHANCED] 🔴 CADASTRAL MISMATCH DETECTED (Combined Flow):
   📋 Manual entry: 1234567890ABCD
   📄 OCR detected: 9876543210WXYZ
   🔍 This indicates user uploaded documents for a different property!
🚨 [OCR-ENHANCED] COMBINED FLOW CONFLICT: User may have uploaded wrong documents
📊 [OCR-ENHANCED] Recommendation: Show conflict resolution UI to user
```

### Success Case
```
✅ [OCR-ENHANCED] Cadastral references match - combined flow working correctly
🔄 [OCR-ENHANCED] COMBINED FLOW: OCR data will supplement cadastral data
```

## Folder Management Logs

### Documents in Temp Folder
```
📂 [COMBINED-CADASTRAL] Documents in temp folder: temp_1704123456789
➡️  [COMBINED-CADASTRAL] Moving to property folder: REF_2024_001
✅ [COMBINED-CADASTRAL] Successfully renamed 2 documents
```

### Documents Already in Property Folder
```
📂 [COMBINED-CADASTRAL] Documents already in property folder (no temp folder)
🔍 [COMBINED-CADASTRAL] Triggering OCR processing directly
```

## Log Interpretation Guide

### 🟢 Success Indicators
- `✅` - Successful operations
- `🔄 [OCR-ENHANCED] COMBINED FLOW` - Data supplementation working
- `📊 [OCR-ENHANCED] COMBINED FLOW DATA MERGE SUMMARY` - Final merge results

### 🟡 Warning Indicators  
- `⚠️` - Non-critical issues, fallbacks activated
- `⏳` - Delayed processing (temp folders)
- Mismatch warnings

### 🔴 Error Indicators
- `❌` - Failed operations
- `💥` - Complete failure requiring user intervention
- `🚨` - Critical conflicts detected

## Debugging Tips

1. **Look for the initial `🔄 [COMBINED]` log** - confirms combined flow activated
2. **Check for `✅ [COMBINED] Property created successfully`** - ensures primary creation worked
3. **Find OCR validation logs** - shows if cadastral references match
4. **Review merge summary** - shows what data was actually combined
5. **Watch for fallback patterns** - indicates where primary flow failed

## Performance Monitoring

The logs also include timing information:
- OCR processing duration
- Database operation timing  
- Total processing time
- Document count and types processed

This helps identify bottlenecks in the combined flow process.

## Development vs Production

- **Development**: All logs are visible in browser console
- **Production**: Logs are sent to server-side logging system
- **User Impact**: Users only see success/error messages, not detailed logs

The extensive logging ensures complete visibility into the combined flow behavior without impacting user experience.