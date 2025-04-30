import { PropertyGrid } from "~/components/property-grid"
import  Hero  from "~/components/hero"
import { FeaturedProperties } from "~/components/featured-properties"
import { ContactSection } from "~/components/contact-section"
import { ReviewsSection } from "~/components/reviews-section"
import { AboutSection } from "~/components/about-section"
import  JsonLd  from "~/components/json-ld"
import { reviews } from "~/lib/reviews-data"
import Navbar from "~/components/navbar"
import Footer from "~/components/footer"
import { PropertySearch } from "~/components/property-search"
import { getSocialLinks } from "~/server/queries/social"
import { getAccountInfo } from "~/server/queries/account"
import Head from "next/head"

export default async function Home() {
  const socialLinks = await getSocialLinks()
  const accountInfo = await getAccountInfo("1125899906842628")
  return (
    <>
      <Head>
        <title>idealista — Casas y pisos, alquiler y venta. Anuncios gratis</title>
        <meta name="description" content="¿Buscas casa? Con idealista es más fácil. Más de 1.200.000 anuncios de pisos y casas en venta o alquiler. Publicar anuncios es gratis para particulares." />
      </Head>
      <Navbar socialLinks={socialLinks} shortName={accountInfo?.shortName} />
      <div>
        <JsonLd />
        <Hero />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FeaturedProperties />
          <AboutSection />
          <PropertyGrid />
        </div>
        <ReviewsSection
          title="Lo Que Dicen Nuestros Clientes"
          subtitle="No solo tomes nuestra palabra. Escucha a algunos de nuestros clientes satisfechos."
          reviews={reviews}
          id="reviews"
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ContactSection />
        </div>
      </div>
      <Footer socialLinks={socialLinks} />
    </>
  )
}
