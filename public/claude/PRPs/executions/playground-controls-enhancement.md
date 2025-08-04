# PRP: Playground Controls Enhancement

## Goal
Create a comprehensive template control system in the playground page that allows users to customize all aspects of property templates including orientation, image count, feature toggles, and dynamic property field selection.

## Why
- **User Experience**: Provide immediate visual feedback for template customization decisions
- **Real Estate Requirements**: Address specific Spanish market needs (energy ratings, elevator access, etc.)
- **Template Flexibility**: Support multiple template variations without code changes
- **Future Scalability**: Prepare foundation for saving user preferences to database

## What
Build an enhanced playground control panel with 10 configurable options:
1. Template orientation (horizontal/vertical)
2. Property type selection (piso, casa, local, garaje, solar)
3. Image count selection (3-4 images)
4. Feature toggles (icons, QR, watermark, phone)
5. Short description toggle
6. Listing type (Alquiler/Venta)
7. Additional property fields (max 2 from database schema)

### Success Criteria
- [ ] All 10 control options functional with real-time preview
- [ ] Template adapts dynamically to image count changes
- [ ] Additional fields selector integrates with property database schema
- [ ] Responsive design works on desktop and mobile
- [ ] AWS S3 images load correctly from vesta-configuration-files bucket

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: src/app/(dashboard)/playground/page.tsx
  why: Current playground implementation with state management patterns

- file: src/types/template-data.ts
  why: Core data interfaces to extend for new configuration options

- file: src/types/carteleria.ts 
  why: Template system type definitions and enums

- file: src/components/admin/carteleria/templates/modern/modern-template-vertical.tsx
  why: Template component structure to adapt for configurability

- file: src/components/admin/carteleria/templates/modern/modern-template-horizontal.tsx
  why: Horizontal template layout patterns

- file: src/lib/carteleria/mock-data.ts
  why: Data generation patterns and AWS S3 URL structure

- file: src/components/ui/switch.tsx
  why: Toggle component for boolean controls

- file: src/server/db/schema.ts
  why: Property database fields available for additional info selector

- file: src/app/actions/brand-upload.ts
  why: AWS S3 integration patterns for file handling

- url: https://www.radix-ui.com/primitives/docs/components/switch
  why: Switch component API for toggle controls

- url: https://lucide.dev/icons/
  why: Icon library for property features and UI elements
```

### Current Codebase Structure

```bash
src/
├── app/
│   └── (dashboard)/
│       └── playground/
│           └── page.tsx                    # MODIFY - Add enhanced controls
├── components/
│   ├── ui/
│   │   └── switch.tsx                      # EXISTING - Use for toggles
│   └── admin/
│       └── carteleria/
│           ├── templates/
│           │   ├── modern/
│           │   │   ├── modern-template-vertical.tsx    # EXISTING
│           │   │   └── modern-template-horizontal.tsx  # EXISTING
│           │   └── template-renderer.tsx   # EXISTING - May need updates
│           └── qr-code.tsx                 # EXISTING - Used in templates
├── lib/
│   └── carteleria/
│       └── mock-data.ts                    # MODIFY - Add extended fields
├── types/
│   ├── template-data.ts                    # MODIFY - Add configuration types
│   └── carteleria.ts                       # EXISTING - Template system types
└── server/
    └── db/
        └── schema.ts                       # REFERENCE - Property fields
