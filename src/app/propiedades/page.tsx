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
import { PaginationControls } from "~/components/ui/pagination-controls"
import { useSearchParams, useRouter } from "next/navigation"

const ITEMS_PER_PAGE = 21

export default function PropertiesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [listings, setListings] = useState<ListingOverview[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const view = (searchParams.get('view') || 'grid') as "grid" | "table"

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const page = Number(searchParams.get('page')) || 1
        setCurrentPage(page)
        
        // Get all filter parameters from URL
        const filters: Record<string, any> = {}
        for (const [key, value] of searchParams.entries()) {
          if (key === 'page') continue
          if (key === 'q') {
            filters.searchQuery = value
          } else if (key === 'status') {
            // Map status to listingType
            const statusMap: Record<string, string> = {
              'for-sale': 'En Venta',
              'for-rent': 'En Alquiler',
              'sold': 'Vendido'
            }
            filters.listingType = statusMap[value] || value
          } else if (key === 'type') {
            filters.propertyType = value
          } else if (['minPrice', 'maxPrice', 'bedrooms', 'minBathrooms', 'maxBathrooms', 'minSquareMeter', 'maxSquareMeter'].includes(key)) {
            filters[key] = Number(value)
          } else if (['hasGarage', 'hasElevator', 'hasStorageRoom', 'brandNew', 'needsRenovation'].includes(key)) {
            filters[key] = value === 'true'
          } else {
            filters[key] = value
          }
        }
        
        const result = await listListings(page, ITEMS_PER_PAGE, filters)
        
        setListings(result.listings)
        setTotalPages(result.totalPages)
        setTotalCount(result.totalCount)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/propiedades?${params.toString()}`)
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
        view={view}
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
            onPageChange={handlePageChange}
            className="mt-10"
          />
        </>
      ) : (
        <PropertyTable 
          listings={listings}
        />
      )}
    </div>
  )
} 