"use client";

import React, { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { FileText, Upload, Trash2, Eye, Plus, X, Pencil } from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";

interface Cartel {
  docId: bigint;
  filename: string;
  fileUrl: string;
  documentKey: string;
  uploadedAt: Date;
}

interface CartelesManagerProps {
  propertyId: bigint;
  listingId: bigint;
  referenceNumber: string;
  className?: string;
  carteles?: Cartel[];
  loading?: boolean;
  onRefreshCarteles?: () => void;
}

export function CartelesManager({
  propertyId,
  listingId,
  referenceNumber,
  className = "",
  carteles = [],
  loading = false,
  onRefreshCarteles,
}: CartelesManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [cartelToDelete, setCartelToDelete] = useState<Cartel | null>(null);

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      // Validate file type
      if (file.type !== "application/pdf") {
        toast.error(`${file.name} no es un archivo PDF válido`);
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("propertyId", propertyId.toString());
        formData.append("listingId", listingId.toString());
        formData.append("referenceNumber", referenceNumber);
        formData.append("documentTag", "carteles");

        const response = await fetch(`/api/properties/${listingId}/carteles`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const result = await response.json() as { document: Cartel };
        toast.success(`${file.name} subido correctamente`);
        return result.document;
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        toast.error(`Error al subir ${file.name}`);
        return null;
      }
    });

    try {
      await Promise.all(uploadPromises);
      onRefreshCarteles?.(); // Refresh the list
    } catch (error) {
      console.error("Error during upload:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (cartel: Cartel) => {
    setCartelToDelete(cartel);
  };

  const handleDeleteConfirm = async () => {
    if (!cartelToDelete) return;

    try {
      const response = await fetch(`/api/properties/${listingId}/carteles`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          docId: cartelToDelete.docId.toString(),
          documentKey: cartelToDelete.documentKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete cartel");
      }

      toast.success(`${cartelToDelete.filename} eliminado correctamente`);
      onRefreshCarteles?.(); // Refresh the list
    } catch (error) {
      console.error("Error deleting cartel:", error);
      toast.error("Error al eliminar el cartel");
    } finally {
      setCartelToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setCartelToDelete(null);
  };

  const handleDownload = (cartel: Cartel) => {
    window.open(cartel.fileUrl, "_blank");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files) {
      void handleFileUpload(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      void handleFileUpload(files);
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array<undefined>(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-16 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Carteles Grid */}
      {carteles.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay carteles</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Sube archivos PDF para comenzar a gestionar los carteles de esta propiedad
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {carteles.map((cartel) => (
            <Card
              key={cartel.docId.toString()}
              className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm bg-white"
            >
              <CardContent className="p-0">
                {/* PDF Preview Area */}
                <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 border-b overflow-hidden rounded-t-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* PDF Preview - Using iframe with zoom for better coverage */}
                    <iframe
                      src={`${cartel.fileUrl}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH&zoom=120`}
                      className="w-[110%] h-[110%] object-cover group-hover:opacity-30 transition-all duration-300 transform scale-110"
                      title={`Preview of ${cartel.filename}`}
                      style={{ 
                        filter: 'contrast(1.1) brightness(0.95)',
                        transform: 'scale(1.1) translate(-5%, -5%)'
                      }}
                    />
                    {/* Subtle overlay for better visual integration */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20 group-hover:to-white/10 transition-all duration-300" />
                  </div>
                  
                  {/* Action buttons overlay */}
                  <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(cartel)}
                      className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm border-0"
                    >
                      <Eye className="h-3.5 w-3.5 text-gray-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDeleteClick(cartel)}
                      className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-red-50 shadow-sm border-0"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-gray-600 hover:text-red-600" />
                    </Button>
                  </div>

                </div>

                {/* File Info */}
                <div className="p-4 space-y-2">
                  <div className="min-h-[2.5rem]">
                    <h4 
                      className="font-medium text-gray-900 text-sm leading-tight line-clamp-2" 
                      title={cartel.filename}
                    >
                      {cartel.filename.replace('.pdf', '')}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(cartel.uploadedAt).toLocaleDateString('es-ES', { 
                      day: 'numeric', 
                      month: 'short',
                      year: 'numeric'
                    })}</span>
                    <span className="flex items-center space-x-1">
                      <FileText className="h-3 w-3" />
                      <span>PDF</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = `/propiedades/${listingId}/cartel-editor`}
          className="h-10 w-10 rounded-full p-0 border-gray-200 hover:border-gray-300 transition-all duration-300"
        >
          <Pencil className="h-4 w-4 text-gray-600" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowUpload(!showUpload)}
          className={cn(
            "h-10 w-10 rounded-full p-0 border-gray-200 hover:border-gray-300 transition-all duration-300",
            showUpload && "bg-gray-50 border-gray-300"
          )}
        >
          {showUpload ? (
            <X className="h-4 w-4 text-gray-600" />
          ) : (
            <Plus className="h-4 w-4 text-gray-600" />
          )}
        </Button>
      </div>

      {/* Upload Area - Collapsible */}
      {showUpload && (
        <div
          className={cn(
            "relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 animate-in fade-in-0 slide-in-from-top-2",
            dragOver
              ? "border-blue-400 bg-blue-50 shadow-md scale-[1.02]"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
            uploading && "pointer-events-none opacity-50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="cartel-upload"
            className="absolute inset-0 cursor-pointer opacity-0"
            multiple
            accept="application/pdf"
            onChange={handleFileInputChange}
            disabled={uploading}
          />
          <div className="flex flex-col items-center space-y-4">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300",
              dragOver 
                ? "bg-blue-100" 
                : "bg-gray-100"
            )}>
              <Upload className={cn(
                "h-8 w-8 transition-colors duration-300",
                dragOver 
                  ? "text-blue-500" 
                  : uploading 
                    ? "text-gray-400 animate-pulse" 
                    : "text-gray-500"
              )} />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium text-gray-900">
                {uploading ? "Subiendo carteles..." : dragOver ? "Suelta los archivos aquí" : "Subir carteles PDF"}
              </p>
              <p className="text-sm text-gray-500">
                {uploading ? "Por favor espera..." : "Arrastra archivos o haz clic para seleccionar"}
              </p>
              <p className="text-xs text-gray-400">
                Solo archivos PDF • Múltiples archivos permitidos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={!!cartelToDelete} onOpenChange={handleDeleteCancel}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar <strong>{cartelToDelete?.filename}</strong>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}