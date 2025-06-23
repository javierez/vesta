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
}

export default function ProgressBar({ currentStep, totalSteps, steps, formPosition = 1, onStepClick }: ProgressBarProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)

  const handleStepClick = (stepIndex: number) => {
    if (!onStepClick) return
    
    // Allow navigation to any step that is completed (stepIndex < formPosition)
    // or to the current allowed step (stepIndex < formPosition)
    if (stepIndex < formPosition) {
      onStepClick(stepIndex)
    }
  }

  const isStepClickable = (stepIndex: number) => {
    // Can click on any completed step or current step
    return stepIndex < formPosition
  }

  return (
    <div className="w-full mb-6">
      {/* Progress Bar Container */}
      <div className="relative flex flex-col items-center" style={{ minHeight: 48 }}>
        {/* Step Indicators */}
        <div className="relative flex justify-between w-full z-10" style={{ minHeight: 40 }}>
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const isClickable = isStepClickable(index)

            return (
              <div
                key={step.id}
                className="flex flex-col items-center flex-1"
                style={{ position: "relative" }}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Tooltip (above the circle, centered) */}
                {hoveredStep === index && (
                  <motion.div
                    className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 shadow-lg"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {step.title}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </motion.div>
                )}

                {/* Step Circle */}
                <motion.div
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow ${
                    isCompleted
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                      : isCurrent
                      ? "bg-white border-2 border-blue-500 shadow-md"
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
                        isCurrent ? "text-blue-600" : "text-gray-400"
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}
                </motion.div>

                {/* Current Step Indicator (dot below) */}
                {isCurrent && (
                  <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full z-20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
