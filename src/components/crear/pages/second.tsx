import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { updateProperty } from "~/server/queries/properties";
import { formFormatters } from "~/lib/utils";
import FormSkeleton from "./form-skeleton";
import { RoomSelector } from "./elements/room_selector";
import { YearSlider } from "./elements/year_slider";
import { FloatingLabelInput } from "~/components/ui/floating-label-input";
import { cn } from "~/lib/utils";

// Type definitions
interface ListingDetails {
  propertyType?: string;
  propertySubtype?: string;
  propertyId?: number | string;
  formPosition?: number;
  builtSurfaceArea?: number | string;
  squareMeter?: number | string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  yearBuilt?: number | string;
  lastRenovationYear?: number | string;
  buildingFloors?: number | string;
  conservationStatus?: number;
}

interface GlobalFormData {
  listingDetails?: ListingDetails | null;
}

interface SecondPageProps {
  listingId?: string; // Made optional since it's unused
  globalFormData: GlobalFormData;
  onNext: () => void;
  onBack?: () => void;
  refreshListingDetails?: () => void;
}

// Form data interface for second page
interface SecondPageFormData {
  bedrooms: string;
  bathrooms: string;
  squareMeter: string;
  builtSurfaceArea: string;
  yearBuilt: string;
  lastRenovationYear: string;
  isRenovated: boolean;
  buildingFloors: string;
  conservationStatus: number;
}

const initialFormData: SecondPageFormData = {
  bedrooms: "2",
  bathrooms: "1",
  squareMeter: "80",
  builtSurfaceArea: "85",
  yearBuilt: "1980",
  lastRenovationYear: "",
  isRenovated: false,
  buildingFloors: "",
  conservationStatus: 1,
};

