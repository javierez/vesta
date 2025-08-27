import { notFound } from "next/navigation";
import {
  getListingBreadcrumbData,
  getListingHeaderData,
  getListingDocumentsData,
} from "~/server/queries/listing";
import { PropertyBreadcrumb } from "~/components/propiedades/detail/property-breadcrump";
import { PropertyHeader } from "~/components/propiedades/detail/property-header";
import { DocumentsPage } from "~/components/propiedades/detail/documents-page";

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OtrosPage({ params }: DocumentPageProps) {
  const unwrappedParams = await params;
  const listingId = parseInt(unwrappedParams.id);

  // Get data with optimized queries
  const [breadcrumbData, headerData, documentsData] = await Promise.all([
    getListingBreadcrumbData(listingId),
    getListingHeaderData(listingId),
    getListingDocumentsData(listingId),
  ]);

  if (!breadcrumbData || !headerData || !documentsData) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <PropertyBreadcrumb
        propertyType={breadcrumbData.propertyType ?? ""}
        street={breadcrumbData.street ?? ""}
        referenceNumber={breadcrumbData.referenceNumber ?? ""}
        documentFolder={{
          name: "Otros",
          propertyId: headerData.propertyId.toString(),
        }}
      />

      {/* Property Title - Always Visible */}
      <PropertyHeader
        title={headerData.title ?? ""}
        propertyId={headerData.propertyId}
        street={headerData.street ?? ""}
        city={headerData.city ?? ""}
        province={headerData.province ?? ""}
        postalCode={headerData.postalCode ?? ""}
        price={headerData.price}
        listingType={headerData.listingType}
        isBankOwned={headerData.isBankOwned ?? false}
      />

      <DocumentsPage listing={documentsData} folderType="otros" />
    </div>
  );
}
