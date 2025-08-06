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
import { MapPin, Bath, Bed, Square, Briefcase, Building2 } from "lucide-react";

// Professional style color palette - business neutrals with navy accents
const professionalColors = {
  primary: "#374151", // Business dark gray
  secondary: "#6b7280", // Business medium gray
  accent: "#1e40af", // Navy blue accent
  background: "#ffffff", // Clean white
  text: "#111827", // Professional black
  border: "#d1d5db", // Corporate border
  muted: "#f9fafb", // Light corporate background
  navy: "#1e3a8a", // Darker navy for emphasis
};

export const ProfessionalTemplate: FC<BaseTemplateProps> = ({
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
        "aspect-[210/297] h-full w-full rounded-lg border-2", // A4 portrait ratio filling container with clean professional borders
        className,
      )}
      style={{
        borderColor: professionalColors.border,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)", // Subtle professional shadow
      }}
      data-testid="template-professional"
    >
      {/* Professional header with corporate styling */}
      <div className="relative">
        {/* Corporate header stripe */}
        <div
          className="h-1"
          style={{ backgroundColor: professionalColors.accent }}
        ></div>

        <div
          className="border-b p-6 pb-4"
          style={{ borderColor: professionalColors.border }}
        >
          {/* Corporate logo area */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="mr-3 flex h-10 w-10 items-center justify-center rounded-sm"
                style={{ backgroundColor: professionalColors.accent }}
              >
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <div
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: professionalColors.secondary }}
                >
                  Inmobiliaria
                </div>
                <div
                  className="text-sm font-bold"
                  style={{ color: professionalColors.text }}
                >
                  ACRÓPOLIS
                </div>
              </div>
            </div>

            {/* Property type badge */}
            <div
              className="rounded-sm border px-3 py-1"
              style={{
                backgroundColor: professionalColors.muted,
                borderColor: professionalColors.accent,
                color: professionalColors.accent,
              }}
            >
              <span className="text-xs font-semibold uppercase tracking-wide">
                {data.propertyType}
              </span>
            </div>
          </div>

          {/* Professional title */}
          <h2
            className="mb-3 text-xl font-bold"
            style={{ color: professionalColors.text }}
          >
            {data.title}
          </h2>

          {/* Location with corporate styling */}
          <div
            className="mb-4 flex items-center"
            style={{ color: professionalColors.secondary }}
          >
            <MapPin className="mr-2 h-4 w-4" />
            <span className="text-sm font-medium">{locationText}</span>
          </div>

          {/* Professional price presentation */}
          <div className="text-center">
            <div
              className="inline-block rounded-sm border-2 px-6 py-3"
              style={{
                backgroundColor: professionalColors.muted,
                borderColor: professionalColors.accent,
              }}
            >
              <div
                className="mb-1 text-xs uppercase tracking-wide"
                style={{ color: professionalColors.secondary }}
              >
                Precio
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: professionalColors.accent }}
              >
                {priceText}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional image grid */}
      <div className="p-6 pb-4">
        <div
          className="relative h-44 overflow-hidden rounded-sm border"
          style={{
            backgroundColor: professionalColors.muted,
            borderColor: professionalColors.border,
          }}
        >
          {data.images.length > 0 && (
            <div className="grid h-full grid-cols-6 gap-1">
              {/* Main professional image */}
              <div className="relative col-span-4 bg-gray-100">
                <Image
                  src={data.images[0]!}
                  alt={`${data.title} - Vista principal`}
                  fill
                  className="object-cover"
                  onError={handleImageError}
                  sizes="(max-width: 768px) 67vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Professional side images */}
              <div className="col-span-2 flex flex-col gap-1">
                {data.images.slice(1, 3).map((image, index) => (
                  <div key={index} className="relative flex-1 bg-gray-100">
                    <Image
                      src={image}
                      alt={`${data.title} - Vista ${index + 2}`}
                      fill
                      className="object-cover"
                      onError={handleImageError}
                      sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 16vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional specifications table */}
      <div className="px-6 pb-4">
        <div
          className="overflow-hidden rounded-sm border"
          style={{ borderColor: professionalColors.border }}
        >
          {/* Table header */}
          <div
            className="border-b px-4 py-2"
            style={{
              backgroundColor: professionalColors.accent,
              borderColor: professionalColors.navy,
            }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">
              Especificaciones técnicas
            </h3>
          </div>

          {/* Table content */}
          <div
            className="divide-y"
            style={{ backgroundColor: professionalColors.background }}
          >
            {data.specs.bedrooms && (
              <div className="flex items-center justify-between px-4 py-3">
                <div
                  className="flex items-center"
                  style={{ color: professionalColors.secondary }}
                >
                  <Bed className="mr-3 h-4 w-4" />
                  <span className="text-sm font-medium">Dormitorios</span>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: professionalColors.text }}
                >
                  {data.specs.bedrooms} unidades
                </span>
              </div>
            )}

            {data.specs.bathrooms && (
              <div className="flex items-center justify-between px-4 py-3">
                <div
                  className="flex items-center"
                  style={{ color: professionalColors.secondary }}
                >
                  <Bath className="mr-3 h-4 w-4" />
                  <span className="text-sm font-medium">Cuartos de baño</span>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: professionalColors.text }}
                >
                  {data.specs.bathrooms} unidades
                </span>
              </div>
            )}

            <div className="flex items-center justify-between px-4 py-3">
              <div
                className="flex items-center"
                style={{ color: professionalColors.secondary }}
              >
                <Square className="mr-3 h-4 w-4" />
                <span className="text-sm font-medium">Superficie útil</span>
              </div>
              <span
                className="text-sm font-bold"
                style={{ color: professionalColors.text }}
              >
                {formatSquareMeters(data.specs.squareMeters)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Professional contact section */}
      <div className="px-6 pb-6">
        <div
          className="rounded-sm border-2 p-4"
          style={{
            backgroundColor: professionalColors.muted,
            borderColor: professionalColors.accent,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center">
                <Briefcase
                  className="mr-2 h-4 w-4"
                  style={{ color: professionalColors.accent }}
                />
                <h4
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: professionalColors.accent }}
                >
                  Contacto comercial
                </h4>
              </div>
              <div className="space-y-1">
                <div
                  className="text-sm font-bold"
                  style={{ color: professionalColors.text }}
                >
                  Teléfono: {data.contact.phone}
                </div>
                {data.contact.email && (
                  <div
                    className="text-xs"
                    style={{ color: professionalColors.secondary }}
                  >
                    Email: {data.contact.email}
                  </div>
                )}
                <div
                  className="mt-2 text-xs font-medium"
                  style={{ color: professionalColors.accent }}
                >
                  Consulta profesional sin compromiso
                </div>
              </div>
            </div>

            {/* Professional QR Code */}
            <div className="ml-4 flex-shrink-0">
              <div
                className="rounded-sm border-2 p-3"
                style={{
                  backgroundColor: professionalColors.background,
                  borderColor: professionalColors.accent,
                }}
              >
                <PropertyQRCode
                  phone={data.contact.phone}
                  email={data.contact.email}
                  size={50}
                />
                <div
                  className="mt-1 text-center text-xs font-medium"
                  style={{ color: professionalColors.secondary }}
                >
                  Escanear
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate footer stripe */}
      <div
        className="h-1"
        style={{ backgroundColor: professionalColors.accent }}
      ></div>
    </div>
  );
};
