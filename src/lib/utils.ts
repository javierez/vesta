import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | string): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value));
}

export function formatPrice(price: string | number): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("es-ES", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
}

// Form input formatting utilities
export const formFormatters = {
  // Format price for form inputs with thousand separators
  formatPriceInput: (value: string | number): string => {
    if (!value) return "";
    const numericValue =
      typeof value === "string"
        ? value.replace(/[^\d]/g, "")
        : value.toString();
    if (!numericValue) return "";
    // Add thousand separators with dots
    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return formatted;
  },

  // Get numeric value from formatted price
  getNumericPrice: (formattedValue: string): string => {
    return formattedValue.replace(/[^\d]/g, "");
  },

  // Format area measurements (without m² symbol - add it in the label instead)
  formatAreaInput: (value: string | number): string => {
    if (!value) return "";
    const numericValue =
      typeof value === "string"
        ? value.replace(/[^\d]/g, "")
        : value.toString();
    if (!numericValue) return "";
    return numericValue;
  },

  // Get numeric value from formatted area
  getNumericArea: (formattedValue: string): string => {
    return formattedValue.replace(/[^\d]/g, "");
  },

  // Handle price input change with formatting
  handlePriceInputChange:
    (setValue: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const numericValue = formFormatters.getNumericPrice(e.target.value);
      setValue(numericValue);
    },

  // Handle area input change with formatting
  handleAreaInputChange:
    (setValue: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const numericValue = formFormatters.getNumericArea(e.target.value);
      setValue(numericValue);
    },

  // Handle numeric area input change (for number fields)
  handleNumericAreaInputChange:
    (setValue: (value: number) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const numericValue = formFormatters.getNumericArea(e.target.value);
      setValue(numericValue ? parseInt(numericValue) : 0);
    },

  // Handle numeric price input change (for number fields)
  handleNumericPriceInputChange:
    (setValue: (value: number) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const numericValue = formFormatters.getNumericPrice(e.target.value);
      setValue(numericValue ? parseInt(numericValue) : 0);
    },

  // Handle number input with leading zero removal
  handleNumberInput:
    (setValue: (value: number) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const numericValue = parseInt(e.target.value) || 0;
      setValue(numericValue);
    },

  // Format number for display (removes leading zeros, shows empty string for 0)
  formatNumberDisplay: (value: number): string => {
    return value === 0 ? "0" : value.toString();
  },
};

// Contact utilities (for UI configuration only)
export const contactUtils = {
  /**
   * Contact type determination logic (for reference only - actual logic is in contact.ts queries):
   *
   * Based on role counts and orgId:
   * - ownerCount > 0 AND buyerCount > 0 → prioritize owner type (banco/agencia/propietario)
   * - ownerCount > 0 + orgId < 20 → 'banco'
   * - ownerCount > 0 + orgId >= 20 → 'agencia'
   * - ownerCount > 0 + no orgId → 'propietario'
   * - buyerCount > 0 → 'demandante'
   * - ownerCount = 0 AND buyerCount = 0 → 'interesado'
   */
};

// Location information interface
interface LocationData {
  neighborhoodId: bigint;
  city: string;
  province: string;
  municipality: string;
  neighborhood: string;
}

// Prospect utilities for title generation and formatting
export const prospectUtils = {
  /**
   * Format currency for prospect display
   */
  formatCurrency: (amount: number | string | null): string => {
    if (!amount) return "N/A";
    const numAmount = typeof amount === "string" ? parseInt(amount) : amount;
    return `${numAmount.toLocaleString("es-ES")}€`;
  },

  /**
   * Generate prospect title based on location data
   * @param listingType - 'Sale' or 'Rent'
   * @param propertyType - Property type (piso, casa, etc.)
   * @param locations - Array of location data
   * @returns Formatted title string
   */
  generateProspectTitle: (
    listingType: string | null,
    propertyType: string | null,
    locations: LocationData[],
  ): string => {
    const operation = listingType === "Sale" ? "Compra" : "Alquiler";
    const propertyTypeText = propertyType ?? "Propiedad";

    let locationText = "";

    if (locations.length === 1 && locations[0]) {
      // Single neighborhood: show neighborhood name with city in parentheses
      locationText = ` en ${locations[0].neighborhood} (${locations[0].city})`;
    } else if (locations.length > 1 && locations[0]) {
      // Multiple neighborhoods: show city name
      locationText = ` en ${locations[0].city}`;
    }

    return `${operation} de ${propertyTypeText}${locationText}`;
  },

  /**
   * Generate prospect title for mostRecentProspect data (simpler format for contact cards)
   * @param listingType - 'Sale' or 'Rent'
   * @param propertyType - Property type
   * @param preferredArea - Area name (single string)
   * @returns Formatted title string
   */
  generateSimpleProspectTitle: (
    listingType?: string,
    propertyType?: string,
    preferredArea?: string,
  ): string => {
    const operation = listingType === "Sale" ? "Compra" : "Alquiler";
    const propertyTypeText = propertyType ?? "Inmueble";
    const locationText = preferredArea ? ` en ${preferredArea}` : "";

    const finalTitle = `${operation} de ${propertyTypeText}${locationText}`;

    // Log the title generation process (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log(`🎯 generateSimpleProspectTitle:`, {
        input: { listingType, propertyType, preferredArea },
        finalTitle,
      });
    }

    return finalTitle;
  },

  /**
   * Generate property type icon for prospects
   */
  getPropertyTypeIcon: (type: string | null): string => {
    switch (type) {
      case "piso":
        return "🏢";
      case "casa":
        return "🏠";
      case "local":
        return "🏪";
      case "terreno":
        return "🌍";
      case "garaje":
        return "🅿️";
      default:
        return "🏠";
    }
  },
};
