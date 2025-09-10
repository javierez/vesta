# Cartel Template Hydration Architecture

## Overview

The cartel template system uses a **dual-template architecture** to support both interactive editing and PDF generation. This document explains how dynamic templates are "hydrated" (converted) into static templates for PDF generation while supporting fully customizable text fields.

## Core Architecture Pattern

### Two-Template System

1. **Dynamic Template** (`/src/components/propiedades/detail/cartel/templates/classic-template.tsx`)
   - Interactive React component with "use client" directive
   - Supports real-time editing of text, images, and layout
   - Uses Next.js Image optimization
   - Handles user interactions and state management
   - **Used for**: Live preview in cartel editor

2. **Static Template** (`/src/components/admin/carteleria/templates/classic/classic-vertical-template.tsx`)
   - Server-rendered, static HTML component
   - No client-side JavaScript or interactivity
   - Uses standard `<img>` tags for Puppeteer compatibility
   - Identical visual output to dynamic template
   - **Used for**: PDF generation via Puppeteer

### Data Flow Architecture

```mermaid
graph TD
    A[Database: Custom Text Fields] --> B[CartelEditorPhase1: Server Component]
    B --> C[CartelEditorClient: Editor Interface]
    C --> D[Dynamic Template: Interactive Preview]
    D --> E[User Edits Text: Real-time Updates]
    E --> F[Generate PDF Button Clicked]
    F --> G[Template Hydration: Dynamic ’ Static Data]
    G --> H[/templates Page: Static Rendering]
    H --> I[Puppeteer: PDF Generation]
    I --> J[Generated PDF with Custom Text]
```

## Dynamic Text Implementation

### Database Schema Extension

The `listings` table is extended with custom text fields:

```sql
-- New columns for custom text
customListingText VARCHAR(50) NULL,  -- "VENTA DE PISO" instead of "VENTA"
customPropertyText VARCHAR(50) NULL, -- Custom property descriptions

-- Existing columns maintained for backward compatibility
listingType VARCHAR(20) NOT NULL,    -- "Sale" or "Rent"
```

### Text Editability in Dynamic Template

The dynamic template supports inline text editing:

```typescript
// Example: Editable listing type text
<h2 
  onClick={createClickHandler('title', { type: 'listingType', value: config.listingType })}
  style={{ cursor: isInteractive ? 'pointer' : 'default' }}
>
  {config.customListingText || config.listingType.toUpperCase()}
</h2>
```

## Template Hydration Process

### 1. Data Collection Phase

When "Generar PDF" is clicked:

```typescript
// Collect all customizable data from dynamic template
const hydratedData: ExtendedTemplatePropertyData = {
  ...propertyData,
  customListingText: config.customListingText,
  customPropertyText: config.customPropertyText,
  // ... other custom fields
};

const templateConfig: TemplateConfiguration = {
  ...config,
  customListingText: userEditedText,
  customPropertyText: userEditedPropertyText,
};
```

### 2. Static Template Data Passing

The hydrated data is passed to the static template via URL parameters:

```typescript
// PDF generation API call
const pdfUrl = `/templates?config=${encodeURIComponent(JSON.stringify(templateConfig))}&data=${encodeURIComponent(JSON.stringify(hydratedData))}`;
```

### 3. Static Template Rendering

The static template receives and renders the custom text:

```typescript
// In static template
export const ClassicTemplate: FC<ConfigurableTemplateProps> = ({ data, config }) => {
  return (
    <div>
      {/* Renders custom text or falls back to default */}
      <h2>{config.customListingText || config.listingType.toUpperCase()}</h2>
      <h3>{config.customPropertyText || data.propertyType.toUpperCase()}</h3>
    </div>
  );
};
```

## Customizable Text Fields

### Primary Text Elements

1. **Listing Type Text**
   - Default: "VENTA" / "ALQUILER"
   - Custom: "VENTA DE PISO" / "ALQUILER TEMPORAL"
   - Database field: `customListingText`
   - Template location: Main title overlay

2. **Property Type Text**
   - Default: "PISO" / "CASA" / "LOCAL"
   - Custom: "ÁTICO REFORMADO" / "CASA ADOSADA"
   - Database field: `customPropertyText`
   - Template location: Subtitle below listing type

### Future Extensions

3. **Location Description**
   - Current: Neighborhood + City format
   - Custom: "ZONA EXCLUSIVA MADRID CENTRO"
   - Future field: `customLocationText`

4. **Feature Descriptions**
   - Current: Icon-based features
   - Custom: "REFORMADO COMPLETAMENTE"
   - Future field: `customFeaturesText`

