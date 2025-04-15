export function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Acropolis Bienes Raíces",
    description: "Tu socio de confianza en el mercado inmobiliario de Nueva York. Especializados en propiedades residenciales y comerciales de lujo.",
    image: "https://acropolis-realestate.com/images/logo.jpg",
    url: "https://acropolis-realestate.com",
    telephone: "(123) 456-7890",
    email: "info@acropolis-realestate.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Avenida Inmobiliaria",
      addressLocality: "Nueva York",
      addressRegion: "NY",
      postalCode: "10001",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 40.7128,
      longitude: -74.006,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "10:00",
        closes: "16:00",
      },
    ],
    priceRange: "$$$",
    areaServed: {
      "@type": "City",
      name: "New York",
      sameAs: "https://en.wikipedia.org/wiki/New_York_City"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Luxury Properties",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Luxury Apartments",
            description: "Premium apartments in Manhattan's most desirable neighborhoods"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Luxury Homes",
            description: "Exclusive single-family homes in prestigious locations"
          }
        }
      ]
    },
    sameAs: [
      "https://www.facebook.com/acropolisrealestate",
      "https://www.twitter.com/acropolisrealty",
      "https://www.instagram.com/acropolisrealestate",
      "https://www.linkedin.com/company/acropolis-real-estate",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "150",
      bestRating: "5",
      worstRating: "1"
    }
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}
