export type Property = {
  id: string
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
  propertyType: "house" | "apartment" | "condo" | "commercial"
  status: "for-sale" | "for-rent" | "sold"
  isFeatured: boolean
  imageUrl: string
}

export const properties: Property[] = [
  {
    id: "prop-1",
    title: "Villa de Lujo Frente al Mar",
    address: "123 Paseo Oceanview",
    city: "Miami",
    state: "FL",
    zipCode: "33101",
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
    propertyType: "house",
    status: "for-sale",
    isFeatured: true,
    imageUrl: "/properties/waterfront-luxury.png",
  },
  {
    id: "prop-2",
    title: "Apartamento Moderno en el Centro",
    address: "456 Avenida Urbana, Unidad 12B",
    city: "Nueva York",
    state: "NY",
    zipCode: "10001",
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
    propertyType: "apartment",
    status: "for-sale",
    isFeatured: true,
    imageUrl: "/properties/urban-loft-vista.png",
  },
  {
    id: "prop-3",
    title: "Encantadora Casa Suburbana",
    address: "789 Calle Maple",
    city: "Chicago",
    state: "IL",
    zipCode: "60007",
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
    propertyType: "house",
    status: "for-sale",
    isFeatured: false,
    imageUrl: "/properties/suburban-garden-charm.png",
  },
  {
    id: "prop-4",
    title: "Suite Penthouse de Lujo",
    address: "1000 Blvd Skyline, PH3",
    city: "San Francisco",
    state: "CA",
    zipCode: "94111",
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
    propertyType: "condo",
    status: "for-sale",
    isFeatured: true,
    imageUrl: "/properties/penthouse-panorama.png",
  },
  {
    id: "prop-5",
    title: "Brownstone Histórico",
    address: "222 Calle Heritage",
    city: "Boston",
    state: "MA",
    zipCode: "02108",
    price: 1750000,
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2500,
    description:
      "Brownstone histórico bellamente restaurado con detalles arquitectónicos originales. Características incluyen techos altos, molduras de corona, pisos de madera, sistemas actualizados y un jardín privado.",
    features: [
      "Histórico",
      "Detalles Originales",
      "Cocina Actualizada",
      "Jardín Privado",
      "Chimenea",
      "Bodega de Vinos",
    ],
    propertyType: "house",
    status: "for-sale",
    isFeatured: false,
    imageUrl: "/properties/brownstone-facade.png",
  },
  {
    id: "prop-6",
    title: "Condominio Frente a la Playa",
    address: "555 Paseo Shoreline, Unidad 301",
    city: "San Diego",
    state: "CA",
    zipCode: "92109",
    price: 925000,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1100,
    description:
      "Impresionante condominio frente a la playa con vistas sin obstáculos al océano. Despierta con el sonido de las olas en esta unidad bellamente actualizada con plano de planta abierto, cocina gourmet y balcón privado.",
    features: [
      "Frente a la Playa",
      "Vistas al Océano",
      "Cocina Actualizada",
      "Piscina Comunitaria",
      "Edificio Seguro",
      "Estacionamiento Cubierto",
    ],
    propertyType: "condo",
    status: "for-sale",
    isFeatured: false,
    imageUrl: "/properties/beachfront-balcony-view.png",
  },
  {
    id: "prop-7",
    title: "Retiro de Montaña",
    address: "888 Camino Alpine",
    city: "Aspen",
    state: "CO",
    zipCode: "81611",
    price: 2100000,
    bedrooms: 4,
    bathrooms: 4.5,
    squareFeet: 3500,
    description:
      "Espectacular casa de montaña con vistas impresionantes. Este retiro de lujo cuenta con techos abovedados, ventanas del suelo al techo, cocina gourmet, múltiples chimeneas y una gran terraza para disfrutar del entorno natural.",
    features: [
      "Vistas a la Montaña",
      "Techos Abovedados",
      "Múltiples Chimeneas",
      "Jacuzzi",
      "Sala de Juegos",
      "Almacenamiento para Esquís",
    ],
    propertyType: "house",
    status: "for-sale",
    isFeatured: true,
    imageUrl: "/properties/alpine-luxury.png",
  },
  {
    id: "prop-8",
    title: "Loft Urbano",
    address: "333 Blvd Industrial, Unidad 205",
    city: "Portland",
    state: "OR",
    zipCode: "97209",
    price: 625000,
    bedrooms: 1,
    bathrooms: 1.5,
    squareFeet: 1300,
    description:
      "Elegante loft urbano en un almacén convertido. Características incluyen paredes de ladrillo expuesto, techos altos, grandes ventanas, pisos de concreto pulido y un espacio de vida de concepto abierto perfecto para el urbanita moderno.",
    features: [
      "Loft",
      "Ladrillo Expuesto",
      "Techos Altos",
      "Concepto Abierto",
      "Diseño Industrial",
      "Acceso a la Azotea",
    ],
    propertyType: "condo",
    status: "for-sale",
    isFeatured: false,
    imageUrl: "/properties/exposed-brick-loft.png",
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
    avatar: "/placeholder.svg?height=100&width=100&query=professional man portrait",
  },
  {
    id: "3",
    name: "Emilia Rodríguez",
    role: "Compradora por Primera Vez",
    content:
      "Ser compradora de vivienda por primera vez fue intimidante, pero el equipo de Acropolis me guió en cada paso. Fueron pacientes, informativos y me encontraron un maravilloso condominio que se ajustaba a todas mis necesidades.",
    avatar: "/placeholder.svg?height=100&width=100&query=young woman portrait",
  },
]
