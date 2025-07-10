"use client"

import { Card, CardContent, CardHeader } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Mail, Phone, MoreHorizontal, MapPin, Building, MessageSquare, Clock, Calendar, User, Pencil, Trash2, Check } from "lucide-react"
import { contactTypeConfig, formatListingType, formatCurrency } from "../contact-config"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import Link from "next/link"
import { cn, prospectUtils } from "~/lib/utils"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Contact {
  contactId: bigint
  firstName: string
  lastName: string
  email?: string
  phone?: string
  contactType: "demandante" | "propietario" | "banco" | "agencia" | "interesado"
  isActive: boolean
  listingId?: bigint
  listingContactId?: bigint
  street?: string
  city?: string
  propertyType?: string
  listingType?: string
  ownerCount?: number
  buyerCount?: number
  prospectCount?: number
  // Server-provided role flags
  isOwner?: boolean
  isBuyer?: boolean
  isInteresado?: boolean
  additionalInfo?: {
    demandType?: string
    propertiesCount?: number
    propertyTypes?: string[]
    budget?: number
    location?: string
    notes?: string
  }
  lastContact?: Date
  createdAt?: Date
  // Generated prospect title for interesado contacts
  prospectTitle?: string | null
  // Legacy field for prospect information (keeping for backward compatibility)
  mostRecentProspect?: {
    listingType?: string
    propertyType?: string
    minPrice?: number
    maxPrice?: number
    preferredArea?: string
    status?: string
    createdAt?: Date
  }
}

interface ContactCardProps {
  contact: Contact
}

