"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "~/components/ui/button"

interface OfficeLocation {
  name: string
  address: string[]
  email: string
  phone: string
}

interface OfficeLocationsSliderProps {
  officeLocations: OfficeLocation[]
}

export function OfficeLocationsSlider({ officeLocations }: OfficeLocationsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const totalOffices = officeLocations.length

  const nextOffice = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalOffices)
  }, [totalOffices])

  const prevOffice = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalOffices) % totalOffices)
  }, [totalOffices])

  // Auto-rotate every 3 seconds
  useEffect(() => {
    if (totalOffices <= 1 || isPaused) return

    const interval = setInterval(() => {
      nextOffice()
    }, 3000)

    return () => clearInterval(interval)
  }, [nextOffice, totalOffices, isPaused])

  // If there's only one office or no offices, don't show the slider
  if (totalOffices <= 1) {
    return (
      <div className="space-y-6">
        {officeLocations.map((office, index) => (
          <div key={index} className="text-muted-foreground">
            <p className="font-medium text-foreground">{office.name}</p>
            <address className="not-italic mt-1">
              {office.address.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
              <p className="mt-1">Email: {office.email}</p>
              <p>Teléfono: {office.phone}</p>
            </address>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="min-h-[200px]">
        {officeLocations.map((office, index) => (
          <div
            key={index}
            className={`absolute w-full transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="text-muted-foreground">
              <p className="font-medium text-foreground">{office.name}</p>
              <address className="not-italic mt-1">
                {office.address.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
                <p className="mt-1">Email: {office.email}</p>
                <p>Teléfono: {office.phone}</p>
              </address>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 h-8 w-8" 
          onClick={prevOffice} 
          aria-label="Oficina anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 h-8 w-8" 
          onClick={nextOffice} 
          aria-label="Siguiente oficina"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
