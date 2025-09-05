"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Save, X, Move, ArrowLeft, ArrowRight } from "lucide-react";

interface ImageComparisonSliderProps {
  originalImage: string;
  enhancedImage: string;
  isVisible: boolean;
  onSave: () => void;
  onDiscard: () => void;
  title?: string;
}

/**
 * Image comparison slider component with draggable divider
 * Shows original image on left, enhanced on right
 * User can drag to reveal more/less of each image
 */
export function ImageComparisonSlider({
  originalImage,
  enhancedImage,
  isVisible,
  onSave,
  onDiscard,
  title = "Comparar imágenes",
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState({ original: false, enhanced: false });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

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

  // Event listeners
  useEffect(() => {
    if (isDragging) {
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
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSliderPosition(prev => Math.max(0, prev - 5));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSliderPosition(prev => Math.min(100, prev + 5));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onDiscard();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onDiscard]);

  // Reset slider position when images change
  useEffect(() => {
    if (isVisible) {
      setSliderPosition(50);
      setIsImageLoaded({ original: false, enhanced: false });
      
      // Debug log the image URLs
      console.log('🖼️ [ImageComparisonSlider] Images changed', {
        originalImage,
        enhancedImage,
        originalImageValid: !!originalImage && originalImage !== "",
        enhancedImageValid: !!enhancedImage && enhancedImage !== "",
        isVisible
      });

      // Set a shorter fallback timer to hide loading state after 1 second
      // This handles cases where images load but onLoad doesn't fire (cached images)
      const fallbackTimer = setTimeout(() => {
        console.log('⏰ [ImageComparisonSlider] Fallback timer - marking images as loaded');
        setIsImageLoaded({ original: true, enhanced: true });
      }, 1000);

      // Also set an immediate check after a short delay for cached images
      const immediateCheck = setTimeout(() => {
        console.log('⚡ [ImageComparisonSlider] Immediate check - marking images as loaded for cached images');
        setIsImageLoaded({ original: true, enhanced: true });
      }, 100);

      return () => {
        clearTimeout(fallbackTimer);
        clearTimeout(immediateCheck);
      };
    }
  }, [originalImage, enhancedImage, isVisible]);

  if (!isVisible) return null;

  // Check if both image URLs are valid
  const hasValidImages = originalImage && originalImage !== "" && enhancedImage && enhancedImage !== "";
  const bothImagesLoaded = isImageLoaded.original && isImageLoaded.enhanced;
  
  if (!hasValidImages) {
    console.warn('⚠️ [ImageComparisonSlider] Invalid image URLs provided', {
      originalImage,
      enhancedImage,
      hasOriginal: !!originalImage && originalImage !== "",
      hasEnhanced: !!enhancedImage && enhancedImage !== ""
    });
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg border border-white/20">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">Arrastra la línea para comparar</p>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onDiscard}
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg border border-white/20 flex items-center justify-center transition-all hover:scale-105"
        aria-label="Cerrar comparación"
      >
        <X className="w-5 h-5 text-gray-700" />
      </button>

      {/* Main comparison container */}
      <div 
        ref={containerRef}
        className="relative h-full w-full overflow-hidden cursor-col-resize"
        onClick={(e) => {
          if (!isDragging) {
            updateSliderPosition(e.clientX);
          }
        }}
      >
        {/* Original Image (Full) */}
        <div className="absolute inset-0">
          <Image
            src={originalImage}
            alt="Imagen original"
            fill
            className="object-contain"
            priority
            onLoad={() => {
              console.log('🖼️ [ImageComparisonSlider] Original image loaded');
              setIsImageLoaded(prev => ({ ...prev, original: true }));
            }}
            onError={() => {
              console.error('❌ [ImageComparisonSlider] Original image failed to load');
              // Still mark as loaded to prevent infinite loading
              setIsImageLoaded(prev => ({ ...prev, original: true }));
            }}
          />
          {/* Original image label */}
          <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-sm">
            Original
          </div>
        </div>
        
        {/* Enhanced Image (Clipped) */}
        <div 
          className="absolute inset-0 overflow-hidden transition-all duration-75 ease-out"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <Image
            src={enhancedImage}
            alt="Imagen mejorada"
            fill
            className="object-contain"
            priority
            onLoad={() => {
              console.log('🖼️ [ImageComparisonSlider] Enhanced image loaded');
              setIsImageLoaded(prev => ({ ...prev, enhanced: true }));
            }}
            onError={() => {
              console.error('❌ [ImageComparisonSlider] Enhanced image failed to load');
              // Still mark as loaded to prevent infinite loading
              setIsImageLoaded(prev => ({ ...prev, enhanced: true }));
            }}
          />
          {/* Enhanced image label */}
          <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg">
            Mejorada con IA
          </div>
        </div>
        
        {/* Slider Handle */}
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
        
        {/* Loading overlay */}
        {!bothImagesLoaded && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">Cargando comparación...</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-10">
        <Button
          onClick={onSave}
          className="bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 text-white border-0 shadow-lg hover:shadow-xl transition-all px-6 py-3"
          disabled={!bothImagesLoaded}
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar versión mejorada
        </Button>
        <Button
          onClick={onDiscard}
          variant="outline"
          className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20 shadow-lg hover:shadow-xl transition-all px-6 py-3"
        >
          <X className="w-4 h-4 mr-2" />
          Descartar
        </Button>
      </div>

      {/* Keyboard hints */}
      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-2 rounded-lg text-xs backdrop-blur-sm">
        <div>← → Mover slider</div>
        <div>Esc Cerrar</div>
      </div>
    </div>
  );
}