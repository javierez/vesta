"use client";

import React from "react";
import { cn } from "~/lib/utils";

interface GradientTitleProps {
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function GradientTitle({ 
  children, 
  subtitle, 
  className,
  size = "lg" 
}: GradientTitleProps) {
  const sizeClasses = {
    sm: "text-2xl md:text-3xl",
    md: "text-3xl md:text-4xl", 
    lg: "text-4xl md:text-6xl",
    xl: "text-5xl md:text-7xl"
  };

  return (
    <div className={cn("text-center", className)}>
      <h1 className={cn(
        "font-bold bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent leading-tight",
        "animate-in slide-in-from-bottom-4 duration-700",
        sizeClasses[size]
      )}>
        {children}
      </h1>
      {subtitle && (
        <p className={cn(
          "mt-4 text-lg md:text-xl text-gray-600 font-medium",
          "animate-in slide-in-from-bottom-6 duration-700 delay-150"
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
}