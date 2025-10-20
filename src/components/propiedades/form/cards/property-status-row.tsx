"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Card } from "~/components/ui/card";
import { PropertyImagePlaceholder } from "~/components/propiedades/PropertyImagePlaceholder";
import { ImageViewer } from "~/components/ui/image-viewer";
import { getAllPropertyImages } from "~/app/actions/property-images";
import { PROCESS_STAGES } from "~/lib/constants/process-stages";
import type { StageStatus } from "~/lib/constants/process-stages";
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

// Timeline node component for substages
function TimelineNode({
  label,
  status,
  labelPosition,
  isFirst,
  isLast
}: {
  label: string;
  status: StageStatus;
  labelPosition: "above" | "below";
  isFirst: boolean;
  isLast: boolean;
}) {
  const isFuture = status === "future";

  // Larger dots for first and last
  const dotSize = isFirst || isLast
    ? "h-6 w-6 sm:h-7 sm:w-7"
    : "h-3 w-3 sm:h-3.5 sm:w-3.5";

  return (
    <div className="relative flex flex-col items-center">
      {/* Label - positioned absolutely with fixed baseline alignment */}
      <div
        className={cn(
          "absolute whitespace-nowrap text-[11px] sm:text-xs font-medium flex items-center justify-center",
          labelPosition === "above" ? "bottom-[calc(100%+0.25rem)] sm:bottom-[calc(100%+0.375rem)]" : "top-[calc(100%+0.25rem)] sm:top-[calc(100%+0.375rem)]",
          isFuture ? "text-slate-300" : "text-slate-900"
        )}
        style={{
          height: labelPosition === "above" ? "1.5rem" : "1.5rem"
        }}
      >
        {label}
      </div>

      {/* Dot */}
      <div
        className={cn(
          "relative z-10 rounded-full transition-all",
          dotSize,
          isFuture ? "bg-slate-300" : "bg-slate-900"
        )}
      />
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

  // Calculate total substages for proportional width
  const totalSubstages = PROCESS_STAGES.reduce((acc, stage) => acc + stage.subStages.length, 0);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="col-span-full grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 -mt-2 md:-mt-3">
        {/* Process Timeline - 75% (3 columns) */}
        <div className="lg:col-span-3 overflow-hidden">
          <div
            ref={scrollContainerRef}
            className={cn(
              "px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 overflow-x-auto property-status-scrollbar",
              isScrolling && "scrolling"
            )}
          >
            {/* Stage headers with dividers */}
            <div className="relative mb-8 sm:mb-12 flex gap-2">
              {PROCESS_STAGES.map((stage) => {
                const isActive = stage.status === "ongoing";
                const isFuture = stage.status === "future";
                const stageSubstageCount = stage.subStages.length;

                // Apply width multiplier to give búsqueda more space
                const widthMultiplier = stage.id === "busqueda" ? 1.5 : 1;
                const adjustedCount = stageSubstageCount * widthMultiplier;
                const totalAdjusted = PROCESS_STAGES.reduce((acc, s) => {
                  const multiplier = s.id === "busqueda" ? 1.5 : 1;
                  return acc + (s.subStages.length * multiplier);
                }, 0);
                const widthPercent = (adjustedCount / totalAdjusted) * 100;

                return (
                  <div
                    key={stage.id}
                    className="relative flex items-center"
                    style={{ width: `${widthPercent}%` }}
                  >
                    {/* Subtle background box */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-lg transition-colors border-l border-r",
                        isFuture ? "border-slate-200" : "border-slate-300"
                      )}
                    />

                    {/* Stage title */}
                    <h2
                      ref={isActive ? activeStageRef : null}
                      className={cn(
                        "relative w-full text-center text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-widest py-2",
                        isFuture ? "text-slate-300" : "text-slate-900"
                      )}
                    >
                      {stage.label}
                    </h2>
                  </div>
                );
              })}
            </div>

            {/* Timeline with dots and substages */}
            <div className="relative px-[calc((100%/${totalSubstages})/2)]">
              {/* Horizontal line - starts at first dot and ends at last dot */}
              <div className="absolute top-1/2 h-0.5 bg-slate-300"
                   style={{
                     left: `calc((100% / ${totalSubstages}) / 2)`,
                     right: `calc((100% / ${totalSubstages}) / 2)`
                   }}
              />

              <div className="relative flex items-center">
                {PROCESS_STAGES.map((stage, stageIndex) => {
                  const stageSubstageCount = stage.subStages.length;
                  const widthPercent = (stageSubstageCount / totalSubstages) * 100;

                  return (
                    <div
                      key={stage.id}
                      className="flex items-center justify-around"
                      style={{ width: `${widthPercent}%` }}
                    >
                      {stage.subStages.map((substage, subIndex) => {
                        const globalIndex =
                          PROCESS_STAGES.slice(0, stageIndex).reduce((acc, s) => acc + s.subStages.length, 0) + subIndex;
                        const isFirst = globalIndex === 0;
                        const isLast = globalIndex === totalSubstages - 1;
                        const labelPosition = globalIndex % 2 === 0 ? "above" : "below";

                        return (
                          <TimelineNode
                            key={substage.id}
                            label={substage.label}
                            status={substage.status}
                            labelPosition={labelPosition}
                            isFirst={isFirst}
                            isLast={isLast}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
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
