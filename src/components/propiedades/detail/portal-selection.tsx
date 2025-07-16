"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "~/components/ui/card"
import { Switch } from "~/components/ui/switch"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { CheckCircle2, AlertCircle, MoreVertical } from "lucide-react"
import { cn } from "~/lib/utils"
import { updateListing } from "~/server/queries/listing"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "~/components/ui/dropdown-menu"
import { publishToFotocasa } from "~/server/portals/fotocasa"

interface Platform {
  id: string
  name: string
  logo: string
  isActive: boolean
  lastSync?: Date
  status: "active" | "pending" | "error" | "inactive"
  description?: string
  isDefault?: boolean // Whether this platform is enabled by default
  visibilityMode?: number // For Fotocasa visibility mode (1=Exact, 2=Street, 3=Zone)
}

interface PortalSelectionProps {
  listingId: string
  onPlatformsChange?: (platforms: Platform[]) => void
  // Portal fields from getListingDetails
  fotocasa?: boolean
  idealista?: boolean
  habitaclia?: boolean
  milanuncios?: boolean
}

// Mock default settings - in real app this would come from configuration
const defaultPortalSettings = {
  fotocasa: true,    // Fotocasa is enabled by default
  idealista: true,   // Idealista is enabled by default
  habitaclia: false, // Habitaclia is disabled by default
  milanuncios: false // Milanuncios is disabled by default
}

const platformConfig = [
  {
    id: "idealista",
    name: "Idealista",
    logo: "/logos/logo-idealista.png",
    description: "El portal inmobiliario más visitado de España",
    isDefault: defaultPortalSettings.idealista
  },
  {
    id: "fotocasa",
    name: "Fotocasa",
    logo: "/logos/logo-fotocasa-min.png",
    description: "Encuentra tu casa ideal con millones de anuncios",
    isDefault: defaultPortalSettings.fotocasa
  },
  {
    id: "habitaclia",
    name: "Habitaclia",
    logo: "/logos/logo-habitaclia.png",
    description: "Portal especializado en alquiler y venta",
    isDefault: defaultPortalSettings.habitaclia
  },
  {
    id: "milanuncios",
    name: "Milanuncios",
    logo: "/logos/logo-milanuncios.png",
    description: "Portal de anuncios clasificados líder en España",
    isDefault: defaultPortalSettings.milanuncios
  }
]

