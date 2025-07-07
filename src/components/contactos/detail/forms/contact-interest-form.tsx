'use client'

import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Checkbox } from "~/components/ui/checkbox"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { cn } from "~/lib/utils"
import { useState, useEffect } from "react"
import { X, Save, Check, Loader2, Trash2 } from "lucide-react"
import { Textarea } from "~/components/ui/textarea"
import { Slider } from "~/components/ui/slider"
import { getAllCities, getNeighborhoodsByCity } from "~/server/queries/locations"
import { Separator } from "~/components/ui/separator"
import { motion } from "framer-motion"
import { RoomSelector } from "~/components/crear/pages/elements/room_selector"
import { createProspect, updateProspect, deleteProspect, type CreateProspectInput, type UpdateProspectInput } from "~/server/queries/prospect"
import { toast } from "sonner"

export interface InterestFormData {
  id: string
  demandType: string
  minPrice: number
  maxPrice: number
  preferredArea: string
  selectedNeighborhoods: Array<{
    neighborhoodId: bigint
    neighborhood: string
    city: string
    municipality: string
    province: string
  }>
  propertyTypes: string[]
  minBedrooms: number
  minBathrooms: number
  urgencyLevel: number
  fundingReady: boolean
  moveInBy: string
  extras: { [key: string]: boolean }
  notes: string
}

interface ContactInterestFormProps {
  data: InterestFormData
  onUpdate: (data: InterestFormData) => void
  onRemove?: () => void
  isRemovable?: boolean
  index: number
  contactId: bigint
  onSaved?: () => void
  onDeleted?: () => void
}

