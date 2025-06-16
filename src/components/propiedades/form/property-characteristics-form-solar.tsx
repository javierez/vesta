'use client'

import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Checkbox } from "~/components/ui/checkbox"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { useState, useEffect, useCallback } from "react"
import { Building2, Star, ChevronDown, ExternalLink, User, UserCircle, Save, Circle } from "lucide-react"
import { getAllAgents } from "~/server/queries/listing"
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

type ModuleName = "basicInfo" | "propertyDetails" | "location" | "features" | "description"

interface PropertyCharacteristicsFormSolarProps {
  listing: any // We'll type this properly later
}

export function PropertyCharacteristicsFormSolar({ listing }: PropertyCharacteristicsFormSolarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check if property type has been changed
  const hasPropertyTypeChanged = listing.propertyType && searchParams.get('type') && 
    listing.propertyType !== searchParams.get('type')
  
  // Module states with new save state
  const [modules, setModules] = useState<Record<ModuleName, ModuleState>>(() => {
    // Initialize with property type change detection
    const initialState = {
      basicInfo: { saveState: "idle" as SaveState, hasChanges: hasPropertyTypeChanged },
      propertyDetails: { saveState: "idle" as SaveState, hasChanges: false },
      location: { saveState: "idle" as SaveState, hasChanges: false },
      features: { saveState: "idle" as SaveState, hasChanges: false },
      description: { saveState: "idle" as SaveState, hasChanges: false }
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
      setModules(prev => ({
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
  const updateModuleState = useCallback((moduleName: ModuleName, hasChanges: boolean) => {
    setModules(prev => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        saveState: hasChanges ? "modified" : "idle",
        hasChanges
      }
    }))
  }, [])

  // Function to handle save
  const handleSave = async (moduleName: ModuleName) => {
    setModules(prev => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        saveState: "saving",
        hasChanges: prev[moduleName].hasChanges
      }
    }))

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
            propertyType: 'solar'
          }
          break

        case 'propertyDetails':
          propertyData = {
            squareMeter: Number((document.getElementById('squareMeter') as HTMLInputElement)?.value),
            buildableArea: Number((document.getElementById('buildableArea') as HTMLInputElement)?.value),
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
            hasWater: (document.getElementById('hasWater') as HTMLInputElement)?.checked,
            hasElectricity: (document.getElementById('hasElectricity') as HTMLInputElement)?.checked,
            hasGas: (document.getElementById('hasGas') as HTMLInputElement)?.checked,
            hasSewer: (document.getElementById('hasSewer') as HTMLInputElement)?.checked,
            hasInternet: (document.getElementById('hasInternet') as HTMLInputElement)?.checked,
            hasPhone: (document.getElementById('hasPhone') as HTMLInputElement)?.checked,
            hasRoadAccess: (document.getElementById('hasRoadAccess') as HTMLInputElement)?.checked,
            hasFence: (document.getElementById('hasFence') as HTMLInputElement)?.checked,
            hasSecurity: (document.getElementById('hasSecurity') as HTMLInputElement)?.checked,
            hasParking: (document.getElementById('hasParking') as HTMLInputElement)?.checked,
            hasStorage: (document.getElementById('hasStorage') as HTMLInputElement)?.checked,
            hasGarden: (document.getElementById('hasGarden') as HTMLInputElement)?.checked,
            hasPool: (document.getElementById('hasPool') as HTMLInputElement)?.checked,
            hasTennis: (document.getElementById('hasTennis') as HTMLInputElement)?.checked,
            hasBasketball: (document.getElementById('hasBasketball') as HTMLInputElement)?.checked,
            hasFootball: (document.getElementById('hasFootball') as HTMLInputElement)?.checked,
            hasVolleyball: (document.getElementById('hasVolleyball') as HTMLInputElement)?.checked,
            hasGolf: (document.getElementById('hasGolf') as HTMLInputElement)?.checked,
            hasHorseRiding: (document.getElementById('hasHorseRiding') as HTMLInputElement)?.checked,
            hasHunting: (document.getElementById('hasHunting') as HTMLInputElement)?.checked,
            hasFishing: (document.getElementById('hasFishing') as HTMLInputElement)?.checked,
            hasCamping: (document.getElementById('hasCamping') as HTMLInputElement)?.checked,
            hasPicnic: (document.getElementById('hasPicnic') as HTMLInputElement)?.checked,
            hasBBQ: (document.getElementById('hasBBQ') as HTMLInputElement)?.checked,
            hasTerrace: (document.getElementById('hasTerrace') as HTMLInputElement)?.checked,
            hasBalcony: (document.getElementById('hasBalcony') as HTMLInputElement)?.checked,
            hasPatio: (document.getElementById('hasPatio') as HTMLInputElement)?.checked,
            hasPorch: (document.getElementById('hasPorch') as HTMLInputElement)?.checked,
            hasDeck: (document.getElementById('hasDeck') as HTMLInputElement)?.checked,
            hasGazebo: (document.getElementById('hasGazebo') as HTMLInputElement)?.checked,
            hasGreenhouse: (document.getElementById('hasGreenhouse') as HTMLInputElement)?.checked,
            hasOrchard: (document.getElementById('hasOrchard') as HTMLInputElement)?.checked,
            hasVineyard: (document.getElementById('hasVineyard') as HTMLInputElement)?.checked,
            hasOliveGrove: (document.getElementById('hasOliveGrove') as HTMLInputElement)?.checked,
            hasForest: (document.getElementById('hasForest') as HTMLInputElement)?.checked,
            hasMountain: (document.getElementById('hasMountain') as HTMLInputElement)?.checked,
            hasSea: (document.getElementById('hasSea') as HTMLInputElement)?.checked,
            hasRiver: (document.getElementById('hasRiver') as HTMLInputElement)?.checked,
            hasLake: (document.getElementById('hasLake') as HTMLInputElement)?.checked,
            hasBeach: (document.getElementById('hasBeach') as HTMLInputElement)?.checked,
            hasValley: (document.getElementById('hasValley') as HTMLInputElement)?.checked,
            hasPlateau: (document.getElementById('hasPlateau') as HTMLInputElement)?.checked,
            hasHill: (document.getElementById('hasHill') as HTMLInputElement)?.checked,
            hasCave: (document.getElementById('hasCave') as HTMLInputElement)?.checked,
            hasQuarry: (document.getElementById('hasQuarry') as HTMLInputElement)?.checked,
            hasMine: (document.getElementById('hasMine') as HTMLInputElement)?.checked,
            hasWell: (document.getElementById('hasWell') as HTMLInputElement)?.checked,
            hasSpring: (document.getElementById('hasSpring') as HTMLInputElement)?.checked,
            hasStream: (document.getElementById('hasStream') as HTMLInputElement)?.checked,
            hasPond: (document.getElementById('hasPond') as HTMLInputElement)?.checked,
            hasSwamp: (document.getElementById('hasSwamp') as HTMLInputElement)?.checked,
            hasMarsh: (document.getElementById('hasMarsh') as HTMLInputElement)?.checked,
            hasMeadow: (document.getElementById('hasMeadow') as HTMLInputElement)?.checked,
            hasPasture: (document.getElementById('hasPasture') as HTMLInputElement)?.checked,
            hasField: (document.getElementById('hasField') as HTMLInputElement)?.checked,
            hasCrop: (document.getElementById('hasCrop') as HTMLInputElement)?.checked
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

      setModules(prev => ({
        ...prev,
        [moduleName]: {
          saveState: "saved",
          hasChanges: false,
          lastSaved: new Date()
        }
      }))

      toast.success('Cambios guardados correctamente')

      // Reset to idle state after 2 seconds
      setTimeout(() => {
        setModules(prev => ({
          ...prev,
          [moduleName]: {
            ...prev[moduleName],
            saveState: "idle",
            hasChanges: prev[moduleName].hasChanges
          }
        }))
      }, 2000)

    } catch (error) {
      console.error(`Error saving ${moduleName}:`, error)
      
      setModules(prev => ({
        ...prev,
        [moduleName]: {
          ...prev[moduleName],
          saveState: "error",
          hasChanges: prev[moduleName].hasChanges
        }
      }))

      toast.error('Error al guardar los cambios')

      // Reset to modified state after 3 seconds if there are changes
      setTimeout(() => {
        setModules(prev => ({
          ...prev,
          [moduleName]: {
            ...prev[moduleName],
            saveState: prev[moduleName].hasChanges ? "modified" : "idle",
            hasChanges: prev[moduleName].hasChanges
          }
        }))
      }, 3000)
    }
  }

  const getCardStyles = (moduleName: ModuleName) => {
    const state = modules[moduleName].saveState

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
  const [views, setViews] = useState(listing.views ?? false)
  const [mountainViews, setMountainViews] = useState(listing.mountainViews ?? false)
  const [seaViews, setSeaViews] = useState(listing.seaViews ?? false)
  const [beachfront, setBeachfront] = useState(listing.beachfront ?? false)
  const [garden, setGarden] = useState(listing.garden ?? false)
  const [pool, setPool] = useState(listing.pool ?? false)
  const [city, setCity] = useState(listing.city ?? "")
  const [province, setProvince] = useState(listing.province ?? "")
  const [municipality, setMunicipality] = useState(listing.municipality ?? "")

  const getPropertyTypeText = (type: string) => {
    switch (type) {
      case 'solar':
        return 'Solar'
      default:
        return type
    }
  }

  const generateTitle = () => {
    const type = getPropertyTypeText(listing.propertyType ?? 'solar')
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
        handleSave('basicInfo')
      } else if (saveId === 'propertyDetails') {
        handleSave('propertyDetails')
      } else if (saveId === 'location') {
        handleSave('location')
      } else if (saveId === 'features') {
        handleSave('features')
      } else if (saveId === 'description') {
        handleSave('description')
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
          state={modules.basicInfo?.saveState || "idle"} 
          saveId="basicInfo"
        />
        
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold tracking-wide text-muted-foreground">INFORMACIÓN BÁSICA</h3>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <PropertyTitle 
              propertyType="solar"
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
              defaultValue="solar"
              onValueChange={(value) => {
                if (value !== 'solar') {
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
          state={modules.propertyDetails?.saveState || "idle"} 
          saveId="propertyDetails"
        />
        
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold tracking-wide text-muted-foreground">DETALLES DE LA PROPIEDAD</h3>
        </div>

        <div className="space-y-3">
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
        </div>
      </Card>

      {/* Location */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("location"))}>
        <ModernSaveIndicator 
          state={modules.location?.saveState || "idle"} 
          saveId="location"
        />
        
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold tracking-wide text-muted-foreground">UBICACIÓN</h3>
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
          state={modules.features?.saveState || "idle"} 
          saveId="features"
        />
        
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold tracking-wide text-muted-foreground">CARACTERÍSTICAS</h3>
        </div>

        <div className="space-y-6">
          {/* Views */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground">Vistas</h4>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="views" 
                checked={views}
                onCheckedChange={(checked) => {
                  setViews(checked as boolean)
                  updateModuleState('features', true)
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
                  updateModuleState('features', true)
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
                  updateModuleState('features', true)
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
                  updateModuleState('features', true)
                }} 
              />
              <Label htmlFor="beachfront" className="text-sm">Primera línea</Label>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground">Servicios</h4>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="garden" 
                checked={garden}
                onCheckedChange={(checked) => {
                  setGarden(checked as boolean)
                  updateModuleState('features', true)
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
                  updateModuleState('features', true)
                }} 
              />
              <Label htmlFor="pool" className="text-sm">Piscina</Label>
            </div>
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card className={cn("relative p-4 col-span-2 transition-all duration-500 ease-out", getCardStyles("description"))}>
        <ModernSaveIndicator 
          state={modules.description?.saveState || "idle"} 
          saveId="description"
        />
        
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold tracking-wide text-muted-foreground">DESCRIPCIÓN</h3>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Textarea 
              id="description" 
              defaultValue={listing.description} 
              className="min-h-[200px] resize-y text-gray-500"
              placeholder="Describe las características principales del solar, su ubicación, y cualquier detalle relevante que pueda interesar a los potenciales compradores o inquilinos."
              onChange={() => updateModuleState('description', true)}
            />
          </div>
        </div>
      </Card>
    </div>
  )
} 