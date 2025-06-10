"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent, CardFooter } from "~/components/ui/card"
import { Bed, Bath, SquareIcon as SquareFoot, MapPin, Hash } from "lucide-react"
import { Button } from "~/components/ui/button"

type Listing = {
  // Listing fields
  listingId: bigint
  propertyId: bigint
  price: string
  status: string
  listingType: string
  isActive: boolean | null
  isFeatured: boolean | null
  isBankOwned: boolean | null
  viewCount: number | null
  inquiryCount: number | null
  
  // Property fields
  referenceNumber: string | null
  title: string | null
  propertyType: string | null
  bedrooms: number | null
  bathrooms: string | null
  squareMeter: number | null
  street: string | null
  addressDetails: string | null
  postalCode: string | null
  latitude: string | null
  longitude: string | null
  
  // Location fields
  city: string | null
  province: string | null
  municipality: string | null
  neighborhood: string | null

  // Image fields
  imageUrl: string | null
  s3key: string | null
}

interface PropertyCardProps {
  listing: Listing
}

export function PropertyCard({ listing }: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const getPropertyTypeLabel = (type: string | null) => {
    switch (type) {
      case "piso":
        return "Piso"
      case "casa":
        return "Casa"
      case "local":
        return "Local"
      case "solar":
        return "Solar"
      case "garaje":
        return "Garaje"
      default:
        return type
    }
  }

  // Get primary image with proper fallback
  const defaultPlaceholder = "/properties/suburban-dream.png"
  const primaryImage = listing.imageUrl || defaultPlaceholder

  // Format numbers consistently to avoid hydration issues
  const formatNumber = (num: string) => {
    return new Intl.NumberFormat('es-ES').format(parseFloat(num))
  }

  return (
    <Card
      className="overflow-hidden transition-all hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <Link href={`/propiedades/${listing.propertyId.toString()}`}>
          <div className="relative w-full h-full">
            <Image
              src={primaryImage}
              alt={listing.title ?? "Property"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-opacity duration-300 ${isHovered ? "opacity-0" : "opacity-100"}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
          </div>
        </Link>
        {/* Top Left - Property Type */}
        <Badge variant="outline" className="absolute top-2 left-2 z-10 bg-white/80 text-sm">
          {getPropertyTypeLabel(listing.propertyType)}
        </Badge>
        
        {/* Top Right - Status */}
        <Badge className="absolute top-2 right-2 z-10 text-sm">
          {listing.status === "for-sale" ? "En Venta" : listing.status === "for-rent" ? "En Alquiler" : "Vendido"}
        </Badge>
        
        {/* Bottom Left - Reference Number */}
        <Badge variant="secondary" className="absolute bottom-2 left-2 z-10 bg-blue-500/80 text-white text-sm">
          <Hash className="h-3 w-3 mr-1" />
          {listing.referenceNumber}
        </Badge>
        
        {/* Bottom Right - Bank Owned */}
        {listing.isBankOwned && (
          <Badge variant="secondary" className="absolute bottom-2 right-2 z-10 bg-amber-500 text-white text-sm">
            Piso de Banco
          </Badge>
        )}
      </div>

      <CardContent className="p-3">
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-base line-clamp-1">{listing.street}</h3>
          </div>
          <p className="font-bold text-base">
            {formatNumber(listing.price)}€{listing.status === "for-rent" ? "/mes" : ""}
          </p>
        </div>

        <div className="flex items-center text-muted-foreground mb-2">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <p className="text-xs line-clamp-1">
            {listing.city}, {listing.province}
          </p>
        </div>

        <div className="flex justify-between text-xs">
          {listing.propertyType !== "solar" &&
            listing.propertyType !== "garaje" &&
            listing.propertyType !== "local" && (
              <>
                <div className="flex items-center">
                  <Bed className="h-3.5 w-3.5 mr-1" />
                  <span>{listing.bedrooms} {listing.bedrooms === 1 ? "Hab" : "Habs"}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-3.5 w-3.5 mr-1" />
                  <span>{Math.floor(Number(listing.bathrooms))} {Math.floor(Number(listing.bathrooms)) === 1 ? "Baño" : "Baños"}</span>
                </div>
              </>
            )}
          <div className="flex items-center">
            <SquareFoot className="h-3.5 w-3.5 mr-1" />
            <span>{listing.squareMeter} m²</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex gap-2">
        <Button asChild variant="outline" className="flex-1 text-xs">
          <Link href={`/propiedades/${listing.propertyId.toString()}`}>
            VER
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 text-xs">
          <Link href={`/propiedades/${listing.propertyId.toString()}/edit`}>
            EDITAR
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
