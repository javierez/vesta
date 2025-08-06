name: "Cartelería Section Modifications - Simplify tabs and add Playground-style personalization"
description: |

## Purpose

Refactor the existing cartelería (poster/signage) section to simplify the workflow and add a Playground-style personalization interface with persistent preferences stored in the accounts table.

## Core Principles

1. **Simplification**: Remove unnecessary tabs (Tipos, Plantillas) 
2. **Modernization**: Rename formats to match social media conventions
3. **Playground Pattern**: Mirror the successful Playground UX for personalization
4. **Persistent Preferences**: Store poster preferences in accounts JSON column

---

## Goal

Transform the current 5-step cartelería workflow into a streamlined 3-step process with enhanced personalization options that persist per account. The personalization tab should provide a real-time preview experience similar to the Playground feature.

## Why

- **User Experience**: Current 5-step process is overly complex for simple poster generation
- **Consistency**: Playground has proven to be an intuitive interface pattern
- **Business Value**: Persistent preferences save time for repeat users
- **Modernization**: "Post" and "Story" naming aligns with social media conventions users understand

## What

Modify the existing cartelería section to:
1. Keep only "Estilo", "Formatos", and "Personalización" tabs
2. Rename digital formats to "Post" and "Story" 
3. Transform "Personalización" into a Playground-style interface
4. Add comprehensive display toggles for poster elements
5. Store preferences in accounts table as JSON

### Success Criteria

- [ ] Only 3 tabs remain: Estilo, Formatos, Personalización
- [ ] Digital formats display as "Post" and "Story"
- [ ] Personalización tab has two-column layout with controls and live preview
- [ ] All display toggles work and update preview in real-time
- [ ] Preferences persist to database and reload on next visit
- [ ] No breaking changes to existing poster generation

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: /Users/javierperezgarcia/Downloads/vesta/src/components/admin/carteleria.tsx
  why: Main component that needs modification - contains tab structure

- file: /Users/javierperezgarcia/Downloads/vesta/src/app/(dashboard)/playground/page.tsx
  why: Reference implementation for two-column layout and state management pattern

- file: /Users/javierperezgarcia/Downloads/vesta/src/components/admin/carteleria/format-selector.tsx
  why: Contains format definitions that need renaming

- file: /Users/javierperezgarcia/Downloads/vesta/src/server/queries/accounts.ts
  why: Contains account query functions for preferences storage

- file: /Users/javierperezgarcia/Downloads/vesta/src/server/db/schema.ts
  why: Account table schema with preferences JSON column

- file: /Users/javierperezgarcia/Downloads/vesta/src/lib/carteleria/templates.ts
  why: Template configuration and constants

- url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/
  why: S3 bucket "vesta-configuration-files" contains template images

- file: /Users/javierperezgarcia/Downloads/vesta/src/components/admin/carteleria/templates/template-renderer.tsx
  why: Template rendering logic that needs to support new preferences
```

### Current Codebase Structure

```bash
src/components/admin/carteleria/
├── carteleria.tsx                    # Main component with 5-step workflow
├── format-selector.tsx               # Format selection (needs renaming)
├── property-type-selector.tsx        # TO BE REMOVED
├── template-gallery.tsx              # TO BE REMOVED
├── style-selector.tsx                # Keep as-is
├── template-customizer.tsx           # Transform to Playground-style
├── controls/                         # Existing control components to reuse
│   ├── display-toggles.tsx
│   ├── image-count-selector.tsx
│   └── ...
└── templates/                        # Template implementations
```

### Desired Codebase Structure

```bash
src/components/admin/carteleria/
├── carteleria.tsx                    # Modified: 3-step workflow
├── format-selector.tsx               # Modified: Post/Story names
├── style-selector.tsx                # Keep as-is
├── personalization.tsx               # NEW: Playground-style replacement
├── controls/                         # Enhanced with new toggles
│   ├── display-options.tsx           # NEW: Comprehensive display toggles
│   └── ...existing controls
└── templates/                        # Keep as-is
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Cartelería uses localStorage for state persistence
// Key: "carteleria-progress" - must handle migration from 5 steps to 3

// CRITICAL: Templates expect ConfigurableTemplateProps interface
// Must ensure new preferences map to existing template props

// CRITICAL: Preferences column in accounts table is JSON type
// Always fetch current preferences before updating to avoid overwriting

// CRITICAL: Template images are stored in S3 bucket "vesta-configuration-files"
// Region: us-east-1, Path: /templates/

// CRITICAL: Use BigInt for accountId in database queries
// Example: eq(accounts.accountId, BigInt(accountId))

