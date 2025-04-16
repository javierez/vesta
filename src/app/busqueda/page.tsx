import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { buildSearchSlug, type SearchParams } from "~/lib/search-utils"

export const metadata: Metadata = {
  title: "Resultados de Búsqueda | Acropolis Bienes Raíces",
  description: "Explora nuestras propiedades disponibles que coinciden con tus criterios de búsqueda.",
}

interface SearchPageProps {
  searchParams: {
    location?: string
    tipo?: string
    habitaciones?: string
    banos?: string
    precioMin?: string
    precioMax?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  // Convert old search params to new format
  const newSearchParams: SearchParams = {
    location: searchParams.location,
    propertyType: (searchParams.tipo as any) || "any",
    bedrooms: searchParams.habitaciones || "any",
    bathrooms: searchParams.banos || "any",
    minPrice: Number.parseInt(searchParams.precioMin || "0"),
    maxPrice: Number.parseInt(searchParams.precioMax || "2000000"),
    status: "for-sale",
  }

  // Build the search slug
  const searchSlug = buildSearchSlug(newSearchParams)

  // Redirect to the new URL structure
  redirect(`/busqueda/${searchSlug}`)
}
