# English Portals Configuration Feature

## Goal

Create an English-language portal settings configuration page at `/src/app/(dashboard)/account-admin/portals/page.tsx` that mirrors the existing Spanish implementation (`portales`) but with English labels, descriptions, and routing. This maintains the dual-language pattern established in the admin section (users/usuarios, accounts/cuentas, settings/configuracion) while providing identical portal management functionality for English-speaking users.

## Why

- **Internationalization**: Supports the established dual-language pattern in the admin section
- **User Experience**: Provides native English interface for portal configuration management
- **Business Value**: Enables English-speaking real estate agencies to manage portal integrations effectively
- **Consistency**: Maintains feature parity between Spanish and English admin interfaces
- **Accessibility**: Broadens platform usability for international real estate agencies

## What

An English-language portal configuration page featuring:
- Tab-based interface for Fotocasa, Idealista, and General settings (English labels)
- Watermark configuration with English descriptions
- Real-time form state management identical to Spanish version
- English navigation integration and breadcrumb support
- Server-side validation using existing portal configuration schema

### Success Criteria

- [ ] New English "Portals" page accessible at `/account-admin/portals`
- [ ] Three tabs (Fotocasa, Idealista, General) with English labels and descriptions
- [ ] Watermark toggle with English labels persisted to portal_settings
- [ ] Form state management with English save/saved indicators
- [ ] Navigation breadcrumb shows "Portals" for English route
- [ ] All functionality identical to Spanish portales version
- [ ] Responsive design works on mobile and desktop
- [ ] Loading states with English text during data operations
- [ ] Error handling with English error messages

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: /src/app/(dashboard)/account-admin/portales/page.tsx
  why: Exact Spanish implementation to mirror with English labels

- file: /src/components/admin/account/portal-configuration.tsx
  why: Existing component that needs English variant or i18n support

- file: /src/components/admin/account/breadcrumb.tsx
  why: Breadcrumb system that needs "/account-admin/portals" route added

- file: /src/components/admin/account/navigation-cards.tsx
  why: Navigation pattern and existing dual-language admin routes

- file: /src/app/(dashboard)/admin/settings/page.tsx
  why: English admin page example showing naming conventions

- file: /src/app/(dashboard)/admin/configuracion/page.tsx  
  why: Spanish admin page showing dual-language pattern

- file: /src/types/portal-settings.ts
  why: Type definitions and validation schemas (language-agnostic)

- file: /src/app/actions/settings.ts
  why: Server actions for portal configuration (getPortalConfigurationAction, updatePortalConfigurationAction)

- url: https://nextjs.org/docs/app/guides/internationalization
  why: Next.js i18n patterns for dual-language routing

- url: https://ui.shadcn.com/docs/components/tabs
  why: Shadcn UI tabs component used in portal configuration
```

### Current Codebase Structure

```bash
src/
├── app/
│   ├── (dashboard)/
│   │   ├── account-admin/
│   │   │   ├── portales/                   # EXISTING - Spanish version
│   │   │   │   └── page.tsx                # Working Spanish implementation
│   │   │   └── portals/                    # TARGET - English version  
│   │   │       └── page.tsx                # EMPTY FILE to implement
│   │   └── admin/                          # Pattern examples
│   │       ├── configuracion/              # Spanish admin page
│   │       ├── settings/                   # English admin page
│   │       ├── usuarios/                   # Spanish users page
│   │       └── users/                      # English users page
├── components/
│   └── admin/
│       └── account/
│           ├── portal-configuration.tsx    # Existing component with Spanish labels
│           ├── breadcrumb.tsx             # Needs portals route added
│           └── navigation-cards.tsx       # Uses portales route currently
└── types/
    └── portal-settings.ts                 # Language-agnostic schemas
```

### Desired Codebase Structure

```bash
src/
├── app/
│   └── (dashboard)/
│       └── account-admin/
│           └── portals/                    # IMPLEMENT
│               └── page.tsx                # NEW - English portal configuration page
├── components/
│   └── admin/
│       └── account/
│           ├── portal-configuration-en.tsx # NEW - English variant component
│           └── breadcrumb.tsx             # MODIFY - Add portals route
└── (optional if needed)
    ├── lib/
    │   └── i18n/                          # NEW - Localization utilities
    │       └── portal-labels.ts           # NEW - English/Spanish label mapping
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Next.js App Router pattern for dual-language routes
// Example: Both /admin/settings and /admin/configuracion exist independently

// CRITICAL: Maintain exact same functionality with English labels only
// Example: Same form schema, same server actions, same validation

// CRITICAL: Breadcrumb system needs route mapping
// Example: Add "/account-admin/portals": "Portals" to routeNames

// CRITICAL: Navigation cards should link to appropriate language route
// Example: May need language detection or user preference

// CRITICAL: React Hook Form validation messages in English
// Example: Use English error messages in form validation

