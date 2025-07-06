'use client'

import { Badge } from "~/components/ui/badge"
import { Card } from "~/components/ui/card"
import { Mail, Phone, Calendar, Copy } from "lucide-react"
import { contactTypeConfig } from "~/components/contactos/contact-config"
import { useState } from "react"

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
                variant="outline"
                className={`text-sm font-medium border rounded-full px-3 ${typeConfig.colors}`}
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
