"use client";

import React, { type FC } from "react";
import Image from "next/image";
import type { ConfigurableTemplateProps } from "~/types/template-data";
import { PropertyQRCode } from "~/components/admin/carteleria/qr-code";
import { getTemplateImages } from "~/lib/carteleria/s3-images";
import { formatLocation, formatPrice } from "~/lib/carteleria/mock-data";
import { cn } from "~/lib/utils";
import {
  Bed,
  Bath,
  Maximize,
  Calendar,
  Car,
  Home,
  Compass,
  Flame,
  Package,
  Trees,
  Wrench,
  ArrowUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  getDimensionsForOrientation,
  getTypographySize,
} from "~/lib/carteleria/classic-vertical-constants";
import { injectPrintStyles } from "~/lib/carteleria/print-utils";
import { MiniEnergyCertificate } from "../mini-energy-certificate";

// Helper functions for dynamic styling (same as vertical template)
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

// Helper function to check if a color is a hex value
const isHexColor = (color: string): boolean => {
  return /^#([0-9A-F]{3}){1,2}$/i.test(color);
};

// Helper function to calculate luminance of a hex color
const getColorLuminance = (hex: string): number => {
  // Remove # if present
  const color = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;
  
  // Calculate relative luminance
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance;
};

const getOverlayClass = (overlayType: string) => {
  // If it's a hex color, return empty string (will be handled via inline styles)
  if (isHexColor(overlayType)) {
    return "";
  }
  
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
  // Handle hex colors with luminance calculation
  if (isHexColor(overlayType)) {
    const luminance = getColorLuminance(overlayType);
    // Use white text for dark backgrounds, dark text for light backgrounds
    return luminance > 0.5 ? "#1e293b" : "white";
  }
  
  // Light overlay needs dark text, others need white text
  return overlayType === "light" || overlayType === "white" ? "#1e293b" : "white";
};

