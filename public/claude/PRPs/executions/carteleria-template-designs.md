name: "Cartelería Template Design Implementation - Context-Rich PRP"
description: |

## Purpose

Create actual template designs for the cartelería system's "Estilo" section, replacing placeholders with functional mockups that showcase property information with images, pricing, and QR codes.

## Core Principles

1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance

---

## Goal

Replace placeholder templates in the cartelería system with actual functional template designs that render property information including 3 images, price, beds, baths, square meters, title, location, and QR codes. Each template must have fullscreen preview functionality using existing codebase patterns.

## Why

- **User Experience**: Real estate agencies need professional-looking cartelería templates for marketing
- **Business Value**: Converts placeholder system into functional template generator 
- **Integration**: Leverages existing AWS image infrastructure and UI component system
- **Scalability**: Provides foundation for dynamic template generation system

## What

Functional template mockups for each of the 6 design styles (Modern, Classic, Minimalist, Luxury, Creative, Professional) that display:
- 3 property images from AWS S3 storage
- Property information (price, beds, baths, square meters)
- Title ("Piso en venta")
- Location (Barrio + "(León)")
- QR code for contact information
- Fullscreen preview modal integration

### Success Criteria

- [ ] All 6 style templates render with consistent property information
- [ ] AWS images load correctly from vesta-configuration-files/templates/ folder
- [ ] QR codes generate properly with contact information
- [ ] Fullscreen preview works for each template style
- [ ] Templates use neutral color palettes for later customization
- [ ] Responsive design works across different format sizes
- [ ] Integration with existing cartelería wizard system

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: /Users/javierperezgarcia/Downloads/vesta/src/types/carteleria.ts
  why: Complete type definitions for template system, critical for type safety

- file: /Users/javierperezgarcia/Downloads/vesta/src/lib/carteleria/templates.ts
  why: Existing template structure, style definitions, and utility functions

- file: /Users/javierperezgarcia/Downloads/vesta/src/components/admin/carteleria.tsx
  why: Main component pattern, state management, and modal integration

- file: /Users/javierperezgarcia/Downloads/vesta/src/components/admin/carteleria/style-selector.tsx
  why: Style card rendering pattern and preview image handling

- file: /Users/javierperezgarcia/Downloads/vesta/src/components/admin/carteleria/template-preview.tsx
  why: Modal preview implementation pattern

- file: /Users/javierperezgarcia/Downloads/vesta/src/lib/s3.ts
  why: AWS image handling patterns and URL generation

- url: https://www.npmjs.com/package/react-qr-code
  why: QR code generation library documentation and best practices

- url: https://www.npmjs.com/package/qrcode.react
  why: Alternative QR code library with SVG/Canvas options
```

### Current Codebase Structure

```bash
src/
├── app/(dashboard)/account-admin/carteleria/
│   └── page.tsx                    # Main cartelería page
├── components/
│   ├── admin/
│   │   ├── carteleria.tsx          # Main wizard component
│   │   └── carteleria/
│   │       ├── style-selector.tsx  # Style selection interface
│   │       ├── template-gallery.tsx# Template browsing
│   │       ├── template-preview.tsx # Modal preview
│   │       └── template-customizer.tsx
│   └── ui/                         # shadcn/ui components
├── types/
│   └── carteleria.ts              # Complete type definitions
└── lib/
    ├── carteleria/
    │   └── templates.ts           # Template data and utilities
    └── s3.ts                      # AWS S3 integration
