"use client"

import { useState, useMemo } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Card } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Checkbox } from "~/components/ui/checkbox"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "~/lib/utils"

// Common form data interface
interface BaseFormData {
  // Initial questions (common to all)
  cadastralReference: string
  propertySheetFilled: boolean

  // Basic Information (common to all)
  referenceNumber: string
  title: string
  price: string
  listingType: string
  status: string
  propertyType: string
}

// Step configuration for different property types
const commonSteps = [
  { id: "initial", title: "Información Inicial" },
  { id: "basic", title: "Información Básica" },
]

const apartmentSteps = [
  ...commonSteps,
  { id: "location", title: "Ubicación" },
  { id: "specifications", title: "Especificaciones" },
  { id: "construction", title: "Construcción" },
  { id: "amenities", title: "Comodidades" },
  { id: "security", title: "Seguridad" },
  { id: "kitchen", title: "Cocina" },
  { id: "garage", title: "Garaje y Almacén" },
  { id: "spaces", title: "Espacios Adicionales" },
  { id: "views", title: "Vistas y Exterior" },
  { id: "premium", title: "Características Premium" },
  { id: "additional", title: "Características Adicionales" },
  { id: "rental", title: "Específico para Alquiler" },
  { id: "final", title: "Información Final" },
]

const houseSteps = [
  ...commonSteps,
  { id: "location", title: "Ubicación" },
  { id: "specifications", title: "Especificaciones de la Casa" },
  { id: "plot", title: "Parcela y Terreno" },
  { id: "construction", title: "Construcción" },
  { id: "exterior", title: "Espacios Exteriores" },
  { id: "interior", title: "Distribución Interior" },
  { id: "amenities", title: "Comodidades" },
  { id: "security", title: "Seguridad" },
  { id: "utilities", title: "Servicios y Suministros" },
  { id: "premium", title: "Características Premium" },
  { id: "rental", title: "Específico para Alquiler" },
  { id: "final", title: "Información Final" },
]

const garageSteps = [
  ...commonSteps,
  { id: "location", title: "Ubicación" },
  { id: "specifications", title: "Especificaciones del Garaje" },
  { id: "access", title: "Acceso y Seguridad" },
  { id: "utilities", title: "Servicios" },
  { id: "final", title: "Información Final" },
]

const localSteps = [
  ...commonSteps,
  { id: "location", title: "Ubicación" },
  { id: "specifications", title: "Especificaciones del Local" },
  { id: "commercial", title: "Características Comerciales" },
  { id: "utilities", title: "Servicios y Suministros" },
  { id: "access", title: "Acceso y Visibilidad" },
  { id: "licensing", title: "Licencias y Permisos" },
  { id: "final", title: "Información Final" },
]

const solarSteps = [
  ...commonSteps,
  { id: "location", title: "Ubicación" },
  { id: "specifications", title: "Especificaciones del Solar" },
  { id: "planning", title: "Urbanismo y Edificabilidad" },
  { id: "utilities", title: "Servicios Disponibles" },
  { id: "final", title: "Información Final" },
]

// Step configuration mapping
const stepConfigurations = {
  apartment: apartmentSteps,
  house: houseSteps,
  garage: garageSteps,
  local: localSteps,
  solar: solarSteps,
}

type PropertyType = keyof typeof stepConfigurations

