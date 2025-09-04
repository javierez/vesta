

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Loader } from "lucide-react";

interface PropertyData {
  listingId: bigint;
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