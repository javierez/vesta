"use client";

import type { FC } from "react";
import { cn } from "~/lib/utils";
import type { TemplateConfiguration } from "~/types/template-data";

interface TypographyOverlaySelectorProps {
  config: TemplateConfiguration;
  onChange: (updates: Partial<TemplateConfiguration>) => void;
}

// Font options with their CSS classes
const FONT_OPTIONS = [
  { value: "default" as const, label: "Por Defecto", className: "font-sans" },
  { value: "serif" as const, label: "Serif", className: "font-serif" },
  { value: "sans" as const, label: "Sans Serif", className: "font-sans" },
  { value: "mono" as const, label: "Monospace", className: "font-mono" },
  { value: "elegant" as const, label: "Elegante", className: "font-serif" },
  { value: "modern" as const, label: "Moderno", className: "font-sans" },
];

// Overlay color options
const OVERLAY_OPTIONS = [
  {
    value: "default" as const,
    label: "Por Defecto",
    color: "bg-gray-400/70",
    preview: "#9ca3af",
  },
  {
    value: "dark" as const,
    label: "Oscuro",
    color: "bg-gray-800/80",
    preview: "#1f2937",
  },
  {
    value: "light" as const,
    label: "Claro",
    color: "bg-gray-200/80",
    preview: "#e5e7eb",
  },
  {
    value: "blue" as const,
    label: "Azul",
    color: "bg-blue-500/70",
    preview: "#3b82f6",
  },
  {
    value: "green" as const,
    label: "Verde",
    color: "bg-green-500/70",
    preview: "#10b981",
  },
  {
    value: "purple" as const,
    label: "Morado",
    color: "bg-purple-500/70",
    preview: "#8b5cf6",
  },
  {
    value: "red" as const,
    label: "Rojo",
    color: "bg-red-500/70",
    preview: "#ef4444",
  },
];

export const TypographyOverlaySelector: FC<TypographyOverlaySelectorProps> = ({
  config,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Typography Section */}
      <div>
        <h3 className="mb-4 text-lg font-medium">Tipografía</h3>

        {/* Title Font */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            Fuente del Título (Tipo de Propiedad)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.value}
                onClick={() => onChange({ titleFont: font.value })}
                className={cn(
                  "rounded border p-2 text-xs transition-colors",
                  font.className,
                  config.titleFont === font.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300",
                )}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Font */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            Fuente del Precio
          </label>
          <div className="grid grid-cols-3 gap-2">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.value}
                onClick={() => onChange({ priceFont: font.value })}
                className={cn(
                  "rounded border p-2 text-xs transition-colors",
                  font.className,
                  config.priceFont === font.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300",
                )}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay Colors Section */}
      <div>
        <h3 className="mb-4 text-lg font-medium">Color de Overlays</h3>
        <p className="mb-3 text-sm text-gray-600">
          Cambia el color de fondo de las dos capas de información
        </p>

        <div className="grid grid-cols-4 gap-2">
          {OVERLAY_OPTIONS.map((overlay) => (
            <button
              key={overlay.value}
              onClick={() => onChange({ overlayColor: overlay.value })}
              className={cn(
                "flex flex-col items-center gap-1 rounded border p-2 text-xs transition-colors",
                config.overlayColor === overlay.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300",
              )}
            >
              <div
                className="h-6 w-6 rounded border"
                style={{ backgroundColor: overlay.preview + "B3" }} // B3 = ~70% opacity in hex
              />
              <span
                className={cn(
                  config.overlayColor === overlay.value
                    ? "text-blue-700"
                    : "text-gray-700",
                )}
              >
                {overlay.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
