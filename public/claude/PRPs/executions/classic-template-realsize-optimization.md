name: "Classic Template Real Size Optimization for PDF Generation"
description: |

## Purpose

Optimize the existing ClassicTemplateRealsize component to be print-ready for high-fidelity PDF generation using Puppeteer. The current implementation uses responsive web units and patterns that don't translate well to print media, requiring a complete overhaul to use fixed dimensions and print-optimized styling.

## Core Principles

1. **Print-First Design**: Use fixed pixel/cm/mm units instead of responsive units
2. **PDF Fidelity**: Ensure pixel-perfect rendering for print media
3. **Layout Stability**: Remove responsive behaviors that cause layout shifts
4. **Performance**: Optimize for headless browser rendering

---

## Goal

Transform the existing ClassicTemplateRealsize component from a responsive web component to a print-optimized template that renders consistently in PDF generation via Puppeteer.

## Why

- **PDF Generation Requirement**: Current template uses responsive units (rem, vh, vw, %) that cause layout issues in PDF generation
- **Print Precision**: Real estate templates require exact positioning and sizing for professional appearance
- **Headless Browser Compatibility**: Puppeteer needs stable, non-responsive layouts for consistent PDF output
- **Business Value**: Enable automated PDF generation for property marketing materials

## What

Convert the existing ClassicTemplateRealsize component to use:
- Fixed dimensions instead of responsive units
- Print-specific styling with @media print rules
- Absolute positioning for precise element placement
- Optimized typography for print legibility
- Consistent layout regardless of viewport size

### Success Criteria

- [ ] Component renders identically at any browser viewport size
- [ ] All dimensions use px, cm, or mm units (no rem, vh, vw, %)
- [ ] @media print styles ensure proper PDF rendering
- [ ] Typography is optimized for print (no responsive font scaling)
- [ ] Layout is stable for both vertical and horizontal orientations
- [ ] Component passes PDF generation validation test
- [ ] No responsive grid behaviors or flexbox layouts that change based on screen size

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: /Users/javierperezgarcia/Downloads/vesta/src/components/admin/carteleria/templates/classic/classic-template-realsize.tsx
  why: Current implementation that needs print optimization

- file: /Users/javierperezgarcia/Downloads/vesta/src/components/admin/carteleria/templates/classic/classic-template.tsx
  why: Reference implementation to understand base functionality

- file: /Users/javierperezgarcia/Downloads/vesta/src/components/admin/carteleria/templates/classic/features-grid.tsx
  why: Grid component used by template that may need print optimization

- file: /Users/javierperezgarcia/Downloads/vesta/src/types/template-data.ts
  why: TypeScript interfaces for props and configuration

- file: /Users/javierperezgarcia/Downloads/vesta/public/claude/PRPs/templates.md
  why: Detailed requirements and ChatGPT recommendations for print optimization

- url: https://pptr.dev/category/introduction
  why: Puppeteer documentation for PDF generation best practices

- url: https://medium.com/@diego.coder/convertir-html-en-pdf-con-puppeteer-y-node-js-e5e623723bcb
  why: Spanish tutorial on HTML to PDF conversion with Puppeteer
```

### Current Codebase Structure

```bash
src/
├── components/admin/carteleria/templates/classic/
│   ├── classic-template.tsx              # Original responsive template
│   ├── classic-template-realsize.tsx     # TARGET: Print-optimized version
│   └── features-grid.tsx                 # Grid component for property features
├── types/template-data.ts                # TypeScript interfaces
└── lib/carteleria/
    ├── mock-data.ts                     # Sample property data
    └── s3-images.ts                     # Image handling utilities
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Next.js requires 'use client' for client components
'use client';

// CRITICAL: Puppeteer PDF generation requires printBackground: true
// for CSS backgrounds and images to render

// CRITICAL: Responsive units cause layout instability in headless browsers
// BAD: className="w-full h-screen text-lg"
// GOOD: style={{ width: '794px', height: '1123px', fontSize: '14px' }}

// CRITICAL: Tailwind responsive classes break print layouts
// BAD: className="sm:text-base md:text-lg lg:text-xl"
// GOOD: style={{ fontSize: '16px' }}

// CRITICAL: CSS Grid and Flexbox with responsive behaviors cause shifts
// BAD: className="grid grid-cols-1 md:grid-cols-2"
// GOOD: style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}

// CRITICAL: Aspect ratio utilities don't work in print
// BAD: className="aspect-[210/297]"
// GOOD: style={{ width: '794px', height: '1123px' }}

// CRITICAL: Print media queries are essential for PDF generation
// @media print { ... } styles override screen styles in Puppeteer
```

## Implementation Blueprint

### Data Models & Interfaces

The component uses existing interfaces from template-data.ts:

```typescript
// These interfaces remain unchanged
interface ConfigurableTemplateProps {
  data: ExtendedTemplatePropertyData;
  config: TemplateConfiguration;
  className?: string;
}

