"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Plus, Search, Filter, X, Check, ChevronDown } from "lucide-react"
import Link from "next/link"
import { PropertyCard } from "~/components/property-card"
import { PropertyCardSkeleton } from "~/components/property-card-skeleton"
import { properties } from "~/lib/data"
import type { Property } from "~/lib/data"
import { Badge } from "~/components/ui/badge"
import { ScrollArea } from "~/components/ui/scroll-area"
import { PropertyFilter } from "~/components/propiedades/property-filter"
import { PropertyTable } from "~/components/propiedades/property-table"

export default function PropertiesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [propertiesList, setPropertiesList] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [view, setView] = useState<"grid" | "table">("grid")

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPropertiesList(properties)
      setFilteredProperties(properties)
      setIsLoading(false)
    }

    fetchProperties()
  }, [])

  const handleFilterChange = (filters: {
    searchQuery: string
    status: string[]
    type: string[]
    city: string[]
    source: string[]
    createdAt: string[]
  }) => {
    const filtered = propertiesList.filter((property) => {
      const matchesSearch = 
        property.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        property.referenceNumber.toLowerCase().includes(filters.searchQuery.toLowerCase())

      const matchesStatus = filters.status.length === 0 || filters.status.includes(property.status)
      const matchesType = filters.type.length === 0 || filters.type.includes(property.propertyType)
      const matchesCity = filters.city.length === 0 || filters.city.includes(property.city)
      const matchesSource = filters.source.length === 0 // TODO: Add source field to Property type
      const matchesCreatedAt = filters.createdAt.length === 0 // TODO: Add createdAt filter logic

      return matchesSearch && matchesStatus && matchesType && matchesCity && matchesSource && matchesCreatedAt
    })

    setFilteredProperties(filtered)
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
        properties={propertiesList}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.propertyId.toString()} property={property} />
          ))}
        </div>
      ) : (
        <PropertyTable properties={filteredProperties} />
      )}
    </div>
  )
} 