"use client";

import { useState } from "react";
import { MediaTypeSelector, type MediaType } from "./media-type-selector";
import { ImageGallery } from "../image-gallery";
import { VideoGallery } from "./video-gallery";
import { VirtualTourManager } from "./virtual-tour-manager";
import type { PropertyImage } from "~/lib/data";

interface MediaManagerProps {
  images: PropertyImage[];
  title: string;
  propertyId: bigint;
  referenceNumber: string;
  onImageUploaded?: (image: PropertyImage) => void;
}

export function MediaManager({
  images,
  title,
  propertyId,
  referenceNumber,
  onImageUploaded,
}: MediaManagerProps) {
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType>("images");

  const renderMediaContent = () => {
    switch (selectedMediaType) {
      case "images":
        return (
          <ImageGallery
            images={images}
            title={title}
            propertyId={propertyId}
            referenceNumber={referenceNumber}
            onImageUploaded={onImageUploaded}
          />
        );
      case "videos":
        return (
          <VideoGallery
            propertyId={propertyId}
            referenceNumber={referenceNumber}
          />
        );
      case "virtual-tour":
        return (
          <VirtualTourManager
            propertyId={propertyId}
            referenceNumber={referenceNumber}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <MediaTypeSelector
        selectedType={selectedMediaType}
        onTypeChange={setSelectedMediaType}
      />
      {renderMediaContent()}
    </div>
  );
}