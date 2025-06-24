"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card } from "~/components/ui/card"
import { FloatingLabelInput } from "~/components/ui/floating-label-input"
import { ChevronLeft, ChevronRight, Info, Loader } from "lucide-react"
import { cn } from "~/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { createPropertyFromCadastral, createPropertyFromLocation } from "~/server/queries/properties"

// Base form data interface
interface BaseFormData {
  // Initial questions
  cadastralReference: string

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
  yearBuilt: string
  propertyType: string
}

const initialFormData: BaseFormData = {
  cadastralReference: "",
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
  yearBuilt: "",
  propertyType: "piso",
}

// Step definitions
interface Step {
  id: string
  title: string
  propertyTypes?: string[]
}

// Simplified steps - only initial and location
const simplifiedSteps: Step[] = [
  { id: "initial", title: "Información Inicial" },
  { id: "location", title: "Dirección" },
]

// Step configuration mapping - all property types now use the same simplified steps
const stepConfigurations = {
  piso: simplifiedSteps,
  casa: simplifiedSteps,
  garaje: simplifiedSteps,
  local: simplifiedSteps,
  solar: simplifiedSteps,
}

type PropertyType = keyof typeof stepConfigurations

export default function PropertyIdentificationForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<BaseFormData>(initialFormData)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")
  const [showCadastralTooltip, setShowCadastralTooltip] = useState(false)
  const [showUploadTooltip, setShowUploadTooltip] = useState(false)
  const [isCreatingProperty, setIsCreatingProperty] = useState(false)
  const router = useRouter()

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
    return stepConfigurations[propertyType] || simplifiedSteps
  }, [formData.propertyType])

  const updateFormData = (field: keyof BaseFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleInputChange = (field: keyof BaseFormData) => (value: string) => {
    updateFormData(field, value)
  }

  const handleEventInputChange = (field: keyof BaseFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData(field, e.target.value)
  }

  // Client-side function that calls the server action for cadastral reference
  const handleCreatePropertyFromCadastral = async (cadastralReference: string) => {
    try {
      setIsCreatingProperty(true)
      // Call the server action
      const newProperty = await createPropertyFromCadastral(cadastralReference);
      console.log("Property created from cadastral:", newProperty);
      
      // Automatically populate form fields with cadastral data
      if (newProperty) {
        setFormData(prev => ({
          ...prev,
          // Location fields
          street: newProperty.street || "",
          addressDetails: newProperty.addressDetails || "",
          postalCode: newProperty.postalCode || "",
          city: newProperty.city || "", // Now populated from geocoding data
          province: newProperty.province || "", // Now populated from geocoding data
          municipality: newProperty.municipality || "", // Now populated from geocoding data
          neighborhood: newProperty.neighborhood || "", // Now populated from geocoding data
          latitude: newProperty.latitude?.toString() || "",
          longitude: newProperty.longitude?.toString() || "",
          // Property specifications
          squareMeter: newProperty.squareMeter?.toString() || "",
          builtSurfaceArea: newProperty.builtSurfaceArea?.toString() || "",
          yearBuilt: newProperty.yearBuilt?.toString() || "",
          propertyType: newProperty.propertyType || "piso",
        }));
      }
      
      return newProperty; // Return the property data for redirection
    } catch (error) {
      console.error("Error creating property:", error);
      alert("Error al crear la propiedad. Por favor, inténtalo de nuevo.");
      throw error; // Re-throw the error so the calling function can handle it
    } finally {
      setIsCreatingProperty(false)
    }
  };

  // Client-side function that calls the server action for manual location data
  const handleCreatePropertyFromLocation = async (locationData: {
    street: string;
    addressDetails?: string;
    postalCode: string;
    city?: string;
    province?: string;
    municipality?: string;
    neighborhood?: string;
  }) => {
    try {
      setIsCreatingProperty(true)
      
      // First, validate address using Nominatim with just street and city
      const addressString = [
        locationData.street,
        locationData.city
      ].filter(Boolean).join(', ')
      
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1&countrycodes=es&addressdetails=1`
      
      const response = await fetch(nominatimUrl)
      const nominatimResults = await response.json()
      
      if (nominatimResults.length === 0) {
        alert("La dirección introducida no se ha encontrado. Por favor, verifica que la dirección y ciudad sean correctos.");
        return null
      }
      
      const result = nominatimResults[0]
      console.log("Nominatim validation successful:", result)
      
      // Auto-fill missing fields with Nominatim data
      const enrichedLocationData = {
        ...locationData,
        postalCode: locationData.postalCode || result.address?.postcode || "",
        city: locationData.city || result.address?.city || result.address?.town || "",
        province: locationData.province || result.address?.state || "",
        municipality: locationData.municipality || result.address?.city || result.address?.town || "",
        neighborhood: locationData.neighborhood || result.address?.suburb || "",
        latitude: result.lat || "",
        longitude: result.lon || ""
      }
      
      // Update form data with enriched information
      setFormData(prev => ({
        ...prev,
        postalCode: enrichedLocationData.postalCode,
        city: enrichedLocationData.city,
        province: enrichedLocationData.province,
        municipality: enrichedLocationData.municipality,
        neighborhood: enrichedLocationData.neighborhood,
        latitude: enrichedLocationData.latitude,
        longitude: enrichedLocationData.longitude
      }))
      
      // Call the server action with enriched data
      const newProperty = await createPropertyFromLocation(enrichedLocationData);
      console.log("Property created from location:", newProperty);
      
      return newProperty; // Return the property data for redirection
    } catch (error) {
      console.error("Error creating property:", error);
      alert("Error al crear la propiedad. Por favor, inténtalo de nuevo.");
      throw error; // Re-throw the error so the calling function can handle it
    } finally {
      setIsCreatingProperty(false)
    }
  };

  const nextStep = async () => {
    // If we're on the initial step and cadastral reference is filled, create property and redirect
    if (currentStep === 0 && formData.cadastralReference.trim()) {
      try {
        const newProperty = await handleCreatePropertyFromCadastral(formData.cadastralReference.trim());
        
        if (newProperty && newProperty.listingId) {
          router.push(`/propiedades/crear/${newProperty.listingId}?method=catastro`);
          return;
        }
      } catch (error) {
        console.error("Error creating property from cadastral:", error);
        alert("Error al crear la propiedad. Por favor, inténtalo de nuevo.");
        return;
      }
    }
    
    // If we're on the location step, validate and create property
    if (currentStep === 1) {
      if (!formData.street.trim()) {
        alert("Por favor, introduce la dirección de la propiedad.");
        return;
      }
      
      try {
        const newProperty = await handleCreatePropertyFromLocation({
          street: formData.street.trim(),
          addressDetails: formData.addressDetails.trim(),
          postalCode: formData.postalCode.trim(),
          city: formData.city.trim(),
          province: formData.province.trim(),
          municipality: formData.municipality.trim(),
          neighborhood: formData.neighborhood.trim(),
        });
        
        // If Nominatim validation failed, newProperty will be null
        if (!newProperty) {
          return; // Don't proceed with redirect
        }
        
        if (newProperty && newProperty.listingId) {
          router.push(`/propiedades/crear/${newProperty.listingId}?method=manual`);
          return;
        }
      } catch (error) {
        console.error("Error creating property from location:", error);
        return;
      }
    }
    
    // If we're on step 0 without cadastral reference, go to next step
    if (currentStep === 0) {
      setDirection("forward")
      setCurrentStep(1)
    }
  }

  const autoCompleteAddress = async () => {
    if (!formData.street.trim()) {
      alert("Por favor, introduce al menos la dirección de la propiedad.");
      return;
    }
    
    try {
      setIsCreatingProperty(true)
      
      // Use Nominatim to auto-complete missing fields
      const addressString = [
        formData.street.trim(),
        formData.city.trim()
      ].filter(Boolean).join(', ')
      
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1&countrycodes=es&addressdetails=1`
      
      const response = await fetch(nominatimUrl)
      const nominatimResults = await response.json()
      
      if (nominatimResults.length === 0) {
        alert("No se pudo encontrar la dirección. Por favor, verifica que la dirección sea correcta.");
        return
      }
      
      const result = nominatimResults[0]
      console.log("Nominatim auto-completion successful:", result)
      
      // Update form data with Nominatim results
      setFormData(prev => ({
        ...prev,
        postalCode: prev.postalCode || result.address?.postcode || "",
        city: prev.city || result.address?.city || result.address?.town || "",
        province: prev.province || result.address?.state || "",
        municipality: prev.municipality || result.address?.city || result.address?.town || "",
        neighborhood: prev.neighborhood || result.address?.suburb || "",
        latitude: result.lat || "",
        longitude: result.lon || ""
      }))
      
    } catch (error) {
      console.error("Error auto-completing address:", error);
      alert("Error al autocompletar la dirección. Por favor, inténtalo de nuevo.");
    } finally {
      setIsCreatingProperty(false)
    }
  }

  // Check if all location fields are filled
  const areAllLocationFieldsFilled = () => {
    return formData.street.trim() && 
           formData.postalCode.trim() && 
           formData.city.trim() && 
           formData.province.trim() && 
           formData.municipality.trim()
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection("backward")
      setCurrentStep((prev) => prev - 1)
    }
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
              <div className="flex items-center space-x-3 mb-4">
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
                onChange={handleEventInputChange("cadastralReference")}
                placeholder="Referencia Catastral"
                className="h-12 text-sm"
              />
            </div>

            {/* Ficha de Propiedad Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
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

      case "location":
        return (
          <div>
            <FloatingLabelInput
              id="street"
              value={formData.street}
              onChange={handleInputChange("street")}
              placeholder="Dirección"
            />
            <FloatingLabelInput
              id="addressDetails"
              value={formData.addressDetails}
              onChange={handleInputChange("addressDetails")}
              placeholder="Piso, puerta, otro"
            />
            <FloatingLabelInput
              id="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange("postalCode")}
              placeholder="Código Postal"
            />
            <FloatingLabelInput
              id="city"
              value={formData.city}
              onChange={handleInputChange("city")}
              placeholder="Ciudad"
            />
            <FloatingLabelInput
              id="province"
              value={formData.province}
              onChange={handleInputChange("province")}
              placeholder="Comunidad"
            />
            <FloatingLabelInput
              id="municipality"
              value={formData.municipality}
              onChange={handleInputChange("municipality")}
              placeholder="Municipio"
            />
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-gray-900 mb-6 text-center">ALTA NUEVO INMUEBLE</h1>
          </div>

          <div className="mb-6">
            {currentSteps[currentStep]?.id !== "initial" && (
              <h2 className="text-md font-medium text-gray-900 mb-4">{currentSteps[currentStep]?.title || "Step"}</h2>
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

            {currentStep === 1 && !areAllLocationFieldsFilled() ? (
              <Button 
                onClick={autoCompleteAddress} 
                disabled={isCreatingProperty || !formData.street.trim()}
                className="flex items-center space-x-2 h-8"
              >
                {isCreatingProperty ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Autocompletando...</span>
                  </>
                ) : (
                  <>
                    <span>Autocompletar</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
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

