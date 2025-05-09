"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { ContactForm } from "./ContactForm"
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
          </CardHeader>

          <CardContent className="space-y-6">
            {address && contactProps?.officeAddress && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <h4 className="font-medium">Dirección de la Oficina</h4>
                  <address className="not-italic text-muted-foreground">
                    {contactProps.officeAddress.street}
                    <br />
                    {contactProps.officeAddress.city}, {contactProps.officeAddress.state}
                    <br />
                    {contactProps.officeAddress.country}
                  </address>
                </div>
              </div>
            )}

            {phone && contactProps?.phoneNumbers && (
              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <h4 className="font-medium">Teléfono</h4>
                  <p className="text-muted-foreground">
                    Principal: {contactProps.phoneNumbers.main}
                    <br />
                    Ventas: {contactProps.phoneNumbers.sales}
                  </p>
                </div>
              </div>
            )}

            {mail && contactProps?.emailAddresses && (
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <h4 className="font-medium">Correo Electrónico</h4>
                  <p className="text-muted-foreground">
                    {contactProps.emailAddresses.info}
                    <br />
                    {contactProps.emailAddresses.sales}
                  </p>
                </div>
              </div>
            )}

            {schedule && contactProps?.scheduleInfo && (
              <div className="flex items-start">
                <Clock className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <h4 className="font-medium">Horario de Atención</h4>
                  <p className="text-muted-foreground">
                    {contactProps.scheduleInfo.weekdays}
                    <br />
                    {contactProps.scheduleInfo.saturday}
                    <br />
                    {contactProps.scheduleInfo.sunday}
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          {map && contactProps?.mapUrl && (
            <CardFooter>
              <iframe
                src={contactProps.mapUrl}
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