"use client"

import React, { useState, useRef, useCallback, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { Badge } from "~/components/ui/badge"
import { Building2, Home, Search, Building, Landmark, Store, Circle, Calendar, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { formatListingType } from "../contact-config"
import { Nombre } from "../table-components/list-elements/nombre"
import { Contacto } from "../table-components/list-elements/contacto"

// Default column widths (in pixels)
const DEFAULT_COLUMN_WIDTHS = {
  nombre: 160,
  contacto: 160,
  inmueble: 160,
  recordatorios: 160
} as const

// Minimum column widths
const MIN_COLUMN_WIDTHS = {
  nombre: 80,
  contacto: 80,
  inmueble: 100,
  recordatorios: 100
} as const

// Extended Contact type
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
  prospectTitles?: string[]
}

interface ContactSpreadsheetTableProps {
  contacts: ExtendedContact[]
}

export function ContactSpreadsheetTable({ contacts }: ContactSpreadsheetTableProps) {
  const router = useRouter()
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null)

  // Sort contacts alphabetically
  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const aName = `${a.firstName} ${a.lastName}`.toLowerCase()
      const bName = `${b.firstName} ${b.lastName}`.toLowerCase()
      return aName.localeCompare(bName)
    })
  }, [contacts])

  const handleResizeStart = useCallback((column: string, e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(column)
    resizeStartRef.current = {
      x: e.clientX,
      width: columnWidths[column as keyof typeof columnWidths]
    }
  }, [columnWidths])

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeStartRef.current) return
    
    const deltaX = e.clientX - resizeStartRef.current.x
    const newWidth = Math.max(
      MIN_COLUMN_WIDTHS[isResizing as keyof typeof MIN_COLUMN_WIDTHS],
      resizeStartRef.current.width + deltaX
    )
    
    setColumnWidths(prev => ({
      ...prev,
      [isResizing]: newWidth
    }))
  }, [isResizing])

  const handleResizeEnd = useCallback(() => {
    setIsResizing(null)
    resizeStartRef.current = null
  }, [])

  // Global mouse events for resizing
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
      return () => {
        document.removeEventListener('mousemove', handleResizeMove)
        document.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  }, [isResizing, handleResizeMove, handleResizeEnd])

  const getColumnStyle = (column: keyof typeof columnWidths) => ({
    width: `${columnWidths[column]}px`,
    minWidth: `${columnWidths[column]}px`,
    maxWidth: `${columnWidths[column]}px`
  })

  const ResizeHandle = ({ column }: { column: string }) => (
    <div
      className={cn(
        "absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/50 transition-colors opacity-0 hover:opacity-100",
        isResizing === column && "bg-primary opacity-100"
      )}
      onMouseDown={(e) => handleResizeStart(column, e)}
    />
  )

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table ref={tableRef}>
          <TableHeader>
            <TableRow>
              <TableHead className="relative" style={getColumnStyle('nombre')}>
                <div className="truncate">Nombre</div>
                <ResizeHandle column="nombre" />
              </TableHead>
              <TableHead className="relative" style={getColumnStyle('contacto')}>
                <div className="truncate">Contacto</div>
                <ResizeHandle column="contacto" />
              </TableHead>
              <TableHead className="relative" style={getColumnStyle('inmueble')}>
                <div className="truncate">Inmueble</div>
                <ResizeHandle column="inmueble" />
              </TableHead>
              <TableHead className="relative" style={getColumnStyle('recordatorios')}>
                <div className="truncate">Recordatorios</div>
                <ResizeHandle column="recordatorios" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedContacts.map((contact) => (
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
                <TableCell className="overflow-hidden" style={getColumnStyle('nombre')}>
                  <div className="truncate">
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
                  </div>
                </TableCell>
                
                <TableCell className="overflow-hidden" style={getColumnStyle('contacto')}>
                  <div className="truncate">
                    <Contacto
                      email={contact.email}
                      phone={contact.phone}
                      isActive={contact.isActive}
                      contactId={contact.contactId}
                    />
                  </div>
                </TableCell>
                
                <TableCell className="overflow-hidden" style={getColumnStyle('inmueble')}>
                  <div className="space-y-1">
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
                          {(contact.street || contact.city) && (
                            <div className={cn(
                              "flex items-center text-sm",
                              contact.isActive ? "" : "text-gray-400"
                            )}>
                              <MapPin className={cn(
                                "mr-2 h-4 w-4 flex-shrink-0",
                                contact.isActive ? "text-muted-foreground" : "text-gray-300"
                              )} />
                              <span className="truncate">
                                {contact.street} {contact.city && <span className={contact.isActive ? "text-muted-foreground" : "text-gray-400"}>({contact.city})</span>}
                              </span>
                            </div>
                          )}
                          {(contact.propertyType || contact.listingType) && (
                            <div className={cn(
                              "flex items-center text-sm",
                              contact.isActive ? "" : "text-gray-400"
                            )}>
                              <Building className={cn(
                                "mr-2 h-4 w-4 flex-shrink-0",
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
                        {(contact.street || contact.city) && (
                          <div className={cn(
                            "flex items-center text-sm",
                            contact.isActive ? "" : "text-gray-400"
                          )}>
                            <MapPin className={cn(
                              "mr-2 h-4 w-4 flex-shrink-0",
                              contact.isActive ? "text-muted-foreground" : "text-gray-300"
                            )} />
                            <span className="truncate">
                              {contact.street} {contact.city && <span className={contact.isActive ? "text-muted-foreground" : "text-gray-400"}>({contact.city})</span>}
                            </span>
                          </div>
                        )}
                        {(contact.propertyType || contact.listingType) && (
                          <div className={cn(
                            "flex items-center text-sm",
                            contact.isActive ? "" : "text-gray-400"
                          )}>
                            <Building className={cn(
                              "mr-2 h-4 w-4 flex-shrink-0",
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
                
                <TableCell className="overflow-hidden" style={getColumnStyle('recordatorios')}>
                  <div className={cn(
                    "rounded-md p-1 border min-h-[40px] flex flex-col gap-0.5",
                    contact.isActive 
                      ? "bg-gray-50 border-gray-200" 
                      : "bg-gray-100 border-gray-200"
                  )}>
                    <div className="flex items-center gap-0.5">
                      <span className={cn(
                        "w-2 h-2 rounded-full border inline-block flex-shrink-0",
                        contact.isActive 
                          ? "border-gray-300 bg-gray-50" 
                          : "border-gray-200 bg-gray-200"
                      )} />
                      <span className={cn(
                        "text-[10px] truncate",
                        contact.isActive ? "text-gray-800" : "text-gray-500"
                      )}>Llamar seguimiento</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span className={cn(
                        "w-2 h-2 rounded-full border inline-block flex-shrink-0",
                        contact.isActive 
                          ? "border-gray-300 bg-gray-50" 
                          : "border-gray-200 bg-gray-200"
                      )} />
                      <span className={cn(
                        "text-[10px] truncate",
                        contact.isActive ? "text-gray-800" : "text-gray-500"
                      )}>Enviar propuesta</span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 