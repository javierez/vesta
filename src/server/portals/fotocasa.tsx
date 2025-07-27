"use server";

import { getListingDetails } from "../queries/listing";
import { getPropertyImages } from "../queries/property_images";
import { env } from "~/env";

const FOTOCASA_API_KEY = env.FOTOCASA_API_KEY;

// Fotocasa API Types
interface FotocasaProperty {
  ExternalId: string;
  AgencyReference: string;
  TypeId: number;
  SubTypeId: number;
  ContactTypeId: number;
  PropertyAddress: PropertyAddress[];
  PropertyDocument?: PropertyDocument[];
  PropertyFeature: PropertyFeature[];
  PropertyContactInfo: PropertyContactInfo[];
  PropertyPublications?: PropertyPublication[];
  PropertyTransaction: PropertyTransaction[];
}

interface PropertyAddress {
  ZipCode?: string;
  FloorId?: number;
  x: number;
  y: number;
  VisibilityModeId: number;
  Street?: string;
  Number?: string;
}

interface PropertyDocument {
  TypeId: number;
  Url: string;
  SortingId: number;
}

interface PropertyFeature {
  FeatureId: number;
  DecimalValue?: number;
  BoolValue?: boolean;
  DateValue?: string;
  TextValue?: string;
}

interface PropertyContactInfo {
  TypeId: number;
  Value: string;
}

interface PropertyPublication {
  PublicationId: number;
  PublicationTypeId: number;
}

interface PropertyTransaction {
  TransactionTypeId: number;
  Price: number;
  ShowPrice?: boolean;
}

// Property type mapping (from our schema to Fotocasa)
const PROPERTY_TYPE_MAPPING: Record<string, number> = {
  piso: 1, // Flat
  casa: 2, // House
  local: 3, // Commercial store
  oficina: 4, // Office
  edificio: 5, // Building
  solar: 6, // Land
  industrial: 7, // Industrial building
  garaje: 8, // Garage
  trastero: 12, // Storage room
};

// Property subtype mapping (matching Fotocasa documentation)
const PROPERTY_SUBTYPE_MAPPING: Record<string, number> = {
  // Flat subtypes
  Tríplex: 2,
  Dúplex: 3,
  Ático: 5,
  Estudio: 6,
  Loft: 7,
  Piso: 9,
  Apartamento: 10,
  Bajo: 11,

  // House subtypes
  Casa: 13,
  "Casa adosada": 17,
  "Casa pareada": 19,
  Chalet: 20,
  "Casa rústica": 24,
  Bungalow: 27,

  // Building subtypes
  Residencial: 48,
  Otros: 49,
  "Mixto residencial": 50,
  Oficinas: 51,
  Hotel: 72,

  // Land subtypes
  "Suelo residencial": 56,
  "Suelo industrial": 60,
  "Suelo rústico": 91,

  // Garage subtypes
  Moto: 68,
  Doble: 69,
  Individual: 70,
};

// Transaction type mapping
const TRANSACTION_TYPE_MAPPING: Record<string, number> = {
  Sale: 1, // Buy
  Rent: 3, // Rent
  Transfer: 4, // Transfer
  RoomSharing: 7, // Share
  RentWithOption: 9, // Rent with buy option
};

// Orientation mapping (Spanish to Fotocasa IDs)
const ORIENTATION_MAPPING: Record<string, number> = {
  noreste: 1, // North east
  oeste: 2, // West
  norte: 3, // North
  suroeste: 4, // South west
  este: 5, // East
  sureste: 6, // South east
  noroeste: 7, // North west
  sur: 8, // South
};

