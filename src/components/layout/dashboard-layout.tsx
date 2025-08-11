"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { useSession, signOut } from "~/lib/auth-client";
import { useUserRole } from "~/hooks/use-user-role";
import {
  Building2,
  Users,
  Calendar,
  Settings,
  BarChart3,
  Menu,
  X,
  LogOut,
  User,
  Shield,
  Briefcase,
  ChevronDown,
  Search,
  TrendingUp,
  HandHeart,
} from "lucide-react";
import type { FC, ReactNode } from "react";

// CSS for line drawing animation
const lineDrawingStyles = `
  @keyframes drawLine {
    from {
      height: 0%;
    }
    to {
      height: 100%;
    }
  }
`;

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

const baseNavigation: NavigationItem[] = [
  { name: "Resumen", href: "/dashboard", icon: BarChart3 },
  { name: "Propiedades", href: "/propiedades", icon: Building2 },
  { name: "Contactos", href: "/contactos", icon: Users },
  { name: "Calendario", href: "/calendario", icon: Calendar },
  { name: "Ajustes", href: "/ajustes", icon: Settings },
];

const operacionesItems: NavigationItem[] = [
  { name: "Prospects", href: "/operaciones/prospects", icon: Search },
  {
    name: "Leads",
    href: "/operaciones/leads",
    icon: TrendingUp,
    disabled: true,
  },
  {
    name: "Deals",
    href: "/operaciones/deals",
    icon: HandHeart,
    disabled: true,
  },
];

const adminNavigation: NavigationItem[] = [
  { name: "Administración", href: "/admin", icon: Shield },
];

