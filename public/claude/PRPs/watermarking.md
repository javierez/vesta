## FEATURE:

  Image Watermarking for Fotocasa Portal Integration
  - Add watermarking capability to property images when uploading to Fotocasa portal
  - Check account-level watermark preferences from accounts.portal_settings.general.watermarkEnabled
  - If enabled, overlay the account's transparent logo onto property images before sending to Fotocasa API
  - Use the transparent logo URL from accounts.preferences.logoTransparent

## EXAMPLES:

  Based on your current code structure:
  - src/server/portals/fotocasa.tsx:626-633 - Current image handling in PropertyDocument section
  - Account settings structure shows portal_settings.general.watermarkEnabled: true
  - Transparent logo available at preferences.logoTransparent URL

## DOCUMENTATION:

  - Image Processing: Look for libraries for server-side image manipulation
  - AWS S3 Integration: Your existing S3 setup for storing/retrieving images
  - Fotocasa API: Current integration in fotocasa.tsx file
  - Account Settings: Existing portal_settings structure in accounts table

  OTHER CONSIDERATIONS:

  - Image Processing Location: Server-side processing before API call vs client-side before upload
  - Caching: Cache watermarked images to avoid reprocessing on subsequent uploads
  - Logo Positioning: Determine consistent placement (corner, center, etc.)
  - Image Quality: Maintain original image quality while adding watermark
  - Error Handling: Fallback to original images if watermarking fails
  - Performance: Consider image processing time impact on Fotocasa upload flow
  - S3 Storage:  generate on-demand images, do not store them. Ready to publish images
  

  Implementation approach: Modify the buildFotocasaPayload function around line 626 to:
  1. Check account's watermarkEnabled setting
  2. If enabled, process each image URL to add the transparent logo watermark
  3. Either return processed image URLs or upload watermarked versions to S3 and return new URLs