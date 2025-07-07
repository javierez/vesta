"use client"

import { Card, CardContent, CardHeader } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Mail, Phone, MoreHorizontal, MapPin, Building, MessageSquare, Clock, Calendar, User, Pencil, Trash2, Check } from "lucide-react"
import { contactTypeConfig, formatListingType, formatCurrency } from "./contact-config"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import Link from "next/link"
import { cn } from "~/lib/utils"
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
}

interface ContactCardProps {
  contact: Contact
}

export function ContactCard({ contact }: ContactCardProps) {
  const router = useRouter()
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const typeConfig = contactTypeConfig[contact.contactType]
  const TypeIcon = typeConfig.icon

  // Log component initialization
  console.log('[ContactCard] Component initialized with contact:', {
    contactId: contact.contactId,
    name: `${contact.firstName} ${contact.lastName}`,
    contactType: contact.contactType,
    hasEmail: !!contact.email,
    hasPhone: !!contact.phone,
    hasListing: !!contact.listingId,
    ownerCount: contact.ownerCount,
    buyerCount: contact.buyerCount
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
      className="overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer hover:bg-gray-50/50 hover:scale-[1.02]"
      onClick={() => router.push(`/contactos/${contact.contactId}`)}
    >
      <div className={cn("h-2", typeConfig.lightColors)} />

      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg text-gray-900">
              {contact.firstName} {contact.lastName}
            </h3>
          </div>

          {/* Role badges displayed under the name in parallel */}
          <div className="flex items-center gap-2 mt-2">
            {/* Propietario badge - show if contact has owner relationships */}
            {contact.ownerCount !== undefined && contact.ownerCount > 0 && (
              <Badge
                className="text-xs font-medium rounded-full px-3 bg-green-50 text-green-700 shadow-md whitespace-nowrap"
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
                Propietario ({contact.ownerCount})
              </Badge>
            )}
            
            {/* Demandante badge - show if contact has buyer relationships */}
            {contact.buyerCount !== undefined && contact.buyerCount > 0 && (
              <Badge
                className="text-xs font-medium rounded-full px-3 bg-blue-50 text-blue-700 shadow-md whitespace-nowrap"
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
                Demandante ({contact.buyerCount})
              </Badge>
            )}

            {/* Interesado badge - show if contact has no specific relationships */}
            {contact.ownerCount !== undefined && contact.ownerCount === 0 && 
             contact.buyerCount !== undefined && contact.buyerCount === 0 && (
              <Badge
                className="text-xs font-medium rounded-full px-3 bg-orange-50 text-orange-700 shadow-md whitespace-nowrap"
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
                Interesado
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
              <div className="cursor-pointer hover:bg-gray-50 hover:border hover:border-gray-200 rounded-lg p-2 transition-all duration-200 active:bg-gray-100 active:scale-[0.98]">
                <div className="space-y-1.5 -m-2 p-2">
                  {contact.email && (
                    <div 
                      className="flex items-center text-xs text-gray-600 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(contact.email!, 'email')
                      }}
                    >
                      {copiedField === 'email' ? (
                        <Check className="mr-1.5 h-3 w-3 text-green-600 flex-shrink-0" />
                      ) : (
                        <Mail className="mr-1.5 h-3 w-3 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div 
                      className="flex items-center text-xs text-gray-600 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(contact.phone!, 'phone')
                      }}
                    >
                      {copiedField === 'phone' ? (
                        <Check className="mr-1.5 h-3 w-3 text-green-600 flex-shrink-0" />
                      ) : (
                        <Phone className="mr-1.5 h-3 w-3 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="truncate">{contact.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {contact.additionalInfo?.location && (
              <div className="flex items-center text-xs text-gray-600">
                <MapPin className="mr-1.5 h-3 w-3 text-gray-400 flex-shrink-0" />
                <span className="truncate">{contact.additionalInfo.location}</span>
              </div>
            )}
            {contact.additionalInfo?.budget && (
              <div className="flex items-center text-xs text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1.5 h-3 w-3 text-gray-400 flex-shrink-0"
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
              <div className="flex items-center text-xs text-gray-600">
                <Building className="mr-1.5 h-3 w-3 text-gray-400 flex-shrink-0" />
                <span>{contact.additionalInfo.propertiesCount} inmuebles</span>
              </div>
            )}
          </div>

          {/* Right Column - Property Location */}
          <div className="space-y-1.5">
            {contact.listingId && (
              <div 
                className="cursor-pointer hover:bg-gray-50 hover:border hover:border-gray-200 rounded-lg p-2 transition-all duration-200 active:bg-gray-100 active:scale-[0.98]"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/propiedades/${contact.listingId}`)
                }}
              >
                <div className="space-y-1.5 -m-2 p-2">
                  {contact.street && contact.city && (
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="mr-1.5 h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {contact.street} <span className="text-gray-500">({contact.city})</span>
                      </span>
                    </div>
                  )}
                  {contact.street && !contact.city && (
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="mr-1.5 h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{contact.street}</span>
                    </div>
                  )}
                  {!contact.street && contact.city && (
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="mr-1.5 h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{contact.city}</span>
                    </div>
                  )}
                  
                  {/* Property Type and Listing Type */}
                  {(contact.propertyType || contact.listingType) && (
                    <div className="flex items-center text-xs text-gray-600">
                      <Building className="mr-1.5 h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {contact.propertyType && (
                          <span className="capitalize">{contact.propertyType}</span>
                        )}
                        {contact.propertyType && contact.listingType && (
                          <span className="text-gray-500"> • </span>
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
                  <div className="flex items-center text-xs text-gray-600">
                    <MapPin className="mr-1.5 h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">
                      {contact.street} <span className="text-gray-500">({contact.city})</span>
                    </span>
                  </div>
                )}
                {contact.street && !contact.city && (
                  <div className="flex items-center text-xs text-gray-600">
                    <MapPin className="mr-1.5 h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{contact.street}</span>
                  </div>
                )}
                {!contact.street && contact.city && (
                  <div className="flex items-center text-xs text-gray-600">
                    <MapPin className="mr-1.5 h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{contact.city}</span>
                  </div>
                )}
                
                {/* Property Type and Listing Type */}
                {(contact.propertyType || contact.listingType) && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Building className="mr-1.5 h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">
                      {contact.propertyType && (
                        <span className="capitalize">{contact.propertyType}</span>
                      )}
                      {contact.propertyType && contact.listingType && (
                        <span className="text-gray-500"> • </span>
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

        {contact.additionalInfo?.notes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600 line-clamp-2">{contact.additionalInfo.notes}</p>
            </div>
          </div>
        )}

        {/* Recordatorios (Checklist) Section - Mock Data */}
        <hr className="mt-4 mb-2 border-t border-gray-200" />
        <div 
          className="p-4 bg-gray-50 rounded-lg shadow-md min-h-[120px] flex flex-col gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mock checklist items with custom round checks */}
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full border border-gray-300 bg-gray-50 inline-block" />
            <span className="text-xs text-gray-800">Llamar para seguimiento</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full border border-gray-300 bg-gray-50 inline-block" />
            <span className="text-xs text-gray-800">Enviar propuesta por email</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full border border-gray-300 bg-gray-50 inline-block" />
            <span className="text-xs text-gray-800">Actualizar datos de contacto</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 