export async function buildFotocasaPayload(
  listingId: number,
  visibilityMode = 1,
  hidePrice = false,
): Promise<FotocasaProperty> {
  try {
    // Get listing details and property images
    const listing = await getListingDetails(listingId);
    const images = await getPropertyImages(listing.propertyId);

    // Extract floor number from addressDetails (get second number if exists)
    const getFloorId = (addressDetails: string | null): number | undefined => {
      if (!addressDetails) return undefined;

      // Floor mapping according to Fotocasa specification
      const floorMapping: Record<string, number> = {
        basement: 1,
        sotano: 1,
        ground: 3,
        "ground floor": 3,
        "planta baja": 3,
        mezzanine: 4,
        entresuelo: 4,
        first: 6,
        primera: 6,
        "1st": 6,
        second: 7,
        segunda: 7,
        "2nd": 7,
        third: 8,
        tercera: 8,
        "3rd": 8,
        fourth: 9,
        cuarta: 9,
        "4th": 9,
        fifth: 10,
        quinta: 10,
        "5th": 10,
        sixth: 11,
        sexta: 11,
        "6th": 11,
        seventh: 12,
        septima: 12,
        "7th": 12,
        eighth: 13,
        octava: 13,
        "8th": 13,
        ninth: 14,
        novena: 14,
        "9th": 14,
        tenth: 15,
        decima: 15,
        "10th": 15,
        penthouse: 22,
        atico: 22,
        other: 31,
      };

      // Convert to lowercase for case-insensitive matching
      const lowerAddress = addressDetails.toLowerCase();

      // Try to match floor descriptions
      for (const [floorDesc, floorId] of Object.entries(floorMapping)) {
        if (lowerAddress.includes(floorDesc)) {
          return floorId;
        }
      }

      // If no specific floor description found, try to extract number and map it
      const numbers = addressDetails.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        const floorNumber = parseInt(numbers[0]);

        // Map numeric floors to IDs
        if (floorNumber === 0) return 3; // Ground floor
        if (floorNumber === 1) return 6; // First
        if (floorNumber === 2) return 7; // Second
        if (floorNumber === 3) return 8; // Third
        if (floorNumber === 4) return 9; // Fourth
        if (floorNumber === 5) return 10; // Fifth
        if (floorNumber === 6) return 11; // Sixth
        if (floorNumber === 7) return 12; // Seventh
        if (floorNumber === 8) return 13; // Eighth
        if (floorNumber === 9) return 14; // Ninth
        if (floorNumber === 10) return 15; // Tenth
        if (floorNumber > 10) return 16; // Tenth upwards
      }

      return undefined;
    };

    // Extract street name (text before first comma)
    const getStreetName = (street: string | null): string | undefined => {
      if (!street) return undefined;
      return street.split(",")[0]?.trim();
    };

    // Extract street number (first number after comma)
    const getStreetNumber = (
      street: string | null,
      addressDetails: string | null,
    ): string | undefined => {
      const fullAddress = `${street ?? ""} ${addressDetails ?? ""}`.trim();
      const numbers = fullAddress.match(/\d+/g);
      return numbers && numbers.length > 0 ? numbers[0] : undefined;
    };

    // Build PropertyAddress
    const propertyAddress: PropertyAddress[] = [
      {
        ZipCode: listing.postalCode ?? undefined,
        FloorId: getFloorId(listing.addressDetails),
        x: listing.longitude ? parseFloat(listing.longitude.toString()) : 0,
        y: listing.latitude ? parseFloat(listing.latitude.toString()) : 0,
        VisibilityModeId: visibilityMode, // 1=Exact, 2=Street, 3=Zone
        Street: getStreetName(listing.street),
        Number: getStreetNumber(listing.street, listing.addressDetails),
      },
    ];

    // Build PropertyFeatures
    const propertyFeatures: PropertyFeature[] = [];

    // Square meters (FeatureId: 1)
    if (listing.squareMeter) {
      propertyFeatures.push({
        FeatureId: 1,
        DecimalValue: listing.squareMeter,
      });
    }

    // Title (FeatureId: 2)
    if (listing.title) {
      propertyFeatures.push({
        FeatureId: 2,
        TextValue: listing.title,
      });
    }

    // Description (FeatureId: 3)
    if (listing.description) {
      propertyFeatures.push({
        FeatureId: 3,
        TextValue: listing.description,
      });
    }

    // Bedrooms (FeatureId: 11)
    if (listing.bedrooms) {
      propertyFeatures.push({
        FeatureId: 11,
        DecimalValue: listing.bedrooms,
      });
    }

    // Bathrooms (FeatureId: 12)
    if (listing.bathrooms) {
      propertyFeatures.push({
        FeatureId: 12,
        DecimalValue: parseFloat(listing.bathrooms.toString()),
      });
    }

    // Is Furnished (FeatureId: 30)
    if (listing.isFurnished !== null) {
      propertyFeatures.push({
        FeatureId: 30,
        BoolValue: listing.isFurnished || false,
      });
    }

    // Elevator (FeatureId: 22)
    if (listing.hasElevator !== null) {
      propertyFeatures.push({
        FeatureId: 22,
        BoolValue: listing.hasElevator || false,
      });
    }

    // Home Automation (FeatureId: 142)
    if (listing.homeAutomation !== null) {
      propertyFeatures.push({
        FeatureId: 142,
        BoolValue: listing.homeAutomation || false,
      });
    }

    // Internet (FeatureId: 286)
    if (listing.internet !== null) {
      propertyFeatures.push({
        FeatureId: 286,
        BoolValue: listing.internet || false,
      });
    }

    // Gym (FeatureId: 309)
    if (listing.gym !== null) {
      propertyFeatures.push({
        FeatureId: 309,
        BoolValue: listing.gym || false,
      });
    }

    // Sports Area (FeatureId: 302)
    if (listing.sportsArea !== null) {
      propertyFeatures.push({
        FeatureId: 302,
        BoolValue: listing.sportsArea || false,
      });
    }

    // Children Area (FeatureId: 303)
    if (listing.childrenArea !== null) {
      propertyFeatures.push({
        FeatureId: 303,
        BoolValue: listing.childrenArea || false,
      });
    }

    // Suite Bathroom (FeatureId: 260)
    if (listing.suiteBathroom !== null) {
      propertyFeatures.push({
        FeatureId: 260,
        BoolValue: listing.suiteBathroom || false,
      });
    }

    // Appliances Included (FeatureId: 259)
    if (listing.appliancesIncluded !== null) {
      propertyFeatures.push({
        FeatureId: 259,
        BoolValue: listing.appliancesIncluded || false,
      });
    }

    // Year Built (FeatureId: 231)
    if (listing.yearBuilt) {
      propertyFeatures.push({
        FeatureId: 231,
        DecimalValue: listing.yearBuilt,
      });
    }

    // Individual appliances
    if (listing.oven !== null) {
      propertyFeatures.push({
        FeatureId: 288,
        BoolValue: listing.oven || false,
      });
    }
    if (listing.washingMachine !== null) {
      propertyFeatures.push({
        FeatureId: 293,
        BoolValue: listing.washingMachine || false,
      });
    }
    if (listing.microwave !== null) {
      propertyFeatures.push({
        FeatureId: 287,
        BoolValue: listing.microwave || false,
      });
    }
    if (listing.fridge !== null) {
      propertyFeatures.push({
        FeatureId: 292,
        BoolValue: listing.fridge || false,
      });
    }
    if (listing.tv !== null) {
      propertyFeatures.push({ FeatureId: 291, BoolValue: listing.tv || false });
    }
    if (listing.stoneware !== null) {
      propertyFeatures.push({
        FeatureId: 295,
        BoolValue: listing.stoneware || false,
      });
    }

    // Pets Allowed (FeatureId: 313)
    if (listing.petsAllowed !== null) {
      propertyFeatures.push({
        FeatureId: 313,
        BoolValue: listing.petsAllowed || false,
      });
    }

    // Nearby Public Transport (FeatureId: 176)
    if (listing.nearbyPublicTransport !== null) {
      propertyFeatures.push({
        FeatureId: 176,
        BoolValue: listing.nearbyPublicTransport || false,
      });
    }

    // Security Door (FeatureId: 294)
    if (listing.securityDoor !== null) {
      propertyFeatures.push({
        FeatureId: 294,
        BoolValue: listing.securityDoor || false,
      });
    }

    // Alarm (FeatureId: 235)
    if (listing.alarm !== null) {
      propertyFeatures.push({
        FeatureId: 235,
        BoolValue: listing.alarm || false,
      });
    }

    // Private Pool (FeatureId: 25)
    if (listing.privatePool !== null) {
      propertyFeatures.push({
        FeatureId: 25,
        BoolValue: listing.privatePool || false,
      });
    }

    // Community Pool (FeatureId: 300)
    if (listing.communityPool !== null) {
      propertyFeatures.push({
        FeatureId: 300,
        BoolValue: listing.communityPool || false,
      });
    }

    // Parking/Garage (FeatureId: 23)
    if (listing.hasGarage !== null) {
      propertyFeatures.push({
        FeatureId: 23,
        BoolValue: listing.hasGarage || false,
      });
    }

    // Jacuzzi (FeatureId: 274)
    if (listing.jacuzzi !== null) {
      propertyFeatures.push({
        FeatureId: 274,
        BoolValue: listing.jacuzzi || false,
      });
    }

    // Tennis Court (FeatureId: 310)
    if (listing.tennisCourt !== null) {
      propertyFeatures.push({
        FeatureId: 310,
        BoolValue: listing.tennisCourt || false,
      });
    }

    // Laundry Room (FeatureId: 257)
    if (listing.laundryRoom !== null) {
      propertyFeatures.push({
        FeatureId: 257,
        BoolValue: listing.laundryRoom || false,
      });
    }

    // Built-in Wardrobes (FeatureId: 258)
    if (listing.builtInWardrobes) {
      propertyFeatures.push({
        FeatureId: 258,
        BoolValue: true,
      });
    }

    // Storage Room (FeatureId: 24)
    if (listing.hasStorageRoom !== null) {
      propertyFeatures.push({
        FeatureId: 24,
        BoolValue: listing.hasStorageRoom || false,
      });
    }

    // Garden (FeatureId: 263)
    if (listing.garden !== null) {
      propertyFeatures.push({
        FeatureId: 263,
        BoolValue: listing.garden || false,
      });
    }

    // Equipped Kitchen (FeatureId: 314)
    if (listing.furnishedKitchen !== null) {
      propertyFeatures.push({
        FeatureId: 314,
        BoolValue: listing.furnishedKitchen || false,
      });
    }

    // Orientation (FeatureId: 28)
    if (listing.orientation) {
      const orientationId =
        ORIENTATION_MAPPING[listing.orientation.toLowerCase()];
      if (orientationId) {
        propertyFeatures.push({
          FeatureId: 28,
          DecimalValue: orientationId,
        });
      }
    }

    // Conservation Status (FeatureId: 249)
    if (listing.conservationStatus) {
      propertyFeatures.push({
        FeatureId: 249,
        DecimalValue: listing.conservationStatus,
      });
    }

    // --- ENERGY CERTIFICATE FIELDS (Fotocasa) ---
    // Type assertion for energy certificate fields
    const listingWithEnergy = listing as typeof listing & {
      energyConsumptionScale?: string;
      emissionsScale?: string;
      energyConsumptionValue?: number;
      emissionsValue?: number;
      energyCertificateStatus?: string;
      heatingType?: string | number;
      hotWaterType?: string | number;
    };

    // Consumption efficiency scale (FeatureId: 323)
    if (listingWithEnergy.energyConsumptionScale) {
      const scaleMap = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7 };
      const scaleKey = String(
        listingWithEnergy.energyConsumptionScale,
      ).toUpperCase() as keyof typeof scaleMap;
      const scaleValue = scaleMap[scaleKey];
      if (scaleValue) {
        propertyFeatures.push({ FeatureId: 323, DecimalValue: scaleValue });
      }
    }
    // Emissions efficiency scale (FeatureId: 324)
    if (listingWithEnergy.emissionsScale) {
      const scaleMap = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7 };
      const scaleKey =
        listingWithEnergy.emissionsScale.toUpperCase() as keyof typeof scaleMap;
      const scaleValue = scaleMap[scaleKey];
      if (scaleValue) {
        propertyFeatures.push({ FeatureId: 324, DecimalValue: scaleValue });
      }
    }
    // Consumption efficiency value (FeatureId: 325)
    if (listingWithEnergy.energyConsumptionValue != null) {
      propertyFeatures.push({
        FeatureId: 325,
        DecimalValue: Number(listingWithEnergy.energyConsumptionValue),
      });
    }
    // Emissions efficiency value (FeatureId: 326)
    if (listingWithEnergy.emissionsValue != null) {
      propertyFeatures.push({
        FeatureId: 326,
        DecimalValue: Number(listingWithEnergy.emissionsValue),
      });
    }
    // Energy certificate status (FeatureId: 327)
    if (listingWithEnergy.energyCertificateStatus) {
      const statusMap = { available: 1, en_tramite: 2, exento: 3, uploaded: 1 };
      const statusKey =
        listingWithEnergy.energyCertificateStatus.toLowerCase() as keyof typeof statusMap;
      const statusValue = statusMap[statusKey];
      if (statusValue) {
        propertyFeatures.push({ FeatureId: 327, DecimalValue: statusValue });
      }
    }

    // --- HEATING & HOT WATER FIELDS (Fotocasa) ---
    // Heating (FeatureId: 320)
    if (
      listingWithEnergy.heatingType &&
      !isNaN(Number(listingWithEnergy.heatingType))
    ) {
      const heatingId = Number(listingWithEnergy.heatingType);
      if (heatingId >= 1 && heatingId <= 6) {
        propertyFeatures.push({ FeatureId: 320, DecimalValue: heatingId });
      }
    }
    // Hot water (FeatureId: 321)
    if (
      listingWithEnergy.hotWaterType &&
      !isNaN(Number(listingWithEnergy.hotWaterType))
    ) {
      const hotWaterId = Number(listingWithEnergy.hotWaterType);
      if (hotWaterId >= 1 && hotWaterId <= 6) {
        propertyFeatures.push({ FeatureId: 321, DecimalValue: hotWaterId });
      }
    }

    // Build PropertyDocument (images) - use actual imageOrder from database
    const propertyDocuments: PropertyDocument[] = images
      .sort((a, b) => (a.imageOrder || 0) - (b.imageOrder || 0)) // Ensure proper order
      .map((image) => ({
        TypeId: 1, // Image type
        Url: image.imageUrl,
        SortingId: image.imageOrder ?? 1, // Use actual order set by user in gallery
      }));

    // Build PropertyContactInfo (hardcoded for now - should come from agent/owner data)
    const propertyContactInfo: PropertyContactInfo[] = [
      {
        TypeId: 1, // Email
        Value: listing.agent?.email ?? "demo@adevinta.com",
      },
      {
        TypeId: 2, // Phone
        Value: listing.agent?.phone ?? "942862711",
      },
    ];

    // Build PropertyTransaction
    const propertyTransaction: PropertyTransaction[] = [
      {
        TransactionTypeId: TRANSACTION_TYPE_MAPPING[listing.listingType] ?? 1,
        Price: parseFloat(listing.price.toString()),
        ShowPrice: !hidePrice, // ShowPrice is true when hidePrice is false
      },
    ];

    // Build the complete payload
    const fotocasaPayload: FotocasaProperty = {
      ExternalId: listing.listingId.toString(),
      AgencyReference: listing.referenceNumber ?? listing.listingId.toString(),
      TypeId: PROPERTY_TYPE_MAPPING[listing.propertyType ?? "piso"] ?? 1,
      SubTypeId:
        PROPERTY_SUBTYPE_MAPPING[listing.propertySubtype ?? "Piso"] ?? 9, // Default to Flat (9) if no subtype
      ContactTypeId: 3, // Agency contact (hardcoded for now)
      PropertyAddress: propertyAddress,
      PropertyDocument:
        propertyDocuments.length > 0 ? propertyDocuments : undefined,
      PropertyFeature: propertyFeatures,
      PropertyContactInfo: propertyContactInfo,
      PropertyTransaction: propertyTransaction,
      PropertyPublications: [
        {
          PublicationId: 31, // Fotocasa publication ID
          PublicationTypeId: 2,
        },
      ],
    };

    return fotocasaPayload;
  } catch (error) {
    console.error("Error building Fotocasa payload:", error);
    throw error;
  }
}

