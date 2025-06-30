"use client"

import { Card, CardContent, CardHeader } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Mail, Phone, MoreHorizontal, MapPin, Building, MessageSquare, Clock, Calendar, User, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import Link from "next/link"
import { cn } from "~/lib/utils"

interface Contact {
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
  createdAt?: Date
}

interface ContactCardProps {
  contact: Contact
}

const contactTypeConfig = {
  demandante: {
    label: "Demandante",
    icon: Building,
    colors: "bg-blue-50 text-blue-700 border-blue-200",
    lightColors: "bg-blue-50",
  },
  propietario: {
    label: "Propietario",
    icon: Building,
    colors: "bg-green-50 text-green-700 border-green-200",
    lightColors: "bg-green-50",
  },
  banco: {
    label: "Banco",
    icon: Building,
    colors: "bg-purple-50 text-purple-700 border-purple-200",
    lightColors: "bg-purple-50",
  },
  agencia: {
    label: "Agencia",
    icon: Building,
    colors: "bg-orange-50 text-orange-700 border-orange-200",
    lightColors: "bg-orange-50",
  },
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function ContactCard({ contact }: ContactCardProps) {
  const typeConfig = contactTypeConfig[contact.contactType]
  const TypeIcon = typeConfig.icon

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className={cn("h-2", typeConfig.lightColors)} />

      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg text-gray-900">
              {contact.firstName} {contact.lastName}
            </h3>
            {contact.isActive ? (
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" title="Activo" />
            ) : (
              <span className="inline-block h-2 w-2 rounded-full bg-gray-300" title="Inactivo" />
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant="outline"
              className={cn("text-xs font-medium border rounded-md transition-colors", typeConfig.colors)}
            >
              <TypeIcon className="h-3 w-3 mr-1" />
              {typeConfig.label}
            </Badge>

            {contact.additionalInfo?.demandType && (
              <Badge variant="secondary" className="text-xs">
                {contact.additionalInfo.demandType}
              </Badge>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Más opciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={`/contactos/${contact.contactId}`} className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Ver Detalles
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/contactos/${contact.contactId}/edit`} className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-700">
            <Mail className="mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{contact.email}</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <Phone className="mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
            <span>{contact.phone}</span>
          </div>

          {contact.additionalInfo?.location && (
            <div className="flex items-center text-sm text-gray-700">
              <MapPin className="mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{contact.additionalInfo.location}</span>
            </div>
          )}

          {contact.additionalInfo?.budget && (
            <div className="flex items-center text-sm text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4 text-gray-400 flex-shrink-0"
              >
                <circle cx="12" cy="12" r="8" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>
                Presupuesto: <span className="font-medium">{formatCurrency(contact.additionalInfo.budget)}</span>
              </span>
            </div>
          )}

          {contact.additionalInfo?.propertiesCount && (
            <div className="flex items-center text-sm text-gray-700">
              <Building className="mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{contact.additionalInfo.propertiesCount} inmuebles</span>
            </div>
          )}
        </div>

        {contact.additionalInfo?.notes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 line-clamp-2">{contact.additionalInfo.notes}</p>
            </div>
          </div>
        )}

        {/* Modern Note Section */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-medium mb-1">Nota de seguimiento</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Contacto en proceso de seguimiento. Requiere atención prioritaria en los próximos días.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 mt-2 border-t border-gray-100">
          {contact.lastContact && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Último contacto: {new Date(contact.lastContact).toLocaleDateString("es-ES")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 