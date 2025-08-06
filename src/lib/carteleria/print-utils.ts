/**
 * Print validation utilities for template optimization
 * Ensures components are properly optimized for PDF generation
 */

// Validation patterns for detecting responsive classes and units
const RESPONSIVE_PATTERNS = {
  // Tailwind responsive breakpoint classes
  responsiveClasses: /\b(sm|md|lg|xl|2xl):[a-zA-Z-]+/g,

  // Responsive CSS units that break in print
  responsiveUnits: /(rem|em|vh|vw|%)/g,

  // Aspect ratio utilities that don't work in print
  aspectRatio: /aspect-\[[\d\/]+\]/g,

  // Full width/height classes that are responsive
  fullDimensions: /\b(h-full|w-full|h-screen|w-screen)\b/g,

  // Responsive grid and flexbox classes
  responsiveLayout:
    /\b(grid-cols-1|md:grid-cols-2|lg:grid-cols-3|flex-col|md:flex-row)\b/g,
};

/**
 * Validates if an HTML element is print-ready
 * @param element - HTML element to validate
 * @returns Validation result with errors and warnings
 */
export const validatePrintLayout = (element: HTMLElement) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const elementHTML = element.outerHTML;

  // Check for responsive breakpoint classes
  const responsiveMatches = elementHTML.match(
    RESPONSIVE_PATTERNS.responsiveClasses,
  );
  if (responsiveMatches) {
    errors.push(`Found responsive classes: ${responsiveMatches.join(", ")}`);
  }

  // Check for responsive units in inline styles
  const inlineStyles = element.getAttribute("style") ?? "";
  const unitMatches = inlineStyles.match(RESPONSIVE_PATTERNS.responsiveUnits);
  if (unitMatches) {
    errors.push(
      `Found responsive units in inline styles: ${unitMatches.join(", ")}`,
    );
  }

  // Check for aspect ratio utilities
  const aspectMatches = elementHTML.match(RESPONSIVE_PATTERNS.aspectRatio);
  if (aspectMatches) {
    errors.push(`Found aspect ratio utilities: ${aspectMatches.join(", ")}`);
  }

  // Check for full dimension classes
  const fullDimMatches = elementHTML.match(RESPONSIVE_PATTERNS.fullDimensions);
  if (fullDimMatches) {
    warnings.push(`Found full dimension classes: ${fullDimMatches.join(", ")}`);
  }

  // Check if element has fixed dimensions
  const computedStyle = getComputedStyle(element);
  const width = computedStyle.width;
  const height = computedStyle.height;

  if (!width.endsWith("px") || !height.endsWith("px")) {
    warnings.push(
      `Element dimensions are not in pixels: width=${width}, height=${height}`,
    );
  }

  // Check for proper print-ready dimensions (should be close to A4)
  const widthPx = parseInt(width);
  const heightPx = parseInt(height);

  if (widthPx < 700 || widthPx > 1200) {
    warnings.push(
      `Width ${widthPx}px might not be suitable for A4 print (expected ~794px or ~1123px)`,
    );
  }

  if (heightPx < 700 || heightPx > 1200) {
    warnings.push(
      `Height ${heightPx}px might not be suitable for A4 print (expected ~794px or ~1123px)`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: `Found ${errors.length} errors and ${warnings.length} warnings`,
  };
};

/**
 * Validates print readiness of template component HTML
 * @param html - HTML string to validate
 * @returns Validation result
 */
