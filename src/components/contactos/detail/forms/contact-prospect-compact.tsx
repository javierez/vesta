'use client'

import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Edit2, MapPin, Banknote, Home, Bed, Bath, Calendar, Target } from "lucide-react"
import { cn, prospectUtils } from "~/lib/utils"
import { useEffect, useState } from "react"
import { getLocationByNeighborhoodId } from "~/server/queries/locations"

interface ProspectData {
  id: bigint
  contactId: bigint
  status: string
  listingType: string | null
  propertyType: string | null
  minPrice: string | null
  maxPrice: string | null
  preferredAreas: Array<{ neighborhoodId?: number; name?: string }> | null
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

interface LocationData {
  neighborhoodId: bigint
  city: string
  province: string
  municipality: string
  neighborhood: string
}

export function ContactProspectCompact({ prospect, onEdit, onDelete }: ContactProspectCompactProps) {
  const [locationData, setLocationData] = useState<LocationData[]>([])
  const [titleText, setTitleText] = useState('')

  useEffect(() => {
    const fetchLocationData = async () => {
      if (!prospect.preferredAreas || !Array.isArray(prospect.preferredAreas)) {
        generateTitle([])
        return
      }

      const locationPromises = prospect.preferredAreas
        .filter(area => area.neighborhoodId)
        .map(area => getLocationByNeighborhoodId(area.neighborhoodId!))

      try {
        const locations = await Promise.all(locationPromises)
        const validLocations = locations.filter(loc => loc !== undefined) as LocationData[]
        setLocationData(validLocations)
        generateTitle(validLocations)
      } catch (error) {
        console.error('Error fetching location data:', error)
        generateTitle([])
      }
    }

    fetchLocationData()
  }, [prospect.preferredAreas, prospect.listingType, prospect.propertyType])

  const generateTitle = (locations: LocationData[]) => {
    const title = prospectUtils.generateProspectTitle(
      prospect.listingType, 
      prospect.propertyType, 
      locations
    )
    setTitleText(title)
  }

  const getUrgencyColor = (level: number | null) => {
    switch (level) {
      case 1: return 'bg-gray-50 text-gray-900 hover:bg-gray-50 hover:text-gray-900'
      case 2: return 'bg-blue-50 text-blue-900 hover:bg-blue-50 hover:text-blue-900'
      case 3: return 'bg-yellow-50 text-yellow-900 hover:bg-yellow-50 hover:text-yellow-900'
      case 4: return 'bg-orange-50 text-orange-900 hover:bg-orange-50 hover:text-orange-900'
      case 5: return 'bg-red-50 text-red-900 hover:bg-red-50 hover:text-red-900'
      default: return 'bg-gray-50 text-gray-900 hover:bg-gray-50 hover:text-gray-900'
    }
  }

  const formatPrice = prospectUtils.formatCurrency
  const getPropertyTypeIcon = prospectUtils.getPropertyTypeIcon

  return (
    <Card className="p-4 border-gray-200 bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getPropertyTypeIcon(prospect.propertyType)}</span>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              {titleText}
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
            <Banknote className="h-4 w-4" />
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
          {locationData.length > 0 && (
            <div className="flex items-start space-x-2 text-gray-600">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {locationData.slice(0, 3).map((location, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs px-1.5 py-0.5 h-auto"
                  >
                    {location.neighborhood}
                  </Badge>
                ))}
                {locationData.length > 3 && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                    +{locationData.length - 3}
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