name: "Settings Menu PRP - Complete Implementation with Organization Logo Upload"
description: |

## Purpose
Comprehensive PRP for implementing a complete Settings Menu at the same level as contactos/propiedades with multiple tabs and organization logo upload functionality using existing codebase patterns.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md (if exists)

---

## Goal
Create a complete Settings Menu system with multiple tabs including organization configuration, user settings, portal management, and a dedicated tab for uploading organization logos to AWS S3 in the inmobiliariaacropolis folder.

## Why
- **Business value**: Centralized configuration management for the CRM system
- **User experience**: Intuitive settings organization with tabbed interface
- **Brand management**: Organization logo upload for customization
- **Scalability**: Foundation for future settings categories
- **Integration**: Seamless integration with existing dashboard navigation

## What
User-visible behavior:
- New "Ajustes" navigation item in the dashboard (already exists in layout)
- Tabbed settings interface with multiple sections
- Organization logo upload with AWS S3 integration
- Form validation and error handling
- Mobile-responsive design

Technical requirements:
- Next.js 15 App Router page structure
- TypeScript with proper type safety
- shadcn/ui components for UI consistency
- React Hook Form with Zod validation
- AWS S3 integration using existing patterns
- Database schema updates for organization settings

### Success Criteria
- [ ] Settings page accessible at `/ajustes` route
- [ ] Tabbed interface with at least 4 sections
- [ ] Organization logo upload functionality working
- [ ] Form validation with proper error messages
- [ ] Mobile-responsive design (375px+)
- [ ] Integration with existing dashboard layout
- [ ] Database persistence for settings
- [ ] AWS S3 upload to correct folder structure

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://ui.shadcn.com/docs/components/tabs
  why: Core tabs component for settings interface
  
- url: https://ui.shadcn.com/docs/components/form
  why: Form patterns with React Hook Form integration
  
- file: /Users/javierperezgarcia/Downloads/vesta/src/app/contactos/page.tsx
  why: Page structure pattern to follow for main settings page
  
- file: /Users/javierperezgarcia/Downloads/vesta/src/app/propiedades/page.tsx
  why: Alternative page pattern with filters and state management
  
- file: /Users/javierperezgarcia/Downloads/vesta/src/components/layout/dashboard-layout.tsx
  why: Navigation structure - settings already included as "Ajustes"
  
- file: /Users/javierperezgarcia/Downloads/vesta/src/app/actions/upload.ts
  why: Existing upload patterns for AWS S3 integration
  
- file: /Users/javierperezgarcia/Downloads/vesta/src/lib/s3.ts
  why: S3 utilities and upload functions to reuse
  
- file: /Users/javierperezgarcia/Downloads/vesta/src/server/db/schema.ts
  why: Database patterns and organization table structure
  
- file: /Users/javierperezgarcia/Downloads/vesta/src/env.js
  why: Environment variable patterns for AWS configuration
```

### Current Codebase tree (relevant sections)
```bash
src/
├── app/
│   ├── ajustes/                     # TO BE CREATED
│   │   └── page.tsx                 # Main settings page
│   ├── actions/
│   │   └── upload.ts                # Existing S3 upload patterns
│   ├── contactos/page.tsx           # Page structure pattern
│   └── propiedades/page.tsx         # Alternative page pattern
├── components/
│   ├── layout/
│   │   └── dashboard-layout.tsx     # Navigation with "Ajustes" link
│   ├── ajustes/                     # TO BE CREATED
│   │   ├── settings-tabs.tsx        # Main tabs component
│   │   ├── organization-settings.tsx # Organization tab
│   │   ├── user-settings.tsx        # User preferences tab
│   │   ├── portal-settings.tsx      # Portal configuration tab
│   │   └── logo-upload.tsx          # Logo upload component
│   └── ui/                          # Existing shadcn components
├── server/
│   ├── queries/
│   │   └── organization.ts          # TO BE CREATED/ENHANCED
│   └── db/
│       └── schema.ts                # Existing schema with organizations
└── lib/
    └── s3.ts                        # Existing S3 utilities
