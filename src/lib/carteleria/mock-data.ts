import type { TemplatePropertyData, ExtendedTemplatePropertyData } from "~/types/template-data";

// AWS S3 image URLs for template mock data
// CRITICAL: Use exact AWS S3 structure from vesta-configuration-files bucket
const TEMPLATE_IMAGES = [
  "https://vesta-configuration-files.s3.amazonaws.com/templates/IMG_0744.JPG",
  "https://vesta-configuration-files.s3.amazonaws.com/templates/IMG_0745.JPG",
  "https://vesta-configuration-files.s3.amazonaws.com/templates/IMG_0749.JPG",
];

// Mock property data for each property type with realistic Spanish real estate information
export const mockPropertyData: Record<string, TemplatePropertyData[]> = {
  piso: [
    {
      id: "piso-1",
      title: "Piso en venta",
      price: 185000,
      location: {
        neighborhood: "Centro",
        city: "León",
      },
      specs: {
        bedrooms: 3,
        bathrooms: 2,
        squareMeters: 95,
      },
      images: TEMPLATE_IMAGES,
      contact: {
        phone: "987 654 321",
        email: "contacto@inmobiliaria-acropolis.com",
      },
      propertyType: "piso",
    },
    {
      id: "piso-2",
      title: "Piso en venta",
      price: 220000,
      location: {
        neighborhood: "Ensanche",
        city: "León",
      },
      specs: {
        bedrooms: 4,
        bathrooms: 2,
        squareMeters: 110,
      },
      images: TEMPLATE_IMAGES,
      contact: {
        phone: "987 654 321",
        email: "contacto@inmobiliaria-acropolis.com",
      },
      propertyType: "piso",
    },
    {
      id: "piso-3",
      title: "Piso en venta",
      price: 165000,
      location: {
        neighborhood: "Crucero",
        city: "León",
      },
      specs: {
        bedrooms: 2,
        bathrooms: 1,
        squareMeters: 75,
      },
      images: TEMPLATE_IMAGES,
      contact: {
        phone: "987 654 321",
        email: "contacto@inmobiliaria-acropolis.com",
      },
      propertyType: "piso",
    },
  ],

  casa: [
    {
      id: "casa-1",
      title: "Casa en venta",
      price: 320000,
      location: {
        neighborhood: "La Palomera",
        city: "León",
      },
      specs: {
        bedrooms: 4,
        bathrooms: 3,
        squareMeters: 180,
      },
      images: TEMPLATE_IMAGES,
      contact: {
        phone: "987 654 321",
        email: "contacto@inmobiliaria-acropolis.com",
      },
      propertyType: "casa",
    },
    {
      id: "casa-2",
      title: "Casa en venta",
      price: 275000,
      location: {
        neighborhood: "Eras de Renueva",
        city: "León",
      },
      specs: {
        bedrooms: 3,
        bathrooms: 2,
        squareMeters: 145,
      },
      images: TEMPLATE_IMAGES,
      contact: {
        phone: "987 654 321",
        email: "contacto@inmobiliaria-acropolis.com",
      },
      propertyType: "casa",
    },
  ],

  local: [
    {
      id: "local-1",
      title: "Local comercial en alquiler",
      price: 850,
      location: {
        neighborhood: "Centro",
        city: "León",
      },
      specs: {
        squareMeters: 60,
      },
      images: TEMPLATE_IMAGES,
      contact: {
        phone: "987 654 321",
        email: "contacto@inmobiliaria-acropolis.com",
      },
      propertyType: "local",
    },
    {
      id: "local-2",
      title: "Local comercial en venta",
      price: 125000,
      location: {
        neighborhood: "Ensanche",
        city: "León",
      },
      specs: {
        squareMeters: 85,
      },
      images: TEMPLATE_IMAGES,
      contact: {
        phone: "987 654 321",
        email: "contacto@inmobiliaria-acropolis.com",
      },
      propertyType: "local",
    },
  ],

  garaje: [
    {
      id: "garaje-1",
      title: "Plaza de garaje en venta",
      price: 18000,
      location: {
        neighborhood: "Centro",
        city: "León",
      },
      specs: {
        squareMeters: 12,
      },
      images: TEMPLATE_IMAGES,
      contact: {
        phone: "987 654 321",
        email: "contacto@inmobiliaria-acropolis.com",
      },
      propertyType: "garaje",
    },
    {
      id: "garaje-2",
      title: "Plaza de garaje en alquiler",
      price: 45,
      location: {
        neighborhood: "Ensanche",
        city: "León",
      },
      specs: {
        squareMeters: 15,
      },
      images: TEMPLATE_IMAGES,
      contact: {
        phone: "987 654 321",
        email: "contacto@inmobiliaria-acropolis.com",
      },
      propertyType: "garaje",
    },
  ],

  solar: [
    {
      id: "solar-1",
      title: "Solar en venta",
      price: 95000,
      location: {
        neighborhood: "Trobajo del Camino",
        city: "León",
      },
      specs: {
        squareMeters: 400,
      },
      images: TEMPLATE_IMAGES,
      contact: {
        phone: "987 654 321",
        email: "contacto@inmobiliaria-acropolis.com",
      },
      propertyType: "solar",
    },
    {
      id: "solar-2",
      title: "Solar en venta",
      price: 150000,
      location: {
        neighborhood: "Armunia",
        city: "León",
      },
      specs: {
        squareMeters: 600,
      },
      images: TEMPLATE_IMAGES,
      contact: {
        phone: "987 654 321",
        email: "contacto@inmobiliaria-acropolis.com",
      },
      propertyType: "solar",
    },
  ],
};

