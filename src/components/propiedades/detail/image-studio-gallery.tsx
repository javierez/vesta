"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { PropertyImage } from "~/lib/data";

interface ImageStudioGalleryProps {
  images: PropertyImage[];
  title: string;
  showOnlyThumbnails?: boolean;
  showOnlyMainImage?: boolean;
  selectedIndex?: number;
  onImageSelect?: (index: number) => void;
}

export function ImageStudioGallery({
  images,
  title,
  showOnlyThumbnails = false,
  showOnlyMainImage = false,
  selectedIndex: externalSelectedIndex,
  onImageSelect,
}: ImageStudioGalleryProps) {
  const [internalSelectedIndex, setInternalSelectedIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<PropertyImage | null>(
    images.length > 0 ? images[0]! : null
  );
  
  // Use external selectedIndex if provided, otherwise use internal
  const selectedIndex = externalSelectedIndex !== undefined ? externalSelectedIndex : internalSelectedIndex;
  const [imageOrientation, setImageOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  // Use the same placeholder image as property-card.tsx
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

  // Update selected image when index changes
  useEffect(() => {
    if (images[selectedIndex]) {
      setSelectedImage(images[selectedIndex]);
    }
  }, [selectedIndex, images]);

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

  const handlePrevious = () => {
    const newIndex = selectedIndex === 0 ? images.length - 1 : selectedIndex - 1;
    if (onImageSelect) {
      onImageSelect(newIndex);
    } else {
      setInternalSelectedIndex(newIndex);
    }
  };

  const handleNext = () => {
    const newIndex = selectedIndex === images.length - 1 ? 0 : selectedIndex + 1;
    if (onImageSelect) {
      onImageSelect(newIndex);
    } else {
      setInternalSelectedIndex(newIndex);
    }
  };

  const handleThumbnailClick = (index: number) => {
    if (onImageSelect) {
      onImageSelect(index);
    } else {
      setInternalSelectedIndex(index);
    }
  };

  const handleOrientationChange = (orientation: 'horizontal' | 'vertical') => {
    setImageOrientation(orientation);
  };

  if (images.length === 0) {
    return (
      <div className="space-y-8">
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

  // Show only thumbnails
  if (showOnlyThumbnails) {
    return (
      <div className="space-y-8">
        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="relative py-4">
            <div className="flex space-x-4 overflow-x-auto pb-4 pt-2 pl-4 scrollbar-hide">
              {images.map((image, index) => {
                const imageId = image.propertyImageId.toString();
                return (
                  <button
                    key={imageId}
                    className={cn(
                      "relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200",
                      index === selectedIndex
                        ? "border-amber-400 scale-105 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 hover:scale-102"
                    )}
                    onClick={() => handleThumbnailClick(index)}
                    aria-label={`Ver imagen ${index + 1}`}
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
                    {index === selectedIndex && (
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-rose-400/20" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show only main image (for results)
  if (showOnlyMainImage) {
    return (
      <div className="space-y-8">
        {/* Main Image Display */}
        <div className={cn(
          "group relative w-full overflow-hidden rounded-2xl bg-gray-100 shadow-lg transition-all duration-500 ease-in-out",
          imageOrientation === 'horizontal' ? "aspect-[16/9]" : "aspect-[3/4] max-h-[80vh]"
        )}>
          {images.map((image, index) => {
            const imageId = image.propertyImageId.toString();
            return (
              <div
                key={imageId}
                className={cn(
                  "absolute inset-0 transition-all duration-500 ease-in-out",
                  index === selectedIndex
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-105 pointer-events-none"
                )}
              >
                <Image
                  src={imageSources[imageId] ?? defaultPlaceholder}
                  alt={title ?? `Property image ${index + 1}`}
                  fill
                  className={cn(
                    "transition-all duration-500",
                    imageOrientation === 'horizontal' ? "object-cover" : "object-contain",
                    imageSources[imageId] === defaultPlaceholder && "grayscale",
                    !image.isActive && "opacity-70"
                  )}
                  priority={index === 0}
                  onError={() => handleImageError(imageId)}
                  onLoad={() => handleImageLoad(imageId)}
                />
                {!imageLoaded[imageId] && (
                  <div className="absolute inset-0 animate-pulse bg-gray-200" />
                )}
              </div>
            );
          })}

          {/* Orientation Control Panel */}
          <div className="absolute right-4 top-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <div className="flex rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg p-1">
              <button
                className={cn(
                  "flex items-center justify-center w-10 h-8 rounded-lg transition-all duration-200",
                  imageOrientation === 'horizontal' 
                    ? "bg-gradient-to-r from-amber-400 to-rose-400 text-white shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
                onClick={() => handleOrientationChange('horizontal')}
                title="Vista horizontal"
                aria-label="Vista horizontal"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth={2} />
                </svg>
              </button>
              <button
                className={cn(
                  "flex items-center justify-center w-10 h-8 rounded-lg transition-all duration-200",
                  imageOrientation === 'vertical' 
                    ? "bg-gradient-to-r from-amber-400 to-rose-400 text-white shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
                onClick={() => handleOrientationChange('vertical')}
                title="Vista vertical"
                aria-label="Vista vertical"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="3" width="12" height="18" rx="2" strokeWidth={2} />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: show both (for backwards compatibility)
  return (
    <div className="space-y-8">
      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="relative py-4">
          <div className="flex space-x-4 overflow-x-auto pb-4 pt-2 pl-4 scrollbar-hide">
            {images.map((image, index) => {
              const imageId = image.propertyImageId.toString();
              return (
                <button
                  key={imageId}
                  className={cn(
                    "relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200",
                    index === selectedIndex
                      ? "border-amber-400 scale-105 shadow-lg"
                      : "border-gray-200 hover:border-gray-300 hover:scale-102"
                  )}
                  onClick={() => handleThumbnailClick(index)}
                  aria-label={`Ver imagen ${index + 1}`}
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
                  {index === selectedIndex && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-rose-400/20" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Image Display */}
      <div className={cn(
        "group relative w-full overflow-hidden rounded-2xl bg-gray-100 shadow-lg transition-all duration-500 ease-in-out",
        imageOrientation === 'horizontal' ? "aspect-[16/9]" : "aspect-[3/4] max-h-[80vh]"
      )}>
        {images.map((image, index) => {
          const imageId = image.propertyImageId.toString();
          const isSelected = index === selectedIndex;
          return (
            <div
              key={imageId}
              className={cn(
                "absolute inset-0 transition-all duration-500 ease-in-out",
                isSelected
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-0 scale-105 pointer-events-none z-0"
              )}
            >
              <Image
                src={imageSources[imageId] ?? defaultPlaceholder}
                alt={title ?? `Property image ${index + 1}`}
                fill
                className={cn(
                  "transition-all duration-500",
                  imageOrientation === 'horizontal' ? "object-cover" : "object-contain",
                  imageSources[imageId] === defaultPlaceholder && "grayscale",
                  !image.isActive && "opacity-70"
                )}
                priority={index === 0}
                onError={() => handleImageError(imageId)}
                onLoad={() => handleImageLoad(imageId)}
              />
              {!imageLoaded[imageId] && (
                <div className="absolute inset-0 animate-pulse bg-gray-200" />
              )}
            </div>
          );
        })}

        {/* Orientation Control Panel */}
        <div className="absolute right-4 top-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <div className="flex rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg p-1">
            <button
              className={cn(
                "flex items-center justify-center w-10 h-8 rounded-lg transition-all duration-200",
                imageOrientation === 'horizontal' 
                  ? "bg-gradient-to-r from-amber-400 to-rose-400 text-white shadow-sm" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
              onClick={() => handleOrientationChange('horizontal')}
              title="Vista horizontal"
              aria-label="Vista horizontal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth={2} />
              </svg>
            </button>
            <button
              className={cn(
                "flex items-center justify-center w-10 h-8 rounded-lg transition-all duration-200",
                imageOrientation === 'vertical' 
                  ? "bg-gradient-to-r from-amber-400 to-rose-400 text-white shadow-sm" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
              onClick={() => handleOrientationChange('vertical')}
              title="Vista vertical"
              aria-label="Vista vertical"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="3" width="12" height="18" rx="2" strokeWidth={2} />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border-0 bg-white/90 backdrop-blur-sm shadow-lg transition-all hover:bg-white hover:scale-110"
              onClick={handlePrevious}
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border-0 bg-white/90 backdrop-blur-sm shadow-lg transition-all hover:bg-white hover:scale-110"
              onClick={handleNext}
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

      </div>

    </div>
  );
}