```

### Desired Codebase Tree (New Files)

```bash
src/
├── components/
│   └── admin/
│       └── carteleria/
│           ├── controls/                   # CREATE - Control components
│           │   ├── display-toggles.tsx     # CREATE - Boolean toggles
│           │   ├── additional-fields-selector.tsx  # CREATE - Field picker
│           │   ├── image-count-selector.tsx        # CREATE - 3/4 image selector
│           │   └── listing-type-selector.tsx       # CREATE - Alquiler/Venta
│           ├── templates/
│           │   └── configurable-template.tsx       # CREATE - Dynamic template
│           └── watermark.tsx               # CREATE - Watermark overlay
└── lib/
    └── carteleria/
        └── s3-images.ts                    # CREATE - S3 image utilities
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Next.js requires 'use client' directive for state management
// CRITICAL: AWS S3 URLs must be HTTPS, bucket name in URL format
// CRITICAL: Tailwind classes need proper spacing with cn() utility
// CRITICAL: React state updates are async, use functional updates
// CRITICAL: Image components need proper error handling onError prop
// CRITICAL: Switch component from Radix UI uses onCheckedChange, not onChange
// CRITICAL: Property database schema has nullable fields, handle undefined
// CRITICAL: AWS S3 bucket: vesta-configuration-files, region: us-east-1
// CRITICAL: Template aspect ratios: vertical 210/297, horizontal 297/210
```

## Implementation Blueprint

### Data Models and Structure

Core data models for template configuration and extended property data:

```typescript
// src/types/template-data.ts - EXTEND existing interfaces
interface TemplateConfiguration {
  orientation: "vertical" | "horizontal";
  propertyType: "piso" | "casa" | "local" | "garaje" | "solar";
  imageCount: 3 | 4;
  showIcons: boolean;
  showQR: boolean;
  showWatermark: boolean;
  showPhone: boolean;
  showShortDescription: boolean;
  listingType: "venta" | "alquiler";
  additionalFields: string[]; // max 2 fields from property schema
}

interface ExtendedTemplatePropertyData extends TemplatePropertyData {
  // Additional displayable fields from database schema
  energyConsumptionScale?: string;
  yearBuilt?: number;
  hasElevator?: boolean;
  hasGarage?: boolean;
  terrace?: boolean;
  orientation?: string;
  shortDescription?: string;
  listingType?: "venta" | "alquiler";
}
```

### List of Tasks to be Completed

```yaml
Task 1:
MODIFY src/types/template-data.ts:
  - FIND: "export interface TemplatePropertyData"
  - INJECT after last interface: TemplateConfiguration and ExtendedTemplatePropertyData
  - PRESERVE: Existing interfaces unchanged

CREATE src/lib/carteleria/s3-images.ts:
  - MIRROR pattern from: src/lib/carteleria/mock-data.ts (image URL structure)
  - IMPLEMENT: getTemplateImages function for AWS S3 URLs
  - USE: vesta-configuration-files bucket URLs

Task 2:
CREATE src/components/admin/carteleria/controls/display-toggles.tsx:
  - IMPORT: Switch from "~/components/ui/switch"
  - IMPLEMENT: Boolean toggle controls for icons, QR, watermark, phone, description
  - PATTERN: Use onCheckedChange prop for Switch component

CREATE src/components/admin/carteleria/controls/additional-fields-selector.tsx:
  - IMPLEMENT: Grid of selectable property fields with 2-item limit
  - USE: Database schema fields from research findings
  - PATTERN: Button selection with disabled state when limit reached

CREATE src/components/admin/carteleria/controls/image-count-selector.tsx:
  - IMPLEMENT: Radio group for 3 or 4 image selection
  - PATTERN: Follow existing select component styling

CREATE src/components/admin/carteleria/controls/listing-type-selector.tsx:
  - IMPLEMENT: Toggle between "Venta" and "Alquiler"
  - PATTERN: Use existing select styling from playground page

Task 3:
MODIFY src/app/(dashboard)/playground/page.tsx:
  - FIND: Current state management useState hooks
  - ADD: TemplateConfiguration state alongside existing propertyData state  
  - INJECT: New control components in left panel
  - MODIFY: Template preview to use ConfigurableTemplate
  - PRESERVE: Existing property data controls and layout structure

Task 4:
CREATE src/components/admin/carteleria/templates/configurable-template.tsx:
  - IMPLEMENT: Dynamic template that switches between vertical/horizontal
  - CONDITIONAL rendering based on TemplateConfiguration
  - PATTERN: Mirror existing ModernTemplateVertical/Horizontal structure
  - HANDLE: 3 vs 4 image grid layouts, toggleable features

CREATE src/components/admin/carteleria/watermark.tsx:
  - IMPLEMENT: Absolute positioned overlay component
  - PATTERN: Use transform utilities for rotation and centering
  - CONDITIONAL: Show only when config.showWatermark is true

