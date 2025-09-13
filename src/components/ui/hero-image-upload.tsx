"use client";

import { useState, useCallback } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "~/lib/utils";

interface HeroImageUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
  className?: string;
}

export function HeroImageUpload({
  onUpload,
  isUploading = false,
  className,
}: HeroImageUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      setError(null);

      if (e.dataTransfer.files?.[0]) {
        const file = e.dataTransfer.files[0];
        if (!file.type.startsWith("image/")) {
          setError("Por favor selecciona un archivo de imagen válido");
          return;
        }
        await onUpload(file);
      }
    },
    [onUpload],
  );

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      setError(null);
      
      if (e.target.files?.[0]) {
        const file = e.target.files[0];
        if (!file.type.startsWith("image/")) {
          setError("Por favor selecciona un archivo de imagen válido");
          return;
        }
        await onUpload(file);
      }
    },
    [onUpload],
  );

  return (
    <div className={cn("w-full", className)}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400",
          isUploading && "pointer-events-none opacity-50",
        )}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          disabled={isUploading}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />

        <div className="flex flex-col items-center justify-center text-center">
          {isUploading ? (
            <>
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-primary" />
              <p className="text-sm font-medium text-gray-700">
                Subiendo imagen...
              </p>
            </>
          ) : (
            <>
              <div className="mb-4 rounded-full bg-gray-100 p-3">
                {isDragActive ? (
                  <Upload className="h-6 w-6 text-primary" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                {isDragActive
                  ? "Suelta la imagen aquí"
                  : "Arrastra una imagen o haz clic para seleccionar"}
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG o WebP (máximo 10MB)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}