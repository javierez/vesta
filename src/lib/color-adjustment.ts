/**
 * Color adjustment utilities for making colors more appealing
 * Based on color theory principles for creating harmonious, less vibrant palettes
 */

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error('Invalid hex color');
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Adjustment strategies for making colors more appealing
 */
export const ColorAdjustmentStrategies = {
  /**
   * Pastel: Mix with white to create soft, less saturated colors
   * Perfect for creating calming, professional palettes
   */
  pastel: (hex: string, intensity = 0.5): string => {
    const { r, g, b } = hexToRgb(hex);
    const whiteAmount = intensity; // 0 = no change, 1 = pure white
    
    const newR = r + (255 - r) * whiteAmount;
    const newG = g + (255 - g) * whiteAmount;
    const newB = b + (255 - b) * whiteAmount;
    
    return rgbToHex(newR, newG, newB);
  },

  /**
   * Muted: Reduce saturation while maintaining the hue
   * Creates sophisticated, less vibrant colors
   */
  muted: (hex: string, intensity = 0.5): string => {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    
    // Reduce saturation by the intensity amount
    const newS = s * (1 - intensity);
    
    const { r: newR, g: newG, b: newB } = hslToRgb(h, newS, l);
    return rgbToHex(newR, newG, newB);
  },

  /**
   * Soft: Combination of lightening and desaturation
   * Creates gentle, approachable colors
   */
  soft: (hex: string, intensity = 0.4): string => {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    
    // Reduce saturation and increase lightness
    const newS = s * (1 - intensity * 0.6);
    const newL = l + (85 - l) * intensity * 0.4; // Target lightness of 85%
    
    const { r: newR, g: newG, b: newB } = hslToRgb(h, newS, newL);
    return rgbToHex(newR, newG, newB);
  },

  /**
   * Warm: Shift colors towards warmer tones
   * Makes colors feel more inviting and friendly
   */
  warm: (hex: string, intensity = 0.3): string => {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    
    // Shift hue towards orange/red (0-60 degrees)
    let newH = h;
    if (h > 60 && h < 240) {
      // Only adjust colors that aren't already warm
      if (h < 180) {
        newH = h - (h - 60) * intensity;
      } else {
        newH = h + (300 - h) * intensity;
      }
    }
    
    // Slightly increase saturation for warmth
    const newS = Math.min(100, s * (1 + intensity * 0.2));
    
    const { r: newR, g: newG, b: newB } = hslToRgb(newH, newS, l);
    return rgbToHex(newR, newG, newB);
  },

  /**
   * Cool: Shift colors towards cooler tones
   * Creates professional, calm feeling
   */
  cool: (hex: string, intensity = 0.3): string => {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    
    // Shift hue towards blue (180-240 degrees)
    let newH = h;
    if (h < 180 || h > 240) {
      // Only adjust colors that aren't already cool
      if (h < 180) {
        newH = h + (180 - h) * intensity;
      } else {
        newH = h - (h - 240) * intensity;
      }
    }
    
    // Slightly reduce saturation for professional look
    const newS = s * (1 - intensity * 0.1);
    
    const { r: newR, g: newG, b: newB } = hslToRgb(newH, newS, l);
    return rgbToHex(newR, newG, newB);
  },

  /**
   * Balanced: Adjust extreme colors to be more balanced
   * Fixes colors that are too bright or too dark
   */
  balanced: (hex: string): string => {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    
    let newS = s;
    let newL = l;
    
    // If too saturated, reduce it
    if (s > 70) {
      newS = 60 + (s - 70) * 0.3;
    }
    
    // If too dark, lighten it
    if (l < 30) {
      newL = 30 + (l / 30) * 15;
    }
    
    // If too light, darken it slightly
    if (l > 85) {
      newL = 85 - (100 - l) * 0.3;
    }
    
    const { r: newR, g: newG, b: newB } = hslToRgb(h, newS, newL);
    return rgbToHex(newR, newG, newB);
  }
};

/**
 * Apply adjustment to entire color palette
 */
export function adjustColorPalette(
  colors: string[],
  strategy: keyof typeof ColorAdjustmentStrategies,
  intensity = 0.5
): string[] {
  return colors.map(color => {
    try {
      const adjustmentFn = ColorAdjustmentStrategies[strategy];
      if (strategy === 'balanced') {
        return adjustmentFn(color);
      }
      return adjustmentFn(color, intensity);
    } catch (error) {
      console.error(`Error adjusting color ${color}:`, error);
      return color; // Return original if adjustment fails
    }
  });
}

/**
 * Get a preview of all adjustment strategies for a color palette
 */
export function getColorAdjustmentPreviews(colors: string[]): Record<string, string[]> {
  return {
    original: colors,
    pastel: adjustColorPalette(colors, 'pastel', 0.5),
    muted: adjustColorPalette(colors, 'muted', 0.5),
    soft: adjustColorPalette(colors, 'soft', 0.4),
    warm: adjustColorPalette(colors, 'warm', 0.3),
    cool: adjustColorPalette(colors, 'cool', 0.3),
    balanced: adjustColorPalette(colors, 'balanced'),
  };
}

/**
 * Analyze color and suggest best adjustment
 */
export function suggestColorAdjustment(hex: string): keyof typeof ColorAdjustmentStrategies {
  const { r, g, b } = hexToRgb(hex);
  const { s, l } = rgbToHsl(r, g, b);
  
  // If color is too saturated
  if (s > 80) {
    return 'muted';
  }
  
  // If color is too dark
  if (l < 25) {
    return 'pastel';
  }
  
  // If color is too bright/neon
  if (s > 60 && l > 50 && l < 70) {
    return 'soft';
  }
  
  // For most cases, balanced works well
  return 'balanced';
}

/**
 * Auto-adjust palette based on analysis
 */
export function autoAdjustPalette(colors: string[]): string[] {
  return colors.map(color => {
    const strategy = suggestColorAdjustment(color);
    const adjustmentFn = ColorAdjustmentStrategies[strategy];
    
    if (strategy === 'balanced') {
      return adjustmentFn(color);
    }
    
    // Use moderate intensity for auto-adjustment
    return adjustmentFn(color, 0.4);
  });
}