"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { ChevronLeft, ChevronRight, Square, Wind } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { updateProperty } from "~/server/queries/properties"
import FormSkeleton from "./form-skeleton"

interface NinethPageProps {
  listingId: string
  globalFormData: any
  onNext: () => void
  onBack?: () => void
  refreshListingDetails?: () => void
}

interface NinethPageFormData {
  mainFloorType: string
  shutterType: string
  carpentryType: string
  windowType: string
}

const initialFormData: NinethPageFormData = {
  mainFloorType: "",
  shutterType: "",
  carpentryType: "",
  windowType: "",
}

export default function NinethPage({ listingId, globalFormData, onNext, onBack, refreshListingDetails }: NinethPageProps) {
  const [formData, setFormData] = useState<NinethPageFormData>(initialFormData)
  const [saveError, setSaveError] = useState<string | null>(null)

  const updateFormData = (field: keyof NinethPageFormData, value: any) => {
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
      
      setFormData(prev => ({
        ...prev,
        mainFloorType: details.mainFloorType || "",
        shutterType: details.shutterType || "",
        carpentryType: details.carpentryType || "",
        windowType: details.windowType || "",
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
        mainFloorType: formData.mainFloorType,
        shutterType: formData.shutterType,
        carpentryType: formData.carpentryType,
        windowType: formData.windowType,
      }

      // Only update formPosition if current position is lower than 10
      if (!globalFormData.listingDetails.formPosition || globalFormData.listingDetails.formPosition < 10) {
        updateData.formPosition = 10
      }

      console.log("Saving nineth page data:", updateData) // Debug log

      updateProperty(Number(globalFormData.listingDetails.propertyId), updateData).then(() => {
        console.log("Nineth page data saved successfully") // Debug log
        // Refresh global data after successful save
        refreshListingDetails?.()
      }).catch((error: any) => {
        console.error("Error saving form data:", error)
        // Silent error - user doesn't know it failed
        // Could implement retry logic here if needed
      })
    } else {
      console.warn("No propertyId found in globalFormData.listingDetails for nineth page") // Debug log
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
      className="space-y-6"
    >
      <motion.div
        className="space-y-1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-gray-900">Materiales y Acabados</h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {/* Windows and Doors */}
        <div className="space-y-4 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-600">Ventanas y puertas</h4>
            <Wind className="h-4 w-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="windowType" className="text-sm">Tipo de ventana</Label>
              <Select value={formData.windowType} onValueChange={value => updateFormData("windowType", value)}>
                <SelectTrigger className="h-8 text-gray-500">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aluminio">Aluminio</SelectItem>
                  <SelectItem value="pvc">PVC</SelectItem>
                  <SelectItem value="madera">Madera</SelectItem>
                  <SelectItem value="climalit">Climalit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="carpentryType" className="text-sm">Tipo de carpintería</Label>
              <Select value={formData.carpentryType} onValueChange={value => updateFormData("carpentryType", value)}>
                <SelectTrigger className="h-8 text-gray-500">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aluminio">Aluminio</SelectItem>
                  <SelectItem value="pvc">PVC</SelectItem>
                  <SelectItem value="madera">Madera</SelectItem>
                  <SelectItem value="hierro">Hierro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shutterType" className="text-sm">Tipo de persiana</Label>
              <Select value={formData.shutterType} onValueChange={value => updateFormData("shutterType", value)}>
                <SelectTrigger className="h-8 text-gray-500">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="electrico">Eléctrica</SelectItem>
                  <SelectItem value="automatica">Automática</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Flooring */}
        <div className="space-y-4 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-600">Suelos</h4>
            <Square className="h-4 w-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="mainFloorType" className="text-sm">Tipo de suelo</Label>
              <Select value={formData.mainFloorType} onValueChange={value => updateFormData("mainFloorType", value)}>
                <SelectTrigger className="h-8 text-gray-500">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parquet">Parquet</SelectItem>
                  <SelectItem value="marmol">Mármol</SelectItem>
                  <SelectItem value="gres">Gres</SelectItem>
                  <SelectItem value="moqueta">Moqueta</SelectItem>
                  <SelectItem value="hidraulico">Hidráulico</SelectItem>
                  <SelectItem value="microcemento">Microcemento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