// CRITICAL: All text must be in Spanish for consistency
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Poster preferences structure for accounts table
interface PosterPreferences {
  // Display options
  show_icons: boolean;              // Mostrar iconos para habitaciones, baños y metros
  show_qr_code: boolean;            // Incluir código QR
  show_watermark: boolean;          // Mostrar logo como marca de agua
  show_phone: boolean;              // Mostrar teléfono
  show_website: boolean;            // Mostrar sitio web
  show_reference: boolean;          // Mostrar referencia del piso
  show_description: boolean;        // Incluir descripción breve
  
  // Style preferences (from Estilo tab)
  template_style?: string;          // Selected template style
  
  // Format preferences
  orientation?: "vertical" | "horizontal";
  format?: string;                  // A4, A3, etc.
}

// Updated format types
interface CarteleriaFormat {
  id: string;
  name: string;  // Change "Digital Vertical" to "Story", "Digital Horizontal" to "Post"
  category: "impreso" | "digital";
  width: number;
  height: number;
  orientation: "vertical" | "horizontal";
}
```

### List of Tasks

```yaml
Task 1: Update format definitions
MODIFY src/lib/carteleria/templates.ts:
  - FIND: Digital format definitions
  - UPDATE: Names to "Post" and "Story"
  - KEEP: Only horizontal/vertical for "impreso" category

Task 2: Simplify main cartelería component to 3 steps
MODIFY src/components/admin/carteleria.tsx:
  - REMOVE: Steps 3 (Tipos) and 4 (Plantillas)
  - UPDATE: Total steps from 5 to 3
  - UPDATE: Step names and navigation
  - UPDATE: localStorage migration for existing users

Task 3: Create Playground-style personalization component
CREATE src/components/admin/carteleria/personalization.tsx:
  - MIRROR: Layout from src/app/(dashboard)/playground/page.tsx
  - USE: Two-column grid with controls left, preview right
  - IMPORT: Existing control components
  - ADD: New display option toggles

Task 4: Create display options control component
CREATE src/components/admin/carteleria/controls/display-options.tsx:
  - CREATE: Toggle switches for all display options
  - PATTERN: Follow existing display-toggles.tsx
  - LABELS: Use Spanish text as specified

Task 5: Add poster preferences to accounts
CREATE src/server/queries/poster-preferences.ts:
  - FUNCTION: updatePosterPreferences(accountId, preferences)
  - FUNCTION: getPosterPreferences(accountId)
  - PATTERN: Follow existing preferences update pattern

Task 6: Create server actions for preferences
CREATE src/app/actions/poster-preferences.ts:
  - ACTION: savePosterPreferences
  - ACTION: loadPosterPreferences
  - PATTERN: Follow existing brand-upload.ts pattern

Task 7: Integrate preferences with template renderer
MODIFY src/components/admin/carteleria/templates/template-renderer.tsx:
  - ACCEPT: Poster preferences as props
  - MAP: Preferences to template configuration
  - APPLY: Display toggles to template rendering

Task 8: Update format selector for new names
MODIFY src/components/admin/carteleria/format-selector.tsx:
  - UPDATE: Display logic to show "Post" and "Story"
  - KEEP: Internal IDs unchanged for compatibility
```

### Implementation Pseudocode

```typescript
// Task 3: Playground-style personalization component
export function PersonalizationTab({ 
  currentSelection,
  onUpdate,
  accountId 
}: PersonalizationProps) {
  // Load saved preferences on mount
  const [preferences, setPreferences] = useState<PosterPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadPosterPreferences(accountId).then(result => {
      if (result.success && result.data) {
        setPreferences(result.data);
      }
      setLoading(false);
    });
  }, [accountId]);

  // Auto-save preferences on change (debounced)
  const debouncedSave = useMemo(
    () => debounce((prefs: PosterPreferences) => {
      savePosterPreferences(accountId, prefs);
    }, 1000),
    [accountId]
  );

  const handlePreferenceChange = (updates: Partial<PosterPreferences>) => {
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    onUpdate({ displayOptions: newPrefs });
    debouncedSave(newPrefs);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Controls Panel - Scrollable */}
      <div className="h-[800px] overflow-y-auto rounded-lg border p-6 space-y-6">
        <DisplayOptions 
          preferences={preferences}
          onChange={handlePreferenceChange}
        />
        {/* Other existing controls */}
      </div>
      
      {/* Preview Panel - Fixed */}
      <div className="sticky top-6">
        <TemplateRenderer
          styleId={currentSelection.styleId}
          displayOptions={preferences}
          // ... other props
        />
      </div>
    </div>
  );
}

