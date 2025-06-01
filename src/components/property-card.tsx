"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent, CardFooter } from "~/components/ui/card"
import { Bed, Bath, SquareIcon as SquareFoot, MapPin, Building } from "lucide-react"
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

  // For secondary image, use the second image from the array or fall back to primary image
  const secondaryImage = property.images?.[1]?.url ?? primaryImage

  // Format numbers consistently to avoid hydration issues
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num)
  }

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
        <Badge className="absolute top-2 right-2 z-10 text-sm">
          {property.status === "for-sale" ? "En Venta" : property.status === "for-rent" ? "En Alquiler" : "Vendido"}
        </Badge>
        <Badge variant="outline" className="absolute top-2 left-2 z-10 bg-white/80 text-sm">
          {getPropertyTypeLabel(property.propertyType)}
        </Badge>
        {property.isBankOwned && (
          <Badge variant="secondary" className="absolute bottom-2 left-2 z-10 bg-amber-500 text-white text-sm">
            Piso de Banco
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <Link href={`/propiedades/${property.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
          </Link>
          <p className="font-bold text-lg">
            {formatNumber(property.price)}€{property.status === "for-rent" ? "/mes" : ""}
          </p>
        </div>

        <div className="flex items-center text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <p className="text-sm line-clamp-1">
            {property.address}, {property.city}, {property.state} {property.zipCode}
          </p>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{property.description}</p>

        <div className="flex justify-between">
          {property.propertyType !== "solar" &&
            property.propertyType !== "garaje" &&
            property.propertyType !== "local" && (
              <>
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {property.bedrooms} {property.bedrooms === 1 ? "Hab" : "Habs"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {property.bathrooms} {property.bathrooms === 1 ? "Baño" : "Baños"}
                  </span>
                </div>
              </>
            )}
          <div className="flex items-center">
            <SquareFoot className="h-4 w-4 mr-1" />
            <span className="text-sm">{formatNumber(property.squareFeet)} m²</span>
          </div>
        </div>

        <div className="mt-3 flex items-center text-xs text-muted-foreground">
          <Building className="h-3 w-3 mr-1" />
          <span>Ref: {property.reference}</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link
          href={`/propiedades/${property.id}`}
          className="text-sm font-medium text-primary hover:underline w-full text-center"
        >
          Ver Detalles
        </Link>
      </CardFooter>
    </Card>
  )
}
