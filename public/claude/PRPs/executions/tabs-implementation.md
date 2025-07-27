name: "Tabs Implementation for Contact and Property Detail Pages"
description: |

## Purpose
Implement tab-based navigation for the contact and property detail pages to organize UI elements into logical sections, improving user experience by reducing visual clutter and providing cleaner navigation.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Replace the current "all elements visible at once" layout in `app/contactos/[id]/page` and `app/propiedades/[id]/page` with a tabbed interface that allows users to navigate between different UI sections, maintaining all existing functionality while improving organization and user experience.

## Why
- **Business value**: Improves user workflow by reducing cognitive load and visual clutter
- **User impact**: Easier navigation through complex property and contact information
- **Integration**: Utilizes existing shadcn/ui tabs components already available in the project
- **Problems solved**: Information overload on detail pages, difficult to find specific sections

## What
Implement tab navigation that organizes existing UI components into logical groups while maintaining all current functionality and responsive design.

### Success Criteria
- [ ] All existing UI elements remain functional
- [ ] Tab navigation works smoothly with proper active states
- [ ] Mobile responsive with appropriate tab scrolling/stacking
- [ ] No regression in existing features
- [ ] Maintains existing save states and validation for forms
- [ ] Spanish language labels for all tabs

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://ui.shadcn.com/docs/components/tabs
  why: Official shadcn/ui tabs documentation for implementation patterns
  
- file: src/components/ui/tabs.tsx
  why: Existing tabs component implementation to understand available props and styling
  
- file: src/components/contactos/detail/contact-detail-layout.tsx
  why: Current contact page layout that needs to be modified
  
- file: src/app/propiedades/[id]/page.tsx
  why: Current property page layout that needs to be modified

- file: src/components/contactos/detail/contact-characteristics-form.tsx
  why: Complex form with multiple sections and save states that needs to work within tabs

- file: .claude/CLAUDE.md
  why: Project standards and patterns to follow

- doc: https://www.radix-ui.com/primitives/docs/components/tabs
  section: Accessibility section
  critical: Tabs are built on Radix UI and are fully accessible with keyboard navigation
```

### Current Codebase Structure
```bash
src/
├── app/
│   ├── contactos/
│   │   └── [id]/
│   │       └── page.tsx                 # Contact detail page (server component)
│   └── propiedades/
│       └── [id]/
│           └── page.tsx                 # Property detail page (server component)
├── components/
│   ├── ui/
│   │   └── tabs.tsx                     # Existing shadcn/ui tabs (unused)
│   ├── contactos/
│   │   └── detail/
│   │       ├── contact-detail-layout.tsx    # Main layout component
│   │       ├── contact-breadcrumb.tsx
│   │       ├── contact-form-header.tsx
│   │       └── contact-characteristics-form.tsx
│   └── propiedades/
│       ├── detail/
│       │   ├── property-breadcrump.tsx
│       │   ├── property-header.tsx
│       │   ├── image-gallery.tsx
│       │   ├── portal-selection.tsx
│       │   └── energy-certificate.tsx
│       └── form/
│           └── property-characteristics-form.tsx
```

### Desired Codebase Structure (files to be added/modified)
```bash
src/
├── components/
│   ├── contactos/
│   │   └── detail/
│   │       ├── contact-detail-layout.tsx    # MODIFY: Add tabs wrapper
│   │       └── contact-tabs.tsx             # CREATE: Tab implementation for contacts
│   └── propiedades/
│       └── detail/
│           └── property-tabs.tsx            # CREATE: Tab implementation for properties
├── app/
│   └── propiedades/
│       └── [id]/
│           └── page.tsx                     # MODIFY: Integrate tabs
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: shadcn/ui tabs are built on Radix UI
// - Tabs component requires defaultValue prop
// - TabsList, TabsTrigger, and TabsContent must be direct children
// - Client component required for interactivity ("use client")

// GOTCHA: Contact form has complex save states per module
// - Each module has independent save states
// - ModernSaveIndicator must work within tabs
// - Form validation and error states must be preserved

// PATTERN: Server components fetch data, client components handle tabs
// - Keep data fetching in page.tsx (server component)
// - Pass data to client component with tabs

