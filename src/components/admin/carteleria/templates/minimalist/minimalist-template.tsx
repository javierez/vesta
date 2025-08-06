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

// Minimalist style color palette - pure neutrals
const minimalistColors = {
  primary: "#000000", // Pure black
  secondary: "#9ca3af", // Mid gray
  accent: "#ffffff", // Pure white
  background: "#ffffff", // White background
  text: "#000000", // Black text
  border: "#e5e7eb", // Very light border
  muted: "#f9fafb", // Barely there background
};

export const MinimalistTemplate: FC<BaseTemplateProps> = ({
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
        "relative bg-white",
        "aspect-[210/297] h-full w-full border border-gray-100", // A4 portrait ratio filling container, minimal border
        className,
      )}
      data-testid="template-minimalist"
    >
      {/* Extreme minimalist header - just essential info */}
      <div className="p-8 pb-6">
        {" "}
        {/* Extra padding for white space */}
        {/* Title - ultra simple */}
        <h2
          className="mb-8 text-2xl font-light leading-tight"
          style={{
            color: minimalistColors.text,
            letterSpacing: "-0.025em", // Tight letter spacing for modern minimalism
          }}
        >
          {data.title}
        </h2>
        {/* Price - prominent but minimal */}
        <div className="mb-8">
          <div
            className="text-3xl font-extralight"
            style={{ color: minimalistColors.primary }}
          >
            {priceText}
          </div>
        </div>
        {/* Location - understated */}
        <div
          className="mb-8 text-sm font-light"
          style={{ color: minimalistColors.secondary }}
        >
          {locationText}
        </div>
      </div>

      {/* Image section - minimal, focused on the main image */}
      <div className="relative mx-8 mb-8 aspect-[4/3] bg-gray-50">
        {data.images.length > 0 && (
          <div className="relative h-full">
            {/* Single main image - minimalist approach */}
            <Image
              src={data.images[0]!}
              alt={`${data.title} - Imagen`}
              fill
              className="object-cover"
              onError={handleImageError}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
      </div>

      {/* Specifications - minimal list format */}
      <div className="mb-8 px-8">
        <div className="space-y-4">
          {data.specs.bedrooms && (
            <div className="flex justify-between border-b border-gray-100 py-2">
              <span
                className="text-sm font-light"
                style={{ color: minimalistColors.secondary }}
              >
                Habitaciones
              </span>
              <span
                className="text-sm"
                style={{ color: minimalistColors.text }}
              >
                {data.specs.bedrooms}
              </span>
            </div>
          )}

          {data.specs.bathrooms && (
            <div className="flex justify-between border-b border-gray-100 py-2">
              <span
                className="text-sm font-light"
                style={{ color: minimalistColors.secondary }}
              >
                Baños
              </span>
              <span
                className="text-sm"
                style={{ color: minimalistColors.text }}
              >
                {data.specs.bathrooms}
              </span>
            </div>
          )}

          <div className="flex justify-between border-b border-gray-100 py-2">
            <span
              className="text-sm font-light"
              style={{ color: minimalistColors.secondary }}
            >
              Superficie
            </span>
            <span className="text-sm" style={{ color: minimalistColors.text }}>
              {formatSquareMeters(data.specs.squareMeters)}
            </span>
          </div>
        </div>
      </div>

      {/* Contact section - minimal, bottom aligned */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div
              className="mb-1 text-sm font-light"
              style={{ color: minimalistColors.secondary }}
            >
              Contacto
            </div>
            <div className="text-sm" style={{ color: minimalistColors.text }}>
              {data.contact.phone}
            </div>
          </div>

          {/* QR Code - minimal, no borders */}
          <div className="flex-shrink-0">
            <PropertyQRCode
              phone={data.contact.phone}
              email={data.contact.email}
              size={48} // Smaller QR for minimalism
              className="border-none bg-transparent shadow-none"
            />
          </div>
        </div>
      </div>

      {/* Minimalist hover state - barely visible */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 hover:bg-black/[0.02] hover:opacity-100">
        <div
          className="text-xs font-light uppercase tracking-wide"
          style={{
            color: minimalistColors.secondary,
            letterSpacing: "0.1em",
          }}
        >
          Ampliar
        </div>
      </div>
    </div>
  );
};
