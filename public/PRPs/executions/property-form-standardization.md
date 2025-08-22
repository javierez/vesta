name: "Property Characteristics Form Standardization"
description: |

## Purpose

Standardize and validate property characteristics forms across different property types (solar, garage, local) to ensure consistency with the master template while properly adapting fields for each property type.

## Core Principles

1. **UI/UX Consistency**: All forms must match the master template's visual design and interaction patterns
2. **Code Reusability**: Extract common logic to reduce duplication
3. **Type Safety**: Ensure proper TypeScript types throughout
4. **Field Adaptation**: Hide inappropriate fields based on property type

---

## Goal

Ensure all property characteristics forms (master, solar, garage, local) follow the same structure, save state management, UI patterns, and properly hide/show fields based on property type requirements.

## Why

- **User Experience**: Consistent behavior across all property types reduces cognitive load
- **Maintainability**: Standardized code is easier to maintain and extend
- **Data Integrity**: Proper field validation prevents invalid data for specific property types
- **Developer Experience**: Consistent patterns make the codebase more predictable

## What

Validate and update specialized property forms to match the master template's structure while ensuring appropriate field visibility for each property type.

### Success Criteria

- [ ] All forms use identical save state management patterns
- [ ] All forms have consistent UI components and styling
- [ ] Inappropriate fields are properly hidden for each property type
- [ ] No code duplication for common functionality
- [ ] All TypeScript types are properly aligned
- [ ] Forms pass all linting and type checking

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: src/components/propiedades/form/property-characteristics-form.tsx
  why: Master template that defines the standard - lines 33-39 show SaveState types, module organization

- file: src/components/propiedades/form/property-characteristics-form-solar.tsx
  why: Solar form implementation to validate and standardize

- file: src/components/propiedades/form/property-characteristics-form-garage.tsx
  why: Garage form implementation to validate and standardize

- file: src/components/propiedades/form/property-characteristics-form-local.tsx
  why: Local form implementation to validate and standardize

- file: src/components/crear/property-form.tsx
  why: Contains field skip logic that shows which fields are inappropriate for each type

- file: src/components/propiedades/form/common/modern-save-indicator.tsx
  why: Shared UI component for save state visualization

- url: https://nextjs.org/docs/app/building-your-application/rendering/client-components
  why: Understanding 'use client' directive requirements for forms
```

### Current Codebase Structure

```bash
src/components/propiedades/form/
├── property-characteristics-form.tsx          # Master template
├── property-characteristics-form-solar.tsx    # Solar properties
├── property-characteristics-form-garage.tsx   # Garage properties
├── property-characteristics-form-local.tsx    # Commercial properties
└── common/
    ├── modern-save-indicator.tsx            # Save state UI component
    └── property-title.tsx                   # Title component
```

### Desired Codebase Structure

```bash
src/components/propiedades/form/
├── property-characteristics-form.tsx          # Master template
├── property-characteristics-form-solar.tsx    # Standardized solar form
├── property-characteristics-form-garage.tsx   # Standardized garage form
├── property-characteristics-form-local.tsx    # Standardized local form
└── common/
    ├── modern-save-indicator.tsx            # Existing save UI
    ├── property-title.tsx                   # Existing title
    └── form-state-management.ts             # NEW: Shared state logic
```

### Known Gotchas & Patterns

```typescript
// CRITICAL: All forms must use 'use client' directive at the top
// PATTERN: SaveState type is: "idle" | "modified" | "saving" | "saved" | "error"
// PATTERN: ModuleState includes: saveState, hasChanges, lastSaved
// GOTCHA: hasPropertyTypeChanged must always be boolean using Boolean()
// PATTERN: Module names vary slightly between property types but follow same pattern
// CRITICAL: Card styles change based on save state (yellow for modified, green for saved)
// PATTERN: All forms use the same PropertyListing type from ~/types/property-listing
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Shared types that all forms must use (already defined in master)
type SaveState = "idle" | "modified" | "saving" | "saved" | "error";

interface ModuleState {
  saveState: SaveState;
  hasChanges: boolean;
  lastSaved?: Date;
}

// Module names may vary by property type but follow pattern
type ModuleName = 
  | "basicInfo"
  | "propertyDetails"
  | "location"
  | "features"
  | "description"
  | "contactInfo";
```

### List of Tasks

```yaml
Task 1: Extract Common Save State Logic
CREATE src/components/propiedades/form/common/form-state-management.ts:
  - EXTRACT save state management hooks from master form
  - INCLUDE getCardStyles function
  - INCLUDE handlePropertyTypeChange logic
  - EXPORT reusable hooks and utilities

Task 2: Validate Solar Form Field Hiding
MODIFY src/components/propiedades/form/property-characteristics-form-solar.tsx:
  - VERIFY no bedroom/bathroom fields are rendered
  - VERIFY no kitchen/residential amenity fields
  - ENSURE construction details section is appropriate for land
  - CHECK save state matches master pattern

Task 3: Validate Garage Form Field Hiding  
MODIFY src/components/propiedades/form/property-characteristics-form-garage.tsx:
  - VERIFY focus on parking-specific fields
  - HIDE residential features (bedrooms, kitchens)
  - ENSURE security features are prominent
  - CHECK building location fields are included

Task 4: Validate Local Form Field Adaptation
MODIFY src/components/propiedades/form/property-characteristics-form-local.tsx:
  - VERIFY commercial features are emphasized
  - ENSURE accessibility fields are present
  - CHECK business amenities are included
  - VALIDATE appropriate field groupings

Task 5: Standardize Save Functionality
MODIFY all specialized forms:
  - USE shared form state management utilities
  - ENSURE consistent error handling
  - VERIFY toast notifications match master
  - CHECK all API calls follow same pattern

