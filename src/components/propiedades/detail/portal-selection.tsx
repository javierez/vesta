"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "~/components/ui/card"
import { Switch } from "~/components/ui/switch"
import { Label } from "~/components/ui/label"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
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
    isActive: true,
    status: "pending",
    description: "El portal inmobiliario más visitado de España"
  },
  {
    id: "fotocasa",
    name: "Fotocasa",
    logo: "/logos/logo-fotocasa-min.png",
    isActive: true,
    status: "pending",
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

  const handleConfirmPending = async () => {
    setIsLoading(true)
    
    // Simulate API call to confirm pending platforms
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const updatedPlatforms = platforms.map(platform => {
      if (platform.status === "pending") {
        return {
          ...platform,
          status: "active" as const,
          lastSync: new Date()
        }
      }
      return platform
    })
    
    setPlatforms(updatedPlatforms)
    onPlatformsChange?.(updatedPlatforms)
    setIsLoading(false)
  }

  const getStatusIcon = (status: Platform["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
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

  const getCardStyles = (platform: Platform) => {
    if (platform.status === "active") {
      return "border-green-200 bg-green-50/50"
    } else if (platform.status === "pending") {
      return "border-amber-200 bg-amber-50/50"
    } else {
      return "border-gray-200 hover:border-gray-300"
    }
  }

  const pendingPlatformsCount = platforms.filter(p => p.status === "pending").length

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

      </motion.div>

      {/* Platforms Grid */}
      <motion.div
        className="grid grid-cols-5 gap-4"
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
              getCardStyles(platform)
            )}>
              <CardContent className="p-4 h-24 flex flex-col justify-between">
                <div className="flex flex-col items-center gap-4 flex-1 justify-center">
                  {/* Platform Logo */}
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      {platform.logo ? (
                        <Image
                          src={platform.logo}
                          alt={platform.name}
                          width={64}
                          height={64}
                          className="object-contain"
                          onError={(e) => {
                            // Fallback for missing logos
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.parentElement!.innerHTML = `<div class="text-sm font-medium text-gray-500 w-16 h-16 flex items-center justify-center">${platform.name}</div>`
                          }}
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-500 w-16 h-16 flex items-center justify-center">
                          {platform.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center justify-center">
                    <Switch
                      checked={platform.isActive}
                      onCheckedChange={(checked) => handlePlatformToggle(platform.id, checked)}
                      className="data-[state=checked]:bg-gray-900"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Confirm Button for Pending Platforms */}
      <AnimatePresence>
        {pendingPlatformsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center"
          >
            <Button
              onClick={handleConfirmPending}
              disabled={isLoading}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isLoading ? "Confirmando..." : "Confirmar"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
