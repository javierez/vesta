"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Card } from "~/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Checkbox } from "~/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Info, Loader } from "lucide-react"
import { cn } from "~/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { formatPropertyReference, getDisplayReference } from "~/lib/property-utils"
import { createPropertyFromCadastral } from "~/server/queries/properties"

// Base form data interface
interface BaseFormData {
  // Initial questions
  cadastralReference: string
  propertySheetFilled: boolean

  // Basic Information
  referenceNumber: number
  title: string
  price: string
  listingType: string
  status: string
  propertyType: string

  // Location
  street: string
  addressDetails: string
  postalCode: string
  city: string
  province: string
  municipality: string
  neighborhood: string
  latitude: string
  longitude: string

  // Property Specifications
  squareMeter: string
  builtSurfaceArea: string
  bedrooms: string
  bathrooms: string
  yearBuilt: string
  buildingFloors: string
  energyCertification: string

  // Construction & Renovation
  brandNew: boolean
  newConstruction: boolean
  underConstruction: boolean
  needsRenovation: boolean
  lastRenovationYear: string

  // Features & Amenities
  hasHeating: boolean
  heatingType: string
  hotWaterType: string
  airConditioningType: string
  hasElevator: boolean
  disabledAccessible: boolean
  vpo: boolean

  // Security Features
  videoIntercom: boolean
  conciergeService: boolean
  securityGuard: boolean
  alarm: boolean
  securityDoor: boolean
  doubleGlazing: boolean
  satelliteDish: boolean

  // Kitchen Features
  kitchenType: string
  openKitchen: boolean
  frenchKitchen: boolean
  furnishedKitchen: boolean
  pantry: boolean

  // Garage & Storage
  hasGarage: boolean
  garageType: string
  garageSpaces: string
  garageInBuilding: boolean
  elevatorToGarage: boolean
  garageNumber: string
  hasStorageRoom: boolean
  storageRoomSize: string
  storageRoomNumber: string

  // Additional Spaces
  terrace: boolean
  terraceSize: string
  balconyCount: string
  galleryCount: string
  livingRoomSize: string
  wineCellar: boolean
  wineCellarSize: string

  // Views & Exterior
  exterior: boolean
  bright: boolean
  views: boolean
  mountainViews: boolean
  seaViews: boolean
  beachfront: boolean

  // Premium Features
  garden: boolean
  pool: boolean
  jacuzzi: boolean
  hydromassage: boolean
  homeAutomation: boolean
  musicSystem: boolean
  fireplace: boolean

  // Additional Features
  laundryRoom: boolean
  coveredClothesline: boolean
  builtInWardrobes: boolean
  mainFloorType: string
  shutterType: string
  carpentryType: string
  windowType: string
  orientation: string

  // Rental Specific
  isFurnished: boolean
  furnitureQuality: string
  optionalGarage: boolean
  optionalGaragePrice: string
  optionalStorageRoom: boolean
  optionalStorageRoomPrice: string
  studentFriendly: boolean
  petsAllowed: boolean
  appliancesIncluded: boolean

  // Additional Info
  hasKeys: boolean
  isFeatured: boolean
  isBankOwned: boolean
  viewCount: string
  inquiryCount: string
}

const initialFormData: BaseFormData = {
  cadastralReference: "",
  propertySheetFilled: false,
  referenceNumber: 0,
  title: "",
  price: "",
  listingType: "Sale",
  status: "available",
  propertyType: "piso",
  street: "",
  addressDetails: "",
  postalCode: "",
  city: "",
  province: "",
  municipality: "",
  neighborhood: "",
  latitude: "",
  longitude: "",
  squareMeter: "",
  builtSurfaceArea: "",
  bedrooms: "",
  bathrooms: "",
  yearBuilt: "",
  buildingFloors: "",
  energyCertification: "",
  brandNew: false,
  newConstruction: false,
  underConstruction: false,
  needsRenovation: false,
  lastRenovationYear: "",
  hasHeating: false,
  heatingType: "",
  hotWaterType: "",
  airConditioningType: "",
  hasElevator: false,
  disabledAccessible: false,
  vpo: false,
  videoIntercom: false,
  conciergeService: false,
  securityGuard: false,
  alarm: false,
  securityDoor: false,
  doubleGlazing: false,
  satelliteDish: false,
  kitchenType: "",
  openKitchen: false,
  frenchKitchen: false,
  furnishedKitchen: false,
  pantry: false,
  hasGarage: false,
  garageType: "",
  garageSpaces: "",
  garageInBuilding: false,
  elevatorToGarage: false,
  garageNumber: "",
  hasStorageRoom: false,
  storageRoomSize: "",
  storageRoomNumber: "",
  terrace: false,
  terraceSize: "",
  balconyCount: "",
  galleryCount: "",
  livingRoomSize: "",
  wineCellar: false,
  wineCellarSize: "",
  exterior: false,
  bright: false,
  views: false,
  mountainViews: false,
  seaViews: false,
  beachfront: false,
  garden: false,
  pool: false,
  jacuzzi: false,
  hydromassage: false,
  homeAutomation: false,
  musicSystem: false,
  fireplace: false,
  laundryRoom: false,
  coveredClothesline: false,
  builtInWardrobes: false,
  mainFloorType: "",
  shutterType: "",
  carpentryType: "",
  windowType: "",
  orientation: "",
  isFurnished: false,
  furnitureQuality: "",
  optionalGarage: false,
  optionalGaragePrice: "",
  optionalStorageRoom: false,
  optionalStorageRoomPrice: "",
  studentFriendly: false,
  petsAllowed: false,
  appliancesIncluded: false,
  hasKeys: false,
  isFeatured: false,
  isBankOwned: false,
  viewCount: "",
  inquiryCount: "",
}

