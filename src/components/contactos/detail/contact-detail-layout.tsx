'use client'

import { ContactBreadcrumb } from "./contact-breadcrumb"
import { ContactFormHeader } from "./contact-form-header"
import { ContactCharacteristicsForm } from "./contact-characteristics-form"

interface ContactDetailLayoutProps {
  contact: {
    contactId: bigint
    firstName: string
    lastName: string
    email?: string | null
    phone?: string | null
    contactType: string
    isActive: boolean | null
    createdAt: Date
    // Add other properties that ContactCharacteristicsForm might need
    [key: string]: unknown
  }
}

export function ContactDetailLayout({ contact }: ContactDetailLayoutProps) {
  // Transform contact to match ContactCharacteristicsForm interface
  const transformedContact = {
    contactId: contact.contactId,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email ?? undefined,
    phone: contact.phone ?? undefined,
    contactType: contact.contactType as "demandante" | "propietario" | "banco" | "agencia" | "interesado",
    isActive: contact.isActive ?? true,
    additionalInfo: typeof contact.additionalInfo === 'object' && contact.additionalInfo !== null ? contact.additionalInfo : {}
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <ContactBreadcrumb firstName={contact.firstName} lastName={contact.lastName} />

      {/* Contact Header */}
      <ContactFormHeader contact={contact} />

      {/* Contact Form */}
      <div className="pb-16">
        <ContactCharacteristicsForm contact={transformedContact} />
      </div>
    </div>
  )
} 