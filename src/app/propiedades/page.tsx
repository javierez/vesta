"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Plus, FileText } from "lucide-react"
import Link from "next/link"
import { PropertyCardSkeleton } from "~/components/property-card-skeleton"
import { PropertyFilter } from "~/components/propiedades/property-filter"
import { PropertyTable } from "~/components/propiedades/property-table"
import { PropertyGrid } from "~/components/propiedades/property-grid"
import { NoResults } from "~/components/propiedades/no-results"
import { listListings, getAllAgents } from "~/server/queries/listing"
import type { ListingOverview } from "~/types/listing"
import { useSearchParams, useRouter } from "next/navigation"

const ITEMS_PER_PAGE = 21

export default function PropertiesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [listings, setListings] = useState<ListingOverview[]>([])
  const [currentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  // Removed unused variable: totalCount
  const [agents, setAgents] = useState<Array<{ id: bigint, name: string }>>([])
  const [error, setError] = useState<string | null>(null)

  const view = (searchParams.get('view') ?? 'grid') as "grid" | "table"

  // Fetch agents independently
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const allAgents = await getAllAgents()
        setAgents(allAgents)
      } catch (error) {
        console.error("Error fetching agents:", error)
        setError("Error al cargar los agentes")
      }
    }
    void fetchAgents()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const page = Number(searchParams.get('page') ?? 1)
        // Get all filter parameters from URL
        const filters: Record<string, unknown> = {}
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
            filters.listingType = value.split(',').map(v => statusMap[v] || v)
          } else if (key === 'type') {
            filters.propertyType = value.split(',')
          } else if (key === 'agent') {
            filters.agentId = value.split(',').map(Number)
          } else if (['minPrice', 'maxPrice', 'bedrooms', 'minBathrooms', 'maxBathrooms', 'minSquareMeter', 'maxSquareMeter'].includes(key)) {
            filters[key] = Number(value)
          } else if (['hasGarage', 'hasElevator', 'hasStorageRoom', 'brandNew', 'needsRenovation'].includes(key)) {
            filters[key] = value === 'true'
          } else {
            filters[key] = value
          }
        }
        
        const result = await listListings(page, ITEMS_PER_PAGE, filters)
        
        setListings(
          result.listings.map(listing => ({
            ...listing,
            ownerName: listing.owner,
            // Ensure listingType is cast to ListingType union
            listingType: listing.listingType as ListingOverview["listingType"],
          }))
        )
        setTotalPages(result.totalPages)
        // Removed setTotalCount since totalCount is unused

        // If no results found, show a message
        if (result.totalCount === 0) {
          setError("No se encontraron propiedades con los filtros seleccionados")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Error al cargar las propiedades")
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
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
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/propiedades/crear">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Propiedad
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/propiedades/borradores">
              <FileText className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <PropertyFilter 
        view={view}
        agents={agents}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <PropertyCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <NoResults message={error} />
      ) : view === "grid" ? (
        <PropertyGrid
          listings={listings}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      ) : (
        <PropertyTable 
          listings={listings}
        />
      )}
    </div>
  )
}