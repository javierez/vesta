import { notFound } from "next/navigation";
import {
  getListingBreadcrumbData,
  getListingHeaderData,
} from "~/server/queries/listing";
import { PropertyBreadcrumb } from "~/components/propiedades/detail/property-breadcrump";
import { PropertyHeader } from "~/components/propiedades/detail/property-header";
import { ImageStudioGallery } from "~/components/propiedades/detail/image-studio-gallery";
import { GradientTitle } from "~/components/ui/gradient-title";
import { getSecureSession } from "~/lib/dal";
import { getPropertyImages } from "~/server/queries/property_images";
import type { PropertyImage } from "~/lib/data";

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
  const images = await getPropertyImages(headerData.propertyId).catch(() => []);

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


      {/* Main Content */}
      <div className="space-y-16">
        {/* Image Gallery Section */}
        <section className="animate-in slide-in-from-bottom-8 duration-700 delay-300">
          <ImageStudioGallery
            images={images as PropertyImage[]}
            title={headerData.title ?? ""}
          />
        </section>
        
        {/* Tools Section */}
        <section className="animate-in slide-in-from-bottom-8 duration-700 delay-500">          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 max-w-4xl mx-auto">
            <div className="group relative overflow-hidden rounded-xl border border-gray-200/50 bg-white/70 backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/10 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-400 to-rose-400 flex items-center justify-center mb-3 mx-auto">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Mejorar Calidad</h4>
                <p className="text-xs text-gray-600">
                  Corrección automática de color y brillo
                </p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl border border-gray-200/50 bg-white/70 backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/10 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-400 to-rose-400 flex items-center justify-center mb-3 mx-auto">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Eliminar Objetos</h4>
                <p className="text-xs text-gray-600">
                  Remueve elementos no deseados con IA
                </p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl border border-gray-200/50 bg-white/70 backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/10 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-400 to-rose-400 flex items-center justify-center mb-3 mx-auto">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Decorar</h4>
                <p className="text-xs text-gray-600">
                  Añade muebles y decoración virtual
                </p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl border border-gray-200/50 bg-white/70 backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/10 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-400 to-rose-400 flex items-center justify-center mb-3 mx-auto">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Reforma</h4>
                <p className="text-xs text-gray-600">
                  Simula reformas y renovaciones
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-rose-100 border border-amber-200/50">
              <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full mr-2 animate-pulse" />
              <p className="text-xs font-medium text-gray-700">
                Próximamente disponible
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}