// Step definitions
interface Step {
  id: string
  title: string
  propertyTypes?: string[]
}

// Common steps for all property types
const commonSteps: Step[] = [
  { id: "initial", title: "Información Inicial" },
  { id: "basic", title: "Información Básica" },
  { id: "location", title: "Ubicación" },
]

// Property-specific steps
const pisoSteps: Step[] = [
  ...commonSteps,
  { id: "specifications", title: "Especificaciones", propertyTypes: ["piso"] },
  { id: "construction", title: "Construcción", propertyTypes: ["piso", "casa"] },
  { id: "amenities", title: "Comodidades", propertyTypes: ["piso", "casa"] },
  { id: "security", title: "Seguridad", propertyTypes: ["piso", "casa"] },
  { id: "kitchen", title: "Cocina", propertyTypes: ["piso", "casa"] },
  { id: "garage", title: "Garaje y Almacén", propertyTypes: ["piso", "casa"] },
  { id: "spaces", title: "Espacios Adicionales", propertyTypes: ["piso", "casa"] },
  { id: "views", title: "Vistas y Exterior", propertyTypes: ["piso", "casa"] },
  { id: "premium", title: "Características Premium", propertyTypes: ["piso", "casa"] },
  { id: "additional", title: "Características Adicionales", propertyTypes: ["piso", "casa"] },
  { id: "rental", title: "Específico para Alquiler", propertyTypes: ["piso", "casa"] },
  { id: "final", title: "Información Final" },
]

const casaSteps: Step[] = [
  ...commonSteps,
  { id: "specifications", title: "Especificaciones", propertyTypes: ["casa"] },
  { id: "plot", title: "Parcela y Terreno", propertyTypes: ["casa"] },
  { id: "construction", title: "Construcción", propertyTypes: ["piso", "casa"] },
  { id: "amenities", title: "Comodidades", propertyTypes: ["piso", "casa"] },
  { id: "security", title: "Seguridad", propertyTypes: ["piso", "casa"] },
  { id: "kitchen", title: "Cocina", propertyTypes: ["piso", "casa"] },
  { id: "garage", title: "Garaje y Almacén", propertyTypes: ["piso", "casa"] },
  { id: "spaces", title: "Espacios Adicionales", propertyTypes: ["piso", "casa"] },
  { id: "views", title: "Vistas y Exterior", propertyTypes: ["piso", "casa"] },
  { id: "premium", title: "Características Premium", propertyTypes: ["piso", "casa"] },
  { id: "additional", title: "Características Adicionales", propertyTypes: ["piso", "casa"] },
  { id: "rental", title: "Específico para Alquiler", propertyTypes: ["piso", "casa"] },
  { id: "final", title: "Información Final" },
]

const garajeSteps: Step[] = [
  ...commonSteps,
  { id: "garage-specs", title: "Especificaciones del Garaje", propertyTypes: ["garaje"] },
  { id: "garage-access", title: "Acceso y Seguridad", propertyTypes: ["garaje"] },
  { id: "final", title: "Información Final" },
]

const localSteps: Step[] = [
  ...commonSteps,
  { id: "local-specs", title: "Especificaciones del Local", propertyTypes: ["local"] },
  { id: "local-features", title: "Características Comerciales", propertyTypes: ["local"] },
  { id: "local-utilities", title: "Servicios y Suministros", propertyTypes: ["local"] },
  { id: "final", title: "Información Final" },
]

const solarSteps: Step[] = [
  ...commonSteps,
  { id: "solar-specs", title: "Especificaciones del Solar", propertyTypes: ["solar"] },
  { id: "solar-planning", title: "Urbanismo y Edificabilidad", propertyTypes: ["solar"] },
  { id: "final", title: "Información Final" },
]

// Step configuration mapping
const stepConfigurations = {
  piso: pisoSteps,
  casa: casaSteps,
  garaje: garajeSteps,
  local: localSteps,
  solar: solarSteps,
}

type PropertyType = keyof typeof stepConfigurations

