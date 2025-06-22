"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { ChevronLeft, ChevronRight, Loader } from "lucide-react"
import { motion } from "framer-motion"
import { getListingDetails } from "~/server/queries/listing"
import { updateProperty } from "~/server/queries/properties"
import { updateListing } from "~/server/queries/listing"
import FormSkeleton from "./form-skeleton"

interface FourthPageProps {
  listingId: string
  onNext: () => void
  onBack?: () => void
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
  hasAirConditioning: boolean
  airConditioningType: string
  isFurnished: boolean
  furnitureQuality: string
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
  hasAirConditioning: false,
  airConditioningType: "",
  isFurnished: false,
  furnitureQuality: "",
}

const heatingOptions = [
  "Si, Sin especificar",
  "Gas Individual",
  "Gasóleo Individual",
  "Gas Colectivo",
  "Gasóleo Colectivo",
  "Eléctrica",
  "Tarifa Nocturno",
  "Propano",
  "Suelo Radiante",
  "Eléctrica por Acumulador",
  "Placas Fotovoltaicas",
  "Biomasa",
  "Bomba de calor",
  "Geotermia",
  "Aerotermia"
]

export default function FourthPage({ listingId, onNext, onBack }: FourthPageProps) {
  const [formData, setFormData] = useState<FourthPageFormData>(initialFormData)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [listingDetails, setListingDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch listing details on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch listing details first
        if (listingId) {
          const details = await getListingDetails(Number(listingId))
          setListingDetails(details)
          
          // Pre-populate form with existing data
          setFormData(prev => ({
            ...prev,
            hasElevator: details.hasElevator || false,
            hasGarage: details.hasGarage || false,
            garageType: details.garageType || "",
            garageSpaces: details.garageSpaces || 1,
            garageInBuilding: details.garageInBuilding || false,
            garageNumber: details.garageNumber || "",
            optionalGaragePrice: details.optionalGaragePrice || 0,
            hasStorageRoom: details.hasStorageRoom || false,
            storageRoomSize: details.storageRoomSize || 0,
            storageRoomNumber: details.storageRoomNumber || "",
            optionalStorageRoomPrice: details.optionalStorageRoomPrice || 0,
            hasHeating: details.hasHeating || false,
            heatingType: details.heatingType || "",
            hasAirConditioning: !!details.airConditioningType,
            airConditioningType: details.airConditioningType || "",
            isFurnished: details.isFurnished || false,
            furnitureQuality: details.furnitureQuality || "",
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

  const updateFormData = (field: keyof FourthPageFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = async () => {
    // Clear any previous save errors
    setSaveError(null)

    // Save data in the background without blocking the UI
    try {
      // Update property with equipment and services data
      if (listingDetails?.propertyId) {
        await updateProperty(Number(listingDetails.propertyId), {
          formPosition: 5,
          hasElevator: formData.hasElevator,
          hasGarage: formData.hasGarage,
          garageType: formData.garageType,
          garageSpaces: formData.garageSpaces,
          garageInBuilding: formData.garageInBuilding,
          garageNumber: formData.garageNumber,
          hasStorageRoom: formData.hasStorageRoom,
          storageRoomSize: formData.storageRoomSize,
          storageRoomNumber: formData.storageRoomNumber,
          hasHeating: formData.hasHeating,
          heatingType: formData.heatingType,
          airConditioningType: formData.hasAirConditioning ? formData.airConditioningType : null,
          isFurnished: formData.isFurnished,
          furnitureQuality: formData.furnitureQuality,
        })
      }

      // Update listing with optional prices
      await updateListing(Number(listingId), {
        optionalGaragePrice: Math.round(formData.optionalGaragePrice),
        optionalStorageRoomPrice: Math.round(formData.optionalStorageRoomPrice),
      })

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
      {/* Elevator */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="hasElevator" 
            checked={formData.hasElevator}
            onCheckedChange={(checked) => updateFormData("hasElevator", checked)}
          />
          <Label htmlFor="hasElevator" className="text-sm font-medium text-gray-900">
            Ascensor
          </Label>
        </div>
      </div>

      {/* Garage */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="hasGarage" 
            checked={formData.hasGarage}
            onCheckedChange={(checked) => {
              updateFormData("hasGarage", checked)
              if (!checked) {
                updateFormData("garageType", "")
                updateFormData("garageSpaces", 1)
                updateFormData("garageInBuilding", false)
                updateFormData("garageNumber", "")
              }
            }}
          />
          <Label htmlFor="hasGarage" className="text-sm font-medium text-gray-900">
            Garaje
          </Label>
        </div>
        
        {formData.hasGarage && (
          <div className="ml-6 mt-2 space-y-3 border-l-2 pl-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="garageType" className="text-sm font-medium text-gray-900">
                  Tipo
                </Label>
                <Select 
                  value={formData.garageType} 
                  onValueChange={(value) => updateFormData("garageType", value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abierto">Abierto</SelectItem>
                    <SelectItem value="cerrado">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="garageSpaces" className="text-sm font-medium text-gray-900">
                  Plazas
                </Label>
                <Input
                  id="garageSpaces"
                  type="number"
                  value={formData.garageSpaces}
                  onChange={(e) => updateFormData("garageSpaces", parseInt(e.target.value))}
                  min="1"
                  max="10"
                  className="h-10"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="garageInBuilding" 
                  checked={formData.garageInBuilding}
                  onCheckedChange={(checked) => updateFormData("garageInBuilding", checked)}
                />
                <Label htmlFor="garageInBuilding" className="text-sm font-medium text-gray-900">
                  En edificio
                </Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="garageNumber" className="text-sm font-medium text-gray-900">
                  Nº plaza
                </Label>
                <Input
                  id="garageNumber"
                  value={formData.garageNumber}
                  onChange={(e) => updateFormData("garageNumber", e.target.value)}
                  placeholder="A-123"
                  className="h-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="optionalGaragePrice" className="text-sm font-medium text-gray-900">
                Precio
              </Label>
              <Input
                id="optionalGaragePrice"
                type="number"
                value={Math.round(formData.optionalGaragePrice)}
                onChange={(e) => updateFormData("optionalGaragePrice", Math.round(Number(e.target.value)))}
                min="0"
                step="1"
                placeholder="0"
                className="h-10"
              />
            </div>
          </div>
        )}
      </div>

      {/* Storage Room */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="hasStorageRoom" 
            checked={formData.hasStorageRoom}
            onCheckedChange={(checked) => {
              updateFormData("hasStorageRoom", checked)
              if (!checked) {
                updateFormData("storageRoomSize", 0)
                updateFormData("storageRoomNumber", "")
              }
            }}
          />
          <Label htmlFor="hasStorageRoom" className="text-sm font-medium text-gray-900">
            Trastero
          </Label>
        </div>
        
        {formData.hasStorageRoom && (
          <div className="ml-6 mt-2 space-y-3 border-l-2 pl-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storageRoomSize" className="text-sm font-medium text-gray-900">
                  Tamaño (m²)
                </Label>
                <Input
                  id="storageRoomSize"
                  type="number"
                  value={formData.storageRoomSize}
                  onChange={(e) => updateFormData("storageRoomSize", parseInt(e.target.value))}
                  min="0"
                  step="1"
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="storageRoomNumber" className="text-sm font-medium text-gray-900">
                  Nº trastero
                </Label>
                <Input
                  id="storageRoomNumber"
                  value={formData.storageRoomNumber}
                  onChange={(e) => updateFormData("storageRoomNumber", e.target.value)}
                  placeholder="T-45"
                  className="h-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="optionalStorageRoomPrice" className="text-sm font-medium text-gray-900">
                Precio
              </Label>
              <Input
                id="optionalStorageRoomPrice"
                type="number"
                value={Math.round(formData.optionalStorageRoomPrice)}
                onChange={(e) => updateFormData("optionalStorageRoomPrice", Math.round(Number(e.target.value)))}
                min="0"
                step="1"
                placeholder="0"
                className="h-10"
              />
            </div>
          </div>
        )}
      </div>

      {/* Heating */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="hasHeating" 
            checked={formData.hasHeating}
            onCheckedChange={(checked) => updateFormData("hasHeating", checked)}
          />
          <Label htmlFor="hasHeating" className="text-sm font-medium text-gray-900">
            Calefacción
          </Label>
        </div>
        
        {formData.hasHeating && (
          <div className="ml-6 mt-2">
            <Select 
              value={formData.heatingType} 
              onValueChange={(value) => updateFormData("heatingType", value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Seleccionar tipo de calefacción" />
              </SelectTrigger>
              <SelectContent>
                {heatingOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Air Conditioning */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="hasAirConditioning" 
            checked={formData.hasAirConditioning}
            onCheckedChange={(checked) => {
              updateFormData("hasAirConditioning", checked)
              if (!checked) {
                updateFormData("airConditioningType", "")
              }
            }}
          />
          <Label htmlFor="hasAirConditioning" className="text-sm font-medium text-gray-900">
            Aire acondicionado
          </Label>
        </div>
        
        {formData.hasAirConditioning && (
          <div className="ml-6 mt-2">
            <Select 
              value={formData.airConditioningType} 
              onValueChange={(value) => updateFormData("airConditioningType", value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="central">Central</SelectItem>
                <SelectItem value="split">Split</SelectItem>
                <SelectItem value="portatil">Portátil</SelectItem>
                <SelectItem value="conductos">Conductos</SelectItem>
                <SelectItem value="cassette">Cassette</SelectItem>
                <SelectItem value="ventana">Ventana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Furnished */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="isFurnished" 
            checked={formData.isFurnished}
            onCheckedChange={(checked) => updateFormData("isFurnished", checked)}
          />
          <Label htmlFor="isFurnished" className="text-sm font-medium text-gray-900">
            Amueblado
          </Label>
        </div>
        
        {formData.isFurnished && (
          <div className="ml-6 mt-2">
            <RadioGroup 
              value={formData.furnitureQuality} 
              onValueChange={(value) => updateFormData("furnitureQuality", value)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="basic" id="basic" />
                <Label htmlFor="basic" className="text-sm">Básico</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard" className="text-sm">Estándar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="text-sm">Alta</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="luxury" id="luxury" />
                <Label htmlFor="luxury" className="text-sm">Lujo</Label>
              </div>
            </RadioGroup>
          </div>
        )}
      </div>

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
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={!onBack}
          className="flex items-center space-x-2 h-8"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Anterior</span>
        </Button>

        <Button 
          onClick={handleNext} 
          className="flex items-center space-x-2 h-8"
        >
          <span>Siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
