"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { useState } from "react"

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  steps: Array<{ id: string; title: string }>
  formPosition?: number
  onStepClick?: (stepIndex: number) => void
  showPercentage?: boolean
  showStepTitles?: boolean
  variant?: "default" | "compact" | "detailed"
}

export default function ProgressBar({ 
  currentStep, 
  totalSteps, 
  steps, 
  formPosition = 1, 
  onStepClick,
  showPercentage = false,
  showStepTitles = false,
  variant = "default"
}: ProgressBarProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)

  // Use formPosition to determine which step is current
  const actualCurrentStep = (formPosition || 1) - 1
  const lastAccessibleIndex = (formPosition || 1) - 1
  const progressPercentage = ((actualCurrentStep + 1) / totalSteps) * 100

  const handleStepClick = (stepIndex: number) => {
    if (!onStepClick) return
    if (stepIndex < formPosition) {
      onStepClick(stepIndex)
    }
  }

  const isStepClickable = (stepIndex: number) => {
    return stepIndex < formPosition
  }

  return (
    <div className="w-full">
      {/* Percentage Display */}
      {showPercentage && (
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-600">
            Step {actualCurrentStep + 1} of {totalSteps}
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
          {steps.map((step, index) => {
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
