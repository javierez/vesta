"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import type { PropertyImage } from "~/lib/data"

interface ImageGalleryProps {
  images: PropertyImage[]
  title: string
}

export function ImageGallery({ images: initialImages, title }: ImageGalleryProps) {
  // Local state for images (simulate add/remove)
  const [images, setImages] = useState<PropertyImage[]>(initialImages)

  // Handler to add a new image (dummy placeholder for now)
  const handleAddImage = () => {
    const newImage: PropertyImage = {
      propertyImageId: BigInt(Date.now()),
      propertyId: BigInt(0),
      referenceNumber: "",
      imageUrl: "/properties/suburban-dream.png", // Placeholder
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      imageKey: "",
      s3key: "",
      imageOrder: images.length
    }
    setImages([...images, newImage])
  }

  // Handler to remove an image by index
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Images */}
        {images.map((image, idx) => (
          <div key={image.propertyImageId.toString()} className="relative group rounded-lg overflow-hidden border bg-muted">
            <Image
              src={image.imageUrl}
              alt={title || `Property image ${idx + 1}`}
              width={300}
              height={200}
              className="object-cover w-full h-40"
            />
            {/* Delete button */}
            <button
              type="button"
              className="absolute top-2 right-2 bg-white/80 hover:bg-red-500 hover:text-white text-red-500 rounded-full p-1 transition-opacity opacity-80 group-hover:opacity-100"
              onClick={() => handleRemoveImage(idx)}
              aria-label="Eliminar imagen"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
        {/* Add Image button */}
        <button
          type="button"
          onClick={handleAddImage}
          className="flex flex-col items-center justify-center border-2 border-dashed border-primary/40 rounded-lg h-40 w-full min-w-[120px] bg-muted hover:bg-primary/10 transition-colors"
          aria-label="Añadir imagen"
        >
          <Plus className="h-8 w-8 text-primary mb-1" />
          <span className="text-primary font-medium">Añadir imagen</span>
        </button>
      </div>
    </div>
  )
}