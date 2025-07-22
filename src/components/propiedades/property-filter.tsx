"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Badge } from "~/components/ui/badge"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Filter, X, Check, ChevronDown, LayoutGrid, Table as TableIcon, User } from "lucide-react"
import { PropertySearch } from "./property-search"
import { useRouter, useSearchParams } from "next/navigation"

interface PropertyFilterProps {
  view: "grid" | "table"
  agents?: Array<{ id: bigint, name: string }>
}

export function PropertyFilter({ 
  view,
  agents = []
}: PropertyFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [propertyFilters, setPropertyFilters] = useState({
    listingType: [] as string[],
    type: [] as string[]
  })
  const [agentFilters, setAgentFilters] = useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    listingType: true,
    type: true,
    agent: true
  })

  // Initialize filters from URL on mount
  useEffect(() => {
    const listingType = searchParams.get('listingType')
    const type = searchParams.get('type')
    const agent = searchParams.get('agent')
    const q = searchParams.get('q')

    setPropertyFilters({
      listingType: listingType ? listingType.split(',') : [],
      type: type ? type.split(',') : []
    })
    setAgentFilters(agent ? agent.split(',') : [])
    setSearchQuery(q ?? '')
  }, [searchParams])

  const updateUrlParams = (newPropertyFilters: typeof propertyFilters, newAgentFilters: string[], newSearchQuery: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Update search query
    if (newSearchQuery) {
      params.set('q', newSearchQuery)
    } else {
      params.delete('q')
    }

    // Update listingType
    if (newPropertyFilters.listingType.length > 0) {
      params.set('listingType', newPropertyFilters.listingType.join(','))
    } else {
      params.delete('listingType')
    }

    // Update type
    if (newPropertyFilters.type.length > 0) {
      params.set('type', newPropertyFilters.type.join(','))
    } else {
      params.delete('type')
    }

    // Update agent
    if (newAgentFilters.length > 0) {
      params.set('agent', newAgentFilters.join(','))
    } else {
      params.delete('agent')
    }

    // Reset to first page when filters change
    params.set('page', '1')
    
    router.push(`/propiedades?${params.toString()}`)
  }

  const togglePropertyFilter = (category: keyof typeof propertyFilters, value: string) => {
    const newFilters = {
      ...propertyFilters,
      [category]: propertyFilters[category].includes(value)
        ? propertyFilters[category].filter(v => v !== value)
        : [...propertyFilters[category], value]
    }
    setPropertyFilters(newFilters)
    updateUrlParams(newFilters, agentFilters, searchQuery)
  }

  const toggleAgentFilter = (value: string) => {
    const newFilters = agentFilters.includes(value)
      ? agentFilters.filter(v => v !== value)
      : [...agentFilters, value]
    setAgentFilters(newFilters)
    updateUrlParams(propertyFilters, newFilters, searchQuery)
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const clearPropertyFilters = () => {
    const newFilters = {
      listingType: [],
      type: []
    }
    setPropertyFilters(newFilters)
    updateUrlParams(newFilters, agentFilters, searchQuery)
  }

  const clearAgentFilters = () => {
    setAgentFilters([])
    updateUrlParams(propertyFilters, [], searchQuery)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    updateUrlParams(propertyFilters, agentFilters, value)
  }

  const activePropertyFiltersCount = Object.values(propertyFilters).reduce((acc, curr) => acc + curr.length, 0)

  const FilterOption = ({ value, label, category, isAgent = false }: { value: string, label: string, category?: keyof typeof propertyFilters, isAgent?: boolean }) => {
    const isSelected = isAgent 
      ? agentFilters.includes(value)
      : category && propertyFilters[category].includes(value)

    return (
      <div
        className="flex items-center space-x-2 px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer"
        onClick={() => isAgent ? toggleAgentFilter(value) : category && togglePropertyFilter(category, value)}
      >
        <div className={`h-4 w-4 rounded border flex items-center justify-center ${
          isSelected ? 'bg-primary border-primary' : 'border-input'
        }`}>
          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
        <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>
          {label}
        </span>
      </div>
    )
  }

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

  const handleViewChange = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', view === "grid" ? "table" : "grid")
    router.push(`/propiedades?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <PropertySearch 
          onSearchChange={handleSearchChange} 
          onSearch={() => updateUrlParams(propertyFilters, agentFilters, searchQuery)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <User className="h-4 w-4" />
              {agentFilters.length > 0 && (
                <Badge variant="secondary" className="absolute -top-1 -right-1 rounded-sm px-1 font-normal">
                  {agentFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex flex-col">
              <ScrollArea className="h-[300px]">
                <div className="p-4 space-y-6">
                  <div className="space-y-1">
                    {agents.map(agent => (
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
                <div className="p-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAgentFilters}
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
        <Button
          variant="outline"
          size="icon"
          onClick={handleViewChange}
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
              {activePropertyFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                  {activePropertyFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex flex-col">
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-6">
                  <FilterCategory title="Estado" category="listingType">
                    <FilterOption value="Sale" label="En Venta" category="listingType" />
                    <FilterOption value="Rent" label="En Alquiler" category="listingType" />
                    <FilterOption value="Sold" label="Vendido" category="listingType" />
                  </FilterCategory>

                  <FilterCategory title="Tipo" category="type">
                    <FilterOption value="piso" label="Piso" category="type" />
                    <FilterOption value="casa" label="Casa" category="type" />
                    <FilterOption value="local" label="Local" category="type" />
                    <FilterOption value="solar" label="Solar" category="type" />
                    <FilterOption value="garaje" label="Garaje" category="type" />
                  </FilterCategory>
                </div>
              </ScrollArea>
              {activePropertyFiltersCount > 0 && (
                <div className="p-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearPropertyFilters} 
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
