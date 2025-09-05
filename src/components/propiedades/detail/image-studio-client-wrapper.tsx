"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { ImageStudioGallery } from "./image-studio-gallery";
import { ImageStudioTools } from "./image-studio-tools";
import { ImageComparisonSlider } from "~/components/ui/image-comparison-slider";
import { useImageEnhancement } from "~/hooks/use-image-enhancement";
import type { PropertyImage } from "~/lib/data";
import { toast } from "sonner";

interface ImageStudioClientWrapperProps {
  images: PropertyImage[];
  title: string;
}

export function ImageStudioClientWrapper({ images, title }: ImageStudioClientWrapperProps) {
  const params = useParams();
  const propertyId = params.id as string;
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [allImages, setAllImages] = useState<PropertyImage[]>(images);
  const [isComparisonVisible, setIsComparisonVisible] = useState(false);

  // Get the currently selected image
  const selectedImage = allImages[selectedIndex];

  // Image enhancement hook
  const {
    status: enhancementStatus,
    progress: enhancementProgress,
    error: enhancementError,
    originalImageUrl,
    enhancedImageUrl,
    enhancedPropertyImage,
    enhance,
    reset: resetEnhancement,
  } = useImageEnhancement({
    propertyId,
    onSuccess: (_newImage) => {
      console.log('✅ [ImageStudioClientWrapper] Enhancement success callback');
      // Show comparison slider when enhancement completes
      setIsComparisonVisible(true);
    },
    onError: (error) => {
      console.error("❌ [ImageStudioClientWrapper] Enhancement failed:", error);
      toast.error("Error al mejorar la imagen");
    },
  });
  
  // Debug log for status changes
  console.log('📊 [ImageStudioClientWrapper] Current enhancement state', {
    status: enhancementStatus,
    progress: enhancementProgress,
    hasError: !!enhancementError,
    hasOriginalImageUrl: !!originalImageUrl,
    hasEnhancedImageUrl: !!enhancedImageUrl,
    hasEnhancedPropertyImage: !!enhancedPropertyImage,
    isComparisonVisible,
    originalImageUrlValue: originalImageUrl,
    enhancedImageUrlValue: enhancedImageUrl
  });

  // Handle enhancement request from tools
  const handleEnhanceImage = useCallback(async () => {
    console.log('🎯 [ImageStudioClientWrapper] handleEnhanceImage called', {
      selectedImage: selectedImage ? `ID: ${selectedImage.propertyImageId}` : 'none',
      enhancementStatus,
      propertyId
    });
    
    if (!selectedImage) {
      console.error('❌ [ImageStudioClientWrapper] No image selected');
      toast.error("No hay imagen seleccionada");
      return;
    }

    if (enhancementStatus === 'processing') {
      console.warn('⚠️ [ImageStudioClientWrapper] Enhancement already in progress');
      toast.warning("Ya hay una mejora en progreso");
      return;
    }

    try {
      console.log(`🚀 [ImageStudioClientWrapper] Starting enhancement for image ${selectedImage.propertyImageId}`, {
        imageUrl: selectedImage.imageUrl,
        referenceNumber: selectedImage.referenceNumber,
        imageOrder: selectedImage.imageOrder,
        propertyId
      });
      
      // Start the enhancement process
      console.log('📞 [ImageStudioClientWrapper] Calling enhance() hook');
      await enhance(
        selectedImage.imageUrl,
        selectedImage.referenceNumber,
        selectedImage.imageOrder
      );
      console.log('✅ [ImageStudioClientWrapper] enhance() hook completed');
    } catch (error) {
      console.error("❌ [ImageStudioClientWrapper] Failed to start enhancement:", error);
      toast.error("Error al iniciar la mejora de imagen");
    }
  }, [selectedImage, enhancementStatus, enhance, propertyId]);

  // Handle saving the enhanced image
  const handleSaveEnhanced = useCallback(() => {
    console.log('💾 [ImageStudioClientWrapper] handleSaveEnhanced called', {
      hasEnhancedPropertyImage: !!enhancedPropertyImage,
      enhancedPropertyImage: enhancedPropertyImage ? {
        id: enhancedPropertyImage.propertyImageId,
        imageUrl: enhancedPropertyImage.imageUrl,
        imageOrder: enhancedPropertyImage.imageOrder
      } : null
    });
    
    if (!enhancedPropertyImage) {
      console.error('❌ [ImageStudioClientWrapper] No enhanced property image available');
      toast.error("No hay imagen mejorada para guardar");
      return;
    }

    // Add the new image to the gallery (optimistic update)
    console.log('📸 [ImageStudioClientWrapper] Adding enhanced image to gallery');
    setAllImages(currentImages => {
      const newImages = [...currentImages, enhancedPropertyImage];
      // Sort by image order to maintain proper ordering
      const sortedImages = newImages.sort((a, b) => a.imageOrder - b.imageOrder);
      console.log('📸 [ImageStudioClientWrapper] Gallery updated', {
        previousCount: currentImages.length,
        newCount: sortedImages.length,
        addedImage: {
          id: enhancedPropertyImage.propertyImageId,
          imageOrder: enhancedPropertyImage.imageOrder
        }
      });
      return sortedImages;
    });

    // Hide comparison slider
    console.log('👁️ [ImageStudioClientWrapper] Hiding comparison slider');
    setIsComparisonVisible(false);
    resetEnhancement();
    
    toast.success("Imagen mejorada guardada correctamente");
    console.log("✅ [ImageStudioClientWrapper] Enhanced image saved successfully:", enhancedPropertyImage.propertyImageId);
  }, [enhancedPropertyImage, resetEnhancement]);

  // Handle discarding the enhanced image
  const handleDiscardEnhanced = useCallback(() => {
    console.log('🗑️ [ImageStudioClientWrapper] handleDiscardEnhanced called');
    setIsComparisonVisible(false);
    // Don't reset enhancement data - just hide the comparison
    // This allows users to reopen the comparison later
    console.log("✅ [ImageStudioClientWrapper] Comparison hidden (enhancement data preserved)");
  }, []);

  // Handle showing the comparison again
  const handleShowComparison = useCallback(() => {
    console.log('👀 [ImageStudioClientWrapper] handleShowComparison called');
    if (originalImageUrl && enhancedImageUrl) {
      setIsComparisonVisible(true);
      console.log("✅ [ImageStudioClientWrapper] Comparison slider reopened");
    } else {
      console.warn('⚠️ [ImageStudioClientWrapper] Cannot show comparison - missing image URLs');
      toast.error("No hay comparación disponible");
    }
  }, [originalImageUrl, enhancedImageUrl]);

  return (
    <>
      <div className="space-y-16">
        {/* Image Selection (thumbnails only) */}
        <section className="animate-in slide-in-from-bottom-8 duration-700 delay-300">
          <ImageStudioGallery
            images={allImages}
            title={title}
            showOnlyThumbnails={true}
            selectedIndex={selectedIndex}
            onImageSelect={setSelectedIndex}
          />
        </section>
        
        {/* Tools Section */}
        <ImageStudioTools 
          onEnhanceImage={handleEnhanceImage}
          enhancementStatus={enhancementStatus}
          enhancementProgress={enhancementProgress}
          _enhancementError={enhancementError}
          selectedImage={selectedImage}
          isComparisonVisible={isComparisonVisible}
          onShowComparison={handleShowComparison}
        />
        
        {/* Results Section (big image) */}
        <section className="animate-in slide-in-from-bottom-8 duration-700 delay-500">
          <ImageStudioGallery
            images={allImages}
            title={title}
            showOnlyMainImage={true}
            selectedIndex={selectedIndex}
            onImageSelect={setSelectedIndex}
          />
        </section>
      </div>

      {/* Image Comparison Slider Overlay */}
      <ImageComparisonSlider
        originalImage={originalImageUrl ?? ""}
        enhancedImage={enhancedImageUrl ?? ""}
        isVisible={isComparisonVisible}
        onSave={handleSaveEnhanced}
        onDiscard={handleDiscardEnhanced}
        title="Comparar: Original vs Mejorada"
      />
    </>
  );
}