// Task 5: Poster preferences database functions
export async function updatePosterPreferences(
  accountId: number | bigint,
  posterPreferences: PosterPreferences
) {
  // PATTERN: Always fetch current preferences first
  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.accountId, BigInt(accountId)));

  if (!account) throw new Error("Account not found");

  const currentPreferences = (account.preferences as Record<string, any>) ?? {};
  
  // CRITICAL: Merge with existing preferences
  const updatedPreferences = {
    ...currentPreferences,
    poster_preferences: posterPreferences,
  };

  await db
    .update(accounts)
    .set({
      preferences: updatedPreferences,
      updatedAt: new Date(),
    })
    .where(eq(accounts.accountId, BigInt(accountId)));
}
```

### Integration Points

```yaml
DATABASE:
  - No migration needed - using existing preferences JSON column
  - Pattern: preferences.poster_preferences = { ... }

LOCALSTORAGE:
  - Key: "carteleria-progress"
  - Migration: If steps > 3, reset to step 1
  - Add: "carteleria-preferences" for temporary storage

COMPONENTS:
  - Replace: template-customizer.tsx with personalization.tsx
  - Remove: property-type-selector.tsx, template-gallery.tsx
  - Update: All step navigation logic

ROUTES:
  - No changes - using existing /account-admin/carteleria route
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm typecheck                    # Type checking
pnpm lint:fix                     # ESLint with auto-fix
pnpm format:write                 # Prettier formatting

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Component Tests

```typescript
// Test the format name changes
describe('FormatSelector', () => {
  it('should display "Post" for digital horizontal format', () => {
    render(<FormatSelector />);
    expect(screen.getByText('Post')).toBeInTheDocument();
  });

  it('should display "Story" for digital vertical format', () => {
    render(<FormatSelector />);
    expect(screen.getByText('Story')).toBeInTheDocument();
  });
});

// Test preferences persistence
describe('PosterPreferences', () => {
  it('should save preferences to database', async () => {
    const prefs = { show_qr_code: true, show_watermark: false };
    const result = await savePosterPreferences(123, prefs);
    expect(result.success).toBe(true);
  });

  it('should load saved preferences', async () => {
    const result = await loadPosterPreferences(123);
    expect(result.data.show_qr_code).toBe(true);
  });
});
```

### Level 3: Integration Test

```bash
# Start the development server
pnpm dev

# Navigate to cartelería section
# 1. Go to http://localhost:3000/account-admin/carteleria
# 2. Verify only 3 tabs appear
# 3. Check Formatos tab shows "Post" and "Story"
# 4. Test Personalización tab:
#    - Toggle each display option
#    - Verify preview updates in real-time
#    - Refresh page and verify preferences persist

# Test API endpoint for preferences
curl -X POST http://localhost:3000/api/poster-preferences \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": 1,
    "preferences": {
      "show_qr_code": true,
      "show_watermark": false
    }
  }'

# Expected: {"success": true}
```

### Level 4: Manual Testing Checklist

```bash
✓ Formatos tab shows only "Horizontal" and "Vertical" for Impresos
✓ Formatos tab shows "Post" and "Story" for Digital
✓ Tipos tab is completely removed
✓ Plantillas tab is completely removed
✓ Personalización tab has two-column layout
✓ All 7 display toggles are present and labeled in Spanish
✓ Preview updates immediately when toggling options
✓ Preferences save automatically (check network tab)
✓ Preferences reload correctly on page refresh
✓ Template still generates correctly with new preferences
✓ No console errors during interaction
```

## Final Validation Checklist

- [ ] All TypeScript compiles: `pnpm typecheck`
- [ ] No linting errors: `pnpm lint`
- [ ] Code is formatted: `pnpm format:check`
- [ ] Build succeeds: `pnpm build`
- [ ] Manual testing checklist complete
- [ ] Preferences persist across sessions
- [ ] No regression in poster generation
- [ ] All text is in Spanish

---

## Anti-Patterns to Avoid

- ❌ Don't create new database tables - use existing preferences column
- ❌ Don't change internal format IDs - only display names
- ❌ Don't remove the multi-step navigation - just reduce to 3 steps
- ❌ Don't forget to handle localStorage migration
- ❌ Don't overwrite other preferences when updating poster_preferences
- ❌ Don't use English text - everything must be in Spanish

## Implementation Confidence Score: 9/10

High confidence due to:
- Clear existing patterns to follow (Playground)
- No complex integrations or external dependencies
- Using existing infrastructure (preferences, components)
- Well-defined scope with specific requirements

Minor uncertainty around:
- Exact S3 template image integration (but not critical for core functionality)