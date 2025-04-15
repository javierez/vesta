"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"
import type { PropertyImage } from "~/lib/data"

interface ImageGalleryProps {
  images: PropertyImage[]
  title: string
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loaded, setLoaded] = useState<boolean[]>(Array(images.length).fill(false))

  // Make sure we have valid images
  const validImages = images?.filter((img) => img.url && img.url !== "") || []

  // Use a default placeholder if no valid images
  const defaultPlaceholder = "/suburban-dream.png"

  if (validImages.length === 0) {
    validImages.push({
      url: defaultPlaceholder,
      alt: title || "Property image",
    })
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1))
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index)
  }

  const handleImageLoad = (index: number) => {
    setLoaded((prev) => {
      const newLoaded = [...prev]
      newLoaded[index] = true
      return newLoaded
    })
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
        {validImages.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-300",
              index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            <Image
              src={image.url || "/placeholder.svg"}
              alt={image.alt || title}
              fill
              className="object-cover"
              priority={index === 0}
              onLoad={() => handleImageLoad(index)}
            />
            {!loaded[index] && <div className="absolute inset-0 bg-muted animate-pulse" />}
            {image.tag && <Badge className="absolute bottom-4 left-4 bg-black/70 text-white">{image.tag}</Badge>}
          </div>
        ))}

        {validImages.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white"
              onClick={handlePrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white"
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>

      {validImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {validImages.map((image, index) => (
            <button
              key={index}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2",
                index === currentIndex ? "border-primary" : "border-transparent",
              )}
              onClick={() => handleThumbnailClick(index)}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url || "/placeholder.svg"}
                alt={image.alt || `${title} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
