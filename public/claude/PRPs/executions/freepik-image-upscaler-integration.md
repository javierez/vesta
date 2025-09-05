name: "Freepik Image Upscaler Precision API Integration"
description: |

## Purpose

Integrate the Freepik Image Upscaler Precision API into Vesta's Image Studio to transform the placeholder "Mejorar Calidad" button into a fully functional AI-powered image enhancement tool that provides real value to property professionals.

## Core Principles

1. **Context is King**: All necessary Freepik API documentation, codebase patterns, and implementation details included
2. **Validation Loops**: Executable tests and lints to ensure working code through iterative refinement
3. **Information Dense**: Uses exact patterns from Vesta codebase for consistency
4. **Progressive Success**: Start with basic integration, validate, then enhance with UI polish

---

## Goal

Transform the existing "Mejorar Calidad" (Improve Quality) placeholder button in Image Studio into a functional AI-powered image enhancement feature using Freepik's Image Upscaler Precision API, allowing users to upscale and enhance property images up to 10K resolution with AI-driven detail enhancement.

## Why

- **Business Value**: Provides real AI functionality that property professionals can use immediately to enhance listing photos
- **User Impact**: Higher quality property images lead to better listings and increased engagement
- **Integration**: Seamlessly integrates with existing Image Studio workflow without disrupting current features
- **Problem Solved**: Low-resolution or poor quality property photos can now be enhanced with AI, saving time and improving listing quality

## What

### User-visible behavior:
1. User clicks "Mejorar Calidad" button on an image in Image Studio
2. Processing begins immediately with progress indicator (only Light preset - optimized for cost)
3. Enhanced image appears overlaid with a draggable slider for before/after comparison
4. User can drag slider to reveal original (left) vs enhanced (right) image
5. User can save enhanced version or discard changes
6. When saved, enhanced image is optimistically added to gallery immediately

### Technical requirements:
- Asynchronous API integration with task status polling
- Base64 image encoding for API transmission
- Progress tracking and user feedback
- Error handling for API failures and rate limits
- Image size validation (max 10MB typical)
- Secure API key management

### Success Criteria

- [ ] "Mejorar Calidad" button triggers enhancement process immediately (no modal)
- [ ] Images are successfully enhanced via Freepik API with Light preset
- [ ] Progress feedback shows during processing
- [ ] Before/after slider comparison overlay appears
- [ ] Enhanced images save to property_images table and S3
- [ ] Optimistic UI update adds image to gallery instantly
- [ ] Error states handled gracefully
- [ ] API key secure and not exposed
- [ ] All existing Image Studio features continue working

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://docs.freepik.com/api-reference/image-upscaler-precision/post-image-upscaler-precision
  why: Official API documentation with endpoints, parameters, and response formats
  
- url: https://docs.freepik.com/api-reference/image-upscaler-precision/get-image-upscaler-precision
  why: Status checking endpoint for async task polling

- file: /src/app/api/properties/[id]/images/route.ts
  why: Pattern for authenticated API routes with proper error handling

- file: /src/lib/s3.ts
  why: Pattern for environment variable validation and external service integration

- file: /src/app/api/google/calendar/webhook/route.ts
  why: Pattern for handling async operations and webhook responses

- file: /src/components/appointments/appointment-modal.tsx
  why: Modal implementation pattern using Dialog components

- file: /src/components/propiedades/detail/energy-certificate-page.tsx
  why: File upload with progress tracking pattern

- file: /src/app/(dashboard)/propiedades/[id]/image-studio/page.tsx
  why: Current Image Studio implementation to modify

- file: /src/components/propiedades/detail/image-studio-gallery.tsx
  why: Gallery component that will display enhanced images

- docfile: /Users/javierperezgarcia/Downloads/vesta/public/claude/PRPs/future/freepik-image-upscaler-integration.md
  why: Original feature specification with API details
