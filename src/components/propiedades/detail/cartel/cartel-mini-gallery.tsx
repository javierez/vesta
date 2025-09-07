"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { PropertyImage } from "~/lib/data";

interface CartelMiniGalleryProps {
  images: PropertyImage[];
  title: string;
  maxSelection: 3 | 4;
  selectedIndices: number[];
  onSelectionChange: (selectedIndices: number[]) => void;
}

export function CartelMiniGallery({
  images,
  title,
  maxSelection,
  selectedIndices,
  onSelectionChange,
}: CartelMiniGalleryProps) {
  // Use the same placeholder image as image-studio-gallery
  const defaultPlaceholder = "/properties/suburban-dream.png";

  // State for managing image sources with fallbacks
  const [imageSources, setImageSources] = useState<Record<string, string>>(() => {
    const sources: Record<string, string> = {};
    images.forEach((image) => {
      const key = image.propertyImageId.toString();
      sources[key] = image.imageUrl ?? defaultPlaceholder;
    });
    return sources;
  });

  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  const handleImageError = (imageId: string) => {
    setImageSources((prev) => ({
      ...prev,
      [imageId]: defaultPlaceholder,
    }));
  };

  const handleImageLoad = (imageId: string) => {
    setImageLoaded((prev) => ({
      ...prev,
      [imageId]: true,
    }));
  };

  const handleThumbnailClick = (index: number) => {
    const isSelected = selectedIndices.includes(index);
    
    if (isSelected) {
      // Remove from selection
      const newSelection = selectedIndices.filter(i => i !== index);
      onSelectionChange(newSelection);
    } else {
      // Add to selection if under limit
      if (selectedIndices.length < maxSelection) {
        const newSelection = [...selectedIndices, index];
        onSelectionChange(newSelection);
      }
    }
  };

  const handleSelectAll = () => {
    if (images.length <= maxSelection) {
      const allIndices = images.map((_, index) => index);
      onSelectionChange(allIndices);
    }
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  if (images.length === 0) {
    return (
      <div className="space-y-3">
        <div className="aspect-[16/9] w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
          <div className="mx-auto max-w-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No hay imágenes disponibles</h3>
            <p className="mt-2 text-sm text-gray-500">Esta propiedad no tiene imágenes para mostrar en el estudio.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Thumbnail Navigation - based on image-studio-gallery */}
      {images.length > 0 && (
        <div className="relative py-2">
          <div className="flex space-x-4 overflow-x-auto pb-2 pt-1 pl-1 scrollbar-hide">
            {images.map((image, index) => {
              const imageId = image.propertyImageId.toString();
              const isSelected = selectedIndices.includes(index);
              const isSelectable = selectedIndices.length < maxSelection || isSelected;
              
              return (
                <button
                  key={imageId}
                  className={cn(
                    "relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200",
                    isSelected
                      ? "border-amber-400 scale-105 shadow-lg"
                      : isSelectable
                      ? "border-gray-200 hover:border-gray-300 hover:scale-102"
                      : "border-gray-200 opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => isSelectable ? handleThumbnailClick(index) : undefined}
                  disabled={!isSelectable && !isSelected}
                  aria-label={`${isSelected ? 'Deseleccionar' : 'Seleccionar'} imagen ${index + 1}`}
                >
                  <Image
                    src={imageSources[imageId] ?? defaultPlaceholder}
                    alt={`${title} - Miniatura ${index + 1}`}
                    fill
                    className={cn(
                      "object-cover transition-all duration-200",
                      imageSources[imageId] === defaultPlaceholder && "grayscale",
                      !image.isActive && "opacity-70"
                    )}
                    loading="lazy"
                    onError={() => handleImageError(imageId)}
                    onLoad={() => handleImageLoad(imageId)}
                  />
                  {!imageLoaded[imageId] && (
                    <div className="absolute inset-0 animate-pulse bg-gray-200" />
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-rose-400/20" />
                  )}
                  
                  {/* Selection order for selected images */}
                  {isSelected && (
                    <div className="absolute bottom-2 left-2 bg-amber-400 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                      {selectedIndices.indexOf(index) + 1}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selection info and controls - positioned after images */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-sm text-muted-foreground">
          {selectedIndices.length} de {maxSelection} imágenes seleccionadas
        </div>
        <div className="flex gap-2">
          {images.length <= maxSelection && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={selectedIndices.length === images.length}
            >
              Seleccionar todas
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={selectedIndices.length === 0}
          >
            Limpiar selección
          </Button>
        </div>
      </div>

      {/* Selection warnings */}
      {selectedIndices.length >= maxSelection && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
          Has alcanzado el límite de {maxSelection} imágenes. Deselecciona una imagen para cambiar la selección.
        </div>
      )}
      
      {selectedIndices.length > 0 && selectedIndices.length < 3 && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
          Selecciona al menos 3 imágenes para el cartel. Actualmente tienes {selectedIndices.length} seleccionada{selectedIndices.length === 1 ? '' : 's'}.
        </div>
      )}
    </div>
  );
}