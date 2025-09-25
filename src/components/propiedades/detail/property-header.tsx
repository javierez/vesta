"use client";

import { MapPin, Pencil, Check, X } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { formatPrice, cn } from "~/lib/utils";
import { useState, useEffect } from "react";
import { updatePropertyTitle } from "~/app/actions/property-settings";
import { updateListingStatus } from "~/app/actions/listing-settings";
import { toast } from "sonner";
import { formatListingType } from "../../contactos/contact-config";
import { generatePropertyTitle } from "~/lib/property-title";

const statusColors: Record<string, string> = {
  Sale: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-200 hover:text-amber-900 hover:border-amber-400 hover:shadow-lg hover:scale-105",
  Rent: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-200 hover:text-rose-900 hover:border-rose-400 hover:shadow-lg hover:scale-105",
  Sold: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-200 hover:text-gray-800 hover:border-gray-400 hover:shadow-lg hover:scale-105",
  RoomSharing: "bg-gradient-to-r from-amber-50 to-rose-50 text-rose-600 border-rose-200 hover:from-amber-200 hover:to-rose-200 hover:text-rose-900 hover:border-rose-400 hover:shadow-lg hover:scale-105",
  Transfer: "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-300 hover:text-amber-900 hover:border-amber-500 hover:shadow-lg hover:scale-105",
  RentWithOption: "bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-300 hover:text-rose-900 hover:border-rose-500 hover:shadow-lg hover:scale-105",
};

interface PropertyHeaderProps {
  title?: string;
  propertyId?: bigint;
  listingId?: bigint; // Add listingId for status updates
  propertyType?: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  referenceNumber?: string;
  price: string;
  listingType: string;
  status?: string; // 'En Venta' | 'En Alquiler' | 'Vendido' | 'Draft'
  isBankOwned?: boolean;
  isFeatured?: boolean;
  neighborhood?: string;
  // Optional props for dynamic title generation
  dynamicTitle?: boolean; // If true, generate title dynamically instead of using title prop
}

