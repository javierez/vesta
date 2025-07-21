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
  Filter, 
  X, 
  Check, 
  ChevronDown,
  ArrowUpDown,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "~/lib/utils"

// Extended Contact type to include contactType for the UI
interface ExtendedContact {
  contactId: bigint
  firstName: string
  lastName: string
  email?: string
  phone?: string
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
  // All prospect titles (array)
  prospectTitles?: string[]
}

interface ContactFilterProps {
  onFilterChange: (filters: {
    searchQuery: string
    roles: string[]
    sortOrder: string
    lastContactFilter: string
  }) => void
}

export function ContactFilter({
  onFilterChange,
}: ContactFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<string | null>('owner')
  const [sortOrder, setSortOrder] = useState("alphabetical")
  const [lastContactFilter, setLastContactFilter] = useState("all")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    lastContact: true,
    sortOrder: true
  })

  // Initialize filters from URL on mount
  useEffect(() => {
    const roles = searchParams.get('roles')
    const sort = searchParams.get('sort')
    const q = searchParams.get('q')
    const lastContact = searchParams.get('lastContact')

    // Handle URL initialization - if roles contains 'buyer' or 'interested', set to 'buyer'
    if (roles) {
      const roleArray = roles.split(',')
      if (roleArray.includes('buyer') || roleArray.includes('interested')) {
        setSelectedRole('buyer')
      } else if (roleArray.includes('owner')) {
        setSelectedRole('owner')
      } else {
        setSelectedRole(roleArray[0] ?? 'owner')
      }
    } else {
      setSelectedRole('owner')
    }
    setSortOrder(sort ?? 'alphabetical')
    setSearchQuery(q ?? '')
    setLastContactFilter(lastContact ?? 'all')
    
    // Clean up any view parameter from URL since we only have table view
    if (searchParams.get('view')) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('view')
      router.replace(`/contactos?${params.toString()}`)
    }
  }, [searchParams, router])

  const updateUrlParams = (newSelectedRole: string | null, newSortOrder: string, newSearchQuery: string, newLastContactFilter: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Remove any view parameter since we only have table view now
    params.delete('view')
    
    // Update search query
    if (newSearchQuery) {
      params.set('q', newSearchQuery)
    } else {
      params.delete('q')
    }

    // Update roles
    if (newSelectedRole) {
      // When 'buyer' is selected, include both 'buyer' and 'interested' in URL
      const rolesForUrl = newSelectedRole === 'buyer' 
        ? 'buyer,interested' 
        : newSelectedRole
      params.set('roles', rolesForUrl)
    } else {
      // Default to 'owner' when no role is selected
      params.set('roles', 'owner')
    }

    // Update sort order
    if (newSortOrder !== 'alphabetical') {
      params.set('sort', newSortOrder)
    } else {
      params.delete('sort')
    }

    // Update last contact filter
    if (newLastContactFilter !== 'all') {
      params.set('lastContact', newLastContactFilter)
    } else {
      params.delete('lastContact')
    }

    // Reset to first page when filters change
    params.set('page', '1')
    
    router.push(`/contactos?${params.toString()}`)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    updateUrlParams(selectedRole, sortOrder, value, lastContactFilter)
    
    // When 'buyer' is selected, include both 'buyer' and 'interested'
    const rolesToFilter = selectedRole === 'buyer' 
      ? ['buyer', 'interested'] 
      : selectedRole === 'owner' 
        ? ['owner'] 
        : ['owner'] // Default to owner
    
    onFilterChange({
      searchQuery: value,
      roles: rolesToFilter,
      sortOrder,
      lastContactFilter,
    })
  }

  const toggleRoleFilter = (value: string) => {
    // Only allow 'buyer' and 'owner' values
    if (value !== 'buyer' && value !== 'owner') return
    
    const newSelectedRole = selectedRole === value ? null : value
    setSelectedRole(newSelectedRole)
    updateUrlParams(newSelectedRole, sortOrder, searchQuery, lastContactFilter)
    
    // When 'buyer' is selected, include both 'buyer' and 'interested'
    const rolesToFilter = newSelectedRole === 'buyer' 
      ? ['buyer', 'interested'] 
      : newSelectedRole === 'owner' 
        ? ['owner'] 
        : ['owner'] // Default to owner
    
    onFilterChange({
      searchQuery,
      roles: rolesToFilter,
      sortOrder,
      lastContactFilter,
    })
  }

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value)
    updateUrlParams(selectedRole, value, searchQuery, lastContactFilter)
    
    // When 'buyer' is selected, include both 'buyer' and 'interested'
    const rolesToFilter = selectedRole === 'buyer' 
      ? ['buyer', 'interested'] 
      : selectedRole === 'owner' 
        ? ['owner'] 
        : ['owner'] // Default to owner
    
    onFilterChange({
      searchQuery,
      roles: rolesToFilter,
      sortOrder: value,
      lastContactFilter,
    })
  }

  const handleLastContactFilterChange = (value: string) => {
    setLastContactFilter(value)
    updateUrlParams(selectedRole, sortOrder, searchQuery, value)
    
    // When 'buyer' is selected, include both 'buyer' and 'interested'
    const rolesToFilter = selectedRole === 'buyer' 
      ? ['buyer', 'interested'] 
      : selectedRole === 'owner' 
        ? ['owner'] 
        : ['owner'] // Default to owner
    
    onFilterChange({
      searchQuery,
      roles: rolesToFilter,
      sortOrder,
      lastContactFilter: value,
    })
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const clearRoleFilters = () => {
    setSelectedRole('owner')
    updateUrlParams('owner', sortOrder, searchQuery, lastContactFilter)
    onFilterChange({
      searchQuery,
      roles: ['owner'],
      sortOrder,
      lastContactFilter,
    })
  }

  const clearLastContactFilter = () => {
    setLastContactFilter('all')
    updateUrlParams(selectedRole, sortOrder, searchQuery, 'all')
    
    // When 'buyer' is selected, include both 'buyer' and 'interested'
    const rolesToFilter = selectedRole === 'buyer' 
      ? ['buyer', 'interested'] 
      : selectedRole === 'owner' 
        ? ['owner'] 
        : ['owner'] // Default to owner
    
    onFilterChange({
      searchQuery,
      roles: rolesToFilter,
      sortOrder,
      lastContactFilter: 'all',
    })
  }

  const activeFiltersCount = (lastContactFilter !== 'all' ? 1 : 0)

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

  return (
    <div className="space-y-4">
      {/* Search Bar and Controls */}
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
          
          {/* Role Filter Toggle */}
          <div className="relative bg-gray-100 rounded-lg p-1 h-10 flex-1 max-w-md">
            {selectedRole && (
              <motion.div
                className="absolute top-1 left-1 h-8 bg-white rounded-md shadow-sm"
                animate={{
                  width: "calc(50% - 4px)",
                  x: (() => {
                    const buttonOrder = ['owner', 'buyer']
                    const selectedIndex = buttonOrder.indexOf(selectedRole)
                    return `${selectedIndex * 100}%`
                  })()
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <div className="relative flex h-full">
              <button
                onClick={() => toggleRoleFilter('owner')}
                className={cn(
                  "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                  selectedRole === 'owner'
                    ? "text-gray-900"
                    : "text-gray-600"
                )}
              >
                Propietario
              </button>
              <button
                onClick={() => toggleRoleFilter('buyer')}
                className={cn(
                  "flex-1 rounded-md transition-colors duration-200 font-medium relative z-10 text-sm",
                  selectedRole === 'buyer'
                    ? "text-gray-900"
                    : "text-gray-600"
                )}
              >
                Demandante
              </button>
            </div>
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
            <PopoverContent className="w-80 p-0 max-h-[80vh]" align="end">
              <div className="flex flex-col">
                <ScrollArea className="max-h-[60vh]">
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
            <PopoverContent className="w-80 p-0 max-h-[80vh]" align="end">
              <div className="flex flex-col">
                <ScrollArea className="max-h-[60vh]">
                  <div className="p-4 space-y-6">
                    <FilterCategory title="Último contacto" category="lastContact">
                      <FilterOption 
                        value="today" 
                        label="Hoy" 
                        isSelected={lastContactFilter === 'today'}
                        onClick={() => handleLastContactFilterChange('today')}
                      />
                      <FilterOption 
                        value="week" 
                        label="Última semana" 
                        isSelected={lastContactFilter === 'week'}
                        onClick={() => handleLastContactFilterChange('week')}
                      />
                      <FilterOption 
                        value="month" 
                        label="Último mes" 
                        isSelected={lastContactFilter === 'month'}
                        onClick={() => handleLastContactFilterChange('month')}
                      />
                      <FilterOption 
                        value="quarter" 
                        label="Últimos 3 meses" 
                        isSelected={lastContactFilter === 'quarter'}
                        onClick={() => handleLastContactFilterChange('quarter')}
                      />
                      <FilterOption 
                        value="year" 
                        label="Último año" 
                        isSelected={lastContactFilter === 'year'}
                        onClick={() => handleLastContactFilterChange('year')}
                      />
                    </FilterCategory>
                  </div>
                </ScrollArea>
                {activeFiltersCount > 0 && (
                  <div className="p-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        clearRoleFilters()
                        clearLastContactFilter()
                      }} 
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
    </div>
  )
} 