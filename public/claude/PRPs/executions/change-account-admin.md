# Change Account Admin to Route-Based Navigation - Implementation PRP

## Overview
Convert the existing admin panel from a tab-based interface to a route-based navigation system with big buttons/cards that redirect to different settings options. This will provide a more modern admin interface following current UI/UX best practices.

## Requirements Summary
- Replace the current tab-based SuperAdminDashboard with a landing page containing navigation cards
- Create separate routes for each admin section:
  - `/admin/accounts` (Account Management)
  - `/admin/users` (User Management)  
  - `/admin/settings` (System Settings)
- Big clickable cards with icons, titles, and descriptions
- Maintain existing role-based access control (role ID 2)
- No disruption to existing functionality

## Critical Context from Codebase Research

### 1. Current Admin Implementation
The current super admin (role=2) implementation uses a tab-based structure:
- **Route**: `/app/(dashboard)/admin/page.tsx`
- **Component**: `SuperAdminDashboard` with Tabs for different sections
- **Sections**: Accounts, Users, Settings
- **Permission Check**: Uses `userHasRole(session.user.id, 2)` before rendering

Reference files:
- `/src/app/(dashboard)/admin/page.tsx`: Main admin page
- `/src/components/admin/super-admin-dashboard.tsx`: Current tab-based dashboard
- `/src/components/admin/accounts-management.tsx`: Full-featured accounts management
- `/src/components/admin/users-management.tsx`: Placeholder users component
- `/src/components/admin/system-settings.tsx`: Placeholder settings component

### 2. Card Navigation Patterns Found in Codebase
The codebase already has excellent card navigation patterns:

**Pattern 1 - Account Other Component:**
```typescript
// From /src/components/admin/account-other.tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {options.map((option) => {
    const Icon = option.icon;
    return (
      <Card
        key={option.title}
        className={
          option.available
            ? "cursor-pointer transition-shadow hover:shadow-md"
            : "opacity-60"
        }
      >
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-base">{option.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm">
            {option.description}
          </CardDescription>
        </CardContent>
      </Card>
    );
  })}
</div>
```

**Pattern 2 - AccionesRapidasCard:**
```typescript
// From /src/components/dashboard/AccionesRapidasCard.tsx
<div className="mb-4 mt-8 grid grid-cols-2 gap-3">
  {actions.map((action) => (
    <motion.a
      key={action.label}
      href={action.href}
      className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
    >
      <action.icon className="mb-2 h-6 w-6" />
      <span className="text-center text-[10px] font-medium uppercase tracking-wide text-gray-600">
        {action.label}
      </span>
    </motion.a>
  ))}
</div>
```

### 3. Next.js Routing Patterns in Codebase
The codebase follows App Router patterns with nested routes:
- `/propiedades/page.tsx` (main listing)
- `/propiedades/crear/page.tsx` (create route)
- `/propiedades/[id]/page.tsx` (detail route)
- `/propiedades/borradores/page.tsx` (drafts route)

### 4. Role-Based Access Control Pattern
```typescript
// From existing admin page
const hasRequiredRole = await userHasRole(session.user.id, 2);
if (!hasRequiredRole) {
  redirect("/dashboard");
}
```

## Implementation Blueprint

### Phase 1: Create New Admin Landing Page

1. **Replace SuperAdminDashboard**: `/src/components/admin/super-admin-dashboard.tsx`
```typescript
"use client";

import type { FC } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Users, Building2, Settings, BarChart3 } from "lucide-react";

interface AdminCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  available: boolean;
}

const adminSections: AdminCard[] = [
  {
    title: "Gestión de Cuentas",
    description: "Administra las cuentas de la plataforma, planes y suscripciones",
    icon: Building2,
    href: "/admin/accounts",
    available: true,
  },
  {
    title: "Gestión de Usuarios", 
    description: "Administra usuarios, roles y permisos del sistema",
    icon: Users,
    href: "/admin/users",
    available: true,
  },
  {
    title: "Configuración del Sistema",
    description: "Configuraciones globales y parámetros del sistema",
    icon: Settings,
    href: "/admin/settings", 
    available: true,
  },
  {
    title: "Analíticas",
    description: "Reportes y estadísticas de uso de la plataforma",
    icon: BarChart3,
    href: "/admin/analytics",
    available: false,
  },
];

export const SuperAdminDashboard: FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Panel de Administración
        </h2>
        <p className="text-sm text-gray-500">
          Selecciona una sección para administrar
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section) => {
          const Icon = section.icon;
          
          if (!section.available) {
            return (
              <Card key={section.title} className="opacity-60">
                <CardHeader className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <Icon className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{section.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {section.description}
                  </CardDescription>
                  <p className="mt-3 text-xs text-gray-400">
                    Próximamente
                  </p>
                </CardContent>
              </Card>
            );
          }

          return (
            <Link key={section.title} href={section.href}>
              <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/50">
                <CardHeader className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-blue-50 p-2">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{section.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {section.description}
                  </CardDescription>
                  <div className="mt-3 flex items-center text-xs text-blue-600">
                    <span>Acceder</span>
                    <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
```

### Phase 2: Create Admin Route Structure

2. **Create nested admin routes**:

Create directories:
```bash
mkdir -p /src/app/(dashboard)/admin/accounts
mkdir -p /src/app/(dashboard)/admin/users  
mkdir -p /src/app/(dashboard)/admin/settings
```

3. **Create admin layout**: `/src/app/(dashboard)/admin/layout.tsx`
```typescript
import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";
import { userHasRole } from "~/server/queries/user-roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((m) => m.headers()),
  });

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Check if user has role ID 2 (Super Admin)
  const hasRequiredRole = await userHasRole(session.user.id, 2);

  if (!hasRequiredRole) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
```

### Phase 3: Create Individual Route Pages

4. **Create accounts page**: `/src/app/(dashboard)/admin/accounts/page.tsx`
```typescript
import { AccountsManagement } from "~/components/admin/accounts-management";

export default function AdminAccountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Cuentas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administra las cuentas de la plataforma
        </p>
      </div>

      <AccountsManagement />
    </div>
  );
}
```

5. **Create users page**: `/src/app/(dashboard)/admin/users/page.tsx`
```typescript
import { UsersManagement } from "~/components/admin/users-management";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administra usuarios, roles y permisos del sistema
        </p>
      </div>

      <UsersManagement />
    </div>
  );
}
```

6. **Create settings page**: `/src/app/(dashboard)/admin/settings/page.tsx`
```typescript
import { SystemSettings } from "~/components/admin/system-settings";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configuraciones globales y parámetros del sistema
        </p>
      </div>

      <SystemSettings />
    </div>
  );
}
```

### Phase 4: Update Navigation with Breadcrumbs (Optional Enhancement)

7. **Create breadcrumb component**: `/src/components/admin/admin-breadcrumb.tsx`
```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const routeNames: Record<string, string> = {
  '/admin': 'Administración',
  '/admin/accounts': 'Gestión de Cuentas',
  '/admin/users': 'Gestión de Usuarios',
  '/admin/settings': 'Configuración del Sistema',
};

export const AdminBreadcrumb = () => {
  const pathname = usePathname();
  
  if (pathname === '/admin') return null;

  const segments = pathname.split('/').filter(Boolean);
  
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-6">
      <Link 
        href="/admin" 
        className="flex items-center hover:text-gray-900 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        
        return (
          <div key={path} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            {isLast ? (
              <span className="text-gray-900 font-medium">
                {routeNames[path] || segment}
              </span>
            ) : (
              <Link 
                href={path}
                className="hover:text-gray-900 transition-colors"
              >
                {routeNames[path] || segment}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};
```

## Implementation Tasks (In Order)

1. Update SuperAdminDashboard component to show navigation cards instead of tabs
2. Create admin layout with role-based access control
3. Create nested route directories (accounts, users, settings)
4. Create individual route pages for each admin section
5. Optional: Add breadcrumb navigation component
6. Test all routes and navigation functionality

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
echo "✓ Admin landing page shows navigation cards"
echo "✓ Navigation cards redirect to correct routes"
echo "✓ Role-based access control works on all routes"
echo "✓ Existing admin components render correctly in new routes"
echo "✓ Card hover effects work properly" 
echo "✓ Mobile responsive design works"
echo "✓ No console errors or warnings"
echo "✓ All admin functionality preserved"
```

## Error Handling Strategy

1. **Route Protection**: Admin layout handles authentication and role checking
2. **Invalid Routes**: Next.js will show 404 for non-existent admin routes
3. **Component Errors**: Existing error boundaries will catch component issues
4. **Loading States**: Consider adding loading.tsx files for better UX

## Security Considerations

1. Server-side role verification in admin layout
2. All existing admin components maintain their security patterns
3. No client-side route exposure without proper authentication
4. Consistent permission checks across all admin routes

## External Research and Best Practices

Based on 2024-2025 admin dashboard trends:
- **Card-based navigation** is the modern standard for admin interfaces
- **Route-based architecture** provides better UX and SEO than tabs
- **Mobile-first responsive design** with touch-friendly cards
- **Consistent visual hierarchy** with icons, titles, and descriptions
- **Hover states and animations** for better interactivity

## References

**Existing Codebase Patterns:**
- Navigation cards: `/src/components/admin/account-other.tsx`
- Quick actions: `/src/components/dashboard/AccionesRapidasCard.tsx`  
- Route structure: `/src/app/(dashboard)/propiedades/` directories
- Role checking: `/src/components/providers/user-role-provider.tsx`

**External Documentation:**
- Next.js App Router: https://nextjs.org/docs/app/building-your-application/routing
- Shadcn UI Cards: https://ui.shadcn.com/docs/components/card
- Admin Dashboard Best Practices: https://ui.shadcn.com/examples/dashboard

## Success Criteria

- Super admin users can access a modern card-based navigation interface
- Each admin section (Accounts, Users, Settings) has its own dedicated route
- All existing functionality is preserved and accessible
- Interface is responsive and follows modern design patterns
- Navigation is intuitive with clear visual hierarchy
- No disruption to existing role-based access control

**Confidence Score: 9/10**

This PRP provides comprehensive guidance for converting the tab-based admin interface to a modern route-based navigation system with excellent UX patterns found in the existing codebase.