import Link from "next/link"
import { Building } from "lucide-react"
import { SocialLinks, type SocialLink } from "~/components/ui/social-links"

interface OfficeLocation {
  name: string
  address: string[]
  phone: string
  email: string
}

interface FooterProps {
  socialLinks?: SocialLink[]
  officeLocations?: OfficeLocation[]
}

export default function Footer({ socialLinks, officeLocations }: FooterProps) {
  // Default office locations if none provided
  const locations = officeLocations ?? [
    {
      name: "León (Sede Central)",
      address: ["123 Avenida Inmobiliaria", "León, CL 24001", "España"],
      phone: "+34 987 123 456",
      email: "leon@acropolis-realestate.com",
    },
    {
      name: "Madrid",
      address: ["456 Calle Gran Vía", "Madrid, MD 28013", "España"],
      phone: "+34 910 234 567",
      email: "madrid@acropolis-realestate.com",
    },
    {
      name: "Barcelona",
      address: ["789 Passeig de Gràcia", "Barcelona, CT 08007", "España"],
      phone: "+34 934 567 890",
      email: "barcelona@acropolis-realestate.com",
    },
  ]

  return (
    <footer className="bg-muted py-12 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Building className="h-6 w-6" />
              <span className="text-xl font-bold">Acropolis</span>
            </Link>
            <p className="text-muted-foreground mb-4">
              Tu socio de confianza para encontrar la propiedad perfecta. Con años de experiencia y dedicación a la
              excelencia, te ayudamos a tomar decisiones inmobiliarias informadas.
            </p>
            {socialLinks && socialLinks.length > 0 && <SocialLinks links={socialLinks} size="lg" />}
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="#properties" className="text-muted-foreground hover:text-primary">
                  Propiedades
                </Link>
              </li>
              <li>
                <Link href="#about" className="text-muted-foreground hover:text-primary">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="#reviews" className="text-muted-foreground hover:text-primary">
                  Reseñas
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-muted-foreground hover:text-primary">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Tipos de Propiedades</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/busqueda/venta-pisos/todas-ubicaciones"
                  className="text-muted-foreground hover:text-primary"
                >
                  Pisos
                </Link>
              </li>
              <li>
                <Link
                  href="/busqueda/venta-casas/todas-ubicaciones"
                  className="text-muted-foreground hover:text-primary"
                >
                  Casas
                </Link>
              </li>
              <li>
                <Link
                  href="/busqueda/venta-locales/todas-ubicaciones"
                  className="text-muted-foreground hover:text-primary"
                >
                  Locales
                </Link>
              </li>
              <li>
                <Link
                  href="/busqueda/venta-solares/todas-ubicaciones"
                  className="text-muted-foreground hover:text-primary"
                >
                  Solares
                </Link>
              </li>
              <li>
                <Link
                  href="/busqueda/venta-garajes/todas-ubicaciones"
                  className="text-muted-foreground hover:text-primary"
                >
                  Garajes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Nuestras Oficinas</h3>
            <div className="space-y-6">
              {locations.map((office, index) => (
                <div key={index} className="text-muted-foreground">
                  <p className="font-medium text-foreground">{office.name}</p>
                  <address className="not-italic mt-1">
                    {office.address.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                    <p className="mt-1">Email: {office.email}</p>
                    <p>Teléfono: {office.phone}</p>
                  </address>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Acropolis Bienes Raíces. Todos los derechos reservados.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-primary">
                Política de Privacidad
              </Link>
              <Link href="#" className="hover:text-primary">
                Términos de Servicio
              </Link>
              <Link href="#" className="hover:text-primary">
                Mapa del Sitio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
