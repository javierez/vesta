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
import { MapPin, Bath, Bed, Square, Crown } from "lucide-react";

// Luxury style color palette - rich neutrals with champagne gold
const luxuryColors = {
  primary: "#525252", // Rich dark gray
  secondary: "#a3a3a3", // Rich light gray
  accent: "#fbbf24", // Champagne gold
  background: "#fafaf9", // Warm off-white
  text: "#262626", // Rich black
  border: "#e5e5e5", // Subtle border
  muted: "#f5f5f4", // Soft background
  premium: "#f59e0b", // Darker gold for accents
};

export const LuxuryTemplate: FC<BaseTemplateProps> = ({
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
        "w-full h-full aspect-[210/297] rounded-xl", // A4 portrait ratio filling container with elegant corners
        className,
      )}
      style={{
        backgroundColor: luxuryColors.background,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)", // Premium shadow
        border: `2px solid ${luxuryColors.border}`,
      }}
      data-testid="template-luxury"
    >
      {/* Premium header with gold accent */}
      <div className="relative">
        {/* Gold accent strip */}
        <div
          className="h-2"
          style={{ backgroundColor: luxuryColors.accent }}
        ></div>

        <div className="p-6 pb-4">
          {/* Premium badge with crown icon */}
          <div className="mb-4 flex items-center justify-center">
            <div
              className="inline-flex items-center rounded-full px-4 py-2"
              style={{
                backgroundColor: luxuryColors.accent,
                color: luxuryColors.text,
                boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)",
              }}
            >
              <Crown className="mr-2 h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                {data.propertyType} premium
              </span>
            </div>
          </div>

          {/* Title with luxury typography */}
          <h2
            className="mb-3 text-center text-xl font-bold tracking-tight"
            style={{
              color: luxuryColors.text,
              fontFamily: "ui-serif, Georgia, serif", // Premium serif font
            }}
          >
            {data.title}
          </h2>

          {/* Decorative separator */}
          <div className="mb-4 flex items-center justify-center">
            <div
              className="h-px w-8"
              style={{ backgroundColor: luxuryColors.secondary }}
            ></div>
            <div
              className="mx-3 h-2 w-2 rounded-full"
              style={{ backgroundColor: luxuryColors.accent }}
            ></div>
            <div
              className="h-px w-8"
              style={{ backgroundColor: luxuryColors.secondary }}
            ></div>
          </div>

          {/* Location with premium icon */}
          <div
            className="mb-4 flex items-center justify-center"
            style={{ color: luxuryColors.secondary }}
          >
            <MapPin className="mr-2 h-4 w-4" />
            <span className="text-sm font-medium">{locationText}</span>
          </div>

          {/* Price with premium presentation */}
          <div className="mb-4 text-center">
            <div
              className="inline-block rounded-lg border-2 px-6 py-3"
              style={{
                backgroundColor: luxuryColors.muted,
                borderColor: luxuryColors.accent,
              }}
            >
              <div
                className="text-2xl font-bold"
                style={{ color: luxuryColors.accent }}
              >
                {priceText}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium image gallery */}
      <div className="relative mx-6 mb-6">
        <div
          className="relative h-52 overflow-hidden rounded-lg border-2"
          style={{ borderColor: luxuryColors.border }}
        >
          {data.images.length > 0 && (
            <div className="grid h-full grid-cols-4 gap-2">
              {/* Featured image */}
              <div className="relative col-span-3 overflow-hidden rounded-md">
                <Image
                  src={data.images[0]!}
                  alt={`${data.title} - Imagen principal`}
                  fill
                  className="object-cover"
                  onError={handleImageError}
                  sizes="(max-width: 768px) 75vw, (max-width: 1200px) 50vw, 33vw"
                />
                {/* Premium overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>

              {/* Side gallery */}
              <div className="flex flex-col gap-2">
                {data.images.slice(1, 3).map((image, index) => (
                  <div
                    key={index}
                    className="relative flex-1 overflow-hidden rounded-md"
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
      </div>

      {/* Premium specifications */}
      <div className="mb-6 px-6">
        <div
          className="overflow-hidden rounded-lg border-2"
          style={{
            backgroundColor: luxuryColors.muted,
            borderColor: luxuryColors.border,
          }}
        >
          <div
            className="border-b px-4 py-3"
            style={{
              backgroundColor: luxuryColors.accent,
              borderColor: luxuryColors.premium,
            }}
          >
            <h3
              className="text-center text-sm font-bold"
              style={{ color: luxuryColors.text }}
            >
              CARACTERÍSTICAS EXCLUSIVAS
            </h3>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              {data.specs.bedrooms && (
                <div className="space-y-2">
                  <div
                    className="mx-auto flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: luxuryColors.accent }}
                  >
                    <Bed
                      className="h-4 w-4"
                      style={{ color: luxuryColors.text }}
                    />
                  </div>
                  <div
                    className="text-lg font-bold"
                    style={{ color: luxuryColors.text }}
                  >
                    {data.specs.bedrooms}
                  </div>
                  <div
                    className="text-xs uppercase tracking-wide"
                    style={{ color: luxuryColors.secondary }}
                  >
                    Hab.
                  </div>
                </div>
              )}

              {data.specs.bathrooms && (
                <div className="space-y-2">
                  <div
                    className="mx-auto flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: luxuryColors.accent }}
                  >
                    <Bath
                      className="h-4 w-4"
                      style={{ color: luxuryColors.text }}
                    />
                  </div>
                  <div
                    className="text-lg font-bold"
                    style={{ color: luxuryColors.text }}
                  >
                    {data.specs.bathrooms}
                  </div>
                  <div
                    className="text-xs uppercase tracking-wide"
                    style={{ color: luxuryColors.secondary }}
                  >
                    Baños
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div
                  className="mx-auto flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: luxuryColors.accent }}
                >
                  <Square
                    className="h-4 w-4"
                    style={{ color: luxuryColors.text }}
                  />
                </div>
                <div
                  className="text-lg font-bold"
                  style={{ color: luxuryColors.text }}
                >
                  {data.specs.squareMeters}
                </div>
                <div
                  className="text-xs uppercase tracking-wide"
                  style={{ color: luxuryColors.secondary }}
                >
                  m²
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium contact section */}
      <div className="px-6 pb-6">
        <div
          className="flex items-center justify-between rounded-lg border-2 p-4"
          style={{
            backgroundColor: luxuryColors.background,
            borderColor: luxuryColors.accent,
          }}
        >
          <div className="flex-1">
            <h4
              className="mb-2 text-sm font-bold uppercase tracking-wide"
              style={{ color: luxuryColors.accent }}
            >
              Contacto exclusivo
            </h4>
            <div
              className="text-sm font-medium"
              style={{ color: luxuryColors.text }}
            >
              {data.contact.phone}
            </div>
            {data.contact.email && (
              <div
                className="mt-1 text-xs"
                style={{ color: luxuryColors.secondary }}
              >
                {data.contact.email}
              </div>
            )}
          </div>

          {/* Premium QR Code */}
          <div className="ml-4 flex-shrink-0">
            <div
              className="rounded-lg border-2 p-3"
              style={{
                backgroundColor: luxuryColors.muted,
                borderColor: luxuryColors.accent,
              }}
            >
              <PropertyQRCode
                phone={data.contact.phone}
                email={data.contact.email}
                size={52}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
