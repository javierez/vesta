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
  className,
}) => {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-10 ${className ?? ""}`}
      style={{ opacity }}
      data-testid="watermark"
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 transform">
        {brandLogo ? (
          <Image
            src={brandLogo}
            alt="Watermark"
            width={200}
            height={100}
            className="object-contain"
          />
        ) : (
          <span className="select-none text-6xl font-bold text-gray-400">
            {text}
          </span>
        )}
      </div>
    </div>
  );
};
