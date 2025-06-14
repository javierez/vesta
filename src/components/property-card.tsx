"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent, CardFooter } from "~/components/ui/card"
import { Bed, Bath, SquareIcon as SquareFoot, MapPin, Hash, User } from "lucide-react"
import { Button } from "~/components/ui/button"
import { handleImageError } from "~/lib/images"
import { formatPrice } from "~/lib/utils"

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
  agentName: string | null
  
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
  imageUrl2: string | null
  s3key2: string | null
}

interface PropertyCardProps {
  listing: Listing
}

export function PropertyCard({ listing }: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [image2Loaded, setImage2Loaded] = useState(false)

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
  const [imageSrc, setImageSrc] = useState(
    listing.imageUrl || defaultPlaceholder
  )
  const [imageSrc2, setImageSrc2] = useState(
    listing.imageUrl2 || defaultPlaceholder
  )

  // Debug: Log the image URLs
  useEffect(() => {
    console.log('Image URL 1:', listing.imageUrl)
    console.log('Image URL 2:', listing.imageUrl2)
    console.log('Current src 1:', imageSrc)
    console.log('Current src 2:', imageSrc2)
  }, [listing.imageUrl, listing.imageUrl2, imageSrc, imageSrc2])

  const onImageError = () => {
    console.log('Image failed to load:', imageSrc)
    setImageSrc(defaultPlaceholder)
  }

  const onImage2Error = () => {
    console.log('Image 2 failed to load:', imageSrc2)
    setImageSrc2(defaultPlaceholder)
  }

  // Format numbers consistently to avoid hydration issues
  const formatNumber = (num: string) => {
    return new Intl.NumberFormat('es-ES').format(parseFloat(num))
  }

  return (
    <Link href={`/propiedades/${listing.propertyId.toString()}`} className="block">
      <Card
        className="overflow-hidden transition-all hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-[4/3] relative overflow-hidden">
          <div className="relative w-full h-full">
            {/* First Image */}
            <Image
              src={imageSrc}
              alt={listing.title || "Property image"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-opacity duration-300 ${
                isHovered ? "opacity-0" : "opacity-100"
              } ${(imageSrc === defaultPlaceholder || listing.status === "Sold" || listing.status === "Vendido") ? "grayscale" : ""}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={onImageError}
              quality={85}
            />
            {/* Second Image */}
            <Image
              src={imageSrc2}
              alt={listing.title || "Property image"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              } ${(imageSrc2 === defaultPlaceholder || listing.status === "Sold" || listing.status === "Vendido") ? "grayscale" : ""}`}
              loading="lazy"
              onLoad={() => setImage2Loaded(true)}
              onError={onImage2Error}
              quality={85}
            />
            {(!imageLoaded || !image2Loaded) && <div className="absolute inset-0 bg-muted animate-pulse" />}
          </div>
          {/* Top Left - Property Type */}
          <Badge variant="outline" className="absolute top-2 left-2 z-10 bg-white/80 text-sm">
            {getPropertyTypeLabel(listing.propertyType)}
          </Badge>
          
          {/* Top Right - Status */}
          <Badge className="absolute top-2 right-2 z-10 text-sm">
            {listing.listingType === "Sale" ? "En Venta" : listing.listingType === "Rent" ? "En Alquiler" : "Vendido"}
          </Badge>
          
          {/* Bottom Center - Reference Number */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-10">
            <span className="text-[10px] font-semibold tracking-widest text-white/90">
              {listing.referenceNumber}
            </span>
          </div>
          
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
              {formatPrice(listing.price)}€{listing.listingType === "Rent" ? "/mes" : ""}
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
        <CardFooter className="p-3 pt-2 relative border-t border-border/40">
          <div className="flex items-center gap-1.5 group cursor-pointer transition-all">
            <User className="h-3 w-3 text-muted-foreground/80 transition-all group-hover:text-primary group-hover:scale-110" />
            <p className="text-xs text-muted-foreground/80 font-light transition-all group-hover:font-bold group-hover:text-primary group-hover:underline">
              {listing.agentName}
            </p>
          </div>
          <Button 
            variant="ghost"
            size="icon"
            className="absolute right-1 bottom-1 h-8 w-8 text-muted-foreground/80 group hover:bg-transparent mr-2"
          >
            <Image src="/logos/whatsapp.png" alt="WhatsApp" width={20} height={20} className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
