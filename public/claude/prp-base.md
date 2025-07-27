name: "Base PRP Template v2 - Context-Rich with Validation Loops"
description: |

## Purpose
Template optimized for AI agents to implement features with sufficient context and self-validation capabilities to achieve working code through iterative refinement.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
[What needs to be built - be specific about the end state and desires]

## Why
- [Business value and user impact]
- [Integration with existing features]
- [Problems this solves and for whom]

## What
[User-visible behavior and technical requirements]

### Success Criteria
- [ ] [Specific measurable outcomes]

## All Needed Context

### Documentation & References (list all context needed to implement the feature)
```yaml
# MUST READ - Include these in your context window
- url: [Official API docs URL]
  why: [Specific sections/methods you'll need]
  
- file: [path/to/example.tsx]
  why: [Pattern to follow, gotchas to avoid]
  
- doc: [Library documentation URL] 
  section: [Specific section about common pitfalls]
  critical: [Key insight that prevents common errors]

- docfile: [PRPs/ai_docs/file.md]
  why: [docs that the user has pasted in to the project]

```

### Current Codebase tree (run `tree` in the root of the project) to get an overview of the codebase
```bash

```

### Desired Codebase tree with files to be added and responsibility of file
```bash

```

### Known Gotchas of our codebase & Library Quirks
```typescript
// CRITICAL: [Library name] requires [specific setup]
// Example: Next.js 15 App Router requires server components by default
// Example: Drizzle ORM with SingleStore has specific syntax requirements
// Example: Server actions must be marked with "use server"
// Example: Client components need "use client" directive
// Example: shadcn/ui components require proper imports from @/components/ui
```

## Implementation Blueprint

### Data models and structure

Create the core data models, we ensure type safety and consistency.
```typescript
Examples: 
 - Drizzle ORM schema definitions
 - TypeScript interfaces and types
 - Zod schemas for validation
 - Form validation schemas
 - API response types

```

### list of tasks to be completed to fullfill the PRP in the order they should be completed

```yaml
Task 1:
MODIFY src/components/existing-module.tsx:
  - FIND pattern: "export function OldImplementation"
  - INJECT after line containing "const [state, setState]"
  - PRESERVE existing prop signatures

CREATE src/components/new-feature.tsx:
  - MIRROR pattern from: src/components/similar-feature.tsx
  - MODIFY component name and core logic
  - KEEP error handling pattern identical

...(...)

Task N:
...

```


### Per task pseudocode as needed added to each task
```typescript

// Task 1
// Pseudocode with CRITICAL details dont write entire code

// Server Action (src/app/actions/feature.ts)
export async function createFeature(data: FeatureInput) {
  "use server";
  
  // PATTERN: Always validate with Zod first (see src/lib/validations/)
  const validated = featureSchema.parse(data);
  
  // GOTCHA: Database operations need proper error handling
  try {
    // PATTERN: Use existing query patterns from src/server/queries/
    const result = await db.insert(features).values(validated);
    
    // CRITICAL: Revalidate paths after mutations
    revalidatePath("/features");
    
    return { success: true, data: result };
  } catch (error) {
    // PATTERN: Consistent error handling
    return { success: false, error: "Failed to create feature" };
  }
}

// Client Component (src/components/features/feature-form.tsx)
export function FeatureForm() {
  // PATTERN: Use React Hook Form with Zod resolver
  const form = useForm<FeatureInput>({
    resolver: zodResolver(featureSchema),
  });
  
  // PATTERN: Server action with loading states
  const [isPending, startTransition] = useTransition();
  
  const onSubmit = (data: FeatureInput) => {
    startTransition(async () => {
      const result = await createFeature(data);
      if (result.success) {
        toast.success("Feature created");
      }
    });
  };
}
```

### Integration Points
```yaml
DATABASE:
  - schema: "Add table/columns to src/server/db/schema/[module].ts"
  - migration: "Run pnpm db:generate && pnpm db:push"
  - types: "Export types from schema file"
  
ENVIRONMENT:
  - add to: .env.local
  - validate in: src/env.js
  - pattern: "FEATURE_API_KEY: z.string().min(1)"
  
ROUTES:
  - create: src/app/[module]/[feature]/page.tsx
  - layout: "Use existing layout patterns"
  - loading: "Add loading.tsx with Skeleton components"
  
SERVER ACTIONS:
  - create: src/app/actions/[feature].ts
  - pattern: "Mark with 'use server' directive"
  - validation: "Use Zod schemas before database operations"
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
// Note: Vesta currently has no test framework set up
// For now, use manual testing with these scenarios:

// Test Case 1: Happy Path
// - Navigate to /[module]/[feature]
// - Fill form with valid data
// - Submit and verify success message
// - Check database for new record

// Test Case 2: Validation Errors
// - Submit empty form
// - Verify field-level error messages
// - Submit invalid data formats
// - Verify appropriate error handling

// Test Case 3: Edge Cases
// - Test with Spanish characters (ñ, á, é, etc.)
// - Test mobile responsiveness
// - Test loading states during async operations
// - Test error recovery scenarios
```

```bash
# Manual validation steps:
pnpm dev                   # Start dev server
# Open http://localhost:3000/[feature]
# Run through test scenarios above
# Check browser console for errors
# Verify database changes in Drizzle Studio:
pnpm db:studio
```

### Level 3: End-to-End Testing
```bash
# Build and run production build locally
pnpm build
pnpm start

# Test server actions directly (if applicable)
# Using browser DevTools console:
fetch('/api/[endpoint]', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ field: 'value' })
}).then(r => r.json()).then(console.log)

# Expected: Successful response with data
# If error: Check Next.js console output and browser DevTools
```

## Final validation Checklist
- [ ] Build succeeds: `pnpm build`
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm typecheck`
- [ ] Code formatted: `pnpm format:check`
- [ ] Manual test successful on desktop (1920x1080)
- [ ] Manual test successful on mobile (375x667)
- [ ] Forms validate correctly with error messages
- [ ] Loading states display during async operations
- [ ] Error cases handled with user-friendly messages
- [ ] Database operations verified in Drizzle Studio
- [ ] Spanish language content displays correctly
- [ ] Server actions revalidate appropriate paths

---

## Anti-Patterns to Avoid
- ❌ Don't create new patterns when existing ones work
- ❌ Don't skip validation because "it should work"  
- ❌ Don't ignore TypeScript errors - fix them properly
- ❌ Don't use "use client" unless truly needed for interactivity
- ❌ Don't create API routes - use server actions instead
- ❌ Don't forget to revalidate paths after mutations
- ❌ Don't hardcode values that should be in .env.local
- ❌ Don't catch errors without proper user feedback
- ❌ Don't forget mobile responsiveness
- ❌ Don't use any type - define proper TypeScript types