// Print-specific configuration extensions may be needed
interface PrintConfiguration extends TemplateConfiguration {
  printDPI?: number;          // Default: 96
  paperSize?: 'A4' | 'A3';   // Default: A4
  printMargins?: {
    top: string;
    right: string; 
    bottom: string;
    left: string;
  };
}
```

### List of Tasks (In Order)

```yaml
Task 1: Analyze Current Responsive Implementation
  - READ src/components/admin/carteleria/templates/classic/classic-template-realsize.tsx
  - IDENTIFY all responsive units: rem, em, vh, vw, %, responsive classes
  - DOCUMENT layout structure and dimensions for conversion

Task 2: Define Print Dimensions and Constants
  - CREATE print dimension constants for A4 paper (794px x 1123px at 96 DPI)
  - DEFINE fixed sizes for all template elements
  - CALCULATE precise positioning values for overlays and components

Task 3: Replace Responsive Units with Fixed Dimensions
  - MODIFY main container from aspect-ratio to fixed width/height
  - REPLACE all Tailwind responsive classes with inline styles
  - CONVERT rem/em typography to px values
  - REPLACE percentage-based positioning with absolute px values

Task 4: Optimize Image Layout for Print
  - MODIFY renderImages() function to use fixed grid dimensions
  - REPLACE CSS Grid responsive classes with fixed positioning
  - ENSURE images maintain aspect ratios with fixed containers
  - SET explicit width/height for all image containers

Task 5: Create Print-Optimized Typography
  - REPLACE responsive font scaling with fixed px values
  - OPTIMIZE line-height and letter-spacing for print legibility
  - ENSURE text truncation works with fixed dimensions
  - TEST font rendering at print resolution

Task 6: Add Print Media Queries
  - CREATE @media print styles for PDF-specific optimizations
  - ENSURE backgrounds and images render in print
  - OPTIMIZE colors for print (avoid pure white on transparency)
  - HIDE elements that shouldn't appear in PDF

Task 7: Optimize Features Grid for Print
  - MODIFY FeaturesGrid component to use fixed dimensions
  - REPLACE responsive grid behavior with fixed positioning
  - ENSURE icons and text scale appropriately for print

Task 8: Add Print-Specific Error Handling
  - HANDLE image loading errors gracefully in print context  
  - PROVIDE fallbacks for missing assets
  - ENSURE template renders completely even with missing data

Task 9: Create Print Validation Utilities
  - CREATE utility to validate print-ready dimensions
  - ADD checks for responsive classes in component
  - IMPLEMENT print preview functionality
```

### Task-Specific Pseudocode

```typescript
// Task 2: Print Dimensions Constants
const PRINT_DIMENSIONS = {
  A4: {
    width: 794,   // 210mm at 96 DPI
    height: 1123, // 297mm at 96 DPI
  },
  MARGINS: {
    standard: 40, // ~10.5mm
  },
  OVERLAY: {
    left: {
      width: 300,
      height: 540,  // 48% of A4 height
      position: { top: 8, left: 8 }
    },
    contact: {
      position: { bottom: 12, right: 12 }
    }
  }
};

// Task 3: Fixed Dimension Container
// BEFORE (responsive):
<div className={cn(
  "relative overflow-hidden",
  config.orientation === "vertical" ? "aspect-[210/297]" : "aspect-[297/210]",
  "h-full w-full"
)}>

// AFTER (print-optimized):
<div style={{
  position: 'relative',
  overflow: 'hidden',
  width: config.orientation === "vertical" 
    ? `${PRINT_DIMENSIONS.A4.width}px`
    : `${PRINT_DIMENSIONS.A4.height}px`,
  height: config.orientation === "vertical"
    ? `${PRINT_DIMENSIONS.A4.height}px`
    : `${PRINT_DIMENSIONS.A4.width}px`
}}>

// Task 4: Fixed Image Grid
// BEFORE (responsive grid):
<div className="absolute inset-0 grid grid-rows-12 gap-0.5 bg-white">

// AFTER (fixed positioning):
<div style={{
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'grid',
  gridTemplateRows: 'repeat(12, 1fr)',
  gap: '2px',
  backgroundColor: 'white'
}}>

// Task 6: Print Media Queries
const printStyles = `
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  
  .print-hidden {
    display: none !important;
  }
  
  .template-container {
    width: 794px !important;
    height: 1123px !important;
    margin: 0 !important;
    padding: 0 !important;
  }
}
`;
```

### Integration Points

```yaml
STYLES:
  - add: Global print styles in component or layout
  - pattern: "const printStyles = \`@media print { ... }\`"

CONSTANTS:
  - add to: src/lib/carteleria/print-constants.ts
  - pattern: "export const PRINT_DIMENSIONS = { ... }"

UTILITIES:
  - add to: src/lib/carteleria/print-utils.ts
  - pattern: "export const validatePrintLayout = (element: HTMLElement) => { ... }"

TYPES:
  - extend: TemplateConfiguration interface
  - pattern: "printDPI?: number; paperSize?: 'A4' | 'A3';"
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Type checking
pnpm typecheck

