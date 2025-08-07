name: "Image Watermarking for Fotocasa Portal Integration - Context-Rich Implementation"
description: |

## Purpose

Comprehensive PRP for implementing dynamic image watermarking when uploading property images to Fotocasa portal, with proper context, validation loops, and self-refinement capabilities for one-pass implementation success.

---

## Goal

Implement dynamic image watermarking functionality that overlays account transparent logos onto property images before sending to Fotocasa API, with proper account settings integration, error handling, and performance optimization.

## Why

- **Business Value**: Provides branding consistency for real estate agencies across portal integrations
- **User Impact**: Ensures agency logo visibility on all published property images without manual editing
- **Integration**: Seamlessly integrates with existing Fotocasa portal workflow and account settings system
- **Problems Solved**: Manual image editing, brand consistency issues, and scalable watermarking for multiple properties

## What

User-visible behavior: When watermarking is enabled in account portal settings, all property images automatically include the agency's transparent logo overlay when published to Fotocasa portal.

Technical requirements: Server-side image processing with Sharp library, S3 integration for logo retrieval, dynamic watermark positioning, and fallback handling.

### Success Criteria

- [ ] Watermarking respects `accounts.portal_settings.general.watermarkEnabled` boolean flag
- [ ] Uses transparent logo from `accounts.preferences.logoTransparent` URL
- [ ] Processes images dynamically during Fotocasa API payload generation
- [ ] Maintains original image quality while adding watermark
- [ ] Provides graceful fallback to original images if watermarking fails
- [ ] Supports different watermark positions (bottom-right default)
- [ ] Performance impact < 2 seconds per image processing
- [ ] No permanent storage of watermarked images (on-demand generation)

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://sharp.pixelplumbing.com/
  why: Sharp library documentation for image processing and composite operations
  critical: composite() method for watermarking, resize() for dynamic sizing

- url: https://sharp.pixelplumbing.com/api-composite#composite
  why: Specific watermarking implementation patterns and gravity options
  critical: blend modes, positioning options, and performance considerations

- url: https://mohammedshamseerpv.medium.com/adding-and-resizing-a-watermark-on-an-image-using-node-js-with-sharp-17d2738e4ad5
  why: Real-world watermarking implementation with dynamic sizing
  critical: Resize watermark to 30% of image width for consistency

- file: /Users/javierperezgarcia/Downloads/vesta/src/server/portals/fotocasa.tsx
  why: Current image handling in PropertyDocument section (lines 626-633), integration point
  critical: buildFotocasaPayload function modification point

- file: /Users/javierperezgarcia/Downloads/vesta/src/server/queries/accounts.ts
  why: Account settings query patterns, portalSettings and preferences access
  critical: JSON field handling and account ID resolution patterns

- file: /Users/javierperezgarcia/Downloads/vesta/src/lib/s3.ts
  why: Existing S3 integration patterns and image download utilities
  critical: S3Client setup, error handling, and CORS configuration

- file: /Users/javierperezgarcia/Downloads/vesta/src/lib/color-extraction.ts
  why: Existing image processing patterns and error handling
  critical: Image loading with crossOrigin, performance considerations

- docfile: /Users/javierperezgarcia/Downloads/vesta/src/types/portal-settings.ts
  why: PortalConfigurationData interface and watermark settings structure
  critical: TypeScript interfaces for watermarkEnabled and watermarkPosition
```

### Current Codebase Tree

```bash
src/
├── server/
│   ├── portals/
│   │   └── fotocasa.tsx              # MODIFY: buildFotocasaPayload function
│   ├── queries/
│   │   ├── accounts.ts               # READ: Account settings patterns
│   │   └── property_images.ts        # READ: Image retrieval patterns
│   └── s3.ts                         # READ: S3 integration patterns
├── lib/
│   ├── s3.ts                         # READ: S3 client setup
│   ├── color-extraction.ts           # READ: Image processing patterns
│   └── images.ts                     # READ: Image utilities
├── types/
│   └── portal-settings.ts            # READ: Watermark settings types
└── env.js                           # READ: Environment configuration
```

### Desired Codebase Tree

```bash
src/
├── lib/
│   └── watermark.ts                 # CREATE: Core watermarking utilities
├── server/
│   ├── portals/
│   │   └── fotocasa.tsx             # MODIFY: Add watermarking to image processing
│   └── utils/
│       └── image-processing.ts      # CREATE: Reusable image processing utilities
└── types/
    └── watermark.ts                 # CREATE: Watermarking types and interfaces
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Sharp requires platform-specific binaries for AWS Lambda
// Install with: npm install --arch=x64 --platform=linux sharp (for deployment)

