import { notFound } from "next/navigation"
import { getContactByIdWithType } from "~/server/queries/contact"
import { ContactDetailLayout } from "~/components/contactos/detail/contact-detail-layout"

interface ContactPageProps {
  params: Promise<{
    id: string
  }>
}

// Extended Contact type to include contactType for the UI
interface ExtendedContact {
  contactId: bigint
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  contactType: "demandante" | "propietario" | "banco" | "agencia" | "interesado"
  isActive: boolean | null
  createdAt: Date
  orgId?: bigint
  additionalInfo?: any
  [key: string]: any
}

export default async function ContactPage({ params }: ContactPageProps) {
  try {
    const unwrappedParams = await params
    const contact = await getContactByIdWithType(parseInt(unwrappedParams.id))

    if (!contact) {
      notFound()
    }

    // Contact already has the correct contactType from the query
    const extendedContact: ExtendedContact = {
      ...contact,
      contactId: contact.contactId,
      createdAt: contact.createdAt,
      orgId: contact.orgId
    } as ExtendedContact;

    return <ContactDetailLayout contact={extendedContact} />
  } catch (error) {
    console.error("Error in ContactPage:", error)
    notFound()
  }
}