Task 5:
MODIFY src/lib/carteleria/mock-data.ts:
  - FIND: "export const getDefaultPropertyData"
  - ADD: getExtendedDefaultPropertyData function with additional fields
  - UPDATE: Add S3 image URLs from vesta-configuration-files
  - PRESERVE: Existing mock data functions and structure

Task 6:
MODIFY src/components/admin/carteleria/templates/modern/modern-template-vertical.tsx:
  - OPTIONAL: Add support for 4-image layout if needed
  - PRESERVE: Existing 3-image layout and all current functionality

MODIFY src/components/admin/carteleria/templates/modern/modern-template-horizontal.tsx:
  - OPTIONAL: Add support for 4-image layout if needed  
  - PRESERVE: Existing 3-image layout and all current functionality
```

### Per Task Pseudocode

```typescript
// Task 1 - Type Extensions
// CRITICAL: Extend existing interfaces, don't replace
interface TemplateConfiguration {
    // PATTERN: Use literal types for constrained values
    orientation: "vertical" | "horizontal";
    imageCount: 3 | 4; // GOTCHA: Union type for exact values
    // PATTERN: Boolean flags for toggles
    showIcons: boolean;
    // PATTERN: Array for multi-select with validation
    additionalFields: string[]; // max 2 validated in component
}

// Task 3 - Playground Page Enhancement
const PlaygroundPage = () => {
    // PATTERN: Separate state objects for different concerns
    const [config, setConfig] = useState<TemplateConfiguration>({
        orientation: "vertical",
        imageCount: 3,
        showIcons: true,
        // GOTCHA: Default values match existing behavior
        additionalFields: []
    });
    
    // PATTERN: Functional state updates for complex objects
    const updateConfig = (updates: Partial<TemplateConfiguration>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    };
    
    // CRITICAL: Pass both data and config to template
    return (
        <ConfigurableTemplate 
            data={propertyData} 
            config={config}
        />
    );
};

// Task 4 - Configurable Template
export const ConfigurableTemplate = ({ data, config }) => {
    // PATTERN: Conditional rendering based on config
    const renderImages = () => {
        const images = data.images.slice(0, config.imageCount);
        // GOTCHA: Handle 4-image layout differently than 3-image
        if (config.imageCount === 4) {
            return <FourImageGrid images={images} />;
        }
        return <ThreeImageGrid images={images} />;
    };
    
    // PATTERN: Early return for conditional features
    if (!config.showIcons) return null;
    
    // GOTCHA: Use existing template components as foundation
    const BaseTemplate = config.orientation === "vertical" 
        ? ModernTemplateVertical 
        : ModernTemplateHorizontal;
    
    return (
        <BaseTemplate data={data}>
            {config.showWatermark && <Watermark />}
            {/* Other conditional elements */}
        </BaseTemplate>
    );
};
```

### Integration Points

```yaml
STATE_MANAGEMENT:
  - pattern: "useState for configuration object"
  - update: "Functional updates with spread operator"
  - validation: "Validate additionalFields.length <= 2"

COMPONENTS:
  - import: "Switch from ~/components/ui/switch"
  - styling: "Use existing Tailwind classes and cn() utility"
  - icons: "Import from lucide-react"

AWS_S3:
  - bucket: "vesta-configuration-files"
  - path: "/templates/"  
  - base_url: "https://inmobiliaria-acropolis.s3.amazonaws.com"
  - images: ["IMG_0744.JPG", "IMG_0745.JPG", "IMG_0749.JPG"]

TEMPLATES:
  - preserve: "Existing aspect ratios and layouts"
  - extend: "Add 4-image grid option"
  - conditional: "Feature toggles via props"
