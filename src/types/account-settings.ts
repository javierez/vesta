import { z } from "zod";

// Account configuration schema
export const accountConfigurationSchema = z.object({
  // Basic Information
  name: z.string().min(1, "El nombre es requerido"),
  shortName: z.string().optional(),
  legalName: z.string().optional(),
  logo: z.string().optional(),
  
  // Contact Information
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  
  // Legal Information
  taxId: z.string().optional(),
  registryDetails: z.string().optional(),
  legalEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  jurisdiction: z.string().optional(),
  privacyEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  dpoEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  
  // Settings
  preferences: z.record(z.any()).optional(),
});

export type AccountConfigurationInput = z.infer<typeof accountConfigurationSchema>;