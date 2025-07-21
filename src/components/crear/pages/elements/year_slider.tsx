import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "~/components/ui/input"
import { Slider } from "~/components/ui/slider"

interface YearSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  placeholder?: string
}

export function YearSlider({
  label,
  value,
  onChange,
  min = 1950,
  max = new Date().getFullYear(),
  placeholder = "Año",
}: YearSliderProps) {
  const [inputValue, setInputValue] = useState(value.toString())
  const [sliderValue, setSliderValue] = useState([value || min])

  useEffect(() => {
    setInputValue(value.toString())
    setSliderValue([value || min])
  }, [value, min])

  const handleSliderChange = (newValue: number[]) => {
    const year = newValue[0] ?? min
    setSliderValue([year])
    setInputValue(year.toString())
    onChange(year)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    const year = Number.parseInt(newValue)
    if (!isNaN(year) && year >= min && year <= max) {
      setSliderValue([year])
      onChange(year)
    }
  }

  const handleInputBlur = () => {
    const year = Number.parseInt(inputValue)
    if (isNaN(year) || year < min || year > max) {
      setInputValue(value.toString())
      setSliderValue([value || min])
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-gray-600">{label}</label>

      <div className="space-y-3 p-3 rounded-md shadow-md">
        <Slider
          value={sliderValue}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={1}
          className="w-full"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{min}</span>
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            type="number"
            min={min}
            max={max}
            className="h-8 w-20 text-center text-sm border-0 shadow-md"
          />
          <span className="text-xs text-gray-400">{max}</span>
        </div>
      </div>
    </div>
  )
}
