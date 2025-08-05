"use client";

import type { FC } from "react";
import { cn } from "~/lib/utils";
import type { TemplateConfiguration } from "~/types/template-data";

interface ListingTypeSelectorProps {
  config: TemplateConfiguration;
  onChange: (updates: Partial<TemplateConfiguration>) => void;
}

const LISTING_TYPES = [
  {
    value: "venta" as const,
    label: "Venta",
    icon: "🏷️",
    description: "Propiedad en venta",
    color: "green",
  },
  {
    value: "alquiler" as const,
    label: "Alquiler",
    icon: "🔑",
    description: "Propiedad en alquiler",
    color: "blue",
  },
] as const;

export const ListingTypeSelector: FC<ListingTypeSelectorProps> = ({
  config,
  onChange,
}) => {
  const handleListingTypeChange = (listingType: "venta" | "alquiler") => {
    onChange({ listingType });
  };

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h3 className="text-lg font-medium">Tipo de Operación</h3>
        <p className="text-sm text-gray-600">
          Selecciona si la propiedad está en venta o alquiler
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {LISTING_TYPES.map((type) => {
          const isSelected = config.listingType === type.value;
          const colorClasses = {
            green: {
              selected: "bg-green-50 border-green-500 text-green-700",
              unselected: "hover:border-green-300",
            },
            blue: {
              selected: "bg-blue-50 border-blue-500 text-blue-700",
              unselected: "hover:border-blue-300",
            },
          };

          return (
            <button
              key={type.value}
              onClick={() => handleListingTypeChange(type.value)}
              className={cn(
                "rounded-lg border-2 p-4 text-left transition-all duration-200",
                "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2",
                isSelected && colorClasses[type.color].selected,
                isSelected && "focus:ring-current",
                !isSelected &&
                  "border-gray-200 bg-white hover:border-gray-300 focus:ring-gray-500",
                !isSelected && colorClasses[type.color].unselected,
              )}
            >
              <div className="mb-2 flex items-center">
                <span className="mr-3 text-2xl">{type.icon}</span>
                <div>
                  <div className="text-base font-medium">{type.label}</div>
                  <div className="text-sm opacity-75">{type.description}</div>
                </div>
              </div>

              {isSelected && (
                <div className="mt-2 flex items-center">
                  <div className="mr-2 h-2 w-2 rounded-full bg-current" />
                  <span className="text-xs font-medium">Seleccionado</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Information about how this affects the template */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="text-sm text-gray-700">
          <span className="font-medium">💡 Efecto:</span> Esto cambiará el
          formato del precio
          {config.listingType === "venta"
            ? " (se mostrará el precio total en euros)"
            : " (se mostrará el precio mensual con €/mes)"}{" "}
          y puede afectar otros elementos de la plantilla.
        </p>
      </div>
    </div>
  );
};
