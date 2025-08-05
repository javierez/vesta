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
  onChange,
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
            "rounded-lg border-2 p-4 text-left transition-all duration-200",
            "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            config.imageCount === 3 && "border-blue-500 bg-blue-50",
            config.imageCount !== 3 &&
              "border-gray-200 bg-white hover:border-gray-300",
          )}
        >
          <div className="mb-2 flex items-center">
            <div className="mr-2 h-4 w-4 rounded-full border-2 border-current">
              {config.imageCount === 3 && (
                <div className="m-0.5 h-2 w-2 rounded-full bg-current" />
              )}
            </div>
            <span className="font-medium">3 Imágenes</span>
          </div>
          <p className="text-sm text-gray-600">
            Layout clásico: 1 imagen principal + 2 secundarias
          </p>
          <div className="mt-2 flex space-x-1">
            <div className="h-6 w-8 rounded-sm bg-gray-300" />
            <div className="flex flex-col space-y-1">
              <div className="h-2.5 w-4 rounded-sm bg-gray-300" />
              <div className="h-2.5 w-4 rounded-sm bg-gray-300" />
            </div>
          </div>
        </button>

        {/* 4 Images Option */}
        <button
          onClick={() => handleImageCountChange(4)}
          className={cn(
            "rounded-lg border-2 p-4 text-left transition-all duration-200",
            "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            config.imageCount === 4 && "border-blue-500 bg-blue-50",
            config.imageCount !== 4 &&
              "border-gray-200 bg-white hover:border-gray-300",
          )}
        >
          <div className="mb-2 flex items-center">
            <div className="mr-2 h-4 w-4 rounded-full border-2 border-current">
              {config.imageCount === 4 && (
                <div className="m-0.5 h-2 w-2 rounded-full bg-current" />
              )}
            </div>
            <span className="font-medium">4 Imágenes</span>
          </div>
          <p className="text-sm text-gray-600">
            Layout extendido: 1 imagen principal + 3 secundarias
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1">
            <div className="col-span-2 h-6 w-full rounded-sm bg-gray-300" />
            <div className="flex flex-col space-y-1">
              <div className="h-2 w-full rounded-sm bg-gray-300" />
              <div className="h-2 w-full rounded-sm bg-gray-300" />
              <div className="h-2 w-full rounded-sm bg-gray-300" />
            </div>
          </div>
        </button>
      </div>

      {/* Info about image handling */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="text-sm text-gray-700">
          <span className="font-medium">ℹ️ Información:</span> Las imágenes se
          cargan desde AWS S3 (vesta-configuration-files). Si seleccionas 4
          imágenes y hay menos disponibles, se duplicará la primera imagen.
        </p>
      </div>
    </div>
  );
};