# Linting with auto-fix
pnpm lint:fix

# Format code
pnpm format:write

# Expected: No errors or warnings
```

### Level 2: Print Layout Validation

```typescript
// CREATE __tests__/classic-template-realsize.test.ts
describe('ClassicTemplateRealsize Print Optimization', () => {
  it('should render with fixed dimensions', () => {
    const { container } = render(<ClassicTemplateRealsize data={mockData} config={mockConfig} />);
    const templateElement = container.firstChild as HTMLElement;
    
    expect(templateElement.style.width).toMatch(/\d+px/);
    expect(templateElement.style.height).toMatch(/\d+px/);
    expect(templateElement.style.width).not.toContain('%');
    expect(templateElement.style.height).not.toContain('%');
  });

  it('should not use responsive Tailwind classes', () => {
    const { container } = render(<ClassicTemplateRealsize data={mockData} config={mockConfig} />);
    const html = container.innerHTML;
    
    // Should not contain responsive breakpoint classes
    expect(html).not.toMatch(/\b(sm|md|lg|xl|2xl):[a-zA-Z-]+/);
    expect(html).not.toContain('aspect-');
    expect(html).not.toContain('h-full');
    expect(html).not.toContain('w-full');
  });

  it('should maintain layout consistency across viewport sizes', () => {
    const configs = [
      { viewport: { width: 1920, height: 1080 } },
      { viewport: { width: 375, height: 667 } },
      { viewport: { width: 1024, height: 768 } }
    ];

    configs.forEach(config => {
      // Mock viewport size
      Object.defineProperty(window, 'innerWidth', { value: config.viewport.width });
      Object.defineProperty(window, 'innerHeight', { value: config.viewport.height });
      
      const { container } = render(<ClassicTemplateRealsize data={mockData} config={mockConfig} />);
      const templateElement = container.firstChild as HTMLElement;
      
      // Layout should be identical regardless of viewport
      expect(templateElement.style.width).toBe('794px');
      expect(templateElement.style.height).toBe('1123px');
    });
  });
});
```

```bash
# Run tests
pnpm test classic-template-realsize.test.ts
# Expected: All tests pass - if failing, fix layout issues
```

### Level 3: Visual PDF Validation

```bash
# Start development server
pnpm dev

# Manual visual check at different viewport sizes
echo "✓ Template renders at 1920x1080 (desktop)"
echo "✓ Template renders at 375x667 (mobile)"  
echo "✓ Template renders at 1024x768 (tablet)"
echo "✓ Layout is identical across all viewport sizes"
echo "✓ No responsive behaviors or layout shifts occur"
echo "✓ All text is legible and properly positioned"
echo "✓ Images maintain proper aspect ratios"
echo "✓ Overlays are positioned correctly"

# Test print preview in browser
echo "Open browser dev tools > Rendering > Emulate CSS media: print"
echo "✓ Template renders correctly in print preview"
echo "✓ All backgrounds and images visible in print mode"
echo "✓ Typography is optimized for print"
```

### Level 4: Production PDF Validation

```bash
# Future integration test (after PDF generation API is implemented)
# curl -X POST http://localhost:3000/api/generate-pdf \
#   -H "Content-Type: application/json" \
#   -d '{"templateType": "classic", "propertyId": "test-id"}'

# Expected: PDF generated with perfect layout fidelity
# Manual check: PDF matches print preview exactly

echo "✓ PDF generates successfully"
echo "✓ PDF layout matches browser print preview"
echo "✓ All elements positioned correctly in PDF"
echo "✓ Typography is crisp and legible in PDF"
echo "✓ Images render with proper quality in PDF"
echo "✓ Colors and backgrounds appear correctly in PDF"
```

## Final Validation Checklist

- [ ] No responsive units (rem, em, vh, vw, %) in component
- [ ] No Tailwind responsive classes (sm:, md:, lg:, etc.)
- [ ] Fixed dimensions for all containers and elements
- [ ] @media print styles implemented
- [ ] Component renders identically at any viewport size
- [ ] Print preview shows correct layout
- [ ] Typography optimized for print legibility
- [ ] All tests pass: `pnpm test`
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm typecheck`

---

## Anti-Patterns to Avoid

- ❌ Don't use any responsive CSS units (rem, em, vh, vw, %)
- ❌ Don't use Tailwind responsive breakpoint classes
- ❌ Don't rely on aspect-ratio utilities for print layouts
- ❌ Don't use flexbox or grid with responsive behaviors
- ❌ Don't forget @media print styles for PDF generation
- ❌ Don't use relative positioning where absolute is needed
- ❌ Don't leave any layout decisions to the browser's responsive engine

---

**PRP Confidence Score: 9/10**

This PRP provides comprehensive context, clear implementation steps, and thorough validation criteria. The one point deduction is due to the complexity of print optimization requiring careful testing across different browsers and PDF generation tools, but the detailed validation steps should catch any issues early.