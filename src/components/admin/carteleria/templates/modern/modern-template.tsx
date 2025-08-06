"use client";

import type { FC } from "react";
import Image from "next/image";
import type { ConfigurableTemplateProps } from "~/types/template-data";
import { BasicTemplate } from "../basic-template";
import { PropertyQRCode } from "../../qr-code";
import { getTemplateImages } from "~/lib/carteleria/s3-images";
import { formatPrice } from "~/lib/carteleria/mock-data";
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
  Globe,
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

// Helper functions for dynamic styling
const getFontClass = (fontType: string) => {
  const fontMap: Record<string, string> = {
    default: "font-sans",
    serif: "font-serif",
    sans: "font-sans", 
    mono: "font-mono",
    elegant: "font-serif",
    modern: "font-sans font-light",
  };
  return fontMap[fontType] ?? "font-sans";
};

const getOverlayClass = (overlayType: string) => {
  const overlayMap: Record<string, string> = {
    default: "bg-gray-400/70",
    dark: "bg-gray-800/80",
    light: "bg-gray-200/80",
    blue: "bg-blue-500/70",
    green: "bg-green-500/70", 
    purple: "bg-purple-500/70",
    red: "bg-red-500/70",
  };
  return overlayMap[overlayType] ?? "bg-gray-400/70";
};

const getTextColor = (overlayType: string) => {
  // Light overlay needs dark text, others need white text
  return overlayType === "light" ? "text-gray-900" : "text-white";
};

