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

interface ModuleState {
  hasUnsavedChanges: boolean;
  hasBeenSaved: boolean;
}

interface PropertyCharacteristicsFormGarageProps {
  listing: any // We'll type this properly later
}

export function PropertyCharacteristicsFormGarage({ listing }: PropertyCharacteristicsFormGarageProps) {
  // Module states
  const [moduleStates, setModuleStates] = useState<Record<string, ModuleState>>({
    basicInfo: { hasUnsavedChanges: false, hasBeenSaved: false },
    propertyDetails: { hasUnsavedChanges: false, hasBeenSaved: false },
    features: { hasUnsavedChanges: false, hasBeenSaved: false },
    description: { hasUnsavedChanges: false, hasBeenSaved: false }
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
              defaultValue="garaje"
              onValueChange={(value) => {
                if (value !== 'garaje') {
                  // If user selects a different property type, we'll let the parent form handle it
                  window.location.reload() // This will trigger a re-render with the main form
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
              placeholder="Describe las características principales del garaje, su ubicación, y cualquier detalle relevante que pueda interesar a los potenciales compradores o inquilinos."
              onChange={() => updateModuleState('description', true)}
            />
          </div>
        </div>
      </Card>
    </div>
  )
} 