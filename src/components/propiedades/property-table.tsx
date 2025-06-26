"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { formatPrice } from "~/lib/utils"
import { Map, Bath, Bed, Square, User, Building2 } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { ListingOverview } from "~/types/listing"

interface PropertyTableProps {
  listings: ListingOverview[]
}

const statusColors: Record<string, string> = {
  "Sale": "bg-amber-50 text-amber-700 border-amber-200",
  "Rent": "bg-amber-50 text-amber-700 border-amber-200",
  "Sold": "bg-slate-50 text-slate-700 border-slate-200"
}

const statusLabels: Record<string, string> = {
  "Sale": "En Venta",
  "Rent": "En Alquiler",
  "Sold": "Vendido"
}

export function PropertyTable({ listings }: PropertyTableProps) {
  const router = useRouter()
  const defaultPlaceholder = "/properties/suburban-dream.png"

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

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] min-w-[100px]">Imagen</TableHead>
              <TableHead className="w-[250px] min-w-[250px]">Propiedad</TableHead>
              <TableHead className="w-[180px] min-w-[180px]">Contactos</TableHead>
              <TableHead className="w-[120px] min-w-[120px]">Estado</TableHead>
              <TableHead className="w-[150px] min-w-[150px] text-right">Precio</TableHead>
              <TableHead className="w-[200px] min-w-[200px]">Características</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => (
              <TableRow 
                key={listing.listingId.toString()}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/propiedades/${listing.listingId}`)}
              >
                <TableCell className="w-[100px] min-w-[100px] py-0">
                  <div className="relative w-[72px] h-[48px] rounded-md overflow-hidden">
                    <Image
                      src={listing.imageUrl || defaultPlaceholder}
                      alt={listing.title || "Property image"}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = defaultPlaceholder;
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell className="w-[250px] min-w-[250px]">
                  <div className="flex flex-col">
                    <span className="font-medium truncate">{listing.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs tracking-wide font-light text-muted-foreground">{listing.referenceNumber}</span>
                      {listing.city && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Map className="h-3 w-3 mr-1" />
                            {listing.city}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="w-[180px] min-w-[180px]">
                  <div className="flex flex-col gap-1.5">
                    {listing.ownerName && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span className="text-xs truncate">{listing.ownerName}</span>
                      </div>
                    )}
                    {listing.agentName && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="text-xs truncate">{listing.agentName}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="w-[120px] min-w-[120px]">
                  <Badge variant="secondary" className={cn("font-normal", statusColors[listing.listingType])}>
                    {statusLabels[listing.listingType]}
                  </Badge>
                </TableCell>
                <TableCell className="w-[150px] min-w-[150px] text-right font-medium">
                  {formatPrice(listing.price)}€{listing.listingType === "Rent" ? "/mes" : ""}
                </TableCell>
                <TableCell className="w-[200px] min-w-[200px]">
                  <div className="flex items-center space-x-4">
                    {listing.propertyType !== "local" && listing.propertyType !== "garaje" && listing.bedrooms !== null && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Bed className="mr-1 h-4 w-4" />
                        {listing.bedrooms}
                      </div>
                    )}
                    {listing.propertyType !== "local" && listing.propertyType !== "garaje" && listing.bathrooms !== null && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Bath className="mr-1 h-4 w-4" />
                        {Math.floor(Number(listing.bathrooms))}
                      </div>
                    )}
                    {listing.squareMeter !== null && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Square className="mr-1 h-4 w-4" />
                        {listing.squareMeter}m²
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
