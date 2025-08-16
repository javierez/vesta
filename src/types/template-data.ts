import type { TemplateStyle, TemplateFormat } from "~/types/carteleria";

// Template property data interface for consistent property information across all templates
export interface TemplatePropertyData {
  id: string;
  title: string;
  price: number;
  location: {
    neighborhood: string;
    city: string;
  };
  specs: {
    bedrooms?: number;
    bathrooms?: number;
    squareMeters: number;
  };
  images: string[]; // AWS S3 URLs
  contact: {
    phone: string;
    email?: string;
    website?: string;
  };
  reference?: string;
  propertyType: "piso" | "casa" | "local" | "garaje" | "solar";
}

// Template component props interface for all template components
export interface TemplateComponentProps {
  data: TemplatePropertyData;
  style: TemplateStyle;
  format: TemplateFormat;
  className?: string;
}

// Base template props for common template functionality
export interface BaseTemplateProps {
  data: TemplatePropertyData;
  className?: string;
}

// Style-specific color palette interface
export interface StyleColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

// Template rendering context interface
export interface TemplateRenderContext {
  styleId: string;
  formatId: string;
  data: TemplatePropertyData;
  colorPalette: StyleColorPalette;
}

// Property specification display interface
export interface PropertySpecs {
  bedrooms?: number;
  bathrooms?: number;
  squareMeters: number;
  showIcons?: boolean;
}

// Contact information display interface
export interface ContactDisplay {
  phone: string;
  email?: string;
  website?: string;
  showQR?: boolean;
  qrSize?: number;
}

// Image gallery configuration for templates
export interface TemplateImageConfig {
  images: string[];
  showCount?: number;
  aspectRatio?: "square" | "landscape" | "portrait";
  showOverlay?: boolean;
}

// Location display formatting
export interface LocationDisplay {
  neighborhood: string;
  city: string;
  format: "full" | "short" | "neighborhood-only";
}

// Price display formatting
export interface PriceDisplay {
  amount: number;
  currency: "EUR" | "USD";
  format: "compact" | "full";
  showDecimals?: boolean;
}

// Template layout configuration
export interface TemplateLayout {
  orientation: "portrait" | "landscape";
  sections: {
    header: boolean;
    images: boolean;
    specs: boolean;
    contact: boolean;
    footer: boolean;
  };
  spacing: "compact" | "normal" | "spacious";
}

// Template preview configuration
export interface TemplatePreviewConfig {
  showBorder?: boolean;
  showShadow?: boolean;
  showMetadata?: boolean;
  interactive?: boolean;
}

// Template configuration for playground controls
export interface TemplateConfiguration {
  templateStyle:
    | "modern"
    | "basic"
    | "classic"
    | "luxury"
    | "professional"
    | "creative";
  orientation: "vertical" | "horizontal";
  propertyType: "piso" | "casa" | "local" | "garaje" | "solar";
  imageCount: 3 | 4;
  showIcons: boolean;
  showQR: boolean;
  showWatermark: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showWebsite: boolean;
  showReference: boolean;
  showShortDescription: boolean;
  listingType: "venta" | "alquiler";
  additionalFields: string[]; // max 2 fields from property schema
  titleFont: "default" | "serif" | "sans" | "mono" | "elegant" | "modern";
  priceFont: "default" | "serif" | "sans" | "mono" | "elegant" | "modern";
  overlayColor:
    | "default"
    | "dark"
    | "light"
    | "blue"
    | "green"
    | "purple"
    | "red";
}

// Image positioning data for cropping/repositioning within containers
export interface ImagePosition {
  x: number; // X offset percentage (0-100)
  y: number; // Y offset percentage (0-100)
}

// Extended template property data with additional database fields
export interface ExtendedTemplatePropertyData extends TemplatePropertyData {
  // Additional displayable fields from database schema
  energyConsumptionScale?: string; // A-G energy rating
  yearBuilt?: number;
  hasElevator?: boolean;
  hasGarage?: boolean;
  garageSpaces?: number;
  hasStorageRoom?: boolean;
  storageRoomSize?: number;
  terrace?: boolean;
  terraceSize?: number;
  orientation?: string; // N, S, E, W, etc.
  conservationStatus?: number; // 1=Good, 2=Pretty good, 3=Almost new, 4=Needs renovation, 6=Renovated
  heatingType?: string;
  shortDescription?: string;
  listingType?: "venta" | "alquiler";
  logoUrl?: string; // URL to the transparent logo for watermark
  // Image positioning for drag-and-drop cropping (indexed by image URL or position)
  imagePositions?: Record<string, ImagePosition>;
}

// Configurable template props interface
export interface ConfigurableTemplateProps {
  data: ExtendedTemplatePropertyData;
  config: TemplateConfiguration;
  className?: string;
}
