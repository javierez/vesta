"use client"

import { Button } from "~/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  className = ""
}: PaginationControlsProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Página anterior</span>
      </Button>
      
      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground">
          Página
        </span>
        <span className="text-sm text-muted-foreground">
          {currentPage}
        </span>
        <span className="text-sm text-muted-foreground">
          de {totalPages}
        </span>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Página siguiente</span>
      </Button>
    </div>
  )
} 