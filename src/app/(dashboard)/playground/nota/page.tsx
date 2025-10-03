"use client";

import React, { useState } from 'react';
import { NotaEncargoDocument } from '~/components/documents/nota-encargo-document';
import { toast } from 'sonner';
import { Loader2, Download, FileText } from 'lucide-react';
import { getNotaEncargoData } from '~/server/queries/nota-encargo';
import { transformToNotaEncargoPDF } from '~/lib/nota-encargo-helpers';
import { cn } from '~/lib/utils';

// Mock data for the document
const mockData = {
  documentNumber: "HE-VESTA2024000001-1696123456789",
  
  agency: {
    agentName: "Mª. Azucena Ramos López",
    collegiateNumber: "11.492",
    agentNIF: "30.567.415-R",
    website: "www.inmobiliariaacropolis.es",
    email: "acropolisinmobiliaria@yahoo.es",
    offices: [
      {
        address: "C/ Velázquez 10",
        city: "León",
        postalCode: "24005",
        phone: "987 21 81 00"
      },
      {
        address: "Plaza Santa María 1 – 1º",
        city: "Benavente",
        postalCode: "49600", 
        phone: "980 63 63 64"
      },
      {
        address: "C/ Simón Bolívar 19",
        city: "Bilbao",
        postalCode: "48010",
        phone: "625 17 44 49"
      },
      {
        address: "C/ Aviador Zorita 6",
        city: "Madrid", 
        postalCode: "28020",
        phone: "617 42 98 97"
      }
    ]
  },
  
  client: {
    fullName: "Juan Pérez García",
    nif: "12345678A",
    address: "Calle Mayor 123, 3º B",
    city: "León",
    postalCode: "24001",
    phone: "987 654 321"
  },
  
  property: {
    description: "Piso de 3 habitaciones y 2 baños en zona centro de León, completamente reformado con calefacción central",
    allowSignage: "Sí",
    energyCertificate: "Disponible - Certificación E",
    keyDelivery: "Sí",
    allowVisits: "Sí"
  },
  
  operation: {
    type: "Venta",
    price: "185.000"
  },
  
  commission: {
    percentage: 3,
    minimum: "1.500"
  },
  
  duration: {
    months: 12
  },
  
  signatures: {
    location: "León",
    date: new Date().toLocaleDateString('es-ES')
  },
  
  jurisdiction: {
    city: "León"
  },
  
  observations: "",
  
  hasOtherAgency: false,
  gdprConsent: false
};

export default function NotaEncargoPlayground() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedPdf, setLastGeneratedPdf] = useState<string | null>(null);
  const [displayData, setDisplayData] = useState(mockData);
  const [isLoading, setIsLoading] = useState(false);
  const [useRealData, setUseRealData] = useState(false);
  
  // Specific listing ID you want to test with
  const testListingId = BigInt(2251799813685252);
  
  // Sample terms for testing
  const sampleTerms = {
    commission: 3.5,
    min_commission: 2000,
    duration: 12,
    exclusivity: true,
    communications: false,
    allowSignage: true,
    allowVisits: true,
  };

  // Load real data when requested
  const loadRealData = async () => {
    setIsLoading(true);
    try {
      console.log("🔄 Loading real data for listing:", testListingId);
      const rawData = await getNotaEncargoData(testListingId);
      
      if (rawData) {
        const realData = transformToNotaEncargoPDF(rawData, sampleTerms);
        setDisplayData(realData);
        setUseRealData(true);
        toast.success("Datos reales cargados correctamente");
        console.log("✅ Real data loaded:", realData);
      } else {
        toast.error("No se pudieron cargar los datos reales");
      }
    } catch (error) {
      console.error("❌ Error loading real data:", error);
      toast.error("Error al cargar los datos reales");
    } finally {
      setIsLoading(false);
    }
  };

  // Switch back to mock data
  const loadMockData = () => {
    setDisplayData(mockData);
    setUseRealData(false);
    toast.success("Datos de ejemplo cargados");
  };

  // Generate PDF using Puppeteer
  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      console.log("🚀 Starting Nota de Encargo PDF generation...");
      const response = await fetch("/api/nota-encargo/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: displayData,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? "PDF generation failed");
      }

      // Get the PDF blob
      const pdfBlob = await response.blob();
      
      // Create download link
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setLastGeneratedPdf(pdfUrl);
      
      // Automatically download the PDF
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `nota-encargo-${mockData.documentNumber}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("PDF generado exitosamente!");
      console.log("✅ PDF generated and downloaded");
    } catch (error) {
      console.error("❌ PDF generation error:", error);
      toast.error(
        `Error al generar PDF: ${error instanceof Error ? error.message : "Error desconocido"}`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:m-0 print:bg-white">
      <div className="max-w-4xl mx-auto print:max-w-none print:mx-0">
        <div className="mb-6 print:hidden">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Playground - Nota de Encargo
          </h1>
          <p className="text-gray-600">
            Vista previa del documento de Nota de Encargo con datos de ejemplo
          </p>
        </div>
        
        <div className="bg-white shadow-lg print:shadow-none">
          <NotaEncargoDocument data={displayData} />
        </div>
        
        <div className="mt-6 space-y-4">
          {/* Data Source Controls */}
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Fuente de Datos</h3>
            <div className="flex gap-4">
              <button 
                onClick={loadMockData}
                disabled={isLoading}
                className={cn(
                  "px-4 py-2 text-sm rounded-md flex items-center gap-2 transition-colors",
                  !useRealData 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                )}
              >
                Datos de Ejemplo
              </button>
              
              <button 
                onClick={loadRealData}
                disabled={isLoading}
                className={cn(
                  "px-4 py-2 text-sm rounded-md flex items-center gap-2 transition-colors",
                  useRealData 
                    ? "bg-green-600 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    Datos Reales (ID: {testListingId.toString()})
                  </>
                )}
              </button>
            </div>
            {useRealData && (
              <p className="text-xs text-green-600 mt-2">
                ✅ Mostrando datos reales de la propiedad {testListingId.toString()}
              </p>
            )}
          </div>
          
          {/* Action Controls */}
          <div className="flex gap-4">
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Imprimir Documento
            </button>
          
          <button 
            onClick={generatePDF}
            disabled={isGenerating}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Generar PDF
              </>
            )}
          </button>
          
          {lastGeneratedPdf && (
            <button 
              onClick={() => window.open(lastGeneratedPdf, "_blank")}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Abrir Último PDF
            </button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}