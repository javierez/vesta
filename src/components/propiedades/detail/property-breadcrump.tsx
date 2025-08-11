"use client";

import Link from "next/link";
import { generatePropertyTitle } from "~/components/propiedades/form/common/property-title";

interface PropertyBreadcrumbProps {
  propertyType: string;
  street: string;
  referenceNumber?: string;
  documentFolder?: {
    name: string;
    propertyId: string;
  };
}

export function PropertyBreadcrumb({
  propertyType,
  street,
  referenceNumber,
  documentFolder,
}: PropertyBreadcrumbProps) {
  const title = generatePropertyTitle(propertyType, street);

  return (
    <nav className="py-4" aria-label="Breadcrumb">
      <ol className="flex items-center text-sm">
        <li>
          <Link
            href="/propiedades"
            className="text-muted-foreground hover:text-primary"
          >
            Propiedades
          </Link>
        </li>
        <li className="mx-2">/</li>
        <li className={documentFolder ? "text-muted-foreground" : "font-medium"}>
          {documentFolder ? (
            <Link
              href={`/propiedades/${documentFolder.propertyId}`}
              className="hover:text-primary"
            >
              {title}
              {referenceNumber && (
                <span className="ml-1 tracking-wide">({referenceNumber})</span>
              )}
            </Link>
          ) : (
            <>
              {title}
              {referenceNumber && (
                <span className="ml-1 tracking-wide">({referenceNumber})</span>
              )}
            </>
          )}
        </li>
        {documentFolder && (
          <>
            <li className="mx-2">/</li>
            <li className="font-medium" aria-current="page">
              {documentFolder.name}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
