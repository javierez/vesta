"use client";

import { cn } from "~/lib/utils";
import { Upload, Check } from "lucide-react";

interface FileUploadProps {
  onFileUpload?: () => void;
  className?: string;
}

export function FileUpload({ onFileUpload, className }: FileUploadProps) {
  const handleFileUpload = () => {
    onFileUpload?.();
    console.log("Handle file upload");
  };

  return (
    <div className={cn("rounded-2xl bg-gradient-to-br from-amber-50/50 to-rose-50/50 shadow-lg p-8", className)}>
      <div className="grid gap-8 lg:grid-cols-3">
        <FileUploadDescription />
        <FileUploadArea onFileUpload={handleFileUpload} />
      </div>
    </div>
  );
}

function FileUploadDescription() {
  const features = [
    "Sistema Inteligente", 
    "Extracción automática", 
    "Múltiples formatos", 
    "Procesamiento rápido"
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Ficha de Encargo
        </h3>
        <p className="text-gray-600 leading-relaxed">
          Si tienes la ficha de encargo, cargala y deja que la IA extraiga la información automáticamente.
        </p>
      </div>
      
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">
          Características principales
        </h4>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 p-1">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface FileUploadAreaProps {
  onFileUpload: () => void;
}

function FileUploadArea({ onFileUpload }: FileUploadAreaProps) {
  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-8 hover:border-amber-300 transition-colors">
        <div className="flex flex-col items-center justify-center">
          <Upload className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium mb-2 text-lg">
            Arrastra tus documentos aquí
          </p>
          <p className="text-sm text-gray-500 mb-6">
            o haz clic para seleccionar archivos
          </p>
          <button
            onClick={onFileUpload}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-rose-400 text-white font-medium rounded-lg hover:from-amber-500 hover:to-rose-500 transition-all hover:scale-105 shadow-lg"
          >
            Seleccionar Archivos
          </button>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden"
            id="file-upload"
          />
        </div>
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Formatos aceptados: PDF, DOC, DOCX, JPG, PNG
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Tamaño máximo: 10MB por archivo
          </p>
        </div>
      </div>
    </div>
  );
}