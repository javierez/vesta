"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "~/components/ui/card"
import { Switch } from "~/components/ui/switch"
import { Label } from "~/components/ui/label"
import { Badge } from "~/components/ui/badge"
import { Globe, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { cn } from "~/lib/utils"

interface Platform {
  id: string
  name: string
  logo: string
  isActive: boolean
  lastSync?: Date
  status: "active" | "pending" | "error" | "inactive"
  description?: string
}

interface PortalSelectionProps {
  listingId: string
  onPlatformsChange?: (platforms: Platform[]) => void
  initialPlatforms?: Platform[]
}

const defaultPlatforms: Platform[] = [
  {
    id: "idealista",
    name: "Idealista",
    logo: "/logos/logo-idealista.png",
    isActive: false,
    status: "inactive",
    description: "El portal inmobiliario más visitado de España"
  },
  {
    id: "fotocasa",
    name: "Fotocasa",
    logo: "/logos/logo-fotocasa-min.png",
    isActive: false,
    status: "inactive",
    description: "Encuentra tu casa ideal con millones de anuncios"
  },
  {
    id: "habitaclia",
    name: "Habitaclia",
    logo: "",
    isActive: false,
    status: "inactive",
    description: "Portal especializado en alquiler y venta"
  },
  {
    id: "pisos",
    name: "Pisos.com",
    logo: "",
    isActive: false,
    status: "inactive",
    description: "Tu portal de confianza para encontrar hogar"
  },
  {
    id: "yaencontre",
    name: "Yaencontré",
    logo: "",
    isActive: false,
    status: "inactive",
    description: "Encuentra tu próxima casa fácilmente"
  }
]

export function PortalSelection({ listingId, onPlatformsChange, initialPlatforms }: PortalSelectionProps) {
  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms || defaultPlatforms)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialPlatforms) {
      setPlatforms(initialPlatforms)
    }
  }, [initialPlatforms])

  const handlePlatformToggle = (platformId: string, isActive: boolean) => {
    const updatedPlatforms = platforms.map(platform => {
      if (platform.id === platformId) {
        return {
          ...platform,
          isActive,
          status: isActive ? "pending" as const : "inactive" as const,
          lastSync: isActive ? new Date() : undefined
        }
      }
      return platform
    })
    
    setPlatforms(updatedPlatforms)
    onPlatformsChange?.(updatedPlatforms)
  }

  const getStatusIcon = (status: Platform["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: Platform["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Activo</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">Pendiente</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">Error</Badge>
      default:
        return <Badge variant="secondary">Inactivo</Badge>
    }
  }

  const activePlatformsCount = platforms.filter(p => p.isActive).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Portales de Publicación</h2>
        </div>
        <p className="text-sm text-gray-600">
          Selecciona los portales donde quieres publicar tu inmueble
        </p>
      </motion.div>

      {/* Platforms Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {platforms.map((platform, index) => (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
          >
            <Card className={cn(
              "transition-all duration-300 hover:shadow-md border-2",
              platform.isActive 
                ? "border-blue-200 bg-blue-50/50" 
                : "border-gray-200 hover:border-gray-300"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  {/* Platform Info */}
                  <div className="flex items-center gap-3 flex-1">
                    {/* Logo */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                        {platform.logo ? (
                          <Image
                            src={platform.logo}
                            alt={platform.name}
                            width={40}
                            height={40}
                            className="object-contain"
                            onError={(e) => {
                              // Fallback for missing logos
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              target.parentElement!.innerHTML = `<div class="text-xs font-medium text-gray-500">${platform.name}</div>`
                            }}
                          />
                        ) : (
                          <div className="text-xs font-medium text-gray-500 text-center px-1">
                            {platform.name}
                          </div>
                        )}
                      </div>
                      {getStatusIcon(platform.status) && (
                        <div className="absolute -top-1 -right-1">
                          {getStatusIcon(platform.status)}
                        </div>
                      )}
                    </div>

                    {/* Platform Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{platform.name}</h3>
                      {platform.description && (
                        <p className="text-xs text-gray-500 truncate">{platform.description}</p>
                      )}
                      {platform.lastSync && (
                        <p className="text-xs text-gray-400">
                          Última sincronización: {platform.lastSync.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Toggle and Status */}
                  <div className="flex items-center gap-3">
                    {platform.status !== "inactive" && getStatusBadge(platform.status)}
                    <Switch
                      checked={platform.isActive}
                      onCheckedChange={(checked) => handlePlatformToggle(platform.id, checked)}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Summary */}
      <AnimatePresence>
        {activePlatformsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 bg-blue-50 rounded-lg border border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {activePlatformsCount} portal{activePlatformsCount !== 1 ? 'es' : ''} seleccionado{activePlatformsCount !== 1 ? 's' : ''}
                </span>
              </div>
              <Badge className="bg-blue-100 text-blue-700">
                {activePlatformsCount} activo{activePlatformsCount !== 1 ? 's' : ''}
              </Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
