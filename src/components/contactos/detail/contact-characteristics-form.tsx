'use client'

import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Checkbox } from "~/components/ui/checkbox"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { useState, useEffect } from "react"
import { ChevronDown, Save, Phone, Mail, MapPin, Calendar, FileText, User, Building, Plus } from "lucide-react"
import { Textarea } from "~/components/ui/textarea"
import { updateContact, getListingsByContact, getListingsByContactAsBuyer } from "~/server/queries/contact"
import { toast } from "sonner"
import { ModernSaveIndicator } from "~/components/propiedades/form/common/modern-save-indicator"
import { Badge } from "~/components/ui/badge"
import { contactTypeConfig } from "../contact-config"
import { PropertyCard } from "~/components/property-card"
import { Slider } from "~/components/ui/slider"
import { ContactInterestForm, type InterestFormData } from "./forms/contact-interest-form"
import { createProspect, updateProspect, getProspectsByContact, type CreateProspectInput, type UpdateProspectInput } from "~/server/queries/prospect"
import { ContactProspectCompact } from "./forms/contact-prospect-compact"
import { getLocationByNeighborhoodId } from "~/server/queries/locations"

type SaveState = "idle" | "modified" | "saving" | "saved" | "error"

interface ModuleState {
  saveState: SaveState
  hasChanges: boolean
  lastSaved?: Date
}

type ModuleName = "basicInfo" | "contactDetails" | "notes" | "interestForms"

interface ContactCharacteristicsFormProps {
  contact: {
    contactId: bigint
    firstName: string
    lastName: string
    email?: string
    phone?: string
    contactType: "demandante" | "propietario" | "banco" | "agencia" | "interesado"
    isActive: boolean
    additionalInfo?: {
      demandType?: string
      propertyTypes?: string[]
      minPrice?: number
      maxPrice?: number
      preferredArea?: string
      minBedrooms?: number
      minBathrooms?: number
      urgencyLevel?: number
      fundingReady?: boolean
      moveInBy?: string
      notes?: string
      extras?: { [key: string]: boolean }
      interestForms?: InterestFormData[]
    }
  }
}

