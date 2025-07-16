import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Bed, Bath, SquareIcon, MapPin, Share2, Check, X, User, Building2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { PropertyCard } from "~/components/property-card"
import { ImageGallery } from "~/components/propiedades/detail/image-gallery"
import { PropertySummary } from "~/components/propiedades/detail/property-summary"
import { Card } from "~/components/ui/card"
import { PropertyBreadcrumb } from "~/components/propiedades/detail/property-breadcrump"
import { PropertyHeader } from "~/components/propiedades/detail/property-header"
import { PropertyCharacteristicsForm } from "~/components/propiedades/form/property-characteristics-form"
import { PortalSelection } from "~/components/propiedades/detail/portal-selection"
import { EnergyCertificate } from "~/components/propiedades/detail/energy-certificate"
import { use } from "react"
import { getPropertyImages } from "~/server/queries/property_images"
import { getListingDetails } from "~/server/queries/listing"
import { getEnergyCertificate } from "~/server/queries/document"
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

  // Get energy certificate document
  const energyCertificate = await getEnergyCertificate(Number(listing.propertyId))

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



  // Map coordinates
  const mapCoordinates = {
    lat: parseFloat(listing.latitude ?? "42.5987"),
    lng: parseFloat(listing.longitude ?? "-5.5671")
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PropertyBreadcrumb 
          propertyType={listing.propertyType ?? ''}
          street={listing.street ?? ''}
          referenceNumber={listing.referenceNumber ?? ''}
        />
        
        <PropertyHeader
          propertyType={listing.propertyType ?? ''}
          street={listing.street ?? ''}
          city={listing.city ?? ''}
          province={listing.province ?? ''}
          postalCode={listing.postalCode ?? ''}
          referenceNumber={listing.referenceNumber ?? ''}
          price={listing.price}
          listingType={listing.listingType as 'Sale' | 'Rent' | 'Sold'}
          isBankOwned={listing.isBankOwned ?? false}
          isFeatured={listing.isFeatured ?? false}
          neighborhood={listing.neighborhood ?? ''}
        />

        {/* Property Summary */}
        {/* <div className="pb-8">
          <PropertySummary
            agent={listing.agent ? {
              id: listing.agent.id,
              name: listing.agent.name,
              email: listing.agent.email,
              phone: listing.agent.phone
            } : undefined}
            owners={listing.owners?.map(owner => ({
              id: owner.id,
              name: owner.name,
              email: owner.email,
              phone: owner.phone
            }))}
            status={listing.status as 'prospeccion' | 'lead' | 'deal'}
            hasKeys={listing.hasKeys ?? false}
            isPublished={listing.isPublished ?? false}
            publishedPlatforms={listing.publishedPlatforms}
            lastUpdated={listing.updatedAt}
          />
        </div> */}

        {/* Galería de imágenes */}
        <div className="pb-8 max-w-3xl mx-auto mb-8">
          <ImageGallery 
            images={processedImages} 
            title={listing.title ?? ""} 
            propertyId={BigInt(listing.propertyId)}
            referenceNumber={listing.referenceNumber ?? ""}
          />
        </div>

        {/* Portal Selection */}
        <div className="pb-8 max-w-4xl mx-auto mb-8">
          <PortalSelection 
            listingId={listing.listingId.toString()}
            fotocasa={listing.fotocasa ?? undefined}
            idealista={listing.idealista ?? undefined}
            habitaclia={listing.habitaclia ?? undefined}
            milanuncios={listing.milanuncios ?? undefined}
          />
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

        {/* Energy Certificate Section */}
        <div className="pb-8 max-w-4xl mx-auto mb-8">
          <EnergyCertificate 
            energyRating={listing.energyCertification || null}
            uploadedDocument={energyCertificate ? {
              docId: energyCertificate.docId,
              documentKey: energyCertificate.documentKey,
              fileUrl: energyCertificate.fileUrl
            } : null}
            propertyId={listing.propertyId}
            userId={listing.agentId || BigInt(1)} // TODO: Get from auth context
            listingId={listing.listingId}
            referenceNumber={listing.referenceNumber || ""}
          />
        </div>
      </div>
    </>
  )
}

