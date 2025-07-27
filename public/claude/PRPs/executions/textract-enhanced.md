# Enhanced AWS Textract Implementation PRP

## 🎯 Objective

Enhance the existing AWS Textract integration in the property identification form to:
1. Support image files (PNG, JPG) in addition to PDFs 
2. Extract specific fields that match database columns from `properties` and `listings` tables
3. Auto-save extracted data with >50% confidence to the database
4. Provide comprehensive logging for debugging and monitoring

## 📋 Requirements Summary

- **Current State**: Basic Textract OCR for PDFs with general text extraction
- **Desired State**: Targeted field extraction for images and PDFs with database persistence
- **No UI Changes**: Backend-only implementation
- **Confidence Threshold**: Save only fields with >50% confidence
- **Target Fields**: All columns from `properties` and `listings` tables in schema

## 🏗️ Architecture Overview

### Current Implementation Analysis
- **Location**: `src/server/ocr/ocr-initial-form.tsx`
- **Current Functions**: 
  - `extractTextFromDocument()` - Basic text detection
  - `analyzeDocumentStructure()` - Advanced analysis with forms/tables
  - `processDocumentInBackground()` - Fire-and-forget processing
  - `parsePropertyInformation()` - Regex-based field extraction

### Enhancement Strategy
- Extend existing OCR functions to support images
- Add database schema-aware field extraction
- Implement confidence-based database persistence
- Enhance logging throughout the process

## 🗄️ Database Schema Context

### Properties Table Key Fields (from `src/server/db/schema.ts`)
```typescript
// Core Property Fields
- title, description, propertyType, propertySubtype
- bedrooms, bathrooms, squareMeter, yearBuilt
- street, addressDetails, postalCode
- cadastralReference, builtSurfaceArea
- conservationStatus, hasElevator, hasGarage, hasStorageRoom

// Energy & Systems
- energyCertificateStatus, energyConsumptionScale, energyConsumptionValue
- emissionsScale, emissionsValue, hasHeating, heatingType

// Amenities & Features  
- gym, sportsArea, childrenArea, communityPool, privatePool
- videoIntercom, conciergeService, alarm, securityDoor
- kitchenType, hotWaterType, orientation, airConditioningType

// Condition & Luxury
- brandNew, newConstruction, needsRenovation
- jacuzzi, garden, pool, homeAutomation, fireplace
```

### Listings Table Key Fields
```typescript
// Listing Details
- listingType, price, isFurnished, furnitureQuality
- hasKeys, studentFriendly, petsAllowed, appliancesIncluded

// Appliances
- internet, oven, microwave, washingMachine, fridge, tv

// Optional Features
- optionalGarage, optionalGaragePrice
- optionalStorageRoom, optionalStorageRoomPrice
```

## 🔧 Implementation Blueprint

### Phase 1: Extend Image Support

**File**: `src/server/ocr/ocr-initial-form.tsx`

1. **Update File Type Detection**
   - Modify `processDocumentInBackground()` to handle PNG/JPG
   - Add MIME type validation for images
   - Ensure S3 object references work for images

2. **Enhance OCR Functions**
   - Update `analyzeDocumentStructure()` to optimize for images
   - Add image-specific preprocessing if needed
   - Maintain backward compatibility with PDFs

### Phase 2: Schema-Aware Field Extraction

**File**: `src/server/ocr/schema-field-extractor.ts` (new)

1. **Create Field Mapping Configuration**
```typescript
interface FieldMapping {
  dbColumn: string;
  aliases: string[];
  dataType: 'string' | 'number' | 'boolean' | 'decimal';
  validation?: (value: string) => boolean;
}

const PROPERTY_FIELD_MAPPINGS: FieldMapping[] = [
  {
    dbColumn: 'title',
    aliases: ['título', 'titulo', 'nombre', 'denominación'],
    dataType: 'string'
  },
  {
    dbColumn: 'bedrooms', 
    aliases: ['dormitorios', 'habitaciones', 'cuartos', 'dorm'],
    dataType: 'number',
    validation: (v) => parseInt(v) >= 0 && parseInt(v) <= 10
  },
  // ... continue for all properties/listings columns
];
```

