"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import {
  Bed,
  Bath,
  SquareIcon as SquareFoot,
  MapPin,
  User,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { formatPrice } from "~/lib/utils";
import { formatListingType } from "./contactos/contact-config";
import type { ListingOverview } from "~/types/listing";

type Listing = {
  // Listing fields
  listingId: bigint;
  propertyId: bigint;
  price: string;
  status: string;
  listingType: string;
  isActive: boolean | null;
  isFeatured: boolean | null;
  isBankOwned: boolean | null;
  viewCount: number | null;
  inquiryCount: number | null;
  agentName: string | null;

  // Property fields
  referenceNumber: string | null;
  title: string | null;
  propertyType: string | null;
  bedrooms: number | null;
  bathrooms: string | null;
  squareMeter: number | null;
  street: string | null;
  addressDetails: string | null;
  postalCode: string | null;
  latitude: string | null;
  longitude: string | null;

  // Location fields
  city: string | null;
  province: string | null;
  municipality: string | null;
  neighborhood: string | null;

  // Image fields
  imageUrl: string | null;
  s3key: string | null;
  imageUrl2: string | null;
  s3key2: string | null;
};

interface PropertyCardProps {
  listing: Listing | ListingOverview;
  accountWebsite?: string | null;
}

export const PropertyCard = React.memo(function PropertyCard({
  listing,
  accountWebsite,
}: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [image2Loaded, setImage2Loaded] = useState(false);

  const getPropertyTypeLabel = (type: string | null) => {
    switch (type) {
      case "piso":
        return "Piso";
      case "casa":
        return "Casa";
      case "local":
        return "Local";
      case "solar":
        return "Solar";
      case "garaje":
        return "Garaje";
      default:
        return type;
    }
  };

  // Get primary image with proper fallback
  const defaultPlaceholder = "/properties/suburban-dream.png";
  const [imageSrc, setImageSrc] = useState(
    listing.imageUrl ?? defaultPlaceholder,
  );
  const [imageSrc2, setImageSrc2] = useState(
    listing.imageUrl2 ?? defaultPlaceholder,
  );

  const onImageError = () => {
    setImageSrc(defaultPlaceholder);
  };

  const onImage2Error = () => {
    setImageSrc2(defaultPlaceholder);
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Use account website or fallback to current origin
    const baseUrl = accountWebsite ?? window.location.origin;
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const propertyUrl = `${cleanBaseUrl}/propiedades/${listing.listingId}`;
    const message = `Échale un vistazo: ${propertyUrl}`;

    // Create WhatsApp link with pre-filled message
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    // Open WhatsApp
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Link
      href={`/propiedades/${listing.listingId.toString()}`}
      className="block"
    >
      <Card
        className="overflow-hidden transition-all hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <div className="relative h-full w-full">
            {/* Skeleton overlay while images load */}
            {(!imageLoaded || !image2Loaded) && (
              <Skeleton className="absolute inset-0 z-10" />
            )}

            {/* First Image */}
            <Image
              src={imageSrc}
              alt={listing.title ?? "Property image"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={cn(
                "object-cover transition-opacity duration-300",
                isHovered && image2Loaded ? "opacity-0" : "opacity-100",
                imageSrc === defaultPlaceholder ||
                  listing.status === "Sold" ||
                  listing.status === "Vendido"
                  ? "grayscale"
                  : "",
              )}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={onImageError}
              quality={85}
            />

            {/* Second Image */}
            <Image
              src={imageSrc2}
              alt={listing.title ?? "Property image"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={cn(
                "object-cover transition-opacity duration-300",
                isHovered && image2Loaded ? "opacity-100" : "opacity-0",
                imageSrc2 === defaultPlaceholder ||
                  listing.status === "Sold" ||
                  listing.status === "Vendido"
                  ? "grayscale"
                  : "",
              )}
              loading="lazy"
              onLoad={() => setImage2Loaded(true)}
              onError={onImage2Error}
              quality={85}
            />
          </div>
          {/* Top Left - Property Type */}
          <Badge
            variant="outline"
            className="absolute left-2 top-2 z-10 bg-white/80 text-sm"
          >
            {getPropertyTypeLabel(listing.propertyType)}
          </Badge>

          {/* Top Right - Status */}
          <Badge className="absolute right-2 top-2 z-10 text-sm">
            {formatListingType(listing.listingType)}
          </Badge>

          {/* Bottom Center - Reference Number */}
          <div className="absolute bottom-1 left-1/2 z-10 -translate-x-1/2">
            <span className="text-[10px] font-semibold tracking-widest text-white/90">
              {listing.referenceNumber ?? ""}
            </span>
          </div>

          {/* Bottom Right - Bank Owned */}
          {listing.isBankOwned && (
            <Badge
              variant="secondary"
              className="absolute bottom-2 right-2 z-10 bg-amber-500 text-sm text-white"
            >
              Piso de Banco
            </Badge>
          )}
        </div>

        <CardContent className="p-3">
          <div className="mb-1 flex items-start justify-between">
            <div>
              <h3 className="line-clamp-1 text-base font-semibold">
                {listing.street}
              </h3>
            </div>
            <p className="text-base font-bold">
              {formatPrice(listing.price)}€
              {["Rent", "RentWithOption", "RoomSharing"].includes(
                listing.listingType,
              )
                ? "/mes"
                : ""}
            </p>
          </div>

          <div className="mb-2 flex items-center text-muted-foreground">
            <MapPin className="mr-1 h-3.5 w-3.5" />
            <p className="line-clamp-1 text-xs">
              {listing.city}, {listing.province}
            </p>
          </div>

          <div className="flex justify-between text-xs">
            {listing.propertyType !== "solar" &&
              listing.propertyType !== "garaje" &&
              listing.propertyType !== "local" && (
                <>
                  <div className="flex items-center">
                    <Bed className="mr-1 h-3.5 w-3.5" />
                    <span>
                      {listing.bedrooms}{" "}
                      {listing.bedrooms === 1 ? "Hab" : "Habs"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="mr-1 h-3.5 w-3.5" />
                    <span>
                      {Math.floor(Number(listing.bathrooms))}{" "}
                      {Math.floor(Number(listing.bathrooms)) === 1
                        ? "Baño"
                        : "Baños"}
                    </span>
                  </div>
                </>
              )}
            <div className="flex items-center">
              <SquareFoot className="mr-1 h-3.5 w-3.5" />
              <span>{listing.squareMeter} m²</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="relative border-t border-border/40 p-3 pt-2">
          <div className="group flex cursor-pointer items-center gap-1.5 transition-all">
            <User className="h-3 w-3 text-muted-foreground/80 transition-all group-hover:scale-110 group-hover:text-primary" />
            <p className="text-xs font-light text-muted-foreground/80 transition-all group-hover:font-bold group-hover:text-primary group-hover:underline">
              {listing.agentName ?? ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="group absolute bottom-1 right-1 mr-2 h-8 w-8 text-muted-foreground/80 hover:bg-transparent"
            onClick={handleWhatsAppClick}
          >
            <Image
              src="https://vesta-configuration-files.s3.amazonaws.com/logos/whatsapp.png"
              alt="WhatsApp"
              width={20}
              height={20}
              className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
            />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
});
