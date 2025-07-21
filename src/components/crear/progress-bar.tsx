"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { useState, useMemo } from "react"

interface ProgressBarProps {
  currentStep: number
  steps: Array<{ id: string; title: string }>
  formPosition?: number
  onStepClick?: (stepIndex: number) => void
  showPercentage?: boolean
  showStepTitles?: boolean
  variant?: "default" | "compact" | "detailed"
  propertyType?: string
}

export default function ProgressBar({ 
  currentStep, 
  steps, 
  formPosition = 1, 
  onStepClick,
  showPercentage = false,
  showStepTitles = false,
  variant = "default",
  propertyType = ""
}: ProgressBarProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)

  // Define which steps are skipped for each property type
  const skippedSteps = useMemo(() => {
    if (propertyType === "solar") {
      // Solar properties skip: fourth (3), fifth (4), sixth (5), eighth (7), nineth (8)
      return [3, 4, 5, 7, 8]
    } else if (propertyType === "garage") {
      // Garage properties skip: fifth (4), seventh (6), eighth (7), nineth (8)
      return [4, 6, 7, 8]
    }
    return []
  }, [propertyType])

  // Create filtered steps array that excludes skipped steps
  const filteredSteps = useMemo(() => {
    return steps.filter((_, index) => !skippedSteps.includes(index))
  }, [steps, skippedSteps])

  // Map current step to filtered step index
  const getFilteredStepIndex = (originalStepIndex: number): number => {
    let filteredIndex = 0
    for (let i = 0; i <= originalStepIndex; i++) {
      if (!skippedSteps.includes(i)) {
        filteredIndex++
      }
    }
    return filteredIndex - 1 // -1 because we want the index, not count
  }

  // Map filtered step index back to original step index
  const getOriginalStepIndex = (filteredStepIndex: number): number => {
    let originalIndex = 0
    let filteredCount = 0
    
    while (filteredCount <= filteredStepIndex && originalIndex < steps.length) {
      if (!skippedSteps.includes(originalIndex)) {
        filteredCount++
      }
      originalIndex++
    }
    
    return originalIndex - 1
  }

  // Get the current filtered step index
  const currentFilteredStep = getFilteredStepIndex(currentStep)
  const actualCurrentStep = currentFilteredStep
  const progressPercentage = ((actualCurrentStep + 1) / filteredSteps.length) * 100

  // Debug logging
  if (propertyType && skippedSteps.length > 0) {
    console.log(`ProgressBar Debug - Property: ${propertyType}, Skipped: [${skippedSteps.join(', ')}], Current: ${currentStep}, Filtered: ${currentFilteredStep}, Total: ${filteredSteps.length}`)
  }

  const handleStepClick = (stepIndex: number) => {
    if (!onStepClick) return
    const originalStepIndex = getOriginalStepIndex(stepIndex)
    const currentFormStep = (formPosition || 1) - 1
    
    // Only allow clicking on the immediate next step or previous steps
    if (originalStepIndex === currentFormStep + 1 || originalStepIndex < currentFormStep) {
      onStepClick(originalStepIndex)
    }
  }

  const isStepClickable = (stepIndex: number) => {
    const originalStepIndex = getOriginalStepIndex(stepIndex)
    const currentFormStep = (formPosition || 1) - 1
    
    // Only allow clicking on the immediate next step or previous steps
    return originalStepIndex === currentFormStep + 1 || originalStepIndex < currentFormStep
  }

  return (
    <div className="w-full">
      {/* Percentage Display */}
      {showPercentage && (
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-600">
            Step {actualCurrentStep + 1} of {filteredSteps.length}
          </span>
          <span className="text-sm font-semibold text-blue-600">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="relative flex flex-col items-center" style={{ minHeight: variant === "compact" ? 40 : 80 }}>
        {/* Progress Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-yellow-300"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Step Indicators */}
        <div className="relative flex justify-between w-full z-10" style={{ minHeight: 40 }}>
          {filteredSteps.map((step, index) => {
            const isCompleted = index < actualCurrentStep
            const isCurrent = index === actualCurrentStep
            const isClickable = isStepClickable(index)

            return (
              <div
                key={step.id}
                className="flex flex-col items-center flex-1"
                style={{ position: "relative" }}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Tooltip (below the circle, centered) */}
                {hoveredStep === index && variant !== "compact" && (
                  <motion.div
                    className="absolute top-10 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 shadow-lg"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {step.title}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                  </motion.div>
                )}

                {/* Step Circle */}
                <motion.div
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow ${
                    isCompleted
                      ? "bg-gradient-to-r from-blue-400 to-yellow-300 shadow-lg"
                      : isCurrent
                      ? "bg-gradient-to-r from-blue-400 to-yellow-300 shadow-md ring-2 ring-blue-200 ring-offset-2"
                      : "bg-gray-100 border-2 border-gray-300"
                  } ${
                    isClickable 
                      ? "cursor-pointer hover:scale-110 active:scale-95" 
                      : "cursor-not-allowed opacity-60"
                  }`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  style={{ zIndex: 10 }}
                  onClick={() => handleStepClick(index)}
                  whileHover={isClickable ? { scale: 1.1 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  ) : (
                    <span
                      className={`text-base font-medium ${
                        isCurrent ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}
                </motion.div>

                {/* Step Titles */}
                {showStepTitles && variant !== "compact" && (
                  <motion.div
                    className="mt-3 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                  >
                    <p className={`text-xs font-medium ${
                      isCurrent ? "text-blue-600" : isCompleted ? "text-gray-700" : "text-gray-500"
                    }`}>
                      {step.title}
                    </p>
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
