
"use client";

import React, { useState } from "react";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { ChevronDown, Loader, Search, AlertTriangle, CheckCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { ModernSaveIndicator } from "../common/modern-save-indicator";
import { AddressAutocomplete, type LocationData } from "../address-autocomplete";
import { CadastralSelectionModal } from "../cadastral-selection-modal";
import type { PropertyListing } from "~/types/property-listing";
import type { SaveState } from "~/types/save-state";
import { getNeighborhoodFromCoordinates } from "~/server/googlemaps/retrieve_geo";
import {
  retrieveCadastralData,
  searchCadastralByCoordinates,
  compareCadastralData,
  type CadastralComparisonResult,
  type CadastralSearchResult
} from "~/server/cadastral/retrieve_cadastral";

interface LocationCardProps {
  listing: PropertyListing;
  city: string;
  province: string;
  municipality: string;
  collapsedSections: Record<string, boolean>;
  saveState: SaveState;
  onToggleSection: (section: string) => void;
  onSave: () => Promise<void>;
  onUpdateModule: (hasChanges: boolean) => void;
  setCity: (value: string) => void;
  setProvince: (value: string) => void;
  setMunicipality: (value: string) => void;
  setIsMapsPopupOpen: (value: boolean) => void;
  setIsCatastroPopupOpen: (value: boolean) => void;
  getCardStyles: (moduleName: string) => string;
}

export function LocationCard({
  listing,
  city,
  province,
  municipality,
  collapsedSections,
  saveState,
  onToggleSection,
  onSave,
  onUpdateModule,
  setCity,
  setProvince,
  setMunicipality,
  setIsMapsPopupOpen,
  setIsCatastroPopupOpen: _setIsCatastroPopupOpen,
  getCardStyles,
}: LocationCardProps) {
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [streetValue, setStreetValue] = useState(listing.street ?? "");
  const [neighborhoodValue, setNeighborhoodValue] = useState(listing.neighborhood ?? "");

  // Coordinate state for cadastral search (obtained from Google Maps or Nominatim autocomplete, or loaded from database)
  const [latitude, setLatitude] = useState<number | null>(
    listing.latitude ? parseFloat(listing.latitude) : null
  );
  const [longitude, setLongitude] = useState<number | null>(
    listing.longitude ? parseFloat(listing.longitude) : null
  );

  // Cadastral validation state
  const [cadastralDiscrepancies, setCadastralDiscrepancies] = useState<CadastralComparisonResult | null>(null);
  const [cadastralValidationStatus, setCadastralValidationStatus] = useState<'none' | 'validating' | 'valid' | 'invalid'>('none');

  // Helper to get discrepancy for a specific field
  const getFieldDiscrepancy = (fieldName: string) => {
    return cadastralDiscrepancies?.differences.find(diff => diff.field === fieldName);
  };
  
  // Cadastral search state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [potentialReferences, setPotentialReferences] = useState<CadastralSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCadastralLoading, setIsCadastralLoading] = useState(false);
  
  // Controlled state for cadastral reference input
  const [cadastralReferenceValue, setCadastralReferenceValue] = useState(listing.cadastralReference ?? "");

  // Log component load/render data
  console.log("🏠 [LocationCard] Component loaded with data:", {
    street: listing.street,
    addressDetails: listing.addressDetails,
    postalCode: listing.postalCode,
    neighborhoodId: listing.neighborhoodId,
    neighborhood: listing.neighborhood,
    city: city,
    province: province,
    municipality: municipality,
  });

  // Handle cadastral reference button click (copied from third.tsx)
  const handleCadastralLookup = async () => {
    const reference = cadastralReferenceValue.trim();
    
    // Check if we have all key info (street, city, postal code)
    const postalCodeValue = (document.getElementById("postalCode") as HTMLInputElement)?.value || "";
    const hasKeyInfo = streetValue.trim() && city.trim() && postalCodeValue.trim();
    
    if (hasKeyInfo) {
      // If we have all key info, do comparison
      await validateCadastralReference(reference);
    } else {
      // If missing key info, fill up the values
      await fillCadastralData(reference);
    }
  };

  // Validate cadastral reference against current form data
  const validateCadastralReference = async (cadastralRef: string) => {
    console.log("🔍 [LocationCard] ========================================");
    console.log("🔍 [LocationCard] STARTING CADASTRAL VALIDATION");
    console.log("🔍 [LocationCard] ========================================");
    console.log("📋 [LocationCard] Input cadastral reference:", cadastralRef);

    if (!cadastralRef.trim()) {
      console.log("⚠️ [LocationCard] Empty cadastral reference, clearing validation");
      setCadastralDiscrepancies(null);
      setCadastralValidationStatus('none');
      return;
    }

    setIsCadastralLoading(true);
    setCadastralValidationStatus('validating');

    try {
      // Get current form data
      const currentData = {
        street: streetValue,
        postalCode: (document.getElementById("postalCode") as HTMLInputElement)?.value || "",
        city: city,
        province: province,
      };

      console.log("📋 [LocationCard] Current form data to compare:", currentData);

      // Fetch official cadastral data
      console.log("📡 [LocationCard] Calling retrieveCadastralData...");
      const cadastralData = await retrieveCadastralData(cadastralRef);
      
      if (!cadastralData) {
        console.log("❌ [LocationCard] No cadastral data found for reference");
        setCadastralValidationStatus('invalid');
        setCadastralDiscrepancies(null);
        return;
      }

      console.log("📊 [LocationCard] Retrieved cadastral data:", cadastralData);

      // Compare data
      console.log("🔍 [LocationCard] Calling compareCadastralData...");
      const comparison = await compareCadastralData(currentData, cadastralData);
      
      console.log("📊 [LocationCard] Comparison result:", comparison);
      
      setCadastralDiscrepancies(comparison);
      setCadastralValidationStatus(comparison.hasDiscrepancies ? 'invalid' : 'valid');

      console.log("✅ [LocationCard] ========================================");
      console.log("✅ [LocationCard] VALIDATION COMPLETED SUCCESSFULLY");
      console.log("✅ [LocationCard] ========================================");
      console.log("✅ [LocationCard] Final validation status:", comparison.hasDiscrepancies ? 'invalid' : 'valid');
    } catch (error) {
      console.error("❌ [LocationCard] ========================================");
      console.error("❌ [LocationCard] VALIDATION FAILED WITH ERROR");
      console.error("❌ [LocationCard] ========================================");
      console.error("❌ [LocationCard] Validation error:", error);
      setCadastralValidationStatus('invalid');
      setCadastralDiscrepancies(null);
    } finally {
      setIsCadastralLoading(false);
    }
  };

  // Fill missing cadastral data
  const fillCadastralData = async (cadastralRef: string) => {
    console.log("🔍 [LocationCard] ========================================");
    console.log("🔍 [LocationCard] STARTING CADASTRAL FILL DATA");
    console.log("🔍 [LocationCard] ========================================");
    console.log("📋 [LocationCard] Input cadastral reference:", cadastralRef);

    if (!cadastralRef.trim()) {
      console.log("⚠️ [LocationCard] Empty cadastral reference");
      toast.error("Referencia catastral requerida");
      return;
    }

    setIsCadastralLoading(true);

    try {
      console.log("📡 [LocationCard] Calling retrieveCadastralData...");
      const cadastralData = await retrieveCadastralData(cadastralRef);
      
      if (!cadastralData) {
        console.log("❌ [LocationCard] No cadastral data found for reference");
        toast.error("Referencia no encontrada", {
          description: "No se encontraron datos para esta referencia catastral. Verifica que sea correcta.",
        });
        return;
      }

      console.log("📊 [LocationCard] Retrieved cadastral data:", cadastralData);

      // Update form fields with cadastral data
      setStreetValue(cadastralData.street);
      setNeighborhoodValue(cadastralData.neighborhood);
      
      // Update other fields
      const postalCodeInput = document.getElementById("postalCode") as HTMLInputElement;
      if (postalCodeInput) {
        postalCodeInput.value = cadastralData.postalCode;
      }

      // Update city, province, municipality
      if (cadastralData.city) setCity(cadastralData.city);
      if (cadastralData.province) setProvince(cadastralData.province);
      if (cadastralData.municipality) setMunicipality(cadastralData.municipality);

      // Mark as having changes
      onUpdateModule(true);

      console.log("✅ [LocationCard] ========================================");
      console.log("✅ [LocationCard] FILL DATA COMPLETED SUCCESSFULLY");
      console.log("✅ [LocationCard] ========================================");
      
      toast.success("Datos catastrales cargados", {
        description: "La información del inmueble se ha completado automáticamente",
      });

    } catch (error) {
      console.error("❌ [LocationCard] ========================================");
      console.error("❌ [LocationCard] FILL DATA FAILED WITH ERROR");
      console.error("❌ [LocationCard] ========================================");
      console.error("❌ [LocationCard] Fill error:", error);
      toast.error("Error al consultar el catastro", {
        description: "No se pudo conectar con el servicio. Inténtalo de nuevo.",
      });
    } finally {
      setIsCadastralLoading(false);
    }
  };

  // Search for cadastral references by coordinates
  const searchCadastralReferences = async () => {
    console.log("🔍 [LocationCard] ========================================");
    console.log("🔍 [LocationCard] STARTING CADASTRAL SEARCH");
    console.log("🔍 [LocationCard] ========================================");

    console.log("📋 [LocationCard] Current coordinates for search:", {
      latitude,
      longitude,
    });

    // Check if we have coordinates
    if (latitude === null || longitude === null) {
      console.log("⚠️ [LocationCard] Missing coordinates for search");
      toast.error("Por favor, usa el autocompletado de Google Maps o Nominatim para obtener coordenadas precisas.");
      return;
    }

    setIsSearching(true);
    setIsSearchModalOpen(true);

    try {
      const searchParams = {
        latitude,
        longitude,
      };

      console.log("📡 [LocationCard] Calling searchCadastralByCoordinates with params:", searchParams);

      const results = await searchCadastralByCoordinates(searchParams);

      console.log("📊 [LocationCard] Search results received:", results);
      setPotentialReferences(results);

      console.log("✅ [LocationCard] ========================================");
      console.log("✅ [LocationCard] SEARCH COMPLETED SUCCESSFULLY");
      console.log("✅ [LocationCard] ========================================");
      console.log(`✅ [LocationCard] Found ${results.length} cadastral references`);

      if (results.length === 0) {
        toast.info("No se encontraron referencias catastrales en estas coordenadas.", {
          description: "El Catastro no encontró propiedades en un radio de 50 metros.",
        });
      }
    } catch (error) {
      console.error("❌ [LocationCard] ========================================");
      console.error("❌ [LocationCard] SEARCH FAILED WITH ERROR");
      console.error("❌ [LocationCard] ========================================");
      console.error("❌ [LocationCard] Search error:", error);
      toast.error("Error al buscar referencias catastrales. Inténtalo de nuevo.");
      setPotentialReferences([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle cadastral reference selection from modal
  const handleCadastralReferenceSelect = (selectedRef: CadastralSearchResult) => {
    console.log("✅ [LocationCard] Selected cadastral reference:", selectedRef);

    // Update cadastral reference state
    setCadastralReferenceValue(selectedRef.cadastralReference);

    // Update cadastral reference field
    const cadastralInput = document.getElementById("cadastralReference") as HTMLInputElement;
    if (cadastralInput) {
      cadastralInput.value = selectedRef.cadastralReference;
    }

    // Update other fields with selected data
    setStreetValue(selectedRef.street);
    setNeighborhoodValue(selectedRef.addressDetails);

    // Update postal code
    const postalCodeInput = document.getElementById("postalCode") as HTMLInputElement;
    if (postalCodeInput && selectedRef.postalCode) {
      postalCodeInput.value = selectedRef.postalCode;
    }

    // Update city, province, municipality if available
    if (selectedRef.city) setCity(selectedRef.city);
    if (selectedRef.province) setProvince(selectedRef.province);
    if (selectedRef.municipality) setMunicipality(selectedRef.municipality);

    // Mark as having changes
    onUpdateModule(true);

    // Close modal
    setIsSearchModalOpen(false);

    toast.success("Referencia catastral seleccionada y campos actualizados.");
  };

  // Apply suggestion for a specific field
  const applyFieldSuggestion = (fieldName: string, suggestedValue: string) => {
    console.log(`✅ [LocationCard] Applying suggestion for ${fieldName}:`, suggestedValue);

    switch (fieldName) {
      case 'street':
        setStreetValue(suggestedValue);
        break;
      case 'postalCode':
        const postalInput = document.getElementById("postalCode") as HTMLInputElement;
        if (postalInput) postalInput.value = suggestedValue;
        break;
      case 'city':
        setCity(suggestedValue);
        break;
      case 'province':
        setProvince(suggestedValue);
        break;
    }

    // Remove the applied discrepancy from the list
    if (cadastralDiscrepancies) {
      const remainingDifferences = cadastralDiscrepancies.differences.filter(
        diff => diff.field !== fieldName
      );

      if (remainingDifferences.length === 0) {
        // All discrepancies resolved
        setCadastralDiscrepancies(null);
        setCadastralValidationStatus('valid');
      } else {
        // Update with remaining discrepancies
        setCadastralDiscrepancies({
          hasDiscrepancies: true,
          differences: remainingDifferences,
        });
      }
    }

    // Mark as having changes
    onUpdateModule(true);

    toast.success("Sugerencia aplicada correctamente.");
  };

  // Wrap the onSave function with logging
  const handleSave = async () => {
    console.log("💾 [LocationCard] Save button clicked!");
    console.log("📋 [LocationCard] Current form values before save:", {
      street: streetValue,
      addressDetails: (document.getElementById("addressDetails") as HTMLInputElement)?.value,
      postalCode: (document.getElementById("postalCode") as HTMLInputElement)?.value,
      neighborhood: neighborhoodValue,
      city: city,
      province: province,
      municipality: municipality,
    });

    console.log("⏳ [LocationCard] Calling parent onSave function...");
    await onSave();
    console.log("✅ [LocationCard] Parent onSave function completed!");
  };

  // Handle Google Places autocomplete selection
  const handleLocationSelected = async (data: LocationData) => {
    console.log("📍 [LocationCard] Google Places location selected:", data);

    // Store coordinates for cadastral search
    setLatitude(data.lat);
    setLongitude(data.lng);
    console.log("📍 [LocationCard] Coordinates stored:", { lat: data.lat, lng: data.lng });

    // Parse the street with number from address components
    const streetWithNumber = data.addressComponents.streetNumber && data.addressComponents.route
      ? `${data.addressComponents.route} ${data.addressComponents.streetNumber}`
      : data.addressComponents.route || streetValue;

    // Update street value state
    setStreetValue(streetWithNumber);

    // Update form fields
    const postalCodeInput = document.getElementById("postalCode") as HTMLInputElement;
    if (postalCodeInput && data.addressComponents.postalCode) {
      postalCodeInput.value = data.addressComponents.postalCode;
    }

    // Update neighborhood value from Google Maps if available, otherwise fetch from Nominatim
    if (data.addressComponents.sublocality) {
      setNeighborhoodValue(data.addressComponents.sublocality);
    } else {
      // Fetch neighborhood from Nominatim using coordinates
      console.log("🔄 [LocationCard] Fetching neighborhood from Nominatim...");
      const neighborhood = await getNeighborhoodFromCoordinates(data.lat, data.lng);
      if (neighborhood) {
        console.log("✅ [LocationCard] Neighborhood from Nominatim:", neighborhood);
        setNeighborhoodValue(neighborhood);
      } else {
        console.log("⚠️ [LocationCard] No neighborhood found from Nominatim");
      }
    }

    // Update state variables for city, province, municipality
    if (data.addressComponents.locality) {
      setCity(data.addressComponents.locality);
    }
    if (data.addressComponents.administrativeAreaLevel1) {
      setProvince(data.addressComponents.administrativeAreaLevel1);
    }
    if (data.addressComponents.administrativeAreaLevel2 || data.addressComponents.locality) {
      setMunicipality(data.addressComponents.administrativeAreaLevel2 || data.addressComponents.locality);
    }

    // Mark the module as having changes
    onUpdateModule(true);

    toast.success("Dirección autocompletada. Guarda para aplicar los cambios.");
  };

  const autoCompleteAddress = async () => {
    // Get current street value from the input
    const addressDetailsInput = document.getElementById("addressDetails") as HTMLInputElement;
    const currentStreetValue = streetValue.trim();

    if (!currentStreetValue) {
      alert("Por favor, introduce al menos la dirección de la propiedad.");
      return;
    }

    try {
      setIsUpdatingAddress(true);

      // Parse the address to separate street+number from details
      const addressRegex = /^(.+?)(\d+)(.*)$/;
      const addressMatch = addressRegex.exec(currentStreetValue);

      let streetWithNumber = currentStreetValue;
      let parsedDetails = addressDetailsInput?.value ?? "";
      let searchAddress = currentStreetValue;

      if (addressMatch?.[1] && addressMatch[2]) {
        const streetName = addressMatch[1].trim();    // "Calle Gran Vía"
        const streetNumber = addressMatch[2];         // "123"
        const detailsPart = addressMatch[3]?.trim() ?? "";   // ", 4º B" or "4º B"

        streetWithNumber = `${streetName} ${streetNumber}`;
        searchAddress = streetWithNumber;

        // Clean up separators from details (remove leading commas, slashes, dashes, spaces)
        if (detailsPart) {
          parsedDetails = detailsPart.replace(/^[,\s\-\/]+/, "").trim();
        }
      }

      // Use Nominatim to auto-complete missing fields
      const addressString = [searchAddress, city.trim()]
        .filter(Boolean)
        .join(", ");

      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1&countrycodes=es&addressdetails=1&accept-language=es`;

      const response = await fetch(nominatimUrl);
      const nominatimResults = (await response.json()) as Array<{
        lat?: string;
        lon?: string;
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

      // Store coordinates from Nominatim for cadastral search
      if (result.lat && result.lon) {
        const parsedLat = parseFloat(result.lat);
        const parsedLon = parseFloat(result.lon);
        setLatitude(parsedLat);
        setLongitude(parsedLon);
        console.log("📍 [LocationCard] Coordinates from Nominatim stored:", { lat: parsedLat, lng: parsedLon });
      }

      // Update street value state
      setStreetValue(streetWithNumber);

      // Update form fields with auto-completed data
      if (addressDetailsInput) {
        addressDetailsInput.value = parsedDetails;
      }

      const postalCodeInput = document.getElementById("postalCode") as HTMLInputElement;
      if (postalCodeInput && result.address?.postcode) {
        postalCodeInput.value = result.address.postcode;
      }

      // Update neighborhood value
      const updatedNeighborhood = result.address?.suburb ?? result.address?.quarter ?? "";
      setNeighborhoodValue(updatedNeighborhood);

      // Get the updated location values
      const updatedCity = result.address?.city ?? result.address?.town ?? city;
      const updatedProvince = result.address?.state ?? province;
      const updatedMunicipality = result.address?.city ?? result.address?.town ?? municipality;

      // Update state variables for city, province, municipality
      setCity(updatedCity);
      setProvince(updatedProvince);
      setMunicipality(updatedMunicipality);

      // Log the auto-completed data
      console.log("📍 Auto-complete done! Fields populated:");
      console.log("   City:", updatedCity);
      console.log("   Province:", updatedProvince);
      console.log("   Municipality:", updatedMunicipality);
      console.log("   Neighborhood:", neighborhoodValue);

      // Mark the module as having changes so the save will trigger
      onUpdateModule(true);

      toast.success("Campos autocompletados. Guarda para aplicar los cambios.");

    } catch (error) {
      console.error("Error auto-completing address:", error);
      alert(
        "Error al autocompletar la dirección. Por favor, inténtalo de nuevo.",
      );
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  return (
    <Card
      className={cn(
        "relative p-4 transition-all duration-500 ease-out",
        getCardStyles("location"),
      )}
    >
      <ModernSaveIndicator
        state={saveState}
        onSave={handleSave}
      />
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onToggleSection("location")}
          className="group flex flex-1 items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
              DIRECCIÓN DEL INMUEBLE
            </h3>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsMapsPopupOpen(true);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              <Image
                src="https://vesta-configuration-files.s3.amazonaws.com/logos/googlemapsicon.png"
                alt="Google Maps"
                width={14}
                height={14}
                className="object-contain"
              />
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              collapsedSections.location && "rotate-180",
            )}
          />
        </button>
      </div>
      <div
        className={cn(
          "space-y-3 overflow-hidden transition-all duration-200",
          collapsedSections.location ? "max-h-0" : "max-h-[2000px]",
        )}
      >
        <div className="space-y-1.5">
          <Label htmlFor="street" className="text-sm">
            Calle
          </Label>
          <div className="relative">
            <AddressAutocomplete
              value={streetValue}
              onChange={(value) => {
                setStreetValue(value);
                onUpdateModule(true);
              }}
              onLocationSelected={handleLocationSelected}
              placeholder="Buscar dirección..."
            />
            {getFieldDiscrepancy('street') && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
            )}
          </div>
          {/* Hidden input to maintain compatibility with parent form's DOM reading */}
          <input
            type="hidden"
            id="street"
            value={streetValue}
            readOnly
          />
          {/* Field-level warning */}
          {getFieldDiscrepancy('street') && (
            <div className="flex items-center gap-2 rounded bg-amber-50/50 px-2 py-1 text-xs border border-amber-200/50">
              <span className="flex-1 text-amber-900">
                <span className="font-medium">{getFieldDiscrepancy('street')!.suggested}</span>
              </span>
              <button
                type="button"
                className="text-[10px] px-1.5 py-0.5 rounded border border-amber-400/50 bg-white hover:bg-amber-50 text-amber-700 transition-colors"
                onClick={() => applyFieldSuggestion('street', getFieldDiscrepancy('street')!.suggested)}
              >
                Aplicar
              </button>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="addressDetails" className="text-sm">
            Detalles de la dirección
          </Label>
          <Input
            id="addressDetails"
            defaultValue={listing.addressDetails}
            className="h-8 text-gray-500"
            placeholder="Piso, puerta, escalera, etc."
            onChange={() => onUpdateModule(true)}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="postalCode" className="text-sm">
              Código Postal
            </Label>
            <div className="relative">
              <Input
                id="postalCode"
                defaultValue={listing.postalCode}
                className={cn(
                  "h-8 text-gray-500",
                  getFieldDiscrepancy('postalCode') && "border-amber-500 focus:border-amber-500 pr-8"
                )}
                onChange={() => onUpdateModule(true)}
              />
              {getFieldDiscrepancy('postalCode') && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
              )}
            </div>
            {/* Field-level warning */}
            {getFieldDiscrepancy('postalCode') && (
              <div className="flex items-center gap-2 rounded bg-amber-50/50 px-2 py-1 text-xs border border-amber-200/50">
                <span className="flex-1 text-amber-900">
                  <span className="font-medium">{getFieldDiscrepancy('postalCode')!.suggested}</span>
                </span>
                <button
                  type="button"
                  className="text-[10px] px-1.5 py-0.5 rounded border border-amber-400/50 bg-white hover:bg-amber-50 text-amber-700 transition-colors"
                  onClick={() => applyFieldSuggestion('postalCode', getFieldDiscrepancy('postalCode')!.suggested)}
                >
                  Aplicar
                </button>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="neighborhood" className="text-sm">
              Barrio
            </Label>
            <div className="relative">
              <Input
                id="neighborhood"
                value={neighborhoodValue}
                onChange={(e) => {
                  setNeighborhoodValue(e.target.value);
                  onUpdateModule(true);
                }}
                className="h-8 text-gray-500 pr-10"
              />
              <button
                type="button"
                onClick={autoCompleteAddress}
                disabled={isUpdatingAddress}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingAddress ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-sm">
              Ciudad
            </Label>
            <div className="relative">
              <Input
                id="city"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  onUpdateModule(true);
                }}
                className={cn(
                  "h-8 text-gray-500",
                  getFieldDiscrepancy('city') && "border-amber-500 focus:border-amber-500 pr-8"
                )}
              />
              {getFieldDiscrepancy('city') && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
              )}
            </div>
            {/* Field-level warning */}
            {getFieldDiscrepancy('city') && (
              <div className="flex items-center gap-2 rounded bg-amber-50/50 px-2 py-1 text-xs border border-amber-200/50">
                <span className="flex-1 text-amber-900">
                  <span className="font-medium">{getFieldDiscrepancy('city')!.suggested}</span>
                </span>
                <button
                  type="button"
                  className="text-[10px] px-1.5 py-0.5 rounded border border-amber-400/50 bg-white hover:bg-amber-50 text-amber-700 transition-colors"
                  onClick={() => applyFieldSuggestion('city', getFieldDiscrepancy('city')!.suggested)}
                >
                  Aplicar
                </button>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="municipality" className="text-sm">
              Municipio
            </Label>
            <Input
              id="municipality"
              value={municipality}
              onChange={(e) => {
                setMunicipality(e.target.value);
                onUpdateModule(true);
              }}
              className="h-8 text-gray-500"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="province" className="text-sm">
            Provincia
          </Label>
          <div className="relative">
            <Input
              id="province"
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                onUpdateModule(true);
              }}
              className={cn(
                "h-8 text-gray-500",
                getFieldDiscrepancy('province') && "border-amber-500 focus:border-amber-500 pr-8"
              )}
            />
            {getFieldDiscrepancy('province') && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
            )}
          </div>
          {/* Field-level warning */}
          {getFieldDiscrepancy('province') && (
            <div className="flex items-center gap-2 rounded bg-amber-50/50 px-2 py-1 text-xs border border-amber-200/50">
              <span className="flex-1 text-amber-900">
                <span className="font-medium">{getFieldDiscrepancy('province')!.suggested}</span>
              </span>
              <button
                type="button"
                className="text-[10px] px-1.5 py-0.5 rounded border border-amber-400/50 bg-white hover:bg-amber-50 text-amber-700 transition-colors"
                onClick={() => applyFieldSuggestion('province', getFieldDiscrepancy('province')!.suggested)}
              >
                Aplicar
              </button>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cadastralReference" className="text-sm">
            Referencia Catastral
          </Label>
          <div className="relative">
            <Input
              id="cadastralReference"
              type="text"
              value={cadastralReferenceValue}
              onChange={(e) => {
                setCadastralReferenceValue(e.target.value);
                onUpdateModule(true);
              }}
              className={cn(
                "h-8 text-gray-500 pr-20",
                cadastralValidationStatus === 'invalid' && cadastralDiscrepancies && "border-amber-500 focus:border-amber-500",
                cadastralValidationStatus === 'valid' && "border-green-500 focus:border-green-500"
              )}
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (value) {
                  void validateCadastralReference(value);
                } else {
                  setCadastralDiscrepancies(null);
                  setCadastralValidationStatus('none');
                }
              }}
            />

            {/* Loading spinner centered in input */}
            {cadastralValidationStatus === 'validating' && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
                <Loader className="h-5 w-5 animate-spin text-blue-500" />
              </div>
            )}

            {/* Success indicator */}
            {cadastralValidationStatus === 'valid' && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            )}

            {/* Conditional button: Search (lupa) when empty and has coordinates, Catastro logo when filled */}
            {!cadastralReferenceValue.trim() && latitude !== null && longitude !== null ? (
              /* Search button for cadastral references (when field is empty but has coordinates) */
              <button
                type="button"
                onClick={searchCadastralReferences}
                disabled={isSearching}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                title="Buscar referencias catastrales por coordenadas"
              >
                {isSearching ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button>
            ) : cadastralReferenceValue.trim() ? (
              /* Catastro icon button for direct lookup (when field has content) */
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
            ) : null}
          </div>

        </div>

        {/* Hidden input fields for coordinates */}
        <input
          type="hidden"
          id="latitude"
          value={latitude ?? ""}
          readOnly
        />
        <input
          type="hidden"
          id="longitude"
          value={longitude ?? ""}
          readOnly
        />

      </div>

      {/* Cadastral Selection Modal */}
      <CadastralSelectionModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        searchResults={potentialReferences}
        isLoading={isSearching}
        onSelect={handleCadastralReferenceSelect}
      />
    </Card>
  );
}