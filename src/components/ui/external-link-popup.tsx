"use client";

import { ExternalLink, Share2 } from "lucide-react";
import { Button } from "./button";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "~/lib/utils";

interface ExternalLinkPopupProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

// Visually hidden component for accessibility
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">{children}</span>
);

export function ExternalLinkPopup({
  isOpen,
  onClose,
  url,
  title,
}: ExternalLinkPopupProps) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("URL copiada al portapapeles");
      }
    } catch (error) {
      // Only log errors that are not user cancellations
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error al compartir:", error);
      }
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80" />
        <DialogPrimitive.Content
          className={cn(
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 grid w-full max-w-[200px] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-4 shadow-lg duration-200 sm:rounded-lg",
          )}
        >
          <VisuallyHidden>
            <DialogPrimitive.Title>Opciones de enlace</DialogPrimitive.Title>
            <DialogPrimitive.Description>
              Elige entre visitar el enlace o compartirlo
            </DialogPrimitive.Description>
          </VisuallyHidden>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="icon"
              className="flex-1"
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              title="Visitar enlace"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="flex-1"
              onClick={handleShare}
              title="Compartir enlace"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
