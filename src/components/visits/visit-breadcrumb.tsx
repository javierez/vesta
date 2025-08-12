"use client";

import Link from "next/link";

export function VisitBreadcrumb() {
  return (
    <nav className="py-4" aria-label="Breadcrumb">
      <ol className="flex items-center text-sm">
        <li>
          <Link
            href="/calendario"
            className="text-muted-foreground hover:text-primary"
          >
            Calendario
          </Link>
        </li>
        <li className="mx-2 text-muted-foreground">/</li>
        <li className="font-medium" aria-current="page">
          Registro de Visita
        </li>
      </ol>
    </nav>
  );
}
