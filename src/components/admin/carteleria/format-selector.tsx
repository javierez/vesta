import type { FC } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { FileText, Smartphone, Ruler } from "lucide-react";
import type { FormatSelectorProps } from "~/types/carteleria";
import { templateFormats } from "~/lib/carteleria/templates";

export const FormatSelector: FC<FormatSelectorProps> = ({
  selectedFormatIds,
  onFormatToggle,
  formats = templateFormats,
}) => {
  const paperFormats = formats.filter((format) => format.category === "paper");
  const digitalFormats = formats.filter(
    (format) => format.category === "digital",
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Selecciona los Formatos
        </h2>
        <p className="text-gray-600">
          Elige los tamaños y orientaciones que necesitas para tus carteles
        </p>
      </div>

      {/* Paper Formats Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">
            Formatos Impresos
          </h3>
          <Badge variant="secondary" className="ml-2">
            {paperFormats.length} disponibles
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paperFormats.map((format) => (
            <FormatCard
              key={format.id}
              format={format}
              isSelected={selectedFormatIds.includes(format.id)}
              onToggle={() => onFormatToggle(format.id)}
            />
          ))}
        </div>
      </div>

      {/* Digital Formats Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">
            Formatos Digitales
          </h3>
          <Badge variant="secondary" className="ml-2">
            {digitalFormats.length} disponibles
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {digitalFormats.map((format) => (
            <FormatCard
              key={format.id}
              format={format}
              isSelected={selectedFormatIds.includes(format.id)}
              onToggle={() => onFormatToggle(format.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface FormatCardProps {
  format: (typeof templateFormats)[0];
  isSelected: boolean;
  onToggle: () => void;
}

const FormatCard: FC<FormatCardProps> = ({ format, isSelected, onToggle }) => {
  // Calculate aspect ratio for visual representation
  const aspectRatio = format.dimensions.width / format.dimensions.height;
  const isLandscape = format.orientation === "landscape";

  // Create visual representation dimensions (scaled for display)
  const maxSize = 60;
  let visualWidth, visualHeight;

  if (aspectRatio > 1) {
    visualWidth = maxSize;
    visualHeight = maxSize / aspectRatio;
  } else {
    visualHeight = maxSize;
    visualWidth = maxSize * aspectRatio;
  }

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? "bg-primary/5 shadow-md ring-2 ring-primary"
          : "hover:bg-gray-50"
      }`}
      onClick={onToggle}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{format.name}</CardTitle>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            className="mt-1"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Visual Aspect Ratio Representation */}
        <div className="flex h-16 items-center justify-center">
          <div className="relative">
            <div
              className={`flex items-center justify-center border-2 border-dashed border-gray-400 ${
                isSelected ? "border-primary bg-primary/10" : "bg-gray-50"
              }`}
              style={{
                width: `${visualWidth}px`,
                height: `${visualHeight}px`,
              }}
            >
              <div className="font-mono text-xs text-gray-600">
                {format.orientation === "portrait" ? "📄" : "📃"}
              </div>
            </div>
            {/* Orientation indicator */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 transform">
              <Badge variant="outline" className="px-1 py-0 text-xs">
                {isLandscape ? "H" : "V"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-2">
          <CardDescription className="text-center font-mono text-sm">
            {format.dimensions.width} × {format.dimensions.height}{" "}
            {format.dimensions.unit}
          </CardDescription>

          {/* Category and Orientation Badges */}
          <div className="flex justify-center gap-2">
            <Badge
              variant={format.category === "paper" ? "default" : "secondary"}
              className="text-xs capitalize"
            >
              {format.category === "paper" ? "Impreso" : "Digital"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {format.orientation === "portrait" ? "Vertical" : "Horizontal"}
            </Badge>
          </div>
        </div>

        {/* Usage hint */}
        <CardDescription className="text-center text-xs text-gray-500">
          {format.category === "paper"
            ? "Ideal para impresión física"
            : "Optimizado para redes sociales"}
        </CardDescription>
      </CardContent>
    </Card>
  );
};
