"use client";

import type { FC } from "react";
import { useState, useMemo } from "react";
import type { TemplatePropertyData, BaseTemplateProps, TemplateConfiguration, ExtendedTemplatePropertyData } from "~/types/template-data";
import type { TemplateStyle, TemplateFormat } from "~/types/carteleria";
import {
  getDefaultPropertyData,
  getRandomPropertyData,
} from "~/lib/carteleria/mock-data";

// Import all template components
import { BaseTemplate } from "./base/base-template";
import { BasicTemplate } from "./basic/basic-template";
import { ClassicTemplate } from "./classic/classic-template";
import { ModernTemplate } from "./modern/modern-template";
import { MinimalistTemplate } from "./minimalist/minimalist-template";
import { LuxuryTemplate } from "./luxury/luxury-template";
import { CreativeTemplate } from "./creative/creative-template";
import { ProfessionalTemplate } from "./professional/professional-template";
import { cn } from "~/lib/utils";

interface TemplateRendererProps {
  styleId: string;
  formatId?: string;
  propertyTypeId?: string;
  customData?: TemplatePropertyData;
  style?: TemplateStyle;
  format?: TemplateFormat;
  className?: string;
  showMockData?: boolean;
}

// Modern template preview using the template-classic image
const ModernTemplateWrapper: FC<BaseTemplateProps> = ({ data: _data, className }) => {
  return (
    <div className={cn("relative overflow-hidden aspect-[210/297] h-full w-full", className)}>
      <img 
        src="https://vesta-configuration-files.s3.us-east-1.amazonaws.com/templates/template-classic.png"
        alt="Modern Template Preview"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

const ClassicTemplateWrapper: FC<BaseTemplateProps> = ({ data: _data, className: _className }) => {
  // Classic style has no preview - return null
  return null;
};

// Basic template wrapper - uses BaseTemplate for simplicity
const BasicTemplateWrapper: FC<BaseTemplateProps> = ({ data, className }) => {
  return <BaseTemplate data={data} className={className} />;
};

// Wrapper for other templates using BaseTemplate as fallback
const MinimalistTemplateWrapper: FC<BaseTemplateProps> = ({ data, className }) => {
  return <MinimalistTemplate data={data} className={className} />;
};

const LuxuryTemplateWrapper: FC<BaseTemplateProps> = ({ data, className }) => {
  return <LuxuryTemplate data={data} className={className} />;
};

const CreativeTemplateWrapper: FC<BaseTemplateProps> = ({ data, className }) => {
  return <CreativeTemplate data={data} className={className} />;
};

const ProfessionalTemplateWrapper: FC<BaseTemplateProps> = ({ data, className }) => {
  return <ProfessionalTemplate data={data} className={className} />;
};

// Template component mapping for dynamic rendering
const templateComponents = {
  base: BaseTemplate,
  basic: BasicTemplateWrapper,
  modern: ModernTemplateWrapper,
  classic: ClassicTemplateWrapper,
  minimalist: MinimalistTemplateWrapper,
  luxury: LuxuryTemplateWrapper,
  creative: CreativeTemplateWrapper,
  professional: ProfessionalTemplateWrapper,
} as const;

export const TemplateRenderer: FC<TemplateRendererProps> = ({
  styleId,
  formatId: _formatId,
  propertyTypeId,
  customData,
  style: _style,
  format: _format,
  className,
  showMockData = true,
}) => {
  // Generate or use provided property data
  const propertyData = useMemo(() => {
    if (customData) {
      return customData;
    }

    if (showMockData) {
      if (
        propertyTypeId &&
        ["piso", "casa", "local", "garaje", "solar"].includes(propertyTypeId)
      ) {
        return getDefaultPropertyData(
          propertyTypeId as "piso" | "casa" | "local" | "garaje" | "solar",
        );
      }
      return getRandomPropertyData();
    }

    // Return default data if no mock data requested
    return getDefaultPropertyData();
  }, [customData, propertyTypeId, showMockData]);

  // Select the appropriate template component
  const TemplateComponent = useMemo(() => {
    // Validate styleId and return appropriate component
    if (styleId in templateComponents) {
      return templateComponents[styleId as keyof typeof templateComponents];
    }

    // Fallback to base template if style not found
    console.warn(
      `Unknown template style: ${styleId}, falling back to base template`,
    );
    return BaseTemplate;
  }, [styleId]);

  // Error boundary wrapper for template rendering
  const [hasError, setHasError] = useState(false);

  const handleTemplateError = (error: Error) => {
    console.error(`Template rendering error for style "${styleId}":`, error);
    setHasError(true);
  };

  // If error occurred, render base template as fallback
  if (hasError) {
    return <BaseTemplate data={propertyData} className={className} />;
  }

  try {
    return <TemplateComponent data={propertyData} className={className} />;
  } catch (error) {
    handleTemplateError(error as Error);
    return <BaseTemplate data={propertyData} className={className} />;
  }
};

// Preview template renderer for style selector
interface TemplatePreviewRendererProps {
  styleId: string;
  propertyTypeId?: string;
  className?: string;
  size?: "small" | "medium" | "large";
}

export const TemplatePreviewRenderer: FC<TemplatePreviewRendererProps> = ({
  styleId,
  propertyTypeId,
  className,
  size = "medium",
}) => {
  const sizeClasses = {
    small: "w-full h-full",
    medium: "w-full h-full",
    large: "w-full h-full",
  };

  return (
    <div className={`${sizeClasses[size]} transition-transform duration-200`}>
      <TemplateRenderer
        styleId={styleId}
        propertyTypeId={propertyTypeId}
        className={className}
        showMockData={true}
      />
    </div>
  );
};

// Batch template renderer for gallery view
interface TemplateGalleryRendererProps {
  templates: Array<{
    styleId: string;
    propertyTypeId?: string;
    formatId?: string;
  }>;
  onTemplatePreview?: (styleId: string) => void;
  className?: string;
}

export const TemplateGalleryRenderer: FC<TemplateGalleryRendererProps> = ({
  templates,
  onTemplatePreview: _onTemplatePreview,
  className,
}) => {
  return (
    <div
      className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${className ?? ""}`}
    >
      {templates.map((template, index) => (
        <div
          key={`${template.styleId}-${index}`}
          className="flex justify-center"
        >
          <TemplatePreviewRenderer
            styleId={template.styleId}
            propertyTypeId={template.propertyTypeId}
            size="medium"
          />
        </div>
      ))}
    </div>
  );
};

// Utility function to validate template style ID
export const isValidStyleId = (styleId: string): boolean => {
  return styleId in templateComponents;
};

// Utility function to get available template styles
export const getAvailableStyles = (): string[] => {
  return Object.keys(templateComponents);
};

// Utility function to get template component name for debugging
export const getTemplateComponentName = (styleId: string): string => {
  if (styleId in templateComponents) {
    return (
      templateComponents[styleId as keyof typeof templateComponents].name ||
      styleId
    );
  }
  return "BaseTemplate";
};