```

### Desired Codebase Structure with New Files

```bash
src/
├── components/
│   ├── admin/
│   │   └── carteleria/
│   │       ├── templates/          # NEW: Template design components
│   │       │   ├── base-template.tsx      # Base template component
│   │       │   ├── modern-template.tsx    # Modern style implementation
│   │       │   ├── classic-template.tsx   # Classic style implementation
│   │       │   ├── minimalist-template.tsx
│   │       │   ├── luxury-template.tsx
│   │       │   ├── creative-template.tsx
│   │       │   ├── professional-template.tsx
│   │       │   └── template-renderer.tsx  # Dynamic template selector
│   │       └── qr-code.tsx         # NEW: QR code component
├── types/
│   └── template-data.ts           # NEW: Mock property data types
└── lib/
    └── carteleria/
        └── mock-data.ts           # NEW: Sample property data
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Next.js requires 'use client' directive for components using hooks
// CRITICAL: AWS S3 URLs use specific bucket structure: inmobiliaria acropolis/vesta-configuration-files/templates/
// CRITICAL: Template images are: IMG_0744.JPG, IMG_0745.JPG, IMG_0749.JPG
// CRITICAL: QR codes need proper quiet zone - wrap in white container with 16px padding
// CRITICAL: Image components require Next.js Image with proper error handling
// CRITICAL: Template preview modal uses existing TemplatePreview component pattern
// CRITICAL: Colors must be neutral - existing color schemes are in templateStyles
// CRITICAL: Responsive design required - templates render in multiple formats (A4, A3, A2, digital)
// CRITICAL: Location format must be "Barrio (León)" - note parentheses format
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Template data interface for consistent property information
interface TemplatePropertyData {
  id: string;
  title: string;
  price: number;
  location: {
    neighborhood: string;
    city: string;
  };
  specs: {
    bedrooms?: number;
    bathrooms?: number;
    squareMeters: number;
  };
  images: string[]; // AWS S3 URLs
  contact: {
    phone: string;
    email?: string;
  };
}

// Template component props interface
interface TemplateComponentProps {
  data: TemplatePropertyData;
  style: TemplateStyle;
  format: TemplateFormat;
  className?: string;
  onPreview?: () => void;
}
```

### List of Tasks to Complete

#### Task 1: Setup QR Code Generation
```yaml
INSTALL dependencies:
  - react-qr-code: Latest version with React 18 support
  - Optional: qrcode.react as fallback

CREATE src/components/admin/carteleria/qr-code.tsx:
  - PATTERN: Follow existing component structure from style-selector.tsx
  - FEATURES: Generate QR code with contact information (phone/email)
  - STYLING: White background container with 16px padding for quiet zone
  - ERROR HANDLING: Graceful fallback if QR generation fails
```

#### Task 2: Create Base Template Component
```yaml
CREATE src/components/admin/carteleria/templates/base-template.tsx:
  - PATTERN: Mirror structure from existing Card components
  - FEATURES: Common layout elements (images, price, specs, QR code)
  - IMAGES: Integration with AWS S3 URLs using Next.js Image component
  - RESPONSIVE: Handle different format dimensions (A4, A3, A2, digital)
  - ERROR HANDLING: Image loading fallbacks like in style-selector.tsx
```

#### Task 3: Create Mock Property Data
```yaml
CREATE src/lib/carteleria/mock-data.ts:
  - PATTERN: Follow structure from templates.ts data organization
  - CONTENT: Sample property data for each property type (piso, casa, local, garaje, solar)
  - IMAGES: Use AWS URLs: vesta-configuration-files/templates/IMG_0744.JPG, etc.
  - LOCATION: Format as "Centro (León)", "Ensanche (León)", etc.
  - SPECS: Realistic bedroom/bathroom/sqm combinations
