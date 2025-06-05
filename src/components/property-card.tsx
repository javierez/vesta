"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent, CardFooter } from "~/components/ui/card"
import { Bed, Bath, SquareIcon as SquareFoot, MapPin, Building, User, Hash } from "lucide-react"
import { Button } from "~/components/ui/button"
import type { Property } from "~/lib/data"

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const getPropertyTypeLabel = (type: string) => {
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
      case "house":
        return "Casa"
      case "apartment":
        return "Piso"
      case "condo":
        return "Piso"
      case "commercial":
        return "Local"
      default:
        return type
    }
  }

  // Get primary and secondary images with proper fallbacks
  const defaultPlaceholder = "/properties/suburban-dream.png"
  const primaryImage = property.imageUrl && property.imageUrl !== "" ? property.imageUrl : defaultPlaceholder
  const secondaryImage = property.images?.[1]?.url ?? primaryImage

  // Format numbers consistently to avoid hydration issues
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num)
  }

  // Extract street from address
  const street = property.address.split(',')[0]

  return (
    <Card
      className="overflow-hidden transition-all hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <Link href={`/propiedades/${property.id}`}>
          <div className="relative w-full h-full">
            <Image
              src={primaryImage || "/placeholder.svg"}
              alt={property.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-opacity duration-300 ${isHovered ? "opacity-0" : "opacity-100"}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
            <Image
              src={secondaryImage || "/placeholder.svg"}
              alt={`${property.title} - Vista alternativa`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
            />
            {!imageLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
          </div>
        </Link>
        {/* Top Left - Property Type */}
        <Badge variant="outline" className="absolute top-2 left-2 z-10 bg-white/80 text-sm">
          {getPropertyTypeLabel(property.propertyType)}
        </Badge>
        
        {/* Top Right - Status */}
        <Badge className="absolute top-2 right-2 z-10 text-sm">
          {property.status === "for-sale" ? "En Venta" : property.status === "for-rent" ? "En Alquiler" : "Vendido"}
        </Badge>
        
        {/* Bottom Left - Owner */}
        <Badge variant="secondary" className="absolute bottom-2 left-2 z-10 bg-blue-500/80 text-white text-sm">
          <User className="h-3 w-3 mr-1" />
          {property.owner || "Propietario"}
        </Badge>
        
        {/* Bottom Right - Reference or Bank Owned */}
        {property.isBankOwned ? (
          <Badge variant="secondary" className="absolute bottom-2 right-2 z-10 bg-amber-500 text-white text-sm">
            Piso de Banco
          </Badge>
        ) : (
          <Badge variant="secondary" className="absolute bottom-2 right-2 z-10 bg-black text-white text-sm">
            <Hash className="h-3 w-3 mr-1" />
            {property.reference}
          </Badge>
        )}
      </div>

      <CardContent className="p-3">
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-base line-clamp-1">{street}</h3>
          </div>
          <p className="font-bold text-base">
            {formatNumber(property.price)}€{property.status === "for-rent" ? "/mes" : ""}
          </p>
        </div>

        <div className="flex items-center text-muted-foreground mb-2">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <p className="text-xs line-clamp-1">
            {property.city}, {property.state}
          </p>
        </div>

        <div className="flex justify-between text-xs">
          {property.propertyType !== "solar" &&
            property.propertyType !== "garaje" &&
            property.propertyType !== "local" && (
              <>
                <div className="flex items-center">
                  <Bed className="h-3.5 w-3.5 mr-1" />
                  <span>{property.bedrooms} {property.bedrooms === 1 ? "Hab" : "Habs"}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-3.5 w-3.5 mr-1" />
                  <span>{property.bathrooms} {property.bathrooms === 1 ? "Baño" : "Baños"}</span>
                </div>
              </>
            )}
          <div className="flex items-center">
            <SquareFoot className="h-3.5 w-3.5 mr-1" />
            <span>{formatNumber(property.squareFeet)} m²</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex gap-2">
        <Button asChild variant="outline" className="flex-1 text-xs">
          <Link href={`/propiedades/${property.id}`}>
            VIEW
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 text-xs">
          <Link href={`/propiedades/${property.id}/edit`}>
            EDIT
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