## Implementation Benefits

### 1. Flexibility
- Users can create custom text that better describes their properties
- No longer limited to hardcoded "VENTA PISO" format
- Supports marketing language and regional variations

### 2. Backward Compatibility
- Existing templates continue to work without changes
- Graceful fallback to original text when custom text is null
- No breaking changes to current PDF generation flow

### 3. Visual Consistency
- Dynamic and static templates produce identical output
- Same typography, spacing, and layout rules
- Consistent brand presentation across preview and PDF

### 4. Performance Optimization
- Static template optimized for Puppeteer rendering
- No client-side JavaScript in PDF generation
- Fast, reliable PDF creation

## Technical Implementation Details

### Database Query Extension

```typescript
// Updated query to fetch custom text
export async function getListingCartelData(listingId: number) {
  const [cartelData] = await db
    .select({
      listingType: listings.listingType,
      customListingText: listings.customListingText,
      customPropertyText: listings.customPropertyText,
    })
    .from(listings)
    .where(/* ... */);
  
  return cartelData;
}
```

### Text Editing UI Components

```typescript
// Text editing modal/inline editor
interface TextEditorProps {
  currentText: string;
  onSave: (newText: string) => void;
  maxLength: number;
  placeholder: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ currentText, onSave }) => {
  // Implementation for text editing interface
};
```

### Hydration Utility Functions

```typescript
// Convert dynamic template state to static template props
export function hydrateTemplateData(
  dynamicConfig: TemplateConfiguration,
  propertyData: ExtendedTemplatePropertyData,
  userCustomizations: UserCustomizations
): { config: TemplateConfiguration; data: ExtendedTemplatePropertyData } {
  
  return {
    config: {
      ...dynamicConfig,
      customListingText: userCustomizations.listingText,
      customPropertyText: userCustomizations.propertyText,
    },
    data: {
      ...propertyData,
      customFields: userCustomizations.customFields,
    }
  };
}
```

## Error Handling and Fallbacks

### Text Validation
- Maximum character limits prevent layout breaking
- Special character sanitization for PDF compatibility
- Empty text validation with sensible defaults

### Database Failures
- Graceful fallback to hardcoded text when database unavailable
- Clear user feedback when custom text cannot be saved
- Automatic retry mechanisms for transient failures

### PDF Generation Failures
- Fallback to default text if custom text breaks PDF rendering
- Error logging and user notification
- Automatic retry with simplified configuration

## Migration Strategy

### Phase 1: Infrastructure
1. Add database columns for custom text fields
2. Extend type definitions and interfaces
3. Update query functions to fetch custom text

### Phase 2: Dynamic Template
1. Implement text editing UI components
2. Add interactivity to dynamic template text elements
3. Integrate with existing cartel editor interface

### Phase 3: Static Template
1. Update static template to accept custom text props
2. Ensure visual consistency with dynamic template
3. Test PDF generation with various text configurations

### Phase 4: Integration
1. Connect text editing to database persistence
2. Implement hydration logic for PDF generation
3. Add validation and error handling

### Phase 5: Testing & Rollout
1. Comprehensive testing of dynamic ’ static conversion
2. PDF generation testing with edge cases
3. Gradual rollout with feature flags

## Success Metrics

### User Experience
- Time to create custom cartel reduced by 60%
- User satisfaction with text customization options
- Reduction in support requests for text modifications

### Technical Performance
- PDF generation time remains under 3 seconds
- Zero regression in existing template functionality
- 100% visual consistency between preview and PDF

### Business Impact
- Increased cartel creation volume
- Better property marketing effectiveness
- Enhanced brand differentiation capabilities

## Future Enhancements

### Advanced Text Features
1. **Rich Text Formatting**
   - Bold, italic, color customization
   - Font family selection
   - Text alignment options

2. **Template Variables**
   - Dynamic property data insertion
   - Calculated fields (price per sqm)
   - Date and agent information

3. **Multi-language Support**
   - Internationalization of default text
   - Language-specific formatting rules
   - Regional marketing terminology

### AI-Powered Text Generation
1. **Smart Text Suggestions**
   - AI-generated property descriptions
   - Marketing copy optimization
   - SEO-friendly text recommendations

2. **Context-Aware Defaults**
   - Location-based text suggestions
   - Property type specific language
   - Market trend integration

This hydration architecture provides a solid foundation for scalable, customizable cartel generation while maintaining the reliability and performance required for professional real estate marketing materials.