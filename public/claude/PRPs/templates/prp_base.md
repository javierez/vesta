name: "Base PRP Template v2 - Context-Rich with Validation Loops (JavaScript/TypeScript)"
description: |

## Purpose

Template optimized for AI agents to implement features with sufficient context and self-validation capabilities to achieve working code through iterative refinement.

## Core Principles

1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance

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

- file: [path/to/example.ts]
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
// Example: Next.js requires 'use client' directive for client-side components
// Example: This ORM doesn't support batch inserts over 1000 records
// Example: We use React 18 with concurrent features
// Example: Tailwind CSS requires className prop, not class
```

## Implementation Blueprint

### Data models and structure

Create the core data models, we ensure type safety and consistency.

```typescript
Examples:
 - TypeScript interfaces
 - Zod schemas
 - Database models (Prisma/Drizzle)
 - API response types
 - Component prop types

```

### List of tasks to be completed to fulfill the PRP in the order they should be completed

```yaml
Task 1:
MODIFY src/existing-module.ts:
  - FIND pattern: "export class OldImplementation"
  - INJECT after line containing "constructor("
  - PRESERVE existing method signatures

CREATE src/new-feature.ts:
  - MIRROR pattern from: src/similar-feature.ts
  - MODIFY class name and core logic
  - KEEP error handling pattern identical

...(...)

Task N:
...

```

### Per task pseudocode as needed added to each task

```typescript

// Task 1
// Pseudocode with CRITICAL details don't write entire code
async function newFeature(param: string): Promise<Result> {
    // PATTERN: Always validate input first (see src/lib/validators.ts)
    const validated = validateInput(param); // throws ValidationError

    // GOTCHA: This library requires connection pooling
    const client = await getConnection(); // see src/lib/db/pool.ts
    
    try {
        // PATTERN: Use existing retry decorator
        const result = await withRetry(
            async () => {
                // CRITICAL: API returns 429 if >10 req/sec
                await rateLimiter.acquire();
                return await externalApi.call(validated);
            },
            { attempts: 3, backoff: 'exponential' }
        );

        // PATTERN: Standardized response format
        return formatResponse(result); // see src/lib/utils/responses.ts
    } finally {
        await client.close();
    }
}
```

### Integration Points

```yaml
DATABASE:
  - migration: "Add column 'feature_enabled' to users table"
  - index: "CREATE INDEX idx_feature_lookup ON users(feature_id)"

CONFIG:
  - add to: src/lib/config.ts
  - pattern: "export const FEATURE_TIMEOUT = parseInt(process.env.FEATURE_TIMEOUT || '30')"

ROUTES:
  - add to: src/app/api/routes.ts
  - pattern: "app.use('/feature', featureRouter)"
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
npx eslint src/new-feature.ts --fix  # Auto-fix what's possible
npx tsc --noEmit                     # Type checking
npm run format                       # Prettier formatting

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests each new feature/file/function use existing test patterns

```typescript
// CREATE __tests__/new-feature.test.ts with these test cases:
describe('newFeature', () => {
  it('should work with valid input', async () => {
    const result = await newFeature('valid_input');
    expect(result.status).toBe('success');
  });

  it('should throw ValidationError for invalid input', async () => {
    await expect(newFeature('')).rejects.toThrow('ValidationError');
  });

  it('should handle external API timeout gracefully', async () => {
    jest.spyOn(externalApi, 'call').mockRejectedValue(new Error('timeout'));
    
    const result = await newFeature('valid');
    expect(result.status).toBe('error');
    expect(result.message).toContain('timeout');
  });
});
```

```bash
# Run and iterate until passing:
npm test new-feature.test.ts
# If failing: Read error, understand root cause, fix code, re-run (never mock to pass)
```

### Level 3: Integration Test

```bash
# Start the development server
npm run dev

# Test the endpoint
curl -X POST http://localhost:3000/api/feature \
  -H "Content-Type: application/json" \
  -d '{"param": "test_value"}'

# Expected: {"status": "success", "data": {...}}
# If error: Check browser console and server logs for stack trace
```

### Level 4: Deployment & Creative Validation

```bash
# Creative validation methods
# Examples:
# - Load testing with realistic data
# - End-to-end user journey testing with Playwright/Cypress
# - Performance benchmarking with Lighthouse
# - Security scanning with npm audit
# - Documentation validation with TypeDoc

# Custom validation specific to the feature
# [Add creative validation methods here]
```

## Final validation Checklist

- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npx tsc --noEmit`
- [ ] Manual test successful: [specific curl/command]
- [ ] Error cases handled gracefully
- [ ] Logs are informative but not verbose
- [ ] Documentation updated if needed

---

## Anti-Patterns to Avoid

- ❌ Don't create new patterns when existing ones work
- ❌ Don't skip validation because "it should work"
- ❌ Don't ignore failing tests - fix them
- ❌ Don't use blocking operations in async context
- ❌ Don't hardcode values that should be environment variables
- ❌ Don't catch all errors - be specific with error types