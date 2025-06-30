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
import { Mail, Phone, MoreHorizontal, Building2, Home, Search, Building, Landmark, Store, Circle, Clock } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import Link from "next/link"

// Extended Contact type to include contactType for the UI
interface ExtendedContact {
  contactId: bigint
  firstName: string
  lastName: string
  email?: string
  phone?: string
  contactType: "demandante" | "propietario" | "banco" | "agencia"
  isActive: boolean
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
  const getContactTypeLabel = (type: ExtendedContact['contactType']) => {
    const labels = {
      demandante: 'Demandante',
      propietario: 'Propietario',
      banco: 'Banco',
      agencia: 'Agencia'
    }
    return labels[type]
  }

  const getContactTypeIcon = (type: ExtendedContact['contactType']) => {
    const icons = {
      demandante: Search,
      propietario: Home,
      banco: Landmark,
      agencia: Store
    }
    const Icon = icons[type]
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Información</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.contactId.toString()}>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Circle 
                      className={`h-2 w-2 ${contact.isActive ? 'fill-green-500 text-green-500' : 'fill-gray-300 text-gray-300'}`} 
                    />
                    <span className="font-medium">{contact.firstName} {contact.lastName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Último contacto: {contact.lastContact ? formatDate(contact.lastContact) : formatDate(contact.updatedAt)}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    {contact.email}
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    {contact.phone}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getContactTypeIcon(contact.contactType)}
                  <span className="text-sm">{getContactTypeLabel(contact.contactType)}</span>
                </div>
              </TableCell>
              <TableCell>
                {getAdditionalInfo(contact)}
              </TableCell>
              <TableCell>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md p-2 border border-blue-100">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-xs text-blue-800 font-medium">Seguimiento</p>
                      <p className="text-xs text-blue-700 leading-tight">
                        Requiere atención prioritaria
                      </p>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/contactos/${contact.contactId}`}>Ver Detalles</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/contactos/${contact.contactId}/edit`}>Editar</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 