"use client"

import { useState, useEffect } from "react"
import { Card } from "~/components/ui/card"
import { Loader } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getListingDetails } from "~/server/queries/listing"
import FirstPage from "./pages/first"
import SecondPage from "./pages/second"
import ThirdPage from "./pages/third"

interface PropertyFormProps {
  listingId: string
}

// Step definitions
interface Step {
  id: string
  title: string
}

const steps: Step[] = [
  { id: "basic", title: "Información Básica" },
  { id: "details", title: "Detalles de la Propiedad" },
  { id: "address", title: "Dirección" },
]

export default function PropertyForm({ listingId }: PropertyFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [listingDetails, setListingDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch listing details on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch listing details first
        if (listingId) {
          const details = await getListingDetails(Number(listingId))
          setListingDetails(details)
          
          // Set current step based on form position
          if (details.formPosition) {
            // Map form position to step index
            // formPosition 1 = step 0 (basic info)
            // formPosition 2 = step 1 (property details)
            // formPosition 3 = step 2 (address)
            // formPosition 4+ = step 3+ (future steps)
            const stepIndex = Math.min(details.formPosition - 1, steps.length - 1)
            setCurrentStep(stepIndex)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [listingId])

  const nextStep = () => {
    setDirection("forward")
    setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection("backward")
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleFirstPageNext = () => {
    setDirection("forward")
    setCurrentStep(1)
  }

  const handleSecondPageNext = () => {
    setDirection("forward")
    setCurrentStep(2)
  }

  const handleThirdPageNext = () => {
    setDirection("forward")
    setCurrentStep(3)
  }

  const renderStepContent = () => {
    const step = steps[currentStep]

    if (!step) {
      return <div>Step not found</div>
    }

    switch (step.id) {
      case "basic":
        return (
          <FirstPage 
            listingId={listingId}
            onNext={handleFirstPageNext}
            onBack={currentStep > 0 ? prevStep : undefined}
          />
        )

      case "details":
        return (
          <SecondPage 
            listingId={listingId}
            onNext={handleSecondPageNext}
            onBack={prevStep}
          />
        )

      case "address":
        return (
          <ThirdPage 
            listingId={listingId}
            onNext={handleThirdPageNext}
            onBack={prevStep}
          />
        )

      default:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Contenido para el paso {step.id}
            </p>
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

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <Loader className="w-6 h-6 animate-spin text-gray-500" />
                <span className="text-gray-600">Cargando datos del inmueble...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
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

              {/* Save Error Notification */}
              {saveError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <p className="text-sm text-red-700">{saveError}</p>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
