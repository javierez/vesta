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
import { PropertyCharacteristicsFormGarage } from "./property-characteristics-form-garage"
import { PropertyCharacteristicsFormSolar } from "./property-characteristics-form-solar"
import { PropertyCharacteristicsFormLocal } from "./property-characteristics-form-local"

interface ModuleState {
  hasUnsavedChanges: boolean;
  hasBeenSaved: boolean;
}

interface PropertyCharacteristicsFormProps {
  listing: any // We'll type this properly later
}

export function PropertyCharacteristicsForm({ listing }: PropertyCharacteristicsFormProps) {
  // Module states
  const [moduleStates, setModuleStates] = useState<Record<string, ModuleState>>({
    basicInfo: { hasUnsavedChanges: false, hasBeenSaved: false },
    propertyDetails: { hasUnsavedChanges: false, hasBeenSaved: false },
    location: { hasUnsavedChanges: false, hasBeenSaved: false },
    features: { hasUnsavedChanges: false, hasBeenSaved: false },
    contactInfo: { hasUnsavedChanges: false, hasBeenSaved: false },
    orientation: { hasUnsavedChanges: false, hasBeenSaved: false },
    additionalCharacteristics: { hasUnsavedChanges: false, hasBeenSaved: false },
    premiumFeatures: { hasUnsavedChanges: false, hasBeenSaved: false },
    additionalSpaces: { hasUnsavedChanges: false, hasBeenSaved: false },
    materials: { hasUnsavedChanges: false, hasBeenSaved: false },
    description: { hasUnsavedChanges: false, hasBeenSaved: false },
    rentalProperties: { hasUnsavedChanges: false, hasBeenSaved: false }
  })

  // Function to update module state
  const updateModuleState = (moduleName: string, hasUnsavedChanges: boolean) => {
    setModuleStates(prev => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        hasUnsavedChanges,
        hasBeenSaved: false
      }
    }))
  }

  // Function to mark module as saved
  const markModuleAsSaved = (moduleName: string) => {
    setModuleStates(prev => ({
      ...prev,
      [moduleName]: {
        hasUnsavedChanges: false,
        hasBeenSaved: true
      }
    }))
  }

  // Function to render module status indicator
  const renderModuleStatus = (moduleName: string) => {
    const state = moduleStates[moduleName]
    if (!state) return null
    if (state.hasUnsavedChanges) {
      return <Circle className="h-2 w-2 fill-yellow-500 text-yellow-500" />
    }
    if (state.hasBeenSaved) {
      return <Circle className="h-2 w-2 fill-green-500 text-green-500" />
    }
    return null
  }

  const [listingTypes, setListingTypes] = useState<string[]>(
    listing.listingType ? [listing.listingType] : ['Sale'] // Default to 'Sale' if none selected
  )
  const [isBankOwned, setIsBankOwned] = useState(listing.isBankOwned ?? false)
  const [isFeatured, setIsFeatured] = useState(listing.isFeatured ?? false)
  const [agents, setAgents] = useState<Array<{ id: number; name: string }>>([])
  const [isFurnished, setIsFurnished] = useState(listing.isFurnished ?? false)
  const [isHeating, setIsHeating] = useState(listing.hasHeating ?? false)
  const [heatingType, setHeatingType] = useState(listing.heatingType ?? "")
  const [isAirConditioning, setIsAirConditioning] = useState(!!listing.airConditioningType)
  const [airConditioningType, setAirConditioningType] = useState(listing.airConditioningType ?? "")
  const [studentFriendly, setStudentFriendly] = useState(listing.studentFriendly ?? false)
  const [petsAllowed, setPetsAllowed] = useState(listing.petsAllowed ?? false)
  const [appliancesIncluded, setAppliancesIncluded] = useState(listing.appliancesIncluded ?? false)
  const [isExterior, setIsExterior] = useState(listing.exterior ?? false)
  const [orientation, setOrientation] = useState(listing.orientation ?? "")
  const [isBright, setIsBright] = useState(listing.bright ?? false)
  const [garageType, setGarageType] = useState(listing.garageType ?? "")
  const [garageSpaces, setGarageSpaces] = useState(listing.garageSpaces ?? 1)
  const [garageInBuilding, setGarageInBuilding] = useState(listing.garageInBuilding ?? false)
  const [garageNumber, setGarageNumber] = useState(listing.garageNumber ?? "")
  const [storageRoomSize, setStorageRoomSize] = useState(listing.storageRoomSize ?? 0)
  const [storageRoomNumber, setStorageRoomNumber] = useState(listing.storageRoomNumber ?? "")
  const [hasGarage, setHasGarage] = useState(listing.hasGarage ?? false)
  const [hasStorageRoom, setHasStorageRoom] = useState(listing.hasStorageRoom ?? false)
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
  const [laundryRoom, setLaundryRoom] = useState(listing.laundryRoom ?? false)
  const [coveredClothesline, setCoveredClothesline] = useState(listing.coveredClothesline ?? false)
  const [fireplace, setFireplace] = useState(listing.fireplace ?? false)
  const [city, setCity] = useState(listing.city ?? "")
  const [province, setProvince] = useState(listing.province ?? "")
  const [municipality, setMunicipality] = useState(listing.municipality ?? "")
  const [showAdditionalCharacteristics, setShowAdditionalCharacteristics] = useState(false)
  const [showPremiumFeatures, setShowPremiumFeatures] = useState(false)
  const [showAdditionalSpaces, setShowAdditionalSpaces] = useState(false)
  const [showMaterials, setShowMaterials] = useState(false)
  const [propertyType, setPropertyType] = useState(listing.propertyType ?? "piso")

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
    const type = getPropertyTypeText(propertyType)
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

  const toggleListingType = (type: string) => {
    setListingTypes(prev => {
      if (prev.length === 1 && prev.includes(type)) {
        return prev
      }
      if (prev.includes(type)) {
        return prev.filter(t => t !== type)
      }
      return [...prev, type]
    })
    updateModuleState('basicInfo', true)
  }

  const handlePropertyTypeChange = (newType: string) => {
    setPropertyType(newType)
  }

  // If property type is garage, render the garage form
  if (propertyType === 'garaje') {
    return <PropertyCharacteristicsFormGarage listing={listing} onPropertyTypeChange={handlePropertyTypeChange} />
  }

  // If property type is solar, render the solar form
  if (propertyType === 'solar') {
    return <PropertyCharacteristicsFormSolar listing={listing} onPropertyTypeChange={handlePropertyTypeChange} />
  }

  // If property type is local, render the local form
  if (propertyType === 'local') {
    return <PropertyCharacteristicsFormLocal listing={listing} onPropertyTypeChange={handlePropertyTypeChange} />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Basic Information */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">INFORMACIÓN BÁSICA</h3>
            {renderModuleStatus('basicInfo')}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:bg-transparent group"
            onClick={() => markModuleAsSaved('basicInfo')}
          >
            <Save className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm">Título</Label>
            <Input 
              id="title" 
              value={generateTitle()} 
              className="h-8 bg-muted" 
              disabled 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Tipo de Anuncio</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={listingTypes.includes('Sale') ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  toggleListingType('Sale')
                  updateModuleState('basicInfo', true)
                }}
                className="flex-1"
              >
                Venta
              </Button>
              <Button
                type="button"
                variant={listingTypes.includes('Rent') ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  toggleListingType('Rent')
                  updateModuleState('basicInfo', true)
                }}
                className="flex-1"
              >
                Alquiler
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="propertyType" className="text-sm">Tipo de Propiedad</Label>
            <Select 
              value={propertyType}
              onValueChange={(value) => {
                setPropertyType(value)
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
              Piso de Banco
            </Button>
          </div>
        </div>
      </Card>

      {/* Property Details */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">DETALLES DE LA PROPIEDAD</h3>
            {renderModuleStatus('propertyDetails')}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:bg-transparent group"
            onClick={() => markModuleAsSaved('propertyDetails')}
          >
            <Save className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="bedrooms" className="text-sm">Habitaciones</Label>
            <Input 
              id="bedrooms" 
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
      <Card className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">UBICACIÓN</h3>
            {renderModuleStatus('location')}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:bg-transparent group"
            onClick={() => markModuleAsSaved('location')}
          >
            <Save className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Button>
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
      <Card className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">CARACTERÍSTICAS</h3>
            {renderModuleStatus('features')}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:bg-transparent group"
            onClick={() => markModuleAsSaved('features')}
          >
            <Save className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Button>
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
      <Card className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">INFORMACIÓN DE CONTACTO</h3>
            {renderModuleStatus('contactInfo')}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:bg-transparent group"
            onClick={() => markModuleAsSaved('contactInfo')}
          >
            <Save className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Button>
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
      <Card className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">ORIENTACIÓN Y EXPOSICIÓN</h3>
            {renderModuleStatus('orientation')}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:bg-transparent group"
            onClick={() => markModuleAsSaved('orientation')}
          >
            <Save className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Button>
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

      {/* Additional Characteristics and Premium Features */}
      <div className="grid grid-cols-2 gap-4 col-span-full">
        {/* Additional Characteristics */}
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setShowAdditionalCharacteristics(!showAdditionalCharacteristics)}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Características adicionales
                </h3>
                {renderModuleStatus('additionalCharacteristics')}
              </div>
              <ChevronDown 
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  showAdditionalCharacteristics && "rotate-180"
                )} 
              />
            </button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 hover:bg-transparent group"
              onClick={() => markModuleAsSaved('additionalCharacteristics')}
            >
              <Save className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>
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
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setShowPremiumFeatures(!showPremiumFeatures)}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Características premium
                </h3>
                {renderModuleStatus('premiumFeatures')}
              </div>
              <ChevronDown 
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  showPremiumFeatures && "rotate-180"
                )} 
              />
            </button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 hover:bg-transparent group"
              onClick={() => markModuleAsSaved('premiumFeatures')}
            >
              <Save className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>
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
                        id="laundryRoom" 
                        checked={laundryRoom}
                        onCheckedChange={(checked) => {
                          setLaundryRoom(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="laundryRoom" className="text-sm">Lavadero</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="coveredClothesline" 
                        checked={coveredClothesline}
                        onCheckedChange={(checked) => {
                          setCoveredClothesline(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="coveredClothesline" className="text-sm">Tendedero cubierto</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Spaces and Materials */}
      <div className="grid grid-cols-2 gap-4 col-span-full">
        {/* Additional Spaces */}
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setShowAdditionalSpaces(!showAdditionalSpaces)}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Espacios adicionales
                </h3>
                {renderModuleStatus('additionalSpaces')}
              </div>
              <ChevronDown 
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  showAdditionalSpaces && "rotate-180"
                )} 
              />
            </button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 hover:bg-transparent group"
              onClick={() => markModuleAsSaved('additionalSpaces')}
            >
              <Save className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>
          </div>
          <div className={cn(
            "grid transition-all duration-200 ease-in-out",
            showAdditionalSpaces ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
          )}>
            <div className="overflow-hidden">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  {/* Outdoor Spaces */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Espacios exteriores</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="terrace" 
                        checked={terrace}
                        onCheckedChange={(checked) => {
                          setTerrace(checked as boolean)
                          updateModuleState('additionalSpaces', true)
                        }} 
                      />
                      <Label htmlFor="terrace" className="text-sm">Terraza</Label>
                    </div>
                    {terrace && (
                      <div className="ml-6 space-y-1.5">
                        <Label htmlFor="terraceSize" className="text-sm">Tamaño (m²)</Label>
                        <Input 
                          id="terraceSize" 
                          type="number" 
                          value={terraceSize}
                          onChange={(e) => {
                            setTerraceSize(parseInt(e.target.value))
                            updateModuleState('additionalSpaces', true)
                          }}
                          className="h-8 text-gray-500" 
                          min="0"
                          step="1"
                        />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Label htmlFor="balconyCount" className="text-sm">Nº balcones</Label>
                      <Input 
                        id="balconyCount" 
                        type="number" 
                        value={balconyCount}
                        onChange={(e) => {
                          setBalconyCount(parseInt(e.target.value))
                          updateModuleState('additionalSpaces', true)
                        }}
                        className="h-8 text-gray-500" 
                        min="0"
                        step="1"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="galleryCount" className="text-sm">Nº galerías</Label>
                      <Input 
                        id="galleryCount" 
                        type="number" 
                        value={galleryCount}
                        onChange={(e) => {
                          setGalleryCount(parseInt(e.target.value))
                          updateModuleState('additionalSpaces', true)
                        }}
                        className="h-8 text-gray-500" 
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>

                  {/* Storage Spaces */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Almacenamiento</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="wineCellar" 
                        checked={wineCellar}
                        onCheckedChange={(checked) => {
                          setWineCellar(checked as boolean)
                          updateModuleState('additionalSpaces', true)
                        }} 
                      />
                      <Label htmlFor="wineCellar" className="text-sm">Bodega</Label>
                    </div>
                    {wineCellar && (
                      <div className="ml-6 space-y-1.5">
                        <Label htmlFor="wineCellarSize" className="text-sm">Tamaño (m²)</Label>
                        <Input 
                          id="wineCellarSize" 
                          type="number" 
                          value={wineCellarSize}
                          onChange={(e) => {
                            setWineCellarSize(parseInt(e.target.value))
                            updateModuleState('additionalSpaces', true)
                          }}
                          className="h-8 text-gray-500" 
                          min="0"
                          step="1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Room Sizes */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Dimensiones</h4>
                    <div className="space-y-1.5">
                      <Label htmlFor="livingRoomSize" className="text-sm">Tamaño salón (m²)</Label>
                      <Input 
                        id="livingRoomSize" 
                        type="number" 
                        value={livingRoomSize}
                        onChange={(e) => {
                          setLivingRoomSize(parseInt(e.target.value))
                          updateModuleState('additionalSpaces', true)
                        }}
                        className="h-8 text-gray-500" 
                        min="0"
                        step="1"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="buildingFloors" className="text-sm">Plantas edificio</Label>
                      <Input 
                        id="buildingFloors" 
                        type="number" 
                        value={buildingFloors}
                        onChange={(e) => {
                          setBuildingFloors(parseInt(e.target.value))
                          updateModuleState('additionalSpaces', true)
                        }}
                        className="h-8 text-gray-500" 
                        min="1"
                        step="1"
                      />
                    </div>
                  </div>

                  {/* Built-in Features */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Empotrados</h4>
                    <div className="space-y-1.5">
                      <Label htmlFor="builtInWardrobes" className="text-sm">Armarios empotrados</Label>
                      <Select value={builtInWardrobes} onValueChange={setBuiltInWardrobes}>
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
              </div>
            </div>
          </div>
        </Card>

        {/* Materials and Finishes */}
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setShowMaterials(!showMaterials)}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Materiales y acabados
                </h3>
                {renderModuleStatus('materials')}
              </div>
              <ChevronDown 
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  showMaterials && "rotate-180"
                )} 
              />
            </button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 hover:bg-transparent group"
              onClick={() => markModuleAsSaved('materials')}
            >
              <Save className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>
          </div>
          <div className={cn(
            "grid transition-all duration-200 ease-in-out",
            showMaterials ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
          )}>
            <div className="overflow-hidden">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  {/* Windows and Doors */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Ventanas y puertas</h4>
                    <div className="space-y-1.5">
                      <Label htmlFor="windowType" className="text-sm">Tipo de ventana</Label>
                      <Select 
                        value={windowType} 
                        onValueChange={(value) => {
                          setWindowType(value)
                          updateModuleState('materials', true)
                        }}
                      >
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
                      <Select value={carpentryType} onValueChange={setCarpentryType}>
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
                      <Select value={shutterType} onValueChange={setShutterType}>
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

                <div className="space-y-3">
                  {/* Flooring */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Suelos</h4>
                    <div className="space-y-1.5">
                      <Label htmlFor="mainFloorType" className="text-sm">Tipo de suelo</Label>
                      <Select value={mainFloorType} onValueChange={setMainFloorType}>
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

                  {/* Security Features */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Seguridad</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="doubleGlazing" 
                        checked={doubleGlazing}
                        onCheckedChange={(checked) => {
                          setDoubleGlazing(checked as boolean)
                          updateModuleState('materials', true)
                        }} 
                      />
                      <Label htmlFor="doubleGlazing" className="text-sm">Doble acristalamiento</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="securityDoor" 
                        checked={securityDoor}
                        onCheckedChange={(checked) => {
                          setSecurityDoor(checked as boolean)
                          updateModuleState('materials', true)
                        }} 
                      />
                      <Label htmlFor="securityDoor" className="text-sm">Puerta blindada</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Description */}
      <Card className="p-4 col-span-2">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">DESCRIPCIÓN</h3>
            {renderModuleStatus('description')}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:bg-transparent group"
            onClick={() => markModuleAsSaved('description')}
          >
            <Save className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Button>
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
      {listingTypes.includes('Rent') && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-wide">PROPIEDADES DEL ALQUILER</h3>
              {renderModuleStatus('rentalProperties')}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 hover:bg-transparent group"
              onClick={() => markModuleAsSaved('rentalProperties')}
            >
              <Save className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="studentFriendly" 
                checked={studentFriendly}
                onCheckedChange={(checked) => {
                  setStudentFriendly(checked as boolean)
                  updateModuleState('rentalProperties', true)
                }} 
              />
              <Label htmlFor="studentFriendly" className="text-sm">Admite estudiantes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="petsAllowed" 
                checked={petsAllowed}
                onCheckedChange={(checked) => {
                  setPetsAllowed(checked as boolean)
                  updateModuleState('rentalProperties', true)
                }} 
              />
              <Label htmlFor="petsAllowed" className="text-sm">Admite mascotas</Label>
            </div>
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