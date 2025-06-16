'use client'

import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Checkbox } from "~/components/ui/checkbox"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { useState, useEffect } from "react"
import { Building2, Star, ChevronDown, ExternalLink, User, UserCircle, Save, Circle } from "lucide-react"
import { getAllAgents } from "~/server/queries/listing"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Textarea } from "~/components/ui/textarea"
import { useRouter, useSearchParams } from "next/navigation"
import { PropertyTitle } from "./common/property-title"
import { updateProperty } from "~/server/queries/properties"
import { updateListing } from "~/server/queries/listing"
import { toast } from "sonner"
import { ModernSaveIndicator } from "./common/modern-save-indicator"

type SaveState = "idle" | "modified" | "saving" | "saved" | "error"

interface ModuleState {
  saveState: SaveState
  hasChanges: boolean
  lastSaved?: Date
}

type ModuleName = "basicInfo" | "propertyDetails" | "location" | "features" | "description" | "contactInfo" | "orientation" | "additionalCharacteristics" | "premiumFeatures" | "additionalSpaces" | "materials" | "rentalProperties"

interface PropertyCharacteristicsFormLocalProps {
  listing: any // We'll type this properly later
}

export function PropertyCharacteristicsFormLocal({ listing }: PropertyCharacteristicsFormLocalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check if property type has been changed
  const hasPropertyTypeChanged = listing.propertyType && searchParams.get('type') && 
    listing.propertyType !== searchParams.get('type')
  
  // Module states with new save state
  const [moduleStates, setModuleStates] = useState<Record<ModuleName, ModuleState>>(() => {
    // Initialize with property type change detection
    const initialState = {
      basicInfo: { saveState: "idle" as SaveState, hasChanges: hasPropertyTypeChanged },
      propertyDetails: { saveState: "idle" as SaveState, hasChanges: false },
      location: { saveState: "idle" as SaveState, hasChanges: false },
      features: { saveState: "idle" as SaveState, hasChanges: false },
      description: { saveState: "idle" as SaveState, hasChanges: false },
      contactInfo: { saveState: "idle" as SaveState, hasChanges: false },
      orientation: { saveState: "idle" as SaveState, hasChanges: false },
      additionalCharacteristics: { saveState: "idle" as SaveState, hasChanges: false },
      premiumFeatures: { saveState: "idle" as SaveState, hasChanges: false },
      additionalSpaces: { saveState: "idle" as SaveState, hasChanges: false },
      materials: { saveState: "idle" as SaveState, hasChanges: false },
      rentalProperties: { saveState: "idle" as SaveState, hasChanges: false }
    }
    
    // Set basicInfo to modified if property type changed
    if (hasPropertyTypeChanged) {
      initialState.basicInfo.saveState = "modified"
    }
    
    return initialState
  })

  // Update module states when property type change is detected
  useEffect(() => {
    if (hasPropertyTypeChanged) {
      setModuleStates(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          saveState: "modified",
          hasChanges: true
        }
      }))
    }
  }, [hasPropertyTypeChanged])

  // Function to update module state
  const updateModuleState = (moduleName: ModuleName, hasChanges: boolean) => {
    setModuleStates(prev => {
      const currentState = prev[moduleName] || { saveState: "idle" as SaveState, hasChanges: false }
      return {
        ...prev,
        [moduleName]: {
          ...currentState,
          saveState: hasChanges ? "modified" : "idle",
          hasChanges,
          lastSaved: currentState.lastSaved
        }
      }
    })
  }

  // Function to save module data
  const saveModule = async (moduleName: ModuleName) => {
    setModuleStates(prev => {
      const currentState = prev[moduleName] || { saveState: "idle" as SaveState, hasChanges: false }
      return {
        ...prev,
        [moduleName]: {
          ...currentState,
          saveState: "saving",
          hasChanges: currentState.hasChanges
        }
      }
    })

    try {
      const propertyId = Number(listing.propertyId)
      const listingId = Number(listing.listingId)

      let propertyData = {}
      let listingData = {}

      switch (moduleName) {
        case 'basicInfo':
          listingData = {
            listingType,
            isBankOwned,
            price: (document.getElementById('price') as HTMLInputElement)?.value
          }
          propertyData = {
            propertyType: 'local'
          }
          break

        case 'propertyDetails':
          propertyData = {
            squareMeter: Number((document.getElementById('squareMeter') as HTMLInputElement)?.value),
            yearBuilt: Number((document.getElementById('yearBuilt') as HTMLInputElement)?.value),
            isFurnished,
            hasHeating: isHeating,
            heatingType,
            airConditioningType: isAirConditioning ? airConditioningType : null
          }
          break

        case 'location':
          propertyData = {
            street: (document.getElementById('street') as HTMLInputElement)?.value,
            addressDetails: (document.getElementById('addressDetails') as HTMLInputElement)?.value,
            postalCode: (document.getElementById('postalCode') as HTMLInputElement)?.value,
            city,
            province,
            municipality
          }
          break

        case 'features':
          propertyData = {
            hasGarage,
            garageType,
            garageSpaces,
            garageInBuilding,
            garageNumber,
            hasStorageRoom,
            storageRoomSize,
            storageRoomNumber
          }
          break

        case 'orientation':
          propertyData = {
            exterior: isExterior,
            bright: isBright,
            orientation
          }
          break

        case 'additionalCharacteristics':
          propertyData = {
            disabledAccessible,
            videoIntercom,
            conciergeService,
            securityGuard,
            alarm,
            securityDoor
          }
          break

        case 'description':
          propertyData = {
            description: (document.getElementById('description') as HTMLTextAreaElement)?.value
          }
          break
      }

      // Update property if there's property data
      if (Object.keys(propertyData).length > 0) {
        await updateProperty(propertyId, propertyData)
      }

      // Update listing if there's listing data
      if (Object.keys(listingData).length > 0) {
        await updateListing(listingId, listingData)
      }

      setModuleStates(prev => {
        const currentState = prev[moduleName] || { saveState: "idle" as SaveState, hasChanges: false }
        return {
          ...prev,
          [moduleName]: {
            ...currentState,
            saveState: "saved",
            hasChanges: false,
            lastSaved: new Date()
          }
        }
      })

      toast.success('Cambios guardados correctamente')

      // Reset to idle state after 2 seconds
      setTimeout(() => {
        setModuleStates(prev => {
          const currentState = prev[moduleName] || { saveState: "idle" as SaveState, hasChanges: false }
          return {
            ...prev,
            [moduleName]: {
              ...currentState,
              saveState: "idle",
              hasChanges: currentState.hasChanges
            }
          }
        })
      }, 2000)

    } catch (error) {
      console.error(`Error saving ${moduleName}:`, error)
      
      setModuleStates(prev => {
        const currentState = prev[moduleName] || { saveState: "idle" as SaveState, hasChanges: false }
        return {
          ...prev,
          [moduleName]: {
            ...currentState,
            saveState: "error",
            hasChanges: currentState.hasChanges
          }
        }
      })

      toast.error('Error al guardar los cambios')

      // Reset to modified state after 3 seconds if there are changes
      setTimeout(() => {
        setModuleStates(prev => {
          const currentState = prev[moduleName] || { saveState: "idle" as SaveState, hasChanges: false }
          return {
            ...prev,
            [moduleName]: {
              ...currentState,
              saveState: currentState.hasChanges ? "modified" : "idle",
              hasChanges: currentState.hasChanges
            }
          }
        })
      }, 3000)
    }
  }

  const getCardStyles = (moduleName: ModuleName) => {
    const state = moduleStates[moduleName]?.saveState

    switch (state) {
      case "modified":
        return "ring-2 ring-yellow-500/20 shadow-lg shadow-yellow-500/10 border-yellow-500/20"
      case "saving":
        return "ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10 border-amber-500/20"
      case "saved":
        return "ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10 border-emerald-500/20"
      case "error":
        return "ring-2 ring-red-500/20 shadow-lg shadow-red-500/10 border-red-500/20"
      default:
        return "hover:shadow-lg transition-all duration-300"
    }
  }

  const [listingType, setListingType] = useState<string>(
    listing.listingType || 'Sale' // Default to 'Sale' if none selected
  )
  const [isBankOwned, setIsBankOwned] = useState(listing.isBankOwned ?? false)
  const [agents, setAgents] = useState<Array<{ id: number; name: string }>>([])
  const [isFurnished, setIsFurnished] = useState(listing.isFurnished ?? false)
  const [isHeating, setIsHeating] = useState(listing.hasHeating ?? false)
  const [heatingType, setHeatingType] = useState(listing.heatingType ?? "")
  const [isAirConditioning, setIsAirConditioning] = useState(!!listing.airConditioningType)
  const [airConditioningType, setAirConditioningType] = useState(listing.airConditioningType ?? "")
  const [isExterior, setIsExterior] = useState(listing.exterior ?? false)
  const [orientation, setOrientation] = useState(listing.orientation ?? "")
  const [isBright, setIsBright] = useState(listing.bright ?? false)
  const [hasGarage, setHasGarage] = useState(listing.hasGarage ?? false)
  const [garageType, setGarageType] = useState(listing.garageType ?? "")
  const [garageSpaces, setGarageSpaces] = useState(listing.garageSpaces ?? 1)
  const [garageInBuilding, setGarageInBuilding] = useState(listing.garageInBuilding ?? false)
  const [garageNumber, setGarageNumber] = useState(listing.garageNumber ?? "")
  const [hasStorageRoom, setHasStorageRoom] = useState(listing.hasStorageRoom ?? false)
  const [storageRoomSize, setStorageRoomSize] = useState(listing.storageRoomSize ?? 0)
  const [storageRoomNumber, setStorageRoomNumber] = useState(listing.storageRoomNumber ?? "")
  const [appliancesIncluded, setAppliancesIncluded] = useState(listing.appliancesIncluded ?? false)
  const [disabledAccessible, setDisabledAccessible] = useState(listing.disabledAccessible ?? false)
  const [vpo, setVpo] = useState(listing.vpo ?? false)
  const [videoIntercom, setVideoIntercom] = useState(listing.videoIntercom ?? false)
  const [conciergeService, setConciergeService] = useState(listing.conciergeService ?? false)
  const [securityGuard, setSecurityGuard] = useState(listing.securityGuard ?? false)
  const [satelliteDish, setSatelliteDish] = useState(listing.satelliteDish ?? false)
  const [doubleGlazing, setDoubleGlazing] = useState(listing.doubleGlazing ?? false)
  const [alarm, setAlarm] = useState(listing.alarm ?? false)
  const [securityDoor, setSecurityDoor] = useState(listing.securityDoor ?? false)
  const [lastRenovationYear, setLastRenovationYear] = useState(listing.lastRenovationYear ?? "")
  const [kitchenType, setKitchenType] = useState(listing.kitchenType ?? "")
  const [hotWaterType, setHotWaterType] = useState(listing.hotWaterType ?? "")
  const [openKitchen, setOpenKitchen] = useState(listing.openKitchen ?? false)
  const [frenchKitchen, setFrenchKitchen] = useState(listing.frenchKitchen ?? false)
  const [furnishedKitchen, setFurnishedKitchen] = useState(listing.furnishedKitchen ?? false)
  const [pantry, setPantry] = useState(listing.pantry ?? false)
  const [terrace, setTerrace] = useState(listing.terrace ?? false)
  const [terraceSize, setTerraceSize] = useState(listing.terraceSize ?? 0)
  const [wineCellar, setWineCellar] = useState(listing.wineCellar ?? false)
  const [wineCellarSize, setWineCellarSize] = useState(listing.wineCellarSize ?? 0)
  const [livingRoomSize, setLivingRoomSize] = useState(listing.livingRoomSize ?? 0)
  const [balconyCount, setBalconyCount] = useState(listing.balconyCount ?? 0)
  const [galleryCount, setGalleryCount] = useState(listing.galleryCount ?? 0)
  const [buildingFloors, setBuildingFloors] = useState(listing.buildingFloors ?? 0)
  const [builtInWardrobes, setBuiltInWardrobes] = useState(listing.builtInWardrobes ?? "")
  const [mainFloorType, setMainFloorType] = useState(listing.mainFloorType ?? "")
  const [shutterType, setShutterType] = useState(listing.shutterType ?? "")
  const [carpentryType, setCarpentryType] = useState(listing.carpentryType ?? "")
  const [windowType, setWindowType] = useState(listing.windowType ?? "")
  const [views, setViews] = useState(listing.views ?? false)
  const [mountainViews, setMountainViews] = useState(listing.mountainViews ?? false)
  const [seaViews, setSeaViews] = useState(listing.seaViews ?? false)
  const [beachfront, setBeachfront] = useState(listing.beachfront ?? false)
  const [jacuzzi, setJacuzzi] = useState(listing.jacuzzi ?? false)
  const [hydromassage, setHydromassage] = useState(listing.hydromassage ?? false)
  const [garden, setGarden] = useState(listing.garden ?? false)
  const [pool, setPool] = useState(listing.pool ?? false)
  const [homeAutomation, setHomeAutomation] = useState(listing.homeAutomation ?? false)
  const [musicSystem, setMusicSystem] = useState(listing.musicSystem ?? false)
  const [fireplace, setFireplace] = useState(listing.fireplace ?? false)
  const [city, setCity] = useState(listing.city ?? "")
  const [province, setProvince] = useState(listing.province ?? "")
  const [municipality, setMunicipality] = useState(listing.municipality ?? "")
  const [showAdditionalCharacteristics, setShowAdditionalCharacteristics] = useState(false)
  const [showPremiumFeatures, setShowPremiumFeatures] = useState(false)
  const [showAdditionalSpaces, setShowAdditionalSpaces] = useState(false)
  const [showMaterials, setShowMaterials] = useState(false)

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

  const getPropertyTypeText = (type: string) => {
    switch (type) {
      case 'piso':
        return 'Piso'
      case 'casa':
        return 'Casa'
      case 'local':
        return 'Local'
      case 'solar':
        return 'Solar'
      case 'garaje':
        return 'Garaje'
      default:
        return type
    }
  }

  const generateTitle = () => {
    const type = getPropertyTypeText(listing.propertyType ?? 'local')
    const street = listing.street ?? ''
    const neighborhood = listing.neighborhood ? `(${listing.neighborhood})` : ''
    return `${type} en ${street} ${neighborhood}`.trim()
  }

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const agentsList = await getAllAgents()
        setAgents(agentsList.map(agent => ({
          id: Number(agent.id),
          name: agent.name
        })))
      } catch (error) {
        console.error("Error fetching agents:", error)
      }
    }
    fetchAgents()
  }, [])

  const handleListingTypeChange = (type: string) => {
    setListingType(type)
    updateModuleState('basicInfo', true)
  }

  useEffect(() => {
    const handleModuleSave = (event: CustomEvent<{ saveId: string }>) => {
      const { saveId } = event.detail
      if (saveId === 'basicInfo') {
        saveModule('basicInfo')
      } else if (saveId === 'propertyDetails') {
        saveModule('propertyDetails')
      } else if (saveId === 'location') {
        saveModule('location')
      } else if (saveId === 'features') {
        saveModule('features')
      } else if (saveId === 'contactInfo') {
        saveModule('contactInfo')
      } else if (saveId === 'orientation') {
        saveModule('orientation')
      } else if (saveId === 'additionalCharacteristics') {
        saveModule('additionalCharacteristics')
      } else if (saveId === 'premiumFeatures') {
        saveModule('premiumFeatures')
      } else if (saveId === 'additionalSpaces') {
        saveModule('additionalSpaces')
      } else if (saveId === 'materials') {
        saveModule('materials')
      } else if (saveId === 'description') {
        saveModule('description')
      } else if (saveId === 'rentalProperties') {
        saveModule('rentalProperties')
      }
    }

    window.addEventListener('module-save', handleModuleSave as EventListener)
    return () => {
      window.removeEventListener('module-save', handleModuleSave as EventListener)
    }
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Basic Information */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("basicInfo"))}>
        <ModernSaveIndicator 
          state={moduleStates.basicInfo?.saveState || "idle"} 
          saveId="basicInfo"
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">INFORMACIÓN BÁSICA</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <PropertyTitle 
              propertyType="local"
              street={listing.street}
              neighborhood={listing.neighborhood}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Tipo de Anuncio</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={listingType === 'Sale' ? "default" : "outline"}
                size="sm"
                onClick={() => handleListingTypeChange('Sale')}
                className="flex-1"
              >
                Venta
              </Button>
              <Button
                type="button"
                variant={listingType === 'Rent' ? "default" : "outline"}
                size="sm"
                onClick={() => handleListingTypeChange('Rent')}
                className="flex-1"
              >
                Alquiler
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="propertyType" className="text-sm">Tipo de Propiedad</Label>
            <Select 
              defaultValue="local"
              onValueChange={(value) => {
                if (value !== 'local') {
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('type', value)
                  router.push(`?${params.toString()}`)
                }
                updateModuleState('basicInfo', true)
              }}
            >
              <SelectTrigger className="h-8 text-gray-500">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="piso">Piso</SelectItem>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="solar">Solar</SelectItem>
                <SelectItem value="garaje">Garaje</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-sm">Precio</Label>
            <Input 
              id="price" 
              type="number" 
              defaultValue={parseInt(listing.price)} 
              className="h-8 text-gray-500" 
              min="0"
              step="1"
              onChange={() => updateModuleState('basicInfo', true)}
            />
          </div>

          <div className="border-t border-border my-2" />

          <div className="flex gap-2">
            <Button
              type="button"
              variant={isBankOwned ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsBankOwned(!isBankOwned)
                updateModuleState('basicInfo', true)
              }}
              className="flex-1"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Local de Banco
            </Button>
          </div>
        </div>
      </Card>

      {/* Property Details */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("propertyDetails"))}>
        <ModernSaveIndicator 
          state={moduleStates.propertyDetails?.saveState || "idle"} 
          saveId="propertyDetails"
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">DETALLES DE LA PROPIEDAD</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="estancias" className="text-sm">Estancias</Label>
            <Input 
              id="estancias" 
              type="number" 
              defaultValue={listing.bedrooms} 
              className="h-8 text-gray-500"
              onChange={() => updateModuleState('propertyDetails', true)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bathrooms" className="text-sm">Baños</Label>
            <Input 
              id="bathrooms" 
              type="number" 
              defaultValue={Math.round(listing.bathrooms)} 
              className="h-8 text-gray-500" 
              min="0"
              step="1"
              onChange={() => updateModuleState('propertyDetails', true)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="squareMeter" className="text-sm">Superficie (m²)</Label>
            <Input 
              id="squareMeter" 
              type="number" 
              defaultValue={listing.squareMeter} 
              className="h-8 text-gray-500"
              onChange={() => updateModuleState('propertyDetails', true)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="yearBuilt" className="text-sm">Año de Construcción</Label>
            <Input 
              id="yearBuilt" 
              type="number" 
              defaultValue={listing.yearBuilt} 
              className="h-8 text-gray-500"
              onChange={() => updateModuleState('propertyDetails', true)}
            />
          </div>
        </div>
      </Card>

      {/* Location */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("location"))}>
        <ModernSaveIndicator 
          state={moduleStates.location?.saveState || "idle"} 
          saveId="location"
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">UBICACIÓN</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="street" className="text-sm">Calle</Label>
            <Input 
              id="street" 
              defaultValue={listing.street} 
              className="h-8 text-gray-500"
              onChange={() => updateModuleState('location', true)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="addressDetails" className="text-sm">Detalles de la dirección</Label>
            <Input 
              id="addressDetails" 
              defaultValue={listing.addressDetails} 
              className="h-8 text-gray-500" 
              placeholder="Piso, puerta, escalera, etc."
              onChange={() => updateModuleState('location', true)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="postalCode" className="text-sm">Código Postal</Label>
              <Input 
                id="postalCode" 
                defaultValue={listing.postalCode} 
                className="h-8 text-gray-500"
                onChange={() => updateModuleState('location', true)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="neighborhood" className="text-sm">Barrio</Label>
              <Input 
                id="neighborhood" 
                defaultValue={listing.neighborhood} 
                className="h-8 bg-muted" 
                disabled 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-sm">Ciudad</Label>
              <Input 
                id="city" 
                value={city} 
                onChange={(e) => {
                  setCity(e.target.value)
                  updateModuleState('location', true)
                }} 
                className="h-8 text-gray-500" 
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="municipality" className="text-sm">Municipio</Label>
              <Input 
                id="municipality" 
                value={municipality} 
                onChange={(e) => {
                  setMunicipality(e.target.value)
                  updateModuleState('location', true)
                }} 
                className="h-8 text-gray-500" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="province" className="text-sm">Provincia</Label>
            <Input 
              id="province" 
              value={province} 
              onChange={(e) => {
                setProvince(e.target.value)
                updateModuleState('location', true)
              }} 
              className="h-8 text-gray-500" 
            />
          </div>
        </div>
      </Card>

      {/* Features */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("features"))}>
        <ModernSaveIndicator 
          state={moduleStates.features?.saveState || "idle"} 
          saveId="features"
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">CARACTERÍSTICAS</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hasElevator" 
              defaultChecked={listing.hasElevator}
              onCheckedChange={() => updateModuleState('features', true)}
            />
            <Label htmlFor="hasElevator" className="text-sm">Ascensor</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hasGarage" 
              checked={hasGarage}
              onCheckedChange={(checked) => {
                setHasGarage(checked as boolean)
                if (!checked) {
                  setGarageType("")
                  setGarageSpaces(1)
                  setGarageInBuilding(false)
                  setGarageNumber("")
                }
                updateModuleState('features', true)
              }}
            />
            <Label htmlFor="hasGarage" className="text-sm">Garaje</Label>
          </div>
          {hasGarage && (
            <div className="ml-6 mt-1 space-y-2 border-l-2 pl-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="garageType" className="text-xs">Tipo</Label>
                  <Select value={garageType} onValueChange={setGarageType}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abierto">Abierto</SelectItem>
                      <SelectItem value="cerrado">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="garageSpaces" className="text-xs">Plazas</Label>
                  <Input 
                    id="garageSpaces" 
                    type="number" 
                    value={garageSpaces}
                    onChange={(e) => {
                      setGarageSpaces(parseInt(e.target.value))
                      updateModuleState('features', true)
                    }}
                    className="h-7 text-xs" 
                    min="1"
                    max="10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-1">
                  <Checkbox 
                    id="garageInBuilding" 
                    checked={garageInBuilding}
                    onCheckedChange={(checked) => {
                      setGarageInBuilding(checked as boolean)
                      updateModuleState('features', true)
                    }} 
                    className="h-3 w-3"
                  />
                  <Label htmlFor="garageInBuilding" className="text-xs">En edificio</Label>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="garageNumber" className="text-xs">Nº plaza</Label>
                  <Input 
                    id="garageNumber" 
                    value={garageNumber}
                    onChange={(e) => {
                      setGarageNumber(e.target.value)
                      updateModuleState('features', true)
                    }}
                    className="h-7 text-xs" 
                    placeholder="A-123"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hasStorageRoom" 
              checked={hasStorageRoom}
              onCheckedChange={(checked) => {
                setHasStorageRoom(checked as boolean)
                if (!checked) {
                  setStorageRoomSize(0)
                  setStorageRoomNumber("")
                }
                updateModuleState('features', true)
              }}
            />
            <Label htmlFor="hasStorageRoom" className="text-sm">Trastero</Label>
          </div>
          {hasStorageRoom && (
            <div className="ml-6 mt-1 space-y-2 border-l-2 pl-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="storageRoomSize" className="text-xs">Tamaño (m²)</Label>
                  <Input 
                    id="storageRoomSize" 
                    type="number" 
                    value={storageRoomSize}
                    onChange={(e) => {
                      setStorageRoomSize(parseInt(e.target.value))
                      updateModuleState('features', true)
                    }}
                    className="h-7 text-xs" 
                    min="0"
                    step="1"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="storageRoomNumber" className="text-xs">Nº trastero</Label>
                  <Input 
                    id="storageRoomNumber" 
                    value={storageRoomNumber}
                    onChange={(e) => {
                      setStorageRoomNumber(e.target.value)
                      updateModuleState('features', true)
                    }}
                    className="h-7 text-xs" 
                    placeholder="T-45"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox id="hasHeating" checked={isHeating} onCheckedChange={checked => {
              setIsHeating(!!checked)
              updateModuleState('features', true)
            }} />
            <Label htmlFor="hasHeating" className="text-sm">Calefacción</Label>
          </div>
          {isHeating && (
            <div className="ml-6 mt-2">
              <Select value={heatingType} onValueChange={setHeatingType}>
                <SelectTrigger className="h-6 text-xs text-gray-500 mt-1 px-2 py-0">
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
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hasAirConditioning" 
              checked={isAirConditioning}
              onCheckedChange={(checked) => {
                setIsAirConditioning(checked as boolean)
                if (!checked) {
                  setAirConditioningType("")
                }
                updateModuleState('features', true)
              }}
            />
            <Label htmlFor="hasAirConditioning" className="text-sm">Aire acondicionado</Label>
          </div>
          {isAirConditioning && (
            <div className="ml-6 mt-1">
              <Select value={airConditioningType} onValueChange={setAirConditioningType}>
                <SelectTrigger className="h-6 text-xs text-gray-500 mt-1 px-2 py-0">
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
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isFurnished" 
                checked={isFurnished}
                onCheckedChange={(checked) => {
                  setIsFurnished(checked as boolean)
                  updateModuleState('features', true)
                }} 
              />
              <Label htmlFor="isFurnished" className="text-sm">Amueblado</Label>
            </div>
            {isFurnished && (
              <div className="ml-4">
                <RadioGroup defaultValue={listing.furnitureQuality} className="flex flex-wrap gap-2">
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="basic" id="basic" className="text-muted-foreground h-3 w-3" />
                    <Label htmlFor="basic" className="text-xs text-muted-foreground">Básico</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="standard" id="standard" className="text-muted-foreground h-3 w-3" />
                    <Label htmlFor="standard" className="text-xs text-muted-foreground">Estándar</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="high" id="high" className="text-muted-foreground h-3 w-3" />
                    <Label htmlFor="high" className="text-xs text-muted-foreground">Alta</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="luxury" id="luxury" className="text-muted-foreground h-3 w-3" />
                    <Label htmlFor="luxury" className="text-xs text-muted-foreground">Lujo</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("contactInfo"))}>
        <ModernSaveIndicator 
          state={moduleStates.contactInfo?.saveState || "idle"} 
          saveId="contactInfo"
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">INFORMACIÓN DE CONTACTO</h3>
          </div>
        </div>
        <div className="space-y-3">
          {listing.owner && (
            <div className="space-y-1.5">
              <Label htmlFor="owner" className="text-sm">Propietario</Label>
              <div className="flex gap-2">
                <Input 
                  id="owner" 
                  defaultValue={listing.owner} 
                  className="h-8 text-gray-500"
                  onChange={() => updateModuleState('contactInfo', true)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 relative group hover:bg-primary/10"
                  onClick={() => console.log('Navigate to owner page')}
                >
                  <User className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="agent" className="text-sm">Agente</Label>
            <div className="flex gap-2">
              <Select 
                defaultValue={listing.agent?.id?.toString()}
                onValueChange={() => updateModuleState('contactInfo', true)}
              >
                <SelectTrigger className="h-8 text-gray-500 flex-1">
                  <SelectValue placeholder="Seleccionar agente" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 relative group hover:bg-primary/10"
                onClick={() => console.log('Navigate to agent page')}
              >
                <User className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Exterior and Orientation */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("orientation"))}>
        <ModernSaveIndicator 
          state={moduleStates.orientation?.saveState || "idle"} 
          saveId="orientation"
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">ORIENTACIÓN Y EXPOSICIÓN</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isExterior" 
              checked={isExterior}
              onCheckedChange={(checked) => {
                setIsExterior(checked as boolean)
                updateModuleState('orientation', true)
              }} 
            />
            <Label htmlFor="isExterior" className="text-sm">Exterior</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isBright" 
              checked={isBright}
              onCheckedChange={(checked) => {
                setIsBright(checked as boolean)
                updateModuleState('orientation', true)
              }} 
            />
            <Label htmlFor="isBright" className="text-sm">Luminoso</Label>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="orientation" className="text-sm">Orientación</Label>
            <Select value={orientation} onValueChange={setOrientation}>
              <SelectTrigger className="h-8 text-gray-500">
                <SelectValue placeholder="Seleccionar orientación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="norte">Norte</SelectItem>
                <SelectItem value="sur">Sur</SelectItem>
                <SelectItem value="este">Este</SelectItem>
                <SelectItem value="oeste">Oeste</SelectItem>
                <SelectItem value="noreste">Noreste</SelectItem>
                <SelectItem value="noroeste">Noroeste</SelectItem>
                <SelectItem value="sureste">Sureste</SelectItem>
                <SelectItem value="suroeste">Suroeste</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Additional Characteristics */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("additionalCharacteristics"))}>
        <ModernSaveIndicator 
          state={moduleStates.additionalCharacteristics?.saveState || "idle"} 
          saveId="additionalCharacteristics"
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">CARACTERÍSTICAS ADICIONALES</h3>
          </div>
        </div>
        <div className={cn(
          "grid transition-all duration-200 ease-in-out",
          showAdditionalCharacteristics ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
        )}>
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                {/* Security Features */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Seguridad</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="securityDoor" 
                      checked={securityDoor}
                      onCheckedChange={(checked) => {
                        setSecurityDoor(checked as boolean)
                        updateModuleState('additionalCharacteristics', true)
                      }} 
                    />
                    <Label htmlFor="securityDoor" className="text-sm">Puerta blindada</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="alarm" 
                      checked={alarm}
                      onCheckedChange={(checked) => {
                        setAlarm(checked as boolean)
                        updateModuleState('additionalCharacteristics', true)
                      }} 
                    />
                    <Label htmlFor="alarm" className="text-sm">Alarma</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="videoIntercom" 
                      checked={videoIntercom}
                      onCheckedChange={(checked) => {
                        setVideoIntercom(checked as boolean)
                        updateModuleState('additionalCharacteristics', true)
                      }} 
                    />
                    <Label htmlFor="videoIntercom" className="text-sm">Videoportero</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="securityGuard" 
                      checked={securityGuard}
                      onCheckedChange={(checked) => {
                        setSecurityGuard(checked as boolean)
                        updateModuleState('additionalCharacteristics', true)
                      }} 
                    />
                    <Label htmlFor="securityGuard" className="text-sm">Vigilante</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="conciergeService" 
                      checked={conciergeService}
                      onCheckedChange={(checked) => {
                        setConciergeService(checked as boolean)
                        updateModuleState('additionalCharacteristics', true)
                      }} 
                    />
                    <Label htmlFor="conciergeService" className="text-sm">Conserjería</Label>
                  </div>
                </div>

                {/* Building Features */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Características del edificio</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="vpo" 
                      checked={vpo}
                      onCheckedChange={(checked) => {
                        setVpo(checked as boolean)
                        updateModuleState('additionalCharacteristics', true)
                      }} 
                    />
                    <Label htmlFor="vpo" className="text-sm">VPO</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="disabledAccessible" 
                      checked={disabledAccessible}
                      onCheckedChange={(checked) => {
                        setDisabledAccessible(checked as boolean)
                        updateModuleState('additionalCharacteristics', true)
                      }} 
                    />
                    <Label htmlFor="disabledAccessible" className="text-sm">Accesible</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="satelliteDish" 
                      checked={satelliteDish}
                      onCheckedChange={(checked) => {
                        setSatelliteDish(checked as boolean)
                        updateModuleState('additionalCharacteristics', true)
                      }} 
                    />
                    <Label htmlFor="satelliteDish" className="text-sm">Antena</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="doubleGlazing" 
                      checked={doubleGlazing}
                      onCheckedChange={(checked) => {
                        setDoubleGlazing(checked as boolean)
                        updateModuleState('additionalCharacteristics', true)
                      }} 
                    />
                    <Label htmlFor="doubleGlazing" className="text-sm">Doble acristalamiento</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Kitchen Features */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Cocina</h4>
                  <div className="space-y-1.5">
                    <Label htmlFor="kitchenType" className="text-sm">Tipo de cocina</Label>
                    <Select value={kitchenType} onValueChange={setKitchenType}>
                      <SelectTrigger className="h-8 text-gray-500">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gas">Gas</SelectItem>
                        <SelectItem value="induccion">Inducción</SelectItem>
                        <SelectItem value="vitroceramica">Vitrocerámica</SelectItem>
                        <SelectItem value="carbon">Carbón</SelectItem>
                        <SelectItem value="electrico">Eléctrico</SelectItem>
                        <SelectItem value="mixto">Mixto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="openKitchen" 
                      checked={openKitchen}
                      onCheckedChange={(checked) => {
                        setOpenKitchen(checked as boolean)
                        updateModuleState('additionalCharacteristics', true)
                      }} 
                    />
                    <Label htmlFor="openKitchen" className="text-sm">Cocina abierta</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="frenchKitchen" 
                      checked={frenchKitchen}
                      onCheckedChange={(checked) => {
                        setFrenchKitchen(checked as boolean)
                        updateModuleState('additionalCharacteristics', true)
                      }} 
                    />
                    <Label htmlFor="frenchKitchen" className="text-sm">Cocina francesa</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="furnishedKitchen" 
                      checked={furnishedKitchen}
                      onCheckedChange={(checked) => {
                        setFurnishedKitchen(checked as boolean)
                        updateModuleState('additionalCharacteristics', true)
                      }} 
                    />
                    <Label htmlFor="furnishedKitchen" className="text-sm">Cocina amueblada</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="pantry" 
                      checked={pantry}
                      onCheckedChange={(checked) => {
                        setPantry(checked as boolean)
                        updateModuleState('additionalCharacteristics', true)
                      }} 
                    />
                    <Label htmlFor="pantry" className="text-sm">Despensa</Label>
                  </div>
                </div>

                {/* Utilities */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Servicios</h4>
                  <div className="space-y-1.5">
                    <Label htmlFor="hotWaterType" className="text-sm">Agua caliente</Label>
                    <Select value={hotWaterType} onValueChange={setHotWaterType}>
                      <SelectTrigger className="h-8 text-gray-500">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="central">Central</SelectItem>
                        <SelectItem value="solar">Solar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastRenovationYear" className="text-sm">Año última reforma</Label>
                    <Input 
                      id="lastRenovationYear" 
                      type="number" 
                      value={lastRenovationYear}
                      onChange={(e) => {
                        setLastRenovationYear(e.target.value)
                        updateModuleState('additionalCharacteristics', true)
                      }}
                      className="h-8 text-gray-500" 
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Premium Features */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("premiumFeatures"))}>
        <ModernSaveIndicator 
          state={moduleStates.premiumFeatures?.saveState || "idle"} 
          saveId="premiumFeatures"
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">CARACTERÍSTICAS PREMIUM</h3>
          </div>
        </div>
        <div className={cn(
          "grid transition-all duration-200 ease-in-out",
          showPremiumFeatures ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
        )}>
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                {/* Views */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Vistas</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="views" 
                      checked={views}
                      onCheckedChange={(checked) => {
                        setViews(checked as boolean)
                        updateModuleState('premiumFeatures', true)
                      }} 
                    />
                    <Label htmlFor="views" className="text-sm">Vistas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mountainViews" 
                      checked={mountainViews}
                      onCheckedChange={(checked) => {
                        setMountainViews(checked as boolean)
                        updateModuleState('premiumFeatures', true)
                      }} 
                    />
                    <Label htmlFor="mountainViews" className="text-sm">Vistas montaña</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="seaViews" 
                      checked={seaViews}
                      onCheckedChange={(checked) => {
                        setSeaViews(checked as boolean)
                        updateModuleState('premiumFeatures', true)
                      }} 
                    />
                    <Label htmlFor="seaViews" className="text-sm">Vistas mar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="beachfront" 
                      checked={beachfront}
                      onCheckedChange={(checked) => {
                        setBeachfront(checked as boolean)
                        updateModuleState('premiumFeatures', true)
                      }} 
                    />
                    <Label htmlFor="beachfront" className="text-sm">Primera línea</Label>
                  </div>
                </div>

                {/* Wellness */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Bienestar</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="jacuzzi" 
                      checked={jacuzzi}
                      onCheckedChange={(checked) => {
                        setJacuzzi(checked as boolean)
                        updateModuleState('premiumFeatures', true)
                      }} 
                    />
                    <Label htmlFor="jacuzzi" className="text-sm">Jacuzzi</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="hydromassage" 
                      checked={hydromassage}
                      onCheckedChange={(checked) => {
                        setHydromassage(checked as boolean)
                        updateModuleState('premiumFeatures', true)
                      }} 
                    />
                    <Label htmlFor="hydromassage" className="text-sm">Hidromasaje</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="fireplace" 
                      checked={fireplace}
                      onCheckedChange={(checked) => {
                        setFireplace(checked as boolean)
                        updateModuleState('premiumFeatures', true)
                      }} 
                    />
                    <Label htmlFor="fireplace" className="text-sm">Chimenea</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Outdoor Features */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Exterior</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="garden" 
                      checked={garden}
                      onCheckedChange={(checked) => {
                        setGarden(checked as boolean)
                        updateModuleState('premiumFeatures', true)
                      }} 
                    />
                    <Label htmlFor="garden" className="text-sm">Jardín</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="pool" 
                      checked={pool}
                      onCheckedChange={(checked) => {
                        setPool(checked as boolean)
                        updateModuleState('premiumFeatures', true)
                      }} 
                    />
                    <Label htmlFor="pool" className="text-sm">Piscina</Label>
                  </div>
                </div>

                {/* Smart Home */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Domótica</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="homeAutomation" 
                      checked={homeAutomation}
                      onCheckedChange={(checked) => {
                        setHomeAutomation(checked as boolean)
                        updateModuleState('premiumFeatures', true)
                      }} 
                    />
                    <Label htmlFor="homeAutomation" className="text-sm">Domótica</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="musicSystem" 
                      checked={musicSystem}
                      onCheckedChange={(checked) => {
                        setMusicSystem(checked as boolean)
                        updateModuleState('premiumFeatures', true)
                      }} 
                    />
                    <Label htmlFor="musicSystem" className="text-sm">Sistema de música</Label>
                  </div>
                </div>

                {/* Utility Rooms */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Estancias</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="wineCellar" 
                      checked={wineCellar}
                      onCheckedChange={(checked) => {
                        setWineCellar(checked as boolean)
                        updateModuleState('premiumFeatures', true)
                      }} 
                    />
                    <Label htmlFor="wineCellar" className="text-sm">Bodega</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card className={cn("relative p-4 col-span-2 transition-all duration-500 ease-out", getCardStyles("description"))}>
        <ModernSaveIndicator 
          state={moduleStates.description?.saveState || "idle"} 
          saveId="description"
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">DESCRIPCIÓN</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Textarea 
              id="description" 
              defaultValue={listing.description} 
              className="min-h-[200px] resize-y text-gray-500"
              placeholder="Describe las características principales de la propiedad, su ubicación, y cualquier detalle relevante que pueda interesar a los potenciales compradores o inquilinos."
              onChange={() => updateModuleState('description', true)}
            />
          </div>
        </div>
      </Card>

      {/* Rental Properties - Only shown when listing type includes Rent */}
      {listingType === 'Rent' && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-wide">PROPIEDADES DEL ALQUILER</h3>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="appliancesIncluded" 
                checked={appliancesIncluded}
                onCheckedChange={(checked) => {
                  setAppliancesIncluded(checked as boolean)
                  updateModuleState('rentalProperties', true)
                }} 
              />
              <Label htmlFor="appliancesIncluded" className="text-sm">Incluye electrodomésticos</Label>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
} 