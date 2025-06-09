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
import { Filter, X, Check, ChevronDown } from "lucide-react"

interface Appointment {
  id: number
  title: string
  client: string
  property: string
  date: string
  time: string
  duration: string
  status: string
  type: string
  location: string
}

interface AppointmentFilterProps {
  appointments: Appointment[]
  onFilterChange: (filters: {
    searchQuery: string
    status: string[]
    type: string[]
    client: string[]
  }) => void
}

export function AppointmentFilter({ appointments, onFilterChange }: AppointmentFilterProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    status: [] as string[],
    type: [] as string[],
    client: [] as string[],
  })
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    status: true,
    type: true,
    client: true,
  })

  const clients = Array.from(new Set(appointments.map(a => a.client)))
  const types = Array.from(new Set(appointments.map(a => a.type)))
  const statuses = Array.from(new Set(appointments.map(a => a.status)))

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
      client: [],
    }
    setFilters(newFilters)
    onFilterChange({ searchQuery, ...newFilters })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    onFilterChange({ searchQuery: e.target.value, ...filters })
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

  const FilterCategory = ({ title, category, children }: { title: string, category: string, children: React.ReactNode }) => (
    <div className="space-y-2">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => toggleCategory(category)}
      >
        <h5 className="text-sm font-medium text-muted-foreground">{title}</h5>
        <ChevronDown 
          className={`h-4 w-4 text-muted-foreground transition-transform ${expandedCategories[category] ? 'transform rotate-180' : ''}`}
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
    <div className="flex flex-1 items-center space-x-2">
      <input
        type="text"
        placeholder="Buscar citas..."
        className="pl-3 pr-2 py-2 border rounded w-full max-w-xs"
        value={searchQuery}
        onChange={handleSearchChange}
      />
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
        <PopoverContent className="w-72 p-0" align="end">
          <div className="flex flex-col">
            <ScrollArea className="h-[300px]">
              <div className="p-4 space-y-6">
                <FilterCategory title="Estado" category="status">
                  {statuses.map(status => (
                    <FilterOption key={status} value={status} label={status} category="status" />
                  ))}
                </FilterCategory>
                <FilterCategory title="Tipo" category="type">
                  {types.map(type => (
                    <FilterOption key={type} value={type} label={type} category="type" />
                  ))}
                </FilterCategory>
                <FilterCategory title="Cliente" category="client">
                  {clients.map(client => (
                    <FilterOption key={client} value={client} label={client} category="client" />
                  ))}
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
  )
} 