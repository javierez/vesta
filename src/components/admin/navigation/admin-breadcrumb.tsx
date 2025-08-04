"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const routeNames: Record<string, string> = {
  "/admin": "Administración",
  "/admin/accounts": "Gestión de Cuentas",
  "/admin/users": "Gestión de Usuarios",
  "/admin/settings": "Configuración del Sistema",
};

export const AdminBreadcrumb = () => {
  const pathname = usePathname();

  if (pathname === "/admin") return null;

  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="mb-6 flex items-center space-x-1 text-sm text-gray-500">
      <Link
        href="/admin"
        className="flex items-center transition-colors hover:text-gray-900"
      >
        <Home className="h-4 w-4" />
      </Link>

      {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;

        return (
          <div key={path} className="flex items-center">
            <ChevronRight className="mx-1 h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-gray-900">
                {routeNames[path] ?? segment}
              </span>
            ) : (
              <Link
                href={path}
                className="transition-colors hover:text-gray-900"
              >
                {routeNames[path] ?? segment}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};
