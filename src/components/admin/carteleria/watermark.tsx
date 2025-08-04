"use client";

import type { FC } from "react";
import Image from "next/image";

interface WatermarkProps {
  brandLogo?: string; // Optional brand logo URL
  opacity?: number; // Opacity level (0-1)
  text?: string; // Custom watermark text
  className?: string;
}

export const Watermark: FC<WatermarkProps> = ({ 
  brandLogo, 
  opacity = 0.1, 
  text = "MUESTRA",
  className 
}) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none z-10 ${className ?? ""}`}
      style={{ opacity }}
      data-testid="watermark"
    >
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45">
        {brandLogo ? (
          <Image 
            src={brandLogo} 
            alt="Watermark" 
            width={200} 
            height={100}
            className="object-contain"
          />
        ) : (
          <span className="text-6xl font-bold text-gray-400 select-none">
            {text}
          </span>
        )}
      </div>
    </div>
  );
};