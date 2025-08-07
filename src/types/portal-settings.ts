import { z } from "zod";

// Portal configuration data structure
export interface PortalConfigurationData {
  fotocasa?: {
    enabled: boolean;
    apiKey?: string;
    customSettings?: Record<string, unknown>;
  };
  idealista?: {
    enabled: boolean;
    apiKey?: string;
    customSettings?: Record<string, unknown>;
  };
  general: {
    watermarkEnabled: boolean;
    watermarkPosition?:
      | "top-left"
      | "top-right"
      | "bottom-left"
      | "bottom-right"
      | "center";
  };
}

// Input type for forms
export interface PortalConfigurationInput {
  fotocasa?: {
    enabled: boolean;
    apiKey?: string;
  };
  idealista?: {
    enabled: boolean;
    apiKey?: string;
  };
  general: {
    watermarkEnabled: boolean;
    watermarkPosition?:
      | "top-left"
      | "top-right"
      | "bottom-left"
      | "bottom-right"
      | "center";
  };
}

// Zod validation schema
export const portalConfigurationSchema = z.object({
  fotocasa: z
    .object({
      enabled: z.boolean(),
      apiKey: z.string().optional(),
    })
    .optional(),
  idealista: z
    .object({
      enabled: z.boolean(),
      apiKey: z.string().optional(),
    })
    .optional(),
  general: z.object({
    watermarkEnabled: z.boolean(),
    watermarkPosition: z
      .enum(["top-left", "top-right", "bottom-left", "bottom-right", "center"])
      .optional(),
  }),
});

// API Response type
export interface PortalConfigurationResponse {
  success: boolean;
  data?: PortalConfigurationData;
  error?: string;
}

// Tab configuration type
export interface PortalTab {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}
