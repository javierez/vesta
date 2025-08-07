# Portal Settings Configuration Feature

## Goal

Create a comprehensive portal settings configuration feature in the account-admin section. The feature should provide a tab-based interface for configuring Fotocasa, Idealista, and general portal settings, including watermark configuration. The settings will be stored in the accounts table's portal_settings JSON field and provide real-time form state management with save/saved states.

## Why

- **Business Value**: Enables real estate agencies to efficiently manage their portal integrations and branding across multiple platforms
- **User Impact**: Provides centralized control over portal publishing configurations and watermark branding
- **Integration**: Seamlessly integrates with existing account-admin structure and portal publishing workflows
- **Problems Solved**: Eliminates manual portal configuration management and provides consistent branding control

## What

A new "Portales" configuration menu in `/src/app/(dashboard)/account-admin/` with:
- Tab-based interface for Fotocasa, Idealista, and General settings
- Watermark configuration with enable/disable toggle
- Real-time form state management with unsaved changes detection
- Server-side validation and database persistence
- Responsive design following existing UI patterns

### Success Criteria

- [ ] New "Portales" page accessible from account-admin navigation
- [ ] Three tabs (Fotocasa, Idealista, General) with independent configurations
- [ ] Watermark toggle in General settings persisted to portal_settings
- [ ] Form state management with save/saved indicators
- [ ] All settings persist to accounts.portal_settings JSON field
- [ ] Responsive design works on mobile and desktop
- [ ] Loading states during data fetching and saving
- [ ] Error handling for failed saves

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://react-hook-form.com/advanced-usage
  why: Advanced form patterns for tab-based forms and state management

- url: https://ui.shadcn.com/docs/components/tabs
  why: Shadcn UI tabs component implementation details

- url: https://ui.shadcn.com/docs/components/form  
  why: Form component patterns with React Hook Form integration

- file: /src/components/ajustes/settings-tabs.tsx
  why: Existing tab-based settings pattern to follow exactly

- file: /src/components/ajustes/portal-settings.tsx  
  why: Current portal settings implementation pattern and form structure

- file: /src/app/(dashboard)/account-admin/configuration/page.tsx
  why: Account admin page structure and breadcrumb pattern

- file: /src/app/actions/settings.ts
  why: Server actions pattern for settings updates and validation

- file: /src/server/db/schema.ts (lines 15-38)
  why: Accounts table schema with portal_settings JSON field

- file: /src/types/settings.ts
  why: Type definitions and Zod schemas for settings validation

- doc: https://support.propertyfinder.ae/hc/en-us/articles/13357506147346-Watermark-Settings
  section: Watermark configuration patterns in real estate portals
  critical: Position control, retroactive application, and disable options
```

### Current Codebase Structure

```bash
src/
├── app/
│   ├── (dashboard)/
│   │   └── account-admin/
│   │       ├── branding/
│   │       ├── carteleria/ 
│   │       ├── configuration/
│   │       ├── other/
│   │       ├── reports/
│   │       └── page.tsx
│   └── actions/
│       └── settings.ts
├── components/
│   ├── ajustes/
│   │   ├── portal-settings.tsx
│   │   └── settings-tabs.tsx
│   └── admin/
│       └── account/
│           └── configuration.tsx
├── server/
│   ├── db/
│   │   └── schema.ts
│   └── queries/
│       └── settings.ts
└── types/
    └── settings.ts
```

### Desired Codebase Structure (Files to Add)

```bash
src/
├── app/
│   └── (dashboard)/
│       └── account-admin/
│           └── portales/                    # NEW
│               └── page.tsx                 # NEW - Main portal settings page
├── components/
│   └── admin/
│       └── account/
│           └── portal-configuration.tsx     # NEW - Portal configuration component
└── types/
    └── portal-settings.ts                   # NEW - Portal-specific type definitions
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Next.js requires 'use client' directive for client-side components
// Example: Portal settings form needs client-side state management

// CRITICAL: React Hook Form with tabs - use single form instance across tabs
// Example: Don't create separate useForm() hooks for each tab

// CRITICAL: Shadcn UI Form components require defaultValues for controlled inputs
// Example: Always provide defaultValues even if empty objects

// CRITICAL: BigInt serialization in server actions
// Example: Convert accountId to string for form submission, back to BigInt for DB

// CRITICAL: JSON field updates require complete object replacement in SingleStore
// Example: Merge existing portal_settings with new values, don't partially update

