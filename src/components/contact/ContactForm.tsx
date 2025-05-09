"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

export function ContactForm() {
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
  )
} 