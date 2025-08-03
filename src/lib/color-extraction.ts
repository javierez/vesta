import { extractColors } from 'extract-colors';
import type { ColorPalette, ColorInfo } from "~/types/brand";

// Type definitions for extract-colors library
interface ExtractedColor {
  red: number;
  green: number;
  blue: number;
  hex: string;
  area: number;
  hue?: number;
  saturation?: number;
  lightness?: number;
}

/**
 * Extract a color palette from an image URL
 * Returns 6 most prominent colors sorted by area coverage
 */
export async function extractColorPalette(imageUrl: string): Promise<ColorPalette> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    
    // Handle cross-origin images (important for S3 URLs)
    image.crossOrigin = 'anonymous';
    
    image.onload = async () => {
      try {
        console.log('Starting color extraction from image:', imageUrl);
        
        // Configure extraction options for best brand color results
        const colors = await extractColors(image, {
          pixels: 10000,              // Higher pixel count for better accuracy
          distance: 0.22,             // Color similarity threshold
          colorValidator: (red: number, green: number, blue: number, alpha = 255) => {
            // Filter out very transparent pixels
            if (alpha < 250) return false;
            
            // Filter out colors that are too close to white or black for branding
            const brightness = (red + green + blue) / 3;
            return brightness > 20 && brightness < 235;
          }
        });
        
        // Sort by area coverage (most prominent first) and take top 6
        const sortedColors = colors
          .sort((a: ExtractedColor, b: ExtractedColor) => b.area - a.area)
          .slice(0, 6)
          .map((color: ExtractedColor) => ({
            hex: color.hex,
            rgb: {
              r: Math.round(color.red),
              g: Math.round(color.green),
              b: Math.round(color.blue)
            },
            hsl: {
              h: Math.round(color.hue ?? 0),
              s: Math.round((color.saturation ?? 0) * 100),
              l: Math.round((color.lightness ?? 0) * 100)
            },
            area: color.area
          }));
        
        // Ensure we have exactly 6 colors (pad with neutral colors if needed)
        const paddedColors = ensureSixColors(sortedColors);
        
        console.log('Color extraction completed, found colors:', paddedColors.length);
        
        resolve({
          colors: paddedColors
        });
      } catch (error) {
        console.error('Color extraction failed:', error);
        reject(new Error('Failed to extract colors from image'));
      }
    };
    
    image.onerror = () => {
      console.error('Failed to load image for color extraction:', imageUrl);
      reject(new Error('Failed to load image for color extraction'));
    };
    
    // Start loading the image
    image.src = imageUrl;
  });
}

/**
 * Ensure we always return exactly 6 colors for consistent branding
 * Pads with neutral colors if fewer colors are found
 */
function ensureSixColors(colors: ColorInfo[]): ColorInfo[] {
  const targetCount = 6;
  
  if (colors.length >= targetCount) {
    return colors.slice(0, targetCount);
  }
  
  // Neutral colors to use as padding for brand palettes
  const neutralColors: ColorInfo[] = [
    {
      hex: '#2D3748',
      rgb: { r: 45, g: 55, b: 72 },
      hsl: { h: 210, s: 23, l: 23 },
      area: 0
    },
    {
      hex: '#4A5568',
      rgb: { r: 74, g: 85, b: 104 },
      hsl: { h: 218, s: 17, l: 35 },
      area: 0
    },
    {
      hex: '#718096',
      rgb: { r: 113, g: 128, b: 150 },
      hsl: { h: 214, s: 15, l: 52 },
      area: 0
    },
    {
      hex: '#A0AEC0',
      rgb: { r: 160, g: 174, b: 192 },
      hsl: { h: 214, s: 15, l: 69 },
      area: 0
    },
    {
      hex: '#CBD5E0',
      rgb: { r: 203, g: 213, b: 224 },
      hsl: { h: 211, s: 16, l: 84 },
      area: 0
    }
  ];
  
  const paddedColors = [...colors];
  
  // Add neutral colors until we have 6
  for (let i = colors.length; i < targetCount; i++) {
    const neutralIndex = i - colors.length;
    if (neutralIndex < neutralColors.length) {
      paddedColors.push(neutralColors[neutralIndex]!);
    }
  }
  
  return paddedColors.slice(0, targetCount);
}

/**
 * Extract just the hex values from a color palette
 * Useful for storing in database or simple display
 */
export function getHexColors(colors: ColorInfo[]): string[] {
  return colors.map(color => color.hex);
}

/**
 * Validate if a color is suitable for branding
 * Checks contrast, saturation, and usability
 */
export function isGoodBrandColor(color: ColorInfo): boolean {
  const { rgb, hsl } = color;
  
  // Calculate relative luminance for contrast checking
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  
  // Good brand colors should:
  // 1. Not be too close to pure white or black
  // 2. Have reasonable saturation (not too gray)
  // 3. Have good contrast potential
  
  const isNotTooLight = luminance < 0.9;
  const isNotTooDark = luminance > 0.1;
  const hasGoodSaturation = hsl.s > 15; // At least 15% saturation
  
  return isNotTooLight && isNotTooDark && hasGoodSaturation;
}

/**
 * Generate a complementary color palette based on primary brand color
 * Useful for creating brand variations
 */
export function generateComplementaryColors(primaryHex: string): string[] {
  // This is a simplified implementation
  // In a real app, you might want to use a proper color theory library
  
  const rgb = hexToRgb(primaryHex);
  if (!rgb) return [primaryHex];
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  // Generate complementary colors by rotating hue
  const complementaryColors = [];
  
  for (let i = 0; i < 5; i++) {
    const newHue = (hsl.h + (i * 60)) % 360; // Rotate hue by 60 degrees
    const newRgb = hslToRgb(newHue, hsl.s, hsl.l);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    complementaryColors.push(newHex);
  }
  
  return [primaryHex, ...complementaryColors];
}

// Helper color conversion functions
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1]!, 16),
    g: parseInt(result[2]!, 16),
    b: parseInt(result[3]!, 16)
  } : null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number;
  const l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let r: number, g: number, b: number;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}