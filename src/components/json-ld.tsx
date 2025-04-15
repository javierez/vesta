export function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Agencia Inmobiliaria",
    description: "Tu socio de confianza en el mercado inmobiliario. Especializados en compra, venta y alquiler de propiedades residenciales y comerciales.",
    image: "https://agencia-inmobiliaria.com/images/logo.jpg",
    url: "https://agencia-inmobiliaria.com",
    telephone: "+34 123 456 789",
    email: "info@agencia-inmobiliaria.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Calle Mayor, 123",
      addressLocality: "Madrid",
      addressRegion: "Madrid",
      postalCode: "28001",
      addressCountry: "ES"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 40.4168,
      longitude: -3.7038
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
        opens: "09:00",
        closes: "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sábado",
        opens: "10:00",
        closes: "14:00"
      }
    ],
    priceRange: "€€",
    currenciesAccepted: "EUR",
    paymentAccepted: ["Efectivo", "Transferencia Bancaria", "Tarjeta de Crédito"],
    areaServed: {
      "@type": "City",
      name: "Madrid",
      sameAs: "https://es.wikipedia.org/wiki/Madrid"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Catálogo de Propiedades",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Pisos en Venta",
            description: "Amplia selección de pisos en venta en las mejores zonas de Madrid"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Casas en Venta",
            description: "Casas unifamiliares y adosados en las zonas más exclusivas"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Alquiler de Viviendas",
            description: "Pisos y casas en alquiler para todos los presupuestos"
          }
        }
      ]
    },
    sameAs: [
      "https://www.facebook.com/agencia-inmobiliaria",
      "https://www.instagram.com/agencia-inmobiliaria",
      "https://www.linkedin.com/company/agencia-inmobiliaria"
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "125",
      bestRating: "5",
      worstRating: "1"
    }
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}
