import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number | string): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(Number(value))
}

export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('es-ES', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numPrice)
}

// Form input formatting utilities
export const formFormatters = {
  // Format price for form inputs with € symbol
  formatPriceInput: (value: string | number): string => {
    if (!value) return ""
    const numericValue = typeof value === 'string' ? value.replace(/[^\d]/g, "") : value.toString()
    if (!numericValue) return ""
    return `${numericValue} €`
  },

  // Get numeric value from formatted price
  getNumericPrice: (formattedValue: string): string => {
    return formattedValue.replace(/[^\d]/g, "")
  },

  // Format area measurements with m² symbol
  formatAreaInput: (value: string | number): string => {
    if (!value) return ""
    const numericValue = typeof value === 'string' ? value.replace(/[^\d]/g, "") : value.toString()
    if (!numericValue) return ""
    return `${numericValue} m²`
  },

  // Get numeric value from formatted area
  getNumericArea: (formattedValue: string): string => {
    return formattedValue.replace(/[^\d]/g, "")
  },

  // Handle price input change with formatting
  handlePriceInputChange: (
    setValue: (value: string) => void
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = formFormatters.getNumericPrice(e.target.value)
    setValue(numericValue)
  },

  // Handle area input change with formatting
  handleAreaInputChange: (
    setValue: (value: string) => void
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = formFormatters.getNumericArea(e.target.value)
    setValue(numericValue)
  },

  // Handle numeric area input change (for number fields)
  handleNumericAreaInputChange: (
    setValue: (value: number) => void
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = formFormatters.getNumericArea(e.target.value)
    setValue(numericValue ? parseInt(numericValue) : 0)
  },

  // Handle numeric price input change (for number fields)
  handleNumericPriceInputChange: (
    setValue: (value: number) => void
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = formFormatters.getNumericPrice(e.target.value)
    setValue(numericValue ? parseInt(numericValue) : 0)
  },

  // Handle number input with leading zero removal
  handleNumberInput: (
    setValue: (value: number) => void
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = parseInt(e.target.value) || 0
    setValue(numericValue)
  },

  // Format number for display (removes leading zeros, shows empty string for 0)
  formatNumberDisplay: (value: number): string => {
    return value === 0 ? "0" : value.toString()
  }
}