```

### Current Codebase tree (relevant sections)

```bash
src/
├── app/
│   ├── api/
│   │   └── properties/
│   │       └── [id]/
│   │           ├── images/route.ts           # Image API pattern
│   │           └── freepik-enhance/route.ts  # NEW - Freepik API endpoint
│   └── (dashboard)/
│       └── propiedades/
│           └── [id]/
│               └── image-studio/
│                   └── page.tsx              # Image Studio page
├── components/
│   ├── ui/
│   │   └── image-enhancement-modal.tsx      # NEW - Enhancement UI
│   └── propiedades/
│       └── detail/
│           ├── image-studio-gallery.tsx      # Gallery component
│           └── image-studio-tools.tsx        # Tools sidebar
├── hooks/
│   └── use-image-enhancement.tsx             # NEW - Enhancement hook
├── lib/
│   ├── freepik-client.ts                    # NEW - API client
│   └── image-utils.ts                       # NEW - Image utilities
└── types/
    └── freepik.ts                            # NEW - Type definitions
```

### Desired Codebase tree with files to be added and responsibility

```bash
src/
├── app/api/properties/[id]/freepik-enhance/
│   └── route.ts                              # Handles Freepik API calls, auth, and async task management
├── components/ui/
│   └── image-enhancement-modal.tsx           # Modal UI for enhancement settings and progress
├── hooks/
│   └── use-image-enhancement.tsx             # State management for enhancement process
├── lib/
│   ├── freepik-client.ts                    # Freepik API client with retry logic
│   └── image-utils.ts                       # Base64 encoding, size validation
└── types/
    └── freepik.ts                           # TypeScript interfaces for API
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Freepik API requires base64 encoded images
// Example: Buffer.from(arrayBuffer).toString('base64')

// CRITICAL: API is async - returns task_id that must be polled for completion
// Status endpoint: GET /v1/ai/image-upscaler-precision/{task_id}

// CRITICAL: Next.js App Router requires 'use client' for interactive components
// All modals and buttons with onClick need this directive

// CRITICAL: Environment variables in Next.js must be prefixed with NEXT_PUBLIC_ for client access
// Server-only vars (like API keys) should NOT have this prefix

// CRITICAL: Vesta uses Tailwind CSS - use className not class
// Gradient pattern: bg-gradient-to-r from-amber-400 to-rose-400

// CRITICAL: Authentication uses better-auth - check session in API routes
// Pattern: const session = await auth.api.getSession({ headers: await headers() })

// CRITICAL: File size limits - validate before sending to API
// Typical limit: 10MB for image files

// CRITICAL: Rate limiting - Freepik may have request limits
// Implement exponential backoff for retries
```

## Implementation Blueprint

### Data models and structure

```typescript
// src/types/freepik.ts
export interface FreepikEnhanceRequest {
  imageUrl: string;
  propertyId: bigint;
  referenceNumber: string;
  imageOrder: number;
}

export interface FreepikEnhanceResponse {
  taskId: string;
  status: 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
  generated?: string[];  // Enhanced image URLs
  error?: string;
}

export interface FreepikTaskStatus {
  id: string;
  status: 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
  progress?: number;
  result?: {
    generated: string[];
  };
  error?: string;
}

// Light preset optimized for cost
export const LIGHT_ENHANCEMENT_SETTINGS = {
  sharpen: 30,      // Lower value for cost optimization
  smartGrain: 5,    // Lower value for cost optimization
  ultraDetail: 20,  // Lower value for cost optimization
} as const;

// Comparison slider state
export interface ComparisonSliderState {
  isVisible: boolean;
  originalImage: string;
  enhancedImage: string;
  sliderPosition: number; // 0-100 percentage
}
```

### List of tasks to be completed to fulfill the PRP

```yaml
Task 1: Environment Setup and API Client
CREATE src/lib/freepik-client.ts:
  - PATTERN: Follow S3 client pattern from src/lib/s3.ts
  - Validate FREEPIK_API_KEY environment variable
  - Create authenticated fetch wrapper
  - Add retry logic with exponential backoff
  - Use LIGHT_ENHANCEMENT_SETTINGS for all requests
  - Export enhance and checkStatus functions

CREATE src/types/freepik.ts:
  - Copy interfaces from data models section above
  - Export LIGHT_ENHANCEMENT_SETTINGS constant
  - Export all types for use across codebase

