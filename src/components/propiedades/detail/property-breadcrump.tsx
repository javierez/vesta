"use client";

import Link from "next/link";
import { generatePropertyTitle } from "~/lib/property-title";

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
      {/* Mobile: Simple back link */}
      <div className="md:hidden">
        <Link
          href="/propiedades"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <svg
            className="mr-1 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Propiedades
        </Link>
      </div>

      {/* Desktop: Full breadcrumb */}
      <ol className="hidden items-center text-sm md:flex">
        <li>
          <Link
            href="/propiedades"
            className="text-muted-foreground hover:text-primary"
          >
            Propiedades
          </Link>
        </li>
        <li className="mx-2">/</li>
        <li
          className={
            documentFolder
              ? "truncate text-muted-foreground"
              : "truncate font-medium"
          }
        >
          {documentFolder ? (
            <Link
              href={`/propiedades/${documentFolder.propertyId}`}
              className="hover:text-primary"
            >
              <span className="truncate">
                {title}
                {referenceNumber && (
                  <span className="ml-1 tracking-wide">
                    ({referenceNumber})
                  </span>
                )}
              </span>
            </Link>
          ) : (
            <span className="truncate">
              {title}
              {referenceNumber && (
                <span className="ml-1 tracking-wide">({referenceNumber})</span>
              )}
            </span>
          )}
        </li>
        {documentFolder && (
          <>
            <li className="mx-2 flex-shrink-0">/</li>
            <li className="truncate font-medium" aria-current="page">
              {documentFolder.name}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