// Helper functions for additional fields (same as vertical)
const getFieldIcon = (fieldValue: string) => {
  const iconMap: Record<string, LucideIcon> = {
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

const getFieldValue = (fieldValue: string, data: ConfigurableTemplateProps["data"]): string => {
  const value = (data as unknown as Record<string, unknown>)[fieldValue] as string | number | boolean | undefined | null;

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

export const BasicHorizontalTemplate: FC<ConfigurableTemplateProps> = ({
  data,
  config,
  className,
}) => {
  // Inject print styles for PDF generation
  if (typeof window !== "undefined") {
    injectPrintStyles();
  }

  // Get fixed dimensions for horizontal layout (landscape)
  const containerDimensions = getDimensionsForOrientation("horizontal");
  const overlayClass = getOverlayClass(config.overlayColor);
  const textColor = getTextColorForOverlay(config.overlayColor);

  // Component-specific print styles for horizontal layout
  const printStylesCSS = `
    @media print {
      .basic-horizontal-template-container {
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
      
      .basic-horizontal-template-container * {
        box-sizing: border-box !important;
      }
      
      .basic-horizontal-template-container img {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .basic-horizontal-template-container .no-break {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
    }
  `;

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

  // Horizontal-optimized image gallery
  const renderImageGallery = () => {
    if (templateImages.length === 0) return null;

    const imageCount = Math.min(templateImages.length, config.imageCount);
    
    // Base styles for all image containers
    const imageContainerStyle: React.CSSProperties = {
      overflow: "hidden",
      backgroundColor: "#f3f4f6",
      position: "relative",
    };

    if (imageCount === 1) {
      // 1 Photo: Fill entire gallery space
      return (
        <div style={imageContainerStyle}>
          {templateImages[0] && (
            <Image
              src={templateImages[0]}
              alt={`${data.title} - Imagen principal`}
              fill
              className="object-cover"
              onError={handleImageError}
              style={{
                objectPosition: data.imagePositions?.[templateImages[0]]
                  ? `${Math.max(0, Math.min(100, (data.imagePositions[templateImages[0]]?.x ?? 50)))}% ${Math.max(0, Math.min(100, (data.imagePositions[templateImages[0]]?.y ?? 50)))}%`
                  : "50% 50%",
              }}
              priority
            />
          )}
          {renderWatermark("large")}
          {config.showReference && renderReferenceOverlay(true)}
        </div>
      );
    }

    if (imageCount === 2) {
      // 2 Photos: Always horizontal layout for landscape template
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr",
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
                      ? `${Math.max(0, Math.min(100, (data.imagePositions[image]?.x ?? 50)))}% ${Math.max(0, Math.min(100, (data.imagePositions[image]?.y ?? 50)))}%`
                      : "50% 50%",
                    transform: `scale(${data.imagePositions?.[image]?.zoom ?? 1.0})`,
                    transformOrigin: 'center',
                  }}
                />
              )}
              {renderWatermark("medium")}
              {config.showReference && renderReferenceOverlay(index === 1)}
            </div>
          ))}
        </div>
      );
    }

    if (imageCount === 3) {
      // 3 Photos: Main image left, two stacked right (landscape optimized)
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: "12px",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Hero image spans 2 rows on the left */}
          <div style={{ ...imageContainerStyle, gridRow: "1 / -1" }}>
            {templateImages[0] && (
              <Image
                src={templateImages[0]}
                alt={`${data.title} - Imagen principal`}
                fill
                className="object-cover"
                onError={handleImageError}
                style={{
                  objectPosition: data.imagePositions?.[templateImages[0]]
                    ? `${Math.max(0, Math.min(100, (data.imagePositions[templateImages[0]]?.x ?? 50)))}% ${Math.max(0, Math.min(100, (data.imagePositions[templateImages[0]]?.y ?? 50)))}%`
                    : "50% 50%",
                  transform: `scale(${data.imagePositions?.[templateImages[0]]?.zoom ?? 1.0})`,
                  transformOrigin: 'center',
                }}
                priority
              />
            )}
            {renderWatermark("large")}
          </div>
          
          {/* Two smaller images stacked on the right */}
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
                      ? `${Math.max(0, Math.min(100, (data.imagePositions[image]?.x ?? 50)))}% ${Math.max(0, Math.min(100, (data.imagePositions[image]?.y ?? 50)))}%`
                      : "50% 50%",
                    transform: `scale(${data.imagePositions?.[image]?.zoom ?? 1.0})`,
                    transformOrigin: 'center',
                  }}
                />
              )}
              {renderWatermark("small")}
              {config.showReference && renderReferenceOverlay(index === 1)}
            </div>
          ))}
        </div>
      );
    }

    // 4 Photos: 2x2 grid
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
                    ? `${Math.max(0, Math.min(100, (data.imagePositions[image]?.x ?? 50)))}% ${Math.max(0, Math.min(100, (data.imagePositions[image]?.y ?? 50)))}%`
                    : "50% 50%",
                  transform: `scale(${data.imagePositions?.[image]?.zoom ?? 1.0})`,
                  transformOrigin: 'center',
                }}
                priority={index === 0}
              />
            )}
            {renderWatermark("medium")}
            {config.showReference && renderReferenceOverlay(index === 3)}
          </div>
        ))}
      </div>
    );
  };

  // Render logo watermark for individual images
  const renderWatermark = (size: "large" | "medium" | "small") => {
    if (!config.showWatermark) return null;

    const sizeMap = {
      large: { width: 300, height: 300 },
      medium: { width: 200, height: 200 },
      small: { width: 150, height: 150 },
    };

    const { width, height } = sizeMap[size];

    return (
      <div 
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
        style={{
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        {data.logoUrl && (
          <Image
            src={data.logoUrl}
            alt="Logo watermark"
            width={width}
            height={height}
            className="object-contain opacity-25"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
        )}
      </div>
    );
  };

  // Render reference text overlay for bottom right image
  const renderReferenceOverlay = (isBottomRight: boolean) => {
    if (!isBottomRight || !data.reference) return null;

    return (
      <div 
        className="pointer-events-none absolute bottom-2 right-2 z-20"
        style={{
          zIndex: 20,
          pointerEvents: 'none'
        }}
      >
        <span
          className="font-mono font-medium"
          style={{
            fontSize: '12px',
            color: config.referenceTextColor || '#000000',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '2px 6px',
            borderRadius: '2px',
            letterSpacing: '0.5px',
          }}
        >
          {data.reference}
        </span>
      </div>
    );
  };

  // Inject component-specific print styles
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      const styleId = "basic-horizontal-template-print-styles";
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;

      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      styleElement.textContent = printStylesCSS;
    }
  }, [printStylesCSS]);

  // HORIZONTAL LAYOUT STRUCTURE - Side-by-side design
  // Left side: Images, Right side: Content
  const leftPanelWidth = Math.round(containerDimensions.width * 0.6); // 60% for images
  const rightPanelWidth = containerDimensions.width - leftPanelWidth; // 40% for content

  return (
    <div
      className={cn("basic-horizontal-template-container no-break", className)}
      style={{
        position: "relative",
        overflow: "hidden",
        width: `${containerDimensions.width}px`,
        height: `${containerDimensions.height}px`,
        backgroundColor: "white",
        display: "flex",
        flexDirection: "row", // Horizontal layout
        boxSizing: "border-box",
        margin: 0,
        padding: 0,
      }}
      data-testid="template-horizontal-basic"
    >
      {/* LEFT PANEL - Image Gallery */}
      <div
        style={{
          width: `${leftPanelWidth}px`,
          height: "100%",
          padding: "20px",
          backgroundColor: "#ffffff",
          boxSizing: "border-box",
        }}
      >
        {renderImageGallery()}
      </div>

      {/* RIGHT PANEL - Content */}
      <div
        style={{
          width: `${rightPanelWidth}px`,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        {/* Header Section */}
        <div
          className={overlayClass}
          style={{
            minHeight: "120px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: "20px",
            paddingRight: "20px",
            paddingTop: "20px",
            paddingBottom: "20px",
            backgroundColor: isHexColor(config.overlayColor) ? config.overlayColor : (overlayClass ? undefined : "#f8fafc"),
            flexShrink: 0,
            boxSizing: "border-box",
          }}
        >
          <h2
            className={cn(
              "font-bold uppercase",
              getFontClass(config.titleFont),
            )}
            style={{
              fontSize: `${config.titleSize || getTypographySize("title")}px`,
              lineHeight: "1.1",
              margin: 0,
              marginBottom: "8px",
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

          {/* QR Code - Top Right Corner */}
          {config.showQR && (
            <div style={{ position: "absolute", top: "20px", right: "20px" }}>
              <PropertyQRCode
                phone={data.contact.phone}
                email={data.contact.email}
                size={60}
                className="border-0 bg-transparent p-0 shadow-none"
              />
            </div>
          )}
        </div>

        {/* Content Area - Flexible */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            paddingLeft: "20px",
            paddingRight: "20px",
            paddingTop: "20px",
            paddingBottom: "10px",
            backgroundColor: "#ffffff",
            boxSizing: "border-box",
          }}
        >
          {/* Price - Prominent Display */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "30px",
            }}
          >
            <div
              className={cn(
                "font-bold",
                getFontClass(config.priceFont),
              )}
              style={{
                fontSize: `${config.priceSize || Math.min(getTypographySize("price"), 56)}px`,
                lineHeight: "1.1",
                color: config.priceColor || "#000000",
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
                      fontSize: `${Math.min(getTypographySize("body"), 32)}px`,
                      color: config.priceColor ? `${config.priceColor}80` : "#00000080",
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

          {/* Description or Icons */}
          {config.showShortDescription && data.shortDescription ? (
            <div
              className={cn(getFontClass(config.descriptionFont || "default"))}
              style={{
                fontSize: `${config.descriptionSize || 16}px`,
                lineHeight: "1.4",
                color: config.descriptionColor || "#000000",
                textAlign: config.descriptionAlignment || "left",
                transform: config.descriptionPositionX || config.descriptionPositionY 
                  ? `translate(${config.descriptionPositionX || 0}px, ${config.descriptionPositionY || 0}px)` 
                  : undefined,
                whiteSpace: "pre-wrap",
                marginBottom: "20px",
              }}
            >
              {data.shortDescription}
            </div>
          ) : config.showIcons ? (
            /* Icon Grid - Horizontal Layout */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(3 + (config.additionalFields?.length || 0), 4)}, 1fr)`,
                gap: `${config.iconPairGap || 16}px`,
                marginBottom: "20px",
              }}
            >
              {/* Bedrooms */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: `${config.iconTextGap || 8}px`,
                }}
              >
                <Bed size={Math.round(28 * (config.iconSize || 1))} color="#64748b" />
                <span
                  style={{
                    fontSize: `${Math.round(20 * (config.iconSize || 1))}px`,
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
                  flexDirection: "column",
                  alignItems: "center",
                  gap: `${config.iconTextGap || 8}px`,
                }}
              >
                <Bath size={Math.round(28 * (config.iconSize || 1))} color="#64748b" />
                <span
                  style={{
                    fontSize: `${Math.round(20 * (config.iconSize || 1))}px`,
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
                  flexDirection: "column",
                  alignItems: "center",
                  gap: `${config.iconTextGap || 8}px`,
                }}
              >
                <Maximize size={Math.round(28 * (config.iconSize || 1))} color="#64748b" />
                <span
                  style={{
                    fontSize: `${Math.round(20 * (config.iconSize || 1))}px`,
                    fontWeight: "600",
                    color: "#1e293b",
                  }}
                >
                  {safeData.specs.squareMeters}m²
                </span>
              </div>

              {/* Additional Fields */}
              {config.additionalFields?.slice(0, 3).map((fieldValue) => {
                const value = getFieldValue(fieldValue, data);
                if (value === "N/A") return null;
                
                const IconComponent = getFieldIcon(fieldValue);
                
                return (
                  <div
                    key={fieldValue}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: `${config.iconTextGap || 8}px`,
                    }}
                  >
                    <IconComponent size={Math.round(28 * (config.iconSize || 1))} color="#64748b" />
                    <span
                      style={{
                        fontSize: `${Math.round(20 * (config.iconSize || 1))}px`,
                        fontWeight: "600",
                        color: "#1e293b",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Bullet List */
            <div style={{ marginBottom: "20px" }}>
              {data.iconListText ? (
                <div
                  className={cn(getFontClass(config.bulletFont || "default"))}
                  style={{
                    fontSize: `${config.bulletSize || 16}px`,
                    lineHeight: "1.5",
                    whiteSpace: "pre-wrap",
                    textAlign: config.bulletAlignment || "left",
                    color: config.bulletColor || "#000000",
                    transform: config.bulletPositionX || config.bulletPositionY 
                      ? `translate(${config.bulletPositionX || 0}px, ${config.bulletPositionY || 0}px)` 
                      : undefined,
                  }}
                >
                  {data.iconListText}
                </div>
              ) : (
                <ul
                  className={cn(getFontClass(config.bulletFont || "default"))}
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: `${config.iconTextGap || 8}px`,
                    fontSize: `${config.bulletSize || 16}px`,
                    lineHeight: "1.3",
                    textAlign: config.bulletAlignment || "left",
                    color: config.bulletColor || "#000000",
                    transform: config.bulletPositionX || config.bulletPositionY 
                      ? `translate(${config.bulletPositionX || 0}px, ${config.bulletPositionY || 0}px)` 
                      : undefined,
                  }}
                >
                  <li style={{ display: "flex", alignItems: "flex-start" }}>
                    <span style={{ marginRight: "8px", marginTop: "2px" }}>•</span>
                    <span>{safeData.specs.bedrooms} dormitorios</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "flex-start" }}>
                    <span style={{ marginRight: "8px", marginTop: "2px" }}>•</span>
                    <span>{safeData.specs.bathrooms} baños</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "flex-start" }}>
                    <span style={{ marginRight: "8px", marginTop: "2px" }}>•</span>
                    <span>{safeData.specs.squareMeters} m²</span>
                  </li>
                </ul>
              )}
            </div>
          )}

          {/* Energy Certificate - Only show for basic template when description is OFF and icons are ON */}
          {config.showIcons && !config.showShortDescription && config.showEnergyRating && config.energyConsumptionScale && (
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <MiniEnergyCertificate
                energyRating={config.energyConsumptionScale}
              />
            </div>
          )}
        </div>

        {/* Footer - Contact Bar */}
        <div
          className={overlayClass}
          style={{
            minHeight: "50px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: "20px",
            paddingRight: "20px",
            backgroundColor: isHexColor(config.overlayColor) ? config.overlayColor : (overlayClass ? undefined : "#1e293b"),
            color: textColor,
            flexShrink: 0,
            boxSizing: "border-box",
          }}
        >
          {/* Left contact element */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {config.showWebsite && data.contact.website && (
              <span
                style={{
                  fontSize: `${getTypographySize("contact")}px`,
                  color: textColor,
                }}
              >
                {data.contact.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
              </span>
            )}
            {config.showEmail && data.contact.email && !config.showWebsite && (
              <span
                style={{
                  fontSize: `${getTypographySize("contact")}px`,
                  color: textColor,
                }}
              >
                {data.contact.email}
              </span>
            )}
          </div>

          {/* Right contact element */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {config.showPhone && data.contact.phone && (
              <span
                style={{
                  fontSize: `${getTypographySize("contact")}px`,
                  color: textColor,
                }}
              >
                {data.contact.phone}
              </span>
            )}
            {config.showEmail && data.contact.email && config.showWebsite && !config.showPhone && (
              <span
                style={{
                  fontSize: `${getTypographySize("contact")}px`,
                  color: textColor,
                }}
              >
                {data.contact.email}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