```

### Desired Codebase tree with files to be added
```bash
src/
├── app/
│   ├── ajustes/
│   │   ├── page.tsx                 # Main settings page with tabs
│   │   └── layout.tsx               # Settings layout (optional)
│   └── actions/
│       └── settings.ts              # Settings-specific server actions
├── components/
│   └── ajustes/
│       ├── settings-tabs.tsx        # Main tabbed interface
│       ├── organization-settings.tsx # Organization config form
│       ├── user-settings.tsx        # User preferences form  
│       ├── portal-settings.tsx      # Portal management form
│       ├── payment-settings.tsx     # Payment configuration form
│       └── logo-upload-form.tsx     # Logo upload component
├── server/
│   └── queries/
│       └── settings.ts              # Settings database operations
└── types/
    └── settings.ts                  # Settings type definitions
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Next.js 15 App Router requires server components by default
// Use "use client" directive only when needed for interactivity

// CRITICAL: Drizzle ORM with SingleStore has specific syntax requirements
// Always use proper bigint handling: bigint("id", { mode: "bigint" })

// CRITICAL: Server actions must be marked with "use server"
// Place at top of function or file

// CRITICAL: Client components need "use client" directive
// Required for useState, useEffect, form interactions

// CRITICAL: shadcn/ui components require proper imports from ~/components/ui
// Use existing import patterns from the codebase

// CRITICAL: File uploads must be uncontrolled components in React Hook Form
// Use onChange handler instead of direct field binding

// CRITICAL: AWS S3 uploads follow specific folder structure
// Use existing pattern: referenceNumber/documents/ or referenceNumber/images/

// CRITICAL: Always validate with Zod schemas before database operations
// Follow existing validation patterns in the codebase

// CRITICAL: Database operations need proper error handling
// Use try/catch with proper user feedback

// CRITICAL: Revalidate paths after mutations
// Use revalidatePath() after database changes
```

## Implementation Blueprint

### Data models and structure
Create the core data models to ensure type safety and consistency.

```typescript
// Types for settings (src/types/settings.ts)
interface OrganizationSettings {
  orgId: bigint;
  name: string;
  logo?: string; // S3 URL
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

interface UserSettings {
  userId: bigint;
  language: "es" | "en";
  theme: "light" | "dark" | "system";
  notifications: boolean;
  emailNotifications: boolean;
}

interface PortalSettings {
  orgId: bigint;
  fotocasaEnabled: boolean;
  idealiistaEnabled: boolean;
  pisocomEnabled: boolean;
  autoPublish: boolean;
}

// Zod schemas for validation
const organizationSettingsSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  logo: z.string().url().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
});
```

### List of tasks to be completed in order

```yaml
Task 1: Create Settings Page Structure
CREATE src/app/ajustes/page.tsx:
  - MIRROR pattern from: src/app/contactos/page.tsx
  - IMPLEMENT tabbed interface using shadcn/ui Tabs
  - ADD proper page layout and navigation
  - ENSURE mobile responsiveness

Task 2: Create Settings Types and Schemas
CREATE src/types/settings.ts:
  - DEFINE TypeScript interfaces for all settings
  - CREATE Zod validation schemas
  - EXPORT type definitions for forms

Task 3: Enhance Database Schema
MODIFY src/server/db/schema.ts:
  - REVIEW existing organizations table
  - ADD missing fields if needed (logo, settings JSON)
  - ENSURE proper foreign key relationships

Task 4: Create Settings Server Actions
CREATE src/app/actions/settings.ts:
  - MIRROR pattern from: src/app/actions/upload.ts
  - IMPLEMENT logo upload to S3
  - ADD organization settings update
  - FOLLOW existing error handling patterns

