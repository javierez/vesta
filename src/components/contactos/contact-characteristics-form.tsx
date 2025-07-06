'use client'

import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Checkbox } from "~/components/ui/checkbox"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { useState, useEffect } from "react"
import { ChevronDown, Save, Phone, Mail, MapPin, Calendar, FileText, User, Building } from "lucide-react"
import { Textarea } from "~/components/ui/textarea"
import { updateContact, getListingsByContact } from "~/server/queries/contact"
import { toast } from "sonner"
import { ModernSaveIndicator } from "~/components/propiedades/form/common/modern-save-indicator"
import { Badge } from "~/components/ui/badge"
import { contactTypeConfig } from "./contact-config"
import { PropertyCard } from "~/components/property-card"

type SaveState = "idle" | "modified" | "saving" | "saved" | "error"

interface ModuleState {
  saveState: SaveState
  hasChanges: boolean
  lastSaved?: Date
}

type ModuleName = "basicInfo" | "contactDetails" | "preferences" | "notes"

interface ContactCharacteristicsFormProps {
  contact: {
    contactId: bigint
    firstName: string
    lastName: string
    email?: string
    phone?: string
    contactType: "demandante" | "propietario" | "banco" | "agencia"
    isActive: boolean
    additionalInfo?: {
      demandType?: string
      propertiesCount?: number
      propertyTypes?: string[]
      budget?: number
      location?: string
      notes?: string
    }
  }
}

