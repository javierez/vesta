"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Checkbox } from "~/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Shield, Bell, Video, UserCheck, Users, Building2, Accessibility, Satellite, Layers, CookingPot, Soup, Refrigerator, Droplets } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { updateProperty } from "~/server/queries/properties"
import FormSkeleton from "./form-skeleton"
import { FloatingLabelInput } from "~/components/ui/floating-label-input"

interface SixthPageProps {
  listingId: string
  globalFormData: any
  onNext: () => void
  onBack?: () => void
  refreshListingDetails?: () => void
}

interface SixthPageFormData {
  securityDoor: boolean
  alarm: boolean
  videoIntercom: boolean
  securityGuard: boolean
  conciergeService: boolean
  vpo: boolean
  disabledAccessible: boolean
  satelliteDish: boolean
  doubleGlazing: boolean
  kitchenType: string
  openKitchen: boolean
  frenchKitchen: boolean
  furnishedKitchen: boolean
  pantry: boolean
  hotWaterType: string
}

const initialFormData: SixthPageFormData = {
  securityDoor: false,
  alarm: false,
  videoIntercom: false,
  securityGuard: false,
  conciergeService: false,
  vpo: false,
  disabledAccessible: false,
  satelliteDish: false,
  doubleGlazing: false,
  kitchenType: "",
  openKitchen: false,
  frenchKitchen: false,
  furnishedKitchen: false,
  pantry: false,
  hotWaterType: "",
}

const kitchenTypeOptions = [
  { value: "gas", label: "Gas" },
  { value: "induccion", label: "Inducción" },
  { value: "vitroceramica", label: "Vitrocerámica" },
  { value: "carbon", label: "Carbón" },
  { value: "electrico", label: "Eléctrico" },
  { value: "mixto", label: "Mixto" },
]

const hotWaterTypeOptions = [
  { value: "individual", label: "Individual" },
  { value: "central", label: "Central" },
  { value: "solar", label: "Solar" },
]

