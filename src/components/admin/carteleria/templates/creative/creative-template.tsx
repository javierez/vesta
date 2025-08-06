"use client";

import type { FC } from "react";
import Image from "next/image";
import type { BaseTemplateProps } from "~/types/template-data";
import { PropertyQRCode } from "../../qr-code";
import {
  formatLocation,
  formatPrice,
  formatSquareMeters,
} from "~/lib/carteleria/mock-data";
import { cn } from "~/lib/utils";
import { MapPin, Bath, Bed, Square, Palette } from "lucide-react";

// Creative style color palette - neutral base with subtle creative accents
const creativeColors = {
  primary: "#4b5563", // Neutral gray base
  secondary: "#9ca3af", // Light gray
  accent1: "#8b5cf6", // Purple accent
  accent2: "#f59e0b", // Orange accent
  background: "#f3f4f6", // Light background
  text: "#1f2937", // Dark text
  border: "#e5e7eb", // Light border
  muted: "#f9fafb", // Very light background
};

export const CreativeTemplate: FC<BaseTemplateProps> = ({
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
        "relative overflow-hidden bg-white",
        "aspect-[210/297] h-full w-full rounded-2xl", // A4 portrait ratio filling container with creative rounded corners
        className,
      )}
      style={{
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        transform: "rotate(-0.5deg)", // Subtle artistic tilt
        transformOrigin: "center center",
      }}
      data-testid="template-creative"
    >
      {/* Creative header with asymmetric design */}
      <div className="relative">
        {/* Artistic color strip */}
        <div
          className="h-3"
          style={{
            background: `linear-gradient(135deg, ${creativeColors.accent1} 0%, ${creativeColors.accent2} 100%)`,
          }}
        ></div>

        <div className="relative p-6 pb-4">
          {/* Creative badge with palette icon */}
          <div className="absolute -top-2 right-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg"
              style={{
                background: `linear-gradient(45deg, ${creativeColors.accent1}, ${creativeColors.accent2})`,
                transform: "rotate(15deg)",
              }}
            >
              <Palette className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Property type with creative styling */}
          <div className="mb-4">
            <div
              className="inline-block -rotate-1 transform rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: creativeColors.muted,
                color: creativeColors.primary,
                border: `2px solid ${creativeColors.accent1}`,
              }}
            >
              {data.propertyType.charAt(0).toUpperCase() +
                data.propertyType.slice(1)}
            </div>
          </div>

          {/* Title with dynamic typography */}
          <h2
            className="mb-3 -skew-x-1 transform text-xl font-bold"
            style={{
              color: creativeColors.text,
              textShadow: "2px 2px 0px rgba(139, 92, 246, 0.1)",
            }}
          >
            {data.title}
          </h2>

          {/* Creative separator */}
          <div className="mb-4 flex items-center">
            <div
              className="h-0.5 w-12 rotate-12 transform"
              style={{ backgroundColor: creativeColors.accent1 }}
            ></div>
            <div
              className="mx-2 h-3 w-3 rotate-45 transform rounded-full"
              style={{ backgroundColor: creativeColors.accent2 }}
            ></div>
            <div
              className="h-0.5 w-8 -rotate-12 transform"
              style={{ backgroundColor: creativeColors.accent1 }}
            ></div>
          </div>

          {/* Location with creative icon placement */}
          <div
            className="mb-4 flex items-center"
            style={{ color: creativeColors.secondary }}
          >
            <div className="relative">
              <MapPin className="mr-2 h-4 w-4 rotate-12 transform" />
            </div>
            <span className="text-sm font-medium">{locationText}</span>
          </div>
        </div>
      </div>

      {/* Creative asymmetric image layout */}
      <div className="relative mx-6 mb-6">
        <div
          className="relative h-48"
          style={{ backgroundColor: creativeColors.muted }}
        >
          {data.images.length > 0 && (
            <div className="grid h-full grid-cols-5 gap-2">
              {/* Main image with creative positioning */}
              <div className="relative col-span-3 -rotate-1 transform overflow-hidden rounded-lg shadow-md">
                <Image
                  src={data.images[0]!}
                  alt={`${data.title} - Imagen principal`}
                  fill
                  className="object-cover"
                  onError={handleImageError}
                  sizes="(max-width: 768px) 60vw, (max-width: 1200px) 40vw, 30vw"
                />
              </div>

              {/* Side images with creative stacking */}
              <div className="col-span-2 flex rotate-1 transform flex-col gap-2">
                {data.images.slice(1, 3).map((image, index) => (
                  <div
                    key={index}
                    className={`relative flex-1 overflow-hidden rounded-lg shadow-sm ${index === 0 ? "-rotate-2 transform" : "rotate-2 transform"}`}
                  >
                    <Image
                      src={image}
                      alt={`${data.title} - Imagen ${index + 2}`}
                      fill
                      className="object-cover"
                      onError={handleImageError}
                      sizes="(max-width: 768px) 40vw, (max-width: 1200px) 25vw, 16vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Creative price display */}
      <div className="mb-6 px-6">
        <div className="relative">
          <div
            className="inline-block -rotate-1 transform rounded-xl px-6 py-3 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${creativeColors.accent1}15, ${creativeColors.accent2}15)`,
              border: `2px solid ${creativeColors.accent1}30`,
            }}
          >
            <div
              className="text-2xl font-bold"
              style={{
                color: creativeColors.text,
                textShadow: "1px 1px 0px rgba(139, 92, 246, 0.2)",
              }}
            >
              {priceText}
            </div>
          </div>
        </div>
      </div>

      {/* Creative specifications with asymmetric layout */}
      <div className="mb-6 px-6">
        <div className="space-y-3">
          {data.specs.bedrooms && (
            <div
              className="-rotate-0.5 flex transform items-center justify-between rounded-lg p-2"
              style={{ backgroundColor: creativeColors.muted }}
            >
              <div
                className="flex items-center"
                style={{ color: creativeColors.secondary }}
              >
                <div
                  className="mr-3 flex h-8 w-8 rotate-12 transform items-center justify-center rounded-full"
                  style={{ backgroundColor: creativeColors.accent1 }}
                >
                  <Bed className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm">Habitaciones</span>
              </div>
              <span
                className="skew-x-3 transform text-sm font-bold"
                style={{ color: creativeColors.text }}
              >
                {data.specs.bedrooms}
              </span>
            </div>
          )}

          {data.specs.bathrooms && (
            <div
              className="rotate-0.5 flex transform items-center justify-between rounded-lg p-2"
              style={{ backgroundColor: creativeColors.muted }}
            >
              <div
                className="flex items-center"
                style={{ color: creativeColors.secondary }}
              >
                <div
                  className="mr-3 flex h-8 w-8 -rotate-12 transform items-center justify-center rounded-full"
                  style={{ backgroundColor: creativeColors.accent2 }}
                >
                  <Bath className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm">Baños</span>
              </div>
              <span
                className="-skew-x-3 transform text-sm font-bold"
                style={{ color: creativeColors.text }}
              >
                {data.specs.bathrooms}
              </span>
            </div>
          )}

          <div
            className="-rotate-0.5 flex transform items-center justify-between rounded-lg p-2"
            style={{ backgroundColor: creativeColors.muted }}
          >
            <div
              className="flex items-center"
              style={{ color: creativeColors.secondary }}
            >
              <div
                className="mr-3 flex h-8 w-8 rotate-45 transform items-center justify-center rounded-full"
                style={{ backgroundColor: creativeColors.accent1 }}
              >
                <Square className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm">Superficie</span>
            </div>
            <span
              className="skew-x-3 transform text-sm font-bold"
              style={{ color: creativeColors.text }}
            >
              {formatSquareMeters(data.specs.squareMeters)}
            </span>
          </div>
        </div>
      </div>

      {/* Creative contact section */}
      <div className="px-6 pb-6">
        <div
          className="rotate-0.5 flex transform items-center justify-between rounded-xl p-4 shadow-md"
          style={{
            background: `linear-gradient(135deg, ${creativeColors.muted}, ${creativeColors.background})`,
            border: `2px solid ${creativeColors.accent2}30`,
          }}
        >
          <div className="flex-1">
            <h4
              className="mb-1 -skew-x-6 transform text-sm font-bold"
              style={{ color: creativeColors.accent1 }}
            >
              Contacto creativo
            </h4>
            <div
              className="text-sm font-medium"
              style={{ color: creativeColors.text }}
            >
              {data.contact.phone}
            </div>
            {data.contact.email && (
              <div
                className="mt-1 text-xs"
                style={{ color: creativeColors.secondary }}
              >
                {data.contact.email}
              </div>
            )}
          </div>

          {/* Creative QR Code positioning */}
          <div className="ml-4 flex-shrink-0 rotate-6 transform">
            <div
              className="rounded-lg p-2 shadow-sm"
              style={{ backgroundColor: creativeColors.accent2 }}
            >
              <PropertyQRCode
                phone={data.contact.phone}
                email={data.contact.email}
                size={48}
                className="-rotate-6 transform"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
