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
import { Building2, Home, Search, Building, Landmark, Store, Circle, Calendar, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { formatListingType } from "../contact-config"
import { useState, useMemo } from "react"
import { CONTACT_PALETTE, getContactCardColor, getContactBadgeColor } from "./color/contact-colors"
import { Nombre } from "./list-elements/nombre"
import { Contacto } from "./list-elements/contacto"

// Extended Contact type to include contactType for the UI
interface ExtendedContact {
  contactId: bigint
  firstName: string
  lastName: string
  email?: string
  phone?: string
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
  createdAt: Date
  updatedAt: Date
  // All prospect titles (array)
  prospectTitles?: string[]
}

interface ContactTableProps {
  contacts: ExtendedContact[]
}

export function ContactTable({ contacts }: ContactTableProps) {
  const router = useRouter()


  // Sort contacts alphabetically by firstName and lastName
  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const aName = `${a.firstName} ${a.lastName}`.toLowerCase()
      const bName = `${b.firstName} ${b.lastName}`.toLowerCase()
      return aName.localeCompare(bName)
    })
  }, [contacts])





  const getAdditionalInfo = (contact: ExtendedContact) => {
    if (contact.isBuyer) {
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





  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] min-w-[100px] max-w-[100px]">Nombre</TableHead>
              <TableHead className="w-[250px] min-w-[250px]">Contacto</TableHead>
              <TableHead className="w-[200px] min-w-[200px]">Inmueble</TableHead>
              <TableHead className="w-[150px] min-w-[150px]">Recordatorios</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedContacts.map((contact) => {
              return (
              <TableRow 
                key={contact.contactId.toString()}
                className={cn(
                  "cursor-pointer transition-colors",
                  contact.isActive 
                    ? "hover:bg-muted/50" 
                    : "opacity-60 hover:bg-gray-100/50"
                )}
                onClick={() => router.push(`/contactos/${contact.contactId}`)}
              >
                <TableCell>
                  <Nombre
                    firstName={contact.firstName}
                    lastName={contact.lastName}
                    isActive={contact.isActive}
                    lastContact={contact.lastContact}
                    updatedAt={contact.updatedAt}
                    isOwner={contact.isOwner}
                    isBuyer={contact.isBuyer}
                    isInteresado={contact.isInteresado}
                  />
                </TableCell>
                <TableCell>
                  <Contacto
                    email={contact.email}
                    phone={contact.phone}
                    isActive={contact.isActive}
                    contactId={contact.contactId}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {/* Address Information */}
                      {contact.listingId && (
                      <div 
                        className={cn(
                          "cursor-pointer hover:border rounded-md p-2 transition-all duration-200 active:scale-[0.98]",
                          contact.isActive 
                            ? "hover:bg-gray-50 hover:border-gray-200 active:bg-gray-100" 
                            : "hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200"
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/propiedades/${contact.listingId}`)
                        }}
                      >
                        <div className="space-y-1 -m-2 p-2">
                          {contact.street && contact.city && (
                            <div className={cn(
                              "flex items-center text-sm",
                              contact.isActive ? "" : "text-gray-400"
                            )}>
                              <MapPin className={cn(
                                "mr-2 h-4 w-4",
                                contact.isActive ? "text-muted-foreground" : "text-gray-300"
                              )} />
                              <span className="truncate">
                                {contact.street} <span className={contact.isActive ? "text-muted-foreground" : "text-gray-400"}>({contact.city})</span>
                              </span>
                            </div>
                          )}
                          {contact.street && !contact.city && (
                            <div className={cn(
                              "flex items-center text-sm",
                              contact.isActive ? "" : "text-gray-400"
                            )}>
                              <MapPin className={cn(
                                "mr-2 h-4 w-4",
                                contact.isActive ? "text-muted-foreground" : "text-gray-300"
                              )} />
                              <span className="truncate">{contact.street}</span>
                            </div>
                          )}
                          {!contact.street && contact.city && (
                            <div className={cn(
                              "flex items-center text-sm",
                              contact.isActive ? "" : "text-gray-400"
                            )}>
                              <MapPin className={cn(
                                "mr-2 h-4 w-4",
                                contact.isActive ? "text-muted-foreground" : "text-gray-300"
                              )} />
                              <span className="truncate">{contact.city}</span>
                            </div>
                          )}
                          
                          {/* Property Type and Listing Type */}
                          {(contact.propertyType || contact.listingType) && (
                            <div className={cn(
                              "flex items-center text-sm",
                              contact.isActive ? "" : "text-gray-400"
                            )}>
                              <Building className={cn(
                                "mr-2 h-4 w-4",
                                contact.isActive ? "text-muted-foreground" : "text-gray-300"
                              )} />
                              <span className="truncate">
                                {contact.propertyType && (
                                  <span className="capitalize">{contact.propertyType}</span>
                                )}
                                {contact.propertyType && contact.listingType && (
                                  <span className={contact.isActive ? "text-muted-foreground" : "text-gray-400"}> • </span>
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
                          <div className={cn(
                            "flex items-center text-sm",
                            contact.isActive ? "" : "text-gray-400"
                          )}>
                            <MapPin className={cn(
                              "mr-2 h-4 w-4",
                              contact.isActive ? "text-muted-foreground" : "text-gray-300"
                            )} />
                            <span className="truncate">
                              {contact.street} <span className={contact.isActive ? "text-muted-foreground" : "text-gray-400"}>({contact.city})</span>
                            </span>
                          </div>
                        )}
                        {contact.street && !contact.city && (
                          <div className={cn(
                            "flex items-center text-sm",
                            contact.isActive ? "" : "text-gray-400"
                          )}>
                            <MapPin className={cn(
                              "mr-2 h-4 w-4",
                              contact.isActive ? "text-muted-foreground" : "text-gray-300"
                            )} />
                            <span className="truncate">{contact.street}</span>
                          </div>
                        )}
                        {!contact.street && contact.city && (
                          <div className={cn(
                            "flex items-center text-sm",
                            contact.isActive ? "" : "text-gray-400"
                          )}>
                            <MapPin className={cn(
                              "mr-2 h-4 w-4",
                              contact.isActive ? "text-muted-foreground" : "text-gray-300"
                            )} />
                            <span className="truncate">{contact.city}</span>
                          </div>
                        )}
                        
                        {/* Property Type and Listing Type */}
                        {(contact.propertyType || contact.listingType) && (
                          <div className={cn(
                            "flex items-center text-sm",
                            contact.isActive ? "" : "text-gray-400"
                          )}>
                            <Building className={cn(
                              "mr-2 h-4 w-4",
                              contact.isActive ? "text-muted-foreground" : "text-gray-300"
                            )} />
                            <span className="truncate">
                              {contact.propertyType && (
                                <span className="capitalize">{contact.propertyType}</span>
                              )}
                              {contact.propertyType && contact.listingType && (
                                <span className={contact.isActive ? "text-muted-foreground" : "text-gray-400"}> • </span>
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
                <TableCell>
                  {/* Recordatorios (Checklist) Section - Mock Data for Table */}
                  <div className={cn(
                    "rounded-md p-1 border min-h-[40px] flex flex-col gap-0.5",
                    contact.isActive 
                      ? "bg-gray-50 border-gray-200" 
                      : "bg-gray-100 border-gray-200"
                  )}>
                    {/* Mock checklist items, compact */}
                    <div className="flex items-center gap-0.5">
                      <span className={cn(
                        "w-2 h-2 rounded-full border inline-block",
                        contact.isActive 
                          ? "border-gray-300 bg-gray-50" 
                          : "border-gray-200 bg-gray-200"
                      )} />
                      <span className={cn(
                        "text-[10px]",
                        contact.isActive ? "text-gray-800" : "text-gray-500"
                      )}>Llamar seguimiento</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span className={cn(
                        "w-2 h-2 rounded-full border inline-block",
                        contact.isActive 
                          ? "border-gray-300 bg-gray-50" 
                          : "border-gray-200 bg-gray-200"
                      )} />
                      <span className={cn(
                        "text-[10px]",
                        contact.isActive ? "text-gray-800" : "text-gray-500"
                      )}>Enviar propuesta</span>
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