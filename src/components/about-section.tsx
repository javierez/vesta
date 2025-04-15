'use client'

import Image from "next/image"
import { Button } from "~/components/ui/button"
import Link from "next/link"
import { Check } from "lucide-react"

export function AboutSection() {
  return (
    <section className="py-16 container" id="about">
      <div className="grid gap-12 lg:grid-cols-2 items-center">
        <div className="relative aspect-square lg:aspect-auto">
          <Image
            src="/placeholder.svg?height=600&width=600&query=real estate team in modern office"
            alt="Equipo de Acropolis Bienes Raíces"
            fill
            className="object-cover rounded-lg"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Sobre Acropolis Bienes Raíces</h2>
            <p className="text-muted-foreground">Tu socio de confianza en el viaje inmobiliario desde 2005</p>
          </div>

          <p>
            En Acropolis Bienes Raíces, creemos que encontrar la propiedad perfecta debe ser una experiencia emocionante
            y gratificante. Con más de 15 años de experiencia en la industria, nuestro dedicado equipo de profesionales
            está comprometido a proporcionar un servicio y orientación excepcionales a lo largo de tu viaje
            inmobiliario.
          </p>

          <p>
            Ya sea que estés comprando tu primera casa, vendiendo una propiedad o buscando oportunidades de inversión,
            tenemos el conocimiento, los recursos y la pasión para ayudarte a lograr tus objetivos inmobiliarios.
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>Conocimiento local experto</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>Servicio personalizado</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>Comunicación transparente</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>Experiencia en negociación</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>Marketing integral</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>Soporte continuo</span>
            </div>
          </div>

          <Button asChild>
            <Link href="#contact">Contacta a Nuestro Equipo</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
