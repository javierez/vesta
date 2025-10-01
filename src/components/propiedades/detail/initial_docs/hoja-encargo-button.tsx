"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import { FileText, Loader2 } from "lucide-react";
import { TermsModal } from "./terms-modal";

interface HojaEncargoButtonProps {
  propertyId: bigint;
  className?: string;
}

export function HojaEncargoButton({ propertyId, className }: HojaEncargoButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  console.log("🚀 HojaEncargoButton render - isModalOpen:", isModalOpen);
  console.log("🚀 propertyId:", propertyId);

  const handleCreateHojaEncargo = async (terms: {
    commission: number;
    min_commission: number;
    duration: number;
    exclusivity: boolean;
    communications: boolean;
  }) => {
    // TODO: Implement the actual API call to create hoja de encargo
    // This is a placeholder - you'll need to implement the actual logic
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
    
    console.log("Creating hoja de encargo for property:", propertyId);
    console.log("Using complete terms data:", {
      propertyId,
      commission: terms.commission,
      minCommission: terms.min_commission,
      duration: terms.duration,
      exclusivity: terms.exclusivity,
      communications: terms.communications,
    });
    
    // For now, just show success with all the data
    alert(`Hoja de encargo creada correctamente:
- Comisión: ${terms.commission}%
- Comisión mínima: €${terms.min_commission}
- Duración: ${terms.duration} meses
- Exclusividad: ${terms.exclusivity ? 'Sí' : 'No'}
- Comunicaciones: ${terms.communications ? 'Sí' : 'No'}`);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="bg-gray-50/50 rounded-lg border border-gray-200 p-4 text-center hover:bg-gray-100/50 transition-colors h-[200px] flex flex-col justify-center">
        {/* Icon container */}
        <div className="mb-4 mx-auto rounded-full flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-100 to-rose-100">
          <FileText className="h-6 w-6 text-amber-600" />
        </div>
        
        {/* Text content */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm mb-4">
            Crea la <span className="font-semibold text-amber-600 bg-amber-50 px-1 py-0.5 rounded text-sm">hoja de encargo</span> con toda la información aportada.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Button clicked - Opening modal...");
            setIsModalOpen(true);
            console.log("Modal state set to true");
          }}
          className={cn(
            "w-full px-4 py-2 bg-gradient-to-r from-amber-400 to-rose-400 text-white font-medium rounded-md text-sm",
            "hover:from-amber-500 hover:to-rose-500 transition-all duration-200 hover:scale-105 shadow-sm"
          )}
        >
          Generar ahora
        </button>
      </div>

      <TermsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContinue={handleCreateHojaEncargo}
      />
    </div>
  );
}