name: "Cartelería Template Selection Redesign - Modern Template Gallery"
description: |

## Purpose

Complete redesign of the cartelería (signage templates) section to create a modern, minimalistic interface where users can select their favorite templates across different formats (A4, A3, A2, vertical, horizontal) and property types (piso, local, casa, garaje, solar). The system will feature a main style selection followed by detailed template customization for specific property types.

## Core Principles

1. **Modern & Minimalistic**: Clean, elegant interface that doesn't overwhelm users
2. **Hierarchical Selection**: Main style selection first, then detailed template customization
3. **Responsive Design**: Works perfectly on all devices and screen sizes
4. **Type Safety**: Full TypeScript implementation with proper interfaces
5. **Performance**: Lazy loading and optimized rendering for large template collections

---

## Goal

Redesign the existing cartelería page at `/account-admin/carteleria` to create a modern template selection system where users can:
1. Select a main visual style for their entire cartelería system
2. Choose specific formats (A4, A3, A2, vertical, horizontal)  
3. Select templates based on property types (piso, local, casa, garaje, solar)
4. Customize individual templates with field selections (e.g., garage templates without mini descriptions)
5. Preview templates in real-time before selection

## Why

- **User Experience**: Current implementation needs modernization with better UX patterns
- **Business Value**: Streamlined template selection increases user engagement and conversion
- **Scalability**: New design supports unlimited template variations and property types
- **Brand Consistency**: Hierarchical style selection ensures cohesive brand identity
- **Efficiency**: Faster template selection process reduces user friction

## What

A complete redesign featuring:
- **Main Style Selection**: Gallery of 6-8 primary design styles (modern, classic, minimalist, luxury, etc.)
- **Format Selection**: Cards for A4, A3, A2, vertical, horizontal orientations
- **Property Type Selection**: Visual cards for piso, local, casa, garaje, solar
- **Template Customization**: Detailed options for field inclusion/exclusion per template
- **Real-time Preview**: Live preview of selected templates with user branding
- **Responsive Layout**: Mobile-first design with smooth transitions

### Success Criteria

- [ ] Users can select a main style in under 30 seconds
- [ ] Template preview loads in under 2 seconds
- [ ] Interface works perfectly on mobile (375px) and desktop (1920px)
- [ ] All templates maintain user's brand colors and logo
- [ ] Selection state persists across page reloads
- [ ] Zero accessibility violations (WCAG 2.1 AA)

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://ui.shadcn.com/
  why: Primary component library patterns, Card, Button, Badge, Tabs components

- url: https://react-photo-album.com
  why: Responsive gallery layouts with TypeScript support, masonry and grid patterns

- url: https://www.radix-ui.com/primitives
  why: Accessible component primitives for tabs, dialogs, and interactive elements

- file: /src/components/admin/carteleria-templates.tsx
  why: Current implementation patterns, interfaces, and state management approach

- file: /src/components/admin/account-branding.tsx  
  why: Complex UI patterns, state management, modal dialogs, color selection interfaces

- file: /src/components/ui/tabs.tsx
  why: Tab component implementation with Radix UI and proper TypeScript

- file: /src/app/(dashboard)/account-admin/carteleria/page.tsx
  why: Page structure, breadcrumb patterns, and layout conventions

- doc: https://dev.to/theedgebreaker/building-a-responsive-image-gallery-with-nextjs-typescript-and-tailwind-css-46ee
  section: Responsive gallery implementation with TypeScript
  critical: Grid layouts, breakpoint handling, and performance optimization

- docfile: /public/claude/PRPs/templates.md
  why: Original feature requirements and user expectations
