import Image from "next/image";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { Map, Bed, Bath, Square } from "lucide-react";
import { PropertyImagePlaceholder } from "~/components/propiedades/PropertyImagePlaceholder";

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
        "cursor-pointer overflow-hidden border-0 transition-all duration-200 hover:shadow-md",
        isSelected
          ? "bg-amber-50/50 shadow-sm"
          : "hover:bg-gray-50",
      )}
      onClick={() => onClick(listing.listingId, !isSelected)}
    >
      <div className="flex items-center p-2.5 sm:p-3">
        {/* Checkbox */}
        <div className="mr-2 sm:mr-2.5 flex-shrink-0">
          <div
            className={cn(
              "flex h-5 w-5 sm:h-4 sm:w-4 items-center justify-center rounded border-2 transition-colors",
              isSelected ? "border-amber-500 bg-amber-500" : "border-gray-300",
            )}
          >
            {isSelected && <div className="h-2.5 w-2.5 sm:h-2 sm:w-2 rounded-sm bg-white" />}
          </div>
        </div>

        {/* Image */}
        <div className="relative mr-2.5 sm:mr-3 h-14 w-20 sm:h-12 sm:w-16 flex-shrink-0 overflow-hidden rounded">
          {listing.imageUrl &&
           !listing.imageUrl.includes('youtube.com') &&
           !listing.imageUrl.includes('youtu.be') ? (
            <Image
              src={listing.imageUrl}
              alt={listing.title ?? "Property image"}
              fill
              className="object-cover"
            />
          ) : (
            <PropertyImagePlaceholder
              propertyType={listing.propertyType}
              className="h-full w-full rounded"
            />
          )}
          {/* Property Type Badge */}
          <Badge
            variant="outline"
            className="absolute left-0.5 top-0.5 bg-white/90 px-1 py-0.5 text-[10px] sm:text-[9px] z-10 leading-none"
          >
            {getPropertyTypeLabel(listing.propertyType)}
          </Badge>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2 sm:gap-2.5">
            <div className="min-w-0 flex-1 pr-1">
              <h4 className="truncate text-sm sm:text-xs font-semibold leading-tight text-gray-900">
                {listing.title ?? listing.referenceNumber ?? "Sin título"}
              </h4>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-1 text-[11px] sm:text-[10px] text-gray-500">
                {listing.city && (
                  <div className="flex items-center">
                    <Map className="mr-0.5 h-3 w-3 sm:h-2.5 sm:w-2.5 flex-shrink-0" />
                    <span className="truncate">{listing.city}</span>
                  </div>
                )}
                {/* Only show essential property details */}
                {listing.propertyType !== "garaje" &&
                  listing.propertyType !== "solar" &&
                  listing.propertyType !== "local" &&
                  listing.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="mr-0.5 h-3 w-3 sm:h-2.5 sm:w-2.5 flex-shrink-0" />
                      <span>{listing.bedrooms}</span>
                    </div>
                  )}
                {listing.propertyType !== "garaje" &&
                  listing.propertyType !== "solar" &&
                  listing.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="mr-0.5 h-3 w-3 sm:h-2.5 sm:w-2.5 flex-shrink-0" />
                      <span>{Math.floor(Number(listing.bathrooms))}</span>
                    </div>
                  )}
                {listing.squareMeter && (
                  <div className="flex items-center">
                    <Square className="mr-0.5 h-3 w-3 sm:h-2.5 sm:w-2.5 flex-shrink-0" />
                    <span>{listing.squareMeter}m²</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price and Status - Stacked vertically */}
            <div className="flex flex-shrink-0 flex-col items-end min-w-[80px] sm:min-w-[70px]">
              <div className="text-sm sm:text-xs font-bold leading-tight text-gray-900 whitespace-nowrap">
                {formatPrice(listing.price)}€
                {listing.listingType === "Rent" && (
                  <span className="text-[10px] sm:text-[9px] font-normal text-gray-500">
                    /mes
                  </span>
                )}
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "mt-1 sm:mt-0.5 px-1.5 sm:px-1 py-0.5 sm:py-0 text-[10px] sm:text-[9px] whitespace-nowrap leading-none",
                  statusColors[listing.listingType],
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
