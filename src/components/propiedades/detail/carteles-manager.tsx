"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Input } from "~/components/ui/input";
import { Slider } from "~/components/ui/slider";
import {
  FileText, Upload, Trash2, Eye, Plus, X, Pencil, Download,
  Settings, Image as ImageIcon, Loader2, ZoomIn, ZoomOut, RotateCcw
} from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import { ClassicTemplate } from "~/components/admin/carteleria/templates/classic/classic-vertical-template";
import { getExtendedDefaultPropertyData } from "~/lib/carteleria/mock-data";
import type {
  TemplateConfiguration,
  ExtendedTemplatePropertyData,
} from "~/types/template-data";
import { AdditionalFieldsSelector } from "~/components/admin/carteleria/controls/additional-fields-selector";
import { getTemplateImages } from "~/lib/carteleria/s3-images";

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
  
  // Template editor state
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Template configuration state
  const [config, setConfig] = useState<TemplateConfiguration>({
    templateStyle: "classic",
    orientation: "vertical",
    propertyType: "piso",
    listingType: "venta",
    imageCount: 4,
    showPhone: true,
    showEmail: true,
    showWebsite: true,
    showQR: true,
    showReference: true,
    showWatermark: true,
    showIcons: true,
    showShortDescription: false,
    titleFont: "default",
    priceFont: "default",
    overlayColor: "default",
    additionalFields: ["hasElevator", "hasGarage", "energyConsumptionScale"],
  });

  // Property data state
  const [propertyData, setPropertyData] = useState<ExtendedTemplatePropertyData>(() =>
    getExtendedDefaultPropertyData("piso"),
  );
  
  // UI state
  const [showPreview, setShowPreview] = useState(true);
  const [previewZoom, setPreviewZoom] = useState(0.4);
  const [lastGeneratedPdf, setLastGeneratedPdf] = useState<string | null>(null);
  
  const previewRef = useRef<HTMLDivElement>(null);

  // Handle configuration updates
  const updateConfig = (updates: Partial<TemplateConfiguration>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  // Handle property data updates
  const updatePropertyData = (updates: Partial<ExtendedTemplatePropertyData>) => {
    setPropertyData((prev) => ({
      ...prev,
      ...updates,
      location: {
        ...prev.location,
        ...(updates.location ?? {}),
      },
      specs: {
        ...prev.specs,
        ...(updates.specs ?? {}),
      },
      contact: {
        ...prev.contact,
        ...(updates.contact ?? {}),
      },
    }));
  };

  // Handle image positioning updates
  const updateImagePosition = (imageUrl: string, x: number, y: number) => {
    setPropertyData((prev) => ({
      ...prev,
      imagePositions: {
        ...prev.imagePositions,
        [imageUrl]: { x, y },
      },
    }));
  };

  // Zoom control functions
  const zoomIn = () => setPreviewZoom((prev) => Math.min(prev + 0.1, 1.0));
  const zoomOut = () => setPreviewZoom((prev) => Math.max(prev - 0.1, 0.2));
  const resetZoom = () => setPreviewZoom(config.orientation === "vertical" ? 0.4 : 0.35);

  // Generate PDF using Puppeteer
  const generatePDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const response = await fetch("/api/puppet/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateConfig: config,
          propertyData: propertyData,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? "Error al generar PDF");
      }

      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setLastGeneratedPdf(pdfUrl);

      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `cartel-propiedad-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("PDF generado exitosamente");
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error(
        `Error al generar PDF: ${error instanceof Error ? error.message : "Error desconocido"}`,
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Preview the template in a new window
  const previewTemplate = () => {
    const templateUrl = new URL("/api/puppet/template", window.location.origin);
    templateUrl.searchParams.set("config", JSON.stringify(config));
    templateUrl.searchParams.set("data", JSON.stringify(propertyData));

    window.open(
      templateUrl.toString(),
      "_blank",
      "width=820,height=1160,scrollbars=yes,resizable=yes",
    );
  };

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

  const handleDelete = async (cartel: Cartel) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar ${cartel.filename}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/properties/${listingId}/carteles`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          docId: cartel.docId.toString(),
          documentKey: cartel.documentKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete cartel");
      }

      toast.success(`${cartel.filename} eliminado correctamente`);
      onRefreshCarteles?.(); // Refresh the list
    } catch (error) {
      console.error("Error deleting cartel:", error);
      toast.error("Error al eliminar el cartel");
    }
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
                      onClick={() => handleDelete(cartel)}
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
          onClick={() => setShowTemplateEditor(!showTemplateEditor)}
          className={cn(
            "h-10 w-10 rounded-full p-0 border-gray-200 hover:border-gray-300 transition-all duration-300",
            showTemplateEditor && "bg-blue-50 border-blue-300 text-blue-600"
          )}
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = `/propiedades/${propertyId}/cartel-editor`}
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

      {/* Template Editor - Collapsible */}
      {showTemplateEditor && (
        <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Configuration Panel */}
            <div className="space-y-6 lg:col-span-1">
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-5 w-5 text-gray-600" />
                    Configuración
                  </CardTitle>
                  <CardDescription>
                    Personaliza la apariencia de tu cartel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Settings */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="orientation" className="text-sm font-medium">Orientación</Label>
                      <Select
                        value={config.orientation}
                        onValueChange={(value: "vertical" | "horizontal") =>
                          updateConfig({ orientation: value })
                        }
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vertical">Vertical</SelectItem>
                          <SelectItem value="horizontal">Horizontal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="listingType" className="text-sm font-medium">Tipo de Listado</Label>
                      <Select
                        value={config.listingType}
                        onValueChange={(value: "venta" | "alquiler") =>
                          updateConfig({ listingType: value })
                        }
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="venta">Venta</SelectItem>
                          <SelectItem value="alquiler">Alquiler</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="imageCount" className="text-sm font-medium">Número de Imágenes</Label>
                      <Select
                        value={config.imageCount.toString()}
                        onValueChange={(value) =>
                          updateConfig({ imageCount: parseInt(value) as 3 | 4 })
                        }
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 Imágenes</SelectItem>
                          <SelectItem value="4">4 Imágenes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="propertyType" className="text-sm font-medium">Tipo de Propiedad</Label>
                      <Select
                        value={config.propertyType}
                        onValueChange={(value: "piso" | "casa" | "local" | "garaje" | "solar") => {
                          updateConfig({ propertyType: value });
                          setPropertyData(getExtendedDefaultPropertyData(value));
                        }}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="piso">Piso</SelectItem>
                          <SelectItem value="casa">Casa</SelectItem>
                          <SelectItem value="local">Local</SelectItem>
                          <SelectItem value="garaje">Garaje</SelectItem>
                          <SelectItem value="solar">Solar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="overlayColor" className="text-sm font-medium">Color de Overlay</Label>
                      <Select
                        value={config.overlayColor}
                        onValueChange={(value: "default" | "dark" | "light" | "blue" | "green" | "purple" | "red") => 
                          updateConfig({ overlayColor: value })
                        }
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Gris Predeterminado</SelectItem>
                          <SelectItem value="dark">Oscuro</SelectItem>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="blue">Azul</SelectItem>
                          <SelectItem value="green">Verde</SelectItem>
                          <SelectItem value="purple">Púrpura</SelectItem>
                          <SelectItem value="red">Rojo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Display Options */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Opciones de Visualización</h4>
                    <div className="space-y-3">
                      {[
                        { key: "showPhone" as const, label: "Mostrar Teléfono" },
                        { key: "showEmail" as const, label: "Mostrar Email" },
                        { key: "showWebsite" as const, label: "Mostrar Website" },
                        { key: "showQR" as const, label: "Mostrar Código QR" },
                        { key: "showReference" as const, label: "Mostrar Referencia" },
                        { key: "showWatermark" as const, label: "Mostrar Marca de Agua" },
                        { key: "showIcons" as const, label: "Mostrar Iconos" },
                        { key: "showShortDescription" as const, label: "Descripción Corta" },
                      ].map(({ key, label }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <Label htmlFor={key} className="text-sm font-medium">
                            {label}
                          </Label>
                          <Switch
                            id={key}
                            checked={config[key] ?? false}
                            onCheckedChange={(checked) =>
                              updateConfig({ [key]: checked })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Fields */}
                  <AdditionalFieldsSelector
                    config={config}
                    onChange={updateConfig}
                  />
                </CardContent>
              </Card>

              {/* Property Data Editor */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Datos de la Propiedad
                  </CardTitle>
                  <CardDescription>Edita la información de la propiedad</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium">Título</Label>
                    <Input
                      id="title"
                      value={propertyData.title}
                      onChange={(e) => updatePropertyData({ title: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price" className="text-sm font-medium">Precio (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={propertyData.price}
                      onChange={(e) => updatePropertyData({ price: parseInt(e.target.value) || 0 })}
                      className="mt-1.5"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="bedrooms" className="text-sm font-medium">Habitaciones</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        value={propertyData.specs.bedrooms ?? 0}
                        onChange={(e) =>
                          updatePropertyData({
                            specs: {
                              ...propertyData.specs,
                              bedrooms: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bathrooms" className="text-sm font-medium">Baños</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        value={propertyData.specs.bathrooms ?? 0}
                        onChange={(e) =>
                          updatePropertyData({
                            specs: {
                              ...propertyData.specs,
                              bathrooms: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sqm" className="text-sm font-medium">Metros Cuadrados</Label>
                    <Input
                      id="sqm"
                      type="number"
                      value={propertyData.specs.squareMeters}
                      onChange={(e) =>
                        updatePropertyData({
                          specs: {
                            ...propertyData.specs,
                            squareMeters: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="mt-1.5"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium">Ciudad</Label>
                      <Input
                        id="city"
                        value={propertyData.location.city}
                        onChange={(e) =>
                          updatePropertyData({
                            location: {
                              ...propertyData.location,
                              city: e.target.value,
                            },
                          })
                        }
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="neighborhood" className="text-sm font-medium">Barrio</Label>
                      <Input
                        id="neighborhood"
                        value={propertyData.location.neighborhood}
                        onChange={(e) =>
                          updatePropertyData({
                            location: {
                              ...propertyData.location,
                              neighborhood: e.target.value,
                            },
                          })
                        }
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">Teléfono</Label>
                    <Input
                      id="phone"
                      value={propertyData.contact.phone}
                      onChange={(e) =>
                        updatePropertyData({
                          contact: {
                            ...propertyData.contact,
                            phone: e.target.value,
                          },
                        })
                      }
                      className="mt-1.5"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Image Positioning Controls */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ImageIcon className="h-5 w-5 text-gray-600" />
                    Posicionamiento de Imágenes
                  </CardTitle>
                  <CardDescription>
                    Ajusta la posición de las imágenes dentro de sus contenedores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {getTemplateImages(config.imageCount).map((imageUrl, index) => {
                    const position = propertyData.imagePositions?.[imageUrl] ?? {
                      x: 50,
                      y: 50,
                    };
                    return (
                      <div key={`image-${index}`} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            Imagen {index + 1}
                          </span>
                          {index === 0 && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              Principal
                            </span>
                          )}
                        </div>

                        {/* Image preview with positioning */}
                        <div className="relative h-20 w-full overflow-hidden rounded-lg border bg-gray-100">
                          <img
                            src={imageUrl}
                            alt={`Preview ${index + 1}`}
                            className="absolute h-full w-full object-cover"
                            style={{
                              objectPosition: `${position.x}% ${position.y}%`,
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-xs font-medium text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                              {position.x.toFixed(0)}%, {position.y.toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        {/* X Position Slider */}
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-600">
                            Posición Horizontal ({position.x.toFixed(0)}%)
                          </Label>
                          <Slider
                            value={[position.x]}
                            onValueChange={([value]) =>
                              updateImagePosition(imageUrl, value!, position.y)
                            }
                            max={100}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        {/* Y Position Slider */}
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-600">
                            Posición Vertical ({position.y.toFixed(0)}%)
                          </Label>
                          <Slider
                            value={[position.y]}
                            onValueChange={([value]) =>
                              updateImagePosition(imageUrl, position.x, value!)
                            }
                            max={100}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        {/* Reset button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateImagePosition(imageUrl, 50, 50)}
                          className="w-full text-xs h-8"
                        >
                          Centrar
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button
                      onClick={generatePDF}
                      disabled={isGeneratingPdf}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generando PDF...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Generar PDF
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={previewTemplate}
                      variant="outline"
                      className="w-full"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Vista Previa
                    </Button>

                    <Button
                      onClick={() => setShowPreview(!showPreview)}
                      variant="outline"
                      className="w-full"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      {showPreview ? "Ocultar Preview" : "Mostrar Preview"}
                    </Button>

                    {lastGeneratedPdf && (
                      <Button
                        onClick={() => window.open(lastGeneratedPdf, "_blank")}
                        variant="secondary"
                        className="w-full"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Abrir Último PDF
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel */}
            {showPreview && (
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-gray-600" />
                        Vista Previa en Vivo
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={zoomOut}
                          disabled={previewZoom <= 0.2}
                          className="h-8 w-8 p-0"
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[60px] text-center text-sm font-medium">
                          {Math.round(previewZoom * 100)}%
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={zoomIn}
                          disabled={previewZoom >= 1.0}
                          className="h-8 w-8 p-0"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={resetZoom}
                          className="h-8 w-8 p-0"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Vista previa en tiempo real de tu cartel con la configuración actual
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      ref={previewRef}
                      className="overflow-auto border border-gray-200 bg-gray-50 p-6 rounded-lg"
                      style={{
                        height: "600px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          transform: `scale(${previewZoom})`,
                          transformOrigin: "center center",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          transition: "transform 0.2s ease-in-out",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <ClassicTemplate
                          data={propertyData}
                          config={config}
                          className="print-preview"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Preview al {Math.round(previewZoom * 100)}% • PDF final:{" "}
                        {config.orientation === "vertical" ? "794×1123" : "1123×794"}px
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Zoom:</span>
                        <Slider
                          value={[previewZoom]}
                          onValueChange={([value]) => setPreviewZoom(value!)}
                          max={1.0}
                          min={0.2}
                          step={0.05}
                          className="w-24"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}