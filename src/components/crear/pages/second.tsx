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
import { RoomSelector } from "./elements/room_selector"
import { YearSlider } from "./elements/year_slider"
import { FloatingLabelInput } from "~/components/ui/floating-label-input"
import { cn } from "~/lib/utils"

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
  isRenovated: boolean
}

const initialFormData: SecondPageFormData = {
  bedrooms: "",
  bathrooms: "",
  squareMeter: "",
  builtSurfaceArea: "",
  yearBuilt: "",
  lastRenovationYear: "",
  buildingFloors: "",
  isRenovated: false,
}

export default function SecondPage({ listingId, onNext, onBack }: SecondPageProps) {
  const [formData, setFormData] = useState<SecondPageFormData>(initialFormData)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [listingDetails, setListingDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
            // Set isRenovated based on whether lastRenovationYear is different from yearBuilt
            isRenovated: details.lastRenovationYear && details.yearBuilt 
              ? details.lastRenovationYear !== details.yearBuilt
              : false,
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

  // Custom handlers for FloatingLabelInput (string-based onChange)
  const handleSquareMeterStringChange = (value: string) => {
    const numericValue = formFormatters.getNumericArea(value)
    updateFormData("squareMeter", numericValue)
  }

  const handleBuiltSurfaceAreaStringChange = (value: string) => {
    const numericValue = formFormatters.getNumericArea(value)
    updateFormData("builtSurfaceArea", numericValue)
  }

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
    setSaving(true)

    // Save data in the background without blocking the UI
    try {
      // Update property with details
      if (listingDetails?.propertyId) {
        const updateData: any = {
          squareMeter: Number(formData.squareMeter),
          yearBuilt: Number(formData.yearBuilt),
        }

        // Only update formPosition if current position is lower than 3
        if (!listingDetails.formPosition || listingDetails.formPosition < 3) {
          updateData.formPosition = 3
        }

        // Only include fields that are relevant for the property type
        if (propertyType !== "solar") {
          updateData.bedrooms = Number(formData.bedrooms)
          updateData.bathrooms = Number(formData.bathrooms)
          updateData.builtSurfaceArea = formData.builtSurfaceArea ? Number(formData.builtSurfaceArea).toString() : ""
          // Set renovation year to construction year if not renovated, otherwise use selected year
          updateData.lastRenovationYear = formData.isRenovated 
            ? (formData.lastRenovationYear ? Number(formData.lastRenovationYear) : Number(formData.yearBuilt))
            : Number(formData.yearBuilt)
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
      setSaving(false)
    }
  }

  if (isLoading || saving) {
    return <FormSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Bedrooms and Bathrooms - Only show for piso, casa, local, garage */}
      {propertyType !== "solar" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <RoomSelector
              type="bedrooms"
              value={Number(formData.bedrooms) || 0}
              onChange={val => updateFormData("bedrooms", val.toString())}
              label={propertyType === "local" ? "Espacios" : "Habitaciones"}
            />
          </div>

          <div className="space-y-2">
            <RoomSelector
              type="bathrooms"
              value={Number(formData.bathrooms) || 0}
              onChange={val => updateFormData("bathrooms", val.toString())}
              label="Baños"
            />
          </div>
        </div>
      )}

      {/* Square Meter - Show for all property types */}
      <div className="space-y-2">
        <FloatingLabelInput
          id="squareMeter"
          value={formFormatters.formatAreaInput(formData.squareMeter)}
          onChange={handleSquareMeterStringChange}
          placeholder={propertyType === "garage" ? "Medidas en metros cuadrados" : "Superficie útil"}
          type="text"
          className="h-10 placeholder:text-gray-400"
        />
      </div>

      {/* Built Surface Area - Only show for piso, casa, local */}
      {propertyType !== "solar" && propertyType !== "garage" && (
        <div className="space-y-2">
          <FloatingLabelInput
            id="builtSurfaceArea"
            value={formFormatters.formatAreaInput(formData.builtSurfaceArea)}
            onChange={handleBuiltSurfaceAreaStringChange}
            placeholder="Superficie construida"
            type="text"
            className="h-10 placeholder:text-gray-400"
          />
        </div>
      )}

      {/* Year Built - Show for all property types except solar */}
      {propertyType !== "solar" && (
        <div className="space-y-2">
          <YearSlider
            label="Año de Construcción"
            value={Number(formData.yearBuilt) || 2000}
            onChange={val => updateFormData("yearBuilt", val.toString())}
            min={1900}
            max={new Date().getFullYear()}
            placeholder="Año de construcción"
          />
        </div>
      )}

      {/* Renovation Question - Only show for piso, casa, local */}
      {propertyType !== "solar" && propertyType !== "garage" && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">¿Reformado?</h3>
          <div className="relative bg-gray-100 rounded-lg p-1 h-8">
            <motion.div
              className="absolute top-1 left-1 w-[calc(50%-2px)] h-6 bg-white rounded-md shadow-sm"
              animate={{
                x: formData.isRenovated ? "calc(100% - 5px)" : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <div className="relative flex h-full">
              <button
                onClick={() => {
                  updateFormData("isRenovated", false)
                  // Set renovation year to construction year when "No" is selected
                  updateFormData("lastRenovationYear", formData.yearBuilt)
                }}
                className={cn(
                  "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-xs",
                  !formData.isRenovated
                    ? "text-gray-900"
                    : "text-gray-600"
                )}
              >
                No
              </button>
              <button
                onClick={() => updateFormData("isRenovated", true)}
                className={cn(
                  "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-xs",
                  formData.isRenovated
                    ? "text-gray-900"
                    : "text-gray-600"
                )}
              >
                Sí
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Last Renovation Year and Building Floors - Only show for piso, casa, local */}
      {propertyType !== "solar" && propertyType !== "garage" && (
        <>
          {formData.isRenovated && (
            <div className="space-y-2">
              <YearSlider
                label="Año de Última Reforma"
                value={Number(formData.lastRenovationYear) || 2000}
                onChange={val => updateFormData("lastRenovationYear", val.toString())}
                min={1900}
                max={new Date().getFullYear()}
                placeholder="Año de última reforma"
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="buildingFloors" className="text-xs font-medium text-gray-600">
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
                className="h-10 placeholder:text-gray-400 shadow-md border-0"
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
