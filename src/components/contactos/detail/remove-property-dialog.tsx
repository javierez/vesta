"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Home, MapPin, Loader } from "lucide-react";
import { formatPrice } from "~/lib/utils";

interface PropertyData {
  listingId: bigint;
  title: string | null;
  street: string | null;
  city: string | null;
  province: string | null;
  price: string;
  propertyType: string | null;
}

interface RemovePropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: PropertyData | null;
  contactName: string;
  isRemoving: boolean;
  onConfirm: () => void;
}

export function RemovePropertyDialog({
  open,
  onOpenChange,
  property,
  contactName,
  isRemoving,
  onConfirm,
}: RemovePropertyDialogProps) {
  const getPropertyTypeLabel = (type: string | null) => {
    switch (type) {
      case "piso":
        return "Piso";
      case "casa":
        return "Casa";
      case "local":
        return "Local";
      case "solar":
        return "Solar";
      case "garaje":
        return "Garaje";
      default:
        return type ?? "Propiedad";
    }
  };

  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quitar Propiedad</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas quitar esta propiedad del contacto{" "}
            <span className="font-medium">{contactName}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Property Details */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {getPropertyTypeLabel(property.propertyType)}
                  </Badge>
                  <span className="font-semibold text-lg">
                    {formatPrice(property.price)}€
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {property.street}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {property.city}, {property.province}
                </p>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-sm text-amber-800">
              <strong>Nota:</strong> La propiedad permanecerá en el sistema, pero ya no estará 
              asociada a este contacto.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRemoving}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Quitando...
              </>
            ) : (
              "Quitar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}