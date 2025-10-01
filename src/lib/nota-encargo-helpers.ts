import type { NotaEncargoRawData } from "~/server/queries/nota-encargo";

// Types for the PDF document structure
export interface TermsData {
  commission: number;
  min_commission: number;
  duration: number;
  exclusivity: boolean;
  communications: boolean;
  allowSignage: boolean;
  allowVisits: boolean;
}

export interface NotaEncargoPDFData {
  documentNumber: string;
  agency: {
    agentName: string;
    collegiateNumber: string;
    agentNIF: string;
    website: string;
    email: string;
    logo?: string;
    offices: Array<{
      address: string;
      city: string;
      postalCode: string;
      phone: string;
    }>;
  };
  client: {
    fullName: string;
    nif: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  property: {
    description: string;
    allowSignage: string;
    energyCertificate: string;
    keyDelivery: string;
    allowVisits: string;
  };
  operation: {
    type: string;
    price: string;
  };
  commission: {
    percentage: number;
    minimum: string;
  };
  duration: {
    months: number;
  };
  signatures: {
    location: string;
    date: string;
  };
  jurisdiction: {
    city: string;
  };
  observations: string;
  hasOtherAgency: boolean;
  gdprConsent: boolean;
}

/**
 * Format energy certificate information
 * @param scale - Energy consumption scale (A-G)
 * @param value - Energy consumption value
 * @returns Formatted energy certificate string
 */
export function formatEnergyCertificate(scale: string | null, value: number | null): string {
  if (!scale) {
    return "Pendiente";
  }
  
  if (value) {
    return `Disponible - Certificación ${scale} (${value} kWh/m² año)`;
  }
  
  return `Disponible - Certificación ${scale}`;
}

/**
 * Format price based on listing type
 * @param amount - Price amount
 * @param listingType - Type of listing (Sale, Rent, etc.)
 * @returns Formatted price string
 */
export function formatPrice(amount: number, listingType: string): string {
  const formattedAmount = new Intl.NumberFormat('es-ES').format(amount);
  
  if (listingType === "Rent") {
    return `${formattedAmount} €/mes`;
  }
  
  return `${formattedAmount} €`;
}

/**
 * Translate listing type to Spanish
 * @param listingType - English listing type
 * @returns Spanish translation
 */
export function translateListingType(listingType: string): string {
  const translations: Record<string, string> = {
    "Sale": "Venta",
    "Rent": "Alquiler",
    "Transfer": "Traspaso",
    "RentWithOption": "Alquiler con opción a compra",
    "RoomSharing": "Habitación compartida",
  };
  
  return translations[listingType] || listingType;
}

/**
 * Generate document number with listing ID and month/year
 * @param listingId - Listing ID
 * @returns Formatted document number
 */
export function generateDocumentNumber(listingId: bigint): string {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 01-12
  const year = now.getFullYear(); // 2025
  const timestamp = `${month}${year}`; // 012025
  
  return `Hoja-Encargo-${listingId}-${timestamp}`;
}

/**
 * Format agent name based on account type
 * @param accountName - Account/agent name
 * @param accountType - Type of account (company/person)
 * @returns Properly formatted agent name
 */
export function formatAgentName(accountName: string, accountType: string): string {
  if (accountType === "company") {
    return accountName;
  }
  
  // For person accounts, add "Dª" prefix if not already present
  if (!accountName.startsWith("Dª") && !accountName.startsWith("D.")) {
    return `Dª ${accountName}`;
  }
  
  return accountName;
}

/**
 * Get client data from contact info and property address
 * @param contactData - Raw contact data
 * @param propertyAddress - Property address information
 * @returns Formatted client data
 */
export function formatClientData(
  contactData: {
    contactFirstName: string | null;
    contactLastName: string | null;
    contactNif: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    contactAdditionalInfo: Record<string, unknown>;
  },
  propertyAddress: {
    street: string | null;
    addressDetails: string | null;
    postalCode: string | null;
    city: string | null;
  }
): NotaEncargoPDFData['client'] {
  // Build complete address from property information
  const addressParts = [
    propertyAddress.street,
    propertyAddress.addressDetails
  ].filter(Boolean);
  const fullAddress = addressParts.join(', ') || "";
  
  return {
    fullName: `${contactData.contactFirstName || ''} ${contactData.contactLastName || ''}`.trim() || "No especificado",
    nif: contactData.contactNif || "",
    address: fullAddress,
    city: propertyAddress.city || "", // Use the property's city from locations table
    postalCode: propertyAddress.postalCode || "",
    phone: contactData.contactPhone || "",
  };
}

/**
 * Extract listing ID from the current URL pathname
 * @param pathname - Current page pathname (e.g., "/propiedades/123/documentacion-inicial")
 * @returns Listing ID as bigint or null if not found
 */
export function extractListingIdFromPathname(pathname: string): bigint | null {
  const match = pathname.match(/\/propiedades\/(\d+)/);
  if (match && match[1]) {
    return BigInt(match[1]);
  }
  return null;
}

/**
 * Transform raw database data to PDF document format
 * @param rawData - Raw data from database
 * @param termsData - Terms from modal
 * @returns Formatted data for PDF generation
 */
export function transformToNotaEncargoPDF(
  rawData: NotaEncargoRawData,
  termsData: TermsData
): NotaEncargoPDFData {
  const documentNumber = generateDocumentNumber(rawData.listingId);
  const currentDate = new Date().toLocaleDateString('es-ES');
  const city = rawData.city || "León"; // Default fallback
  
  // Format client data
  const clientData = formatClientData({
    contactFirstName: rawData.contactFirstName,
    contactLastName: rawData.contactLastName,
    contactNif: rawData.contactNif,
    contactPhone: rawData.contactPhone,
    contactEmail: rawData.contactEmail,
    contactAdditionalInfo: rawData.contactAdditionalInfo || {},
  }, {
    street: rawData.street,
    addressDetails: rawData.addressDetails,
    postalCode: rawData.postalCode,
    city: rawData.city,
  });
  
  return {
    documentNumber,
    
    agency: {
      agentName: formatAgentName(rawData.accountName, rawData.accountType),
      collegiateNumber: rawData.accountCollegiateNumber || "",
      agentNIF: rawData.accountTaxId || "",
      website: rawData.accountWebsite || "",
      email: rawData.accountEmail || "",
      offices: [{
        address: rawData.accountAddress || "",
        city: city,
        postalCode: "", // TODO: Extract from address if needed
        phone: rawData.accountPhone || "",
      }],
    },
    
    client: clientData,
    
    property: {
      description: rawData.shortDescription || rawData.description || "No especificado",
      allowSignage: termsData.allowSignage ? "Sí" : "No",
      energyCertificate: formatEnergyCertificate(
        rawData.energyConsumptionScale,
        rawData.energyConsumptionValue
      ),
      keyDelivery: rawData.hasKeys ? "Sí" : "No",
      allowVisits: termsData.allowVisits ? "Sí" : "No",
    },
    
    operation: {
      type: translateListingType(rawData.listingType),
      price: formatPrice(rawData.price, rawData.listingType),
    },
    
    commission: {
      percentage: termsData.commission,
      minimum: termsData.min_commission.toString(),
    },
    
    duration: {
      months: termsData.duration,
    },
    
    signatures: {
      location: city,
      date: currentDate,
    },
    
    jurisdiction: {
      city: city,
    },
    
    observations: "",
    hasOtherAgency: !termsData.exclusivity,
    gdprConsent: termsData.communications,
  };
}