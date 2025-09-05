"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { ImageStudioGallery } from "./image-studio-gallery";
import { ImageStudioTools } from "./image-studio-tools";
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
    originalImageUrl: _originalImageUrl,
    enhancedImageUrl,
    enhancedPropertyImage: _enhancedPropertyImage,
    enhancementMetadata,
    enhance,
    saveEnhanced,
    reset: resetEnhancement,
  } = useImageEnhancement({
    propertyId,
    onSuccess: (newImage) => {
      // Add the new image to the gallery (this happens after user confirms save)
      setAllImages(currentImages => {
        const newImages = [...currentImages, newImage];
        return newImages.sort((a, b) => a.imageOrder - b.imageOrder);
      });

      // Hide comparison slider and reset
      setIsComparisonVisible(false);
      resetEnhancement();
    },
    onComparisonReady: () => {
      // Show comparison slider when enhancement completes
      setIsComparisonVisible(true);
    },
    onError: (error) => {
      console.error("Enhancement failed:", error);
      toast.error("Error al mejorar la imagen");
    },
  });
  

  // Handle enhancement request from tools
  const handleEnhanceImage = useCallback(async () => {
    if (!selectedImage) {
      toast.error("No hay imagen seleccionada");
      return;
    }

    if (enhancementStatus === 'processing') {
      toast.warning("Ya hay una mejora en progreso");
      return;
    }

    try {
      await enhance(
        selectedImage.imageUrl,
        selectedImage.referenceNumber,
        selectedImage.imageOrder
      );
    } catch (error) {
      console.error("Failed to start enhancement:", error);
      toast.error("Error al iniciar la mejora de imagen");
    }
  }, [selectedImage, enhancementStatus, enhance]);

  // Handle saving the enhanced image
  const handleSaveEnhanced = useCallback(async () => {
    if (!enhancedImageUrl || !enhancementMetadata) {
      toast.error("No hay imagen mejorada para guardar");
      return;
    }

    try {
      await saveEnhanced();
    } catch (error) {
      console.error('Save enhanced image failed:', error);
    }
  }, [enhancedImageUrl, enhancementMetadata, saveEnhanced]);

  // Handle discarding the enhanced image
  const handleDiscardEnhanced = useCallback(() => {
    // Hide comparison and reset all enhancement state
    setIsComparisonVisible(false);
    resetEnhancement();
    
    // Since we're using defer storage pattern:
    // - The enhanced image was never saved to S3 or database
    // - Only the temporary Freepik URL existed
    // - Discarding simply clears the temporary state
    // - No cleanup needed, no waste generated!
    toast.success("Imagen mejorada descartada");
  }, [resetEnhancement]);


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
          _enhancementProgress={enhancementProgress}
          _enhancementError={enhancementError}
          selectedImage={selectedImage}
          isComparisonVisible={isComparisonVisible}
        />
        
        {/* Results Section (big image) */}
        <section className="animate-in slide-in-from-bottom-8 duration-700 delay-500">
          <ImageStudioGallery
            images={allImages}
            title={title}
            showOnlyMainImage={true}
            selectedIndex={selectedIndex}
            onImageSelect={setSelectedIndex}
            isComparisonMode={isComparisonVisible}
            enhancedImageUrl={enhancedImageUrl ?? ""}
            enhancementStatus={enhancementStatus}
            onSave={handleSaveEnhanced}
            onDiscard={handleDiscardEnhanced}
          />
        </section>
      </div>
    </>
  );
}