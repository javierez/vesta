import Link from "next/link"
import { Building } from "lucide-react"
import { SocialLinks, type SocialLink } from "~/components/ui/social-links"
import { getFooterProps } from "~/server/queries/footer"
import { OfficeLocationsSlider } from "~/components/footer/FooterSlider"

// Define the hardcoded link data
const QUICK_LINKS = [
  { text: "Inicio", href: "/" },
  { text: "Propiedades", href: "#properties" },
  { text: "Nosotros", href: "#about" },
  { text: "Reseñas", href: "#reviews" },
  { text: "Contacto", href: "#contact" },
  { text: "Comprar", href: "/comprar" },
  { text: "Alquilar", href: "/alquilar" },
  { text: "Vender", href: "/vender" },
] as const

const LEGAL_LINKS = [
  { text: "Aviso Legal", href: "/aviso-legal" },
  { text: "Preguntas frecuentes (FAQs)", href: "/faqs" },
  { text: "Contacta con Acrópolis", href: "/contacto" },
  { text: "Política de privacidad", href: "/privacidad" },
  { text: "Política de cookies", href: "/cookies" },
  { text: "Condiciones generales", href: "/condiciones" },
] as const

const buyLinks = [
  { text: "Pisos", href: "/venta-pisos/todas-ubicaciones" },
  { text: "Casas", href: "/venta-casas/todas-ubicaciones" },
  { text: "Locales", href: "/venta-locales/todas-ubicaciones" },
  { text: "Solares", href: "/venta-solares/todas-ubicaciones" },
  { text: "Garajes", href: "/venta-garajes/todas-ubicaciones" },
]

type QuickLink = (typeof QUICK_LINKS)[number]
type PropertyType = (typeof buyLinks)[number]

export default async function Footer() {
  const footerProps = await getFooterProps()

  // Fallbacks in case data is missing
  const companyName = footerProps?.companyName || "Acropolis"
  const description = footerProps?.description || "Tu socio de confianza para encontrar la propiedad perfecta."

  // Convert social links object to array format
  const socialLinksObj = footerProps?.socialLinks || {}
  const socialLinks: SocialLink[] = Object.entries(socialLinksObj)
    .filter(([_, url]) => url)
    .map(([platform, url]) => ({
      platform: platform.toLowerCase() as "facebook" | "linkedin" | "twitter" | "instagram",
      url: url as string,
    }))

  const officeLocations = footerProps?.officeLocations || []
  const quickLinksVisibility = footerProps?.quickLinksVisibility || {}
  const propertyTypesVisibility = footerProps?.propertyTypesVisibility || {}
  const copyright =
    footerProps?.copyright || `© ${new Date().getFullYear()} Acropolis Bienes Raíces. Todos los derechos reservados.`

  return (
    <footer className="bg-gradient-to-b from-muted/30 via-muted/50 to-muted border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-20">
          <div className="grid gap-20 md:grid-cols-2 lg:grid-cols-4 lg:gap-16">
            {/* Company section */}
            <div className="lg:col-span-1 lg:border-r lg:border-border/40 lg:pr-16">
              <Link 
                href="/" 
                className="group flex items-center gap-4 mb-8 w-fit"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 shadow-sm group-hover:shadow-md">
                  <Building className="h-7 w-7 text-primary" />
                </div>
                <span className="text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-all duration-300">
                  {companyName}
                </span>
              </Link>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-sm text-base">
                {description}
              </p>
              {socialLinks.length > 0 && (
                <div className="pt-4">
                  <SocialLinks 
                    links={socialLinks} 
                    size="lg"
                    className="gap-4"
                  />
                </div>
              )}
            </div>

            {/* Quick links section */}
            <div className="lg:pl-8">
              <h3 className="font-bold text-xl text-foreground mb-8 relative inline-block">
                Enlaces Rápidos
                <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary/60 rounded-full transform origin-left scale-x-100 transition-transform duration-300 group-hover:scale-x-75"></div>
              </h3>
              <nav>
                <ul className="space-y-4">
                  {QUICK_LINKS.filter((link) => quickLinksVisibility[link.text.toLowerCase()] !== false).map(
                    (link: QuickLink, index: number) => (
                      <li key={index}>
                        <Link
                          href={link.href}
                          className="text-muted-foreground hover:text-primary transition-all duration-300 text-base font-medium block py-1.5 hover:translate-x-2 hover:font-semibold"
                        >
                          {link.text}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </nav>
            </div>

            {/* Property types section */}
            <div className="lg:pl-8">
              <h3 className="font-bold text-xl text-foreground mb-8 relative inline-block">
                Tipos de Propiedades
                <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary/60 rounded-full transform origin-left scale-x-100 transition-transform duration-300 group-hover:scale-x-75"></div>
              </h3>
              <nav>
                <ul className="space-y-4">
                  {buyLinks.filter((type) => propertyTypesVisibility[type.text.toLowerCase()] !== false).map(
                    (type: PropertyType, index: number) => (
                      <li key={index}>
                        <Link
                          href={type.href}
                          className="text-muted-foreground hover:text-primary transition-all duration-300 text-base font-medium block py-1.5 hover:translate-x-2 hover:font-semibold"
                        >
                          {type.text}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </nav>
            </div>

            {/* Office locations section */}
            <div className="lg:pl-8">
              <h3 className="font-bold text-xl text-foreground mb-8 relative inline-block">
                Nuestras Oficinas
                <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary/60 rounded-full transform origin-left scale-x-100 transition-transform duration-300 group-hover:scale-x-75"></div>
              </h3>
              <div className="bg-card/50 rounded-xl p-6 border border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
                <OfficeLocationsSlider officeLocations={officeLocations} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border/40 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-sm text-muted-foreground font-medium order-2 md:order-1">
              {copyright}
            </p>
            {LEGAL_LINKS.length > 0 && (
              <nav className="order-1 md:order-2">
                <div className="flex flex-wrap justify-center md:justify-end gap-8 text-sm">
                  {LEGAL_LINKS.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium hover:font-semibold"
                    >
                      {link.text}
                    </Link>
                  ))}
                </div>
              </nav>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
