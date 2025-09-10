import type { ContactOffice } from "./types";

// Static description generator that works during initialization
export const generateStaticDescription = (
  propertyType: string,
  neighborhood: string,
  city: string,
  bedrooms: number,
  bathrooms: number,
  squareMeters: number
) => {
  const parts: string[] = [];

  // Start with property type and location
  parts.push(
    `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} en ${neighborhood}, ${city}`
  );

  // Add basic specs
  const specs: string[] = [];
  if (bedrooms || bathrooms) {
    const roomSpecs: string[] = [];
    if (bedrooms) {
      roomSpecs.push(bedrooms === 1 ? "una habitación" : `${bedrooms} habitaciones`);
    }
    if (bathrooms) {
      roomSpecs.push(bathrooms === 1 ? "un baño" : `${bathrooms} baños`);
    }
    specs.push(`Cuenta con ${roomSpecs.join(" y ")}`);
  }
  specs.push(`${squareMeters} metros cuadrados`);

  if (specs.length > 0) {
    parts.push(specs.join(", "));
  }

  // Join all parts into one continuous text
  let fullText = parts.join(". ");
  fullText += ".";

  return fullText;
};

// Database to UI value mapping
export const mapDatabaseListingType = (dbType?: "Sale" | "Rent"): "venta" | "alquiler" | null => {
  if (!dbType) return null;
  return dbType === "Sale" ? "venta" : "alquiler";
};

// Map database property types to UI values
export const mapDatabasePropertyType = (dbType?: string): "piso" | "casa" | "local" | "garaje" | "solar" | null => {
  if (!dbType) return null;
  
  const mappings: Record<string, "piso" | "casa" | "local" | "garaje" | "solar"> = {
    "Piso": "piso",
    "Casa": "casa",
    "Chalet": "casa",
    "Villa": "casa",
    "Local comercial": "local",
    "Local": "local",
    "Oficina": "local",
    "Garaje": "garaje",
    "Plaza de garaje": "garaje",
    "Solar": "solar",
    "Terreno": "solar"
  };
  
  return mappings[dbType] ?? "piso"; // Default to piso if not found
};

// Parse contact data with error handling
export const parseContactData = (databaseContactProps?: string): ContactOffice[] => {
  if (!databaseContactProps) return [];
  
  try {
    // Handle double-escaped JSON from database
    let cleanedJson = databaseContactProps;
    if (cleanedJson.includes('""')) {
      // Replace double quotes with single quotes
      cleanedJson = cleanedJson.replace(/""/g, '"');
    }
    
    console.log("🔄 Parsing contact props:", cleanedJson);
    const parsed = JSON.parse(cleanedJson) as {offices?: ContactOffice[]};
    console.log("✅ Parsed contact data:", parsed);
    return parsed.offices ?? [];
  } catch (error) {
    console.error("❌ Error parsing contact props:", error);
    console.error("Raw contact props:", databaseContactProps);
    return [];
  }
};