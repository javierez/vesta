import type { Metadata } from "next"
import { DropdownMenuItem } from "~/components/ui/dropdown-menu"
import { DropdownMenuContent } from "~/components/ui/dropdown-menu"
import { DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { DropdownMenu } from "~/components/ui/dropdown-menu"
import Link from "next/link"
import { properties } from "~/lib/data"
import { PropertyCard } from "~/components/property-card"
import { PropertyCardSkeleton } from "~/components/property-card-skeleton"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { ArrowLeft, SlidersHorizontal } from "lucide-react"
import { parseSearchSlug, type PropertyType } from "~/lib/search-utils"
import { SearchBar } from "~/components/search-bar"
import { Suspense } from "react"

// Generate dynamic metadata based on search parameters
export async function generateMetadata({ params }: { params: { slug: string[] } }): Promise<Metadata> {
  const slugString = (await params).slug.join("/")
  const parsedParams = parseSearchSlug(slugString)
  const { location = "", propertyType = "any", status = "for-sale" } = parsedParams

  // Build title and description based on search parameters
  let title = "Propiedades"
  let description = "Explora nuestras propiedades disponibles."

  if (status === "for-rent") {
    title = "Propiedades en Alquiler"
    description = "Encuentra propiedades en alquiler en las mejores ubicaciones."
  } else if (status === "for-sale") {
    title = "Propiedades en Venta"
    description = "Descubre propiedades en venta que se adaptan a tus necesidades."
  }

  if (propertyType !== "any") {
    const propertyTypeLabels: Record<Exclude<PropertyType, "any">, string> = {
      piso: status === "for-rent" ? "Pisos en Alquiler" : "Pisos en Venta",
      casa: status === "for-rent" ? "Casas en Alquiler" : "Casas en Venta",
      local: status === "for-rent" ? "Locales en Alquiler" : "Locales en Venta",
      solar: "Solares en Venta",
      garaje: status === "for-rent" ? "Garajes en Alquiler" : "Garajes en Venta",
    }

    if (propertyType in propertyTypeLabels) {
      title = propertyTypeLabels[propertyType]
    }
  }

  if (location && location !== "todas-ubicaciones") {
    const locationName = location.replace(/-/g, " ")
    title += ` en ${locationName}`
    description += ` en ${locationName}.`
  }

  return {
    metadataBase: new URL("https://acropolis-realestate.com"),
    title: `${title} | Acropolis Bienes Raíces`,
    description,
    openGraph: {
      title: `${title} | Acropolis Bienes Raíces`,
      description,
      url: `/${slugString}`,
      type: "website",
    },
    alternates: {
      canonical: `/${slugString}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

interface SearchPageProps {
  params: Promise<{
    slug: string[]
  }>
  searchParams: Promise<{
    sort?: string
  }>
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  // Join the slug array into a single string
  const unwrappedParams = await params
  const unwrappedSearchParams = await searchParams
  const slugString = unwrappedParams.slug.join("/")

  // Parse the slug to get search parameters
  const parsedParams = parseSearchSlug(slugString)

  // Destructure search parameters
  const { 
    location = "", 
    propertyType = "any", 
    bedrooms = "any", 
    bathrooms = "any", 
    status = "for-sale",
    province = "all",
    municipality = "all"
  } = parsedParams

  // Filter properties
  let filteredProperties = properties.filter((property) => {
    // Filter by status
    if (status !== "any" && property.status !== status) {
      return false
    }

    // Filter by location
    if (
      location &&
      location !== "todas-ubicaciones" &&
      !property.city.toLowerCase().includes(location.toLowerCase()) &&
      !property.province?.toLowerCase().includes(location.toLowerCase()) &&
      !property.street.toLowerCase().includes(location.toLowerCase())
    ) {
      return false
    }

    // Filter by province
    if (province !== "all" && property.province?.toLowerCase() !== province.toLowerCase()) {
      return false
    }

    // Filter by municipality
    if (municipality !== "all" && property.city.toLowerCase() !== municipality.toLowerCase()) {
      return false
    }

    // Filter by type of property
    if (propertyType !== "any" && property.propertyType !== propertyType) {
      return false
    }

    // Filter by bedrooms
    if (bedrooms !== "any" && (property.bedrooms ?? 0) < Number.parseInt(bedrooms ?? "0")) {
      return false
    }

    // Filter by bathrooms
    if (bathrooms !== "any" && Number.parseFloat(property.bathrooms ?? "0") < Number.parseInt(bathrooms ?? "0")) {
      return false
    }

    // Filter by price
    const minPriceValue = parsedParams.minPrice ?? 0
    const maxPriceValue = parsedParams.maxPrice ?? Number.MAX_SAFE_INTEGER
    const propertyPrice = Number.parseFloat(property.price)
    if (propertyPrice < minPriceValue || propertyPrice > maxPriceValue) {
      return false
    }

    // Filter by area
    const minAreaValue = parsedParams.minArea ?? 0
    const maxAreaValue = parsedParams.maxArea ?? Number.MAX_SAFE_INTEGER
    if (property.squareMeter < minAreaValue || property.squareMeter > maxAreaValue) {
      return false
    }

    return true
  })

  // Sort properties based on the sort parameter
  const sortOption = unwrappedSearchParams.sort ?? "default"

  switch (sortOption) {
    case "price-asc":
      filteredProperties = filteredProperties.sort((a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price))
      break
    case "price-desc":
      filteredProperties = filteredProperties.sort((a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price))
      break
    case "size-asc":
      filteredProperties = filteredProperties.sort((a, b) => a.squareMeter - b.squareMeter)
      break
    case "size-desc":
      filteredProperties = filteredProperties.sort((a, b) => b.squareMeter - a.squareMeter)
      break
    case "newest":
      filteredProperties = filteredProperties.sort((a, b) => b.propertyId.toString().localeCompare(a.propertyId.toString()))
      break
    default:
      filteredProperties = filteredProperties.sort((a, b) =>
        a.isFeatured === b.isFeatured ? 0 : a.isFeatured ? -1 : 1,
      )
  }

  // Build title of the search
  let searchTitle = "Propiedades"

  if (status === "for-rent") {
    searchTitle = "Propiedades en Alquiler"
  } else if (status === "for-sale") {
    searchTitle = "Propiedades en Venta"
  }

  if (propertyType !== "any") {
    const propertyTypeLabels: Record<Exclude<PropertyType, "any">, string> = {
      piso: status === "for-rent" ? "Pisos en Alquiler" : "Pisos en Venta",
      casa: status === "for-rent" ? "Casas en Alquiler" : "Casas en Venta",
      local: status === "for-rent" ? "Locales en Alquiler" : "Locales en Venta",
      solar: "Solares en Venta",
      garaje: status === "for-rent" ? "Garajes en Alquiler" : "Garajes en Venta",
    }

    if (propertyType in propertyTypeLabels) {
      searchTitle = propertyTypeLabels[propertyType]
    }
  }

  if (location && location !== "todas-ubicaciones") {
    searchTitle += ` en ${location.replace(/-/g, " ")}`
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="py-4" aria-label="Breadcrumb">
          <ol className="flex items-center text-sm">
            <li>
              <Link href="/" className="text-muted-foreground hover:text-primary">
                Inicio
              </Link>
            </li>
            <li className="mx-2">/</li>
            <li className="font-medium" aria-current="page">
              {searchTitle}
            </li>
          </ol>
        </nav>

        <div className="mb-8 mt-8">
          <SearchBar initialParams={parsedParams} />
        </div>

        <div className="mb-8 flex justify-between items-center">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Ordenar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href={`/${slugString}?sort=default`} className="w-full">
                  Destacados primero
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${slugString}?sort=newest`} className="w-full">
                  Más recientes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${slugString}?sort=price-asc`} className="w-full">
                  Precio: menor a mayor
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${slugString}?sort=price-desc`} className="w-full">
                  Precio: mayor a menor
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${slugString}?sort=size-asc`} className="w-full">
                  Tamaño: menor a mayor
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${slugString}?sort=size-desc`} className="w-full">
                  Tamaño: mayor a menor
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">{searchTitle}</h1>
          <p className="text-muted-foreground">
            {filteredProperties.length} propiedades encontradas
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Suspense
            fallback={Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          >
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </Suspense>
        </div>
      </div>
    </main>
  )
} 