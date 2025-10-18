"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface ImageViewerProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function ImageViewer({
  images,
  initialIndex,
  isOpen,
  onClose,
  title,
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (currentIndex < images.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-[90vw] border-none bg-transparent p-0 shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Vista ampliada de la imagen</DialogTitle>
          <DialogDescription>
            Imagen ampliada de la propiedad. Presione ESC o el botón de cerrar
            para salir.
          </DialogDescription>
        </DialogHeader>
        {images[currentIndex] && (
          <div className="relative">
            <Image
              src={images[currentIndex]}
              alt={title ?? `Property image ${currentIndex + 1}`}
              width={1200}
              height={800}
              className="h-auto max-h-[90vh] w-full rounded-lg object-contain"
            />

            {/* Close button */}
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-white p-2.5 text-gray-800 shadow-lg transition-all hover:scale-110 hover:bg-gray-100"
              onClick={onClose}
              aria-label="Cerrar vista ampliada"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Previous button */}
            {currentIndex > 0 && (
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-gray-800 shadow-lg transition-all hover:scale-110 hover:bg-white"
                onClick={handlePrevious}
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Next button */}
            {currentIndex < images.length - 1 && (
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-gray-800 shadow-lg transition-all hover:scale-110 hover:bg-white"
                onClick={handleNext}
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
