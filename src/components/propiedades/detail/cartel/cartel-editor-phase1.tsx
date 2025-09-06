import { CartelEditorClient } from "./cartel-editor-client";
import { getListingCartelData } from "~/server/queries/listing";
import type { PropertyImage } from "~/lib/data";

interface CartelEditorPhase1Props {
  listingId: string;
  images?: PropertyImage[];
}

/**
 * Server component that fetches listingType from database and passes to client editor
 * Phase 1: Single field integration with graceful fallback
 */
export async function CartelEditorPhase1({ 
  listingId, 
  images 
}: CartelEditorPhase1Props) {
  let databaseListingType: "Sale" | "Rent" | undefined;
  
  try {
    console.log("🔄 CartelEditorPhase1: Fetching listingType for:", listingId);
    
    const cartelData = await getListingCartelData(parseInt(listingId));
    // Type-safe assignment with validation
    if (cartelData.listingType === "Sale" || cartelData.listingType === "Rent") {
      databaseListingType = cartelData.listingType;
    }
    
    console.log("✅ CartelEditorPhase1: Loaded listingType from database:", databaseListingType);
  } catch (error) {
    console.error("❌ CartelEditorPhase1: Failed to load listingType from database, using fallback:", error);
    // Graceful fallback: no databaseListingType passed = editable mode
  }

  return (
    <CartelEditorClient
      listingId={listingId}
      images={images}
      databaseListingType={databaseListingType}
    />
  );
}