import { notFound } from "next/navigation";
import {
  getListingBreadcrumbData,
  getListingHeaderData,
  getListingTabsData,
} from "~/server/queries/listing";
import { PropertyBreadcrumb } from "~/components/propiedades/detail/property-breadcrump";
import { PropertyHeader } from "~/components/propiedades/detail/property-header";
import { EnergyCertificatePage } from "~/components/propiedades/detail/energy-certificate-page";
import { getSecureSession } from "~/lib/dal";
import { getEnergyCertificate } from "~/server/queries/document";

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CertificadoEnergeticoPage({ params }: DocumentPageProps) {
  const unwrappedParams = await params;
  const listingId = parseInt(unwrappedParams.id);
  const session = await getSecureSession();

  // Get data with optimized queries
  const [breadcrumbData, headerData, tabsData] = await Promise.all([
    getListingBreadcrumbData(listingId),
    getListingHeaderData(listingId),
    getListingTabsData(listingId),
  ]);

  if (!breadcrumbData || !headerData || !tabsData) {
    notFound();
  }

  // Get energy certificate document
  const energyCertificate = await getEnergyCertificate(Number(headerData.propertyId));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <PropertyBreadcrumb
        propertyType={breadcrumbData.propertyType ?? ""}
        street={breadcrumbData.street ?? ""}
        referenceNumber={breadcrumbData.referenceNumber ?? ""}
        documentFolder={{
          name: "Certificado Energético",
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

      <EnergyCertificatePage
        propertyId={headerData.propertyId}
        listingId={BigInt(listingId)}
        userId={session?.user?.id ?? "1"}
        referenceNumber={breadcrumbData.referenceNumber ?? ""}
        uploadedDocument={energyCertificate ? {
          docId: energyCertificate.docId,
          documentKey: energyCertificate.documentKey,
          fileUrl: energyCertificate.fileUrl,
        } : null}
        energyCertificateStatus={tabsData.energyCertificateStatus}
        energyConsumptionScale={tabsData.energyConsumptionScale}
        energyConsumptionValue={
          tabsData.energyConsumptionValue !== null &&
          tabsData.energyConsumptionValue !== undefined
            ? parseFloat(tabsData.energyConsumptionValue)
            : null
        }
        emissionsScale={tabsData.emissionsScale}
        emissionsValue={
          tabsData.emissionsValue !== null &&
          tabsData.emissionsValue !== undefined
            ? parseFloat(tabsData.emissionsValue)
            : null
        }
      />
    </div>
  );
}