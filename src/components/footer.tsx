import Link from "next/link"
import { Building } from "lucide-react"
import { SocialLinks, type SocialLink } from "~/components/ui/social-links"
import { getFooterProps } from "~/server/queries/footer"

export default async function Footer() {
  const footerProps = await getFooterProps()

  // Fallbacks in case data is missing
  const companyName = footerProps?.companyName || "Acropolis"
  const description = footerProps?.description || "Tu socio de confianza para encontrar la propiedad perfecta."
  const socialLinksObj = footerProps?.socialLinks || {}
  const socialLinks: SocialLink[] = Object.entries(socialLinksObj)
    .filter(([_, url]) => url)
    .map(([platform, url]) => ({
      platform: platform as "facebook" | "linkedin" | "twitter" | "instagram",
      url: url as string
    }))
  const officeLocations = footerProps?.officeLocations || []
  const quickLinks = footerProps?.quickLinks || []
  const propertyTypes = footerProps?.propertyTypes || []
  const legalLinks = footerProps?.legalLinks || []
  const copyright = footerProps?.copyright || `© ${new Date().getFullYear()} Acropolis Bienes Raíces. Todos los derechos reservados.`

  return (
    <footer className="bg-muted py-12 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Building className="h-6 w-6" />
              <span className="text-xl font-bold">{companyName}</span>
            </Link>
            <p className="text-muted-foreground mb-4">{description}</p>
            {socialLinks.length > 0 && <SocialLinks links={socialLinks} size="lg" />}
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary">
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Tipos de Propiedades</h3>
            <ul className="space-y-2">
              {propertyTypes.map((type, index) => (
                <li key={index}>
                  <Link href={type.href} className="text-muted-foreground hover:text-primary">
                    {type.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Nuestras Oficinas</h3>
            <div className="space-y-6">
              {officeLocations.map((office, index) => (
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
            <p className="text-sm text-muted-foreground">{copyright}</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              {legalLinks.map((link, index) => (
                <Link key={index} href={link.href} className="hover:text-primary">
                  {link.text}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
