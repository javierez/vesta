name: "Configurable Template UI Redesign - Real Estate Listing Style"
description: |

## Goal

Redesign the configurable-template.tsx component to match the provided real estate listing design with:
- Layered image layout with one main image (65% space) and smaller supporting images
- QR code positioned in top-right with black background
- Semi-transparent grey overlay (60% opacity) containing property data
- Large title typography (32px)
- Minimalistic icon design with short descriptions (max 40 characters)
- All text in white color
- Prominent price display

## Why

- **Business Value**: Create a modern, visually appealing real estate listing template that stands out
- **User Impact**: Improve readability with better contrast and information hierarchy
- **Integration**: Maintains compatibility with existing template system while enhancing visual design
- **Problem Solved**: Current template lacks visual impact and modern design aesthetics needed for effective property marketing

## What

### User-Visible Behavior
- Modern real estate listing design with layered image gallery
- Semi-transparent overlay for better text readability over images
- Prominent QR code placement for easy scanning
- Clear information hierarchy with large title and price
- Minimalistic icon-based property specifications

### Technical Requirements
- Maintain all existing configurable properties
- Preserve responsive design for both vertical and horizontal orientations
- Keep compatibility with ExtendedTemplatePropertyData interface
- Ensure proper image loading and error handling
- Support all existing property types and listing types

### Success Criteria

- [ ] Images display with main image taking 65% of space
- [ ] QR code appears in top-right with white QR on black background
- [ ] Semi-transparent grey overlay (60% opacity) contains all property data
- [ ] Title displays at 32px font size
- [ ] All text renders in white color for contrast
- [ ] Icons are minimalistic with descriptions under 40 characters
- [ ] Price displays prominently at bottom of overlay
- [ ] All existing configuration options still work
- [ ] Template remains responsive for both orientations
- [ ] No TypeScript or linting errors

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: /Users/javierperezgarcia/Downloads/vesta/src/components/admin/carteleria/templates/configurable-template.tsx
  why: Current implementation to modify - preserve all functionality

- file: /Users/javierperezgarcia/Downloads/vesta/src/components/admin/carteleria/templates/basic-template.tsx
  why: Reference for existing template patterns and structure

- file: /Users/javierperezgarcia/Downloads/vesta/src/types/template-data.ts
  why: Type definitions for ConfigurableTemplateProps and data structure

- file: /Users/javierperezgarcia/Downloads/vesta/src/components/admin/carteleria/qr-code.tsx
  why: QR code component implementation for styling reference

- url: https://tailwindcss.com/docs/background-color#using-arbitrary-values
  why: For semi-transparent backgrounds like bg-gray-500/60

- url: https://tailwindcss.com/docs/backdrop-blur
  why: For potential backdrop effects on overlay

- file: /Users/javierperezgarcia/Downloads/vesta/public/claude/images/Captura de pantalla 2025-08-05 a las 0.12.42.png
  why: Target design reference showing desired layout
```

### Current Codebase Structure

```bash
src/components/admin/carteleria/
├── templates/
│   ├── basic-template.tsx          # Basic template reference
│   ├── configurable-template.tsx   # FILE TO MODIFY
│   └── index.ts                    # Template exports
├── qr-code.tsx                     # QR code component
├── template-customizer.tsx         # Template configuration UI
└── property-type-selector.tsx      # Property type selection
```

### Desired Implementation Structure

```bash
# No new files needed - only modifying configurable-template.tsx
# Component will maintain same export and interface
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Next.js Image component requires explicit sizes for responsive images
// Example: sizes="(max-width: 768px) 50vw, 33vw"

// CRITICAL: Tailwind opacity utilities work with colors: bg-gray-500/60
// NOT bg-gray-500 opacity-60 (this won't work as expected)

// CRITICAL: lucide-react icons need className for sizing
// Example: <Bed className="h-4 w-4" /> not size={16}

