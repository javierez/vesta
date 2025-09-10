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
  titleAlignment: "left" | "center" | "right";
  titleSize: number; // Font size in pixels (16-48)
  titleColor: string; // Text color (hex, rgb, or CSS color name)
  titlePositionX: number; // Horizontal position offset in pixels (-50 to 50)
  titlePositionY: number; // Vertical position offset in pixels (-30 to 30)
  locationFont: "default" | "serif" | "sans" | "mono" | "elegant" | "modern";
  locationAlignment: "left" | "center" | "right";
  locationSize: number; // Font size in pixels (16-32)
  locationColor: string; // Text color (hex, rgb, or CSS color name)
  locationPositionX: number; // Horizontal position offset in pixels (-50 to 50)
  locationPositionY: number; // Vertical position offset in pixels (-30 to 30)
  locationBorderRadius: number; // Border radius in pixels (0-20)
  priceAlignment: "left" | "center" | "right";
  priceSize: number; // Font size in pixels (24-80)
  priceColor: string; // Text color (hex, rgb, or CSS color name)
  pricePositionX: number; // Horizontal position offset in pixels (-50 to 50)
  pricePositionY: number; // Vertical position offset in pixels (-30 to 30)
  contactPositionX: number; // Horizontal position offset in pixels (-50 to 50)
  contactPositionY: number; // Vertical position offset in pixels (-30 to 30)
  contactBackgroundColor: string; // Background color for contact group
  contactBorderRadius: number; // Border radius in pixels (0-20)
  iconSize: number; // Icon size multiplier (0.5 to 2.0)
  iconSpacingHorizontal: number; // Horizontal spacing between icons in pixels (8 to 80)
  iconSpacingVertical: number; // Vertical spacing between icons in pixels (4 to 40)
  overlayColor:
    | "default"
    | "dark"
    | "light"
    | "blue"
    | "green"
    | "purple"
    | "red"
    | "white"
    | "black"
    | "gray"
    | string; // Allow any string for custom colors (account palette)
  // Short description styling
  descriptionFont: "default" | "serif" | "sans" | "mono" | "elegant" | "modern";
  descriptionAlignment: "left" | "center" | "right";
  descriptionSize: number; // Font size in pixels (12-32)
  descriptionColor: string; // Text color (hex, rgb, or CSS color name)
  descriptionPositionX: number; // Horizontal position offset in pixels (-50 to 50)
  descriptionPositionY: number; // Vertical position offset in pixels (-30 to 30)
  // Bullet list styling
  bulletFont: "default" | "serif" | "sans" | "mono" | "elegant" | "modern";
  bulletAlignment: "left" | "center" | "right";
  bulletSize: number; // Font size in pixels (12-24)
  bulletColor: string; // Text color (hex, rgb, or CSS color name)
  bulletPositionX: number; // Horizontal position offset in pixels (-50 to 50)
  bulletPositionY: number; // Vertical position offset in pixels (-30 to 30)
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
  iconListText?: string; // Custom bullet list text when icons are disabled
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
  onElementClick?: (elementType: string, elementData?: unknown) => void;
  selectedElement?: string | null;
  isInteractive?: boolean;
}

// Saved cartel configuration for persistence
export interface SavedCartelConfiguration {
  id: string;
  name: string;
  userId: string;
  accountId: string;
  propertyId?: string; // For property-specific configs
  templateConfig: TemplateConfiguration;
  propertyOverrides: Partial<ExtendedTemplatePropertyData>;
  selectedContacts: {
    phone?: string;
    email?: string;
  };
  selectedImageIndices: number[];
  isDefault: boolean;
  isGlobal: boolean; // Can be used for any property
  createdAt: Date;
  updatedAt: Date;
}

// Configuration save request interface
export interface SaveConfigurationRequest {
  name: string;
  templateConfig: TemplateConfiguration;
  propertyOverrides?: Partial<ExtendedTemplatePropertyData>;
  selectedContacts?: {
    phone?: string;
    email?: string;
  };
  selectedImageIndices: number[];
  isDefault?: boolean;
  isGlobal?: boolean;
  propertyId?: string;
}

// Configuration load response interface
export interface ConfigurationResponse {
  success: boolean;
  data?: SavedCartelConfiguration;
  error?: string;
}

// Multiple configurations response
export interface ConfigurationsListResponse {
  success: boolean;
  data?: SavedCartelConfiguration[];
  error?: string;
}
