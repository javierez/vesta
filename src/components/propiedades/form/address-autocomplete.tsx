"use client";

import { useEffect, useState } from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { Input } from "~/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { MapPin, Loader2 } from "lucide-react";
import { loadGoogleMapsApi } from "~/lib/google-maps-loader";
import { cn } from "~/lib/utils";

export interface AddressComponents {
  streetNumber: string;
  route: string;
  locality: string;
  administrativeAreaLevel1: string;
  administrativeAreaLevel2: string;
  postalCode: string;
  country: string;
  sublocality: string;
}

export interface LocationData {
  address: string;
  lat: number;
  lng: number;
  addressComponents: AddressComponents;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelected: (data: LocationData) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function AddressAutocomplete({
  value,
  onChange,
  onLocationSelected,
  placeholder = "Buscar dirección...",
  className,
  disabled = false,
}: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [isLoadingApi, setIsLoadingApi] = useState(true);

  // Load Google Maps API on component mount
  useEffect(() => {
    let mounted = true;

    loadGoogleMapsApi()
      .then(() => {
        if (mounted) {
          setIsApiLoaded(true);
          setIsLoadingApi(false);
          console.log("✅ Google Maps API loaded successfully");
        }
      })
      .catch((error) => {
        console.error("❌ Failed to load Google Maps API:", error);
        if (mounted) {
          setIsLoadingApi(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const {
    ready,
    value: inputValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    initOnMount: isApiLoaded, // Only initialize after API is loaded
    requestOptions: {
      componentRestrictions: { country: "es" }, // Restrict to Spain
      types: ["address"],
    },
    debounce: 300,
    cache: 24 * 60 * 60, // Cache for 24 hours
  });

  // Sync external value with internal state only when API is ready
  useEffect(() => {
    if (isApiLoaded && ready && value !== inputValue) {
      setValue(value, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const parseAddressComponents = (
    components: google.maps.GeocoderAddressComponent[],
  ): AddressComponents => {
    const addressData: AddressComponents = {
      streetNumber: "",
      route: "",
      locality: "",
      administrativeAreaLevel1: "",
      administrativeAreaLevel2: "",
      postalCode: "",
      country: "",
      sublocality: "",
    };

    for (const component of components) {
      const componentType = component.types[0];

      switch (componentType) {
        case "street_number":
          addressData.streetNumber = component.long_name;
          break;
        case "route":
          addressData.route = component.long_name;
          break;
        case "locality":
          addressData.locality = component.long_name;
          break;
        case "administrative_area_level_1":
          addressData.administrativeAreaLevel1 = component.long_name;
          break;
        case "administrative_area_level_2":
          addressData.administrativeAreaLevel2 = component.long_name;
          break;
        case "postal_code":
          addressData.postalCode = component.long_name;
          break;
        case "country":
          addressData.country = component.long_name;
          break;
        case "sublocality":
        case "sublocality_level_1":
        case "neighborhood":
          addressData.sublocality = component.long_name;
          break;
      }
    }

    return addressData;
  };

  const handleSelect =
    (suggestion: google.maps.places.AutocompletePrediction) => async () => {
      const selectedAddress = suggestion.description;
      setValue(selectedAddress, false);
      onChange(selectedAddress);
      setOpen(false);
      clearSuggestions();

      try {
        const results = await getGeocode({ address: selectedAddress });
        const { lat, lng } = await getLatLng(results[0]!);

        const locationData: LocationData = {
          address: selectedAddress,
          lat,
          lng,
          addressComponents: parseAddressComponents(
            results[0]!.address_components,
          ),
        };

        onLocationSelected(locationData);
      } catch (error) {
        console.error("Error getting geocode:", error);
      }
    };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Always allow typing by updating the parent onChange
    onChange(newValue);

    // Only use setValue if the API is loaded and ready
    if (isApiLoaded && ready) {
      setValue(newValue);
      if (newValue.length >= 3) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    }
  };

  const isInputDisabled = disabled;

  return (
    <Popover open={open && status === "OK"} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            type="text"
            value={value}
            onChange={handleInputChange}
            disabled={isInputDisabled}
            placeholder={
              isLoadingApi
                ? "Cargando Google Maps..."
                : isApiLoaded && ready
                  ? placeholder
                  : "Escribir dirección..."
            }
            className={cn("h-8 pr-8 text-gray-500", className)}
            onFocus={() => {
              if (value.length >= 3 && status === "OK" && isApiLoaded) {
                setOpen(true);
              }
            }}
          />
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
            {isLoadingApi ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <MapPin className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-[300px] overflow-y-auto">
          {status === "OK" && data.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">
              No se encontraron resultados
            </div>
          )}
          {status === "OK" &&
            data.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={handleSelect(suggestion)}
                className="flex w-full items-start gap-2 border-b p-3 text-left transition-colors last:border-b-0 hover:bg-accent"
              >
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate font-medium">
                    {suggestion.structured_formatting.main_text}
                  </span>
                  <span className="truncate text-sm text-muted-foreground">
                    {suggestion.structured_formatting.secondary_text}
                  </span>
                </div>
              </button>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
