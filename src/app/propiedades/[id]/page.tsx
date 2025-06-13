import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Bed, Bath, SquareIcon, MapPin, Share2, Check, X } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { PropertyCard } from "~/components/property-card"
import { ImageGallery } from "~/components/propiedades/detail/image-gallery"
import { Card } from "~/components/ui/card"
import { use } from "react"
import { getPropertyImages } from "~/server/queries/property_images"
import { getListingDetails } from "~/server/queries/listing"
import type { PropertyImage } from "~/lib/data"

interface PropertyPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const unwrappedParams = await params
  const listing = await getListingDetails(parseInt(unwrappedParams.id))

  if (!listing) {
    notFound()
  }

  // Get all property images with proper fallback
  const propertyImages = await getPropertyImages(BigInt(listing.propertyId))
  const defaultPlaceholder = "/properties/suburban-dream.png"
  
  // Process images to ensure they have valid URLs and match PropertyImage type
  const processedImages: PropertyImage[] = propertyImages.map(img => ({
    propertyImageId: img.propertyImageId,
    propertyId: img.propertyId,
    referenceNumber: img.referenceNumber,
    imageUrl: img.imageUrl || defaultPlaceholder,
    isActive: img.isActive ?? true,
    createdAt: img.createdAt,
    updatedAt: img.updatedAt,
    imageKey: img.imageKey,
    imageTag: img.imageTag || undefined,
    s3key: img.s3key,
    imageOrder: img.imageOrder
  }))

  const getEnergyCertificationColor = (cert: string | null | undefined) => {
    if (!cert) return "bg-gray-300"

    switch (cert) {
      case "A":
        return "bg-green-500"
      case "B":
        return "bg-green-400"
      case "C":
        return "bg-yellow-400"
      case "D":
        return "bg-yellow-500"
      case "E":
        return "bg-orange-400"
      case "F":
        return "bg-orange-500"
      case "G":
        return "bg-red-500"
      default:
        return "bg-gray-300"
    }
  }

  // Map coordinates
  const mapCoordinates = {
    lat: parseFloat(listing.latitude ?? "42.5987"),
    lng: parseFloat(listing.longitude ?? "-5.5671")
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="py-4" aria-label="Breadcrumb">
          <ol className="flex items-center text-sm">
            <li>
              <Link href="/" className="text-muted-foreground hover:text-primary">
                Inicio
              </Link>
            </li>
            <li className="mx-2">/</li>
            <li>
              <Link href="/propiedades" className="text-muted-foreground hover:text-primary">
                Propiedades
              </Link>
            </li>
            <li className="mx-2">/</li>
            <li className="font-medium" aria-current="page">
              {listing.title}
            </li>
          </ol>
        </nav>

        {/* Encabezado de la propiedad */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{listing.title}</h1>
                {listing.isBankOwned && (
                  <Badge variant="secondary" className="bg-amber-500 text-white">
                    Piso de Banco
                  </Badge>
                )}
              </div>
              <div className="flex items-center mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <p>
                  {listing.street}, {listing.city}, {listing.province} {listing.postalCode}
                </p>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Ref: {listing.referenceNumber}</div>
            </div>
            <div className="flex flex-col md:items-end">
              <div className="text-3xl font-bold">
                {parseFloat(listing.price).toLocaleString()}€{listing.listingType === "Rent" ? "/mes" : ""}
              </div>
              <Badge className="mt-1">
                {listing.listingType === "Sale"
                  ? "En Venta"
                  : listing.listingType === "Rent"
                    ? "En Alquiler"
                    : "Vendido"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Galería de imágenes */}
        <div className="pb-8 max-w-3xl mx-auto">
          <ImageGallery images={processedImages} title={listing.title ?? ""} />
        </div>

        {/* Contenido principal */}
        <div className="pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Características detalladas */}
              <div>
                <h2 className="text-2xl font-bold mb-6">CARACTERÍSTICAS</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Características principales */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-primary">Información General</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground">Referencia</span>
                        <span className="font-medium ml-auto">{listing.referenceNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground">Tipo</span>
                        <span className="font-medium ml-auto">{listing.propertyType}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground">Superficie</span>
                        <span className="font-medium ml-auto">{listing.squareMeter} m²</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground">Habitaciones</span>
                        <span className="font-medium ml-auto">{listing.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground">Baños</span>
                        <span className="font-medium ml-auto">{listing.bathrooms}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-primary">Ubicación</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground">Ciudad</span>
                        <span className="font-medium ml-auto">{listing.city}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground">Provincia</span>
                        <span className="font-medium ml-auto">{listing.province}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground">Municipio</span>
                        <span className="font-medium ml-auto">{listing.municipality}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground">Barrio</span>
                        <span className="font-medium ml-auto">{listing.neighborhood}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground">Código Postal</span>
                        <span className="font-medium ml-auto">{listing.postalCode}</span>
                      </div>
                    </div>
                  </div>

                  {/* Estado y Condiciones */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-primary">Estado y Condiciones</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground">Estado</span>
                        <span className="font-medium ml-auto">
                          {listing.listingType === "Sale" ? "En Venta" : listing.listingType === "Rent" ? "En Alquiler" : "Vendido"}
                        </span>
                      </div>
                      {listing.isBankOwned && (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <span className="text-muted-foreground">Propiedad Bancaria</span>
                          <span className="font-medium ml-auto text-amber-500">Sí</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground">Precio</span>
                        <span className="font-medium ml-auto">
                          {parseFloat(listing.price).toLocaleString()}€{listing.listingType === "Rent" ? "/mes" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mapa */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Ubicación</h2>
                <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">{listing.street}, {listing.city}, {listing.province}</span>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${mapCoordinates.lat},${mapCoordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-primary hover:underline"
                  >
                    Ver en Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Barra lateral */}
            <div className="space-y-6">
              {/* Acciones */}
              <div className="flex gap-2">
                <Button className="flex-1">Contactar</Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Agente */}
              {listing.agent && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image 
                        src={listing.agent.profileImageUrl || "/properties/confident-leader.png"} 
                        alt={`${listing.agent.firstName} ${listing.agent.lastName}`} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{`${listing.agent.firstName} ${listing.agent.lastName}`}</p>
                      <p className="text-sm text-primary truncate">{listing.agent.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Propietario */}
              {listing.owner && (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-3">Propietario</h3>
                  <div className="flex items-center gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{`${listing.owner.firstName} ${listing.owner.lastName}`}</p>
                      <p className="text-sm text-primary truncate">{listing.owner.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