```

### Current Codebase Structure

```bash
src/
├── app/(dashboard)/account-admin/carteleria/
│   └── page.tsx                    # Current page implementation
├── components/
│   ├── admin/
│   │   ├── carteleria-templates.tsx # Current template component
│   │   ├── account-branding.tsx     # Pattern for complex UI interactions
│   │   └── account-admin-breadcrumb.tsx # Breadcrumb component
│   └── ui/                         # shadcn/ui components
│       ├── card.tsx, button.tsx, badge.tsx
│       ├── tabs.tsx, dialog.tsx, select.tsx
│       └── [all other UI components]
├── lib/
│   └── utils.ts                    # Utility functions including cn()
└── types/
    └── [type definitions]
```

### Desired Codebase Structure with New Files

```bash
src/
├── components/admin/
│   ├── carteleria/
│   │   ├── style-selector.tsx           # Main style selection component
│   │   ├── format-selector.tsx          # Format selection (A4, A3, etc.)  
│   │   ├── property-type-selector.tsx   # Property type selection
│   │   ├── template-customizer.tsx      # Detailed template customization
│   │   ├── template-preview.tsx         # Real-time template preview
│   │   └── template-gallery.tsx         # Responsive gallery layout
│   └── carteleria-redesigned.tsx       # Main orchestrator component
├── types/
│   └── carteleria.ts                    # All type definitions
└── lib/
    └── carteleria/
        ├── templates.ts                 # Template data and utilities
        └── styles.ts                    # Style definitions and helpers
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Next.js requires 'use client' directive for client-side components
'use client'

// CRITICAL: shadcn/ui uses className prop, not class
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

// CRITICAL: Tailwind responsive breakpoints (mobile-first approach)
// sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px

// CRITICAL: Current project uses Radix UI via shadcn/ui components
// Import pattern: import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

// CRITICAL: TypeScript interfaces must be properly exported/imported
// Use proper type definitions for all component props

// CRITICAL: State management uses useState for client-side state
// Persist selection state using localStorage or URL params

// CRITICAL: Image optimization uses Next.js Image component
import Image from "next/image"

// CRITICAL: Icons use lucide-react library
import { Star, Eye, Download, Settings } from "lucide-react"

// CRITICAL: Toast notifications use custom hook
import { useToast } from "~/components/hooks/use-toast"
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// src/types/carteleria.ts

export interface TemplateStyle {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: 'modern' | 'classic' | 'minimalist' | 'luxury' | 'creative' | 'professional';
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface TemplateFormat {
  id: string;
  name: string;
  dimensions: {
    width: number;
    height: number;
    unit: 'mm' | 'px';
  };
  orientation: 'portrait' | 'landscape';
  category: 'paper' | 'digital';
}

export interface PropertyType {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultFields: TemplateField[];
  category: 'residential' | 'commercial' | 'land';
}

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'image' | 'boolean';
  required: boolean;
  placeholder?: string;
}

export interface CarteleriaTemplate {
  id: string;
  name: string;
  description: string;
  styleId: string;
  formatId: string;
  propertyTypeId: string;
  preview: string;
  fields: TemplateField[];
  featured: boolean;
  tags: string[];
}

export interface CarteleriaSelection {
  styleId: string | null;
  formatIds: string[];
  propertyTypeIds: string[];
  templateIds: string[];
  customizations: Record<string, any>;
}
```

### List of Tasks to Complete (In Order)

```yaml
Task 1 - Create Type Definitions:
MODIFY src/types/carteleria.ts:
  - CREATE all interfaces for templates, styles, formats, property types
  - INCLUDE proper TypeScript export patterns
  - ENSURE all fields are properly typed

Task 2 - Create Template Data:
CREATE src/lib/carteleria/templates.ts:
  - DEFINE sample template styles (6-8 main styles)
  - DEFINE format options (A4, A3, A2, vertical, horizontal)
  - DEFINE property types (piso, local, casa, garaje, solar)
  - INCLUDE realistic preview images and descriptions

Task 3 - Create Style Selector Component:
CREATE src/components/admin/carteleria/style-selector.tsx:
  - MIRROR pattern from: src/components/admin/carteleria-templates.tsx (card grid)
  - IMPLEMENT responsive grid with hover effects
  - ADD style preview with color swatches
  - INCLUDE selection state management

