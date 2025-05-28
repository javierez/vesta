"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { ContactForm } from "./ContactForm"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import type { ContactProps } from "~/server/queries/contact"

interface ContactContentProps {
  title: string
  subtitle: string
  messageForm: boolean
  address: boolean
  phone: boolean
  mail: boolean
  schedule: boolean
  map: boolean
  contactProps: ContactProps | null
}

export function ContactContent({
  title,
  subtitle,
  messageForm,
  address,
  phone,
  mail,
  schedule,
  map,
  contactProps
}: ContactContentProps) {
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>(
    contactProps?.offices?.find(office => office.isDefault)?.id || contactProps?.offices?.[0]?.id || ""
  )

  const selectedOffice = contactProps?.offices?.find(office => office.id === selectedOfficeId)

  return (
    <section className="py-16 container" id="contact">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {messageForm && <ContactForm />}

        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
            <CardDescription>Comunícate con nosotros directamente o visita nuestra oficina.</CardDescription>
            
            {contactProps?.offices && contactProps.offices.length > 1 && (
              <div className="mt-4">
                <Select value={selectedOfficeId} onValueChange={setSelectedOfficeId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una oficina" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactProps.offices.map((office) => (
                      <SelectItem key={office.id} value={office.id}>
                        {office.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {address && selectedOffice?.address && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <h4 className="font-medium">Dirección de la Oficina</h4>
                  <address className="not-italic text-muted-foreground">
                    {selectedOffice.address.street}
                    <br />
                    {selectedOffice.address.city}, {selectedOffice.address.state}
                    <br />
                    {selectedOffice.address.country}
                  </address>
                </div>
              </div>
            )}

            {phone && selectedOffice?.phoneNumbers && (
              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <h4 className="font-medium">Teléfono</h4>
                  <p className="text-muted-foreground">
                    Principal: {selectedOffice.phoneNumbers.main}
                    <br />
                    Ventas: {selectedOffice.phoneNumbers.sales}
                  </p>
                </div>
              </div>
            )}

            {mail && selectedOffice?.emailAddresses && (
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <h4 className="font-medium">Correo Electrónico</h4>
                  <p className="text-muted-foreground">
                    {selectedOffice.emailAddresses.info}
                    <br />
                    {selectedOffice.emailAddresses.sales}
                  </p>
                </div>
              </div>
            )}

            {schedule && selectedOffice?.scheduleInfo && (
              <div className="flex items-start">
                <Clock className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <h4 className="font-medium">Horario de Atención</h4>
                  <p className="text-muted-foreground">
                    {selectedOffice.scheduleInfo.weekdays}
                    <br />
                    {selectedOffice.scheduleInfo.saturday}
                    <br />
                    {selectedOffice.scheduleInfo.sunday}
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          {map && selectedOffice?.mapUrl && (
            <CardFooter>
              <iframe
                src={selectedOffice.mapUrl}
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de la Oficina"
                className="rounded-md"
              />
            </CardFooter>
          )}
        </Card>
      </div>
    </section>
  )
} 