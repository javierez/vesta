"use client"

import { useEffect, useState } from "react"
import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { CheckCircle, Home } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CongratsPage({ params }: { params: { listing_id: string } }) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true)
  }, [])

  const handleViewProperty = () => {
    router.push(`/propiedades/${params.listing_id}`)
  }

  const handleCreateAnother = () => {
    router.push("/propiedades/crear")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center shadow-lg">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Felicidades!
            </h1>
            <p className="text-gray-600">
              Tu propiedad ha sido creada exitosamente
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleViewProperty}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Home className="h-4 w-4 mr-2" />
              Ver mi propiedad
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleCreateAnother}
              className="w-full"
            >
              Crear otra propiedad
            </Button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>ID de la propiedad: {params.listing_id}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
