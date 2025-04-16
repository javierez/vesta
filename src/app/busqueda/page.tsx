import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { buildSearchSlug, type SearchParams, type PropertyType } from "~/lib/search-utils"
import { use } from "react"

export const metadata: Metadata = {
  title: "Resultados de Búsqueda | Acropolis Bienes Raíces",
  description: "Explora nuestras propiedades disponibles que coinciden con tus criterios de búsqueda.",
}

interface SearchPageProps {
  searchParams: Promise<{
    location?: string
    tipo?: string
    habitaciones?: string
    banos?: string
    precioMin?: string
    precioMax?: string
  }>
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  // Unwrap searchParams using React.use()
  const unwrappedSearchParams = use(searchParams) as {
    location?: string
    tipo?: string
    habitaciones?: string
    banos?: string
    precioMin?: string
    precioMax?: string
  }

  // Convert old search params to new format
  const newSearchParams: SearchParams = {
    location: unwrappedSearchParams.location,
    propertyType: (unwrappedSearchParams.tipo as PropertyType) ?? "any",
    bedrooms: unwrappedSearchParams.habitaciones ?? "any",
    bathrooms: unwrappedSearchParams.banos ?? "any",
    minPrice: Number.parseInt(unwrappedSearchParams.precioMin ?? "0"),
    maxPrice: Number.parseInt(unwrappedSearchParams.precioMax ?? "2000000"),
    status: "for-sale",
  }

  // Build the search slug
  const searchSlug = buildSearchSlug(newSearchParams)

  // Redirect to the new URL structure
  redirect(`/busqueda/${searchSlug}`)
}
