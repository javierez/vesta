"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { ChevronLeft, ChevronRight, Loader } from "lucide-react"
import { motion } from "framer-motion"
import { getListingDetails } from "~/server/queries/listing"
import { updateProperty } from "~/server/queries/properties"
import { formFormatters } from "~/lib/utils"
import FormSkeleton from "./form-skeleton"

interface SecondPageProps {
  listingId: string
  onNext: () => void
  onBack?: () => void
}

// Form data interface for second page
interface SecondPageFormData {
  bedrooms: string
  bathrooms: string
  squareMeter: string
  builtSurfaceArea: string
  yearBuilt: string
  lastRenovationYear: string
  buildingFloors: string
}

const initialFormData: SecondPageFormData = {
  bedrooms: "",
  bathrooms: "",
  squareMeter: "",
  builtSurfaceArea: "",
  yearBuilt: "",
  lastRenovationYear: "",
  buildingFloors: "",
}

export default function SecondPage({ listingId, onNext, onBack }: SecondPageProps) {
  const [formData, setFormData] = useState<SecondPageFormData>(initialFormData)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [listingDetails, setListingDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [propertyType, setPropertyType] = useState<string>("")

  // Fetch listing details on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch listing details first
        if (listingId) {
          const details = await getListingDetails(Number(listingId))
          setListingDetails(details)
          setPropertyType(details.propertyType || "")
          
          // Pre-populate form with existing data
          setFormData(prev => ({
            ...prev,
            bedrooms: details.bedrooms ? details.bedrooms.toString() : "",
            bathrooms: details.bathrooms ? Math.floor(Number(details.bathrooms)).toString() : "",
            squareMeter: details.squareMeter ? details.squareMeter.toString() : "",
            builtSurfaceArea: details.builtSurfaceArea ? Math.floor(Number(details.builtSurfaceArea)).toString() : "",
            yearBuilt: details.yearBuilt ? details.yearBuilt.toString() : "",
            lastRenovationYear: details.lastRenovationYear ? details.lastRenovationYear.toString() : "",
            buildingFloors: details.buildingFloors ? details.buildingFloors.toString() : "",
          }))
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [listingId])

  const updateFormData = (field: keyof SecondPageFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEventInputChange = (field: keyof SecondPageFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData(field, e.target.value)
  }

  // Custom handler for square meter with formatting
  const handleSquareMeterChange = formFormatters.handleAreaInputChange((value) => 
    updateFormData("squareMeter", value)
  )

  // Custom handler for built surface area with formatting
  const handleBuiltSurfaceAreaChange = formFormatters.handleAreaInputChange((value) => 
    updateFormData("builtSurfaceArea", value)
  )

  const handleNext = async () => {
    // Validate required fields based on property type
    if (propertyType === "solar") {
      // For solar, only surface is required
      if (!formData.squareMeter.trim()) {
        alert("Por favor, introduce la superficie.")
        return
      }
    } else if (propertyType === "garage") {
      // For garage, surface and year built are required
      if (!formData.squareMeter.trim()) {
        alert("Por favor, introduce las medidas.")
        return
      }
      if (!formData.yearBuilt.trim()) {
        alert("Por favor, introduce el año de construcción.")
        return
      }
    } else {
      // For other property types (piso, casa, local), validate all required fields
      if (!formData.bedrooms.trim()) {
        const fieldName = propertyType === "local" ? "espacios" : "habitaciones"
        alert(`Por favor, introduce el número de ${fieldName}.`)
        return
      }

      if (!formData.bathrooms.trim()) {
        alert("Por favor, introduce el número de baños.")
        return
      }

      if (!formData.squareMeter.trim()) {
        alert("Por favor, introduce la superficie.")
        return
      }

      if (!formData.builtSurfaceArea.trim()) {
        alert("Por favor, introduce la superficie construida.")
        return
      }

      if (!formData.yearBuilt.trim()) {
        alert("Por favor, introduce el año de construcción.")
        return
      }
    }

    // Clear any previous save errors
    setSaveError(null)

    // Save data in the background without blocking the UI
    try {
      // Update property with details
      if (listingDetails?.propertyId) {
        const updateData: any = {
          formPosition: 3,
          squareMeter: Number(formData.squareMeter),
          yearBuilt: Number(formData.yearBuilt),
        }

        // Only include fields that are relevant for the property type
        if (propertyType !== "solar") {
          updateData.bedrooms = Number(formData.bedrooms)
          updateData.bathrooms = Number(formData.bathrooms)
          updateData.builtSurfaceArea = formData.builtSurfaceArea ? Number(formData.builtSurfaceArea).toString() : ""
          updateData.lastRenovationYear = formData.lastRenovationYear ? Number(formData.lastRenovationYear) : undefined
          updateData.buildingFloors = formData.buildingFloors ? Number(formData.buildingFloors) : undefined
        }

        await updateProperty(Number(listingDetails.propertyId), updateData)
      }

      // Refresh listing details after saving
      const updatedDetails = await getListingDetails(Number(listingId))
      setListingDetails(updatedDetails)

      // Proceed to next step
      onNext()
    } catch (error) {
      console.error("Error saving form data:", error)
      setSaveError("Error al guardar los datos. Los cambios podrían no haberse guardado correctamente.")
    }
  }

  if (isLoading) {
    return (
      <FormSkeleton />
    )
  }

  return (
    <div className="space-y-6">
      {/* Bedrooms and Bathrooms - Only show for piso, casa, local, garage */}
      {propertyType !== "solar" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="bedrooms" className="text-sm font-medium text-gray-900">
              {propertyType === "local" ? "Espacios" : "Habitaciones"}
            </label>
            <Input
              id="bedrooms"
              value={formData.bedrooms}
              onChange={handleEventInputChange("bedrooms")}
              placeholder={propertyType === "local" ? "Número de espacios" : "Número de habitaciones"}
              type="number"
              min="0"
              step="1"
              className="h-10 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="bathrooms" className="text-sm font-medium text-gray-900">
              Baños
            </label>
            <Input
              id="bathrooms"
              value={formData.bathrooms}
              onChange={handleEventInputChange("bathrooms")}
              placeholder="Número de baños"
              type="number"
              min="0"
              step="1"
              className="h-10 placeholder:text-gray-400"
            />
          </div>
        </div>
      )}

      {/* Square Meter - Show for all property types */}
      <div className="space-y-2">
        <label htmlFor="squareMeter" className="text-sm font-medium text-gray-900">
          {propertyType === "garage" ? "Medidas" : "Superficie"}
        </label>
        <Input
          id="squareMeter"
          value={formFormatters.formatAreaInput(formData.squareMeter)}
          onChange={handleSquareMeterChange}
          placeholder={propertyType === "garage" ? "Medidas en metros cuadrados" : "Metros cuadrados"}
          type="text"
          className="h-10 placeholder:text-gray-400"
        />
      </div>

      {/* Built Surface Area - Only show for piso, casa, local */}
      {propertyType !== "solar" && propertyType !== "garage" && (
        <div className="space-y-2">
          <label htmlFor="builtSurfaceArea" className="text-sm font-medium text-gray-900">
            Superficie Construida
          </label>
          <Input
            id="builtSurfaceArea"
            value={formFormatters.formatAreaInput(formData.builtSurfaceArea)}
            onChange={handleBuiltSurfaceAreaChange}
            placeholder="Metros cuadrados construidos"
            type="text"
            className="h-10 placeholder:text-gray-400"
          />
        </div>
      )}

      {/* Year Built - Show for all property types except solar */}
      {propertyType !== "solar" && (
        <div className="space-y-2">
          <label htmlFor="yearBuilt" className="text-sm font-medium text-gray-900">
            Año de Construcción
          </label>
          <Input
            id="yearBuilt"
            value={formData.yearBuilt}
            onChange={handleEventInputChange("yearBuilt")}
            placeholder="Año de construcción"
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            step="1"
            className="h-10 placeholder:text-gray-400"
          />
        </div>
      )}

      {/* Last Renovation Year and Building Floors - Only show for piso, casa, local */}
      {propertyType !== "solar" && propertyType !== "garage" && (
        <>
          <div className="space-y-2">
            <label htmlFor="lastRenovationYear" className="text-sm font-medium text-gray-900">
              Año de Última Reforma
            </label>
            <Input
              id="lastRenovationYear"
              value={formData.lastRenovationYear}
              onChange={handleEventInputChange("lastRenovationYear")}
              placeholder="Año de última reforma"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              step="1"
              className="h-10 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="buildingFloors" className="text-sm font-medium text-gray-900">
              Plantas del Edificio
            </label>
            <Input
              id="buildingFloors"
              value={formData.buildingFloors}
              onChange={handleEventInputChange("buildingFloors")}
              placeholder="Número de plantas"
              type="number"
              min="0"
              step="1"
              className="h-10 placeholder:text-gray-400"
            />
          </div>
        </>
      )}

      {/* Save Error Notification */}
      {saveError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-sm text-red-700">{saveError}</p>
          </div>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <motion.div
        className="flex justify-between pt-4 border-t"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={!onBack}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Anterior</span>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            onClick={handleNext} 
            className="flex items-center space-x-1 bg-gray-900 hover:bg-gray-800"
          >
            <span>Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
