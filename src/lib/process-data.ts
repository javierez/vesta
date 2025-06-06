import { Users, Eye, Bookmark, Home, FileText, Building, Handshake, Key, Search, Target, MessageSquare, CheckCircle } from "lucide-react"

export interface SubProcess {
  label: string
  value: number
}

export interface Process {
  label: string
  value: number
  icon: any
  subprocesses: SubProcess[]
}

// Sales Process Definition
export const salesProcess = [
  {
    label: "Captación",
    value: 0,
    icon: Home,
    subprocesses: [
      { label: "Contacto con propietario y valoración", value: 0 },
      { label: "Firma de encargo de venta", value: 0 },
      { label: "Documentación legal verificada", value: 0 },
    ],
  },
  {
    label: "Preparación de venta",
    value: 0,
    icon: FileText,
    subprocesses: [
      { label: "Creación de ficha y tour virtual", value: 0 },
      { label: "Definición del buyer persona", value: 0 },
      { label: "Publicación multicanal", value: 0 },
    ],
  },
  {
    label: "Generación de demanda",
    value: 0,
    icon: Target,
    subprocesses: [
      { label: "Captación de leads comprador", value: 0 },
      { label: "Primer filtro y cualificación", value: 0 },
      { label: "Validación económica preliminar", value: 0 },
    ],
  },
  {
    label: "Matching y presentación",
    value: 0,
    icon: MessageSquare,
    subprocesses: [
      { label: "Selección de compradores", value: 0 },
      { label: "Coordinación de visitas", value: 0 },
      { label: "Feedback y ajustes", value: 0 },
    ],
  },
  {
    label: "Negociación",
    value: 0,
    icon: Handshake,
    subprocesses: [
      { label: "Presentación de oferta formal", value: 0 },
      { label: "Contrapropuesta y cierre", value: 0 },
      { label: "Alineamiento legal y financiero", value: 0 },
    ],
  },
  {
    label: "Formalización",
    value: 0,
    icon: CheckCircle,
    subprocesses: [
      { label: "Coordinación notaría/gestoría", value: 0 },
      { label: "Preparación y firma de escrituras", value: 0 },
      { label: "Liquidación de pagos", value: 0 },
    ],
  },
  {
    label: "Postventa",
    value: 0,
    icon: Building,
    subprocesses: [
      { label: "Entrega de llaves y acta", value: 0 },
      { label: "Solicitud de recomendaciones", value: 0 },
      { label: "Seguimiento de incidencias", value: 0 },
    ],
  },
]

// Rental Process Definition
export const rentalProcess = [
  {
    label: "Captación del inmueble",
    value: 0,
    icon: Home,
    subprocesses: [
      { label: "Contacto con propietario", value: 0 },
      { label: "Visita técnica y definición", value: 0 },
      { label: "Firma del encargo", value: 0 },
      { label: "Validación documentación", value: 0 },
    ],
  },
  {
    label: "Preparación y promoción",
    value: 0,
    icon: FileText,
    subprocesses: [
      { label: "Ficha y fotos del inmueble", value: 0 },
      { label: "Publicación en portales", value: 0 },
      { label: "Definición perfil inquilino", value: 0 },
    ],
  },
  {
    label: "Generación de demanda",
    value: 0,
    icon: Users,
    subprocesses: [
      { label: "Recepción de leads", value: 0 },
      { label: "Entrevista previa", value: 0 },
      { label: "Filtrado por perfil", value: 0 },
    ],
  },
  {
    label: "Visitas y matching",
    value: 0,
    icon: Eye,
    subprocesses: [
      { label: "Coordinación de visitas", value: 0 },
      { label: "Feedback y ajustes", value: 0 },
      { label: "Verificación condiciones", value: 0 },
    ],
  },
  {
    label: "Validación y negociación",
    value: 0,
    icon: Handshake,
    subprocesses: [
      { label: "Petición documentación", value: 0 },
      { label: "Validación de solvencia", value: 0 },
      { label: "Negociación condiciones", value: 0 },
    ],
  },
  {
    label: "Contrato y entrega",
    value: 0,
    icon: FileText,
    subprocesses: [
      { label: "Firma del contrato", value: 0 },
      { label: "Gestión de fianza", value: 0 },
      { label: "Inventario y entrega", value: 0 },
    ],
  },
  {
    label: "Gestión post-contrato",
    value: 0,
    icon: Building,
    subprocesses: [
      { label: "Atención incidencias", value: 0 },
      { label: "Coordinación mantenimiento", value: 0 },
      { label: "Gestión renovación", value: 0 },
    ],
  },
]

// Process type definitions for type safety
export type ProcessType = 'venta' | 'alquiler'

// Process mapping for easy access
export const processMap = {
  venta: salesProcess,
  alquiler: rentalProcess,
} as const 