```

## File Structure

```
src/
├── app/
│   └── (dashboard)/
│       └── playground/
│           └── page.tsx [MODIFY]
├── components/
│   └── admin/
│       └── carteleria/
│           ├── controls/
│           │   ├── display-toggles.tsx [CREATE]
│           │   ├── additional-fields-selector.tsx [CREATE]
│           │   ├── image-count-selector.tsx [CREATE]
│           │   └── listing-type-selector.tsx [CREATE]
│           ├── templates/
│           │   ├── configurable-template.tsx [CREATE]
│           │   └── modern/
│           │       ├── modern-template-vertical.tsx [MODIFY]
│           │       └── modern-template-horizontal.tsx [MODIFY]
│           └── watermark.tsx [CREATE]
├── lib/
│   └── carteleria/
│       ├── mock-data.ts [MODIFY]
│       └── s3-images.ts [CREATE]
└── types/
    └── template-data.ts [MODIFY]
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm typecheck                          # Type checking
pnpm lint:fix                          # Auto-fix linting issues
pnpm format:write                      # Format code with Prettier

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests

```typescript
// CREATE __tests__/configurable-template.test.tsx with these test cases:
describe('ConfigurableTemplate', () => {
  it('should render vertical template when config.orientation is vertical', () => {
    const config = { orientation: 'vertical', imageCount: 3 };
    render(<ConfigurableTemplate data={mockData} config={config} />);
    expect(screen.getByTestId('template-modern-vertical')).toBeInTheDocument();
  });

  it('should show 4 images when config.imageCount is 4', () => {
    const config = { imageCount: 4 };
    render(<ConfigurableTemplate data={mockData} config={config} />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(4);
  });

  it('should hide QR code when config.showQR is false', () => {
    const config = { showQR: false };
    render(<ConfigurableTemplate data={mockData} config={config} />);
    expect(screen.queryByTestId('property-qr-code')).not.toBeInTheDocument();
  });

  it('should show watermark when config.showWatermark is true', () => {
    const config = { showWatermark: true };
    render(<ConfigurableTemplate data={mockData} config={config} />);
    expect(screen.getByTestId('watermark')).toBeInTheDocument();
  });
});

// CREATE __tests__/additional-fields-selector.test.tsx
describe('AdditionalFieldsSelector', () => {
  it('should limit selection to 2 fields maximum', () => {
    const onChangeMock = jest.fn();
    render(<AdditionalFieldsSelector selected={[]} onChange={onChangeMock} />);
    
    // Select 3 fields
    fireEvent.click(screen.getByText('Ascensor'));
    fireEvent.click(screen.getByText('Garaje'));
    fireEvent.click(screen.getByText('Terraza'));
    
    // Only first 2 should be selected
    expect(onChangeMock).toHaveBeenCalledWith(['hasElevator', 'hasGarage']);
  });
});
```

```bash
# Run and iterate until passing:
pnpm test configurable-template.test.tsx additional-fields-selector.test.tsx
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test

```bash
# Start the development server
pnpm dev

# Open playground page in browser
open http://localhost:3000/playground

# Manual testing checklist:
echo "✓ Template orientation switch works (vertical/horizontal)"
echo "✓ Property type selector updates template correctly"  
echo "✓ Image count selector shows 3 or 4 images appropriately"
echo "✓ Icons toggle shows/hides property icons"
echo "✓ QR code toggle shows/hides QR code"
echo "✓ Watermark toggle shows/hides watermark overlay"
echo "✓ Phone toggle shows/hides contact phone"
echo "✓ Short description toggle shows/hides description text"
echo "✓ Listing type selector updates template header"
echo "✓ Additional fields selector limits to 2 selections"
echo "✓ Additional fields display correctly on template"
echo "✓ All controls persist state during interaction"
echo "✓ Template preview updates in real-time"
echo "✓ AWS S3 images load correctly from vesta-configuration-files"
echo "✓ Error states handle missing images gracefully"

# Test responsive design
echo "✓ Responsive design works on mobile (375px width)"
echo "✓ Responsive design works on desktop (1920px width)"
```

### Level 4: Deployment & Creative Validation

```bash
# Build verification
pnpm build
# Expected: Successful build with no errors

# Performance testing
# Test image loading performance with network throttling
# Verify no memory leaks with React DevTools Profiler
# Check bundle size impact with pnpm run analyze (if available)

# Accessibility testing  
# Test keyboard navigation through all controls
# Verify screen reader compatibility with NVDA/JAWS
# Check color contrast ratios meet WCAG guidelines

