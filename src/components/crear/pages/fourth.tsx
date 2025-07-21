import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { ChevronLeft, ChevronRight, Building, Car, Package, Thermometer, Wind, Sofa, Droplet } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { updateProperty } from "~/server/queries/properties"
import { updateListing } from "~/server/queries/listing"
import { formFormatters } from "~/lib/utils"
import FormSkeleton from "./form-skeleton"

interface FourthPageProps {
  listingId: string
  globalFormData: any
  onNext: () => void
  onBack?: () => void
  refreshListingDetails?: () => void
}

// Form data interface for fourth page
interface FourthPageFormData {
  hasElevator: boolean
  hasGarage: boolean
  garageType: string
  garageSpaces: number
  garageInBuilding: boolean
  garageNumber: string
  optionalGaragePrice: number
  hasStorageRoom: boolean
  storageRoomSize: number
  storageRoomNumber: string
  optionalStorageRoomPrice: number
  hasHeating: boolean
  heatingType: string
  hasHotWater: boolean
  hotWaterType: string
  hasAirConditioning: boolean
  airConditioningType: string
  isFurnished: boolean
  furnitureQuality: string
  oven: boolean
  microwave: boolean
  washingMachine: boolean
  fridge: boolean
  tv: boolean
  stoneware: boolean
}

const initialFormData: FourthPageFormData = {
  hasElevator: false,
  hasGarage: false,
  garageType: "",
  garageSpaces: 1,
  garageInBuilding: false,
  garageNumber: "",
  optionalGaragePrice: 0,
  hasStorageRoom: false,
  storageRoomSize: 0,
  storageRoomNumber: "",
  optionalStorageRoomPrice: 0,
  hasHeating: false,
  heatingType: "",
  hasHotWater: false,
  hotWaterType: "",
  hasAirConditioning: false,
  airConditioningType: "",
  isFurnished: false,
  furnitureQuality: "",
  oven: false,
  microwave: false,
  washingMachine: false,
  fridge: false,
  tv: false,
  stoneware: false,
}

const heatingOptions = [
  { id: 1, label: "Gas natural" },
  { id: 2, label: "Eléctrico" },
  { id: 3, label: "Gasóleo" },
  { id: 4, label: "Butano" },
  { id: 5, label: "Propano" },
  { id: 6, label: "Solar" }
]

const airConditioningOptions = [
  { value: "central", label: "Central" },
  { value: "split", label: "Split" },
  { value: "portatil", label: "Portátil" },
  { value: "conductos", label: "Conductos" },
  { value: "cassette", label: "Cassette" },
  { value: "ventana", label: "Ventana" },
]

const furnitureQualityOptions = [
  { value: "basic", label: "Básico", color: "bg-gray-500" },
  { value: "standard", label: "Estándar", color: "bg-gray-600" },
  { value: "high", label: "Alta", color: "bg-gray-700" },
  { value: "luxury", label: "Lujo", color: "bg-gray-900" },
]

