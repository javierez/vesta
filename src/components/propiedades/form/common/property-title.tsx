'use client'

import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"

interface PropertyTitleProps {
  propertyType: string
  street?: string
  neighborhood?: string
}

export function generatePropertyTitle(propertyType: string, street = '', neighborhood = '') {
  const getPropertyTypeText = (type: string) => {
    switch (type) {
      case 'piso':
        return 'Piso'
      case 'casa':
        return 'Casa'
      case 'local':
        return 'Local'
      case 'solar':
        return 'Solar'
      case 'garaje':
        return 'Garaje'
      default:
        return type
    }
  }

  const type = getPropertyTypeText(propertyType)
  const neighborhoodText = neighborhood ? `(${neighborhood})` : ''
  return `${type} en ${street} ${neighborhoodText}`.trim()
}

export function PropertyTitle({ propertyType, street = '', neighborhood = '' }: PropertyTitleProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="title" className="text-sm">Título</Label>
      <Input 
        id="title" 
        value={generatePropertyTitle(propertyType, street, neighborhood)} 
        className="h-8 bg-muted" 
        disabled 
      />
    </div>
  )
} 