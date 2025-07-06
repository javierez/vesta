import { notFound } from "next/navigation"
import { getContactByIdWithType } from "~/server/queries/contact"
import { ContactDetailLayout } from "~/components/contactos/detail/contact-detail-layout"
import { contactUtils } from "~/lib/utils"

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
  contactType: "demandante" | "propietario" | "banco" | "agencia"
  isActive: boolean | null
  createdAt: Date
  orgId?: bigint
  additionalInfo?: any
  [key: string]: any
}

export default async function ContactPage({ params }: ContactPageProps) {
  const unwrappedParams = await params
  const contact = await getContactByIdWithType(parseInt(unwrappedParams.id))

  if (!contact) {
    notFound()
  }

  // Use centralized contact mapping function
  const extendedContact: ExtendedContact = contactUtils.createExtendedContact(contact);

  return <ContactDetailLayout contact={extendedContact} />
}
