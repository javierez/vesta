name: "Brand and Logo Management with Background Removal and Color Palette Extraction"
description: |
  Complete PRP for implementing logo upload, background removal, and color palette extraction functionality in the account branding component.

## Goal

Implement a comprehensive brand management system within `@src/components/admin/account-branding.tsx` that allows users to:
- Upload logo images with drag-and-drop functionality
- Automatically remove backgrounds and store both original and background-free versions in AWS S3
- Extract and display a 6-color palette from uploaded logos for branding recommendations
- Store all assets in the `inmobiliariaacripolis` folder structure in AWS S3

## Why

- **Business Value**: Enable account administrators to maintain consistent brand identity across the platform
- **User Experience**: Streamline brand asset management with automated background removal and color extraction
- **Integration**: Seamlessly integrate with existing AWS S3 upload infrastructure used throughout the application
- **Cost Efficiency**: Client-side processing reduces server load and API costs

## What

### User-Visible Behavior
1. **Upload Interface**: Clean, drag-and-drop logo upload area similar to existing image upload patterns
2. **Background Removal**: Automatic background removal with preview of both versions
3. **Color Palette Display**: Visual representation of 6 extracted brand colors with hex values
4. **AWS Storage**: All assets automatically stored in S3 with proper folder structure

### Technical Requirements
- Client-side background removal processing
- Dual image storage (original + background-free)
- Color palette extraction and display component
- AWS S3 integration with `inmobiliariaacripolis` folder structure
- Transparent UI background as specified
- TypeScript support throughout

### Success Criteria

- [ ] Logo upload with drag-and-drop functionality
- [ ] Background removal produces clean, usable logos
- [ ] Two versions stored in AWS S3 (original and background-free)
- [ ] Color palette extraction displays 6 relevant brand colors
- [ ] Component integrates seamlessly with existing admin interface
- [ ] All assets stored in correct S3 folder structure
- [ ] No background styling on component itself (transparent)

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: src/components/admin/account-branding.tsx
  why: Current placeholder component to be enhanced

- file: src/lib/s3.ts
  why: Existing AWS S3 upload patterns and utilities

- file: src/app/actions/upload.ts
  why: Server actions for file uploads and S3 integration

- file: src/components/property/form-steps/images-step.tsx
  why: Drag-and-drop upload UI pattern to follow

- file: src/components/propiedades/detail/energy-certificate.tsx
  why: File upload with progress indicators pattern

- url: https://www.npmjs.com/package/@imgly/background-removal
  why: Primary background removal library documentation

- url: https://www.npmjs.com/package/extract-colors
  why: Color palette extraction library documentation

- url: https://github.com/imgly/background-removal-js
  why: Background removal implementation examples and API reference

- url: https://huggingface.co/docs/transformers.js/index
  why: Alternative background removal using Transformers.js (if @imgly fails)
```

### Current Codebase Tree (Relevant Files)

```bash
src/
├── components/
│   ├── admin/
│   │   └── account-branding.tsx           # Target file to enhance
│   ├── property/form-steps/
│   │   └── images-step.tsx                # Upload UI pattern reference
│   ├── propiedades/detail/
│   │   └── energy-certificate.tsx         # File upload pattern reference
│   └── ui/
│       ├── card.tsx                       # UI components to use
│       ├── button.tsx
│       └── input.tsx
├── lib/
│   └── s3.ts                              # S3 upload utilities
├── app/actions/
│   └── upload.ts                          # Server actions for uploads
└── server/
    ├── s3.ts                              # S3 client configuration
    └── queries/
        └── property_images.ts             # Database pattern reference
```

### Desired Codebase Tree with New Files

```bash
src/
├── components/
│   ├── admin/
│   │   ├── account-branding.tsx           # Enhanced with logo upload
│   │   └── brand-color-palette.tsx        # New: Color palette display component
│   └── ui/
│       └── logo-upload.tsx                # New: Reusable logo upload component
├── lib/
│   ├── s3.ts                              # Enhanced with brand upload functions
│   ├── background-removal.ts              # New: Background removal utilities
│   └── color-extraction.ts               # New: Color palette extraction utilities
├── app/actions/
│   └── brand-upload.ts                    # New: Brand-specific upload actions
└── types/
    └── brand.ts                           # New: Brand-related TypeScript types
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: @imgly/background-removal requires specific browser support
// Works in: Chrome 88+, Firefox 79+, Safari 14.1+, Edge 88+
// Fallback: Use Transformers.js for older browsers

