"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Save, X, Move, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { PropertyImage } from "~/lib/data";
import type { EnhancementStatus } from "~/types/freepik";

interface ImageStudioGalleryProps {
  images: PropertyImage[];
  title: string;
  showOnlyThumbnails?: boolean;
  showOnlyMainImage?: boolean;
  selectedIndex?: number;
  onImageSelect?: (index: number) => void;
  // Comparison mode props
  isComparisonMode?: boolean;
  enhancedImageUrl?: string;
  enhancementStatus?: EnhancementStatus;
  onSave?: () => void;
  onDiscard?: () => void;
}

export function ImageStudioGallery({
  images,
  title,
  showOnlyThumbnails = false,
  showOnlyMainImage = false,
  selectedIndex: externalSelectedIndex,
  onImageSelect,
  isComparisonMode = false,
  enhancedImageUrl,
  enhancementStatus,
  onSave,
  onDiscard,
}: ImageStudioGalleryProps) {
  const [internalSelectedIndex, setInternalSelectedIndex] = useState(0);
  const [, setSelectedImage] = useState<PropertyImage | null>(
    images.length > 0 ? images[0]! : null
  );
  
  // Use external selectedIndex if provided, otherwise use internal
  const selectedIndex = externalSelectedIndex ?? internalSelectedIndex;
  const [imageOrientation, setImageOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  
  // Comparison slider state
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Use a proper placeholder image or null for empty sources
  const defaultPlaceholder = "/placeholder-image.jpg"; // This should be a real image or use null

  // State for managing image sources with fallbacks
  const [imageSources, setImageSources] = useState<Record<string, string | null>>(() => {
    const sources: Record<string, string | null> = {};
    images.forEach((image) => {
      const key = image.propertyImageId.toString();
      // Only set the image if it has a valid URL, otherwise use null
      sources[key] = image.imageUrl && image.imageUrl.trim() !== "" ? image.imageUrl : null;
    });
    return sources;
  });

  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  // Comparison slider interaction logic
  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
    
    setSliderPosition(percentage);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    if (animationFrameRef.current !== undefined) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      updateSliderPosition(e.clientX);
    });
  }, [isDragging, updateSliderPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !e.touches[0]) return;
    
    e.preventDefault();
    
    if (animationFrameRef.current !== undefined) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      updateSliderPosition(e.touches[0]!.clientX);
    });
  }, [isDragging, updateSliderPosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Update selected image when index changes
  useEffect(() => {
    if (images[selectedIndex]) {
      setSelectedImage(images[selectedIndex]);
    }
  }, [selectedIndex, images]);

  // Slider event listeners
  useEffect(() => {
    if (isDragging && isComparisonMode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, isComparisonMode, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Reset slider position when entering comparison mode
  useEffect(() => {
    if (isComparisonMode) {
      setSliderPosition(50);
    }
  }, [isComparisonMode]);

  const handleImageError = (imageId: string) => {
    setImageSources((prev) => ({
      ...prev,
      [imageId]: null, // Set to null instead of empty string
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
                    {imageSources[imageId] ? (
                      <Image
                        src={imageSources[imageId]}
                        alt={`${title} - Miniatura ${index + 1}`}
                        width={128}
                        height={96}
                        className={cn(
                          "object-cover transition-all duration-200 w-full h-full",
                          !image.isActive && "opacity-70"
                        )}
                        sizes="128px"
                        quality={75}
                        loading="lazy"
                        onError={() => handleImageError(imageId)}
                        onLoad={() => handleImageLoad(imageId)}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _currentImage = images[selectedIndex];
    
    return (
      <div className="space-y-8">
        {/* Main Image Display */}
        <div 
          ref={containerRef}
          className={cn(
            "group relative w-full overflow-hidden rounded-2xl bg-gray-100 shadow-lg transition-all duration-500 ease-in-out",
            imageOrientation === 'horizontal' ? "aspect-[16/9]" : "aspect-[3/4] max-h-[80vh]",
            isComparisonMode && "cursor-col-resize"
          )}
          onClick={(e) => {
            if (isComparisonMode && !isDragging) {
              updateSliderPosition(e.clientX);
            }
          }}
        >
          {/* Original Image (always visible) */}
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
                {imageSources[imageId] ? (
                  <Image
                    src={imageSources[imageId]}
                    alt={title ?? `Property image ${index + 1}`}
                    fill
                    className={cn(
                      "transition-all duration-500",
                      imageOrientation === 'horizontal' ? "object-cover" : "object-contain",
                      !image.isActive && "opacity-70"
                    )}
                    priority={index === 0}
                    onError={() => handleImageError(imageId)}
                    onLoad={() => handleImageLoad(imageId)}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {!imageLoaded[imageId] && (
                  <div className="absolute inset-0 animate-pulse bg-gray-200" />
                )}
                
                {/* Original image label in comparison mode */}
                {isComparisonMode && index === selectedIndex && (
                  <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-sm">
                    Original
                  </div>
                )}
              </div>
            );
          })}

          {/* Enhanced Image Overlay (only in comparison mode) */}
          {isComparisonMode && enhancedImageUrl && (
            <div 
              className="absolute inset-0 overflow-hidden transition-all duration-75 ease-out"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <Image
                src={enhancedImageUrl}
                alt="Imagen mejorada"
                fill
                className={cn(
                  imageOrientation === 'horizontal' ? "object-cover" : "object-contain"
                )}
                priority
              />
              {/* Enhanced image label */}
              <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg">
                Mejorada con IA
              </div>
            </div>
          )}
          
          {/* Comparison Slider Handle (only in comparison mode) */}
          {isComparisonMode && (
            <>
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg transition-all duration-75 ease-out"
                style={{ left: `${sliderPosition}%` }}
              >
                {/* Draggable handle */}
                <div
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full shadow-xl border-2 border-gray-200 flex items-center justify-center cursor-grab transition-all duration-200",
                    isDragging ? "scale-110 cursor-grabbing shadow-2xl border-amber-400" : "hover:scale-105 hover:shadow-xl"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  aria-label="Arrastrar para comparar"
                  role="slider"
                  aria-valuenow={sliderPosition}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <Move className="w-5 h-5 text-gray-600" />
                </div>
                
                {/* Arrows for keyboard users */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-60">
                  <ArrowLeft className="w-4 h-4 text-white" />
                  <span className="text-white text-xs">Arrastra</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </>
          )}

          {/* Orientation Control Panel (hidden in comparison mode) */}
          {!isComparisonMode && (
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
          )}
        </div>
        
        {/* Save/Discard Buttons (only in comparison mode) */}
        {isComparisonMode && (
          <div className="flex justify-center gap-4">
            <Button
              onClick={onSave}
              disabled={enhancementStatus === 'processing'}
              className="bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 text-white border-0 shadow-lg hover:shadow-xl transition-all px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enhancementStatus === 'processing' ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar versión mejorada
                </>
              )}
            </Button>
            <Button
              onClick={onDiscard}
              disabled={enhancementStatus === 'processing'}
              variant="outline"
              className="border-gray-200 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4 mr-2" />
              Descartar
            </Button>
          </div>
        )}
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
                  {imageSources[imageId] ? (
                    <Image
                      src={imageSources[imageId]}
                      alt={`${title} - Miniatura ${index + 1}`}
                      width={128}
                      height={96}
                      className={cn(
                        "object-cover transition-all duration-200 w-full h-full",
                        !image.isActive && "opacity-70"
                      )}
                      sizes="128px"
                      quality={75}
                      loading="lazy"
                      onError={() => handleImageError(imageId)}
                      onLoad={() => handleImageLoad(imageId)}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
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
              {imageSources[imageId] ? (
                <Image
                  src={imageSources[imageId]}
                  alt={title ?? `Property image ${index + 1}`}
                  fill
                  className={cn(
                    "transition-all duration-500",
                    imageOrientation === 'horizontal' ? "object-cover" : "object-contain",
                    !image.isActive && "opacity-70"
                  )}
                  priority={index === 0}
                  onError={() => handleImageError(imageId)}
                  onLoad={() => handleImageLoad(imageId)}
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
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