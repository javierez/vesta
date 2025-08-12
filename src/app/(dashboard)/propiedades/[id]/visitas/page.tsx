import { notFound } from "next/navigation";
import { getListingDetailsWithAuth } from "~/server/queries/listing";
import { PropertyBreadcrumb } from "~/components/propiedades/detail/property-breadcrump";
import { PropertyHeader } from "~/components/propiedades/detail/property-header";
import { DocumentsPage } from "~/components/propiedades/detail/documents-page";

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VisitasPage({ params }: DocumentPageProps) {
  const unwrappedParams = await params;
  const listing = await getListingDetailsWithAuth(parseInt(unwrappedParams.id));

  if (!listing) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <PropertyBreadcrumb
        propertyType={listing.propertyType ?? ""}
        street={listing.street ?? ""}
        referenceNumber={listing.referenceNumber ?? ""}
        documentFolder={{
          name: "Visitas",
          propertyId: listing.listingId.toString(),
        }}
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

      <DocumentsPage listing={listing} folderType="visitas" />
    </div>
  );
}
