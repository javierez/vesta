import { notFound } from "next/navigation";
import {
  getListingBreadcrumbData,
  getListingHeaderData,
} from "~/server/queries/listing";
import { PropertyBreadcrumb } from "~/components/propiedades/detail/property-breadcrump";
import { PropertyHeader } from "~/components/propiedades/detail/property-header";
import { getSecureSession } from "~/lib/dal";
import { getPropertyImages } from "~/server/queries/property_images";

interface ImageStudioPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ImageStudioPage({ params }: ImageStudioPageProps) {
  const unwrappedParams = await params;
  const listingId = parseInt(unwrappedParams.id);
  await getSecureSession();

  // Get data with optimized queries
  const [breadcrumbData, headerData] = await Promise.all([
    getListingBreadcrumbData(listingId),
    getListingHeaderData(listingId),
  ]);

  if (!breadcrumbData || !headerData) {
    notFound();
  }

  // Get images after we have headerData
  await getPropertyImages(headerData.propertyId).catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <PropertyBreadcrumb
        propertyType={breadcrumbData.propertyType ?? ""}
        street={breadcrumbData.street ?? ""}
        referenceNumber={breadcrumbData.referenceNumber ?? ""}
        documentFolder={{
          name: "Vesta Image Studio",
          propertyId: headerData.propertyId.toString(),
        }}
      />

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

      <div className="mt-8">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Vesta Image Studio
          </h2>
          <p className="text-gray-600">
            Herramientas avanzadas para la edición y mejora de imágenes de propiedades.
          </p>
          
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900">Mejora automática</h3>
              <p className="mt-2 text-sm text-gray-500">
                Aplica automáticamente corrección de color, brillo y contraste
              </p>
            </div>
            
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900">Eliminación de objetos</h3>
              <p className="mt-2 text-sm text-gray-500">
                Remueve objetos no deseados de las imágenes
              </p>
            </div>
            
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900">Redimensionado inteligente</h3>
              <p className="mt-2 text-sm text-gray-500">
                Optimiza las imágenes para diferentes portales inmobiliarios
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-500">
              Funcionalidad en desarrollo - Próximamente disponible
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}