// Server action to be called when confirming Fotocasa portal
export async function publishToFotocasa(
  listingId: number,
  visibilityMode = 1,
  hidePrice = false,
): Promise<{
  success: boolean;
  payload?: FotocasaProperty;
  error?: string;
  response?: unknown;
}> {
  try {
    // Build the payload
    const payload = await buildFotocasaPayload(
      listingId,
      visibilityMode,
      hidePrice,
    );

    // Log the payload for debugging
    console.log("Fotocasa Payload:", JSON.stringify(payload, null, 2));

    // Make the API call to Fotocasa
    const response = await fetch(
      "https://imports.gw.fotocasa.pro/api/property",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": FOTOCASA_API_KEY,
        },
        body: JSON.stringify(payload),
      },
    );

    const responseData = (await response.json()) as unknown;

    // Log the response for debugging
    console.log("Fotocasa API Response:", responseData);

    // Check if the request was successful
    if (
      response.ok &&
      (responseData as { StatusCode?: number }).StatusCode === 201
    ) {
      return {
        success: true,
        payload,
        response: responseData,
      };
    } else {
      return {
        success: false,
        error:
          (responseData as { Message?: string }).Message ??
          `HTTP ${response.status}: ${response.statusText}`,
        response: responseData,
      };
    }
  } catch (error) {
    console.error("Error publishing to Fotocasa:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Server action to update existing listing on Fotocasa
export async function updateFotocasa(
  listingId: number,
  visibilityMode = 1,
  hidePrice = false,
): Promise<{
  success: boolean;
  payload?: FotocasaProperty;
  error?: string;
  response?: unknown;
}> {
  try {
    // Build the payload (same as create operation)
    const payload = await buildFotocasaPayload(
      listingId,
      visibilityMode,
      hidePrice,
    );

    // Log the payload for debugging
    console.log("Fotocasa Update Payload:", JSON.stringify(payload, null, 2));
    console.log(`Updating listing ${listingId} on Fotocasa`);

    // Make the PUT API call to Fotocasa
    // According to Fotocasa API docs: PUT api/property (no URI parameters)
    const response = await fetch(
      "https://imports.gw.fotocasa.pro/api/property",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": FOTOCASA_API_KEY,
        },
        body: JSON.stringify(payload),
      },
    );

    const responseData = (await response.json()) as unknown;

    // Log the response for debugging
    console.log("Fotocasa Update API Response:", responseData);

    // Check if the request was successful
    if (
      response.ok &&
      (responseData as { StatusCode?: number }).StatusCode === 200
    ) {
      return {
        success: true,
        payload,
        response: responseData,
      };
    } else {
      return {
        success: false,
        error:
          (responseData as { Message?: string }).Message ??
          `HTTP ${response.status}: ${response.statusText}`,
        response: responseData,
      };
    }
  } catch (error) {
    console.error("Error updating on Fotocasa:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Server action to delete listing from Fotocasa
export async function deleteFromFotocasa(
  listingId: number,
): Promise<{ success: boolean; error?: string; response?: unknown }> {
  try {
    // Convert listingId to base64 encoded string
    const externalId = listingId.toString();
    const base64ExternalId = Buffer.from(externalId).toString("base64");

    console.log(
      `Deleting listing ${listingId} from Fotocasa (base64: ${base64ExternalId})`,
    );

    // Make the DELETE API call to Fotocasa
    const response = await fetch(
      `https://imports.gw.fotocasa.pro/api/v2/property/${base64ExternalId}`,
      {
        method: "DELETE",
        headers: {
          "Api-Key": FOTOCASA_API_KEY,
        },
      },
    );

    // Log the response for debugging
    console.log("Fotocasa DELETE API Response status:", response.status);

    // Check if the request was successful
    if (response.ok) {
      console.log("Successfully deleted from Fotocasa");
      return {
        success: true,
        response: { status: response.status },
      };
    } else {
      // Try to get response body for error details
      let responseData: unknown;
      try {
        responseData = await response.json();
      } catch {
        responseData = {
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      console.error("Failed to delete from Fotocasa:", responseData);
      return {
        success: false,
        error:
          (responseData as { Message?: string; message?: string }).Message ??
          (responseData as { message?: string }).message ??
          `HTTP ${response.status}: ${response.statusText}`,
        response: responseData,
      };
    }
  } catch (error) {
    console.error("Error deleting from Fotocasa:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
