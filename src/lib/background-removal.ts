import type { BackgroundRemovalResult } from "~/types/brand";

/**
 * Browser compatibility check for background removal functionality
 */
function isBrowserSupported(): boolean {
  // Check for OffscreenCanvas support (required by @imgly/background-removal)
  if (typeof window === "undefined") {
    return false; // Server-side
  }
  
  return !!(window.OffscreenCanvas && window.Worker);
}

/**
 * Remove background from an image file using @imgly/background-removal
 * Falls back gracefully for unsupported browsers
 */
export async function removeBackground(file: File): Promise<BackgroundRemovalResult> {
  // Browser compatibility check
  if (!isBrowserSupported()) {
    throw new Error(
      'Browser not supported for background removal. Please use Chrome 88+, Firefox 79+, Safari 14.1+, or Edge 88+'
    );
  }

  // File validation
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Size check (5MB limit as per PRP)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Image file too large. Maximum size is 5MB.');
  }

  try {
    // Dynamic import to avoid loading in unsupported browsers
    const { removeBackground: imglyRemoveBackground } = await import('@imgly/background-removal');
    
    console.log('Starting background removal for file:', file.name);
    
    // Process the image
    const blob = await imglyRemoveBackground(file);
    
    // Ensure the result is a PNG for transparency support
    const transparentBlob = new Blob([blob], { type: 'image/png' });
    
    // Create object URLs for preview
    const originalUrl = URL.createObjectURL(file);
    const transparentUrl = URL.createObjectURL(transparentBlob);
    
    console.log('Background removal completed successfully');
    
    return {
      originalBlob: file,
      transparentBlob,
      originalUrl,
      transparentUrl,
    };
  } catch (error) {
    console.error('Background removal failed:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('network')) {
        throw new Error('Network error during background removal. Please check your connection.');
      }
      if (error.message.includes('memory') || error.message.includes('size')) {
        throw new Error('Image too complex for processing. Please try a simpler image.');
      }
    }
    
    throw new Error('Failed to remove background. Please try again with a different image.');
  }
}

/**
 * Cleanup object URLs to prevent memory leaks
 */
export function cleanupUrls(urls: string[]): void {
  urls.forEach(url => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
}

/**
 * Check if current browser supports background removal
 * Useful for conditionally showing UI elements
 */
export function canRemoveBackground(): boolean {
  return isBrowserSupported();
}

/**
 * Get browser support information for debugging
 */
export function getBrowserSupportInfo(): {
  supported: boolean;
  features: {
    offscreenCanvas: boolean;
    webWorkers: boolean;
    webAssembly: boolean;
  };
} {
  if (typeof window === "undefined") {
    return {
      supported: false,
      features: {
        offscreenCanvas: false,
        webWorkers: false,
        webAssembly: false,
      },
    };
  }

  const features = {
    offscreenCanvas: !!window.OffscreenCanvas,
    webWorkers: !!window.Worker,
    webAssembly: !!window.WebAssembly,
  };

  return {
    supported: Object.values(features).every(Boolean),
    features,
  };
}