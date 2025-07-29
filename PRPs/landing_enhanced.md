# PRP: Landing Page Enhancement with CRM Navigation and Authentication

## Overview
Transform the current real estate-focused landing page navigation into a modern CRM/SaaS navigation with authentication controls, ensuring protected access to dashboard functionality.

## Key Requirements
1. Replace real estate navigation (Comprar/Vender) with CRM/SaaS appropriate menu items
2. Add Sign In/Sign Up buttons to the top right of the navbar
3. Ensure authentication middleware protects dashboard access
4. Maintain existing responsive design patterns

## Current Implementation Analysis

### 1. Navbar Component (`/src/components/navbar.tsx`)
- Currently contains real estate-specific navigation: "Comprar", "Alquilar", "Vender"
- Uses dropdown menus for property types (Pisos, Casas, Locales, etc.)
- Has responsive mobile menu with hamburger icon
- Social links integration in place
- Links to `/dashboard` in logo

### 2. Landing Page (`/src/app/page.tsx`)
- Uses the Navbar component
- Contains Hero, Features, Integrations, Future Features, CTA, and Footer sections

### 3. Authentication Pages
- **Sign In**: `/src/app/auth/signin/page.tsx` - Fully functional with email/password and Google OAuth
- **Sign Up**: `/src/app/auth/signup/page.tsx` - Includes company name field for account creation

### 4. Middleware (`/src/middleware.ts`)
- Currently protects all routes except public paths
- Public paths include: `/`, `/auth/signin`, `/auth/signup`, `/auth/forgot-password`
- Redirects unauthenticated users to sign in with callback URL

## Research Findings

### CRM/SaaS Navigation Best Practices
1. **Keep navigation simple and uncluttered** - avoid overwhelming users
2. **Top-right placement for auth buttons is standard** - users expect this pattern
3. **Use clear CTAs** with action-oriented language
4. **Mobile optimization** is crucial - maintain thumb-friendly navigation
5. **Sticky navigation** improves accessibility while scrolling

### Common CRM Navigation Patterns
Based on analysis of HubSpot, Salesforce, Pipedrive, and Monday.com:

**Typical navigation items include:**
- Product/Platform (with dropdown for features)
- Solutions (by use case or industry)
- Pricing
- Resources (docs, blog, academy)
- Company/About
- Contact/Support

**Auth buttons convention:**
- "Sign In" as text link or ghost button
- "Sign Up" or "Get Started" as primary CTA button
- Top-right placement in navbar

## Implementation Blueprint

### Navigation Structure
```
Logo | Product ▼ | Solutions ▼ | Pricing | Resources ▼ | Company ▼ | [spacer] | Sign In | [Sign Up]
```

### Detailed Menu Items

**Product** (dropdown):
- Features
- Integrations
- Security
- API & Developers

**Solutions** (dropdown):
- Sales Teams
- Marketing Teams
- Customer Service
- Small Business
- Enterprise

**Resources** (dropdown):
- Documentation
- Blog
- Academy
- Community
- Support

**Company** (dropdown):
- About Us
- Careers
- Partners
- Contact

## Implementation Tasks

### Task 1: Update Navbar Component
**File**: `/src/components/navbar.tsx`

1. Replace real estate navigation items with CRM/SaaS menu structure
2. Add Sign In and Sign Up buttons to the right section
3. Update mobile menu to reflect new navigation
4. Remove real estate specific icons (Home, Building2, Store, LandPlot, Car)
5. Update dropdown menu items

### Task 2: Update Navigation Links
1. Update href attributes to use hash links (#) for non-functional items
2. Keep `/dashboard` link on logo
3. Ensure Sign In links to `/auth/signin`
4. Ensure Sign Up links to `/auth/signup`

### Task 3: Style Authentication Buttons
1. Sign In: ghost/outline button or text link
2. Sign Up: primary button with accent color
3. Ensure proper spacing and alignment
4. Maintain responsive behavior

### Task 4: Update Mobile Navigation
1. Add auth buttons to mobile menu
2. Reorganize sections for CRM context
3. Maintain touch-friendly targets
4. Update section headers

### Task 5: Test Authentication Flow
1. Verify unauthenticated users can access landing page
2. Confirm dashboard redirects to sign in
3. Test sign in/sign up button functionality
4. Verify callback URL preservation

## Validation Gates

```bash
# Type checking
pnpm typecheck

# Linting with auto-fix
pnpm lint:fix

# Format code
pnpm format:write

# Build verification
pnpm build

# Manual testing checklist
echo "✓ Landing page loads without authentication"
echo "✓ Sign In button navigates to /auth/signin"
echo "✓ Sign Up button navigates to /auth/signup"
echo "✓ Dashboard access redirects to sign in when unauthenticated"
echo "✓ Navigation works on desktop (1920x1080)"
echo "✓ Navigation works on mobile (375x667)"
echo "✓ Mobile menu includes auth buttons"
echo "✓ All dropdowns function correctly"
echo "✓ No console errors present"
```

## Code Examples from Codebase

### Current Navbar Link Structure
```tsx
<Link
  href="/vender"
  className="text-sm font-medium transition-colors hover:text-primary"
  aria-label="Vender propiedad"
>
  Vender
</Link>
```

### Button Component Usage
```tsx
<Button 
  variant="ghost"
  size="icon"
  className="lg:hidden"
  onClick={handleMenuToggle}
>
```

### Existing Auth Integration
```tsx
// From signin page
const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
```

## Important Considerations

1. **No New Files**: Modify existing navbar.tsx only
2. **Maintain Accessibility**: Keep aria-labels updated
3. **Preserve Responsive Design**: Don't break mobile functionality
4. **Keep Social Links**: They're already integrated, just maintain them
5. **Use Existing Components**: Button component from ui/button is already imported

## Common Pitfalls to Avoid

1. Don't create new component files
2. Don't modify middleware.ts (it's already configured correctly)
3. Don't change auth page routes
4. Maintain existing styling patterns
5. Don't remove memoization optimizations

## Success Criteria

- [ ] Real estate navigation completely removed
- [ ] CRM/SaaS appropriate navigation in place
- [ ] Sign In/Sign Up buttons visible in navbar
- [ ] Authentication flow working correctly
- [ ] Mobile navigation updated
- [ ] All validation gates pass
- [ ] No regression in existing functionality

## Confidence Score: 9/10

High confidence due to:
- Clear existing patterns to follow
- Well-structured current implementation
- Comprehensive research on best practices
- Simple modifications to single file
- Existing auth infrastructure already in place

The only minor uncertainty is around specific CRM menu items that might need client refinement.