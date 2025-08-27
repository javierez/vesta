import Image from "next/image";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { Search, Map, Bed, Bath, Square, Filter } from "lucide-react";

interface CompactPropertyCardProps {
  listing: {
    listingId: bigint;
    title: string | null;
    referenceNumber: string | null;
    price: string;
    listingType: string;
    propertyType: string | null;
    bedrooms: number | null;
    bathrooms: string | null;
    squareMeter: number | null;
    city: string | null;
    imageUrl: string | null;
  };
  isSelected: boolean;
  onClick: (listingId: bigint, selected: boolean) => void;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
  getPropertyTypeLabel: (type: string | null) => string | null;
  formatPrice: (price: string) => string;
}

export function CompactPropertyCard({
  listing,
  isSelected,
  onClick,
  statusColors,
  statusLabels,
  getPropertyTypeLabel,
  formatPrice,
}: CompactPropertyCardProps) {
  return (
    <Card
      key={listing.listingId.toString()}
      className={cn(
        "cursor-pointer overflow-hidden border transition-all duration-200 hover:shadow-md",
        isSelected
          ? "border-amber-300 bg-amber-50/50 shadow-sm"
          : "border-gray-200 hover:border-gray-300"
      )}
      onClick={() => onClick(listing.listingId, !isSelected)}
    >
      <div className="flex items-center p-2">
        {/* Checkbox */}
        <div className="mr-1.5 flex-shrink-0">
          <div
            className={cn(
              "flex h-3.5 w-3.5 items-center justify-center rounded border-2 transition-colors",
              isSelected
                ? "border-amber-500 bg-amber-500"
                : "border-gray-300"
            )}
          >
            {isSelected && (
              <div className="h-1.5 w-1.5 rounded-sm bg-white" />
            )}
          </div>
        </div>
        
        {/* Image */}
        <div className="relative mr-1.5 h-10 w-14 flex-shrink-0 overflow-hidden rounded">
          <Image
            src={
              listing.imageUrl ??
              "/properties/suburban-dream.png"
            }
            alt={listing.title ?? "Property image"}
            fill
            className="object-cover"
          />
          {/* Property Type Badge */}
          <Badge
            variant="outline"
            className="absolute left-0.5 top-0.5 bg-white/90 px-0.5 py-0 text-[9px]"
          >
            {getPropertyTypeLabel(listing.propertyType)}
          </Badge>
        </div>
        
        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-xs font-semibold text-gray-900 leading-tight">
                {listing.title || listing.referenceNumber || "Sin título"}
              </h4>
              <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                {listing.city && (
                  <div className="flex items-center">
                    <Map className="mr-0.5 h-2.5 w-2.5" />
                    <span>{listing.city}</span>
                  </div>
                )}
                {/* Only show essential property details */}
                {listing.propertyType !== "garaje" &&
                  listing.propertyType !== "solar" &&
                  listing.propertyType !== "local" &&
                  listing.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="mr-0.5 h-2.5 w-2.5" />
                      <span>{listing.bedrooms}</span>
                    </div>
                )}
                {listing.propertyType !== "garaje" &&
                  listing.propertyType !== "solar" &&
                  listing.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="mr-0.5 h-2.5 w-2.5" />
                      <span>{Math.floor(Number(listing.bathrooms))}</span>
                    </div>
                )}
                {listing.squareMeter && (
                  <div className="flex items-center">
                    <Square className="mr-0.5 h-2.5 w-2.5" />
                    <span>{listing.squareMeter}m²</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Price and Status - Stacked vertically */}
            <div className="flex flex-shrink-0 flex-col items-end">
              <div className="text-xs font-bold text-gray-900 leading-tight">
                {formatPrice(listing.price)}€
                {listing.listingType === "Rent" && (
                  <span className="text-[9px] font-normal text-gray-500">/mes</span>
                )}
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "mt-0.5 px-1 py-0 text-[9px]",
                  statusColors[listing.listingType]
                )}
              >
                {statusLabels[listing.listingType]}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}