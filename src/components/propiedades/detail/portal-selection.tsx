"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { cn } from "~/lib/utils";
import { updateListingWithAuth } from "~/server/queries/listing";
import { toast } from "sonner";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  publishToFotocasa,
  deleteFromFotocasa,
  updateFotocasa,
} from "~/server/portals/fotocasa";

interface Platform {
  id: string;
  name: string;
  logo: string;
  isActive: boolean;
  lastSync?: Date;
  status: "active" | "pending" | "error" | "inactive";
  description?: string;
  isDefault?: boolean; // Whether this platform is enabled by default
  visibilityMode?: number; // For Fotocasa visibility mode (1=Exact, 2=Street, 3=Zone)
  hidePrice?: boolean; // For Fotocasa hide price option
}

interface PortalSelectionProps {
  listingId: string;
  onPlatformsChange?: (platforms: Platform[]) => void;
  // Portal fields from getListingDetails
  fotocasa?: boolean;
  idealista?: boolean;
  habitaclia?: boolean;
  milanuncios?: boolean;
  // Portal props from database (JSON columns)
  fotocasaProps?: unknown;
  idealistaProps?: unknown;
  habitacliaProps?: unknown;
  milanunciosProps?: unknown;
  // Initial state from parent for persistence across tab switches
  initialPlatformStates?: Record<string, boolean>;
  initialVisibilityModes?: Record<string, number>;
  initialHidePriceModes?: Record<string, boolean>;
  onPortalStateChange?: (platformStates: Record<string, boolean>, visibilityModes: Record<string, number>, hidePriceModes: Record<string, boolean>) => void;
}

// Mock default settings - in real app this would come from configuration
const defaultPortalSettings = {
  fotocasa: true, // Fotocasa is enabled by default
  idealista: true, // Idealista is enabled by default
  habitaclia: false, // Habitaclia is disabled by default
  milanuncios: false, // Milanuncios is disabled by default
};

const platformConfig = [
  {
    id: "idealista",
    name: "Idealista",
    logo: "https://vesta-configuration-files.s3.amazonaws.com/logos/logo-idealista.png",
    description: "El portal inmobiliario más visitado de España",
    isDefault: defaultPortalSettings.idealista,
  },
  {
    id: "fotocasa",
    name: "Fotocasa",
    logo: "https://vesta-configuration-files.s3.amazonaws.com/logos/logo-fotocasa-min.png",
    description: "Encuentra tu casa ideal con millones de anuncios",
    isDefault: defaultPortalSettings.fotocasa,
  },
  {
    id: "habitaclia",
    name: "Habitaclia",
    logo: "https://vesta-configuration-files.s3.amazonaws.com/logos/logo-habitaclia.png",
    description: "Portal especializado en alquiler y venta",
    isDefault: defaultPortalSettings.habitaclia,
  },
  {
    id: "milanuncios",
    name: "Milanuncios",
    logo: "https://vesta-configuration-files.s3.amazonaws.com/logos/logo-milanuncios.png",
    description: "Portal de anuncios clasificados líder en España",
    isDefault: defaultPortalSettings.milanuncios,
  },
];

