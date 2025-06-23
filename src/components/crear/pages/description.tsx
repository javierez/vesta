"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Textarea } from "~/components/ui/textarea"
import { ChevronLeft, ChevronRight, Loader2, MoreVertical } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { generatePropertyDescription } from '~/server/openai/property_descriptions'
import { getListingDetails } from "~/server/queries/listing"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

interface DescriptionPageProps {
  listingId: string
  onNext: () => void
  onBack?: () => void
}

export default function DescriptionPage({ listingId, onNext, onBack }: DescriptionPageProps) {
  const [description, setDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false)
  const [signature, setSignature] = useState("")
  const [listingDetails, setListingDetails] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (listingId) {
        const details = await getListingDetails(Number(listingId))
        setListingDetails(details)
        setDescription(details.description || "")
      }
    }
    fetchData()
  }, [listingId])

  const handleGenerateDescription = async () => {
    try {
      setIsGenerating(true)
      const generated = await generatePropertyDescription(listingDetails)
      setDescription(generated)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddSignature = () => {
    setDescription(prev => prev + "\n\n" + signature)
    setIsSignatureDialogOpen(false)
    setSignature("")
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
      <div className="flex justify-center pt-4">
        <Button
          type="button"
          onClick={handleGenerateDescription}
          disabled={isGenerating}
          className="group relative overflow-hidden bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 text-white font-medium px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
            onClick={onNext} 
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