Task 4 - Create Format Selector Component:
CREATE src/components/admin/carteleria/format-selector.tsx:
  - USE Card components for format selection
  - SHOW format dimensions and orientation
  - IMPLEMENT multi-select functionality
  - ADD visual format preview (aspect ratio representation)

Task 5 - Create Property Type Selector:
CREATE src/components/admin/carteleria/property-type-selector.tsx:
  - MIRROR card grid pattern from existing components
  - INCLUDE property type icons and descriptions
  - IMPLEMENT multi-select with checkboxes
  - ADD category grouping (residential, commercial, land)

Task 6 - Create Template Customizer:
CREATE src/components/admin/carteleria/template-customizer.tsx:
  - MIRROR pattern from: src/components/admin/account-branding.tsx (modal pattern)
  - IMPLEMENT field selection checkboxes
  - ADD drag-and-drop field reordering
  - INCLUDE real-time preview updates

Task 7 - Create Template Preview:
CREATE src/components/admin/carteleria/template-preview.tsx:
  - USE Next.js Image component for optimization
  - IMPLEMENT zoom and full-screen preview
  - ADD template download functionality
  - INCLUDE sharing options

Task 8 - Create Template Gallery:
CREATE src/components/admin/carteleria/template-gallery.tsx:
  - MIRROR responsive grid from existing carteleria-templates.tsx
  - IMPLEMENT filtering and search functionality
  - ADD infinite scroll or pagination
  - INCLUDE sort options (featured, popular, recent)

Task 9 - Create Main Orchestrator Component:
CREATE src/components/admin/carteleria-redesigned.tsx:
  - ORCHESTRATE all sub-components
  - IMPLEMENT step-by-step selection flow
  - ADD progress indicator
  - MANAGE global selection state

Task 10 - Update Main Page:
MODIFY src/app/(dashboard)/account-admin/carteleria/page.tsx:
  - REPLACE existing CarteleriaTemplates with new component
  - PRESERVE existing breadcrumb and layout patterns
  - ADD proper page metadata and SEO
  - ENSURE responsive layout preservation
```

### Step-by-Step Implementation Flow

```typescript
// Task 1-2: Data Foundation
// Create comprehensive type system and sample data
interface CarteleriaState {
  currentStep: 'style' | 'format' | 'property' | 'template' | 'customize';
  selections: CarteleriaSelection;
  previewTemplate: CarteleriaTemplate | null;
}

// Task 3-5: Selection Components  
// Each component handles its own state but reports to parent
const handleStyleSelection = (styleId: string) => {
  setSelection(prev => ({ ...prev, styleId }));
  setCurrentStep('format');
};

// Task 6-8: Advanced Components
// Template customizer with real-time preview
const handleFieldToggle = (templateId: string, fieldId: string, enabled: boolean) => {
  // Update template configuration
  // Trigger preview refresh
  // Persist changes to localStorage
};

// Task 9-10: Integration
// Main component orchestrates the entire flow
const CarteleriaRedesigned = () => {
  // PATTERN: Complex state management like account-branding.tsx
  // PATTERN: Step-by-step wizard flow
  // PATTERN: Responsive layout with mobile-first approach
};
```

### Integration Points

```yaml
DATABASE:
  - table: "carteleria_selections" 
  - columns: "account_id, style_id, format_ids, property_type_ids, template_ids, customizations, created_at, updated_at"
  - index: "CREATE INDEX idx_carteleria_account ON carteleria_selections(account_id)"

CONFIG:
  - add to: src/lib/config.ts
  - pattern: "export const CARTELERIA_PREVIEW_TIMEOUT = parseInt(process.env.CARTELERIA_PREVIEW_TIMEOUT || '5000')"

ROUTES:
  - existing: /account-admin/carteleria (modify existing page)
  - new api: /api/carteleria/templates (for dynamic template loading)
  - new api: /api/carteleria/preview (for template preview generation)

