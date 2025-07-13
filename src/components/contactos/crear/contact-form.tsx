"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Card } from "~/components/ui/card"
import { FloatingLabelInput } from "~/components/ui/floating-label-input"
import { ChevronLeft, ChevronRight, User, Home, Loader } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createContact } from "~/server/queries/contact"
import { listListingsCompact } from "~/server/queries/listing"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import { Badge } from "~/components/ui/badge"
import { Search, Map, Bath, Bed, Square, Filter, Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { ScrollArea } from "~/components/ui/scroll-area"
import Image from "next/image"
import type { ListingOverview } from "~/types/listing"
import { cn } from "~/lib/utils"

// Contact form data interface
interface ContactFormData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
  
  // Property Selection
  selectedListings: bigint[]
  contactType: 'owner' | 'buyer'
}

const initialFormData: ContactFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: "",
  selectedListings: [],
  contactType: 'owner',
}

// Step definitions
interface Step {
  id: string
  title: string
  icon: React.ReactNode
}

const steps: Step[] = [
  { 
    id: "personal", 
    title: "Información Personal",
    icon: <User className="w-5 h-5" />
  },
  { 
    id: "property", 
    title: "Seleccionar Propiedades",
    icon: <Home className="w-5 h-5" />
  },
]

// Interface for listing data structure
interface ListingData {
  listingId: bigint
  title: string | null
  referenceNumber: string | null
  price: string
  listingType: string
  propertyType: string | null
  bedrooms: number | null
  bathrooms: string | null
  squareMeter: number | null
  city: string | null
  agentName: string | null
  ownerName: string | null
  imageUrl: string | null
}

const statusColors: Record<string, string> = {
  "Sale": "bg-amber-50 text-amber-700 border-amber-200",
  "Rent": "bg-amber-50 text-amber-700 border-amber-200",
  "Sold": "bg-slate-50 text-slate-700 border-slate-200"
}

const statusLabels: Record<string, string> = {
  "Sale": "En Venta",
  "Rent": "En Alquiler",
  "Sold": "Vendido"
}

