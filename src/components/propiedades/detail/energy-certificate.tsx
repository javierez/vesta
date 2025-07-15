'use client'

import React, { useState, useCallback } from 'react'
import { Upload, FileText, X, Check, AlertTriangle } from 'lucide-react'
import { Card } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { ModernSaveIndicator } from '~/components/propiedades/form/common/modern-save-indicator'
import { cn } from '~/lib/utils'
import { updateProperty } from '~/server/queries/properties'

type SaveState = "idle" | "modified" | "saving" | "saved" | "error"

interface EnergyCertificateProps {
  energyRating?: string | null
  uploadedFile?: string | null
  className?: string
  propertyId?: bigint
}

export function EnergyCertificate({ 
  energyRating, 
  uploadedFile, 
  className = "",
  propertyId
}: EnergyCertificateProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [currentRating, setCurrentRating] = useState(energyRating)
  const [pendingRating, setPendingRating] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  
  const hasUploadedCertificate = !!uploadedFile

  const getEnergyRatingColor = (rating: string | null | undefined, isActive: boolean = false) => {
    if (!rating) return "bg-gray-300"
    
    const baseColors = {
      "A": isActive ? "bg-green-500" : "bg-green-500/25",
      "B": isActive ? "bg-green-400" : "bg-green-400/25", 
      "C": isActive ? "bg-yellow-400" : "bg-yellow-400/25",
      "D": isActive ? "bg-yellow-500" : "bg-yellow-500/25",
      "E": isActive ? "bg-orange-400" : "bg-orange-400/25",
      "F": isActive ? "bg-orange-500" : "bg-orange-500/25",
      "G": isActive ? "bg-red-500" : "bg-red-500/25"
    }
    
    return baseColors[rating.toUpperCase() as keyof typeof baseColors] || "bg-gray-300"
  }

  const getArrowWidth = (rating: string) => {
    const widths = {
      "A": "w-40",
      "B": "w-48", 
      "C": "w-56",
      "D": "w-64",
      "E": "w-72",
      "F": "w-80",
      "G": "w-96"
    }
    return widths[rating as keyof typeof widths] || "w-56"
  }

  const getEnergyRatingText = (rating: string | null | undefined) => {
    if (!rating) return "Sin calificación"
    
    switch (rating.toUpperCase()) {
      case "A":
        return "A más eficiente"
      case "G":
        return "G menos eficiente"
      default:
        return rating.toUpperCase()
    }
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find(file => file.type === 'application/pdf')
    
    if (pdfFile) {
      setIsUploading(true)
      setUploadProgress(0)
      
      // Simulate progress updates like in image gallery
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)
      
      // TODO: Implement file upload logic
      console.log('Energy certificate uploaded:', pdfFile.name)
      
      // Simulate upload completion
      setTimeout(() => {
        setUploadProgress(100)
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
        }, 500)
      }, 2000)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setIsUploading(true)
      setUploadProgress(0)
      
      // Simulate progress updates like in image gallery
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)
      
      // TODO: Implement file upload logic
      console.log('Energy certificate uploaded:', file.name)
      
      // Simulate upload completion
      setTimeout(() => {
        setUploadProgress(100)
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
        }, 500)
      }, 2000)
    }
  }, [])

  const handleArrowClick = (rating: string) => {
    if (rating !== currentRating) {
      setPendingRating(rating)
      setSaveState("modified")
    }
  }

  const handleSave = async () => {
    if (!pendingRating || !propertyId) return
    
    setSaveState("saving")
    try {
      // Update the energy certification in the properties table
      await updateProperty(Number(propertyId), {
        energyCertification: pendingRating
      })
      
      setCurrentRating(pendingRating)
      setPendingRating(null)
      setSaveState("saved")
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveState("idle")
      }, 2000)
    } catch (error) {
      console.error('Error saving energy rating:', error)
      setSaveState("error")
      
      // Reset to modified after 3 seconds
      setTimeout(() => {
        setSaveState("modified")
      }, 3000)
    }
  }

  const getCardStyles = () => {
    switch (saveState) {
      case "modified":
        return "ring-2 ring-yellow-500/20 shadow-lg shadow-yellow-500/10 border-yellow-500/20"
      case "saving":
        return "ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10 border-amber-500/20"
      case "saved":
        return "ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10 border-emerald-500/20"
      case "error":
        return "ring-2 ring-red-500/20 shadow-lg shadow-red-500/10 border-red-500/20"
      default:
        return ""
    }
  }

  return (
    <Card className={cn("relative p-6 transition-all duration-500 ease-out", getCardStyles(), className)}>
      <ModernSaveIndicator 
        state={saveState} 
        onSave={handleSave} 
      />
      
      {/* First Row: Title */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Certificado Energético</h3>
      </div>

      {/* Second Row: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Column 1: Energy Efficiency Visualization */}
        <div className="flex flex-col">          
          <div className="bg-white rounded-lg p-4 flex-1 flex flex-col justify-center">
            <div className="space-y-1">
              {(() => {
                const displayRating = pendingRating || currentRating
                return ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((rating, index) => {
                  const isCurrentRating = displayRating?.toUpperCase() === rating
                  const isActive = displayRating ? isCurrentRating : false
                  const backgroundColor = getEnergyRatingColor(rating, isActive)
                  const arrowWidth = getArrowWidth(rating)
                  
                  return (
                    <div key={rating} className="relative flex">
                      <button
                        onClick={() => handleArrowClick(rating)}
                        className={`
                          h-8 flex items-center justify-start px-3 text-white font-bold text-sm
                          ${backgroundColor}
                          ${isCurrentRating ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                          ${rating === 'A' ? 'rounded-tl-lg' : ''}
                          ${rating === 'G' ? 'rounded-bl-lg' : ''}
                          ${arrowWidth}
                          transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer
                        `}
                        style={{
                          clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)'
                        }}
                      >
                        <span className="text-white">
                          {rating}
                        </span>
                      </button>
                    </div>
                  )
                })
              })()}
            </div>
            
            {/* Subtle warning message at the bottom */}
            {!hasUploadedCertificate && (
              <div className="flex items-center gap-1.5 mt-3 p-2 bg-amber-50/50 border border-amber-100 rounded-md">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                <p className="text-xs text-amber-600">
                  Sin certificado subido
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Document Placeholder */}
        <div className="flex flex-col">          
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg transition-colors flex-1 min-h-[200px] ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center h-full px-4">
                <div className="w-full space-y-2">
                  <div className="h-0.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-400 transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Subiendo certificado...</p>
              </div>
            ) : hasUploadedCertificate ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Check className="h-8 w-8 text-green-600 mb-3" />
                <p className="text-sm font-medium text-green-700">Certificado subido</p>
                <p className="text-xs text-gray-500">{uploadedFile}</p>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-full cursor-pointer group">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="energy-certificate-upload"
                />
                <FileText className="h-8 w-8 text-gray-400 group-hover:text-gray-500 mb-3 transition-colors duration-200" />
                <span className="text-sm text-gray-400 group-hover:text-gray-500 font-medium transition-colors duration-200 mb-2">
                  Subir certificado PDF
                </span>
                <p className="text-xs text-gray-400 text-center px-4">
                  Arrastra el archivo aquí o haz clic para seleccionar
                </p>
              </label>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
