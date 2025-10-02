"use client";

import { useState } from "react";
import { MediaTypeSelector, type MediaType } from "./media-type-selector";

export type { MediaType };
import { ImageGallery } from "../image-gallery";
import { VideoGallery } from "./video-gallery";
import { VirtualTourManager } from "./virtual-tour-manager";
import type { PropertyImage } from "~/lib/data";

interface MediaManagerProps {
  images: PropertyImage[];
  videos: PropertyImage[];
  youtubeLinks: PropertyImage[];
  virtualTours: PropertyImage[];
  title: string;
  propertyId: bigint;
  referenceNumber: string;
  onImageUploaded?: (image: PropertyImage) => void;
  onVideoUploaded?: (video: PropertyImage) => void;
  onYouTubeLinkAdded?: (link: PropertyImage) => void;
  onVirtualTourAdded?: (tour: PropertyImage) => void;
  onMediaTypeChange?: (type: MediaType) => void;
}

export function MediaManager({
  images,
  videos,
  youtubeLinks,
  virtualTours,
  title,
  propertyId,
  referenceNumber,
  onImageUploaded,
  onVideoUploaded,
  onYouTubeLinkAdded,
  onVirtualTourAdded,
  onMediaTypeChange,
}: MediaManagerProps) {
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType>("images");

  const handleMediaTypeChange = (type: MediaType) => {
    setSelectedMediaType(type);
    onMediaTypeChange?.(type);
  };

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
            videos={videos}
            youtubeLinks={youtubeLinks}
            title={title}
            propertyId={propertyId}
            referenceNumber={referenceNumber}
            onVideoUploaded={onVideoUploaded}
            onYouTubeLinkAdded={onYouTubeLinkAdded}
          />
        );
      case "virtual-tour":
        return (
          <VirtualTourManager
            virtualTours={virtualTours}
            propertyId={propertyId}
            referenceNumber={referenceNumber}
            onVirtualTourAdded={onVirtualTourAdded}
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
        onTypeChange={handleMediaTypeChange}
      />
      {renderMediaContent()}
    </div>
  );
}