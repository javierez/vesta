export type PropertyType = "piso" | "casa" | "local" | "solar" | "garaje"

export type PropertyImage = {
  propertyImageId: bigint;
  propertyId: bigint;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  imageKey: string;
  imageTag?: string;
}

export type Property = {
  propertyId: bigint;
  referenceNumber: string;
  title: string;
  description: string;
  propertyType: string;
  status: string;
  price: string;
  bedrooms?: number;
  bathrooms?: string;
  squareMeter: number;
  yearBuilt?: number;
  street: string;
  addressDetails?: string;
  city: string;
  province?: string;
  postalCode?: string;
  neighborhood?: string;
  latitude?: string;
  longitude?: string;
  isFeatured: boolean;
  isBankOwned: boolean;
  energyCertification?: string;
  hasHeating: boolean;
  heatingType?: string;
  hasElevator: boolean;
  hasGarage: boolean;
  hasStorageRoom: boolean;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
  listedByAgentId?: bigint;
  ownerId?: bigint;
  isActive: boolean;
}

// Mock data for development/testing
export const properties: Property[] = [
  {
    propertyId: BigInt(1),
    referenceNumber: "P001234",
    title: "Villa de Lujo Frente al Mar",
    description: "Impresionante villa frente al mar con vistas panorámicas al océano.",
    propertyType: "casa",
    status: "for-sale",
    price: "1250000.00",
    bedrooms: 4,
    bathrooms: "3.5",
    squareMeter: 3200,
    yearBuilt: 2020,
    street: "123 Paseo Oceanview",
    city: "León",
    province: "CL",
    postalCode: "24001",
    neighborhood: "Oceanview",
    latitude: "42.59870000",
    longitude: "-5.56710000",
    isFeatured: true,
    isBankOwned: false,
    energyCertification: "B",
    hasHeating: true,
    heatingType: "Central",
    hasElevator: false,
    hasGarage: true,
    hasStorageRoom: true,
    features: ["Frente al Mar", "Piscina Privada", "Cocina Gourmet"],
    createdAt: new Date(),
    updatedAt: new Date(),
    listedByAgentId: BigInt(1),
    ownerId: BigInt(1),
    isActive: true
  },
  {
    propertyId: BigInt(2),
    referenceNumber: "P002345",
    title: "Apartamento Moderno en el Centro",
    description: "Elegante y moderno apartamento en el corazón del centro.",
    propertyType: "piso",
    status: "for-sale",
    price: "850000.00",
    bedrooms: 2,
    bathrooms: "2.0",
    squareMeter: 1200,
    yearBuilt: 2022,
    street: "456 Avenida Urbana",
    city: "León",
    province: "CL",
    postalCode: "24002",
    neighborhood: "Centro",
    latitude: "42.59870000",
    longitude: "-5.56710000",
    isFeatured: true,
    isBankOwned: true,
    energyCertification: "A",
    hasHeating: true,
    heatingType: "Individual",
    hasElevator: true,
    hasGarage: true,
    hasStorageRoom: false,
    features: ["Vistas a la Ciudad", "Portero", "Centro de Fitness"],
    createdAt: new Date(),
    updatedAt: new Date(),
    listedByAgentId: BigInt(1),
    ownerId: BigInt(2),
    isActive: true
  }
];

