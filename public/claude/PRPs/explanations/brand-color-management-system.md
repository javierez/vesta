# Brand & Color Management System

## Overview

The brand and color management system allows account administrators to upload company logos, automatically extract brand colors, and manage visual identity elements. The system integrates with the existing admin interface and is accessible through the account admin branding section.

## File Structure & Functionality

### Client-Side Components

#### `/src/components/admin/account-branding.tsx`
- **Purpose**: Core branding component with full functionality
- **Key Features**:
  - Logo upload with drag & drop interface
  - Automatic background removal using @imgly/background-removal library
  - Color palette extraction from uploaded logos using extract-colors library
  - Tabbed preview of original and transparent logo versions
  - Download, view, and delete capabilities
  - Browser compatibility checking with graceful fallbacks
  - Real-time upload progress with stage indicators
  - Error handling with user-friendly messages

#### `/src/components/admin/brand-color-palette.tsx`
- **Purpose**: Displays extracted color palettes
- **Components**:
  - `BrandColorPalette`: Full palette display with card wrapper
  - `SimpleColorPalette`: Compact color swatches without wrapper
- **Functionality**:
  - Shows 6-color grid with hex values
  - Copy-to-clipboard functionality for each color
  - Responsive design for different screen sizes
  - Hover effects and visual feedback
  - Automatic padding to ensure exactly 6 colors

#### `/src/components/ui/logo-upload.tsx`
- **Purpose**: Reusable drag & drop upload interface
- **Features**:
  - File type validation (PNG, JPG, WebP)
  - File size validation (5MB maximum)
  - Drag & drop with visual feedback
  - Upload progress indicators
  - Image preview functionality
  - Error state management

### Server-Side Actions

#### `/src/app/actions/brand-upload.ts`
- **Purpose**: Server actions for brand asset management
- **Functions**:
  - `uploadBrandAsset()`: Uploads both logo versions to S3 with proper folder structure
  - `getBrandAsset()`: Retrieves existing brand assets from account preferences
  - `deleteBrandAsset()`: Removes brand assets from S3 and database
- **Database Operations**: Uses existing accounts table with JSON preferences field
- **S3 Storage**: Follows inmobiliariaacripolis/[accountId]/branding/ folder structure

#### `/src/app/actions/settings.ts`
- **Purpose**: Account-related operations
- **Function**: `getCurrentUserAccountId()`: Gets user's account ID for brand operations

### Utility Libraries

#### `/src/lib/background-removal.ts`
- **Purpose**: Client-side background removal using @imgly/background-removal library
- **Functions**:
  - `removeBackground()`: Removes image backgrounds with browser compatibility checks
  - `canRemoveBackground()`: Checks for OffscreenCanvas and WebWorker support
  - `cleanupUrls()`: Memory management for blob URLs
  - `getBrowserSupportInfo()`: Detailed browser capability analysis
- **Browser Requirements**: Chrome 88+, Firefox 79+, Safari 14.1+, Edge 88+

#### `/src/lib/color-extraction.ts`
- **Purpose**: Extract dominant colors from images using extract-colors library
- **Functions**:
  - `extractColorPalette()`: Analyzes image and extracts 6 prominent colors
  - `getHexColors()`: Converts color data to hex format
  - `ensureSixColors()`: Ensures exactly 6 colors with neutral padding
  - `isGoodBrandColor()`: Validates color suitability for branding
  - `generateComplementaryColors()`: Creates color variations

### Extract-Colors Library Deep Dive

#### How Extract-Colors Works
The `extract-colors` library is a sophisticated color analysis tool that performs the following process:

1. **Image Processing**: Loads the image into an HTML5 Canvas element for pixel analysis
2. **Pixel Sampling**: Analyzes a configurable number of pixels (we use 10,000 for accuracy)
3. **Color Clustering**: Groups similar colors together using distance algorithms
4. **Dominance Calculation**: Determines color prominence by area coverage within the image
5. **Color Validation**: Filters colors based on custom validation rules

#### Our Configuration
```typescript
const colors = await extractColors(image, {
  pixels: 10000,              // Higher pixel count for better accuracy
  distance: 0.22,             // Color similarity threshold (0-1, lower = more similar)
  colorValidator: (red: number, green: number, blue: number, alpha = 255) => {
    // Filter out very transparent pixels
    if (alpha < 250) return false;
    
    // Filter out colors too close to white or black for branding
    const brightness = (red + green + blue) / 3;
    return brightness > 20 && brightness < 235;
  }
});
```

#### Color Validation Logic
Our custom `colorValidator` function implements brand-specific filtering:
- **Transparency Filter**: Rejects pixels with alpha < 250 to avoid transparent artifacts
- **Brightness Filter**: Excludes colors too close to pure white (>235) or black (<20)
- **Brand Suitability**: Ensures colors are vibrant enough for branding purposes

#### Color Data Structure
Each extracted color contains:
```typescript
interface ExtractedColor {
  red: number;           // RGB red component (0-255)
  green: number;         // RGB green component (0-255)
  blue: number;          // RGB blue component (0-255)
  hex: string;           // Hex color code (e.g., "#FF5733")
  area: number;          // Percentage of image covered by this color
  hue?: number;          // HSL hue component (0-360)
  saturation?: number;   // HSL saturation component (0-1)
  lightness?: number;    // HSL lightness component (0-1)
}
```

