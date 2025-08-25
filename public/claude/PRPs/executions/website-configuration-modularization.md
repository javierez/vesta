name: "Website Configuration Component Modularization - Complete Refactoring PRP v2"
description: |

## Purpose

Transform the large 2,908-line `website-configuration.tsx` monolithic component into a modular, maintainable architecture following established React patterns and the project's existing code organization conventions.

## Core Principles

1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance

---

## Goal

Refactor the massive `@src/components/admin/account/website-configuration.tsx` (2,908 lines) into a well-organized, modular component architecture that separates concerns, improves maintainability, and follows React best practices while preserving all existing functionality.

## Why

- **Maintainability**: The current 2,908-line component is difficult to understand, debug, and modify
- **Performance**: Enable code splitting and optimized re-renders with isolated state management
- **Developer Experience**: Faster development cycles with focused, testable components
- **Scalability**: Easy addition of new website configuration sections with established patterns
- **Collaboration**: Reduced merge conflicts with isolated component responsibilities

## What

Break down the monolithic component into:
- **1 Main wrapper component** with shared state and navigation
- **2 Core shared components** (sidebar navigation and save button)
- **12 Section components** (SEO, branding, hero, featured, about, properties, testimonials, contact, footer, social, head, meta)
- **5 Specialized sub-components** (office manager, testimonial manager, social links input, image input with preview, KPI configuration)

### Success Criteria

- [ ] All 12 sections extracted into separate components in `website-sections/` folder
- [ ] Shared functionality extracted into reusable hooks and components
- [ ] All existing functionality preserved with identical behavior
- [ ] TypeScript types properly defined and shared across components
- [ ] Form state management works seamlessly across all components
- [ ] Save operations function identically for each section
- [ ] No performance regressions in form interactions
- [ ] All existing tests pass without modification
- [ ] Build and lint processes complete without errors

## All Needed Context

### Documentation & References (list all context needed to implement the feature)

```yaml
# MUST READ - Include these in your context window
- url: https://www.sitepoint.com/react-architecture-best-practices/
  why: React Architecture Best Practices for 2024 component organization

- url: https://martinfowler.com/articles/modularizing-react-apps.html
  why: Martin Fowler's patterns for modularizing React applications 

- url: https://alexkondov.com/refactoring-a-messy-react-component/
  why: Common sense refactoring patterns for messy React components

- file: src/components/propiedades/form/property-characteristics-form.tsx
  why: Example of modular state management with ModuleState pattern and sub-components

- file: src/components/admin/carteleria/controls/
  why: Perfect example of controls organization pattern in a subdirectory

- file: src/types/website-settings.ts
  why: Complete TypeScript definitions for all website configuration schemas

- file: src/components/propiedades/form/property-characteristics-form-garage.tsx
  why: Pattern for type-specific sub-components (garage, solar, local variants)

- file: src/components/admin/carteleria/controls/display-options.tsx
  why: Clean component pattern with props interface and change handlers

- file: src/components/propiedades/form/common/modern-save-indicator.tsx
  why: Reusable save state indicator component pattern
```

### Current Codebase tree (run `tree` in the root of the project) to get an overview of the codebase

```bash
src/components/admin/account/
├── website-configuration.tsx     # CURRENT: 2,908 lines to be refactored
├── account-configuration.tsx     # Similar pattern reference
├── portal-configuration.tsx      # Similar pattern reference
└── other admin components...

src/components/admin/carteleria/  # EXCELLENT modular pattern example
├── controls/                     # Sub-components directory pattern
│   ├── additional-fields-selector.tsx
│   ├── display-options.tsx       # Clean component with props interface
│   ├── display-toggles.tsx
│   ├── image-count-selector.tsx
│   └── template-style-selector.tsx
├── templates/                    # Another good organization pattern
└── main components...

src/components/propiedades/form/  # EXCELLENT modular state management
├── common/                       # Shared components directory
│   ├── modern-save-indicator.tsx # Reusable save state component
│   └── property-title.tsx
├── property-characteristics-form.tsx     # Main component with ModuleState
├── property-characteristics-form-garage.tsx  # Type-specific sub-component
└── property-characteristics-form-solar.tsx   # Type-specific sub-component

src/types/
├── website-settings.ts           # Complete schema definitions
└── other type files...
```