export function ContactCharacteristicsForm({ contact }: ContactCharacteristicsFormProps) {
  // Module states
  const [moduleStates, setModuleStates] = useState<Record<string, ModuleState>>({
    basicInfo: { saveState: "idle", hasChanges: false },
    contactDetails: { saveState: "idle", hasChanges: false },
    notes: { saveState: "idle", hasChanges: false },
    interestForms: { saveState: "idle", hasChanges: false }
  })

  // Form states
  const [firstName, setFirstName] = useState(contact.firstName || "")
  const [lastName, setLastName] = useState(contact.lastName || "")
  const [email, setEmail] = useState(contact.email || "")
  const [phone, setPhone] = useState(contact.phone || "")
  const [isActive, setIsActive] = useState(contact.isActive ?? true)
  const [additionalInfo, setAdditionalInfo] = useState(contact.additionalInfo || {})
  
  // Interest forms state - Start empty, only show when explicitly creating/editing
  const [interestForms, setInterestForms] = useState<InterestFormData[]>([])
  
  // Prospects state for tracking existing prospects
  const [prospects, setProspects] = useState<any[]>([])
  const [editingProspectId, setEditingProspectId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  
  // Notes state
  const [notes, setNotes] = useState(additionalInfo.notes || "")

  // Property listings for propietario and demandante
  const [contactListings, setContactListings] = useState<any[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(false)

  // Contact type configuration
  const contactType = contact.contactType as keyof typeof contactTypeConfig
  const typeConfig = contactTypeConfig[contactType] || contactTypeConfig.demandante
  const TypeIcon = typeConfig.icon

  // Load contact listings if propietario or demandante
  useEffect(() => {
    if (contact.contactType === 'propietario' || contact.contactType === 'demandante') {
      const loadContactListings = async () => {
        setIsLoadingListings(true)
        try {
          let allListings
          if (contact.contactType === 'propietario') {
            allListings = await getListingsByContact(Number(contact.contactId))
          } else {
            // For demandante, get listings where they are the buyer
            allListings = await getListingsByContactAsBuyer(Number(contact.contactId))
          }
          
          // Only show active listings
          const activeListings = allListings.filter(listing => listing.status === 'Active')
          setContactListings(activeListings)
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

  // Load existing prospects for this contact
  useEffect(() => {
    const loadProspects = async () => {
      try {
        const existingProspects = await getProspectsByContact(contact.contactId)
        setProspects(existingProspects)
      } catch (error) {
        console.error('Error loading prospects:', error)
      }
    }
    
    loadProspects()
  }, [contact.contactId])

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

  // Function to add new interest form
  const addInterestForm = () => {
    setShowNewForm(true)
  }

  // Function to handle editing a prospect
  const handleEditProspect = async (prospect: any) => {
    // Convert preferredAreas back to selectedNeighborhoods format
    let selectedNeighborhoods: Array<{
      neighborhoodId: bigint
      neighborhood: string
      city: string
      municipality: string
      province: string
    }> = []

    if (Array.isArray(prospect.preferredAreas) && prospect.preferredAreas.length > 0) {
      // Fetch full location data for each neighborhood ID
      const locationPromises = prospect.preferredAreas.map(async (area: any) => {
        try {
          const location = await getLocationByNeighborhoodId(area.neighborhoodId)
          return location ? {
            neighborhoodId: location.neighborhoodId,
            neighborhood: location.neighborhood,
            city: location.city,
            municipality: location.municipality,
            province: location.province
          } : null
        } catch (error) {
          console.error('Error fetching location:', error)
          return null
        }
      })

      const locations = await Promise.all(locationPromises)
      selectedNeighborhoods = locations.filter(loc => loc !== null) as Array<{
        neighborhoodId: bigint
        neighborhood: string
        city: string
        municipality: string
        province: string
      }>
    }

    // Convert prospect to InterestFormData format
    const convertedForm: InterestFormData = {
      id: `prospect-${prospect.id}`,
      demandType: prospect.listingType || "",
      maxPrice: prospect.maxPrice ? parseInt(prospect.maxPrice.toString()) : 200000,
      preferredArea: selectedNeighborhoods.map(n => n.neighborhood).join(", "),
      selectedNeighborhoods: selectedNeighborhoods,
      propertyTypes: prospect.propertyType ? [prospect.propertyType] : [],
      minBedrooms: prospect.minBedrooms || 0,
      minBathrooms: prospect.minBathrooms || 0,
      minSquareMeters: prospect.minSquareMeters || 80,
      urgencyLevel: prospect.urgencyLevel || 3,
      fundingReady: prospect.fundingReady || false,
      moveInBy: (prospect.moveInBy ? prospect.moveInBy.toISOString().split('T')[0] : "") as string,
      extras: (prospect.extras as { [key: string]: boolean }) || {},
      notes: prospect.notesInternal || ""
    }
    
    setInterestForms([convertedForm])
    setEditingProspectId(prospect.id.toString())
    setShowNewForm(false)
  }

  // Function to handle saving and returning to compact view
  const handleFormSaved = () => {
    setShowNewForm(false)
    setEditingProspectId(null)
    setInterestForms([])
    // Reload prospects
    const loadProspects = async () => {
      try {
        const existingProspects = await getProspectsByContact(contact.contactId)
        setProspects(existingProspects)
      } catch (error) {
        console.error('Error loading prospects:', error)
      }
    }
    loadProspects()
  }

  // Function to create new form
  const createNewForm = () => {
    const newForm: InterestFormData = {
      id: `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      demandType: "",
      maxPrice: 150000,
      preferredArea: "",
      selectedNeighborhoods: [],
      propertyTypes: [],
      minBedrooms: 0,
      minBathrooms: 0,
      minSquareMeters: 80,
      urgencyLevel: 3,
      fundingReady: false,
      moveInBy: "",
      extras: {},
      notes: ""
    }
    setInterestForms([newForm])
    setShowNewForm(true)
    setEditingProspectId(null)
  }

  // Function to remove interest form
  const removeInterestForm = (id: string) => {
    setInterestForms(interestForms.filter(form => form.id !== id))
    updateModuleState('interestForms', true)
  }

  // Function to update interest form
  const updateInterestForm = (id: string, data: InterestFormData) => {
    setInterestForms(interestForms.map(form => 
      form.id === id ? data : form
    ))
    updateModuleState('interestForms', true)
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
        case 'notes':
          contactData = {
            additionalInfo: { ...additionalInfo, notes }
          }
          break
        case 'interestForms':
          // Save each interest form as a prospect
          for (const form of interestForms) {
            // Convert selectedNeighborhoods to preferredAreas format
            const preferredAreas = form.selectedNeighborhoods?.map(neighborhood => ({
              neighborhoodId: Number(neighborhood.neighborhoodId),
              name: neighborhood.neighborhood
            })) || []

            const prospectData: CreateProspectInput = {
              contactId: BigInt(contactId),
              status: "active",
              listingType: form.demandType || undefined,
              propertyType: form.propertyTypes[0] || "",
              maxPrice: form.maxPrice.toString(),
              preferredAreas: preferredAreas,
              minBedrooms: form.minBedrooms || 0,
              minBathrooms: form.minBathrooms || 0,
              minSquareMeters: form.minSquareMeters || 0,
              moveInBy: form.moveInBy ? new Date(form.moveInBy) : undefined,
              extras: form.extras || {},
              urgencyLevel: form.urgencyLevel || 3,
              fundingReady: form.fundingReady || false,
              notesInternal: form.notes || ""
            }

            const existingProspect = prospects.find(p => `prospect-${p.id}` === form.id)
            
            if (existingProspect) {
              // Update existing prospect
              await updateProspect(BigInt(existingProspect.id), prospectData as UpdateProspectInput)
            } else {
              // Create new prospect
              await createProspect(prospectData)
            }
          }
          
          // Also save to contact for backward compatibility - convert BigInt to string
          const serializableInterestForms = interestForms.map(form => ({
            ...form,
            selectedNeighborhoods: form.selectedNeighborhoods.map(neighborhood => ({
              ...neighborhood,
              neighborhoodId: neighborhood.neighborhoodId.toString()
            }))
          }))
          
          contactData = {
            additionalInfo: { 
              ...additionalInfo, 
              interestForms: serializableInterestForms 
            }
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
      </div>

      {/* Interest Forms Section - For demandante and interesado */}
      {(contact.contactType === 'demandante' || contact.contactType === 'interesado') && (
        <Card className="relative p-4 transition-all duration-500 ease-out">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold tracking-wide">SOLICITUDES DE BÚSQUEDA</h3>
            {!showNewForm && interestForms.length === 0 && (
              <Button
                onClick={createNewForm}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Añadir solicitud
              </Button>
            )}
          </div>
          
          {/* Show saved prospects in compact view - Always visible */}
          {prospects.length > 0 && (
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prospects.map((prospect) => (
                  <ContactProspectCompact
                    key={prospect.id.toString()}
                    prospect={prospect}
                    onEdit={handleEditProspect}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Show edit form when editing or creating new */}
          {(showNewForm || interestForms.length > 0) && (
            <div className="space-y-6">
              {interestForms.map((form, index) => (
                <div key={form.id} className="space-y-4">
                  <ContactInterestForm
                    data={form}
                    onUpdate={(data) => updateInterestForm(form.id, data)}
                    onRemove={() => {
                      setInterestForms([])
                      setShowNewForm(false)
                      setEditingProspectId(null)
                    }}
                    isRemovable={true}
                    index={index}
                    contactId={contact.contactId}
                    onSaved={handleFormSaved}
                    onDeleted={handleFormSaved}
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Empty state */}
          {prospects.length === 0 && !showNewForm && interestForms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No hay solicitudes de búsqueda configuradas</p>
              <p className="text-xs text-gray-400 mt-1">Haz clic en "Añadir solicitud" para crear la primera solicitud</p>
            </div>
          )}
        </Card>
      )}

      {/* Property Cards for Propietario and Demandante */}
      {(contact.contactType === 'propietario' || contact.contactType === 'demandante') && (
        <Card className="relative p-4 transition-all duration-500 ease-out">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold tracking-wide">
              {contact.contactType === 'propietario' ? 'PROPIEDADES ASOCIADAS' : 'PROPIEDADES DE INTERÉS'}
            </h3>
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
              <p className="text-sm">
                {contact.contactType === 'propietario' 
                  ? 'No hay propiedades asociadas a este contacto'
                  : 'No hay propiedades de interés asociadas a este contacto'
                }
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Interest Forms Section - For propietario contacts */}
      {contact.contactType === 'propietario' && (
        <Card className="relative p-4 transition-all duration-500 ease-out">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold tracking-wide">SOLICITUDES DE BÚSQUEDA</h3>
            {!showNewForm && interestForms.length === 0 && (
              <Button
                onClick={createNewForm}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Añadir solicitud
              </Button>
            )}
          </div>
          
          {/* Show saved prospects in compact view - Always visible */}
          {prospects.length > 0 && (
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prospects.map((prospect) => (
                  <ContactProspectCompact
                    key={prospect.id.toString()}
                    prospect={prospect}
                    onEdit={handleEditProspect}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Show edit form when editing or creating new */}
          {(showNewForm || interestForms.length > 0) && (
            <div className="space-y-6">
              {interestForms.map((form, index) => (
                <div key={form.id} className="space-y-4">
                  <ContactInterestForm
                    data={form}
                    onUpdate={(data) => updateInterestForm(form.id, data)}
                    onRemove={() => {
                      setInterestForms([])
                      setShowNewForm(false)
                      setEditingProspectId(null)
                    }}
                    isRemovable={true}
                    index={index}
                    contactId={contact.contactId}
                    onSaved={handleFormSaved}
                    onDeleted={handleFormSaved}
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Empty state */}
          {prospects.length === 0 && !showNewForm && interestForms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No hay solicitudes de búsqueda configuradas</p>
              <p className="text-xs text-gray-400 mt-1">Haz clic en "Añadir solicitud" para crear la primera solicitud</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}