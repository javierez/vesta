import { notFound } from "next/navigation"
import { getContactByIdWithType } from "~/server/queries/contact"
import { ContactCharacteristicsForm } from "~/components/contactos/contact-characteristics-form"
import { Card } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Mail, Phone, MapPin, Building, Calendar, User } from "lucide-react"
import Link from "next/link"
import { contactTypeConfig } from "~/components/contactos/contact-config"

interface ContactPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ContactPage({ params }: ContactPageProps) {
  const unwrappedParams = await params
  const contact = await getContactByIdWithType(parseInt(unwrappedParams.id))

  if (!contact) {
    notFound()
  }

  // Ensure contactType is a valid key
  const contactType = contact.contactType as keyof typeof contactTypeConfig
  const typeConfig = contactTypeConfig[contactType] || contactTypeConfig.demandante
  const TypeIcon = typeConfig.icon

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                href="/contactos"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <User className="mr-2 h-4 w-4" />
                Contactos
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500">
                  {contact.firstName} {contact.lastName}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Contact Header */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${typeConfig.lightColors}`}>
                    <TypeIcon className={`h-8 w-8 ${typeConfig.colors.split(' ')[0]}`} />
                  </div>
                </div>
                <div>
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
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Creado: {new Date(contact.createdAt).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="pb-16">
          <ContactCharacteristicsForm contact={contact} />
        </div>
      </div>
    </>
  )
}
