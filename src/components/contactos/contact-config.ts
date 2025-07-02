import { Search, Home, Landmark, Store, Building } from "lucide-react"

export const contactTypeConfig = {
  demandante: {
    label: "Demandante",
    icon: Search,
    colors: "bg-blue-50 text-blue-700 border-blue-200",
    lightColors: "bg-blue-50",
    lineColor: "bg-blue-200",
  },
  propietario: {
    label: "Propietario",
    icon: Home,
    colors: "bg-green-50 text-green-700 border-green-200",
    lightColors: "bg-green-50",
    lineColor: "bg-green-200",
  },
  banco: {
    label: "Banco",
    icon: Landmark,
    colors: "bg-purple-50 text-purple-700 border-purple-200",
    lightColors: "bg-purple-50",
    lineColor: "bg-purple-200",
  },
  agencia: {
    label: "Agencia",
    icon: Store,
    colors: "bg-orange-50 text-orange-700 border-orange-200",
    lightColors: "bg-orange-50",
    lineColor: "bg-orange-200",
  },
} as const

export const formatListingType = (listingType: string) => {
  const typeMap: Record<string, string> = {
    'sale': 'Vender',
    'sold': 'Vendido',
    'rent': 'Alquilar',
    'rented': 'Alquilado'
  }
  return typeMap[listingType.toLowerCase()] || listingType
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
} 