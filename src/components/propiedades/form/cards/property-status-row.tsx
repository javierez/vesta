"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Card } from "~/components/ui/card";
import { PropertyImagePlaceholder } from "~/components/propiedades/PropertyImagePlaceholder";
import { ImageViewer } from "~/components/ui/image-viewer";
import { getAllPropertyImages } from "~/app/actions/property-images";
import { PROCESS_STAGES, getStageStyles } from "~/lib/constants/process-stages";
import type { ProcessStage } from "~/lib/constants/process-stages";
import { cn } from "~/lib/utils";

// Custom scrollbar styles for this component only
const scrollbarStyles = `
  .property-status-scrollbar::-webkit-scrollbar {
    height: 4px;
  }

  .property-status-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .property-status-scrollbar::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 100px;
    transition: background 0.3s ease;
  }

  .property-status-scrollbar.scrolling::-webkit-scrollbar-thumb {
    background: hsl(var(--muted-foreground) / 0.2);
  }

  .property-status-scrollbar.scrolling::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--muted-foreground) / 0.3);
  }

  .property-status-scrollbar.scrolling::-webkit-scrollbar-thumb:active {
    background: hsl(var(--muted-foreground) / 0.4);
  }
`;

interface PropertyStatusRowProps {
  firstImageUrl?: string | null;
  oportunidadStatus?: string | null;
  propertyType?: string | null;
  propertyId?: number | string | bigint | null;
}

function ProcessStageCard({
  stage,
  index
}: {
  stage: ProcessStage;
  index: number;
}) {
  const styles = getStageStyles(stage.status);

  return (
    <div
      className={cn(
        "relative rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 transition-all",
        styles.card,
        stage.id === "busqueda" && "min-w-[120px] sm:min-w-[150px] md:min-w-[180px]"
      )}
    >
      {/* Stage header */}
      <div className="mb-3 sm:mb-4 md:mb-6">
        <h2
          className={cn(
            "text-xs sm:text-sm font-semibold uppercase tracking-wider",
            styles.title
          )}
        >
          {stage.label}
        </h2>
      </div>

      {/* Substages in horizontal flow */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
        {stage.subStages.map((substage, subIndex) => {
          const substageStyles = getStageStyles(substage.status);
          return (
            <div key={substage.id} className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <div
                className={cn(
                  "rounded-md sm:rounded-lg px-2 py-1 sm:px-3 sm:py-2 transition-all whitespace-nowrap",
                  substageStyles.substage
                )}
              >
                <span className="text-[10px] sm:text-xs font-medium">{substage.label}</span>
              </div>

              {subIndex < stage.subStages.length - 1 && (
                <div className="flex items-center justify-center">
                  <ChevronRight
                    size={12}
                    className={cn(
                      "sm:w-3.5 sm:h-3.5 flex-shrink-0 transition-all duration-200",
                      "drop-shadow-sm transform hover:scale-110 hover:drop-shadow-md",
                      substageStyles.connector
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PropertyStatusRow({
  firstImageUrl,
  oportunidadStatus: _oportunidadStatus,
  propertyType,
  propertyId,
}: PropertyStatusRowProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeStageRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Handle scroll events to show/hide scrollbar
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Hide scrollbar after 1 second of inactivity
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll to center the active stage on mount
  useEffect(() => {
    if (scrollContainerRef.current && activeStageRef.current) {
      const container = scrollContainerRef.current;
      const activeElement = activeStageRef.current;

      const containerWidth = container.offsetWidth;
      const elementLeft = activeElement.offsetLeft;
      const elementWidth = activeElement.offsetWidth;

      // Calculate scroll position to center the active element
      const scrollPosition = elementLeft - (containerWidth / 2) + (elementWidth / 2);

      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="col-span-full grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 -mt-2 md:-mt-3">
      {/* Process Chart - 75% (3 columns) */}
      <div className="lg:col-span-3 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className={cn(
            "p-2 sm:p-3 md:p-4 lg:p-5 overflow-x-auto property-status-scrollbar",
            isScrolling && "scrolling"
          )}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            {PROCESS_STAGES.map((stage, index) => {
              const isActive = stage.status === "ongoing";
              return (
                <div key={stage.id} className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                  {/* Stage container */}
                  <div ref={isActive ? activeStageRef : null}>
                    <ProcessStageCard stage={stage} index={index} />
                  </div>

                  {/* Connector arrow */}
                  {index < PROCESS_STAGES.length - 1 && (
                    <div className="flex items-center justify-center flex-shrink-0 px-0.5 sm:px-1">
                      <ChevronRight
                        size={20}
                        strokeWidth={3}
                        className={cn(
                          "sm:w-6 sm:h-6 md:w-7 md:h-7",
                          "transition-all duration-300",
                          "drop-shadow-lg transform hover:scale-125 hover:rotate-3",
                          "filter brightness-110",
                          // Make arrow lighter if next stage is future (todo)
                          PROCESS_STAGES[index + 1]?.status === "future"
                            ? "text-slate-300"
                            : "text-slate-400"
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Image Preview - 25% (1 column) */}
      <Card className="lg:col-span-1 border-gray-200/50 overflow-hidden">
        <div className="relative h-full min-h-[120px] sm:min-h-[140px] md:min-h-[160px]">
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
    </>
  );
}
