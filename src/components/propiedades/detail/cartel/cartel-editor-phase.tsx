import { CartelEditorClient } from "./cartel-editor-client";
import { getListingCartelData } from "~/server/queries/listing";
import { getAccountColorPalette } from "~/server/queries/accounts";
import { getCurrentUserAccountId } from "~/lib/dal";
import type { PropertyImage } from "~/lib/data";

interface CartelEditorPhase1Props {
  listingId: string;
  images?: PropertyImage[];
}

/**
 * Server component that fetches listingType and propertyType from database and passes to client editor
 * Phase 1: Single field integration with graceful fallback
 */
export async function CartelEditorPhase1({ 
  listingId, 
  images 
}: CartelEditorPhase1Props) {
  let databaseListingType: "Sale" | "Rent" | undefined;
  let databasePropertyType: string | undefined;
  let accountColorPalette: string[] = [];
  let databaseCity: string | undefined;
  let databaseNeighborhood: string | undefined;
  let databaseBedrooms: number | undefined;
  let databaseBathrooms: number | undefined;
  let databaseSquareMeter: number | undefined;
  let databaseContactProps: string | undefined;
  let databaseWebsite: string | undefined;
  
  try {
    console.log("🔄 CartelEditorPhase1: Fetching data for:", listingId);
    
    // Get account ID and fetch data in parallel
    const accountId = await getCurrentUserAccountId();
    const [cartelData, colorPalette] = await Promise.all([
      getListingCartelData(parseInt(listingId)),
      getAccountColorPalette(accountId)
    ]);
    
    // Type-safe assignment with validation
    if (cartelData.listingType === "Sale" || cartelData.listingType === "Rent") {
      databaseListingType = cartelData.listingType;
    }
    if (cartelData.propertyType) {
      databasePropertyType = cartelData.propertyType;
    }
    if (cartelData.city) {
      databaseCity = cartelData.city;
    }
    if (cartelData.neighborhood) {
      databaseNeighborhood = cartelData.neighborhood;
    }
    if (cartelData.bedrooms) {
      databaseBedrooms = cartelData.bedrooms;
    }
    if (cartelData.bathrooms) {
      databaseBathrooms = parseInt(cartelData.bathrooms);
    }
    if (cartelData.squareMeter) {
      databaseSquareMeter = cartelData.squareMeter;
    }
    if (cartelData.contactProps) {
      databaseContactProps = cartelData.contactProps;
    }
    if (cartelData.website) {
      databaseWebsite = cartelData.website;
    }
    
    accountColorPalette = colorPalette;
    
    console.log("✅ CartelEditorPhase1: Loaded from database:", { 
      listingType: databaseListingType,
      propertyType: databasePropertyType,
      imagesCount: images?.length ?? 0,
      colorsCount: accountColorPalette.length,
      city: databaseCity,
      neighborhood: databaseNeighborhood,
      bedrooms: databaseBedrooms,
      bathrooms: databaseBathrooms,
      squareMeter: databaseSquareMeter,
      website: databaseWebsite,
      hasContactProps: !!databaseContactProps,
      imagesSample: images?.slice(0, 2).map(img => ({
        id: img.propertyImageId,
        url: img.imageUrl
      }))
    });
  } catch (error) {
    console.error("❌ CartelEditorPhase1: Failed to load from database, using fallback:", error);
    // Graceful fallback: no database data passed = editable mode
  }

  return (
    <CartelEditorClient
      images={images}
      databaseListingType={databaseListingType}
      databasePropertyType={databasePropertyType}
      accountColorPalette={accountColorPalette}
      databaseCity={databaseCity}
      databaseNeighborhood={databaseNeighborhood}
      databaseBedrooms={databaseBedrooms}
      databaseBathrooms={databaseBathrooms}
      databaseSquareMeter={databaseSquareMeter}
      databaseContactProps={databaseContactProps}
      databaseWebsite={databaseWebsite}
    />
  );
}