// CRITICAL: Toast notifications should be in English
// Example: "Portal configuration saved successfully" vs "Configuración guardada"

// CRITICAL: Component reuse vs duplication decision
// Example: Create English variant vs internationalize existing component
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Same portal settings schema - language agnostic
import { 
  portalConfigurationSchema,
  type PortalConfigurationInput,
  type PortalConfigurationResponse 
} from "~/types/portal-settings";

// English label mappings (if creating i18n approach)
export const portalLabelsEn = {
  pageTitle: "Portal Configuration",
  pageDescription: "Manage automatic publishing to major real estate portals",
  fotocasaTab: "Fotocasa",
  idealistaTab: "Idealista", 
  generalTab: "General",
  fotocasaDescription: "Configure integration with Fotocasa portal",
  enableFotocasa: "Enable Fotocasa",
  fotocasaHelp: "Allow automatic publishing to Fotocasa",
  idealistaDescription: "Configure integration with Idealista portal",
  enableIdealista: "Enable Idealista",
  idealistaHelp: "Allow automatic publishing to Idealista",
  generalDescription: "General settings for all portals",
  watermarkLabel: "Watermark",
  watermarkDescription: "Add your logo as a watermark to images uploaded to portals",
  unsavedChanges: "You have unsaved changes",
  saving: "Saving...",
  saveChanges: "Save changes",
  saved: "Saved",
  successMessage: "Portal configuration saved successfully",
};
```

### List of Tasks to Complete

```yaml
Task 1 - Add English Route to Breadcrumb:
MODIFY src/components/admin/account/breadcrumb.tsx:
  - FIND routeNames object
  - ADD "/account-admin/portals": "Portals" entry
  - PRESERVE existing Spanish "/account-admin/portales": "Portales"
  - KEEP alphabetical order in routeNames

Task 2 - Create English Portal Configuration Component:
CREATE src/components/admin/account/portal-configuration-en.tsx:
  - COPY structure from: src/components/admin/account/portal-configuration.tsx
  - MODIFY all Spanish text to English equivalents
  - KEEP same functionality, validation, and server actions
  - PRESERVE form schema and state management patterns

Task 3 - Implement English Portals Page:
MODIFY src/app/(dashboard)/account-admin/portals/page.tsx:
  - MIRROR pattern from: src/app/(dashboard)/account-admin/portales/page.tsx
  - IMPORT PortalConfigurationEn component
  - USE English title: "Portal Configuration"
  - USE English description: "Manage automatic publishing to major real estate portals"
  - KEEP same breadcrumb and layout structure

Task 4 - Optional Navigation Enhancement:
EVALUATE src/components/admin/account/navigation-cards.tsx:
  - ASSESS if dual-language navigation cards needed
  - CONSIDER user language preference detection
  - IMPLEMENT language-specific routing if required
  - PRESERVE existing portales navigation

Task 5 - Server Action Validation:
VERIFY src/app/actions/settings.ts:
  - CONFIRM getPortalConfigurationAction works with both routes
  - ENSURE updatePortalConfigurationAction revalidates both paths
  - ADD revalidatePath("/account-admin/portals") if needed
  - PRESERVE existing revalidatePath("/account-admin/portales")
```

### Per-Task Pseudocode

```typescript
// Task 2 - English Portal Configuration Component
"use client";

export function PortalConfigurationEn() {
  // PATTERN: Same hook structure as Spanish version
  const { data: session } = useSession();
  const [accountId, setAccountId] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // PATTERN: Same form configuration with English validation messages
  const form = useForm<PortalConfigurationInput>({
    resolver: zodResolver(portalConfigurationSchema),
    defaultValues: {
      fotocasa: { enabled: false },
      idealista: { enabled: false }, 
      general: { watermarkEnabled: false },
    },
  });

  // PATTERN: English tab configuration
  const tabs: PortalTab[] = [
    {
      id: "fotocasa",
      label: "Fotocasa",
      description: "Configuration for Fotocasa portal",
      icon: Globe,
    },
    {
      id: "idealista", 
      label: "Idealista",
      description: "Configuration for Idealista portal", 
      icon: Globe,
    },
    {
      id: "general",
      label: "General", 
      description: "General portal settings",
      icon: Settings,
    },
  ];

  // PATTERN: Same data loading logic
  useEffect(() => {
    const loadData = async () => {
      if (!session?.user?.id) return;
      const userAccountId = await getCurrentUserAccountId(session.user.id);
      const result = await getPortalConfigurationAction(userAccountId);
      // Same logic, different success message
    };
    void loadData();
  }, [session, form]);

  // PATTERN: Same form submission with English messages
  const onSubmit = (data: PortalConfigurationInput) => {
    startTransition(async () => {
      const result = await updatePortalConfigurationAction(accountId, data);
      if (result.success) {
        toast.success("Portal configuration saved successfully"); // English message
      }
    });
  };

  return (
    <Tabs defaultValue="fotocasa">
      {/* English labels for all form fields */}
      <FormLabel>Enable Fotocasa</FormLabel>
      <FormDescription>Allow automatic publishing to Fotocasa</FormDescription>
      
      <FormLabel>Watermark</FormLabel>
      <FormDescription>Add your logo as a watermark to images uploaded to portals</FormDescription>
      
      <Button disabled={isPending || !hasUnsavedChanges}>
        {isPending ? "Saving..." : hasUnsavedChanges ? "Save changes" : "Saved"}
      </Button>
    </Tabs>
  );
}
```

### Integration Points

```yaml
ROUTING:
  - add: /account-admin/portals
  - pattern: "follows dual-language admin route pattern"
  - existing: "/account-admin/portales" (Spanish) remains unchanged

