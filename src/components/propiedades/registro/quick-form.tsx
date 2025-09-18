"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "~/lib/utils";
import { Zap, Loader2 } from "lucide-react";
import { createQuickPropertyAction } from "~/app/actions/quick-property";

interface QuickFormProps {
  className?: string;
}

export function QuickForm({ className }: QuickFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleStartQuickForm = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await createQuickPropertyAction();

      if (result.success) {
        // Navigate to the registration form with the new listing ID
        router.push(`/propiedades/registro/${result.data.listingId}`);
      } else {
        setError(result.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error creating quick property:", error);
      setError("Error inesperado. Por favor, inténtalo de nuevo.");
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full max-w-md", className)}>
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        {/* Icon container with smooth transitions */}
        <div className={cn(
          "mb-6 mx-auto rounded-full flex items-center justify-center transition-all duration-700 ease-in-out",
          isLoading 
            ? "w-24 h-24 bg-gradient-to-r from-amber-400 to-rose-400" 
            : "w-20 h-20 bg-gradient-to-br from-amber-100 to-rose-100"
        )}>
          <Zap 
            className={cn(
              "transition-all duration-700 ease-in-out",
              isLoading 
                ? "h-14 w-14 text-white scale-110" 
                : "h-10 w-10 text-amber-600"
            )} 
          />
        </div>
        
        {/* Text content with fade transition */}
        <div className={cn(
          "transition-all duration-500 ease-in-out transform",
          isLoading 
            ? "opacity-0 translate-y-2 scale-95" 
            : "opacity-100 translate-y-0 scale-100"
        )}>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Proceso rápido y eficiente
          </h4>
          <p className="text-gray-600 text-sm mb-6">
            Completa el formulario en menos de <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">3 minutos</span> y vuelve luego para completar todos los detalles.
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className={cn(
            "flex items-center justify-center gap-2 text-gray-600 transition-all duration-300 ease-in-out",
            "animate-in fade-in slide-in-from-bottom-2"
          )}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Creando propiedad...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg animate-in fade-in slide-in-from-bottom-2">
            {error}
          </div>
        )}

        {/* Button - only show when not loading */}
        {!isLoading && (
          <button
            onClick={handleStartQuickForm}
            disabled={isLoading}
            className={cn(
              "w-full px-6 py-3 bg-gradient-to-r from-amber-400 to-rose-400 text-white font-medium rounded-lg",
              "hover:from-amber-500 hover:to-rose-500 transition-all duration-200 hover:scale-105 shadow-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "animate-in fade-in slide-in-from-bottom-2"
            )}
          >
            Comenzar ahora
          </button>
        )}
      </div>
    </div>
  );
}