### Desired Codebase tree with files to be added and responsibility of file

```bash
src/components/admin/account/
├── website-configuration.tsx     # REFACTORED: Main wrapper (200 lines max)
├── website-sidebar.tsx          # NEW: Navigation sidebar component
├── website-save-button.tsx      # NEW: Reusable save button with state
├── website-sections/             # NEW: Section components directory
│   ├── seo-section.tsx          # NEW: SEO optimization fields (~100 lines)
│   ├── branding-section.tsx     # NEW: Logo and favicon management (~100 lines)
│   ├── hero-section.tsx         # NEW: Hero section configuration (~150 lines)
│   ├── featured-section.tsx     # NEW: Featured properties settings (~80 lines)
│   ├── about-section.tsx        # NEW: About section with KPIs (~300 lines)
│   ├── properties-section.tsx   # NEW: Properties listing config (~120 lines)
│   ├── testimonials-section.tsx # NEW: Testimonials management (~350 lines)
│   ├── contact-section.tsx      # NEW: Contact and offices (~450 lines)
│   ├── footer-section.tsx       # NEW: Footer configuration (~250 lines)
│   ├── social-section.tsx       # NEW: Social media links (~200 lines)
│   ├── head-section.tsx         # NEW: Custom scripts and tracking (~80 lines)
│   ├── meta-section.tsx         # NEW: Metadata configuration (~130 lines)
│   └── components/              # NEW: Specialized sub-components
│       ├── office-manager.tsx           # NEW: Office CRUD operations
│       ├── testimonial-manager.tsx      # NEW: Testimonial CRUD operations  
│       ├── social-links-input.tsx       # NEW: Social media links input
│       ├── image-input-with-preview.tsx # NEW: Image upload with preview
│       └── kpi-configuration.tsx        # NEW: KPI fields management
├── hooks/                       # NEW: Shared custom hooks
│   ├── use-website-form.ts      # NEW: Form state management hook
│   └── use-website-save.ts      # NEW: Save operations hook
└── types/                       # NEW: Component-specific types
    └── website-sections.ts      # NEW: Section component prop types
```

### Known Gotchas of our codebase & Library Quirks

```typescript
// CRITICAL: Next.js requires 'use client' directive for client-side components
// All React components with hooks must start with "use client";

// CRITICAL: React Hook Form patterns in the codebase
// - Use zodResolver with zod schemas for validation
// - Form control is passed down via props to child components
// - Use FormField, FormItem, FormLabel, FormMessage for consistent UI

// CRITICAL: State management patterns observed
// - Multiple useState hooks for UI state (loading, editing modes, etc.)
// - Complex nested form state with arrays and objects
// - Section-specific state isolation where possible

// CRITICAL: TypeScript integration
// - All schemas defined in src/types/website-settings.ts using zod
// - Strict typing for all component props and interfaces
// - Use of branded types for IDs (bigint account_id, string testimonial_id)

// CRITICAL: Database operations patterns
// - All actions imported from ~/app/actions/website-settings
// - Async operations with proper error handling and loading states
// - Database sync with local state for CRUD operations (testimonials, offices)

// CRITICAL: UI component patterns from existing codebase
// - Lucide React icons for all UI icons
// - Sonner for toast notifications
// - Custom UI components from ~/components/ui/* directory
// - Consistent styling with cn() utility and Tailwind classes

// CRITICAL: Image handling patterns
// - Image previews with optional display state
// - URL validation for image inputs using zod schemas
// - Proper loading states for image uploads

// GOTCHA: Testimonials and Offices have complex CRUD with local state sync
// - Database operations need to update local state immediately
// - Editing modes use string IDs to track which item is being edited
// - Add modes use boolean flags to show/hide add forms

// GOTCHA: Social links have dynamic show/hide logic
// - Individual boolean state for each social platform input visibility
// - Icons from Lucide React (Facebook, Instagram, Linkedin, etc.)

// GOTCHA: Form validation and save operations
// - Section-specific data extraction from form state
// - Centralized save button with section-aware save logic
// - Error handling with toast notifications for failed saves
```