// CRITICAL: S3 image URLs require CORS configuration for client-side processing
// Pattern: image.crossOrigin = "anonymous" before loading

// CRITICAL: Sharp composite() gravity options
// Available: 'north', 'northeast', 'east', 'southeast' (default for bottom-right)

// CRITICAL: Next.js requires 'use server' directive for server actions
// All functions in fotocasa.tsx must be server-side only

// CRITICAL: Account settings JSON fields require type casting
// Pattern: (account.portalSettings as Record<string, unknown>) ?? {}

// CRITICAL: Image processing can be memory intensive
// Sharp automatically handles memory cleanup, but large images may timeout

// CRITICAL: S3 URLs have specific format patterns in this codebase
// Format: https://bucket.s3.region.amazonaws.com/key

// CRITICAL: Error handling must provide graceful fallbacks
// Never fail the entire Fotocasa upload if watermarking fails
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Watermarking configuration types
interface WatermarkConfig {
  enabled: boolean;
  logoUrl: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity?: number;
  size?: number; // Percentage of image width (default: 30)
}

// Watermarking result type
interface WatermarkResult {
  success: boolean;
  imageUrl?: string;
  imageBuffer?: Buffer;
  error?: string;
}

// Enhanced PropertyDocument for watermarked images
interface EnhancedPropertyDocument extends PropertyDocument {
  originalUrl: string;
  watermarked: boolean;
}

// Account settings extension (already exists in portal-settings.ts)
interface PortalConfigurationData {
  general: {
    watermarkEnabled: boolean;
    watermarkPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  };
}
```

### List of Tasks (Ordered Implementation)

```yaml
Task 1: Create Core Watermarking Utility
CREATE src/lib/watermark.ts:
  - IMPLEMENT downloadImageBuffer function for S3 URL processing
  - IMPLEMENT addWatermark function using Sharp composite
  - IMPLEMENT dynamic watermark sizing (30% of image width)
  - MIRROR error handling patterns from src/lib/color-extraction.ts
  - INCLUDE comprehensive TypeScript types

Task 2: Create Image Processing Server Utilities
CREATE src/server/utils/image-processing.ts:
  - IMPLEMENT processImageWithWatermark server action
  - INTEGRATE with existing S3 patterns from src/server/s3.ts
  - INCLUDE proper error boundaries and fallback logic
  - MIRROR authentication patterns from existing server functions

Task 3: Enhance Account Settings Query
MODIFY src/server/queries/accounts.ts:
  - ADD getAccountWatermarkConfig function
  - EXTRACT watermark settings from portalSettings and preferences
  - FOLLOW existing JSON field handling patterns
  - INCLUDE proper TypeScript typing

Task 4: Integrate Watermarking into Fotocasa Portal
MODIFY src/server/portals/fotocasa.tsx:
  - FIND PropertyDocument section (lines 626-633)
  - INJECT watermarking logic before image URL assignment
  - PRESERVE existing image ordering and metadata
  - MAINTAIN backward compatibility with non-watermarked accounts

Task 5: Add Watermarking Types
CREATE src/types/watermark.ts:
  - DEFINE comprehensive watermarking interfaces
  - EXTEND existing portal-settings types
  - INCLUDE error handling and result types

Task 6: Testing and Validation
CREATE comprehensive test scenarios:
  - Test with watermarking enabled/disabled
  - Test with invalid logo URLs
  - Test with various image sizes and formats
  - Test performance with multiple images
