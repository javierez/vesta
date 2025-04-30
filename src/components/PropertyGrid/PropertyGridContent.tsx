"use client"

import type { Property } from "~/lib/data"
import { PropertyCard } from "~/components/property-card"

interface PropertyGridContentProps {
  properties: Property[]
}

export function PropertyGridContent({ properties }: PropertyGridContentProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
} 