export default function PropertyQuestionnaire() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<BaseFormData>({
    cadastralReference: "",
    propertySheetFilled: false,
    referenceNumber: "",
    title: "",
    price: "",
    listingType: "Sale",
    status: "available",
    propertyType: "apartment",
  })
  const [isAnimating, setIsAnimating] = useState(false)

  // Get current steps based on property type
  const currentSteps = useMemo(() => {
    const propertyType = formData.propertyType as PropertyType
    return stepConfigurations[propertyType] || apartmentSteps
  }, [formData.propertyType])

  // Reset to step 2 (location) when property type changes after basic info
  const handlePropertyTypeChange = (newPropertyType: string) => {
    setFormData((prev) => ({ ...prev, propertyType: newPropertyType }))

    // If we're past the basic information step, reset to location step
    if (currentStep > 1) {
      setCurrentStep(2) // Reset to location step (first step after basic info)
    }
  }

  const updateFormData = (field: keyof BaseFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < currentSteps.length - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
        setIsAnimating(false)
      }, 150)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1)
        setIsAnimating(false)
      }, 150)
    }
  }

  const progress = ((currentStep + 1) / currentSteps.length) * 100

  const renderStepContent = () => {
    const step = currentSteps[currentStep]
    const propertyType = formData.propertyType as PropertyType

    if (!step) {
      return <div>Step not found</div>
    }

    switch (step.id) {
      case "initial":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cadastralReference" className="text-sm">
                Referencia Catastral *
              </Label>
              <Input
                id="cadastralReference"
                value={formData.cadastralReference}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData("cadastralReference", e.target.value)}
                placeholder="Ingrese la referencia catastral"
                className="h-8"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="propertySheetFilled"
                checked={formData.propertySheetFilled}
                onCheckedChange={(checked: boolean | "indeterminate") => updateFormData("propertySheetFilled", checked === true)}
              />
              <Label htmlFor="propertySheetFilled" className="text-sm">
                ¿Ficha de propiedad rellenada?
              </Label>
            </div>
          </div>
        )

      case "basic":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="referenceNumber" className="text-sm">
                  Número de Referencia
                </Label>
                <Input
                  id="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData("referenceNumber", e.target.value)}
                  placeholder="REF-001"
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm">
                  Precio (€)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData("price", e.target.value)}
                  placeholder="250000"
                  className="h-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm">
                Título del Anuncio
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData("title", e.target.value)}
                placeholder="Piso en venta en el centro de la ciudad"
                className="h-8"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="listingType" className="text-sm">
                  Tipo de Anuncio
                </Label>
                <Select value={formData.listingType} onValueChange={(value: string) => updateFormData("listingType", value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sale">Venta</SelectItem>
                    <SelectItem value="Rent">Alquiler</SelectItem>
                    <SelectItem value="Transfer">Traspaso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyType" className="text-sm">
                  Tipo de Propiedad *
                </Label>
                <Select value={formData.propertyType} onValueChange={handlePropertyTypeChange}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Piso</SelectItem>
                    <SelectItem value="house">Casa</SelectItem>
                    <SelectItem value="garage">Garaje</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="solar">Solar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {currentStep === 1 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Importante:</strong> El tipo de propiedad determinará las siguientes secciones del
                  cuestionario. Asegúrate de seleccionar el tipo correcto antes de continuar.
                </p>
              </div>
            )}
          </div>
        )

      case "location":
        return renderLocationStep(propertyType)

      case "specifications":
        return renderSpecificationsStep(propertyType)

      // Add more cases for different steps
      default:
        return renderPropertySpecificStep(step.id, propertyType)
    }
  }

  const renderLocationStep = (propertyType: PropertyType) => {
    // Common location fields for most property types
    const isMinimalLocation = propertyType === "garage"

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="street" className="text-sm">
            Calle
          </Label>
          <Input id="street" placeholder="Calle Mayor, 123" className="h-8" />
        </div>

        {!isMinimalLocation && (
          <div className="space-y-2">
            <Label htmlFor="addressDetails" className="text-sm">
              Detalles de la Dirección
            </Label>
            <Input id="addressDetails" placeholder="Piso 3º, Puerta A" className="h-8" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-sm">
              Código Postal
            </Label>
            <Input id="postalCode" placeholder="28001" className="h-8" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm">
              Ciudad
            </Label>
            <Input id="city" placeholder="Madrid" className="h-8" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="province" className="text-sm">
              Provincia
            </Label>
            <Input id="province" placeholder="Madrid" className="h-8" />
          </div>
        </div>

        {!isMinimalLocation && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="municipality" className="text-sm">
                Municipio
              </Label>
              <Input id="municipality" placeholder="Madrid" className="h-8" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood" className="text-sm">
                Barrio
              </Label>
              <Input id="neighborhood" placeholder="Centro" className="h-8" />
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderSpecificationsStep = (propertyType: PropertyType) => {
    switch (propertyType) {
      case "apartment":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="squareMeter" className="text-sm">
                  Superficie (m²)
                </Label>
                <Input id="squareMeter" type="number" placeholder="85" className="h-8" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="builtSurfaceArea" className="text-sm">
                  Superficie Construida (m²)
                </Label>
                <Input id="builtSurfaceArea" type="number" placeholder="95" className="h-8" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms" className="text-sm">
                  Dormitorios
                </Label>
                <Input id="bedrooms" type="number" placeholder="3" className="h-8" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms" className="text-sm">
                  Baños
                </Label>
                <Input id="bathrooms" type="number" placeholder="2" className="h-8" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yearBuilt" className="text-sm">
                  Año de Construcción
                </Label>
                <Input id="yearBuilt" type="number" placeholder="1995" className="h-8" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buildingFloors" className="text-sm">
                  Plantas del Edificio
                </Label>
                <Input id="buildingFloors" type="number" placeholder="5" className="h-8" />
              </div>
            </div>
          </div>
        )

      case "house":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="builtSurfaceArea" className="text-sm">
                  Superficie Construida (m²)
                </Label>
                <Input id="builtSurfaceArea" type="number" placeholder="200" className="h-8" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plotSize" className="text-sm">
                  Superficie Parcela (m²)
                </Label>
                <Input id="plotSize" type="number" placeholder="500" className="h-8" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms" className="text-sm">
                  Dormitorios
                </Label>
                <Input id="bedrooms" type="number" placeholder="4" className="h-8" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms" className="text-sm">
                  Baños
                </Label>
                <Input id="bathrooms" type="number" placeholder="3" className="h-8" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floors" className="text-sm">
                  Plantas
                </Label>
                <Input id="floors" type="number" placeholder="2" className="h-8" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="basement" />
                <Label htmlFor="basement" className="text-sm">
                  Sótano
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="attic" />
                <Label htmlFor="attic" className="text-sm">
                  Ático
                </Label>
              </div>
            </div>
          </div>
        )

      case "garage":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="garageSize" className="text-sm">
                  Superficie (m²)
                </Label>
                <Input id="garageSize" type="number" placeholder="25" className="h-8" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleCapacity" className="text-sm">
                  Capacidad de Vehículos
                </Label>
                <Input id="vehicleCapacity" type="number" placeholder="1" className="h-8" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="garageType" className="text-sm">
                Tipo de Garaje
              </Label>
              <Select>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="closed">Cerrado</SelectItem>
                  <SelectItem value="open">Abierto</SelectItem>
                  <SelectItem value="covered">Cubierto</SelectItem>
                  <SelectItem value="underground">Subterráneo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "local":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalSurface" className="text-sm">
                  Superficie Total (m²)
                </Label>
                <Input id="totalSurface" type="number" placeholder="100" className="h-8" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frontage" className="text-sm">
                  Fachada (m)
                </Label>
                <Input id="frontage" type="number" placeholder="8" className="h-8" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="localType" className="text-sm">
                Tipo de Local
              </Label>
              <Select>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Comercial</SelectItem>
                  <SelectItem value="office">Oficina</SelectItem>
                  <SelectItem value="warehouse">Almacén</SelectItem>
                  <SelectItem value="restaurant">Restaurante</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "solar":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plotSize" className="text-sm">
                  Superficie (m²)
                </Label>
                <Input id="plotSize" type="number" placeholder="1000" className="h-8" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buildableArea" className="text-sm">
                  Superficie Edificable (m²)
                </Label>
                <Input id="buildableArea" type="number" placeholder="400" className="h-8" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zoning" className="text-sm">
                Calificación Urbanística
              </Label>
              <Select>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Seleccionar calificación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residencial</SelectItem>
                  <SelectItem value="commercial">Comercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="mixed">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      default:
        return <div>Especificaciones no definidas para este tipo de propiedad</div>
    }
  }

  const renderPropertySpecificStep = (stepId: string, propertyType: PropertyType) => {
    // This would contain the logic for rendering property-specific steps
    // For now, return a placeholder
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Contenido específico para {propertyType} - {stepId}
        </p>
        <div className="p-4 bg-gray-50 rounded-lg border">
          <p className="text-sm">Este paso contendría campos específicos para el tipo de propiedad seleccionado.</p>
        </div>
      </div>
    )
  }

  const handleSubmit = () => {
    console.log("Form submitted:", formData)
    alert("¡Formulario enviado correctamente!")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-gray-900 mb-2">Cuestionario de Propiedad Inmobiliaria</h1>
            <p className="text-sm text-gray-600 mb-4">
              Complete la información paso a paso -{" "}
              {formData.propertyType === "apartment"
                ? "Piso"
                : formData.propertyType === "house"
                  ? "Casa"
                  : formData.propertyType === "garage"
                    ? "Garaje"
                    : formData.propertyType === "local"
                      ? "Local"
                      : "Solar"}
            </p>
            <div className="space-y-2">
              <Progress value={progress} className="w-full h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  Paso {currentStep + 1} de {currentSteps.length}
                </span>
                <span>{Math.round(progress)}% completado</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">{currentSteps[currentStep]?.title ?? "Paso"}</h2>
            <div
              className={cn(
                "transition-all duration-300",
                isAnimating ? "opacity-0 transform translate-x-2" : "opacity-100 transform translate-x-0",
              )}
            >
              {renderStepContent()}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 h-8"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </Button>

            {currentStep === currentSteps.length - 1 ? (
              <Button onClick={handleSubmit} className="h-8">
                Finalizar
              </Button>
            ) : (
              <Button onClick={nextStep} className="flex items-center space-x-2 h-8">
                <span>Siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
