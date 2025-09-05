"use client";

import { useState } from "react";
import { ImageStudioGallery } from "./image-studio-gallery";
import { ImageStudioTools } from "./image-studio-tools";
import type { PropertyImage } from "~/lib/data";

interface ImageStudioClientWrapperProps {
  images: PropertyImage[];
  title: string;
}

export function ImageStudioClientWrapper({ images, title }: ImageStudioClientWrapperProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="space-y-16">
      {/* Image Selection (thumbnails only) */}
      <section className="animate-in slide-in-from-bottom-8 duration-700 delay-300">
        <ImageStudioGallery
          images={images}
          title={title}
          showOnlyThumbnails={true}
          selectedIndex={selectedIndex}
          onImageSelect={setSelectedIndex}
        />
      </section>
      
      {/* Tools Section */}
      <ImageStudioTools />
      
      {/* Results Section (big image) */}
      <section className="animate-in slide-in-from-bottom-8 duration-700 delay-500">
        <ImageStudioGallery
          images={images}
          title={title}
          showOnlyMainImage={true}
          selectedIndex={selectedIndex}
          onImageSelect={setSelectedIndex}
        />
      </section>
    </div>
  );
}