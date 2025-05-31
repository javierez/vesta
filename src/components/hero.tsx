import { Button } from "~/components/ui/button"
import Link from "next/link"
import { getHeroProps } from "../server/queries/hero"

export default async function Hero() {
  const heroProps = await getHeroProps()

  // Fallbacks in case data is missing
  const title = heroProps?.title || "Encuentra Tu Propiedad Soñada Con Acropolis"
  const subtitle = heroProps?.subtitle || "Descubre propiedades excepcionales en ubicaciones privilegiadas. Permítenos guiarte en tu viaje inmobiliario."
  const findPropertyButton = heroProps?.findPropertyButton || "Explorar Propiedades"
  const contactButton = heroProps?.contactButton || "Contáctanos"

  return (
    <section className="relative mb-[50px] md:mb-[60px] lg:mb-[70px]">
      <div className="container pt-12 pb-32 md:pt-20 md:pb-40 lg:pt-24 lg:pb-48">
        <div className="max-w-3xl space-y-5 ml-8 md:ml-12 lg:mx-auto lg:px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            {title}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 max-w-md">
            <Button size="lg" className="sm:w-auto w-full" asChild>
              <Link href="#properties">{findPropertyButton}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 sm:w-auto w-full"
              asChild
            >
              <Link href="#contact">{contactButton}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
