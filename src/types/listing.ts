/**
 * Represents a combined view of listing data including property details, location, and images
 * This type is used for displaying listing information in the UI
 */
export type ListingType =
  | "Sale" // Venta
  | "Rent" // Alquiler
  | "RentWithOption" // Alquiler con opción a compra
  | "RoomSharing" // Compartir habitación
  | "Transfer"; // Transferencia

export type ListingOverview = {
  // Listing fields
  listingId: bigint;
  propertyId: bigint;
  agentId: string; // Changed from bigint to match users.id type
  agentName: string | null;
  ownerName: string | null;
  price: string;
  status: string;
  listingType: ListingType;
  isActive: boolean | null;
  isFeatured: boolean | null;
  isBankOwned: boolean | null;
  viewCount: number | null;
  inquiryCount: number | null;

  // Property fields
  referenceNumber: string | null;
  title: string | null;
  propertyType: string | null;
  bedrooms: number | null;
  bathrooms: string | null;
  squareMeter: number | null;
  street: string | null;
  addressDetails: string | null;
  postalCode: string | null;
  latitude: string | null;
  longitude: string | null;

  // Location fields
  city: string | null;
  province: string | null;
  municipality: string | null;
  neighborhood: string | null;

  // Image fields
  imageUrl: string | null;
  s3key: string | null;
  imageUrl2: string | null;
  s3key2: string | null;
};