// GOTCHA: Background removal is CPU intensive
// Solution: Use Web Workers to prevent UI blocking
// Pattern: Show loading state during processing

// CRITICAL: AWS S3 folder structure
// Must use: inmobiliariaacripolis/[accountId]/branding/logo_[timestamp].[ext]
// Follow existing pattern from: src/lib/s3.ts line 60

// GOTCHA: extract-colors library requires image to be loaded
// Pattern: Use Image.onload before processing
// Alternative: node-vibrant has better async handling

// CRITICAL: File size limits
// Recommended: Max 5MB for logo files
// Pattern: Client-side validation before upload

// GOTCHA: Transparent background handling
// Solution: Use PNG format for background-free version
// Original: Keep original format (JPG/PNG/etc.)
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// types/brand.ts
interface BrandAsset {
  id: string;
  accountId: string;
  logoOriginalUrl: string;
  logoTransparentUrl: string;
  colorPalette: string[]; // Array of 6 hex colors
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  updatedAt: Date;
}

interface ColorPalette {
  colors: Array<{
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
    area: number; // percentage of image
  }>;
}

interface BackgroundRemovalResult {
  originalBlob: Blob;
  transparentBlob: Blob;
  originalUrl: string;
  transparentUrl: string;
}
```

### List of Tasks in Completion Order

```yaml
Task 1: Install Required Dependencies
  - EXECUTE: pnpm add @imgly/background-removal extract-colors
  - EXECUTE: pnpm add -D @types/file-saver (for blob downloads if needed)
  - VERIFY: Package installation successful

Task 2: Create Brand Types
  CREATE src/types/brand.ts:
    - DEFINE: BrandAsset interface
    - DEFINE: ColorPalette interface  
    - DEFINE: BackgroundRemovalResult interface
    - PATTERN: Follow existing type definitions in src/lib/data.ts

Task 3: Implement Background Removal Utility
  CREATE src/lib/background-removal.ts:
    - IMPORT: @imgly/background-removal
    - FUNCTION: removeBackground(file: File): Promise<BackgroundRemovalResult>
    - ERROR_HANDLING: Graceful fallback for unsupported browsers
    - PATTERN: Follow async patterns from src/lib/s3.ts

Task 4: Implement Color Extraction Utility  
  CREATE src/lib/color-extraction.ts:
    - IMPORT: extract-colors
    - FUNCTION: extractColorPalette(imageUrl: string): Promise<ColorPalette>
    - FUNCTION: getTopColors(colors: Color[], count: number): string[]
    - PATTERN: Follow utility patterns from src/lib/utils.ts

Task 5: Create Brand Upload Server Actions
  CREATE src/app/actions/brand-upload.ts:
    - PATTERN: Mirror src/app/actions/upload.ts structure
    - FUNCTION: uploadBrandAsset(originalFile, transparentFile, accountId)
    - S3_PATH: inmobiliariaacripolis/[accountId]/branding/
    - DATABASE: Create brand_assets table (if needed) or extend existing

Task 6: Create Color Palette Display Component
  CREATE src/components/admin/brand-color-palette.tsx:
    - PROPS: colors: string[], title?: string
    - UI: Grid display of color swatches with hex values
    - PATTERN: Follow Card component structure from existing admin components
    - STYLING: Clean, professional color display

Task 7: Create Reusable Logo Upload Component
  CREATE src/components/ui/logo-upload.tsx:
    - PATTERN: Follow src/components/property/form-steps/images-step.tsx
    - FEATURES: Drag-and-drop, file validation, progress indicator
    - PROPS: onUpload, isUploading, acceptedTypes
    - STYLING: Remove background as specified (transparent)

Task 8: Enhance Account Branding Component
  MODIFY src/components/admin/account-branding.tsx:
    - REPLACE: Placeholder content with functional brand management
    - INTEGRATE: LogoUpload component
    - INTEGRATE: BrandColorPalette component
    - STATE: Manage upload progress, brand assets, color palette
    - PATTERN: Follow existing admin component patterns

Task 9: Database Integration (if needed)
  MODIFY src/server/db/schema.ts:
    - ADD: brandAssets table definition (if not using existing storage)
    - PATTERN: Follow propertyImages table structure
    - FIELDS: accountId, logoOriginalUrl, logoTransparentUrl, colorPalette

