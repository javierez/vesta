# Landing Page Layout Separation

## Overview

This document explains the layout architecture changes made to separate the landing page from the dashboard layout, ensuring the landing page displays without the dashboard sidebar while maintaining all existing functionality.

## Problem

Initially, all pages in the application were wrapped with the `DashboardLayout` component, which includes:
- Sidebar navigation
- Dashboard-specific styling
- Mobile navigation drawer

This caused the landing page to display with dashboard elements, which was not the intended design.

## Solution: Route Groups and Layout Hierarchy

### 1. Root Layout Simplification

**File:** `src/app/layout.tsx`

**Before:**
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DashboardLayout>{children}</DashboardLayout>  {/* Applied to ALL pages */}
      </body>
    </html>
  );
}
```

**After:**
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}  {/* Clean, no dashboard wrapper */}
      </body>
    </html>
  );
}
```

**Impact:** The root layout now only provides basic HTML structure and global styles.

### 2. Dashboard-Specific Layout

**File:** `src/app/(dashboard)/layout.tsx` (New)

```tsx
import { DashboardLayout } from "~/components/layout/dashboard-layout";

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
```

**Impact:** Creates a dedicated layout that applies dashboard styling only to pages within the `(dashboard)` route group.

### 3. Route Group Implementation

**Route Group:** `(dashboard)`

Route groups in Next.js 13+ allow you to organize routes without affecting the URL structure. The parentheses `()` indicate that the folder name won't appear in the URL.

#### File Structure Migration

**Before:**
```
src/app/
├── page.tsx (landing - had dashboard layout)
├── dashboard/
│   └── page.tsx
├── propiedades/
│   └── page.tsx
├── contactos/
│   └── page.tsx
└── [other dashboard pages...]
```

**After:**
```
src/app/
├── page.tsx (landing - clean layout)
├── (dashboard)/
│   ├── layout.tsx (dashboard layout)
│   ├── dashboard/
│   │   └── page.tsx
│   ├── propiedades/
│   │   └── page.tsx
│   ├── contactos/
│   │   └── page.tsx
│   └── [other dashboard pages...]
```

## URL Structure (Unchanged)

The route group `(dashboard)` doesn't affect URLs. All dashboard pages maintain their original paths:

| Page | URL | Layout Applied |
|------|-----|----------------|
| Landing | `/` | Root layout only |
| Dashboard | `/dashboard` | Root + Dashboard layout |
| Properties | `/propiedades` | Root + Dashboard layout |
| Contacts | `/contactos` | Root + Dashboard layout |
| Calendar | `/calendario` | Root + Dashboard layout |
| Settings | `/ajustes` | Root + Dashboard layout |

## Technical Benefits

### 1. **Clean Separation of Concerns**
- Landing page focuses on marketing/conversion
- Dashboard pages focus on application functionality

### 2. **Improved Performance**
- Landing page doesn't load dashboard-specific components
- Reduced bundle size for landing page visitors

### 3. **Better SEO**
- Landing page has cleaner HTML structure
- No dashboard navigation affecting search indexing

### 4. **Maintainability**
- Clear architectural boundaries
- Easier to modify landing page independently
- Dashboard layout changes don't affect landing page

## Layout Hierarchy

```
Root Layout (HTML structure, global styles)
├── Landing Page (/) - Direct child
└── Dashboard Route Group
    ├── Dashboard Layout (sidebar, navigation)
    ├── Dashboard Home (/dashboard)
    ├── Properties (/propiedades)
    ├── Contacts (/contactos)
    └── [other dashboard pages...]
```

## Migration Steps Performed

1. **Modified Root Layout**
   - Removed `DashboardLayout` wrapper
   - Kept only essential HTML structure

2. **Created Dashboard Route Group**
   - Added `src/app/(dashboard)/` directory
   - Created dashboard-specific layout

3. **Moved Dashboard Pages**
   - Migrated all dashboard pages to `(dashboard)` route group
   - Preserved existing file structure within each page directory

4. **Verified Functionality**
   - Confirmed all URLs work as expected
   - Tested build process
   - Validated TypeScript compilation

## Result

- ✅ Landing page (`/`) displays without dashboard sidebar
- ✅ Dashboard pages maintain full functionality
- ✅ All original URLs preserved
- ✅ Clean architectural separation
- ✅ No breaking changes to existing functionality

## Future Considerations

This architecture provides flexibility for:
- Adding more landing/marketing pages outside the dashboard
- Creating different layout variations for specific page groups
- Implementing role-based layouts (admin, user, guest)
- Adding authentication boundaries at the layout level