"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Progress } from "~/components/ui/progress";
import { CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import { calculateCompletion, type FieldRule } from "~/lib/property-completion-tracker";
import { cn } from "~/lib/utils";
import { useState, useEffect } from "react";
import { Card } from "~/components/ui/card";
import { getPropertyImageCount } from "~/app/actions/property-images";

interface CompletionTrackerModalProps {
  listing: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CompletionTrackerModal({
  listing,
  isOpen,
  onClose,
}: CompletionTrackerModalProps) {
  const [imageCount, setImageCount] = useState(0);
  const [isLoadingImages, setIsLoadingImages] = useState(true);

  const [expandedSections, setExpandedSections] = useState({
    mandatory: true,
    nth: false,
  });

  // Fetch property images when modal opens
  useEffect(() => {
    if (isOpen && listing?.propertyId) {
      setIsLoadingImages(true);
      getPropertyImageCount(BigInt(listing.propertyId))
        .then((count) => {
          setImageCount(count);
        })
        .catch((error) => {
          console.error("Error fetching images:", error);
          setImageCount(0);
        })
        .finally(() => {
          setIsLoadingImages(false);
        });
    }
  }, [isOpen, listing?.propertyId]);

  // Calculate completion with image count
  const listingWithImages = {
    ...listing,
    imageCount,
  };

  const completion = calculateCompletion(listingWithImages);

  // Determine progress bar gradient - green when all mandatory fields complete
  const progressGradient =
    completion.canPublishToPortals
      ? "bg-gradient-to-r from-emerald-400 to-green-500"
      : completion.overallPercentage >= 50
        ? "bg-gradient-to-r from-amber-400 to-orange-500"
        : "bg-gradient-to-r from-rose-400 to-pink-500";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-semibold">
            Estado del Registro
          </DialogTitle>
        </DialogHeader>

        {/* Overall Progress */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-center">
            {/* Circular progress ring */}
            <div className="relative">
              <svg width="120" height="120" className="transform -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={
                    completion.canPublishToPortals ? "#10b981" :
                    completion.overallPercentage >= 50 ? "#f59e0b" :
                    "#ef4444"
                  }
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 - (completion.overallPercentage / 100) * 2 * Math.PI * 50}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{completion.overallPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Publish readiness indicator */}
          {completion.canPublishToPortals ? (
            <div className="flex items-center justify-center gap-3 text-white bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 rounded-lg shadow-md">
              <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
              <span className="text-base font-semibold">Listo para publicar</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{completion.mandatory.pending.length} campos obligatorios pendientes</span>
            </div>
          )}
        </div>

        {/* MANDATORY Section */}
        <FieldSection
          title="CAMPOS OBLIGATORIOS"
          subtitle="Esenciales para publicar en portales"
          data={completion.mandatory}
          color="mandatory"
          expanded={expandedSections.mandatory}
          onToggle={() =>
            setExpandedSections((s) => ({ ...s, mandatory: !s.mandatory }))
          }
        />

        {/* NTH Section */}
        <FieldSection
          title="CAMPOS OPCIONALES"
          subtitle="Mejoran la calidad del anuncio"
          data={completion.nth}
          color="optional"
          expanded={expandedSections.nth}
          onToggle={() => setExpandedSections((s) => ({ ...s, nth: !s.nth }))}
        />
      </DialogContent>
    </Dialog>
  );
}

interface FieldSectionProps {
  title: string;
  subtitle: string;
  data: {
    completed: Array<FieldRule & { isCompleted: boolean }>;
    pending: Array<FieldRule & { isCompleted: boolean }>;
    total: number;
    completedCount: number;
  };
  color: "mandatory" | "optional";
  expanded: boolean;
  onToggle: () => void;
}

function FieldSection({
  title,
  subtitle,
  data,
  color,
  expanded,
  onToggle,
}: FieldSectionProps) {
  return (
    <Card className="relative p-4 mb-3 transition-all duration-300 hover:shadow-md">
      <button
        onClick={onToggle}
        className="group flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2 text-left flex-1">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-muted-foreground">
                {data.completedCount}/{data.total} completados
              </span>
              {data.pending.length > 0 && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs font-medium text-amber-600">
                    {data.pending.length} pendientes
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200 custom-scrollbar",
          expanded ? "max-h-[600px] mt-3 overflow-y-auto" : "max-h-0"
        )}
      >
        <div className="space-y-1.5 pr-3 mr-2">
          {/* Show pending first */}
          {data.pending.map((field) => (
            <FieldRow key={field.id} field={field} isCompleted={false} />
          ))}
          {/* Then completed */}
          {data.completed.map((field) => (
            <FieldRow key={field.id} field={field} isCompleted={true} />
          ))}
        </div>
      </div>
    </Card>
  );
}

interface FieldRowProps {
  field: FieldRule & { isCompleted: boolean };
  isCompleted: boolean;
}

function FieldRow({ field, isCompleted }: FieldRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors",
        isCompleted
          ? "bg-muted/30 opacity-50"
          : "bg-background hover:bg-muted/50"
      )}
    >
      {isCompleted ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{field.label}</p>
        <p className="text-xs text-muted-foreground">{field.category}</p>
      </div>
    </div>
  );
}