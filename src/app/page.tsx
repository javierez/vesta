import { PropertyGrid } from "~/components/property-grid"
import { Hero } from "~/components/hero"
import { FeaturedProperties } from "~/components/featured-properties"
import { ContactSection } from "~/components/contact-section"
import { ReviewsSection } from "~/components/reviews-section"
import { AboutSection } from "~/components/about-section"
import { JsonLd } from "~/components/json-ld"
import { reviews } from "~/lib/reviews-data"
import Navbar from "~/components/navbar"
import Footer from "~/components/footer"
import { PropertySearch } from "~/components/property-search"
import { getSocialLinks } from "~/server/queries/social"

export default async function Home() {
  const socialLinks = await getSocialLinks()
  
  return (
    <>
      <Navbar socialLinks={socialLinks} />
      <div>
        <JsonLd />
        <Hero />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PropertySearch />
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
