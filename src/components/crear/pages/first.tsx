"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card } from "~/components/ui/card"
import { FloatingLabelInput } from "~/components/ui/floating-label-input"
import { ChevronLeft, ChevronRight, Info, Loader, Plus, User } from "lucide-react"
import { cn } from "~/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { getAllAgents, getListingDetails } from "~/server/queries/listing"
import { getAllPotentialOwners, getCurrentListingOwners, updateListingOwners } from "~/server/queries/contact"
import { updateProperty } from "~/server/queries/properties"
import { updateListing } from "~/server/queries/listing"

interface FirstPageProps {
  listingId: string
  onNext: () => void
  onBack?: () => void
}

// Form data interface for first page
interface FirstPageFormData {
  price: string
  listingType: string
  propertyType: string
  agentId: string
  selectedContactIds: string[]
}

const initialFormData: FirstPageFormData = {
  price: "",
  listingType: "Sale",
  propertyType: "piso",
  agentId: "",
  selectedContactIds: [],
}

export default function FirstPage({ listingId, onNext, onBack }: FirstPageProps) {
  const [formData, setFormData] = useState<FirstPageFormData>(initialFormData)
  const [showListingTypeTooltip, setShowListingTypeTooltip] = useState(false)
  const [agents, setAgents] = useState<Array<{id: number, name: string}>>([])
  const [contacts, setContacts] = useState<Array<{id: number, name: string}>>([])
  const [contactSearch, setContactSearch] = useState("")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [listingDetails, setListingDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.tooltip-container')) {
        setShowListingTypeTooltip(false)
      }
    }

    if (showListingTypeTooltip) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showListingTypeTooltip])

  // Fetch listing details, agents and contacts on component mount
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
            price: details.price || "",
            listingType: details.listingType || "Sale",
            propertyType: details.propertyType || "piso",
            agentId: details.agentId ? details.agentId.toString() : "",
          }))
        }

        // Fetch agents
        const agentsList = await getAllAgents()
        setAgents(agentsList.map(agent => ({
          id: Number(agent.id),
          name: agent.name
        })))

        // Fetch contacts (potential owners)
        const contactsList = await getAllPotentialOwners()
        setContacts(contactsList.map(contact => ({
          id: Number(contact.id),
          name: contact.name
        })))

        // Load current contacts for this listing
        if (listingId) {
          const currentContacts = await getCurrentListingOwners(Number(listingId))
          setFormData(prev => ({
            ...prev,
            selectedContactIds: currentContacts.map(contact => contact.id.toString())
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

  const updateFormData = (field: keyof FirstPageFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleInputChange = (field: keyof FirstPageFormData) => (value: string) => {
    updateFormData(field, value)
  }

  const handleEventInputChange = (field: keyof FirstPageFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData(field, e.target.value)
  }

  // Format price with thousand separators and € symbol
  const formatPrice = (value: string) => {
    if (!value) return ""
    const numericValue = value.replace(/[^\d]/g, "")
    if (!numericValue) return ""
    const number = parseInt(numericValue, 10)
    return number.toLocaleString('es-ES') + " €"
  }

  // Get numeric value from formatted price
  const getNumericPrice = (formattedValue: string) => {
    return formattedValue.replace(/[^\d]/g, "")
  }

  // Handle price input with formatting
  const handlePriceChange = (value: string) => {
    const numericValue = getNumericPrice(value)
    updateFormData("price", numericValue)
  }

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(contactSearch.toLowerCase())
  )

  const handleNext = async () => {
    // Validate required fields
    if (!formData.price.trim()) {
      alert("Por favor, introduce el precio de la propiedad.")
      return
    }

    if (!formData.agentId) {
      alert("Por favor, selecciona un agente.")
      return
    }

    if (formData.selectedContactIds.length === 0) {
      alert("Por favor, selecciona al menos un contacto.")
      return
    }

    // Clear any previous save errors
    setSaveError(null)

    // Save data in the background without blocking the UI
    try {
      // Update property form position to 2 and property type
      if (listingDetails?.propertyId) {
        await updateProperty(Number(listingDetails.propertyId), { 
          formPosition: 2,
          propertyType: formData.propertyType
        })
      }

      // Update listing with price, listing type, and agent
      await updateListing(Number(listingId), {
        price: formData.price,
        listingType: formData.listingType as "Sale" | "Rent",
        agentId: BigInt(formData.agentId)
      })

      // Update listing contacts
      await updateListingOwners(Number(listingId), formData.selectedContactIds.map(id => Number(id)))

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

  const toggleContact = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedContactIds: prev.selectedContactIds.includes(contactId)
        ? prev.selectedContactIds.filter(id => id !== contactId)
        : [...prev.selectedContactIds, contactId]
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-gray-500" />
          <span className="text-gray-600">Cargando datos del inmueble...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Price Section */}
      <FloatingLabelInput
        id="price"
        value={formatPrice(formData.price)}
        onChange={handlePriceChange}
        placeholder="Precio (€)"
        type="text"
      />

      {/* Listing Type Section */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3 mb-4">
          <h3 className="text-md font-medium text-gray-900">Tipo de Anuncio</h3>
          <div className="relative tooltip-container">
            <button
              className="w-5 h-5 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium hover:bg-gray-200 transition-colors"
              onClick={() => setShowListingTypeTooltip(!showListingTypeTooltip)}
            >
              <Info className="w-3 h-3" />
            </button>
            {showListingTypeTooltip && (
              <div className="absolute top-0 left-0 z-10 w-72 p-3 bg-black text-white text-xs rounded-lg shadow-lg">
                <p>Al final del proceso podrás duplicar el anuncio para ponerlo en alquiler o venta</p>
                <div className="absolute top-3 left-3 w-2 h-2 bg-black transform rotate-45"></div>
              </div>
            )}
          </div>
        </div>
        <div className="relative bg-gray-100 rounded-lg p-1 h-10">
          <motion.div
            className="absolute top-1 left-1 w-[calc(50%-2px)] h-8 bg-white rounded-md shadow-sm"
            animate={{
              x: formData.listingType === "Sale" ? 0 : "calc(100% - 5px)"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <div className="relative flex h-full">
            <button
              onClick={() => updateFormData("listingType", "Sale")}
              className={cn(
                "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                formData.listingType === "Sale"
                  ? "text-gray-900"
                  : "text-gray-600"
              )}
            >
              Venta
            </button>
            <button
              onClick={() => updateFormData("listingType", "Rent")}
              className={cn(
                "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                formData.listingType === "Rent"
                  ? "text-gray-900"
                  : "text-gray-600"
              )}
            >
              Alquiler
            </button>
          </div>
        </div>
      </div>

      {/* Property Type Section */}
      <div className="space-y-2">
        <h3 className="text-md font-medium text-gray-900">Tipo de Propiedad</h3>
        <div className="relative bg-gray-100 rounded-lg p-1 h-10">
          <motion.div
            className="absolute top-1 left-1 w-[calc(25%-2px)] h-8 bg-white rounded-md shadow-sm"
            animate={{
              x: formData.propertyType === "piso" ? 0 : 
                 formData.propertyType === "casa" ? "100%" :
                 formData.propertyType === "local" ? "200%" :
                 "300%"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <div className="relative flex h-full">
            <button
              onClick={() => updateFormData("propertyType", "piso")}
              className={cn(
                "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                formData.propertyType === "piso"
                  ? "text-gray-900"
                  : "text-gray-600"
              )}
            >
              Piso
            </button>
            <button
              onClick={() => updateFormData("propertyType", "casa")}
              className={cn(
                "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                formData.propertyType === "casa"
                  ? "text-gray-900"
                  : "text-gray-600"
              )}
            >
              Casa
            </button>
            <button
              onClick={() => updateFormData("propertyType", "local")}
              className={cn(
                "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                formData.propertyType === "local"
                  ? "text-gray-900"
                  : "text-gray-600"
              )}
            >
              Local
            </button>
            <button
              onClick={() => updateFormData("propertyType", "solar")}
              className={cn(
                "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                formData.propertyType === "solar"
                  ? "text-gray-900"
                  : "text-gray-600"
              )}
            >
              Solar
            </button>
          </div>
        </div>
      </div>

      {/* Agent Section */}
      <div className="space-y-2">
        <h3 className="text-md font-medium text-gray-900">Agente</h3>
        <Select 
          value={formData.agentId} 
          onValueChange={(value) => updateFormData("agentId", value)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Seleccionar agente" />
          </SelectTrigger>
          <SelectContent>
            {agents.map((agent) => (
              <SelectItem 
                key={agent.id} 
                value={agent.id.toString()}
              >
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Contacts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-medium text-gray-900">Contactos</h3>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 h-8"
            onClick={() => {
              // TODO: Open contact creation modal
              alert("Funcionalidad de crear contacto próximamente")
            }}
          >
            <Plus className="w-3 h-3" />
            <span>Agregar</span>
          </Button>
        </div>
        
        {/* Contact Search */}
        <Input
          placeholder="Buscar contactos..."
          value={contactSearch}
          onChange={(e) => setContactSearch(e.target.value)}
          className="h-10"
        />

        {/* Contact List */}
        <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-2">
          {filteredContacts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-3">
              No se encontraron contactos
            </p>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors",
                  formData.selectedContactIds.includes(contact.id.toString())
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                )}
                onClick={() => toggleContact(contact.id.toString())}
              >
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">{contact.name}</span>
              </div>
            ))
          )}
        </div>
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
