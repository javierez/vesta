'use client'

import { Badge } from "~/components/ui/badge"
import { Card } from "~/components/ui/card"
import { Mail, Phone, Calendar, Copy } from "lucide-react"
import { contactTypeConfig } from "../contact-config"
import { useState } from "react"
import { cn } from "~/lib/utils"

interface ContactFormHeaderProps {
  contact: {
    contactId: bigint
    firstName: string
    lastName: string
    email?: string | null
    phone?: string | null
    contactType: string
    isActive: boolean | null
    createdAt: Date
  }
}

export function ContactFormHeader({ contact }: ContactFormHeaderProps) {
  // Ensure contactType is a valid key
  const contactType = contact.contactType as keyof typeof contactTypeConfig
  const typeConfig = contactTypeConfig[contactType] || contactTypeConfig.demandante
  const TypeIcon = typeConfig.icon
  const [copied, setCopied] = useState<{ field: 'email' | 'phone' | null, value: string }>({ field: null, value: '' })

  // Get badge colors based on contact type (matching contact-card.tsx pattern)
  const getBadgeColors = (contactType: string) => {
    switch (contactType) {
      case 'demandante':
        return contact.isActive 
          ? "bg-blue-50 text-blue-900 hover:bg-blue-100 hover:text-blue-900"
          : "bg-gray-100 text-gray-500"
      case 'propietario':
        return contact.isActive 
          ? "bg-green-50 text-green-900 hover:bg-green-100 hover:text-green-900"
          : "bg-gray-100 text-gray-500"
      case 'banco':
        return contact.isActive 
          ? "bg-purple-50 text-purple-900 hover:bg-purple-100 hover:text-purple-900"
          : "bg-gray-100 text-gray-500"
      case 'agencia':
        return contact.isActive 
          ? "bg-orange-50 text-green-900 hover:bg-orange-100 hover:text-green-900"
          : "bg-gray-100 text-gray-500"
      case 'interesado':
        return contact.isActive 
          ? "bg-orange-50 text-orange-900 hover:bg-orange-100 hover:text-orange-900"
          : "bg-gray-100 text-gray-500"
      default:
        return contact.isActive 
          ? "bg-blue-50 text-blue-900 hover:bg-blue-100 hover:text-blue-900"
          : "bg-gray-100 text-gray-500"
    }
  }

  function handleCopy(field: 'email' | 'phone', value: string) {
    navigator.clipboard.writeText(value)
    setCopied({ field, value })
    setTimeout(() => setCopied({ field: null, value: '' }), 1200)
  }

  return (
    <div className="mb-8">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">
              {contact.firstName} {contact.lastName}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge
                className={cn(
                  "text-sm font-medium rounded-full px-3 shadow-md",
                  getBadgeColors(contact.contactType)
                )}
              >
                <TypeIcon className="h-4 w-4 mr-1" />
                {typeConfig.label}
              </Badge>
              {!contact.isActive && (
                <Badge variant="secondary" className="text-red-600 bg-red-50">
                  Inactivo
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
              {contact.email && (
                <div className="flex items-center gap-2 group">
                  <Mail className="h-4 w-4" />
                  <span
                    onClick={() => handleCopy('email', contact.email!)}
                    className="cursor-pointer hover:underline hover:text-blue-600 transition-colors"
                    title="Copiar email"
                  >
                    {contact.email}
                  </span>
                  {copied.field === 'email' && copied.value === contact.email && (
                    <span className="ml-1 text-green-600 text-xs">¡Copiado!</span>
                  )}
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 group">
                  <Phone className="h-4 w-4" />
                  <span
                    onClick={() => handleCopy('phone', contact.phone!)}
                    className="cursor-pointer hover:underline hover:text-blue-600 transition-colors"
                    title="Copiar teléfono"
                  >
                    {contact.phone}
                  </span>
                  {copied.field === 'phone' && copied.value === contact.phone && (
                    <span className="ml-1 text-green-600 text-xs">¡Copiado!</span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Creado: {new Date(contact.createdAt).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