Task 2: Image Processing Utilities
CREATE src/lib/image-utils.ts:
  - Function to convert image URL to base64
  - Function to validate image size (max 10MB)
  - Function to download image from URL
  - Function to generate new image filename for enhanced version
  - Error handling for invalid images

Task 3: API Route Implementation
CREATE src/app/api/properties/[id]/freepik-enhance/route.ts:
  - PATTERN: Copy auth from /src/app/api/properties/[id]/images/route.ts
  - POST endpoint to initiate enhancement
  - GET endpoint to check task status
  - On success: Upload enhanced image to S3
  - On success: Create property_images record
  - Return new propertyImage data for gallery update
  - Handle Freepik API errors gracefully

Task 4: Enhancement Hook with S3 Integration
CREATE src/hooks/use-image-enhancement.tsx:
  - State management for enhancement process
  - Polling logic for task status
  - Progress calculation
  - On completion: trigger S3 upload
  - On completion: create database record
  - Optimistic update for gallery
  - PATTERN: Similar to upload progress in energy-certificate-page.tsx

Task 5: Before/After Comparison Slider Component
CREATE src/components/ui/image-comparison-slider.tsx:
  - Draggable slider UI (like screenshot example)
  - Original image on left, enhanced on right
  - Touch/mouse drag support
  - Save/Discard buttons overlay
  - Smooth transition animations
  - Full-screen overlay mode

Task 6: Integrate with Image Studio Gallery
MODIFY src/components/propiedades/detail/image-studio-gallery.tsx:
  - ADD: State for comparison slider visibility
  - ADD: Handle "Mejorar Calidad" button click
  - ADD: Show comparison slider overlay
  - ADD: Optimistic gallery update on save
  - INTEGRATE: With existing image display logic

Task 7: Update Image Studio Tools
MODIFY src/components/propiedades/detail/image-studio-tools.tsx:
  - FIND: "Mejorar Calidad" card
  - CONVERT: From static card to active button
  - ADD: onClick handler to trigger enhancement
  - ADD: Loading state during processing
  - PRESERVE: All existing tool functionality

Task 8: Add Server Actions for S3/Database
CREATE src/app/actions/enhance-image.ts:
  - PATTERN: Copy from upload.ts actions
  - uploadEnhancedImageToS3 function
  - createEnhancedPropertyImage function
  - Handle S3 key generation
  - Return formatted property image data
```

### Per task pseudocode

```typescript
// Task 1: Freepik Client
// src/lib/freepik-client.ts
import { LIGHT_ENHANCEMENT_SETTINGS } from '~/types/freepik';

class FreepikClient {
  private apiKey: string;
  private baseUrl = 'https://api.freepik.com/v1/ai/image-upscaler-precision';

  constructor() {
    // PATTERN: Validate env vars like S3 client
    const apiKey = process.env.FREEPIK_API_KEY;
    if (!apiKey) {
      throw new Error('Missing FREEPIK_API_KEY environment variable');
    }
    this.apiKey = apiKey;
  }

  async enhance(imageBase64: string): Promise<FreepikEnhanceResponse> {
    // ALWAYS use Light preset for cost optimization
    const response = await this.fetchWithRetry('', {
      method: 'POST',
      headers: {
        'x-freepik-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
        sharpen: LIGHT_ENHANCEMENT_SETTINGS.sharpen,
        smart_grain: LIGHT_ENHANCEMENT_SETTINGS.smartGrain,
        ultra_detail: LIGHT_ENHANCEMENT_SETTINGS.ultraDetail,
      }),
    });

    // CRITICAL: Response includes task_id for polling
    return response.data;
  }

  async checkStatus(taskId: string): Promise<FreepikTaskStatus> {
    // Poll status endpoint
    const response = await this.fetchWithRetry(`/${taskId}`, {
      method: 'GET',
      headers: {
        'x-freepik-api-key': this.apiKey,
      },
    });

    return response.data;
  }

  private async fetchWithRetry(endpoint: string, options: RequestInit, retries = 3): Promise<any> {
    // PATTERN: Exponential backoff like webhook handling
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, options);
        
        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited - wait and retry
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            continue;
          }
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
}