2. **Implement Smart Field Matching**
   - Fuzzy string matching for field names
   - Multi-language support (Spanish property terminology)
   - Context-aware extraction (e.g., price vs square meters)

### Phase 3: Database Integration

**File**: `src/server/ocr/textract-database-saver.ts` (new)

1. **Create Database Persistence Logic**
```typescript
interface ExtractedFieldResult {
  dbColumn: string;
  value: string | number | boolean;
  confidence: number;
  extractionSource: 'form' | 'table' | 'query' | 'regex';
}

async function saveExtractedDataToDatabase(
  propertyId: number,
  listingId: number,
  extractedFields: ExtractedFieldResult[]
): Promise<SaveResult> {
  // Filter fields by confidence threshold
  const highConfidenceFields = extractedFields.filter(
    field => field.confidence > 50
  );
  
  // Separate property vs listing fields
  // Update database using existing query patterns
  // Log all operations for audit trail
}
```

2. **Integration Points**
   - Hook into existing `processDocumentInBackground()` function
   - Use established database query patterns from `src/server/queries/`
   - Maintain transaction integrity for multi-table updates

### Phase 4: Enhanced Logging & Monitoring

**File**: Update `src/server/ocr/ocr-initial-form.tsx`

1. **Comprehensive Logging System**
```typescript
interface TextractProcessingLog {
  documentKey: string;
  processingStartTime: Date;
  processingEndTime: Date;
  fileType: string;
  fileSize?: number;
  ocrConfidence: number;
  fieldsExtracted: number;
  fieldsAboveThreshold: number;
  fieldsSaved: number;
  errors: string[];
  warnings: string[];
}
```

2. **Structured Logging Implementation**
   - Detailed step-by-step logging with emoji prefixes (maintaining current style)
   - Performance metrics (processing time, confidence scores)
   - Error tracking and classification
   - Database operation results

## 🔗 Integration Points

### Current File References
- **Property Upload**: `src/components/crear/property-identification-form.tsx:584-591`
  - Already calls `processDocumentInBackground()` 
  - Supports image uploads (PNG, JPG) via file input
  - Fire-and-forget pattern perfect for our enhancement

- **Database Queries**: `src/server/queries/properties.ts` & `src/server/queries/listing.ts`
  - Use existing `updateProperty()` and `updateListing()` functions
  - Follow established transaction patterns
  - Maintain data integrity constraints

- **Schema Types**: `src/server/db/schema.ts`
  - Full property and listing column definitions
  - Type safety for database operations
  - Validation rules and constraints

## 🎯 Implementation Tasks

### Task 1: Image Support Enhancement
- [ ] Modify OCR functions to handle PNG/JPG files
- [ ] Test image processing with various quality/formats
- [ ] Ensure S3 integration works seamlessly with images
- [ ] Add file type validation and error handling

### Task 2: Schema-Aware Field Extraction
- [ ] Create comprehensive field mapping configuration
- [ ] Implement fuzzy matching for Spanish property terms
- [ ] Add field validation and type conversion
- [ ] Test extraction accuracy with sample documents

### Task 3: Database Integration
- [ ] Create database persistence layer
- [ ] Implement confidence-based filtering (>50%)
- [ ] Add transaction management for multi-table updates
- [ ] Test with various property/listing combinations

### Task 4: Enhanced Logging
- [ ] Implement structured logging system
- [ ] Add performance monitoring metrics
- [ ] Create error categorization and tracking
- [ ] Test logging output for debugging clarity

### Task 5: Testing & Validation
- [ ] Unit tests for new extraction functions
- [ ] Integration tests with real property documents
- [ ] Performance testing with large image files
- [ ] Error handling and edge case validation

## 📚 External Resources

### AWS Textract Documentation
- **Official AWS SDK v3**: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/textract/
- **Best Practices**: https://docs.aws.amazon.com/textract/latest/dg/textract-best-practices.html
- **Tables & Forms**: https://docs.aws.amazon.com/textract/latest/dg/how-it-works-tables.html