## Implementation Blueprint

### Data models and structure

Create the core data models to ensure type safety and consistency across all components.

```typescript
// Types for component props and section communication
interface SectionProps {
  form: UseFormReturn<WebsiteConfigurationInput>;
  loading?: boolean;
  onSave?: (sectionData: any) => Promise<void>;
}

interface WebsiteSectionBaseProps extends SectionProps {
  isActive: boolean;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

// Hook return types for state management
interface UseWebsiteFormReturn {
  form: UseFormReturn<WebsiteConfigurationInput>;
  loading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

interface UseWebsiteSaveReturn {
  isPending: boolean;
  saveSection: (section: string, data: any) => Promise<void>;
  saveAll: () => Promise<void>;
}

// Complex sub-component state types
interface OfficeManagerState {
  editingOffice: string | null;
  showAddOffice: boolean;
  offices: Office[];
}

interface TestimonialManagerState {
  editingTestimonial: string | null;
  showAddTestimonial: boolean;
  showAvatarInput: string | null;
  dbTestimonials: Testimonial[];
  loadingTestimonials: boolean;
}
```

### List of tasks to be completed to fulfill the PRP in the order they should be completed

```yaml
Task 1: Create shared infrastructure
CREATE src/components/admin/account/hooks/use-website-form.ts:
  - EXTRACT form initialization logic from main component
  - INCLUDE all default values and validation schema setup
  - PRESERVE existing form state structure exactly
  - PATTERN: Mirror custom hook pattern from src/hooks/use-appointments.ts

CREATE src/components/admin/account/hooks/use-website-save.ts:
  - EXTRACT save operation logic from main component  
  - INCLUDE section-specific data extraction patterns
  - PRESERVE all existing error handling and success notifications
  - PATTERN: Follow async operation patterns from existing hooks

Task 2: Create shared UI components
CREATE src/components/admin/account/website-sidebar.tsx:
  - EXTRACT navigation sidebar from main component lines 65-134
  - INCLUDE all navigation items with icons and descriptions
  - PRESERVE active section highlighting and click handlers
  - PATTERN: Follow sidebar navigation from admin layout patterns

CREATE src/components/admin/account/website-save-button.tsx:
  - EXTRACT save button with loading states from main component
  - INCLUDE hasUnsavedChanges detection and save pending states  
  - PRESERVE all existing save button styling and behavior
  - PATTERN: Mirror ModernSaveIndicator from property forms

Task 3: Extract simple sections first (validation pattern)
CREATE src/components/admin/account/website-sections/seo-section.tsx:
  - EXTRACT SEO section from main component lines 777-859
  - INCLUDE all SEO form fields (title, description, keywords, og props)
  - PRESERVE form validation and field relationships
  - PATTERN: Follow form field patterns from contact forms

CREATE src/components/admin/account/website-sections/branding-section.tsx:
  - EXTRACT branding section from main component lines 862-949
  - INCLUDE logo and favicon input fields with previews
  - PRESERVE image preview functionality and validation
  - PATTERN: Follow image input patterns from existing components

CREATE src/components/admin/account/website-sections/featured-section.tsx:
  - EXTRACT featured section from main component lines 1085-1143
  - INCLUDE title, subtitle, and maxItems configuration
  - PRESERVE simple form field patterns
  - PATTERN: Follow basic form section patterns

CREATE src/components/admin/account/website-sections/head-section.tsx:
  - EXTRACT head section from main component lines 2689-2755
  - INCLUDE custom scripts, Google Analytics, Facebook Pixel fields
  - PRESERVE textarea functionality for scripts
  - PATTERN: Follow textarea patterns from existing forms

CREATE src/components/admin/account/website-sections/meta-section.tsx:
  - EXTRACT meta section from main component lines 2758-2871
  - INCLUDE metadata configuration fields
  - PRESERVE form field relationships and validation
  - PATTERN: Follow metadata field patterns

Task 4: Extract medium complexity sections
CREATE src/components/admin/account/website-sections/hero-section.tsx:
  - EXTRACT hero section from main component lines 952-1082
  - INCLUDE title, subtitle, background image, and button configuration
  - PRESERVE image input with show/hide toggle functionality
  - PATTERN: Follow conditional field display patterns

CREATE src/components/admin/account/website-sections/properties-section.tsx:
  - EXTRACT properties section from main component lines 1431-1523
  - INCLUDE title, subtitle, itemsPerPage, and configuration options
  - PRESERVE number input validation and constraints
  - PATTERN: Follow numeric field patterns with validation

CREATE src/components/admin/account/website-sections/footer-section.tsx:
  - EXTRACT footer section from main component lines 2275-2497
  - INCLUDE company info, social links, visibility toggles, and links arrays
  - PRESERVE complex nested object handling for visibility settings
  - PATTERN: Follow complex object field patterns

Task 5: Extract complex sections with sub-components
CREATE src/components/admin/account/website-sections/components/kpi-configuration.tsx:
  - EXTRACT KPI fields from about section (showKPI toggle and 4 KPI pairs)
  - INCLUDE conditional display based on showKPI toggle
  - PRESERVE KPI name/data field pairs structure
  - PATTERN: Follow conditional component patterns

CREATE src/components/admin/account/website-sections/about-section.tsx:
  - EXTRACT about section from main component lines 1146-1428 
  - INCLUDE title, content, image, services array, and KPI configuration
  - INTEGRATE KpiConfiguration sub-component for KPI fields
  - PRESERVE complex services array handling and KPI toggle logic
  - PATTERN: Follow complex section with sub-components pattern

CREATE src/components/admin/account/website-sections/components/social-links-input.tsx:
  - EXTRACT social links input logic with dynamic show/hide
  - INCLUDE individual platform visibility toggles
  - PRESERVE Facebook, Instagram, LinkedIn, Twitter, YouTube handling
  - PATTERN: Follow dynamic field visibility patterns

CREATE src/components/admin/account/website-sections/social-section.tsx:
  - EXTRACT social section from main component lines 2500-2685
  - INTEGRATE SocialLinksInput component for the complex logic
  - PRESERVE all social platform handling and validation
  - PATTERN: Follow section with integrated sub-component pattern

Task 6: Extract most complex CRUD sections  
CREATE src/components/admin/account/website-sections/components/testimonial-manager.tsx:
  - EXTRACT testimonial CRUD operations from main component
  - INCLUDE add, edit, delete operations with local state sync
  - PRESERVE database operations with loading states
  - PATTERN: Follow CRUD component patterns from contact forms

CREATE src/components/admin/account/website-sections/testimonials-section.tsx:
  - EXTRACT testimonials section from main component lines 1526-1849
  - INTEGRATE TestimonialManager for complex CRUD operations
  - PRESERVE testimonial seeding and database synchronization
  - PATTERN: Follow complex CRUD section pattern

CREATE src/components/admin/account/website-sections/components/office-manager.tsx:
  - EXTRACT office CRUD operations from main component  
  - INCLUDE add, edit, delete with complex nested object handling
  - PRESERVE address, phone, email, schedule object structures
  - PATTERN: Follow complex nested object CRUD patterns

CREATE src/components/admin/account/website-sections/contact-section.tsx:
  - EXTRACT contact section from main component lines 1852-2272
  - INTEGRATE OfficeManager for office CRUD operations
  - PRESERVE contact form settings and office management
  - PATTERN: Follow most complex section with CRUD integration

Task 7: Create shared image component
CREATE src/components/admin/account/website-sections/components/image-input-with-preview.tsx:
  - EXTRACT image input with preview functionality used across sections
  - INCLUDE URL validation, preview display, and optional visibility toggle
  - PRESERVE all image handling patterns from existing components
  - PATTERN: Follow reusable component patterns for common functionality

Task 8: Refactor main component to use new architecture
MODIFY src/components/admin/account/website-configuration.tsx:
  - REDUCE from 2,908 lines to approximately 200 lines
  - INTEGRATE all new hook and component imports
  - PRESERVE all existing prop interfaces and external API
  - MAINTAIN exact same behavior and functionality
  - PATTERN: Follow main wrapper component patterns

Task 9: Update type definitions
CREATE src/components/admin/account/types/website-sections.ts:
  - CONSOLIDATE all section component prop types
  - INCLUDE shared interfaces for component communication
  - PRESERVE strict TypeScript typing throughout
  - PATTERN: Follow type organization patterns from existing code

Task 10: Validation and cleanup
VERIFY all sections render correctly with form state
VERIFY all save operations work identically to original
VERIFY all CRUD operations function exactly as before
VERIFY TypeScript compilation passes without errors
VERIFY all existing functionality is preserved
```

