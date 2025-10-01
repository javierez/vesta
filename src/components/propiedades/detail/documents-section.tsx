"use client";

import { useState, useCallback } from "react";
import { DocumentUploadCard } from "./document-upload-card";
import { HojaEncargoButton } from "./initial_docs/hoja-encargo-button";
import { DocumentsPage } from "./documents-page";

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
  folderType: "documentacion-inicial" | "visitas" | "otros";
}

export function DocumentsSection({ listing, folderType }: DocumentsSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDocumentsUploaded = useCallback((_newDocuments: Document[]) => {
    // Trigger a refresh of the documents list
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <>
      {/* Connected action section */}
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

      {/* Documents list */}
      <DocumentsPage
        listing={listing}
        folderType={folderType}
        key={refreshKey} // Force re-render when documents are uploaded
      />
    </>
  );
}