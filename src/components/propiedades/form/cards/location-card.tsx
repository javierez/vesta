
"use client";

import React, { useState } from "react";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { ChevronDown, Loader } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { ModernSaveIndicator } from "../common/modern-save-indicator";
import { AddressAutocomplete, type LocationData } from "../address-autocomplete";
import type { PropertyListing } from "~/types/property-listing";
import type { SaveState } from "~/types/save-state";

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
  setIsCatastroPopupOpen,
  getCardStyles,
}: LocationCardProps) {
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [streetValue, setStreetValue] = useState(listing.street ?? "");

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

  // Wrap the onSave function with logging
  const handleSave = async () => {
    console.log("💾 [LocationCard] Save button clicked!");
    console.log("📋 [LocationCard] Current form values before save:", {
      street: streetValue,
      addressDetails: (document.getElementById("addressDetails") as HTMLInputElement)?.value,
      postalCode: (document.getElementById("postalCode") as HTMLInputElement)?.value,
      neighborhood: (document.getElementById("neighborhood") as HTMLInputElement)?.value,
      city: city,
      province: province,
      municipality: municipality,
    });

    console.log("⏳ [LocationCard] Calling parent onSave function...");
    await onSave();
    console.log("✅ [LocationCard] Parent onSave function completed!");
  };

  // Handle Google Places autocomplete selection
  const handleLocationSelected = (data: LocationData) => {
    console.log("📍 [LocationCard] Google Places location selected:", data);

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

    const neighborhoodInput = document.getElementById("neighborhood") as HTMLInputElement;
    if (neighborhoodInput && data.addressComponents.sublocality) {
      neighborhoodInput.value = data.addressComponents.sublocality;
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

      const neighborhoodInput = document.getElementById("neighborhood") as HTMLInputElement;
      if (neighborhoodInput) {
        neighborhoodInput.value = result.address?.suburb ?? result.address?.quarter ?? "";
      }

      // Get the updated location values
      const updatedCity = result.address?.city ?? result.address?.town ?? city;
      const updatedProvince = result.address?.state ?? province;
      const updatedMunicipality = result.address?.city ?? result.address?.town ?? municipality;
      const updatedNeighborhood = result.address?.suburb ?? result.address?.quarter ?? "";

      // Update state variables for city, province, municipality
      setCity(updatedCity);
      setProvince(updatedProvince);
      setMunicipality(updatedMunicipality);

      // Log the auto-completed data
      console.log("📍 Auto-complete done! Fields populated:");
      console.log("   City:", updatedCity);
      console.log("   Province:", updatedProvince);
      console.log("   Municipality:", updatedMunicipality);
      console.log("   Neighborhood:", updatedNeighborhood);

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
          <AddressAutocomplete
            value={streetValue}
            onChange={(value) => {
              setStreetValue(value);
              onUpdateModule(true);
            }}
            onLocationSelected={handleLocationSelected}
            placeholder="Buscar dirección..."
          />
          {/* Hidden input to maintain compatibility with parent form's DOM reading */}
          <input
            type="hidden"
            id="street"
            value={streetValue}
            readOnly
          />
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
            <Input
              id="postalCode"
              defaultValue={listing.postalCode}
              className="h-8 text-gray-500"
              onChange={() => onUpdateModule(true)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="neighborhood" className="text-sm">
              Barrio
            </Label>
            <Input
              id="neighborhood"
              defaultValue={listing.neighborhood}
              className="h-8 bg-muted"
              disabled
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-sm">
              Ciudad
            </Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                onUpdateModule(true);
              }}
              className="h-8 text-gray-500"
            />
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
          <Input
            id="province"
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              onUpdateModule(true);
            }}
            className="h-8 text-gray-500"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cadastralReference" className="text-sm">
            Referencia Catastral
          </Label>
          <div className="flex gap-2">
            <Input
              id="cadastralReference"
              type="text"
              defaultValue={listing.cadastralReference}
              className="h-8 text-gray-500"
              onChange={() => onUpdateModule(true)}
            />
            {listing.cadastralReference && (
              <button
                onClick={() => setIsCatastroPopupOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <Image
                  src="https://vesta-configuration-files.s3.amazonaws.com/logos/logo-catastro.png"
                  alt="Catastro"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </button>
            )}
          </div>
        </div>

        {/* Actualizar Button */}
        <div className="flex justify-center pt-2">
          <Button
            onClick={autoCompleteAddress}
            disabled={isUpdatingAddress}
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
      </div>
    </Card>
  );
}