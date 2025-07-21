"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card } from "~/components/ui/card"
import { FloatingLabelInput } from "~/components/ui/floating-label-input"
import { ChevronLeft, ChevronRight, Info, Loader, Upload, FileText, X, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createPropertyFromCadastral, createPropertyFromLocation } from "~/server/queries/properties"
import { uploadDocument, deleteDocument, renameDocumentFolder } from "~/app/actions/upload"
import { processDocumentInBackground } from "~/server/ocr/ocr-initial-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"

// Base form data interface
interface BaseFormData {
  // Initial questions
  cadastralReference: string

  // Location
  street: string
  addressDetails: string
  postalCode: string
  city: string
  province: string
  municipality: string
  neighborhood: string
  latitude: string
  longitude: string

  // Property Specifications
  squareMeter: string
  builtSurfaceArea: string
  yearBuilt: string
  propertyType: string
}

const initialFormData: BaseFormData = {
  cadastralReference: "",
  street: "",
  addressDetails: "",
  postalCode: "",
  city: "",
  province: "",
  municipality: "",
  neighborhood: "",
  latitude: "",
  longitude: "",
  squareMeter: "",
  builtSurfaceArea: "",
  yearBuilt: "",
  propertyType: "piso",
}

// Step definitions
interface Step {
  id: string
  title: string
  propertyTypes?: string[]
}

// Simplified steps - only initial and location
const simplifiedSteps: Step[] = [
  { id: "initial", title: "Información Inicial" },
  { id: "location", title: "Dirección" },
]

// Step configuration mapping - all property types now use the same simplified steps
const stepConfigurations = {
  piso: simplifiedSteps,
  casa: simplifiedSteps,
  garaje: simplifiedSteps,
  local: simplifiedSteps,
  solar: simplifiedSteps,
}

type PropertyType = keyof typeof stepConfigurations