export default function FourthPage({ listingId, globalFormData, onNext, onBack, refreshListingDetails }: FourthPageProps) {
  const [formData, setFormData] = useState<FourthPageFormData>(initialFormData)
  const [propertyType, setPropertyType] = useState<string>("")

  const updateFormData = (field: keyof FourthPageFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle price input with formatting for garage and storage room
  const handleGaragePriceChange = formFormatters.handleNumericPriceInputChange((value) => 
    updateFormData("optionalGaragePrice", value)
  )

  const handleStorageRoomPriceChange = formFormatters.handleNumericPriceInputChange((value) => 
    updateFormData("optionalStorageRoomPrice", value)
  )

  // Handle storage room size with formatting
  const handleStorageRoomSizeChange = formFormatters.handleNumericAreaInputChange((value) => 
    updateFormData("storageRoomSize", value)
  )

  // Use centralized data instead of fetching
  useEffect(() => {
    if (globalFormData?.listingDetails) {
      const details = globalFormData.listingDetails
      setPropertyType(details.propertyType ?? "")
      
      // For solar properties, skip this page entirely
      if (details.propertyType === "solar") {
        onNext()
        return
      }
      
      // For garage properties, set garage as always enabled
      if (details.propertyType === "garage") {
        setFormData(prev => ({
          ...prev,
          hasGarage: true, // Always enabled for garage properties
          garageType: details.garageType ?? "",
          garageSpaces: details.garageSpaces ?? 1,
          garageInBuilding: details.garageInBuilding ?? false,
          garageNumber: details.garageNumber ?? "",
          optionalGaragePrice: Number(details.optionalGaragePrice) ?? 0,
        }))
        return
      }
      
      // Pre-populate form with existing data for other property types
      setFormData(prev => ({
        ...prev,
        hasElevator: details.hasElevator ?? false,
        hasGarage: details.hasGarage ?? false,
        garageType: details.garageType ?? "",
        garageSpaces: details.garageSpaces ?? 1,
        garageInBuilding: details.garageInBuilding ?? false,
        garageNumber: details.garageNumber ?? "",
        optionalGaragePrice: Number(details.optionalGaragePrice) ?? 0,
        hasStorageRoom: details.hasStorageRoom ?? false,
        storageRoomSize: details.storageRoomSize ?? 0,
        storageRoomNumber: details.storageRoomNumber ?? "",
        optionalStorageRoomPrice: Number(details.optionalStorageRoomPrice) ?? 0,
        hasHeating: details.hasHeating ?? false,
        heatingType: details.heatingType ?? "",
        hasHotWater: details.hasHotWater ?? false,
        hotWaterType: details.hotWaterType ?? "",
        hasAirConditioning: !!details.airConditioningType,
        airConditioningType: details.airConditioningType ?? "",
        isFurnished: details.isFurnished ?? false,
        furnitureQuality: details.furnitureQuality ?? "",
        oven: details.oven ?? false,
        microwave: details.microwave ?? false,
        washingMachine: details.washingMachine ?? false,
        fridge: details.fridge ?? false,
        tv: details.tv ?? false,
        stoneware: details.stoneware ?? false,
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
    Promise.all([
      // Update property with equipment and services data
      globalFormData?.listingDetails?.propertyId ? (async () => {
        const updateData: any = {
          hasElevator: formData.hasElevator,
          // Garage data - only save if hasGarage is true
          hasGarage: formData.hasGarage,
          garageType: formData.hasGarage ? formData.garageType : "",
          garageSpaces: formData.hasGarage ? formData.garageSpaces : 1,
          garageInBuilding: formData.hasGarage ? formData.garageInBuilding : false,
          garageNumber: formData.hasGarage ? formData.garageNumber : "",
          // Storage room data - only save if hasStorageRoom is true
          hasStorageRoom: formData.hasStorageRoom,
          storageRoomSize: formData.hasStorageRoom ? formData.storageRoomSize : 0,
          storageRoomNumber: formData.hasStorageRoom ? formData.storageRoomNumber : "",
          // Heating data - only save if hasHeating is true
          hasHeating: formData.hasHeating,
          heatingType: formData.hasHeating ? formData.heatingType : "",
          // Hot water data - only save if hasHotWater is true
          hasHotWater: formData.hasHotWater,
          hotWaterType: formData.hasHotWater ? formData.hotWaterType : "",
          // Air conditioning data - only save if hasAirConditioning is true
          airConditioningType: formData.hasAirConditioning ? formData.airConditioningType : "",
        }

        // Only update formPosition if current position is lower than 5
        if (!globalFormData.listingDetails.formPosition || globalFormData.listingDetails.formPosition < 5) {
          updateData.formPosition = 5
        }

        updateProperty(Number(globalFormData.listingDetails.propertyId), updateData)
      })() : Promise.resolve(),

      // Update listing with optional prices and furniture data
      updateListing(Number(listingId), {
        optionalGaragePrice: formData.hasGarage ? Math.round(formData.optionalGaragePrice).toString() : "0",
        optionalStorageRoomPrice: formData.hasStorageRoom ? Math.round(formData.optionalStorageRoomPrice).toString() : "0",
        // Furniture data - only save if isFurnished is true
        isFurnished: formData.isFurnished,
        furnitureQuality: formData.isFurnished ? formData.furnitureQuality : "",
        oven: formData.isFurnished ? formData.oven : false,
        microwave: formData.isFurnished ? formData.microwave : false,
        washingMachine: formData.isFurnished ? formData.washingMachine : false,
        fridge: formData.isFurnished ? formData.fridge : false,
        tv: formData.isFurnished ? formData.tv : false,
        stoneware: formData.isFurnished ? formData.stoneware : false,
      })
    ]).then(() => {
      // Refresh global data after successful save
      refreshListingDetails?.()
    }).catch(error => {
      console.error("Error saving form data:", error)
      // Silent error - user doesn't know it failed
      // Could implement retry logic here if needed
    })
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
      className="space-y-4"
    >
      <motion.div
        className="space-y-1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-gray-900">Servicios y equipamiento</h2>
      </motion.div>

      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {/* Elevator - Hide for garage properties */}
        {propertyType !== "garage" && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateFormData("hasElevator", !formData.hasElevator)}
            className={`
              w-full p-3 rounded-lg transition-all duration-200 relative overflow-hidden
              ${
                formData.hasElevator
                  ? "bg-gray-900 text-white border border-gray-900 shadow-sm"
                  : "bg-white text-gray-700 shadow-md"
              }
            `}
          >
            <motion.div
              className="absolute inset-0 bg-gray-800"
              initial={{ scale: 0, opacity: 0 }}
              animate={formData.hasElevator ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ borderRadius: "inherit" }}
            />
            <div className="flex items-center space-x-3 relative z-10">
              <Building className="h-4 w-4" />
              <span className="text-sm font-medium">Ascensor</span>
            </div>
            {formData.hasElevator && (
              <span className="absolute top-3.5 right-2 w-4 h-4 flex items-center justify-center rounded-full bg-white/90 border border-gray-300 z-20">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 6.5L5.2 8.5L9 4.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </motion.button>
        )}

        {/* Garage */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {propertyType === "garage" ? (
            // For garage properties, show static header
            <div className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-900 shadow-sm">
              <div className="flex items-center space-x-3">
                <Car className="h-4 w-4" />
                <span className="text-sm font-medium">Garaje</span>
              </div>
            </div>
          ) : (
            // For other properties, show toggle button
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const newValue = !formData.hasGarage
                updateFormData("hasGarage", newValue)
                if (!newValue) {
                  updateFormData("garageType", "")
                  updateFormData("garageSpaces", 1)
                  updateFormData("garageInBuilding", false)
                  updateFormData("garageNumber", "")
                  updateFormData("optionalGaragePrice", 0)
                }
              }}
              className={`
                w-full p-3 rounded-lg transition-all duration-200 relative overflow-hidden
                ${
                  formData.hasGarage
                    ? "bg-gray-900 text-white border border-gray-900 shadow-sm"
                    : "bg-white text-gray-700 shadow-md"
                }
              `}
            >
              <motion.div
                className="absolute inset-0 bg-gray-800"
                initial={{ scale: 0, opacity: 0 }}
                animate={formData.hasGarage ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ borderRadius: "inherit" }}
              />
              <div className="flex items-center space-x-3 relative z-10">
                <Car className="h-4 w-4" />
                <span className="text-sm font-medium">Garaje</span>
              </div>
              {formData.hasGarage && (
                <span className="absolute top-3.5 right-2 w-4 h-4 flex items-center justify-center rounded-full bg-white/90 border border-gray-300 z-20">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 6.5L5.2 8.5L9 4.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </motion.button>
          )}
          
          {(formData.hasGarage || propertyType === "garage") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-6 space-y-3 border-l-2 pl-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-600">Tipo</Label>
                  <Select 
                    value={formData.garageType} 
                    onValueChange={(value) => updateFormData("garageType", value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abierto">Abierto</SelectItem>
                      <SelectItem value="cerrado">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-600">Plazas</Label>
                  <Input
                    type="number"
                    value={formData.garageSpaces === 0 ? '' : formData.garageSpaces}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateFormData("garageSpaces", val === '' ? '' : parseInt(val));
                    }}
                    min="1"
                    max="10"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-600">Ubicación</Label>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateFormData("garageInBuilding", !formData.garageInBuilding)}
                    className={`
                      w-full p-2 text-xs rounded border transition-all duration-200 relative overflow-hidden
                      ${
                        formData.garageInBuilding
                          ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      }
                    `}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gray-800"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={formData.garageInBuilding ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      style={{ borderRadius: "inherit" }}
                    />
                    <span className="relative z-10">En edificio</span>
                  </motion.button>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-600">Nº plaza</Label>
                  <Input
                    value={formData.garageNumber}
                    onChange={(e) => updateFormData("garageNumber", e.target.value)}
                    placeholder="A-123"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-600">{globalFormData?.listingDetails?.listingType === 'Rent' ? 'Precio €/mes' : 'Precio'}</Label>
                <Input
                  type="text"
                  value={formFormatters.formatPriceInput(formData.optionalGaragePrice)}
                  onChange={handleGaragePriceChange}
                  placeholder={globalFormData?.listingDetails?.listingType === 'Rent' ? '0 €/mes' : '0 €'}
                  className="h-8 text-xs"
                />
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Storage Room - Hide for garage properties */}
        {propertyType !== "garage" && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const newValue = !formData.hasStorageRoom
                updateFormData("hasStorageRoom", newValue)
                if (!newValue) {
                  updateFormData("storageRoomSize", 0)
                  updateFormData("storageRoomNumber", "")
                  updateFormData("optionalStorageRoomPrice", 0)
                }
              }}
              className={`
                w-full p-3 rounded-lg transition-all duration-200 relative overflow-hidden
                ${
                  formData.hasStorageRoom
                    ? "bg-gray-900 text-white border border-gray-900 shadow-sm"
                    : "bg-white text-gray-700 shadow-md"
                }
              `}
            >
              <motion.div
                className="absolute inset-0 bg-gray-800"
                initial={{ scale: 0, opacity: 0 }}
                animate={formData.hasStorageRoom ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ borderRadius: "inherit" }}
              />
              <div className="flex items-center space-x-3 relative z-10">
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">Trastero</span>
              </div>
              {formData.hasStorageRoom && (
                <span className="absolute top-3.5 right-2 w-4 h-4 flex items-center justify-center rounded-full bg-white/90 border border-gray-300 z-20">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 6.5L5.2 8.5L9 4.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </motion.button>
            
            {formData.hasStorageRoom && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-6 space-y-3 border-l-2 pl-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-600">Tamaño (m²)</Label>
                    <Input
                      type="text"
                      value={formFormatters.formatAreaInput(formData.storageRoomSize)}
                      onChange={handleStorageRoomSizeChange}
                      placeholder="Metros cuadrados"
                      className="h-8 text-xs"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-600">Nº trastero</Label>
                    <Input
                      value={formData.storageRoomNumber}
                      onChange={(e) => updateFormData("storageRoomNumber", e.target.value)}
                      placeholder="T-45"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-600">{globalFormData?.listingDetails?.listingType === 'Rent' ? 'Precio €/mes' : 'Precio'}</Label>
                  <Input
                    type="text"
                    value={formFormatters.formatPriceInput(formData.optionalStorageRoomPrice)}
                    onChange={handleStorageRoomPriceChange}
                    placeholder={globalFormData?.listingDetails?.listingType === 'Rent' ? '0 €/mes' : '0 €'}
                    className="h-8 text-xs"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Heating - Hide for garage properties */}
        {propertyType !== "garage" && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const newValue = !formData.hasHeating
                updateFormData("hasHeating", newValue)
                if (!newValue) updateFormData("heatingType", "")
              }}
              className={`
                w-full p-3 rounded-lg transition-all duration-200 relative overflow-hidden
                ${
                  formData.hasHeating
                    ? "bg-gray-900 text-white border border-gray-900 shadow-sm"
                    : "bg-white text-gray-700 shadow-md"
                }
              `}
            >
              <motion.div
                className="absolute inset-0 bg-gray-800"
                initial={{ scale: 0, opacity: 0 }}
                animate={formData.hasHeating ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ borderRadius: "inherit" }}
              />
              <div className="flex items-center space-x-3 relative z-10">
                <Thermometer className="h-4 w-4" />
                <span className="text-sm font-medium">Calefacción</span>
              </div>
              {formData.hasHeating && (
                <span className="absolute top-3.5 right-2 w-4 h-4 flex items-center justify-center rounded-full bg-white/90 border border-gray-300 z-20">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 6.5L5.2 8.5L9 4.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </motion.button>
            
            {formData.hasHeating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-6 space-y-3 border-l-2 pl-4"
              >
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-600">Tipo de calefacción</Label>
                  <Select
                    value={formData.heatingType}
                    onValueChange={(value) => updateFormData("heatingType", value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Seleccionar tipo de calefacción" />
                    </SelectTrigger>
                    <SelectContent>
                      {heatingOptions.map(option => (
                        <SelectItem key={option.id} value={option.id.toString()}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Hot Water - Hide for garage properties */}
        {propertyType !== "garage" && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const newValue = !formData.hasHotWater
                updateFormData("hasHotWater", newValue)
                if (!newValue) updateFormData("hotWaterType", "")
              }}
              className={`
                w-full p-3 rounded-lg transition-all duration-200 relative overflow-hidden
                ${
                  formData.hasHotWater
                    ? "bg-gray-900 text-white border border-gray-900 shadow-sm"
                    : "bg-white text-gray-700 shadow-md"
                }
              `}
            >
              <motion.div
                className="absolute inset-0 bg-gray-800"
                initial={{ scale: 0, opacity: 0 }}
                animate={formData.hasHotWater ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ borderRadius: "inherit" }}
              />
                             <div className="flex items-center space-x-3 relative z-10">
                 <Droplet className="h-4 w-4" />
                 <span className="text-sm font-medium">Agua Caliente</span>
               </div>
              {formData.hasHotWater && (
                <span className="absolute top-3.5 right-2 w-4 h-4 flex items-center justify-center rounded-full bg-white/90 border border-gray-300 z-20">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 6.5L5.2 8.5L9 4.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </motion.button>
            
            {formData.hasHotWater && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-6 space-y-3 border-l-2 pl-4"
              >
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-600">Tipo de agua caliente</Label>
                  <Select
                    value={formData.hotWaterType}
                    onValueChange={(value) => updateFormData("hotWaterType", value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Seleccionar tipo de agua caliente" />
                    </SelectTrigger>
                                         <SelectContent>
                       {heatingOptions.map(option => (
                         <SelectItem key={option.id} value={option.id.toString()}>{option.label}</SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Air Conditioning - Hide for garage properties */}
        {propertyType !== "garage" && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const newValue = !formData.hasAirConditioning
                updateFormData("hasAirConditioning", newValue)
                if (!newValue) {
                  updateFormData("airConditioningType", "")
                }
              }}
              className={`
                w-full p-3 rounded-lg transition-all duration-200 relative overflow-hidden
                ${
                  formData.hasAirConditioning
                    ? "bg-gray-900 text-white border border-gray-900 shadow-sm"
                    : "bg-white text-gray-700 shadow-md"
                }
              `}
            >
              <motion.div
                className="absolute inset-0 bg-gray-800"
                initial={{ scale: 0, opacity: 0 }}
                animate={formData.hasAirConditioning ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ borderRadius: "inherit" }}
              />
              <div className="flex items-center space-x-3 relative z-10">
                <Wind className="h-4 w-4" />
                <span className="text-sm font-medium">Aire acondicionado</span>
              </div>
              {formData.hasAirConditioning && (
                <span className="absolute top-3.5 right-2 w-4 h-4 flex items-center justify-center rounded-full bg-white/90 border border-gray-300 z-20">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 6.5L5.2 8.5L9 4.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </motion.button>
            
            {formData.hasAirConditioning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-6 space-y-3 border-l-2 pl-4"
              >
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-600">Tipo</Label>
                  <Select 
                    value={formData.airConditioningType} 
                    onValueChange={(value) => updateFormData("airConditioningType", value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {airConditioningOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Furnished - Hide for garage properties */}
        {propertyType !== "garage" && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const newValue = !formData.isFurnished
                updateFormData("isFurnished", newValue)
                if (!newValue) {
                  updateFormData("furnitureQuality", "")
                  updateFormData("oven", false)
                  updateFormData("microwave", false)
                  updateFormData("washingMachine", false)
                  updateFormData("fridge", false)
                  updateFormData("tv", false)
                  updateFormData("stoneware", false)
                }
              }}
              className={`
                w-full p-3 rounded-lg transition-all duration-200 relative overflow-hidden
                ${
                  formData.isFurnished
                    ? "bg-gray-900 text-white border border-gray-900 shadow-sm"
                    : "bg-white text-gray-700 shadow-md"
                }
              `}
            >
              <motion.div
                className="absolute inset-0 bg-gray-800"
                initial={{ scale: 0, opacity: 0 }}
                animate={formData.isFurnished ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ borderRadius: "inherit" }}
              />
              <div className="flex items-center space-x-3 relative z-10">
                <Sofa className="h-4 w-4" />
                <span className="text-sm font-medium">Amueblado</span>
              </div>
              {formData.isFurnished && (
                <span className="absolute top-3.5 right-2 w-4 h-4 flex items-center justify-center rounded-full bg-white/90 border border-gray-300 z-20">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 6.5L5.2 8.5L9 4.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </motion.button>
            
            {formData.isFurnished && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-6 space-y-3 border-l-2 pl-4"
              >
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-600">Calidad</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {furnitureQualityOptions.map(option => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateFormData("furnitureQuality", option.value)}
                        className={`
                          w-full p-2 text-xs rounded-md transition-all duration-200 relative overflow-hidden
                          ${
                            formData.furnitureQuality === option.value
                              ? "bg-gray-900 text-white border border-gray-900 shadow-sm"
                              : "bg-white text-gray-700 shadow-md"
                          }
                        `}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gray-800"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={formData.furnitureQuality === option.value ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          style={{ borderRadius: "inherit" }}
                        />
                        <span className="relative z-10">{option.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* New Furniture Items */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-600">Electrodomésticos</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateFormData("oven", !formData.oven)}
                      className={`
                        w-full p-2 text-xs rounded-md transition-all duration-200 relative overflow-hidden
                        ${
                          formData.oven
                            ? "bg-gray-900 text-white border border-gray-900 shadow-sm"
                            : "bg-white text-gray-700 shadow-md"
                        }
                      `}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gray-800"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={formData.oven ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{ borderRadius: "inherit" }}
                      />
                      <span className="relative z-10">Horno</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateFormData("microwave", !formData.microwave)}
                      className={`
                        w-full p-2 text-xs rounded-md transition-all duration-200 relative overflow-hidden
                        ${
                          formData.microwave
                            ? "bg-gray-900 text-white border border-gray-900 shadow-sm"
                            : "bg-white text-gray-700 shadow-md"
                        }
                      `}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gray-800"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={formData.microwave ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{ borderRadius: "inherit" }}
                      />
                      <span className="relative z-10">Microondas</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateFormData("washingMachine", !formData.washingMachine)}
                      className={`
                        w-full p-2 text-xs rounded-md transition-all duration-200 relative overflow-hidden
                        ${
                          formData.washingMachine
                            ? "bg-gray-900 text-white border border-gray-900 shadow-sm"
                            : "bg-white text-gray-700 shadow-md"
                        }
                      `}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gray-800"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={formData.washingMachine ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{ borderRadius: "inherit" }}
                      />
                      <span className="relative z-10">Lavadora</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateFormData("fridge", !formData.fridge)}
                      className={`
                        w-full p-2 text-xs rounded-md transition-all duration-200 relative overflow-hidden
                        ${
                          formData.fridge
                            ? "bg-gray-900 text-white border border-gray-900 shadow-sm"
                            : "bg-white text-gray-700 shadow-md"
                        }
                      `}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gray-800"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={formData.fridge ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{ borderRadius: "inherit" }}
                      />
                      <span className="relative z-10">Frigorífico</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateFormData("tv", !formData.tv)}
                      className={`
                        w-full p-2 text-xs rounded-md transition-all duration-200 relative overflow-hidden
                        ${
                          formData.tv
                            ? "bg-gray-900 text-white border border-gray-900 shadow-sm"
                            : "bg-white text-gray-700 shadow-md"
                        }
                      `}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gray-800"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={formData.tv ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{ borderRadius: "inherit" }}
                      />
                      <span className="relative z-10">TV</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateFormData("stoneware", !formData.stoneware)}
                      className={`
                        w-full p-2 text-xs rounded-md transition-all duration-200 relative overflow-hidden
                        ${
                          formData.stoneware
                            ? "bg-gray-900 text-white border border-gray-900 shadow-sm"
                            : "bg-white text-gray-700 shadow-md"
                        }
                      `}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gray-800"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={formData.stoneware ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{ borderRadius: "inherit" }}
                      />
                      <span className="relative z-10">Vajilla</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>

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
