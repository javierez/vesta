"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Slider } from "~/components/ui/slider"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { buildSearchSlug, type SearchParams } from "~/lib/search-utils"

type PropertyType = "any" | "piso" | "casa" | "local" | "solar" | "garaje"

interface SearchFormData {
  location: string
  propertyType: PropertyType
  bedrooms: string
  bathrooms: string
}

export function PropertySearch() {
  const router = useRouter()
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000000])
  const [searchParams, setSearchParams] = useState<SearchFormData>({
    location: "",
    propertyType: "any",
    bedrooms: "any",
    bathrooms: "any",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSearchParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: keyof SearchFormData, value: string) => {
    setSearchParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const { location, propertyType, bedrooms, bathrooms } = searchParams
    const searchParamsData: SearchParams = {
      location,
      propertyType: propertyType === "any" ? undefined : propertyType,
      bedrooms,
      bathrooms,
      minPrice: priceRange[0] ?? 0,
      maxPrice: priceRange[1] ?? 0,
      status: "for-sale",
    }

    const searchSlug = buildSearchSlug(searchParamsData)
    router.push(`/busqueda/${searchSlug}`)
  }

  // Format numbers consistently to avoid hydration issues
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num)
  }

  return (
    <div className="bg-background/95 backdrop-blur-sm rounded-lg shadow-2xl p-6 max-w-5xl mx-auto">
      <form className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="location">Ubicación</Label>
          <Input
            id="location"
            name="location"
            placeholder="Ciudad, barrio o dirección"
            className="w-full"
            value={searchParams.location}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="property-type">Tipo de Propiedad</Label>
          <Select
            defaultValue={searchParams.propertyType}
            onValueChange={(value) => handleSelectChange("propertyType", value as PropertyType)}
          >
            <SelectTrigger id="property-type">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Cualquiera</SelectItem>
              <SelectItem value="piso">Piso</SelectItem>
              <SelectItem value="casa">Casa</SelectItem>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="solar">Solar</SelectItem>
              <SelectItem value="garaje">Garaje</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bedrooms">Habitaciones</Label>
          <Select
            defaultValue={searchParams.bedrooms}
            onValueChange={(value) => handleSelectChange("bedrooms", value)}
          >
            <SelectTrigger id="bedrooms">
              <SelectValue placeholder="Seleccionar habitaciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Cualquiera</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms">Baños</Label>
          <Select
            defaultValue={searchParams.bathrooms}
            onValueChange={(value) => handleSelectChange("bathrooms", value)}
          >
            <SelectTrigger id="bathrooms">
              <SelectValue placeholder="Seleccionar baños" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Cualquiera</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2 lg:col-span-1">
          <div className="flex justify-between">
            <Label>Rango de Precio</Label>
            <span className="text-sm text-muted-foreground">
              {formatNumber(priceRange[0] ?? 0)}€ - {formatNumber(priceRange[1] ?? 0)}€
            </span>
          </div>
          <Slider
            defaultValue={[0, 1000000]}
            max={2000000}
            step={50000}
            onValueChange={setPriceRange}
            className="py-4"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <Button type="submit" className="w-full" size="lg">
            <Search className="mr-2 h-4 w-4" />
            Buscar Propiedades
          </Button>
        </div>
      </form>
    </div>
  )
}
