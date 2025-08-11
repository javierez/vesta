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
import { Filter, X, Check, ChevronDown, Search, LayoutGrid, Kanban } from "lucide-react";
import { Input } from "~/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";

interface ProspectFilterProps {
  view: "kanban" | "list";
  onViewChange: () => void;
}

export function ProspectFilter({ view, onViewChange }: ProspectFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [prospectFilters, setProspectFilters] = useState({
    prospectType: [] as string[],
    listingType: [] as string[],
    status: [] as string[],
    urgencyLevel: [] as string[],
  });
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    prospectType: true,
    listingType: true,
    status: true,
    urgencyLevel: true,
  });

  // Initialize filters from URL on mount
  useEffect(() => {
    const prospectType = searchParams.get("prospectType");
    const listingType = searchParams.get("listingType");
    const status = searchParams.get("status");
    const urgencyLevel = searchParams.get("urgencyLevel");
    const q = searchParams.get("q");

    setProspectFilters({
      prospectType:
        prospectType && prospectType !== "all" ? prospectType.split(",") : [],
      listingType:
        listingType && listingType !== "all" ? listingType.split(",") : [],
      status: status ? status.split(",") : [],
      urgencyLevel: urgencyLevel ? urgencyLevel.split(",") : [],
    });
    setSearchQuery(q ?? "");
  }, [searchParams]);

  const updateUrlParams = (
    newFilters: typeof prospectFilters,
    newSearchQuery: string,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update search query
    if (newSearchQuery) {
      params.set("q", newSearchQuery);
    } else {
      params.delete("q");
    }

    // Update filters
    Object.entries(newFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(key, values.join(","));
      } else {
        params.delete(key);
      }
    });

    // Reset to first page when filters change
    params.set("page", "1");

    router.push(`/operaciones/prospects?${params.toString()}`);
  };

  const toggleFilter = (
    category: keyof typeof prospectFilters,
    value: string,
  ) => {
    const newFilters = {
      ...prospectFilters,
      [category]: prospectFilters[category].includes(value)
        ? prospectFilters[category].filter((v) => v !== value)
        : [...prospectFilters[category], value],
    };
    setProspectFilters(newFilters);
    updateUrlParams(newFilters, searchQuery);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const clearAllFilters = () => {
    const newFilters = {
      prospectType: [],
      listingType: [],
      status: [],
      urgencyLevel: [],
    };
    setProspectFilters(newFilters);
    setSearchQuery("");
    updateUrlParams(newFilters, "");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams(prospectFilters, searchQuery);
  };

  const activeFiltersCount = Object.values(prospectFilters).reduce(
    (acc, curr) => acc + curr.length,
    0,
  );

  const FilterOption = ({
    value,
    label,
    category,
  }: {
    value: string;
    label: string;
    category: keyof typeof prospectFilters;
  }) => {
    const isSelected = prospectFilters[category].includes(value);

    return (
      <div
        className="flex cursor-pointer items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent"
        onClick={() => toggleFilter(category, value)}
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
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <form
          onSubmit={handleSearchSubmit}
          className="relative max-w-sm flex-1"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar prospectos..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </form>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={view === "kanban" ? onViewChange : undefined}
          disabled={view === "list"}
          title={view === "kanban" ? "Ver como lista" : "Kanban no disponible"}
        >
          {view === "kanban" ? (
            <>
              <LayoutGrid className="mr-2 h-4 w-4" />
              Lista
            </>
          ) : (
            <>
              <Kanban className="mr-2 h-4 w-4" />
              Kanban
            </>
          )}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
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
              <ScrollArea className="h-[500px]">
                <div className="space-y-6 p-4">
                  <FilterCategory
                    title="Tipo de Prospecto"
                    category="prospectType"
                  >
                    <FilterOption
                      value="search"
                      label="Búsqueda"
                      category="prospectType"
                    />
                    <FilterOption
                      value="listing"
                      label="Venta/Alquiler"
                      category="prospectType"
                    />
                  </FilterCategory>

                  <FilterCategory
                    title="Tipo de Operación"
                    category="listingType"
                  >
                    <FilterOption
                      value="Sale"
                      label="Venta"
                      category="listingType"
                    />
                    <FilterOption
                      value="Rent"
                      label="Alquiler"
                      category="listingType"
                    />
                  </FilterCategory>

                  <FilterCategory title="Estado" category="status">
                    <FilterOption
                      value="Información básica"
                      label="Información básica"
                      category="status"
                    />
                    <FilterOption
                      value="En búsqueda"
                      label="En búsqueda"
                      category="status"
                    />
                    <FilterOption
                      value="Valoración"
                      label="Valoración"
                      category="status"
                    />
                    <FilterOption
                      value="Hoja de encargo"
                      label="Hoja de encargo"
                      category="status"
                    />
                  </FilterCategory>

                  <FilterCategory
                    title="Nivel de Urgencia"
                    category="urgencyLevel"
                  >
                    <FilterOption
                      value="1"
                      label="1 - Baja"
                      category="urgencyLevel"
                    />
                    <FilterOption
                      value="2"
                      label="2 - Media"
                      category="urgencyLevel"
                    />
                    <FilterOption
                      value="3"
                      label="3 - Media-Alta"
                      category="urgencyLevel"
                    />
                    <FilterOption
                      value="4"
                      label="4 - Alta"
                      category="urgencyLevel"
                    />
                    <FilterOption
                      value="5"
                      label="5 - Urgente"
                      category="urgencyLevel"
                    />
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