export const testimonials = [
  {
    id: "1",
    name: "Sara Jiménez",
    role: "Propietaria",
    content:
      "Trabajar con Acropolis Bienes Raíces fue un sueño. Entendieron exactamente lo que estábamos buscando y nos encontraron nuestra casa familiar perfecta dentro de nuestro presupuesto. Todo el proceso fue fluido y sin estrés.",
    avatar: "/properties/confident-leader.png",
    rating: 5,
    isVerified: true,
    sortOrder: 1,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "2",
    name: "Miguel Chen",
    role: "Inversionista Inmobiliario",
    content:
      "Como inversionista, aprecio el conocimiento del mercado y la atención al detalle de Acropolis. Me han ayudado a adquirir múltiples propiedades con excelente potencial de retorno de inversión. Su experiencia es realmente invaluable.",
    avatar: "/properties/confident-leader.png",
    rating: 5,
    isVerified: true,
    sortOrder: 2,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "3",
    name: "Emilia Rodríguez",
    role: "Compradora por Primera Vez",
    content:
      "Ser compradora de vivienda por primera vez fue intimidante, pero el equipo de Acropolis me guió en cada paso. Fueron pacientes, informativos y me encontraron un maravilloso condominio que se ajustaba a todas mis necesidades.",
    avatar: "/properties/serene-gaze.png",
    rating: 5,
    isVerified: true,
    sortOrder: 3,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "4",
    name: "Carlos Mendoza",
    role: "Propietario",
    content:
      "Acropolis Bienes Raíces superó todas mis expectativas. Su equipo profesional me ayudó a encontrar la casa perfecta para mi familia en tiempo récord. El proceso fue fluido y sin complicaciones desde el principio hasta el final.",
    avatar: "/properties/confident-leader.png",
    rating: 5,
    isVerified: true,
    sortOrder: 4,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "5",
    name: "María González",
    role: "Inversora Inmobiliaria",
    content:
      "Como inversora, valoro enormemente la experiencia y conocimiento del mercado que tiene el equipo de Acropolis. Han sido fundamentales para ampliar mi cartera de propiedades con inversiones rentables.",
    avatar: "/properties/confident-leader.png",
    rating: 4.5,
    isVerified: true,
    sortOrder: 5,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "6",
    name: "Alejandro Torres",
    role: "Comprador Primerizo",
    content:
      "Siendo mi primera compra, estaba nervioso por todo el proceso. El equipo de Acropolis me guió paso a paso, explicándome cada detalle y asegurándose de que entendiera todas mis opciones. ¡Ahora soy un orgulloso propietario!",
    avatar: "/properties/thoughtful-gaze.png",
    rating: 5,
    isVerified: true,
    sortOrder: 6,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  }
]

export type SeoProps = {
  title: string
  description: string
  keywords: string[]
  ogImage?: string
  name: string
  image: string
  url: string
  telephone: string
  email: string
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  geo: {
    latitude: number
    longitude: number
  }
  openingHoursSpecification: Array<{
    dayOfWeek: string[]
    opens: string
    closes: string
  }>
  priceRange: string
  areaServed: {
    name: string
    sameAs: string
  }
  hasOfferCatalog: {
    name: string
    itemListElement: Array<{
      name: string
      description: string
    }>
  }
  sameAs: string[]
  aggregateRating: {
    ratingValue: string
    reviewCount: string
    bestRating: string
    worstRating: string
  }
}

export type HeroProps = {
  title: string
  subtitle: string
  backgroundImage: string
  findPropertyButton: string
  contactButton: string
}

export type FeaturedProps = {
  title: string
  subtitle: string
  maxItems: number
}

export type AboutProps = {
  title: string
  subtitle: string
  content: string
  content2: string
  image: string
  services: Array<{
    title: string
    icon: string
  }>
  maxServicesDisplayed: number
  servicesSectionTitle: string
  aboutSectionTitle: string
  buttonName: string
  showKPI: boolean
  kpi1Name?: string
  kpi1Data?: string
  kpi2Name?: string
  kpi2Data?: string
  kpi3Name?: string
  kpi3Data?: string
  kpi4Name?: string
  kpi4Data?: string
}

export type PropertiesProps = {
  title: string
  subtitle: string
  itemsPerPage: number
  defaultSort: string
  buttonText: string
}

export type TestimonialProps = {
  title: string
  subtitle: string
  itemsPerPage: number
}

export type FooterProps = {
  companyName: string
  description: string
  socialLinks: {
    facebook?: string
    linkedin?: string
    twitter?: string
    instagram?: string
  }
  officeLocations: Array<{
    name: string
    address: string[]
    phone: string
    email: string
  }>
  quickLinksVisibility: {
    [key: string]: boolean
  }
  propertyTypesVisibility: {
    [key: string]: boolean
  }
  copyright: string
}

export type HeadProps = {
  title: string
  description: string
}

