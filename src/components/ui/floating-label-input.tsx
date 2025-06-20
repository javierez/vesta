"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "~/lib/utils"
import { Input } from "./input"

interface FloatingLabelInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
  disabled?: boolean
  type?: string
  required?: boolean
  name?: string
}

export function FloatingLabelInput({ 
  id, 
  value, 
  onChange, 
  placeholder, 
  className,
  disabled = false,
  type = "text",
  required = false,
  name
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = value.length > 0

  return (
    <div className="relative">
      <AnimatePresence>
        {(hasValue || isFocused) && (
          <motion.label
            htmlFor={id}
            initial={{ opacity: 0, y: 0, scale: 1 }}
            animate={{ opacity: 1, y: -12, scale: 0.85 }}
            exit={{ opacity: 0, y: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute -left-2 -top-2 text-xs font-medium text-gray-600 bg-white px-1 z-10"
          >
            {placeholder}
            {required && <span className="text-red-500 ml-1">*</span>}
          </motion.label>
        )}
      </AnimatePresence>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={hasValue || isFocused ? "" : placeholder}
        disabled={disabled}
        required={required}
        className={cn(
          "h-8 transition-all duration-200",
          className
        )}
      />
    </div>
  )
} 