BREADCRUMBS:
  - modify: src/components/admin/account/breadcrumb.tsx
  - add: "/account-admin/portals": "Portals" mapping

SERVER ACTIONS:
  - reuse: getPortalConfigurationAction, updatePortalConfigurationAction
  - pattern: "same backend functionality, different frontend language"

NAVIGATION:
  - evaluate: dual-language navigation requirements
  - consider: user language preference system
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm typecheck                              # TypeScript checking
pnpm lint                                   # ESLint validation  
pnpm format:write                           # Prettier formatting

# Expected: No errors. If errors exist, read and fix them.
```

### Level 2: Functionality Testing

```bash
# Start development server
pnpm dev

# Manual test checklist - English portal page
echo "✓ Navigate to /account-admin/portals loads without errors"
echo "✓ Breadcrumb shows 'Portals' for English route" 
echo "✓ All tab labels display in English (Fotocasa, Idealista, General)"
echo "✓ Form field labels are in English (Enable Fotocasa, Watermark, etc.)"
echo "✓ Help text and descriptions are in English"
echo "✓ Button states show English text (Saving..., Save changes, Saved)"
echo "✓ Success toast message appears in English"
echo "✓ Error messages display in English"

# Cross-language functionality test
echo "✓ Both /account-admin/portals and /account-admin/portales work independently"
echo "✓ Settings saved from English page appear in Spanish page (same data)"
echo "✓ Settings saved from Spanish page appear in English page (same data)"
```

### Level 3: Integration Testing

```bash
# Navigation flow testing
echo "✓ Breadcrumb navigation works correctly"
echo "✓ Form state management identical to Spanish version"  
echo "✓ Server actions save data correctly for English route"
echo "✓ Page revalidation works for both language routes"

# Responsive design testing
echo "✓ English portal page responsive on desktop (1920x1080)"
echo "✓ English portal page responsive on mobile (375x667)"
echo "✓ Tab navigation works on both desktop and mobile"
echo "✓ Form inputs properly sized and accessible"
```

### Level 4: Feature Parity Validation

```bash
# Ensure complete parity with Spanish version
echo "✓ All functionality from portales page works in portals page"
echo "✓ Watermark toggle saves correctly"
echo "✓ Portal enable/disable toggles work"
echo "✓ Loading states appear during data operations"
echo "✓ Error handling displays appropriate messages"
echo "✓ Unsaved changes detection works"
echo "✓ Form validation works with English messages"
```

## Final Validation Checklist

- [ ] TypeScript compiles without errors: `pnpm typecheck`
- [ ] No linting errors: `pnpm lint`
- [ ] Code formatted correctly: `pnpm format:write`
- [ ] Manual test successful: Navigate to `/account-admin/portals`
- [ ] English labels throughout interface
- [ ] Feature parity with Spanish portales page maintained
- [ ] Breadcrumb shows "Portals" for English route
- [ ] Form validation and submission works with English messages
- [ ] Both language versions can coexist without conflicts
- [ ] Mobile responsive design maintained

---

## Anti-Patterns to Avoid

- ❌ Don't modify existing Spanish portales functionality
- ❌ Don't create shared component that breaks existing Spanish implementation  
- ❌ Don't forget to add portals route to breadcrumb system
- ❌ Don't use Spanish text in English component
- ❌ Don't duplicate server actions - reuse existing ones
- ❌ Don't hardcode English strings - consider i18n structure for future expansion
- ❌ Don't break responsive design patterns established in Spanish version

## Confidence Score: 8/10

This PRP provides strong context for implementing the English portals page by:

1. **Clear Pattern Recognition**: Identifies the dual-language admin pattern already established
2. **Existing Implementation**: References working Spanish version as exact template
3. **Specific Context**: All necessary files and patterns referenced
4. **Comprehensive Validation**: Multi-level testing strategy ensures feature parity
5. **Real-world Patterns**: Based on actual international Next.js routing patterns

The main complexity is deciding between component duplication vs internationalization, but the existing dual-language admin pattern suggests duplication is the established approach. Success probability is high given the clear template to follow and established patterns in the codebase.