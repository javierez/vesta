'use client'

import { MapPin, Heart } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { formatPrice } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

interface PropertyHeaderProps {
  title: string
  street: string
  city: string
  province: string
  postalCode: string
  referenceNumber: string
  price: string
  listingType: 'Sale' | 'Rent' | 'Sold'
  isBankOwned?: boolean
  isFeatured?: boolean
}

export function PropertyHeader({
  title,
  street,
  city,
  province,
  postalCode,
  referenceNumber,
  price,
  listingType,
  isBankOwned = false,
  isFeatured = false
}: PropertyHeaderProps) {
  return (
    <div className="py-3 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">{title}</h1>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-16 w-16 p-0 hover:bg-transparent group",
                isFeatured && "text-red-500"
              )}
            >
              <Heart className={cn(
                "h-16 w-16 transition-colors",
                isFeatured ? "fill-current" : "text-muted-foreground group-hover:text-red-500"
              )} />
            </Button>
            {isBankOwned && (
              <Badge variant="secondary" className="bg-amber-500 text-white">
                Piso de Banco
              </Badge>
            )}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <p>
              {street}, {city}, {province} {postalCode}
            </p>
            {referenceNumber && (
              <>
                <span className="mx-6 text-muted-foreground">•</span>
                <span className="text-muted-foreground tracking-wide">
                  #{referenceNumber}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col md:items-end">
          <div className="text-3xl font-bold">
            {formatPrice(price)}€{listingType === "Rent" ? "/mes" : ""}
          </div>
          <Badge className="mt-1">
            {listingType === "Sale"
              ? "En Venta"
              : listingType === "Rent"
                ? "En Alquiler"
                : "Vendido"}
          </Badge>
        </div>
      </div>
    </div>
  )
}
