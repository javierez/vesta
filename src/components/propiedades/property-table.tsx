"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import type { Property } from "~/lib/data"
import { formatNumber } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { ExternalLink, Pencil, MapPin, ArrowUpDown, Bath, Bed, Square } from "lucide-react"
import Link from "next/link"
import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"
import { useState } from "react"

interface PropertyTableProps {
  properties: Property[]
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

export function PropertyTable({ properties }: PropertyTableProps) {
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-medium text-slate-600">Propiedad</TableHead>
              <TableHead className="font-medium text-slate-600">Ubicación</TableHead>
              <TableHead className="font-medium text-slate-600">Tipo</TableHead>
              <TableHead className="font-medium text-slate-600">Características</TableHead>
              <TableHead className="font-medium text-slate-600">Estado</TableHead>
              <TableHead className="text-right font-medium text-slate-600">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium text-slate-600 hover:text-slate-700"
                  onClick={() => handleSort("price")}
                >
                  Precio
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right font-medium text-slate-600">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.propertyId.toString()} className="group transition-colors hover:bg-slate-50">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-8 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <span className="text-xs text-slate-400">No img</span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900 truncate max-w-[200px]">{property.title}</div>
                      <div className="text-sm text-slate-500 font-mono">{property.referenceNumber}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium">{property.city}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize px-2.5 py-0.5 text-xs font-medium border rounded-full",
                      propertyTypeColors[property.propertyType]
                    )}
                  >
                    {property.propertyType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Square className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-sm">{property.squareMeter}m²</span>
                    </div>
                    {property.bedrooms && (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Bed className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-sm">{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Bath className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-sm">{property.bathrooms}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-2.5 py-0.5 text-xs font-medium border rounded-full",
                      statusColors[property.status]
                    )}
                  >
                    {statusLabels[property.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium text-slate-700">{formatNumber(property.price)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      asChild
                    >
                      <Link href={`/properties/${property.propertyId}`}>
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Ver propiedad</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      asChild
                    >
                      <Link href={`/properties/${property.propertyId}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar propiedad</span>
                      </Link>
                    </Button>
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
