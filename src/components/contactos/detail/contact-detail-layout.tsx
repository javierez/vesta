'use client'

import { ContactBreadcrumb } from "~/components/contactos/contact-breadcrumb"
import { ContactFormHeader } from "./contact-form-header"
import { ContactCharacteristicsForm } from "~/components/contactos/contact-characteristics-form"

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
    [key: string]: any
  }
}

export function ContactDetailLayout({ contact }: ContactDetailLayoutProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <ContactBreadcrumb firstName={contact.firstName} lastName={contact.lastName} />

      {/* Contact Header */}
      <ContactFormHeader contact={contact} />

      {/* Contact Form */}
      <div className="pb-16">
        <ContactCharacteristicsForm contact={contact} />
      </div>
    </div>
  )
} 