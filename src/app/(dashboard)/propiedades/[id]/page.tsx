import { notFound, redirect } from "next/navigation";
import { PropertyBreadcrumb } from "~/components/propiedades/detail/property-breadcrump";
import { PropertyHeader } from "~/components/propiedades/detail/property-header";
import { PropertyTabs } from "~/components/propiedades/detail/property-tabs";
import { getPropertyImages } from "~/server/queries/property_images";
import {
  getListingDetailsWithAuth,
  getListingBreadcrumbData,
  getListingHeaderData,
  getListingTabsData,
} from "~/server/queries/listing";
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
  const listingId = parseInt(unwrappedParams.id);

  // Get data with optimized queries
  const [breadcrumbData, headerData, tabsData, fullListingDetails] =
    await Promise.all([
      getListingBreadcrumbData(listingId),
      getListingHeaderData(listingId),
      getListingTabsData(listingId),
      getListingDetailsWithAuth(listingId),
    ]);

  // Type guard to check if fullListingDetails is a valid record
  const isValidRecord = (obj: unknown): obj is Record<string, unknown> => {
    return (
      obj != null && typeof obj === "object" && Object.keys(obj).length > 0
    );
  };

  if (!breadcrumbData || !headerData || !tabsData) {
    notFound();
  }

  // Check if this is a draft listing and redirect to edit page
  if (
    isValidRecord(fullListingDetails) &&
    (fullListingDetails as { status?: string }).status === "Draft"
  ) {
    redirect(`/propiedades/crear/${listingId}`);
  }

  // Get energy certificate document and images in parallel
  const [energyCertificate, propertyImages] = await Promise.all([
    getEnergyCertificate(Number(headerData.propertyId)),
    getPropertyImages(BigInt(headerData.propertyId)),
  ]);
  const defaultPlaceholder = "";

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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <PropertyBreadcrumb
        propertyType={breadcrumbData.propertyType ?? ""}
        street={breadcrumbData.street ?? ""}
        referenceNumber={breadcrumbData.referenceNumber ?? ""}
      />

      {/* Property Title - Always Visible */}
      <PropertyHeader
        title={headerData.title ?? ""}
        propertyId={headerData.propertyId}
        propertyType={breadcrumbData.propertyType ?? ""}
        street={headerData.street ?? ""}
        city={headerData.city ?? ""}
        province={headerData.province ?? ""}
        postalCode={headerData.postalCode ?? ""}
        price={headerData.price}
        listingType={headerData.listingType}
        isBankOwned={headerData.isBankOwned ?? false}
        neighborhood=""
        dynamicTitle={true}
      />

      {/* Property Tabs - Under Title */}
      <div className="pb-16">
        <PropertyTabs
          listing={tabsData}
          convertedListing={
            isValidRecord(fullListingDetails)
              ? convertDbListingToPropertyListing(fullListingDetails)
              : undefined
          }
          images={processedImages}
          energyCertificate={energyCertificate}
        />
      </div>
    </div>
  );
}
