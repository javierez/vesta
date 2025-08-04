import type React from "react";
import { useState, useCallback } from "react";
import Image from "next/image";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { cn } from "~/lib/utils";
import type { LogoUploadProps } from "~/types/brand";

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Validate file before processing
  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        return `Formato no soportado. Formatos permitidos: ${acceptedTypes
          .map((type) => type.split("/")[1]?.toUpperCase())
          .join(", ")}`;
      }

      // Check file size
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        return `Archivo demasiado grande. Tamaño máximo: ${maxSizeMB}MB`;
      }

      return null;
    },
    [acceptedTypes, maxSize],
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
        console.error("Upload failed:", uploadError);
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Error al subir el archivo",
        );
        // Clean up on error
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
      }
    },
    [validateFile, onUpload, previewUrl],
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
    [handleFileSelect],
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
    [handleFileSelect],
  );

  // Remove selected file
  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    setShowDeleteDialog(false);
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
          <div className="relative mx-auto aspect-square w-full max-w-48 overflow-hidden rounded-lg bg-muted">
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
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          {progress?.stage === "complete" && (
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
          isUploading && "cursor-not-allowed",
        )}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() =>
          !isUploading && document.getElementById("logo-upload")?.click()
        }
      >
        <Input
          id="logo-upload"
          type="file"
          accept={acceptedTypes.join(",")}
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
            {isUploading ? "Procesando logo..." : "Subir Logo"}
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

      {/* Processing stages visualization */}
      {isUploading && progress && (
        <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-background to-muted/20 p-4">
          {/* Animated background gradient */}
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 opacity-0" />

          <div className="relative space-y-4">
            {/* Header with overall progress */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">Procesando logo</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {progress.stage === "uploading"
                  ? "25%"
                  : progress.stage === "processing"
                    ? "50%"
                    : progress.stage === "extracting"
                      ? "75%"
                      : progress.stage === "saving"
                        ? "90%"
                        : "0%"}
              </span>
            </div>

            {/* Connected stages with progress line */}
            <div className="relative">
              {/* Background progress line */}
              <div className="absolute left-[11px] top-0 h-full w-[2px] bg-border" />

              {/* Active progress line */}
              <div
                className="absolute left-[11px] top-0 w-[2px] bg-primary transition-all duration-500 ease-out"
                style={{
                  height:
                    progress.stage === "uploading"
                      ? "25%"
                      : progress.stage === "processing"
                        ? "50%"
                        : progress.stage === "extracting"
                          ? "75%"
                          : progress.stage === "saving"
                            ? "100%"
                            : "0%",
                }}
              />

              {/* Stages */}
              <div className="relative space-y-3">
                {[
                  {
                    key: "uploading",
                    label: "Subiendo archivo",
                    detail: "Preparando imagen",
                  },
                  {
                    key: "processing",
                    label: "Borrando fondo",
                    detail: "IA procesando",
                  },
                  {
                    key: "extracting",
                    label: "Extrayendo colores",
                    detail: "Analizando paleta",
                  },
                  { key: "saving", label: "Guardando", detail: "Finalizando" },
                ].map((stage, index) => {
                  const isActive = progress.stage === stage.key;
                  const stageIndex = [
                    "uploading",
                    "processing",
                    "extracting",
                    "saving",
                  ].indexOf(progress.stage);
                  const isPassed = index < stageIndex;
                  const isNext = index === stageIndex + 1;

                  return (
                    <div
                      key={stage.key}
                      className={cn(
                        "flex items-start gap-3 transition-all duration-300",
                        isActive && "scale-[1.02]",
                      )}
                    >
                      {/* Stage indicator */}
                      <div className="relative z-10 flex h-6 w-6 items-center justify-center">
                        <div
                          className={cn(
                            "absolute inset-0 rounded-full transition-all duration-300",
                            isActive && "animate-pulse bg-primary/20",
                          )}
                        />
                        <div
                          className={cn(
                            "relative flex h-6 w-6 items-center justify-center rounded-full border-2 bg-background transition-all duration-300",
                            isPassed && "border-primary bg-primary",
                            isActive && "border-primary bg-background",
                            !isPassed &&
                              !isActive &&
                              "border-border bg-background",
                          )}
                        >
                          {isPassed ? (
                            <CheckCircle className="h-3.5 w-3.5 text-white" />
                          ) : isActive ? (
                            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                          ) : (
                            <div
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                isNext ? "bg-border" : "bg-muted",
                              )}
                            />
                          )}
                        </div>
                      </div>

                      {/* Stage content */}
                      <div className="-mt-0.5 flex-1">
                        <div
                          className={cn(
                            "text-sm font-medium transition-all duration-300",
                            isActive && "text-foreground",
                            isPassed && "text-muted-foreground",
                            !isActive &&
                              !isPassed &&
                              "text-muted-foreground/60",
                          )}
                        >
                          {stage.label}
                        </div>
                        {isActive && (
                          <div className="animate-in fade-in slide-in-from-left-1 mt-0.5 text-xs text-muted-foreground">
                            {stage.detail}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar logo?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará el logo seleccionado. Tendrás que subir uno
              nuevo si deseas cambiarlo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRemove}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
