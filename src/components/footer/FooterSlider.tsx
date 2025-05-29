"use client"

import { useState, useEffect, useCallback } from "react"

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
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [isAnimating, setIsAnimating] = useState(false)

  const totalOffices = officeLocations.length

  const nextOffice = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setDirection('right')
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalOffices)
    setTimeout(() => setIsAnimating(false), 800) // Match this with the transition duration
  }, [totalOffices, isAnimating])

  const prevOffice = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setDirection('left')
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalOffices) % totalOffices)
    setTimeout(() => setIsAnimating(false), 800) // Match this with the transition duration
  }, [totalOffices, isAnimating])

  // Auto-rotate every 3 seconds
  useEffect(() => {
    if (totalOffices <= 1 || isPaused || isAnimating) return

    const interval = setInterval(() => {
      nextOffice()
    }, 3000)

    return () => clearInterval(interval)
  }, [nextOffice, totalOffices, isPaused, isAnimating])

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
              <p className="mt-1">{office.email}</p>
              <p>{office.phone}</p>
            </address>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div 
      className="relative overflow-hidden" 
      onMouseEnter={() => setIsPaused(true)} 
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="min-h-[200px]">
        {officeLocations.map((office, index) => (
          <div
            key={index}
            className={`absolute w-full transition-all duration-800 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform ${
              index === currentIndex 
                ? 'translate-x-0 opacity-100' 
                : direction === 'right'
                  ? 'translate-x-full opacity-0'
                  : '-translate-x-full opacity-0'
            }`}
            style={{
              transform: `translateX(${
                index === currentIndex 
                  ? '0%' 
                  : direction === 'right'
                    ? '100%'
                    : '-100%'
              })`,
              transition: 'transform 800ms cubic-bezier(0.4, 0, 0.2, 1), opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
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
    </div>
  )
}
