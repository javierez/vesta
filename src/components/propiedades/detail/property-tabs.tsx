"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { ImageGallery } from "./image-gallery";
import { PortalSelection } from "./portal-selection";
import { EnergyCertificate } from "./energy-certificate";
import { DocumentsManager } from "./documents-manager";
import { Tareas } from "./tareas";
import { PropertyCharacteristicsForm } from "~/components/propiedades/form/property-characteristics-form";
import { CharacteristicsSkeleton } from "./skeletons";
import { useSession } from "~/lib/auth-client";
import type { PropertyImage } from "~/lib/data";
import type { PropertyListing } from "~/types/property-listing";
import { getListingTasksWithAuth } from "~/server/queries/task";

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
    agentId?: string | null; // Changed from bigint to match users.id type
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
  convertedListing?: PropertyListing;
}

export function PropertyTabs({
  listing,
  convertedListing,
  images,
  energyCertificate,
}: PropertyTabsProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("general");
  const [tabData, setTabData] = useState<{
    images: PropertyImage[] | null;
    convertedListing: PropertyListing | null | undefined;
    energyCertificate: {
      docId: bigint;
      documentKey: string;
      fileUrl: string;
    } | null;
    tasks: any[] | null;
  }>({
    images: null,
    convertedListing: null,
    energyCertificate: null,
    tasks: null,
  });
  const [loading, setLoading] = useState<{
    caracteristicas: boolean;
    tasks: boolean;
  }>({
    caracteristicas: false,
    tasks: false,
  });

  const fetchGeneralData = useCallback(async () => {
    if (tabData.convertedListing) return;
    setLoading((prev) => ({ ...prev, caracteristicas: true }));
    try {
      const response = await fetch(
        `/api/properties/${listing.listingId}/characteristics`,
      );
      if (response.ok) {
        const characteristicsData = (await response.json()) as PropertyListing;
        setTabData((prev) => ({
          ...prev,
          convertedListing: characteristicsData,
        }));
      } else {
        setTabData((prev) => ({ ...prev, convertedListing }));
      }
    } catch {
      setTabData((prev) => ({ ...prev, convertedListing }));
    } finally {
      setLoading((prev) => ({ ...prev, caracteristicas: false }));
    }
  }, [listing.listingId, tabData.convertedListing, convertedListing]);

  const fetchImagesData = useCallback(async () => {
    if (tabData.images) return;
    try {
      const response = await fetch(
        `/api/properties/${listing.propertyId}/images`,
      );
      if (response.ok) {
        const imageData = (await response.json()) as PropertyImage[];
        setTabData((prev) => ({ ...prev, images: imageData }));
      } else {
        setTabData((prev) => ({ ...prev, images: images }));
      }
    } catch {
      setTabData((prev) => ({ ...prev, images: images }));
    }
  }, [listing.propertyId, tabData.images, images]);

  const fetchCertificateData = useCallback(async () => {
    // Energy certificate is now always fetched server-side
    if (!tabData.energyCertificate && energyCertificate) {
      setTabData((prev) => ({ ...prev, energyCertificate }));
    }
  }, [tabData.energyCertificate, energyCertificate]);

  const fetchTasksData = useCallback(async () => {
    if (tabData.tasks) return;
    setLoading((prev) => ({ ...prev, tasks: true }));
    try {
      const tasksData = await getListingTasksWithAuth(Number(listing.listingId));
      const tasksWithId = tasksData.map(task => ({
        ...task,
        id: task.taskId?.toString() || Date.now().toString(),
        taskId: task.taskId ? BigInt(task.taskId) : undefined,
        listingId: task.listingId ? BigInt(task.listingId) : undefined,
        leadId: task.leadId ? BigInt(task.leadId) : undefined,
        dealId: task.dealId ? BigInt(task.dealId) : undefined,
        appointmentId: task.appointmentId ? BigInt(task.appointmentId) : undefined,
        prospectId: task.prospectId ? BigInt(task.prospectId) : undefined,
        createdAt: new Date(task.createdAt),
        updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        completed: task.completed ?? false,
        isActive: task.isActive ?? true,
      }));
      setTabData((prev) => ({ ...prev, tasks: tasksWithId }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTabData((prev) => ({ ...prev, tasks: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, tasks: false }));
    }
  }, [listing.listingId, tabData.tasks]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  useEffect(() => {
    void fetchGeneralData();
    void fetchImagesData();
    void fetchCertificateData();
    void fetchTasksData();
  }, [fetchGeneralData, fetchImagesData, fetchCertificateData, fetchTasksData]);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="imagenes">Imágenes</TabsTrigger>
        <TabsTrigger value="portales">Portales</TabsTrigger>
        <TabsTrigger value="certificado">Certificado</TabsTrigger>
        <TabsTrigger value="documentos">Documentos</TabsTrigger>
        <TabsTrigger value="tareas">Tareas</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-6">
        <div className="mx-auto max-w-4xl">
          {loading.caracteristicas ? (
            <CharacteristicsSkeleton />
          ) : (tabData.convertedListing ?? convertedListing) ? (
            <PropertyCharacteristicsForm
              listing={tabData.convertedListing ?? convertedListing!}
            />
          ) : (
            <div className="py-8 text-center">
              <p>No se pudo cargar la información de la propiedad</p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="imagenes" className="mt-6">
        <div className="mx-auto max-w-3xl">
          <ImageGallery
            images={tabData.images ?? images}
            title={listing.title ?? ""}
            propertyId={BigInt(listing.propertyId)}
            referenceNumber={listing.referenceNumber ?? ""}
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
            uploadedDocument={tabData.energyCertificate ?? energyCertificate}
            propertyId={listing.propertyId}
            userId={session?.user?.id ?? "1"}
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

      <TabsContent value="documentos" className="mt-6">
        <div className="mx-auto max-w-6xl">
          <DocumentsManager
            propertyId={listing.propertyId}
            listingId={listing.listingId}
            referenceNumber={listing.referenceNumber ?? ""}
          />
        </div>
      </TabsContent>

      <TabsContent value="tareas" className="mt-6">
        <div className="mx-auto max-w-6xl">
          <Tareas
            propertyId={listing.propertyId}
            listingId={listing.listingId}
            referenceNumber={listing.referenceNumber ?? ""}
            tasks={tabData.tasks ?? []}
            loading={loading.tasks}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
