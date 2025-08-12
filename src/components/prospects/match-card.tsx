"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Bed,
  Bath,
  Square as SquareIcon,
  MapPin,
  User,
  X,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import type { ProspectMatch, MatchAction } from "~/types/connection-matches";
import { formatPrice } from "~/lib/utils";

interface MatchCardProps {
  match: ProspectMatch;
  onAction?: (action: MatchAction, match: ProspectMatch) => Promise<void>;
  showActions?: boolean;
}

export const MatchCard = React.memo(function MatchCard({
  match,
  onAction,
  showActions = true,
}: MatchCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<MatchAction | null>(
    null,
  );

  const { listing, matchType, toleranceReasons, isCrossAccount, canContact } =
    match;

  // Default placeholder image
  const defaultPlaceholder =
    "https://vesta-configuration-files.s3.amazonaws.com/default-property.jpg";
  const imageSrc = defaultPlaceholder; // TODO: Add actual image URLs from listing

  const getPropertyTypeLabel = (type: string | null) => {
    switch (type) {
      case "piso":
        return "Piso";
      case "casa":
        return "Casa";
      case "local":
        return "Local";
      case "garaje":
        return "Garaje";
      default:
        return type ?? "Propiedad";
    }
  };

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case "Sale":
        return "Venta";
      case "Rent":
        return "Alquiler";
      default:
        return type;
    }
  };

  const getMatchTypeBadge = () => {
    if (matchType === "strict") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Coincidencia Exacta
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
          <AlertCircle className="mr-1 h-3 w-3" />
          Coincidencia Aproximada
        </Badge>
      );
    }
  };

  const handleAction = async (action: MatchAction) => {
    if (!onAction) return;

    setIsActionLoading(action);
    try {
      await onAction(action, match);
    } finally {
      setIsActionLoading(null);
    }
  };

  const renderContent = () => (
    <Card
      className="overflow-hidden transition-all hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={imageSrc}
          alt={listing.properties.propertyType ?? "Property image"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-all duration-300 ${isHovered ? 'blur-sm scale-105' : ''}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          quality={85}
        />
        
        {/* Hover Action Buttons - Center of image */}
        {showActions && isHovered && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 backdrop-blur-[1px]">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 hover:scale-110"
                onClick={(e) => {
                  e.preventDefault();
                  void handleAction("contact");
                }}
                disabled={isActionLoading !== null}
                title="Enviar mensaje"
              >
                <Mail
                  className={`h-5 w-5 text-gray-700 ${isActionLoading === "contact" ? "animate-pulse" : ""}`}
                />
              </Button>

              <Button
                variant="secondary"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 hover:scale-110"
                onClick={(e) => {
                  e.preventDefault();
                  void handleAction("contact");
                }}
                disabled={isActionLoading !== null}
                title="Llamar"
              >
                <Phone
                  className={`h-5 w-5 text-gray-700 ${isActionLoading === "contact" ? "animate-pulse" : ""}`}
                />
              </Button>

              <Button
                variant="secondary"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 hover:scale-110"
                onClick={(e) => {
                  e.preventDefault();
                  void handleAction("dismiss");
                }}
                disabled={isActionLoading !== null}
                title="Descartar"
              >
                <X
                  className={`h-5 w-5 text-gray-700 ${isActionLoading === "dismiss" ? "animate-pulse" : ""}`}
                />
              </Button>
            </div>
          </div>
        )}
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}

        {/* Top Left - Property Type */}
        <Badge
          variant="outline"
          className="absolute left-2 top-2 z-10 bg-white/80 text-sm"
        >
          {getPropertyTypeLabel(listing.properties.propertyType)}
        </Badge>

        {/* Top Right - Listing Type */}
        <Badge className="absolute right-2 top-2 z-10 text-sm">
          {getListingTypeLabel(listing.listings.listingType)}
        </Badge>

        {/* Bottom Center - Match Type */}
        <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2">
          {getMatchTypeBadge()}
        </div>

        {/* Cross-account indicator */}
        {isCrossAccount && (
          <Badge
            variant="secondary"
            className="absolute bottom-2 right-2 z-10 bg-blue-500 text-sm text-white"
          >
            Cuenta Externa
          </Badge>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-3">
        {/* Price and Location */}
        <div className="mb-1 flex items-start justify-between">
          <div>
            <p className="text-base font-bold">
              {formatPrice(listing.listings.price)}€
              {listing.listings.listingType === "Rent" ? "/mes" : ""}
            </p>
          </div>
        </div>

        <div className="mb-2 flex items-center text-muted-foreground">
          <MapPin className="mr-1 h-3.5 w-3.5" />
          <p className="line-clamp-1 text-xs">
            {listing.locations.neighborhood}
          </p>
        </div>

        {/* Property Features */}
        <div className="flex justify-between text-xs">
          {listing.properties.propertyType !== "garaje" &&
            listing.properties.propertyType !== "local" && (
              <>
                {listing.properties.bedrooms && (
                  <div className="flex items-center">
                    <Bed className="mr-1 h-3.5 w-3.5" />
                    <span>
                      {listing.properties.bedrooms}{" "}
                      {listing.properties.bedrooms === 1 ? "Hab" : "Habs"}
                    </span>
                  </div>
                )}
                {listing.properties.bathrooms && (
                  <div className="flex items-center">
                    <Bath className="mr-1 h-3.5 w-3.5" />
                    <span>
                      {Math.floor(Number(listing.properties.bathrooms))}{" "}
                      {Math.floor(Number(listing.properties.bathrooms)) === 1
                        ? "Baño"
                        : "Baños"}
                    </span>
                  </div>
                )}
              </>
            )}
          {listing.properties.squareMeter && (
            <div className="flex items-center">
              <SquareIcon className="mr-1 h-3.5 w-3.5" />
              <span>{listing.properties.squareMeter} m²</span>
            </div>
          )}
        </div>

        {/* Tolerance Reasons */}
        {toleranceReasons.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Tolerancias aplicadas:
            </p>
            {toleranceReasons.map((reason, index) => (
              <Badge key={index} variant="outline" className="mr-1 text-xs">
                {reason}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      {/* Footer with Contact Connection */}
      <CardFooter className="border-t border-border/40 p-3 pt-2">
        <div className="flex w-full items-center justify-between">
          {/* Left - Property Owner Contact */}
          <div className="flex items-center gap-1">
            <KeyRound className="h-3 w-3 text-muted-foreground/80" />
            <span className="text-xs text-muted-foreground/80">
              {isCrossAccount && !canContact
                ? "Contacto disponible tras solicitud"
                : listing.ownerContact
                  ? `${listing.ownerContact.firstName} ${listing.ownerContact.lastName}`
                  : "Sin contacto"}
            </span>
          </div>

          {/* Center - Connection Arrow */}
          <div className="flex items-center">
            <div className="relative flex items-center">
              {/* Arrow line */}
              <div className="w-6 h-0.5 bg-gray-400 animate-pulse"></div>
              {/* Left arrowhead */}
              <div className="absolute -left-1 w-0 h-0 border-t-[3px] border-b-[3px] border-r-[4px] border-t-transparent border-b-transparent border-r-gray-400"></div>
              {/* Right arrowhead */}
              <div className="absolute -right-1 w-0 h-0 border-t-[3px] border-b-[3px] border-l-[4px] border-t-transparent border-b-transparent border-l-gray-400"></div>
            </div>
          </div>

          {/* Right - Prospect Contact */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground/80">
              {match.prospect.contacts.firstName} {match.prospect.contacts.lastName}
            </span>
            <User className="h-3 w-3 text-muted-foreground/80" />
          </div>
        </div>
      </CardFooter>
    </Card>
  );

  // Wrap in link only if not cross-account or if user can access
  if (canContact) {
    return (
      <Link
        href={`/propiedades/${listing.listings.id.toString()}`}
        className="block"
      >
        {renderContent()}
      </Link>
    );
  }

  return renderContent();
});
