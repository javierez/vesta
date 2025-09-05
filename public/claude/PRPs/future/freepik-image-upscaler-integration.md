# Freepik Image Upscaler API Integration Plan

## Overview
Integrate the Freepik Image Upscaler Precision API into the existing "Mejorar Calidad" tool card to provide real image enhancement functionality powered by AI.

## Key Research Findings

### Freepik API Technical Details:
- **Endpoint**: POST /v1/ai/image-upscaler-precision
- **Authentication**: x-freepik-api-key header
- **Input**: Base64 encoded image (required)
- **Async Processing**: Returns task_id for status tracking
- **Output**: Enhanced image URLs up to 10K resolution (16x upscale)
- **Parameters**: sharpen, smart_grain, ultra_detail for fine-tuning

### API Capabilities:
- AI-powered upscaling up to 16K resolution (output capped at 10K)
- Adds visual details and elements during upscaling
- Advanced quality enhancement beyond simple resolution increase
- Webhook support for completion notifications

### Example API Request:
```bash
curl --request POST \
  --url https://api.freepik.com/v1/ai/image-upscaler-precision \
  --header 'Content-Type: application/json' \
  --header 'x-freepik-api-key: <api-key>' \
  --data '{
    "image": "base64_encoded_image",
    "webhook_url": "<optional_webhook>",
    "sharpen": 50,
    "smart_grain": 7,
    "ultra_detail": 30
  }'
```

### Response Format:
```json
{
  "data": {
    "generated": ["<output_urls>"],
    "task_id": "<unique_task_identifier>",
    "status": "IN_PROGRESS"
  }
}
```

## Implementation Plan

### 1. Environment Setup
**API Configuration:**
- Add `FREEPIK_API_KEY` to environment variables
- Create API client service for Freepik integration
- Add error handling and rate limiting logic

### 2. Backend API Route
**Create**: `/src/app/api/image-enhancement/route.ts`

**Features:**
- Accept image data and enhancement parameters
- Convert image to base64 format
- Make request to Freepik API with proper authentication
- Handle async processing with task tracking
- Return enhanced image URL when ready
- Implement proper error handling and validation

**Request Flow:**
```
1. Receive image data from frontend
2. Validate image format/size
3. Convert to base64
4. Send to Freepik API
5. Poll task status until complete
6. Return enhanced image URL
```

### 3. Frontend Integration
**Modify**: `/src/app/(dashboard)/propiedades/[id]/image-studio/page.tsx`

**Enhanced "Mejorar Calidad" Button:**
- Convert from static card to interactive button
- Add loading states with progress indicators
- Show processing status and estimated time
- Display success/error states
- Handle image replacement in gallery

**UI States:**
- **Idle**: Default clickable state
- **Processing**: Loading spinner with "Mejorando imagen..." text
- **Success**: Brief success indicator before showing result
- **Error**: Error message with retry option

### 4. Image Gallery Integration
**Modify**: `/src/components/propiedades/detail/image-studio-gallery.tsx`

**Features:**
- Add enhanced image preview overlay
- Before/after comparison slider
- Option to save/replace original image
- Progress tracking for enhancement process
- Integration with existing orientation controls

### 5. Enhanced User Experience
**Processing Feedback:**
- Real-time progress updates
- Estimated completion time
- Cancel option for long-running tasks
- Before/after image comparison

**Quality Controls:**
- Preset enhancement levels (Light, Medium, Strong)
- Advanced controls for sharpen, detail, grain
- Preview mode before final processing
- Batch processing for multiple images

### 6. Error Handling & Validation
**Image Validation:**
- File size limits (typically 10MB max)
- Supported formats (JPG, PNG, WebP)
- Resolution requirements
- Content validation

**API Error Handling:**
- Rate limit exceeded notifications
- Invalid API key handling
- Network timeout management
- Graceful degradation

### 7. Cost Management
**Usage Tracking:**
- Display credit usage per enhancement
- Show remaining API credits
- Implement usage warnings
- Cost estimation before processing

### 8. Security & Performance
**Security:**
- Secure API key storage
- Input sanitization
- CORS configuration
- Request rate limiting

**Performance:**
- Image compression before upload
- Caching strategies for processed images
- Lazy loading for enhanced images
- Cleanup of temporary files

## Files to Create/Modify

### New Files:
- `/src/lib/freepik-client.ts` - API client service
- `/src/app/api/image-enhancement/route.ts` - Backend API endpoint
- `/src/components/ui/image-enhancement-modal.tsx` - Enhancement interface
- `/src/hooks/use-image-enhancement.tsx` - Custom hook for state management

### Modified Files:
- `/src/app/(dashboard)/propiedades/[id]/image-studio/page.tsx` - Interactive button
- `/src/components/propiedades/detail/image-studio-gallery.tsx` - Enhanced image display
- `/.env` - Add Freepik API key
- `/src/types/image-enhancement.ts` - Type definitions

## API Pricing & Considerations

### Cost Structure:
- Pay-as-you-go model with no upfront costs
- Pricing based on output image resolution
- Higher resolution outputs = higher costs per upscale
- Credits consumed per AI tool usage

### Usage Restrictions:
- Cannot create standalone upscaling service that competes with Freepik
- Must be embedded within broader application functionality
- API Services must enhance, not define primary app functionality

### Best Practices:
- Experiment with different enhancement engines for optimal results
- Use prompt weighting for specific image improvements
- For portraits: "(young woman:1.3), (cute young face:1.2)" to prevent aging
- Reuse original prompts for AI-generated images for better results

## Expected User Flow
1. User clicks "Mejorar Calidad" button in Image Studio
2. Enhancement modal opens with quality settings options
3. User selects enhancement level (Light/Medium/Strong) or custom settings
4. Processing begins with live progress updates and estimated time
5. Enhanced image appears with before/after comparison slider
6. User can save/replace original or try different enhancement settings
7. Enhanced image integrates seamlessly with existing gallery system

## Benefits
- **Real AI functionality** that works immediately
- **Professional image enhancement** for property listings up to 16x resolution
- **Seamless integration** with existing Vesta Image Studio
- **Cost-effective** pay-per-use model with transparent pricing
- **High-quality results** powered by Magnific.ai technology
- **Advanced controls** for fine-tuning enhancement parameters

## Technical Implementation Notes
- Async processing requires proper task management and status polling
- Base64 encoding needed for image transmission
- Webhook integration recommended for better UX on long processing times
- Rate limiting and error handling essential for production use
- Image validation prevents API errors and unexpected costs

This implementation transforms the placeholder "Mejorar Calidad" button into a fully functional AI-powered image enhancement tool that provides real value to property professionals using Vesta.