// Task 3: API Route with S3 Integration
// src/app/api/properties/[id]/freepik-enhance/route.ts
import { uploadEnhancedImageToS3, createEnhancedPropertyImage } from '~/app/actions/enhance-image';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // PATTERN: Auth check from existing routes
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl, referenceNumber, currentImageOrder } = await request.json();
    const propertyId = BigInt((await params).id);

    // Validate property ownership
    // ... ownership check ...

    // Download and convert image to base64
    const imageBase64 = await imageUrlToBase64(imageUrl);
    
    // Validate size
    if (!validateImageSize(imageBase64)) {
      return NextResponse.json(
        { error: "Image too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Call Freepik API (always Light preset)
    const freepikClient = new FreepikClient();
    const result = await freepikClient.enhance(imageBase64);

    return NextResponse.json({
      success: true,
      taskId: result.task_id,
      status: result.status,
      referenceNumber,
      currentImageOrder,
    });
  } catch (error) {
    console.error("Enhancement error:", error);
    return NextResponse.json(
      { error: "Failed to enhance image" },
      { status: 500 }
    );
  }
}

// GET endpoint for status checking + S3 upload on success
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');
  const referenceNumber = searchParams.get('referenceNumber');
  const currentImageOrder = searchParams.get('currentImageOrder');

  // Check Freepik task status
  const freepikClient = new FreepikClient();
  const status = await freepikClient.checkStatus(taskId);

  if (status.status === 'SUCCESS' && status.result?.generated?.[0]) {
    // Download enhanced image
    const enhancedImageUrl = status.result.generated[0];
    const enhancedImageResponse = await fetch(enhancedImageUrl);
    const enhancedImageBuffer = await enhancedImageResponse.arrayBuffer();
    
    // Convert to File for S3 upload
    const enhancedFile = new File([enhancedImageBuffer], 'enhanced.jpg', { type: 'image/jpeg' });
    
    // Upload to S3 and create database record
    const newImageOrder = parseInt(currentImageOrder) + 0.5; // Place after current image
    const propertyImage = await uploadEnhancedImageToS3(
      enhancedFile,
      BigInt((await params).id),
      referenceNumber,
      newImageOrder
    );

    return NextResponse.json({
      status: 'SUCCESS',
      propertyImage, // Return full property image data for gallery update
    });
  }

  return NextResponse.json({ status: status.status });
}

