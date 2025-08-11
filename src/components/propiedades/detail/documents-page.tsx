"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { 
  FileText, 
  Download, 
  Upload, 
  Calendar,
  MoreVertical,
  FolderIcon,
  X
} from "lucide-react";
import { cn } from "~/lib/utils";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { DocumentsPageSkeleton } from "./skeletons";

interface Document {
  docId: bigint;
  filename: string;
  fileType: string;
  fileUrl: string;
  uploadedAt: Date;
  documentKey: string;
}

interface Folder {
  id: string;
  name: string;
  description?: string;
  documents: Document[];
}

interface DocumentsPageProps {
  listing: {
    listingId: bigint;
    propertyId: bigint;
    referenceNumber?: string | null;
    street?: string | null;
    city?: string | null;
  };
  folderType: "documentacion-inicial" | "visitas" | "otros";
}

export function DocumentsPage({ listing, folderType }: DocumentsPageProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Map folder types for API calls
  const folderTypeMap = {
    "documentacion-inicial": "initial-docs",
    "visitas": "visitas", 
    "otros": "others"
  } as const;

  // Folder configurations
  const folders: Record<string, Folder> = {
    "documentacion-inicial": {
      id: "documentacion-inicial",
      name: "Documentación Inicial",
      description: "Hoja de encargo, valoración, etc.",
      documents: documents
    },
    "visitas": {
      id: "visitas",
      name: "Visitas",
      description: "Reportes de visitas.",
      documents: documents
    },
    "otros": {
      id: "otros",
      name: "Otros",
      description: "Otros documentos",
      documents: documents
    }
  };

  const apiFolderType = folderTypeMap[folderType];

  // Fetch documents on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/properties/${listing.listingId}/documents?folderType=${apiFolderType}`);
        if (response.ok) {
          const docs = await response.json() as Document[];
          setDocuments(docs);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDocuments();
  }, [listing.listingId, apiFolderType]);


  const handleFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      // Upload all files
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folderType", apiFolderType);

        const response = await fetch(`/api/properties/${listing.listingId}/documents`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        return response.json() as Promise<Document>;
      });

      const uploadedDocuments = await Promise.all(uploadPromises);
      
      // Add new documents to the state
      setDocuments(prev => [...uploadedDocuments, ...prev]);
      
    } catch (error) {
      console.error("Error uploading files:", error);
      // You might want to show a toast notification here
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleDownload = (document: Document) => {
    // Open the document URL in a new tab for download
    window.open(document.fileUrl, '_blank');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const getFileIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("pdf")) {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else if (lowerType.includes("excel") || lowerType.includes("xlsx") || lowerType.includes("sheet")) {
      return <FileText className="h-8 w-8 text-green-500" />;
    } else if (lowerType.includes("word") || lowerType.includes("doc")) {
      return <FileText className="h-8 w-8 text-blue-500" />;
    } else {
      return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };


  return (
    <div 
      className={cn(
        "pb-16 relative",
        isDragOver && "bg-blue-50/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-50/80 border-2 border-dashed border-blue-300 rounded-lg">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-blue-500 mb-2" />
            <p className="text-lg font-medium text-blue-900">Suelta los archivos aquí</p>
            <p className="text-sm text-blue-700">Se subirán automáticamente</p>
          </div>
        </div>
      )}

      {/* Upload button - more prominent but elegant */}
      <div className="mb-6 flex justify-end">
        <input
          type="file"
          multiple
          className="hidden"
          id="file-upload"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Button
            disabled={isUploading}
            className="bg-gray-900 hover:bg-gray-800 text-white"
            asChild
          >
            <span>
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Subiendo..." : "Subir"}
            </span>
          </Button>
        </label>
      </div>

      {/* Documents list - clean, no titles */}
      <div className="space-y-3">
        {isLoading ? (
          <DocumentsPageSkeleton />
        ) : (
          <>
            {documents.map((document) => (
              <Card key={document.docId.toString()} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getFileIcon(document.fileType)}
                      <div>
                        <h4 className="font-medium text-gray-900">{document.filename}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{document.fileType.toUpperCase()}</span>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(document.uploadedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownload(document)}>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <X className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {documents.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <FolderIcon className="mx-auto h-12 w-12 text-gray-400 fill-current mb-4" />
                <p className="text-gray-500">No hay documentos en esta carpeta</p>
                <p className="text-sm text-gray-400 mt-1">
                  Sube el primer documento usando el botón &quot;Subir&quot; o arrastrando archivos a la pantalla
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}