export function ContactInterestForm({ 
  data, 
  onUpdate, 
  onRemove, 
  isRemovable = false,
  index,
  contactId,
  onSaved,
  onDeleted
}: ContactInterestFormProps) {
  const [localData, setLocalData] = useState<InterestFormData>(data)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [characteristicsSearch, setCharacteristicsSearch] = useState("")
  
  // Location selection states
  const [cities, setCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState("")
  const [neighborhoods, setNeighborhoods] = useState<Array<{
    neighborhoodId: bigint
    neighborhood: string
    municipality: string
    province: string
  }>>([])
  const [neighborhoodSearch, setNeighborhoodSearch] = useState("")

  // Initialize selectedNeighborhoods if not present
  useEffect(() => {
    if (!localData.selectedNeighborhoods) {
      setLocalData({ ...localData, selectedNeighborhoods: [] })
    }
  }, [localData])

  // Load cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesList = await getAllCities()
        setCities(citiesList)
      } catch (error) {
        console.error("Error loading cities:", error)
      }
    }
    loadCities()
  }, [])

  // Load neighborhoods when city changes
  useEffect(() => {
    if (selectedCity) {
      const loadNeighborhoods = async () => {
        try {
          const neighborhoodsList = await getNeighborhoodsByCity(selectedCity)
          setNeighborhoods(neighborhoodsList)
        } catch (error) {
          console.error("Error loading neighborhoods:", error)
        }
      }
      loadNeighborhoods()
    } else {
      setNeighborhoods([])
    }
  }, [selectedCity])

  // Filter neighborhoods based on search
  const filteredNeighborhoods = neighborhoods.filter(neighborhood => 
    neighborhood.neighborhood.toLowerCase().includes(neighborhoodSearch.toLowerCase()) ||
    neighborhood.municipality.toLowerCase().includes(neighborhoodSearch.toLowerCase())
  )

  const updateLocalData = (updates: Partial<InterestFormData>) => {
    const newData = { ...localData, ...updates }
    setLocalData(newData)
    onUpdate(newData)
  }

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      // Convert selectedNeighborhoods to preferredAreas format
      const preferredAreas = localData.selectedNeighborhoods?.map(neighborhood => ({
        neighborhoodId: Number(neighborhood.neighborhoodId),
        name: neighborhood.neighborhood
      })) || []

      const prospectData: CreateProspectInput = {
        contactId: contactId,
        status: "active",
        listingType: localData.demandType || undefined,
        propertyType: localData.propertyTypes[0] || "",
        minPrice: localData.minPrice.toString(),
        maxPrice: localData.maxPrice.toString(),
        preferredAreas: preferredAreas,
        minBedrooms: localData.minBedrooms || 0,
        minBathrooms: localData.minBathrooms || 0,
        moveInBy: localData.moveInBy ? new Date(localData.moveInBy) : undefined,
        extras: localData.extras || {},
        urgencyLevel: localData.urgencyLevel || 3,
        fundingReady: localData.fundingReady || false,
        notesInternal: localData.notes || ""
      }
      
      // Check if this is an existing prospect (ID starts with "prospect-")
      if (localData.id.startsWith('prospect-')) {
        const prospectId = localData.id.replace('prospect-', '')
        await updateProspect(BigInt(prospectId), prospectData as UpdateProspectInput)
      } else {
        await createProspect(prospectData)
      }
      
      setSaveStatus('saved')
      toast.success("Solicitud guardada exitosamente")
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)

      if (onSaved) {
        onSaved()
      }
    } catch (error) {
      console.error("Error saving prospect:", error)
      setSaveStatus('error')
      toast.error("Error al guardar la solicitud")
      
      // Reset to idle after 3 seconds on error
      setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    }
  }

  const handleDelete = async () => {
    if (!localData.id.startsWith('prospect-')) {
      // If it's a new form, just remove it
      if (onRemove) {
        onRemove()
      }
      return
    }

    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      const prospectId = localData.id.replace('prospect-', '')
      await deleteProspect(BigInt(prospectId))
      toast.success("Solicitud eliminada exitosamente")
      setShowDeleteDialog(false)
      
      if (onDeleted) {
        onDeleted()
      }
    } catch (error) {
      console.error("Error deleting prospect:", error)
      toast.error("Error al eliminar la solicitud")
    }
  }

  const getFormTitle = () => {
    if (localData.id.startsWith('prospect-')) {
      // For existing prospects, show operation + property type
      const operation = localData.demandType === "Sale" ? "Compra" : "Alquiler"
      const propertyType = localData.propertyTypes[0] || "Propiedad"
      return `${operation} de ${propertyType}`
    }
    // For new forms, show generic title
    return `Solicitud #${index + 1}`
  }

  return (
    <Card className="p-4 border-gray-200 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-semibold text-gray-700">{getFormTitle()}</h4>
        <div className="flex items-center space-x-2">
          {/* Save button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={cn(
              "h-6 w-6 p-0 transition-colors",
              saveStatus === 'saving' && "text-amber-600 hover:text-amber-700 hover:bg-amber-50",
              saveStatus === 'saved' && "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50",
              saveStatus === 'error' && "text-red-600 hover:text-red-700 hover:bg-red-50",
              saveStatus === 'idle' && "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            )}
          >
            {saveStatus === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
            {saveStatus === 'saved' && <Check className="h-3 w-3" />}
            {(saveStatus === 'idle' || saveStatus === 'error') && <Save className="h-3 w-3" />}
          </Button>
          
          {/* Delete button for existing prospects */}
          {localData.id.startsWith('prospect-') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
          
          {/* Close button */}
        {isRemovable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Transaction Details */}
        <Card className="p-4 border-gray-100 bg-gray-50/50">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo de operación</Label>
              <div className="relative bg-gray-100 rounded-lg p-1 h-10">
                <motion.div
                  className="absolute top-1 left-1 w-[calc(50%-2px)] h-8 bg-white rounded-md shadow-sm"
                  animate={{
                    x: localData.demandType === "Sale" ? 0 : "calc(100% - 5px)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <div className="relative flex h-full">
                  <button
                    onClick={() => updateLocalData({ demandType: "Sale" })}
                    className={cn(
                      "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                      localData.demandType === "Sale"
                        ? "text-gray-900"
                        : "text-gray-600"
                    )}
                  >
                    Compra
                  </button>
                  <button
                    onClick={() => updateLocalData({ demandType: "Rent" })}
                    className={cn(
                      "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                      localData.demandType === "Rent"
                        ? "text-gray-900"
                        : "text-gray-600"
                    )}
                  >
                    Alquiler
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Rango de precio (€)</Label>
              <div className="space-y-4">
                {(() => {
                  const propertyType = localData.propertyTypes[0] || ""
                  const isPisoOrCasa = propertyType === "piso" || propertyType === "casa"
                  const minLimit = isPisoOrCasa ? 50000 : 0
                  const maxLimit = isPisoOrCasa ? 2500000 : 2000000
                  
                  return (
                    <>
                      <div className="relative">
                <Slider
                  value={[localData.minPrice, localData.maxPrice]}
                  onValueChange={(value) => {
                    const newMinPrice = value[0] || 100000
                    const newMaxPrice = value[1] || 350000
                    
                    // Ensure min doesn't exceed max
                    if (newMinPrice <= newMaxPrice) {
                      updateLocalData({ 
                        minPrice: newMinPrice, 
                        maxPrice: newMaxPrice 
                      })
                    }
                  }}
                  max={maxLimit}
                  min={minLimit}
                  step={10000}
                  className="w-full"
                />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Precio mínimo</Label>
                          <Input
                            type="text"
                            value={localData.minPrice.toLocaleString('es-ES')}
                            onChange={(e) => {
                              const value = parseInt(e.target.value.replace(/\D/g, '')) || 100000
                              const maxPrice = localData.maxPrice
                              if (value <= maxPrice) {
                                updateLocalData({ minPrice: value })
                              }
                            }}
                            className="h-8 text-sm"
                            placeholder="100.000"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Precio máximo</Label>
                          <Input
                            type="text"
                            value={localData.maxPrice.toLocaleString('es-ES')}
                            onChange={(e) => {
                              const value = parseInt(e.target.value.replace(/\D/g, '')) || 350000
                              const minPrice = localData.minPrice
                              if (value >= minPrice) {
                                updateLocalData({ maxPrice: value })
                              }
                            }}
                            className="h-8 text-sm"
                            placeholder="350.000"
                          />
                        </div>
                </div>
                      <p className="text-xs text-gray-400 text-center">
                        Desliza para ajustar o escribe los valores manualmente
                      </p>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        </Card>

        {/* Property Requirements */}
        <Card className="p-4 border-gray-100 bg-gray-50/50">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo de propiedad</Label>
              <div className="relative bg-gray-100 rounded-lg p-1 h-10">
                <motion.div
                  className="absolute top-1 left-1 w-[calc(20%-2px)] h-8 bg-white rounded-md shadow-sm"
                  animate={{
                    x: localData.propertyTypes[0] === "piso" ? 0 : 
                       localData.propertyTypes[0] === "casa" ? "100%" :
                       localData.propertyTypes[0] === "local" ? "200%" :
                       localData.propertyTypes[0] === "terreno" ? "300%" :
                       "400%"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <div className="relative flex h-full">
                  <button
                    onClick={() => updateLocalData({ propertyTypes: ["piso"] })}
                    className={cn(
                      "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                      localData.propertyTypes[0] === "piso"
                        ? "text-gray-900"
                        : "text-gray-600"
                    )}
                  >
                    Piso
                  </button>
                  <button
                    onClick={() => updateLocalData({ propertyTypes: ["casa"] })}
                    className={cn(
                      "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                      localData.propertyTypes[0] === "casa"
                        ? "text-gray-900"
                        : "text-gray-600"
                    )}
                  >
                    Casa
                  </button>
                  <button
                    onClick={() => updateLocalData({ propertyTypes: ["local"] })}
                    className={cn(
                      "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                      localData.propertyTypes[0] === "local"
                        ? "text-gray-900"
                        : "text-gray-600"
                    )}
                  >
                    Local
                  </button>
                  <button
                    onClick={() => updateLocalData({ propertyTypes: ["terreno"] })}
                    className={cn(
                      "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                      localData.propertyTypes[0] === "terreno"
                        ? "text-gray-900"
                        : "text-gray-600"
                    )}
                  >
                    Terreno
                  </button>
                  <button
                    onClick={() => updateLocalData({ propertyTypes: ["garaje"] })}
                    className={cn(
                      "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                      localData.propertyTypes[0] === "garaje"
                        ? "text-gray-900"
                        : "text-gray-600"
                    )}
                  >
                    Garaje
                  </button>
                </div>
              </div>
            </div>
            
            {(() => {
              const propertyType = localData.propertyTypes[0] || ""
              const shouldShowRooms = propertyType !== "garaje" && propertyType !== "terreno" && propertyType !== "solar"
              
              return shouldShowRooms ? (
                <div className="grid grid-cols-2 gap-4">
                  <RoomSelector
                    type="bedrooms"
                    value={localData.minBedrooms}
                    onChange={(value) => updateLocalData({ minBedrooms: value })}
                    label="Habitaciones mínimas"
                    max={6}
                  />
                  
                  <RoomSelector
                    type="bathrooms"
                    value={localData.minBathrooms}
                    onChange={(value) => updateLocalData({ minBathrooms: value })}
                    label="Baños mínimos"
                  max={4}
                />
                </div>
              ) : null
            })()}
          </div>
        </Card>

        {/* Location & Timeline */}
        <Card className="p-4 border-gray-100 bg-gray-50/50">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Zonas preferidas</Label>
              
              {/* City Selection */}
              <div className="space-y-2">
                <Select 
                  value={selectedCity}
                  onValueChange={(value) => {
                    setSelectedCity(value)
                    setNeighborhoodSearch("")
                  }}
                >
                  <SelectTrigger className="h-9 text-gray-500">
                    <SelectValue placeholder="Seleccionar ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Neighborhood Selection */}
                {selectedCity && (
                  <div className="space-y-2">
                    <Select 
                      value=""
                      onValueChange={(value) => {
                        const neighborhood = neighborhoods.find(n => n.neighborhoodId.toString() === value)
                        if (neighborhood && !localData.selectedNeighborhoods?.some(n => n.neighborhoodId === neighborhood.neighborhoodId)) {
                          const newNeighborhood = {
                            ...neighborhood,
                            city: selectedCity
                          }
                          updateLocalData({ 
                            selectedNeighborhoods: [...(localData.selectedNeighborhoods || []), newNeighborhood] 
                          })
                        }
                      }}
                    >
                      <SelectTrigger className="h-9 text-gray-500">
                        <SelectValue placeholder="Añadir barrio" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="flex items-center px-3 pb-2">
                          <input
                            className="flex h-9 w-full rounded-md bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Buscar barrio..."
                            value={neighborhoodSearch}
                            onChange={(e) => setNeighborhoodSearch(e.target.value)}
                          />
                        </div>
                        <Separator className="mb-2" />
                        {filteredNeighborhoods.map((neighborhood) => (
                          <SelectItem 
                            key={neighborhood.neighborhoodId.toString()} 
                            value={neighborhood.neighborhoodId.toString()}
                            disabled={localData.selectedNeighborhoods?.some(n => n.neighborhoodId === neighborhood.neighborhoodId)}
                          >
                            {neighborhood.neighborhood} ({neighborhood.municipality})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Display selected neighborhoods */}
                {localData.selectedNeighborhoods && localData.selectedNeighborhoods.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {localData.selectedNeighborhoods.map((neighborhood) => (
                      <div 
                        key={neighborhood.neighborhoodId.toString()} 
                        className="flex items-center justify-between px-2 py-1 rounded-md"
                      >
                        <span className="text-sm">
                          {neighborhood.neighborhood} ({neighborhood.city})
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            const updatedNeighborhoods = localData.selectedNeighborhoods?.filter(
                              n => n.neighborhoodId !== neighborhood.neighborhoodId
                            ) || []
                            updateLocalData({ selectedNeighborhoods: updatedNeighborhoods })
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Fecha deseada</Label>
              <Input 
                type="date"
                value={localData.moveInBy}
                onChange={(e) => updateLocalData({ moveInBy: e.target.value })}
                className="h-9 text-gray-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nivel de urgencia</Label>
              <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((level) => {
                    const isSelected = localData.urgencyLevel === level
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => updateLocalData({ urgencyLevel: level })}
                        className={cn(
                        "w-8 h-8 rounded-full text-sm font-medium transition-colors",
                          isSelected 
                          ? "bg-gray-900 text-white" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                      {level}
                      </button>
                    )
                  })}
                </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Sin prisa</span>
                <span className="mr-64">Urgente</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Features & Extras */}
        <Card className="p-4 border-gray-100 bg-gray-50/50">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Características deseadas</Label>
              
              {/* Search input for characteristics */}
              <Input
                type="text"
                placeholder="Buscar características..."
                value={characteristicsSearch}
                onChange={(e) => setCharacteristicsSearch(e.target.value)}
                className="h-8 text-sm"
              />
              
              <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                {[
                  // Basic amenities
                  { key: 'elevator', label: 'Ascensor' },
                  { key: 'garage', label: 'Garaje' },
                  { key: 'terrace', label: 'Terraza' },
                  { key: 'pool', label: 'Piscina' },
                  { key: 'garden', label: 'Jardín' },
                  { key: 'airConditioning', label: 'Aire acondicionado' },
                  { key: 'heating', label: 'Calefacción' },
                  { key: 'furnished', label: 'Amueblado' },
                  { key: 'storageRoom', label: 'Trastero' },
                  { key: 'balcony', label: 'Balcón' },
                  
                  // Building features
                  { key: 'concierge', label: 'Portero' },
                  { key: 'securityGuard', label: 'Vigilante' },
                  { key: 'videoIntercom', label: 'Videoportero' },
                  { key: 'alarm', label: 'Alarma' },
                  { key: 'securityDoor', label: 'Puerta blindada' },
                  { key: 'doubleGlazing', label: 'Doble acristalamiento' },
                  { key: 'disabledAccess', label: 'Acceso discapacitados' },
                  
                  // Property condition
                  { key: 'brandNew', label: 'Nuevo' },
                  { key: 'newConstruction', label: 'Nueva construcción' },
                  { key: 'underConstruction', label: 'En construcción' },
                  { key: 'needsRenovation', label: 'Necesita reforma' },
                  { key: 'lastRenovation', label: 'Reformado recientemente' },
                  
                  // Kitchen features
                  { key: 'openKitchen', label: 'Cocina abierta' },
                  { key: 'frenchKitchen', label: 'Cocina francesa' },
                  { key: 'furnishedKitchen', label: 'Cocina amueblada' },
                  { key: 'pantry', label: 'Despensa' },
                  
                  // Appliances
                  { key: 'oven', label: 'Horno' },
                  { key: 'microwave', label: 'Microondas' },
                  { key: 'washingMachine', label: 'Lavadora' },
                  { key: 'fridge', label: 'Frigorífico' },
                  { key: 'tv', label: 'TV' },
                  { key: 'dishwasher', label: 'Lavavajillas' },
                  
                  // Views and orientation
                  { key: 'exterior', label: 'Exterior' },
                  { key: 'bright', label: 'Luminoso' },
                  { key: 'mountainViews', label: 'Vistas a montaña' },
                  { key: 'seaViews', label: 'Vistas al mar' },
                  { key: 'beachfront', label: 'Primera línea de playa' },
                  
                  // Luxury features
                  { key: 'jacuzzi', label: 'Jacuzzi' },
                  { key: 'hydromassage', label: 'Hidromasaje' },
                  { key: 'homeAutomation', label: 'Domótica' },
                  { key: 'musicSystem', label: 'Sistema de música' },
                  { key: 'fireplace', label: 'Chimenea' },
                  { key: 'wineCellar', label: 'Bodega' },
                  
                  // Community amenities
                  { key: 'communityPool', label: 'Piscina comunitaria' },
                  { key: 'privatePool', label: 'Piscina privada' },
                  { key: 'tennisCourt', label: 'Pista de tenis' },
                  { key: 'gym', label: 'Gimnasio' },
                  { key: 'sportsArea', label: 'Zona deportiva' },
                  { key: 'childrenArea', label: 'Zona infantil' },
                  
                  // Additional features
                  { key: 'laundryRoom', label: 'Lavadero' },
                  { key: 'coveredClothesline', label: 'Tendedero cubierto' },
                  { key: 'suiteBathroom', label: 'Baño suite' },
                  { key: 'builtInWardrobes', label: 'Armarios empotrados' },
                  { key: 'nearbyPublicTransport', label: 'Transporte público cercano' },
                  { key: 'satelliteDish', label: 'Antena parabólica' },
                  { key: 'stoneware', label: 'Gresite' },
                  
                  // Pet and student friendly
                  { key: 'petsAllowed', label: 'Mascotas permitidas' },
                  { key: 'studentFriendly', label: 'Apto para estudiantes' },
                  
                  // Internet and connectivity
                  { key: 'internet', label: 'Internet incluido' },
                  
                  // VPO and special conditions
                  { key: 'vpo', label: 'VPO' }
                ]
                .filter(extra => 
                  extra.label.toLowerCase().includes(characteristicsSearch.toLowerCase())
                )
                .map((extra) => (
                  <div key={extra.key} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`${data.id}-${extra.key}`}
                      checked={localData.extras[extra.key] || false}
                      onCheckedChange={(checked) => {
                        const newExtras = { ...localData.extras, [extra.key]: checked === true }
                        updateLocalData({ extras: newExtras })
                      }}
                    />
                    <Label htmlFor={`${data.id}-${extra.key}`} className="text-sm">
                      {extra.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Notas adicionales</Label>
              <Textarea 
                value={localData.notes}
                onChange={(e) => updateLocalData({ notes: e.target.value })}
                className="min-h-[80px] resize-y border-gray-200 focus:border-gray-400 focus:ring-gray-300 transition-colors"
                placeholder="Notas específicas para este interés..."
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Eliminar solicitud</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar esta solicitud? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
