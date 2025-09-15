# Watermark Configuration Implementation

## Overview
Added comprehensive watermark configuration to the Vesta website settings system, allowing users to configure automatic watermarking of property images.

## Implementation Summary

### 1. Database Schema Changes

**File Modified:** `src/server/db/schema.ts`
- Added `watermarkProps` field to `websiteProperties` table
- Type: `text("watermark_props").notNull().default('{}')`
- Stores JSON configuration for watermark settings

**SQL Migration Required:**
```sql
ALTER TABLE website_config ADD COLUMN watermark_props text NOT NULL DEFAULT '{}';
```

### 2. Type Definitions

**File Modified:** `src/types/website-settings.ts`
- Added `watermarkPropsSchema` with Zod validation:
  ```typescript
  export const watermarkPropsSchema = z.object({
    enabled: z.boolean().default(false),
    position: z.enum(["southeast", "northeast", "southwest", "northwest", "center"]).default("southeast"),
    sizePercentage: z.number().min(10).max(50).default(30),
  });
  ```
- Added `WatermarkProps` type export
- Integrated `watermarkProps` into main `websiteConfigurationSchema`

### 3. UI Components

**File Created:** `src/components/admin/account/website-sections/watermark-section.tsx`

Features implemented:
- **Toggle Switch**: Enable/disable watermark functionality
- **Logo Integration**: Uses logo from the 'Marca' section automatically (shows warning only if missing)
- **Position Selector**: Choose from 5 positions (4 corners + center) with visual radio buttons
- **Size Slider**: Adjust and store watermark size (10-50% of image width) - fully persistent
- **Information Card**: User guidance and best practices
- **Conditional Rendering**: Only show configuration when watermark is enabled

**File Modified:** `src/components/admin/account/types/website-sections.ts`
- Added `WatermarkSectionProps` type definition

### 4. Navigation Integration

**File Modified:** `src/components/admin/account/website-sidebar.tsx`
- Added Shield icon import from lucide-react
- Added "Marca de Agua" tab to navigation items
- Positioned after "Marca" (branding) section for logical grouping

**File Modified:** `src/components/admin/account/website-configuration.tsx`
- Imported and integrated `WatermarkSection` component
- Added section routing for "watermark" active state

### 5. Server Actions

**File Modified:** `src/app/actions/website-settings.ts`
- Added `WatermarkProps` import
- Added watermark default values to configuration defaults
- Added watermark JSON parsing in `getWebsiteConfigurationAction`
- Added watermark section handling in `updateWebsiteSectionAction`
- Added watermark field to new configuration inserts

## Configuration Format

The watermark configuration is stored as JSON in the database with this structure:

```typescript
{
  enabled: boolean,           // Enable/disable watermarking
  position: "southeast" |    // Position on image (corners + center)
           "northeast" | 
           "southwest" | 
           "northwest" |
           "center",
  sizePercentage: number     // Size as percentage of image width (10-50)
}
```

**Note**: The watermark uses the logo configured in the 'Marca' section automatically - no separate logo URL is needed.

## User Interface Features

### Main Configuration Sections
1. **Estado de la Marca de Agua**: Toggle switch with description
2. **Logo de Marca de Agua**: Uses logo from 'Marca' section (warning shown only if missing)
3. **Posición**: Visual radio button selection for 5 positions (4 corners + center)
4. **Tamaño**: Interactive slider that stores watermark size (10-50% of image width)
5. **Información**: Guidance card with best practices

### Size Storage Details
The watermark size is **fully stored and persistent**:
- **Slider Control**: Interactive slider from 10% to 50% of image width
- **Real-time Display**: Shows current percentage value as user adjusts
- **Database Storage**: Saved as `sizePercentage` in the watermark JSON configuration
- **Default Value**: 30% (recommended for most images)
- **Validation**: Enforced min/max constraints through Zod schema

### UX Improvements
- Conditional sections only show when watermark is enabled
- Automatic logo integration from branding section
- Warning message only when logo is missing (clean UI when configured)
- Visual position selector with active state indicators (5 positions)
- Size slider with real-time percentage display and persistent storage
- Spanish localization throughout

### Validation
- Automatic logo validation from branding section
- Size constraints (10-50% range)
- Position enum validation (including center)
- Form state management with unsaved changes detection

## Integration with Existing Watermark System

This configuration integrates with the existing watermark functionality in:
- `src/lib/watermark.ts`: Core watermarking logic
- `src/types/watermark.ts`: Watermark type definitions
- `src/server/utils/watermarked-upload.ts`: S3 upload with watermarks

The website settings now provide the configuration source for automatic watermarking when publishing properties to portals.

## Technical Considerations

### Database
- Uses existing JSON column pattern for flexibility
- Backward compatible with empty default `{}`
- Follows established website settings architecture

### Performance
- Minimal UI impact with conditional rendering
- Efficient form state management
- Optimized database queries using existing patterns

### Security
- URL validation prevents malicious inputs
- Size constraints prevent oversized watermarks
- Proper error handling for invalid logo URLs

## Usage Workflow

1. User navigates to "Configuración del Sitio Web"
2. Selects "Marca de Agua" from sidebar
3. Enables watermarking with toggle
4. Configures logo URL, position, and size
5. Saves configuration
6. Watermarks are automatically applied when publishing properties

## Future Enhancements

Potential future improvements:
- File upload for logo instead of URL only
- Opacity/transparency controls
- Custom positioning (not just corners)
- Multiple watermark templates
- Preview functionality with sample images

## Files Modified Summary

1. **Database Schema**: `src/server/db/schema.ts`
2. **Type Definitions**: `src/types/website-settings.ts`
3. **UI Component**: `src/components/admin/account/website-sections/watermark-section.tsx` (new)
4. **Component Types**: `src/components/admin/account/types/website-sections.ts`
5. **Navigation**: `src/components/admin/account/website-sidebar.tsx`
6. **Main Configuration**: `src/components/admin/account/website-configuration.tsx`
7. **Server Actions**: `src/app/actions/website-settings.ts`

## SQL Migration Required

Before using this feature, run the following SQL command:

```sql
ALTER TABLE website_config ADD COLUMN watermark_props text NOT NULL DEFAULT '{}';
```

This completes the watermark configuration integration into the Vesta website settings system.