export default function PropertyQuestionnaire({ listingId }: { listingId?: string }) {
  const [currentStep, setCurrentStep] = useState(listingId ? 1 : 0)
  const [formData, setFormData] = useState<BaseFormData>(initialFormData)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")
  const [showCadastralTooltip, setShowCadastralTooltip] = useState(false)
  const [showUploadTooltip, setShowUploadTooltip] = useState(false)
  const [isCreatingProperty, setIsCreatingProperty] = useState(false)

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.tooltip-container')) {
        setShowCadastralTooltip(false)
        setShowUploadTooltip(false)
      }
    }

    if (showCadastralTooltip || showUploadTooltip) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCadastralTooltip, showUploadTooltip])

  // Get current steps based on property type
  const currentSteps = useMemo(() => {
    const propertyType = formData.propertyType as PropertyType
    return stepConfigurations[propertyType] || pisoSteps
  }, [formData.propertyType])

  // Reset to step 2 (location) when property type changes after basic info
  const handlePropertyTypeChange = (newPropertyType: string) => {
    setFormData((prev) => ({ ...prev, propertyType: newPropertyType }))

    // If we're past the basic information step, reset to location step
    if (currentStep > 1) {
      setCurrentStep(2) // Reset to location step (first step after basic info)
    }
  }

  const updateFormData = (field: keyof BaseFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleInputChange = (field: keyof BaseFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData(field, e.target.value)
  }

  const handleSelectChange = (field: keyof BaseFormData) => (value: string) => {
    updateFormData(field, value)
  }

  const handleCheckboxChange = (field: keyof BaseFormData) => (checked: boolean) => {
    updateFormData(field, checked)
  }

  // Client-side function that calls the server action
  const handleCreatePropertyFromCadastral = async (cadastralReference: string) => {
    try {
      setIsCreatingProperty(true)
      // Call the server action
      const newProperty = await createPropertyFromCadastral(cadastralReference);
      
    } catch (error) {
      console.error("Error creating property:", error);
      alert("Error al crear la propiedad. Por favor, inténtalo de nuevo.");
    } finally {
      setIsCreatingProperty(false)
    }
  };

  const nextStep = async () => {
    // If we're on the initial step and cadastral reference is filled, create property
    // Skip this if we already have a listingId (property already created)
    if (currentStep === 0 && !listingId && formData.cadastralReference.trim()) {
      await handleCreatePropertyFromCadastral(formData.cadastralReference.trim())
    }
    
    if (currentStep < currentSteps.length - 1) {
      setDirection("forward")
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection("backward")
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = () => {
    console.log("Form submitted:", formData)
    alert("¡Formulario enviado correctamente!")
  }

  // Get property type display name
  const getPropertyTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      piso: "Piso",
      casa: "Casa",
      garaje: "Garaje",
      local: "Local",
      solar: "Solar",
    }
    return types[type] || type
  }

  const renderStepContent = () => {
    const step = currentSteps[currentStep]
    const propertyType = formData.propertyType as PropertyType

    if (!step) {
      return <div>Step not found</div>
    }

    switch (step.id) {
      case "initial":
        return (
          <div className="space-y-8">
            {/* Referencia Catastral Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-md font-medium text-gray-900">Referencia Catastral</h3>
                <div className="relative tooltip-container">
                  <button
                    className="w-5 h-5 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium hover:bg-gray-200 transition-colors"
                    onClick={() => setShowCadastralTooltip(!showCadastralTooltip)}
                  >
                    <Info className="w-3 h-3" />
                  </button>
                  {showCadastralTooltip && (
                    <div className="absolute top-8 left-0 z-10 w-64 p-3 bg-gray-600 text-white text-sm rounded-lg shadow-lg">
                      <p>Rellenar las fichas lleva <span className="font-bold text-orange-300">30 minutos</span> de media. Ahorra 4 minutos introduciendo la referencia catastral</p>
                      <div className="absolute -top-1 left-3 w-2 h-2 bg-gray-600 transform rotate-45"></div>
                    </div>
                  )}
                </div>
              </div>
              <Input
                id="cadastralReference"
                value={formData.cadastralReference}
                onChange={handleInputChange("cadastralReference")}
                placeholder="Introduzca la referencia catastral"
                className="h-12 text-sm"
              />
            </div>

            {/* Ficha de Propiedad Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-md font-medium text-gray-900">Ficha de Propiedad</h3>
                <div className="relative tooltip-container">
                  <button
                    className="w-5 h-5 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium hover:bg-gray-200 transition-colors"
                    onClick={() => setShowUploadTooltip(!showUploadTooltip)}
                  >
                    <Info className="w-3 h-3" />
                  </button>
                  {showUploadTooltip && (
                    <div className="absolute top-8 left-0 z-10 w-72 p-3 bg-gray-600 text-white text-sm rounded-lg shadow-lg">
                      <p>Ahorra hasta <span className="font-bold text-orange-300">15 minutos</span> si tienes una foto de la ficha o el documento completado en PDF</p>
                      <div className="absolute -top-1 left-3 w-2 h-2 bg-gray-600 transform rotate-45"></div>
                    </div>
                  )}
                </div>
              </div>
              <div
                className="bg-gray-50 rounded-lg p-6 text-center hover:bg-gray-100 transition-colors cursor-pointer group border border-dashed border-gray-300 hover:border-gray-400"
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                <div className="space-y-3">
                  <div className="mx-auto w-10 h-10 bg-white rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Subir documentos o tomar foto</p>
                    <p className="text-xs text-gray-500">PDF, DOC, JPG, PNG o usar cámara</p>
                  </div>
                </div>
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    console.log("Files selected:", e.target.files)
                    // Handle both file uploads and camera captures
                    if (e.target.files && e.target.files.length > 0) {
                      Array.from(e.target.files).forEach(file => {
                        console.log("File:", file.name, "Type:", file.type, "Size:", file.size)
                      })
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )

      case "basic":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="referenceNumber" className="text-sm">
                  Número de Referencia
                </Label>
                <Input
                  id="referenceNumber"
                  value={formData.referenceNumber > 0 ? formatPropertyReference(formData.referenceNumber) : ""}
                  onChange={(e) => {
                    const value = e.target.value.replace('#', '')
                    const numValue = parseInt(value) || 0
                    updateFormData("referenceNumber", numValue)
                  }}
                  placeholder="Se generará automáticamente"
                  className="h-8"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm">
                  Precio (€)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange("price")}
                  placeholder="250000"
                  className="h-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm">
                Título del Anuncio
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleInputChange("title")}
                placeholder="Piso en venta en el centro de la ciudad"
                className="h-8"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="listingType" className="text-sm">
                  Tipo de Anuncio
                </Label>
                <Select value={formData.listingType} onValueChange={handleSelectChange("listingType")}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sale">Venta</SelectItem>
                    <SelectItem value="Rent">Alquiler</SelectItem>
                    <SelectItem value="Transfer">Traspaso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyType" className="text-sm">
                  Tipo de Propiedad *
                </Label>
                <Select value={formData.propertyType} onValueChange={handlePropertyTypeChange}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piso">Piso</SelectItem>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="garaje">Garaje</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="solar">Solar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm">
                Estado
              </Label>
              <Select value={formData.status} onValueChange={handleSelectChange("status")}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="reserved">Reservado</SelectItem>
                  <SelectItem value="sold">Vendido</SelectItem>
                  <SelectItem value="rented">Alquilado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {currentStep === 1 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Importante:</strong> El tipo de propiedad determinará las siguientes secciones del
                  cuestionario. Asegúrate de seleccionar el tipo correcto antes de continuar.
                </p>
              </div>
            )}
          </div>
        )

      case "location":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street" className="text-sm">
                Calle
              </Label>
              <Input
                id="street"
                value={formData.street}
                onChange={handleInputChange("street")}
                placeholder="Calle Mayor, 123"
                className="h-8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressDetails" className="text-sm">
                Detalles de la Dirección
              </Label>
              <Input
                id="addressDetails"
                value={formData.addressDetails}
                onChange={handleInputChange("addressDetails")}
                placeholder="Piso 3º, Puerta A"
                className="h-8"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-sm">
                  Código Postal
                </Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange("postalCode")}
                  placeholder="28001"
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm">
                  Ciudad
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={handleInputChange("city")}
                  placeholder="Madrid"
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province" className="text-sm">
                  Provincia
                </Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={handleInputChange("province")}
                  placeholder="Madrid"
                  className="h-8"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="municipality" className="text-sm">
                  Municipio
                </Label>
                <Input
                  id="municipality"
                  value={formData.municipality}
                  onChange={handleInputChange("municipality")}
                  placeholder="Madrid"
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood" className="text-sm">
                  Barrio
                </Label>
                <Input
                  id="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange("neighborhood")}
                  placeholder="Centro"
                  className="h-8"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-sm">
                  Latitud
                </Label>
                <Input
                  id="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange("latitude")}
                  placeholder="40.4168"
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-sm">
                  Longitud
                </Label>
                <Input
                  id="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange("longitude")}
                  placeholder="-3.7038"
                  className="h-8"
                />
              </div>
            </div>
          </div>
        )

      case "specifications":
        if (propertyType === "piso") {
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="squareMeter" className="text-sm">
                    Superficie (m²)
                  </Label>
                  <Input
                    id="squareMeter"
                    type="number"
                    value={formData.squareMeter}
                    onChange={handleInputChange("squareMeter")}
                    placeholder="85"
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="builtSurfaceArea" className="text-sm">
                    Superficie Construida (m²)
                  </Label>
                  <Input
                    id="builtSurfaceArea"
                    type="number"
                    value={formData.builtSurfaceArea}
                    onChange={handleInputChange("builtSurfaceArea")}
                    placeholder="95"
                    className="h-8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms" className="text-sm">
                    Dormitorios
                  </Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={handleInputChange("bedrooms")}
                    placeholder="3"
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms" className="text-sm">
                    Baños
                  </Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={handleInputChange("bathrooms")}
                    placeholder="2"
                    className="h-8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearBuilt" className="text-sm">
                    Año de Construcción
                  </Label>
                  <Input
                    id="yearBuilt"
                    type="number"
                    value={formData.yearBuilt}
                    onChange={handleInputChange("yearBuilt")}
                    placeholder="1995"
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buildingFloors" className="text-sm">
                    Plantas del Edificio
                  </Label>
                  <Input
                    id="buildingFloors"
                    type="number"
                    value={formData.buildingFloors}
                    onChange={handleInputChange("buildingFloors")}
                    placeholder="5"
                    className="h-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="energyCertification" className="text-sm">
                  Certificación Energética
                </Label>
                <Select
                  value={formData.energyCertification}
                  onValueChange={handleSelectChange("energyCertification")}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Seleccionar certificación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="E">E</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                    <SelectItem value="G">G</SelectItem>
                    <SelectItem value="pending">En trámite</SelectItem>
                    <SelectItem value="exempt">Exento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )
        }
        return <div>Especificaciones para {getPropertyTypeDisplay(propertyType)}</div>

      case "construction":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="brandNew"
                  checked={formData.brandNew}
                  onCheckedChange={handleCheckboxChange("brandNew")}
                />
                <Label htmlFor="brandNew" className="text-sm">
                  A estrenar
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="newConstruction"
                  checked={formData.newConstruction}
                  onCheckedChange={handleCheckboxChange("newConstruction")}
                />
                <Label htmlFor="newConstruction" className="text-sm">
                  Obra nueva
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="underConstruction"
                  checked={formData.underConstruction}
                  onCheckedChange={handleCheckboxChange("underConstruction")}
                />
                <Label htmlFor="underConstruction" className="text-sm">
                  En construcción
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="needsRenovation"
                  checked={formData.needsRenovation}
                  onCheckedChange={handleCheckboxChange("needsRenovation")}
                />
                <Label htmlFor="needsRenovation" className="text-sm">
                  Necesita reformas
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastRenovationYear" className="text-sm">
                Año de Última Renovación
              </Label>
              <Input
                id="lastRenovationYear"
                type="number"
                value={formData.lastRenovationYear}
                onChange={handleInputChange("lastRenovationYear")}
                placeholder="2020"
                className="h-8"
              />
            </div>
          </div>
        )

      case "amenities":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasHeating"
                  checked={formData.hasHeating}
                  onCheckedChange={handleCheckboxChange("hasHeating")}
                />
                <Label htmlFor="hasHeating" className="text-sm">
                  Calefacción
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasElevator"
                  checked={formData.hasElevator}
                  onCheckedChange={handleCheckboxChange("hasElevator")}
                />
                <Label htmlFor="hasElevator" className="text-sm">
                  Ascensor
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="disabledAccessible"
                  checked={formData.disabledAccessible}
                  onCheckedChange={handleCheckboxChange("disabledAccessible")}
                />
                <Label htmlFor="disabledAccessible" className="text-sm">
                  Accesible
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vpo"
                  checked={formData.vpo}
                  onCheckedChange={handleCheckboxChange("vpo")}
                />
                <Label htmlFor="vpo" className="text-sm">
                  VPO
                </Label>
              </div>
            </div>
            {formData.hasHeating && (
              <div className="space-y-2">
                <Label htmlFor="heatingType" className="text-sm">
                  Tipo de Calefacción
                </Label>
                <Select value={formData.heatingType} onValueChange={handleSelectChange("heatingType")}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="central">Central</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="gas">Gas</SelectItem>
                    <SelectItem value="electric">Eléctrica</SelectItem>
                    <SelectItem value="radiators">Radiadores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="hotWaterType" className="text-sm">
                Tipo de Agua Caliente
              </Label>
              <Select value={formData.hotWaterType} onValueChange={handleSelectChange("hotWaterType")}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gas">Gas</SelectItem>
                  <SelectItem value="electric">Eléctrico</SelectItem>
                  <SelectItem value="solar">Solar</SelectItem>
                  <SelectItem value="central">Central</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="airConditioningType" className="text-sm">
                Aire Acondicionado
              </Label>
              <Select
                value={formData.airConditioningType}
                onValueChange={handleSelectChange("airConditioningType")}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin aire acondicionado</SelectItem>
                  <SelectItem value="central">Central</SelectItem>
                  <SelectItem value="split">Split</SelectItem>
                  <SelectItem value="ducted">Por conductos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "security":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="videoIntercom"
                  checked={formData.videoIntercom}
                  onCheckedChange={handleCheckboxChange("videoIntercom")}
                />
                <Label htmlFor="videoIntercom" className="text-sm">
                  Videoportero
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conciergeService"
                  checked={formData.conciergeService}
                  onCheckedChange={handleCheckboxChange("conciergeService")}
                />
                <Label htmlFor="conciergeService" className="text-sm">
                  Conserjería
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="securityGuard"
                  checked={formData.securityGuard}
                  onCheckedChange={handleCheckboxChange("securityGuard")}
                />
                <Label htmlFor="securityGuard" className="text-sm">
                  Vigilancia
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="alarm"
                  checked={formData.alarm}
                  onCheckedChange={handleCheckboxChange("alarm")}
                />
                <Label htmlFor="alarm" className="text-sm">
                  Alarma
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="securityDoor"
                  checked={formData.securityDoor}
                  onCheckedChange={handleCheckboxChange("securityDoor")}
                />
                <Label htmlFor="securityDoor" className="text-sm">
                  Puerta blindada
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="doubleGlazing"
                  checked={formData.doubleGlazing}
                  onCheckedChange={handleCheckboxChange("doubleGlazing")}
                />
                <Label htmlFor="doubleGlazing" className="text-sm">
                  Doble acristalamiento
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="satelliteDish"
                  checked={formData.satelliteDish}
                  onCheckedChange={handleCheckboxChange("satelliteDish")}
                />
                <Label htmlFor="satelliteDish" className="text-sm">
                  Antena parabólica
                </Label>
              </div>
            </div>
          </div>
        )

      case "kitchen":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kitchenType" className="text-sm">
                Tipo de Cocina
              </Label>
              <Select value={formData.kitchenType} onValueChange={handleSelectChange("kitchenType")}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">Independiente</SelectItem>
                  <SelectItem value="american">Americana</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="integrated">Integrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="openKitchen"
                  checked={formData.openKitchen}
                  onCheckedChange={handleCheckboxChange("openKitchen")}
                />
                <Label htmlFor="openKitchen" className="text-sm">
                  Cocina abierta
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="frenchKitchen"
                  checked={formData.frenchKitchen}
                  onCheckedChange={handleCheckboxChange("frenchKitchen")}
                />
                <Label htmlFor="frenchKitchen" className="text-sm">
                  Cocina francesa
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="furnishedKitchen"
                  checked={formData.furnishedKitchen}
                  onCheckedChange={handleCheckboxChange("furnishedKitchen")}
                />
                <Label htmlFor="furnishedKitchen" className="text-sm">
                  Cocina amueblada
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pantry"
                  checked={formData.pantry}
                  onCheckedChange={handleCheckboxChange("pantry")}
                />
                <Label htmlFor="pantry" className="text-sm">
                  Despensa
                </Label>
              </div>
            </div>
          </div>
        )

      case "garage":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasGarage"
                checked={formData.hasGarage}
                onCheckedChange={handleCheckboxChange("hasGarage")}
              />
              <Label htmlFor="hasGarage" className="text-sm">
                Garaje
              </Label>
            </div>
            {formData.hasGarage && (
              <div className="space-y-4 ml-6 border-l-2 border-gray-200 pl-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="garageType" className="text-sm">
                      Tipo de Garaje
                    </Label>
                    <Select value={formData.garageType} onValueChange={handleSelectChange("garageType")}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="closed">Cerrado</SelectItem>
                        <SelectItem value="open">Abierto</SelectItem>
                        <SelectItem value="covered">Cubierto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="garageSpaces" className="text-sm">
                      Plazas de Garaje
                    </Label>
                    <Input
                      id="garageSpaces"
                      type="number"
                      value={formData.garageSpaces}
                      onChange={handleInputChange("garageSpaces")}
                      placeholder="1"
                      className="h-8"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="garageInBuilding"
                      checked={formData.garageInBuilding}
                      onCheckedChange={handleCheckboxChange("garageInBuilding")}
                    />
                    <Label htmlFor="garageInBuilding" className="text-sm">
                      Garaje en el edificio
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="elevatorToGarage"
                      checked={formData.elevatorToGarage}
                      onCheckedChange={handleCheckboxChange("elevatorToGarage")}
                    />
                    <Label htmlFor="elevatorToGarage" className="text-sm">
                      Ascensor al garaje
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="garageNumber" className="text-sm">
                    Número de Garaje
                  </Label>
                  <Input
                    id="garageNumber"
                    value={formData.garageNumber}
                    onChange={handleInputChange("garageNumber")}
                    placeholder="G-15"
                    className="h-8"
                  />
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasStorageRoom"
                checked={formData.hasStorageRoom}
                onCheckedChange={handleCheckboxChange("hasStorageRoom")}
              />
              <Label htmlFor="hasStorageRoom" className="text-sm">
                Trastero
              </Label>
            </div>
            {formData.hasStorageRoom && (
              <div className="grid grid-cols-2 gap-4 ml-6 border-l-2 border-gray-200 pl-4">
                <div className="space-y-2">
                  <Label htmlFor="storageRoomSize" className="text-sm">
                    Tamaño del Trastero (m²)
                  </Label>
                  <Input
                    id="storageRoomSize"
                    type="number"
                    value={formData.storageRoomSize}
                    onChange={handleInputChange("storageRoomSize")}
                    placeholder="5"
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storageRoomNumber" className="text-sm">
                    Número de Trastero
                  </Label>
                  <Input
                    id="storageRoomNumber"
                    value={formData.storageRoomNumber}
                    onChange={handleInputChange("storageRoomNumber")}
                    placeholder="T-15"
                    className="h-8"
                  />
                </div>
              </div>
            )}
          </div>
        )

      case "spaces":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terrace"
                checked={formData.terrace}
                onCheckedChange={handleCheckboxChange("terrace")}
              />
              <Label htmlFor="terrace" className="text-sm">
                Terraza
              </Label>
            </div>
            {formData.terrace && (
              <div className="space-y-2 ml-6 border-l-2 border-gray-200 pl-4">
                <Label htmlFor="terraceSize" className="text-sm">
                  Tamaño de la Terraza (m²)
                </Label>
                <Input
                  id="terraceSize"
                  type="number"
                  value={formData.terraceSize}
                  onChange={handleInputChange("terraceSize")}
                  placeholder="15"
                  className="h-8"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="balconyCount" className="text-sm">
                  Número de Balcones
                </Label>
                <Input
                  id="balconyCount"
                  type="number"
                  value={formData.balconyCount}
                  onChange={handleInputChange("balconyCount")}
                  placeholder="1"
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="galleryCount" className="text-sm">
                  Número de Galerías
                </Label>
                <Input
                  id="galleryCount"
                  type="number"
                  value={formData.galleryCount}
                  onChange={handleInputChange("galleryCount")}
                  placeholder="0"
                  className="h-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="livingRoomSize" className="text-sm">
                Tamaño del Salón (m²)
              </Label>
              <Input
                id="livingRoomSize"
                type="number"
                value={formData.livingRoomSize}
                onChange={handleInputChange("livingRoomSize")}
                placeholder="25"
                className="h-8"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wineCellar"
                checked={formData.wineCellar}
                onCheckedChange={handleCheckboxChange("wineCellar")}
              />
              <Label htmlFor="wineCellar" className="text-sm">
                Bodega
              </Label>
            </div>
            {formData.wineCellar && (
              <div className="space-y-2 ml-6 border-l-2 border-gray-200 pl-4">
                <Label htmlFor="wineCellarSize" className="text-sm">
                  Tamaño de la Bodega (m²)
                </Label>
                <Input
                  id="wineCellarSize"
                  type="number"
                  value={formData.wineCellarSize}
                  onChange={handleInputChange("wineCellarSize")}
                  placeholder="10"
                  className="h-8"
                />
              </div>
            )}
          </div>
        )

      case "views":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exterior"
                  checked={formData.exterior}
                  onCheckedChange={handleCheckboxChange("exterior")}
                />
                <Label htmlFor="exterior" className="text-sm">
                  Exterior
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bright"
                  checked={formData.bright}
                  onCheckedChange={handleCheckboxChange("bright")}
                />
                <Label htmlFor="bright" className="text-sm">
                  Luminoso
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="views"
                  checked={formData.views}
                  onCheckedChange={handleCheckboxChange("views")}
                />
                <Label htmlFor="views" className="text-sm">
                  Con vistas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mountainViews"
                  checked={formData.mountainViews}
                  onCheckedChange={handleCheckboxChange("mountainViews")}
                />
                <Label htmlFor="mountainViews" className="text-sm">
                  Vistas a la montaña
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="seaViews"
                  checked={formData.seaViews}
                  onCheckedChange={handleCheckboxChange("seaViews")}
                />
                <Label htmlFor="seaViews" className="text-sm">
                  Vistas al mar
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="beachfront"
                  checked={formData.beachfront}
                  onCheckedChange={handleCheckboxChange("beachfront")}
                />
                <Label htmlFor="beachfront" className="text-sm">
                  Primera línea de playa
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orientation" className="text-sm">
                Orientación
              </Label>
              <Select value={formData.orientation} onValueChange={handleSelectChange("orientation")}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Seleccionar orientación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="north">Norte</SelectItem>
                  <SelectItem value="south">Sur</SelectItem>
                  <SelectItem value="east">Este</SelectItem>
                  <SelectItem value="west">Oeste</SelectItem>
                  <SelectItem value="northeast">Noreste</SelectItem>
                  <SelectItem value="northwest">Noroeste</SelectItem>
                  <SelectItem value="southeast">Sureste</SelectItem>
                  <SelectItem value="southwest">Suroeste</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "premium":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="garden"
                  checked={formData.garden}
                  onCheckedChange={handleCheckboxChange("garden")}
                />
                <Label htmlFor="garden" className="text-sm">
                  Jardín
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pool"
                  checked={formData.pool}
                  onCheckedChange={handleCheckboxChange("pool")}
                />
                <Label htmlFor="pool" className="text-sm">
                  Piscina
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="jacuzzi"
                  checked={formData.jacuzzi}
                  onCheckedChange={handleCheckboxChange("jacuzzi")}
                />
                <Label htmlFor="jacuzzi" className="text-sm">
                  Jacuzzi
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hydromassage"
                  checked={formData.hydromassage}
                  onCheckedChange={handleCheckboxChange("hydromassage")}
                />
                <Label htmlFor="hydromassage" className="text-sm">
                  Hidromasaje
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="homeAutomation"
                  checked={formData.homeAutomation}
                  onCheckedChange={handleCheckboxChange("homeAutomation")}
                />
                <Label htmlFor="homeAutomation" className="text-sm">
                  Domótica
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="musicSystem"
                  checked={formData.musicSystem}
                  onCheckedChange={handleCheckboxChange("musicSystem")}
                />
                <Label htmlFor="musicSystem" className="text-sm">
                  Sistema de música
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fireplace"
                  checked={formData.fireplace}
                  onCheckedChange={handleCheckboxChange("fireplace")}
                />
                <Label htmlFor="fireplace" className="text-sm">
                  Chimenea
                </Label>
              </div>
            </div>
          </div>
        )

      case "additional":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="laundryRoom"
                  checked={formData.laundryRoom}
                  onCheckedChange={handleCheckboxChange("laundryRoom")}
                />
                <Label htmlFor="laundryRoom" className="text-sm">
                  Lavadero
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="coveredClothesline"
                  checked={formData.coveredClothesline}
                  onCheckedChange={handleCheckboxChange("coveredClothesline")}
                />
                <Label htmlFor="coveredClothesline" className="text-sm">
                  Tendedero cubierto
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="builtInWardrobes"
                  checked={formData.builtInWardrobes}
                  onCheckedChange={handleCheckboxChange("builtInWardrobes")}
                />
                <Label htmlFor="builtInWardrobes" className="text-sm">
                  Armarios empotrados
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mainFloorType" className="text-sm">
                  Tipo de Suelo Principal
                </Label>
                <Select
                  value={formData.mainFloorType}
                  onValueChange={handleSelectChange("mainFloorType")}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parquet">Parquet</SelectItem>
                    <SelectItem value="tile">Baldosa</SelectItem>
                    <SelectItem value="marble">Mármol</SelectItem>
                    <SelectItem value="ceramic">Gres</SelectItem>
                    <SelectItem value="laminate">Laminado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shutterType" className="text-sm">
                  Tipo de Persianas
                </Label>
                <Select value={formData.shutterType} onValueChange={handleSelectChange("shutterType")}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electric">Eléctricas</SelectItem>
                    <SelectItem value="manual">Manuales</SelectItem>
                    <SelectItem value="automatic">Automáticas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carpentryType" className="text-sm">
                  Tipo de Carpintería
                </Label>
                <Select
                  value={formData.carpentryType}
                  onValueChange={handleSelectChange("carpentryType")}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wood">Madera</SelectItem>
                    <SelectItem value="aluminum">Aluminio</SelectItem>
                    <SelectItem value="pvc">PVC</SelectItem>
                    <SelectItem value="mixed">Mixta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="windowType" className="text-sm">
                  Tipo de Ventanas
                </Label>
                <Select value={formData.windowType} onValueChange={handleSelectChange("windowType")}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Simple</SelectItem>
                    <SelectItem value="double">Doble</SelectItem>
                    <SelectItem value="climalit">Climalit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case "rental":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFurnished"
                  checked={formData.isFurnished}
                  onCheckedChange={handleCheckboxChange("isFurnished")}
                />
                <Label htmlFor="isFurnished" className="text-sm">
                  Amueblado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="studentFriendly"
                  checked={formData.studentFriendly}
                  onCheckedChange={handleCheckboxChange("studentFriendly")}
                />
                <Label htmlFor="studentFriendly" className="text-sm">
                  Apto para estudiantes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="petsAllowed"
                  checked={formData.petsAllowed}
                  onCheckedChange={handleCheckboxChange("petsAllowed")}
                />
                <Label htmlFor="petsAllowed" className="text-sm">
                  Se admiten mascotas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="appliancesIncluded"
                  checked={formData.appliancesIncluded}
                  onCheckedChange={handleCheckboxChange("appliancesIncluded")}
                />
                <Label htmlFor="appliancesIncluded" className="text-sm">
                  Electrodomésticos incluidos
                </Label>
              </div>
            </div>
            {formData.isFurnished && (
              <div className="space-y-2">
                <Label htmlFor="furnitureQuality" className="text-sm">
                  Calidad del Mobiliario
                </Label>
                <Select
                  value={formData.furnitureQuality}
                  onValueChange={handleSelectChange("furnitureQuality")}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Seleccionar calidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="good">Bueno</SelectItem>
                    <SelectItem value="excellent">Excelente</SelectItem>
                    <SelectItem value="luxury">Lujo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="optionalGarage"
                  checked={formData.optionalGarage}
                  onCheckedChange={handleCheckboxChange("optionalGarage")}
                />
                <Label htmlFor="optionalGarage" className="text-sm">
                  Garaje opcional
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="optionalStorageRoom"
                  checked={formData.optionalStorageRoom}
                  onCheckedChange={handleCheckboxChange("optionalStorageRoom")}
                />
                <Label htmlFor="optionalStorageRoom" className="text-sm">
                  Trastero opcional
                </Label>
              </div>
            </div>
            {formData.optionalGarage && (
              <div className="space-y-2">
                <Label htmlFor="optionalGaragePrice" className="text-sm">
                  Precio Garaje Opcional (€/mes)
                </Label>
                <Input
                  id="optionalGaragePrice"
                  type="number"
                  value={formData.optionalGaragePrice}
                  onChange={handleInputChange("optionalGaragePrice")}
                  placeholder="50"
                  className="h-8"
                />
              </div>
            )}
            {formData.optionalStorageRoom && (
              <div className="space-y-2">
                <Label htmlFor="optionalStorageRoomPrice" className="text-sm">
                  Precio Trastero Opcional (€/mes)
                </Label>
                <Input
                  id="optionalStorageRoomPrice"
                  type="number"
                  value={formData.optionalStorageRoomPrice}
                  onChange={handleInputChange("optionalStorageRoomPrice")}
                  placeholder="25"
                  className="h-8"
                />
              </div>
            )}
          </div>
        )

      case "final":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasKeys"
                  checked={formData.hasKeys}
                  onCheckedChange={handleCheckboxChange("hasKeys")}
                />
                <Label htmlFor="hasKeys" className="text-sm">
                  Tenemos las llaves
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={handleCheckboxChange("isFeatured")}
                />
                <Label htmlFor="isFeatured" className="text-sm">
                  Inmueble destacado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isBankOwned"
                  checked={formData.isBankOwned}
                  onCheckedChange={handleCheckboxChange("isBankOwned")}
                />
                <Label htmlFor="isBankOwned" className="text-sm">
                  Propiedad bancaria
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="viewCount" className="text-sm">
                  Número de Visualizaciones
                </Label>
                <Input
                  id="viewCount"
                  type="number"
                  value={formData.viewCount}
                  onChange={handleInputChange("viewCount")}
                  placeholder="0"
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inquiryCount" className="text-sm">
                  Número de Consultas
                </Label>
                <Input
                  id="inquiryCount"
                  type="number"
                  value={formData.inquiryCount}
                  onChange={handleInputChange("inquiryCount")}
                  placeholder="0"
                  className="h-8"
                />
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Contenido específico para {getPropertyTypeDisplay(propertyType)} - {step.id}
            </p>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm">Este paso contendría campos específicos para el tipo de propiedad seleccionado.</p>
            </div>
          </div>
        )
    }
  }

  // Modern step indicator component
  const StepIndicator = () => {
    if (!currentSteps || currentSteps.length === 0) {
      return null
    }

    // If we have a listingId, show one completed dot plus the current steps
    const totalSteps = listingId ? currentSteps.length + 1 : currentSteps.length
    const completedSteps = listingId ? 1 : 0
    const currentStepIndex = listingId ? currentStep + 1 : currentStep

    return (
      <div className="flex items-center justify-center space-x-2 mb-8">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index < completedSteps ? "bg-amber-600" : // Completed steps
                index === currentStepIndex ? "bg-amber-700 scale-125" : // Current step
                index < currentStepIndex ? "bg-amber-600" : // Past steps
                "bg-gray-300", // Future steps
              )}
            />
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "w-4 h-0.5 mx-1 transition-all duration-300",
                  index < currentStepIndex ? "bg-amber-600" : "bg-gray-300",
                )}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="mb-16">
            <h1 className="text-xl font-semibold text-gray-900 mb-6 text-center mb-16">
              ALTA NUEVO INMUEBLE
            </h1>
            <StepIndicator />
          </div>

          <div className="mb-6">
            {currentSteps[currentStep]?.id && !["initial", "basic"].includes(currentSteps[currentStep].id) && (
              <h2 className="text-sm font-semibold text-gray-800 mb-4">{currentSteps[currentStep]?.title || "Step"}</h2>
            )}
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
              disabled={currentStep === 0 || isCreatingProperty}
              className="flex items-center space-x-2 h-8"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </Button>

            {currentStep === currentSteps.length - 1 ? (
              <Button onClick={handleSubmit} className="h-8">
                Finalizar
              </Button>
            ) : (
              <Button 
                onClick={nextStep} 
                disabled={isCreatingProperty}
                className="flex items-center space-x-2 h-8"
              >
                {isCreatingProperty ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Creando propiedad...</span>
                  </>
                ) : (
                  <>
                    <span>Siguiente</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

