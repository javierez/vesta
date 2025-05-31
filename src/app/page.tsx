import { PropertyGrid } from "~/components/property-grid"
import Hero from "~/components/hero"
import { FeaturedProperties } from "~/components/featured-properties"
import { ContactSection } from "~/components/contact-section"
import { ReviewsSection } from "~/components/reviews-section"
import { AboutSection } from "~/components/about-section"
import JsonLd from "~/components/json-ld"
import Footer from "~/components/footer"
import { getSocialLinks } from "~/server/queries/social"
import { getAccountInfo } from "~/server/queries/account"
import Head from "next/head"
import Image from "next/image"
import { PropertySearch } from "~/components/property-search"

export default async function Home() {
  const socialLinks = await getSocialLinks()
  const accountInfo = await getAccountInfo("1125899906842628")
  return (
    <>
      <Head>
        <title>Casas y pisos, alquiler y venta.</title>
        <meta name="description" content="¿Buscas casa? Con Inmobiliaria Acropolis es más fácil. Pisos y casas en venta o alquiler." />
      </Head>
      <div className="relative">
        {/* Hero Section with Background */}
        <div className="relative">
          {/* Background Image */}
          <div className="absolute inset-0 h-[calc(100%+4rem)]">
            <Image
              src="/properties/sleek-city-tower.png"
              alt="Imagen de fondo"
              fill
              className="object-cover brightness-[0.7]"
              priority
            />
          </div>

          {/* Hero Content */}
          <div className="relative z-10">
            <JsonLd />
            <Hero />
          </div>
        </div>

        {/* Search Form Container */}
        <div className="relative -mt-40 mb-10 px-4">
          <PropertySearch />
        </div>

        {/* Main Content */}
        <div className="relative z-10 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <PropertyGrid />
            <AboutSection />
          </div>
          
          <ReviewsSection />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ContactSection />
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
