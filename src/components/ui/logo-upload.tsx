"use client";

import type React from "react";
import { useState, useCallback } from "react";
import Image from "next/image";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Upload, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import type { LogoUploadProps } from "~/types/brand";

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export function LogoUpload({
  onUpload,
  isUploading,
  progress,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxSize = DEFAULT_MAX_SIZE,
  className,
}: LogoUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validate file before processing
  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        return `Formato no soportado. Formatos permitidos: ${acceptedTypes
          .map(type => type.split('/')[1]?.toUpperCase())
          .join(', ')}`;
      }

      // Check file size
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        return `Archivo demasiado grande. Tamaño máximo: ${maxSizeMB}MB`;
      }

      return null;
    },
    [acceptedTypes, maxSize]
  );

  // Handle file selection (either via drag-drop or file input)
  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Set file and preview
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Call upload handler
      try {
        await onUpload(file);
      } catch (uploadError) {
        console.error('Upload failed:', uploadError);
        setError(uploadError instanceof Error ? uploadError.message : 'Error al subir el archivo');
        // Clean up on error
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
      }
    },
    [validateFile, onUpload, previewUrl]
  );

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file) {
          void handleFileSelect(file);
        }
      }
    },
    [handleFileSelect]
  );

  // File input change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        if (file) {
          void handleFileSelect(file);
        }
      }
    },
    [handleFileSelect]
  );

  // Remove selected file
  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
  }, [previewUrl]);

  // Progress indicator
  const renderProgress = () => {
    if (!progress || !isUploading) return null;

    return (
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{progress.message}</span>
          <span className="font-medium">{progress.percentage}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>
    );
  };

  // Main upload area
  const renderUploadArea = () => {
    if (selectedFile && previewUrl && !error) {
      return (
        <div className="relative">
          <div className="relative aspect-square w-full max-w-48 mx-auto overflow-hidden rounded-lg bg-muted">
            <Image
              src={previewUrl}
              alt="Logo preview"
              fill
              className="object-contain"
            />
          </div>
          
          {!isUploading && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-8 w-8 rounded-full"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {progress?.stage === 'complete' && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-green-500 p-2">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex min-h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          dragActive || isUploading
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          isUploading && "cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && document.getElementById("logo-upload")?.click()}
      >
        <Input
          id="logo-upload"
          type="file"
          accept={acceptedTypes.join(',')}
          className="hidden"
          onChange={handleInputChange}
          disabled={isUploading}
        />
        
        {isUploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" />
        )}
        
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-foreground">
            {isUploading ? 'Procesando logo...' : 'Subir Logo'}
          </p>
          <p className="text-xs text-muted-foreground">
            Arrastra y suelta tu logo aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-muted-foreground">
            Formatos: PNG, JPG, WebP (máx. {maxSize / (1024 * 1024)}MB)
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {renderUploadArea()}
      
      {/* Progress indicator */}
      {renderProgress()}
      
      {/* Error message */}
      {error && (
        <div className="flex items-center space-x-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Processing stages info */}
      {isUploading && progress && (
        <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          <div className="space-y-1">
            <div className="font-medium">Procesando logo:</div>
            <ul className="list-inside list-disc space-y-1 text-xs">
              <li className={progress.stage === 'uploading' ? 'text-primary' : ''}>
                Subiendo archivo original
              </li>
              <li className={progress.stage === 'processing' ? 'text-primary' : ''}>
                Removiendo fondo automáticamente
              </li>
              <li className={progress.stage === 'extracting' ? 'text-primary' : ''}>
                Extrayendo paleta de colores
              </li>
              <li className={progress.stage === 'saving' ? 'text-primary' : ''}>
                Guardando en almacenamiento
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}