"use client";

import type { FC } from "react";
import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  Copy,
  FileImage,
} from "lucide-react";
import { useToast } from "~/components/hooks/use-toast";
import type { TemplatePreviewProps } from "~/types/carteleria";
import {
  getStyleById,
  getFormatById,
  getPropertyTypeById,
} from "~/lib/carteleria/templates";

export const TemplatePreview: FC<TemplatePreviewProps> = ({
  template,
  isOpen,
  onClose,
  onDownload,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { toast } = useToast();

  if (!template) return null;

  const style = getStyleById(template.styleId);
  const format = getFormatById(template.formatId);
  const propertyType = getPropertyTypeById(template.propertyTypeId);

  const handleDownload = async () => {
    try {
      if (onDownload) {
        onDownload(template);
      } else {
        // Default download behavior
        const link = document.createElement("a");
        link.href = template.preview;
        link.download = `${template.name.replace(/\s+/g, "_")}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: "Descarga iniciada",
        description: `Descargando ${template.name}...`,
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo descargar la plantilla",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: template.name,
          text: template.description,
          url: window.location.href,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Enlace copiado",
          description: "El enlace se ha copiado al portapapeles",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleCopyInfo = async () => {
    const templateInfo = `
${template.name}
${template.description}
Estilo: ${style?.name ?? "N/A"}
Formato: ${format?.name ?? "N/A"}
Tipo: ${propertyType?.name ?? "N/A"}
`;

    try {
      await navigator.clipboard.writeText(templateInfo.trim());
      toast({
        title: "Información copiada",
        description:
          "Los detalles de la plantilla se han copiado al portapapeles",
      });
    } catch (error) {
      console.error("Error copying:", error);
    }
  };

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev / 1.2, 0.5));
  const resetZoom = () => setZoomLevel(1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-xl">{template.name}</DialogTitle>
              <DialogDescription className="text-base">
                {template.description}
              </DialogDescription>
              <div className="flex flex-wrap gap-2">
                {template.featured && (
                  <Badge variant="default" className="text-xs">
                    Destacada
                  </Badge>
                )}
                {style && (
                  <Badge variant="outline" className="text-xs">
                    Estilo: {style.name}
                  </Badge>
                )}
                {format && (
                  <Badge variant="secondary" className="text-xs">
                    {format.name} ({format.dimensions.width}×
                    {format.dimensions.height}
                    {format.dimensions.unit})
                  </Badge>
                )}
                {propertyType && (
                  <Badge variant="outline" className="text-xs">
                    {propertyType.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="min-w-[60px] text-center font-mono text-sm text-gray-600">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetZoom}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Preview Image Container */}
        <div
          className="relative flex-1 overflow-auto bg-gray-50"
          style={{ minHeight: "400px" }}
        >
          <div
            className="flex items-center justify-center p-6 transition-transform duration-200"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center center",
            }}
          >
            <div className="relative max-h-full max-w-full overflow-hidden rounded-lg bg-white shadow-2xl">
              <Image
                src={template.preview}
                alt={`Vista previa completa de ${template.name}`}
                width={600}
                height={800}
                className="object-contain"
                onLoad={() => setIsImageLoaded(true)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  setIsImageLoaded(false);
                }}
                priority
              />

              {/* Fallback when image fails to load */}
              {!isImageLoaded && (
                <div className="flex h-[800px] w-[600px] items-center justify-center bg-gray-100">
                  <div className="space-y-4 text-center">
                    <FileImage className="mx-auto h-20 w-20 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-600">
                        Vista previa no disponible
                      </p>
                      <p className="text-sm text-gray-500">
                        La imagen no se pudo cargar
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Template Details Section */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div>
              <h4 className="mb-2 font-medium text-gray-900">
                Campos incluidos
              </h4>
              <div className="space-y-1">
                {template.fields.slice(0, 5).map((field) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${field.required ? "bg-red-400" : "bg-gray-400"}`}
                    />
                    <span className="text-gray-600">{field.name}</span>
                    {field.required && (
                      <span className="text-xs text-red-500">*</span>
                    )}
                  </div>
                ))}
                {template.fields.length > 5 && (
                  <p className="text-xs text-gray-500">
                    +{template.fields.length - 5} campos más
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-medium text-gray-900">Etiquetas</h4>
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-medium text-gray-900">
                Detalles técnicos
              </h4>
              <div className="space-y-1 text-gray-600">
                <p>ID: {template.id}</p>
                {format && (
                  <p>
                    Orientación:{" "}
                    {format.orientation === "portrait"
                      ? "Vertical"
                      : "Horizontal"}
                  </p>
                )}
                {style && <p>Categoría: {style.category}</p>}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6">
          <div className="flex w-full items-center gap-2">
            <Button variant="outline" onClick={handleCopyInfo}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar info
            </Button>

            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Compartir
            </Button>

            <Button
              variant="outline"
              onClick={() => window.open(template.preview, "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir original
            </Button>

            <div className="flex-1" />

            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>

            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