export type ContactProps = {
  title: string
  subtitle: string
  messageForm: boolean
  address: boolean
  phone: boolean
  mail: boolean
  schedule: boolean
  map: boolean
  // Contact information fields
  offices: Array<{
    id: string
    name: string
    address: {
      street: string
      city: string
      state: string
      country: string
    }
    phoneNumbers: {
      main: string
      sales: string
    }
    emailAddresses: {
      info: string
      sales: string
    }
    scheduleInfo: {
      weekdays: string
      saturday: string
      sunday: string
    }
    mapUrl: string
    isDefault?: boolean
  }>
}

export type WebsiteConfig = {
  id: string
  accountId: string
  socialLinks: {
    facebook?: string
    linkedin?: string
    twitter?: string
    instagram?: string
  }
  seoProps: SeoProps | null
  logo: string | null
  favicon: string | null
  heroProps: HeroProps | null
  featuredProps: FeaturedProps | null
  aboutProps: AboutProps | null
  propertiesProps: PropertiesProps | null
  testimonialProps: TestimonialProps | null
  contactProps: ContactProps | null
  footerProps: FooterProps | null
  headProps: HeadProps | null
  createdAt: Date
  updatedAt: Date
}

export type Account = {
  accountId: string
  name: string
  shortName: string
  status: 'active' | 'inactive' | 'suspended'
  subscriptionType: string
  subscriptionStartDate: Date
  subscriptionEndDate: Date | null
  maxOffices: number
  maxUsers: number
  createdAt: Date
  updatedAt: Date
}

