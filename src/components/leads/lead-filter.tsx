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
  Filter,
  Check,
  ChevronDown,
  Search,
  LayoutGrid,
  List,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { LEAD_STATUSES } from "~/lib/constants/lead-statuses";

interface LeadFilterProps {
  view: "kanban" | "list";
  onViewChange: () => void;
}

export function LeadFilter({ view, onViewChange }: LeadFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [leadFilters, setLeadFilters] = useState({
    status: [] as string[],
    source: [] as string[],
  });
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    status: true,
    source: true,
  });

  // Lead sources available in the system
  const leadSources = [
    "Appointment",
    "Web form",
    "Manual",
    "Phone call",
    "Email",
    "Referral",
  ];

  // Initialize filters from URL on mount
  useEffect(() => {
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const q = searchParams.get("search");

    setLeadFilters({
      status: status ? status.split(",") : [],
      source: source ? source.split(",") : [],
    });
    setSearchQuery(q ?? "");
  }, [searchParams]);

  const updateUrlParams = (
    newFilters: typeof leadFilters,
    newSearchQuery: string,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update search query
    if (newSearchQuery) {
      params.set("search", newSearchQuery);
    } else {
      params.delete("search");
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

    router.push(`/operaciones/leads?${params.toString()}`);
  };

  const toggleFilter = (category: keyof typeof leadFilters, value: string) => {
    const newFilters = {
      ...leadFilters,
      [category]: leadFilters[category].includes(value)
        ? leadFilters[category].filter((v) => v !== value)
        : [...leadFilters[category], value],
    };
    setLeadFilters(newFilters);
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
      status: [],
      source: [],
    };
    setLeadFilters(newFilters);
    setSearchQuery("");
    updateUrlParams(newFilters, "");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams(leadFilters, searchQuery);
  };

  const activeFiltersCount = Object.values(leadFilters).reduce(
    (acc, curr) => acc + curr.length,
    0,
  );

  const FilterOption = ({
    value: _value,
    label,
    isSelected,
    onClick,
  }: {
    value: string;
    label: string;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <div
      className="flex cursor-pointer items-center space-x-2 rounded-md px-2 py-1.5 hover:bg-gray-50"
      onClick={onClick}
    >
      <div className="flex h-4 w-4 items-center">
        {isSelected && <Check className="h-3 w-3 text-blue-600" />}
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      {/* Search and filters */}
      <div className="flex flex-1 items-center space-x-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="max-w-md flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por contacto, propiedad..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
        </form>

        {/* Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <ScrollArea className="h-96">
              <div className="space-y-4 p-2">
                {/* Clear all */}
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filtros</h4>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-auto p-0 text-xs"
                    >
                      Limpiar todo
                    </Button>
                  )}
                </div>

                {/* Status Filter */}
                <div>
                  <button
                    onClick={() => toggleCategory("status")}
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-gray-50"
                  >
                    <span className="text-sm font-medium">Estado</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedCategories.status ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedCategories.status && (
                    <div className="ml-2 mt-2 space-y-1">
                      {LEAD_STATUSES.map((status) => (
                        <FilterOption
                          key={status}
                          value={status}
                          label={status}
                          isSelected={leadFilters.status.includes(status)}
                          onClick={() => toggleFilter("status", status)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Source Filter */}
                <div>
                  <button
                    onClick={() => toggleCategory("source")}
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-gray-50"
                  >
                    <span className="text-sm font-medium">Fuente</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedCategories.source ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedCategories.source && (
                    <div className="ml-2 mt-2 space-y-1">
                      {leadSources.map((source) => (
                        <FilterOption
                          key={source}
                          value={source}
                          label={source}
                          isSelected={leadFilters.source.includes(source)}
                          onClick={() => toggleFilter("source", source)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      {/* View toggle */}
      <div className="flex items-center space-x-2">
        <Button
          variant={view === "list" ? "default" : "outline"}
          size="sm"
          onClick={onViewChange}
          className="flex items-center"
        >
          <List className="mr-2 h-4 w-4" />
          Lista
        </Button>
        <Button
          variant={view === "kanban" ? "default" : "outline"}
          size="sm"
          disabled={true}
          className="flex items-center opacity-50"
          title="Kanban disponible próximamente"
        >
          <LayoutGrid className="mr-2 h-4 w-4" />
          Kanban
        </Button>
      </div>
    </div>
  );
}
