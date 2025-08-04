"use client";

import type { FC } from "react";
import { cn } from "~/lib/utils";
import type { TemplateConfiguration } from "~/types/template-data";

interface TemplateStyleSelectorProps {
  config: TemplateConfiguration;
  onChange: (updates: Partial<TemplateConfiguration>) => void;
}

const TEMPLATE_STYLES = [
  {
    value: "modern" as const,
    label: "Moderno",
    icon: "🏢",
    description: "Diseño limpio y minimalista",
    color: "blue",
    available: true
  },
  {
    value: "basic" as const,
    label: "Básico",
    icon: "📋",
    description: "Simple y funcional",
    color: "green",
    available: true
  },
  {
    value: "classic" as const,
    label: "Clásico", 
    icon: "🏛️",
    description: "Elegancia tradicional",
    color: "amber",
    available: false
  },
  {
    value: "luxury" as const,
    label: "Lujo",
    icon: "💎", 
    description: "Sofisticación premium",
    color: "purple",
    available: false
  },
  {
    value: "professional" as const,
    label: "Profesional",
    icon: "💼",
    description: "Corporativo y serio", 
    color: "gray",
    available: false
  },
  {
    value: "creative" as const,
    label: "Creativo",
    icon: "🎨",
    description: "Artístico y único",
    color: "pink",
    available: false
  }
] as const;

export const TemplateStyleSelector: FC<TemplateStyleSelectorProps> = ({ 
  config, 
  onChange 
}) => {
  const handleStyleChange = (templateStyle: "modern" | "basic" | "classic" | "luxury" | "professional" | "creative") => {
    onChange({ templateStyle });
  };

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h3 className="text-lg font-medium">Estilo de Plantilla</h3>
        <p className="text-sm text-gray-600">
          Selecciona el estilo visual de la plantilla
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {TEMPLATE_STYLES.map((style) => {
          const isSelected = config.templateStyle === style.value;
          const isAvailable = style.available;
          
          const colorClasses: Record<string, { selected: string; unselected: string }> = {
            blue: {
              selected: "bg-blue-50 border-blue-500 text-blue-700",
              unselected: "hover:border-blue-300"
            },
            green: {
              selected: "bg-green-50 border-green-500 text-green-700",
              unselected: "hover:border-green-300"
            },
            amber: {
              selected: "bg-amber-50 border-amber-500 text-amber-700",
              unselected: "hover:border-amber-300"
            },
            purple: {
              selected: "bg-purple-50 border-purple-500 text-purple-700",
              unselected: "hover:border-purple-300"
            },
            gray: {
              selected: "bg-gray-50 border-gray-500 text-gray-700",
              unselected: "hover:border-gray-300"
            },
            pink: {
              selected: "bg-pink-50 border-pink-500 text-pink-700",
              unselected: "hover:border-pink-300"
            }
          };

          return (
            <button
              key={style.value}
              onClick={() => isAvailable && handleStyleChange(style.value)}
              disabled={!isAvailable}
              className={cn(
                "p-4 rounded-lg border-2 text-left transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                isAvailable && "hover:shadow-md",
                !isAvailable && "opacity-50 cursor-not-allowed bg-gray-50",
                isSelected && isAvailable && colorClasses[style.color].selected,
                isSelected && isAvailable && "focus:ring-current",
                !isSelected && isAvailable && "bg-white border-gray-200 hover:border-gray-300 focus:ring-gray-500",
                !isSelected && isAvailable && colorClasses[style.color].unselected
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{style.icon}</span>
                  <div>
                    <div className="font-medium text-base flex items-center gap-2">
                      {style.label}
                      {!isAvailable && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          Próximamente
                        </span>
                      )}
                    </div>
                    <div className="text-sm opacity-75">{style.description}</div>
                  </div>
                </div>
                
                {isSelected && isAvailable && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-current rounded-full mr-2" />
                    <span className="text-xs font-medium">Seleccionado</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Information about current selection */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-sm text-gray-700">
          <span className="font-medium">💡 Estilo actual:</span> {TEMPLATE_STYLES.find(s => s.value === config.templateStyle)?.label ?? "Moderno"}
          {config.templateStyle !== "modern" && config.templateStyle !== "basic" && (
            <span className="ml-2 text-amber-600">(Próximamente disponible)</span>
          )}
        </p>
      </div>
    </div>
  );
};