const accountAdminNavigation: NavigationItem[] = [
  { name: "Administración", href: "/account-admin", icon: Shield },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [operacionesExpanded, setOperacionesExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { hasRoleId } = useUserRole();

  // Build navigation based on user role
  const navigation = [...baseNavigation];
  if (hasRoleId(2)) {
    navigation.push(...adminNavigation);
  }
  // Add account admin navigation for role ID 3
  if (hasRoleId(3)) {
    navigation.push(...accountAdminNavigation);
  }

  // Auto-expand operaciones when on operaciones pages
  useEffect(() => {
    if (pathname.startsWith("/operaciones")) {
      setOperacionesExpanded(true);
    }
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          sidebarOpen ? "block" : "hidden",
        )}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">Vesta CRM</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              if (item.disabled) {
                return (
                  <div
                    key={item.name}
                    className="group flex cursor-not-allowed items-center rounded-md px-2 py-2 text-sm font-medium text-gray-400 opacity-50"
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{item.name}</span>
                    <span className="text-[10px] text-gray-400">
                      (próximamente)
                    </span>
                  </div>
                );
              }
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-md px-2 py-2 text-sm font-medium",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive
                        ? "text-gray-500"
                        : "text-gray-400 group-hover:text-gray-500",
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}

            {/* Operaciones Section - Mobile */}
            <div className="space-y-1">
              <div className="flex items-center">
                <Link
                  href="/operaciones"
                  className={cn(
                    "group flex flex-1 items-center rounded-md px-2 py-2 text-sm font-medium",
                    pathname === "/operaciones"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Briefcase
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      pathname === "/operaciones"
                        ? "text-gray-500"
                        : "text-gray-400 group-hover:text-gray-500",
                    )}
                  />
                  Operaciones
                </Link>
                <button
                  onClick={() => setOperacionesExpanded(!operacionesExpanded)}
                  className="rounded p-1 hover:bg-gray-100"
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-gray-400 transition-transform",
                      operacionesExpanded && "rotate-180",
                    )}
                  />
                </button>
              </div>

              {operacionesExpanded && (
                <>
                  <style>{lineDrawingStyles}</style>
                  <div className="relative ml-8 space-y-0.5">
                    {/* Vertical line with draw animation */}
                    <div 
                      className="absolute bottom-0 left-0 top-0 -ml-4 w-px bg-gray-300"
                      style={{
                        height: '0%',
                        animation: 'drawLine 0.8s ease-out 0.6s forwards'
                      }}
                    />
                    {operacionesItems.map((subItem, index) => {
                      const isActive = pathname === subItem.href;
                      const animationDelay = `${index * 200}ms`;
                      
                      if (subItem.disabled) {
                        return (
                          <div
                            key={subItem.name}
                            className="group flex cursor-not-allowed items-center rounded-md px-2 py-1.5 text-xs font-normal text-gray-400 opacity-50 animate-in slide-in-from-left-2 fade-in duration-300"
                            style={{ animationDelay }}
                          >
                            <subItem.icon className="mr-2.5 h-3.5 w-3.5 flex-shrink-0" />
                            <span className="flex-1">{subItem.name}</span>
                            <span className="text-[9px] text-gray-400">
                              (próximamente)
                            </span>
                          </div>
                        );
                      }
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={cn(
                            "group flex items-center rounded-md px-2 py-1.5 text-xs font-normal animate-in slide-in-from-left-2 fade-in duration-300",
                            isActive
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                          )}
                          style={{ animationDelay }}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <subItem.icon
                            className={cn(
                              "mr-2.5 h-3.5 w-3.5 flex-shrink-0",
                              isActive
                                ? "text-gray-500"
                                : "text-gray-400 group-hover:text-gray-500",
                            )}
                          />
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </nav>
          {/* Mobile User profile section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {session?.user?.name ?? "Usuario"}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {session?.user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="ml-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">Vesta CRM</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              if (item.disabled) {
                return (
                  <div
                    key={item.name}
                    className="group flex cursor-not-allowed items-center rounded-md px-2 py-2 text-sm font-medium text-gray-400 opacity-50"
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{item.name}</span>
                    <span className="text-[10px] text-gray-400">
                      (próximamente)
                    </span>
                  </div>
                );
              }
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-md px-2 py-2 text-sm font-medium",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive
                        ? "text-gray-500"
                        : "text-gray-400 group-hover:text-gray-500",
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}

            {/* Operaciones Section - Desktop */}
            <div className="space-y-1">
              <div className="flex items-center">
                <Link
                  href="/operaciones"
                  className={cn(
                    "group flex flex-1 items-center rounded-md px-2 py-2 text-sm font-medium",
                    pathname === "/operaciones"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <Briefcase
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      pathname === "/operaciones"
                        ? "text-gray-500"
                        : "text-gray-400 group-hover:text-gray-500",
                    )}
                  />
                  Operaciones
                </Link>
                <button
                  onClick={() => setOperacionesExpanded(!operacionesExpanded)}
                  className="rounded p-1 hover:bg-gray-100"
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-gray-400 transition-transform",
                      operacionesExpanded && "rotate-180",
                    )}
                  />
                </button>
              </div>

              {operacionesExpanded && (
                <div className="relative ml-8 space-y-0.5">
                  {/* Vertical line with draw animation */}
                  <div 
                    className="absolute bottom-0 left-0 top-0 -ml-4 w-px bg-gray-300"
                    style={{
                      height: '0%',
                      animation: 'drawLine 0.8s ease-out 0.6s forwards'
                    }}
                  />
                  {operacionesItems.map((subItem, index) => {
                    const isActive = pathname === subItem.href;
                    const animationDelay = `${index * 200}ms`;
                    
                    if (subItem.disabled) {
                      return (
                        <div
                          key={subItem.name}
                          className="group flex cursor-not-allowed items-center rounded-md px-2 py-1.5 text-xs font-normal text-gray-400 opacity-50 animate-in slide-in-from-left-2 fade-in duration-300"
                          style={{ animationDelay }}
                        >
                          <subItem.icon className="mr-2.5 h-3.5 w-3.5 flex-shrink-0" />
                          <span className="flex-1">{subItem.name}</span>
                          <span className="text-[9px] text-gray-400">
                            (próximamente)
                          </span>
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={cn(
                          "group flex items-center rounded-md px-2 py-1.5 text-xs font-normal animate-in slide-in-from-left-2 fade-in duration-300",
                          isActive
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        )}
                        style={{ animationDelay }}
                      >
                        <subItem.icon
                          className={cn(
                            "mr-2.5 h-3.5 w-3.5 flex-shrink-0",
                            isActive
                              ? "text-gray-500"
                              : "text-gray-400 group-hover:text-gray-500",
                          )}
                        />
                        {subItem.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
          {/* Desktop User profile section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {session?.user?.name ?? "Usuario"}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {session?.user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="ml-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 flex h-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="px-4 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
