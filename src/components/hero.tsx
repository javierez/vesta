import { Button } from "~/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { PropertySearch } from "./property-search"
import { getHeroProps } from "../server/queries/hero"

export default async function Hero() {
  const heroProps = await getHeroProps()

  // Fallbacks in case data is missing
  const title = heroProps?.title || "Encuentra Tu Propiedad Soñada Con Acropolis"
  const subtitle = heroProps?.subtitle || "Descubre propiedades excepcionales en ubicaciones privilegiadas. Permítenos guiarte en tu viaje inmobiliario."
  const backgroundImage = "/properties/sleek-city-tower.png" //heroProps?.backgroundImage || 
  const findPropertyButton = heroProps?.findPropertyButton || "Explorar Propiedades"
  const contactButton = heroProps?.contactButton || "Contáctanos"

  return (
    <section className="relative mb-[100px] md:mb-[120px] lg:mb-[150px]">
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt="Imagen de fondo del hero"
          fill
          className="object-cover brightness-[0.7]"
          priority
        />
      </div>

      <div className="relative z-10 container pt-24 pb-48 md:pt-32 md:pb-56 lg:pt-40 lg:pb-64">
        <div className="max-w-3xl space-y-5 ml-8 md:ml-12 lg:ml-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            {title}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" asChild>
              <Link href="#properties">{findPropertyButton}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              asChild
            >
              <Link href="#contact">{contactButton}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Search Form Overlay */}
      <div className="absolute left-0 right-0 bottom-0 transform translate-y-1/2 z-20 px-4">
        <PropertySearch />
      </div>
    </section>
  )
}