// CRITICAL: useTransition for form submission state
// Example: Wrap async operations in startTransition for proper loading states
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Portal-specific settings structure
interface PortalSettingsData {
  fotocasa?: {
    enabled: boolean;
    apiKey?: string;
    customSettings?: Record<string, unknown>;
  };
  idealista?: {
    enabled: boolean;
    apiKey?: string;
    customSettings?: Record<string, unknown>;
  };
  general: {
    watermarkEnabled: boolean;
    watermarkPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  };
}

// Zod validation schema
const portalConfigurationSchema = z.object({
  fotocasa: z.object({
    enabled: z.boolean(),
    apiKey: z.string().optional(),
  }).optional(),
  idealista: z.object({
    enabled: z.boolean(), 
    apiKey: z.string().optional(),
  }).optional(),
  general: z.object({
    watermarkEnabled: z.boolean(),
    watermarkPosition: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']).optional(),
  }),
});
```

### List of Tasks to Complete

```yaml
Task 1 - Create Portal Settings Page:
CREATE src/app/(dashboard)/account-admin/portales/page.tsx:
  - MIRROR pattern from: src/app/(dashboard)/account-admin/configuration/page.tsx
  - MODIFY title to "Configuración de Portales"
  - IMPORT new PortalConfiguration component
  - KEEP breadcrumb and layout identical

Task 2 - Create Portal Configuration Component:
CREATE src/components/admin/account/portal-configuration.tsx:
  - MIRROR pattern from: src/components/ajustes/settings-tabs.tsx
  - MODIFY tabs to: Fotocasa, Idealista, General  
  - IMPLEMENT form state management with React Hook Form
  - PRESERVE loading states and error handling patterns

Task 3 - Add Navigation Link:
MODIFY src/app/(dashboard)/account-admin/layout.tsx or navigation component:
  - FIND existing navigation links pattern
  - ADD "Portales" link to account-admin navigation
  - PRESERVE existing navigation styling

Task 4 - Create Server Action:
MODIFY src/app/actions/settings.ts:
  - ADD updatePortalConfigurationAction function
  - MIRROR pattern from: updatePortalSettingsAction
  - IMPLEMENT portal_settings JSON field update
  - PRESERVE error handling and validation patterns

Task 5 - Add Type Definitions:
CREATE src/types/portal-settings.ts:
  - DEFINE PortalConfiguration interfaces
  - DEFINE Zod validation schemas
  - EXPORT TypeScript types for components
  - MIRROR patterns from: src/types/settings.ts

Task 6 - Update Database Query:
MODIFY src/server/queries/settings.ts:
  - ADD getPortalConfiguration function
  - ADD updatePortalConfiguration function  
  - PRESERVE existing database connection patterns
  - HANDLE portal_settings JSON field operations
```

### Per-Task Pseudocode

```typescript
// Task 2 - Portal Configuration Component
"use client";

