'use client';

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { PropertyCard } from "~/components/property-card";
import { PropertyCardSkeleton } from "~/components/property-card-skeleton";
import { properties } from "~/lib/data";
import { parseSearchSlug } from "~/lib/search-utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { SearchBar } from "~/components/search-bar";
import { Suspense } from "react";

interface SearchPageClientProps {
  slug: string[];
  searchParams: { [key: string]: string | string[] | undefined };
}

export function SearchPageClient({ slug, searchParams }: SearchPageClientProps) {
  const router = useRouter();
  const slugString = slug.join("/");
  const parsedParams = parseSearchSlug(slugString);
  const { location = "", propertyType = "any", bedrooms = "any", bathrooms = "any", status = "for-sale" } = parsedParams;

  // Filter properties
  let filteredProperties = properties.filter((property) => {
    // Filter by status
    if (status !== "any" && property.status !== status) {
      return false;
    }

    // Filter by location
    if (
      location &&
      location !== "todas-ubicaciones" &&
      !property.city.toLowerCase().includes(location.toLowerCase()) &&
      !property.state.toLowerCase().includes(location.toLowerCase()) &&
      !property.address.toLowerCase().includes(location.toLowerCase())
    ) {
      return false;
    }

    // Filter by type of property
    if (propertyType !== "any" && property.propertyType !== propertyType) {
      return false;
    }

    // Filter by bedrooms
    if (bedrooms !== "any" && property.bedrooms < Number.parseInt(bedrooms)) {
      return false;
    }

    // Filter by bathrooms
    if (bathrooms !== "any" && property.bathrooms < Number.parseInt(bathrooms)) {
      return false;
    }

    // Filter by price
    const minPriceValue = parsedParams.minPrice || 0;
    const maxPriceValue = parsedParams.maxPrice || Number.MAX_SAFE_INTEGER;
    if (property.price < minPriceValue || property.price > maxPriceValue) {
      return false;
    }

    // Filter by area
    const minAreaValue = parsedParams.minArea || 0;
    const maxAreaValue = parsedParams.maxArea || Number.MAX_SAFE_INTEGER;
    if (property.squareFeet < minAreaValue || property.squareFeet > maxAreaValue) {
      return false;
    }

    return true;
  });

  // Sort properties based on the sort parameter
  const sortOption = searchParams.sort || "default";

  switch (sortOption) {
    case "price-asc":
      filteredProperties = filteredProperties.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filteredProperties = filteredProperties.sort((a, b) => b.price - a.price);
      break;
    case "size-asc":
      filteredProperties = filteredProperties.sort((a, b) => a.squareFeet - b.squareFeet);
      break;
    case "size-desc":
      filteredProperties = filteredProperties.sort((a, b) => b.squareFeet - a.squareFeet);
      break;
    case "newest":
      filteredProperties = filteredProperties.sort((a, b) => b.id.localeCompare(a.id));
      break;
    default:
      filteredProperties = filteredProperties.sort((a, b) =>
        a.isFeatured === b.isFeatured ? 0 : a.isFeatured ? -1 : 1,
      );
  }

  // Build title of the search
  let searchTitle = "Propiedades";

  if (status === "for-rent") {
    searchTitle = "Propiedades en Alquiler";
  } else if (status === "for-sale") {
    searchTitle = "Propiedades en Venta";
  }

  if (propertyType !== "any") {
    const propertyTypeLabels = {
      piso: status === "for-rent" ? "Pisos en Alquiler" : "Pisos en Venta",
      casa: status === "for-rent" ? "Casas en Alquiler" : "Casas en Venta",
      local: status === "for-rent" ? "Locales en Alquiler" : "Locales en Venta",
      solar: "Solares en Venta",
      garaje: status === "for-rent" ? "Garajes en Alquiler" : "Garajes en Venta",
    };

    searchTitle = propertyTypeLabels[propertyType as keyof typeof propertyTypeLabels] || searchTitle;
  }

  if (location && location !== "todas-ubicaciones") {
    searchTitle += ` en ${location.replace(/-/g, " ")}`;
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Breadcrumb */}
      <div className="py-4">
        <div className="flex items-center text-sm">
          <Link href="/" className="text-muted-foreground hover:text-primary">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium">Resultados de Búsqueda</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="py-8">
        <SearchBar initialParams={parsedParams} />
      </div>

      {/* Encabezado de resultados */}
      <div className="py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{searchTitle}</h1>
            <p className="text-muted-foreground mt-2">
              {filteredProperties.length}{" "}
              {filteredProperties.length === 1 ? "propiedad encontrada" : "propiedades encontradas"}
            </p>
          </div>
          <div className="flex items-center gap-2">
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
                  <Link href={`/busqueda/${slugString}?sort=default`} className="w-full">
                    Destacados primero
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/busqueda/${slugString}?sort=price-asc`} className="w-full">
                    Precio: de menor a mayor
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/busqueda/${slugString}?sort=price-desc`} className="w-full">
                    Precio: de mayor a menor
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/busqueda/${slugString}?sort=size-asc`} className="w-full">
                    Tamaño: de menor a mayor
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/busqueda/${slugString}?sort=size-desc`} className="w-full">
                    Tamaño: de mayor a menor
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/busqueda/${slugString}?sort=newest`} className="w-full">
                    Más recientes primero
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Separator />

      {/* Resultados */}
      <div className="py-8">
        {filteredProperties.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Suspense
              fallback={Array(6)
                .fill(0)
                .map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
            >
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </Suspense>
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-2">No se encontraron propiedades</h2>
            <p className="text-muted-foreground mb-6">
              No hay propiedades que coincidan con tus criterios de búsqueda. Intenta con otros filtros.
            </p>
            <Button asChild>
              <Link href="/">Volver al Inicio</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Paginación */}
      {filteredProperties.length > 0 && (
        <div className="pb-16">
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 