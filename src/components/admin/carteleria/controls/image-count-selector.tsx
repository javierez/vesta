"use client";

import type { FC } from "react";
import { cn } from "~/lib/utils";
import type { TemplateConfiguration } from "~/types/template-data";

interface ImageCountSelectorProps {
  config: TemplateConfiguration;
  onChange: (updates: Partial<TemplateConfiguration>) => void;
}

export const ImageCountSelector: FC<ImageCountSelectorProps> = ({ 
  config, 
  onChange 
}) => {
  const handleImageCountChange = (count: 3 | 4) => {
    onChange({ imageCount: count });
  };

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h3 className="text-lg font-medium">Cantidad de Imágenes</h3>
        <p className="text-sm text-gray-600">
          Selecciona cuántas imágenes mostrar en la plantilla
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* 3 Images Option */}
        <button
          onClick={() => handleImageCountChange(3)}
          className={cn(
            "p-4 rounded-lg border-2 text-left transition-all duration-200",
            "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            config.imageCount === 3 && "bg-blue-50 border-blue-500",
            config.imageCount !== 3 && "bg-white border-gray-200 hover:border-gray-300"
          )}
        >
          <div className="flex items-center mb-2">
            <div className="w-4 h-4 rounded-full border-2 border-current mr-2">
              {config.imageCount === 3 && (
                <div className="w-2 h-2 bg-current rounded-full m-0.5" />
              )}
            </div>
            <span className="font-medium">3 Imágenes</span>
          </div>
          <p className="text-sm text-gray-600">
            Layout clásico: 1 imagen principal + 2 secundarias
          </p>
          <div className="mt-2 flex space-x-1">
            <div className="w-8 h-6 bg-gray-300 rounded-sm" />
            <div className="flex flex-col space-y-1">
              <div className="w-4 h-2.5 bg-gray-300 rounded-sm" />
              <div className="w-4 h-2.5 bg-gray-300 rounded-sm" />
            </div>
          </div>
        </button>

        {/* 4 Images Option */}
        <button
          onClick={() => handleImageCountChange(4)}
          className={cn(
            "p-4 rounded-lg border-2 text-left transition-all duration-200",
            "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            config.imageCount === 4 && "bg-blue-50 border-blue-500",
            config.imageCount !== 4 && "bg-white border-gray-200 hover:border-gray-300"
          )}
        >
          <div className="flex items-center mb-2">
            <div className="w-4 h-4 rounded-full border-2 border-current mr-2">
              {config.imageCount === 4 && (
                <div className="w-2 h-2 bg-current rounded-full m-0.5" />
              )}
            </div>
            <span className="font-medium">4 Imágenes</span>
          </div>
          <p className="text-sm text-gray-600">
            Layout extendido: 1 imagen principal + 3 secundarias
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1">
            <div className="col-span-2 w-full h-6 bg-gray-300 rounded-sm" />
            <div className="flex flex-col space-y-1">
              <div className="w-full h-2 bg-gray-300 rounded-sm" />
              <div className="w-full h-2 bg-gray-300 rounded-sm" />
              <div className="w-full h-2 bg-gray-300 rounded-sm" />
            </div>
          </div>
        </button>
      </div>

      {/* Info about image handling */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-sm text-gray-700">
          <span className="font-medium">ℹ️ Información:</span> Las imágenes se cargan desde AWS S3 
          (vesta-configuration-files). Si seleccionas 4 imágenes y hay menos disponibles, 
          se duplicará la primera imagen.
        </p>
      </div>
    </div>
  );
};