"use client"

import { use } from "react"
import PropertyForm from "~/components/crear/property-form"

export default function PropertyCreationPage({ params }: { params: Promise<{ listing_id: string }> }) {
  const { listing_id } = use(params)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PropertyForm listingId={listing_id} />
    </div>
  )
}
