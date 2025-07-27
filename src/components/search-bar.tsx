"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { buildSearchSlug, type SearchParams } from "~/lib/search-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface SearchBarProps {
  initialParams?: SearchParams;
}

export function SearchBar({ initialParams }: SearchBarProps) {
  const router = useRouter();

  // Initialize state with provided params or defaults
  const [searchMode, setSearchMode] = useState<"for-sale" | "for-rent">(
    (initialParams?.status as "for-sale" | "for-rent") ?? "for-sale",
  );
  const [location, setLocation] = useState(initialParams?.location ?? "");
  const [propertyType, setPropertyType] = useState<
    "any" | "piso" | "casa" | "local" | "solar" | "garaje"
  >(initialParams?.propertyType ?? "any");
  const [minPrice, setMinPrice] = useState<string>(
    initialParams?.minPrice ? initialParams.minPrice.toString() : "",
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    initialParams?.maxPrice ? initialParams.maxPrice.toString() : "",
  );
  const [bedrooms, setBedrooms] = useState<string>(
    initialParams?.bedrooms ?? "any",
  );
  const [bathrooms, setBathrooms] = useState<string>(
    initialParams?.bathrooms ?? "any",
  );
  const [province, setProvince] = useState<string>(
    initialParams?.province ?? "all",
  );
  const [municipality, setMunicipality] = useState<string>(
    initialParams?.municipality ?? "all",
  );
  const [minArea, setMinArea] = useState<string>(
    initialParams?.minArea ? initialParams.minArea.toString() : "",
  );
  const [maxArea, setMaxArea] = useState<string>(
    initialParams?.maxArea ? initialParams.maxArea.toString() : "",
  );

  // Update state when initialParams change
  useEffect(() => {
    if (initialParams) {
      if (initialParams.status)
        setSearchMode(initialParams.status as "for-sale" | "for-rent");
      if (initialParams.location) setLocation(initialParams.location);
      if (initialParams.propertyType)
        setPropertyType(initialParams.propertyType);
      if (initialParams.minPrice)
        setMinPrice(initialParams.minPrice.toString());
      if (initialParams.maxPrice)
        setMaxPrice(initialParams.maxPrice.toString());
      if (initialParams.bedrooms) setBedrooms(initialParams.bedrooms);
      if (initialParams.bathrooms) setBathrooms(initialParams.bathrooms);
      if (initialParams.minArea) setMinArea(initialParams.minArea.toString());
      if (initialParams.maxArea) setMaxArea(initialParams.maxArea.toString());
      if (initialParams.province) setProvince(initialParams.province);
      if (initialParams.municipality)
        setMunicipality(initialParams.municipality);
    }
  }, [initialParams]);

  // Handle search mode change
  const handleSearchModeChange = (value: string) => {
    const newMode = value === "comprar" ? "for-sale" : "for-rent";
    setSearchMode(newMode);

    // Auto-apply the filter
    const searchParams: SearchParams = {
      location,
      propertyType,
      bedrooms,
      bathrooms,
      minPrice: minPrice ? Number.parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? Number.parseInt(maxPrice) : undefined,
      minArea: minArea ? Number.parseInt(minArea) : undefined,
      maxArea: maxArea ? Number.parseInt(maxArea) : undefined,
      status: newMode,
      province,
      municipality,
    };

    const searchSlug = buildSearchSlug(searchParams);
    router.push(`/${searchSlug}`);
  };

  // Handle property type change
  const handlePropertyTypeChange = (
    value: "any" | "piso" | "casa" | "local" | "solar" | "garaje",
  ) => {
    setPropertyType(value);

    // Auto-apply the filter
    const searchParams: SearchParams = {
      location,
      propertyType: value,
      bedrooms,
      bathrooms,
      minPrice: minPrice ? Number.parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? Number.parseInt(maxPrice) : undefined,
      minArea: minArea ? Number.parseInt(minArea) : undefined,
      maxArea: maxArea ? Number.parseInt(maxArea) : undefined,
      status: searchMode,
      province,
      municipality,
    };

    const searchSlug = buildSearchSlug(searchParams);
    router.push(`/${searchSlug}`);
  };

  // Handle province change
  const handleProvinceChange = (value: string) => {
    setProvince(value);

    // Auto-apply the filter
    const searchParams: SearchParams = {
      location,
      propertyType,
      bedrooms,
      bathrooms,
      minPrice: minPrice ? Number.parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? Number.parseInt(maxPrice) : undefined,
      minArea: minArea ? Number.parseInt(minArea) : undefined,
      maxArea: maxArea ? Number.parseInt(maxArea) : undefined,
      status: searchMode,
      province: value,
      municipality,
    };

    const searchSlug = buildSearchSlug(searchParams);
    router.push(`/${searchSlug}`);
  };

  // Handle municipality change
  const handleMunicipalityChange = (value: string) => {
    setMunicipality(value);

    // Auto-apply the filter
    const searchParams: SearchParams = {
      location,
      propertyType,
      bedrooms,
      bathrooms,
      minPrice: minPrice ? Number.parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? Number.parseInt(maxPrice) : undefined,
      minArea: minArea ? Number.parseInt(minArea) : undefined,
      maxArea: maxArea ? Number.parseInt(maxArea) : undefined,
      status: searchMode,
      province,
      municipality: value,
    };

    const searchSlug = buildSearchSlug(searchParams);
    router.push(`/${searchSlug}`);
  };

  const handleSearch = () => {
    const searchParams: SearchParams = {
      location,
      propertyType,
      bedrooms,
      bathrooms,
      minPrice: minPrice ? Number.parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? Number.parseInt(maxPrice) : undefined,
      minArea: minArea ? Number.parseInt(minArea) : undefined,
      maxArea: maxArea ? Number.parseInt(maxArea) : undefined,
      status: searchMode,
      province,
      municipality,
    };

    const searchSlug = buildSearchSlug(searchParams);
    router.push(`/${searchSlug}`);
  };

  return (
    <div className="relative z-10 mx-auto -mt-8 w-full max-w-6xl rounded-lg bg-white p-6 shadow-lg">
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-5">
        <div>
          <Label htmlFor="operation">Operación</Label>
          <Select
            value={searchMode === "for-sale" ? "comprar" : "alquilar"}
            onValueChange={handleSearchModeChange}
          >
            <SelectTrigger id="operation">
              <SelectValue placeholder="Seleccionar operación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comprar">Comprar</SelectItem>
              <SelectItem value="alquilar">Alquilar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="property-type">Tipo inmueble</Label>
          <Select value={propertyType} onValueChange={handlePropertyTypeChange}>
            <SelectTrigger id="property-type">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Cualquier tipo</SelectItem>
              <SelectItem value="piso">Piso</SelectItem>
              <SelectItem value="casa">Casa</SelectItem>
              <SelectItem value="local">Local</SelectItem>
              {searchMode === "for-sale" && (
                <SelectItem value="solar">Solar</SelectItem>
              )}
              <SelectItem value="garaje">Garaje</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="province">Provincia</Label>
          <Select value={province} onValueChange={handleProvinceChange}>
            <SelectTrigger id="province">
              <SelectValue placeholder="Seleccionar provincia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las provincias</SelectItem>
              <SelectItem value="leon">León</SelectItem>
              <SelectItem value="madrid">Madrid</SelectItem>
              <SelectItem value="barcelona">Barcelona</SelectItem>
              <SelectItem value="valencia">Valencia</SelectItem>
              <SelectItem value="sevilla">Sevilla</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="municipality">Municipio</Label>
          <Select value={municipality} onValueChange={handleMunicipalityChange}>
            <SelectTrigger id="municipality">
              <SelectValue placeholder="Todos los municipios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los municipios</SelectItem>
              <SelectItem value="leon">León</SelectItem>
              <SelectItem value="ponferrada">Ponferrada</SelectItem>
              <SelectItem value="astorga">Astorga</SelectItem>
              <SelectItem value="bañeza">La Bañeza</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="zones">Zonas</Label>
          <Select defaultValue="all">
            <SelectTrigger id="zones">
              <SelectValue placeholder="Seleccionar Zonas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las zonas</SelectItem>
              <SelectItem value="centro">Centro</SelectItem>
              <SelectItem value="norte">Norte</SelectItem>
              <SelectItem value="sur">Sur</SelectItem>
              <SelectItem value="este">Este</SelectItem>
              <SelectItem value="oeste">Oeste</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Superficie</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Desde"
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
                min="0"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Hasta"
                value={maxArea}
                onChange={(e) => setMaxArea(e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>

        <div>
          <Label>
            {searchMode === "for-rent"
              ? "Precio de alquiler"
              : "Precio de venta"}
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Desde"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Hasta"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="link" className="text-sm">
          Más opciones de búsqueda
        </Button>
        <Button onClick={handleSearch} className="px-8">
          Buscar
        </Button>
      </div>
    </div>
  );
}