export default function SecondPage({
  globalFormData,
  onNext,
  onBack,
  refreshListingDetails,
}: SecondPageProps) {
  const [formData, setFormData] = useState<SecondPageFormData>(initialFormData);
  const [propertyType, setPropertyType] = useState<string>("");
  const [propertySubtype, setPropertySubtype] = useState<string>("");

  // Use centralized data instead of fetching
  useEffect(() => {
    if (globalFormData?.listingDetails) {
      const details = globalFormData.listingDetails;
      setPropertyType(details.propertyType ?? "");
      setPropertySubtype(details.propertySubtype ?? "");

      // Convert builtSurfaceArea from float to integer for display (similar to price in first.tsx)
      let displayBuiltSurfaceArea = "";
      if (details.builtSurfaceArea) {
        // If builtSurfaceArea is a float (e.g., 89.00), convert to integer
        const areaValue =
          typeof details.builtSurfaceArea === "number"
            ? details.builtSurfaceArea
            : parseFloat(details.builtSurfaceArea.toString());
        displayBuiltSurfaceArea = Math.floor(areaValue).toString();
      }

      // Convert squareMeter from float to integer for display (similar to price in first.tsx)
      let displaySquareMeter = "";
      if (details.squareMeter) {
        // If squareMeter is a float (e.g., 80.00), convert to integer
        const areaValue =
          typeof details.squareMeter === "number"
            ? details.squareMeter
            : parseFloat(details.squareMeter.toString());
        displaySquareMeter = Math.floor(areaValue).toString();
      }

      // Pre-populate form with existing data
      const isRenovated = Boolean(
        details.lastRenovationYear &&
          details.lastRenovationYear !== details.yearBuilt,
      );

      setFormData((prev) => ({
        ...prev,
        bedrooms: details.bedrooms?.toString() ?? "2",
        bathrooms: details.bathrooms?.toString() ?? "1",
        squareMeter: displaySquareMeter ?? "80",
        builtSurfaceArea: displayBuiltSurfaceArea ?? "85",
        yearBuilt: details.yearBuilt?.toString() ?? "1980",
        lastRenovationYear:
          details.lastRenovationYear?.toString() ?? (isRenovated ? "2015" : ""),
        isRenovated: isRenovated,
        buildingFloors: details.buildingFloors?.toString() ?? "",
        conservationStatus: details.conservationStatus ?? 1,
      }));
    }
  }, [globalFormData?.listingDetails]);

  const updateFormData = (
    field: keyof SecondPageFormData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEventInputChange =
    (field: keyof SecondPageFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateFormData(field, e.target.value);
    };

  // Custom handlers for FloatingLabelInput (string-based onChange)
  const handleSquareMeterStringChange = (value: string) => {
    const numericValue = formFormatters.getNumericArea(value);
    updateFormData("squareMeter", numericValue);
  };

  const handleBuiltSurfaceAreaStringChange = (value: string) => {
    const numericValue = formFormatters.getNumericArea(value);
    updateFormData("builtSurfaceArea", numericValue);
  };

  const handleNext = () => {
    // Validate required fields based on property type
    if (propertyType === "solar") {
      // For solar, only surface is required
      if (!formData.squareMeter.trim()) {
        alert("Por favor, introduce la superficie.");
        return;
      }
    } else if (propertyType === "garage") {
      // For garage, surface and year built are required
      if (!formData.squareMeter.trim()) {
        alert("Por favor, introduce las medidas.");
        return;
      }
      if (!formData.yearBuilt.trim()) {
        alert("Por favor, introduce el año de construcción.");
        return;
      }
    } else {
      // For other property types (piso, casa, local), validate all required fields
      if (!formData.bedrooms.trim()) {
        const fieldName =
          propertyType === "local" ? "espacios" : "habitaciones";
        alert(`Por favor, introduce el número de ${fieldName}.`);
        return;
      }

      if (!formData.bathrooms.trim()) {
        alert("Por favor, introduce el número de baños.");
        return;
      }

      if (!formData.squareMeter.trim()) {
        alert("Por favor, introduce la superficie.");
        return;
      }

      if (!formData.builtSurfaceArea.trim()) {
        alert("Por favor, introduce la superficie construida.");
        return;
      }

      if (!formData.yearBuilt.trim()) {
        alert("Por favor, introduce el año de construcción.");
        return;
      }
    }

    // Navigate IMMEDIATELY (optimistic) - no waiting!
    onNext();

    // Save data in background (completely silent)
    void saveInBackground();
  };

  // Background save function - completely silent and non-blocking
  const saveInBackground = async () => {
    try {
      // Fire and forget - no await, no blocking!
      if (globalFormData?.listingDetails?.propertyId) {
        const updateData: Record<string, unknown> = {
          squareMeter: Number(formData.squareMeter),
          propertySubtype: propertySubtype ?? null,
        };

        // Only update formPosition if current position is lower than 3
        const currentFormPosition =
          globalFormData?.listingDetails?.formPosition ?? 1;
        if (currentFormPosition < 3) {
          updateData.formPosition = 3;
        }

        // Only include fields that are relevant for the property type
        if (propertyType !== "solar") {
          updateData.yearBuilt = Number(formData.yearBuilt);
          updateData.bedrooms = Number(formData.bedrooms);
          updateData.bathrooms = Number(formData.bathrooms);
          updateData.builtSurfaceArea = formData.builtSurfaceArea
            ? Number(formData.builtSurfaceArea)
            : null;
          // Set renovation year to construction year if not renovated, otherwise use selected year
          updateData.lastRenovationYear = formData.isRenovated
            ? Number(formData.lastRenovationYear)
            : Number(formData.yearBuilt);
          updateData.buildingFloors = formData.buildingFloors
            ? Number(formData.buildingFloors)
            : undefined;
        }

        // Add conservation status for all property types
        updateData.conservationStatus = formData.conservationStatus;

        console.log("Saving second page data:", updateData); // Debug log

        await updateProperty(
          Number(globalFormData.listingDetails.propertyId),
          updateData,
        );
        console.log("Second page data saved successfully"); // Debug log
        // Refresh global data after successful save
        refreshListingDetails?.();
      } else {
        console.warn("No propertyId found in globalFormData.listingDetails"); // Debug log
      }
    } catch (error) {
      console.error("Error saving form data:", error);
      // Silent error - user doesn't know it failed
      // Could implement retry logic here if needed
    }
  };

  // Show loading only if globalFormData is not ready
  if (!globalFormData?.listingDetails) {
    return <FormSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Bedrooms and Bathrooms - Only show for piso, casa, local, garage */}
      {propertyType !== "solar" && propertyType !== "garage" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <RoomSelector
              type="bedrooms"
              value={Number(formData.bedrooms) || 0}
              onChange={(val) => updateFormData("bedrooms", val.toString())}
              label={propertyType === "local" ? "Espacios" : "Habitaciones"}
            />
          </div>

          <div className="space-y-2">
            <RoomSelector
              type="bathrooms"
              value={Number(formData.bathrooms) || 0}
              onChange={(val) => updateFormData("bathrooms", val.toString())}
              label="Baños"
            />
          </div>
        </div>
      )}

      {/* Square Meter - Show for all property types */}
      <div className="space-y-2">
        <FloatingLabelInput
          id="squareMeter"
          value={formFormatters.formatAreaInput(formData.squareMeter)}
          onChange={handleSquareMeterStringChange}
          placeholder={
            propertyType === "garage"
              ? "Medidas en metros cuadrados"
              : "Superficie útil"
          }
          type="text"
          className="h-10 placeholder:text-gray-400"
        />
      </div>

      {/* Built Surface Area - Only show for piso, casa, local */}
      {propertyType !== "solar" && propertyType !== "garage" && (
        <div className="space-y-2">
          <FloatingLabelInput
            id="builtSurfaceArea"
            value={formFormatters.formatAreaInput(formData.builtSurfaceArea)}
            onChange={handleBuiltSurfaceAreaStringChange}
            placeholder="Superficie construida"
            type="text"
            className="h-10 placeholder:text-gray-400"
          />
        </div>
      )}

      {/* Year Built - Show for all property types except solar */}
      {propertyType !== "solar" && (
        <div className="space-y-2">
          <YearSlider
            label="Año de Construcción"
            value={Number(formData.yearBuilt) || 1980}
            onChange={(val) => updateFormData("yearBuilt", val.toString())}
            min={1900}
            max={new Date().getFullYear()}
            placeholder="Año de construcción"
          />
        </div>
      )}

      {/* Renovation Question - Only show for piso, casa, local */}
      {propertyType !== "solar" && propertyType !== "garage" && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">¿Reformado?</h3>
          <div className="relative h-8 rounded-lg bg-gray-100 p-1">
            <motion.div
              className="absolute left-1 top-1 h-6 w-[calc(50%-2px)] rounded-md bg-white shadow-sm"
              animate={{
                x: formData.isRenovated ? "calc(100% - 5px)" : 0,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <div className="relative flex h-full">
              <button
                onClick={() => {
                  updateFormData("isRenovated", false);
                  // Clear renovation year when "No" is selected
                  updateFormData("lastRenovationYear", "");
                }}
                className={cn(
                  "relative z-10 flex-1 rounded-md text-xs font-medium transition-colors duration-200",
                  !formData.isRenovated ? "text-gray-900" : "text-gray-600",
                )}
              >
                No
              </button>
              <button
                onClick={() => {
                  updateFormData("isRenovated", true);
                  // Set default renovation year to 2015 when "Sí" is selected
                  if (!formData.lastRenovationYear) {
                    updateFormData("lastRenovationYear", "2015");
                  }
                }}
                className={cn(
                  "relative z-10 flex-1 rounded-md text-xs font-medium transition-colors duration-200",
                  formData.isRenovated ? "text-gray-900" : "text-gray-600",
                )}
              >
                Sí
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Last Renovation Year and Building Floors - Only show for piso, casa, local */}
      {propertyType !== "solar" && propertyType !== "garage" && (
        <>
          {formData.isRenovated && (
            <div className="space-y-2">
              <YearSlider
                label="Año de Última Reforma"
                value={Number(formData.lastRenovationYear) || 2015}
                onChange={(val) =>
                  updateFormData("lastRenovationYear", val.toString())
                }
                min={1900}
                max={new Date().getFullYear()}
                placeholder="Año de última reforma"
              />
            </div>
          )}

          {/* Conservation Status - Show for all property types */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">
              Estado de Conservación
            </h3>
            <div className="relative h-10 rounded-lg bg-gray-100 p-1">
              <motion.div
                className="absolute left-1 top-1 h-8 w-[calc(20%-2px)] rounded-md bg-white shadow-sm"
                animate={{
                  x:
                    formData.conservationStatus === 3
                      ? 0
                      : formData.conservationStatus === 6
                        ? "100%"
                        : formData.conservationStatus === 1
                          ? "200%"
                          : formData.conservationStatus === 2
                            ? "300%"
                            : "400%",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <div className="relative flex h-full">
                <button
                  onClick={() => updateFormData("conservationStatus", 3)}
                  className={cn(
                    "relative z-10 flex-1 rounded-md text-xs font-medium transition-colors duration-200",
                    formData.conservationStatus === 3
                      ? "text-gray-900"
                      : "text-gray-600",
                  )}
                >
                  Nuevo
                </button>
                <button
                  onClick={() => updateFormData("conservationStatus", 6)}
                  className={cn(
                    "relative z-10 flex-1 rounded-md text-xs font-medium transition-colors duration-200",
                    formData.conservationStatus === 6
                      ? "text-gray-900"
                      : "text-gray-600",
                  )}
                >
                  Reformado
                </button>
                <button
                  onClick={() => updateFormData("conservationStatus", 1)}
                  className={cn(
                    "relative z-10 flex-1 rounded-md text-xs font-medium transition-colors duration-200",
                    formData.conservationStatus === 1
                      ? "text-gray-900"
                      : "text-gray-600",
                  )}
                >
                  Bueno
                </button>
                <button
                  onClick={() => updateFormData("conservationStatus", 2)}
                  className={cn(
                    "relative z-10 flex-1 rounded-md text-xs font-medium transition-colors duration-200",
                    formData.conservationStatus === 2
                      ? "text-gray-900"
                      : "text-gray-600",
                  )}
                >
                  Regular
                </button>
                <button
                  onClick={() => updateFormData("conservationStatus", 4)}
                  className={cn(
                    "relative z-10 flex-1 rounded-md text-xs font-medium transition-colors duration-200",
                    formData.conservationStatus === 4
                      ? "text-gray-900"
                      : "text-gray-600",
                  )}
                >
                  Reformar
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="buildingFloors"
              className="text-xs font-medium text-gray-600"
            >
              Plantas del Edificio
            </label>
            <Input
              id="buildingFloors"
              value={formData.buildingFloors}
              onChange={handleEventInputChange("buildingFloors")}
              placeholder="Número de plantas"
              type="number"
              min="0"
              step="1"
              className="h-10 border-0 shadow-md placeholder:text-gray-400"
            />
          </div>
        </>
      )}

      {/* Save Error Notification */}
      {/* Removed saveError state and notification as per new_code */}

      {/* Navigation Buttons */}
      <motion.div
        className="flex justify-between border-t pt-4"
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
    </div>
  );
}