```

#### Task 4: Implement Style-Specific Templates
```yaml
CREATE src/components/admin/carteleria/templates/modern-template.tsx:
  - PATTERN: Extend base-template.tsx with modern styling
  - COLORS: Use neutral grays (#64748b, #94a3b8) with blue accents (#3b82f6)
  - LAYOUT: Clean lines, minimal borders, sans-serif typography
  - SPACING: Generous white space, card-based layout

CREATE src/components/admin/carteleria/templates/classic-template.tsx:
  - PATTERN: Extend base-template.tsx with classic styling  
  - COLORS: Warm neutrals (#6b7280, #374151) with gold accents (#d97706)
  - LAYOUT: Traditional borders, serif typography for headers
  - SPACING: Balanced layout with decorative elements

CREATE src/components/admin/carteleria/templates/minimalist-template.tsx:
  - PATTERN: Extend base-template.tsx with minimal styling
  - COLORS: Pure neutrals (#000000, #9ca3af, #ffffff)
  - LAYOUT: Maximum white space, thin lines, simple typography
  - SPACING: Extreme simplicity, focus on essential information

CREATE src/components/admin/carteleria/templates/luxury-template.tsx:
  - PATTERN: Extend base-template.tsx with premium styling
  - COLORS: Rich neutrals (#a3a3a3, #525252) with champagne gold (#fbbf24)
  - LAYOUT: Elegant borders, premium typography, sophisticated spacing
  - SPACING: Refined proportions, quality over quantity

CREATE src/components/admin/carteleria/templates/creative-template.tsx:
  - PATTERN: Extend base-template.tsx with artistic styling
  - COLORS: Neutral base with subtle creative accents (#8b5cf6, #f59e0b)
  - LAYOUT: Asymmetrical elements, dynamic typography
  - SPACING: Unique proportions, artistic flair within professional bounds

CREATE src/components/admin/carteleria/templates/professional-template.tsx:
  - PATTERN: Extend base-template.tsx with corporate styling
  - COLORS: Business neutrals (#374151, #6b7280) with navy accents (#1e40af)
  - LAYOUT: Grid-based, professional typography, corporate feel
  - SPACING: Structured layout, business-appropriate presentation
```

#### Task 5: Create Template Renderer
```yaml
CREATE src/components/admin/carteleria/templates/template-renderer.tsx:
  - PATTERN: Dynamic component selector like existing gallery patterns
  - FUNCTION: Map styleId to appropriate template component
  - INTEGRATION: Handle fullscreen preview with existing modal system
  - ERROR HANDLING: Fallback to base template if specific style fails
```

#### Task 6: Update Existing Components
```yaml
MODIFY src/components/admin/carteleria/template-preview.tsx:
  - INTEGRATE: New template renderer for actual template display
  - PRESERVE: Existing modal structure and functionality
  - ENHANCE: Replace placeholder content with real templates

MODIFY src/components/admin/carteleria/style-selector.tsx:
  - UPDATE: Preview images to show actual template designs
  - PRESERVE: Existing selection logic and UI patterns
  - ENHANCE: Add fullscreen preview button integration
```

### Integration Points

```yaml
AWS S3:
  - bucket: "inmobiliaria acropolis"
  - folder: "vesta-configuration-files/templates/"
  - images: ["IMG_0744.JPG", "IMG_0745.JPG", "IMG_0749.JPG"]
  - pattern: Use existing s3.ts URL construction methods

COMPONENTS:
  - integrate: Existing shadcn/ui Card, Button, Badge components
  - pattern: Follow existing className structure with cn() utility
  - responsive: Tailwind responsive classes for different screen sizes

STATE MANAGEMENT:
  - preserve: Existing cartelería state management
  - integrate: Template data with existing selection system
  - pattern: Use existing updateSelections and state handlers
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm typecheck                       # Type checking with TypeScript
pnpm lint:fix                        # ESLint with auto-fix
pnpm format:write                    # Prettier formatting

# Expected: No errors. If errors exist, read and fix before proceeding.
```

### Level 2: Component Testing

```typescript
// Test QR code generation
describe('QRCode Component', () => {
  it('should generate QR code with contact information', () => {
    const mockData = { phone: '987654321', email: 'test@example.com' };
    render(<QRCode contactInfo={mockData} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('should handle missing contact information gracefully', () => {
    render(<QRCode contactInfo={{}} />);
    // Should not crash, should show fallback or empty state
  });
});

// Test template rendering
describe('TemplateRenderer', () => {
  it('should render correct template for each style', () => {
    const styles = ['modern', 'classic', 'minimalist', 'luxury', 'creative', 'professional'];
    styles.forEach(styleId => {
      render(<TemplateRenderer styleId={styleId} data={mockPropertyData} />);
      expect(screen.getByTestId(`template-${styleId}`)).toBeInTheDocument();
    });
  });
});
```

```bash
# Run component tests
pnpm test carteleria
# If failing: Understand error, fix implementation, re-run
```

### Level 3: Integration Testing

```bash
# Start development server
pnpm dev

# Navigate to cartelería page
# http://localhost:3000/dashboard/account-admin/carteleria

# Test fullscreen preview functionality:
# 1. Select a style in Step 1
# 2. Navigate through wizard steps
# 3. Click preview button on template
# 4. Verify fullscreen modal shows actual template design
# 5. Verify all elements render: images, price, specs, QR code
# 6. Test responsive behavior on different screen sizes

# Expected: All templates render correctly with proper styling and data
```

### Level 4: Visual & Performance Validation

```bash
# Visual testing checklist:
echo "✓ All 6 style templates display unique designs"
echo "✓ AWS images load correctly from S3"
echo "✓ QR codes generate and display properly"
echo "✓ Responsive design works on mobile (375px) and desktop (1920px)"
echo "✓ Fullscreen preview modal functions correctly"
echo "✓ Color schemes are neutral and professional"
echo "✓ Typography is readable and appropriate for each style"
echo "✓ Layout proportions are balanced and attractive"

# Performance testing:
echo "✓ Images load efficiently with Next.js optimization"
echo "✓ QR code generation doesn't block UI"
echo "✓ Modal animations are smooth"
echo "✓ Template switching is responsive"
```

## Final Validation Checklist

- [ ] All tests pass: `pnpm test`
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm typecheck`
- [ ] Visual review: All 6 templates render with distinct styles
- [ ] Functional review: Fullscreen preview works for each template
- [ ] Image review: All AWS images load correctly
- [ ] QR code review: Contact information generates properly
- [ ] Responsive review: Templates work across all format sizes
- [ ] Integration review: Works with existing cartelería wizard flow

---

## Critical Implementation Notes

### AWS Image URLs
```typescript
// CRITICAL: Use exact AWS S3 structure
const templateImages = [
  'https://inmobiliaria-acropolis.s3.amazonaws.com/vesta-configuration-files/templates/IMG_0744.JPG',
  'https://inmobiliaria-acropolis.s3.amazonaws.com/vesta-configuration-files/templates/IMG_0745.JPG', 
  'https://inmobiliaria-acropolis.s3.amazonaws.com/vesta-configuration-files/templates/IMG_0749.JPG'
];
```

### QR Code Best Practices
```typescript
// CRITICAL: Preserve quiet zone with white container
<div className="bg-white p-4 rounded">
  <QRCode 
    value={`tel:${contactInfo.phone}`}
    size={80}
    level="M" // Medium error correction
  />
</div>
```

### Neutral Color Palettes
```typescript
// Use these neutral base colors that work with any brand palette later
const neutralPalettes = {
  modern: { primary: '#6b7280', secondary: '#9ca3af', accent: '#e5e7eb' },
  classic: { primary: '#374151', secondary: '#6b7280', accent: '#d1d5db' },
  minimalist: { primary: '#000000', secondary: '#6b7280', accent: '#ffffff' },
  luxury: { primary: '#525252', secondary: '#a3a3a3', accent: '#e5e5e5' },
  creative: { primary: '#4b5563', secondary: '#9ca3af', accent: '#f3f4f6' },
  professional: { primary: '#1f2937', secondary: '#6b7280', accent: '#e5e7eb' }
};
```

## Anti-Patterns to Avoid

- ❌ Don't hardcode property data - use mock data system for flexibility
- ❌ Don't break existing cartelería wizard functionality
- ❌ Don't use bright colors - stick to neutral palettes
- ❌ Don't ignore responsive design - templates must work in all formats
- ❌ Don't skip error handling for images and QR codes
- ❌ Don't create new state management - use existing patterns
- ❌ Don't ignore accessibility - ensure proper alt text and contrast

---

## PRP Confidence Score: 9/10

This PRP provides comprehensive context, follows existing codebase patterns, includes all necessary AWS integration details, and provides clear validation steps. The score is 9/10 due to the complexity of visual design implementation which may require iterative refinement for optimal aesthetics.