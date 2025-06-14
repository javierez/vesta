"use client"

import * as React from "react"
import { useState } from "react"
import Image from "next/image"
import { Plus, Trash2, Maximize2, X } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import type { PropertyImage } from "~/lib/data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"

// Visually hidden component for accessibility
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">{children}</span>
)

interface ImageGalleryProps {
  images: PropertyImage[]
  title: string
}

export function ImageGallery({ images: initialImages, title }: ImageGalleryProps) {
  const [images, setImages] = useState<PropertyImage[]>(initialImages)
  const [imageToDelete, setImageToDelete] = useState<number | null>(null)
  const [expandedImage, setExpandedImage] = useState<number | null>(null)

  const handleAddImage = () => {
    const newImage: PropertyImage = {
      propertyImageId: BigInt(Date.now()),
      propertyId: BigInt(0),
      referenceNumber: "",
      imageUrl: "/properties/suburban-dream.png",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      imageKey: "",
      s3key: "",
      imageOrder: images.length
    }
    setImages([...images, newImage])
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImageToDelete(null)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image, idx) => (
          <div key={image.propertyImageId.toString()} className="relative group rounded-lg overflow-hidden border bg-muted">
            <Image
              src={image.imageUrl}
              alt={title || `Property image ${idx + 1}`}
              width={300}
              height={200}
              className="object-cover w-full h-40"
            />
            <button
              type="button"
              className="absolute top-2 left-2 bg-white/80 hover:bg-primary hover:text-white text-primary rounded-full p-1 transition-opacity opacity-80 group-hover:opacity-100"
              onClick={() => setExpandedImage(idx)}
              aria-label="Expandir imagen"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="absolute top-2 right-2 bg-white/80 hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-full p-1 transition-opacity opacity-80 group-hover:opacity-100"
              onClick={() => setImageToDelete(idx)}
              aria-label="Eliminar imagen"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
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

      <Dialog open={imageToDelete !== null} onOpenChange={() => setImageToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar imagen?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La imagen se eliminará permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImageToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => imageToDelete !== null && handleRemoveImage(imageToDelete)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={expandedImage !== null} onOpenChange={() => setExpandedImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Vista ampliada de la imagen</DialogTitle>
            <DialogDescription>
              Imagen ampliada de la propiedad. Presione ESC o el botón de cerrar para salir.
            </DialogDescription>
          </DialogHeader>
          {expandedImage !== null && images[expandedImage] && (
            <div className="relative">
              <Image
                src={images[expandedImage].imageUrl}
                alt={title || `Property image ${expandedImage + 1}`}
                width={1200}
                height={800}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
              <button
                type="button"
                className="absolute top-4 right-4 bg-white hover:bg-gray-100 text-gray-800 rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
                onClick={() => setExpandedImage(null)}
                aria-label="Cerrar vista ampliada"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}