```

### Per Task Pseudocode

```typescript
// Task 1: Core Watermarking Utility
// File: src/lib/watermark.ts
export async function addWatermark(
  imageBuffer: Buffer,
  watermarkUrl: string,
  position: WatermarkPosition = 'southeast'
): Promise<WatermarkResult> {
  try {
    // PATTERN: Download watermark from S3 with CORS headers
    const watermarkBuffer = await downloadImageBuffer(watermarkUrl);
    
    // CRITICAL: Get image dimensions for responsive watermark sizing
    const { width } = await sharp(imageBuffer).metadata();
    const watermarkWidth = Math.floor(width * 0.3); // 30% of image width
    
    // CRITICAL: Resize watermark dynamically
    const resizedWatermark = await sharp(watermarkBuffer)
      .resize(watermarkWidth)
      .toBuffer();
    
    // PATTERN: Use Sharp composite with gravity positioning
    const watermarkedBuffer = await sharp(imageBuffer)
      .composite([{
        input: resizedWatermark,
        gravity: position, // 'southeast' for bottom-right
        blend: 'over'
      }])
      .toBuffer();
    
    return { success: true, imageBuffer: watermarkedBuffer };
  } catch (error) {
    // CRITICAL: Never throw - return error for graceful handling
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Watermarking failed' 
    };
  }
}

// Task 4: Fotocasa Integration
// File: src/server/portals/fotocasa.tsx (modify existing function)
export async function buildFotocasaPayload(
  listingId: number,
  visibilityMode = 1,
  hidePrice = false,
): Promise<FotocasaProperty> {
  // ... existing code ...
  
  // Get listing details and property images
  const listing = await getListingDetailsWithAuth(listingId);
  const images = await getPropertyImages(listing.propertyId);
  
  // NEW: Get account watermark configuration
  const accountId = await getAccountIdForListing(listingId);
  const watermarkConfig = await getAccountWatermarkConfig(accountId);
  
  // NEW: Process images with watermarking if enabled
  const processedImages = await Promise.all(
    images.map(async (image) => {
      if (!watermarkConfig.enabled || !watermarkConfig.logoUrl) {
        return image; // Return original if watermarking disabled
      }
      
      try {
        // CRITICAL: Download and process image
        const imageBuffer = await downloadImageBuffer(image.imageUrl);
        const watermarkResult = await addWatermark(
          imageBuffer, 
          watermarkConfig.logoUrl,
          watermarkConfig.position || 'southeast'
        );
        
        if (watermarkResult.success && watermarkResult.imageBuffer) {
          // PATTERN: Convert buffer to data URL for immediate use
          const watermarkedUrl = `data:image/jpeg;base64,${watermarkResult.imageBuffer.toString('base64')}`;
          return { ...image, imageUrl: watermarkedUrl, watermarked: true };
        }
      } catch (error) {
        // CRITICAL: Log but don't fail - graceful degradation
        console.warn(`Watermarking failed for image ${image.imageUrl}:`, error);
      }
      
      return image; // Fallback to original
    })
  );
  
  // Build PropertyDocument with processed images
  const propertyDocuments: PropertyDocument[] = processedImages
    .sort((a, b) => (a.imageOrder || 0) - (b.imageOrder || 0))
    .map((image) => ({
      TypeId: 1,
      Url: image.imageUrl,
      SortingId: image.imageOrder ?? 1,
    }));
    
  // ... rest of existing code ...
}
```

### Integration Points

```yaml
DEPENDENCIES:
  - add: "sharp": "^0.33.0" (latest stable version)
  - verify: existing S3 client configuration
  - verify: existing account settings query patterns

ENVIRONMENT:
  - verify: AWS_S3_BUCKET, AWS_REGION for S3 access
  - verify: S3 CORS configuration allows image downloads

DATABASE:
  - no changes: uses existing accounts.portalSettings and preferences JSON fields
  - pattern: watermarkEnabled in general settings
  - pattern: logoTransparent URL in preferences

API:
  - modify: buildFotocasaPayload function in fotocasa.tsx
  - add: watermarking utility functions
  - preserve: existing Fotocasa API contract
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm typecheck                       # TypeScript validation
pnpm lint                           # ESLint checking
pnpm format:write                   # Prettier formatting