// SPANISH: Use proper Spanish terminology for tab labels
// - "Información Básica" not "Basic Information"
// - "Características" not "Characteristics"
```

## Implementation Blueprint

### Data models and structure

No new data models needed - this is a UI reorganization of existing components.

### List of tasks to be completed in order

```yaml
Task 1: Create ContactTabs component
CREATE src/components/contactos/detail/contact-tabs.tsx:
  - PATTERN: Client component with "use client" directive
  - IMPORT: Tabs components from ~/components/ui
  - STRUCTURE: 
    - Tab 1: "Información" - Basic info + Contact details
    - Tab 2: "Notas" - Notes section
    - Tab 3: "Solicitudes" - Search requests (conditional)
    - Tab 4: "Propiedades" - Associated properties (conditional)
  - PRESERVE: All existing functionality and props

Task 2: Update ContactDetailLayout to use tabs
MODIFY src/components/contactos/detail/contact-detail-layout.tsx:
  - FIND: Current card-based layout
  - REPLACE: With ContactTabs component
  - PRESERVE: ContactBreadcrumb and ContactFormHeader outside tabs
  - PASS: All necessary props to ContactTabs

Task 3: Create PropertyTabs component
CREATE src/components/propiedades/detail/property-tabs.tsx:
  - PATTERN: Client component with "use client" directive
  - STRUCTURE:
    - Tab 1: "General" - Property header + Image gallery
    - Tab 2: "Características" - Property characteristics form
    - Tab 3: "Portales" - Portal selection
    - Tab 4: "Certificado Energético" - Energy certificate
  - HANDLE: Responsive design for mobile

Task 4: Update Property page to use tabs
MODIFY src/app/propiedades/[id]/page.tsx:
  - INTEGRATE: PropertyTabs component
  - PRESERVE: Server-side data fetching
  - MAINTAIN: PropertyBreadcrumb outside tabs
  - PASS: All fetched data to PropertyTabs

Task 5: Ensure mobile responsiveness
MODIFY both tab components:
  - ADD: Horizontal scroll for tabs on mobile
  - TEST: Tab visibility on small screens
  - ENSURE: Touch-friendly tab triggers

Task 6: Validate and test
RUN validation commands:
  - pnpm lint:fix
  - pnpm typecheck
  - pnpm format:write
  - Manual testing of all tab functionality
```

### Pseudocode for key components

```typescript
// Task 1: ContactTabs component
// src/components/contactos/detail/contact-tabs.tsx
"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui";

interface ContactTabsProps {
  contact: ExtendedContact;
  // Include all props from ContactCharacteristicsForm
}

export function ContactTabs({ contact }: ContactTabsProps) {
  // PATTERN: Default to first available tab
  const defaultTab = "informacion";
  
  // GOTCHA: Conditional tabs based on contact type
  const showSolicitudes = ['demandante', 'interesado', 'propietario'].includes(contact.contactType);
  const showPropiedades = ['propietario', 'demandante'].includes(contact.contactType);

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
        <TabsTrigger value="informacion">Información</TabsTrigger>
        <TabsTrigger value="notas">Notas</TabsTrigger>
        {showSolicitudes && <TabsTrigger value="solicitudes">Solicitudes</TabsTrigger>}
        {showPropiedades && <TabsTrigger value="propiedades">Propiedades</TabsTrigger>}
      </TabsList>
      
      <TabsContent value="informacion" className="mt-6">
        {/* Extract Basic Information and Contact Details sections */}
        {/* PRESERVE: ModernSaveIndicator functionality */}
      </TabsContent>
      
      <TabsContent value="notas" className="mt-6">
        {/* Extract Notes section */}
      </TabsContent>
      
      {/* Conditional tab contents */}
    </Tabs>
  );
}

// Task 3: PropertyTabs component  
// src/components/propiedades/detail/property-tabs.tsx
"use client";

