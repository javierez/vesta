"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

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
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center space-y-6 max-w-lg text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.2,
                  duration: 0.4,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50 border border-green-100"
              >
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-2"
              >
                <h3 className="text-2xl font-semibold text-gray-900">Mensaje Enviado</h3>
                <div className="w-12 h-0.5 bg-green-600 mx-auto" />
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="space-y-4"
              >
                <p className="text-gray-600 leading-relaxed">
                  Gracias por contactarnos. Hemos recibido tu mensaje correctamente y nuestro equipo se pondrá en contacto
                  contigo a la brevedad.
                </p>

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Tiempo de respuesta estimado: <span className="font-medium text-gray-700">menos de 24 horas</span>
                  </p>
                </div>
              </motion.div>
            </motion.div>
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