Task 10: Testing and Validation
  - TEST: Upload various logo formats (PNG, JPG, SVG)
  - TEST: Background removal quality
  - TEST: Color extraction accuracy
  - VERIFY: S3 storage in correct folder structure
  - VERIFY: Component renders without background styling
```

### Pseudocode for Core Functions

```typescript
// Task 3: Background Removal
async function removeBackground(file: File): Promise<BackgroundRemovalResult> {
  // CRITICAL: Check browser compatibility first
  if (!window.OffscreenCanvas) {
    throw new Error('Browser not supported for background removal');
  }

  try {
    // PATTERN: Use Web Worker to prevent UI blocking
    const { removeBackground } = await import('@imgly/background-removal');
    
    // GOTCHA: Library expects specific image formats
    const blob = await removeBackground(file);
    
    // CRITICAL: Convert to PNG for transparency support
    const transparentBlob = new Blob([blob], { type: 'image/png' });
    
    return {
      originalBlob: file,
      transparentBlob,
      originalUrl: URL.createObjectURL(file),
      transparentUrl: URL.createObjectURL(transparentBlob)
    };
  } catch (error) {
    // FALLBACK: Use Transformers.js if @imgly fails
    console.warn('Primary background removal failed, using fallback');
    return await removeBackgroundFallback(file);
  }
}

