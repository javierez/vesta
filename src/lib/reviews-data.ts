import type { Review } from "~/components/reviews-section"

export const reviews: Review[] = [
  {
    id: "1",
    author: {
      name: "Carlos Mendoza",
      role: "Propietario",
      avatar: "/confident-leader.png",
      verified: true,
    },
    rating: 5,
    content:
      "Acropolis Bienes Raíces superó todas mis expectativas. Su equipo profesional me ayudó a encontrar la casa perfecta para mi familia en tiempo récord. El proceso fue fluido y sin complicaciones desde el principio hasta el final.",
  },
  {
    id: "2",
    author: {
      name: "María González",
      role: "Inversora Inmobiliaria",
      company: "MG Inversiones",
      avatar: "/confident-leader.png",
      verified: true,
    },
    rating: 4.5,
    content:
      "Como inversora, valoro enormemente la experiencia y conocimiento del mercado que tiene el equipo de Acropolis. Han sido fundamentales para ampliar mi cartera de propiedades con inversiones rentables.",
  },
  {
    id: "3",
    author: {
      name: "Alejandro Torres",
      role: "Comprador Primerizo",
      avatar: "/thoughtful-gaze.png",
      verified: true,
    },
    rating: 5,
    content:
      "Siendo mi primera compra, estaba nervioso por todo el proceso. El equipo de Acropolis me guió paso a paso, explicándome cada detalle y asegurándose de que entendiera todas mis opciones. ¡Ahora soy un orgulloso propietario!",
  },
  {
    id: "4",
    author: {
      name: "Laura Sánchez",
      company: "Grupo Empresarial LSC",
      avatar: "/confident-leader.png",
      verified: true,
    },
    rating: 5,
    content:
      "Buscábamos un espacio comercial para nuestra empresa y Acropolis entendió perfectamente nuestras necesidades. Encontraron una propiedad que cumplía con todos nuestros requisitos y nos ayudaron a negociar un excelente precio.",
  },
  {
    id: "5",
    author: {
      name: "Roberto Fernández",
      role: "Vendedor",
      avatar: "/thoughtful-man.png",
      verified: false,
    },
    rating: 4,
    content:
      "Vendí mi propiedad a través de Acropolis y quedé muy satisfecho con el servicio. Su estrategia de marketing fue efectiva y lograron vender mi casa por encima del precio que esperaba.",
  },
  {
    id: "6",
    author: {
      name: "Elena Martínez",
      role: "Propietaria",
      company: "Diseños EM",
      avatar: "/placeholder.svg?height=100&width=100&query=creative woman portrait",
      verified: true,
    },
    rating: 5,
    content:
      "La atención personalizada que recibí de Acropolis fue excepcional. Entendieron exactamente lo que buscaba y me mostraron propiedades que realmente se ajustaban a mis necesidades y estilo de vida.",
  },
]
