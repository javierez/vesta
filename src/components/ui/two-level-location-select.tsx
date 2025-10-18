"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { getNeighborhoodsByCity } from "~/server/queries/locations";

export interface CityOption {
  city: string;
  neighborhoods: Array<{
    neighborhoodId: bigint;
    neighborhood: string;
    municipality: string;
    province: string;
  }>;
}

interface TwoLevelLocationSelectProps {
  cities: string[];
  selectedCity: string;
  selectedNeighborhood: string;
  onCityChange: (city: string) => void;
  onNeighborhoodChange: (neighborhood: string) => void;
  cityPlaceholder?: string;
  neighborhoodPlaceholder?: string;
}

export function TwoLevelLocationSelect({
  cities,
  selectedCity,
  selectedNeighborhood,
  onCityChange,
  onNeighborhoodChange,
  cityPlaceholder = "Selecciona ciudad...",
  neighborhoodPlaceholder = "Selecciona barrio...",
}: TwoLevelLocationSelectProps) {
  const [neighborhoods, setNeighborhoods] = useState<
    Array<{
      neighborhoodId: bigint;
      neighborhood: string;
      municipality: string;
      province: string;
    }>
  >([]);
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(false);

  // Load neighborhoods when city changes
  useEffect(() => {
    async function loadNeighborhoods() {
      if (!selectedCity) {
        setNeighborhoods([]);
        return;
      }

      setIsLoadingNeighborhoods(true);
      try {
        const data = await getNeighborhoodsByCity(selectedCity);
        setNeighborhoods(data);
      } catch (error) {
        console.error("Error loading neighborhoods:", error);
        setNeighborhoods([]);
      } finally {
        setIsLoadingNeighborhoods(false);
      }
    }

    void loadNeighborhoods();
  }, [selectedCity]);

  const handleCityChange = (city: string) => {
    onCityChange(city);
    // Reset neighborhood when city changes
    onNeighborhoodChange("");
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* City Select */}
      <Select value={selectedCity || "all"} onValueChange={(value) => handleCityChange(value === "all" ? "" : value)}>
        <SelectTrigger>
          <SelectValue placeholder={cityPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las ciudades</SelectItem>
          {cities.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Neighborhood Select */}
      <Select
        value={selectedNeighborhood || "all"}
        onValueChange={(value) => onNeighborhoodChange(value === "all" ? "" : value)}
        disabled={!selectedCity || isLoadingNeighborhoods}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={
              isLoadingNeighborhoods
                ? "Cargando..."
                : !selectedCity
                  ? "Primero selecciona ciudad"
                  : neighborhoodPlaceholder
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los barrios</SelectItem>
          {neighborhoods.map((n) => (
            <SelectItem key={n.neighborhoodId.toString()} value={n.neighborhood}>
              {n.neighborhood}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
