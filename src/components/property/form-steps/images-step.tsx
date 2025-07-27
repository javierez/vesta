"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Upload, X } from "lucide-react";

interface ImagesStepProps {
  images: File[];
  updateImages: (images: File[]) => void;
  errors: Record<string, string>;
}

export function ImagesStep({
  images,
  updateImages,
  errors: _errors,
}: ImagesStepProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/"),
      );
      updateImages([...images, ...newFiles]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      updateImages([...images, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    updateImages(newImages);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Imágenes</h2>
        <p className="text-muted-foreground">
          Sube imágenes de tu inmueble. Las imágenes de calidad aumentan el
          interés en tu propiedad.
        </p>
      </div>

      <div
        className={`rounded-md border-2 border-dashed p-6 text-center ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="mb-2 text-sm text-muted-foreground">
          Arrastra y suelta imágenes aquí o haz clic para seleccionar
        </p>
        <Input
          id="images"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById("images")?.click()}
        >
          Seleccionar Imágenes
        </Button>
      </div>

      {images.length > 0 && (
        <div className="space-y-2">
          <Label>Imágenes Seleccionadas ({images.length})</Label>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {images.map((file, index) => (
              <div key={index} className="group relative">
                <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                  <Image
                    src={URL.createObjectURL(file) || "/placeholder.svg"}
                    alt={`Imagen ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
