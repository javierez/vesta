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
import { Textarea } from "~/components/ui/textarea"

interface ModuleState {
  hasUnsavedChanges: boolean;
  hasBeenSaved: boolean;
}

interface PropertyCharacteristicsFormSolarProps {
  listing: any // We'll type this properly later
  onPropertyTypeChange: (type: string) => void
}

export function PropertyCharacteristicsFormSolar({ listing, onPropertyTypeChange }: PropertyCharacteristicsFormSolarProps) {
  // Module states
  const [moduleStates, setModuleStates] = useState<Record<string, ModuleState>>({
    basicInfo: { hasUnsavedChanges: false, hasBeenSaved: false },
    propertyDetails: { hasUnsavedChanges: false, hasBeenSaved: false },
    location: { hasUnsavedChanges: false, hasBeenSaved: false },
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
              defaultValue="solar"
              onValueChange={(value) => {
                if (value !== 'solar') {
                  onPropertyTypeChange(value)
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
              placeholder="Describe las características principales del solar, su ubicación, y cualquier detalle relevante que pueda interesar a los potenciales compradores o inquilinos."
              onChange={() => updateModuleState('description', true)}
            />
          </div>
        </div>
      </Card>
    </div>
  )
} 