/**
 * Print-optimized constants for template rendering
 * Designed for high-fidelity PDF generation via Puppeteer
 */

// A4 paper dimensions at 96 DPI (standard web resolution)
export const PRINT_DIMENSIONS = {
  A4: {
    width: 794, // 210mm at 96 DPI
    height: 1123, // 297mm at 96 DPI
  },

  // Standard margins for professional print layouts
  MARGINS: {
    standard: 40, // ~10.5mm - professional document margin
    small: 20, // ~5.3mm - compact layouts
    large: 60, // ~15.9mm - spacious layouts
  },

  // Template overlay positioning and sizing
  OVERLAY: {
    left: {
      width: 300, // Fixed width for left overlay
      height: 540, // 48% of A4 height (1123 * 0.48 = 539.04)
      position: { top: 8, left: 8 },
    },
    contact: {
      position: { bottom: 12, right: 12 },
    },
    reference: {
      position: { bottom: 8, left: 8 },
    },
    qr: {
      position: { top: 8, right: 8 },
    },
  },

  // Image layout dimensions for different orientations
  IMAGES: {
    vertical: {
      main: { widthPercent: 100, heightPercent: 50 }, // Top 50% for main image
      grid: { widthPercent: 100, heightPercent: 50 }, // Bottom 50% for grid
    },
    horizontal: {
      main: { widthPercent: 67, heightPercent: 100 }, // Left 67% for main image
      grid: { widthPercent: 33, heightPercent: 100 }, // Right 33% for grid
    },
  },

  // Typography sizing for print legibility
  TYPOGRAPHY: {
    title: {
      large: 28, // Main titles
      medium: 23, // Compact titles
      small: 18, // Minimal titles
    },
    price: {
      large: 29, // Sale prices (24 + 5)
      medium: 26, // Sale prices (21 + 5)
      small: 24, // Sale prices (19 + 5)
      rental: {
        large: 24, // Rental prices base
        medium: 21, // Rental prices medium
        small: 19, // Rental prices small
      },
    },
    body: {
      standard: 12, // Standard body text
      small: 11, // Compact text
      tiny: 10, // Fine print
    },
    location: {
      standard: 12, // Location text
    },
    contact: {
      standard: 11, // Contact information
    },
    reference: {
      standard: 9, // Reference codes
    },
  },

  // Icon sizing for print clarity
  ICONS: {
    large: { width: 24, height: 24 }, // 6x6 equivalent (24px)
    medium: { width: 20, height: 20 }, // 5x5 equivalent (20px)
    small: { width: 16, height: 16 }, // 4x4 equivalent (16px)
    tiny: { width: 12, height: 12 }, // 3x3 equivalent (12px)
  },

  // Fixed spacing values replacing Tailwind classes
  SPACING: {
    xs: 4, // 0.25rem -> 4px
    sm: 8, // 0.5rem -> 8px
    md: 12, // 0.75rem -> 12px
    lg: 16, // 1rem -> 16px
    xl: 20, // 1.25rem -> 20px
    xxl: 24, // 1.5rem -> 24px
    xxxl: 32, // 2rem -> 32px
  },

  // Print-specific color adjustments
  COLORS: {
    // Ensure adequate contrast for print
    minOpacity: 0.8, // Minimum opacity for print visibility
    backgroundOpacity: 0.9, // Background overlays opacity
  },
} as const;

// Helper function to get dimensions based on orientation
export const getDimensionsForOrientation = (
  orientation: "vertical" | "horizontal",
) => {
  return orientation === "vertical"
    ? {
        width: PRINT_DIMENSIONS.A4.width,
        height: PRINT_DIMENSIONS.A4.height,
      }
    : {
        width: PRINT_DIMENSIONS.A4.height,
        height: PRINT_DIMENSIONS.A4.width,
      };
};

// Helper function to calculate image container dimensions
export const getImageDimensions = (
  orientation: "vertical" | "horizontal",
  section: "main" | "grid",
) => {
  const containerDims = getDimensionsForOrientation(orientation);
  const imageConfig = PRINT_DIMENSIONS.IMAGES[orientation][section];

  return {
    width: Math.round(containerDims.width * (imageConfig.widthPercent / 100)),
    height: Math.round(
      containerDims.height * (imageConfig.heightPercent / 100),
    ),
  };
};

// Helper function to get typography size based on content length and context
export const getTypographySize = (
  type: "title" | "price" | "body" | "location" | "contact" | "reference",
  options: {
    isCompact?: boolean;
    isRental?: boolean;
    priceDigits?: number;
  } = {},
) => {
  const { isCompact = false, isRental = false, priceDigits = 0 } = options;

  switch (type) {
    case "title":
      return isCompact
        ? PRINT_DIMENSIONS.TYPOGRAPHY.title.medium
        : PRINT_DIMENSIONS.TYPOGRAPHY.title.large;

    case "price":
      if (isRental) {
        if (priceDigits >= 8)
          return PRINT_DIMENSIONS.TYPOGRAPHY.price.rental.small;
        if (priceDigits >= 7)
          return PRINT_DIMENSIONS.TYPOGRAPHY.price.rental.medium;
        return PRINT_DIMENSIONS.TYPOGRAPHY.price.rental.large;
      } else {
        if (priceDigits >= 8) return PRINT_DIMENSIONS.TYPOGRAPHY.price.small;
        if (priceDigits >= 7) return PRINT_DIMENSIONS.TYPOGRAPHY.price.medium;
        return PRINT_DIMENSIONS.TYPOGRAPHY.price.large;
      }

    case "body":
      return isCompact
        ? PRINT_DIMENSIONS.TYPOGRAPHY.body.small
        : PRINT_DIMENSIONS.TYPOGRAPHY.body.standard;

    default:
      return PRINT_DIMENSIONS.TYPOGRAPHY[type].standard;
  }
};
