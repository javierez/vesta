"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { FloatingLabelInput } from "~/components/ui/floating-label-input"
import { ChevronLeft, ChevronRight, Loader, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { getListingDetails } from "~/server/queries/listing"
import { updatePropertyLocation } from "~/server/queries/properties"
import { useSearchParams } from "next/navigation"
import FormSkeleton from "./form-skeleton"

interface ThirdPageProps {
  listingId: string
  onNext: () => void
  onBack?: () => void
}

// Form data interface for third page
interface ThirdPageFormData {
  street: string
  addressDetails: string
  postalCode: string
  city: string
  province: string
  municipality: string
  neighborhood: string
}

const initialFormData: ThirdPageFormData = {
  street: "",
  addressDetails: "",
  postalCode: "",
  city: "",
  province: "",
  municipality: "",
  neighborhood: "",
}

export default function ThirdPage({ listingId, onNext, onBack }: ThirdPageProps) {
  const [formData, setFormData] = useState<ThirdPageFormData>(initialFormData)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [listingDetails, setListingDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false)
  const [autoCompletionSuccess, setAutoCompletionSuccess] = useState(false)
  const [hasLocationChanged, setHasLocationChanged] = useState(false)
  const searchParams = useSearchParams()
  const method = searchParams.get('method')

  // Check if method is manual - if so, skip this page
  useEffect(() => {
    if (method === 'manual') {
      // Skip this page and go directly to next
      onNext()
    }
  }, [method, onNext])

  // Fetch listing details on component mount
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
            street: details.street || "",
            addressDetails: details.addressDetails || "",
            postalCode: details.postalCode || "",
            city: details.city || "",
            province: details.province || "",
            municipality: details.municipality || "",
            neighborhood: details.neighborhood || "",
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

  const updateFormData = (field: keyof ThirdPageFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleInputChange = (field: keyof ThirdPageFormData) => (value: string) => {
    updateFormData(field, value)
  }

  const autoCompleteAddress = async () => {
    if (!formData.street.trim()) {
      alert("Por favor, introduce al menos la dirección de la propiedad.")
      return
    }
    
    try {
      setIsUpdatingAddress(true)
      setAutoCompletionSuccess(false)
      
      // Use Nominatim to auto-complete missing fields
      const addressString = [
        formData.street.trim(),
        formData.city.trim()
      ].filter(Boolean).join(', ')
      
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1&countrycodes=es&addressdetails=1`
      
      const response = await fetch(nominatimUrl)
      const nominatimResults = await response.json()
      
      if (nominatimResults.length === 0) {
        alert("No se pudo encontrar la dirección. Por favor, verifica que la dirección sea correcta.")
        return
      }
      
      const result = nominatimResults[0]
      console.log("Nominatim auto-completion successful:", result)
      
      // Replace form data with Nominatim results
      const newFormData = {
        street: result.address?.road || formData.street,
        addressDetails: result.address?.house_number || formData.addressDetails,
        postalCode: result.address?.postcode || formData.postalCode,
        city: result.address?.city || result.address?.town || formData.city,
        province: result.address?.state || formData.province,
        municipality: result.address?.city || result.address?.town || formData.municipality,
        neighborhood: result.address?.suburb || result.address?.quarter || formData.neighborhood,
      }
      
      setFormData(newFormData)
      setHasLocationChanged(true)
      
      // Show success feedback
      setAutoCompletionSuccess(true)
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setAutoCompletionSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error("Error auto-completing address:", error);
      alert("Error al autocompletar la dirección. Por favor, inténtalo de nuevo.");
    } finally {
      setIsUpdatingAddress(false)
    }
  }

  const handleNext = async () => {
    // Validate required fields
    if (!formData.street.trim()) {
      alert("Por favor, introduce la calle.")
      return
    }

    if (!formData.postalCode.trim()) {
      alert("Por favor, introduce el código postal.")
      return
    }

    // Clear any previous save errors
    setSaveError(null)

    // Save data in the background without blocking the UI
    try {
      // Use the server action to update property location
      if (listingDetails?.propertyId) {
        await updatePropertyLocation(Number(listingDetails.propertyId), {
          street: formData.street,
          addressDetails: formData.addressDetails,
          postalCode: formData.postalCode,
          city: formData.city,
          province: formData.province,
          municipality: formData.municipality,
          neighborhood: formData.neighborhood,
        })
      }

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

  // If method is manual, don't render anything (page will be skipped)
  if (method === 'manual') {
    return null
  }

  if (isLoading) {
    return (
      <FormSkeleton />
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-md font-medium text-gray-900 mb-4">Dirección</h2>
      
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
        placeholder="Provincia"
        disabled={true}
      />
      <FloatingLabelInput
        id="municipality"
        value={formData.municipality}
        onChange={handleInputChange("municipality")}
        placeholder="Municipio"
        disabled={true}
      />
      <FloatingLabelInput
        id="neighborhood"
        value={formData.neighborhood}
        onChange={handleInputChange("neighborhood")}
        placeholder="Barrio"
        disabled={true}
      />

      {/* Update Button */}
      <div className="flex justify-center pt-2">
        <Button 
          onClick={autoCompleteAddress} 
          disabled={isUpdatingAddress || !formData.street.trim()}
          variant="outline"
          className="flex items-center space-x-2"
        >
          {isUpdatingAddress ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Actualizando...</span>
            </>
          ) : (
            <>
              <span>Actualizar</span>
            </>
          )}
        </Button>
      </div>

      {/* Auto-completion Success Message */}
      {autoCompletionSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center text-sm text-green-600"
        >
          ✓ Actualizado
        </motion.div>
      )}

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
