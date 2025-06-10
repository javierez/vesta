"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { formatNumber } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { ExternalLink, Pencil, MapPin, ArrowUpDown, Bath, Bed, Square } from "lucide-react"
import Link from "next/link"
import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"
import { useState } from "react"

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
}

interface PropertyTableProps {
  listings: Listing[]
}

const propertyTypeColors: Record<string, string> = {
  piso: "bg-sky-50 text-sky-700 border-sky-200",
  casa: "bg-emerald-50 text-emerald-700 border-emerald-200",
  local: "bg-violet-50 text-violet-700 border-violet-200",
  solar: "bg-amber-50 text-amber-700 border-amber-200",
  garaje: "bg-slate-50 text-slate-700 border-slate-200"
}

const statusColors: Record<string, string> = {
  "for-sale": "bg-amber-50 text-amber-700 border-amber-200",
  "for-rent": "bg-blue-50 text-blue-700 border-blue-200",
  sold: "bg-rose-50 text-rose-700 border-rose-200"
}

const statusLabels: Record<string, string> = {
  "for-sale": "En Venta",
  "for-rent": "En Alquiler",
  sold: "Vendido"
}

export function PropertyTable({ listings }: PropertyTableProps) {
  const [sortField, setSortField] = useState<string | null>(null)

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Propiedad</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Características</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((listing) => (
            <TableRow key={listing.listingId.toString()}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{listing.title}</span>
                  <span className="text-sm text-muted-foreground">{listing.referenceNumber}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={cn("font-normal", propertyTypeColors[listing.propertyType ?? ''])}>
                  {listing.propertyType}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-4">
                  {listing.bedrooms !== null && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Bed className="mr-1 h-4 w-4" />
                      {listing.bedrooms}
                    </div>
                  )}
                  {listing.bathrooms !== null && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Bath className="mr-1 h-4 w-4" />
                      {listing.bathrooms}
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
              <TableCell>
                <Badge variant="secondary" className={cn("font-normal", statusColors[listing.status])}>
                  {statusLabels[listing.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatNumber(Number(listing.price))}€
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/properties/${listing.propertyId}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/properties/${listing.propertyId}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