export function ContactCard({ contact }: ContactCardProps) {
  const router = useRouter()
  const [copiedField, setCopiedField] = useState<string | null>(null)
  
  // Determine card color/gradient based on role flags
  const getCardColor = () => {
    const roles = []
    if (contact.isOwner) roles.push('owner')
    if (contact.isBuyer) roles.push('buyer') 
    if (contact.isInteresado) roles.push('interested')
    
    // Multiple roles - create gradients with lighter colors
    if (roles.length > 1) {
      const colors = []
      if (contact.isOwner) colors.push('from-green-200')
      if (contact.isBuyer) colors.push('via-blue-200')
      if (contact.isInteresado) colors.push('to-orange-200')
      
      if (roles.length === 2) {
        // Two roles: simple gradient
        if (contact.isOwner && contact.isBuyer) return "bg-gradient-to-r from-green-200 to-blue-200"
        if (contact.isOwner && contact.isInteresado) return "bg-gradient-to-r from-green-200 to-orange-200"
        if (contact.isBuyer && contact.isInteresado) return "bg-gradient-to-r from-blue-200 to-orange-200"
      } else if (roles.length === 3) {
        // Three roles: three-color gradient
        return "bg-gradient-to-r from-green-200 via-blue-200 to-orange-200"
      }
    }
    
    // Single role - solid colors with lighter variants
    if (contact.isOwner) return "bg-green-200"
    if (contact.isBuyer) return "bg-blue-200" 
    if (contact.isInteresado) return "bg-orange-200"
    
    // Fallback
    return "bg-gray-200"
  }

  // Debug log for client-side verification
  console.log(`🎯 Client Card: ${contact.firstName} ${contact.lastName}`, {
    contactId: contact.contactId.toString(),
    contactType: contact.contactType,
    flags: {
      isOwner: contact.isOwner,
      isBuyer: contact.isBuyer,
      isInteresado: contact.isInteresado
    },
    counts: {
      ownerCount: contact.ownerCount,
      buyerCount: contact.buyerCount,
      prospectCount: contact.prospectCount
    }
  })

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer hover:scale-[1.02]",
        contact.isActive 
          ? "hover:bg-gray-50/50" 
          : "opacity-60 hover:bg-gray-100/50"
      )}
      onClick={() => router.push(`/contactos/${contact.contactId}`)}
    >
      <div className={cn("h-2", contact.isActive ? getCardColor() : "bg-gray-300")} />

      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "font-semibold text-lg",
              contact.isActive ? "text-gray-900" : "text-gray-500"
            )}>
              {contact.firstName} {contact.lastName}
            </h3>
          </div>

          {/* Role badges displayed under the name in parallel */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Propietario badge - always show if contact is owner */}
            {contact.isOwner === true && (
              <Badge
                className={cn(
                  "text-xs font-medium rounded-full px-3 shadow-md whitespace-nowrap",
                  contact.isActive 
                    ? "bg-green-50 text-green-900 hover:bg-green-100 hover:text-green-900" 
                    : "bg-gray-100 text-gray-500"
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3 mr-1"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9,22 9,12 15,12 15,22" />
                </svg>
                Propietario{(contact.ownerCount && contact.ownerCount > 1) ? ` (${contact.ownerCount})` : ''}
              </Badge>
            )}
            
            {/* Demandante badge - always show if contact is buyer */}
            {contact.isBuyer === true && (
              <Badge
                className={cn(
                  "text-xs font-medium rounded-full px-3 shadow-md whitespace-nowrap",
                  contact.isActive 
                    ? "bg-blue-50 text-blue-900 hover:bg-blue-100 hover:text-blue-900" 
                    : "bg-gray-100 text-gray-500"
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3 mr-1"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                Demandante{(contact.buyerCount && contact.buyerCount > 1) ? ` (${contact.buyerCount})` : ''}
              </Badge>
            )}

            {/* Interesado badge - always show if contact has interests */}
            {contact.isInteresado === true && (
              <Badge
                className={cn(
                  "text-xs font-medium rounded-full px-3 shadow-md whitespace-nowrap",
                  contact.isActive 
                    ? "bg-orange-50 text-orange-900 hover:bg-orange-100 hover:text-orange-900" 
                    : "bg-gray-100 text-gray-500"
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3 mr-1"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                Interesado{(contact.prospectCount && contact.prospectCount > 1) ? ` (${contact.prospectCount})` : ''}
              </Badge>
            )}

            {/* Fallback Interesado badge - only show if ALL flags are false/undefined */}
            {(contact.isOwner !== true && contact.isBuyer !== true && contact.isInteresado !== true) && (
              <Badge
                className={cn(
                  "text-xs font-medium rounded-full px-3 shadow-md whitespace-nowrap",
                  contact.isActive 
                    ? "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-800" 
                    : "bg-gray-100 text-gray-500"
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3 mr-1"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                Sin clasificar
              </Badge>
            )}
          </div>

          {contact.additionalInfo?.demandType && (
            <Badge variant="secondary" className="text-xs mt-1">
              {contact.additionalInfo.demandType}
            </Badge>
          )}
        </div>


      </CardHeader>

      <CardContent className="space-y-3 pt-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column - Compact Contact Information */}
          <div className="space-y-1.5">
            {(contact.email || contact.phone) && (
              <div className={cn(
                "cursor-pointer hover:border rounded-lg p-2 transition-all duration-200 active:scale-[0.98]",
                contact.isActive 
                  ? "hover:bg-gray-50 hover:border-gray-200 active:bg-gray-100" 
                  : "hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200"
              )}>
                <div className="space-y-1.5 -m-2 p-2">
                  {contact.email && (
                    <div 
                      className={cn(
                        "flex items-center text-xs cursor-pointer transition-colors",
                        contact.isActive 
                          ? "text-gray-600 hover:text-blue-600" 
                          : "text-gray-400 hover:text-gray-600"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(contact.email!, 'email')
                      }}
                    >
                      {copiedField === 'email' ? (
                        <Check className="mr-1.5 h-3 w-3 text-green-600 flex-shrink-0" />
                      ) : (
                        <Mail className={cn(
                          "mr-1.5 h-3 w-3 flex-shrink-0",
                          contact.isActive ? "text-gray-400" : "text-gray-300"
                        )} />
                      )}
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div 
                      className={cn(
                        "flex items-center text-xs cursor-pointer transition-colors",
                        contact.isActive 
                          ? "text-gray-600 hover:text-blue-600" 
                          : "text-gray-400 hover:text-gray-600"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(contact.phone!, 'phone')
                      }}
                    >
                      {copiedField === 'phone' ? (
                        <Check className="mr-1.5 h-3 w-3 text-green-600 flex-shrink-0" />
                      ) : (
                        <Phone className={cn(
                          "mr-1.5 h-3 w-3 flex-shrink-0",
                          contact.isActive ? "text-gray-400" : "text-gray-300"
                        )} />
                      )}
                      <span className="truncate">{contact.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {contact.additionalInfo?.location && (
              <div className={cn(
                "flex items-center text-xs",
                contact.isActive ? "text-gray-600" : "text-gray-400"
              )}>
                <MapPin className={cn(
                  "mr-1.5 h-3 w-3 flex-shrink-0",
                  contact.isActive ? "text-gray-400" : "text-gray-300"
                )} />
                <span className="truncate">{contact.additionalInfo.location}</span>
              </div>
            )}
            {contact.additionalInfo?.budget && (
              <div className={cn(
                "flex items-center text-xs",
                contact.isActive ? "text-gray-600" : "text-gray-400"
              )}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    "mr-1.5 h-3 w-3 flex-shrink-0",
                    contact.isActive ? "text-gray-400" : "text-gray-300"
                  )}
                >
                  <circle cx="12" cy="12" r="8" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="truncate">
                  {formatCurrency(contact.additionalInfo.budget)}
                </span>
              </div>
            )}
            {contact.additionalInfo?.propertiesCount && (
              <div className={cn(
                "flex items-center text-xs",
                contact.isActive ? "text-gray-600" : "text-gray-400"
              )}>
                <Building className={cn(
                  "mr-1.5 h-3 w-3 flex-shrink-0",
                  contact.isActive ? "text-gray-400" : "text-gray-300"
                )} />
                <span>{contact.additionalInfo.propertiesCount} inmuebles</span>
              </div>
            )}
          </div>

          {/* Right Column - Property Location */}
          <div className="space-y-1.5">
            {contact.listingId && (
              <div 
                className={cn(
                  "cursor-pointer hover:border rounded-lg p-2 transition-all duration-200 active:scale-[0.98]",
                  contact.isActive 
                    ? "hover:bg-gray-50 hover:border-gray-200 active:bg-gray-100" 
                    : "hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200"
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/propiedades/${contact.listingId}`)
                }}
              >
                <div className="space-y-1.5 -m-2 p-2">
                  {contact.street && contact.city && (
                    <div className={cn(
                      "flex items-center text-xs",
                      contact.isActive ? "text-gray-600" : "text-gray-400"
                    )}>
                      <MapPin className={cn(
                        "mr-1.5 h-3 w-3 flex-shrink-0",
                        contact.isActive ? "text-gray-400" : "text-gray-300"
                      )} />
                      <span className="truncate">
                        {contact.street} <span className={contact.isActive ? "text-gray-500" : "text-gray-400"}>({contact.city})</span>
                      </span>
                    </div>
                  )}
                  {contact.street && !contact.city && (
                    <div className={cn(
                      "flex items-center text-xs",
                      contact.isActive ? "text-gray-600" : "text-gray-400"
                    )}>
                      <MapPin className={cn(
                        "mr-1.5 h-3 w-3 flex-shrink-0",
                        contact.isActive ? "text-gray-400" : "text-gray-300"
                      )} />
                      <span className="truncate">{contact.street}</span>
                    </div>
                  )}
                  {!contact.street && contact.city && (
                    <div className={cn(
                      "flex items-center text-xs",
                      contact.isActive ? "text-gray-600" : "text-gray-400"
                    )}>
                      <MapPin className={cn(
                        "mr-1.5 h-3 w-3 flex-shrink-0",
                        contact.isActive ? "text-gray-400" : "text-gray-300"
                      )} />
                      <span className="truncate">{contact.city}</span>
                    </div>
                  )}
                  
                  {/* Property Type and Listing Type */}
                  {(contact.propertyType || contact.listingType) && (
                    <div className={cn(
                      "flex items-center text-xs",
                      contact.isActive ? "text-gray-600" : "text-gray-400"
                    )}>
                      <Building className={cn(
                        "mr-1.5 h-3 w-3 flex-shrink-0",
                        contact.isActive ? "text-gray-400" : "text-gray-300"
                      )} />
                      <span className="truncate">
                        {contact.propertyType && (
                          <span className="capitalize">{contact.propertyType}</span>
                        )}
                        {contact.propertyType && contact.listingType && (
                          <span className={contact.isActive ? "text-gray-500" : "text-gray-400"}> • </span>
                        )}
                        {contact.listingType && (
                          <span>{formatListingType(contact.listingType)}</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {!contact.listingId && (
              <div className="space-y-1.5">
                {contact.street && contact.city && (
                  <div className={cn(
                    "flex items-center text-xs",
                    contact.isActive ? "text-gray-600" : "text-gray-400"
                  )}>
                    <MapPin className={cn(
                      "mr-1.5 h-3 w-3 flex-shrink-0",
                      contact.isActive ? "text-gray-400" : "text-gray-300"
                    )} />
                    <span className="truncate">
                      {contact.street} <span className={contact.isActive ? "text-gray-500" : "text-gray-400"}>({contact.city})</span>
                    </span>
                  </div>
                )}
                {contact.street && !contact.city && (
                  <div className={cn(
                    "flex items-center text-xs",
                    contact.isActive ? "text-gray-600" : "text-gray-400"
                  )}>
                    <MapPin className={cn(
                      "mr-1.5 h-3 w-3 flex-shrink-0",
                      contact.isActive ? "text-gray-400" : "text-gray-300"
                    )} />
                    <span className="truncate">{contact.street}</span>
                  </div>
                )}
                {!contact.street && contact.city && (
                  <div className={cn(
                    "flex items-center text-xs",
                    contact.isActive ? "text-gray-600" : "text-gray-400"
                  )}>
                    <MapPin className={cn(
                      "mr-1.5 h-3 w-3 flex-shrink-0",
                      contact.isActive ? "text-gray-400" : "text-gray-300"
                    )} />
                    <span className="truncate">{contact.city}</span>
                  </div>
                )}
                
                {/* Property Type and Listing Type */}
                {(contact.propertyType || contact.listingType) && (
                  <div className={cn(
                    "flex items-center text-xs",
                    contact.isActive ? "text-gray-600" : "text-gray-400"
                  )}>
                    <Building className={cn(
                      "mr-1.5 h-3 w-3 flex-shrink-0",
                      contact.isActive ? "text-gray-400" : "text-gray-300"
                    )} />
                    <span className="truncate">
                      {contact.propertyType && (
                        <span className="capitalize">{contact.propertyType}</span>
                      )}
                      {contact.propertyType && contact.listingType && (
                        <span className={contact.isActive ? "text-gray-500" : "text-gray-400"}> • </span>
                      )}
                      {contact.listingType && (
                        <span>{formatListingType(contact.listingType)}</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {(contact.additionalInfo?.notes || contact.prospectTitle || contact.mostRecentProspect) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <MessageSquare className={cn(
                "h-4 w-4 mt-0.5 flex-shrink-0",
                contact.isActive ? "text-gray-400" : "text-gray-300"
              )} />
              <p className={cn(
                "text-xs line-clamp-2",
                contact.isActive ? "text-gray-600" : "text-gray-400"
              )}>
                {contact.prospectTitle ? (
                  // Use the pre-generated prospect title from the query
                  contact.prospectTitle
                ) : contact.mostRecentProspect ? (
                  // Fallback to legacy prospect data (for backward compatibility)
                  (() => {
                    const locations = contact.mostRecentProspect.preferredArea ? [{
                      neighborhoodId: BigInt(0), // placeholder id since we only have the name
                      city: contact.mostRecentProspect.preferredArea,
                      province: "",
                      municipality: "",
                      neighborhood: contact.mostRecentProspect.preferredArea
                    }] : []
                    
                    const title = prospectUtils.generateProspectTitle(
                      contact.mostRecentProspect.listingType ?? null,
                      contact.mostRecentProspect.propertyType ?? null,
                      locations
                    )
                    const priceRange = contact.mostRecentProspect.minPrice && contact.mostRecentProspect.maxPrice
                      ? ` • ${prospectUtils.formatCurrency(contact.mostRecentProspect.minPrice)} - ${prospectUtils.formatCurrency(contact.mostRecentProspect.maxPrice)}`
                      : ''
                    
                    return `${title}${priceRange}`
                  })()
                ) : (
                  contact.additionalInfo?.notes
                )}
              </p>
            </div>
          </div>
        )}

        {/* Recordatorios (Checklist) Section - Mock Data */}
        <hr className="mt-4 mb-2 border-t border-gray-200" />
        <div 
          className={cn(
            "p-4 rounded-lg shadow-md min-h-[120px] flex flex-col gap-3",
            contact.isActive ? "bg-gray-50" : "bg-gray-100"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mock checklist items with custom round checks */}
          <div className="flex items-center gap-2">
            <span className={cn(
              "w-5 h-5 rounded-full border inline-block",
              contact.isActive 
                ? "border-gray-300 bg-gray-50" 
                : "border-gray-200 bg-gray-200"
            )} />
            <span className={cn(
              "text-xs",
              contact.isActive ? "text-gray-800" : "text-gray-500"
            )}>Llamar para seguimiento</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "w-5 h-5 rounded-full border inline-block",
              contact.isActive 
                ? "border-gray-300 bg-gray-50" 
                : "border-gray-200 bg-gray-200"
            )} />
            <span className={cn(
              "text-xs",
              contact.isActive ? "text-gray-800" : "text-gray-500"
            )}>Enviar propuesta por email</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "w-5 h-5 rounded-full border inline-block",
              contact.isActive 
                ? "border-gray-300 bg-gray-50" 
                : "border-gray-200 bg-gray-200"
            )} />
            <span className={cn(
              "text-xs",
              contact.isActive ? "text-gray-800" : "text-gray-500"
            )}>Actualizar datos de contacto</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 