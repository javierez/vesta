'use client'

import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"

interface PropertyTitleProps {
  propertyType: string
  street?: string
  neighborhood?: string
}

export function PropertyTitle({ propertyType, street = '', neighborhood = '' }: PropertyTitleProps) {
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

  const generateTitle = () => {
    const type = getPropertyTypeText(propertyType)
    const neighborhoodText = neighborhood ? `(${neighborhood})` : ''
    return `${type} en ${street} ${neighborhoodText}`.trim()
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor="title" className="text-sm">Título</Label>
      <Input 
        id="title" 
        value={generateTitle()} 
        className="h-8 bg-muted" 
        disabled 
      />
    </div>
  )
} 