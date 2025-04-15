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

type PropertyType = "any" | "house" | "apartment" | "condo" | "commercial"

export function PropertySearch() {
  const router = useRouter()
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000000])
  const [searchParams, setSearchParams] = useState({
    location: "",
    propertyType: "any",
    bedrooms: "any",
    bathrooms: "any",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSearchParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setSearchParams((prev) => ({ ...prev, [name]: value }))
  }

  // Update the handleSubmit function to use our new URL structure
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Create search params object
    const { location, propertyType, bedrooms, bathrooms } = searchParams
    const searchParamsData: SearchParams = {
      location: location,
      propertyType: propertyType as PropertyType,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      status: "for-sale", // Default to for-sale
    }

    // Build the search slug
    const searchSlug = buildSearchSlug(searchParamsData)

    // Redirect to the search page with the new URL structure
    router.push(`/busqueda/${searchSlug}`)
  }

  return (
    <section className="py-12 bg-muted" id="search">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Encuentra Tu Propiedad Perfecta</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Utiliza nuestra búsqueda avanzada para encontrar propiedades que coincidan con tus requisitos exactos
          </p>
        </div>

        <div className="bg-background rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
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
                onValueChange={(value) => handleSelectChange("propertyType", value)}
              >
                <SelectTrigger id="property-type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Cualquiera</SelectItem>
                  <SelectItem value="house">Casa</SelectItem>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                  <SelectItem value="condo">Condominio</SelectItem>
                  <SelectItem value="commercial">Comercial</SelectItem>
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
                  ${(priceRange[0] ?? 0).toLocaleString()} - ${(priceRange[1] ?? 0).toLocaleString()}
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
      </div>
    </section>
  )
}
