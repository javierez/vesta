'use client'

import { MapPin } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { formatPrice } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { generatePropertyTitle } from "~/components/propiedades/form/common/property-title"

interface PropertyHeaderProps {
  propertyType: string
  street: string
  city: string
  province: string
  postalCode: string
  referenceNumber: string
  price: string
  listingType: 'Sale' | 'Rent' | 'Sold'
  isBankOwned?: boolean
  isFeatured?: boolean
  neighborhood?: string
}

export function PropertyHeader({
  propertyType,
  street,
  city,
  province,
  postalCode,
  referenceNumber,
  price,
  listingType,
  isBankOwned = false,
  isFeatured = false,
  neighborhood = ''
}: PropertyHeaderProps) {
  const title = generatePropertyTitle(propertyType, street, neighborhood)

  return (
    <div className="py-3 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">{title}</h1>
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
