"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Bed,
  Bath,
  Square as SquareIcon,
  MapPin,
  User,
  X,
  Mail,
  CheckCircle,
  AlertCircle,
  KeyRound,
  Euro,
  Link as LinkIcon,
} from "lucide-react";
import type { ProspectMatch, MatchAction } from "~/types/connection-matches";
import { formatPrice, cn } from "~/lib/utils";
import { PropertyImagePlaceholder } from "~/components/propiedades/PropertyImagePlaceholder";

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<MatchAction | null>(
    null,
  );

  const { listing, matchType, toleranceReasons, isCrossAccount, canContact } =
    match;

  // Debug logs
  console.log('🔍 MatchCard - Full listing object:', listing);
  console.log('🏠 MatchCard - Properties object:', listing.properties);
  console.log('📝 MatchCard - Property title:', listing.properties.title);
  console.log('🏷️ MatchCard - Property type:', listing.properties.propertyType);

  const defaultPlaceholder = "";
  const imageSrc = defaultPlaceholder; // TODO: Add imageUrl when available in ListingWithDetails type

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
      case "RentWithOption":
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
    <Card className="overflow-hidden border-0 shadow-md transition-all hover:shadow-lg">
      {/* Centered Content */}
      <div className="p-2 text-center">
        {/* First Row - Price and Property Labels - Centered */}
        <div className="flex items-center justify-center gap-2 mb-1">
          {/* Price - Most Important */}
          <p className="text-base font-bold">
            {formatPrice(listing.listings.price)}€
            {listing.listings.listingType === "Rent" ? "/mes" : ""}
          </p>
          
          {/* Property Type Badges */}
          <div className="flex gap-1">
            {/* Property Type */}
            <Badge variant="outline" className="text-xs px-1 py-0">
              {getPropertyTypeLabel(listing.properties.propertyType)}
            </Badge>
            
            {/* Listing Type */}
            <Badge className="text-xs px-1 py-0">
              {getListingTypeLabel(listing.listings.listingType)}
            </Badge>
            
            {/* Cross-account indicator */}
            {isCrossAccount && (
              <Badge variant="secondary" className="bg-blue-500 text-xs text-white px-1 py-0">
                Externa
              </Badge>
            )}
          </div>
        </div>
        
        {/* Second Row - Property Title */}
        <div className="mb-1">
          <p className="text-sm font-medium text-gray-700 truncate">
            {listing.properties.title || "Propiedad sin título"}
          </p>
        </div>
        
        {/* Third Row - Match Type */}
        <div className="mb-2">
          {getMatchTypeBadge()}
        </div>
        
        {/* Fourth Row - Properties Box */}
        <div className="group relative mx-auto w-4/5 rounded-md bg-gradient-to-br from-slate-50 to-gray-100 p-1 shadow-sm mb-2">
          <div className="grid grid-cols-2 gap-0 text-xs">
            {/* Price */}
            <div className="flex items-center justify-center gap-0.5 text-gray-700">
              <Euro className="h-3 w-3" />
              <span>
                {listing.listings.listingType === "Sale"
                  ? `${Math.round(parseFloat(listing.listings.price) / 1000)}k`
                  : parseFloat(listing.listings.price).toLocaleString()}
              </span>
            </div>

            {/* Bedrooms */}
            {listing.properties.propertyType !== "garaje" &&
              listing.properties.propertyType !== "local" && (
                <div className="flex items-center justify-center gap-0.5 text-gray-700">
                  <Bed className="h-3 w-3" />
                  <span>{listing.properties.bedrooms || "-"}</span>
                </div>
              )}
            
            {/* For garaje/local, show a dash for bedrooms */}
            {(listing.properties.propertyType === "garaje" ||
              listing.properties.propertyType === "local") && (
              <div className="flex items-center justify-center gap-0.5 text-gray-400">
                <Bed className="h-3 w-3" />
                <span>-</span>
              </div>
            )}

            {/* Bathrooms */}
            {listing.properties.propertyType !== "garaje" &&
              listing.properties.propertyType !== "local" && (
                <div className="flex items-center justify-center gap-0.5 text-gray-700">
                  <Bath className="h-3 w-3" />
                  <span>
                    {listing.properties.bathrooms
                      ? Math.floor(Number(listing.properties.bathrooms))
                      : "-"}
                  </span>
                </div>
              )}
            
            {/* For garaje/local, show a dash for bathrooms */}
            {(listing.properties.propertyType === "garaje" ||
              listing.properties.propertyType === "local") && (
              <div className="flex items-center justify-center gap-0.5 text-gray-400">
                <Bath className="h-3 w-3" />
                <span>-</span>
              </div>
            )}

            {/* Square meters */}
            <div className="flex items-center justify-center gap-0.5 text-gray-700">
              <SquareIcon className="h-3 w-3" />
              <span>{listing.properties.squareMeter || "-"}m²</span>
            </div>
          </div>
          
          {/* Hover Action Buttons - Overlay on Properties Box */}
          {showActions && (
            <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/20 backdrop-blur-sm opacity-0 transition-all duration-300 group-hover:opacity-100 rounded-md">
              <button
                className="h-8 w-8 rounded-full bg-white/95 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center border border-gray-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void handleAction("contact");
                }}
                disabled={isActionLoading !== null}
                title="Contactar"
              >
                <Mail className="h-3.5 w-3.5 text-gray-600" />
              </button>
              
              <button
                className="h-8 w-8 rounded-full bg-white/95 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center border border-gray-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('📝 Creating lead for match');
                }}
                disabled={isActionLoading !== null}
                title="Crear Lead"
              >
                <LinkIcon className="h-3.5 w-3.5 text-gray-600" />
              </button>
              
              <button
                className="h-8 w-8 rounded-full bg-white/95 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center border border-gray-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void handleAction("dismiss");
                }}
                disabled={isActionLoading !== null}
                title="Descartar"
              >
                <X className="h-3.5 w-3.5 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tolerance Reasons */}
      <CardContent className="px-2 pt-0 pb-2">
        {toleranceReasons.length > 0 && (
          <div className="text-center space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Tolerancias aplicadas:
            </p>
            <div className="flex flex-wrap justify-center gap-1">
              {toleranceReasons.map((reason, index) => (
                <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer with Contact Connection */}
      <CardFooter className="border-t border-border/40 p-2 pt-1.5">
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
              <div className="h-0.5 w-6 animate-pulse bg-gray-400"></div>
              {/* Left arrowhead */}
              <div className="absolute -left-1 h-0 w-0 border-b-[3px] border-r-[4px] border-t-[3px] border-b-transparent border-r-gray-400 border-t-transparent"></div>
              {/* Right arrowhead */}
              <div className="absolute -right-1 h-0 w-0 border-b-[3px] border-l-[4px] border-t-[3px] border-b-transparent border-l-gray-400 border-t-transparent"></div>
            </div>
          </div>

          {/* Right - Prospect Contact */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground/80">
              {match.prospect.contacts.firstName}{" "}
              {match.prospect.contacts.lastName}
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