export function PortalSelection({ 
  listingId, 
  onPlatformsChange, 
  fotocasa = false,
  idealista = false,
  habitaclia = false,
  milanuncios = false
}: PortalSelectionProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [initialPlatformStates, setInitialPlatformStates] = useState<Record<string, boolean>>({})
  const [visibilityModes, setVisibilityModes] = useState<Record<string, number>>({
    fotocasa: 1 // Default to Exact
  })

  // Initialize platforms based on portal fields and defaults
  useEffect(() => {
    const initializePlatforms = () => {
      const portalValues = { fotocasa, idealista, habitaclia, milanuncios }

      const initializedPlatforms = platformConfig.map(config => {
        const portalValue = portalValues[config.id as keyof typeof portalValues] || false
        
        let status: Platform["status"] = "inactive"
        let isActive = false
        
        if (portalValue === true) {
          // If portal value is true from database, it's active (confirmed)
          status = "active"
          isActive = true
        } else if (portalValue === false && config.isDefault) {
          // If portal value is false but it's a default portal, it's pending (needs confirmation)
          status = "pending"
          isActive = true
        } else {
          // If portal value is false and it's not a default portal, it's inactive
          status = "inactive"
          isActive = false
        }
        
        return {
          ...config,
          isActive,
          status,
          lastSync: portalValue ? new Date() : undefined,
          visibilityMode: config.id === 'fotocasa' ? visibilityModes.fotocasa : undefined
        }
      })
      
      setPlatforms(initializedPlatforms)
      setInitialPlatformStates(initializedPlatforms.reduce((acc, platform) => ({
        ...acc,
        [platform.id]: platform.isActive
      }), {} as Record<string, boolean>))
    }

    initializePlatforms()
  }, [fotocasa, idealista, habitaclia, milanuncios])

  const handlePlatformToggle = (platformId: string, isActive: boolean) => {
    const updatedPlatforms = platforms.map(platform => {
      if (platform.id === platformId) {
        let status: Platform["status"] = "inactive"
        
        if (isActive) {
          // If enabling, set to pending (needs confirmation)
          status = "pending"
        } else {
          // If disabling, set to inactive
          status = "inactive"
        }
        
        return {
          ...platform,
          isActive,
          status,
          lastSync: isActive ? new Date() : undefined
        }
      }
      return platform
    })
    
    setPlatforms(updatedPlatforms)
    onPlatformsChange?.(updatedPlatforms)
    setHasUnsavedChanges(true)
  }

  const handleConfirmChanges = async () => {
    setIsLoading(true)
    
    try {
      // Prepare the portal field updates based on current platform states
      const portalUpdates = {
        fotocasa: platforms.find(p => p.id === 'fotocasa')?.isActive || false,
        idealista: platforms.find(p => p.id === 'idealista')?.isActive || false,
        habitaclia: platforms.find(p => p.id === 'habitaclia')?.isActive || false,
        milanuncios: platforms.find(p => p.id === 'milanuncios')?.isActive || false
      }

      // Update the listing with the new portal values
      await updateListing(Number(listingId), portalUpdates)

      // Call portal-specific actions for activated portals
      if (portalUpdates.fotocasa) {
        console.log('Publishing to Fotocasa...')
        try {
          const fotocasaResult = await publishToFotocasa(Number(listingId))
          if (fotocasaResult.success) {
            console.log('Successfully published to Fotocasa')
          } else {
            console.error('Failed to publish to Fotocasa:', fotocasaResult.error)
            toast.error('Error al publicar en Fotocasa')
          }
        } catch (error) {
          console.error('Error calling Fotocasa API:', error)
          toast.error('Error al conectar con Fotocasa')
        }
      }

      // Update local state to reflect the confirmed changes
      const updatedPlatforms: Platform[] = platforms.map(platform => ({
        ...platform,
        status: platform.isActive ? 'active' as const : 'inactive' as const
      }))
      
      setPlatforms(updatedPlatforms)
      setHasUnsavedChanges(false)
      setInitialPlatformStates(platforms.reduce((acc, platform) => ({
        ...acc,
        [platform.id]: platform.isActive
      }), {} as Record<string, boolean>))
      
      toast.success('Configuración de portales actualizada correctamente')
    } catch (error) {
      console.error('Error updating portal configuration:', error)
      toast.error('Error al actualizar la configuración de portales')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVisibilityModeChange = (platformId: string, mode: number) => {
    setVisibilityModes(prev => ({
      ...prev,
      [platformId]: mode
    }))
    
    const updatedPlatforms = platforms.map(platform => 
      platform.id === platformId 
        ? { ...platform, visibilityMode: mode }
        : platform
    )
    setPlatforms(updatedPlatforms)
    setHasUnsavedChanges(true)
  }

  const getVisibilityModeLabel = (mode: number) => {
    switch (mode) {
      case 1: return "Exacta"
      case 2: return "Calle"
      case 3: return "Zona"
      default: return "Exacta"
    }
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
        className="grid grid-cols-4 gap-4"
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
              "transition-all duration-300 hover:shadow-md border-2 relative group",
              getCardStyles(platform)
            )}>
              {/* Settings Burger Button - Inside Top Right Corner, Only on Hover */}
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 hover:bg-gray-100"
                    >
                      <MoreVertical className="h-3 w-3 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {platform.id === 'fotocasa' && (
                      <>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            Visibilidad: {getVisibilityModeLabel(visibilityModes.fotocasa ?? 1)}
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handleVisibilityModeChange('fotocasa', 1)}>
                              Exacta
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleVisibilityModeChange('fotocasa', 2)}>
                              Calle
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleVisibilityModeChange('fotocasa', 3)}>
                              Zona
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem>
                      Configurar sincronización
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Ver estadísticas
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Historial de cambios
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

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
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 flex justify-center"
          >
            <Button
              onClick={handleConfirmChanges}
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
