import { getSeoProps } from "~/server/queries/jsonLd"

export default async function JsonLd() {
  const seoProps = await getSeoProps()
  if (!seoProps) return null

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: seoProps.name,
    description: seoProps.description,
    image: seoProps.image,
    url: seoProps.url,
    telephone: seoProps.telephone,
    email: seoProps.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: seoProps.address.streetAddress,
      addressLocality: seoProps.address.addressLocality,
      addressRegion: seoProps.address.addressRegion,
      postalCode: seoProps.address.postalCode,
      addressCountry: seoProps.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: seoProps.geo.latitude,
      longitude: seoProps.geo.longitude,
    },
    openingHoursSpecification: seoProps.openingHoursSpecification.map((spec) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: spec.dayOfWeek,
      opens: spec.opens,
      closes: spec.closes,
    })),
    priceRange: seoProps.priceRange,
    areaServed: {
      "@type": "City",
      name: seoProps.areaServed.name,
      sameAs: seoProps.areaServed.sameAs,
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: seoProps.hasOfferCatalog.name,
      itemListElement: seoProps.hasOfferCatalog.itemListElement.map((item) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: item.name,
          description: item.description,
        },
      })),
    },
    sameAs: seoProps.sameAs,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: seoProps.aggregateRating.ratingValue,
      reviewCount: seoProps.aggregateRating.reviewCount,
      bestRating: seoProps.aggregateRating.bestRating,
      worstRating: seoProps.aggregateRating.worstRating,
    },
    keywords: seoProps.keywords,
    ogImage: seoProps.ogImage,
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}
