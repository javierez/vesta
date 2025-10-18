"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
} from "~/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import {
  Filter,
  X,
  Check,
  ChevronDown,
  LayoutGrid,
  Table as TableIcon,
  Map as MapIcon,
  User,
} from "lucide-react";
import { PropertySearch } from "./property-search";
import { useRouter, useSearchParams } from "next/navigation";
import { TwoLevelLocationSelect } from "~/components/ui/two-level-location-select";

interface PropertyFilterProps {
  view: "grid" | "table" | "map";
  agents?: Array<{ id: string; name: string }>;
  cities?: string[];
  priceRange?: { minPrice: number; maxPrice: number };
  areaRange?: { minArea: number; maxArea: number };
}

export function PropertyFilter({
  view,
  agents = [],
  cities = [],
  priceRange = { minPrice: 50000, maxPrice: 1000000 },
  areaRange = { minArea: 20, maxArea: 500 },
}: PropertyFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyFilters, setPropertyFilters] = useState({
    status: [] as string[],
    type: [] as string[],
    city: "",
    neighborhood: "",
    minBedrooms: undefined as number | undefined,
    minBathrooms: undefined as number | undefined,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    minSquareMeter: undefined as number | undefined,
    maxSquareMeter: undefined as number | undefined,
  });
  const [agentFilters, setAgentFilters] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    status: true,
    type: true,
    agent: true,
    advanced: true,
  });
  const [priceSliderValues, setPriceSliderValues] = useState<number[]>([
    priceRange.minPrice,
    priceRange.maxPrice,
  ]);
  const [areaSliderValues, setAreaSliderValues] = useState<number[]>([
    areaRange.minArea,
    areaRange.maxArea,
  ]);
  const [isPriceSliderTouched, setIsPriceSliderTouched] = useState(false);
  const [isAreaSliderTouched, setIsAreaSliderTouched] = useState(false);

  // Initialize filters from URL on mount
  useEffect(() => {
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const agent = searchParams.get("agent");
    const q = searchParams.get("q");
    const city = searchParams.get("city");
    const neighborhood = searchParams.get("neighborhood");
    const minBedrooms = searchParams.get("minBedrooms");
    const minBathrooms = searchParams.get("minBathrooms");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minSize = searchParams.get("minSize");
    const maxSize = searchParams.get("maxSize");

    setPropertyFilters({
      // Default to showing 'En Venta' and 'En Alquiler' if no status filter in URL
      status: status ? status.split(",") : ["for-sale", "for-rent"],
      type: type ? type.split(",") : [],
      city: city ?? "",
      neighborhood: neighborhood ?? "",
      minBedrooms: minBedrooms ? parseInt(minBedrooms) : undefined,
      minBathrooms: minBathrooms ? parseInt(minBathrooms) : undefined,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      minSquareMeter: minSize ? parseInt(minSize) : undefined,
      maxSquareMeter: maxSize ? parseInt(maxSize) : undefined,
    });
    setAgentFilters(agent ? agent.split(",") : []);
    setSearchQuery(q ?? "");

    // Update slider values if they're in the URL
    if (minPrice || maxPrice) {
      setPriceSliderValues([
        minPrice ? parseInt(minPrice) : priceRange.minPrice,
        maxPrice ? parseInt(maxPrice) : priceRange.maxPrice,
      ]);
      setIsPriceSliderTouched(true);
    }
    if (minSize || maxSize) {
      setAreaSliderValues([
        minSize ? parseInt(minSize) : areaRange.minArea,
        maxSize ? parseInt(maxSize) : areaRange.maxArea,
      ]);
      setIsAreaSliderTouched(true);
    }
  }, [searchParams, priceRange, areaRange]);

  const updateUrlParams = (
    newPropertyFilters: typeof propertyFilters,
    newAgentFilters: string[],
    newSearchQuery: string,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update search query
    if (newSearchQuery) {
      params.set("q", newSearchQuery);
    } else {
      params.delete("q");
    }

    // Update status
    if (newPropertyFilters.status.length > 0) {
      params.set("status", newPropertyFilters.status.join(","));
    } else {
      params.delete("status");
    }

    // Update type
    if (newPropertyFilters.type.length > 0) {
      params.set("type", newPropertyFilters.type.join(","));
    } else {
      params.delete("type");
    }

    // Update agent
    if (newAgentFilters.length > 0) {
      params.set("agent", newAgentFilters.join(","));
    } else {
      params.delete("agent");
    }

    // Update city
    if (newPropertyFilters.city) {
      params.set("city", newPropertyFilters.city);
    } else {
      params.delete("city");
    }

    // Update neighborhood
    if (newPropertyFilters.neighborhood) {
      params.set("neighborhood", newPropertyFilters.neighborhood);
    } else {
      params.delete("neighborhood");
    }

    // Update bedrooms
    if (newPropertyFilters.minBedrooms !== undefined) {
      params.set("minBedrooms", newPropertyFilters.minBedrooms.toString());
    } else {
      params.delete("minBedrooms");
    }

    // Update bathrooms
    if (newPropertyFilters.minBathrooms !== undefined) {
      params.set("minBathrooms", newPropertyFilters.minBathrooms.toString());
    } else {
      params.delete("minBathrooms");
    }

    // Update price range (only if slider was touched)
    if (newPropertyFilters.minPrice !== undefined && isPriceSliderTouched) {
      params.set("minPrice", newPropertyFilters.minPrice.toString());
    } else {
      params.delete("minPrice");
    }
    if (newPropertyFilters.maxPrice !== undefined && isPriceSliderTouched) {
      params.set("maxPrice", newPropertyFilters.maxPrice.toString());
    } else {
      params.delete("maxPrice");
    }

    // Update area range (only if slider was touched)
    if (newPropertyFilters.minSquareMeter !== undefined && isAreaSliderTouched) {
      params.set("minSize", newPropertyFilters.minSquareMeter.toString());
    } else {
      params.delete("minSize");
    }
    if (newPropertyFilters.maxSquareMeter !== undefined && isAreaSliderTouched) {
      params.set("maxSize", newPropertyFilters.maxSquareMeter.toString());
    } else {
      params.delete("maxSize");
    }

    // Reset to first page when filters change
    params.set("page", "1");

    router.push(`/propiedades?${params.toString()}`);
  };

  const togglePropertyFilter = (
    category: "status" | "type",
    value: string,
  ) => {
    const currentValues = propertyFilters[category];
    const newFilters = {
      ...propertyFilters,
      [category]: currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value],
    };
    setPropertyFilters(newFilters);
    updateUrlParams(newFilters, agentFilters, searchQuery);
  };

  const toggleAgentFilter = (value: string) => {
    const newFilters = agentFilters.includes(value)
      ? agentFilters.filter((v) => v !== value)
      : [...agentFilters, value];
    setAgentFilters(newFilters);
    updateUrlParams(propertyFilters, newFilters, searchQuery);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const updateLocationFilter = (city: string, neighborhood: string) => {
    const newFilters = {
      ...propertyFilters,
      city,
      neighborhood,
    };
    setPropertyFilters(newFilters);
    updateUrlParams(newFilters, agentFilters, searchQuery);
  };

  const updateSelectFilter = (
    key: "minBedrooms" | "minBathrooms",
    value: string,
  ) => {
    const newFilters = {
      ...propertyFilters,
      [key]: value === "" ? undefined : parseInt(value),
    };
    setPropertyFilters(newFilters);
    updateUrlParams(newFilters, agentFilters, searchQuery);
  };

  const handlePriceSliderChange = (values: number[]) => {
    setPriceSliderValues(values);
    setIsPriceSliderTouched(true);
    const newFilters = {
      ...propertyFilters,
      minPrice: values[0],
      maxPrice: values[1],
    };
    setPropertyFilters(newFilters);
  };

  const handleAreaSliderChange = (values: number[]) => {
    setAreaSliderValues(values);
    setIsAreaSliderTouched(true);
    const newFilters = {
      ...propertyFilters,
      minSquareMeter: values[0],
      maxSquareMeter: values[1],
    };
    setPropertyFilters(newFilters);
  };

  const applySliderFilters = () => {
    updateUrlParams(propertyFilters, agentFilters, searchQuery);
  };

  const clearPropertyFilters = () => {
    const newFilters = {
      status: [],
      type: [],
      city: "",
      neighborhood: "",
      minBedrooms: undefined,
      minBathrooms: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minSquareMeter: undefined,
      maxSquareMeter: undefined,
    };
    setPropertyFilters(newFilters);
    setPriceSliderValues([priceRange.minPrice, priceRange.maxPrice]);
    setAreaSliderValues([areaRange.minArea, areaRange.maxArea]);
    setIsPriceSliderTouched(false);
    setIsAreaSliderTouched(false);
    updateUrlParams(newFilters, agentFilters, searchQuery);
  };

  const clearAgentFilters = () => {
    setAgentFilters([]);
    updateUrlParams(propertyFilters, [], searchQuery);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateUrlParams(propertyFilters, agentFilters, value);
  };

  // Format numbers consistently
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-ES").format(num);
  };

  // Check if current filters are the default ones
  const isDefaultStatusFilter =
    propertyFilters.status.length === 2 &&
    propertyFilters.status.includes("for-sale") &&
    propertyFilters.status.includes("for-rent") &&
    propertyFilters.type.length === 0;

  // Only count as active filters if they differ from defaults
  const activePropertyFiltersCount =
    (isDefaultStatusFilter ? 0 : propertyFilters.status.length + propertyFilters.type.length) +
    (propertyFilters.city ? 1 : 0) +
    (propertyFilters.neighborhood ? 1 : 0) +
    (propertyFilters.minBedrooms !== undefined ? 1 : 0) +
    (propertyFilters.minBathrooms !== undefined ? 1 : 0) +
    (isPriceSliderTouched ? 1 : 0) +
    (isAreaSliderTouched ? 1 : 0);

  const FilterOption = ({
    value,
    label,
    category,
    isAgent = false,
  }: {
    value: string;
    label: string;
    category?: "status" | "type";
    isAgent?: boolean;
  }) => {
    const isSelected = isAgent
      ? agentFilters.includes(value)
      : category ? propertyFilters[category].includes(value) : false;

    return (
      <div
        className="flex cursor-pointer items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent"
        onClick={() =>
          isAgent
            ? toggleAgentFilter(value)
            : category ? togglePropertyFilter(category, value) : undefined
        }
      >
        <div
          className={`flex h-4 w-4 items-center justify-center rounded border ${
            isSelected ? "border-primary bg-primary" : "border-input"
          }`}
        >
          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
        <span className={`text-sm ${isSelected ? "font-medium" : ""}`}>
          {label}
        </span>
      </div>
    );
  };

  const FilterCategory = ({
    title,
    category,
    children,
  }: {
    title: string;
    category: string;
    children: React.ReactNode;
  }) => (
    <div className="space-y-2">
      <div
        className="flex cursor-pointer items-center justify-between"
        onClick={() => toggleCategory(category)}
      >
        <h5 className="text-sm font-medium text-muted-foreground">{title}</h5>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            expandedCategories[category] ? "rotate-180 transform" : ""
          }`}
        />
      </div>
      {expandedCategories[category] && (
        <div className="space-y-1">{children}</div>
      )}
    </div>
  );

  const handleViewChange = (newView: "grid" | "table" | "map") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);
    router.push(`/propiedades?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <PropertySearch
            onSearchChange={handleSearchChange}
            onSearch={() =>
              updateUrlParams(propertyFilters, agentFilters, searchQuery)
            }
          />
        </div>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <User className="h-4 w-4" />
                {agentFilters.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -right-1 -top-1 rounded-sm px-1 font-normal"
                  >
                    {agentFilters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex flex-col">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-6 p-4">
                    <div className="space-y-1">
                      {agents.map((agent) => (
                        <FilterOption
                          key={agent.id.toString()}
                          value={agent.id.toString()}
                          label={agent.name}
                          isAgent={true}
                        />
                      ))}
                    </div>
                  </div>
                </ScrollArea>
                {agentFilters.length > 0 && (
                  <div className="border-t p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAgentFilters}
                      className="h-7 w-full text-xs"
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      Borrar filtros
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex items-center gap-1 rounded-md bg-white p-1 shadow">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => handleViewChange("grid")}
              title="Ver como cuadrícula"
              className="h-9 w-9"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "table" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => handleViewChange("table")}
              title="Ver como tabla"
              className="h-9 w-9"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "map" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => handleViewChange("map")}
              title="Ver mapa"
              className="h-9 w-9"
            >
              <MapIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            className="relative"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {activePropertyFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 rounded-sm px-1 font-normal"
              >
                {activePropertyFiltersCount}
              </Badge>
            )}
            <ChevronDown
              className={`ml-2 h-4 w-4 transition-transform ${
                isFiltersOpen ? "rotate-180 transform" : ""
              }`}
            />
          </Button>
        </div>
      </div>

      <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <CollapsibleContent className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            {/* Advanced Filters Section */}
            <div className="mb-6 space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Filtros de Búsqueda
              </h4>
              <div className="grid gap-4 md:grid-cols-4">
                {/* Location Filter */}
                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-medium">Ubicación</Label>
                  <TwoLevelLocationSelect
                    cities={cities}
                    selectedCity={propertyFilters.city}
                    selectedNeighborhood={propertyFilters.neighborhood}
                    onCityChange={(city) =>
                      updateLocationFilter(city, "")
                    }
                    onNeighborhoodChange={(neighborhood) =>
                      updateLocationFilter(propertyFilters.city, neighborhood)
                    }
                    cityPlaceholder="Todas las ciudades"
                    neighborhoodPlaceholder="Todos los barrios"
                  />
                </div>

                {/* Bedrooms Filter */}
                <div className="space-y-2">
                  <Label htmlFor="bedrooms" className="text-sm font-medium">
                    Habitaciones
                  </Label>
                  <Select
                    value={
                      propertyFilters.minBedrooms?.toString() ?? "any"
                    }
                    onValueChange={(value) =>
                      updateSelectFilter("minBedrooms", value === "any" ? "" : value)
                    }
                  >
                    <SelectTrigger id="bedrooms">
                      <SelectValue placeholder="Cualquiera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Cualquiera</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bathrooms Filter */}
                <div className="space-y-2">
                  <Label htmlFor="bathrooms" className="text-sm font-medium">
                    Baños
                  </Label>
                  <Select
                    value={
                      propertyFilters.minBathrooms?.toString() ?? "any"
                    }
                    onValueChange={(value) =>
                      updateSelectFilter("minBathrooms", value === "any" ? "" : value)
                    }
                  >
                    <SelectTrigger id="bathrooms">
                      <SelectValue placeholder="Cualquiera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Cualquiera</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Price Range Filter */}
                <div className="space-y-2">
                  <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <Label className="text-sm font-medium">Precio</Label>
                    <span className="text-xs text-muted-foreground text-center sm:text-right">
                      {formatNumber(priceSliderValues[0] ?? 0)}€ -{" "}
                      {formatNumber(priceSliderValues[1] ?? 0)}€
                    </span>
                  </div>
                  <Slider
                    value={priceSliderValues}
                    min={priceRange.minPrice}
                    max={priceRange.maxPrice}
                    step={10000}
                    onValueChange={handlePriceSliderChange}
                    onValueCommit={applySliderFilters}
                    className="py-4"
                  />
                </div>

                {/* Area Range Filter */}
                <div className="space-y-2">
                  <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <Label className="text-sm font-medium">Superficie</Label>
                    <span className="text-xs text-muted-foreground text-center sm:text-right">
                      {formatNumber(areaSliderValues[0] ?? 0)}m² -{" "}
                      {formatNumber(areaSliderValues[1] ?? 0)}m²
                    </span>
                  </div>
                  <Slider
                    value={areaSliderValues}
                    min={areaRange.minArea}
                    max={areaRange.maxArea}
                    step={10}
                    onValueChange={handleAreaSliderChange}
                    onValueCommit={applySliderFilters}
                    className="py-4"
                  />
                </div>
              </div>
            </div>

            {/* Existing Status/Type Filters */}
            <div className="grid gap-6 md:grid-cols-2 border-t pt-4">
              <FilterCategory title="Estado" category="status">
                <FilterOption
                  value="for-sale"
                  label="En Venta"
                  category="status"
                />
                <FilterOption
                  value="for-rent"
                  label="En Alquiler"
                  category="status"
                />
                <FilterOption
                  value="sold"
                  label="Vendido"
                  category="status"
                />
                <FilterOption
                  value="rented"
                  label="Alquilado"
                  category="status"
                />
                <FilterOption
                  value="discarded"
                  label="Descartado"
                  category="status"
                />
              </FilterCategory>

              <FilterCategory title="Tipo" category="type">
                <FilterOption value="piso" label="Piso" category="type" />
                <FilterOption value="casa" label="Casa" category="type" />
                <FilterOption value="local" label="Local" category="type" />
                <FilterOption value="solar" label="Solar" category="type" />
                <FilterOption
                  value="garaje"
                  label="Garaje"
                  category="type"
                />
              </FilterCategory>
            </div>

            {activePropertyFiltersCount > 0 && (
              <div className="mt-4 flex justify-end border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearPropertyFilters}
                  className="h-8"
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Borrar filtros
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
