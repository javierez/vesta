"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Mail, Phone, Building2, Home, Search, Building, Landmark, Store, Circle, Clock, Calendar, MapPin, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { contactTypeConfig, formatListingType } from "./contact-config"
import { useState } from "react"

// Extended Contact type to include contactType for the UI
interface ExtendedContact {
  contactId: bigint
  firstName: string
  lastName: string
  email?: string
  phone?: string
  contactType: "demandante" | "propietario" | "banco" | "agencia"
  isActive: boolean
  listingId?: bigint
  listingContactId?: bigint
  street?: string
  city?: string
  propertyType?: string
  listingType?: string
  additionalInfo?: {
    demandType?: string
    propertiesCount?: number
    propertyTypes?: string[]
    budget?: number
    location?: string
    notes?: string
  }
  lastContact?: Date
  createdAt: Date
  updatedAt: Date
}

interface ContactTableProps {
  contacts: ExtendedContact[]
}

export function ContactTable({ contacts }: ContactTableProps) {
  const router = useRouter()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }



  const getContactTypeLabel = (type: ExtendedContact['contactType']) => {
    return contactTypeConfig[type].label
  }

  const getContactTypeIcon = (type: ExtendedContact['contactType']) => {
    const Icon = contactTypeConfig[type].icon
    return <Icon className="h-4 w-4 text-muted-foreground" />
  }

  const getAdditionalInfo = (contact: ExtendedContact) => {
    if (contact.contactType === 'demandante') {
      return (
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="text-xs">
            {contact.additionalInfo?.demandType || 'No especificado'}
          </Badge>
        </div>
      )
    }
    
    if (contact.additionalInfo?.propertiesCount) {
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Building className="h-3 w-3" />
            <span className="font-medium">{contact.additionalInfo.propertiesCount}</span>
          </div>
          <div className="flex gap-1">
            {contact.additionalInfo.propertyTypes?.slice(0, 2).map((type, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                {type}
              </Badge>
            ))}
            {contact.additionalInfo.propertyTypes && contact.additionalInfo.propertyTypes.length > 2 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                +{contact.additionalInfo.propertyTypes.length - 2}
              </Badge>
            )}
          </div>
        </div>
      )
    }
    
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span className="text-xs">Sin información</span>
      </div>
    )
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }



  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] min-w-[200px]">Nombre</TableHead>
              <TableHead className="w-[250px] min-w-[250px]">Contacto</TableHead>
              <TableHead className="w-[200px] min-w-[200px]">Inmueble</TableHead>
              <TableHead className="w-[150px] min-w-[150px]">Recordatorios</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => {
              const typeConfig = contactTypeConfig[contact.contactType]
              return (
              <TableRow 
                key={`${contact.contactId.toString()}-${contact.listingContactId?.toString() || 'no-listing'}`}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/contactos/${contact.contactId}`)}
              >
                <TableCell className="w-[200px] min-w-[200px]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1 h-6 rounded-full", typeConfig.lineColor)} />
                      <span className="font-medium">{contact.firstName} {contact.lastName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{contact.lastContact ? formatDate(contact.lastContact) : formatDate(contact.updatedAt)}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-xs font-medium border rounded-full px-3 transition-colors", typeConfig.colors)}
                    >
                      <typeConfig.icon className="h-3 w-3 mr-1" />
                      {typeConfig.label}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="w-[250px] min-w-[250px]">
                  <div className="space-y-1">
                    {(contact.email || contact.phone) && (
                      <div className="cursor-pointer hover:bg-gray-50 hover:border hover:border-gray-200 rounded-md p-2 transition-all duration-200 active:bg-gray-100 active:scale-[0.98]">
                        <div className="space-y-1 -m-2 p-2">
                          {contact.email && (
                            <div 
                              className="flex items-center text-sm cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(contact.email!, `email-${contact.contactId}`)
                              }}
                            >
                              {copiedField === `email-${contact.contactId}` ? (
                                <Check className="mr-2 h-4 w-4 text-green-600" />
                              ) : (
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="truncate">{contact.email}</span>
                    </div>
                          )}
                          {contact.phone && (
                            <div 
                              className="flex items-center text-sm cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(contact.phone!, `phone-${contact.contactId}`)
                              }}
                            >
                              {copiedField === `phone-${contact.contactId}` ? (
                                <Check className="mr-2 h-4 w-4 text-green-600" />
                              ) : (
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="truncate">{contact.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    </div>
                </TableCell>
                <TableCell className="w-[200px] min-w-[200px]">
                  <div className="space-y-1">
                    {/* Address Information */}
                      {contact.listingId && (
                      <div 
                        className="cursor-pointer hover:bg-gray-50 hover:border hover:border-gray-200 rounded-md p-2 transition-all duration-200 active:bg-gray-100 active:scale-[0.98]"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/propiedades/${contact.listingId}`)
                        }}
                      >
                        <div className="space-y-1 -m-2 p-2">
                          {contact.street && contact.city && (
                            <div className="flex items-center text-sm">
                              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="truncate">
                                {contact.street} <span className="text-muted-foreground">({contact.city})</span>
                              </span>
                            </div>
                          )}
                          {contact.street && !contact.city && (
                            <div className="flex items-center text-sm">
                              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{contact.street}</span>
                            </div>
                          )}
                          {!contact.street && contact.city && (
                            <div className="flex items-center text-sm">
                              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{contact.city}</span>
                            </div>
                          )}
                          {!contact.street && !contact.city && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="mr-2 h-4 w-4" />
                              <span className="italic">Sin ubicación</span>
                            </div>
                          )}
                          
                          {/* Property Type and Listing Type */}
                          {(contact.propertyType || contact.listingType) && (
                            <div className="flex items-center text-sm">
                              <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="truncate">
                                {contact.propertyType && (
                                  <span className="capitalize">{contact.propertyType}</span>
                                )}
                                {contact.propertyType && contact.listingType && (
                                  <span className="text-muted-foreground"> • </span>
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
                      <div className="space-y-1">
                        {contact.street && contact.city && (
                          <div className="flex items-center text-sm">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="truncate">
                              {contact.street} <span className="text-muted-foreground">({contact.city})</span>
                            </span>
                          </div>
                        )}
                        {contact.street && !contact.city && (
                          <div className="flex items-center text-sm">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{contact.street}</span>
                          </div>
                        )}
                        {!contact.street && contact.city && (
                          <div className="flex items-center text-sm">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{contact.city}</span>
                          </div>
                        )}
                        {!contact.street && !contact.city && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-2 h-4 w-4" />
                            <span className="italic">Sin ubicación</span>
                          </div>
                        )}
                        
                        {/* Property Type and Listing Type */}
                        {(contact.propertyType || contact.listingType) && (
                          <div className="flex items-center text-sm">
                            <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="truncate">
                              {contact.propertyType && (
                                <span className="capitalize">{contact.propertyType}</span>
                              )}
                              {contact.propertyType && contact.listingType && (
                                <span className="text-muted-foreground"> • </span>
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
                </TableCell>
                <TableCell className="w-[150px] min-w-[150px]">
                  {/* Recordatorios (Checklist) Section - Mock Data for Table */}
                  <div className="bg-gray-50 rounded-md p-1 border border-gray-200 min-h-[40px] flex flex-col gap-0.5">
                    {/* Mock checklist items, compact */}
                    <div className="flex items-center gap-0.5">
                      <span className="w-2 h-2 rounded-full border border-gray-300 bg-gray-50 inline-block" />
                      <span className="text-[10px] text-gray-800">Llamar seguimiento</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span className="w-2 h-2 rounded-full border border-gray-300 bg-gray-50 inline-block" />
                      <span className="text-[10px] text-gray-800">Enviar propuesta</span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 