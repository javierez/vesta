import type { FC } from "react";
import { cn } from "~/lib/utils";
import type { TemplateConfiguration } from "~/types/template-data";

interface AdditionalFieldsSelectorProps {
  config: TemplateConfiguration;
  onChange: (updates: Partial<TemplateConfiguration>) => void;
}

// Available fields for selection based on database schema
const AVAILABLE_FIELDS = [
  {
    value: "energyConsumptionScale",
    label: "Certificación Energética",
    icon: "⚡",
    description: "Calificación energética A-G",
  },
  {
    value: "yearBuilt",
    label: "Año de Construcción",
    icon: "📅",
    description: "Año en que se construyó",
  },
  {
    value: "hasElevator",
    label: "Ascensor",
    icon: "🛗",
    description: "Disponibilidad de ascensor",
  },
  {
    value: "hasGarage",
    label: "Garaje",
    icon: "🚗",
    description: "Plaza de garaje incluida",
  },
  {
    value: "hasStorageRoom",
    label: "Trastero",
    icon: "📦",
    description: "Trastero incluido",
  },
  {
    value: "terrace",
    label: "Terraza",
    icon: "🏞️",
    description: "Terraza disponible",
  },
  {
    value: "orientation",
    label: "Orientación",
    icon: "🧭",
    description: "Orientación cardinal",
  },
  {
    value: "heatingType",
    label: "Calefacción",
    icon: "🔥",
    description: "Tipo de calefacción",
  },
  {
    value: "conservationStatus",
    label: "Estado",
    icon: "🏠",
    description: "Estado de conservación",
  },
] as const;

export const AdditionalFieldsSelector: FC<AdditionalFieldsSelectorProps> = ({
  config,
  onChange,
}) => {
  const handleFieldToggle = (fieldValue: string) => {
    const currentFields = config.additionalFields;
    const isSelected = currentFields.includes(fieldValue);

    let newFields: string[];

    if (isSelected) {
      // Remove field
      newFields = currentFields.filter((field) => field !== fieldValue);
    } else {
      // Add field (respecting 3-item limit)
      if (currentFields.length >= 3) {
        // Replace the first field with the new one
        newFields = [currentFields[1]!, currentFields[2]!, fieldValue];
      } else {
        newFields = [...currentFields, fieldValue];
      }
    }

    onChange({ additionalFields: newFields });
  };

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h3 className="text-lg font-medium">Información Adicional</h3>
        <p className="text-sm text-gray-600">
          Selecciona hasta 3 campos adicionales para mostrar (máximo 3)
        </p>
        {config.additionalFields.length > 0 && (
          <p className="text-xs text-blue-600">
            Seleccionados: {config.additionalFields.length}/3
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {AVAILABLE_FIELDS.map((field) => {
          const isSelected = config.additionalFields.includes(field.value);
          const isDisabled = !isSelected && config.additionalFields.length >= 3;

          return (
            <button
              key={field.value}
              onClick={() => !isDisabled && handleFieldToggle(field.value)}
              disabled={isDisabled}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border-2 p-3 text-xs font-medium transition-all duration-200",
                "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isSelected && "border-blue-500 bg-blue-50 text-blue-700",
                !isSelected &&
                  !isDisabled &&
                  "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                isDisabled &&
                  "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-60",
              )}
              title={
                isDisabled ? "Máximo 3 campos seleccionados" : field.description
              }
            >
              <span className="mb-1 text-lg">{field.icon}</span>
              <span className="text-center leading-tight">{field.label}</span>
              {isSelected && (
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>

      {config.additionalFields.length === 3 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            ✓ Límite alcanzado. Selecciona otro campo para reemplazar uno
            existente.
          </p>
        </div>
      )}
    </div>
  );
};