### Per task pseudocode as needed added to each task

```typescript
// Task 1: use-website-form.ts - Custom hook for form state management
export function useWebsiteForm(accountId: bigint | null) {
  // PATTERN: Initialize form with zodResolver and defaultValues
  const form = useForm<WebsiteConfigurationInput>({
    resolver: zodResolver(websiteConfigurationSchema),
    defaultValues: { /* ... existing default structure ... */ }
  });

  // PATTERN: Load configuration data on mount
  useEffect(() => {
    if (!accountId) return;
    loadConfiguration(accountId);
  }, [accountId]);

  // CRITICAL: Preserve all existing loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  return { form, loading, error, hasUnsavedChanges, setHasUnsavedChanges };
}

// Task 2: website-sidebar.tsx - Navigation component
interface WebsiteSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  hasUnsavedChanges: boolean;
}

export function WebsiteSidebar({ activeSection, onSectionChange, hasUnsavedChanges }: WebsiteSidebarProps) {
  // PATTERN: Use existing navigationItems array
  const navigationItems = [ /* ... existing navigation structure ... */ ];
  
  // CRITICAL: Preserve active section highlighting and click behavior
  return (
    <div className="space-y-2">
      {navigationItems.map((item) => (
        <button key={item.id} onClick={() => onSectionChange(item.id)}>
          {/* PRESERVE: Icon, label, description, active styling */}
        </button>
      ))}
    </div>
  );
}

// Task 3: seo-section.tsx - Simple section example
interface SEOSectionProps extends WebsiteSectionBaseProps {}

export function SEOSection({ form, isActive, onUnsavedChanges }: SEOSectionProps) {
  // PATTERN: Only render when active section
  if (!isActive) return null;

  // CRITICAL: Use form.watch to detect changes and notify parent
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name?.startsWith('seoProps')) {
        onUnsavedChanges(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onUnsavedChanges]);

  return (
    <div className="space-y-6">
      {/* PRESERVE: All existing SEO form fields with FormField patterns */}
      <FormField control={form.control} name="seoProps.title" render={...} />
      <FormField control={form.control} name="seoProps.description" render={...} />
      {/* ... all other SEO fields ... */}
    </div>
  );
}

// Task 6: testimonial-manager.tsx - Complex CRUD component  
interface TestimonialManagerProps {
  form: UseFormReturn<WebsiteConfigurationInput>;
  accountId: bigint;
}

export function TestimonialManager({ form, accountId }: TestimonialManagerProps) {
  // CRITICAL: Preserve all existing CRUD state management
  const [dbTestimonials, setDbTestimonials] = useState<Testimonial[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<string | null>(null);
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);

  // PATTERN: Load testimonials with seeding logic
  const loadTestimonials = async (userAccountId: bigint) => {
    try {
      setLoadingTestimonials(true);
      
      // PRESERVE: Exact existing seeding and loading sequence
      await seedTestimonialsAction(userAccountId);
      const result = await getTestimonialsAction(userAccountId);
      
      if (result.success && result.data) {
        setDbTestimonials(result.data.map(t => ({ ...t, avatar: t.avatar ?? undefined })));
      }
    } catch (error) {
      console.error('Failed to load testimonials:', error);
    } finally {
      setLoadingTestimonials(false);
    }
  };

  // CRITICAL: Preserve all CRUD operations exactly
  const handleCreateTestimonial = async (data: Testimonial) => {
    // PRESERVE: Existing create logic with optimistic updates
  };

  const handleUpdateTestimonial = async (id: string, data: Partial<Testimonial>) => {
    // PRESERVE: Existing update logic with local state sync
  };

  const handleDeleteTestimonial = async (id: string) => {
    // PRESERVE: Existing delete logic with confirmation
  };

  return (
    <div>
      {/* PRESERVE: All existing testimonial management UI */}
      {/* Add testimonial form, edit modes, delete buttons, etc. */}
    </div>
  );
}

// Task 8: Main website-configuration.tsx refactor
export function WebsiteConfiguration() {
  const { data: session } = useSession();
  const [accountId, setAccountId] = useState<bigint | null>(null);
  const [activeSection, setActiveSection] = useState("seo");

  // PATTERN: Use new custom hooks for state management
  const { form, loading, error, hasUnsavedChanges, setHasUnsavedChanges } = useWebsiteForm(accountId);
  const { isPending, saveSection, saveAll } = useWebsiteSave(form, accountId);

  // CRITICAL: Preserve all existing initialization logic
  useEffect(() => {
    if (session?.user?.id) {
      getCurrentUserAccountId().then(setAccountId);
    }
  }, [session]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex">
      <WebsiteSidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        hasUnsavedChanges={hasUnsavedChanges}
      />
      
      <div className="flex-1">
        <WebsiteSaveButton 
          onSave={saveAll}
          isPending={isPending}
          hasUnsavedChanges={hasUnsavedChanges}
        />
        
        <Form {...form}>
          {/* PATTERN: Render all sections with shared props */}
          <SEOSection 
            form={form} 
            isActive={activeSection === 'seo'} 
            onUnsavedChanges={setHasUnsavedChanges} 
          />
          <BrandingSection 
            form={form} 
            isActive={activeSection === 'branding'} 
            onUnsavedChanges={setHasUnsavedChanges} 
          />
          {/* ... all other sections ... */}
        </Form>
      </div>
    </div>
  );
}
```

