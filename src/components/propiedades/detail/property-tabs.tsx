"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { ImageGallery } from "./image-gallery";
import { PortalSelection } from "./portal-selection";
import { EnergyCertificate } from "./energy-certificate";
import { PropertyCharacteristicsForm } from "~/components/propiedades/form/property-characteristics-form";
import type { PropertyImage } from "~/lib/data";
import type { PropertyListing } from "~/types/property-listing";

interface PropertyTabsProps {
  listing: {
    listingId: bigint;
    propertyId: bigint;
    propertyType?: string | null;
    street?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    referenceNumber?: string | null;
    price: string;
    listingType: string;
    isBankOwned?: boolean | null;
    isFeatured?: boolean | null;
    neighborhood?: string | null;
    title?: string | null;
    fotocasa?: boolean | null;
    idealista?: boolean | null;
    habitaclia?: boolean | null;
    milanuncios?: boolean | null;
    energyCertification?: string | null;
    agentId?: bigint | null;
    energyCertificateStatus?: string | null;
    energyConsumptionScale?: string | null;
    energyConsumptionValue?: string | null;
    emissionsScale?: string | null;
    emissionsValue?: string | null;
  };
  images: PropertyImage[];
  energyCertificate?: {
    docId: bigint;
    documentKey: string;
    fileUrl: string;
  } | null;
  convertedListing: PropertyListing;
}

export function PropertyTabs({
  listing,
  convertedListing,
  images,
  energyCertificate,
}: PropertyTabsProps) {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="caracteristicas">Características</TabsTrigger>
        <TabsTrigger value="portales">Portales</TabsTrigger>
        <TabsTrigger value="certificado">Certificado Energético</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-6">
        <div className="mx-auto max-w-3xl">
          <ImageGallery
            images={images}
            title={listing.title ?? ""}
            propertyId={BigInt(listing.propertyId)}
            referenceNumber={listing.referenceNumber ?? ""}
          />
        </div>
      </TabsContent>

      <TabsContent value="caracteristicas" className="mt-6">
        <div className="mx-auto max-w-4xl">
          <PropertyCharacteristicsForm
            listing={convertedListing}
          />
        </div>
      </TabsContent>

      <TabsContent value="portales" className="mt-6">
        <div className="mx-auto max-w-4xl">
          <PortalSelection
            listingId={listing.listingId.toString()}
            fotocasa={listing.fotocasa ?? undefined}
            idealista={listing.idealista ?? undefined}
            habitaclia={listing.habitaclia ?? undefined}
            milanuncios={listing.milanuncios ?? undefined}
          />
        </div>
      </TabsContent>

      <TabsContent value="certificado" className="mt-6">
        <div className="mx-auto max-w-4xl">
          <EnergyCertificate
            energyRating={listing.energyCertification ?? null}
            uploadedDocument={
              energyCertificate
                ? {
                    docId: energyCertificate.docId,
                    documentKey: energyCertificate.documentKey,
                    fileUrl: energyCertificate.fileUrl,
                  }
                : null
            }
            propertyId={listing.propertyId}
            userId={listing.agentId ?? BigInt(1)} // TODO: Get from auth context
            listingId={listing.listingId}
            referenceNumber={listing.referenceNumber ?? ""}
            energyCertificateStatus={listing.energyCertificateStatus ?? null}
            energyConsumptionScale={listing.energyConsumptionScale ?? null}
            energyConsumptionValue={
              listing.energyConsumptionValue !== null &&
              listing.energyConsumptionValue !== undefined
                ? parseFloat(listing.energyConsumptionValue)
                : null
            }
            emissionsScale={listing.emissionsScale ?? null}
            emissionsValue={
              listing.emissionsValue !== null &&
              listing.emissionsValue !== undefined
                ? parseFloat(listing.emissionsValue)
                : null
            }
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
