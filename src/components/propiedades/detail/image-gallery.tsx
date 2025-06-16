"use client"

import * as React from "react"
import { useState } from "react"
import Image from "next/image"
import { Plus, Trash2, Maximize2, X, Download, CheckSquare2, Square } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import type { PropertyImage } from "~/lib/data"
import { uploadPropertyImage, deletePropertyImage } from "~/app/actions/upload"
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
  propertyId: bigint
  referenceNumber: string
  onImageUploaded?: (image: PropertyImage) => void
}

export function ImageGallery({ 
  images: initialImages, 
  title, 
  propertyId, 
  referenceNumber,
  onImageUploaded 
}: ImageGalleryProps) {
  const [images, setImages] = useState<PropertyImage[]>(initialImages)
  const [imageToDelete, setImageToDelete] = useState<number | null>(null)
  const [expandedImage, setExpandedImage] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set())
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const handleDownload = async (imageUrl: string, fileName: string) => {
    setIsDownloading(true)
    setDownloadError(null)
    
    try {
      // First try to fetch the image
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`)
      }
      
      // Get the blob from the response
      const blob = await response.blob()
      
      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob)
      
      // Create and trigger download
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = blobUrl
      a.download = fileName
      
      // Append to body, click, and remove
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      window.URL.revokeObjectURL(blobUrl)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading image:", error)
      setDownloadError(error instanceof Error ? error.message : 'Failed to download image')
      
      // If fetch fails, try XMLHttpRequest as fallback
      try {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', imageUrl, true)
        xhr.responseType = 'blob'
        
        xhr.onload = function() {
          if (xhr.status === 200) {
            const blob = xhr.response
            const blobUrl = window.URL.createObjectURL(blob)
            
            const a = document.createElement('a')
            a.style.display = 'none'
            a.href = blobUrl
            a.download = fileName
            
            document.body.appendChild(a)
            a.click()
            
            window.URL.revokeObjectURL(blobUrl)
            document.body.removeChild(a)
            setDownloadError(null)
          } else {
            setDownloadError(`Failed to download image: ${xhr.statusText}`)
          }
        }
        
        xhr.onerror = function() {
          setDownloadError('Network error occurred while downloading')
        }
        
        xhr.send()
      } catch (fallbackError) {
        console.error("Fallback download failed:", fallbackError)
        setDownloadError('All download methods failed')
      }
    } finally {
      setIsDownloading(false)
    }
  }

  const handleBulkDownload = async () => {
    const selectedImagesList = Array.from(selectedImages)
    for (const index of selectedImagesList) {
      const image = images[index]
      if (image) {
        // Get the file extension from the URL
        const extension = image.imageUrl.split('.').pop() || 'jpg'
        await handleDownload(image.imageUrl, `property-image-${index + 1}.${extension}`)
      }
    }
  }

  const handleBulkDelete = async () => {
    const selectedImagesList = Array.from(selectedImages)
    setIsDeleting(true)
    try {
      for (const index of selectedImagesList) {
        const image = images[index]
        if (image) {
          await deletePropertyImage(image.imageKey, propertyId)
        }
      }
      setImages(images.filter((_, i) => !selectedImages.has(i)))
    } catch (error) {
      console.error("Error deleting images:", error)
      // TODO: Show error toast
    } finally {
      setIsDeleting(false)
      setSelectedImages(new Set())
      setIsSelectMode(false)
    }
  }

  const toggleImageSelection = (index: number) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    
    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const fileId = `${file.name}-${Date.now()}-${index}`
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))
        
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[fileId] ?? 0
            if (currentProgress >= 90) {
              clearInterval(progressInterval)
              return prev
            }
            return { ...prev, [fileId]: currentProgress + 10 }
          })
        }, 200)

        try {
          const newImage = await uploadPropertyImage(
            file,
            propertyId,
            referenceNumber,
            images.length + index
          )
          
          clearInterval(progressInterval)
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
          
          // Small delay to show 100% before hiding
          await new Promise(resolve => setTimeout(resolve, 500))
          return newImage
        } catch (error) {
          clearInterval(progressInterval)
          throw error
        }
      })

      const newImages = await Promise.all(uploadPromises)
      setImages(prev => [...prev, ...newImages])
      newImages.forEach(image => onImageUploaded?.(image))
    } catch (error) {
      console.error("Error uploading images:", error)
      // TODO: Show error toast
    } finally {
      setIsUploading(false)
      setUploadProgress({})
    }
  }

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = images[index];
    if (!imageToRemove) return;

    setIsDeleting(true);
    try {
      await deletePropertyImage(imageToRemove.imageKey, propertyId);
      setImages(images.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting image:", error);
      // TODO: Show error toast
    } finally {
      setIsDeleting(false);
      setImageToDelete(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2 mb-4">
        {isSelectMode ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedImages(new Set())
                setIsSelectMode(false)
              }}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkDownload}
              disabled={selectedImages.size === 0 || isDeleting}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <Download className="h-4 w-4 mr-1.5" />
              {selectedImages.size}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkDelete}
              disabled={selectedImages.size === 0 || isDeleting}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              {selectedImages.size}
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSelectMode(true)}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <CheckSquare2 className="h-4 w-4 mr-1.5" />
            Seleccionar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image, idx) => (
          <div 
            key={image.propertyImageId.toString()} 
            className={cn(
              "relative group rounded-lg overflow-hidden border bg-muted",
              isSelectMode && "cursor-pointer",
              selectedImages.has(idx) && "ring-2 ring-primary/50"
            )}
            onClick={() => isSelectMode && toggleImageSelection(idx)}
          >
            <Image
              src={image.imageUrl}
              alt={title || `Property image ${idx + 1}`}
              width={300}
              height={200}
              className="object-cover w-full h-40"
            />
            {isSelectMode ? (
              <div className="absolute top-2 left-2 bg-white/80 rounded-full p-1">
                {selectedImages.has(idx) ? (
                  <CheckSquare2 className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4 text-gray-400" />
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="absolute top-2 left-2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandedImage(idx)
                  }}
                  aria-label="Expandir imagen"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-black/40 hover:bg-red-500 text-white rounded-full p-1.5 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    setImageToDelete(idx)
                  }}
                  disabled={isDeleting}
                  aria-label="Eliminar imagen"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="absolute bottom-2 left-2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(image.imageUrl, `property-image-${idx + 1}.jpg`)
                  }}
                  disabled={isDownloading}
                  aria-label="Descargar imagen"
                >
                  {isDownloading ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                </button>
              </>
            )}
          </div>
        ))}
        <label
          className={cn(
            "flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-lg h-40 w-full min-w-[120px] bg-white hover:bg-gray-50 transition-all duration-200 cursor-pointer relative overflow-hidden group",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="w-full px-4 space-y-2">
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId} className="space-y-1">
                  <div className="h-0.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-400 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <Plus className="h-5 w-5 text-gray-400 group-hover:text-gray-500 mb-1 transition-colors duration-200" />
              <span className="text-sm text-gray-400 group-hover:text-gray-500 font-medium transition-colors duration-200">
                Añadir imágenes
              </span>
            </>
          )}
        </label>
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
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => imageToDelete !== null && handleRemoveImage(imageToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
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