export const websiteConfigs: WebsiteConfig[] = [
  {
    id: "1",
    accountId: "1234",
    socialLinks: {
      facebook: "https://facebook.com/acropolisrealestate",
      linkedin: "https://linkedin.com/company/acropolisrealestate",
      twitter: "https://twitter.com/acropolisRE",
      instagram: "https://instagram.com/acropolisrealestate"
    },
    seoProps: {
      title: "Acropolis Bienes Raíces - Propiedades en España",
      description: "Tu socio de confianza en el mercado inmobiliario de España. Especializados en propiedades residenciales y comerciales.",
      name: "Acropolis Bienes Raíces",
      image: "https://acropolis-realestate.com/images/logo.jpg",
      url: "https://acropolis-realestate.com",
      telephone: "+34 987 123 456",
      email: "info@acropolis-realestate.com",
      address: {
        streetAddress: "123 Avenida Inmobiliaria",
        addressLocality: "León",
        addressRegion: "CL",
        postalCode: "24001",
        addressCountry: "ES"
      },
      geo: {
        latitude: 42.5987,
        longitude: -5.5671
      },
      openingHoursSpecification: [
        {
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "18:00"
        },
        {
          dayOfWeek: ["Saturday"],
          opens: "10:00",
          closes: "14:00"
        }
      ],
      priceRange: "€€",
      areaServed: {
        name: "León",
        sameAs: "https://es.wikipedia.org/wiki/Le%C3%B3n_(Espa%C3%B1a)"
      },
      hasOfferCatalog: {
        name: "Propiedades",
        itemListElement: [
          {
            name: "Pisos",
            description: "Pisos premium en las zonas más exclusivas de León"
          },
          {
            name: "Casas",
            description: "Chalets y casas exclusivas en ubicaciones privilegiadas"
          }
        ]
      },
      sameAs: [
        "https://www.facebook.com/acropolisrealestate",
        "https://www.twitter.com/acropolisrealty",
        "https://www.instagram.com/acropolisrealestate",
        "https://www.linkedin.com/company/acropolis-real-estate"
      ],
      aggregateRating: {
        ratingValue: "4.9",
        reviewCount: "150",
        bestRating: "5",
        worstRating: "1"
      },
      keywords: ["inmobiliaria", "casas", "pisos", "locales", "lujo", "España"],
      ogImage: "/images/og-image.png"
    },
    logo: null,
    favicon: null,
    heroProps: {
      title: "Encuentra Tu Casa con Acropolis",
      subtitle: "Permítenos guiarte en tu viaje inmobiliario",
      backgroundImage: "/properties/sleek-city-tower.png",
      findPropertyButton: "Explorar Propiedades",
      contactButton: "Contáctanos"
    },
    featuredProps: {
      title: "Propiedades Destacadas",
      subtitle: "Descubre nuestra selección de propiedades premium en las ubicaciones más deseables",
      maxItems: 6
    },
    aboutProps: {
      title: "Sobre Inmobiliaria Acropolis",
      subtitle: "Tu socio de confianza en el viaje inmobiliario desde 20XX",
      content: "En Inmobiliaria Acropolis, creemos que encontrar la propiedad perfecta debe ser una experiencia emocionante y gratificante. Con más de 25 años de experiencia en la industria, nuestro dedicado equipo de profesionales está comprometido a proporcionar un servicio y orientación excepcionales a lo largo de tu viaje inmobiliario. Ya sea que estés comprando tu primera casa, vendiendo una propiedad o buscando oportunidades de inversión, tenemos el conocimiento, los recursos y la pasión para ayudarte a lograr tus objetivos inmobiliarios.",
      content2: "Nuestro enfoque personalizado y atención al detalle nos distingue en el mercado. Nos enorgullece ofrecer un servicio integral que abarca desde la búsqueda inicial hasta el cierre de la operación, asegurando que cada cliente reciba la atención y el asesoramiento que merece. Nuestro profundo conocimiento del mercado local y nuestras conexiones en la industria nos permiten ofrecer oportunidades exclusivas y negociaciones ventajosas para nuestros clientes.",
      image: "/properties/thoughtful-man.png",
      services: [
        {
          title: "Conocimiento local experto",
          icon: "map"
        },
        {
          title: "Servicio personalizado",
          icon: "user"
        },
        {
          title: "Comunicación transparente",
          icon: "message-square"
        },
        {
          title: "Experiencia en negociación",
          icon: "handshake"
        },
        {
          title: "Marketing integral",
          icon: "megaphone"
        },
        {
          title: "Soporte continuo",
          icon: "help-circle"
        }
      ],
      maxServicesDisplayed: 6,
      servicesSectionTitle: "Nuestros Servicios",
      aboutSectionTitle: "Nuestra Misión",
      buttonName: "Contacta a Nuestro Equipo",
      showKPI: true,
      kpi1Name: "Años de Experiencia",
      kpi1Data: "15+",
      kpi2Name: "Propiedades Vendidas",
      kpi2Data: "500+",
      kpi3Name: "Agentes Profesionales",
      kpi3Data: "50+",
      kpi4Name: "Clientes Satisfechos",
      kpi4Data: "98%"
    },
    propertiesProps: {
      title: "Explora Nuestras Propiedades",
      subtitle: "Explora nuestro diverso portafolio de propiedades para encontrar tu opción perfecta",
      itemsPerPage: 6,
      defaultSort: "price-desc",
      buttonText: "Ver Todas las Propiedades"
    },
    testimonialProps: {
      title: "Lo Que Dicen Nuestros Clientes",
      subtitle: "No solo tomes nuestra palabra. Escucha a algunos de nuestros clientes satisfechos.",
      itemsPerPage: 3
    },
    contactProps: {
      title: "Contacta con Nosotros",
      subtitle: "Estamos aquí para ayudarte en tu próximo paso inmobiliario",
      messageForm: true,
      address: true,
      phone: true,
      mail: true,
      schedule: true,
      map: true,
      offices: [
        {
          id: "leon",
          name: "Oficina de León",
          address: {
            street: "123 Avenida Inmobiliaria",
            city: "León",
            state: "CL",
            country: "España"
          },
          phoneNumbers: {
            main: "+34 987 123 456",
            sales: "+34 987 123 457"
          },
          emailAddresses: {
            info: "leon@acropolis-realestate.com",
            sales: "ventas.leon@acropolis-realestate.com"
          },
          scheduleInfo: {
            weekdays: "Lunes a Viernes: 9:00 - 18:00",
            saturday: "Sábado: 10:00 - 14:00",
            sunday: "Domingo: Cerrado"
          },
          mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2923.8278533985427!2d-5.569259684526154!3d42.59872697917133!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd374a0c2c000001%3A0x400f8d1ce997580!2sLe%C3%B3n!5e0!3m2!1ses!2ses!4v1647881234567!5m2!1ses!2ses",
          isDefault: true
        },
        {
          id: "madrid",
          name: "Oficina de Madrid",
          address: {
            street: "456 Calle Gran Vía",
            city: "Madrid",
            state: "MD",
            country: "España"
          },
          phoneNumbers: {
            main: "+34 910 234 567",
            sales: "+34 910 234 568"
          },
          emailAddresses: {
            info: "madrid@acropolis-realestate.com",
            sales: "ventas.madrid@acropolis-realestate.com"
          },
          scheduleInfo: {
            weekdays: "Lunes a Viernes: 9:30 - 19:00",
            saturday: "Sábado: 10:00 - 15:00",
            sunday: "Domingo: Cerrado"
          },
          mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.4301046875!2d-3.7022426845974537!3d40.41995597936578!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42287e472b3b8f%3A0x6a4f71889c8b3b8f!2sGran%20V%C3%ADa%2C%20Madrid!5e0!3m2!1ses!2ses!4v1647881234567!5m2!1ses!2ses"
        }
      ]
    },
    footerProps: {
      companyName: "Acropolis Bienes Raíces",
      description: "Tu socio de confianza para encontrar la propiedad perfecta. Con años de experiencia y dedicación a la excelencia, te ayudamos a tomar decisiones inmobiliarias informadas.",
      socialLinks: {
        facebook: "https://facebook.com/acropolisrealestate",
        linkedin: "https://linkedin.com/company/acropolisrealestate",
        twitter: "https://twitter.com/acropolisRE",
        instagram: "https://instagram.com/acropolisrealestate"
      },
      officeLocations: [
        {
          name: "León",
          address: ["123 Avenida Inmobiliaria", "León, CL 24001", "España"],
          phone: "+34 987 123 456",
          email: "leon@acropolis-realestate.com"
        },
        {
          name: "Madrid",
          address: ["456 Calle Gran Vía", "Madrid, MD 28013", "España"],
          phone: "+34 910 234 567",
          email: "madrid@acropolis-realestate.com"
        },
        {
          name: "Barcelona",
          address: ["789 Passeig de Gràcia", "Barcelona, CT 08007", "España"],
          phone: "+34 934 567 890",
          email: "barcelona@acropolis-realestate.com"
        }
      ],
      quickLinksVisibility: {
        inicio: true,
        propiedades: true,
        nosotros: true,
        reseñas: true,
        contacto: true,
        comprar: false,
        alquilar: false,
        vender: false
      },
      propertyTypesVisibility: {
        pisos: true,
        casas: true,
        locales: true,
        solares: true,
        garajes: true
      },
      copyright: `© ${new Date().getFullYear()} Acropolis Bienes Raíces. Todos los derechos reservados.`
    },
    headProps: {
      title: "idealista — Casas y pisos, alquiler y venta. Anuncios gratis",
      description: "¿Buscas casa? Con idealista es más fácil. Más de 1.200.000 anuncios de pisos y casas en venta o alquiler. Publicar anuncios es gratis para particulares."
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  }
]

export const accounts: Account[] = [
  {
    accountId: "1234",
    name: "Acropolis Real Estate",
    shortName: "Acropolis",
    status: "active",
    subscriptionType: "premium",
    subscriptionStartDate: new Date("2024-01-01"),
    subscriptionEndDate: null,
    maxOffices: 5,
    maxUsers: 20,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  }
]

export type User = {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImageUrl?: string;
  timezone: string;
  language: string;
  preferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isVerified: boolean;
  isActive: boolean;
};

export type Role = {
  roleId: number;
  name: string;
  description?: string;
  permissions: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};

export type UserRole = {
  userRoleId: number;
  userId: number;
  roleId: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};

export type Listing = {
  listingId: bigint;
  propertyId: bigint;
  agentId: bigint;
  ownerContactId: bigint;
  listingType: 'Sale' | 'Rent';
  price: string;
  status: 'Active' | 'Pending' | 'Sold';
  viewCount: number;
  inquiryCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Contact = {
  contactId: bigint;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  orgId?: bigint;
};

export type Organization = {
  orgId: bigint;
  orgName: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export type Lead = {
  leadId: bigint;
  contactId: bigint;
  listingId?: bigint;
  source: string;
  status: 'New' | 'Working' | 'Converted' | 'Disqualified';
  createdAt: Date;
  updatedAt: Date;
};