// CRITICAL: absolute positioning requires relative parent
// Parent needs: className="relative"

// CRITICAL: z-index layering for overlays
// Images: z-0, Overlay: z-10, QR Code: z-20

// CRITICAL: White text needs proper contrast
// Use text-white not text-gray-100 for clarity
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// No new data models needed - using existing interfaces:
// - ConfigurableTemplateProps
// - ExtendedTemplatePropertyData
// - TemplateConfiguration

// Color palette for new design
const modernOverlayColors = {
  overlay: "rgba(75, 85, 99, 0.6)", // gray-600 at 60% opacity
  qrBackground: "#000000",
  text: "#ffffff",
  iconText: "#ffffff",
  price: "#ffffff",
};
```

### List of Tasks to Complete

```yaml
Task 1:
MODIFY src/components/admin/carteleria/templates/configurable-template.tsx:
  - UPDATE modernColors palette to new overlay design colors
  - PRESERVE all existing functionality and config options

Task 2:
REFACTOR renderImages() function:
  - IMPLEMENT new layout with main image taking 65% space
  - ADJUST grid structure for supporting images
  - REMOVE padding/gaps between images (white thin frame only)
  - ENSURE responsive behavior for different image counts

Task 3:
RESTRUCTURE main template JSX:
  - WRAP content in relative positioned container
  - ADD semi-transparent overlay div with absolute positioning
  - MOVE all content (title, specs, price) inside overlay
  - POSITION images as background layer (z-0)

Task 4:
REDESIGN header section:
  - INCREASE title font size to text-3xl (approximately 32px)
  - CHANGE all text colors to white
  - SIMPLIFY property type badge design
  - REORGANIZE layout for overlay context

Task 5:
UPDATE QR code positioning:
  - POSITION QR code in top-right corner with absolute positioning
  - ADD black background container for QR code
  - ADJUST z-index to appear above overlay
  - MAINTAIN QR code functionality

Task 6:
MODIFY property specifications display:
  - SIMPLIFY icon descriptions to max 40 characters
  - ENSURE minimalistic icon styling
  - UPDATE text colors to white
  - ADJUST spacing for overlay layout

Task 7:
REDESIGN price display:
  - INCREASE price font size for prominence
  - POSITION at bottom of overlay
  - STYLE in white color
  - MAINTAIN price formatting logic

Task 8:
OPTIMIZE responsive behavior:
  - TEST both vertical and horizontal orientations
  - ENSURE overlay scales properly
  - VERIFY text remains readable at different sizes
  - MAINTAIN all configuration options working
```

### Per Task Pseudocode

```typescript
// Task 1: Update color palette
const modernOverlayColors = {
  overlay: "bg-gray-600/60", // Using Tailwind arbitrary opacity
  qrBg: "bg-black",
  textWhite: "text-white",
  // Remove old color values, use Tailwind utilities directly
};

// Task 2: New image layout function
const renderImages = () => {
  // Main layout structure:
  // <div className="absolute inset-0 grid grid-cols-12 gap-0.5">
  //   <div className="col-span-8"> {/* 65% main image */}
  //   <div className="col-span-4 grid grid-rows-2 gap-0.5">
  //     {/* Remaining images */}
  // Use gap-0.5 for thin white frame effect
};

// Task 3: Main structure with overlay
return (
  <div className="relative w-full h-full overflow-hidden">
    {/* Background images layer */}
    <div className="absolute inset-0 z-0">
      {renderImages()}
    </div>
    
    {/* Semi-transparent overlay */}
    <div className="absolute inset-0 z-10 bg-gray-600/60">
      {/* All content goes here */}
    </div>
    
    {/* QR Code layer */}
    <div className="absolute top-4 right-4 z-20">
      {/* QR with black background */}
    </div>
  </div>
);

