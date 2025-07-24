### = Project Awareness & Context
- **Always read `README.md`** at conversation start to understand the project's architecture, features, and current development status.
- **Check existing TODOs** in `README.md` before starting any new task. If the task relates to listed TODOs, prioritize accordingly.
- **Review relevant component files** in the feature area you're working on to understand existing patterns and conventions.
- **Use the TodoWrite tool** to track all non-trivial tasks and maintain visibility of progress throughout the conversation.

### >� Code Structure & Modularity
- **Never create a file longer than 400 lines**. If a file approaches this limit, refactor by splitting into smaller, focused modules.
- **Follow Next.js App Router conventions**:
  - Place pages in `src/app/[feature]/page.tsx`
  - Create loading states in `loading.tsx` files
  - Use route groups for organization when needed
- **Component organization**:
  - Shared components in `src/components/ui/` (using shadcn patterns)
  - Feature-specific components in `src/components/[feature]/`
  - Form components separate from display components
  - Always export components with named exports
- **Server-side code** in `src/server/`:
  - Database queries in `src/server/queries/`
  - External API integrations in `src/server/[service]/`
  - Database schema in `src/server/db/schema.ts`
- **Use path aliases**: Always use `~/` for imports from `src/` directory

### >� Testing & Reliability
- **Create unit tests for critical business logic** (when test framework is set up).
- **Validate all forms using zod schemas** with proper error handling.
- **Always handle loading and error states** in async components.
- **Use proper TypeScript types** - avoid `any` unless absolutely necessary.
- **Run linting and type checking** before completing any task:
  ```bash
  pnpm lint
  pnpm typecheck
  ```

###  Task Completion
- **Use TodoWrite tool** immediately when starting multi-step tasks.
- **Mark todos as `in_progress`** before starting work on them.
- **Mark todos as `completed`** immediately after finishing.
- **Only have ONE todo `in_progress`** at a time.
- **Add discovered tasks** to the todo list as you find them.

### =� Style & Conventions
- **Use TypeScript** with strict mode enabled (as configured in tsconfig.json).
- **Follow existing patterns**:
  - React Server Components by default
  - Client components only when needed (mark with `"use client"`)
  - Async/await for data fetching in server components
  - React Hook Form for complex forms
- **Styling with Tailwind CSS**:
  - Use Tailwind utility classes
  - Follow the design system defined in `tailwind.config.ts`
  - Use shadcn/ui components from `src/components/ui/`
- **Database operations**:
  - Use Drizzle ORM with SingleStore
  - Type-safe queries using the schema
  - Handle BigInt conversions properly
- **File naming conventions**:
  - Components: PascalCase (e.g., `PropertyCard.tsx`)
  - Utilities: camelCase (e.g., `searchUtils.ts`)
  - Types: PascalCase with `.ts` extension
  - Server actions: camelCase with descriptive names

### =� Documentation & Code Quality
- **Add JSDoc comments** for complex functions:
  ```typescript
  /**
   * Processes property images and ensures valid URLs
   * @param images - Raw images from database
   * @returns Processed images with fallback URLs
   */
  ```
- **Use descriptive variable names** that clearly indicate purpose.
- **Keep components focused** - single responsibility principle.
- **Extract reusable logic** into custom hooks (in `src/components/hooks/`).

### >� Next.js & React Patterns
- **Use Next.js Image component** for all images with proper dimensions.
- **Implement proper error boundaries** for error handling.
- **Use dynamic imports** for large components to improve performance.
- **Server Components first** - only use Client Components when necessary for:
  - Interactive UI (onClick, onChange, etc.)
  - Browser-only APIs
  - State management with useState/useReducer
- **Data fetching patterns**:
  - Fetch data in Server Components
  - Use parallel data fetching when possible
  - Implement proper caching strategies

### = Security & Environment
- **Use env validation** through `src/env.js` for all environment variables.
- **Never expose sensitive data** in client components.
- **Validate and sanitize** all user inputs.
- **Use HTTPS** for all external API calls.
- **Follow AWS S3 best practices** for file uploads.

### =� Performance Considerations
- **Optimize images**: Use Next.js Image with proper formats (WebP).
- **Implement pagination** for large data sets.
- **Use React.memo** and useMemo for expensive computations.
- **Code split** at the route level automatically with App Router.
- **Minimize client-side JavaScript** by leveraging Server Components.

### =' Development Workflow
- **Use pnpm** as the package manager (not npm or yarn).
- **Follow the scripts** defined in package.json:
  - `pnpm dev` for development
  - `pnpm build` before deployment
  - `pnpm lint` and `pnpm typecheck` before commits
- **Database changes**:
  - Update schema in `src/server/db/schema.ts`
  - Run `pnpm db:generate` and `pnpm db:push`
- **Keep dependencies updated** but test thoroughly after updates.

### <� Real Estate Domain Specifics
- **Property management**: Follow existing patterns for property CRUD operations.
- **Multi-portal integration**: Maintain compatibility with Fotocasa, Idealista, etc.
- **Image handling**: Always include watermarking logic for property images.
- **Contact management**: Maintain proper prospect � lead � client flow.
- **Use proper Spanish terminology** in user-facing text when applicable.