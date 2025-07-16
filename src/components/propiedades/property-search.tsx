"use client"

import { Input } from "~/components/ui/input"
import { Search } from "lucide-react"
import React, { useState } from "react"

interface PropertySearchProps {
  onSearchChange: (value: string) => void
  onSearch: () => void
  placeholder?: string
}

export function PropertySearch({ 
  onSearchChange,
  onSearch,
  placeholder = "Buscar por título, descripción, ciudad o referencia..."
}: PropertySearchProps) {
  const [value, setValue] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    onSearchChange(newValue)
  }

  const handleSearch = () => {
    onSearch()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="relative flex-1 md:max-w-sm">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-8 w-full border-0 shadow-md"
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
      </div>
    </div>
  )
}