// Task 6: Simplified spec display
const specDescriptions = {
  bedrooms: "hab.", // max 40 chars
  bathrooms: "baños",
  squareMeters: "m²",
};
```

### Integration Points

```yaml
COMPONENTS:
  - PropertyQRCode: Wrap in black background container
  - lucide-react icons: Use with white color styling
  - Next.js Image: Maintain error handling and responsive sizes

STYLING:
  - Tailwind utilities: Use opacity modifiers (bg-gray-600/60)
  - Z-index layers: images (z-0), overlay (z-10), QR (z-20)
  - Text colors: Replace all with text-white

CONFIG:
  - Maintain all TemplateConfiguration options
  - Preserve showQR, showWatermark, showIcons logic
  - Keep orientation-specific layouts
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm typecheck                    # TypeScript validation
pnpm lint:fix                     # ESLint with auto-fix
pnpm format:write                 # Prettier formatting

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Component Testing

```typescript
// Visual testing checklist:
describe('ConfigurableTemplate redesign', () => {
  it('should render main image taking 65% of space', () => {
    // Check col-span-8 on 12-column grid
  });

  it('should display QR code in top-right with black background', () => {
    // Verify absolute positioning and bg-black class
  });

  it('should show semi-transparent overlay', () => {
    // Check for bg-gray-600/60 class
  });

  it('should render all text in white', () => {
    // Verify text-white on all text elements
  });

  it('should display title at 32px size', () => {
    // Check for text-3xl class on title
  });
});
```

### Level 3: Manual Testing

```bash
# Start development server
pnpm dev

# Navigate to template customizer
# http://localhost:3000/admin/carteleria

# Test checklist:
# ✓ Main image takes approximately 65% of space
# ✓ Supporting images arranged in remaining space
# ✓ Images separated by thin white frames (gap-0.5)
# ✓ QR code appears in top-right with black background
# ✓ Semi-transparent grey overlay visible over images
# ✓ All text appears in white and is readable
# ✓ Title displays at larger size (32px)
# ✓ Icons are minimalistic with short descriptions
# ✓ Price displays prominently at bottom
# ✓ Both vertical and horizontal orientations work
# ✓ All configuration toggles function correctly
```

### Level 4: Edge Cases & Browser Testing

```bash
# Browser compatibility:
# - Chrome/Edge: Check backdrop effects
# - Firefox: Verify opacity rendering
# - Safari: Test image aspect ratios

# Configuration combinations:
# - Test with 3 and 4 images
# - Toggle all boolean configs
# - Switch between property types
# - Test with/without optional data

# Responsive testing:
# - Mobile: 375x667
# - Tablet: 768x1024
# - Desktop: 1920x1080
```

## Final Validation Checklist

- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No linting errors: `pnpm lint`
- [ ] Code formatted: `pnpm format:write`
- [ ] Build succeeds: `pnpm build`
- [ ] Main image takes ~65% of layout space
- [ ] QR code positioned correctly with black background
- [ ] Semi-transparent overlay displays properly
- [ ] All text renders in white and is readable
- [ ] Title appears at 32px size
- [ ] Icons show with minimalistic design
- [ ] Price displays prominently
- [ ] All existing features still work
- [ ] Responsive design maintained
- [ ] No console errors in browser

## Anti-Patterns to Avoid

- ❌ Don't use opacity-60 class alone (use bg-gray-600/60 for color opacity)
- ❌ Don't forget z-index layering for proper stacking
- ❌ Don't hardcode pixel values - use Tailwind classes
- ❌ Don't remove any existing configuration options
- ❌ Don't break TypeScript interfaces or types
- ❌ Don't use inline styles when Tailwind utilities exist
- ❌ Don't forget to test both orientations
- ❌ Don't modify other template files

---

**Confidence Score: 9/10**

This PRP provides comprehensive context for implementing the configurable template redesign. The implementation should succeed in one pass given:
- Clear visual reference and detailed requirements
- Existing codebase patterns to follow
- Specific Tailwind utilities for the design
- Preserved functionality with enhanced visuals
- Detailed validation steps for verification