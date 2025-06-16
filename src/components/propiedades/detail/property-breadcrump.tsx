'use client'

import Link from "next/link"
import { generatePropertyTitle } from "~/components/propiedades/form/common/property-title"

interface PropertyBreadcrumbProps {
  propertyType: string
  street: string
  referenceNumber?: string
}

export function PropertyBreadcrumb({ propertyType, street, referenceNumber }: PropertyBreadcrumbProps) {
  const title = generatePropertyTitle(propertyType, street)

  return (
    <nav className="py-4" aria-label="Breadcrumb">
      <ol className="flex items-center text-sm">
        <li>
          <Link href="/propiedades" className="text-muted-foreground hover:text-primary">
            Propiedades
          </Link>
        </li>
        <li className="mx-2">/</li>
        <li className="font-medium" aria-current="page">
          {title}
          {referenceNumber && (
            <span className="tracking-wide ml-1">
              ({referenceNumber})
            </span>
          )}
        </li>
      </ol>
    </nav>
  )
}
