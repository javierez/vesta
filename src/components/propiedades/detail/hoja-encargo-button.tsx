"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import { FileText, Loader2 } from "lucide-react";

interface HojaEncargoButtonProps {
  propertyId: bigint;
  className?: string;
}

export function HojaEncargoButton({ propertyId, className }: HojaEncargoButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateHojaEncargo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Implement the actual API call to create hoja de encargo
      // This is a placeholder - you'll need to implement the actual logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      console.log("Creating hoja de encargo for property:", propertyId);
      
      // For now, just show success
      alert("Hoja de encargo creada correctamente (placeholder)");
      
    } catch (error) {
      console.error("Error creating hoja de encargo:", error);
      setError("Error al crear la hoja de encargo. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="bg-gray-50/50 rounded-lg border border-gray-200 p-4 text-center hover:bg-gray-100/50 transition-colors h-[200px] flex flex-col justify-center">
        {/* Icon container with smooth transitions */}
        <div className={cn(
          "mb-4 mx-auto rounded-full flex items-center justify-center transition-all duration-700 ease-in-out",
          isLoading 
            ? "w-16 h-16 bg-gradient-to-r from-amber-400 to-rose-400" 
            : "w-12 h-12 bg-gradient-to-br from-amber-100 to-rose-100"
        )}>
          <FileText 
            className={cn(
              "transition-all duration-700 ease-in-out",
              isLoading 
                ? "h-8 w-8 text-white scale-110" 
                : "h-6 w-6 text-amber-600"
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
          <p className="text-gray-600 text-sm mb-4">
            Crea la <span className="font-semibold text-amber-600 bg-amber-50 px-1 py-0.5 rounded text-sm">hoja de encargo</span> con toda la información aportada.
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className={cn(
            "flex items-center justify-center gap-2 text-gray-600 transition-all duration-300 ease-in-out",
            "animate-in fade-in slide-in-from-bottom-2"
          )}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Generando documento...</span>
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
            onClick={handleCreateHojaEncargo}
            disabled={isLoading}
            className={cn(
              "w-full px-4 py-2 bg-gradient-to-r from-amber-400 to-rose-400 text-white font-medium rounded-md text-sm",
              "hover:from-amber-500 hover:to-rose-500 transition-all duration-200 hover:scale-105 shadow-sm",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "animate-in fade-in slide-in-from-bottom-2"
            )}
          >
            Generar ahora
          </button>
        )}
      </div>
    </div>
  );
}