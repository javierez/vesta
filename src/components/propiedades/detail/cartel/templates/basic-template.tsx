"use client";

import React, { type FC } from "react";
import Image from "next/image";
import type { ConfigurableTemplateProps } from "~/types/template-data";
import { PropertyQRCode } from "~/components/admin/carteleria/qr-code";
import { getTemplateImages } from "~/lib/carteleria/s3-images";
import { formatLocation, formatPrice } from "~/lib/carteleria/mock-data";
import { cn } from "~/lib/utils";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Phone,
  Globe,
  Award,
} from "lucide-react";
import {
  PRINT_DIMENSIONS,
  getDimensionsForOrientation,
  getTypographySize,
} from "~/lib/carteleria/classic-vertical-constants";
import { injectPrintStyles } from "~/lib/carteleria/print-utils";

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
    default: "bg-gray-400",
    dark: "bg-gray-800",
    light: "bg-gray-200",
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
  };
  return overlayMap[overlayType] ?? "";
};

const getTextColorForOverlay = (overlayType: string) => {
  // Light overlay needs dark text, others need white text
  return overlayType === "light" ? "#1e293b" : "white";
};

export const BasicTemplate: FC<ConfigurableTemplateProps> = ({
  data,
  config,
  className,
}) => {
  // Inject print styles for PDF generation
  if (typeof window !== "undefined") {
    injectPrintStyles();
  }

  // Get fixed dimensions for print optimization first
  const containerDimensions = getDimensionsForOrientation(config.orientation);
  const overlayClass = getOverlayClass(config.overlayColor);
  const textColor = getTextColorForOverlay(config.overlayColor);

  // Component-specific print styles for wireframe layout
  const printStylesCSS = `
    @media print {
      .basic-template-container {
        width: ${containerDimensions.width}px !important;
        height: ${containerDimensions.height}px !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        page-break-inside: avoid !important;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .basic-template-container * {
        box-sizing: border-box !important;
      }
      
      .basic-template-container img {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .basic-template-container .no-break {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
    }
  `;

  // This is the BasicTemplate component - render WIREFRAME style layout
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = "none";
  };

  // Safe data object with fallbacks for missing properties
  const safeData = {
    ...data,
    propertyType: data.propertyType ?? "propiedad",
    title: data.title ?? "Propiedad en venta",
    location: {
      ...data.location,
      city: data.location?.city ?? "Ciudad",
      neighborhood: data.location?.neighborhood ?? "Zona",
    },
    specs: {
      ...data.specs,
      squareMeters: data.specs?.squareMeters ?? 0,
      bedrooms: data.specs?.bedrooms ?? 0,
      bathrooms: data.specs?.bathrooms ?? 0,
    },
    contact: {
      ...data.contact,
      phone: data.contact?.phone ?? "",
      email: data.contact?.email ?? "",
      website: data.contact?.website ?? "",
    },
    reference: data.reference ?? "",
    price: data.price ?? 0,
  };

  const priceText = formatPrice(
    data.price,
    data.propertyType,
    config.listingType,
  );

  // Get images from data prop (passed by the editor) or fallback to default S3 images
  const templateImages = data.images && data.images.length > 0 
    ? data.images 
    : getTemplateImages(config.imageCount);

  // Wireframe-based responsive image gallery
  const renderImageGallery = () => {
    if (templateImages.length === 0) return null;

    const imageCount = Math.min(templateImages.length, config.imageCount);
    
    // Base styles for all image containers
    const imageContainerStyle: React.CSSProperties = {
      overflow: "hidden",
      backgroundColor: "#f3f4f6",
      position: "relative",
    };

    if (imageCount === 2) {
      // 2 Photos: 1fr 1fr layout
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            width: "100%",
            height: "100%",
          }}
        >
          {templateImages.slice(0, 2).map((image, index) => (
            <div key={index} style={imageContainerStyle}>
              {image && (
                <Image
                  src={image}
                  alt={`${data.title} - Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={handleImageError}
                  style={{
                    objectPosition: data.imagePositions?.[image]
                      ? `${data.imagePositions[image]?.x ?? 50}% ${data.imagePositions[image]?.y ?? 50}%`
                      : "50% 50%",
                  }}
                />
              )}
              {renderWatermark("medium")}
            </div>
          ))}
        </div>
      );
    }

    if (imageCount === 3) {
      // 3 Photos: Hero + two below
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "2fr 1fr",
            gap: "12px",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Hero image spans 2 columns */}
          <div style={{ ...imageContainerStyle, gridColumn: "1 / -1" }}>
            {templateImages[0] && (
              <Image
                src={templateImages[0]}
                alt={`${data.title} - Imagen principal`}
                fill
                className="object-cover"
                onError={handleImageError}
                style={{
                  objectPosition: data.imagePositions?.[templateImages[0]]
                    ? `${data.imagePositions[templateImages[0]]?.x ?? 50}% ${data.imagePositions[templateImages[0]]?.y ?? 50}%`
                    : "50% 50%",
                }}
                priority
              />
            )}
            {renderWatermark("large")}
          </div>
          
          {/* Two smaller images below */}
          {templateImages.slice(1, 3).map((image, index) => (
            <div key={index + 1} style={imageContainerStyle}>
              {image && (
                <Image
                  src={image}
                  alt={`${data.title} - Imagen ${index + 2}`}
                  fill
                  className="object-cover"
                  onError={handleImageError}
                  style={{
                    objectPosition: data.imagePositions?.[image]
                      ? `${data.imagePositions[image]?.x ?? 50}% ${data.imagePositions[image]?.y ?? 50}%`
                      : "50% 50%",
                  }}
                />
              )}
              {renderWatermark("small")}
            </div>
          ))}
        </div>
      );
    }

    // 4 Photos: 2x2 uniform grid
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: "12px",
          width: "100%",
          height: "100%",
        }}
      >
        {templateImages.slice(0, 4).map((image, index) => (
          <div key={index} style={imageContainerStyle}>
            {image && (
              <Image
                src={image}
                alt={`${data.title} - Imagen ${index + 1}`}
                fill
                className="object-cover"
                onError={handleImageError}
                style={{
                  objectPosition: data.imagePositions?.[image]
                    ? `${data.imagePositions[image]?.x ?? 50}% ${data.imagePositions[image]?.y ?? 50}%`
                    : "50% 50%",
                }}
                priority={index === 0}
              />
            )}
            {renderWatermark(index === 0 ? "large" : "small")}
          </div>
        ))}
      </div>
    );
  };

  // Render logo watermark for individual images
  const renderWatermark = (size: "large" | "medium" | "small") => {
    if (!config.showWatermark) return null;

    const sizeMap = {
      large: { width: 200, height: 200 },
      medium: { width: 150, height: 150 },
      small: { width: 100, height: 100 },
    };

    const { width, height } = sizeMap[size];

    return (
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        {data.logoUrl && (
          <Image
            src={data.logoUrl}
            alt="Logo watermark"
            width={width}
            height={height}
            className="object-contain opacity-20"
          />
        )}
      </div>
    );
  };

  // Inject component-specific print styles
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      const styleId = "basic-template-print-styles";
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;

      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      styleElement.textContent = printStylesCSS;
    }
  }, [printStylesCSS]);

  // Calculate section heights to fit within A4 bounds (794x1123 for vertical)
  // Fixed heights optimized for A4 paper - using exact measurements
  const headerHeight = 80; // Header with title and reference
  const descriptionHeight = config.showShortDescription && data.shortDescription ? 45 : 0;
  const statsHeight = 60; // Property stats row
  const bottomStripHeight = 60; // QR, Price, Energy
  const footerHeight = 45; // Contact bar
  
  // Calculate remaining space for gallery (ensure total = containerDimensions.height)
  const totalFixedHeight = headerHeight + descriptionHeight + statsHeight + bottomStripHeight + footerHeight;
  const galleryHeight = containerDimensions.height - totalFixedHeight;

  // Wireframe-structured layout
  return (
    <div
      className={cn("basic-template-container no-break", className)}
      style={{
        position: "relative",
        overflow: "hidden",
        width: `${containerDimensions.width}px`,
        height: `${containerDimensions.height}px`,
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        margin: 0,
        padding: 0,
      }}
      data-testid={`template-wireframe-${config.orientation}`}
    >
      {/* 1. HEADER BAR - Title left, Reference right */}
      <div
        className={overlayClass}
        style={{
          height: `${headerHeight}px`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: "20px",
          paddingRight: "20px",
          borderBottom: overlayClass ? "none" : "2px solid #e2e8f0",
          flexShrink: 0,
          boxSizing: "border-box",
          backgroundColor: overlayClass ? undefined : "#f8fafc",
        }}
      >
        <div>
          <h1
            className={cn(
              "font-bold uppercase",
              getFontClass(config.titleFont),
            )}
            style={{
              fontSize: `${Math.min(getTypographySize("title"), 24)}px`,
              lineHeight: "1.1",
              margin: 0,
              color: textColor,
            }}
          >
            {config.listingType} {safeData.propertyType}
          </h1>
        </div>
        
        {config.showReference && data.reference && (
          <div
            className="font-medium uppercase"
            style={{
              fontSize: `${getTypographySize("reference")}px`,
              letterSpacing: "0.05em",
              color: overlayClass ? textColor : "#64748b",
            }}
          >
            {data.reference}
          </div>
        )}
      </div>

      {/* 2. OPTIONAL DESCRIPTION - Collapses if empty */}
      {config.showShortDescription && data.shortDescription && (
        <div
          style={{
            height: `${descriptionHeight}px`,
            display: "flex",
            alignItems: "center",
            paddingLeft: "20px",
            paddingRight: "20px",
            backgroundColor: "#ffffff",
            flexShrink: 0,
            boxSizing: "border-box",
          }}
        >
          <p
            className={cn(getFontClass(config.descriptionFont))}
            style={{
              fontSize: `${config.descriptionSize || 16}px`,
              lineHeight: "1.4",
              margin: 0,
              color: config.descriptionColor || "#374151",
              textAlign: config.descriptionAlignment || "left",
            }}
          >
            {data.shortDescription}
          </p>
        </div>
      )}

      {/* 3. IMAGE GALLERY - Centerpiece */}
      <div
        style={{
          height: `${galleryHeight}px`,
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingTop: "20px",
          paddingBottom: "20px",
          backgroundColor: "#ffffff",
          flexGrow: 1,
          flexShrink: 0,
          boxSizing: "border-box",
        }}
      >
        {renderImageGallery()}
      </div>

      {/* 4. STATS ROW - Beds, Baths, Area */}
      <div
        style={{
          height: `${statsHeight}px`,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
          paddingLeft: "20px",
          paddingRight: "20px",
          backgroundColor: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          borderBottom: "1px solid #e2e8f0",
          flexShrink: 0,
          boxSizing: "border-box",
        }}
      >
        {/* Bedrooms */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Bed size={24} color="#64748b" />
          <span
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1e293b",
            }}
          >
            {safeData.specs.bedrooms || 0}
          </span>
        </div>

        {/* Bathrooms */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Bath size={24} color="#64748b" />
          <span
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1e293b",
            }}
          >
            {safeData.specs.bathrooms || 0}
          </span>
        </div>

        {/* Square meters */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Maximize size={24} color="#64748b" />
          <span
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1e293b",
            }}
          >
            {safeData.specs.squareMeters}m²
          </span>
        </div>
      </div>

      {/* 5. BOTTOM STRIP - QR, Price, Energy */}
      <div
        style={{
          height: `${bottomStripHeight}px`,
          display: "grid",
          gridTemplateColumns: "1fr 2fr 1fr",
          gap: "16px",
          paddingLeft: "20px",
          paddingRight: "20px",
          backgroundColor: "#ffffff",
          alignItems: "center",
          flexShrink: 0,
          boxSizing: "border-box",
        }}
      >
        {/* QR Code */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          {config.showQR && (
            <PropertyQRCode
              phone={data.contact.phone}
              email={data.contact.email}
              size={60}
              className="border-0 bg-transparent p-0 shadow-none"
            />
          )}
        </div>

        {/* Price - Center */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            className={cn(
              "font-bold",
              getFontClass(config.priceFont),
            )}
            style={{
              fontSize: `${Math.min(getTypographySize("price"), 32)}px`,
              lineHeight: "1.1",
              color: "#1e293b",
              textAlign: "center",
            }}
          >
            {config.listingType === "alquiler" ? (
              <>
                {priceText.replace(" €/mes", "")}
                <span
                  className="font-normal"
                  style={{
                    fontSize: `${Math.min(getTypographySize("body"), 18)}px`,
                    color: "#64748b",
                  }}
                >
                  {" €/mes"}
                </span>
              </>
            ) : (
              priceText
            )}
          </div>
        </div>

        {/* Energy Label */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          {data.energyConsumptionScale && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 12px",
                backgroundColor: "#f1f5f9",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
              }}
            >
              <Award size={16} color="#64748b" />
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                {data.energyConsumptionScale}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 6. FOOTER BAR - Website left, Phone right */}
      <div
        className={overlayClass}
        style={{
          height: `${footerHeight}px`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: "20px",
          paddingRight: "20px",
          backgroundColor: overlayClass ? undefined : "#1e293b",
          color: textColor,
          flexShrink: 0,
          boxSizing: "border-box",
        }}
      >
        {/* Website */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {config.showWebsite && data.contact.website && (
            <>
              <Globe size={16} color={textColor} />
              <span
                style={{
                  fontSize: `${getTypographySize("contact")}px`,
                  color: textColor,
                }}
              >
                {data.contact.website.replace(/^https?:\/\/(www\.)?/, "")}
              </span>
            </>
          )}
        </div>

        {/* Phone */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {config.showPhone && data.contact.phone && (
            <>
              <Phone size={16} color={textColor} />
              <span
                style={{
                  fontSize: `${getTypographySize("contact")}px`,
                  color: textColor,
                }}
              >
                {data.contact.phone}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};