Task 5: Create Database Queries
CREATE src/server/queries/settings.ts:
  - IMPLEMENT getOrganizationSettings
  - IMPLEMENT updateOrganizationSettings
  - FOLLOW existing query patterns
  - ADD proper error handling

Task 6: Create Organization Settings Tab
CREATE src/components/ajustes/organization-settings.tsx:
  - USE React Hook Form with Zod validation
  - IMPLEMENT logo upload component
  - FOLLOW existing form patterns
  - ADD loading states and error handling

Task 7: Create Additional Settings Tabs
CREATE src/components/ajustes/user-settings.tsx:
CREATE src/components/ajustes/portal-settings.tsx:
CREATE src/components/ajustes/payment-settings.tsx:
  - IMPLEMENT basic form structures
  - USE consistent patterns across tabs
  - ADD mock functionality for now

Task 8: Create Main Tabs Container
CREATE src/components/ajustes/settings-tabs.tsx:
  - USE shadcn/ui Tabs component
  - ORGANIZE all settings sections
  - IMPLEMENT tab navigation
  - ENSURE accessibility

Task 9: Integration and Testing
INTEGRATE all components:
  - TEST logo upload functionality
  - VERIFY form validation
  - CHECK mobile responsiveness
  - ENSURE proper error handling
```

### Per task pseudocode

```typescript
// Task 1: Settings Page (src/app/ajustes/page.tsx)
"use client";

export default function SettingsPage() {
  // PATTERN: Client component for interactivity
  // MIRROR: Similar structure to contactos/page.tsx
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ajustes</h1>
      </div>
      
      <SettingsTabs />
    </div>
  );
}

// Task 4: Settings Server Actions (src/app/actions/settings.ts)
export async function uploadOrganizationLogo(formData: FormData) {
  "use server";
  
  // PATTERN: Server action validation
  const file = formData.get("logo") as File;
  const orgId = formData.get("orgId") as string;
  
  // PATTERN: Always validate with Zod first
  const validated = logoUploadSchema.parse({ file, orgId });
  
  try {
    // PATTERN: Use existing S3 upload utilities
    const { imageUrl, s3key, imageKey } = await uploadImageToS3(
      file,
      `inmobiliariaacropolis`, // Specific folder as requested
      1, // Order
    );
    
    // PATTERN: Update database
    await updateOrganizationLogo(BigInt(orgId), imageUrl);
    
    // CRITICAL: Revalidate paths after mutations
    revalidatePath("/ajustes");
    
    return { success: true, logoUrl: imageUrl };
  } catch (error) {
    // PATTERN: Consistent error handling
    return { success: false, error: "Error al subir el logo" };
  }
}

// Task 6: Organization Settings Form
export function OrganizationSettings() {
  // PATTERN: Use React Hook Form with Zod resolver
  const form = useForm<OrganizationInput>({
    resolver: zodResolver(organizationSettingsSchema),
  });
  
  // PATTERN: Server action with loading states
  const [isPending, startTransition] = useTransition();
  
  const onSubmit = (data: OrganizationInput) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("logo", data.logo);
      formData.append("orgId", "1");
      
      const result = await uploadOrganizationLogo(formData);
      if (result.success) {
        toast.success("Logo actualizado");
      }
    });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Logo upload field - CRITICAL: uncontrolled component */}
        <FormField
          control={form.control}
          name="logo"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Logo de la organización</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    onChange(file);
                  }}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

