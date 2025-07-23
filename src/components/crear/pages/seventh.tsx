import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { Checkbox } from "~/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Eye, Home, Sparkles, Trees, Zap, WashingMachine } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { updateProperty } from "~/server/queries/properties"
import FormSkeleton from "./form-skeleton"

interface ListingDetails {
  propertyId?: number;
  propertyType?: string;
  views?: boolean;
  mountainViews?: boolean;
  seaViews?: boolean;
  beachfront?: boolean;
  jacuzzi?: boolean;
  hydromassage?: boolean;
  fireplace?: boolean;
  garden?: boolean;
  pool?: boolean;
  homeAutomation?: boolean;
  musicSystem?: boolean;
  laundryRoom?: boolean;
  coveredClothesline?: boolean;
  gym?: boolean;
  sportsArea?: boolean;
  childrenArea?: boolean;
  suiteBathroom?: boolean;
  nearbyPublicTransport?: boolean;
  communityPool?: boolean;
  privatePool?: boolean;
  tennisCourt?: boolean;
  formPosition?: number;
}

interface SeventhPageProps {
  listingId: string;
  globalFormData: { listingDetails?: ListingDetails | null };
  onNext: () => void;
  onBack?: () => void;
  refreshListingDetails?: () => void;
}

interface SeventhPageFormData {
  views: boolean
  mountainViews: boolean
  seaViews: boolean
  beachfront: boolean
  jacuzzi: boolean
  hydromassage: boolean
  fireplace: boolean
  garden: boolean
  pool: boolean
  homeAutomation: boolean
  musicSystem: boolean
  laundryRoom: boolean
  coveredClothesline: boolean
  gym: boolean
  sportsArea: boolean
  childrenArea: boolean
  suiteBathroom: boolean
  nearbyPublicTransport: boolean
  communityPool: boolean
  privatePool: boolean
  tennisCourt: boolean
}

const initialFormData: SeventhPageFormData = {
  views: false,
  mountainViews: false,
  seaViews: false,
  beachfront: false,
  jacuzzi: false,
  hydromassage: false,
  fireplace: false,
  garden: false,
  pool: false,
  homeAutomation: false,
  musicSystem: false,
  laundryRoom: false,
  coveredClothesline: false,
  gym: false,
  sportsArea: false,
  childrenArea: false,
  suiteBathroom: false,
  nearbyPublicTransport: false,
  communityPool: false,
  privatePool: false,
  tennisCourt: false,
}

