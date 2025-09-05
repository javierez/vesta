"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "~/lib/utils";
import { ToolConfirmationModal } from "./tool-confirmation-modal";

export function ImageStudioTools() {
  const [showDescriptions, setShowDescriptions] = useState<Record<string, boolean>>({
    quality: false,
    remove: false,
    decorate: false,
    reform: false,
  });
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({
    quality: false,
    remove: false,
    decorate: false,
    reform: false,
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    tool: typeof tools[0] | null;
  }>({
    isOpen: false,
    tool: null,
  });

  const toggleCard = (cardId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const toggleDescription = (cardId: string) => {
    setShowDescriptions(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const openConfirmModal = (tool: typeof tools[0]) => {
    setConfirmModal({
      isOpen: true,
      tool: tool
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      tool: null
    });
  };

  const handleConfirmTool = () => {
    if (confirmModal.tool) {
      // TODO: Implement actual tool operation
      console.log(`Executing tool: ${confirmModal.tool.title}`);
      closeConfirmModal();
      // Flip the card back to front
      setFlippedCards(prev => ({
        ...prev,
        [confirmModal.tool!.id]: false
      }));
    }
  };

  const tools = [
    {
      id: "quality",
      title: "Mejorar Calidad",
      description: "Corrección automática de color y brillo",
      price: "€0.12",
      priceDescription: "por imagen procesada",
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: "remove",
      title: "Eliminar Objetos",
      description: "Remueve elementos no deseados con IA",
      price: "€0.25",
      priceDescription: "por objeto eliminado",
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )
    },
    {
      id: "decorate",
      title: "Decorar",
      description: "Añade muebles y decoración virtual",
      price: "€0.35",
      priceDescription: "por elemento añadido",
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      )
    },
    {
      id: "reform",
      title: "Reforma",
      description: "Simula reformas y renovaciones",
      price: "€0.50",
      priceDescription: "por habitación reformada",
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    }
  ];

  return (
    <section className="animate-in slide-in-from-bottom-8 duration-700 delay-500">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
        {tools.map((tool) => (
          <div key={tool.id} className={`relative transition-all duration-300 ${showDescriptions[tool.id] ? 'h-40' : 'h-32'}`} style={{ perspective: "1000px" }}>
            <div
              className={cn(
                "relative w-full h-full transition-transform duration-500 cursor-pointer",
                flippedCards[tool.id] && "[transform:rotateY(180deg)]"
              )}
              style={{ transformStyle: "preserve-3d" }}
              onClick={() => toggleCard(tool.id)}
            >
              {/* Front of card */}
              <div 
                className="absolute inset-0 group overflow-hidden rounded-xl backdrop-blur-sm p-4 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-amber-500/20 text-center bg-white/70"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Info toggle button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleDescription(tool.id);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className={`absolute top-2 right-2 w-6 h-6 rounded-full p-0 transition-all duration-200 z-20 ${
                    showDescriptions[tool.id] 
                      ? "bg-white hover:bg-gray-50 text-black shadow-md scale-105" 
                      : "bg-transparent hover:bg-gray-50 text-gray-400 shadow-sm"
                  }`}
                  title={showDescriptions[tool.id] ? "Ocultar descripción" : "Mostrar descripción"}
                >
                  <Info className="h-3 w-3 mx-auto" />
                </button>

                <div className="relative z-10 h-full flex flex-col justify-center">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-400 to-rose-400 flex items-center justify-center mb-3 mx-auto">
                    {tool.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{tool.title}</h4>
                  <div className={`transition-all duration-300 ${showDescriptions[tool.id] ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'} overflow-hidden`}>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Back of card */}
              <div 
                className="absolute inset-0 group overflow-hidden rounded-xl backdrop-blur-sm p-6 transition-shadow duration-300 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-amber-500/20 text-center bg-gradient-to-br from-amber-50 to-rose-50"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                onClick={() => toggleCard(tool.id)}
              >
                <div className="relative z-10 flex flex-col justify-center items-center h-full">
                  <button 
                    className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-400 to-rose-400 flex items-center justify-center mb-3 hover:from-amber-500 hover:to-rose-500 transition-all duration-200 shadow-md hover:shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      openConfirmModal(tool);
                    }}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <div className="text-xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent mb-1">
                    {tool.price}
                  </div>
                  <p className="text-xs text-gray-700 font-medium">
                    {tool.priceDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-12">
        <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-rose-100 border border-amber-200/50">
          <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full mr-2 animate-pulse" />
          <p className="text-xs font-medium text-gray-700">
            Próximamente disponible
          </p>
        </div>
      </div>

      <ToolConfirmationModal
        isOpen={confirmModal.isOpen}
        tool={confirmModal.tool}
        onConfirm={handleConfirmTool}
        onCancel={closeConfirmModal}
      />
    </section>
  );
}