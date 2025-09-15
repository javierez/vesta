import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { FloatingLabelInput } from "~/components/ui/floating-label-input";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
// import FormSkeleton from "./form-skeleton"; // Removed - using single loading state
import { useFormContext } from "../form-context";

interface ListingDetails {
  propertyId?: number;
  propertyType?: string;
  street?: string;
  addressDetails?: string;
  postalCode?: string;
  city?: string;
  province?: string;
  municipality?: string;
  neighborhood?: string;
}

interface ThirdPageProps {
  listingId: string;
  onNext: () => void;
  onBack?: () => void;
}


export default function ThirdPage({
  onNext,
  onBack,
}: ThirdPageProps) {
  const { state, updateFormData } = useFormContext();
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const searchParams = useSearchParams();
  const method = searchParams?.get("method");

  // Get current form data from context (following first.tsx pattern)
  const formData = {
    address: state.formData.address || "",
    addressDetails: state.formData.addressDetails || "",
    postalCode: state.formData.postalCode || "",
    city: state.formData.city || "",
    province: state.formData.province || "",
    municipality: state.formData.municipality || "",
    neighborhood: state.formData.neighborhood || "",
  };

  // Check if method is manual - if so, skip this page
  useEffect(() => {
    if (method === "manual") {
      // Skip this page and go directly to next
      onNext();
    }
  }, [method, onNext]);

  // No useEffect needed - data comes from form context

  // Update form data helper (following first.tsx pattern)
  const updateField = (field: string, value: string) => {
    updateFormData({ [field]: value });
  };

  const handleInputChange = (field: string) => (value: string) => {
    updateField(field, value);
  };

  // Function to get property type text (similar to property-characteristics-form.tsx)
  const getPropertyTypeText = (type: string) => {
    switch (type) {
      case "piso":
        return "Piso";
      case "casa":
        return "Casa";
      case "local":
        return "Local";
      case "solar":
        return "Solar";
      case "garaje":
        return "Garaje";
      default:
        return type;
    }
  };

  // Function to generate title (similar to property-characteristics-form.tsx)
  const generateTitle = () => {
    const type = getPropertyTypeText(
      state.formData?.propertyType ?? "piso",
    );
    const street = formData.address ?? "";
    const neighborhood = formData.neighborhood
      ? `(${formData.neighborhood})`
      : "";
    return `${type} en ${street} ${neighborhood}`.trim();
  };

  const autoCompleteAddress = async () => {
    if (!formData.address.trim()) {
      alert("Por favor, introduce al menos la dirección de la propiedad.");
      return;
    }

    try {
      setIsUpdatingAddress(true);

      // Use Nominatim to auto-complete missing fields
      const addressString = [formData.address.trim(), formData.city.trim()]
        .filter(Boolean)
        .join(", ");

      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1&countrycodes=es&addressdetails=1`;

      const response = await fetch(nominatimUrl);
      const nominatimResults = (await response.json()) as Array<{
        address?: {
          road?: string;
          house_number?: string;
          postcode?: string;
          city?: string;
          town?: string;
          state?: string;
          suburb?: string;
          quarter?: string;
        };
      }>;

      if (nominatimResults.length === 0) {
        alert(
          "No se pudo encontrar la dirección. Por favor, verifica que la dirección sea correcta.",
        );
        return;
      }

      const result = nominatimResults[0];
      if (!result) {
        alert(
          "No se pudo encontrar la dirección. Por favor, verifica que la dirección sea correcta.",
        );
        return;
      }

      console.log("Nominatim auto-completion successful:", result);

      // Update form context directly with auto-completed data (simplified)
      const updatedData = {
        address: result.address?.road ?? formData.address,
        addressDetails: result.address?.house_number ?? formData.addressDetails,
        postalCode: result.address?.postcode ?? formData.postalCode,
        city: result.address?.city ?? result.address?.town ?? formData.city,
        province: result.address?.state ?? formData.province,
        municipality: result.address?.city ?? result.address?.town ?? formData.municipality,
        neighborhood: result.address?.suburb ?? result.address?.quarter ?? formData.neighborhood,
      };
      
      updateFormData(updatedData);
      
      // Generate and save title after address is updated
      const type = getPropertyTypeText(state.formData?.propertyType ?? "piso");
      const street = updatedData.address ?? "";
      const neighborhood = updatedData.neighborhood ? `(${updatedData.neighborhood})` : "";
      const generatedTitle = `${type} en ${street} ${neighborhood}`.trim();
      updateFormData({ title: generatedTitle });

    } catch (error) {
      console.error("Error auto-completing address:", error);
      alert(
        "Error al autocompletar la dirección. Por favor, inténtalo de nuevo.",
      );
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  const handleNext = () => {
    // Validate required fields
    if (!formData.address.trim()) {
      alert("Por favor, introduce la calle.");
      return;
    }

    if (!formData.postalCode.trim()) {
      alert("Por favor, introduce el código postal.");
      return;
    }

    // Generate and save title before navigating
    const generatedTitle = generateTitle();
    updateFormData({ title: generatedTitle });

    // Navigate IMMEDIATELY - no saves, completely instant!
    onNext();
  };

  // No save function needed - using local state approach

  // If method is manual, don't render anything (page will be skipped)
  if (method === "manual") {
    return null;
  }

  // Show loading only if form state is not ready
  // Main form already handles loading state with spinner
  // No skeleton needed here

  return (
    <div className="space-y-4">
      <h2 className="text-md mb-4 font-medium text-gray-900">Dirección</h2>

      <FloatingLabelInput
        id="address"
        value={formData.address}
        onChange={handleInputChange("address")}
        placeholder="Dirección"
      />
      <FloatingLabelInput
        id="addressDetails"
        value={formData.addressDetails}
        onChange={handleInputChange("addressDetails")}
        placeholder="Piso, puerta, otro"
      />
      <FloatingLabelInput
        id="postalCode"
        value={formData.postalCode}
        onChange={handleInputChange("postalCode")}
        placeholder="Código Postal"
      />
      <FloatingLabelInput
        id="city"
        value={formData.city}
        onChange={handleInputChange("city")}
        placeholder="Ciudad"
      />
      <FloatingLabelInput
        id="province"
        value={formData.province}
        onChange={handleInputChange("province")}
        placeholder="Comunidad"
        disabled={true}
      />
      <FloatingLabelInput
        id="municipality"
        value={formData.municipality}
        onChange={handleInputChange("municipality")}
        placeholder="Municipio"
        disabled={true}
      />
      <FloatingLabelInput
        id="neighborhood"
        value={formData.neighborhood}
        onChange={handleInputChange("neighborhood")}
        placeholder="Barrio"
        disabled={true}
      />

      {/* Update Button */}
      <div className="flex justify-center pt-2">
        <Button
          onClick={autoCompleteAddress}
          disabled={isUpdatingAddress || !formData.address.trim()}
          variant="outline"
          className="flex items-center space-x-2"
        >
          {isUpdatingAddress ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Actualizando...</span>
            </>
          ) : (
            <>
              <span>Actualizar</span>
            </>
          )}
        </Button>
      </div>

      {/* No error handling needed in local state approach */}

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
