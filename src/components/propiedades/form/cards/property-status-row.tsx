"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "~/components/ui/card";
import { PropertyImagePlaceholder } from "~/components/propiedades/PropertyImagePlaceholder";
import { ImageViewer } from "~/components/ui/image-viewer";
import { getAllPropertyImages } from "~/app/actions/property-images";

interface PropertyStatusRowProps {
  firstImageUrl?: string | null;
  prospectStatus?: string | null;
  propertyType?: string | null;
  propertyId?: number | string | bigint | null;
}

export function PropertyStatusRow({
  firstImageUrl,
  prospectStatus: _prospectStatus,
  propertyType,
  propertyId,
}: PropertyStatusRowProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Mock process stages - will be connected to actual data later
  const processStages = [
    { id: "prospecto", label: "Prospecto", status: "completed" as const },
    { id: "preparacion", label: "Preparación", status: "in_progress" as const },
    { id: "publicado", label: "Publicado", status: "pending" as const },
    { id: "cerrado", label: "Cerrado", status: "pending" as const },
  ];

  const handleImageClick = async () => {
    if (!propertyId) return;

    setIsLoadingImages(true);
    try {
      // Convert propertyId to number or bigint
      const id = typeof propertyId === 'string' ? Number(propertyId) : propertyId;
      const images = await getAllPropertyImages(id);
      setPropertyImages(images);
      setIsViewerOpen(true);
    } catch (error) {
      console.error("Error loading property images:", error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const getStageStyles = (status: "completed" | "in_progress" | "pending") => {
    switch (status) {
      case "completed":
        return {
          dot: "bg-emerald-500",
          text: "text-emerald-700 font-medium",
          connector: "bg-emerald-300"
        };
      case "in_progress":
        return {
          dot: "bg-amber-500",
          text: "text-amber-700 font-medium",
          connector: "bg-gray-200"
        };
      case "pending":
        return {
          dot: "bg-gray-300",
          text: "text-gray-400",
          connector: "bg-gray-200"
        };
    }
  };

  return (
    <div className="col-span-full grid grid-cols-1 lg:grid-cols-4 gap-4 -mt-2 md:-mt-3">
      {/* Process Tracker - 75% (3 columns) */}
      <Card className="lg:col-span-3 border-gray-200/50">
        <div className="p-3 md:p-4">
          {/* Process stages */}
          <div className="flex items-center justify-between">
            {processStages.map((stage, index) => {
              const styles = getStageStyles(stage.status);
              const isLast = index === processStages.length - 1;

              return (
                <div key={stage.id} className="flex items-center flex-1">
                  {/* Stage */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Dot */}
                    <div className={`h-2 w-2 rounded-full ${styles.dot} transition-colors duration-300`} />
                    {/* Label */}
                    <p className={`text-xs ${styles.text} transition-colors duration-300 whitespace-nowrap`}>
                      {stage.label}
                    </p>
                  </div>

                  {/* Connector line */}
                  {!isLast && (
                    <div className={`flex-1 h-0.5 mx-1.5 sm:mx-2 ${styles.connector} transition-colors duration-300`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Image Preview - 25% (1 column) */}
      <Card className="lg:col-span-1 border-gray-200/50 overflow-hidden">
        <div className="relative h-full min-h-[100px] sm:min-h-[120px]">
          {firstImageUrl ? (
            <div
              className="relative w-full h-full group cursor-pointer"
              onClick={handleImageClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void handleImageClick();
                }
              }}
              aria-label="Ver imagen en tamaño completo"
            >
              <Image
                src={firstImageUrl}
                alt="Vista previa"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {isLoadingImages && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
                </div>
              )}
            </div>
          ) : (
            <PropertyImagePlaceholder
              propertyType={propertyType}
              className="h-full w-full"
            />
          )}
        </div>
      </Card>

      {/* Image Viewer */}
      <ImageViewer
        images={propertyImages}
        initialIndex={0}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        title="Imágenes de la propiedad"
      />
    </div>
  );
}
