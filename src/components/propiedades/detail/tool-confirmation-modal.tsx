"use client";

import { X, AlertTriangle } from "lucide-react";
import { Button } from "~/components/ui/button";

interface Tool {
  id: string;
  title: string;
  description: string;
  price: string;
  priceDescription: string;
  icon: React.ReactNode;
}

interface ToolConfirmationModalProps {
  isOpen: boolean;
  tool: Tool | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ToolConfirmationModal({ isOpen, tool, onConfirm, onCancel }: ToolConfirmationModalProps) {
  console.log('🪟 [ToolConfirmationModal] Rendered', {
    isOpen,
    toolId: tool?.id,
    toolTitle: tool?.title
  });
  
  if (!isOpen || !tool) return null;
  
  const handleConfirm = () => {
    console.log('✅ [ToolConfirmationModal] Confirm button clicked', {
      toolId: tool.id,
      toolTitle: tool.title
    });
    onConfirm();
  };
  
  const handleCancel = () => {
    console.log('❌ [ToolConfirmationModal] Cancel button clicked');
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-400 to-rose-400 flex items-center justify-center flex-shrink-0">
              {tool.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{tool.title}</h3>
              <p className="text-sm text-gray-500">Confirmar operación</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="w-8 h-8 rounded-full p-0 transition-all duration-200 bg-transparent hover:bg-gray-50 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4 mx-auto" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700 mb-2">
                ¿Estás seguro que deseas proceder con esta operación?
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-xl p-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent mb-1">
                {tool.price}
              </div>
              <p className="text-xs text-gray-700 font-medium">
                {tool.priceDescription}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 text-white border-0"
            >
              Proceder
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}