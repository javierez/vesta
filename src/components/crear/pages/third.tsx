import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { FloatingLabelInput } from "~/components/ui/floating-label-input";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { retrieveCadastralData } from "~/server/cadastral/retrieve_cadastral";
import { toast } from "sonner";
// import FormSkeleton from "./form-skeleton"; // Removed - using single loading state
import { useFormContext } from "../form-context";
import { generatePropertyTitle } from "~/lib/property-title";


interface ThirdPageProps {
  listingId: string;
  onNext: () => void;
  onBack?: () => void;
  nextButtonText?: string;
}


export default function ThirdPage({
  onNext,
  onBack,
  nextButtonText = "Siguiente",
}: ThirdPageProps) {
  const { state, updateFormData } = useFormContext();
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [isCadastralLoading, setIsCadastralLoading] = useState(false);
  const searchParams = useSearchParams();
  const method = searchParams?.get("method");

  // Get current form data from context (following first.tsx pattern)
  const formData = {
    cadastralReference: state.formData.cadastralReference ?? "",
    address: state.formData.address ?? "",
    addressDetails: state.formData.addressDetails ?? "",
    postalCode: state.formData.postalCode ?? "",
    city: state.formData.city ?? "",
    province: state.formData.province ?? "",
    municipality: state.formData.municipality ?? "",
    neighborhood: state.formData.neighborhood ?? "",
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


  // Function to validate cadastral reference format
  const validateCadastralReference = (reference: string): boolean => {
    // Spanish cadastral reference format: 20 characters
    // Example: 1234567CS1234S0001AB
    const cadastralPattern = /^[0-9]{7}[A-Z]{2}[0-9]{4}[A-Z]{1}[0-9]{4}[A-Z]{2}$/;
    return cadastralPattern.test(reference.replace(/\s/g, ""));
  };

  // Function to handle cadastral lookup
  const handleCadastralLookup = async () => {
    const reference = formData.cadastralReference.trim();
    
    console.log("=== CADASTRAL LOOKUP INITIATED ===");
    console.log("Input Reference:", reference);
    console.log("Reference Length:", reference.length);
    console.log("Current Form State Before Lookup:", {
      address: formData.address,
      city: formData.city,
      province: formData.province,
      postalCode: formData.postalCode,
    });
    
    if (!reference) {
      console.warn("❌ Validation Failed: Empty cadastral reference");
      toast.error("Referencia catastral requerida", {
        description: "Por favor, introduce una referencia catastral válida",
      });
      return;
    }

    if (!validateCadastralReference(reference)) {
      console.warn("❌ Validation Failed: Invalid cadastral reference format");
      console.log("Expected Pattern: 1234567CS1234S0001AB (20 characters)");
      console.log("Received:", reference);
      toast.error("Formato inválido", {
        description: "La referencia catastral debe tener 20 caracteres (ej: 1234567CS1234S0001AB)",
      });
      return;
    }

    console.log("✅ Validation Passed: Cadastral reference format is valid");

    try {
      setIsCadastralLoading(true);
      console.log("🔄 Starting cadastral API lookup...");

      // Call the real Spanish Cadastre API
      console.log("📡 Querying Spanish Cadastre API for reference:", reference);
      console.log("API Endpoint: https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCallejero.svc/json/Consulta_DNPRC");
      
      const cadastralData = await retrieveCadastralData(reference);
      
      if (!cadastralData) {
        console.warn("❌ No cadastral data found for reference:", reference);
        toast.error("Referencia no encontrada", {
          description: "No se encontraron datos para esta referencia catastral. Verifica que sea correcta.",
        });
        return;
      }

      console.log("✅ Cadastral API Response Received Successfully!");
      console.log("📋 DETAILED CADASTRAL DATA:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🏠 PROPERTY IDENTIFICATION:");
      console.log("   Cadastral Reference:", reference);
      console.log("   Property Type:", cadastralData.propertyType);
      console.log("");
      console.log("📍 LOCATION DATA:");
      console.log("   Street:", cadastralData.street);
      console.log("   Address Details:", cadastralData.addressDetails);
      console.log("   Postal Code:", cadastralData.postalCode);
      console.log("   City:", cadastralData.city ?? "N/A");
      console.log("   Province:", cadastralData.province ?? "N/A");
      console.log("   Municipality:", cadastralData.municipality);
      console.log("   Neighborhood:", cadastralData.neighborhood);
      console.log("");
      console.log("🌍 GEOGRAPHIC COORDINATES:");
      console.log("   Latitude:", cadastralData.latitude ?? "N/A");
      console.log("   Longitude:", cadastralData.longitude ?? "N/A");
      console.log("");
      console.log("📐 PROPERTY DIMENSIONS:");
      console.log("   Total Surface:", cadastralData.squareMeter, "m²");
      console.log("   Built Surface:", cadastralData.builtSurfaceArea, "m²");
      console.log("   Year Built:", cadastralData.yearBuilt);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // Update all form data with cadastral information
      console.log("🔄 Updating Form Context with Cadastral Data...");
      
      const formUpdateData = {
        // Visible address fields
        address: cadastralData.street,
        addressDetails: cadastralData.addressDetails,
        postalCode: cadastralData.postalCode,
        city: cadastralData.city ?? "",
        province: cadastralData.province ?? "",
        municipality: cadastralData.municipality,
        neighborhood: cadastralData.neighborhood,
        
        // Hidden fields stored in context - mapped to form field names
        latitude: cadastralData.latitude ?? "",
        longitude: cadastralData.longitude ?? "",
        
        // Map cadastral fields to form field names used by other pages
        buildYear: cadastralData.yearBuilt,           // second page expects buildYear
        totalSurface: cadastralData.squareMeter,      // second page expects totalSurface  
        usefulSurface: cadastralData.builtSurfaceArea, // second page expects usefulSurface
        propertyType: cadastralData.propertyType,
      };
      
      console.log("📝 FORM UPDATE PAYLOAD:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("👁️  VISIBLE FIELDS (will appear in UI):");
      console.log("   address:", formUpdateData.address);
      console.log("   addressDetails:", formUpdateData.addressDetails);
      console.log("   postalCode:", formUpdateData.postalCode);
      console.log("   city:", formUpdateData.city);
      console.log("   province:", formUpdateData.province);
      console.log("   municipality:", formUpdateData.municipality);
      console.log("   neighborhood:", formUpdateData.neighborhood);
      console.log("");
      console.log("🔒 HIDDEN FIELDS (stored in context, mapped to form field names):");
      console.log("   latitude:", formUpdateData.latitude);
      console.log("   longitude:", formUpdateData.longitude);
      console.log("   buildYear:", formUpdateData.buildYear, "(mapped from yearBuilt)");
      console.log("   totalSurface:", formUpdateData.totalSurface, "(mapped from squareMeter)");
      console.log("   usefulSurface:", formUpdateData.usefulSurface, "(mapped from builtSurfaceArea)");
      console.log("   propertyType:", formUpdateData.propertyType);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      
      updateFormData(formUpdateData);
      console.log("✅ Form Context Updated Successfully");

      console.log("🎉 CADASTRAL LOOKUP COMPLETED SUCCESSFULLY!");
      console.log("💡 Note: Property title will be generated when clicking 'Siguiente'");
      console.log("=== END CADASTRAL LOOKUP ===");
      
      toast.success("Datos catastrales cargados", {
        description: "La información del inmueble se ha completado automáticamente",
        duration: 4000,
      });

    } catch (error) {
      console.error("❌ CADASTRAL LOOKUP FAILED!");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("🚨 Error Details:");
      console.error("   Reference:", reference);
      console.error("   Error Type:", error instanceof Error ? error.constructor.name : typeof error);
      console.error("   Error Message:", error instanceof Error ? error.message : String(error));
      console.error("   Stack Trace:", error instanceof Error ? error.stack : 'N/A');
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("=== END CADASTRAL LOOKUP (WITH ERROR) ===");
      toast.error("Error al consultar el catastro", {
        description: "No se pudo conectar con el servicio. Inténtalo de nuevo.",
      });
    } finally {
      console.log("🔄 Resetting loading state...");
      setIsCadastralLoading(false);
      console.log("✅ Loading state reset complete");
    }
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
      const generatedTitle = generatePropertyTitle(
        state.formData?.propertyType ?? "piso",
        updatedData.address ?? "",
        updatedData.neighborhood ?? ""
      );
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
    const generatedTitle = generatePropertyTitle(
      state.formData?.propertyType ?? "piso",
      formData.address ?? "",
      formData.neighborhood ?? ""
    );
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

      <div className="relative">
        <FloatingLabelInput
          id="cadastralReference"
          value={formData.cadastralReference}
          onChange={handleInputChange("cadastralReference")}
          placeholder="Referencia Catastral"
        />
        {formData.cadastralReference && (
          <button
            type="button"
            onClick={handleCadastralLookup}
            disabled={isCadastralLoading}
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            title="Conectar con Catastro"
          >
            <Image
              src="https://vesta-configuration-files.s3.amazonaws.com/logos/logo-catastro.png"
              alt="Catastro"
              width={16}
              height={16}
              className={`object-contain transition-opacity duration-200 ${isCadastralLoading ? 'opacity-50 animate-pulse' : 'opacity-100'}`}
            />
          </button>
        )}
      </div>
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
            <span>{nextButtonText}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
