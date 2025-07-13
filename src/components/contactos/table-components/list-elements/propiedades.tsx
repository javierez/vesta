"use client"

import React, { useState } from "react"
import { MapPin, Building, ChevronDown, ChevronRight, ChevronUp, HelpCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { formatListingType } from "../../contact-config"

// Contact Listing type
interface ContactListing {
  listingId: bigint
  contactType: string
  street?: string
  city?: string
  propertyType?: string
  listingType?: string
  status?: string
  createdAt: Date
}

interface PropiedadesProps {
  isActive: boolean
  allListings?: ContactListing[]
  currentFilter?: string[]
  prospectTitles?: string[]
}

export function Propiedades({
  isActive,
  allListings,
  currentFilter = [],
  prospectTitles = []
}: PropiedadesProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isProspectsExpanded, setIsProspectsExpanded] = useState(false)
  
  // Use allListings directly - no fallback needed since we always provide it
  const displayListings = allListings || []
  
  // Check if we should show prospects (when filter is set to demandante/buyer/interested)
  const shouldShowProspects = currentFilter.includes('buyer') || currentFilter.includes('interested')
  const hasProspects = prospectTitles.length > 0

  // If no listings and no prospects to show
  if (displayListings.length === 0 && (!shouldShowProspects || !hasProspects)) {
    const isDemandanteFilter = currentFilter.includes('buyer') || currentFilter.includes('interested')
    return (
      <div className={cn(
        "text-sm",
        isActive ? "text-muted-foreground" : "text-gray-400"
      )}>
        {isDemandanteFilter ? 'Sin demandas' : 'Sin propiedades'}
      </div>
    )
  }

  // Function to render a single prospect
  const renderProspect = (title: string, index: number) => (
    <div
      key={`prospect-${index}`}
      className={cn(
        "flex items-center text-xs rounded-lg p-1.5 mx-3",
        isActive ? "text-muted-foreground" : "text-gray-400"
      )}
    >
      <HelpCircle className={cn(
        "mr-2 h-3 w-3 flex-shrink-0",
        isActive ? "text-muted-foreground" : "text-gray-300"
      )} />
      <span className="truncate">{title}</span>
    </div>
  )

  // If only prospects and no listings - display prospects directly
  if (displayListings.length === 0 && shouldShowProspects && hasProspects) {
    if (prospectTitles.length === 1) {
      // Single prospect - display directly
      return renderProspect(prospectTitles[0]!, 0)
    }

    // Multiple prospects - display with expand/collapse
    return (
      <div className="space-y-1 my-2">
        {/* First prospect display */}
        {renderProspect(prospectTitles[0]!, 0)}

        {/* Toggle button for additional prospects */}
        {!isProspectsExpanded && prospectTitles.length > 1 && (
          <div 
            className={cn(
              "cursor-pointer rounded-md p-1 transition-all duration-200 flex items-center justify-center text-xs my-1",
              isActive 
                ? "hover:bg-gray-100 text-muted-foreground" 
                : "hover:bg-gray-200 text-gray-400"
            )}
            onClick={(e) => {
              e.stopPropagation()
              setIsProspectsExpanded(!isProspectsExpanded)
            }}
          >
            <ChevronDown className="h-3 w-3 mr-1" />
          </div>
        )}

        {/* Expanded prospects container */}
        {isProspectsExpanded && (
          <>
            <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="space-y-0.5 pr-2">
                {prospectTitles.slice(1).map((title, index) => 
                  renderProspect(title, index + 1)
                )}
              </div>
            </div>
            
            {/* Toggle button at the bottom when expanded */}
            <div 
              className={cn(
                "cursor-pointer rounded-md p-1 transition-all duration-200 flex items-center justify-center text-xs my-1",
                isActive 
                  ? "hover:bg-gray-100 text-muted-foreground" 
                  : "hover:bg-gray-200 text-gray-400"
              )}
              onClick={(e) => {
                e.stopPropagation()
                setIsProspectsExpanded(!isProspectsExpanded)
              }}
            >
              <ChevronUp className="h-3 w-3 mr-1" />
            </div>
          </>
        )}
      </div>
    )
  }

  // Calculate total items (listings + prospects)
  const totalItems = displayListings.length + (shouldShowProspects && hasProspects ? prospectTitles.length : 0)

  if (totalItems === 1) {
    // Single item (either listing or prospect) - display directly
    if (displayListings.length === 1) {
      const listing = displayListings[0]
      if (!listing) return null
      
      return (
        <div 
          className={cn(
            "cursor-pointer rounded-xl p-2 mx-2 my-0.5 transition-all duration-200 active:scale-[0.98] hover:shadow-md",
            isActive 
              ? "active:bg-gray-100" 
              : "active:bg-gray-200"
          )}
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/propiedades/${listing.listingId}`)
          }}
        >
          <div className="space-y-1 -m-2 p-2">
            {(listing.street || listing.city) && (
              <div className={cn(
                "flex items-center text-sm",
                isActive ? "" : "text-gray-400"
              )}>
                <MapPin className={cn(
                  "mr-2 h-4 w-4 flex-shrink-0",
                  isActive ? "text-muted-foreground" : "text-gray-300"
                )} />
                <span className="truncate">
                  {listing.street} {listing.city && <span className={isActive ? "text-muted-foreground" : "text-gray-400"}>({listing.city})</span>}
                </span>
              </div>
            )}
            {(listing.propertyType || listing.listingType) && (
              <div className={cn(
                "flex items-center text-sm",
                isActive ? "" : "text-gray-400"
              )}>
                <Building className={cn(
                  "mr-2 h-4 w-4 flex-shrink-0",
                  isActive ? "text-muted-foreground" : "text-gray-300"
                )} />
                <span className="truncate">
                  {listing.propertyType && (
                    <span className="capitalize">{listing.propertyType}</span>
                  )}
                  {listing.propertyType && listing.listingType && (
                    <span className={isActive ? "text-muted-foreground" : "text-gray-400"}> • </span>
                  )}
                  {listing.listingType && (
                    <span>{formatListingType(listing.listingType)}</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      )
    } else {
      // Single prospect only
      return renderProspect(prospectTitles[0]!, 0)
    }
  }

  // Multiple items (listings + prospects) - display with expand/collapse
  const firstListing = displayListings[0]
  const remainingListings = displayListings.slice(1)
  const prospectsToShow = shouldShowProspects && hasProspects ? prospectTitles : []

  return (
    <div className="space-y-1 my-0.5">
      {/* First listing display */}
      {firstListing && (
        <div 
          className={cn(
            "cursor-pointer rounded-xl p-2 mx-2 my-0.5 transition-all duration-200 active:scale-[0.98] hover:shadow-md",
            isActive 
              ? "active:bg-gray-100" 
              : "active:bg-gray-200"
          )}
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/propiedades/${firstListing.listingId}`)
          }}
        >
          <div className="space-y-1 -m-2 p-2">
            {(firstListing.street || firstListing.city) && (
              <div className={cn(
                "flex items-center text-sm",
                isActive ? "" : "text-gray-400"
              )}>
                <MapPin className={cn(
                  "mr-2 h-4 w-4 flex-shrink-0",
                  isActive ? "text-muted-foreground" : "text-gray-300"
                )} />
                <span className="truncate">
                  {firstListing.street} {firstListing.city && <span className={isActive ? "text-muted-foreground" : "text-gray-400"}>({firstListing.city})</span>}
                </span>
              </div>
            )}
            {(firstListing.propertyType || firstListing.listingType) && (
              <div className={cn(
                "flex items-center text-sm",
                isActive ? "" : "text-gray-400"
              )}>
                <Building className={cn(
                  "mr-2 h-4 w-4 flex-shrink-0",
                  isActive ? "text-muted-foreground" : "text-gray-300"
                )} />
                <span className="truncate">
                  {firstListing.propertyType && (
                    <span className="capitalize">{firstListing.propertyType}</span>
                  )}
                  {firstListing.propertyType && firstListing.listingType && (
                    <span className={isActive ? "text-muted-foreground" : "text-gray-400"}> • </span>
                  )}
                  {firstListing.listingType && (
                    <span>{formatListingType(firstListing.listingType)}</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toggle button for additional items (listings + prospects) */}
      {!isExpanded && totalItems > 1 && (
        <div 
          className={cn(
            "cursor-pointer rounded-md p-1 transition-all duration-200 flex items-center justify-center text-xs",
            isActive 
              ? "hover:bg-gray-100 text-muted-foreground" 
              : "hover:bg-gray-200 text-gray-400"
          )}
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
        >
          <ChevronDown className="h-3 w-3 mr-1" />
        </div>
      )}

      {/* Expanded container with remaining listings + all prospects */}
      {isExpanded && (
        <>
          <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="space-y-1 pr-2">
              {/* Remaining listings */}
              {remainingListings.map((listing) => (
                <div
                  key={listing.listingId.toString()}
                  className={cn(
                    "cursor-pointer rounded-xl p-2 mx-2 my-0.5 transition-all duration-200 active:scale-[0.98] hover:shadow-md",
                    isActive 
                      ? "active:bg-gray-100" 
                      : "active:bg-gray-200"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/propiedades/${listing.listingId}`)
                  }}
                >
                  <div className="space-y-1">
                    {(listing.street || listing.city) && (
                      <div className={cn(
                        "flex items-center text-sm",
                        isActive ? "" : "text-gray-400"
                      )}>
                        <MapPin className={cn(
                          "mr-2 h-4 w-4 flex-shrink-0",
                          isActive ? "text-muted-foreground" : "text-gray-300"
                        )} />
                        <span className="truncate">
                          {listing.street} {listing.city && <span className={isActive ? "text-muted-foreground" : "text-gray-400"}>({listing.city})</span>}
                        </span>
                      </div>
                    )}
                    {(listing.propertyType || listing.listingType) && (
                      <div className={cn(
                        "flex items-center text-sm",
                        isActive ? "" : "text-gray-400"
                      )}>
                        <Building className={cn(
                          "mr-2 h-4 w-4 flex-shrink-0",
                          isActive ? "text-muted-foreground" : "text-gray-300"
                        )} />
                        <span className="truncate">
                          {listing.propertyType && (
                            <span className="capitalize">{listing.propertyType}</span>
                          )}
                          {listing.propertyType && listing.listingType && (
                            <span className={isActive ? "text-muted-foreground" : "text-gray-400"}> • </span>
                          )}
                          {listing.listingType && (
                            <span>{formatListingType(listing.listingType)}</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* All prospects */}
              {prospectsToShow.map((title, index) => 
                renderProspect(title, index)
              )}
            </div>
          </div>
          
          {/* Toggle button at the bottom when expanded */}
          <div 
            className={cn(
              "cursor-pointer rounded-md p-1 transition-all duration-200 flex items-center justify-center text-xs",
              isActive 
                ? "hover:bg-gray-100 text-muted-foreground" 
                : "hover:bg-gray-200 text-gray-400"
            )}
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            <ChevronUp className="h-3 w-3 mr-1" />
          </div>
        </>
      )}
    </div>
  )
}
