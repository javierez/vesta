"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { PropertyCard } from "~/components/property-card"
import { PropertyCardSkeleton } from "~/components/property-card-skeleton"
import { PropertyFilter } from "~/components/propiedades/property-filter"
import { PropertyTable } from "~/components/propiedades/property-table"
import { listListings } from "~/server/queries/listing"
import type { ListingOverview } from "~/types/listing"

const ITEMS_PER_PAGE = 12

export default function PropertiesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [listings, setListings] = useState<ListingOverview[]>([])
  const [filteredListings, setFilteredListings] = useState<ListingOverview[]>([])
  const [view, setView] = useState<"grid" | "table">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const listingsData = await listListings(currentPage, ITEMS_PER_PAGE)
        setListings(listingsData)
        setFilteredListings(listingsData)
        setTotalPages(listingsData.length === ITEMS_PER_PAGE ? currentPage + 1 : currentPage)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentPage])

  const handleFilterChange = (filters: {
    searchQuery: string
    status: string[]
    type: string[]
    city: string[]
    source: string[]
    createdAt: string[]
  }) => {
    const filtered = listings.filter((listing) => {
      const matchesSearch = 
        (listing.title?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ?? false) ||
        (listing.referenceNumber?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ?? false)

      const matchesType = filters.type.length === 0 || (listing.propertyType && filters.type.includes(listing.propertyType))
      const matchesStatus = filters.status.length === 0 || filters.status.includes(listing.status)
      const matchesCity = filters.city.length === 0 || (listing.city && filters.city.includes(listing.city))

      return matchesSearch && matchesType && matchesStatus && matchesCity
    })

    setFilteredListings(filtered)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Propiedades</h1>
        <Button asChild>
          <Link href="/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Propiedad
          </Link>
        </Button>
      </div>

      <PropertyFilter 
        listings={listings}
        onFilterChange={handleFilterChange}
        view={view}
        onViewChange={setView}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <PropertyCardSkeleton key={index} />
          ))}
        </div>
      ) : view === "grid" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <PropertyCard 
                key={listing.listingId.toString()} 
                listing={listing}
              />
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center gap-2 mt-10">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="py-2 px-4 text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </>
      ) : (
        <PropertyTable 
          listings={filteredListings}
        />
      )}
    </div>
  )
} 