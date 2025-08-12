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
import { Filter, X, Check, ChevronDown, Search, Building } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { useSearchParams } from "next/navigation";
import type { MatchFilters } from "~/types/connection-matches";

interface MatchFiltersProps {
  onFiltersChange?: (filters: MatchFilters) => void;
  className?: string;
}

export function MatchFilters({
  onFiltersChange,
  className,
}: MatchFiltersProps) {
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<MatchFilters>({
    accountScope: "current",
    includeNearStrict: true,
    propertyTypes: [],
    locationIds: [],
    minPrice: undefined,
    maxPrice: undefined,
  });

  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    accountScope: true,
    matchType: true,
    propertyType: true,
    location: false,
    priceRange: false,
  });

  // Initialize filters from URL on mount
  useEffect(() => {
    const accountScope = searchParams.get("accountScope") as
      | "current"
      | "cross-account"
      | "all"
      | null;
    const includeNearStrict = searchParams.get("includeNearStrict");
    const propertyTypes = searchParams.get("propertyTypes");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const q = searchParams.get("q");

    const newFilters: MatchFilters = {
      accountScope: accountScope ?? "current",
      includeNearStrict: includeNearStrict !== "false",
      propertyTypes: propertyTypes ? propertyTypes.split(",") : [],
      locationIds: [], // Will be populated from backend
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
    };

    setFilters(newFilters);
    setSearchQuery(q ?? "");
  }, [searchParams]);

  const handleFiltersChange = (newFilters: MatchFilters) => {
    console.log("🎛️ Filter change:", newFilters);
    setFilters(newFilters);
    // Don't update URL params immediately to avoid page re-renders
    // updateUrlParams(newFilters, searchQuery);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const clearAllFilters = () => {
    const newFilters: MatchFilters = {
      accountScope: "current",
      includeNearStrict: true,
      propertyTypes: [],
      locationIds: [],
      minPrice: undefined,
      maxPrice: undefined,
    };

    setFilters(newFilters);
    setSearchQuery("");
    // Don't update URL params to avoid page re-renders
    // updateUrlParams(newFilters, "");
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Don't update URL params to avoid page re-renders
    // updateUrlParams(filters, searchQuery);
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  };

  const activeFiltersCount =
    filters.propertyTypes.length +
    (filters.accountScope !== "current" ? 1 : 0) +
    (!filters.includeNearStrict ? 1 : 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0);

  const FilterOption = ({
    value: _value,
    label,
    isSelected,
    onToggle,
  }: {
    value: string;
    label: string;
    isSelected: boolean;
    onToggle: () => void;
  }) => {
    return (
      <div
        className="flex cursor-pointer items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent"
        onClick={onToggle}
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

  return (
    <div
      className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${className}`}
    >
      {/* Search */}
      <div className="flex flex-1 items-center space-x-2">
        <form
          onSubmit={handleSearchSubmit}
          className="relative max-w-sm flex-1"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar coincidencias..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </form>
      </div>

      {/* Quick Toggles */}
      <div className="flex items-center space-x-4">
        {/* Near-strict toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="near-strict"
            checked={filters.includeNearStrict}
            onCheckedChange={(checked) => {
              handleFiltersChange({ ...filters, includeNearStrict: checked });
            }}
          />
          <Label htmlFor="near-strict" className="text-sm">
            Incluir aproximadas
          </Label>
        </div>

        {/* Account scope selector */}
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <select
            value={filters.accountScope}
            onChange={(e) => {
              handleFiltersChange({
                ...filters,
                accountScope: e.target.value as
                  | "current"
                  | "cross-account"
                  | "all",
              });
            }}
            className="rounded border border-input bg-background px-2 py-1 text-sm"
          >
            <option value="current">Mi cuenta</option>
            <option value="cross-account">Otras cuentas</option>
            <option value="all">Todas las cuentas</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Popover */}
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="mr-2 h-4 w-4" />
              Filtros avanzados
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 rounded-sm px-1 font-normal"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex flex-col">
              <ScrollArea className="h-[400px]">
                <div className="space-y-6 p-4">
                  {/* Property Type */}
                  <FilterCategory
                    title="Tipo de Propiedad"
                    category="propertyType"
                  >
                    <FilterOption
                      value="piso"
                      label="Piso"
                      isSelected={filters.propertyTypes.includes("piso")}
                      onToggle={() => {
                        const newTypes = filters.propertyTypes.includes("piso")
                          ? filters.propertyTypes.filter((t) => t !== "piso")
                          : [...filters.propertyTypes, "piso"];
                        handleFiltersChange({
                          ...filters,
                          propertyTypes: newTypes,
                        });
                      }}
                    />
                    <FilterOption
                      value="casa"
                      label="Casa"
                      isSelected={filters.propertyTypes.includes("casa")}
                      onToggle={() => {
                        const newTypes = filters.propertyTypes.includes("casa")
                          ? filters.propertyTypes.filter((t) => t !== "casa")
                          : [...filters.propertyTypes, "casa"];
                        handleFiltersChange({
                          ...filters,
                          propertyTypes: newTypes,
                        });
                      }}
                    />
                    <FilterOption
                      value="local"
                      label="Local"
                      isSelected={filters.propertyTypes.includes("local")}
                      onToggle={() => {
                        const newTypes = filters.propertyTypes.includes("local")
                          ? filters.propertyTypes.filter((t) => t !== "local")
                          : [...filters.propertyTypes, "local"];
                        handleFiltersChange({
                          ...filters,
                          propertyTypes: newTypes,
                        });
                      }}
                    />
                    <FilterOption
                      value="garaje"
                      label="Garaje"
                      isSelected={filters.propertyTypes.includes("garaje")}
                      onToggle={() => {
                        const newTypes = filters.propertyTypes.includes(
                          "garaje",
                        )
                          ? filters.propertyTypes.filter((t) => t !== "garaje")
                          : [...filters.propertyTypes, "garaje"];
                        handleFiltersChange({
                          ...filters,
                          propertyTypes: newTypes,
                        });
                      }}
                    />
                  </FilterCategory>

                  {/* Price Range */}
                  <FilterCategory title="Rango de Precio" category="priceRange">
                    <div className="space-y-2">
                      <div>
                        <Label
                          htmlFor="minPrice"
                          className="text-xs text-muted-foreground"
                        >
                          Precio mínimo (€)
                        </Label>
                        <Input
                          id="minPrice"
                          type="number"
                          placeholder="0"
                          value={filters.minPrice ?? ""}
                          onChange={(e) => {
                            const value = e.target.value
                              ? parseInt(e.target.value)
                              : undefined;
                            handleFiltersChange({
                              ...filters,
                              minPrice: value,
                            });
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="maxPrice"
                          className="text-xs text-muted-foreground"
                        >
                          Precio máximo (€)
                        </Label>
                        <Input
                          id="maxPrice"
                          type="number"
                          placeholder="Sin límite"
                          value={filters.maxPrice ?? ""}
                          onChange={(e) => {
                            const value = e.target.value
                              ? parseInt(e.target.value)
                              : undefined;
                            handleFiltersChange({
                              ...filters,
                              maxPrice: value,
                            });
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </FilterCategory>
                </div>
              </ScrollArea>

              {(activeFiltersCount > 0 || searchQuery) && (
                <div className="border-t p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-7 w-full text-xs"
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