export default function PropertyIdentificationForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<BaseFormData>(initialFormData)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")
  const [showCadastralTooltip, setShowCadastralTooltip] = useState(false)
  const [showUploadTooltip, setShowUploadTooltip] = useState(false)
  const [isCreatingProperty, setIsCreatingProperty] = useState(false)
  const router = useRouter()
  
  // File upload state
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{
    docId: bigint
    documentKey: string
    fileUrl: string
    filename: string
    fileType: string
  }>>([])
  // Add state to track the temporary reference number
  const [tempReferenceNumber, setTempReferenceNumber] = useState<string>("")
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<{
    docId: bigint
    documentKey: string
  } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.tooltip-container')) {
        setShowCadastralTooltip(false)
        setShowUploadTooltip(false)
      }
    }

    if (showCadastralTooltip || showUploadTooltip) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCadastralTooltip, showUploadTooltip])

  // Get current steps based on property type
  const currentSteps = useMemo(() => {
    const propertyType = formData.propertyType as PropertyType
    return stepConfigurations[propertyType] || simplifiedSteps
  }, [formData.propertyType])

  const updateFormData = (field: keyof BaseFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleInputChange = (field: keyof BaseFormData) => (value: string) => {
    updateFormData(field, value)
  }

  const handleEventInputChange = (field: keyof BaseFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData(field, e.target.value)
  }

  // Client-side function that calls the server action for cadastral reference
  const handleCreatePropertyFromCadastral = async (cadastralReference: string) => {
    try {
      setIsCreatingProperty(true)
      // Call the server action
      const newProperty = await createPropertyFromCadastral(cadastralReference);
      console.log("Property created from cadastral:", newProperty);
      
      // Rename S3 folder if we have uploaded documents
      if (uploadedDocuments.length > 0 && tempReferenceNumber && newProperty.referenceNumber) {
        try {
          const documentIds = uploadedDocuments.map(doc => doc.docId);
          const renamedDocuments = await renameDocumentFolder(
            tempReferenceNumber,
            newProperty.referenceNumber,
            documentIds
          );
          
          // Update the uploadedDocuments state with new URLs
          setUploadedDocuments(prev => 
            prev.map(doc => {
              const renamed = renamedDocuments.find(r => r.docId === doc.docId);
              if (renamed) {
                return {
                  ...doc,
                  documentKey: renamed.newDocumentKey,
                  fileUrl: renamed.newUrl
                };
              }
              return doc;
            })
          );
          
          console.log(`Successfully renamed ${renamedDocuments.length} documents`);
        } catch (renameError) {
          console.error("Error renaming S3 folder:", renameError);
          // Continue with property creation even if renaming fails
        }
      }
      
      // Automatically populate form fields with cadastral data
      if (newProperty) {
        setFormData(prev => ({
          ...prev,
          // Location fields
          street: newProperty.street ?? "",
          addressDetails: newProperty.addressDetails ?? "",
          postalCode: newProperty.postalCode ?? "",
          city: newProperty.city ?? "", // Now populated from geocoding data
          province: newProperty.province ?? "", // Now populated from geocoding data
          municipality: newProperty.municipality ?? "", // Now populated from geocoding data
          neighborhood: newProperty.neighborhood ?? "", // Now populated from geocoding data
          latitude: newProperty.latitude?.toString() ?? "",
          longitude: newProperty.longitude?.toString() ?? "",
          // Property specifications
          squareMeter: newProperty.squareMeter?.toString() ?? "",
          builtSurfaceArea: newProperty.builtSurfaceArea?.toString() ?? "",
          yearBuilt: newProperty.yearBuilt?.toString() ?? "",
          propertyType: newProperty.propertyType ?? "piso",
        }));
      }
      
      return newProperty; // Return the property data for redirection
    } catch (error) {
      console.error("Error creating property:", error);
      alert("Error al crear la propiedad. Por favor, inténtalo de nuevo.");
      throw error; // Re-throw the error so the calling function can handle it
    } finally {
      setIsCreatingProperty(false)
    }
  };

  // Client-side function that calls the server action for manual location data
  const handleCreatePropertyFromLocation = async (locationData: {
    street: string;
    addressDetails?: string;
    postalCode: string;
    city?: string;
    province?: string;
    municipality?: string;
    neighborhood?: string;
  }) => {
    try {
      setIsCreatingProperty(true)
      
      // First, validate address using Nominatim with just street and city
      const addressString = [
        locationData.street,
        locationData.city
      ].filter(Boolean).join(', ')
      
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1&countrycodes=es&addressdetails=1`
      
      const response = await fetch(nominatimUrl)
      const nominatimResults = await response.json()
      
      if (nominatimResults.length === 0) {
        alert("La dirección introducida no se ha encontrado. Por favor, verifica que la dirección y ciudad sean correctos.");
        return null
      }
      
      const result = nominatimResults[0]
      console.log("Nominatim validation successful:", result)
      
      // Auto-fill missing fields with Nominatim data
      const enrichedLocationData = {
        ...locationData,
        postalCode: locationData.postalCode ?? result.address?.postcode ?? "",
        city: locationData.city ?? result.address?.city ?? result.address?.town ?? "",
        province: locationData.province ?? result.address?.state ?? "",
        municipality: locationData.municipality ?? result.address?.city ?? result.address?.town ?? "",
        neighborhood: locationData.neighborhood ?? result.address?.suburb ?? "",
        latitude: result.lat ?? "",
        longitude: result.lon ?? ""
      }
      
      // Update form data with enriched information
      setFormData(prev => ({
        ...prev,
        postalCode: enrichedLocationData.postalCode,
        city: enrichedLocationData.city,
        province: enrichedLocationData.province,
        municipality: enrichedLocationData.municipality,
        neighborhood: enrichedLocationData.neighborhood,
        latitude: enrichedLocationData.latitude,
        longitude: enrichedLocationData.longitude
      }))
      
      // Call the server action with enriched data
      const newProperty = await createPropertyFromLocation(enrichedLocationData);
      console.log("Property created from location:", newProperty);
      
      // Rename S3 folder if we have uploaded documents
      if (uploadedDocuments.length > 0 && tempReferenceNumber && newProperty.referenceNumber) {
        try {
          const documentIds = uploadedDocuments.map(doc => doc.docId);
          const renamedDocuments = await renameDocumentFolder(
            tempReferenceNumber,
            newProperty.referenceNumber,
            documentIds
          );
          
          // Update the uploadedDocuments state with new URLs
          setUploadedDocuments(prev => 
            prev.map(doc => {
              const renamed = renamedDocuments.find(r => r.docId === doc.docId);
              if (renamed) {
                return {
                  ...doc,
                  documentKey: renamed.newDocumentKey,
                  fileUrl: renamed.newUrl
                };
              }
              return doc;
            })
          );
          
          console.log(`Successfully renamed ${renamedDocuments.length} documents`);
        } catch (renameError) {
          console.error("Error renaming S3 folder:", renameError);
          // Continue with property creation even if renaming fails
        }
      }
      
      return newProperty; // Return the property data for redirection
    } catch (error) {
      console.error("Error creating property:", error);
      alert("Error al crear la propiedad. Por favor, inténtalo de nuevo.");
      throw error; // Re-throw the error so the calling function can handle it
    } finally {
      setIsCreatingProperty(false)
    }
  };

  const nextStep = async () => {
    // If we're on the initial step and cadastral reference is filled, create property and redirect
    if (currentStep === 0 && formData.cadastralReference.trim()) {
      try {
        const newProperty = await handleCreatePropertyFromCadastral(formData.cadastralReference.trim());
        
        if (newProperty && newProperty.listingId) {
          router.push(`/propiedades/crear/${newProperty.listingId}?method=catastro`);
          return;
        }
      } catch (error) {
        console.error("Error creating property from cadastral:", error);
        alert("Error al crear la propiedad. Por favor, inténtalo de nuevo.");
        return;
      }
    }
    
    // If we're on the location step, validate and create property
    if (currentStep === 1) {
      if (!formData.street.trim()) {
        alert("Por favor, introduce la dirección de la propiedad.");
        return;
      }
      
      try {
        const newProperty = await handleCreatePropertyFromLocation({
          street: formData.street.trim(),
          addressDetails: formData.addressDetails.trim(),
          postalCode: formData.postalCode.trim(),
          city: formData.city.trim(),
          province: formData.province.trim(),
          municipality: formData.municipality.trim(),
          neighborhood: formData.neighborhood.trim(),
        });
        
        // If Nominatim validation failed, newProperty will be null
        if (!newProperty) {
          return; // Don't proceed with redirect
        }
        
        if (newProperty && newProperty.listingId) {
          router.push(`/propiedades/crear/${newProperty.listingId}?method=manual`);
          return;
        }
      } catch (error) {
        console.error("Error creating property from location:", error);
        return;
      }
    }
    
    // If we're on step 0 without cadastral reference, go to next step
    if (currentStep === 0) {
      setDirection("forward")
      setCurrentStep(1)
    }
  }

  const autoCompleteAddress = async () => {
    if (!formData.street.trim()) {
      alert("Por favor, introduce al menos la dirección de la propiedad.");
      return;
    }
    
    try {
      setIsCreatingProperty(true)
      
      // Use Nominatim to auto-complete missing fields
      const addressString = [
        formData.street.trim(),
        formData.city.trim()
      ].filter(Boolean).join(', ')
      
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1&countrycodes=es&addressdetails=1`
      
      const response = await fetch(nominatimUrl)
      const nominatimResults = await response.json()
      
      if (nominatimResults.length === 0) {
        alert("No se pudo encontrar la dirección. Por favor, verifica que la dirección sea correcta.");
        return
      }
      
      const result = nominatimResults[0]
      console.log("Nominatim auto-completion successful:", result)
      
      // Update form data with Nominatim results
      setFormData(prev => ({
        ...prev,
        postalCode: prev.postalCode ?? result.address?.postcode ?? "",
        city: prev.city ?? result.address?.city ?? result.address?.town ?? "",
        province: prev.province ?? result.address?.state ?? "",
        municipality: prev.municipality ?? result.address?.city ?? result.address?.town ?? "",
        neighborhood: prev.neighborhood ?? result.address?.suburb ?? "",
        latitude: result.lat ?? "",
        longitude: result.lon ?? ""
      }))
      
    } catch (error) {
      console.error("Error auto-completing address:", error);
      alert("Error al autocompletar la dirección. Por favor, inténtalo de nuevo.");
    } finally {
      setIsCreatingProperty(false)
    }
  }

  // Check if all location fields are filled
  const areAllLocationFieldsFilled = () => {
    return formData.street.trim() && 
           formData.postalCode.trim() && 
           formData.city.trim() && 
           formData.province.trim() && 
           formData.municipality.trim()
  }

  // File upload handlers
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    
    for (const file of files) {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        await handleFileUpload(file)
      }
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

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      for (const file of Array.from(files)) {
        if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
          await handleFileUpload(file)
        }
      }
    }
    // Reset the input value so the same file can be selected again
    e.target.value = ''
  }, [])

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 10
      })
    }, 200)
    
    try {
      // Generate a temporary reference number if we don't have one yet
      let currentTempRef = tempReferenceNumber;
      if (!currentTempRef) {
        currentTempRef = `temp_${Date.now()}`;
        setTempReferenceNumber(currentTempRef);
      }
      
      const userId = BigInt(1) // You may want to get this from context or props
      
      const uploadedDocument = await uploadDocument(
        file,
        userId,
        currentTempRef,
        uploadedDocuments.length + 1,
        'ficha_propiedad'
      )
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      setUploadedDocuments(prev => [...prev, {
        docId: uploadedDocument.docId,
        documentKey: uploadedDocument.documentKey,
        fileUrl: uploadedDocument.fileUrl,
        filename: uploadedDocument.filename,
        fileType: uploadedDocument.fileType
      }])
      
      // Process document with OCR in background (fire and forget)
      // This won't block the UI and will process the document for text extraction
      processDocumentInBackground(uploadedDocument.documentKey)
        .catch(error => {
          console.error('Background OCR processing failed:', error)
          // Don't show this error to the user since it's background processing
        })
      
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
      
    } catch (error) {
      clearInterval(progressInterval)
      console.error('Error uploading document:', error)
      setIsUploading(false)
      setUploadProgress(0)
      alert('Error al subir el archivo. Por favor, inténtalo de nuevo.')
    }
  }

  const handleDeleteDocument = async (docId: bigint, documentKey: string) => {
    setDocumentToDelete({ docId, documentKey })
    setShowDeleteDialog(true)
  }

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return
    
    setIsDeleting(true)
    try {
      await deleteDocument(documentToDelete.documentKey, documentToDelete.docId)
      setUploadedDocuments(prev => prev.filter(doc => doc.docId !== documentToDelete.docId))
      setShowDeleteDialog(false)
      setDocumentToDelete(null)
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Error al eliminar el archivo. Por favor, inténtalo de nuevo.')
    } finally {
      setIsDeleting(false)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection("backward")
      setCurrentStep((prev) => prev - 1)
    }
  }

  // Get property type display name
  const getPropertyTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      piso: "Piso",
      casa: "Casa",
      garaje: "Garaje",
      local: "Local",
      solar: "Solar",
    }
    return types[type] || type
  }

  const renderStepContent = () => {
    const step = currentSteps[currentStep]
    const propertyType = formData.propertyType as PropertyType

    if (!step) {
      return <div>Step not found</div>
    }

    switch (step.id) {
      case "initial":
        return (
          <div className="space-y-8">
            {/* Referencia Catastral Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <h3 className="text-md font-medium text-gray-900">Referencia Catastral</h3>
                <div className="relative tooltip-container">
                  <button
                    className="w-5 h-5 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium hover:bg-gray-200 transition-colors"
                    onClick={() => setShowCadastralTooltip(!showCadastralTooltip)}
                  >
                    <Info className="w-3 h-3" />
                  </button>
                  {showCadastralTooltip && (
                    <div className="absolute top-8 left-0 z-10 w-64 p-3 bg-gray-600 text-white text-sm rounded-lg shadow-lg">
                      <p>Rellenar las fichas lleva <span className="font-bold text-orange-300">30 minutos</span> de media. Ahorra 4 minutos introduciendo la referencia catastral</p>
                      <div className="absolute -top-1 left-3 w-2 h-2 bg-gray-600 transform rotate-45"></div>
                    </div>
                  )}
                </div>
              </div>
              <Input
                id="cadastralReference"
                value={formData.cadastralReference}
                onChange={handleEventInputChange("cadastralReference")}
                placeholder="Referencia Catastral"
                className="h-12 text-sm"
              />
            </div>

            {/* Ficha de Propiedad Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <h3 className="text-md font-medium text-gray-900">Ficha de Propiedad</h3>
                <div className="relative tooltip-container">
                  <button
                    className="w-5 h-5 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium hover:bg-gray-200 transition-colors"
                    onClick={() => setShowUploadTooltip(!showUploadTooltip)}
                  >
                    <Info className="w-3 h-3" />
                  </button>
                  {showUploadTooltip && (
                    <div className="absolute top-8 left-0 z-10 w-72 p-3 bg-gray-600 text-white text-sm rounded-lg shadow-lg">
                      <p>Ahorra hasta <span className="font-bold text-orange-300">15 minutos</span> si tienes una foto de la ficha o el documento completado en PDF</p>
                      <div className="absolute -top-1 left-3 w-2 h-2 bg-gray-600 transform rotate-45"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Area or Document Preview */}
              {uploadedDocuments.length === 0 && !isUploading ? (
                <div
                  className={`transition-colors border-2 border-dashed rounded-lg min-h-[200px] flex items-center justify-center ${
                    isDragOver 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                  } cursor-pointer group`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById("fichaPropiedadInput")?.click()}
                >
                  <div className="space-y-3 text-center">
                    <div className="mx-auto w-10 h-10 bg-white rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                      <Upload className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Subir documentos o tomar foto</p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG o usar cámara</p>
                    </div>
                  </div>
                </div>
              ) : isUploading ? (
                <div className="border border-gray-200 rounded-lg p-6 min-h-[200px] flex items-center justify-center">
                  <div className="w-full max-w-md space-y-4">
                    <div className="w-full space-y-2">
                      <div className="h-0.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gray-400 transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 text-center">Subiendo archivo...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploadedDocuments.map((document, index) => (
                    <div key={document.docId.toString()} className="border border-gray-200 rounded-lg overflow-hidden">
                      {document.fileType === 'application/pdf' ? (
                        <div className="relative group h-[300px]">
                          <iframe
                            src={document.fileUrl}
                            className="w-full h-full border-0"
                            title={`Document Preview ${index + 1}`}
                          />
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <div className="absolute bottom-3 right-3 flex gap-2 pointer-events-auto">
                              <button
                                onClick={() => window.open(document.fileUrl, '_blank')}
                                className="bg-white/80 hover:bg-white text-gray-700 rounded-full p-2.5 shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
                                title="Abrir en nueva pestaña"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(document.docId, document.documentKey)}
                                className="bg-white/80 hover:bg-red-50 text-red-600 rounded-full p-2.5 shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
                                title="Eliminar documento"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg pointer-events-auto">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-700">{document.filename}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group h-[300px]">
                          <img
                            src={document.fileUrl}
                            alt={`Document ${index + 1}`}
                            className="w-full h-full object-contain bg-gray-50"
                          />
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <div className="absolute bottom-3 right-3 flex gap-2 pointer-events-auto">
                              <button
                                onClick={() => window.open(document.fileUrl, '_blank')}
                                className="bg-white/80 hover:bg-white text-gray-700 rounded-full p-2.5 shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
                                title="Abrir en nueva pestaña"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(document.docId, document.documentKey)}
                                className="bg-white/80 hover:bg-red-50 text-red-600 rounded-full p-2.5 shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
                                title="Eliminar documento"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg pointer-events-auto">
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-700">{document.filename}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Add more files button */}
                  <button
                    onClick={() => document.getElementById("fichaPropiedadInput")?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center justify-center space-x-2 text-gray-600 group-hover:text-gray-700">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm font-medium">Añadir más archivos</span>
                    </div>
                  </button>
                </div>
              )}

              <input
                id="fichaPropiedadInput"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>
        )

      case "location":
        return (
          <div>
            <FloatingLabelInput
              id="street"
              value={formData.street}
              onChange={handleInputChange("street")}
              placeholder="Dirección"
            />
            <FloatingLabelInput
              id="addressDetails"
              value={formData.addressDetails}
              onChange={handleInputChange("addressDetails")}
              placeholder="Piso, puerta, otro"
            />
            <FloatingLabelInput
              id="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange("postalCode")}
              placeholder="Código Postal"
            />
            <FloatingLabelInput
              id="city"
              value={formData.city}
              onChange={handleInputChange("city")}
              placeholder="Ciudad"
            />
            <FloatingLabelInput
              id="province"
              value={formData.province}
              onChange={handleInputChange("province")}
              placeholder="Comunidad"
            />
            <FloatingLabelInput
              id="municipality"
              value={formData.municipality}
              onChange={handleInputChange("municipality")}
              placeholder="Municipio"
            />
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Contenido específico para {getPropertyTypeDisplay(propertyType)} - {step.id}
            </p>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm">Este paso contendría campos específicos para el tipo de propiedad seleccionado.</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-gray-900 mb-6 text-center">ALTA NUEVO INMUEBLE</h1>
          </div>

          <div className="mb-6">
            {currentSteps[currentStep]?.id !== "initial" && (
              <h2 className="text-md font-medium text-gray-900 mb-4">{currentSteps[currentStep]?.title || "Step"}</h2>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: direction === "forward" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction === "forward" ? -20 : 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0 || isCreatingProperty}
              className="flex items-center space-x-2 h-8"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </Button>

            {currentStep === 1 && !areAllLocationFieldsFilled() ? (
              <Button 
                onClick={autoCompleteAddress} 
                disabled={isCreatingProperty || !formData.street.trim()}
                className="flex items-center space-x-2 h-8"
              >
                {isCreatingProperty ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Autocompletando...</span>
                  </>
                ) : (
                  <>
                    <span>Autocompletar</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={nextStep} 
                disabled={isCreatingProperty}
                className="flex items-center space-x-2 h-8"
              >
                {isCreatingProperty ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Creando propiedad...</span>
                  </>
                ) : (
                  <>
                    <span>Siguiente</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Eliminar documento?</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. El documento se eliminará permanentemente.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteDocument}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

