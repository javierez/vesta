"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export function ContactSection() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormState({
        name: "",
        email: "",
        phone: "",
        message: "",
      })
    }, 1500)
  }

  return (
    <section className="py-16 container" id="contact">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2">Contáctanos</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          ¿Tienes preguntas o estás listo para dar el siguiente paso? Nuestro equipo está aquí para ayudarte con todas
          tus necesidades inmobiliarias.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Envíanos un Mensaje</CardTitle>
            <CardDescription>
              Completa el formulario a continuación y nos pondremos en contacto contigo lo antes posible.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isSubmitted ? (
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold text-green-600 mb-2">¡Gracias!</h3>
                <p>Tu mensaje ha sido enviado con éxito. Nos pondremos en contacto pronto.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Juan Pérez"
                    required
                    value={formState.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="juan@ejemplo.com"
                    required
                    value={formState.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Número de Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="(123) 456-7890"
                    value={formState.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Cuéntanos sobre tus necesidades inmobiliarias..."
                    rows={4}
                    required
                    value={formState.message}
                    onChange={handleChange}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
            <CardDescription>Comunícate con nosotros directamente o visita nuestra oficina.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-3 text-primary" />
              <div>
                <h4 className="font-medium">Dirección de la Oficina</h4>
                <address className="not-italic text-muted-foreground">
                  123 Avenida Inmobiliaria
                  <br />
                  Nueva York, NY 10001
                  <br />
                  Estados Unidos
                </address>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="h-5 w-5 mr-3 text-primary" />
              <div>
                <h4 className="font-medium">Teléfono</h4>
                <p className="text-muted-foreground">
                  Principal: (123) 456-7890
                  <br />
                  Ventas: (123) 456-7891
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Mail className="h-5 w-5 mr-3 text-primary" />
              <div>
                <h4 className="font-medium">Correo Electrónico</h4>
                <p className="text-muted-foreground">
                  info@acropolis-realestate.com
                  <br />
                  ventas@acropolis-realestate.com
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="h-5 w-5 mr-3 text-primary" />
              <div>
                <h4 className="font-medium">Horario de Atención</h4>
                <p className="text-muted-foreground">
                  Lunes - Viernes: 9:00 AM - 6:00 PM
                  <br />
                  Sábado: 10:00 AM - 4:00 PM
                  <br />
                  Domingo: Cerrado
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.11976397304605!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1612345678901!5m2!1sen!2s"
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
        </Card>
      </div>
    </section>
  )
}