### Integration Points
```yaml
DATABASE:
  - schema: "Enhance organizations table in src/server/db/schema.ts"
  - migration: "Run pnpm db:generate && pnpm db:push"
  - types: "Export types from schema file"
  
ENVIRONMENT:
  - existing: "AWS configuration already in src/env.js"
  - pattern: "Use existing AWS_S3_BUCKET, AWS_REGION variables"
  
ROUTES:
  - create: "src/app/ajustes/page.tsx"
  - layout: "Use existing dashboard layout"
  - navigation: "Already included in dashboard-layout.tsx"
  
SERVER ACTIONS:
  - create: "src/app/actions/settings.ts"
  - pattern: "Mark with 'use server' directive"
  - validation: "Use Zod schemas before database operations"
  
S3 INTEGRATION:
  - reuse: "src/lib/s3.ts uploadImageToS3 function"
  - folder: "inmobiliariaacropolis/ as specified"
  - pattern: "Follow existing property image upload pattern"
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
// Manual testing scenarios for settings page:

// Test Case 1: Settings Page Navigation
// - Navigate to /ajustes from dashboard
// - Verify all tabs are visible and clickable
// - Check mobile responsiveness on 375px width
// - Ensure tab content switches properly

// Test Case 2: Logo Upload Happy Path
// - Go to Organization tab
// - Select valid image file (PNG/JPG)
// - Submit form and verify success message
// - Check AWS S3 for uploaded file in inmobiliariaacropolis folder
// - Verify database update with new logo URL

// Test Case 3: Form Validation
// - Try uploading non-image file
// - Verify proper error message
// - Test required field validation
// - Check form reset after successful upload

// Test Case 4: Error Handling
// - Test with invalid file sizes
// - Test with network errors
// - Verify user-friendly error messages
// - Check loading states during upload
```

```bash
# Manual validation steps:
pnpm dev                   # Start dev server
# Open http://localhost:3000/ajustes
# Test all scenarios above
# Check browser console for errors
# Verify AWS S3 uploads in console
# Check database changes in Drizzle Studio:
pnpm db:studio
```

### Level 3: End-to-End Testing
```bash
# Build and run production build locally
pnpm build
pnpm start

# Test file upload directly via form submission
# Verify S3 folder structure matches requirements
# Check database persistence across server restarts

# Expected: All features work in production build
# If error: Check Next.js console output and browser DevTools
```

## Final validation Checklist
- [ ] Build succeeds: `pnpm build`
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm typecheck`
- [ ] Code formatted: `pnpm format:check`
- [ ] Settings page accessible at /ajustes
- [ ] All tabs render and switch properly
- [ ] Logo upload works and saves to correct S3 folder
- [ ] Form validation shows appropriate errors
- [ ] Loading states display during uploads
- [ ] Error cases handled with user-friendly messages
- [ ] Database operations verified in Drizzle Studio
- [ ] Mobile responsive design (375px+)
- [ ] Spanish language content displays correctly
- [ ] Server actions revalidate /ajustes path

---

## Anti-Patterns to Avoid
- ❌ Don't create new upload patterns when existing ones work
- ❌ Don't skip file type validation in forms
- ❌ Don't ignore TypeScript errors - fix them properly
- ❌ Don't use "use client" unless truly needed for interactivity
- ❌ Don't create API routes - use server actions instead
- ❌ Don't forget to revalidate paths after mutations
- ❌ Don't hardcode S3 folder paths - use configuration
- ❌ Don't catch errors without proper user feedback
- ❌ Don't forget mobile responsiveness for tabs
- ❌ Don't use any type - define proper TypeScript types
- ❌ Don't create uncontrolled file inputs incorrectly
- ❌ Don't forget to handle loading states in forms

## PRP Quality Score: 9/10

**Confidence Level**: High - This PRP provides comprehensive context including:
✅ Complete codebase analysis and patterns  
✅ Existing S3 upload integration points  
✅ Detailed task breakdown with dependencies  
✅ Specific validation scenarios  
✅ Real code examples from the codebase  
✅ Executable validation commands  
✅ Mobile responsiveness requirements  
✅ Error handling patterns  
✅ Type safety throughout  

**Missing elements** (-1 point):
- Could benefit from automated testing setup (project has no test framework)

This PRP should enable one-pass implementation success through comprehensive context and clear validation loops.