export const validatePrintHTML = (html: string) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for responsive classes
  const responsiveMatches = html.match(RESPONSIVE_PATTERNS.responsiveClasses);
  if (responsiveMatches) {
    errors.push(
      `Found responsive classes: ${[...new Set(responsiveMatches)].join(", ")}`,
    );
  }

  // Check for aspect ratio utilities
  const aspectMatches = html.match(RESPONSIVE_PATTERNS.aspectRatio);
  if (aspectMatches) {
    errors.push(`Found aspect ratio utilities: ${aspectMatches.join(", ")}`);
  }

  // Check for full dimension classes
  const fullDimMatches = html.match(RESPONSIVE_PATTERNS.fullDimensions);
  if (fullDimMatches) {
    warnings.push(
      `Found full dimension classes: ${[...new Set(fullDimMatches)].join(", ")}`,
    );
  }

  // Check for viewport units in inline styles
  const vwvhMatches = html.match(/style="[^"]*?(vh|vw)[^"]*?"/g);
  if (vwvhMatches) {
    errors.push(`Found viewport units in styles: ${vwvhMatches.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: `HTML validation: ${errors.length} errors, ${warnings.length} warnings`,
  };
};

/**
 * Converts Tailwind spacing classes to pixel values
 * @param className - Tailwind class name
 * @returns Pixel value or null if not a spacing class
 */
export const convertTailwindSpacing = (className: string): number | null => {
  const spacingMap: Record<string, number> = {
    // Padding
    "p-0": 0,
    "p-1": 4,
    "p-2": 8,
    "p-3": 12,
    "p-4": 16,
    "p-5": 20,
    "p-6": 24,
    "p-8": 32,
    "p-10": 40,

    // Margin
    "m-0": 0,
    "m-1": 4,
    "m-2": 8,
    "m-3": 12,
    "m-4": 16,
    "m-5": 20,
    "m-6": 24,
    "m-8": 32,
    "m-10": 40,

    // Width/Height
    "w-4": 16,
    "w-5": 20,
    "w-6": 24,
    "w-8": 32,
    "w-10": 40,
    "h-4": 16,
    "h-5": 20,
    "h-6": 24,
    "h-8": 32,
    "h-10": 40,

    // Gap
    "gap-0.5": 2,
    "gap-1": 4,
    "gap-2": 8,
    "gap-3": 12,
    "gap-4": 16,
    "gap-5": 20,

    // Space
    "space-y-0.5": 2,
    "space-y-1": 4,
    "space-y-2": 8,
    "space-x-1": 4,
    "space-x-2": 8,
    "space-x-3": 12,
  };

  return spacingMap[className] ?? null;
};

/**
 * Creates print-optimized inline styles from Tailwind classes
 * @param classes - Array of Tailwind class names
 * @returns CSS style object
 */
export const createPrintStyles = (classes: string[]): React.CSSProperties => {
  const styles: React.CSSProperties = {};

  classes.forEach((className) => {
    // Handle spacing
    const spacing = convertTailwindSpacing(className);
    if (spacing !== null) {
      if (className.startsWith("p-")) styles.padding = `${spacing}px`;
      if (className.startsWith("m-")) styles.margin = `${spacing}px`;
      if (className.startsWith("w-")) styles.width = `${spacing}px`;
      if (className.startsWith("h-")) styles.height = `${spacing}px`;
    }

    // Handle positioning
    if (className === "absolute") styles.position = "absolute";
    if (className === "relative") styles.position = "relative";
    if (className === "fixed") styles.position = "fixed";

    // Handle display
    if (className === "flex") styles.display = "flex";
    if (className === "grid") styles.display = "grid";
    if (className === "block") styles.display = "block";
    if (className === "inline-block") styles.display = "inline-block";

    // Handle flex properties
    if (className === "flex-col") styles.flexDirection = "column";
    if (className === "flex-row") styles.flexDirection = "row";
    if (className === "justify-center") styles.justifyContent = "center";
    if (className === "items-center") styles.alignItems = "center";

    // Handle overflow
    if (className === "overflow-hidden") styles.overflow = "hidden";
    if (className === "overflow-visible") styles.overflow = "visible";
  });

  return styles;
};

/**
 * Generates print media query styles
 * @returns CSS string for print media queries
 */
export const generatePrintStyles = (): string => `
@media print {
  /* Ensure backgrounds and images print */
  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  
  /* Hide elements that shouldn't appear in PDF */
  .print-hidden {
    display: none !important;
  }
  
  /* Force template container to exact dimensions */
  .template-container {
    width: 794px !important;
    height: 1123px !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  /* Ensure all images render in print */
  img {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  
  /* Optimize text rendering for print */
  body {
    font-smooth: always;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Prevent page breaks inside important elements */
  .no-break {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  
  /* Force page breaks when needed */
  .page-break {
    break-before: always;
    page-break-before: always;
  }
}
`;

/**
 * Injects print styles into the document head
 */
export const injectPrintStyles = () => {
  if (typeof document === "undefined") return; // SSR safety

  const existingStyle = document.getElementById("print-styles");
  if (existingStyle) return; // Already injected

  const styleElement = document.createElement("style");
  styleElement.id = "print-styles";
  styleElement.textContent = generatePrintStyles();
  document.head.appendChild(styleElement);
};

/**
 * Preview function for testing print layout
 * Opens print preview in browser
 */
export const previewPrintLayout = () => {
  if (typeof window === "undefined") return; // SSR safety

  // Inject print styles first
  injectPrintStyles();

  // Open print preview
  window.print();
};