// Task 4: Enhancement Hook with Gallery Integration
// src/hooks/use-image-enhancement.tsx
export function useImageEnhancement() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [enhancedPropertyImage, setEnhancedPropertyImage] = useState<PropertyImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const enhance = async (
    imageUrl: string, 
    propertyId: string, 
    referenceNumber: string,
    currentImageOrder: number
  ) => {
    setStatus('processing');
    setProgress(0);
    setError(null);

    try {
      // Start enhancement
      const response = await fetch(`/api/properties/${propertyId}/freepik-enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, referenceNumber, currentImageOrder }),
      });

      if (!response.ok) {
        throw new Error('Failed to start enhancement');
      }

      const { taskId } = await response.json();

      // Poll for status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(
            `/api/properties/${propertyId}/freepik-enhance?taskId=${taskId}&referenceNumber=${referenceNumber}&currentImageOrder=${currentImageOrder}`
          );
          const statusData = await statusResponse.json();

          if (statusData.status === 'SUCCESS') {
            clearInterval(pollInterval);
            setStatus('success');
            setProgress(100);
            setEnhancedPropertyImage(statusData.propertyImage);
            // Note: Don't show toast here - let UI handle it
          } else if (statusData.status === 'FAILED') {
            clearInterval(pollInterval);
            setStatus('error');
            setError(statusData.error || 'Enhancement failed');
            toast.error("Error al mejorar la imagen");
          } else {
            // Update progress (estimate based on time)
            setProgress((prev) => Math.min(prev + 10, 90));
          }
        } catch (error) {
          clearInterval(pollInterval);
          setStatus('error');
          setError('Failed to check status');
        }
      }, 2000); // Poll every 2 seconds

      // Cleanup on unmount
      return () => clearInterval(pollInterval);
    } catch (error) {
      setStatus('error');
      setError(error instanceof Error ? error.message : 'Enhancement failed');
      toast.error("Error al mejorar la imagen");
    }
  };

  return {
    enhance,
    status,
    progress,
    enhancedPropertyImage,
    error,
    reset: () => {
      setStatus('idle');
      setProgress(0);
      setEnhancedPropertyImage(null);
      setError(null);
    },
  };
}

// Task 5: Comparison Slider Component
// src/components/ui/image-comparison-slider.tsx
interface ImageComparisonSliderProps {
  originalImage: string;
  enhancedImage: string;
  isVisible: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function ImageComparisonSlider({
  originalImage,
  enhancedImage,
  isVisible,
  onSave,
  onDiscard,
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.min(100, Math.max(0, percentage)));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="relative h-full w-full" ref={containerRef}>
        {/* Original Image (Full) */}
        <Image
          src={originalImage}
          alt="Original"
          fill
          className="object-contain"
        />
        
        {/* Enhanced Image (Clipped) */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <Image
            src={enhancedImage}
            alt="Enhanced"
            fill
            className="object-contain"
          />
        </div>
        
        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={() => setIsDragging(true)}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
            <ChevronLeftRight className="w-6 h-6 text-gray-800" />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
          <Button
            onClick={onSave}
            className="bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar versión mejorada
          </Button>
          <Button
            onClick={onDiscard}
            variant="outline"
            className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4 mr-2" />
            Descartar
          </Button>
        </div>
      </div>
    </div>
  );
}

// Task 8: Server Actions
// src/app/actions/enhance-image.ts
export async function uploadEnhancedImageToS3(
  file: File,
  propertyId: bigint,
  referenceNumber: string,
  imageOrder: number,
): Promise<PropertyImage> {
  // PATTERN: Same as uploadPropertyImage but with enhanced naming
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const imageKey = `${referenceNumber}/images/enhanced_${imageOrder}_${nanoid(6)}.${fileExtension}`;
  const s3key = `s3://${process.env.AWS_S3_BUCKET}/${imageKey}`;
  
  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Upload to S3
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: imageKey,
      Body: buffer,
      ContentType: file.type,
    }),
  );
  
  const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;
  
  // Create database record
  const result = await createPropertyImage({
    propertyId,
    referenceNumber,
    imageUrl,
    isActive: true,
    imageKey,
    s3key,
    imageOrder,
    imageTag: 'ai_enhanced', // Mark as AI enhanced
  });
  
  return result;
}
```

### Integration Points

```yaml
DATABASE:
  - Optional: Add enhanced_images table if storing history
  - migration: "CREATE TABLE enhanced_images (id, original_image_id, enhanced_url, ...)"
  
CONFIG:
  - add to: .env
  - variable: "FREEPIK_API_KEY=your_api_key_here"
  - variable: "FREEPIK_API_URL=https://api.freepik.com/v1/ai/image-upscaler-precision"

COMPONENTS:
  - modify: src/components/propiedades/detail/image-studio-tools.tsx
  - add onClick to "Mejorar Calidad" button
  - import and use enhancement modal

UI STATE:
  - add to: Image Studio page state
  - selectedImage: Track which image is being enhanced
  - enhancementModalOpen: Control modal visibility
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm typecheck                    # Type checking
pnpm lint:fix                     # Linting with auto-fix
pnpm format:write                 # Format code

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests

```typescript
// CREATE src/lib/__tests__/freepik-client.test.ts
describe('FreepikClient', () => {
  it('should throw error if API key is missing', () => {
    delete process.env.FREEPIK_API_KEY;
    expect(() => new FreepikClient()).toThrow('Missing FREEPIK_API_KEY');
  });

  it('should handle rate limiting with retry', async () => {
    // Mock fetch to return 429 then success
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ task_id: '123' }) });
    
    const client = new FreepikClient();
    const result = await client.enhance('base64image', {});
    
    expect(result.task_id).toBe('123');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should poll status until complete', async () => {
    // Test polling logic
    const client = new FreepikClient();
    const mockStatus = jest.fn()
      .mockResolvedValueOnce({ status: 'IN_PROGRESS' })
      .mockResolvedValueOnce({ status: 'IN_PROGRESS' })
      .mockResolvedValueOnce({ status: 'SUCCESS', generated: ['url'] });
    
    // Test implementation
  });
});

// CREATE src/hooks/__tests__/use-image-enhancement.test.tsx
describe('useImageEnhancement', () => {
  it('should handle successful enhancement flow', async () => {
    const { result } = renderHook(() => useImageEnhancement());
    
    act(() => {
      result.current.enhance('image.jpg', '123', { sharpen: 50 });
    });
    
    expect(result.current.status).toBe('processing');
    
    // Wait for completion
    await waitFor(() => {
      expect(result.current.status).toBe('success');
      expect(result.current.enhancedImageUrl).toBeTruthy();
    });
  });

  it('should handle errors gracefully', async () => {
    // Test error scenarios
  });
});
```

