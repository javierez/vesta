import { notFound } from "next/navigation";
import { PropertyBreadcrumb } from "~/components/propiedades/detail/property-breadcrump";
import { PropertyHeader } from "~/components/propiedades/detail/property-header";
import { PropertyTabs } from "~/components/propiedades/detail/property-tabs";
import { getPropertyImages } from "~/server/queries/property_images";
import { getListingDetailsWithAuth } from "~/server/queries/listing";
import { getEnergyCertificate } from "~/server/queries/document";
import type { PropertyImage } from "~/lib/data";
import { convertDbListingToPropertyListing } from "~/types/property-listing";

interface PropertyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const unwrappedParams = await params;
  const listing = await getListingDetailsWithAuth(parseInt(unwrappedParams.id));

  if (!listing) {
    notFound();
  }

  // Get energy certificate document
  const energyCertificate = await getEnergyCertificate(
    Number(listing.propertyId),
  );

  // Get all property images with proper fallback
  const propertyImages = await getPropertyImages(BigInt(listing.propertyId));
  const defaultPlaceholder = "/properties/suburban-dream.png";

  // Process images to ensure they have valid URLs and match PropertyImage type
  const processedImages: PropertyImage[] = propertyImages.map((img) => ({
    propertyImageId: img.propertyImageId,
    propertyId: img.propertyId,
    referenceNumber: img.referenceNumber,
    imageUrl: img.imageUrl ?? defaultPlaceholder,
    isActive: img.isActive ?? true,
    createdAt: img.createdAt,
    updatedAt: img.updatedAt,
    imageKey: img.imageKey,
    imageTag: img.imageTag ?? undefined,
    s3key: img.s3key,
    imageOrder: img.imageOrder,
  }));

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PropertyBreadcrumb
          propertyType={listing.propertyType ?? ""}
          street={listing.street ?? ""}
          referenceNumber={listing.referenceNumber ?? ""}
        />

        {/* Property Title - Always Visible */}
        <PropertyHeader
          propertyType={listing.propertyType ?? ""}
          street={listing.street ?? ""}
          city={listing.city ?? ""}
          province={listing.province ?? ""}
          postalCode={listing.postalCode ?? ""}
          referenceNumber={listing.referenceNumber ?? ""}
          price={listing.price}
          listingType={listing.listingType as "Sale" | "Rent" | "Sold"}
          isBankOwned={listing.isBankOwned ?? false}
          isFeatured={listing.isFeatured ?? false}
          neighborhood={listing.neighborhood ?? ""}
        />

        {/* Property Tabs - Under Title */}
        <div className="pb-16">
          <PropertyTabs
            listing={listing}
            convertedListing={convertDbListingToPropertyListing(listing)}
            images={processedImages}
            energyCertificate={energyCertificate}
          />
        </div>
      </div>
    </>
  );
}
