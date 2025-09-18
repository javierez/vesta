"use client";

import { cn } from "~/lib/utils";
import { FileText } from "lucide-react";

interface CompleteFormProps {
  className?: string;
}

export function CompleteForm({ className }: CompleteFormProps) {
  return (
    <div className={cn("w-full max-w-md", className)}>
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="mb-6 mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-rose-100 flex items-center justify-center">
          <FileText className="h-10 w-10 text-amber-600" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          Información completa y detallada
        </h4>
        <p className="text-gray-600 text-sm">
          Registra los detalles y maximiza el atractivo de tu propiedad y descuida, puedes cargar la fotos luego.
        </p>
      </div>
    </div>
  );
}