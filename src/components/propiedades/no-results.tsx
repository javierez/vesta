"use client"

import { SearchX } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useRouter } from "next/navigation"

interface NoResultsProps {
  message?: string
  showResetButton?: boolean
}

export function NoResults({ 
  message = "No se encontraron propiedades con los filtros seleccionados",
  showResetButton = true 
}: NoResultsProps) {
  const router = useRouter()

  const handleReset = () => {
    router.push("/propiedades")
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted/50 p-4 mb-4">
        <SearchX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Sin resultados</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {message}
      </p>
      {showResetButton && (
        <Button
          variant="outline"
          onClick={handleReset}
          className="gap-2"
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  )
} 