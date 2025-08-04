
"use client";

import type { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import type { BrandColorPaletteProps } from "~/types/brand";

export const BrandColorPalette: FC<BrandColorPaletteProps> = ({
  colors,
  title = "Paleta de Colores de Marca",
  showHexValues = true,
  className,
}) => {
  // Ensure we have exactly 6 colors (pad with neutrals if needed)
  const displayColors = [...colors];
  while (displayColors.length < 6) {
    displayColors.push('#E2E8F0'); // Default neutral color
  }
  const finalColors = displayColors.slice(0, 6);

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {finalColors.map((color, index) => (
            <ColorSwatch
              key={`${color}-${index}`}
              color={color}
              showHex={showHexValues}
              index={index + 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface ColorSwatchProps {
  color: string;
  showHex: boolean;
  index: number;
}

const ColorSwatch: FC<ColorSwatchProps> = ({ color, showHex, index }) => {
  const handleCopyColor = async () => {
    try {
      await navigator.clipboard.writeText(color);
      // Could add a toast notification here
      console.log(`Copied ${color} to clipboard`);
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleCopyColor}
        className="group relative h-16 w-full min-w-16 rounded-lg border-2 border-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        style={{ backgroundColor: color }}
        title={`Color ${index}: ${color} (Click to copy)`}
      >
        {/* Color preview with subtle gradient for depth */}
        <div
          className="absolute inset-0 rounded-md opacity-10"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, transparent 100%)`,
          }}
        />
        
        {/* Copy indicator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-black/50 px-2 py-1 text-xs text-white">
            Copiar
          </div>
        </div>
      </button>
      
      {showHex && (
        <div className="text-center">
          <div className="text-xs font-medium text-foreground">
            Color {index}
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            {color.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
};

// Utility component for displaying a simple color palette without card wrapper
export const SimpleColorPalette: FC<{
  colors: string[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ colors, size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className={cn("flex space-x-2", className)}>
      {colors.slice(0, 6).map((color, index) => (
        <div
          key={`simple-${color}-${index}`}
          className={cn(
            "rounded-full border-2 border-white shadow-sm",
            sizeClasses[size]
          )}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  );
};