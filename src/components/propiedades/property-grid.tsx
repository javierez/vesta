"use client"

import { PropertyCard } from "~/components/property-card"
import { PaginationControls } from "~/components/ui/pagination-controls"
import type { ListingOverview } from "~/types/listing"

interface PropertyGridProps {
  listings: ListingOverview[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PropertyGrid({ 
  listings, 
  currentPage, 
  totalPages, 
  onPageChange 
}: PropertyGridProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <PropertyCard 
            key={listing.listingId.toString()} 
            listing={listing}
          />
        ))}
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        className="mt-10"
      />
    </>
  )
}
