"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Badge } from "~/components/ui/badge"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Filter, X, Check, ChevronDown, LayoutGrid, Table as TableIcon } from "lucide-react"
import type { Property } from "~/lib/data"
import { PropertySearch } from "./property-search"

interface PropertyFilterProps {
  properties: Property[]
  onFilterChange: (filters: {
    searchQuery: string
    status: string[]
    type: string[]
    city: string[]
    source: string[]
    createdAt: string[]
  }) => void
  view: "grid" | "table"
  onViewChange: (view: "grid" | "table") => void
}

export function PropertyFilter({ 
  properties, 
  onFilterChange,
  view,
  onViewChange 
}: PropertyFilterProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    status: [] as string[],
    type: [] as string[],
    city: [] as string[],
    source: [] as string[],
    createdAt: [] as string[]
  })
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    status: true,
    type: true,
    city: true,
    source: true,
    createdAt: true
  })

  const cities = Array.from(new Set(properties.map(p => p.city)))

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    const newFilters = {
      ...filters,
      [category]: filters[category].includes(value)
        ? filters[category].filter(v => v !== value)
        : [...filters[category], value]
    }
    setFilters(newFilters)
    onFilterChange({ searchQuery, ...newFilters })
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const clearFilters = () => {
    const newFilters = {
      status: [],
      type: [],
      city: [],
      source: [],
      createdAt: []
    }
    setFilters(newFilters)
    onFilterChange({ searchQuery, ...newFilters })
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onFilterChange({ searchQuery: value, ...filters })
  }

  const activeFiltersCount = Object.values(filters).reduce((acc, curr) => acc + curr.length, 0)

  const FilterOption = ({ value, label, category }: { value: string, label: string, category: keyof typeof filters }) => (
    <div
      className="flex items-center space-x-2 px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer"
      onClick={() => toggleFilter(category, value)}
    >
      <div className={`h-4 w-4 rounded border flex items-center justify-center ${filters[category].includes(value) ? 'bg-primary border-primary' : 'border-input'}`}>
        {filters[category].includes(value) && <Check className="h-3 w-3 text-primary-foreground" />}
      </div>
      <span className="text-sm">{label}</span>
    </div>
  )

  const FilterCategory = ({ 
    title, 
    category, 
    children 
  }: { 
    title: string, 
    category: string, 
    children: React.ReactNode 
  }) => (
    <div className="space-y-2">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => toggleCategory(category)}
      >
        <h5 className="text-sm font-medium text-muted-foreground">{title}</h5>
        <ChevronDown 
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            expandedCategories[category] ? 'transform rotate-180' : ''
          }`}
        />
      </div>
      {expandedCategories[category] && (
        <div className="space-y-1">
          {children}
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <PropertySearch onSearchChange={handleSearchChange} />
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onViewChange(view === "grid" ? "table" : "grid")}
          title={view === "grid" ? "Ver como tabla" : "Ver como cuadrícula"}
        >
          {view === "grid" ? (
            <TableIcon className="h-4 w-4" />
          ) : (
            <LayoutGrid className="h-4 w-4" />
          )}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex flex-col">
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-6">
                  <FilterCategory title="Estado" category="status">
                    <FilterOption value="for-sale" label="En Venta" category="status" />
                    <FilterOption value="for-rent" label="En Alquiler" category="status" />
                    <FilterOption value="sold" label="Vendido" category="status" />
                  </FilterCategory>

                  <FilterCategory title="Tipo" category="type">
                    <FilterOption value="piso" label="Piso" category="type" />
                    <FilterOption value="casa" label="Casa" category="type" />
                    <FilterOption value="local" label="Local" category="type" />
                    <FilterOption value="solar" label="Solar" category="type" />
                    <FilterOption value="garaje" label="Garaje" category="type" />
                  </FilterCategory>

                  <FilterCategory title="Ciudad" category="city">
                    {cities.map(city => (
                      <FilterOption key={city} value={city} label={city} category="city" />
                    ))}
                  </FilterCategory>

                  <FilterCategory title="Fuente" category="source">
                    <FilterOption value="idealista" label="Idealista" category="source" />
                    <FilterOption value="fotocasa" label="Fotocasa" category="source" />
                  </FilterCategory>

                  <FilterCategory title="Fecha de Publicación" category="createdAt">
                    <FilterOption value="today" label="Hoy" category="createdAt" />
                    <FilterOption value="week" label="Esta Semana" category="createdAt" />
                    <FilterOption value="month" label="Este Mes" category="createdAt" />
                    <FilterOption value="year" label="Este Año" category="createdAt" />
                  </FilterCategory>
                </div>
              </ScrollArea>
              {activeFiltersCount > 0 && (
                <div className="p-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters} 
                    className="w-full h-7 text-xs"
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Borrar filtros
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
