export type PropertyType = "piso" | "casa" | "local" | "solar" | "garaje"

export type PropertyImage = {
  url: string
  alt: string
  tag?: string
}

export type Property = {
  id: string
  reference: string
  title: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  bedrooms: number
  bathrooms: number
  squareFeet: number
  description: string
  features: string[]
  propertyType: PropertyType
  status: "for-sale" | "for-rent" | "sold"
  isFeatured: boolean
  imageUrl: string
  images: PropertyImage[]
  isBankOwned?: boolean
  energyCertification?: "A" | "B" | "C" | "D" | "E" | "F" | "G" | null
  hasHeating?: boolean
  heatingType?: string
  hasElevator?: boolean
  hasGarage?: boolean
  hasStorageRoom?: boolean
  age?: number
  coordinates?: {
    lat: number
    lng: number
  }
}

export const properties: Property[] = [
  {
    id: "prop-1",
    reference: "P001234",
    title: "Villa de Lujo Frente al Mar",
    address: "123 Paseo Oceanview",
    city: "León",
    state: "CL",
    zipCode: "24001",
    price: 1250000,
    bedrooms: 4,
    bathrooms: 3.5,
    squareFeet: 3200,
    description:
      "Impresionante villa frente al mar con vistas panorámicas al océano. Esta lujosa propiedad cuenta con un plano de planta abierto, cocina gourmet, piscina privada y acceso directo a la playa. Perfecta para aquellos que buscan el estilo de vida costero definitivo.",
    features: [
      "Frente al Mar",
      "Piscina Privada",
      "Cocina Gourmet",
      "Sistema Smart Home",
      "Bodega de Vinos",
      "Cine en Casa",
    ],
    propertyType: "casa",
    status: "for-sale",
    isFeatured: true,
    imageUrl: "/properties/waterfront-luxury.png",
    images: [
      { url: "/properties/waterfront-luxury.png", alt: "Vista exterior de la villa", tag: "Exterior" },
      { url: "/properties/luxury-kitchen.png", alt: "Cocina gourmet", tag: "Cocina" },
      { url: "/properties/luxury-living.png", alt: "Sala de estar", tag: "Sala de estar" },
      { url: "/properties/luxury-bedroom.png", alt: "Dormitorio principal", tag: "Dormitorio" },
      { url: "/properties/luxury-pool.png", alt: "Piscina privada", tag: "Piscina" },
    ],
    energyCertification: "B",
    hasHeating: true,
    heatingType: "Central",
    hasElevator: false,
    hasGarage: true,
    hasStorageRoom: true,
    age: 5,
    coordinates: {
      lat: 42.5987,
      lng: -5.5671,
    },
  },
  {
    id: "prop-2",
    reference: "P002345",
    title: "Apartamento Moderno en el Centro",
    address: "456 Avenida Urbana, Unidad 12B",
    city: "León",
    state: "CL",
    zipCode: "24002",
    price: 850000,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    description:
      "Elegante y moderno apartamento en el corazón del centro. Ventanas del suelo al techo ofrecen espectaculares vistas de la ciudad. Características incluyen acabados de alta gama, tecnología de hogar inteligente y acceso a servicios premium del edificio.",
    features: [
      "Vistas a la Ciudad",
      "Portero",
      "Centro de Fitness",
      "Terraza en la Azotea",
      "Admite Mascotas",
      "Lavandería en la Unidad",
    ],
    propertyType: "piso",
    status: "for-sale",
    isFeatured: true,
    imageUrl: "/properties/urban-loft-vista.png",
    images: [
      { url: "/properties/urban-loft-vista.png", alt: "Vista del apartamento", tag: "Sala de estar" },
      { url: "/properties/modern-kitchen.png", alt: "Cocina moderna", tag: "Cocina" },
      { url: "/properties/luxury-living.png", alt: "Sala de estar", tag: "Sala de estar" },
      { url: "/properties/luxury-bedroom.png", alt: "Dormitorio", tag: "Dormitorio" },
    ],
    isBankOwned: true,
    energyCertification: "A",
    hasHeating: true,
    heatingType: "Individual",
    hasElevator: true,
    hasGarage: true,
    hasStorageRoom: false,
    age: 2,
    coordinates: {
      lat: 42.5987,
      lng: -5.5671,
    },
  },
  {
    id: "prop-3",
    reference: "P003456",
    title: "Encantadora Casa Suburbana",
    address: "789 Calle Maple",
    city: "León",
    state: "CL",
    zipCode: "24003",
    price: 575000,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1800,
    description:
      "Hermosa casa familiar en un tranquilo vecindario arbolado. Características incluyen una cocina renovada, pisos de madera, sótano terminado y un amplio patio trasero con una terraza perfecta para entretenimiento.",
    features: [
      "Cocina Renovada",
      "Pisos de Madera",
      "Sótano Terminado",
      "Amplio Patio Trasero",
      "Garaje Adjunto",
      "Chimenea",
    ],
    propertyType: "casa",
    status: "for-sale",
    isFeatured: false,
    imageUrl: "/properties/suburban-garden-charm.png",
    images: [
      { url: "/properties/suburban-garden-charm.png", alt: "Vista exterior de la casa", tag: "Exterior" },
      { url: "/properties/renovated-kitchen.png", alt: "Cocina renovada", tag: "Cocina" },
      { url: "/properties/wooden-floor-living.png", alt: "Sala con pisos de madera", tag: "Sala de estar" },
      { url: "/properties/backyard-terrace.png", alt: "Terraza en el patio trasero", tag: "Patio" },
      { url: "/properties/finished-basement.png", alt: "Sótano terminado", tag: "Sótano" },
    ],
    energyCertification: "C",
    hasHeating: true,
    heatingType: "Central",
    hasElevator: false,
    hasGarage: true,
    hasStorageRoom: true,
    age: 15,
    coordinates: {
      lat: 42.5987,
      lng: -5.5671,
    },
  },
  {
    id: "prop-4",
    reference: "P004567",
    title: "Suite Penthouse de Lujo",
    address: "1000 Blvd Skyline, PH3",
    city: "León",
    state: "CL",
    zipCode: "24004",
    price: 3200000,
    bedrooms: 3,
    bathrooms: 3.5,
    squareFeet: 2800,
    description:
      "Exclusivo penthouse con impresionantes vistas a la bahía. Esta obra maestra arquitectónica cuenta con acabados premium, cocina gourmet, acceso privado por ascensor y una terraza envolvente perfecta para entretenimiento.",
    features: [
      "Penthouse",
      "Ascensor Privado",
      "Terraza Envolvente",
      "Vistas a la Bahía",
      "Servicio de Conserjería",
      "Sala de Vinos",
    ],
    propertyType: "piso",
    status: "for-sale",
    isFeatured: true,
    imageUrl: "/properties/penthouse-panorama.png",
    images: [
      { url: "/properties/penthouse-panorama.png", alt: "Vista panorámica del penthouse", tag: "Vistas" },
      { url: "/properties/luxury-living.png", alt: "Sala de estar de lujo", tag: "Sala de estar" },
      { url: "/properties/luxury-kitchen.png", alt: "Cocina gourmet", tag: "Cocina" },
      { url: "/properties/luxury-bedroom.png", alt: "Dormitorio principal", tag: "Dormitorio" },
    ],
    energyCertification: "B",
    hasHeating: true,
    heatingType: "Suelo Radiante",
    hasElevator: true,
    hasGarage: true,
    hasStorageRoom: true,
    age: 1,
    coordinates: {
      lat: 42.5987,
      lng: -5.5671,
    },
  },
  {
    id: "prop-5",
    reference: "P005678",
    title: "Local Comercial en Zona Céntrica",
    address: "222 Calle Heritage",
    city: "León",
    state: "CL",
    zipCode: "24005",
    price: 1750000,
    bedrooms: 0,
    bathrooms: 2,
    squareFeet: 2500,
    description:
      "Local comercial en ubicación privilegiada con gran afluencia de público. Espacio diáfano con amplios escaparates, instalaciones actualizadas y posibilidad de diferentes configuraciones según necesidades del negocio.",
    features: [
      "Ubicación Céntrica",
      "Amplios Escaparates",
      "Instalaciones Actualizadas",
      "Aire Acondicionado",
      "Alarma de Seguridad",
      "Licencia Comercial",
    ],
    propertyType: "local",
    status: "for-sale",
    isFeatured: false,
    imageUrl: "/properties/brownstone-facade.png",
    images: [
      { url: "/properties/brownstone-facade.png", alt: "Fachada del local comercial", tag: "Exterior" },
      { url: "/properties/commercial-interior.png", alt: "Interior diáfano", tag: "Interior" },
      { url: "/properties/storefront-windows.png", alt: "Amplios escaparates", tag: "Escaparates" },
      { url: "/properties/commercial-bathroom.png", alt: "Baño del local", tag: "Baño" },
      { url: "/properties/security-system.png", alt: "Sistema de seguridad", tag: "Seguridad" },
    ],
    isBankOwned: true,
    energyCertification: "D",
    hasHeating: true,
    heatingType: "Individual",
    hasElevator: false,
    hasGarage: false,
    hasStorageRoom: true,
    age: 45,
    coordinates: {
      lat: 42.5987,
      lng: -5.5671,
    },
  },
  {
    id: "prop-6",
    reference: "P006789",
    title: "Piso Frente a la Playa",
    address: "555 Paseo Shoreline, Unidad 301",
    city: "León",
    state: "CL",
    zipCode: "24006",
    price: 2500,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1100,
    description:
      "Impresionante piso frente a la playa con vistas sin obstáculos al océano. Despierta con el sonido de las olas en esta unidad bellamente actualizada con plano de planta abierto, cocina gourmet y balcón privado.",
    features: [
      "Frente a la Playa",
      "Vistas al Océano",
      "Cocina Actualizada",
      "Piscina Comunitaria",
      "Edificio Seguro",
      "Estacionamiento Cubierto",
    ],
    propertyType: "piso",
    status: "for-rent",
    isFeatured: false,
    imageUrl: "/properties/beachfront-balcony-view.png",
    images: [
      { url: "/properties/beachfront-balcony-view.png", alt: "Vista al océano desde el balcón", tag: "Vistas" },
      { url: "/properties/beach-apartment-living.png", alt: "Sala de estar con vistas", tag: "Sala de estar" },
      { url: "/properties/updated-beach-kitchen.png", alt: "Cocina actualizada", tag: "Cocina" },
      { url: "/properties/ocean-view-bedroom.png", alt: "Dormitorio con vistas al océano", tag: "Dormitorio" },
      { url: "/properties/community-pool.png", alt: "Piscina comunitaria", tag: "Piscina" },
    ],
    energyCertification: "C",
    hasHeating: true,
    heatingType: "Individual",
    hasElevator: true,
    hasGarage: true,
    hasStorageRoom: true,
    age: 10,
    coordinates: {
      lat: 42.5987,
      lng: -5.5671,
    },
  },
  {
    id: "prop-7",
    reference: "P007890",
    title: "Solar Urbanizable con Vistas",
    address: "888 Camino Alpine",
    city: "León",
    state: "CL",
    zipCode: "24007",
    price: 2100000,
    bedrooms: 0,
    bathrooms: 0,
    squareFeet: 10000,
    description:
      "Excepcional solar urbanizable con impresionantes vistas panorámicas. Ubicado en una zona privilegiada con todos los servicios disponibles. Ideal para construir una vivienda de lujo personalizada.",
    features: [
      "Vistas Panorámicas",
      "Totalmente Urbanizado",
      "Servicios Disponibles",
      "Orientación Sur",
      "Terreno Nivelado",
      "Permiso de Construcción",
    ],
    propertyType: "solar",
    status: "for-sale",
    isFeatured: true,
    imageUrl: "/properties/alpine-luxury.png",
    images: [
      { url: "/properties/alpine-luxury.png", alt: "Vistas panorámicas del terreno", tag: "Vistas" },
      { url: "/properties/suburban-dream.png", alt: "Plano del terreno", tag: "Plano" },
      { url: "/properties/suburban-garden-charm.png", alt: "Alrededores del terreno", tag: "Alrededores" },
    ],
    coordinates: {
      lat: 42.5987,
      lng: -5.5671,
    },
  },
  {
    id: "prop-8",
    reference: "P008901",
    title: "Garaje Amplio en Edificio Seguro",
    address: "333 Blvd Industrial, Unidad 205",
    city: "León",
    state: "CL",
    zipCode: "24008",
    price: 45000,
    bedrooms: 0,
    bathrooms: 0,
    squareFeet: 300,
    description:
      "Amplio garaje en edificio con seguridad 24 horas. Acceso mediante control remoto y cámaras de vigilancia. Espacio suficiente para vehículo grande y almacenamiento adicional.",
    features: [
      "Seguridad 24h",
      "Puerta Automática",
      "Cámaras de Vigilancia",
      "Fácil Acceso",
      "Espacio de Almacenamiento",
      "Limpieza Regular",
    ],
    propertyType: "garaje",
    status: "for-sale",
    isFeatured: false,
    imageUrl: "/properties/exposed-brick-loft.png",
    images: [
      { url: "/properties/exposed-brick-loft.png", alt: "Interior del garaje", tag: "Interior" },
      { url: "/properties/urban-loft-vista.png", alt: "Entrada del garaje", tag: "Entrada" },
      { url: "/properties/modern-kitchen.png", alt: "Espacio adicional", tag: "Espacio" },
    ],
    coordinates: {
      lat: 42.5987,
      lng: -5.5671,
    },
  },
  {
    id: "prop-9",
    reference: "P009012",
    title: "Apartamento Céntrico Amueblado",
    address: "123 Calle Mayor",
    city: "León",
    state: "CL",
    zipCode: "24009",
    price: 1200,
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 850,
    description:
      "Acogedor apartamento totalmente amueblado en el centro de la ciudad. Ubicación perfecta con todos los servicios cercanos, transporte público y zonas de ocio. Ideal para profesionales o estudiantes.",
    features: [
      "Totalmente Amueblado",
      "Ubicación Céntrica",
      "Transporte Público",
      "Internet Fibra",
      "Electrodomésticos",
      "Recién Reformado",
    ],
    propertyType: "piso",
    status: "for-rent",
    isFeatured: true,
    imageUrl: "/properties/suburban-garden-charm.png",
    images: [
      { url: "/properties/suburban-garden-charm.png", alt: "Vista exterior con jardín", tag: "Exterior" },
      { url: "/properties/suburban-dream.png", alt: "Jardín privado", tag: "Jardín" },
      { url: "/properties/luxury-living.png", alt: "Sala de estar familiar", tag: "Sala de estar" },
      { url: "/properties/luxury-bedroom.png", alt: "Dormitorio", tag: "Dormitorio" },
    ],
    energyCertification: "E",
    hasHeating: true,
    heatingType: "Individual",
    hasElevator: true,
    hasGarage: false,
    hasStorageRoom: false,
    age: 25,
    coordinates: {
      lat: 42.5987,
      lng: -5.5671,
    },
  },
  {
    id: "prop-10",
    reference: "P010123",
    title: "Casa Adosada con Jardín",
    address: "456 Avenida del Parque",
    city: "León",
    state: "CL",
    zipCode: "24010",
    price: 1800,
    bedrooms: 3,
    bathrooms: 2.5,
    squareFeet: 1600,
    description:
      "Espaciosa casa adosada con jardín privado en zona residencial tranquila. Perfecta para familias, con colegios, parques y centros comerciales cercanos. Excelentes comunicaciones.",
    features: [
      "Jardín Privado",
      "Zona Residencial",
      "Cerca de Colegios",
      "Terraza",
      "Cocina Equipada",
      "Armarios Empotrados",
    ],
    propertyType: "casa",
    status: "for-rent",
    isFeatured: true,
    imageUrl: "/properties/suburban-garden-charm.png",
    images: [
      { url: "/properties/suburban-garden-charm.png", alt: "Vista exterior con jardín", tag: "Exterior" },
      { url: "/properties/suburban-dream.png", alt: "Jardín privado", tag: "Jardín" },
      { url: "/properties/equipped-kitchen.png", alt: "Cocina equipada", tag: "Cocina" },
      { url: "/properties/family-living-room.png", alt: "Sala de estar familiar", tag: "Sala de estar" },
      { url: "/properties/built-in-wardrobes.png", alt: "Armarios empotrados", tag: "Dormitorio" },
    ],
    energyCertification: "D",
    hasHeating: true,
    heatingType: "Central",
    hasElevator: false,
    hasGarage: true,
    hasStorageRoom: true,
    age: 12,
    coordinates: {
      lat: 42.5987,
      lng: -5.5671,
    },
  },
]

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
  legalLinks: Array<{
    text: string
    href: string
  }>
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
      legalLinks: [
        { text: "Política de Privacidad", href: "#" },
        { text: "Términos de Servicio", href: "#" },
        { text: "Mapa del Sitio", href: "#" }
      ],
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