export const ModernTemplate: FC<ConfigurableTemplateProps> = ({
  data,
  config,
  className,
}) => {
  // Get dynamic colors based on config
  const modernColors = {
    overlay: getOverlayClass(config.overlayColor),
    qrBackground: "bg-black",
    text: getTextColor(config.overlayColor),
    iconText: getTextColor(config.overlayColor),
    price: getTextColor(config.overlayColor),
    badge: `bg-white/20 ${getTextColor(config.overlayColor)} border-white/30`,
  };

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

  
  // Format location with truncation + line breaks
  const formatLocationWithTruncationAndBreaks = (location: { city: string; neighborhood: string }) => {
    let city = location.city;
    let neighborhood = location.neighborhood;
    
    // Step 1: Truncate if total > 30 chars
    const formatLength = neighborhood.length + city.length + 3; // +3 for " ()"
    
    if (formatLength > 30) {
      // Need to truncate - target is 27 chars of text (30 - 3 for formatting)
      const targetTextLength = 27;
      
      // Truncate the longer one first
      if (neighborhood.length >= city.length) {
        // Truncate neighborhood first
        if (city.length + 3 < targetTextLength) {
          const availableForNeighborhood = targetTextLength - city.length - 3;
          neighborhood = neighborhood.substring(0, availableForNeighborhood) + '...';
        } else {
          // Both need truncating, split available space
          const halfSpace = Math.floor(targetTextLength / 2);
          neighborhood = neighborhood.substring(0, halfSpace - 2) + '...';
          city = city.substring(0, targetTextLength - halfSpace - 1) + '...';
        }
      } else {
        // Truncate city first
        if (neighborhood.length + 3 < targetTextLength) {
          const availableForCity = targetTextLength - neighborhood.length - 3;
          city = city.substring(0, availableForCity) + '...';
        } else {
          // Both need truncating, split available space
          const halfSpace = Math.floor(targetTextLength / 2);
          city = city.substring(0, halfSpace - 2) + '...';
          neighborhood = neighborhood.substring(0, targetTextLength - halfSpace - 1) + '...';
        }
      }
    }
    
    // Step 2: Apply line breaks based on listing type
    const text = `${neighborhood} (${city})`;
    const charLimit = config.listingType === 'alquiler' ? 18 : 15;
    
    if (text.length <= charLimit) {
      return text;
    }
    
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
              {renderWatermark('large')}
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
                  {renderWatermark('small')}
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
              {renderWatermark('large')}
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
                  {renderWatermark('medium')}
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
            {renderWatermark('large')}
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
                    {renderWatermark('small')}
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
                    {renderWatermark('medium')}
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

  // Generate descriptive text for short description mode
  // Render logo watermark for individual images
  const renderWatermark = (size: 'large' | 'medium' | 'small') => {
    if (!config.showWatermark) return null;
    
    const sizeMap = {
      large: { width: 120, height: 120 },
      medium: { width: 80, height: 80 },
      small: { width: 60, height: 60 }
    };
    
    const { width, height } = sizeMap[size];
    
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <Image
          src="https://inmobiliariaacropolis.s3.us-east-1.amazonaws.com/branding/logo_transparent_1754307054237_gBmkUg.png"
          alt="Logo watermark"
          width={width}
          height={height}
          className="object-contain opacity-20"
        />
      </div>
    );
  };

  const generateShortDescription = () => {
    const parts: string[] = [];
    
    // Start with property type and location
    parts.push(`${data.propertyType.charAt(0).toUpperCase() + data.propertyType.slice(1)} en ${data.location.neighborhood}, ${data.location.city}`);
    
    // Add basic specs
    const specs: string[] = [];
    if (data.specs.bedrooms || data.specs.bathrooms) {
      const roomSpecs: string[] = [];
      if (data.specs.bedrooms) {
        roomSpecs.push(data.specs.bedrooms === 1 ? "una habitación" : `${data.specs.bedrooms} habitaciones`);
      }
      if (data.specs.bathrooms) {
        roomSpecs.push(data.specs.bathrooms === 1 ? "un baño" : `${data.specs.bathrooms} baños`);
      }
      specs.push(`Cuenta con ${roomSpecs.join(" y ")}`);
    }
    specs.push(`${data.specs.squareMeters} metros cuadrados`);
    
    if (specs.length > 0) {
      parts.push(specs.join(", "));
    }
    
    // Add additional features
    const features: string[] = [];
    config.additionalFields.slice(0, 3).forEach((fieldValue) => {
      const value = getFieldValue(fieldValue);
      const label = getFieldLabel(fieldValue);
      
      if (value !== "N/A") {
        switch (fieldValue) {
          case "hasElevator":
            if (value === "Sí") features.push("Con ascensor");
            break;
          case "hasGarage":
            if (value === "Sí") features.push("Con garaje");
            break;
          case "hasStorageRoom":
            if (value === "Sí") features.push("Con trastero");
            break;
          case "terrace":
            if (value === "Sí") features.push("Con terraza");
            break;
          case "energyConsumptionScale":
            features.push(`Certificación energética ${value}`);
            break;
          case "yearBuilt":
            features.push(`Construido en ${value}`);
            break;
          case "orientation":
            features.push(`Orientación ${value}`);
            break;
          case "heatingType":
            features.push(`Calefacción ${value}`);
            break;
          case "conservationStatus":
            features.push(`Estado ${value.toLowerCase()}`);
            break;
          default:
            features.push(`${label} ${value}`);
        }
      }
    });
    
    // Join all parts into one continuous text
    let fullText = parts.join(". ");
    if (features.length > 0) {
      fullText += ". " + features.join(". ");
    }
    fullText += ".";
    
    const charLimit = config.listingType === 'alquiler' ? 21 : 18;
    
    // Split text into lines based on character limit
    const words = fullText.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (testLine.length <= charLimit) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Single word longer than limit, force add it
          lines.push(word);
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return (
      <>
        {lines.map((line, index) => (
          <span key={index}>
            {line}
            {index < lines.length - 1 && <br />}
          </span>
        ))}
      </>
    );
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
          "absolute left-0 top-0 z-10 h-[50%]",
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
                  getFontClass(config.titleFont)
                )}
                style={{ fontSize: "28px" }}
              >
                {config.listingType}
              </h2>
              <h3
                className={cn(
                  "font-bold leading-tight uppercase",
                  modernColors.text,
                  getFontClass(config.titleFont)
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
              <span className="font-medium" style={{ fontSize: "12px" }}>{formatLocationWithTruncationAndBreaks(data.location)}</span>
            </div>

            {/* Features display - icons, bullets, or text */}
            {config.showShortDescription ? (
              <div className={cn("mt-4 leading-relaxed", modernColors.text)} style={{ fontSize: "11px" }}>
                {generateShortDescription()}
              </div>
            ) : (
              <FeaturesGrid 
                data={data}
                config={config}
                modernColors={modernColors}
                getFieldIcon={getFieldIcon}
                getFieldValue={getFieldValue}
                getFieldLabel={getFieldLabel}
                shouldCompact={shouldCompactIcons}
              />
            )}
            </div>
          </div>

          {/* Bottom section with price - always shown */}
          <div className="text-center mt-auto">
            <div className={cn("font-bold", modernColors.price, getFontClass(config.priceFont))} style={{ fontSize: priceFontSize }}>
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
      {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
      {(config.showPhone || data.contact.email || (config.showWebsite && data.contact.website)) && (
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
                  <span style={{ fontSize: "11px" }}>{data.contact.phone}</span>
                </div>
              )}
              {data.contact.email && (
                <div className={cn("flex items-center gap-1.5", modernColors.text)}>
                  <Mail className="h-3 w-3" />
                  <span style={{ fontSize: "11px" }}>{data.contact.email}</span>
                </div>
              )}
              {config.showWebsite && data.contact.website && (
                <div className={cn("flex items-center gap-1.5", modernColors.text)}>
                  <Globe className="h-3 w-3" />
                  <span style={{ fontSize: "11px" }}>{data.contact.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Property reference in bottom-left corner (z-20) */}
      {config.showReference && data.reference && (
        <div className="absolute left-2 bottom-2 z-20">
          <span className={cn(
            "font-medium uppercase tracking-wide text-white"
          )} style={{ 
            fontSize: "9px"
          }}>
            {data.reference}
          </span>
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

    </div>
  );
};