export default function ContactForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<ContactFormData>(initialFormData)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    listingType: [] as string[],
    propertyType: [] as string[]
  })
  const [listings, setListings] = useState<ListingData[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(false)
  const router = useRouter()

  // Fetch listings on component mount
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoadingListings(true)
      try {
        const listingsData = await listListingsCompact()
        setListings(listingsData)
      } catch (error) {
        console.error("Error fetching listings:", error)
      } finally {
        setIsLoadingListings(false)
      }
    }
    
    fetchListings()
  }, [])

  const updateFormData = (field: keyof ContactFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleInputChange = (field: keyof ContactFormData) => (value: string) => {
    updateFormData(field, value)
  }

  const handleEventInputChange = (field: keyof ContactFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateFormData(field, e.target.value)
  }

  const handleListingSelection = (listingId: bigint, checked: boolean) => {
    setFormData((prev) => {
      const currentArray = prev.selectedListings
      if (checked) {
        return { ...prev, selectedListings: [...currentArray, listingId] }
      } else {
        return { ...prev, selectedListings: currentArray.filter(item => item !== listingId) }
      }
    })
  }

  const validatePersonalStep = () => {
    if (!formData.firstName.trim()) {
      alert("Por favor, introduce el nombre.")
      return false
    }
    if (!formData.lastName.trim()) {
      alert("Por favor, introduce el apellido.")
      return false
    }
    if (!formData.email.trim() && !formData.phone.trim()) {
      alert("Por favor, introduce al menos un email o teléfono.")
      return false
    }
    // Basic email validation if provided
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Por favor, introduce un email válido.")
      return false
    }
    return true
  }

  const validatePropertyStep = () => {
    if (formData.selectedListings.length === 0) {
      alert("Por favor, selecciona al menos una propiedad para asociar al contacto.")
      return false
    }
    return true
  }

  const handleCreateContact = async () => {
    if (!validatePropertyStep()) return

    try {
      setIsCreating(true)
      
      // Prepare additional info based on form data
      const additionalInfo: any = {}
      
      // Store selected listings and contact type
      additionalInfo.selectedListings = formData.selectedListings.map(id => id.toString())
      additionalInfo.contactType = formData.contactType

      // Add notes if provided
      if (formData.notes.trim()) {
        additionalInfo.notes = formData.notes.trim()
      }

      const contactData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        additionalInfo,
        orgId: BigInt(1), // Default org ID - you might want to make this dynamic
        isActive: true,
      }

      const newContact = await createContact(contactData)
      console.log("Contact created:", newContact)

      // TODO: Link the contact to the selected listings with the specified contact type
      // This would require a separate server action to create the listing-contact relationships

      // Redirect to contact detail page
      if (newContact && newContact.contactId) {
        router.push(`/contactos/${newContact.contactId}`)
      } else {
        router.push("/contactos")
      }
    } catch (error) {
      console.error("Error creating contact:", error)
      alert("Error al crear el contacto. Por favor, inténtalo de nuevo.")
    } finally {
      setIsCreating(false)
    }
  }

  const nextStep = async () => {
    if (currentStep === 0) {
      if (!validatePersonalStep()) return
      setDirection("forward")
      setCurrentStep(1)
    } else if (currentStep === 1) {
      await handleCreateContact()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection("backward")
      setCurrentStep((prev) => prev - 1)
    }
  }

  const getPropertyTypeLabel = (type: string | null) => {
    switch (type) {
      case "piso": return "Piso"
      case "casa": return "Casa"
      case "local": return "Local"
      case "solar": return "Solar"
      case "garaje": return "Garaje"
      default: return type
    }
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('es-ES').format(Number(price))
  }

  // Filter listings based on search and filters
  const filteredListings = listings.filter((listing: ListingData) => {
    const matchesSearch = !searchQuery || 
      (listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       listing.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       listing.city?.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesListingType = filters.listingType.length === 0 || 
      filters.listingType.includes(listing.listingType)
    
    const matchesPropertyType = filters.propertyType.length === 0 || 
      filters.propertyType.includes(listing.propertyType || "")
    
    return matchesSearch && matchesListingType && matchesPropertyType
  })

  const toggleFilter = (filterType: 'listingType' | 'propertyType', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }))
  }

  const renderStepContent = () => {
    const step = steps[currentStep]

    if (!step) {
      return <div>Step not found</div>
    }

    switch (step.id) {
      case "personal":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FloatingLabelInput
                id="firstName"
                value={formData.firstName}
                onChange={handleInputChange("firstName")}
                placeholder="Nombre"
                required
              />
              <FloatingLabelInput
                id="lastName"
                value={formData.lastName}
                onChange={handleInputChange("lastName")}
                placeholder="Apellidos"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FloatingLabelInput
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                placeholder="Email"
              />
              <FloatingLabelInput
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange("phone")}
                placeholder="Teléfono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={handleEventInputChange("notes")}
                placeholder="Información adicional sobre el contacto..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="text-xs text-gray-500 mt-4">
              * Campos obligatorios. Debe introducir al menos email o teléfono.
            </div>
          </div>
        )

      case "property":
        return (
          <div className="space-y-6">
            {/* Contact Type Selection */}
            <div className="space-y-2">
              <Label>Relación con las propiedades</Label>
              <div className="relative bg-gray-100 rounded-lg p-1 h-10 flex-1 max-w-md">
                {formData.contactType && (
                  <motion.div
                    className="absolute top-1 left-1 h-8 bg-white rounded-md shadow-sm"
                    animate={{
                      width: "calc(50% - 4px)",
                      x: formData.contactType === 'owner' ? '0%' : '100%'
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative flex h-full">
                  <button
                    type="button"
                    onClick={() => updateFormData("contactType", 'owner')}
                    className={cn(
                      "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                      formData.contactType === 'owner'
                        ? "text-gray-900"
                        : "text-gray-600"
                    )}
                  >
                    Propietario
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFormData("contactType", 'buyer')}
                    className={cn(
                      "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                      formData.contactType === 'buyer'
                        ? "text-gray-900"
                        : "text-gray-600"
                    )}
                  >
                    Demandante
                  </button>
                </div>
              </div>
            </div>

            {/* Property Search and Filters */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar propiedades..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                      {(filters.listingType.length + filters.propertyType.length) > 0 && (
                        <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                          {filters.listingType.length + filters.propertyType.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <ScrollArea className="h-[300px]">
                      <div className="p-4 space-y-4">
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Estado</h5>
                          {['Sale', 'Rent', 'Sold'].map(type => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`listing-${type}`}
                                checked={filters.listingType.includes(type)}
                                onCheckedChange={(checked) => toggleFilter('listingType', type)}
                              />
                              <Label htmlFor={`listing-${type}`} className="text-sm">
                                {statusLabels[type]}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Tipo</h5>
                          {['piso', 'casa', 'local', 'solar', 'garaje'].map(type => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`property-${type}`}
                                checked={filters.propertyType.includes(type)}
                                onCheckedChange={(checked) => toggleFilter('propertyType', type)}
                              />
                              <Label htmlFor={`property-${type}`} className="text-sm">
                                {getPropertyTypeLabel(type)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Property List */}
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                {formData.selectedListings.length} propiedades seleccionadas
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {isLoadingListings ? (
                    <div className="flex justify-center py-8">
                      <Loader className="h-6 w-6 animate-spin" />
                    </div>
                  ) : filteredListings.length > 0 ? (
                    filteredListings.map((listing: ListingData) => (
                      <div
                        key={listing.listingId.toString()}
                        className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                          formData.selectedListings.includes(listing.listingId)
                            ? 'shadow-sm'
                            : ''
                        }`}
                        style={formData.selectedListings.includes(listing.listingId) ? {
                          backgroundColor: 'rgba(149,113,79,0.1)'
                        } : {
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (!formData.selectedListings.includes(listing.listingId)) {
                            e.currentTarget.style.backgroundColor = 'rgba(149,113,79,0.02)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!formData.selectedListings.includes(listing.listingId)) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }
                        }}
                        onClick={() => handleListingSelection(
                          listing.listingId, 
                          !formData.selectedListings.includes(listing.listingId)
                        )}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative w-16 h-12 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={listing.imageUrl || "/properties/suburban-dream.png"}
                              alt={listing.title || "Property image"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium truncate">{listing.title}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className={statusColors[listing.listingType]}>
                                  {statusLabels[listing.listingType]}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span>{listing.referenceNumber}</span>
                              {listing.city && (
                                <div className="flex items-center">
                                  <Map className="h-3 w-3 mr-1" />
                                  {listing.city}
                                </div>
                              )}
                              <span className="font-medium text-gray-900">
                                {formatPrice(listing.price)}€
                                {listing.listingType === "Rent" ? "/mes" : ""}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              {listing.bedrooms && (
                                <div className="flex items-center">
                                  <Bed className="h-3 w-3 mr-1" />
                                  {listing.bedrooms}
                                </div>
                              )}
                              {listing.bathrooms && (
                                <div className="flex items-center">
                                  <Bath className="h-3 w-3 mr-1" />
                                  {Math.floor(Number(listing.bathrooms))}
                                </div>
                              )}
                              {listing.squareMeter && (
                                <div className="flex items-center">
                                  <Square className="h-3 w-3 mr-1" />
                                  {listing.squareMeter}m²
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No se encontraron propiedades
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        )

      default:
        return <div>Contenido no encontrado</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              CREAR NUEVO CONTACTO
            </h1>
            
            {/* Progress indicator */}
            <div className="flex items-center justify-center mb-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      index <= currentStep
                        ? "bg-gradient-to-r from-blue-400 to-yellow-300 border-transparent text-white shadow-lg"
                        : "bg-gray-100 border-2 border-gray-300 text-gray-400"
                    }`}
                  >
                    {step.icon}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-0.5 mx-2 ${
                        index < currentStep ? "bg-gradient-to-r from-blue-400 to-yellow-300" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {steps[currentStep]?.title}
            </h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: direction === "forward" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction === "forward" ? -20 : 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0 || isCreating}
              className="flex items-center space-x-2 h-10"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </Button>

            <Button 
              onClick={nextStep} 
              disabled={isCreating}
              className="flex items-center space-x-2 h-10"
            >
              {isCreating ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Creando contacto...</span>
                </>
              ) : (
                <>
                  <span>{currentStep === steps.length - 1 ? "Crear Contacto" : "Siguiente"}</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
