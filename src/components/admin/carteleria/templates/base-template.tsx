"use client";

import type { FC } from "react";
import Image from "next/image";
import type { BaseTemplateProps } from "~/types/template-data";
import { PropertyQRCode } from "../qr-code";
import {
  formatLocation,
  formatPrice,
  formatSquareMeters,
} from "~/lib/carteleria/mock-data";
import { cn } from "~/lib/utils";
import { MapPin, Home, Bath, Bed } from "lucide-react";

export const BaseTemplate: FC<BaseTemplateProps> = ({
  data,
  className,
}) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = "none";
  };

  const locationText = formatLocation(data.location);
  const priceText = formatPrice(data.price, data.propertyType);
  const sqmText = formatSquareMeters(data.specs.squareMeters);

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm",
        "aspect-[210/297]", // A4 portrait ratio (210mm x 297mm)
        className,
      )}
    >
      {/* Image Gallery Section - Takes upper 40% of A4 template */}
      <div className="relative h-[40%] bg-gray-100">
        {data.images.length > 0 && (
          <div className="grid h-full grid-cols-3 gap-1">
            {/* Main image (larger) */}
            <div className="relative col-span-2">
              <Image
                src={data.images[0]!}
                alt={`${data.title} - Imagen principal`}
                fill
                className="object-cover"
                onError={handleImageError}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            {/* Side images (smaller) */}
            <div className="flex flex-col gap-1">
              {data.images.slice(1, 3).map((image, index) => (
                <div key={index} className="relative flex-1">
                  <Image
                    src={image}
                    alt={`${data.title} - Imagen ${index + 2}`}
                    fill
                    className="object-cover"
                    onError={handleImageError}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image overlay with property type */}
        <div className="absolute left-2 top-2">
          <span className="inline-flex items-center rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white">
            {data.propertyType.charAt(0).toUpperCase() +
              data.propertyType.slice(1)}
          </span>
        </div>
      </div>

      {/* Content Section - Takes remaining 60% of A4 template */}
      <div className="flex-1 space-y-3 p-4">
        {/* Title and Price */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              {data.title}
            </h3>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="mr-1 h-4 w-4" />
              <span>{locationText}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">{priceText}</div>
          </div>
        </div>

        {/* Property Specifications */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {data.specs.bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{data.specs.bedrooms}</span>
            </div>
          )}

          {data.specs.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{data.specs.bathrooms}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Home className="h-4 w-4" />
            <span>{sqmText}</span>
          </div>
        </div>

        {/* Bottom section with contact and QR */}
        <div className="flex items-end justify-between border-t border-gray-100 pt-2">
          <div className="flex-1">
            <div className="text-sm text-gray-600">
              <div>Tel: {data.contact.phone}</div>
              {data.contact.email && (
                <div className="text-xs">{data.contact.email}</div>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="flex-shrink-0">
            <PropertyQRCode
              phone={data.contact.phone}
              email={data.contact.email}
              size={60}
              className="ml-4"
            />
          </div>
        </div>
      </div>

    </div>
  );
};

// Responsive template wrapper for different formats
interface ResponsiveTemplateWrapperProps {
  children: React.ReactNode;
  format: "A4" | "A3" | "A2" | "digital";
  orientation?: "portrait" | "landscape";
  className?: string;
}

export const ResponsiveTemplateWrapper: FC<ResponsiveTemplateWrapperProps> = ({
  children,
  format,
  orientation = "portrait",
  className,
}) => {
  const baseClasses = "mx-auto bg-white w-full h-full";
  
  const getFormatClasses = () => {
    switch (format) {
      case "A4":
        return orientation === "portrait"
          ? "aspect-[210/297]" // A4 portrait ratio
          : "aspect-[297/210]"; // A4 landscape ratio
      case "A3":
        return orientation === "portrait"
          ? "aspect-[297/420]" // A3 portrait ratio
          : "aspect-[420/297]"; // A3 landscape ratio
      case "A2":
        return orientation === "portrait"
          ? "aspect-[420/594]" // A2 portrait ratio
          : "aspect-[594/420]"; // A2 landscape ratio
      case "digital":
        return "aspect-square"; // Digital square format
      default:
        return "aspect-[210/297]"; // Default to A4 portrait ratio
    }
  };

  return (
    <div className={cn(baseClasses, getFormatClasses(), className)}>
      {children}
    </div>
  );
};
