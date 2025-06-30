"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card } from "~/components/ui/card"
import { FloatingLabelInput } from "~/components/ui/floating-label-input"
import { ChevronLeft, ChevronRight, Info, Loader, Plus, User } from "lucide-react"
import { cn } from "~/lib/utils"
import { formFormatters } from "~/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { updateProperty } from "~/server/queries/properties"
import { updateListing } from "~/server/queries/listing"
import { updateListingOwners } from "~/server/queries/contact"
import FormSkeleton from "./form-skeleton"

interface FirstPageProps {
  listingId: string
  globalFormData: any
  onNext: () => void
  onBack?: () => void
  refreshListingDetails?: () => void
}

// Form data interface for first page
interface FirstPageFormData {
  price: string
  listingType: string
  propertyType: string
  propertySubtype: string
  agentId: string
  selectedContactIds: string[]
}

const initialFormData: FirstPageFormData = {
  price: "",
  listingType: "Sale",
  propertyType: "piso",
  propertySubtype: "",
  agentId: "",
  selectedContactIds: [],
}

export default function FirstPage({ listingId, globalFormData, onNext, onBack, refreshListingDetails }: FirstPageProps) {
  const [formData, setFormData] = useState<FirstPageFormData>(initialFormData)
  const [showListingTypeTooltip, setShowListingTypeTooltip] = useState(false)
  const [contactSearch, setContactSearch] = useState("")

  // Fallback price formatting functions in case formFormatters is undefined
  const formatPriceInput = (value: string | number): string => {
    if (!value) return ""
    const numericValue = typeof value === 'string' ? value.replace(/[^\d]/g, "") : value.toString()
    if (!numericValue) return ""
    return `${numericValue} €`
  }

  const getNumericPrice = (formattedValue: string): string => {
    return formattedValue.replace(/[^\d]/g, "")
  }

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

  // Use centralized data instead of fetching
  useEffect(() => {
    if (globalFormData?.listingDetails) {
      const details = globalFormData.listingDetails
      
      // Convert price from float to integer for display
      let displayPrice = ""
      if (details.price) {
        // If price is a float (e.g., 3.00), convert to integer
        const priceValue = typeof details.price === 'number' ? details.price : parseFloat(details.price)
        displayPrice = Math.floor(priceValue).toString()
      }
      
      // Pre-populate form with existing data
      setFormData(prev => ({
        ...prev,
        price: displayPrice,
        listingType: details.listingType || "Sale",
        propertyType: details.propertyType || "piso",
        propertySubtype: details.propertySubtype || "",
        agentId: details.agentId ? details.agentId.toString() : "",
        selectedContactIds: globalFormData.currentContacts || [],
      }))
    }
  }, [globalFormData])

  const updateFormData = (field: keyof FirstPageFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleInputChange = (field: keyof FirstPageFormData) => (value: string) => {
    updateFormData(field, value)
  }

  const handleEventInputChange = (field: keyof FirstPageFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData(field, e.target.value)
  }

  // Handle price input with formatting
  const handlePriceChange = (value: string) => {
    const numericValue = formFormatters?.getNumericPrice(value) || getNumericPrice(value)
    updateFormData("price", numericValue)
  }

  // Filter contacts based on search
  const filteredContacts = globalFormData?.contacts?.filter((contact: {id: number, name: string}) => 
    contact.name.toLowerCase().includes(contactSearch.toLowerCase())
  ) || []

  const handleNext = () => {
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

    // Navigate IMMEDIATELY (optimistic) - no waiting!
    onNext()
    
    // Save data in background (completely silent)
    saveInBackground()
  }

  // Background save function - completely silent and non-blocking
  const saveInBackground = () => {
    // Fire and forget - no await, no blocking!
    Promise.all([
      // Update property form position to 2 and property type
      globalFormData?.listingDetails?.propertyId ? (async () => {
        const updateData: any = {
          propertyType: formData.propertyType,
          propertySubtype: formData.propertySubtype || null,
        }
        
        // Only update formPosition if current position is lower than 2
        if (!globalFormData.listingDetails.formPosition || globalFormData.listingDetails.formPosition < 2) {
          updateData.formPosition = 2
        }
        
        updateProperty(Number(globalFormData.listingDetails.propertyId), updateData)
      })() : Promise.resolve(),

      // Update listing with price, listing type, and agent
      updateListing(Number(listingId), {
        price: formData.price,
        listingType: formData.listingType as "Sale" | "Rent",
        agentId: BigInt(formData.agentId)
      }),

      // Update listing contacts
      updateListingOwners(Number(listingId), formData.selectedContactIds.map(id => Number(id)))
    ]).then(() => {
      // Refresh global data after successful save
      refreshListingDetails?.()
    }).catch(error => {
      console.error("Error saving form data:", error)
      // Silent error - user doesn't know it failed
      // Could implement retry logic here if needed
    })
  }

  const toggleContact = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedContactIds: prev.selectedContactIds.includes(contactId)
        ? prev.selectedContactIds.filter(id => id !== contactId)
        : [...prev.selectedContactIds, contactId]
    }))
  }

  // Show loading only if globalFormData is not ready
  if (!globalFormData?.listingDetails) {
    return <FormSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Price Section */}
      <FloatingLabelInput
        id="price"
        value={formFormatters?.formatPriceInput(formData.price) || formatPriceInput(formData.price)}
        onChange={handlePriceChange}
        placeholder="Precio"
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
            className="absolute top-1 left-1 w-[calc(20%-2px)] h-8 bg-white rounded-md shadow-sm"
            animate={{
              x: formData.propertyType === "piso" ? 0 : 
                 formData.propertyType === "casa" ? "100%" :
                 formData.propertyType === "local" ? "200%" :
                 formData.propertyType === "solar" ? "300%" :
                 "400%"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <div className="relative flex h-full">
            <button
              onClick={() => {
                updateFormData("propertyType", "piso")
                updateFormData("propertySubtype", "")
              }}
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
              onClick={() => {
                updateFormData("propertyType", "casa")
                updateFormData("propertySubtype", "")
              }}
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
              onClick={() => {
                updateFormData("propertyType", "local")
                updateFormData("propertySubtype", "")
              }}
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
              onClick={() => {
                updateFormData("propertyType", "solar")
                updateFormData("propertySubtype", "")
              }}
              className={cn(
                "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                formData.propertyType === "solar"
                  ? "text-gray-900"
                  : "text-gray-600"
              )}
            >
              Solar
            </button>
            <button
              onClick={() => {
                updateFormData("propertyType", "garage")
                updateFormData("propertySubtype", "")
              }}
              className={cn(
                "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                formData.propertyType === "garage"
                  ? "text-gray-900"
                  : "text-gray-600"
              )}
            >
              Garaje
            </button>
          </div>
        </div>
      </div>

      {/* Property Subtype Section */}
      <div className="space-y-2">
        <h3 className="text-md font-medium text-gray-900">Subtipo de Propiedad</h3>
        <Select 
          value={formData.propertySubtype} 
          onValueChange={(value) => updateFormData("propertySubtype", value)}
        >
          <SelectTrigger className="h-10 shadow-md border-0">
            <SelectValue placeholder="Seleccionar subtipo" />
          </SelectTrigger>
          <SelectContent>
            {formData.propertyType === "piso" && (
              <>
                <SelectItem value="Tríplex">Tríplex</SelectItem>
                <SelectItem value="Dúplex">Dúplex</SelectItem>
                <SelectItem value="Ático">Ático</SelectItem>
                <SelectItem value="Estudio">Estudio</SelectItem>
                <SelectItem value="Loft">Loft</SelectItem>
                <SelectItem value="Piso">Piso</SelectItem>
                <SelectItem value="Apartamento">Apartamento</SelectItem>
                <SelectItem value="Bajo">Bajo</SelectItem>
              </>
            )}
            {formData.propertyType === "casa" && (
              <>
                <SelectItem value="Casa">Casa</SelectItem>
                <SelectItem value="Casa adosada">Casa adosada</SelectItem>
                <SelectItem value="Casa pareada">Casa pareada</SelectItem>
                <SelectItem value="Chalet">Chalet</SelectItem>
                <SelectItem value="Casa rústica">Casa rústica</SelectItem>
                <SelectItem value="Bungalow">Bungalow</SelectItem>
              </>
            )}
            {formData.propertyType === "local" && (
              <>
                <SelectItem value="Residencial">Residencial</SelectItem>
                <SelectItem value="Otros">Otros</SelectItem>
                <SelectItem value="Mixto residencial">Mixto residencial</SelectItem>
                <SelectItem value="Oficinas">Oficinas</SelectItem>
                <SelectItem value="Hotel">Hotel</SelectItem>
              </>
            )}
            {formData.propertyType === "solar" && (
              <>
                <SelectItem value="Suelo residencial">Suelo residencial</SelectItem>
                <SelectItem value="Suelo industrial">Suelo industrial</SelectItem>
                <SelectItem value="Suelo rústico">Suelo rústico</SelectItem>
              </>
            )}
            {formData.propertyType === "garage" && (
              <>
                <SelectItem value="Moto">Moto</SelectItem>
                <SelectItem value="Doble">Doble</SelectItem>
                <SelectItem value="Individual">Individual</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Agent Section */}
      <div className="space-y-2">
        <h3 className="text-md font-medium text-gray-900">Agente</h3>
        <Select 
          value={formData.agentId} 
          onValueChange={(value) => updateFormData("agentId", value)}
        >
          <SelectTrigger className="h-10 shadow-md border-0">
            <SelectValue placeholder="Seleccionar agente" />
          </SelectTrigger>
          <SelectContent>
            {globalFormData?.agents?.map((agent: {id: number, name: string}) => (
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
          className="h-10 shadow-md border-0"
        />

        {/* Contact List */}
        <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg p-2 shadow-md">
          {filteredContacts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-3">
              No se encontraron contactos
            </p>
          ) : (
            filteredContacts.map((contact: {id: number, name: string}) => (
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

      {/* Navigation Buttons */}
      <motion.div
        className="flex justify-between pt-4 border-t"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={!onBack}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Anterior</span>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            onClick={handleNext} 
            className="flex items-center space-x-1 bg-gray-900 hover:bg-gray-800"
          >
            <span>Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
