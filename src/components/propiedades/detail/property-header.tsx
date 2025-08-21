"use client";

import { MapPin, Pencil, Check, X } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { formatPrice } from "~/lib/utils";
import { useState } from "react";
import { updatePropertyTitle } from "~/app/actions/property-settings";
import { toast } from "sonner";
import { formatListingType } from "../../contactos/contact-config";
interface PropertyHeaderProps {
  title?: string;
  propertyId?: bigint;
  propertyType?: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  referenceNumber: string;
  price: string;
  listingType: string;
  isBankOwned?: boolean;
  isFeatured?: boolean;
  neighborhood?: string;
}

export function PropertyHeader({
  title = "",
  propertyId,
  propertyType: _propertyType,
  street,
  city,
  province,
  postalCode,
  referenceNumber: _referenceNumber,
  price,
  listingType,
  isBankOwned = false,
  isFeatured: _isFeatured = false,
  neighborhood: _neighborhood,
}: PropertyHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!editedTitle.trim() || !propertyId) return;
    
    setIsLoading(true);
    try {
      const result = await updatePropertyTitle(propertyId, editedTitle);
      
      if (result.success) {
        setCurrentTitle(result.title!);
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

  return (
    <div className="mb-6 py-3">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="group flex items-start gap-2">
            {isEditing ? (
              <div className="flex flex-col gap-3 w-full max-w-4xl">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-3xl font-bold border border-input px-3 py-2 focus-visible:ring-2 focus-visible:ring-ring h-auto bg-background w-full"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      void handleSave();
                    } else if (e.key === 'Escape') {
                      handleCancel();
                    }
                  }}
                  disabled={isLoading}
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleSave}
                    disabled={isLoading || !editedTitle.trim()}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold leading-tight">{currentTitle}</h1>
                {propertyId && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 ml-2 flex-shrink-0 self-start"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </>
            )}
            {isBankOwned && (
              <Badge variant="secondary" className="bg-amber-500 text-white">
                Piso de Banco
              </Badge>
            )}
          </div>
          <div className="mt-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${street}, ${city}, ${province} ${postalCode}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors group"
            >
              <MapPin className="mr-1 h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="group-hover:underline">
                {street}, {city}, {province} {postalCode}
              </span>
            </a>
          </div>
        </div>
        <div className="flex flex-col md:items-end">
          <div className="text-3xl font-bold">
            {formatPrice(price)}€
            {["Rent", "RentWithOption", "RoomSharing"].includes(listingType)
              ? "/mes"
              : ""}
          </div>
          <Badge className="mt-1">
            {formatListingType(listingType)}
          </Badge>
        </div>
      </div>
    </div>
  );
}