// Default property data getter with fallback
export const getDefaultPropertyData = (
  propertyType: "piso" | "casa" | "local" | "garaje" | "solar" = "piso",
): TemplatePropertyData => {
  const properties = mockPropertyData[propertyType];
  const fallback = mockPropertyData.piso?.[0];
  if (!fallback) {
    throw new Error("No default property data available");
  }
  return properties?.[0] ?? fallback;
};

// Get random property data for variety in templates
export const getRandomPropertyData = (
  propertyType?: "piso" | "casa" | "local" | "garaje" | "solar",
): TemplatePropertyData => {
  if (propertyType) {
    const properties = mockPropertyData[propertyType];
    if (properties && properties.length > 0) {
      const randomIndex = Math.floor(Math.random() * properties.length);
      return properties[randomIndex]!;
    }
  }

  // Get random property from all types
  const allProperties = Object.values(mockPropertyData).flat();
  const randomIndex = Math.floor(Math.random() * allProperties.length);
  const fallback = mockPropertyData.piso?.[0];
  if (!fallback) {
    throw new Error("No default property data available");
  }
  return allProperties[randomIndex] ?? fallback;
};

// Get property data by ID with fallback
export const getPropertyDataById = (id: string): TemplatePropertyData => {
  const allProperties = Object.values(mockPropertyData).flat();
  const fallback = mockPropertyData.piso?.[0];
  if (!fallback) {
    throw new Error("No default property data available");
  }
  return allProperties.find((property) => property.id === id) ?? fallback;
};

// Format location string for display (required format: "Barrio (León)")
export const formatLocation = (location: {
  neighborhood: string;
  city: string;
}): string => {
  return `${location.neighborhood} (${location.city})`;
};

// Format price for display with Spanish formatting
export const formatPrice = (price: number, propertyType?: string, listingType?: string): string => {
  const isRental = listingType === "alquiler" || (propertyType === "local" && price < 5000);
  const suffix = isRental ? "€/mes" : "€";

  return price.toLocaleString("es-ES") + " " + suffix;
};

// Format square meters for display
export const formatSquareMeters = (sqm: number): string => {
  return `${sqm} m²`;
};

// Format bedrooms and bathrooms for display
export const formatRooms = (bedrooms?: number, bathrooms?: number): string => {
  const parts: string[] = [];

  if (bedrooms) {
    parts.push(`${bedrooms} hab.`);
  }

  if (bathrooms) {
    parts.push(`${bathrooms} baños`);
  }

  return parts.join(" • ");
};

// Extended property data with additional fields for testing
const extendedPropertyFields = {
  piso: {
    energyConsumptionScale: "B",
    yearBuilt: 2008,
    hasElevator: true,
    hasGarage: false,
    hasStorageRoom: true,
    storageRoomSize: 8,
    terrace: true,
    terraceSize: 25,
    orientation: "Sur",
    conservationStatus: 2, // Pretty good
    heatingType: "Gas natural",
    shortDescription: "Precioso piso en el centro de León, totalmente reformado con acabados de alta calidad. Ideal para parejas o pequeñas familias.",
    listingType: "venta" as const,
  },
  casa: {
    energyConsumptionScale: "C",
    yearBuilt: 1995,
    hasElevator: false,
    hasGarage: true,
    garageSpaces: 2,
    hasStorageRoom: true,
    storageRoomSize: 15,
    terrace: true,
    terraceSize: 50,
    orientation: "Sureste",
    conservationStatus: 1, // Good
    heatingType: "Calefacción central",
    shortDescription: "Amplia casa familiar con jardín y garaje. Perfecta para familias que buscan tranquilidad sin renunciar a las comodidades urbanas.",
    listingType: "venta" as const,
  },
  local: {
    energyConsumptionScale: "D",
    yearBuilt: 1980,
    hasElevator: false,
    hasGarage: false,
    hasStorageRoom: true,
    storageRoomSize: 20,
    terrace: false,
    orientation: "Norte",
    conservationStatus: 4, // Needs renovation
    heatingType: "Eléctrica",
    shortDescription: "Local comercial en zona céntrica con gran potencial. Ideal para oficinas, consulta médica o pequeño negocio.",
    listingType: "alquiler" as const,
  },
  garaje: {
    yearBuilt: 2005,
    hasElevator: false,
    orientation: "Interior",
    conservationStatus: 3, // Almost new
    shortDescription: "Plaza de garaje amplia y de fácil acceso. Perfecta para coches grandes o para almacenamiento adicional.",
    listingType: "venta" as const,
  },
  solar: {
    yearBuilt: undefined, // Land doesn't have built year
    orientation: "Sur",
    conservationStatus: 1, // Good (for land)
    shortDescription: "Parcela urbana con excelentes vistas y buena orientación. Ideal para construcción de vivienda unifamiliar.",
    listingType: "venta" as const,
  },
};

// Get extended default property data with additional fields
export const getExtendedDefaultPropertyData = (
  propertyType: "piso" | "casa" | "local" | "garaje" | "solar" = "piso",
): ExtendedTemplatePropertyData => {
  const baseData = getDefaultPropertyData(propertyType);
  const extendedFields = extendedPropertyFields[propertyType];
  
  return {
    ...baseData,
    ...extendedFields,
  };
};

// Get extended random property data 
export const getExtendedRandomPropertyData = (
  propertyType?: "piso" | "casa" | "local" | "garaje" | "solar",
): ExtendedTemplatePropertyData => {
  const baseData = getRandomPropertyData(propertyType);
  const actualPropertyType = propertyType ?? baseData.propertyType;
  const extendedFields = extendedPropertyFields[actualPropertyType];
  
  return {
    ...baseData,
    ...extendedFields,
  };
};
