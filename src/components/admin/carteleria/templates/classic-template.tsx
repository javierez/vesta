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
import { MapPin, Bath, Bed, Square } from "lucide-react";

// Classic style color palette - warm neutrals with gold accents
const classicColors = {
  primary: "#374151", // Dark warm gray
  secondary: "#6b7280", // Medium warm gray
  accent: "#d97706", // Gold accent
  background: "#fefdf8", // Warm white
  text: "#1f2937", // Dark text
  border: "#d1d5db", // Light border
  muted: "#f9fafb", // Light background
  decorative: "#e5e7eb", // Decorative elements
};

export const ClassicTemplate: FC<BaseTemplateProps> = ({
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
        "relative overflow-hidden",
        "w-full h-full aspect-[210/297] rounded-lg border-2", // A4 portrait ratio filling container with traditional border
        className,
      )}
      style={{
        backgroundColor: classicColors.background,
        borderColor: classicColors.decorative,
      }}
      data-testid="template-classic"
    >
      {/* Decorative header border */}
      <div
        className="h-1"
        style={{ backgroundColor: classicColors.accent }}
      ></div>

      {/* Header with classic typography */}
      <div className="p-6 pb-4">
        <div className="mb-4 text-center">
          {/* Property type with classic styling */}
          <div
            className="mb-3 inline-block rounded-md border px-4 py-2"
            style={{
              backgroundColor: classicColors.muted,
              borderColor: classicColors.border,
              color: classicColors.primary,
            }}
          >
            <span className="text-xs font-medium uppercase tracking-wide">
              {data.propertyType}
            </span>
          </div>

          {/* Title with serif-like styling */}
          <h2
            className="mb-2 text-xl font-bold tracking-tight"
            style={{
              color: classicColors.text,
              fontFamily: "Georgia, serif", // Classic serif typography
            }}
          >
            {data.title}
          </h2>

          {/* Decorative line */}
          <div
            className="mx-auto mb-3 h-0.5 w-16"
            style={{ backgroundColor: classicColors.accent }}
          ></div>

          {/* Location with classic icon */}
          <div
            className="flex items-center justify-center"
            style={{ color: classicColors.secondary }}
          >
            <MapPin className="mr-2 h-4 w-4" />
            <span className="text-sm">{locationText}</span>
          </div>
        </div>

        {/* Price with classic formatting */}
        <div
          className="mb-4 rounded-md border p-3 text-center"
          style={{
            backgroundColor: classicColors.muted,
            borderColor: classicColors.border,
          }}
        >
          <div
            className="text-2xl font-bold"
            style={{ color: classicColors.accent }}
          >
            {priceText}
          </div>
        </div>
      </div>

      {/* Image section with classic frame styling - 35% of A4 height */}
      <div className="relative mx-6 mb-4">
        <div
          className="relative h-[35%] overflow-hidden rounded-md border-2"
          style={{ borderColor: classicColors.decorative }}
        >
          {data.images.length > 0 && (
            <div className="grid h-full grid-cols-2 gap-1">
              {/* Main image */}
              <div className="relative col-span-2 h-[70%]">
                <Image
                  src={data.images[0]!}
                  alt={`${data.title} - Imagen principal`}
                  fill
                  className="object-cover"
                  onError={handleImageError}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Side images */}
              {data.images.slice(1, 3).map((image, index) => (
                <div key={index} className="relative h-16">
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
          )}
        </div>
      </div>

      {/* Specifications with classic table-like design */}
      <div className="mb-6 px-6">
        <div
          className="overflow-hidden rounded-md border"
          style={{ borderColor: classicColors.border }}
        >
          <div
            className="border-b bg-gray-50 px-4 py-2"
            style={{
              backgroundColor: classicColors.muted,
              borderColor: classicColors.border,
            }}
          >
            <h3
              className="text-sm font-semibold"
              style={{ color: classicColors.text }}
            >
              Características
            </h3>
          </div>

          <div className="space-y-3 p-4">
            {data.specs.bedrooms && (
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center"
                  style={{ color: classicColors.secondary }}
                >
                  <Bed className="mr-2 h-4 w-4" />
                  <span className="text-sm">Habitaciones</span>
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: classicColors.text }}
                >
                  {data.specs.bedrooms}
                </span>
              </div>
            )}

            {data.specs.bathrooms && (
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center"
                  style={{ color: classicColors.secondary }}
                >
                  <Bath className="mr-2 h-4 w-4" />
                  <span className="text-sm">Baños</span>
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: classicColors.text }}
                >
                  {data.specs.bathrooms}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div
                className="flex items-center"
                style={{ color: classicColors.secondary }}
              >
                <Square className="mr-2 h-4 w-4" />
                <span className="text-sm">Superficie</span>
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: classicColors.text }}
              >
                {formatSquareMeters(data.specs.squareMeters)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with classic contact layout */}
      <div className="px-6 pb-6">
        <div
          className="flex items-center justify-between rounded-md border p-4"
          style={{
            backgroundColor: classicColors.muted,
            borderColor: classicColors.border,
          }}
        >
          <div className="flex-1">
            <h4
              className="mb-2 text-sm font-semibold"
              style={{ color: classicColors.text }}
            >
              Información de contacto
            </h4>
            <div className="text-sm" style={{ color: classicColors.secondary }}>
              <div className="font-medium">{data.contact.phone}</div>
              {data.contact.email && (
                <div className="mt-1 text-xs">{data.contact.email}</div>
              )}
            </div>
          </div>

          {/* QR Code with classic frame */}
          <div className="ml-4 flex-shrink-0">
            <div
              className="rounded-md border-2 p-2"
              style={{ borderColor: classicColors.decorative }}
            >
              <PropertyQRCode
                phone={data.contact.phone}
                email={data.contact.email}
                size={50}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative footer border */}
      <div
        className="h-1"
        style={{ backgroundColor: classicColors.accent }}
      ></div>

    </div>
  );
};
