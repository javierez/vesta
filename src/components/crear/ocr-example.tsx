"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { processPropertyDocument, type ExtractedPropertyData, type OCRResult } from "~/server/ocr/ocr-initial-form"
import { Loader, CheckCircle, XCircle, FileText } from "lucide-react"

interface OCRExampleProps {
  documentKey: string
  onDataExtracted?: (data: ExtractedPropertyData) => void
}

export default function OCRExample({ documentKey, onDataExtracted }: OCRExampleProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [extractedData, setExtractedData] = useState<ExtractedPropertyData | null>(null)

  // Example of Option 1: Fire-and-Forget with Promise
  const handleProcessDocument = () => {
    setIsProcessing(true)
    
    // Fire and forget - don't await, show loading immediately
    processPropertyDocument(documentKey)
      .then(result => {
        setOcrResult(result.ocrResult)
        setExtractedData(result.extractedData)
        setIsProcessing(false)
        
        // Call callback if provided (e.g., to auto-fill form fields)
        if (onDataExtracted && result.extractedData) {
          onDataExtracted(result.extractedData)
        }
      })
      .catch(error => {
        console.error('OCR processing failed:', error)
        setIsProcessing(false)
        // Could show error toast here
      })
  }

  // Example of background processing that doesn't block UI
  const handleBackgroundProcess = () => {
    // This runs completely in background - user doesn't see loading
    processPropertyDocument(documentKey)
      .then(result => {
        console.log('Background OCR completed:', result)
        // Could store in database, show notification, etc.
      })
      .catch(error => {
        console.error('Background OCR failed:', error)
      })
    
    // Show immediate feedback
    alert('Document processing started in background. Results will be logged to console.')
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">OCR Document Processing</h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleProcessDocument} 
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Process Document
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleBackgroundProcess}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Process in Background
            </Button>
          </div>

          {/* Results Display */}
          {ocrResult && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                {ocrResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  {ocrResult.success ? 'OCR Processing Successful' : 'OCR Processing Failed'}
                </span>
                {ocrResult.success && (
                  <span className="text-sm text-gray-500">
                    (Confidence: {ocrResult.confidence.toFixed(1)}%)
                  </span>
                )}
              </div>

              {ocrResult.success && (
                <>
                  {/* Extracted Property Data */}
                  {extractedData && Object.keys(extractedData).length > 0 && (
                    <Card className="p-4 bg-green-50">
                      <h4 className="font-medium text-green-800 mb-2">Extracted Property Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {extractedData.address && (
                          <div><span className="font-medium">Address:</span> {extractedData.address}</div>
                        )}
                        {extractedData.squareMeters && (
                          <div><span className="font-medium">Size:</span> {extractedData.squareMeters} m²</div>
                        )}
                        {extractedData.propertyType && (
                          <div><span className="font-medium">Type:</span> {extractedData.propertyType}</div>
                        )}
                        {extractedData.yearBuilt && (
                          <div><span className="font-medium">Year Built:</span> {extractedData.yearBuilt}</div>
                        )}
                        {extractedData.bedrooms && (
                          <div><span className="font-medium">Bedrooms:</span> {extractedData.bedrooms}</div>
                        )}
                        {extractedData.bathrooms && (
                          <div><span className="font-medium">Bathrooms:</span> {extractedData.bathrooms}</div>
                        )}
                        {extractedData.price && (
                          <div><span className="font-medium">Price:</span> {extractedData.price}</div>
                        )}
                        {extractedData.cadastralReference && (
                          <div><span className="font-medium">Cadastral Ref:</span> {extractedData.cadastralReference}</div>
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Form Fields Detected */}
                  {ocrResult.detectedFields && Object.keys(ocrResult.detectedFields).length > 0 && (
                    <Card className="p-4 bg-blue-50">
                      <h4 className="font-medium text-blue-800 mb-2">Detected Form Fields</h4>
                      <div className="space-y-1 text-sm">
                        {Object.entries(ocrResult.detectedFields).map(([key, field]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium">{key}:</span>
                            <span>{field.text} ({field.confidence.toFixed(1)}%)</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Raw Extracted Text */}
                  <details>
                    <summary className="cursor-pointer font-medium text-gray-700">
                      View Raw Extracted Text ({ocrResult.extractedText.length} characters)
                    </summary>
                    <Card className="mt-2 p-4 bg-gray-50">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 max-h-60 overflow-y-auto">
                        {ocrResult.extractedText}
                      </pre>
                    </Card>
                  </details>
                </>
              )}

              {ocrResult.error && (
                <Card className="p-4 bg-red-50">
                  <p className="text-red-800 text-sm">{ocrResult.error}</p>
                </Card>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
} 