// Task 4: Color Extraction  
async function extractColorPalette(imageUrl: string): Promise<ColorPalette> {
  // PATTERN: Load image first before processing
  const image = new Image();
  image.crossOrigin = 'anonymous';
  
  return new Promise((resolve, reject) => {
    image.onload = async () => {
      try {
        // GOTCHA: extract-colors needs specific options for best results
        const colors = await extractColors(image, {
          pixels: 10000,
          distance: 0.22,
          splitPower: 10,
          colorValidator: (red, green, blue, alpha = 255) => alpha > 250,
          saturationImportance: 2,
          lightnessImportance: 1,
          hueImportance: 1
        });
        
        // PATTERN: Sort by area coverage for brand relevance
        const sortedColors = colors
          .sort((a, b) => b.area - a.area)
          .slice(0, 6);
          
        resolve({ colors: sortedColors });
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = reject;
    image.src = imageUrl;
  });
}

// Task 8: Main Component Logic
async function handleLogoUpload(file: File) {
  try {
    // STEP 1: Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file');
    }
    
    setIsUploading(true);
    setUploadProgress(20);
    
    // STEP 2: Remove background
    const bgRemovalResult = await removeBackground(file);
    setUploadProgress(50);
    
    // STEP 3: Extract colors from original
    const colorPalette = await extractColorPalette(bgRemovalResult.originalUrl);
    setUploadProgress(70);
    
    // STEP 4: Upload both versions to S3
    const uploadResult = await uploadBrandAsset(
      bgRemovalResult.originalBlob,
      bgRemovalResult.transparentBlob,
      accountId
    );
    setUploadProgress(100);
    
    // STEP 5: Update UI state
    setBrandAsset(uploadResult);
    setColorPalette(colorPalette.colors.map(c => c.hex));
    
  } catch (error) {
    console.error('Logo upload failed:', error);
    // PATTERN: Show user-friendly error message
    setError('Failed to process logo. Please try again.');
  } finally {
    setIsUploading(false);
    setUploadProgress(0);
  }
}
```

### Integration Points

```yaml
DATABASE:
  - table: "brand_assets" (new) or extend "accounts" table
  - columns: "logo_original_url", "logo_transparent_url", "color_palette_json"
  - index: "CREATE INDEX idx_brand_account ON brand_assets(account_id)"

S3_STORAGE:
  - folder: "inmobiliariaacripolis/[accountId]/branding/"
  - pattern: "logo_original_[timestamp].[ext]" and "logo_transparent_[timestamp].png"
  - follow: uploadImageToS3 function pattern from src/lib/s3.ts

CONFIG:
  - add to: src/env.js
  - pattern: "NEXT_PUBLIC_MAX_LOGO_SIZE=5242880" # 5MB limit
  
ROUTES:
  - enhance: existing admin branding route
  - no new routes needed - component enhancement only
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm typecheck                             # TypeScript validation
pnpm lint                                  # ESLint validation  
pnpm lint:fix                             # Auto-fix linting issues

# Expected: No TypeScript or linting errors
```

### Level 2: Unit Tests (Following Existing Patterns)

```typescript
// CREATE __tests__/background-removal.test.ts
describe('removeBackground', () => {
  it('should remove background from PNG image', async () => {
    const mockFile = new File(['test'], 'logo.png', { type: 'image/png' });
    const result = await removeBackground(mockFile);
    
    expect(result.transparentBlob.type).toBe('image/png');
    expect(result.originalUrl).toBeDefined();
    expect(result.transparentUrl).toBeDefined();
  });

  it('should handle unsupported browsers gracefully', async () => {
    // Mock unsupported browser
    delete (window as any).OffscreenCanvas;
    
    const mockFile = new File(['test'], 'logo.png', { type: 'image/png' });
    await expect(removeBackground(mockFile)).rejects.toThrow('Browser not supported');
  });
});

// CREATE __tests__/color-extraction.test.ts  
describe('extractColorPalette', () => {
  it('should extract 6 colors from image', async () => {
    const mockImageUrl = 'data:image/png;base64,test';
    const result = await extractColorPalette(mockImageUrl);
    
    expect(result.colors).toHaveLength(6);
    expect(result.colors[0]).toHaveProperty('hex');
    expect(result.colors[0]).toHaveProperty('area');
  });
});
```

```bash
# Run tests and iterate until passing:
pnpm test background-removal.test.ts
pnpm test color-extraction.test.ts
# If failing: Read error, fix code, re-run
```

### Level 3: Integration Testing

```bash
# Start development server
pnpm dev

# Manual testing checklist:
echo "✓ Logo upload works with drag-and-drop"
echo "✓ Background removal produces clean transparent image"  
echo "✓ Color palette shows 6 relevant brand colors"
echo "✓ Both logo versions uploaded to S3 correctly"
echo "✓ Component renders without background styling"
echo "✓ File size validation works (reject files > 5MB)"
echo "✓ Unsupported file types rejected gracefully"
echo "✓ Loading states display during processing"

# Browser compatibility testing:
echo "✓ Works in Chrome 88+"
echo "✓ Works in Firefox 79+"  
echo "✓ Works in Safari 14.1+"
echo "✓ Graceful fallback for older browsers"
```

### Level 4: Performance & Creative Validation

```bash
# Performance testing
echo "✓ Background removal completes in < 5 seconds for typical logos"
echo "✓ Color extraction completes in < 2 seconds"
echo "✓ UI remains responsive during processing"
echo "✓ Memory usage acceptable (< 100MB for processing)"

# Quality validation  
echo "✓ Background removal quality acceptable for branding use"
echo "✓ Color palette represents main brand colors accurately"
echo "✓ Transparent logos work well on various backgrounds"

# Business validation
echo "✓ S3 storage costs reasonable (< $0.01 per logo)"
echo "✓ Processing happens client-side (no server costs)"
echo "✓ Brand consistency maintained across platform"
```

## Final Validation Checklist

- [ ] All TypeScript types defined and used correctly
- [ ] Background removal works for PNG, JPG formats  
- [ ] Color extraction produces relevant brand colors
- [ ] S3 upload stores files in correct folder structure
- [ ] Component has transparent background (no styling)
- [ ] Error handling covers all failure scenarios
- [ ] Loading states provide clear user feedback
- [ ] File validation prevents invalid uploads
- [ ] Browser compatibility handled gracefully
- [ ] Performance acceptable for production use

---

## Anti-Patterns to Avoid

- ❌ Don't block UI thread during background removal - use Web Workers
- ❌ Don't store large images in component state - use URLs/blob URLs
- ❌ Don't ignore browser compatibility - provide fallbacks
- ❌ Don't skip file validation - validate size, type, dimensions
- ❌ Don't hardcode S3 folder paths - use environment configuration
- ❌ Don't ignore error states - provide clear user feedback
- ❌ Don't process images larger than 5MB - implement client-side limits
- ❌ Don't forget to revoke blob URLs - prevent memory leaks

## Confidence Score: 9/10

This PRP provides comprehensive context for successful one-pass implementation including:
- Complete codebase analysis and existing patterns
- Detailed library research with specific versions and gotchas  
- Step-by-step implementation tasks in correct order
- Executable validation gates for quality assurance
- Real-world considerations for performance and browser compatibility

The high confidence score reflects the thorough research, clear implementation path, and alignment with existing codebase patterns.