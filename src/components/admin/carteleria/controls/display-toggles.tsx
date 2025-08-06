"use client";

import type { FC } from "react";
import { Switch } from "~/components/ui/switch";
import type { TemplateConfiguration } from "~/types/template-data";

interface DisplayTogglesProps {
  config: TemplateConfiguration;
  onChange: (updates: Partial<TemplateConfiguration>) => void;
}

export const DisplayToggles: FC<DisplayTogglesProps> = ({
  config,
  onChange,
}) => {
  const handleToggle = (field: keyof TemplateConfiguration, value: boolean) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h3 className="text-lg font-medium">Opciones de Visualización</h3>
        <p className="text-sm text-gray-600">
          Controla qué elementos se muestran en la plantilla
        </p>
      </div>

      {/* Icons Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Iconos</label>
          <p className="text-xs text-gray-500">
            Mostrar iconos para habitaciones, baños y metros cuadrados
          </p>
        </div>
        <Switch
          checked={config.showIcons}
          onCheckedChange={(checked) => handleToggle("showIcons", checked)}
        />
      </div>

      {/* QR Code Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Código QR</label>
          <p className="text-xs text-gray-500">
            Incluir código QR con información de contacto
          </p>
        </div>
        <Switch
          checked={config.showQR}
          onCheckedChange={(checked) => handleToggle("showQR", checked)}
        />
      </div>

      {/* Watermark Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">
            Marca de Agua
          </label>
          <p className="text-xs text-gray-500">
            Mostrar logo como marca de agua en cada imagen
          </p>
        </div>
        <Switch
          checked={config.showWatermark}
          onCheckedChange={(checked) => handleToggle("showWatermark", checked)}
        />
      </div>

      {/* Phone Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Teléfono</label>
          <p className="text-xs text-gray-500">
            Mostrar número de teléfono de contacto
          </p>
        </div>
        <Switch
          checked={config.showPhone}
          onCheckedChange={(checked) => handleToggle("showPhone", checked)}
        />
      </div>

      {/* Website Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Sitio Web</label>
          <p className="text-xs text-gray-500">
            Mostrar sitio web en la información de contacto
          </p>
        </div>
        <Switch
          checked={config.showWebsite}
          onCheckedChange={(checked) => handleToggle("showWebsite", checked)}
        />
      </div>

      {/* Reference Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Referencia</label>
          <p className="text-xs text-gray-500">
            Mostrar referencia del piso en la esquina superior izquierda
          </p>
        </div>
        <Switch
          checked={config.showReference}
          onCheckedChange={(checked) => handleToggle("showReference", checked)}
        />
      </div>

      {/* Short Description Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">
            Descripción Breve
          </label>
          <p className="text-xs text-gray-500">
            Incluir descripción corta de la propiedad
          </p>
        </div>
        <Switch
          checked={config.showShortDescription}
          onCheckedChange={(checked) =>
            handleToggle("showShortDescription", checked)
          }
        />
      </div>
    </div>
  );
};
