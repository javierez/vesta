import { PropertyGrid } from "~/components/property-grid"
import  Hero  from "~/components/hero"
import { FeaturedProperties } from "~/components/featured-properties"
import { ContactSection } from "~/components/contact-section"
import { ReviewsSection } from "~/components/reviews-section"
import { AboutSection } from "~/components/about-section"
import  JsonLd  from "~/components/json-ld"
import Navbar from "~/components/navbar"
import Footer from "~/components/footer"
import { getSocialLinks } from "~/server/queries/social"
import { getAccountInfo } from "~/server/queries/account"
import Head from "next/head"

export default async function Home() {
  const socialLinks = await getSocialLinks()
  const accountInfo = await getAccountInfo("1125899906842628")
  return (
    <>
      <Head>
        <title> Casas y pisos, alquiler y venta.</title>
        <meta name="description" content="¿Buscas casa? Con Inmobiliaria Acropolis es más fácil. Pisos y casas en venta o alquiler." />
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
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ContactSection />
        </div>
      </div>
      <Footer />
    </>
  )
}
