"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { FloatingLabelInput } from "~/components/ui/floating-label-input"
import { Label } from "~/components/ui/label"
import { Checkbox } from "~/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { ChevronLeft, ChevronRight, Layout, Wine, Ruler, DoorOpen, Columns3, GalleryHorizontal, BedDouble } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { updateProperty } from "~/server/queries/properties"
import { formFormatters } from "~/lib/utils"
import FormSkeleton from "./form-skeleton"

interface EighthPageProps {
  listingId: string
  globalFormData: any
  onNext: () => void
  onBack?: () => void
  refreshListingDetails?: () => void
}

interface EighthPageFormData {
  terrace: boolean
  terraceSize: number
  wineCellar: boolean
  wineCellarSize: number
  livingRoomSize: number
  balconyCount: number
  galleryCount: number
  builtInWardrobes: boolean
}

const initialFormData: EighthPageFormData = {
  terrace: false,
  terraceSize: 0,
  wineCellar: false,
  wineCellarSize: 0,
  livingRoomSize: 0,
  balconyCount: 0,
  galleryCount: 0,
  builtInWardrobes: false,
}

export default function EighthPage({ listingId, globalFormData, onNext, onBack, refreshListingDetails }: EighthPageProps) {
  const [formData, setFormData] = useState<EighthPageFormData>(initialFormData)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [propertyType, setPropertyType] = useState<string>("")

  const updateFormData = (field: keyof EighthPageFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Use centralized data instead of fetching
  useEffect(() => {
    if (globalFormData?.listingDetails) {
      const details = globalFormData.listingDetails
      setPropertyType(details.propertyType || "")
      
      // For garage properties, skip this page entirely
      if (details.propertyType === "garage") {
        onNext()
        return
      }
      
      setFormData(prev => ({
        ...prev,
        terrace: details.terrace || false,
        terraceSize: details.terraceSize || 0,
        wineCellar: details.wineCellar || false,
        wineCellarSize: details.wineCellarSize || 0,
        livingRoomSize: details.livingRoomSize || 0,
        balconyCount: details.balconyCount || 0,
        galleryCount: details.galleryCount || 0,
        builtInWardrobes: details.builtInWardrobes || false,
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
        terrace: formData.terrace,
        terraceSize: formData.terraceSize,
        wineCellar: formData.wineCellar,
        wineCellarSize: formData.wineCellarSize,
        livingRoomSize: formData.livingRoomSize,
        balconyCount: formData.balconyCount,
        galleryCount: formData.galleryCount,
        builtInWardrobes: formData.builtInWardrobes,
      }

      // Only update formPosition if current position is lower than 9
      if (!globalFormData.listingDetails.formPosition || globalFormData.listingDetails.formPosition < 9) {
        updateData.formPosition = 9
      }

      console.log("Saving eighth page data:", updateData) // Debug log

      updateProperty(Number(globalFormData.listingDetails.propertyId), updateData).then(() => {
        console.log("Eighth page data saved successfully") // Debug log
        // Refresh global data after successful save
        refreshListingDetails?.()
      }).catch((error: any) => {
        console.error("Error saving form data:", error)
        // Silent error - user doesn't know it failed
        // Could implement retry logic here if needed
      })
    } else {
      console.warn("No propertyId found in globalFormData.listingDetails for eighth page") // Debug log
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
        <h2 className="text-lg font-semibold text-gray-900">Zonas y Espacios Complementarios</h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {/* Outdoor Spaces */}
        <div className="space-y-4 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-600">Espacios exteriores</h4>
            <Layout className="h-4 w-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="terrace" checked={formData.terrace} onCheckedChange={checked => updateFormData("terrace", !!checked)} />
              <Label htmlFor="terrace" className="text-sm">Terraza</Label>
            </div>
            {formData.terrace && (
              <div className="ml-6 space-y-1.5">
                <Label htmlFor="terraceSize" className="text-sm">Tamaño terraza (m²)</Label>
                <input
                  id="terraceSize"
                  type="number"
                  value={formFormatters.formatNumberDisplay(formData.terraceSize)}
                  onChange={formFormatters.handleNumberInput((value) => updateFormData("terraceSize", value))}
                  className="h-8 w-full rounded border border-gray-300 px-2 text-gray-700 shadow-md border-0"
                  min="0"
                  step="1"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="balconyCount" className="text-sm">Nº balcones</Label>
              <input
                id="balconyCount"
                type="number"
                value={formFormatters.formatNumberDisplay(formData.balconyCount)}
                onChange={formFormatters.handleNumberInput((value) => updateFormData("balconyCount", value))}
                className="h-8 w-full rounded border border-gray-300 px-2 text-gray-700 shadow-md border-0"
                min="0"
                step="1"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="galleryCount" className="text-sm">Nº galerías</Label>
              <input
                id="galleryCount"
                type="number"
                value={formFormatters.formatNumberDisplay(formData.galleryCount)}
                onChange={formFormatters.handleNumberInput((value) => updateFormData("galleryCount", value))}
                className="h-8 w-full rounded border border-gray-300 px-2 text-gray-700 shadow-md border-0"
                min="0"
                step="1"
              />
            </div>
          </div>
        </div>

        {/* Storage Spaces */}
        <div className="space-y-4 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-600">Almacenamiento</h4>
            <Wine className="h-4 w-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="wineCellar" checked={formData.wineCellar} onCheckedChange={checked => updateFormData("wineCellar", !!checked)} />
              <Label htmlFor="wineCellar" className="text-sm">Bodega</Label>
            </div>
            {formData.wineCellar && (
              <div className="ml-6 space-y-1.5">
                <Label htmlFor="wineCellarSize" className="text-sm">Tamaño bodega (m²)</Label>
                <input
                  id="wineCellarSize"
                  type="number"
                  value={formFormatters.formatNumberDisplay(formData.wineCellarSize)}
                  onChange={formFormatters.handleNumberInput((value) => updateFormData("wineCellarSize", value))}
                  className="h-8 w-full rounded border border-gray-300 px-2 text-gray-700 shadow-md border-0"
                  min="0"
                  step="1"
                />
              </div>
            )}
          </div>
        </div>

        {/* Room Sizes */}
        <div className="space-y-4 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-600">Dimensiones</h4>
            <Ruler className="h-4 w-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="livingRoomSize" className="text-sm">Tamaño salón (m²)</Label>
              <input
                id="livingRoomSize"
                type="number"
                value={formFormatters.formatNumberDisplay(formData.livingRoomSize)}
                onChange={formFormatters.handleNumberInput((value) => updateFormData("livingRoomSize", value))}
                className="h-8 w-full rounded border border-gray-300 px-2 text-gray-700 shadow-md border-0"
                min="0"
                step="1"
              />
            </div>
          </div>
        </div>

        {/* Built-in Features */}
        <div className="space-y-4 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-600">Empotrados</h4>
            <BedDouble className="h-4 w-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="builtInWardrobes" className="text-sm">Armarios empotrados</Label>
              <Select value={formData.builtInWardrobes ? "completo" : "ninguno"} onValueChange={value => updateFormData("builtInWardrobes", value === "completo")}>
                <SelectTrigger className="h-8 text-gray-500">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguno">Ninguno</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="completo">Completo</SelectItem>
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
