"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { PropertyCard } from "~/components/property-card"
import { PropertyCardSkeleton } from "~/components/property-card-skeleton"
import type { Property } from "~/lib/data"

// Mock data - replace with actual data from your database
const mockProperties: Property[] = [
  {
    id: "1",
    title: "Apartamento Moderno en el Centro",
    propertyType: "piso",
    status: "for-sale",
    price: 450000,
    address: "Calle Principal 123",
    city: "Madrid",
    state: "Madrid",
    zipCode: "28001",
    description: "Hermoso apartamento en el centro de la ciudad con acabados de lujo",
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 120,
    imageUrl: "/properties/suburban-dream.png",
    images: [
      { url: "/properties/suburban-dream.png", alt: "Vista principal del apartamento" },
      { url: "/properties/suburban-dream.png", alt: "Vista alternativa del apartamento" }
    ],
    reference: "REF001",
    isBankOwned: false,
    features: ["Ascensor", "Parking", "Terraza"],
    isFeatured: true
  },
  {
    id: "2",
    title: "Villa de Lujo con Piscina",
    propertyType: "casa",
    status: "for-sale",
    price: 1200000,
    address: "Avenida del Mar 45",
    city: "Marbella",
    state: "Málaga",
    zipCode: "29600",
    description: "Impresionante villa con vistas al mar y piscina privada",
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 350,
    imageUrl: "/properties/suburban-dream.png",
    images: [
      { url: "/properties/suburban-dream.png", alt: "Vista principal de la villa" },
      { url: "/properties/suburban-dream.png", alt: "Vista alternativa de la villa" }
    ],
    reference: "REF002",
    isBankOwned: false,
    features: ["Piscina", "Jardín", "Vistas al mar"],
    isFeatured: true
  }
]

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
    // Simulate API call
    const fetchProperties = async () => {
      setIsLoading(true)
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProperties(mockProperties)
      setIsLoading(false)
    }

    fetchProperties()
  }, [])

  const filteredProperties = properties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || property.status === statusFilter
    const matchesType = typeFilter === "all" || property.propertyType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

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

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar propiedades..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Estados</SelectItem>
              <SelectItem value="for-sale">En Venta</SelectItem>
              <SelectItem value="for-rent">En Alquiler</SelectItem>
              <SelectItem value="sold">Vendido</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Tipos</SelectItem>
              <SelectItem value="piso">Piso</SelectItem>
              <SelectItem value="casa">Casa</SelectItem>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="solar">Solar</SelectItem>
              <SelectItem value="garaje">Garaje</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Show skeleton cards while loading
          Array.from({ length: 6 }).map((_, index) => (
            <PropertyCardSkeleton key={index} />
          ))
        ) : (
          // Show actual property cards
          filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))
        )}
      </div>
    </div>
  )
} 