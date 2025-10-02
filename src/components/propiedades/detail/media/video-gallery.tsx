"use client";

import { Plus, Video } from "lucide-react";
import { cn } from "~/lib/utils";

interface VideoGalleryProps {
  propertyId: bigint;
  referenceNumber: string;
}

export function VideoGallery({
  propertyId,
  referenceNumber,
}: VideoGalleryProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {/* Placeholder for when videos are implemented */}
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
          <div className="text-center">
            <Video className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No hay vídeos</p>
          </div>
        </div>
        
        {/* Add video button */}
        <label
          className={cn(
            "group relative flex h-40 w-full min-w-[120px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-200 bg-white transition-all duration-200 hover:bg-gray-50"
          )}
        >
          <input
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            disabled // Disabled until video upload is implemented
          />
          <Plus className="mb-1 h-5 w-5 text-gray-400 transition-colors duration-200 group-hover:text-gray-500" />
          <span className="text-sm font-medium text-gray-400 transition-colors duration-200 group-hover:text-gray-500">
            Añadir vídeos
          </span>
          <span className="mt-1 text-xs text-gray-400">
            (Próximamente)
          </span>
        </label>
      </div>
    </div>
  );
}