Task 6: UI Consistency Verification
VERIFY all forms:
  - USE identical Card component styling
  - IMPLEMENT same ModernSaveIndicator placement
  - FOLLOW master's responsive grid layout
  - MAINTAIN consistent spacing and padding
```

### Per Task Implementation Details

```typescript
// Task 1: Form State Management Utility
// src/components/propiedades/form/common/form-state-management.ts

export const useModuleStates = (hasPropertyTypeChanged: boolean) => {
  // PATTERN: Initialize all modules with proper state
  const [moduleStates, setModuleStates] = useState<Record<string, ModuleState>>(() => {
    const initialState = {
      // Define all modules with idle state
      // Set basicInfo to modified if property type changed
    };
    return initialState;
  });

  // CRITICAL: Effect to handle property type changes
  useEffect(() => {
    if (hasPropertyTypeChanged) {
      // Update basicInfo module state
    }
  }, [hasPropertyTypeChanged]);

  return { moduleStates, setModuleStates };
};

export const getCardStyles = (state: SaveState): string => {
  // PATTERN: Return consistent styles for each state
  switch (state) {
    case "modified":
      return "ring-2 ring-yellow-500/20 shadow-lg shadow-yellow-500/10 border-yellow-500/20";
    case "saving":
      return "ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10 border-blue-500/20";
    // ... other states
  }
};

// Task 2-4: Field Validation Pattern
// For each specialized form, ensure proper field rendering:

// SOLAR: Should NOT render
const inappropriateForSolar = [
  "bedrooms", "bathrooms", "kitchenType", "heatingType",
  "airConditioning", "elevator", "parkingSpaces"
];

// GARAGE: Should focus on
const garageSpecificFields = [
  "parkingSpaces", "securityFeatures", "buildingLocation",
  "accessType", "dimensions"
];

// LOCAL: Should emphasize
const commercialFields = [
  "businessType", "accessibility", "loadingDock",
  "signageRights", "previousBusiness"
];
```

### Integration Points

```yaml
IMPORTS:
  - add to specialized forms: import { useModuleStates, getCardStyles } from './common/form-state-management'
  - ensure all use: import type { PropertyListing } from '~/types/property-listing'

API CALLS:
  - pattern: updateProperty and updateListingWithAuth
  - ensure consistent error handling with toast.error()
  - verify optimistic updates pattern

ROUTING:
  - maintain router.refresh() after successful saves
  - handle property type changes via searchParams
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm lint:fix                        # Auto-fix linting issues
pnpm typecheck                       # TypeScript validation
pnpm format:write                    # Prettier formatting

# Expected: No errors. If errors, READ and fix the root cause.
```

### Level 2: Component Structure Validation

```bash
# Verify each form imports and structure
echo "Checking Solar form structure..."
grep -n "type SaveState\|interface ModuleState\|ModernSaveIndicator" src/components/propiedades/form/property-characteristics-form-solar.tsx

echo "Checking Garage form structure..."
grep -n "type SaveState\|interface ModuleState\|ModernSaveIndicator" src/components/propiedades/form/property-characteristics-form-garage.tsx

echo "Checking Local form structure..."
grep -n "type SaveState\|interface ModuleState\|ModernSaveIndicator" src/components/propiedades/form/property-characteristics-form-local.tsx

# All should have consistent patterns
```

### Level 3: Build Verification

```bash
# Ensure no build errors
pnpm build

# Expected: Build completes successfully
# If errors: Check for missing imports or type mismatches
```

### Level 4: Manual Testing Checklist

```bash
# Start development server
pnpm dev

# Test each form type
echo "✓ Navigate to property with type=piso (master form)"
echo "✓ Navigate to property with type=solar"
echo "✓ Navigate to property with type=garaje"
echo "✓ Navigate to property with type=local"

# For each form, verify:
echo "✓ Save indicator appears when fields are modified"
echo "✓ Card gets yellow ring when modified"
echo "✓ Save button works and shows success toast"
echo "✓ Inappropriate fields are not visible"
echo "✓ Form is responsive on mobile (375x667)"
echo "✓ Property type changes are detected"
```

### Level 5: Field Visibility Validation

```typescript
// Quick validation script to ensure proper field hiding
// Run in browser console on each form:

// For Solar form:
console.assert(!document.querySelector('[name="bedrooms"]'), 'Solar should not have bedrooms');
console.assert(!document.querySelector('[name="bathrooms"]'), 'Solar should not have bathrooms');

// For Garage form:
console.assert(document.querySelector('[name="parkingSpaces"]'), 'Garage must have parking spaces');
console.assert(!document.querySelector('[name="kitchenType"]'), 'Garage should not have kitchen');

// For Local form:
console.assert(!document.querySelector('[name="bedrooms"]'), 'Local should not have bedrooms');
console.assert(document.querySelector('[name="surfaceArea"]'), 'Local must have surface area');
```

## Final Validation Checklist

- [ ] All forms follow master template structure
- [ ] Save state management is consistent
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No linting errors: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] Manual test all forms work correctly
- [ ] Inappropriate fields are hidden per property type
- [ ] Save indicators work identically across forms
- [ ] Toast notifications appear consistently
- [ ] Forms are responsive on mobile and desktop

---

## Anti-Patterns to Avoid

- ❌ Don't create new save state patterns - use existing ones
- ❌ Don't skip field validation for property types
- ❌ Don't duplicate save state logic - use shared utilities
- ❌ Don't ignore TypeScript errors - fix them properly
- ❌ Don't hardcode property types - use the listing data
- ❌ Don't forget the 'use client' directive on forms

## Confidence Score: 9/10

The PRP provides comprehensive context with actual code references, clear validation steps, and specific implementation guidance. The only minor uncertainty is around potential edge cases in field hiding logic that might only be discovered during implementation.