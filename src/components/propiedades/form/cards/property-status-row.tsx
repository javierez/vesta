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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Info } from "lucide-react";

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
  createdAt?: Date | null;
}

// Timeline node component for substages
function TimelineNode({
  label,
  status,
  labelPosition,
  isFirst,
  isLast,
  showInfoButton,
  infoTooltipContent
}: {
  label: string;
  status: StageStatus;
  labelPosition: "above" | "below";
  isFirst: boolean;
  isLast: boolean;
  showInfoButton?: boolean;
  infoTooltipContent?: string;
}) {
  const isFuture = status === "future";

  const dotSize = isFirst || isLast ? "h-6 w-6 sm:h-7 sm:w-7" : "h-3 w-3 sm:h-3.5 sm:w-3.5";

  // Log if this node has an info button
  if (showInfoButton && infoTooltipContent) {
    console.log("💡 TimelineNode with info button:", {
      label,
      infoTooltipContent,
      hasInfoButton: !!showInfoButton,
    });
  }

  return (
    <div className="relative flex flex-col items-center">
      {/* Label with optional info button - positioned absolutely with fixed baseline alignment */}
      <div
        className={cn(
          "absolute whitespace-nowrap text-[11px] sm:text-xs font-medium flex items-center justify-center gap-1",
          labelPosition === "above" ? "bottom-[calc(100%+0.5rem)] sm:bottom-[calc(100%+0.75rem)]" : "top-[calc(100%+0.5rem)] sm:top-[calc(100%+0.75rem)]",
          isFuture ? "text-slate-300" : "text-slate-900"
        )}
        style={{
          height: labelPosition === "above" ? "1.5rem" : "1.5rem"
        }}
      >
        <span>{label}</span>
        {showInfoButton && infoTooltipContent && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center rounded-full p-0.5 hover:bg-slate-200 transition-colors",
                  isFuture ? "text-slate-300" : "text-slate-600 hover:text-slate-900"
                )}
                aria-label="Información"
              >
                <Info className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{infoTooltipContent}</p>
            </TooltipContent>
          </Tooltip>
        )}
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
  createdAt,
}: PropertyStatusRowProps) {
  // Log the props to verify data
  console.log("🔍 PropertyStatusRow props:", {
    firstImageUrl,
    propertyType,
    propertyId,
    createdAt,
    createdAtType: typeof createdAt,
    createdAtInstanceOfDate: createdAt instanceof Date,
    createdAtValue: createdAt,
  });

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

  useEffect(() => {
    if (scrollContainerRef.current && activeStageRef.current) {
      const container = scrollContainerRef.current;
      const activeElement = activeStageRef.current;

      const containerWidth = container.offsetWidth;
      const elementLeft = activeElement.offsetLeft;
      const elementWidth = activeElement.offsetWidth;

      const scrollPosition = elementLeft - containerWidth / 2 + elementWidth / 2;

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, []);

  // Calculate total substages for proportional width
  const totalSubstages = PROCESS_STAGES.reduce((acc, stage) => acc + stage.subStages.length, 0);

  const completedSubstages = PROCESS_STAGES.reduce((acc, stage) => {
    return acc + stage.subStages.filter((sub) => sub.status === "accomplished").length;
  }, 0);
  const progressPercent = (completedSubstages / totalSubstages) * 100;

  // Format created date for tooltip - using short date format
  const createdAtText = createdAt
    ? new Date(createdAt).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : undefined;

  console.log("📅 Formatted createdAt text:", {
    createdAtText,
    hasCreatedAt: !!createdAt,
    willShowTooltip: !!(createdAtText),
  });

  return (
    <TooltipProvider>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="col-span-full grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 -mt-2 md:-mt-3">
        {/* Process Timeline - 75% (3 columns) */}
        <div className="lg:col-span-3 overflow-hidden">
          <div
            ref={scrollContainerRef}
            className={cn(
              "px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 overflow-x-auto property-status-scrollbar",
              isScrolling && "scrolling"
            )}
          >
            {/* Timeline with dots and substages */}
            <div className="relative px-[calc((100%/${totalSubstages})/2)]">
              {/* Progress bar background */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-3 bg-slate-200 rounded-full overflow-hidden shadow-sm"
                style={{
                  left: `calc((100% / ${totalSubstages}) / 2)`,
                  right: `calc((100% / ${totalSubstages}) / 2)`,
                }}
              >
                <div
                  className="h-full bg-slate-800 rounded-full transition-all duration-500 ease-out shadow-md"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

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

                        // Add info button for "Alta propiedad" with created date
                        const showInfoButton = substage.id === "alta" && !!createdAtText;
                        const infoTooltipContent = substage.id === "alta" && createdAtText
                          ? `Creado: ${createdAtText}`
                          : undefined;

                        // Log info button assignment
                        if (substage.id === "alta") {
                          console.log("🎯 Alta propiedad node:", {
                            substageId: substage.id,
                            substageLabel: substage.label,
                            createdAtText,
                            infoTooltipContent,
                            showInfoButton,
                          });
                        }

                        return (
                          <TimelineNode
                            key={substage.id}
                            label={substage.label}
                            status={substage.status}
                            labelPosition={labelPosition}
                            isFirst={isFirst}
                            isLast={isLast}
                            showInfoButton={showInfoButton}
                            infoTooltipContent={infoTooltipContent}
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
    </TooltipProvider>
  );
}