# Expected: No errors. If type errors, check Sharp types installation:
# npm install --save-dev @types/sharp
```

### Level 2: Unit Tests (Manual - No Test Framework Present)

```typescript
// Manual testing scenarios in development
// CREATE test-watermarking.ts in root for development testing:

async function testWatermarkingScenarios() {
  // Test 1: Basic watermarking
  console.log('Testing basic watermarking...');
  const testImageUrl = 'https://test-bucket.s3.amazonaws.com/test-image.jpg';
  const testWatermarkUrl = 'https://test-bucket.s3.amazonaws.com/logo.png';
  
  const result = await addWatermark(testImageBuffer, testWatermarkUrl);
  console.log('Basic watermarking result:', result.success ? '✅ Success' : '❌ Failed');
  
  // Test 2: Invalid watermark URL
  console.log('Testing invalid watermark URL...');
  const invalidResult = await addWatermark(testImageBuffer, 'invalid-url');
  console.log('Invalid URL handling:', !invalidResult.success ? '✅ Graceful failure' : '❌ Should fail');
  
  // Test 3: Large image processing
  console.log('Testing large image processing...');
  // Load 5MB+ test image and verify performance
  
  // Test 4: Account settings integration
  console.log('Testing account settings...');
  const accountConfig = await getAccountWatermarkConfig(testAccountId);
  console.log('Account config loaded:', accountConfig ? '✅ Success' : '❌ Failed');
}

// Run during development: tsx test-watermarking.ts
```

### Level 3: Integration Test

```bash
# Start development server
pnpm dev

# Test the Fotocasa integration with watermarking
# 1. Create test listing with images
# 2. Enable watermarking in account settings
# 3. Build Fotocasa payload and verify watermarked images

# Manual verification steps:
echo "✓ Account with watermarkEnabled: true"
echo "✓ Account has logoTransparent URL set" 
echo "✓ Listing has property images"
echo "✓ buildFotocasaPayload includes watermarked images"
echo "✓ Original images preserved if watermarking fails"
echo "✓ Performance acceptable (<2s per image)"
```

### Level 4: Creative Validation Methods

```bash
# Performance validation
# - Test with 10+ images simultaneously
# - Monitor memory usage during processing
# - Verify no memory leaks with repeated processing

# Quality validation  
# - Visual inspection of watermarked images
# - Verify watermark positioning consistency
# - Check image quality preservation

# Error handling validation
# - Test with corrupted images
# - Test with invalid S3 URLs
# - Test with network timeouts
# - Verify graceful fallbacks in all scenarios

# Real-world validation
# - Test with actual customer data
# - Verify Fotocasa API accepts watermarked images
# - Monitor error rates in production logs
```

## Final Validation Checklist

- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No linting errors: `pnpm lint`  
- [ ] Code formatted: `pnpm format:write`
- [ ] Manual watermarking test successful
- [ ] Account settings integration working
- [ ] Fotocasa payload includes watermarked images
- [ ] Graceful fallback on watermarking failure
- [ ] Performance acceptable (<2s per image)
- [ ] Error handling comprehensive and user-friendly
- [ ] Memory usage stable during processing
- [ ] Documentation comments added to new functions

---

## Anti-Patterns to Avoid

- ❌ Don't fail Fotocasa upload if watermarking fails - always provide fallback
- ❌ Don't store watermarked images permanently - generate on-demand only
- ❌ Don't hardcode watermark positions - use account configuration
- ❌ Don't process images synchronously - use async patterns
- ❌ Don't ignore memory cleanup - Sharp handles it automatically
- ❌ Don't skip error logging - log warnings for debugging
- ❌ Don't modify existing image URLs - preserve original references
- ❌ Don't assume all images are processable - handle various formats gracefully

## Confidence Score: 9/10

This PRP provides comprehensive context including:
✅ Detailed codebase research with specific file references
✅ External documentation with Sharp library specifics  
✅ Real implementation patterns from existing code
✅ Comprehensive error handling strategies
✅ Performance considerations and testing approaches
✅ Clear validation loops with executable steps
✅ Specific gotchas and library quirks documented
✅ Progressive implementation with clear task ordering

Confidence reduced by 1 point due to:
- No existing test framework requiring manual validation
- Sharp library deployment considerations for production environment