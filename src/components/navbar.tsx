"use client"

import Link from "next/link"
import { Button } from "~/components/ui/button"
import { Building, Menu, X, ChevronDown } from "lucide-react"
import { useState } from "react"
import { cn } from "~/lib/utils"
import { SocialLinks } from "~/components/ui/social-links"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"

interface NavbarProps {
  socialLinks?: {
    platform: "facebook" | "twitter" | "instagram" | "linkedin" | "youtube"
    url: string
  }[]
  shortName?: string
}

export default function Navbar({ socialLinks, shortName = "Acropolis" }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between ml-8 md:ml-12 lg:ml-16">
        <Link href="/" className="flex items-center gap-2">
          <Building className="h-6 w-6" />
          <span className="text-xl font-bold">{shortName}</span>
        </Link>

        <nav className="hidden md:flex gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1">
              Comprar <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link href="/busqueda/venta-pisos/todas-ubicaciones" className="w-full">
                  Pisos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/busqueda/venta-casas/todas-ubicaciones" className="w-full">
                  Casas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/busqueda/venta-locales/todas-ubicaciones" className="w-full">
                  Locales
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/busqueda/venta-solares/todas-ubicaciones" className="w-full">
                  Solares
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/busqueda/venta-garajes/todas-ubicaciones" className="w-full">
                  Garajes
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1">
              Alquilar <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link href="/busqueda/alquiler-pisos/todas-ubicaciones" className="w-full">
                  Pisos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/busqueda/alquiler-casas/todas-ubicaciones" className="w-full">
                  Casas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/busqueda/alquiler-locales/todas-ubicaciones" className="w-full">
                  Locales
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/busqueda/alquiler-garajes/todas-ubicaciones" className="w-full">
                  Garajes
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/vender" className="text-sm font-medium transition-colors hover:text-primary">
            Vender
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
          <div className="flex flex-col">
            <div className="text-lg font-medium py-2">Comprar</div>
            <div className="pl-4 flex flex-col gap-2">
              <Link
                href="/busqueda/venta-pisos/todas-ubicaciones"
                className="text-sm py-1 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Pisos
              </Link>
              <Link
                href="/busqueda/venta-casas/todas-ubicaciones"
                className="text-sm py-1 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Casas
              </Link>
              <Link
                href="/busqueda/venta-locales/todas-ubicaciones"
                className="text-sm py-1 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Locales
              </Link>
              <Link
                href="/busqueda/venta-solares/todas-ubicaciones"
                className="text-sm py-1 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Solares
              </Link>
              <Link
                href="/busqueda/venta-garajes/todas-ubicaciones"
                className="text-sm py-1 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Garajes
              </Link>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-lg font-medium py-2">Alquilar</div>
            <div className="pl-4 flex flex-col gap-2">
              <Link
                href="/busqueda/alquiler-pisos/todas-ubicaciones"
                className="text-sm py-1 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Pisos
              </Link>
              <Link
                href="/busqueda/alquiler-casas/todas-ubicaciones"
                className="text-sm py-1 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Casas
              </Link>
              <Link
                href="/busqueda/alquiler-locales/todas-ubicaciones"
                className="text-sm py-1 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Locales
              </Link>
              <Link
                href="/busqueda/alquiler-garajes/todas-ubicaciones"
                className="text-sm py-1 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Garajes
              </Link>
            </div>
          </div>

          <Link
            href="/vender"
            className="text-lg font-medium py-2 hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            Vender
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
        </div>
      </div>
    </header>
  )
}