```bash
# Run tests
pnpm test freepik-client.test.ts
pnpm test use-image-enhancement.test.tsx
```

### Level 3: Integration Test

```bash
# Build the application
pnpm build

# Start dev server
pnpm dev

# Test enhancement endpoint (Light preset is automatic)
curl -X POST http://localhost:3000/api/properties/1/freepik-enhance \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN" \
  -d '{
    "imageUrl": "https://example.com/image.jpg",
    "referenceNumber": "REF123",
    "currentImageOrder": 1
  }'

# Expected: {"success": true, "taskId": "...", "status": "IN_PROGRESS"}

# Check task status
curl "http://localhost:3000/api/properties/1/freepik-enhance?taskId=TASK_ID&referenceNumber=REF123&currentImageOrder=1" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN"

# Expected: {"status": "SUCCESS", "propertyImage": {...}}
```

### Level 4: Manual UI Testing

```bash
# Manual testing checklist
echo "✓ Click 'Mejorar Calidad' starts enhancement immediately"
echo "✓ Progress indicator shows during processing"
echo "✓ Comparison slider overlay appears on completion"
echo "✓ Slider drags smoothly between original/enhanced"
echo "✓ Save button adds image to gallery optimistically"
echo "✓ Discard button closes overlay without saving"
echo "✓ Enhanced images saved to S3 with proper naming"
echo "✓ Database records created with 'ai_enhanced' tag"
echo "✓ Error states show proper messages"
echo "✓ Works on mobile touch (375x667)"
echo "✓ Works on desktop mouse (1920x1080)"

# Performance testing
echo "✓ Image > 10MB shows error before API call"
echo "✓ Network timeout handled gracefully"
echo "✓ Gallery updates instantly on save (optimistic)"
echo "✓ S3 upload completes in background"
```

## Final Validation Checklist

- [ ] All tests pass: `pnpm test`
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm typecheck`
- [ ] Build succeeds: `pnpm build`
- [ ] Manual test successful: Enhancement works end-to-end
- [ ] Error cases handled gracefully (network, size, auth)
- [ ] API key not exposed in client code
- [ ] Progress feedback accurate
- [ ] Enhanced images save correctly
- [ ] Original Image Studio features unaffected

---

## Anti-Patterns to Avoid

- ❌ Don't expose FREEPIK_API_KEY to client - keep in server-only API route
- ❌ Don't skip image size validation - API costs money per call
- ❌ Don't ignore polling timeouts - set maximum poll duration
- ❌ Don't modify original images - always save enhanced as new
- ❌ Don't forget loading states - users need feedback
- ❌ Don't hardcode enhancement settings - use presets/config
- ❌ Don't skip error boundaries - API can fail
- ❌ Don't create new UI patterns - follow existing Vesta patterns

---

## Additional Implementation Notes

### Security Considerations
- API key stored in server environment only
- Validate property ownership before enhancement
- Sanitize all inputs
- Rate limit enhancement requests per user

### Performance Optimizations
- Cache enhanced images in S3
- Compress images before sending to API
- Implement request debouncing
- Lazy load enhanced images

### Future Enhancements
- Batch enhancement for multiple images
- Enhancement history/versions
- A/B comparison slider component
- Cost tracking per property/user

## Confidence Score: 8/10

**Rationale**: High confidence due to comprehensive research of existing patterns, clear API documentation, and similar async implementations already in the codebase. Points deducted for potential unknowns in Freepik API behavior under load and exact cost implications.