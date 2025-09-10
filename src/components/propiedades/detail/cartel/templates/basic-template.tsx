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
    white: "bg-white",
    black: "bg-black",
    gray: "bg-gray-500",
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
            {renderWatermark("medium")}
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

  // Calculate section heights to fit within A4 bounds - flexible approach
  // Base heights that can adapt to content
  const headerHeight = Math.max(120, config.showShortDescription && data.shortDescription ? 140 : 120);
  const descriptionHeight = config.showShortDescription && data.shortDescription ? Math.max(30, 35) : 0;
  const statsHeight = 80; // Property stats row - increased for bigger icons
  const bottomStripHeight = 80; // QR, Price, Energy - increased for bigger price
  const footerHeight = 45; // Contact bar - keep fixed
  
  // Calculate remaining space for gallery with significantly reduced height for bigger icons/price
  const totalFixedHeight = headerHeight + descriptionHeight + statsHeight + bottomStripHeight + footerHeight;
  const calculatedGalleryHeight = containerDimensions.height - totalFixedHeight;
  const galleryHeight = Math.max(calculatedGalleryHeight - 40, 160); // Further reduced, minimum 160px

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
          <h2
            className={cn(
              "font-bold uppercase",
              getFontClass(config.titleFont),
            )}
            style={{
              fontSize: `${config.titleSize || getTypographySize("title")}px`,
              lineHeight: "1.1",
              margin: 0,
              marginBottom: "6px",
              color: config.titleColor || textColor,
              textAlign: config.titleAlignment || "left",
              transform: config.titlePositionX || config.titlePositionY 
                ? `translate(${config.titlePositionX || 0}px, ${config.titlePositionY || 0}px)` 
                : undefined,
            }}
          >
            {safeData.title}
          </h2>
          <div
            className={cn(
              "font-medium",
              getFontClass(config.locationFont),
            )}
            style={{
              fontSize: `${config.locationSize || getTypographySize("body")}px`,
              lineHeight: "1.2",
              margin: 0,
              color: config.locationColor || "#64748b",
              opacity: 0.9,
              textAlign: config.locationAlignment || "left",
              transform: config.locationPositionX || config.locationPositionY 
                ? `translate(${config.locationPositionX || 0}px, ${config.locationPositionY || 0}px)` 
                : undefined,
            }}
          >
            {formatLocation(safeData.location)}
          </div>
        </div>
        
        {/* QR Code - Top Right */}
        {config.showQR && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PropertyQRCode
              phone={data.contact.phone}
              email={data.contact.email}
              size={80}
              className="border-0 bg-transparent p-0 shadow-none"
            />
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
          minHeight: `${galleryHeight}px`,
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingTop: "0px",
          paddingBottom: "20px",
          backgroundColor: "#ffffff",
          flexGrow: 1,
          flexShrink: 1,
          boxSizing: "border-box",
          overflow: "hidden",
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
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
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
          <Bed size={32} color="#64748b" />
          <span
            style={{
              fontSize: "24px",
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
          <Bath size={32} color="#64748b" />
          <span
            style={{
              fontSize: "24px",
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
          <Maximize size={32} color="#64748b" />
          <span
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#1e293b",
            }}
          >
            {safeData.specs.squareMeters}m²
          </span>
        </div>
      </div>

      {/* 5. BOTTOM STRIP - Price, Energy */}
      <div
        style={{
          height: `${bottomStripHeight}px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          paddingLeft: "20px",
          paddingRight: "20px",
          backgroundColor: "#ffffff",
          flexShrink: 0,
          boxSizing: "border-box",
        }}
      >
        {/* Price - Centered and Prominent */}
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
              fontSize: `${config.priceSize || Math.min(getTypographySize("price"), 40)}px`,
              lineHeight: "1.1",
              color: config.priceColor || "#000000",
              textAlign: "center",
              transform: config.pricePositionX || config.pricePositionY 
                ? `translate(${config.pricePositionX || 0}px, ${config.pricePositionY || 0}px)` 
                : undefined,
            }}
          >
            {config.listingType === "alquiler" ? (
              <>
                {priceText.replace(" €/mes", "")}
                <span
                  className="font-normal"
                  style={{
                    fontSize: `${Math.min(getTypographySize("body"), 24)}px`,
                    color: config.priceColor ? `${config.priceColor}80` : "#00000080", // Use price color with opacity if set, default black with opacity
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