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
    imageUrl: "/placeholder.svg?height=600&width=600&query=waterfront luxury villa",
    images: [
      { url: "/placeholder.svg?height=600&width=600&query=waterfront luxury villa", alt: "Vista exterior de la villa", tag: "Exterior" },
      { url: "/placeholder.svg?height=600&width=600&query=luxury kitchen", alt: "Cocina gourmet", tag: "Cocina" },
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
    imageUrl: "/placeholder.svg?height=600&width=600&query=urban loft",
    images: [
      { url: "/placeholder.svg?height=600&width=600&query=urban loft", alt: "Vista del apartamento", tag: "Sala de estar" },
      { url: "/placeholder.svg?height=600&width=600&query=modern kitchen", alt: "Cocina moderna", tag: "Cocina" },
      { url: "/properties/modern-bathroom.png", alt: "Baño con acabados de lujo", tag: "Baño" },
      { url: "/properties/city-view.png", alt: "Vistas a la ciudad", tag: "Vistas" },
      { url: "/properties/building-gym.png", alt: "Gimnasio del edificio", tag: "Gimnasio" },
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
    imageUrl: "/placeholder.svg?height=600&width=600&query=penthouse",
    images: [
      { url: "/placeholder.svg?height=600&width=600&query=penthouse", alt: "Vista panorámica del penthouse", tag: "Vistas" },
      { url: "/placeholder.svg?height=600&width=600&query=penthouse living", alt: "Sala de estar de lujo", tag: "Sala de estar" },
      { url: "/gourmet-kitchen.png", alt: "Cocina gourmet", tag: "Cocina" },
      { url: "/private-elevator.png", alt: "Ascensor privado", tag: "Ascensor" },
      { url: "/wrap-terrace.png", alt: "Terraza envolvente", tag: "Terraza" },
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
      { url: "/commercial-interior.png", alt: "Interior diáfano", tag: "Interior" },
      { url: "/storefront-windows.png", alt: "Amplios escaparates", tag: "Escaparates" },
      { url: "/commercial-bathroom.png", alt: "Baño del local", tag: "Baño" },
      { url: "/security-system.png", alt: "Sistema de seguridad", tag: "Seguridad" },
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
      { url: "/beach-apartment-living.png", alt: "Sala de estar con vistas", tag: "Sala de estar" },
      { url: "/updated-beach-kitchen.png", alt: "Cocina actualizada", tag: "Cocina" },
      { url: "/ocean-view-bedroom.png", alt: "Dormitorio con vistas al océano", tag: "Dormitorio" },
      { url: "/community-pool.png", alt: "Piscina comunitaria", tag: "Piscina" },
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
    imageUrl: "/placeholder.svg?height=600&width=600&query=alpine luxury",
    images: [
      { url: "/placeholder.svg?height=600&width=600&query=alpine luxury", alt: "Vistas panorámicas del terreno", tag: "Vistas" },
      { url: "/land-plot.png", alt: "Plano del terreno", tag: "Plano" },
      { url: "/land-services.png", alt: "Servicios disponibles", tag: "Servicios" },
      { url: "/land-surroundings.png", alt: "Alrededores del terreno", tag: "Alrededores" },
      { url: "/construction-permit.png", alt: "Permiso de construcción", tag: "Documentación" },
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
      { url: "/garage-entrance.png", alt: "Entrada del garaje", tag: "Entrada" },
      { url: "/security-cameras.png", alt: "Cámaras de seguridad", tag: "Seguridad" },
      { url: "/storage-space.png", alt: "Espacio de almacenamiento", tag: "Almacenamiento" },
      { url: "/automatic-door.png", alt: "Puerta automática", tag: "Acceso" },
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
    imageUrl: "/placeholder.svg?height=600&width=600&query=urban loft",
    images: [
      { url: "/placeholder.svg?height=600&width=600&query=urban loft", alt: "Sala de estar amueblada", tag: "Sala de estar" },
      { url: "/furnished-bedroom.png", alt: "Dormitorio amueblado", tag: "Dormitorio" },
      { url: "/modern-appliances.png", alt: "Electrodomésticos modernos", tag: "Cocina" },
      { url: "/fiber-internet.png", alt: "Conexión de internet", tag: "Comunicaciones" },
      { url: "/central-location.png", alt: "Ubicación céntrica", tag: "Ubicación" },
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
      { url: "/private-garden.png", alt: "Jardín privado", tag: "Jardín" },
      { url: "/equipped-kitchen.png", alt: "Cocina equipada", tag: "Cocina" },
      { url: "/family-living-room.png", alt: "Sala de estar familiar", tag: "Sala de estar" },
      { url: "/built-in-wardrobes.png", alt: "Armarios empotrados", tag: "Dormitorio" },
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
    avatar: "/confident-leader.png",
  },
  {
    id: "2",
    name: "Miguel Chen",
    role: "Inversionista Inmobiliario",
    content:
      "Como inversionista, aprecio el conocimiento del mercado y la atención al detalle de Acropolis. Me han ayudado a adquirir múltiples propiedades con excelente potencial de retorno de inversión. Su experiencia es realmente invaluable.",
    avatar: "/confident-leader.png",
  },
  {
    id: "3",
    name: "Emilia Rodríguez",
    role: "Compradora por Primera Vez",
    content:
      "Ser compradora de vivienda por primera vez fue intimidante, pero el equipo de Acropolis me guió en cada paso. Fueron pacientes, informativos y me encontraron un maravilloso condominio que se ajustaba a todas mis necesidades.",
    avatar: "/serene-gaze.png",
  },
]