### Node.js Implementation Examples
- **Medium Tutorial**: https://medium.com/@hatemalimam/extract-text-and-data-from-any-document-using-amazon-textract-in-node-js-9a72136c6e64
- **Table Extraction**: https://medium.com/@akashkhurana28/extract-table-data-from-any-document-using-amazon-textract-in-node-js-e49d54bd2a80
- **AWS Samples**: https://github.com/aws-samples/aws-textract-document-data-extraction-platform

### Spanish Property Terminology Resources
- Real estate glossaries for accurate field matching
- Property form templates for testing
- Spanish OCR best practices

## ⚠️ Critical Considerations

### Data Quality & Confidence
- **Confidence Threshold**: Only save fields with >50% confidence
- **Field Validation**: Implement data type and range validation
- **Conflict Resolution**: Handle conflicting data from multiple sources
- **Audit Trail**: Log all database updates for review

### Performance & Scalability
- **Background Processing**: Maintain fire-and-forget pattern
- **Error Handling**: Graceful degradation on OCR failures
- **Resource Management**: Monitor AWS Textract usage and costs
- **Caching**: Consider caching OCR results for reprocessing

### Security & Privacy
- **Data Handling**: Secure processing of sensitive property documents
- **Access Control**: Ensure proper S3 and database permissions
- **Logging Privacy**: Avoid logging sensitive data in plain text
- **Compliance**: Follow data protection regulations

## 🧪 Validation Gates

### Pre-Implementation Testing
```bash
# Type checking
pnpm typecheck

# Linting with auto-fix  
pnpm lint:fix

# Format code
pnpm format:write

# Build verification
pnpm build
```

### Manual Testing Checklist
- [ ] Upload PDF document with property data
- [ ] Upload PNG image with property information
- [ ] Upload JPG photo of property form
- [ ] Verify >50% confidence fields are saved to database
- [ ] Check logging output shows detailed processing steps
- [ ] Confirm no UI changes affect user experience
- [ ] Test error handling with corrupted files
- [ ] Validate performance with large image files
- [ ] Verify database transactions maintain integrity
- [ ] Test various property types (piso, casa, local, etc.)

### Success Metrics
- [ ] Support for PNG/JPG files in addition to PDFs
- [ ] Extract and save at least 70% of available property fields
- [ ] Process images within 30 seconds on average
- [ ] Maintain >95% uptime for background processing
- [ ] Zero data corruption in database operations
- [ ] Comprehensive logging for all processing steps

## 🔍 Error Handling Strategy

### Common Failure Scenarios
1. **Unsupported File Types**: Graceful rejection with clear logging
2. **Low OCR Confidence**: Skip database save, log for manual review
3. **Database Constraint Violations**: Rollback transaction, log errors
4. **AWS Service Limits**: Implement retry logic with exponential backoff
5. **Network Failures**: Queue for retry, maintain processing state

### Recovery Mechanisms
- Automatic retry for transient failures
- Manual reprocessing capability for failed documents
- Dead letter queue for permanently failed documents
- Alert system for critical error patterns

## 🎉 Expected Outcomes

### Immediate Benefits
- **Time Savings**: Automatic population of property forms from documents
- **Data Accuracy**: Reduced manual entry errors
- **User Experience**: Seamless background processing without UI blocking
- **Audit Trail**: Complete logging of all extraction and save operations

### Long-term Value
- **Process Efficiency**: Streamlined property onboarding workflow
- **Data Quality**: Consistent field population across all properties
- **Analytics**: Rich logging data for process optimization
- **Scalability**: Foundation for future AI-powered property analysis

## 📊 Implementation Confidence Score: 9/10

This PRP provides comprehensive context for successful one-pass implementation:

✅ **Complete Requirements Understanding**
✅ **Existing Code Pattern Analysis** 
✅ **Database Schema Integration**
✅ **AWS Textract Best Practices**
✅ **Error Handling Strategy**
✅ **Testing & Validation Plan**
✅ **Performance Considerations**
✅ **Security & Privacy Guidelines**

The implementation leverages existing patterns, maintains backward compatibility, and provides clear enhancement paths for the current Textract integration.