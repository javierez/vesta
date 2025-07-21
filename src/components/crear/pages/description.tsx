import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Textarea } from "~/components/ui/textarea"
import { ChevronLeft, ChevronRight, Wand2, MoreVertical } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { updateProperty } from "~/server/queries/properties"
import { generatePropertyDescription } from "~/server/openai/property_descriptions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import FormSkeleton from "./form-skeleton"

interface ListingDetails {
  propertyId?: number;
  description?: string;
  formPosition?: number;
}

interface DescriptionPageProps {
  listingId: string;
  globalFormData: { listingDetails?: ListingDetails };
  onNext: () => void;
  onBack?: () => void;
  refreshListingDetails?: () => void;
}

export default function DescriptionPage({ listingId, globalFormData, onNext, onBack, refreshListingDetails }: DescriptionPageProps) {
  const [description, setDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false)
  const [signature, setSignature] = useState("")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Use centralized data instead of fetching
  useEffect(() => {
    if (globalFormData?.listingDetails) {
      const details = globalFormData.listingDetails
      setDescription(details.description ?? "")
    }
  }, [globalFormData?.listingDetails])

  const handleGenerateDescription = async () => {
    try {
      setIsGenerating(true)
      if (globalFormData?.listingDetails) {
        const generated = await generatePropertyDescription(globalFormData.listingDetails)
        setDescription(generated)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleNext = () => {
    // Navigate IMMEDIATELY (optimistic) - no waiting!
    onNext()
    
    // Save data in background (completely silent)
    saveInBackground()
  }

  // Background save function - completely silent and non-blocking
  const saveInBackground = () => {
    // Fire and forget - no await, no blocking!
    if (globalFormData?.listingDetails?.propertyId) {
      const updateData: Partial<ListingDetails> = {
        description: description,
      }

      // Only update formPosition if current position is lower than 11
      if ((globalFormData.listingDetails.formPosition ?? 0) < 11) {
        updateData.formPosition = 11
      }

      // Debug log
      console.log("Saving description page data:", updateData)

      updateProperty(Number(globalFormData.listingDetails.propertyId), updateData).then(() => {
        console.log("Description page data saved successfully") // Debug log
        // Refresh global data after successful save
        refreshListingDetails?.()
      }).catch((error: unknown) => {
        console.error("Error saving form data:", error)
        // Silent error - user doesn't know it failed
        // Could implement retry logic here if needed
      })
    } else {
      console.warn("No propertyId found in globalFormData.listingDetails for description page") // Debug log
    }
  }

  if (saving) {
    return <FormSkeleton />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Descripción</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsSignatureDialogOpen(true)}>
              Añadir Firma
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Textarea
        id="description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="min-h-[200px] resize-y border-gray-200 focus:border-gray-400 focus:ring-gray-300 transition-colors"
        placeholder="Describe las características principales de la propiedad, su ubicación, y cualquier detalle relevante que pueda interesar a los potenciales compradores o inquilinos."
      />
      <div className="flex justify-center pt-2">
        <Button
          type="button"
          onClick={handleGenerateDescription}
          disabled={isGenerating}
          className="group relative overflow-hidden bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 text-white font-medium px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {isGenerating ? (
            <>
              <Wand2 className="mr-2 h-4 w-4 animate-spin" />
              Generando descripción...
            </>
          ) : (
            <>
              Asistente de descripción
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </>
          )}
        </Button>
      </div>

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
