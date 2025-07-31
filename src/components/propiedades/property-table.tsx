"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { formatPrice } from "~/lib/utils";
import { Map, Bath, Bed, Square, User, Building2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ListingOverview } from "~/types/listing";
import { formatListingType } from "../contactos/contact-config";

interface PropertyTableProps {
  listings: ListingOverview[];
}

// Default column widths (in pixels)
const DEFAULT_COLUMN_WIDTHS = {
  imagen: 100,
  propiedad: 250,
  contactos: 180,
  estado: 120,
  precio: 150,
  caracteristicas: 200,
} as const;

// Minimum column widths
const MIN_COLUMN_WIDTHS = {
  imagen: 80,
  propiedad: 150,
  contactos: 120,
  estado: 80,
  precio: 100,
  caracteristicas: 150,
} as const;

const statusColors: Record<string, string> = {
  Sale: "bg-amber-50 text-amber-700 border-amber-200",
  Rent: "bg-amber-50 text-amber-700 border-amber-200",
  Sold: "bg-slate-50 text-slate-700 border-slate-200",
};

export const PropertyTable = React.memo(function PropertyTable({ listings }: PropertyTableProps) {
  const router = useRouter();
  const defaultPlaceholder = "/properties/suburban-dream.png";
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null);

  const handleResizeStart = useCallback(
    (column: string, e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(column);
      resizeStartRef.current = {
        x: e.clientX,
        width: columnWidths[column as keyof typeof columnWidths],
      };
    },
    [columnWidths],
  );

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeStartRef.current) return;

      const deltaX = e.clientX - resizeStartRef.current.x;
      const newWidth = Math.max(
        MIN_COLUMN_WIDTHS[isResizing as keyof typeof MIN_COLUMN_WIDTHS],
        resizeStartRef.current.width + deltaX,
      );

      setColumnWidths((prev) => ({
        ...prev,
        [isResizing]: newWidth,
      }));
    },
    [isResizing],
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(null);
    resizeStartRef.current = null;
  }, []);

  // Global mouse events for resizing
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
      return () => {
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  const getColumnStyle = (column: keyof typeof columnWidths) => ({
    width: `${columnWidths[column]}px`,
    minWidth: `${columnWidths[column]}px`,
    maxWidth: `${columnWidths[column]}px`,
  });

  const ResizeHandle = ({ column }: { column: string }) => (
    <div
      className={cn(
        "absolute right-0 top-0 h-full w-1 cursor-col-resize opacity-0 transition-colors hover:bg-primary/50 hover:opacity-100",
        isResizing === column && "bg-primary opacity-100",
      )}
      onMouseDown={(e) => handleResizeStart(column, e)}
    />
  );

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table ref={tableRef}>
          <TableHeader>
            <TableRow>
              <TableHead className="relative" style={getColumnStyle("imagen")}>
                <div className="truncate">Imagen</div>
                <ResizeHandle column="imagen" />
              </TableHead>
              <TableHead
                className="relative"
                style={getColumnStyle("propiedad")}
              >
                <div className="truncate">Propiedad</div>
                <ResizeHandle column="propiedad" />
              </TableHead>
              <TableHead
                className="relative"
                style={getColumnStyle("contactos")}
              >
                <div className="truncate">Contactos</div>
                <ResizeHandle column="contactos" />
              </TableHead>
              <TableHead className="relative" style={getColumnStyle("estado")}>
                <div className="truncate">Estado</div>
                <ResizeHandle column="estado" />
              </TableHead>
              <TableHead className="relative" style={getColumnStyle("precio")}>
                <div className="truncate text-right">Precio</div>
                <ResizeHandle column="precio" />
              </TableHead>
              <TableHead
                className="relative"
                style={getColumnStyle("caracteristicas")}
              >
                <div className="truncate">Características</div>
                <ResizeHandle column="caracteristicas" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => (
              <TableRow
                key={listing.listingId.toString()}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => router.push(`/propiedades/${listing.listingId}`)}
              >
                <TableCell
                  className="overflow-hidden py-0"
                  style={getColumnStyle("imagen")}
                >
                  <div className="truncate">
                    <div className="relative h-[48px] w-[72px] overflow-hidden rounded-md">
                      <Image
                        src={listing.imageUrl ?? defaultPlaceholder}
                        alt={listing.title ?? "Property image"}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = defaultPlaceholder;
                        }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell
                  className="overflow-hidden"
                  style={getColumnStyle("propiedad")}
                >
                  <div className="truncate">
                    <div className="flex flex-col">
                      <span className="truncate font-medium">
                        {listing.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-light tracking-wide text-muted-foreground">
                          {listing.referenceNumber}
                        </span>
                        {listing.city && (
                          <>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Map className="mr-1 h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{listing.city}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell
                  className="overflow-hidden"
                  style={getColumnStyle("contactos")}
                >
                  <div className="truncate">
                    <div className="flex flex-col gap-1.5">
                      {listing.ownerName && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate text-xs">
                            {listing.ownerName}
                          </span>
                        </div>
                      )}
                      {listing.agentName && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate text-xs">
                            {listing.agentName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell
                  className="overflow-hidden"
                  style={getColumnStyle("estado")}
                >
                  <div className="truncate">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "font-normal",
                        statusColors[listing.listingType],
                      )}
                    >
                      <span className="truncate">
                        {formatListingType(listing.listingType)}
                      </span>
                    </Badge>
                  </div>
                </TableCell>
                <TableCell
                  className="overflow-hidden text-right"
                  style={getColumnStyle("precio")}
                >
                  <div className="truncate font-medium">
                    {formatPrice(listing.price)}€
                    {["Rent", "RentWithOption", "RoomSharing"].includes(
                      listing.listingType,
                    )
                      ? "/mes"
                      : ""}
                  </div>
                </TableCell>
                <TableCell
                  className="overflow-hidden"
                  style={getColumnStyle("caracteristicas")}
                >
                  <div className="truncate">
                    <div className="flex items-center space-x-4">
                      {listing.propertyType !== "local" &&
                        listing.propertyType !== "garaje" &&
                        listing.bedrooms !== null && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Bed className="mr-1 h-4 w-4 flex-shrink-0" />
                            <span>{listing.bedrooms}</span>
                          </div>
                        )}
                      {listing.propertyType !== "local" &&
                        listing.propertyType !== "garaje" &&
                        listing.bathrooms !== null && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Bath className="mr-1 h-4 w-4 flex-shrink-0" />
                            <span>{Math.floor(Number(listing.bathrooms))}</span>
                          </div>
                        )}
                      {listing.squareMeter !== null && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Square className="mr-1 h-4 w-4 flex-shrink-0" />
                          <span>{listing.squareMeter}m²</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
})