export function PortalConfiguration() {
  // PATTERN: Single form instance for all tabs (React Hook Form best practice)
  const form = useForm<PortalConfigurationInput>({
    resolver: zodResolver(portalConfigurationSchema),
    defaultValues: {
      fotocasa: { enabled: false },
      idealista: { enabled: false },
      general: { watermarkEnabled: false }
    }
  });

  // PATTERN: Loading states and data fetching (see settings-tabs.tsx:68-102)
  const [accountId, setAccountId] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // CRITICAL: Use useTransition for async form submission
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // PATTERN: Load account settings on mount
    const loadData = async () => {
      const userAccountId = await getCurrentUserAccountId(userId);
      const result = await getPortalConfigurationAction(userAccountId);
      // CRITICAL: Reset form with loaded data
      form.reset(result.data);
    };
  }, []);

  // PATTERN: Form submission with server action
  const onSubmit = (data: PortalConfigurationInput) => {
    startTransition(async () => {
      const result = await updatePortalConfigurationAction(accountId, data);
      if (result.success) {
        toast.success("Configuración guardada");
      }
    });
  };

  // PATTERN: Tab configuration (see settings-tabs.tsx:40-65)
  const tabs = [
    { id: "fotocasa", label: "Fotocasa", icon: Globe },
    { id: "idealista", label: "Idealista", icon: Globe },
    { id: "general", label: "General", icon: Settings }
  ];

  return (
    <Tabs defaultValue="fotocasa">
      <TabsList>
        {tabs.map(tab => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TabsContent value="general">
            <FormField
              name="general.watermarkEnabled"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca de Agua</FormLabel>
                  <FormControl>
                    <Switch 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TabsContent>
          
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      </Form>
    </Tabs>
  );
}
```

### Integration Points

```yaml
DATABASE:
  - table: accounts
  - field: portal_settings (JSON)
  - operation: "UPDATE accounts SET portal_settings = ? WHERE account_id = ?"

ROUTES:
  - add: /account-admin/portales
  - pattern: "follows existing account-admin routing structure"

NAVIGATION:
  - modify: account-admin navigation component
  - pattern: "add alongside branding, carteleria, configuration links"

SERVER ACTIONS:
  - add: updatePortalConfigurationAction
  - pattern: "follows settings.ts server action patterns"
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm lint                                    # ESLint validation
pnpm typecheck                              # TypeScript checking
pnpm format:write                           # Prettier formatting

# Expected: No errors. If errors exist, read and fix them.
```

### Level 2: Unit Tests (follow existing test patterns)

```typescript
// CREATE __tests__/portal-configuration.test.tsx
describe('PortalConfiguration', () => {
  it('should render all three tabs', () => {
    render(<PortalConfiguration accountId={BigInt(123)} />);
    expect(screen.getByText('Fotocasa')).toBeInTheDocument();
    expect(screen.getByText('Idealista')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('should enable watermark toggle in general settings', async () => {
    render(<PortalConfiguration accountId={BigInt(123)} />);
    
    const generalTab = screen.getByText('General');
    fireEvent.click(generalTab);
    
    const watermarkToggle = screen.getByLabelText('Marca de Agua');
    fireEvent.click(watermarkToggle);
    
    expect(watermarkToggle).toBeChecked();
  });

  it('should save configuration when form is submitted', async () => {
    // Mock server action
    const mockUpdate = jest.spyOn(actions, 'updatePortalConfigurationAction');
    mockUpdate.mockResolvedValue({ success: true });

    render(<PortalConfiguration accountId={BigInt(123)} />);
    
    const saveButton = screen.getByText('Guardar');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(BigInt(123), expect.any(Object));
    });
  });
});
```

```bash
# Run and iterate until passing:
pnpm test portal-configuration.test.tsx
# If failing: Read error, fix code, re-run
```

### Level 3: Integration Test

```bash
# Start development server
pnpm dev

# Navigate to portal settings page
# Expected: Page loads without errors at /account-admin/portales

# Test watermark toggle functionality
# Expected: Toggle switches update form state correctly

# Test form submission
# Expected: Success toast appears, data persists after page refresh
```

### Level 4: Manual Validation Checklist

```bash
# Desktop responsiveness (1920x1080)
echo "✓ Portal settings tabs render correctly on desktop"
echo "✓ Form inputs are properly sized and spaced"
echo "✓ Save button is accessible and functional"

# Mobile responsiveness (375x667)  
echo "✓ Tabs stack properly on mobile devices"
echo "✓ Form fields are touch-friendly"
echo "✓ Navigation works on small screens"

# Functionality testing
echo "✓ Watermark toggle persists after save"
echo "✓ Loading states appear during data fetching"
echo "✓ Error states display for failed saves"
echo "✓ Navigation between tabs maintains form state"
```

## Final Validation Checklist

- [ ] All tests pass: `pnpm test`
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm typecheck`
- [ ] Manual test successful: Navigate to `/account-admin/portales`
- [ ] Watermark toggle works correctly
- [ ] Form submission saves to database
- [ ] Error cases handled gracefully
- [ ] Loading states appear during async operations
- [ ] Mobile responsive design works correctly

---

## Anti-Patterns to Avoid

- ❌ Don't create separate form instances for each tab - use single form with tab-specific validation
- ❌ Don't skip defaultValues in form configuration - Shadcn UI requires them
- ❌ Don't forget 'use client' directive for interactive components
- ❌ Don't partially update JSON fields - merge complete objects
- ❌ Don't ignore BigInt serialization in server actions
- ❌ Don't skip loading states during async operations
- ❌ Don't hardcode account IDs - always use dynamic values from auth

## Confidence Score: 9/10

This PRP provides comprehensive context from existing codebase patterns, external best practices, and specific implementation details. The task breakdown follows proven patterns from the existing settings implementation, and the validation loop ensures quality at every level. Success probability is very high due to:

1. **Complete Context**: All necessary files, patterns, and documentation referenced
2. **Proven Patterns**: Follows existing successful implementations in the codebase  
3. **Detailed Implementation**: Step-by-step tasks with specific code patterns
4. **Comprehensive Validation**: Multi-level testing strategy from syntax to integration
5. **Real-world Patterns**: Based on actual real estate portal best practices

The only potential complexity is the tab-based form state management, but this is well-documented with existing patterns and external best practices.