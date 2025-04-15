"use client"

import Link from "next/link"
import { Button } from "~/components/ui/button"
import { Building, Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "~/lib/utils"
import { ListPropertyForm } from "~/components/property/list-property-form"
import { SocialLinks } from "~/components/ui/social-links"

interface NavbarProps {
  socialLinks?: {
    platform: "facebook" | "twitter" | "instagram" | "linkedin" | "youtube"
    url: string
  }[]
}

export default function Navbar({ socialLinks }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Building className="h-6 w-6" />
          <span className="text-xl font-bold">Acropolis</span>
        </Link>

        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Inicio
          </Link>
          <Link
            href="/busqueda/venta-propiedades/todas-ubicaciones"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Propiedades
          </Link>
          <Link href="#about" className="text-sm font-medium transition-colors hover:text-primary">
            Nosotros
          </Link>
          <Link href="#reviews" className="text-sm font-medium transition-colors hover:text-primary">
            Reseñas
          </Link>
          <Link href="#contact" className="text-sm font-medium transition-colors hover:text-primary">
            Contacto
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {socialLinks && socialLinks.length > 0 && <SocialLinks links={socialLinks} className="mr-2" />}
          <ListPropertyForm />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Menú móvil */}
      <div className={cn("fixed inset-0 top-16 z-50 bg-background md:hidden", isMenuOpen ? "block" : "hidden")}>
        <div className="container py-6 flex flex-col gap-4">
          <Link href="/" className="text-lg font-medium py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>
            Inicio
          </Link>
          <Link
            href="/busqueda/venta-propiedades/todas-ubicaciones"
            className="text-lg font-medium py-2 hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Propiedades
          </Link>

          <Link
            href="#about"
            className="text-lg font-medium py-2 hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Nosotros
          </Link>
          <Link
            href="#reviews"
            className="text-lg font-medium py-2 hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Reseñas
          </Link>
          <Link
            href="#contact"
            className="text-lg font-medium py-2 hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Contacto
          </Link>

          {socialLinks && socialLinks.length > 0 && (
            <div className="py-2">
              <SocialLinks links={socialLinks} />
            </div>
          )}

          <div className="flex flex-col gap-2 mt-4">
            <ListPropertyForm className="w-full" />
          </div>
        </div>
      </div>
    </header>
  )
}
