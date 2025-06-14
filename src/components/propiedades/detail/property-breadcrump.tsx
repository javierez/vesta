'use client'

import Link from "next/link"

interface PropertyBreadcrumbProps {
  title: string
}

export function PropertyBreadcrumb({ title }: PropertyBreadcrumbProps) {
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
        </li>
      </ol>
    </nav>
  )
}