export function PortalSelection({
  listingId,
  onPlatformsChange,
  fotocasa = false,
  idealista = false,
  habitaclia = false,
  milanuncios = false,
  fotocasaProps,
  idealistaProps: _idealistaProps,
  habitacliaProps: _habitacliaProps,
  milanunciosProps: _milanunciosProps,
  initialPlatformStates,
  initialVisibilityModes,
  initialHidePriceModes,
  onPortalStateChange,
}: PortalSelectionProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedPlatformStates, setSavedPlatformStates] = useState<
    Record<string, boolean>
  >({});
  // Type guard for fotocasaProps
  const parsedFotocasaProps = fotocasaProps as { visibilityMode?: number; hidePrice?: boolean } | undefined;

  const [visibilityModes, setVisibilityModes] = useState<
    Record<string, number>
  >(
    initialVisibilityModes ?? {
      fotocasa: parsedFotocasaProps?.visibilityMode ?? 1, // Use database value or default to Exact
    }
  );
  const [hidePriceModes, setHidePriceModes] = useState<Record<string, boolean>>(
    initialHidePriceModes ?? {
      fotocasa: parsedFotocasaProps?.hidePrice ?? false, // Use database value or default to show price
    }
  );
  const [refreshingPlatforms, setRefreshingPlatforms] = useState<
    Record<string, boolean>
  >({});

  // Initialize platforms based on portal fields and defaults
  useEffect(() => {
    const initializePlatforms = () => {
      const portalValues = { fotocasa, idealista, habitaclia, milanuncios };

      const initializedPlatforms = platformConfig.map((config) => {
        // Check if we have cached platform state from parent first
        const hasCachedState = initialPlatformStates && config.id in initialPlatformStates;
        const isActive = hasCachedState
          ? (initialPlatformStates[config.id] ?? false)
          : (portalValues[config.id as keyof typeof portalValues] ?? false);

        // Use actual database values to determine initial state
        const status: Platform["status"] = isActive ? "active" : "inactive";

        return {
          ...config,
          isActive,
          status,
          lastSync: isActive ? new Date() : undefined,
          visibilityMode:
            config.id === "fotocasa" ? visibilityModes.fotocasa : undefined,
          hidePrice:
            config.id === "fotocasa" ? hidePriceModes.fotocasa : undefined,
        };
      });

      setPlatforms(initializedPlatforms);

      // Only set savedPlatformStates if we don't have cached states from parent
      if (!initialPlatformStates) {
        setSavedPlatformStates(
          initializedPlatforms.reduce(
            (acc, platform) => ({
              ...acc,
              [platform.id]: platform.isActive,
            }),
            {} as Record<string, boolean>,
          ),
        );
      } else {
        // Use the parent's cached states
        setSavedPlatformStates(initialPlatformStates);
      }
    };

    initializePlatforms();
  }, [
    fotocasa,
    idealista,
    habitaclia,
    milanuncios,
    hidePriceModes.fotocasa,
    visibilityModes.fotocasa,
    initialPlatformStates,
  ]);

  const handlePlatformToggle = (platformId: string, isActive: boolean) => {
    const updatedPlatforms = platforms.map((platform) => {
      if (platform.id === platformId) {
        let status: Platform["status"] = "inactive";

        if (isActive) {
          // If enabling, set to pending (needs confirmation)
          status = "pending";
        } else {
          // If disabling, set to inactive
          status = "inactive";
        }

        return {
          ...platform,
          isActive,
          status,
          lastSync: isActive ? new Date() : undefined,
        };
      }
      return platform;
    });

    setPlatforms(updatedPlatforms);
    onPlatformsChange?.(updatedPlatforms);
    setHasUnsavedChanges(true);

    // Notify parent component to persist platform toggle states
    const platformStates = updatedPlatforms.reduce(
      (acc, p) => ({ ...acc, [p.id]: p.isActive }),
      {} as Record<string, boolean>
    );
    onPortalStateChange?.(platformStates, visibilityModes, hidePriceModes);
  };

  const handleConfirmChanges = async () => {
    setIsLoading(true);

    try {
      // Prepare the portal field updates based on current platform states
      const portalUpdates = {
        fotocasa: platforms.find((p) => p.id === "fotocasa")?.isActive ?? false,
        idealista:
          platforms.find((p) => p.id === "idealista")?.isActive ?? false,
        habitaclia:
          platforms.find((p) => p.id === "habitaclia")?.isActive ?? false,
        milanuncios:
          platforms.find((p) => p.id === "milanuncios")?.isActive ?? false,
        // Save portal-specific configuration props
        fotocasaProps: {
          visibilityMode: visibilityModes.fotocasa ?? 1,
          hidePrice: hidePriceModes.fotocasa ?? false,
        },
        idealistaProps: {}, // Placeholder for future Idealista settings
        habitacliaProps: {}, // Placeholder for future Habitaclia settings
        milanunciosProps: {}, // Placeholder for future Milanuncios settings
      };

      // Update the listing with the new portal values
      await updateListingWithAuth(Number(listingId), portalUpdates);

      // Get the previous states to check what changed
      const previousFotocasaState = savedPlatformStates.fotocasa;
      const currentFotocasaState = portalUpdates.fotocasa;

      // Call portal-specific actions based on state changes
      if (currentFotocasaState && !previousFotocasaState) {
        // Fotocasa is being enabled - publish to Fotocasa
        console.log("Publishing to Fotocasa...");
        try {
          const fotocasaResult = await publishToFotocasa(
            Number(listingId),
            visibilityModes.fotocasa ?? 1,
            hidePriceModes.fotocasa ?? false,
          );
          if (fotocasaResult.success) {
            console.log("Successfully published to Fotocasa");
          } else {
            console.error(
              "Failed to publish to Fotocasa:",
              fotocasaResult.error,
            );
            toast.error("Error al publicar en Fotocasa");
          }
        } catch (error) {
          console.error("Error calling Fotocasa API:", error);
          toast.error("Error al conectar con Fotocasa");
        }
      } else if (currentFotocasaState && previousFotocasaState) {
        // Fotocasa is already active - check if settings changed and update if needed
        const currentVisibilityMode = visibilityModes.fotocasa ?? 1;
        const currentHidePrice = hidePriceModes.fotocasa ?? false;

        // For now, we'll always update when Fotocasa is active and settings might have changed
        // In a more sophisticated implementation, you'd compare with previous settings
        console.log("Updating Fotocasa settings...");
        try {
          const fotocasaResult = await updateFotocasa(
            Number(listingId),
            currentVisibilityMode,
            currentHidePrice,
          );
          if (fotocasaResult.success) {
            console.log("Successfully updated Fotocasa");
          } else {
            console.error("Failed to update Fotocasa:", fotocasaResult.error);
            toast.error("Error al actualizar Fotocasa");
          }
        } catch (error) {
          console.error("Error calling Fotocasa update API:", error);
          toast.error("Error al conectar con Fotocasa para actualizar");
        }
      } else if (!currentFotocasaState && previousFotocasaState) {
        // Fotocasa is being disabled - delete from Fotocasa
        console.log("Deleting from Fotocasa...");
        try {
          const fotocasaResult = await deleteFromFotocasa(Number(listingId));
          if (fotocasaResult.success) {
            console.log("Successfully deleted from Fotocasa");
          } else {
            console.error(
              "Failed to delete from Fotocasa:",
              fotocasaResult.error,
            );
            toast.error("Error al eliminar de Fotocasa");
          }
        } catch (error) {
          console.error("Error calling Fotocasa delete API:", error);
          toast.error("Error al conectar con Fotocasa para eliminar");
        }
      }

      // Update local state to reflect the confirmed changes
      const updatedPlatforms: Platform[] = platforms.map((platform) => ({
        ...platform,
        status: platform.isActive ? ("active" as const) : ("inactive" as const),
      }));

      setPlatforms(updatedPlatforms);
      setHasUnsavedChanges(false);
      setSavedPlatformStates(
        platforms.reduce(
          (acc, platform) => ({
            ...acc,
            [platform.id]: platform.isActive,
          }),
          {} as Record<string, boolean>,
        ),
      );

      toast.success("Configuración de portales actualizada correctamente");
    } catch (error) {
      console.error("Error updating portal configuration:", error);
      toast.error("Error al actualizar la configuración de portales");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisibilityModeChange = (platformId: string, mode: number) => {
    const updatedVisibilityModes = {
      ...visibilityModes,
      [platformId]: mode,
    };
    setVisibilityModes(updatedVisibilityModes);

    const updatedPlatforms = platforms.map((platform) =>
      platform.id === platformId
        ? { ...platform, visibilityMode: mode }
        : platform,
    );
    setPlatforms(updatedPlatforms);
    setHasUnsavedChanges(true);

    // Notify parent component to persist state
    const platformStates = updatedPlatforms.reduce(
      (acc, p) => ({ ...acc, [p.id]: p.isActive }),
      {} as Record<string, boolean>
    );
    onPortalStateChange?.(platformStates, updatedVisibilityModes, hidePriceModes);
  };

  const handleHidePriceChange = (platformId: string, hidePrice: boolean) => {
    const updatedHidePriceModes = {
      ...hidePriceModes,
      [platformId]: hidePrice,
    };
    setHidePriceModes(updatedHidePriceModes);

    const updatedPlatforms = platforms.map((platform) =>
      platform.id === platformId ? { ...platform, hidePrice } : platform,
    );
    setPlatforms(updatedPlatforms);
    setHasUnsavedChanges(true);

    // Notify parent component to persist state
    const platformStates = updatedPlatforms.reduce(
      (acc, p) => ({ ...acc, [p.id]: p.isActive }),
      {} as Record<string, boolean>
    );
    onPortalStateChange?.(platformStates, visibilityModes, updatedHidePriceModes);
  };

  const handleRefresh = async (platformId: string) => {
    // Only allow refresh if platform is active
    const platform = platforms.find((p) => p.id === platformId);
    if (!platform?.isActive) {
      toast.error(`${platform?.name} no está activo`);
      return;
    }

    setRefreshingPlatforms((prev) => ({ ...prev, [platformId]: true }));

    try {
      if (platformId === "fotocasa") {
        console.log(`Refreshing ${platformId}...`);
        const result = await updateFotocasa(
          Number(listingId),
          visibilityModes.fotocasa ?? 1,
          hidePriceModes.fotocasa ?? false,
        );

        if (result.success) {
          console.log(`Successfully refreshed ${platformId}`);
          toast.success(`${platform.name} actualizado correctamente`);

          // Update platform status to active
          const updatedPlatforms = platforms.map((p) =>
            p.id === platformId
              ? { ...p, status: "active" as const, lastSync: new Date() }
              : p,
          );
          setPlatforms(updatedPlatforms);
        } else {
          console.error(`Failed to refresh ${platformId}:`, result.error);
          toast.error(`Error al actualizar ${platform.name}: ${result.error}`);

          // Update platform status to error
          const updatedPlatforms = platforms.map((p) =>
            p.id === platformId ? { ...p, status: "error" as const } : p,
          );
          setPlatforms(updatedPlatforms);
        }
      } else {
        // For other platforms, show not implemented message
        toast.info(`Actualización de ${platform.name} no implementada aún`);
      }
    } catch (error) {
      console.error(`Error refreshing ${platformId}:`, error);
      toast.error(`Error al conectar con ${platform?.name}`);

      // Update platform status to error
      const updatedPlatforms = platforms.map((p) =>
        p.id === platformId ? { ...p, status: "error" as const } : p,
      );
      setPlatforms(updatedPlatforms);
    } finally {
      setRefreshingPlatforms((prev) => ({ ...prev, [platformId]: false }));
    }
  };

  const getCardStyles = (platform: Platform) => {
    const initialActive = savedPlatformStates[platform.id];
    const currentActive = platform.isActive;
    if (currentActive) {
      if (initialActive) {
        // Was active and is still active (even if toggled off and on again before saving)
        return "bg-white shadow-lg";
      } else {
        // Was inactive, now active (pending save)
        return "bg-white shadow-sm";
      }
    } else {
      // Inactive
      return "bg-transparent shadow-sm hover:border-gray-300";
    }
  };

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
      ></motion.div>

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
            <Card
              className={cn(
                "group relative transition-all duration-300",
                getCardStyles(platform),
              )}
            >
              {/* Orange Dot for Pending State */}
              {platform.isActive && !savedPlatformStates[platform.id] && (
                <div className="absolute left-2 top-2 h-2 w-2 rounded-full bg-orange-400"></div>
              )}

              {/* Refresh Button - Top Right Corner, Only on Hover */}
              <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                  aria-label={`Refrescar ${platform.name}`}
                  tabIndex={-1}
                  type="button"
                  onClick={() => handleRefresh(platform.id)}
                  disabled={refreshingPlatforms[platform.id]}
                >
                  <RefreshCcw
                    className={cn(
                      "h-3 w-3 text-gray-600",
                      refreshingPlatforms[platform.id] && "animate-spin",
                    )}
                  />
                </Button>
              </div>

              <CardContent className="flex flex-col p-4">
                <div className="flex h-24 flex-col items-center justify-center gap-4">
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
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.parentElement!.innerHTML = `<div class="text-sm font-medium text-gray-500 w-16 h-16 flex items-center justify-center">${platform.name}</div>`;
                          }}
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center text-sm font-medium text-gray-500">
                          {platform.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center justify-center">
                    <Switch
                      checked={platform.isActive}
                      onCheckedChange={(checked) =>
                        handlePlatformToggle(platform.id, checked)
                      }
                      className="data-[state=checked]:bg-gray-900"
                    />
                  </div>
                </div>

                {/* Inline Settings Panel - Expands when active */}
                <AnimatePresence>
                  {platform.isActive && platform.id === "fotocasa" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-3 border-t pt-3">
                        {/* Visibility Mode */}
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-700">
                            Visibilidad
                          </Label>
                          <RadioGroup
                            value={String(visibilityModes.fotocasa ?? 1)}
                            onValueChange={(value) =>
                              handleVisibilityModeChange(
                                "fotocasa",
                                Number(value),
                              )
                            }
                            className="space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="1" id={`${platform.id}-exact`} />
                              <Label
                                htmlFor={`${platform.id}-exact`}
                                className="text-xs font-normal cursor-pointer"
                              >
                                Exacta
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="2" id={`${platform.id}-street`} />
                              <Label
                                htmlFor={`${platform.id}-street`}
                                className="text-xs font-normal cursor-pointer"
                              >
                                Calle
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="3" id={`${platform.id}-zone`} />
                              <Label
                                htmlFor={`${platform.id}-zone`}
                                className="text-xs font-normal cursor-pointer"
                              >
                                Zona
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Hide Price Toggle */}
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor={`${platform.id}-hide-price`}
                            className="text-xs font-medium text-gray-700 cursor-pointer"
                          >
                            Ocultar precio
                          </Label>
                          <Switch
                            id={`${platform.id}-hide-price`}
                            checked={hidePriceModes.fotocasa ?? false}
                            onCheckedChange={(checked) =>
                              handleHidePriceChange("fotocasa", checked)
                            }
                            className="data-[state=checked]:bg-gray-900"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              {isLoading ? "Confirmando..." : "Confirmar"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
