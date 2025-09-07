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
      height: 558, // 48% of A4 height (1123 * 0.48 = 539.04)
      position: { top: 8, left: 8 },
    },
    contact: {
      position: { bottom: 12, right: 160 },
    },
    reference: {
      position: { bottom: 8, left: 8 },
    },
    qr: {
      position: { top: 30, right: 30 },
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
      large: 50, // Sale listings (Venta) - main title text
      medium: 45, // Rental listings (Alquiler) - main title text
      small: 44, // Compact mode when location needs line break
    },
    price: {
      large: 50, // Sale prices with few digits (< 7 digits)
      medium: 40, // Sale prices with medium digits (7 digits)
      small: 36, // Sale prices with many digits (8+ digits)
      rental: {
        large: 50, // Rental prices with few digits (< 7 digits)
        medium: 40, // Rental prices with medium digits (7 digits)
        small: 36, // Rental prices with many digits (8+ digits)
      },
    },
    body: {
      standard: 20, // Icon labels and general body text
      small: 20, // Compact mode body text and bullet points
      tiny: 16, // Fine print and small details
    },
    location: {
      standard: 24, // Location text in badge (neighborhood and city)
    },
    contact: {
      standard: 16, // Contact information (phone, email, website)
    },
    reference: {
      standard: 16, // Property reference code in bottom left
    },
  },

  // Icon sizing for print clarity
  ICONS: {
    extraLarge: { width: 60, height: 60 }, // Very large icons for single icon layouts (garaje, solar)
    large: { width: 50, height: 50 }, // Feature icons in normal mode (bedrooms, bathrooms, sqm, additional fields)
    medium: { width: 40, height: 40 }, // Medium sized icons (unused currently)
    small: { width: 40, height: 40 }, // Feature icons in compact mode + location pin icon
    tiny: { width: 20, height: 20 }, // Contact icons (phone, email, website) in bottom right overlay
  },

  // Specific spacing values for dedicated uses
  SPACING: {
    // Icon and text spacing
    iconRowGap: 4, // Vertical gap between icon grid rows
    iconToText: 4, // Space between icon and its label text below
    iconColumns: 32, // Horizontal gap between feature icon columns

    // Location spacing
    locationBadgePadding: 8, // Padding inside location badge
    titleToLocation: 24, // Space between title section and location
    locationToIcons: 0, // Space between location and feature icons
    iconsToPrice: 10, // Space between feature icons and price section

    // Layout margins
    overlayPadding: 24, // Main overlay internal padding
    titleLeftMargin: 24, // Additional left margin for title text only
    iconsLeftMargin: 24, // Left margin for feature icons grid
    iconsLeftMarginRental: 32, // Left margin for feature icons in rental listings

    // Contact section
    contactItemsGap: 4, // Gap between contact items (phone, email, website)
    contactOverlayPadding: 8, // Padding inside contact overlay

    // Features section - spacing from title/location to icons
    featuresTopMargin: 24, // Top margin for features section in normal mode (5+ icons)
    featuresTopMarginCompact: 24, // Top margin for features section in compact mode
    featuresTopMarginMedium: 34, // Top margin when 3-4 icons
    featuresTopMarginSingle: 46, // Top margin when only 1 icon (garaje, solar)
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
      if (isRental) {
        // Slightly smaller for rental listings
        return isCompact
          ? PRINT_DIMENSIONS.TYPOGRAPHY.title.small
          : PRINT_DIMENSIONS.TYPOGRAPHY.title.medium;
      } else {
        return isCompact
          ? PRINT_DIMENSIONS.TYPOGRAPHY.title.medium
          : PRINT_DIMENSIONS.TYPOGRAPHY.title.large;
      }

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