export function ContactCharacteristicsForm({ contact }: ContactCharacteristicsFormProps) {
  // Module states
  const [moduleStates, setModuleStates] = useState<Record<string, ModuleState>>({
    basicInfo: { saveState: "idle", hasChanges: false },
    contactDetails: { saveState: "idle", hasChanges: false },
    preferences: { saveState: "idle", hasChanges: false },
    notes: { saveState: "idle", hasChanges: false }
  })

  // Form states
  const [firstName, setFirstName] = useState(contact.firstName || "")
  const [lastName, setLastName] = useState(contact.lastName || "")
  const [email, setEmail] = useState(contact.email || "")
  const [phone, setPhone] = useState(contact.phone || "")
  const [isActive, setIsActive] = useState(contact.isActive ?? true)
  const [additionalInfo, setAdditionalInfo] = useState(contact.additionalInfo || {})
  
  // Additional info fields
  const [demandType, setDemandType] = useState(additionalInfo.demandType || "")
  const [budget, setBudget] = useState(additionalInfo.budget || "")
  const [location, setLocation] = useState(additionalInfo.location || "")
  const [propertyTypes, setPropertyTypes] = useState<string[]>(additionalInfo.propertyTypes || [])
  const [notes, setNotes] = useState(additionalInfo.notes || "")
  const [propertiesCount, setPropertiesCount] = useState(additionalInfo.propertiesCount || "")

  // UI states
  const [showPreferences, setShowPreferences] = useState(false)

  // Property listings for propietario
  const [contactListings, setContactListings] = useState<any[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(false)

  // Contact type configuration
  const contactType = contact.contactType as keyof typeof contactTypeConfig
  const typeConfig = contactTypeConfig[contactType] || contactTypeConfig.demandante
  const TypeIcon = typeConfig.icon

  // Load contact listings if propietario
  useEffect(() => {
    if (contact.contactType === 'propietario') {
      const loadContactListings = async () => {
        setIsLoadingListings(true)
        try {
          const listings = await getListingsByContact(Number(contact.contactId))
          setContactListings(listings)
        } catch (error) {
          console.error('Error loading contact listings:', error)
          toast.error('Error al cargar las propiedades del contacto')
        } finally {
          setIsLoadingListings(false)
        }
      }
      loadContactListings()
    }
  }, [contact.contactId, contact.contactType])

  // Function to update module state
  const updateModuleState = (moduleName: ModuleName, hasChanges: boolean) => {
    setModuleStates(prev => ({
      ...prev,
      [moduleName]: {
        saveState: hasChanges ? "modified" : "idle",
        hasChanges,
        lastSaved: prev[moduleName]?.lastSaved
      }
    }))
  }

  // Function to save module data
  const saveModule = async (moduleName: ModuleName) => {
    setModuleStates(prev => ({
      ...prev,
      [moduleName]: { 
        saveState: "saving",
        hasChanges: prev[moduleName]?.hasChanges || false,
        lastSaved: prev[moduleName]?.lastSaved
      }
    }))

    try {
      const contactId = Number(contact.contactId)
      let contactData = {}

      switch (moduleName) {
        case 'basicInfo':
          contactData = { firstName, lastName, isActive }
          break
        case 'contactDetails':
          contactData = { email, phone }
          break
        case 'preferences':
          contactData = {
            additionalInfo: {
              ...additionalInfo,
              demandType,
              budget: budget ? Number(budget) : null,
              location,
              propertyTypes,
              propertiesCount: propertiesCount ? Number(propertiesCount) : null
            }
          }
          break
        case 'notes':
          contactData = {
            additionalInfo: { ...additionalInfo, notes }
          }
          break
      }

      await updateContact(contactId, contactData)

      setModuleStates(prev => ({
        ...prev,
        [moduleName]: {
          saveState: "saved",
          hasChanges: false,
          lastSaved: new Date()
        }
      }))

      toast.success('Cambios guardados correctamente')

      setTimeout(() => {
        setModuleStates(prev => ({
          ...prev,
          [moduleName]: { 
            saveState: "idle",
            hasChanges: prev[moduleName]?.hasChanges || false,
            lastSaved: prev[moduleName]?.lastSaved
          }
        }))
      }, 2000)

    } catch (error) {
      console.error(`Error saving ${moduleName}:`, error)
      
      setModuleStates(prev => ({
        ...prev,
        [moduleName]: { 
          saveState: "error",
          hasChanges: prev[moduleName]?.hasChanges || false,
          lastSaved: prev[moduleName]?.lastSaved
        }
      }))

      toast.error('Error al guardar los cambios')

      setTimeout(() => {
        setModuleStates(prev => {
          const currentModule = prev[moduleName]
          return {
            ...prev,
            [moduleName]: {
              saveState: currentModule?.hasChanges ? "modified" : "idle",
              hasChanges: currentModule?.hasChanges || false,
              lastSaved: currentModule?.lastSaved
            }
          }
        })
      }, 3000)
    }
  }

  const getCardStyles = (moduleName: ModuleName) => {
    const state = moduleStates[moduleName]?.saveState
    switch (state) {
      case "modified": return "ring-2 ring-yellow-500/20 shadow-lg shadow-yellow-500/10 border-yellow-500/20"
      case "saving": return "ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10 border-amber-500/20"
      case "saved": return "ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10 border-emerald-500/20"
      case "error": return "ring-2 ring-red-500/20 shadow-lg shadow-red-500/10 border-red-500/20"
      default: return "hover:shadow-lg transition-all duration-300"
    }
  }

  const togglePropertyType = (type: string) => {
    const updated = propertyTypes.includes(type) 
      ? propertyTypes.filter(t => t !== type)
      : [...propertyTypes, type]
    setPropertyTypes(updated)
    updateModuleState('preferences', true)
  }

  return (
    <div className="space-y-6">
      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Basic Information */}
        <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("basicInfo"))}>
          <ModernSaveIndicator 
            state={moduleStates.basicInfo?.saveState || "idle"} 
            onSave={() => saveModule("basicInfo")} 
          />
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold tracking-wide">INFORMACIÓN BÁSICA</h3>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-sm">Nombre</Label>
              <Input 
                id="firstName" 
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                  updateModuleState('basicInfo', true)
                }}
                className="h-8 text-gray-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-sm">Apellidos</Label>
              <Input 
                id="lastName" 
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value)
                  updateModuleState('basicInfo', true)
                }}
                className="h-8 text-gray-500"
              />
            </div>
          </div>
        </Card>

        {/* Contact Details */}
        <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("contactDetails"))}>
          <ModernSaveIndicator 
            state={moduleStates.contactDetails?.saveState || "idle"} 
            onSave={() => saveModule("contactDetails")} 
          />
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold tracking-wide">DATOS DE CONTACTO</h3>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  updateModuleState('contactDetails', true)
                }}
                className="h-8 text-gray-500"
                placeholder="contacto@email.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm">Teléfono</Label>
              <Input 
                id="phone" 
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  updateModuleState('contactDetails', true)
                }}
                className="h-8 text-gray-500"
                placeholder="+34 600 000 000"
              />
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("notes"))}>
          <ModernSaveIndicator 
            state={moduleStates.notes?.saveState || "idle"} 
            onSave={() => saveModule("notes")} 
          />
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold tracking-wide">NOTAS</h3>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Textarea 
                id="notes" 
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value)
                  updateModuleState('notes', true)
                }}
                className="min-h-[120px] resize-y border-gray-200 focus:border-gray-400 focus:ring-gray-300 transition-colors"
                placeholder="Información adicional sobre el contacto..."
              />
            </div>
          </div>
        </Card>

        {/* Preferences - Only show for demandante */}
        {contact.contactType === 'demandante' && (
          <Card className={cn("relative p-4 transition-all duration-500 ease-out col-span-3", getCardStyles("preferences"))}>
            <ModernSaveIndicator 
              state={moduleStates.preferences?.saveState || "idle"} 
              onSave={() => saveModule("preferences")} 
            />
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowPreferences(!showPreferences)}
                className="flex items-center justify-between group w-full"
              >
                <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Preferencias y necesidades
                </h3>
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    showPreferences && "rotate-180"
                  )} 
                />
              </button>
            </div>
            <div className={cn(
              "grid transition-all duration-200 ease-in-out",
              showPreferences ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
            )}>
              <div className="overflow-hidden">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="demandType" className="text-sm">Tipo de demanda</Label>
                      <Select value={demandType} onValueChange={(value) => {
                        setDemandType(value)
                        updateModuleState('preferences', true)
                      }}>
                        <SelectTrigger className="h-8 text-gray-500">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compra">Compra</SelectItem>
                          <SelectItem value="alquiler">Alquiler</SelectItem>
                          <SelectItem value="venta">Venta</SelectItem>
                          <SelectItem value="inversion">Inversión</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="budget" className="text-sm">Presupuesto (€)</Label>
                      <Input 
                        id="budget" 
                        type="number"
                        value={budget}
                        onChange={(e) => {
                          setBudget(e.target.value)
                          updateModuleState('preferences', true)
                        }}
                        className="h-8 text-gray-500"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="location" className="text-sm">Ubicación preferida</Label>
                      <Input 
                        id="location" 
                        value={location}
                        onChange={(e) => {
                          setLocation(e.target.value)
                          updateModuleState('preferences', true)
                        }}
                        className="h-8 text-gray-500"
                        placeholder="Ciudad, barrio, zona..."
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">Tipos de propiedad de interés</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {['piso', 'casa', 'local', 'solar', 'garaje'].map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`propertyType-${type}`}
                              checked={propertyTypes.includes(type)}
                              onCheckedChange={() => togglePropertyType(type)}
                            />
                            <Label htmlFor={`propertyType-${type}`} className="text-sm capitalize">
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="propertiesCount" className="text-sm">Número de propiedades que posee</Label>
                      <Input 
                        id="propertiesCount" 
                        type="number"
                        value={propertiesCount}
                        onChange={(e) => {
                          setPropertiesCount(e.target.value)
                          updateModuleState('preferences', true)
                        }}
                        className="h-8 text-gray-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Property Cards for Propietario */}
      {contact.contactType === 'propietario' && (
        <Card className="relative p-4 transition-all duration-500 ease-out">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold tracking-wide">PROPIEDADES ASOCIADAS</h3>
          </div>
          
          {isLoadingListings ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg aspect-[4/3] mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : contactListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contactListings.map((listing) => (
                <PropertyCard key={listing.listingId.toString()} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No hay propiedades asociadas a este contacto</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}