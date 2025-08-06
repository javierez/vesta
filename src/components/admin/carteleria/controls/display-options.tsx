
import type { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import {
  Eye,
  QrCode,
  Droplets,
  Phone,
  Mail,
  Globe,
  Hash,
  FileText,
} from "lucide-react";
import type { DisplayOptionsProps } from "~/types/poster-preferences";

export const DisplayOptions: FC<DisplayOptionsProps> = ({
  preferences,
  onChange,
}) => {
  const displayOptions = [
    {
      key: "show_icons" as keyof typeof preferences,
      label: "Iconos",
      description: "Mostrar iconos para habitaciones, baños y metros cuadrados",
      icon: Eye,
    },
    {
      key: "show_qr_code" as keyof typeof preferences,
      label: "Código QR",
      description: "Incluir código QR con información de contacto",
      icon: QrCode,
    },
    {
      key: "show_watermark" as keyof typeof preferences,
      label: "Marca de Agua",
      description: "Mostrar logo como marca de agua en cada imagen",
      icon: Droplets,
    },
    {
      key: "show_phone" as keyof typeof preferences,
      label: "Teléfono",
      description: "Mostrar número de teléfono de contacto",
      icon: Phone,
    },
    {
      key: "show_email" as keyof typeof preferences,
      label: "Email",
      description: "Mostrar email de contacto",
      icon: Mail,
    },
    {
      key: "show_website" as keyof typeof preferences,
      label: "Sitio Web",
      description: "Mostrar sitio web en la información de contacto",
      icon: Globe,
    },
    {
      key: "show_reference" as keyof typeof preferences,
      label: "Referencia",
      description:
        "Mostrar referencia del piso en la esquina inferior izquierda",
      icon: Hash,
    },
    {
      key: "show_description" as keyof typeof preferences,
      label: "Descripción Breve",
      description: "Incluir descripción corta de la propiedad",
      icon: FileText,
    },
  ];

  const handleToggleChange = (
    key: keyof typeof preferences,
    checked: boolean,
  ) => {
    onChange({ [key]: checked });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Opciones de Visualización
        </CardTitle>
        <p className="text-sm text-gray-600">
          Controla qué elementos se muestran en la plantilla
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {displayOptions.map((option) => {
          const Icon = option.icon;
          const isChecked = preferences[option.key] as boolean;

          return (
            <div key={option.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <Label
                      htmlFor={option.key}
                      className="cursor-pointer font-medium"
                    >
                      {option.label}
                    </Label>
                    <p className="mt-1 text-sm text-gray-500">
                      {option.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={option.key}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleToggleChange(option.key, checked)
                  }
                />
              </div>
              {/* Separator line except for last item */}
              {option.key !== "show_description" && (
                <hr className="border-gray-100" />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
