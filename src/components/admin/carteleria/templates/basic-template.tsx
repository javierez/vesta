"use client";

import type { FC } from "react";
import Image from "next/image";
import type { ConfigurableTemplateProps } from "~/types/template-data";
import { PropertyQRCode } from "../qr-code";
import { getTemplateImages } from "~/lib/carteleria/s3-images";
import {
  formatLocation,
  formatPrice,
} from "~/lib/carteleria/mock-data";
import { cn } from "~/lib/utils";
import { MapPin, Bath, Bed, Square, Zap, Calendar, Car, Home, Compass, Flame } from "lucide-react";

// Basic style color palette - simple colors with green accents
const basicColors = {
  primary: "#16a34a", // Green primary
  secondary: "#84cc16", // Light green
  accent: "#22c55e", // Green accent
  background: "#ffffff",
  text: "#1f2937",
  border: "#e5e7eb",
  muted: "#f9fafb",
};

export const BasicTemplate: FC<ConfigurableTemplateProps> = ({
  data,
  config,
  className,
}) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = "none";
  };

  const locationText = formatLocation(data.location);
  const priceText = formatPrice(data.price, data.propertyType, config.listingType);

  // Get images based on configuration
  const templateImages = getTemplateImages(config.imageCount);

  // Render image grid based on count and orientation
  const renderImages = () => {
    if (templateImages.length === 0) return null;

    if (config.orientation === "horizontal") {
      // Horizontal layout
      if (config.imageCount === 4) {
        return (
          <div className="grid h-full grid-rows-2 gap-2 p-4">
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src={templateImages[0]!}
                alt={`${data.title} - Imagen principal`}
                fill
                className="object-cover"
                onError={handleImageError}
                sizes="(max-width: 768px) 40vw, (max-width: 1200px) 30vw, 20vw"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {templateImages.slice(1, 4).map((image, index) => (
                <div key={index} className="relative overflow-hidden rounded-lg">
                  <Image
                    src={image}
                    alt={`${data.title} - Imagen ${index + 2}`}
                    fill
                    className="object-cover"
                    onError={handleImageError}
                    sizes="(max-width: 768px) 13vw, (max-width: 1200px) 10vw, 7vw"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      } else {
        // 3 images horizontal
        return (
          <div className="grid h-full grid-rows-3 gap-2 p-4">
            <div className="relative row-span-2 overflow-hidden rounded-lg">
              <Image
                src={templateImages[0]!}
                alt={`${data.title} - Imagen principal`}
                fill
                className="object-cover"
                onError={handleImageError}
                sizes="(max-width: 768px) 40vw, (max-width: 1200px) 30vw, 20vw"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {templateImages.slice(1, 3).map((image, index) => (
                <div key={index} className="relative overflow-hidden rounded-lg">
                  <Image
                    src={image}
                    alt={`${data.title} - Imagen ${index + 2}`}
                    fill
                    className="object-cover"
                    onError={handleImageError}
                    sizes="(max-width: 768px) 20vw, (max-width: 1200px) 15vw, 10vw"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      }
    } else {
      // Vertical layout
      if (config.imageCount === 4) {
        return (
          <div className="grid h-full grid-cols-4 gap-2">
            <div className="relative col-span-2 overflow-hidden rounded-lg">
              <Image
                src={templateImages[0]!}
                alt={`${data.title} - Imagen principal`}
                fill
                className="object-cover"
                onError={handleImageError}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
            <div className="col-span-2 grid grid-rows-3 gap-2">
              {templateImages.slice(1, 4).map((image, index) => (
                <div key={index} className="relative overflow-hidden rounded-lg">
                  <Image
                    src={image}
                    alt={`${data.title} - Imagen ${index + 2}`}
                    fill
                    className="object-cover"
                    onError={handleImageError}
                    sizes="(max-width: 768px) 25vw, (max-width: 1200px) 16vw, 12vw"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      } else {
        // 3 images vertical (existing layout)
        return (
          <div className="grid h-full grid-cols-4 gap-2">
            <div className="relative col-span-3 overflow-hidden rounded-lg">
              <Image
                src={templateImages[0]!}
                alt={`${data.title} - Imagen principal`}
                fill
                className="object-cover"
                onError={handleImageError}
                sizes="(max-width: 768px) 75vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="flex flex-col gap-2">
              {templateImages.slice(1, 3).map((image, index) => (
                <div key={index} className="relative flex-1 overflow-hidden rounded-lg">
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
        );
      }
    }
  };

  // Render additional fields based on selection
  const renderAdditionalFields = () => {
    if (config.additionalFields.length === 0) return null;

    const getFieldIcon = (fieldValue: string) => {
      const iconMap: Record<string, typeof Zap> = {
        energyConsumptionScale: Zap,
        yearBuilt: Calendar,
        hasElevator: Home,
        hasGarage: Car,
        hasStorageRoom: Home,
        terrace: Home,
        orientation: Compass,
        heatingType: Flame,
        conservationStatus: Home,
      };
      return iconMap[fieldValue] ?? Home;
    };

    const getFieldLabel = (fieldValue: string) => {
      const labelMap: Record<string, string> = {
        energyConsumptionScale: "Certificación",
        yearBuilt: "Año",
        hasElevator: "Ascensor", 
        hasGarage: "Garaje",
        hasStorageRoom: "Trastero",
        terrace: "Terraza",
        orientation: "Orientación",
        heatingType: "Calefacción",
        conservationStatus: "Estado",
      };
      return labelMap[fieldValue] ?? fieldValue;
    };

    const getFieldValue = (fieldValue: string): string => {
      const extendedData = data as Record<string, unknown>;
      const value = extendedData[fieldValue];
      
      if (value === undefined || value === null) return "N/A";
      if (typeof value === "boolean") return value ? "Sí" : "No";
      if (fieldValue === "conservationStatus" && typeof value === "number") {
        const statusMap: Record<number, string> = {
          1: "Bueno",
          2: "Muy bueno", 
          3: "Como nuevo",
          4: "A reformar",
          6: "Reformado"
        };
        return statusMap[value] ?? "N/A";
      }
      if (typeof value === 'object' && value !== null) {
        return "N/A"; // Don't stringify objects
      }
      if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
      }
      return "N/A";
    };

    return (
      <div className="mb-3 px-6">
        {config.showIcons ? (
          <div className={cn("grid gap-2", config.additionalFields.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
            {config.additionalFields.map((fieldValue) => {
              const IconComponent = getFieldIcon(fieldValue);
              return (
                <div
                  key={fieldValue}
                  className="rounded-lg p-2 text-center"
                  style={{ backgroundColor: basicColors.muted }}
                >
                  <IconComponent
                    className="mx-auto mb-1 h-4 w-4"
                    style={{ color: basicColors.primary }}
                  />
                  <div
                    className="text-xs font-medium"
                    style={{ color: basicColors.text }}
                  >
                    {getFieldValue(fieldValue)}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: basicColors.secondary }}
                  >
                    {getFieldLabel(fieldValue)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-1">
            {config.additionalFields.map((fieldValue) => (
              <div key={fieldValue} className="flex items-center text-sm" style={{ color: basicColors.text }}>
                <span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: basicColors.primary }}></span>
                <span>{getFieldLabel(fieldValue)}: {getFieldValue(fieldValue)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Base template structure
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm",
        config.orientation === "vertical" ? "aspect-[210/297]" : "aspect-[297/210]",
        "w-full h-full",
        className,
      )}
      data-testid={`template-basic-${config.orientation}`}
    >
      {/* Watermark overlay */}
      {config.showWatermark && (
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{ opacity: 0.1 }}
          data-testid="watermark"
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45">
            <span className="text-6xl font-bold text-gray-400">MUESTRA</span>
          </div>
        </div>
      )}

      {/* Header with clean basic styling */}
      <div
        className="p-6 pb-4"
        style={{ borderBottom: `1px solid ${basicColors.border}` }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            {/* Property type badge with listing type */}
            <div
              className="mb-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: basicColors.muted,
                color: basicColors.primary,
                border: `1px solid ${basicColors.border}`,
              }}
            >
              {data.propertyType.charAt(0).toUpperCase() + data.propertyType.slice(1)} en {config.listingType}
            </div>

            {/* Title */}
            <h2
              className={cn(
                "mb-2 font-semibold",
                config.orientation === "vertical" ? "text-xl" : "text-2xl"
              )}
              style={{ color: basicColors.text }}
            >
              {data.title}
            </h2>

            {/* Location */}
            <div
              className="flex items-center"
              style={{ color: basicColors.primary }}
            >
              <MapPin className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">{locationText}</span>
            </div>
          </div>

          {/* Price */}
          <div className="text-right">
            <div
              className={cn(
                "font-bold",
                config.orientation === "vertical" ? "text-2xl" : "text-3xl"
              )}
              style={{ color: basicColors.accent }}
            >
              {priceText}
            </div>
          </div>
        </div>
      </div>

      {/* Short description */}
      {config.showShortDescription && data.shortDescription && (
        <div className="px-6 pb-4">
          <p className="text-sm text-gray-600 italic">
            {data.shortDescription}
          </p>
        </div>
      )}

      {/* Image section */}
      <div
        className={cn(
          "relative mx-6 mb-3 overflow-hidden rounded-xl",
          config.orientation === "vertical" ? "h-[30%]" : "h-[40%]"
        )}
        style={{ backgroundColor: basicColors.muted }}
      >
        {renderImages()}
      </div>

      {/* Specifications with basic card design */}
      <div className="mb-4 px-6">
        {config.showIcons ? (
          <div className="grid grid-cols-3 gap-2">
            {data.specs.bedrooms && (
              <div
                className="rounded-lg p-2 text-center"
                style={{ backgroundColor: basicColors.muted }}
              >
                <Bed
                  className="mx-auto mb-1 h-4 w-4"
                  style={{ color: basicColors.primary }}
                />
                <div
                  className="text-xs font-medium"
                  style={{ color: basicColors.text }}
                >
                  {data.specs.bedrooms}
                </div>
                <div
                  className="text-xs"
                  style={{ color: basicColors.secondary }}
                >
                  hab.
                </div>
              </div>
            )}

            {data.specs.bathrooms && (
              <div
                className="rounded-lg p-2 text-center"
                style={{ backgroundColor: basicColors.muted }}
              >
                <Bath
                  className="mx-auto mb-1 h-4 w-4"
                  style={{ color: basicColors.primary }}
                />
                <div
                  className="text-xs font-medium"
                  style={{ color: basicColors.text }}
                >
                  {data.specs.bathrooms}
                </div>
                <div
                  className="text-xs"
                  style={{ color: basicColors.secondary }}
                >
                  baños
                </div>
              </div>
            )}

            <div
              className="rounded-lg p-2 text-center"
              style={{ backgroundColor: basicColors.muted }}
            >
              <Square
                className="mx-auto mb-1 h-4 w-4"
                style={{ color: basicColors.primary }}
              />
              <div
                className="text-xs font-medium"
                style={{ color: basicColors.text }}
              >
                {data.specs.squareMeters}
              </div>
              <div className="text-xs" style={{ color: basicColors.secondary }}>
                m²
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center text-sm" style={{ color: basicColors.text }}>
              <span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: basicColors.primary }}></span>
              <span>{data.specs.squareMeters} m²</span>
            </div>
            {data.specs.bedrooms && (
              <div className="flex items-center text-sm" style={{ color: basicColors.text }}>
                <span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: basicColors.primary }}></span>
                <span>{data.specs.bedrooms} habitaciones</span>
              </div>
            )}
            {data.specs.bathrooms && (
              <div className="flex items-center text-sm" style={{ color: basicColors.text }}>
                <span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: basicColors.primary }}></span>
                <span>{data.specs.bathrooms} baños</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Additional fields */}
      {renderAdditionalFields()}

      {/* Footer with contact and QR */}
      <div className="px-6 pb-4">
        <div
          className="flex items-center justify-between rounded-xl p-3"
          style={{ backgroundColor: basicColors.muted }}
        >
          <div className="flex-1">
            {config.showPhone && (
              <>
                <div
                  className="mb-1 text-xs font-medium"
                  style={{ color: basicColors.text }}
                >
                  Contacto
                </div>
                <div className="text-xs" style={{ color: basicColors.primary }}>
                  {data.contact.phone}
                </div>
              </>
            )}
            {data.contact.email && (
              <div
                className="mt-1 text-xs"
                style={{ color: basicColors.secondary }}
              >
                {data.contact.email}
              </div>
            )}
          </div>

          {/* QR Code */}
          {config.showQR && (
            <div className="flex-shrink-0">
              <PropertyQRCode
                phone={data.contact.phone}
                email={data.contact.email}
                size={config.orientation === "vertical" ? 50 : 60}
                className="rounded-lg shadow-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};