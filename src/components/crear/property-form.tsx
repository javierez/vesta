"use client"

import { useState, useEffect } from "react"
import { Card } from "~/components/ui/card"
import { Loader, Building2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getListingDetails } from "~/server/queries/listing"
import ProgressBar from "./progress-bar"
import FirstPage from "./pages/first"
import SecondPage from "./pages/second"
import ThirdPage from "./pages/third"
import FourthPage from "./pages/fourth"
import FifthPage from "./pages/fifth"
import SixthPage from "./pages/sixth"
import SeventhPage from "./pages/seventh"
import EighthPage from "./pages/eighth"
import NinethPage from "./pages/nineth"
import DescriptionPage from "./pages/description"
import RentPage from "./pages/rent"

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
  { id: "equipment", title: "Equipamiento y Servicios" },
  { id: "orientation", title: "Orientación y Exposición" },
  { id: "additional", title: "Características Adicionales" },
  { id: "luxury", title: "Lujo y Confort" },
  { id: "spaces", title: "Espacios Complementarios" },
  { id: "materials", title: "Materiales y Acabados" },
  { id: "description", title: "Descripción" },
  { id: "rent", title: "Alquiler" },
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
            // etc.
            const stepIndex = Math.max(0, Math.min(details.formPosition - 1, steps.length - 1))
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

  // Sync currentStep with formPosition when listingDetails updates
  useEffect(() => {
    if (listingDetails?.formPosition) {
      const stepIndex = Math.max(0, Math.min(listingDetails.formPosition - 1, steps.length - 1))
      setCurrentStep(stepIndex)
    }
  }, [listingDetails?.formPosition])

  // Define which steps are skipped for each property type
  const getSkippedSteps = (propertyType: string): number[] => {
    if (propertyType === "solar") {
      // Solar properties skip: fourth (3), fifth (4), sixth (5), eighth (7), nineth (8)
      return [3, 4, 5, 7, 8]
    } else if (propertyType === "garage") {
      // Garage properties skip: fifth (4), seventh (6), eighth (7), nineth (8)
      return [4, 6, 7, 8]
    }
    return []
  }

  // Get the next non-skipped step
  const getNextNonSkippedStep = (currentStepIndex: number): number => {
    const propertyType = listingDetails?.propertyType || ""
    const skippedSteps = getSkippedSteps(propertyType)
    
    let nextStep = currentStepIndex + 1
    
    // Keep incrementing until we find a non-skipped step
    while (skippedSteps.includes(nextStep) && nextStep < steps.length) {
      nextStep++
    }
    
    return Math.min(nextStep, steps.length - 1)
  }

  // Get the previous non-skipped step
  const getPrevNonSkippedStep = (currentStepIndex: number): number => {
    const propertyType = listingDetails?.propertyType || ""
    const skippedSteps = getSkippedSteps(propertyType)
    
    let prevStep = currentStepIndex - 1
    
    // Keep decrementing until we find a non-skipped step
    while (skippedSteps.includes(prevStep) && prevStep >= 0) {
      prevStep--
    }
    
    return Math.max(prevStep, 0)
  }

  const nextStep = () => {
    setDirection("forward")
    const nextStepIndex = getNextNonSkippedStep(currentStep)
    setCurrentStep(nextStepIndex)
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection("backward")
      const prevStepIndex = getPrevNonSkippedStep(currentStep)
      setCurrentStep(prevStepIndex)
    }
  }

  const goToStep = (stepIndex: number) => {
    const formPosition = listingDetails?.formPosition || 1
    // Only allow navigation to completed steps (backward navigation)
    if (stepIndex < formPosition) {
      setDirection(stepIndex < currentStep ? "backward" : "forward")
      setCurrentStep(stepIndex)
    }
  }

  // Smart navigation function that automatically skips to next non-skipped step
  const navigateToNextStep = () => {
    setDirection("forward")
    const nextStepIndex = getNextNonSkippedStep(currentStep)
    setCurrentStep(nextStepIndex)
    refreshListingDetails()
  }

  // Refresh listing details after form updates
  const refreshListingDetails = async () => {
    try {
      const details = await getListingDetails(Number(listingId))
      setListingDetails(details)
    } catch (error) {
      console.error("Error refreshing listing details:", error)
    }
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
            onNext={navigateToNextStep}
            onBack={currentStep > 0 ? prevStep : undefined}
          />
        )

      case "details":
        return (
          <SecondPage 
            listingId={listingId}
            onNext={navigateToNextStep}
            onBack={prevStep}
          />
        )

      case "address":
        return (
          <ThirdPage 
            listingId={listingId}
            onNext={navigateToNextStep}
            onBack={prevStep}
          />
        )

      case "equipment":
        return (
          <FourthPage 
            listingId={listingId}
            onNext={navigateToNextStep}
            onBack={prevStep}
          />
        )

      case "orientation":
        return (
          <FifthPage 
            listingId={listingId}
            onNext={navigateToNextStep}
            onBack={prevStep}
          />
        )

      case "additional":
        return (
          <SixthPage 
            listingId={listingId}
            onNext={navigateToNextStep}
            onBack={prevStep}
          />
        )

      case "luxury":
        return (
          <SeventhPage 
            listingId={listingId}
            onNext={navigateToNextStep}
            onBack={prevStep}
          />
        )

      case "spaces":
        return (
          <EighthPage 
            listingId={listingId}
            onNext={navigateToNextStep}
            onBack={prevStep}
          />
        )

      case "materials":
        return (
          <NinethPage 
            listingId={listingId}
            onNext={navigateToNextStep}
            onBack={prevStep}
          />
        )

      case "description":
        return (
          <DescriptionPage 
            listingId={listingId}
            onNext={navigateToNextStep}
            onBack={prevStep}
          />
        )

      case "rent":
        return (
          <RentPage 
            listingId={listingId}
            onNext={navigateToNextStep}
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

            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-yellow-800 bg-clip-text text-transparent mb-3 mt-2 text-center">
              ALTA NUEVO INMUEBLE
            </h1>

            <div className="w-24 h-1 bg-gradient-to-r from-gray-700 to-yellow-800 mx-auto rounded-full mb-4"></div>

            <p className="text-gray-500 text-center mb-8">
              Completa la información del inmueble paso a paso
            </p>
            
            {/* Progress Bar */}
            <ProgressBar 
              currentStep={currentStep}
              totalSteps={steps.length}
              steps={steps}
              formPosition={listingDetails?.formPosition || 1}
              onStepClick={goToStep}
              propertyType={listingDetails?.propertyType || ""}
            />
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
