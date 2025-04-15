import type { Metadata } from "next"
import { PropertyListingForm } from "~/components/property/property-listing-form"
import Navbar from "~/components/navbar"
import Footer from "~/components/footer"

// Datos de redes sociales para toda la aplicación
const socialLinks = [
  { platform: "facebook" as const, url: "https://facebook.com/acropolisrealestate" },
  { platform: "instagram" as const, url: "https://instagram.com/acropolisrealestate" },
  { platform: "twitter" as const, url: "https://twitter.com/acropolisrealty" },
  { platform: "linkedin" as const, url: "https://linkedin.com/company/acropolis-real-estate" },
  { platform: "youtube" as const, url: "https://youtube.com/acropolisrealestate" }
]

export const metadata: Metadata = {
  title: "Vender tu Propiedad | Acropolis Bienes Raíces",
  description: "Publica tu inmueble con Acropolis Bienes Raíces y llega a miles de compradores potenciales.",
}

export default function VenderPage() {
  return (
    <>
      <Navbar socialLinks={socialLinks} />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">Publica Tu Inmueble</h1>
        <PropertyListingForm />
      </div>
      <Footer socialLinks={socialLinks} />
    </>
  )
}
