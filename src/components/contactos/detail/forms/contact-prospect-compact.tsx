import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { Edit2, MapPin, Banknote, Home, Bed, Bath } from "lucide-react"
import { prospectUtils } from "~/lib/utils"
import { useEffect, useState } from "react"
import { getLocationByNeighborhoodId } from "~/server/queries/locations"

interface ProspectData {
  id: bigint
  contactId: bigint
  status: string
  listingType: string | null
  propertyType: string | null
  maxPrice: string | null
  preferredAreas: Array<{ neighborhoodId?: number; name?: string }> | null
  minBedrooms: number | null
  minBathrooms: number | null
  minSquareMeters: number | null
  moveInBy: Date | null
  extras: Record<string, unknown> | null
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

export function ContactProspectCompact({ prospect, onEdit, onDelete: _onDelete }: ContactProspectCompactProps) {
  const [locationData, setLocationData] = useState<LocationData[]>([])
  const [titleText, setTitleText] = useState('')

  const generateTitle = (locations: LocationData[]) => {
    const title = prospectUtils.generateProspectTitle(
      prospect.listingType, 
      prospect.propertyType, 
      locations
    )
    setTitleText(title)
  }

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

    void fetchLocationData()
  }, [prospect.preferredAreas, prospect.listingType, prospect.propertyType, generateTitle])

  const formatPrice = prospectUtils.formatCurrency
  const getPropertyTypeIcon = prospectUtils.getPropertyTypeIcon

  return (
    <Card className="p-4 border-gray-200 bg-white hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{getPropertyTypeIcon(prospect.propertyType)}</span>
            <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-base font-semibold text-gray-900">
                {titleText}
              </h4>
              {prospect.urgencyLevel && (
                <span className="text-red-500 font-bold">
                  {prospect.urgencyLevel === 3 ? "(!)" : 
                   prospect.urgencyLevel === 4 ? "(!!)" : 
                   prospect.urgencyLevel === 5 ? "(!!!)" : ""}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Creado {prospect.createdAt.toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(prospect)}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3 text-sm">
        {/* All Characteristics in One Line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-700">
            {/* Budget */}
            <div className="flex items-center space-x-1">
              <Banknote className="h-4 w-4" />
              <span>&lt;{formatPrice(prospect.maxPrice)}</span>
            </div>
            
            <Separator orientation="vertical" className="h-4 mx-4" />
            
            {/* Property Size */}
            {prospect.minSquareMeters && (
              <div className="flex items-center space-x-1">
                <Home className="h-4 w-4" />
                <span>&gt;{prospect.minSquareMeters} m²</span>
              </div>
            )}
            
            <Separator orientation="vertical" className="h-4 mx-4" />
            
            {/* Rooms */}
            <div className="flex items-center space-x-3">
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
          </div>
          
          {prospect.fundingReady && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              Financiación lista
            </Badge>
          )}
        </div>
        
        {/* Preferred Areas */}
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