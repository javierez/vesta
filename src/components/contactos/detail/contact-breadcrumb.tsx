"use client";

import Link from "next/link";

interface ContactBreadcrumbProps {
  firstName: string;
  lastName: string;
}

export function ContactBreadcrumb({
  firstName,
  lastName,
}: ContactBreadcrumbProps) {
  return (
    <nav className="py-4" aria-label="Breadcrumb">
      <ol className="flex items-center text-sm">
        <li>
          <Link
            href="/contactos"
            className="text-muted-foreground hover:text-primary"
          >
            Contactos
          </Link>
        </li>
        <li className="mx-2">/</li>
        <li className="font-medium" aria-current="page">
          {firstName} {lastName}
        </li>
      </ol>
    </nav>
  );
}
