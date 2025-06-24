"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { Checkbox } from "~/components/ui/checkbox"
import { ChevronLeft, ChevronRight, GraduationCap, PawPrint, Zap, Car, Package } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getListingDetails } from "~/server/queries/listing"
import { updateListing, createListing } from "~/server/queries/listing"
import { updateProperty } from "~/server/queries/properties"
import FormSkeleton from "./form-skeleton"
import { cn, formFormatters } from "~/lib/utils"
import { Input } from "~/components/ui/input"

interface RentPageProps {
  listingId: string
  onNext: () => void
  onBack?: () => void
}

interface RentPageFormData {
  studentFriendly: boolean
  petsAllowed: boolean
  appliancesIncluded: boolean
  duplicateForRent: boolean
  optionalGaragePrice: number
  optionalStorageRoomPrice: number
  rentalPrice: number
}

const initialFormData: RentPageFormData = {
  studentFriendly: false,
  petsAllowed: false,
  appliancesIncluded: false,
  duplicateForRent: false,
  optionalGaragePrice: 0,
  optionalStorageRoomPrice: 0,
  rentalPrice: 0,
}

export default function RentPage({ listingId, onNext, onBack }: RentPageProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<RentPageFormData>(initialFormData)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [listingDetails, setListingDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaleListing, setIsSaleListing] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  const updateFormData = (field: keyof RentPageFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle price input with formatting for garage and storage room
  const handleGaragePriceChange = formFormatters.handleNumericPriceInputChange((value) => 
    updateFormData("optionalGaragePrice", value)
  )

  const handleStorageRoomPriceChange = formFormatters.handleNumericPriceInputChange((value) => 
    updateFormData("optionalStorageRoomPrice", value)
  )

  const handleRentalPriceChange = formFormatters.handleNumericPriceInputChange((value) => 
    updateFormData("rentalPrice", value)
  )

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
            optionalGaragePrice: Number(details.optionalGaragePrice) || 0,
            optionalStorageRoomPrice: Number(details.optionalStorageRoomPrice) || 0,
            rentalPrice: Number(details.price) || 0,
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
    setIsFinishing(true)
    
    try {
      // Validate rental price if creating rental listing
      if (isSaleListing && formData.duplicateForRent && formData.rentalPrice <= 0) {
        setSaveError("Por favor, introduce el precio del alquiler.")
        setIsFinishing(false)
        return
      }

      // Save current listing data
      if (listingDetails?.listingId) {
        await updateListing(Number(listingDetails.listingId), {
          studentFriendly: formData.studentFriendly,
          petsAllowed: formData.petsAllowed,
          appliancesIncluded: formData.appliancesIncluded,
          optionalGaragePrice: formData.optionalGaragePrice ? Math.round(formData.optionalGaragePrice).toString() : "0",
          optionalStorageRoomPrice: formData.optionalStorageRoomPrice ? Math.round(formData.optionalStorageRoomPrice).toString() : "0",
        })
      }

      // Handle different scenarios based on listing type and user selection
      if (isSaleListing) {
        if (formData.duplicateForRent) {
          // Create a new rental listing with the same property_id
          await createListing({
            propertyId: BigInt(listingDetails.propertyId),
            agentId: BigInt(listingDetails.agentId),
            listingType: "Rent",
            price: Math.round(formData.rentalPrice).toString(), // Use the rental price
            status: "Active",
            isFeatured: false,
            isBankOwned: false,
            viewCount: 0,
            inquiryCount: 0,
            isActive: true,
            optionalStorageRoom: listingDetails.hasStorageRoom || false,
            hasKeys: false,
            studentFriendly: formData.studentFriendly,
            petsAllowed: formData.petsAllowed,
            appliancesIncluded: formData.appliancesIncluded,
            optionalGaragePrice: formData.optionalGaragePrice ? Math.round(formData.optionalGaragePrice).toString() : "0",
            optionalStorageRoomPrice: formData.optionalStorageRoomPrice ? Math.round(formData.optionalStorageRoomPrice).toString() : "0",
          })
        }
        // For both "Solo Venta" and "También Alquiler", navigate to propiedades
        router.push("/propiedades")
      } else {
        // If it's already a rent listing, just navigate to propiedades
        router.push("/propiedades")
      }
      
    } catch (error) {
      console.error("Error saving form data:", error)
      setSaveError("Error al guardar los datos. Los cambios podrían no haberse guardado correctamente.")
      setIsFinishing(false)
    }
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
          className="flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="relative bg-gray-100 rounded-lg p-1 h-12 w-full max-w-sm">
            <motion.div
              className="absolute top-1 left-1 w-[calc(50%-2px)] h-10 bg-gradient-to-r from-blue-400 to-yellow-300 rounded-md shadow-sm"
              animate={{
                x: formData.duplicateForRent ? "calc(100% - 5px)" : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <div className="relative flex h-full">
              <button
                type="button"
                onClick={() => updateFormData("duplicateForRent", false)}
                className={cn(
                  "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                  !formData.duplicateForRent
                    ? "text-white"
                    : "text-gray-400"
                )}
              >
                Solo Venta
              </button>
              <button
                type="button"
                onClick={() => updateFormData("duplicateForRent", true)}
                className={cn(
                  "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                  formData.duplicateForRent
                    ? "text-white"
                    : "text-gray-400"
                )}
              >
                También Alquiler
              </button>
            </div>
          </div>
        </motion.div>

        {/* Show rental characteristics when toggle is set to "También Alquiler" */}
        {formData.duplicateForRent && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            {/* Rental Price - Mandatory */}
            <div className="p-4 rounded-lg border-2 bg-blue-50 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Precio del Alquiler</h4>
              </div> 
              <Input
                type="text"
                value={formFormatters.formatPriceInput(formData.rentalPrice)}
                onChange={handleRentalPriceChange}
                placeholder="0 €"
                className="h-10 text-sm shadow-md border-0 bg-white"
              />
            </div>

            {/* Garage Price */}
            {listingDetails?.hasGarage && (
              <div className="p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-gray-600">Garaje (€/mes)</h4>
                  <Car className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  value={formFormatters.formatPriceInput(formData.optionalGaragePrice)}
                  onChange={handleGaragePriceChange}
                  placeholder="0 €"
                  className="h-8 text-xs shadow-md border-0"
                />
              </div>
            )}

            {/* Storage Room Price */}
            {listingDetails?.hasStorageRoom && (
              <div className="p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-gray-600">Trastero (€/mes)</h4>
                  <Package className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  value={formFormatters.formatPriceInput(formData.optionalStorageRoomPrice)}
                  onChange={handleStorageRoomPriceChange}
                  placeholder="0 €"
                  className="h-8 text-xs shadow-md border-0"
                />
              </div>
            )}

            {/* Rental Characteristics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Friendly */}
              <div className="space-y-4 p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-gray-600">Estudiantes</h4>
                  <GraduationCap className="h-4 w-4 text-gray-400" />
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
              <div className="space-y-4 p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-gray-600">Mascotas</h4>
                  <PawPrint className="h-4 w-4 text-gray-400" />
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
              <div className="space-y-4 p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-gray-600">Electrodomésticos</h4>
                  <Zap className="h-4 w-4 text-gray-400" />
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
            </div>
          </motion.div>
        )}

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
              disabled={isFinishing}
              className="flex items-center space-x-1 bg-gray-900 hover:bg-gray-800"
            >
              <span>{isFinishing ? "Finalizando..." : "Finalizar"}</span>
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
            disabled={isFinishing}
            className="flex items-center space-x-1 bg-gray-900 hover:bg-gray-800"
          >
            <span>{isFinishing ? "Finalizando..." : "Finalizar"}</span>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