STORAGE:
  - localStorage: "carteleria_selection" (persist user selections)
  - S3: template preview images and generated templates
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm typecheck                    # TypeScript compilation check
pnpm lint:fix                     # ESLint with auto-fix
pnpm format:write                 # Prettier formatting

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Component Testing

```typescript
// Test each component individually
describe('StyleSelector', () => {
  it('should render all template styles', () => {
    render(<StyleSelector onSelect={mockOnSelect} />);
    expect(screen.getAllByRole('button')).toHaveLength(6); // 6 main styles
  });

  it('should handle style selection', () => {
    const mockOnSelect = jest.fn();
    render(<StyleSelector onSelect={mockOnSelect} />);
    fireEvent.click(screen.getByText('Modern'));
    expect(mockOnSelect).toHaveBeenCalledWith('modern');
  });

  it('should show preview on hover', () => {
    render(<StyleSelector onSelect={mockOnSelect} />);
    fireEvent.mouseEnter(screen.getByText('Modern'));
    expect(screen.getByAltText(/preview/i)).toBeInTheDocument();
  });
});

// Similar test patterns for FormatSelector, PropertyTypeSelector, etc.
```

```bash
# Run and iterate until passing:
pnpm test carteleria
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Testing

```bash
# Start development server
pnpm dev

# Test the complete user flow
curl -X GET http://localhost:3000/account-admin/carteleria
# Expected: Page loads without errors

# Test responsive design
# Open browser dev tools and test at breakpoints:
# - Mobile: 375px width
# - Tablet: 768px width  
# - Desktop: 1920px width

# Test interactive features:
# 1. Style selection advances to format selection
# 2. Format selection shows available templates
# 3. Template preview loads within 2 seconds
# 4. Selection state persists on page refresh
```

### Level 4: Accessibility & Performance

```bash
# Accessibility validation
npm install -g @axe-core/cli
axe http://localhost:3000/account-admin/carteleria
# Expected: Zero violations

# Performance testing
npm install -g lighthouse
lighthouse http://localhost:3000/account-admin/carteleria --output=html
# Expected: Performance score > 90

# Mobile usability testing
lighthouse http://localhost:3000/account-admin/carteleria --preset=perf --form-factor=mobile
# Expected: All mobile usability checks pass
```

## Final Validation Checklist

- [ ] All components render without TypeScript errors
- [ ] Responsive design works on mobile (375px) and desktop (1920px)
- [ ] Style selection flow is intuitive and fast (<30 seconds)
- [ ] Template previews load quickly (<2 seconds)
- [ ] Selection state persists across page reloads
- [ ] All interactive elements are keyboard accessible
- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] No console errors or warnings in browser
- [ ] Performance score > 90 on Lighthouse
- [ ] Works in Chrome, Firefox, Safari, and Edge

---

## Anti-Patterns to Avoid

- ❌ Don't create overly complex state management - keep it simple with useState
- ❌ Don't ignore mobile-first responsive design - test on small screens first
- ❌ Don't skip loading states - users need feedback during template loading
- ❌ Don't hardcode template data - make it configurable and extensible
- ❌ Don't forget accessibility - use proper ARIA labels and keyboard navigation
- ❌ Don't overcomplicate the UI - maintain minimalistic design principles
- ❌ Don't skip error handling - gracefully handle failed template loads
- ❌ Don't forget to preserve user's brand colors in template previews

## Confidence Score: 9/10

This PRP provides comprehensive context including:
✅ Complete codebase analysis with existing patterns  
✅ External research on modern UI patterns and real estate templates
✅ Detailed type definitions and data models
✅ Step-by-step implementation tasks with specific file references
✅ Integration points and validation gates
✅ Real examples from the codebase to follow
✅ Performance and accessibility requirements
✅ Anti-patterns to avoid

The AI agent has everything needed for successful one-pass implementation of a modern, responsive cartelería template selection system.