export function PropertyHeader({
  title = "",
  propertyId,
  listingId,
  propertyType,
  street,
  city,
  province,
  postalCode,
  referenceNumber: _referenceNumber,
  price,
  listingType,
  status,
  isBankOwned = false,
  isFeatured: _isFeatured = false,
  neighborhood,
  dynamicTitle = false,
}: PropertyHeaderProps) {
  // Generate dynamic title if enabled, otherwise use provided title
  const displayTitle = dynamicTitle && propertyType 
    ? generatePropertyTitle(propertyType, street, neighborhood ?? "")
    : title;
    
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(displayTitle);
  const [currentTitle, setCurrentTitle] = useState(displayTitle);
  const [isLoading, setIsLoading] = useState(false);
  const [hasBeenUpdated, setHasBeenUpdated] = useState(false);
  
  // Status toggle state
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Update titles when displayTitle changes (for dynamic mode) but only if we haven't manually updated the title
  useEffect(() => {
    if (!isEditing && !hasBeenUpdated) {
      setCurrentTitle(displayTitle);
      setEditedTitle(displayTitle);
    }
  }, [displayTitle, isEditing, hasBeenUpdated]);

  const handleSave = async () => {
    if (!editedTitle.trim() || !propertyId) return;

    setIsLoading(true);
    try {
      const result = await updatePropertyTitle(propertyId, editedTitle);

      if (result.success) {
        setCurrentTitle(result.title!);
        setHasBeenUpdated(true); // Mark that we've manually updated the title
        setIsEditing(false);
        toast.success("Título actualizado correctamente");
      } else {
        toast.error(result.error ?? "Error al actualizar el título");
        setEditedTitle(currentTitle); // Reset on error
      }
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Error al actualizar el título");
      setEditedTitle(currentTitle); // Reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedTitle(currentTitle);
    setIsEditing(false);
  };

  // Toggle logic function - only changes status, listingType stays constant
  const getToggledStatus = (type: string, currentStat: string | undefined) => {
    // Determine if we're currently in "active" or "completed" state
    const isCompleted = currentStat === 'Vendido' || currentStat === 'Alquilado';
    
    if (isCompleted) {
      // Toggle back to active state
      if (currentStat === 'Alquilado') {
        return {
          status: 'En Alquiler',
          displayText: 'Alquiler'
        };
      } else {
        return {
          status: 'En Venta', 
          displayText: 'Venta'
        };
      }
    } else {
      // Toggle to completed state
      if (type === 'Rent' || type === 'RentWithOption' || type === 'RoomSharing') {
        return {
          status: 'Alquilado',
          displayText: 'Alquilado'
        };
      } else {
        return {
          status: 'Vendido',
          displayText: 'Vendido'
        };
      }
    }
  };

  // Helper function to get display text based on listingType + status combination
  const getDisplayText = (type: string, stat: string | undefined) => {
    // For completed states, show the completion status
    if (stat === 'Alquilado') {
      return 'Alquilado';
    } else if (stat === 'Vendido') {
      return 'Vendido';
    } else {
      // For active states, show based on listingType
      return formatListingType(type);
    }
  };

  const handleStatusToggle = async () => {
    if (!listingId || isUpdatingStatus) return;

    const toggledState = getToggledStatus(listingType, currentStatus);
    
    // Optimistic update
    setCurrentStatus(toggledState.status);
    setIsUpdatingStatus(true);

    try {
      const result = await updateListingStatus(
        listingId,
        toggledState.status
      );

      if (result.success) {
        toast.success(
          `Estado actualizado a ${toggledState.displayText}`,
          {
            description: "El cambio se ha guardado correctamente"
          }
        );
      } else {
        // Rollback on error
        setCurrentStatus(status);
        toast.error(result.error ?? "Error al actualizar el estado");
      }
    } catch (error) {
      // Rollback on error
      setCurrentStatus(status);
      console.error("Error updating status:", error);
      toast.error("Error al actualizar el estado");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="mb-4 py-2 sm:mb-6 sm:py-3">
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="group flex items-start gap-2">
            {isEditing ? (
              <div className="flex w-full max-w-4xl flex-col gap-3">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="h-auto w-full border border-input bg-background px-3 py-2 text-xl font-bold sm:text-2xl md:text-3xl focus-visible:ring-2 focus-visible:ring-ring"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void handleSave();
                    } else if (e.key === "Escape") {
                      handleCancel();
                    }
                  }}
                  disabled={isLoading}
                  autoFocus
                />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleSave}
                    disabled={isLoading || !editedTitle.trim()}
                    className="w-full sm:w-auto"
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex min-w-0 flex-1 items-start gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold leading-tight break-words min-w-0 sm:text-2xl md:text-3xl">
                    <span className="inline break-words">
                      {currentTitle}
                    </span>
                    {propertyId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-2 sm:ml-3 inline-flex p-1.5 sm:p-2 opacity-0 transition-opacity group-hover:opacity-100 align-baseline whitespace-nowrap rounded-full min-h-[44px] min-w-[44px]"
                        onClick={() => setIsEditing(true)}
                        aria-label="Editar título"
                      >
                        <Pencil className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      </Button>
                    )}
                  </h1>
                  {isBankOwned && (
                    <Badge variant="secondary" className="bg-amber-500 text-white text-xs sm:text-sm flex-shrink-0">
                      Piso de Banco
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="mt-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${street}, ${city}, ${province} ${postalCode}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center text-sm sm:text-base text-muted-foreground transition-colors hover:text-primary break-words"
            >
              <MapPin className="mr-1 h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110" />
              <span className="group-hover:underline break-words">
                {street}, {city}, {province} {postalCode}
              </span>
            </a>
          </div>
        </div>
        <div className="flex flex-col items-start mt-2 sm:items-end sm:mt-0 md:flex-shrink-0">
          <div 
            className={cn(
              "text-xl font-bold sm:text-2xl md:text-3xl break-words transition-colors",
              listingId ? "cursor-pointer hover:text-primary" : "",
              isUpdatingStatus && "opacity-50",
              (currentStatus === 'Vendido' || currentStatus === 'Alquilado') && "line-through decoration-2"
            )}
            onClick={listingId ? handleStatusToggle : undefined}
            title={listingId ? "Haz clic para cambiar el estado" : undefined}
          >
            {formatPrice(price)}€
            {(["Rent", "RentWithOption", "RoomSharing"].includes(listingType) || currentStatus === 'Alquilado')
              ? "/mes"
              : ""}
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "mt-1 font-normal transition-all duration-200 text-xs sm:text-sm flex-shrink-0",
              statusColors[listingType],
              listingId ? "cursor-pointer hover:scale-105" : "",
              isUpdatingStatus && "opacity-50"
            )}
            onClick={listingId ? handleStatusToggle : undefined}
            title={listingId ? "Haz clic para cambiar el estado" : undefined}
          >
            {getDisplayText(listingType, currentStatus)}
          </Badge>
        </div>
      </div>
    </div>
  );
}