# Cross-browser testing
# Test in Chrome, Firefox, Safari, Edge
# Verify template rendering consistency across browsers
# Check image loading behavior with slow connections
```

## Key Implementation Notes

### State Management Pattern
- Use React `useState` for local state
- Pass configuration object down to template
- Use callbacks for state updates
- Consider using `useReducer` if state becomes complex

### Image Layout Logic
- 3 images: 1 large + 2 small (current pattern)
- 4 images: 2x2 grid or 1 large + 3 small
- Handle missing images gracefully with placeholders

### Toggle Implementation
- Use existing `Switch` component from `src/components/ui/switch.tsx`
- Group related toggles in sections
- Provide clear labels and optional tooltips

### Additional Fields Display
- Format based on field type (boolean → icon, number → formatted value)
- Use consistent icon set (Lucide React)
- Handle undefined values gracefully

### Watermark Considerations
- Position absolutely over template
- Adjust opacity for visibility without obstruction
- Consider using brand logo from database when available

### Performance Optimization
- Memoize template preview to avoid unnecessary re-renders
- Lazy load images from S3
- Use `React.memo` for control components

## Final Validation Checklist

- [ ] All tests pass: `pnpm test`
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm typecheck`
- [ ] Build succeeds: `pnpm build`
- [ ] Manual testing successful: All 10 controls functional
- [ ] Error cases handled gracefully: Missing images, invalid selections
- [ ] Responsive design verified: Mobile (375px) and desktop (1920px)
- [ ] AWS S3 images loading: From vesta-configuration-files bucket
- [ ] Real-time preview updates: All controls reflect immediately
- [ ] Additional fields validation: Maximum 2 selections enforced

---

## Anti-Patterns to Avoid

- ❌ Don't modify existing template components destructively
- ❌ Don't hardcode AWS S3 URLs without environment configuration
- ❌ Don't skip validation of additionalFields array length
- ❌ Don't use inline styles instead of Tailwind classes
- ❌ Don't forget error boundaries for template rendering failures
- ❌ Don't ignore image loading errors - always provide fallbacks
- ❌ Don't create new state management patterns - use existing useState
- ❌ Don't break existing playground functionality during enhancement
- ❌ Don't skip responsive design considerations for mobile devices
- ❌ Don't forget accessibility attributes for screen readers

## External Resources

### UI Component Libraries
- Radix UI Switch: https://www.radix-ui.com/primitives/docs/components/switch
- Lucide Icons: https://lucide.dev/icons/
- Tailwind CSS Utilities: https://tailwindcss.com/docs/utility-first

### AWS S3 Documentation  
- S3 HTTPS URLs: https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html#access-bucket-intro
- CORS Configuration: https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html

### React Patterns
- State Management: https://react.dev/learn/managing-state
- Conditional Rendering: https://react.dev/learn/conditional-rendering
- Component Composition: https://react.dev/learn/passing-props-to-a-component

## Error Handling Strategy

### Image Loading Errors
```typescript
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  // PATTERN: Hide broken images gracefully
  const target = e.target as HTMLImageElement;
  target.style.display = "none";
  // GOTCHA: Also log for debugging
  console.warn("Failed to load image:", target.src);
};
```

### State Validation Errors
```typescript
const validateAdditionalFields = (fields: string[]): string[] => {
  // CRITICAL: Enforce maximum 2 selections
  if (fields.length > 2) {
    console.warn("Too many additional fields selected, limiting to 2");
    return fields.slice(0, 2);
  }
  return fields;
};
```

### Template Rendering Errors
```typescript
// PATTERN: Error boundary for template components
const TemplateErrorBoundary = ({ children }) => {
  // Fallback to basic template if configurable template crashes
  return <ErrorBoundary fallback={<ModernTemplateVertical />}>
    {children}
  </ErrorBoundary>;
};
```

---

**PRP Confidence Score: 8/10** - Comprehensive context provided with clear implementation path and validation gates

**Implementation Time Estimate**: 4-6 hours  
**Complexity**: Medium-High  
**Risk Level**: Low - Building on proven patterns