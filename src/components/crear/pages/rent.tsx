"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { Checkbox } from "~/components/ui/checkbox"
import { ChevronLeft, ChevronRight, GraduationCap, PawPrint, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getListingDetails } from "~/server/queries/listing"
import { updateListing } from "~/server/queries/listing"
import FormSkeleton from "./form-skeleton"

interface RentPageProps {
  listingId: string
  onNext: () => void
  onBack?: () => void
}

interface RentPageFormData {
  studentFriendly: boolean
  petsAllowed: boolean
  appliancesIncluded: boolean
}

const initialFormData: RentPageFormData = {
  studentFriendly: false,
  petsAllowed: false,
  appliancesIncluded: false,
}

export default function RentPage({ listingId, onNext, onBack }: RentPageProps) {
  const [formData, setFormData] = useState<RentPageFormData>(initialFormData)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [listingDetails, setListingDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaleListing, setIsSaleListing] = useState(false)

  const updateFormData = (field: keyof RentPageFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Fetch listing details on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        if (listingId) {
          const details = await getListingDetails(Number(listingId))
          setListingDetails(details)
          setIsSaleListing(details.listingType === 'Sale')
          setFormData(prev => ({
            ...prev,
            studentFriendly: details.studentFriendly || false,
            petsAllowed: details.petsAllowed || false,
            appliancesIncluded: details.appliancesIncluded || false,
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

  const handleNext = async () => {
    setSaveError(null)
    try {
      if (listingDetails?.listingId) {
        await updateListing(Number(listingDetails.listingId), {
          studentFriendly: formData.studentFriendly,
          petsAllowed: formData.petsAllowed,
          appliancesIncluded: formData.appliancesIncluded,
        })
      }
      // Refresh listing details after saving
      const updatedDetails = await getListingDetails(Number(listingId))
      setListingDetails(updatedDetails)
      onNext()
    } catch (error) {
      console.error("Error saving form data:", error)
      setSaveError("Error al guardar los datos. Los cambios podrían no haberse guardado correctamente.")
    }
  }

  const handleDuplicateForRent = () => {
    // Mockup function - will be implemented later
    console.log("Duplicate listing for rent")
  }

  if (isLoading) {
    return <FormSkeleton />
  }

  // If it's a sale listing, show the Apple-like UI
  if (isSaleListing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-6"
      >
        <motion.div
          className="space-y-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-gray-900">¿También para alquiler?</h2>
        </motion.div>

        <motion.div
          className="flex flex-col items-center justify-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="text-center space-y-6 max-w-md">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900">
                Maximiza tu alcance
              </h3>
              <p className="text-gray-600 leading-relaxed">
                ¿Te gustaría crear automáticamente un anuncio de alquiler con toda la información de tu propiedad? 
                Llegarás a más potenciales inquilinos.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <Button
                onClick={handleDuplicateForRent}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Sí, crear anuncio de alquiler
              </Button>
              
              <Button
                onClick={onNext}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-xl transition-all duration-300"
              >
                No, continuar solo con venta
              </Button>
            </div>
          </div>
        </motion.div>

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
        </motion.div>
      </motion.div>
    )
  }

  // If it's a rent listing, show the rental characteristics
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      <motion.div
        className="space-y-1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-gray-900">Propiedades del Alquiler</h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {/* Student Friendly */}
        <div className="space-y-4 p-4 rounded-lg shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-600">Estudiantes</h4>
            <GraduationCap className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="studentFriendly" 
              checked={formData.studentFriendly} 
              onCheckedChange={checked => updateFormData("studentFriendly", !!checked)} 
            />
            <Label htmlFor="studentFriendly" className="text-sm">Admite estudiantes</Label>
          </div>
        </div>

        {/* Pets Allowed */}
        <div className="space-y-4 p-4 rounded-lg shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-600">Mascotas</h4>
            <PawPrint className="h-4 w-4 text-green-500" />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="petsAllowed" 
              checked={formData.petsAllowed} 
              onCheckedChange={checked => updateFormData("petsAllowed", !!checked)} 
            />
            <Label htmlFor="petsAllowed" className="text-sm">Admite mascotas</Label>
          </div>
        </div>

        {/* Appliances Included */}
        <div className="space-y-4 p-4 rounded-lg shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-600">Electrodomésticos</h4>
            <Zap className="h-4 w-4 text-orange-500" />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="appliancesIncluded" 
              checked={formData.appliancesIncluded} 
              onCheckedChange={checked => updateFormData("appliancesIncluded", !!checked)} 
            />
            <Label htmlFor="appliancesIncluded" className="text-sm">Incluye electrodomésticos</Label>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700"
          >
            {saveError}
          </motion.div>
        )}
      </AnimatePresence>

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
    </motion.div>
  )
}