export default function SeventhPage({ listingId: _listingId, globalFormData, onNext, onBack, refreshListingDetails }: SeventhPageProps) {
  const [formData, setFormData] = useState<SeventhPageFormData>(initialFormData)
  const [saveError] = useState<string | null>(null)
  const [propertyType, setPropertyType] = useState<string>("")

  const updateFormData = (field: keyof SeventhPageFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Use centralized data instead of fetching
  useEffect(() => {
    const details = globalFormData?.listingDetails;
    if (details) {
      setPropertyType(details.propertyType ?? "");
      // For garage properties, skip this page entirely
      if (details.propertyType === "garage") {
        onNext();
        return;
      }
      setFormData(prev => ({
        ...prev,
        views: details.views ?? false,
        mountainViews: details.mountainViews ?? false,
        seaViews: details.seaViews ?? false,
        beachfront: details.beachfront ?? false,
        jacuzzi: details.jacuzzi ?? false,
        hydromassage: details.hydromassage ?? false,
        fireplace: details.fireplace ?? false,
        garden: details.garden ?? false,
        pool: details.pool ?? false,
        homeAutomation: details.homeAutomation ?? false,
        musicSystem: details.musicSystem ?? false,
        laundryRoom: details.laundryRoom ?? false,
        coveredClothesline: details.coveredClothesline ?? false,
        gym: details.gym ?? false,
        sportsArea: details.sportsArea ?? false,
        childrenArea: details.childrenArea ?? false,
        suiteBathroom: details.suiteBathroom ?? false,
        nearbyPublicTransport: details.nearbyPublicTransport ?? false,
        communityPool: details.communityPool ?? false,
        privatePool: details.privatePool ?? false,
        tennisCourt: details.tennisCourt ?? false,
      }));
    }
  }, [globalFormData?.listingDetails, onNext]);

  const handleNext = () => {
    // Navigate IMMEDIATELY (optimistic) - no waiting!
    onNext()
    
    // Save data in background (completely silent)
    saveInBackground()
  }

  // Background save function - completely silent and non-blocking
  const saveInBackground = () => {
    // Fire and forget - no await, no blocking!
    const details = globalFormData?.listingDetails;
    if (details?.propertyId) {
      const updateData: Partial<ListingDetails> = {
        views: formData.views,
        mountainViews: formData.mountainViews,
        seaViews: formData.seaViews,
        beachfront: formData.beachfront,
        jacuzzi: formData.jacuzzi,
        hydromassage: formData.hydromassage,
        garden: formData.garden,
        pool: formData.pool,
        homeAutomation: formData.homeAutomation,
        musicSystem: formData.musicSystem,
        laundryRoom: formData.laundryRoom,
        coveredClothesline: formData.coveredClothesline,
        fireplace: formData.fireplace,
        gym: formData.gym,
        sportsArea: formData.sportsArea,
        childrenArea: formData.childrenArea,
        suiteBathroom: formData.suiteBathroom,
        nearbyPublicTransport: formData.nearbyPublicTransport,
        communityPool: formData.communityPool,
        privatePool: formData.privatePool,
        tennisCourt: formData.tennisCourt,
      };
      // Only update formPosition if current position is lower than 8
      if ((details.formPosition ?? 0) < 8) {
        updateData.formPosition = 8;
      }
      console.log("Saving seventh page data:", updateData); // Debug log
      updateProperty(Number(details.propertyId), updateData).then(() => {
        console.log("Seventh page data saved successfully"); // Debug log
        // Refresh global data after successful save
        refreshListingDetails?.();
      }).catch((error: unknown) => {
        console.error("Error saving form data:", error);
        // Silent error - user doesn't know it failed
        // Could implement retry logic here if needed
      });
    } else {
      console.warn("No propertyId found in globalFormData.listingDetails for seventh page"); // Debug log
    }
  }

  if (!globalFormData?.listingDetails) {
    return <FormSkeleton />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      <motion.div
        className="space-y-1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-gray-900">Extras de Lujo y Confort</h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {/* Views */}
        <div className="space-y-4 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-600">Vistas</h4>
            <Eye className="h-4 w-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="views" checked={formData.views} onCheckedChange={checked => updateFormData("views", !!checked)} />
              <Label htmlFor="views" className="text-sm">Vistas</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="mountainViews" checked={formData.mountainViews} onCheckedChange={checked => updateFormData("mountainViews", !!checked)} />
              <Label htmlFor="mountainViews" className="text-sm">Vistas montaña</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="seaViews" checked={formData.seaViews} onCheckedChange={checked => updateFormData("seaViews", !!checked)} />
              <Label htmlFor="seaViews" className="text-sm">Vistas mar</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="beachfront" checked={formData.beachfront} onCheckedChange={checked => updateFormData("beachfront", !!checked)} />
              <Label htmlFor="beachfront" className="text-sm">Primera línea</Label>
            </div>
          </div>
        </div>

        {/* Wellness - Hide for solar properties */}
        {propertyType !== "solar" && (
          <div className="space-y-4 p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-600">Bienestar</h4>
              <Sparkles className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="jacuzzi" checked={formData.jacuzzi} onCheckedChange={checked => updateFormData("jacuzzi", !!checked)} />
                <Label htmlFor="jacuzzi" className="text-sm">Jacuzzi</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="hydromassage" checked={formData.hydromassage} onCheckedChange={checked => updateFormData("hydromassage", !!checked)} />
                <Label htmlFor="hydromassage" className="text-sm">Hidromasaje</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="fireplace" checked={formData.fireplace} onCheckedChange={checked => updateFormData("fireplace", !!checked)} />
                <Label htmlFor="fireplace" className="text-sm">Chimenea</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="suiteBathroom" checked={formData.suiteBathroom} onCheckedChange={checked => updateFormData("suiteBathroom", !!checked)} />
                <Label htmlFor="suiteBathroom" className="text-sm">Baño en suite</Label>
              </div>
            </div>
          </div>
        )}

        {/* Outdoor Features - Hide for solar properties */}
        {propertyType !== "solar" && (
          <div className="space-y-4 p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-600">Exterior</h4>
              <Trees className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="garden" checked={formData.garden} onCheckedChange={checked => updateFormData("garden", !!checked)} />
                <Label htmlFor="garden" className="text-sm">Jardín</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="pool" checked={formData.pool} onCheckedChange={checked => updateFormData("pool", !!checked)} />
                <Label htmlFor="pool" className="text-sm">Piscina</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="privatePool" checked={formData.privatePool} onCheckedChange={checked => updateFormData("privatePool", !!checked)} />
                <Label htmlFor="privatePool" className="text-sm">Piscina privada</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="communityPool" checked={formData.communityPool} onCheckedChange={checked => updateFormData("communityPool", !!checked)} />
                <Label htmlFor="communityPool" className="text-sm">Piscina comunitaria</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="tennisCourt" checked={formData.tennisCourt} onCheckedChange={checked => updateFormData("tennisCourt", !!checked)} />
                <Label htmlFor="tennisCourt" className="text-sm">Pista de tenis</Label>
              </div>
            </div>
          </div>
        )}

        {/* Community Amenities - Hide for solar properties */}
        {propertyType !== "solar" && (
          <div className="space-y-4 p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-600">Comunitarios</h4>
              <Home className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="gym" checked={formData.gym} onCheckedChange={checked => updateFormData("gym", !!checked)} />
                <Label htmlFor="gym" className="text-sm">Gimnasio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="sportsArea" checked={formData.sportsArea} onCheckedChange={checked => updateFormData("sportsArea", !!checked)} />
                <Label htmlFor="sportsArea" className="text-sm">Zona deportiva</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="childrenArea" checked={formData.childrenArea} onCheckedChange={checked => updateFormData("childrenArea", !!checked)} />
                <Label htmlFor="childrenArea" className="text-sm">Zona infantil</Label>
              </div>
            </div>
          </div>
        )}

        {/* Location Features - Show for all property types */}
        <div className="space-y-4 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-600">Ubicación</h4>
            <Home className="h-4 w-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="nearbyPublicTransport" checked={formData.nearbyPublicTransport} onCheckedChange={checked => updateFormData("nearbyPublicTransport", !!checked)} />
              <Label htmlFor="nearbyPublicTransport" className="text-sm">Transporte público cercano</Label>
            </div>
          </div>
        </div>

        {/* Smart Home - Hide for solar properties */}
        {propertyType !== "solar" && (
          <div className="space-y-4 p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-600">Domótica</h4>
              <Zap className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="homeAutomation" checked={formData.homeAutomation} onCheckedChange={checked => updateFormData("homeAutomation", !!checked)} />
                <Label htmlFor="homeAutomation" className="text-sm">Domótica</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="musicSystem" checked={formData.musicSystem} onCheckedChange={checked => updateFormData("musicSystem", !!checked)} />
                <Label htmlFor="musicSystem" className="text-sm">Sistema de música</Label>
              </div>
            </div>
          </div>
        )}

        {/* Utility Rooms - Hide for solar properties */}
        {propertyType !== "solar" && (
          <div className="space-y-4 p-4 rounded-lg shadow-md col-span-full">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-600">Estancias</h4>
              <WashingMachine className="h-4 w-4 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox id="laundryRoom" checked={formData.laundryRoom} onCheckedChange={checked => updateFormData("laundryRoom", !!checked)} />
                <Label htmlFor="laundryRoom" className="text-sm">Lavadero</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="coveredClothesline" checked={formData.coveredClothesline} onCheckedChange={checked => updateFormData("coveredClothesline", !!checked)} />
                <Label htmlFor="coveredClothesline" className="text-sm">Tendedero cubierto</Label>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700"
          >
            {saveError}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="flex justify-between pt-4 border-t"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={!onBack}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Anterior</span>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            onClick={handleNext} 
            className="flex items-center space-x-1 bg-gray-900 hover:bg-gray-800"
          >
            <span>Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