export function PropertyTabs({ listing, images, energyCertificate, ...props }) {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="caracteristicas">Características</TabsTrigger>
        <TabsTrigger value="portales">Portales</TabsTrigger>
        <TabsTrigger value="certificado">Certificado Energético</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="mt-6">
        <div className="space-y-8">
          <PropertyHeader {...headerProps} />
          <ImageGallery images={images} {...galleryProps} />
        </div>
      </TabsContent>
      
      {/* Other tab contents following same pattern */}
    </Tabs>
  );
}
```

### Integration Points
```yaml
COMPONENTS:
  - modify: src/components/contactos/detail/contact-detail-layout.tsx
  - create: src/components/contactos/detail/contact-tabs.tsx
  - modify: src/app/propiedades/[id]/page.tsx
  - create: src/components/propiedades/detail/property-tabs.tsx
  
IMPORTS:
  - add: import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui"
  - pattern: "Always use ~ alias for src imports"
  
CLIENT/SERVER:
  - tabs components: "use client" directive required
  - page components: Remain server components
  - data flow: Server fetches → passes to client tabs
  
STYLING:
  - use existing: Tailwind classes from tabs.tsx
  - responsive: "grid-cols-2 lg:grid-cols-4" for tab lists
  - spacing: "mt-6" for TabsContent consistency
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
pnpm lint:fix              # Auto-fix ESLint issues
pnpm typecheck             # TypeScript type checking
pnpm format:write          # Format with Prettier

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Component & Integration Testing
```typescript
// Manual testing scenarios for ContactTabs:

// Test Case 1: Tab Navigation
// - Navigate to /contactos/[id]
// - Click each tab and verify content changes
// - Verify active tab styling
// - Check URL doesn't change (client-side navigation)

// Test Case 2: Conditional Tabs
// - Test with 'propietario' contact - should see all 4 tabs
// - Test with 'banco' contact - should see only 2 tabs
// - Test with 'demandante' - should see 3 tabs

// Test Case 3: Form Save States
// - Modify data in "Información" tab
// - Verify ModernSaveIndicator shows "modified" state
// - Save changes and verify "saved" state
// - Switch tabs and return - verify data persists

// Test Case 4: Mobile Responsiveness
// - Test on 375px width (mobile)
// - Verify tabs are scrollable horizontally
// - Verify content fits within viewport
// - Test touch interactions

// Manual testing for PropertyTabs:
// Similar test cases adapted for property pages
```

### Level 3: End-to-End Testing
```bash
# Build and run production build
pnpm build
pnpm start

# Test checklist:
# 1. Navigate to a contact detail page
# 2. Verify all tabs load correctly
# 3. Test form submissions within tabs
# 4. Check console for any errors
# 5. Repeat for property detail pages

# Performance check:
# - Tabs should switch instantly (no loading)
# - Forms should maintain their state
# - No layout shift when switching tabs
```

## Final Validation Checklist
- [ ] Build succeeds: `pnpm build`
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm typecheck`
- [ ] Code formatted: `pnpm format:check`
- [ ] Manual test successful on desktop (1920x1080)
- [ ] Manual test successful on mobile (375x667)
- [ ] All existing forms work within tabs
- [ ] ModernSaveIndicator functions correctly
- [ ] Conditional tabs show/hide based on contact type
- [ ] Spanish labels display correctly
- [ ] No console errors in browser
- [ ] Tab navigation is smooth and responsive
- [ ] Keyboard navigation works (Tab/Shift+Tab)
- [ ] Active tab state is clearly visible

---

## Anti-Patterns to Avoid
- ❌ Don't create new tab component from scratch - use existing shadcn/ui
- ❌ Don't break existing form validation or save states
- ❌ Don't make pages client components - only tab wrappers
- ❌ Don't hardcode tab labels - use constants for i18n readiness
- ❌ Don't forget mobile users - test horizontal scrolling
- ❌ Don't remove accessibility features from Radix UI
- ❌ Don't create files over 400 lines
- ❌ Don't duplicate code between contact and property tabs
- ❌ Don't forget to preserve breadcrumbs outside tabs
- ❌ Don't break the existing module-based save system

## Confidence Score: 9/10

The implementation is straightforward as all components already exist and just need reorganization. The shadcn/ui tabs are production-ready and well-tested. The only complexity is preserving the existing save state system in the contact forms, but this is well-documented in the current code.