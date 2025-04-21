// Types based on SingleStore schema
export type PropertyType = "piso" | "casa" | "local" | "solar" | "garaje"
export type PropertyStatus = "for-sale" | "for-rent" | "sold"
export type EnergyCertification = "A" | "B" | "C" | "D" | "E" | "F" | "G" | null

export type PropertyImage = {
  imageId: string
  propertyId: string
  fileId: string
  url: string
  name: string
  size: number
  mimeType: string
  width?: number
  height?: number
  isFeatured: boolean
  sortOrder: number
  altText?: string
  caption?: string
  createdAt: Date
  updatedAt: Date
}

export type Property = {
  propertyId: string
  referenceNumber: string
  title: string
  description: string
  propertyType: PropertyType
  status: PropertyStatus
  price: number
  bedrooms: number | null
  bathrooms: number | null
  squareFeet: number
  lotSize?: number
  yearBuilt?: number
  address: string
  city: string
  state: string
  postalCode: string
  neighborhood?: string
  latitude?: number
  longitude?: number
  isFeatured: boolean
  isBankOwned: boolean
  energyCertification?: EnergyCertification
  hasHeating: boolean
  heatingType?: string
  hasElevator: boolean
  hasGarage: boolean
  hasStorageRoom: boolean
  features: string[]
  createdAt: Date
  updatedAt: Date
  listedByAgentId?: string
  ownerId?: string
  images: PropertyImage[]
}

export const properties: Property[] = [
  {
    propertyId: "1",
    referenceNumber: "P001234",
    title: "Villa de Lujo Frente al Mar",
    description: "Impresionante villa frente al mar con vistas panorámicas al océano. Esta lujosa propiedad cuenta con un plano de planta abierto, cocina gourmet, piscina privada y acceso directo a la playa. Perfecta para aquellos que buscan el estilo de vida costero definitivo.",
    propertyType: "casa",
    status: "for-sale",
    price: 1250000,
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 3200,
    yearBuilt: 2018,
    address: "123 Paseo Oceanview",
    city: "León",
    state: "CL",
    postalCode: "24001",
    neighborhood: "Costa Dorada",
    latitude: 42.5987,
    longitude: -5.5671,
    isFeatured: true,
    isBankOwned: false,
    energyCertification: "B",
    hasHeating: true,
    heatingType: "Central",
    hasElevator: false,
    hasGarage: true,
    hasStorageRoom: true,
    features: [
      "Frente al Mar",
      "Piscina Privada",
      "Cocina Gourmet",
      "Sistema Smart Home",
      "Bodega de Vinos",
      "Cine en Casa"
    ],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    listedByAgentId: "1",
    images: [
      {
        imageId: "1",
        propertyId: "1",
        fileId: "waterfront-luxury-1",
        url: "/images/properties/waterfront-luxury.png",
        name: "Vista exterior de la villa",
        size: 2500000,
        mimeType: "image/png",
        width: 1920,
        height: 1080,
        isFeatured: true,
        sortOrder: 1,
        altText: "Vista exterior de la villa",
        caption: "Impresionante vista frontal de la villa",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01")
      },
      {
        imageId: "2",
        propertyId: "1",
        fileId: "luxury-kitchen-1",
        url: "/images/properties/luxury-kitchen.png",
        name: "Cocina gourmet",
        size: 1800000,
        mimeType: "image/png",
        width: 1920,
        height: 1080,
        isFeatured: false,
        sortOrder: 2,
        altText: "Cocina gourmet",
        caption: "Espaciosa cocina con acabados de lujo",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01")
      }
    ]
  },
  {
    propertyId: "2",
    referenceNumber: "P002345",
    title: "Apartamento Moderno en el Centro",
    description: "Elegante y moderno apartamento en el corazón del centro. Ventanas del suelo al techo ofrecen espectaculares vistas de la ciudad. Características incluyen acabados de alta gama, tecnología de hogar inteligente y acceso a servicios premium del edificio.",
    propertyType: "piso",
    status: "for-sale",
    price: 850000,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    yearBuilt: 2022,
    address: "456 Avenida Urbana, Unidad 12B",
    city: "León",
    state: "CL",
    postalCode: "24002",
    neighborhood: "Centro Histórico",
    latitude: 42.5987,
    longitude: -5.5671,
    isFeatured: true,
    isBankOwned: true,
    energyCertification: "A",
    hasHeating: true,
    heatingType: "Individual",
    hasElevator: true,
    hasGarage: true,
    hasStorageRoom: false,
    features: [
      "Vistas a la Ciudad",
      "Portero",
      "Centro de Fitness",
      "Terraza en la Azotea",
      "Admite Mascotas",
      "Lavandería en la Unidad"
    ],
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
    listedByAgentId: "2",
    images: [
      {
        imageId: "3",
        propertyId: "2",
        fileId: "urban-loft-1",
        url: "/images/properties/urban-loft-vista.png",
        name: "Vista del apartamento",
        size: 2000000,
        mimeType: "image/png",
        width: 1920,
        height: 1080,
        isFeatured: true,
        sortOrder: 1,
        altText: "Vista del apartamento",
        caption: "Espectacular vista del salón principal",
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-02")
      }
    ]
  }
]

export type Testimonial = {
  id: string
  name: string
  role: string
  content: string
  avatar: string
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sara Jiménez",
    role: "Propietaria",
    content: "Trabajar con Acropolis Bienes Raíces fue un sueño. Entendieron exactamente lo que estábamos buscando y nos encontraron nuestra casa familiar perfecta dentro de nuestro presupuesto. Todo el proceso fue fluido y sin estrés.",
    avatar: "/images/testimonials/confident-leader.png"
  },
  {
    id: "2",
    name: "Miguel Chen",
    role: "Inversionista Inmobiliario",
    content: "Como inversionista, aprecio el conocimiento del mercado y la atención al detalle de Acropolis. Me han ayudado a adquirir múltiples propiedades con excelente potencial de retorno de inversión. Su experiencia es realmente invaluable.",
    avatar: "/images/testimonials/confident-leader.png"
  },
  {
    id: "3",
    name: "Emilia Rodríguez",
    role: "Compradora por Primera Vez",
    content: "Ser compradora de vivienda por primera vez fue intimidante, pero el equipo de Acropolis me guió en cada paso. Fueron pacientes, informativos y me encontraron un maravilloso condominio que se ajustaba a todas mis necesidades.",
    avatar: "/images/testimonials/serene-gaze.png"
  }
]

export type WebsiteConfig = {
  id: string
  accountId: string
  socialLinks: {
    facebook?: string
    linkedin?: string
    twitter?: string
    instagram?: string
  }
  seoProps: any | null
  logo: string | null
  favicon: string | null
  heroProps: any | null
  featuredProps: any | null
  aboutProps: any | null
  propertiesProps: any | null
  testimonialProps: any | null
  footerProps: any | null
  createdAt: Date
  updatedAt: Date
}

export type Account = {
  accountId: string
  name: string
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
    seoProps: null,
    logo: null,
    favicon: null,
    heroProps: null,
    featuredProps: null,
    aboutProps: null,
    propertiesProps: null,
    testimonialProps: null,
    footerProps: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  }
]

export const accounts: Account[] = [
  {
    accountId: "1234",
    name: "Acropolis Inmobiliaria",
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
