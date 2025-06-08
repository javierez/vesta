"use client"

import { Input } from "~/components/ui/input"
import { Search } from "lucide-react"

interface PropertySearchProps {
  onSearchChange: (value: string) => void
  placeholder?: string
}

export function PropertySearch({ 
  onSearchChange,
  placeholder = "Buscar por título, descripción, ciudad o referencia..."
}: PropertySearchProps) {
  return (
    <div className="relative flex-1 md:max-w-sm">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-8"
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  )
}
