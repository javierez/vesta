"use client";

import type { FC } from "react";
import Image from "next/image";
import type { BaseTemplateProps } from "~/types/template-data";
import { PropertyQRCode } from "../qr-code";
import {
  formatLocation,
  formatPrice,
} from "~/lib/carteleria/mock-data";
import { cn } from "~/lib/utils";
import { MapPin, Bath, Bed, Square } from "lucide-react";

// Modern style color palette - neutral grays with blue accents
const modernColors = {
  primary: "#64748b", // Neutral gray
  secondary: "#94a3b8", // Light gray
  accent: "#3b82f6", // Blue accent
  background: "#ffffff",
  text: "#1f2937",
  border: "#e2e8f0",
  muted: "#f8fafc",
};

export const ModernTemplate: FC<BaseTemplateProps> = ({
  data,
  className,
}) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = "none";
  };

  const locationText = formatLocation(data.location);
  const priceText = formatPrice(data.price, data.propertyType);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm",
        "w-full h-full aspect-[210/297]", // A4 portrait ratio filling container
        className,
      )}
      data-testid="template-modern"
    >
      {/* Header with clean modern styling */}
      <div
        className="p-6 pb-4"
        style={{ borderBottom: `1px solid ${modernColors.border}` }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            {/* Property type badge - modern minimal design */}
            <div
              className="mb-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: modernColors.muted,
                color: modernColors.primary,
                border: `1px solid ${modernColors.border}`,
              }}
            >
              {data.propertyType.charAt(0).toUpperCase() +
                data.propertyType.slice(1)}
            </div>

            {/* Title with modern typography */}
            <h2
              className="mb-2 text-xl font-semibold"
              style={{ color: modernColors.text }}
            >
              {data.title}
            </h2>

            {/* Location with clean icon */}
            <div
              className="flex items-center"
              style={{ color: modernColors.primary }}
            >
              <MapPin className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">{locationText}</span>
            </div>
          </div>

          {/* Price with modern styling */}
          <div className="text-right">
            <div
              className="text-2xl font-bold"
              style={{ color: modernColors.accent }}
            >
              {priceText}
            </div>
          </div>
        </div>
      </div>

      {/* Image section with modern grid layout - 35% of A4 height */}
      <div
        className="relative mx-6 mb-4 h-[35%] overflow-hidden rounded-xl"
        style={{ backgroundColor: modernColors.muted }}
      >
        {data.images.length > 0 && (
          <div className="grid h-full grid-cols-4 gap-2">
            {/* Main image with modern proportions */}
            <div className="relative col-span-3 overflow-hidden rounded-lg">
              <Image
                src={data.images[0]!}
                alt={`${data.title} - Imagen principal`}
                fill
                className="object-cover"
                onError={handleImageError}
                sizes="(max-width: 768px) 75vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            {/* Side images in modern stack */}
            <div className="flex flex-col gap-2">
              {data.images.slice(1, 3).map((image, index) => (
                <div
                  key={index}
                  className="relative flex-1 overflow-hidden rounded-lg"
                >
                  <Image
                    src={image}
                    alt={`${data.title} - Imagen ${index + 2}`}
                    fill
                    className="object-cover"
                    onError={handleImageError}
                    sizes="(max-width: 768px) 25vw, (max-width: 1200px) 16vw, 8vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Specifications with modern card design */}
      <div className="mb-6 px-6">
        <div className="grid grid-cols-3 gap-3">
          {data.specs.bedrooms && (
            <div
              className="rounded-lg p-3 text-center"
              style={{ backgroundColor: modernColors.muted }}
            >
              <Bed
                className="mx-auto mb-1 h-5 w-5"
                style={{ color: modernColors.primary }}
              />
              <div
                className="text-sm font-medium"
                style={{ color: modernColors.text }}
              >
                {data.specs.bedrooms}
              </div>
              <div
                className="text-xs"
                style={{ color: modernColors.secondary }}
              >
                habitaciones
              </div>
            </div>
          )}

          {data.specs.bathrooms && (
            <div
              className="rounded-lg p-3 text-center"
              style={{ backgroundColor: modernColors.muted }}
            >
              <Bath
                className="mx-auto mb-1 h-5 w-5"
                style={{ color: modernColors.primary }}
              />
              <div
                className="text-sm font-medium"
                style={{ color: modernColors.text }}
              >
                {data.specs.bathrooms}
              </div>
              <div
                className="text-xs"
                style={{ color: modernColors.secondary }}
              >
                baños
              </div>
            </div>
          )}

          <div
            className="rounded-lg p-3 text-center"
            style={{ backgroundColor: modernColors.muted }}
          >
            <Square
              className="mx-auto mb-1 h-5 w-5"
              style={{ color: modernColors.primary }}
            />
            <div
              className="text-sm font-medium"
              style={{ color: modernColors.text }}
            >
              {data.specs.squareMeters}
            </div>
            <div className="text-xs" style={{ color: modernColors.secondary }}>
              m²
            </div>
          </div>
        </div>
      </div>

      {/* Footer with contact and QR - modern layout */}
      <div className="px-6 pb-6">
        <div
          className="flex items-center justify-between rounded-xl p-4"
          style={{ backgroundColor: modernColors.muted }}
        >
          <div className="flex-1">
            <div
              className="mb-1 text-sm font-medium"
              style={{ color: modernColors.text }}
            >
              Contacto
            </div>
            <div className="text-sm" style={{ color: modernColors.primary }}>
              {data.contact.phone}
            </div>
            {data.contact.email && (
              <div
                className="mt-1 text-xs"
                style={{ color: modernColors.secondary }}
              >
                {data.contact.email}
              </div>
            )}
          </div>

          {/* QR Code with modern styling */}
          <div className="flex-shrink-0">
            <PropertyQRCode
              phone={data.contact.phone}
              email={data.contact.email}
              size={60}
              className="rounded-lg shadow-sm"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
