"use client"
import { Bed, Bath, Plus, Minus } from "lucide-react"
import { Button } from "~/components/ui/button"

interface RoomSelectorProps {
  type: "bedrooms" | "bathrooms"
  value: number
  onChange: (value: number) => void
  label: string
  max?: number
}

export function RoomSelector({ type, value, onChange, label, max = 20 }: RoomSelectorProps) {
  const Icon = type === "bedrooms" ? Bed : Bath

  const handleIncrement = () => {
    if (value < max) onChange(value + 1)
  }

  const handleDecrement = () => {
    if (value > 0) onChange(value - 1)
  }

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <div className="flex items-center space-x-2 p-2 border rounded">
        <Icon className="h-3 w-3 text-gray-500" />
        <span className="text-sm font-medium min-w-[12px] text-center">{value}</span>
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={handleDecrement} disabled={value <= 0} className="h-6 w-6 p-0">
            <Minus className="h-2.5 w-2.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleIncrement} disabled={value >= max} className="h-6 w-6 p-0">
            <Plus className="h-2.5 w-2.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
