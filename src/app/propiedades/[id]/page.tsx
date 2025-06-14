import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Bed, Bath, SquareIcon, MapPin, Share2, Check, X, User, Building2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { PropertyCard } from "~/components/property-card"
import { ImageGallery } from "~/components/propiedades/detail/image-gallery"
import { Card } from "~/components/ui/card"
import { PropertyBreadcrumb } from "~/components/propiedades/detail/property-breadcrump"
import { PropertyHeader } from "~/components/propiedades/detail/property-header"
import { PropertyCharacteristicsForm } from "~/components/propiedades/detail/property-characteristics-form"
import { use } from "react"
import { getPropertyImages } from "~/server/queries/property_images"
import { getListingDetails } from "~/server/queries/listing"
import type { PropertyImage } from "~/lib/data"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"

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
        <PropertyBreadcrumb title={listing.title ?? 'Propiedad'} />
        
        <PropertyHeader
          title={listing.title ?? 'Propiedad'}
          street={listing.street ?? ''}
          city={listing.city ?? ''}
          province={listing.province ?? ''}
          postalCode={listing.postalCode ?? ''}
          referenceNumber={listing.referenceNumber ?? ''}
          price={listing.price}
          listingType={listing.listingType as 'Sale' | 'Rent' | 'Sold'}
          isBankOwned={listing.isBankOwned ?? false}
          isFeatured={listing.isFeatured ?? false}
        />

        {/* Galería de imágenes */}
        <div className="pb-8 max-w-3xl mx-auto mb-8">
          <ImageGallery images={processedImages} title={listing.title ?? ""} />
        </div>

        {/* Contenido principal */}
        <div className="pb-16">
          <div className="grid grid-cols-1 gap-4">
            {/* Columna principal */}
            <div className="space-y-4">
              {/* Características detalladas */}
              <PropertyCharacteristicsForm listing={listing} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