### Integration Points

```yaml
FORM STATE:
  - pattern: "All sections receive form control via props"
  - preserve: "Exact same form field names and validation rules"
  - integrate: "React Hook Form watch for change detection"

SAVE OPERATIONS:
  - pattern: "Centralized save logic with section-specific data extraction"
  - preserve: "Identical API calls to updateWebsiteSectionAction"
  - integrate: "Save button communicates with all sections"

CRUD OPERATIONS:
  - pattern: "Database operations maintain local state synchronization"
  - preserve: "Exact same API calls and error handling"
  - integrate: "Optimistic updates and loading states"

NAVIGATION:
  - pattern: "Active section state controls component visibility"
  - preserve: "Exact same navigation items and styling"
  - integrate: "Unsaved changes warnings on section switch"

TYPE SAFETY:
  - pattern: "All components have strict TypeScript interfaces"
  - preserve: "Existing zod schemas and validation rules"
  - integrate: "Shared prop types across all sections"
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
npm run typecheck                    # TypeScript compilation check
npm run lint                         # ESLint validation
npm run build                        # Next.js build verification

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Component Validation

```bash
# Start development server to test component rendering
npm run dev

# Manual verification checklist for each section:
echo "✓ SEO section renders all form fields correctly"
echo "✓ Branding section shows image previews properly"  
echo "✓ Hero section handles background image toggle"
echo "✓ About section displays KPI configuration conditionally"
echo "✓ Testimonials section loads and manages CRUD operations"
echo "✓ Contact section handles office management correctly"
echo "✓ Social section shows/hides platform inputs dynamically"
echo "✓ All sections maintain form validation rules"
echo "✓ Navigation between sections preserves form state"
echo "✓ Save button works for each individual section"
```

### Level 3: Functional Testing

```bash
# Test critical workflows that must work identically
echo "Testing form state persistence across section switches..."
echo "Testing save operations for each section individually..."
echo "Testing CRUD operations for testimonials and offices..."
echo "Testing image upload and preview functionality..."
echo "Testing social platform show/hide toggles..."
echo "Testing KPI configuration show/hide toggle..."
echo "Testing form validation across all sections..."

