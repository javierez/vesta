"use client";

import { cn } from "~/lib/utils";
import {
  FileText,
  Mic,
  Zap,
  FileSignature,
  Check,
} from "lucide-react";

export interface RegistrationOption {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  features: string[];
  additionalInfo?: string;
  gradient: string;
  bgActive: string;
  action: () => void;
}

interface RegistrationOptionsProps {
  activeOption: string | null;
  onToggleOption: (optionId: string) => void;
  className?: string;
}

export function RegistrationOptions({ 
  activeOption, 
  onToggleOption,
  className 
}: RegistrationOptionsProps) {
  const options: RegistrationOption[] = [
    {
      id: "quick",
      title: "Formulario Rápido",
      icon: Zap,
      description: "Captura los datos esenciales para crear la propiedad en un instante",
      features: [
        "Venta o alquiler, casa o piso",
        "Información de contacto",
        "Dirección y precio"
      ],
      gradient: "from-amber-400 to-rose-400",
      bgActive: "from-amber-50 to-rose-50",
      action: () => console.log("Navigate to quick form"),
    },
    {
      id: "complete",
      title: "Formulario Completo",
      icon: FileText,
      description: "Registra todos los detalles y características del inmueble",
      features: [
        "Información completa",
        "Características detalladas",
      ],
      gradient: "from-amber-400 to-rose-400",
      bgActive: "from-amber-50 to-rose-50",
      action: () => console.log("Navigate to long form"),
    },
    {
      id: "recording",
      title: "Grabación de Voz",
      icon: Mic,
      description: "Habla con nuesetro sistema y la IA registrará la información automáticamente",
      features: [
        "Transcripción automática",
        "Procesamiento con IA",
        "Extracción de datos",
        "Ahorra 10 minutos por propiedad",
      ],
      additionalInfo: "Dirección, tipo de propiedad, habitaciones, baños, precio y características especiales.",
      gradient: "from-amber-400 to-rose-400",
      bgActive: "from-amber-50 to-rose-50",
      action: () => console.log("Open recording panel"),
    },
    {
      id: "upload",
      title: "Ficha de Encargo",
      icon: FileSignature,
      description: "Carga documentos existentes y extrae información automáticamente",
      features: [
        "OCR inteligente",
        "Extracción automática",
        "Múltiples formatos",
        "Procesamiento rápido",
      ],
      gradient: "from-amber-400 to-rose-400",
      bgActive: "from-amber-50 to-rose-50",
      action: () => console.log("Open upload panel"),
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}>
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = activeOption === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => onToggleOption(option.id)}
            className={cn(
              "relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200",
              "hover:scale-[1.02]",
              isActive
                ? `bg-gradient-to-br ${option.bgActive} shadow-lg`
                : "bg-gray-50 shadow hover:shadow-lg"
            )}
          >
            <div
              className={cn(
                "mb-2 rounded-lg p-2 transition-colors",
                isActive
                  ? `bg-gradient-to-r ${option.gradient}`
                  : "bg-gray-100"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-white" : "text-gray-600"
                )}
              />
            </div>
            <span
              className={cn(
                "text-xs font-medium text-center transition-colors",
                isActive ? "text-gray-900" : "text-gray-600"
              )}
            >
              {option.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export interface OptionDetailsProps {
  option: RegistrationOption;
  showStartButton?: boolean;
  onStart?: () => void;
}

export function OptionDetails({ 
  option, 
  showStartButton = true,
  onStart 
}: OptionDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {option.title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {option.description}
        </p>
      </div>
      
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">
          Características principales
        </h4>
        <ul className="space-y-3">
          {option.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 p-1">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        {option.additionalInfo && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
            <h5 className="text-sm font-medium text-gray-900 mb-1">
              Información a mencionar:
            </h5>
            <p className="text-xs text-gray-600">
              {option.additionalInfo}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

export interface OptionPreviewProps {
  optionId: string;
}

export function OptionPreview({ optionId: _ }: OptionPreviewProps) {
  // The actual preview components will be imported and used in the parent component
  // This is just a placeholder that returns null since we'll use specific components
  return null;
}