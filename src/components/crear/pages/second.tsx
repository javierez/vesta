import React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useFormContext } from "../form-context";
import { formFormatters } from "~/lib/utils";
// import FormSkeleton from "./form-skeleton"; // Removed - using single loading state
import { RoomSelector } from "./elements/room_selector";
import { YearSlider } from "./elements/year_slider";
import { FloatingLabelInput } from "~/components/ui/floating-label-input";
import { cn } from "~/lib/utils";


interface SecondPageProps {
  listingId?: string;
  onNext: () => void;
  onBack?: () => void;
}

// Removed SecondPageFormData interface - using direct global state reading like first.tsx

export default function SecondPage({
  onNext,
  onBack,
}: SecondPageProps) {
  const { state, updateFormData } = useFormContext();
  
  // Get current form data from context (direct reading like first.tsx)
  const formData = {
    bedrooms: state.formData.bedrooms ?? 2,
    bathrooms: state.formData.bathrooms ?? 1,
    totalSurface: state.formData.totalSurface ?? 0,
    usefulSurface: state.formData.usefulSurface ?? 0,
    buildYear: state.formData.buildYear ?? 1980,
    renovationYear: state.formData.renovationYear ?? 0,
    isRenovated: state.formData.isRenovated ?? false,
    totalFloors: state.formData.totalFloors ?? 0,
    conservationStatus: state.formData.conservationStatus ?? 3,
  };

  const propertyType = state.formData?.propertyType ?? "";

  // No useEffect needed - data comes from form context

  // Update form data helper (direct like first.tsx)
  const updateField = (
    field: keyof typeof formData,
    value: string | number | boolean,
  ) => {
    updateFormData({ [field]: value });
  };

  const handleEventInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateField(field, parseInt(e.target.value) || 0);
    };

  // Custom handlers for FloatingLabelInput (string-based onChange)
  const handleTotalSurfaceChange = (value: string) => {
    const numericValue = formFormatters.getNumericArea(value);
    updateField("totalSurface", parseInt(numericValue) || 0);
  };

  const handleUsefulSurfaceChange = (value: string) => {
    const numericValue = formFormatters.getNumericArea(value);
    updateField("usefulSurface", parseInt(numericValue) || 0);
  };

  const handleNext = () => {
    // Validate required fields based on property type
    if (propertyType === "solar") {
      // For solar, only surface is required
      if (!formData.totalSurface || formData.totalSurface === 0) {
        alert("Por favor, introduce la superficie.");
        return;
      }
    } else if (propertyType === "garage") {
      // For garage, surface and year built are required
      if (!formData.totalSurface || formData.totalSurface === 0) {
        alert("Por favor, introduce las medidas.");
        return;
      }
      if (!formData.buildYear || formData.buildYear === 0) {
        alert("Por favor, introduce el año de construcción.");
        return;
      }
    } else {
      // For other property types (piso, casa, local), validate all required fields
      if (!formData.bedrooms || formData.bedrooms === 0) {
        const fieldName =
          propertyType === "local" ? "espacios" : "habitaciones";
        alert(`Por favor, introduce el número de ${fieldName}.`);
        return;
      }

      if (!formData.bathrooms || formData.bathrooms === 0) {
        alert("Por favor, introduce el número de baños.");
        return;
      }

      if (!formData.totalSurface || formData.totalSurface === 0) {
        alert("Por favor, introduce la superficie.");
        return;
      }

      // Superficie construida is now optional - users can enter any value or leave it empty

      if (!formData.buildYear || formData.buildYear === 0) {
        alert("Por favor, introduce el año de construcción.");
        return;
      }
    }

    // Navigate immediately - no saves, completely instant!
    onNext();
  };

  // Main form already handles loading state with spinner
  // No skeleton needed here

  return (
    <div className="space-y-6">
      {/* Bedrooms and Bathrooms - Only show for piso, casa, local, garage */}
      {propertyType !== "solar" && propertyType !== "garage" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <RoomSelector
              type="bedrooms"
              value={formData.bedrooms}
              onChange={(val) => updateField("bedrooms", val)}
              label={propertyType === "local" ? "Espacios" : "Habitaciones"}
            />
          </div>

          <div className="space-y-2">
            <RoomSelector
              type="bathrooms"
              value={formData.bathrooms}
              onChange={(val) => updateField("bathrooms", val)}
              label="Baños"
            />
          </div>
        </div>
      )}

      {/* Superficie útil - Show for all property types */}
      <div className="space-y-2">
        <FloatingLabelInput
          id="totalSurface"
          value={formData.totalSurface ? formFormatters.formatAreaInput(formData.totalSurface.toString()) : ""}
          onChange={handleTotalSurfaceChange}
          placeholder={
            propertyType === "garage"
              ? "Medidas en metros cuadrados"
              : "Superficie útil (m²)"
          }
          type="text"
          className="h-10 placeholder:text-gray-400"
        />
      </div>

      {/* Superficie construida - Only show for piso, casa, local */}
      {propertyType !== "solar" && propertyType !== "garage" && (
        <div className="space-y-2">
          <FloatingLabelInput
            id="usefulSurface"
            value={formData.usefulSurface ? formFormatters.formatAreaInput(formData.usefulSurface.toString()) : ""}
            onChange={handleUsefulSurfaceChange}
            placeholder="Superficie construida (m²)"
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
            value={formData.buildYear}
            onChange={(val) => updateField("buildYear", val)}
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
                  updateField("isRenovated", false);
                  // Clear renovation year when "No" is selected
                  updateField("renovationYear", 0);
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
                  updateField("isRenovated", true);
                  // Set default renovation year to 2015 when "Sí" is selected
                  if (!formData.renovationYear || formData.renovationYear === 0) {
                    updateField("renovationYear", 2015);
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
                value={formData.renovationYear || 2015}
                onChange={(val) => updateField("renovationYear", val)}
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
                  onClick={() => updateField("conservationStatus", 3)}
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
                  onClick={() => updateField("conservationStatus", 6)}
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
                  onClick={() => updateField("conservationStatus", 1)}
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
                  onClick={() => updateField("conservationStatus", 2)}
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
                  onClick={() => updateField("conservationStatus", 4)}
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
              htmlFor="totalFloors"
              className="text-xs font-medium text-gray-600"
            >
              Plantas del Edificio
            </label>
            <Input
              id="totalFloors"
              value={formData.totalFloors?.toString() || ""}
              onChange={handleEventInputChange("totalFloors")}
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
