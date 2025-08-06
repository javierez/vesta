"use client";

import type { FC } from "react";
import Image from "next/image";
import type { ConfigurableTemplateProps } from "~/types/template-data";
import { BasicTemplate } from "../basic-template";
import { PropertyQRCode } from "../../qr-code";
import { getTemplateImages } from "~/lib/carteleria/s3-images";
import { formatLocation, formatPrice } from "~/lib/carteleria/mock-data";
import { cn } from "~/lib/utils";
import { FeaturesGrid } from "./features-grid";
import {
  MapPin,
  Calendar,
  Car,
  Home,
  Compass,
  Flame,
  Phone,
  Mail,
  Package,
  Trees,
  Wrench,
  ArrowUp,
  Award,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Import other templates when available
// import { ClassicTemplate } from "./classic-template";
// import { LuxuryTemplate } from "./luxury-template";
// import { ProfessionalTemplate } from "./professional-template";
// import { CreativeTemplate } from "./creative-template";

// Modern overlay style color palette - for white text on dark overlay
const modernColors = {
  overlay: "bg-gray-400/70", // More transparent overlay (reduced to 35%)
  qrBackground: "bg-black", // Black background for QR code
  text: "text-white", // White text for contrast
  iconText: "text-white", // White icon text
  price: "text-white", // White price text
  badge: "bg-white/20 text-white border-white/30", // Semi-transparent white badge
};

export const ClassicTemplate: FC<ConfigurableTemplateProps> = ({
  data,
  config,
  className,
}) => {
  // Route to different template components based on style
  switch (config.templateStyle) {
    case "basic":
      return (
        <BasicTemplate data={data} config={config} className={className} />
      );

    case "classic":
      // return <ClassicTemplate data={data} config={config} className={className} />;
      // Fallback to modern until classic is implemented
      break;

    case "luxury":
      // return <LuxuryTemplate data={data} config={config} className={className} />;
      // Fallback to modern until luxury is implemented
      break;

    case "professional":
      // return <ProfessionalTemplate data={data} config={config} className={className} />;
      // Fallback to modern until professional is implemented
      break;

    case "creative":
      // return <CreativeTemplate data={data} config={config} className={className} />;
      // Fallback to modern until creative is implemented
      break;

    case "modern":
    default:
      // Modern template implementation below
      break;
  }
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = "none";
  };

  const locationText = formatLocation(data.location);
  
  // Split location text based on listing type character limit
  const formatLocationWithBreak = (text: string) => {
    const charLimit = config.listingType === 'alquiler' ? 18 : 15;
    
    if (text.length <= charLimit) return text;
    
    // Find a good break point (prefer breaking at comma or space)
    let breakPoint = text.lastIndexOf(', ', charLimit);
    if (breakPoint === -1) breakPoint = text.lastIndexOf(' ', charLimit);
    if (breakPoint === -1) breakPoint = charLimit;
    
    return (
      <>
        {text.substring(0, breakPoint)}
        <br />
        {text.substring(breakPoint).trim()}
      </>
    );
  };
  const priceText = formatPrice(
    data.price,
    data.propertyType,
    config.listingType,
  );

  // Get images based on configuration
  const templateImages = getTemplateImages(config.imageCount);

  // Render image gallery with orientation-specific layouts
  const renderImages = () => {
    if (templateImages.length === 0) return null;

    if (config.orientation === "vertical") {
      // Vertical layout - stack images vertically with proper proportions
      if (config.imageCount === 4) {
        return (
          <div className="absolute inset-0 grid grid-rows-12 gap-0.5 bg-white">
            {/* Main image - reduced to 50% of vertical space (6 rows) */}
            <div className="relative row-span-6 overflow-hidden">
              <Image
                src={templateImages[0]!}
                alt={`${data.title} - Imagen principal`}
                fill
                className="object-cover"
                onError={handleImageError}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            {/* Supporting images - increased to 50% of vertical space (6 rows) split into 3 columns */}
            <div className="row-span-6 grid grid-cols-3 gap-0.5">
              {templateImages.slice(1, 4).map((image, index) => (
                <div key={index} className="relative overflow-hidden">
                  <Image
                    src={image}
                    alt={`${data.title} - Imagen ${index + 2}`}
                    fill
                    className="object-cover"
                    onError={handleImageError}
                    sizes="(max-width: 768px) 33vw, (max-width: 1200px) 16vw, 11vw"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      } else {
        // 3 images vertical: main image on top, 2 supporting below
        return (
          <div className="absolute inset-0 grid grid-rows-12 gap-0.5 bg-white">
            {/* Main image - reduced to 50% of vertical space (6 rows) */}
            <div className="relative row-span-6 overflow-hidden">
              <Image
                src={templateImages[0]!}
                alt={`${data.title} - Imagen principal`}
                fill
                className="object-cover"
                onError={handleImageError}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            {/* Supporting images - increased to 50% of vertical space (6 rows) split into 2 columns */}
            <div className="row-span-6 grid grid-cols-2 gap-0.5">
              {templateImages.slice(1, 3).map((image, index) => (
                <div key={index} className="relative overflow-hidden">
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
        );
      }
    } else {
      // Horizontal layout - main image takes 65% horizontally
      return (
        <div className="absolute inset-0 grid grid-cols-12 gap-0.5 bg-white">
          {/* Main image - 65% of horizontal space */}
          <div className="relative col-span-8 overflow-hidden">
            <Image
              src={templateImages[0]!}
              alt={`${data.title} - Imagen principal`}
              fill
              className="object-cover"
              onError={handleImageError}
              sizes="(max-width: 768px) 65vw, (max-width: 1200px) 65vw, 65vw"
            />
          </div>

          {/* Supporting images - 35% of horizontal space */}
          <div className="col-span-4 grid gap-0.5">
            {config.imageCount === 4 ? (
              // 4 images: show 3 supporting images in a column
              <>
                {templateImages.slice(1, 4).map((image, index) => (
                  <div key={index} className="relative overflow-hidden">
                    <Image
                      src={image}
                      alt={`${data.title} - Imagen ${index + 2}`}
                      fill
                      className="object-cover"
                      onError={handleImageError}
                      sizes="(max-width: 768px) 35vw, (max-width: 1200px) 35vw, 35vw"
                    />
                  </div>
                ))}
              </>
            ) : (
              // 3 images: show 2 supporting images stacked
              <>
                {templateImages.slice(1, 3).map((image, index) => (
                  <div key={index} className="relative overflow-hidden">
                    <Image
                      src={image}
                      alt={`${data.title} - Imagen ${index + 2}`}
                      fill
                      className="object-cover"
                      onError={handleImageError}
                      sizes="(max-width: 768px) 35vw, (max-width: 1200px) 35vw, 35vw"
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      );
    }
  };

  // Helper functions for additional fields
  const getFieldIcon = (fieldValue: string) => {
    const iconMap: Record<string, LucideIcon> = {
      energyConsumptionScale: Award,
      yearBuilt: Calendar,
      hasElevator: ArrowUp,
      hasGarage: Car,
      hasStorageRoom: Package,
      terrace: Trees,
      orientation: Compass,
      heatingType: Flame,
      conservationStatus: Wrench,
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
    const value = (data as unknown as Record<string, unknown>)[fieldValue];

    if (value === undefined || value === null) return "N/A";
    if (typeof value === "boolean") return value ? "Sí" : "No";
    if (fieldValue === "conservationStatus" && typeof value === "number") {
      const statusMap: Record<number, string> = {
        1: "Bueno",
        2: "Muy bueno",
        3: "Como nuevo",
        4: "A reformar",
        6: "Reformado",
      };
      return statusMap[value] ?? "N/A";
    }
    if (typeof value === "object" && value !== null) {
      return "N/A"; // Don't stringify objects
    }
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
    return "N/A";
  };

  // Calculate total number of features for layout decisions
  const getTotalFeatures = () => {
    let count = 1; // Always have square meters
    if (data.specs.bathrooms) count++;
    if (data.specs.bedrooms) count++;
    count += Math.min(config.additionalFields.length, 3); // Max 3 additional fields
    return count;
  };

  const totalFeatures = getTotalFeatures();
  const shouldCompactIcons = totalFeatures > 4; // Compact icons when more than 4 features
  
  // Adjust price font size based on number of digits
  const priceDigits = data.price.toString().length;
  const priceFontSize = priceDigits >= 8 ? "19px" : priceDigits >= 7 ? "21px" : "24px";

  // New overlay-based template structure
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        config.orientation === "vertical"
          ? "aspect-[210/297]"
          : "aspect-[297/210]",
        "h-full w-full",
        className,
      )}
      data-testid={`template-configurable-${config.orientation}`}
    >
      {/* Background images layer (z-0) */}
      <div className="absolute inset-0 z-0">{renderImages()}</div>

      {/* Left overlay - fixed height, variable width (z-10) */}
      <div
        className={cn(
          "absolute left-2 top-2 z-10 h-[50%]",
          modernColors.overlay,
          "backdrop-blur-sm"
        )}
      >
        <div className="flex h-full flex-col p-4">
          {/* Top section with title and content - variable size */}
          <div className="flex-1">
            {/* Title - listing type and property type */}
            <div className="mb-3">
              <h2
                className={cn(
                  "font-bold leading-tight uppercase",
                  modernColors.text,
                )}
                style={{ fontSize: "28px" }}
              >
                {config.listingType}
              </h2>
              <h3
                className={cn(
                  "font-bold leading-tight uppercase",
                  modernColors.text,
                )}
                style={{ fontSize: "28px" }}
              >
                {data.propertyType}
              </h3>
            </div>

            {/* Location and features - right under title */}
            <div className="space-y-2">
            {/* Location */}
            <div
              className={cn(
                "inline-flex items-start rounded-lg bg-white/20 px-3 py-1",
                modernColors.text,
              )}
            >
              <MapPin className="-ml-1 mr-1 h-4 w-4 flex-shrink-0" />
              <span className="font-medium" style={{ fontSize: "12px" }}>{formatLocationWithBreak(locationText)}</span>
            </div>

            {/* Grid of characteristics - tight grouping */}
            <FeaturesGrid 
              data={data}
              config={config}
              modernColors={modernColors}
              getFieldIcon={getFieldIcon}
              getFieldValue={getFieldValue}
              getFieldLabel={getFieldLabel}
              shouldCompact={shouldCompactIcons}
            />
            </div>
          </div>

          {/* Bottom section with price - always shown */}
          <div className="text-center mt-auto">
            <div className={cn("font-bold", modernColors.price)} style={{ fontSize: priceFontSize }}>
              {config.listingType === "alquiler" ? (
                <>
                  {priceText.replace(" €/mes", "")}
                  <span className="font-normal" style={{ fontSize: "12px" }}> €/mes</span>
                </>
              ) : (
                priceText
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom right contact overlay (z-10) */}
      {(config.showPhone || data.contact.email) && (
        <div
          className={cn(
            "absolute bottom-3 right-3 z-10",
            modernColors.overlay,
            "rounded-md backdrop-blur-sm"
          )}
        >
          <div className="px-3 py-2">
            {/* Contact info with icons */}
            <div className="space-y-1">
              {config.showPhone && (
                <div className={cn("flex items-center gap-1.5", modernColors.text)}>
                  <Phone className="h-3 w-3" />
                  <span style={{ fontSize: "12px" }}>{data.contact.phone}</span>
                </div>
              )}
              {data.contact.email && (
                <div className={cn("flex items-center gap-1.5", modernColors.text)}>
                  <Mail className="h-3 w-3" />
                  <span style={{ fontSize: "11px" }}>{data.contact.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Code in top-right corner (z-20) - much smaller size */}
      {config.showQR && (
        <div className="absolute right-2 top-2 z-20">
          <PropertyQRCode
            phone={data.contact.phone}
            email={data.contact.email}
            size={config.orientation === "vertical" ? 20 : 25}
            className="border-0 bg-transparent p-0 shadow-none"
          />
        </div>
      )}

      {/* Logo watermark overlay - positioned over all images */}
      {config.showWatermark && (
        <div
          className="pointer-events-none absolute inset-0 z-30"
          style={{ opacity: 0.15 }}
          data-testid="watermark"
        >
          {/* TODO: Replace with actual logo from account.brandAsset.logoTransparentUrl */}
          {/* For now, keeping text watermark until logo URL is available in props */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 transform">
            <span className="font-bold text-white opacity-60" style={{ fontSize: "48px" }}>ACROPOLIS</span>
          </div>
          
          {/* Future implementation when logo URL is available:
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
            <Image
              src={config.logoUrl} // Need to add this to TemplateConfiguration
              alt="Logo watermark"
              width={120}
              height={120}
              className="object-contain opacity-60"
            />
          </div>
          */}
        </div>
      )}
    </div>
  );
};
