"use client"

import { Mail, Phone, Check, Copy, MessageCircle } from "lucide-react"
import { cn } from "~/lib/utils"
import { useState } from "react"

interface ContactoProps {
  email?: string
  phone?: string
  isActive: boolean
  contactId: bigint
}

export function Contacto({ email, phone, isActive, contactId }: ContactoProps) {
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

  const openEmail = (email: string) => {
    window.open(`mailto:${email}`, '_blank')
  }

  const openPhoneCall = (phone: string) => {
    window.open(`tel:${phone}`, '_blank')
  }

  const openWhatsApp = (phone: string) => {
    // Remove any non-digit characters and ensure it starts with country code
    const cleanPhone = phone.replace(/\D/g, '')
    const whatsappUrl = `https://wa.me/${cleanPhone}`
    window.open(whatsappUrl, '_blank')
  }

  if (!email && !phone) {
    return null
  }

  return (
    <div className="space-y-1">
      <div className="rounded-md p-2">
        <div className="space-y-1">
          {email && (
            <div className="group flex items-center text-sm">
              <Mail className={cn(
                "mr-2 h-4 w-4",
                isActive ? "text-muted-foreground" : "text-gray-300"
              )} />
              <span className={cn(
                "truncate",
                isActive ? "" : "text-gray-400"
              )}>{email}</span>
              <div className="ml-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button
                  className={cn(
                    "p-1 rounded hover:bg-gray-100 transition-colors",
                    isActive ? "hover:bg-gray-100" : "hover:bg-gray-200"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    openEmail(email)
                  }}
                  title="Enviar email"
                >
                  <Mail className={cn(
                    "h-3 w-3",
                    isActive ? "text-muted-foreground" : "text-gray-300"
                  )} />
                </button>
                <button
                  className={cn(
                    "p-1 rounded hover:bg-gray-100 transition-colors",
                    isActive ? "hover:bg-gray-100" : "hover:bg-gray-200"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(email, `email-${contactId}`)
                  }}
                  title="Copiar email"
                >
                  {copiedField === `email-${contactId}` ? (
                    <Check className="h-3 w-3 text-green-900" />
                  ) : (
                    <Copy className={cn(
                      "h-3 w-3",
                      isActive ? "text-muted-foreground" : "text-gray-300"
                    )} />
                  )}
                </button>
              </div>
            </div>
          )}
          {phone && (
            <div className="group flex items-center text-sm">
              <Phone className={cn(
                "mr-2 h-4 w-4",
                isActive ? "text-muted-foreground" : "text-gray-300"
              )} />
              <span className={cn(
                "truncate",
                isActive ? "" : "text-gray-400"
              )}>{phone}</span>
              <div className="ml-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button
                  className={cn(
                    "p-1 rounded hover:bg-gray-100 transition-colors",
                    isActive ? "hover:bg-gray-100" : "hover:bg-gray-200"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    openPhoneCall(phone)
                  }}
                  title="Llamar"
                >
                  <Phone className={cn(
                    "h-3 w-3",
                    isActive ? "text-muted-foreground" : "text-gray-300"
                  )} />
                </button>
                <button
                  className={cn(
                    "p-1 rounded hover:bg-gray-100 transition-colors",
                    isActive ? "hover:bg-gray-100" : "hover:bg-gray-200"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    openWhatsApp(phone)
                  }}
                  title="Enviar WhatsApp"
                >
                  <MessageCircle className={cn(
                    "h-3 w-3",
                    isActive ? "text-muted-foreground" : "text-gray-300"
                  )} />
                </button>
                <button
                  className={cn(
                    "p-1 rounded hover:bg-gray-100 transition-colors",
                    isActive ? "hover:bg-gray-100" : "hover:bg-gray-200"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(phone, `phone-${contactId}`)
                  }}
                  title="Copiar teléfono"
                >
                  {copiedField === `phone-${contactId}` ? (
                    <Check className="h-3 w-3 text-green-900" />
                  ) : (
                    <Copy className={cn(
                      "h-3 w-3",
                      isActive ? "text-muted-foreground" : "text-gray-300"
                    )} />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