#### Our Color Processing Pipeline
1. **Extract**: Get dominant colors using the library's clustering algorithm
2. **Sort**: Order colors by area coverage (most prominent first)
3. **Filter**: Apply additional brand-specific validation
4. **Transform**: Convert to our standardized ColorInfo interface with RGB, HSL, and hex
5. **Ensure Count**: Pad with neutral colors if fewer than 6 colors found
6. **Return**: Provide exactly 6 colors for consistent branding

#### Advantages of Extract-Colors
- **Browser Native**: Works entirely in the browser without server dependencies
- **Fast Processing**: Efficient algorithms for real-time color extraction
- **Configurable**: Extensive options for fine-tuning extraction behavior
- **Accurate**: Provides precise color dominance measurements
- **Cross-Platform**: Works consistently across different browsers and devices

#### Limitations and Workarounds
- **Complex Images**: May struggle with highly detailed or gradient-heavy images
  - *Workaround*: Our colorValidator filters unsuitable colors
- **Color Accuracy**: Can vary slightly based on image compression
  - *Workaround*: We process high-quality images and use validation rules
- **Brand Relevance**: May extract background colors instead of logo colors
  - *Workaround*: Our area-based sorting prioritizes prominent logo elements

### Type Definitions

#### `/src/types/brand.ts`
- **Purpose**: TypeScript type definitions for brand management
- **Interfaces**:
  - `BrandAsset`: Complete brand asset data structure
  - `ColorInfo`: Detailed color information with RGB, HSL, and area data
  - `ColorPalette`: Collection of color information
  - `BackgroundRemovalResult`: Result structure for background removal operations
  - `LogoUploadProgress`: Progress tracking with stages and percentages
  - Component prop interfaces for type safety

### Data Flow

1. **Upload Process**:
   ```
   User uploads logo → File validation → Background removal (@imgly/background-removal) → 
   Color extraction (extract-colors) → S3 upload (both versions) → 
   Database update (accounts.preferences) → UI state update
   ```

2. **Client-Server Interaction**:
   - **Client Side**: File validation, background removal, color extraction, UI state management
   - **Server Side**: S3 storage operations, database updates via server actions
   - **Progress Updates**: Real-time feedback with 5 stages (uploading, processing, extracting, saving, complete)

3. **Data Storage**:
   - **S3**: `inmobiliariaacripolis/[accountId]/branding/logo_[type]_[timestamp]_[id].[ext]`
   - **Database**: `accounts.preferences` JSON field with logo URLs and color palette
   - **Memory**: Temporary blob URLs for previews (automatically cleaned up)

### Key Features

#### Automatic Background Removal
- Uses @imgly/background-removal library with WebAssembly
- Requires OffscreenCanvas and WebWorker support
- Creates PNG versions with full transparency
- Browser compatibility warnings for unsupported environments

#### Color Extraction
- Uses extract-colors library with configurable options
- Extracts exactly 6 dominant colors with area coverage data
- Filters out unsuitable colors (too transparent, too close to white/black)
- Provides RGB, HSL, and hex color representations

#### Multi-Version Support
- Original logo preserving format and background
- Transparent PNG version for versatile use
- Tabbed interface for easy comparison
- Download links for both versions

#### AWS S3 Integration
- Follows existing S3 patterns from property images
- Proper folder structure for organization
- Secure upload with environment-based configuration
- Cleanup functionality for old assets

### State Management

The component uses React hooks for comprehensive state management:
- `accountId`: Current user's account identifier
- `brandAsset`: Complete brand asset data structure
- `colorPalette`: Array of 6 hex color strings
- `uploadProgress`: Detailed progress with stage and percentage
- `isUploading`: Boolean flag for upload state
- `isDeleting`: Boolean flag for deletion state
- `previewUrls`: Temporary URLs array for cleanup

### Dependencies

#### Required Libraries
- `@imgly/background-removal`: ^1.7.0 - AI-powered background removal
- `extract-colors`: ^4.2.0 - Dominant color extraction
- Existing dependencies: AWS SDK, React, Next.js, Drizzle ORM

#### Browser Support
- **Supported**: Chrome 88+, Firefox 79+, Safari 14.1+, Edge 88+
- **Required APIs**: OffscreenCanvas, WebWorker, WebAssembly
- **Fallback**: Graceful degradation with user notifications

### Security & Performance

- **File Validation**: Type checking (image/*), size limits (5MB), format validation
- **Memory Management**: Automatic cleanup of blob URLs to prevent memory leaks
- **Error Handling**: Comprehensive try-catch blocks with user-friendly error messages
- **Progress Tracking**: Visual feedback with percentage and stage descriptions
- **Browser Compatibility**: Runtime checks with informative warnings
- **Type Safety**: Full TypeScript coverage with custom interfaces

### Integration Points

- **Admin Interface**: Seamlessly integrates with existing admin layout and navigation
- **Authentication**: Uses existing session management and account ID resolution
- **Toast Notifications**: Integrates with existing toast system for user feedback
- **Styling**: Follows existing design system with shadcn/ui components
- **Database**: Extends existing accounts table without schema changes

This system provides a complete, production-ready brand management solution with modern web technologies, comprehensive error handling, and seamless integration with the existing application architecture.