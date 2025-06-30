"use client"

import * as React from "react"
import { useState } from "react"
import Image from "next/image"
import { Plus, Trash2, Maximize2, X, Download, CheckSquare2, Square, GripVertical } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import type { PropertyImage } from "~/lib/data"
import { uploadPropertyImage, deletePropertyImage, updateImageOrders } from "~/app/actions/upload"
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
  
  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [pendingImages, setPendingImages] = useState<PropertyImage[]>([])

  // Use the same placeholder image as property-card.tsx
  const defaultPlaceholder = "/properties/suburban-dream.png"
  
  // State for managing image sources with fallbacks
  const [imageSources, setImageSources] = useState<Record<number, string>>({})
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({})

  // Initialize image sources with fallbacks
  React.useEffect(() => {
    const sources: Record<number, string> = {}
    initialImages.forEach((image, index) => {
      sources[index] = image.imageUrl || defaultPlaceholder
    })
    setImageSources(sources)
  }, [initialImages])

  const handleImageError = (index: number) => {
    console.log('Image failed to load:', imageSources[index])
    setImageSources(prev => ({
      ...prev,
      [index]: defaultPlaceholder
    }))
  }

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => ({
      ...prev,
      [index]: true
    }))
  }

  const handleDownload = async (imageUrl: string, fileName: string) => {
    setIsDownloading(true)
    setDownloadError(null)
    
    try {
      // Extract file extension from URL or default to jpg
      const urlExtension = imageUrl.split('.').pop()?.toLowerCase()
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
      const extension = validExtensions.includes(urlExtension || '') ? urlExtension : 'jpg'
      
      // Ensure filename has proper extension
      const finalFileName = fileName.endsWith(`.${extension}`) ? fileName : `${fileName}.${extension}`
      
      // Create a temporary link element for download
      const a = document.createElement('a')
      a.href = imageUrl
      a.download = finalFileName
      a.style.display = 'none'
      
      // Append to body, click, and remove
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      // Small delay to ensure download starts
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error("Error downloading image:", error)
      setDownloadError(error instanceof Error ? error.message : 'Failed to download image')
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
          // Calculate the next image order based on existing images
          const maxImageOrder = images.length > 0 
            ? Math.max(...images.map(img => (img.imageOrder ?? 0))) 
            : 0
          const nextImageOrder = maxImageOrder + index + 1
          
          const newImage = await uploadPropertyImage(
            file,
            propertyId,
            referenceNumber,
            nextImageOrder
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
      const validImages = newImages.filter((image): image is PropertyImage => image !== undefined)
      setImages(prev => [...prev, ...validImages])
      
      // Add new images to imageSources state
      validImages.forEach((image, index) => {
        const newIndex = images.length + index
        setImageSources(prev => ({
          ...prev,
          [newIndex]: image.imageUrl || defaultPlaceholder
        }))
      })
      
      // Call the callback for each uploaded image
      validImages.forEach(image => {
        onImageUploaded?.(image as any)
      })
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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isSelectMode) return
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
    
    // Add visual feedback to the dragged element
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null)
    setDragOverIndex(null)
    
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return
    }

    // Create a new array with reordered images
    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    
    if (!draggedImage) return
    
    // Remove the dragged image and insert it at the new position
    newImages.splice(draggedIndex, 1)
    newImages.splice(dropIndex, 0, draggedImage)
    
    // Update the local state immediately for better UX
    setImages(newImages)
    setPendingImages(newImages)
    setHasUnsavedChanges(true)
    
    // Update the imageSources state to match the new order
    const newImageSources: Record<number, string> = {}
    newImages.forEach((image, index) => {
      newImageSources[index] = image.imageUrl || defaultPlaceholder
    })
    setImageSources(newImageSources)
    
    setDraggedIndex(null)
  }

  const handleSaveOrder = async () => {
    if (!hasUnsavedChanges || pendingImages.length === 0) return
    
    setIsUpdatingOrder(true)
    
    try {
      // Prepare the updates for the database
      const updates = pendingImages.map((image, index) => ({
        propertyImageId: image.propertyImageId,
        imageOrder: index + 1 // 1-based indexing
      }))
      
      // Update the database
      await updateImageOrders(updates)
      
      setHasUnsavedChanges(false)
      setPendingImages([])
    } catch (error) {
      console.error("Error updating image order:", error)
      // Revert the local state if the database update failed
      setImages(initialImages)
      setHasUnsavedChanges(false)
      setPendingImages([])
      // TODO: Show error toast
    } finally {
      setIsUpdatingOrder(false)
    }
  }

  const handleCancelOrder = () => {
    setImages(initialImages)
    setHasUnsavedChanges(false)
    setPendingImages([])
    
    // Reset imageSources to original order
    const originalImageSources: Record<number, string> = {}
    initialImages.forEach((image, index) => {
      originalImageSources[index] = image.imageUrl || defaultPlaceholder
    })
    setImageSources(originalImageSources)
  }

  return (
    <div className="space-y-4">
      {/* Help text for drag and drop */}
      {images.length > 1 && (
        <p className="text-sm text-gray-500 text-center">
          Arrastra y suelta las imágenes para reordenarlas
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image, idx) => (
          <div 
            key={image.propertyImageId.toString()} 
            className={cn(
              "relative group rounded-lg overflow-hidden border bg-muted transition-all duration-200",
              isSelectMode && "cursor-pointer",
              selectedImages.has(idx) && "ring-2 ring-primary/50",
              dragOverIndex === idx && "ring-2 ring-blue-400 scale-105",
              draggedIndex === idx && "opacity-50 scale-95",
              !isSelectMode && "cursor-move"
            )}
            draggable={!isSelectMode && !isUpdatingOrder}
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, idx)}
            onClick={() => isSelectMode && toggleImageSelection(idx)}
          >
            
            <Image
              src={imageSources[idx] || defaultPlaceholder}
              alt={title || `Property image ${idx + 1}`}
              width={300}
              height={200}
              className={`object-cover w-full h-40 ${(imageSources[idx] === defaultPlaceholder) ? "grayscale" : ""}`}
              onError={() => handleImageError(idx)}
              onLoad={() => handleImageLoad(idx)}
            />
            {!imageLoaded[idx] && <div className="absolute inset-0 bg-muted animate-pulse" />}
            
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
                    handleDownload(imageSources[idx] || '', `property-image-${idx + 1}.jpg`)
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
            
            {/* Loading overlay for order updates */}
            {isUpdatingOrder && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
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

      {/* Selection Controls - Moved to bottom */}
      <div className="flex items-center space-x-2 mt-4">
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
              Descargar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkDelete}
              disabled={selectedImages.size === 0 || isDeleting}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Eliminar
            </Button>
          </>
        ) : hasUnsavedChanges ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelOrder}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveOrder}
              disabled={isUpdatingOrder}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              {isUpdatingOrder ? "Guardando..." : "Guardar"}
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
                src={imageSources[expandedImage] || defaultPlaceholder}
                alt={title || `Property image ${expandedImage + 1}`}
                width={1200}
                height={800}
                className={`w-full h-auto max-h-[90vh] object-contain rounded-lg ${(imageSources[expandedImage] === defaultPlaceholder) ? "grayscale" : ""}`}
                onError={() => handleImageError(expandedImage)}
                onLoad={() => handleImageLoad(expandedImage)}
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