export default function SixthPage({ listingId, globalFormData, onNext, onBack, refreshListingDetails }: SixthPageProps) {
  const [formData, setFormData] = useState<SixthPageFormData>(initialFormData)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [propertyType, setPropertyType] = useState<string>("")

  const updateFormData = (field: keyof SixthPageFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Use centralized data instead of fetching
  useEffect(() => {
    if (globalFormData?.listingDetails) {
      const details = globalFormData.listingDetails
      setPropertyType(details.propertyType || "")
      
      // For solar properties, skip this page entirely
      if (details.propertyType === "solar") {
        onNext()
        return
      }
      
      setFormData(prev => ({
        ...prev,
        securityDoor: details.securityDoor || false,
        alarm: details.alarm || false,
        videoIntercom: details.videoIntercom || false,
        securityGuard: details.securityGuard || false,
        conciergeService: details.conciergeService || false,
        vpo: details.vpo || false,
        disabledAccessible: details.disabledAccessible || false,
        satelliteDish: details.satelliteDish || false,
        doubleGlazing: details.doubleGlazing || false,
        kitchenType: details.kitchenType || "",
        openKitchen: details.openKitchen || false,
        frenchKitchen: details.frenchKitchen || false,
        furnishedKitchen: details.furnishedKitchen || false,
        pantry: details.pantry || false,
        hotWaterType: details.hotWaterType || "",
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
        disabledAccessible: formData.disabledAccessible,
        vpo: formData.vpo,
        videoIntercom: formData.videoIntercom,
        conciergeService: formData.conciergeService,
        securityGuard: formData.securityGuard,
        satelliteDish: formData.satelliteDish,
        doubleGlazing: formData.doubleGlazing,
        alarm: formData.alarm,
        securityDoor: formData.securityDoor,
        kitchenType: formData.kitchenType,
        openKitchen: formData.openKitchen,
        frenchKitchen: formData.frenchKitchen,
        furnishedKitchen: formData.furnishedKitchen,
        pantry: formData.pantry,
        hotWaterType: formData.hotWaterType,
      }

      // Only update formPosition if current position is lower than 7
      if (!globalFormData.listingDetails.formPosition || globalFormData.listingDetails.formPosition < 7) {
        updateData.formPosition = 7
      }

      console.log("Saving sixth page data:", updateData) // Debug log

      updateProperty(Number(globalFormData.listingDetails.propertyId), updateData).then(() => {
        console.log("Sixth page data saved successfully") // Debug log
        // Refresh global data after successful save
        refreshListingDetails?.()
      }).catch((error: any) => {
        console.error("Error saving form data:", error)
        // Silent error - user doesn't know it failed
        // Could implement retry logic here if needed
      })
    } else {
      console.warn("No propertyId found in globalFormData.listingDetails for sixth page") // Debug log
    }
  }

  // Show loading only if globalFormData is not ready
  if (!globalFormData?.listingDetails) {
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
        <h2 className="text-lg font-semibold text-gray-900">Características adicionales</h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {/* Security Features */}
        <div className="space-y-4 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-600">Seguridad</h4>
            <Shield className="h-4 w-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="securityDoor" checked={formData.securityDoor} onCheckedChange={checked => updateFormData("securityDoor", !!checked)} />
              <Label htmlFor="securityDoor" className="text-sm">Puerta blindada</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="alarm" checked={formData.alarm} onCheckedChange={checked => updateFormData("alarm", !!checked)} />
              <Label htmlFor="alarm" className="text-sm">Alarma</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="videoIntercom" checked={formData.videoIntercom} onCheckedChange={checked => updateFormData("videoIntercom", !!checked)} />
              <Label htmlFor="videoIntercom" className="text-sm">Videoportero</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="securityGuard" checked={formData.securityGuard} onCheckedChange={checked => updateFormData("securityGuard", !!checked)} />
              <Label htmlFor="securityGuard" className="text-sm">Vigilante</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="conciergeService" checked={formData.conciergeService} onCheckedChange={checked => updateFormData("conciergeService", !!checked)} />
              <Label htmlFor="conciergeService" className="text-sm">Conserjería</Label>
            </div>
          </div>
        </div>

        {/* Building Features */}
        <div className="space-y-4 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-600">Características del edificio</h4>
            <Building2 className="h-4 w-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="vpo" checked={formData.vpo} onCheckedChange={checked => updateFormData("vpo", !!checked)} />
              <Label htmlFor="vpo" className="text-sm">VPO</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="disabledAccessible" checked={formData.disabledAccessible} onCheckedChange={checked => updateFormData("disabledAccessible", !!checked)} />
              <Label htmlFor="disabledAccessible" className="text-sm">Accesible</Label>
            </div>
            {propertyType !== "garage" && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox id="satelliteDish" checked={formData.satelliteDish} onCheckedChange={checked => updateFormData("satelliteDish", !!checked)} />
                  <Label htmlFor="satelliteDish" className="text-sm">Antena</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="doubleGlazing" checked={formData.doubleGlazing} onCheckedChange={checked => updateFormData("doubleGlazing", !!checked)} />
                  <Label htmlFor="doubleGlazing" className="text-sm">Doble acristalamiento</Label>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Kitchen Features - Hide for garage properties */}
        {propertyType !== "garage" && (
          <div className="space-y-4 p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-600">Cocina</h4>
              <CookingPot className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="kitchenType" className="text-sm">Tipo de cocina</Label>
                <Select value={formData.kitchenType} onValueChange={value => updateFormData("kitchenType", value)}>
                  <SelectTrigger className="h-8 text-gray-500">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {kitchenTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="openKitchen" checked={formData.openKitchen} onCheckedChange={checked => updateFormData("openKitchen", !!checked)} />
                <Label htmlFor="openKitchen" className="text-sm">Cocina abierta</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="frenchKitchen" checked={formData.frenchKitchen} onCheckedChange={checked => updateFormData("frenchKitchen", !!checked)} />
                <Label htmlFor="frenchKitchen" className="text-sm">Cocina francesa</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="furnishedKitchen" checked={formData.furnishedKitchen} onCheckedChange={checked => updateFormData("furnishedKitchen", !!checked)} />
                <Label htmlFor="furnishedKitchen" className="text-sm">Cocina amueblada</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="pantry" checked={formData.pantry} onCheckedChange={checked => updateFormData("pantry", !!checked)} />
                <Label htmlFor="pantry" className="text-sm">Despensa</Label>
              </div>
            </div>
          </div>
        )}

        {/* Utilities - Hide for garage properties */}
        {propertyType !== "garage" && (
          <div className="space-y-4 p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-600">Servicios</h4>
              <Droplets className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="hotWaterType" className="text-sm">Agua caliente</Label>
                <Select value={formData.hotWaterType} onValueChange={value => updateFormData("hotWaterType", value)}>
                  <SelectTrigger className="h-8 text-gray-500">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotWaterTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
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
