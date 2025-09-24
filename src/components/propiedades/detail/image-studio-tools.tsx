"use client";

import { useState, useEffect } from "react";
import { Info, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { ToolConfirmationModal } from "./tool-confirmation-modal";
import type { EnhancementStatus, PropertyImage } from "~/types/freepik";
import type { RenovationStatus } from "~/types/gemini";

interface ImageStudioToolsProps {
  onEnhanceImage: () => Promise<void>;
  enhancementStatus: EnhancementStatus;
  _enhancementProgress: number;
  _enhancementError: string | null;
  selectedImage?: PropertyImage;
  isComparisonVisible?: boolean;
  // Renovation functionality
  onRenovateImage?: () => Promise<void>;
  renovationStatus?: RenovationStatus;
}

export function ImageStudioTools({
  onEnhanceImage,
  enhancementStatus,
  _enhancementProgress,
  _enhancementError,
  selectedImage,
  isComparisonVisible,
  onRenovateImage,
  renovationStatus = 'idle',
}: ImageStudioToolsProps) {
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

  const handleConfirmTool = async () => {
    
    if (confirmModal.tool) {
      // Close modal immediately after user confirms
      const currentTool = confirmModal.tool;
      closeConfirmModal();
      
      if (currentTool.id === 'quality') {
        // Handle quality enhancement
        if (!selectedImage) {
          console.error('No image selected for enhancement');
          return;
        }
        
        try {
          await onEnhanceImage();
          
          // Wait for the comparison modal to open before flipping card back
          // The callback will be triggered from the parent component
          
        } catch (error) {
          console.error('Enhancement failed:', error);
          // Only flip card back on error
          setFlippedCards(prev => ({
            ...prev,
            [currentTool.id]: false
          }));
        }
      } else if (currentTool.id === 'reform') {
        // Handle renovation with Gemini
        if (!selectedImage) {
          console.error('No image selected for renovation');
          return;
        }
        
        if (!onRenovateImage) {
          console.error('Renovation handler not provided');
          return;
        }
        
        try {
          await onRenovateImage();
          
          // Wait for the comparison modal to open before flipping card back
          // The callback will be triggered from the parent component
          
        } catch (error) {
          console.error('Renovation failed:', error);
          // Only flip card back on error
          setFlippedCards(prev => ({
            ...prev,
            [currentTool.id]: false
          }));
        }
      } else {
        // Other tools are not implemented yet
        
        // Flip the card back to front immediately for non-implemented tools
        setFlippedCards(prev => ({
          ...prev,
          [currentTool.id]: false
        }));
      }
    } else {
      console.warn('No tool selected in modal');
    }
  };

  // Handle comparison modal opening - flip cards back when comparison becomes visible
  useEffect(() => {
    if (isComparisonVisible) {
      setFlippedCards(prev => ({
        ...prev,
        quality: false,
        reform: false
      }));
    }
  }, [isComparisonVisible]);

  const tools = [
    {
      id: "quality",
      title: "Mejorar Calidad",
      description: "Hasta 16x más resolución",
      price: "€0.12",
      priceDescription: "por imagen mejorada",
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
                "relative w-full h-full transition-transform duration-500",
                tool.id === 'remove' ? 'cursor-not-allowed' : 'cursor-pointer',
                flippedCards[tool.id] && "[transform:rotateY(180deg)]"
              )}
              style={{ transformStyle: "preserve-3d" }}
              onClick={() => {
                if (tool.id === 'remove') return; // Don't allow flipping inactive cards
                toggleCard(tool.id);
              }}
            >
              {/* Front of card */}
              <div 
                className={cn(
                  "absolute inset-0 group overflow-hidden rounded-xl backdrop-blur-sm p-4 transition-all duration-300 shadow-lg shadow-gray-200/50 text-center bg-white/70",
                  tool.id === 'remove' 
                    ? 'opacity-60' 
                    : 'hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/20'
                )}
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
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto ${
                    tool.id === 'remove' 
                      ? 'bg-gray-300' 
                      : 'bg-gradient-to-r from-amber-400 to-rose-400'
                  }`}>
                    {tool.icon}
                  </div>
                  <h4 className={`font-semibold mb-2 ${
                    tool.id === 'remove' 
                      ? 'text-gray-500' 
                      : 'text-gray-900'
                  }`}>{tool.title}</h4>
                  <div className={`transition-all duration-300 ${showDescriptions[tool.id] ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'} overflow-hidden`}>
                    <p className={`text-xs leading-relaxed ${
                      tool.id === 'remove' 
                        ? 'text-gray-400' 
                        : 'text-gray-600'
                    }`}>
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
                  {(tool.id === 'quality' && enhancementStatus === 'processing') || 
                   (tool.id === 'reform' && renovationStatus === 'processing') ? (
                    // Show processing state for quality and reform tools
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-400 to-rose-400 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 max-w-20 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-400 to-rose-400 h-2 rounded-full animate-pulse w-full opacity-75"></div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {tool.id === 'reform' ? 'Renovando con IA...' : 'Procesando con IA...'}
                      </div>
                    </div>
                  ) : (
                    // Normal state
                    <>
                      <button 
                        className={cn(
                          "w-20 h-20 rounded-xl flex items-center justify-center mb-2 transition-all duration-200 shadow-xl relative overflow-hidden group",
                          tool.id === 'remove' 
                            ? "bg-gray-300 cursor-not-allowed opacity-50" 
                            : "bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 hover:shadow-2xl hover:scale-105",
                          tool.id === 'quality' && !selectedImage && "opacity-50 cursor-not-allowed",
                          tool.id === 'quality' && selectedImage && "animate-pulse-glow",
                          tool.id === 'reform' && !selectedImage && "opacity-50 cursor-not-allowed",
                          tool.id === 'reform' && selectedImage && "animate-pulse-glow"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          
                          if (tool.id === 'quality' && !selectedImage) {
                            // Don't open modal if no image is selected
                            return;
                          }
                          
                          if (tool.id === 'reform' && !selectedImage) {
                            // Don't open modal if no image is selected for renovation
                            return;
                          }
                          
                          if (tool.id === 'remove') {
                            // Don't open modal for inactive remove tool
                            return;
                          }
                          
                          openConfirmModal(tool);
                        }}
                        disabled={
                          (tool.id === 'quality' && !selectedImage) || 
                          (tool.id === 'reform' && (!selectedImage || !onRenovateImage)) || 
                          tool.id === 'remove'
                        }
                      >
                        <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                      <div className={`text-lg font-bold mb-1 ${
                        tool.id === 'remove' 
                          ? 'text-gray-400' 
                          : 'bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent'
                      }`}>
                        {tool.price}
                      </div>
                      <p className={`text-xs font-medium ${
                        tool.id === 'remove' 
                          ? 'text-gray-400' 
                          : 'text-gray-700'
                      }`}>
                        {tool.priceDescription}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-12">
        <div className="space-y-4">
          {/* Other tools coming soon */}
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-rose-100 border border-amber-200/50">
            <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full mr-2 animate-pulse" />
            <p className="text-xs font-medium text-gray-700">
              Más herramientas próximamente
            </p>
          </div>
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