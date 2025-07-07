'use client'

import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Edit2, MapPin, Euro, Home, Bed, Bath, Calendar, Target } from "lucide-react"
import { cn } from "~/lib/utils"

interface ProspectData {
  id: bigint
  contactId: bigint
  status: string
  listingType: string | null
  propertyType: string | null
  minPrice: string | null
  maxPrice: string | null
  preferredAreas: Array<{ neighborhood?: string; name?: string }> | null
  minBedrooms: number | null
  minBathrooms: number | null
  moveInBy: Date | null
  extras: Record<string, any> | null
  urgencyLevel: number | null
  fundingReady: boolean | null
  notesInternal: string | null
  createdAt: Date
  updatedAt: Date
}

interface ContactProspectCompactProps {
  prospect: ProspectData
  onEdit: (prospect: ProspectData) => void
  onDelete?: (prospectId: bigint) => void
}

export function ContactProspectCompact({ prospect, onEdit, onDelete }: ContactProspectCompactProps) {
  const getUrgencyColor = (level: number | null) => {
    switch (level) {
      case 1: return 'bg-gray-100 text-gray-700'
      case 2: return 'bg-blue-100 text-blue-700'
      case 3: return 'bg-yellow-100 text-yellow-700'
      case 4: return 'bg-orange-100 text-orange-700'
      case 5: return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatPrice = (price: string | null) => {
    if (!price) return 'N/A'
    return `${parseInt(price).toLocaleString('es-ES')}€`
  }

  const getPropertyTypeIcon = (type: string | null) => {
    switch (type) {
      case 'piso': return '🏢'
      case 'casa': return '🏠'
      case 'local': return '🏪'
      case 'terreno': return '🌍'
      case 'garaje': return '🅿️'
      default: return '🏠'
    }
  }

  const getNeighborhoodsText = (preferredAreas: unknown) => {
    if (!preferredAreas || !Array.isArray(preferredAreas)) return ""
    if (preferredAreas.length === 0) return ""
    
    const neighborhoods = preferredAreas.map((area: any) => 
      area.neighborhood || area.name || ""
    ).filter(Boolean)
    
    if (neighborhoods.length === 0) return ""
    if (neighborhoods.length === 1) return `en ${neighborhoods[0]}`
    if (neighborhoods.length === 2) return `en ${neighborhoods[0]} y ${neighborhoods[1]}`
    return `en ${neighborhoods[0]} y ${neighborhoods.length - 1} más`
  }

  const getCompactTitle = () => {
    const operation = prospect.listingType === 'Sale' ? 'Compra' : 'Alquiler'
    const propertyType = prospect.propertyType || 'Propiedad'
    
    // Get at least one neighborhood for the title
    let neighborhoodsText = ""
    if (prospect.preferredAreas && Array.isArray(prospect.preferredAreas) && prospect.preferredAreas.length > 0) {
      const firstNeighborhood = prospect.preferredAreas[0]
      const neighborhoodName = typeof firstNeighborhood === 'object' && firstNeighborhood !== null 
        ? (firstNeighborhood.neighborhood || firstNeighborhood.name || "")
        : ""
      
      if (neighborhoodName) {
        neighborhoodsText = ` en ${neighborhoodName}`
      }
    }
    
    return `${operation} de ${propertyType}${neighborhoodsText}`
  }

  return (
    <Card className="p-4 border-gray-200 bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getPropertyTypeIcon(prospect.propertyType)}</span>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              {getCompactTitle()}
            </h4>
            <p className="text-xs text-gray-500">
              Creado {prospect.createdAt.toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {prospect.urgencyLevel && (
            <Badge 
              variant="secondary" 
              className={cn("text-xs", getUrgencyColor(prospect.urgencyLevel))}
            >
              <Target className="h-3 w-3 mr-1" />
              Urgencia {prospect.urgencyLevel}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(prospect)}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-gray-600">
            <Euro className="h-4 w-4" />
            <span>
              {formatPrice(prospect.minPrice)} - {formatPrice(prospect.maxPrice)}
            </span>
          </div>
          
          {(prospect.minBedrooms || prospect.minBathrooms) && (
            <div className="flex items-center space-x-4 text-gray-600">
              {prospect.minBedrooms && (
                <div className="flex items-center space-x-1">
                  <Bed className="h-4 w-4" />
                  <span>{prospect.minBedrooms}+</span>
                </div>
              )}
              {prospect.minBathrooms && (
                <div className="flex items-center space-x-1">
                  <Bath className="h-4 w-4" />
                  <span>{prospect.minBathrooms}+</span>
                </div>
              )}
            </div>
          )}
          
          {/* Neighborhoods display */}
          {prospect.preferredAreas && Array.isArray(prospect.preferredAreas) && prospect.preferredAreas.length > 0 && (
            <div className="flex items-start space-x-2 text-gray-600">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {prospect.preferredAreas.slice(0, 3).map((area: any, index: number) => {
                  const areaName = typeof area === 'object' && area !== null 
                    ? (area.neighborhood || area.name || 'N/A')
                    : 'N/A'
                  return (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs px-1.5 py-0.5 h-auto"
                    >
                      {String(areaName)}
                    </Badge>
                  )
                })}
                {prospect.preferredAreas.length > 3 && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                    +{String(prospect.preferredAreas.length - 3)}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {prospect.moveInBy && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">
                {prospect.moveInBy.toLocaleDateString('es-ES')}
              </span>
            </div>
          )}
          
          {prospect.fundingReady && (
            <Badge variant="outline" className="text-xs">
              Financiación lista
            </Badge>
          )}
        </div>
      </div>

      {prospect.notesInternal && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600 line-clamp-2">
            {prospect.notesInternal}
          </p>
        </div>
      )}
    </Card>
  )
} 