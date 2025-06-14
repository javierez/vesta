'use client'

import { MapPin } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { formatPrice } from "~/lib/utils"

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
  isBankOwned = false
}: PropertyHeaderProps) {
  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{title}</h1>
            {isBankOwned && (
              <Badge variant="secondary" className="bg-amber-500 text-white">
                Piso de Banco
              </Badge>
            )}
          </div>
          <div className="flex items-center mt-2 text-muted-foreground">
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
