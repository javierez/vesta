"use client"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Search, LayoutGrid, Table as TableIcon } from "lucide-react"
import { useState } from "react"

// Extended Contact type to include contactType for the UI
interface ExtendedContact {
  contactId: bigint
  firstName: string
  lastName: string
  email?: string
  phone?: string
  contactType: "demandante" | "propietario" | "banco" | "agencia"
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
    status: string[]
    type: string[]
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
  const [searchQuery, setSearchQuery] = useState("")
  const [status, setStatus] = useState<string[]>([])
  const [type, setType] = useState<string[]>([])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onFilterChange({
      searchQuery: value,
      status,
      type,
    })
  }

  const handleStatusChange = (value: string[]) => {
    setStatus(value)
    onFilterChange({
      searchQuery,
      status: value,
      type,
    })
  }

  const handleTypeChange = (value: string[]) => {
    setType(value)
    onFilterChange({
      searchQuery,
      status,
      type: value,
    })
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
      </div>
    </div>
  )
} 