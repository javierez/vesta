"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { updateProperty } from "~/server/queries/properties"
import FormSkeleton from "./form-skeleton"
import { CompassRose } from "../rosa"

interface FifthPageProps {
  listingId: string
  globalFormData: any
  onNext: () => void
  onBack?: () => void
  refreshListingDetails?: () => void
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

export default function FifthPage({ listingId, globalFormData, onNext, onBack, refreshListingDetails }: FifthPageProps) {
  const [formData, setFormData] = useState<FifthPageFormData>(initialFormData)
  const [saveError, setSaveError] = useState<string | null>(null)

  const updateFormData = (field: keyof FifthPageFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Use centralized data instead of fetching
  useEffect(() => {
    if (globalFormData?.listingDetails) {
      const details = globalFormData.listingDetails
      
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
  }, [globalFormData?.listingDetails, onNext])

  const handleNext = () => {
    // Navigate IMMEDIATELY (optimistic) - no waiting!
    onNext()
    
    // Save data in background (completely silent)
    saveInBackground()
  }

  // Background save function - completely silent and non-blocking
  const saveInBackground = () => {
    // Fire and forget - no await, no blocking!
    if (globalFormData?.listingDetails?.propertyId) {
      const updateData: any = {
        exterior: formData.isExterior,
        bright: formData.isBright,
        orientation: formData.orientation,
      }

      // Only update formPosition if current position is lower than 6
      if (!globalFormData.listingDetails.formPosition || globalFormData.listingDetails.formPosition < 6) {
        updateData.formPosition = 6
      }

      console.log("Saving fifth page data:", updateData) // Debug log

      updateProperty(Number(globalFormData.listingDetails.propertyId), updateData).then(() => {
        console.log("Fifth page data saved successfully") // Debug log
        // Refresh global data after successful save
        refreshListingDetails?.()
      }).catch((error: any) => {
        console.error("Error saving form data:", error)
        // Silent error - user doesn't know it failed
        // Could implement retry logic here if needed
      })
    } else {
      console.warn("No propertyId found in globalFormData.listingDetails for fifth page") // Debug log
    }
  }

  if (globalFormData?.listingDetails === null) {
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
