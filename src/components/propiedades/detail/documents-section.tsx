"use client";

import { useState, useCallback } from "react";
import { DocumentUploadCard } from "./document-upload-card";
import { HojaEncargoButton } from "./initial_docs/hoja-encargo-button";
import { DocumentsPage } from "./documents-page";
import { Button } from "~/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "~/lib/utils";

interface Document {
  docId: bigint;
  filename: string;
  fileType: string;
  fileUrl: string;
  uploadedAt: Date;
  documentKey: string;
}

interface DocumentsSectionProps {
  listing: {
    listingId: bigint;
    propertyId: bigint;
    referenceNumber?: string | null;
    street?: string | null;
    city?: string | null;
  };
  folderType: "documentacion-inicial" | "visitas" | "otros" | "planos";
}

export function DocumentsSection({ listing, folderType }: DocumentsSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDocumentsUploaded = useCallback((_newDocuments: Document[]) => {
    // Trigger a refresh of the documents list
    setRefreshKey(prev => prev + 1);
  }, []);

  // Map folder types for API calls
  const folderTypeMap = {
    "documentacion-inicial": "initial-docs",
    visitas: "visitas",
    otros: "others",
    planos: "planos",
  } as const;

  const handleFileUpload = () => {
    if (!isUploading) {
      document.getElementById("documents-file-input")?.click();
    }
  };

  const handleFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const apiFolderType = folderTypeMap[folderType];
      
      // Upload all files
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folderType", apiFolderType);

        const response = await fetch(
          `/api/properties/${listing.listingId}/documents`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        return response.json() as Promise<Document>;
      });

      const uploadedDocuments = await Promise.all(uploadPromises);
      handleDocumentsUploaded(uploadedDocuments);
      toast.success(`${uploadedDocuments.length} documento(s) subido(s) correctamente`);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error al subir los archivos");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      void handleFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files) {
      void handleFiles(files);
    }
  };

  return (
    <>
      {folderType === "documentacion-inicial" ? (
        /* Documentación Inicial: Keep original card layout */
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            {/* Left: Upload Area */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Subir Documentos</h4>
              <DocumentUploadCard
                listingId={listing.listingId}
                folderType={folderType}
                onDocumentsUploaded={handleDocumentsUploaded}
              />
            </div>
            
            {/* Right: Generate Document */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Generar Documentos</h4>
              <HojaEncargoButton 
                propertyId={listing.propertyId}
                onDocumentGenerated={handleDocumentsUploaded}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Other folder types: Show button in top right */
        <div className="flex justify-end mb-6">
          <Button 
            onClick={handleFileUpload}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Subir Documentos
              </>
            )}
          </Button>
          
          {/* Hidden file input */}
          <input
            type="file"
            multiple
            className="hidden"
            id="documents-file-input"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      )}

      {/* Documents list with drag & drop for non-initial folders */}
      {folderType === "documentacion-inicial" ? (
        <DocumentsPage
          listing={listing}
          folderType={folderType}
          key={refreshKey} // Force re-render when documents are uploaded
        />
      ) : (
        <div
          className={cn(
            "transition-all duration-200 rounded-lg",
            isDragOver && "bg-blue-50 border-2 border-dashed border-blue-300 p-4"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragOver && (
            <div className="text-center py-8 text-blue-600">
              <Upload className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Suelta los archivos aquí para subirlos</p>
            </div>
          )}
          <DocumentsPage
            listing={listing}
            folderType={folderType}
            key={refreshKey} // Force re-render when documents are uploaded
          />
        </div>
      )}
    </>
  );
}