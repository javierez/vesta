"use client";

import type { FC } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Palette, CheckCircle2 } from "lucide-react";
import type { StyleSelectorProps } from "~/types/carteleria";
import { templateStyles } from "~/lib/carteleria/templates";

export const StyleSelector: FC<StyleSelectorProps> = ({
  selectedStyleId,
  onStyleSelect,
  styles = templateStyles,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Elige tu Estilo</h2>
        <p className="text-gray-600">
          Selecciona un estilo principal que se aplicará a todos tus carteles
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {styles.map((style) => (
          <StyleCard
            key={style.id}
            style={style}
            isSelected={selectedStyleId === style.id}
            onSelect={() => onStyleSelect(style.id)}
          />
        ))}
      </div>
    </div>
  );
};

interface StyleCardProps {
  style: (typeof templateStyles)[0];
  isSelected: boolean;
  onSelect: () => void;
}

const StyleCard: FC<StyleCardProps> = ({ style, isSelected, onSelect }) => {
  return (
    <Card
      className={`group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
        isSelected
          ? "scale-105 shadow-lg ring-2 ring-primary"
          : "hover:shadow-md"
      }`}
      onClick={onSelect}
    >
      <CardHeader className="space-y-3">
        {/* Preview Image */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
          <Image
            src={style.preview}
            alt={`Vista previa del estilo ${style.name}`}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-110"
            onError={(e) => {
              // Fallback to gradient background if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
          {/* Overlay with selection indicator */}
          {isSelected && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
              <div className="rounded-full bg-primary p-2">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Style Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg transition-colors group-hover:text-primary">
              {style.name}
            </CardTitle>
            <Badge variant="outline" className="text-xs capitalize">
              {style.category}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {style.description}
        </CardDescription>

        {/* Color Palette Preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">
              Paleta de colores
            </span>
          </div>
          <div className="flex gap-2">
            <div
              className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: style.colorScheme.primary }}
              title={`Primario: ${style.colorScheme.primary}`}
            />
            <div
              className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: style.colorScheme.secondary }}
              title={`Secundario: ${style.colorScheme.secondary}`}
            />
            <div
              className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: style.colorScheme.accent }}
              title={`Acento: ${style.colorScheme.accent}`}
            />
          </div>
        </div>

        {/* Selection Feedback */}
        {isSelected && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-3">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Estilo seleccionado</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
