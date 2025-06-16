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
import { updateProperty } from "~/server/queries/properties"
import { updateListing } from "~/server/queries/listing"
import { toast } from "sonner"
import { PropertyTitle } from "./common/property-title"
import { ModernSaveIndicator } from "./common/modern-save-indicator"

type SaveState = "idle" | "modified" | "saving" | "saved" | "error"

interface ModuleState {
  saveState: SaveState
  hasChanges: boolean
  lastSaved?: Date
}

type ModuleName = "basicInfo" | "propertyDetails" | "location" | "features" | "description" | "contactInfo" | "orientation" | "additionalCharacteristics" | "premiumFeatures" | "additionalSpaces" | "materials" | "rentalProperties"

interface PropertyCharacteristicsFormGarageProps {
  listing: any // We'll type this properly later
}

export function PropertyCharacteristicsFormGarage({ listing }: PropertyCharacteristicsFormGarageProps) {
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
            propertyType: 'garaje'
          }
          break

        case 'propertyDetails':
          propertyData = {
            garageSize: Number((document.getElementById('garageSize') as HTMLInputElement)?.value),
            yearBuilt: Number((document.getElementById('yearBuilt') as HTMLInputElement)?.value)
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
            garageType,
            garageSpaces,
            garageInBuilding,
            garageNumber,
            disabledAccessible,
            securityDoor,
            alarm,
            videoIntercom,
            securityGuard,
            conciergeService
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
  const [garageType, setGarageType] = useState(listing.garageType ?? "")
  const [garageSpaces, setGarageSpaces] = useState(listing.garageSpaces ?? 1)
  const [garageInBuilding, setGarageInBuilding] = useState(listing.garageInBuilding ?? false)
  const [garageNumber, setGarageNumber] = useState(listing.garageNumber ?? "")
  const [garageSize, setGarageSize] = useState(listing.garageSize ?? 0)
  const [yearBuilt, setYearBuilt] = useState(listing.yearBuilt ?? "")
  const [disabledAccessible, setDisabledAccessible] = useState(listing.disabledAccessible ?? false)
  const [securityDoor, setSecurityDoor] = useState(listing.securityDoor ?? false)
  const [alarm, setAlarm] = useState(listing.alarm ?? false)
  const [videoIntercom, setVideoIntercom] = useState(listing.videoIntercom ?? false)
  const [securityGuard, setSecurityGuard] = useState(listing.securityGuard ?? false)
  const [conciergeService, setConciergeService] = useState(listing.conciergeService ?? false)
  const [city, setCity] = useState(listing.city ?? "")
  const [province, setProvince] = useState(listing.province ?? "")
  const [municipality, setMunicipality] = useState(listing.municipality ?? "")

  const getPropertyTypeText = (type: string) => {
    switch (type) {
      case 'garaje':
        return 'Garaje'
      default:
        return type
    }
  }

  const generateTitle = () => {
    const type = getPropertyTypeText(listing.propertyType ?? 'garaje')
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
              propertyType="garaje"
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
              defaultValue="garaje"
              onValueChange={(value) => {
                if (value !== 'garaje') {
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
              Piso de Banco
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
            <Label htmlFor="garageSize" className="text-sm">Medidas (m²)</Label>
            <Input 
              id="garageSize" 
              type="number" 
              value={garageSize}
              onChange={(e) => {
                setGarageSize(parseInt(e.target.value))
                updateModuleState('propertyDetails', true)
              }}
              className="h-8 text-gray-500"
              min="0"
              step="1"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="yearBuilt" className="text-sm">Año de Construcción</Label>
            <Input 
              id="yearBuilt" 
              type="number" 
              value={yearBuilt}
              onChange={(e) => {
                setYearBuilt(e.target.value)
                updateModuleState('propertyDetails', true)
              }}
              className="h-8 text-gray-500"
              min="1900"
              max={new Date().getFullYear()}
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
              placeholder="Referencias, etc."
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
        <div className="space-y-6">
          {/* Garage Type and Spaces */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground">Tipo y Capacidad</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="garageType" className="text-sm">Tipo</Label>
                <Select value={garageType} onValueChange={(value) => {
                  setGarageType(value)
                  updateModuleState('features', true)
                }}>
                  <SelectTrigger className="h-8 text-gray-500">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abierto">Abierto</SelectItem>
                    <SelectItem value="cerrado">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="garageSpaces" className="text-sm">Plazas</Label>
                <Input 
                  id="garageSpaces" 
                  type="number" 
                  value={garageSpaces}
                  onChange={(e) => {
                    setGarageSpaces(parseInt(e.target.value))
                    updateModuleState('features', true)
                  }}
                  className="h-8 text-gray-500" 
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground">Ubicación</h4>
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
                <Label htmlFor="garageInBuilding" className="text-sm">En edificio</Label>
              </div>
              <div className="space-y-1">
                <Label htmlFor="garageNumber" className="text-sm">Nº plaza</Label>
                <Input 
                  id="garageNumber" 
                  value={garageNumber}
                  onChange={(e) => {
                    setGarageNumber(e.target.value)
                    updateModuleState('features', true)
                  }}
                  className="h-8 text-gray-500" 
                  placeholder="A-123"
                />
              </div>
            </div>
          </div>

          {/* Security Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground">Seguridad</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="securityDoor" 
                  checked={securityDoor}
                  onCheckedChange={(checked) => {
                    setSecurityDoor(checked as boolean)
                    updateModuleState('features', true)
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
                    updateModuleState('features', true)
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
                    updateModuleState('features', true)
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
                    updateModuleState('features', true)
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
                    updateModuleState('features', true)
                  }} 
                />
                <Label htmlFor="conciergeService" className="text-sm">Conserjería</Label>
              </div>
            </div>
          </div>

          {/* Accessibility */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground">Accesibilidad</h4>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="disabledAccessible" 
                checked={disabledAccessible}
                onCheckedChange={(checked) => {
                  setDisabledAccessible(checked as boolean)
                  updateModuleState('features', true)
                }} 
              />
              <Label htmlFor="disabledAccessible" className="text-sm">Accesible para personas con discapacidad</Label>
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
              placeholder="Describe las características principales del garaje, su ubicación, y cualquier detalle relevante que pueda interesar a los potenciales compradores o inquilinos."
              onChange={() => updateModuleState('description', true)}
            />
          </div>
        </div>
      </Card>

      {/* Contact Info */}
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
          <div className="space-y-1.5">
            <Label htmlFor="agents" className="text-sm">Agente</Label>
            <Select 
              value={agents.find(a => a.id === Number(listing.agentId))?.name}
              onValueChange={(value) => {
                // Handle agent change
              }}
            >
              <SelectTrigger className="h-8 text-gray-500">
                <SelectValue placeholder="Seleccionar agente" />
              </SelectTrigger>
              <SelectContent>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.name}>{agent.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Orientation */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("orientation"))}>
        <ModernSaveIndicator 
          state={moduleStates.orientation?.saveState || "idle"} 
          saveId="orientation"
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">ORIENTACIÓN</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="orientation" className="text-sm">Orientación</Label>
            <Input 
              id="orientation" 
              value={listing.orientation} 
              onChange={(e) => {
                // Handle orientation change
              }} 
              className="h-8 text-gray-500" 
            />
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
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="additionalCharacteristics" className="text-sm">Detalles adicionales</Label>
            <Textarea 
              id="additionalCharacteristics" 
              defaultValue={listing.additionalCharacteristics} 
              className="min-h-[200px] resize-y text-gray-500"
              placeholder="Describe cualquier característica adicional que pueda ser relevante para la propiedad."
              onChange={(e) => {
                // Handle additional characteristics change
              }}
            />
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
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="premiumFeatures" className="text-sm">Características premium</Label>
            <Textarea 
              id="premiumFeatures" 
              defaultValue={listing.premiumFeatures} 
              className="min-h-[200px] resize-y text-gray-500"
              placeholder="Describe las características premium de la propiedad."
              onChange={(e) => {
                // Handle premium features change
              }}
            />
          </div>
        </div>
      </Card>

      {/* Additional Spaces */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("additionalSpaces"))}>
        <ModernSaveIndicator 
          state={moduleStates.additionalSpaces?.saveState || "idle"} 
          saveId="additionalSpaces"
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">ESPACIOS ADICIONALES</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="additionalSpaces" className="text-sm">Detalles de los espacios adicionales</Label>
            <Textarea 
              id="additionalSpaces" 
              defaultValue={listing.additionalSpaces} 
              className="min-h-[200px] resize-y text-gray-500"
              placeholder="Describe los espacios adicionales de la propiedad."
              onChange={(e) => {
                // Handle additional spaces change
              }}
            />
          </div>
        </div>
      </Card>

      {/* Materials */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("materials"))}>
        <ModernSaveIndicator 
          state={moduleStates.materials?.saveState || "idle"} 
          saveId="materials"
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">MATERIALES</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="materials" className="text-sm">Detalles de los materiales</Label>
            <Textarea 
              id="materials" 
              defaultValue={listing.materials} 
              className="min-h-[200px] resize-y text-gray-500"
              placeholder="Describe los materiales utilizados en la construcción de la propiedad."
              onChange={(e) => {
                // Handle materials change
              }}
            />
          </div>
        </div>
      </Card>

      {/* Rental Properties */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("rentalProperties"))}>
        <ModernSaveIndicator 
          state={moduleStates.rentalProperties?.saveState || "idle"} 
          saveId="rentalProperties"
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">PROPIEDADES DE ALQUILER</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="rentalProperties" className="text-sm">Detalles de alquiler</Label>
            <Textarea 
              id="rentalProperties" 
              defaultValue={listing.rentalProperties} 
              className="min-h-[200px] resize-y text-gray-500"
              placeholder="Describe las características de alquiler de la propiedad."
              onChange={(e) => {
                // Handle rental properties change
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  )
} 