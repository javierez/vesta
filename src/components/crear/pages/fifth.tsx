"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getListingDetails } from "~/server/queries/listing"
import { updateProperty } from "~/server/queries/properties"
import FormSkeleton from "./form-skeleton"
import { CompassRose } from "../rosa"

interface FifthPageProps {
  listingId: string
  onNext: () => void
  onBack?: () => void
}

// Form data interface for fifth page
interface FifthPageFormData {
  isExterior: boolean
  isBright: boolean
  orientation: string
}

const initialFormData: FifthPageFormData = {
  isExterior: false,
  isBright: false,
  orientation: "",
}

export default function FifthPage({ listingId, onNext, onBack }: FifthPageProps) {
  const [formData, setFormData] = useState<FifthPageFormData>(initialFormData)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [listingDetails, setListingDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const updateFormData = (field: keyof FifthPageFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Fetch listing details on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch listing details first
        if (listingId) {
          const details = await getListingDetails(Number(listingId))
          setListingDetails(details)
          
          // For solar and garage properties, skip this page entirely
          if (details.propertyType === "solar" || details.propertyType === "garage") {
            onNext()
            return
          }
          
          // Pre-populate form with existing data for other property types
          setFormData(prev => ({
            ...prev,
            isExterior: details.exterior || false,
            isBright: details.bright || false,
            orientation: details.orientation || "",
          }))
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [listingId, onNext])

  const handleNext = async () => {
    setSaving(true)
    try {
      // Clear any previous save errors
      setSaveError(null)

      // Save data in the background without blocking the UI
      if (listingDetails?.propertyId) {
        const updateData: any = {
          exterior: formData.isExterior,
          bright: formData.isBright,
          orientation: formData.orientation,
        }

        // Only update formPosition if current position is lower than 6
        if (!listingDetails.formPosition || listingDetails.formPosition < 6) {
          updateData.formPosition = 6
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4"
    >
      <motion.div
        className="space-y-1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-gray-900">Orientación y exposición</h2>
      </motion.div>

      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {/* Exterior */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => updateFormData("isExterior", !formData.isExterior)}
          className={`
            w-full p-3 rounded-lg transition-all duration-200 relative overflow-hidden
            ${
              formData.isExterior
                ? "bg-gray-900 text-white border border-gray-900 shadow-sm"
                : "bg-white text-gray-700 shadow-md"
            }
          `}
        >
          <motion.div
            className="absolute inset-0 bg-gray-800"
            initial={{ scale: 0, opacity: 0 }}
            animate={formData.isExterior ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ borderRadius: "inherit" }}
          />
          <div className="flex items-center space-x-3 relative z-10">
            <span className="text-sm font-medium">Exterior</span>
          </div>
          {formData.isExterior && (
            <span className="absolute top-3.5 right-2 w-4 h-4 flex items-center justify-center rounded-full bg-white/90 border border-gray-300 z-20">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 6.5L5.2 8.5L9 4.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
        </motion.button>

        {/* Bright */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => updateFormData("isBright", !formData.isBright)}
          className={`
            w-full p-3 rounded-lg transition-all duration-200 relative overflow-hidden
            ${
              formData.isBright
                ? "bg-gray-900 text-white border border-gray-900 shadow-sm"
                : "bg-white text-gray-700 shadow-md"
            }
          `}
        >
          <motion.div
            className="absolute inset-0 bg-gray-800"
            initial={{ scale: 0, opacity: 0 }}
            animate={formData.isBright ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ borderRadius: "inherit" }}
          />
          <div className="flex items-center space-x-3 relative z-10">
            <span className="text-sm font-medium">Luminoso</span>
          </div>
          {formData.isBright && (
            <span className="absolute top-3.5 right-2 w-4 h-4 flex items-center justify-center rounded-full bg-white/90 border border-gray-300 z-20">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 6.5L5.2 8.5L9 4.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
        </motion.button>

        {/* Orientation */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">Orientación</Label>
          <CompassRose 
            value={formData.orientation} 
            onChange={(value) => updateFormData("orientation", value)}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700"
          >
            {saveError}
          </motion.div>
        )}
      </AnimatePresence>

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
    </motion.div>
  )
}
