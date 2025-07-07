"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Badge } from "~/components/ui/badge"
import { ScrollArea } from "~/components/ui/scroll-area"
import { 
  Search, 
  LayoutGrid, 
  Table as TableIcon, 
  Filter, 
  X, 
  Check, 
  ChevronDown,
  ArrowUpDown 
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

// Extended Contact type to include contactType for the UI
interface ExtendedContact {
  contactId: bigint
  firstName: string
  lastName: string
  email?: string
  phone?: string
  contactType: "demandante" | "propietario" | "banco" | "agencia" | "interesado"
  isActive: boolean
  additionalInfo?: {
    demandType?: string
    propertiesCount?: number
    propertyTypes?: string[]
    budget?: number
    location?: string
    notes?: string
  }
  lastContact?: Date
  createdAt: Date
  updatedAt: Date
}

interface ContactFilterProps {
  contacts: ExtendedContact[]
  onFilterChange: (filters: {
    searchQuery: string
    contactType: string[]
    sortOrder: string
  }) => void
  view: "grid" | "table"
  onViewChange: (view: "grid" | "table") => void
}

export function ContactFilter({
  contacts,
  onFilterChange,
  view,
  onViewChange,
}: ContactFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [contactTypeFilters, setContactTypeFilters] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState("alphabetical")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    contactType: true,
    sortOrder: true
  })

  // Initialize filters from URL on mount
  useEffect(() => {
    const contactType = searchParams.get('contactType')
    const sort = searchParams.get('sort')
    const q = searchParams.get('q')

    setContactTypeFilters(contactType ? contactType.split(',') : [])
    setSortOrder(sort || 'alphabetical')
    setSearchQuery(q || '')
  }, [searchParams])

  const updateUrlParams = (newContactTypeFilters: string[], newSortOrder: string, newSearchQuery: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Update search query
    if (newSearchQuery) {
      params.set('q', newSearchQuery)
    } else {
      params.delete('q')
    }

    // Update contactType
    if (newContactTypeFilters.length > 0) {
      params.set('contactType', newContactTypeFilters.join(','))
    } else {
      params.delete('contactType')
    }

    // Update sort order
    if (newSortOrder !== 'alphabetical') {
      params.set('sort', newSortOrder)
    } else {
      params.delete('sort')
    }

    // Reset to first page when filters change
    params.set('page', '1')
    
    router.push(`/contactos?${params.toString()}`)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    updateUrlParams(contactTypeFilters, sortOrder, value)
    onFilterChange({
      searchQuery: value,
      contactType: contactTypeFilters,
      sortOrder,
    })
  }

  const toggleContactTypeFilter = (value: string) => {
    const newFilters = contactTypeFilters.includes(value)
      ? contactTypeFilters.filter(v => v !== value)
      : [...contactTypeFilters, value]
    setContactTypeFilters(newFilters)
    updateUrlParams(newFilters, sortOrder, searchQuery)
    onFilterChange({
      searchQuery,
      contactType: newFilters,
      sortOrder,
    })
  }

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value)
    updateUrlParams(contactTypeFilters, value, searchQuery)
    onFilterChange({
      searchQuery,
      contactType: contactTypeFilters,
      sortOrder: value,
    })
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const clearContactTypeFilters = () => {
    setContactTypeFilters([])
    updateUrlParams([], sortOrder, searchQuery)
    onFilterChange({
      searchQuery,
      contactType: [],
      sortOrder,
    })
  }

  const activeFiltersCount = contactTypeFilters.length

  const FilterOption = ({ value, label, isSelected, onClick }: { 
    value: string, 
    label: string, 
    isSelected: boolean, 
    onClick: () => void 
  }) => (
    <div
      className="flex items-center space-x-2 px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer"
      onClick={onClick}
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

  const SortOption = ({ value, label, isSelected, onClick }: { 
    value: string, 
    label: string, 
    isSelected: boolean, 
    onClick: () => void 
  }) => (
    <div
      className="flex items-center space-x-2 px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer"
      onClick={onClick}
    >
      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
        isSelected ? 'bg-primary border-primary' : 'border-input'
      }`}>
        {isSelected && <div className="h-2 w-2 bg-primary-foreground rounded-full" />}
      </div>
      <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>
        {label}
      </span>
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

  const handleViewChange = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', view === "grid" ? "table" : "grid")
    router.push(`/contactos?${params.toString()}`)
    onViewChange(view === "grid" ? "table" : "grid")
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contactos..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <ArrowUpDown className="h-4 w-4" />
              {sortOrder !== 'alphabetical' && (
                <Badge variant="secondary" className="absolute -top-1 -right-1 rounded-sm px-1 font-normal">
                  1
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex flex-col">
              <ScrollArea className="h-[200px]">
                <div className="p-4 space-y-6">
                  <FilterCategory title="Ordenar por" category="sortOrder">
                    <SortOption 
                      value="alphabetical" 
                      label="Alfabéticamente" 
                      isSelected={sortOrder === 'alphabetical'}
                      onClick={() => handleSortOrderChange('alphabetical')}
                    />
                    <SortOption 
                      value="lastContact" 
                      label="Último contacto" 
                      isSelected={sortOrder === 'lastContact'}
                      onClick={() => handleSortOrderChange('lastContact')}
                    />
                  </FilterCategory>
                </div>
              </ScrollArea>
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
                  <FilterCategory title="Tipo de contacto" category="contactType">
                    <FilterOption 
                      value="demandante" 
                      label="Demandante" 
                      isSelected={contactTypeFilters.includes('demandante')}
                      onClick={() => toggleContactTypeFilter('demandante')}
                    />
                    <FilterOption 
                      value="propietario" 
                      label="Propietario" 
                      isSelected={contactTypeFilters.includes('propietario')}
                      onClick={() => toggleContactTypeFilter('propietario')}
                    />
                    <FilterOption 
                      value="banco" 
                      label="Banco" 
                      isSelected={contactTypeFilters.includes('banco')}
                      onClick={() => toggleContactTypeFilter('banco')}
                    />
                    <FilterOption 
                      value="agencia" 
                      label="Agencia" 
                      isSelected={contactTypeFilters.includes('agencia')}
                      onClick={() => toggleContactTypeFilter('agencia')}
                    />
                    <FilterOption 
                      value="interesado" 
                      label="Interesado" 
                      isSelected={contactTypeFilters.includes('interesado')}
                      onClick={() => toggleContactTypeFilter('interesado')}
                    />
                  </FilterCategory>
                </div>
              </ScrollArea>
              {activeFiltersCount > 0 && (
                <div className="p-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearContactTypeFilters} 
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