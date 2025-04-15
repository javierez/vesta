import Link from "next/link"
import { Building } from "lucide-react"
import { SocialLinks, type SocialLink } from "~/components/ui/social-links"

interface FooterProps {
  socialLinks?: SocialLink[]
}

export default function Footer({ socialLinks }: FooterProps) {
  return (
    <footer className="bg-muted py-12 border-t">
      <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
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
              <Link href="#" className="text-muted-foreground hover:text-primary">
                Apartamentos
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                Casas
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                Comercial
              </Link>
            </li>
            <li>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                Lujo
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4">Contáctanos</h3>
          <address className="not-italic text-muted-foreground">
            <p>123 Avenida Inmobiliaria</p>
            <p>Nueva York, NY 10001</p>
            <p className="mt-2">Email: info@acropolis-realestate.com</p>
            <p>Teléfono: (123) 456-7890</p>
          </address>
        </div>
      </div>

      <div className="container mt-8 pt-8 border-t">
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
    </footer>
  )
}