# Database operations testing
echo "Testing testimonial CRUD with database synchronization..."
echo "Testing office CRUD with complex nested objects..."
echo "Testing save operations update database correctly..."
```

### Level 4: Performance & Integration Validation

```bash
# Performance validation
echo "✓ No performance regressions in form interactions"
echo "✓ Component re-renders are optimized with proper dependencies"
echo "✓ Form state updates don't cause unnecessary re-renders"
echo "✓ Large sections load quickly without blocking UI"

# Integration validation  
echo "✓ All existing tests pass without modification"
echo "✓ External API calls function identically"
echo "✓ Error handling works exactly as before"
echo "✓ Loading states display consistently"
echo "✓ Toast notifications appear for all operations"

# Code quality validation
echo "✓ Components follow established patterns in codebase"
echo "✓ TypeScript types are properly shared and reused"
echo "✓ No code duplication across similar sections"
echo "✓ Consistent styling and UI patterns throughout"
```

## Final validation Checklist

- [ ] All tests pass: `npm test` (if tests exist)
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run typecheck`  
- [ ] Build succeeds: `npm run build`
- [ ] All 12 sections render correctly in development
- [ ] All form fields maintain existing behavior
- [ ] All save operations work identically to original
- [ ] All CRUD operations (testimonials, offices) function perfectly
- [ ] Form validation rules are preserved exactly
- [ ] Navigation between sections works seamlessly
- [ ] No regressions in existing functionality
- [ ] Performance is equal or better than original
- [ ] Code organization follows established patterns
- [ ] TypeScript types are properly defined and shared

---

## Anti-Patterns to Avoid

- ❌ Don't change existing form field names or validation rules
- ❌ Don't modify existing API calls or database operations
- ❌ Don't skip testing CRUD functionality for testimonials/offices
- ❌ Don't ignore TypeScript errors or use 'any' types
- ❌ Don't break existing navigation or active section logic
- ❌ Don't modify existing styling or UI patterns unnecessarily
- ❌ Don't create new patterns when existing ones work perfectly
- ❌ Don't skip validation because components are "simple"
- ❌ Don't use different state management patterns than existing code
- ❌ Don't hardcode values that should come from form state

## Complexity Score

**PRP Confidence Score: 9/10** 

This PRP provides comprehensive context with:
- ✅ Complete analysis of existing 2,908-line component
- ✅ Detailed breakdown of all 12 sections with line numbers
- ✅ Excellent modular patterns from existing codebase 
- ✅ All necessary TypeScript types and schemas identified
- ✅ Step-by-step implementation with pseudocode
- ✅ Comprehensive validation loops for each complexity level
- ✅ Known gotchas and patterns from similar components
- ✅ External research on React refactoring best practices

The systematic approach from simple sections to complex CRUD components, combined with extensive codebase pattern examples, provides everything needed for successful one-pass implementation.