import type { UseFormReturn } from "react-hook-form";
import { type WebsiteConfigurationInput } from "~/types/website-settings";

// Base props for all section components
interface SectionProps {
  form: UseFormReturn<WebsiteConfigurationInput>;
  loading?: boolean;
  onSave?: (sectionData: Partial<WebsiteConfigurationInput>) => Promise<void>;
}

// Extended props for section components with change detection
export interface WebsiteSectionBaseProps extends SectionProps {
  isActive: boolean;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

// Specific section props
export type SEOSectionProps = WebsiteSectionBaseProps;

export type BrandingSectionProps = WebsiteSectionBaseProps;

export type HeroSectionProps = WebsiteSectionBaseProps;

export type FeaturedSectionProps = WebsiteSectionBaseProps;

export type AboutSectionProps = WebsiteSectionBaseProps;

export type PropertiesSectionProps = WebsiteSectionBaseProps;

export interface TestimonialsSectionProps extends WebsiteSectionBaseProps {
  accountId: bigint | null;
}

export interface ContactSectionProps extends WebsiteSectionBaseProps {
  accountId: bigint | null;
}

export type FooterSectionProps = WebsiteSectionBaseProps;

export type SocialSectionProps = WebsiteSectionBaseProps;

export type HeadSectionProps = WebsiteSectionBaseProps;

export type MetaSectionProps = WebsiteSectionBaseProps;

// Sub-component props
export interface KPIConfigurationProps {
  form: UseFormReturn<WebsiteConfigurationInput>;
}

export interface SocialLinksInputProps {
  form: UseFormReturn<WebsiteConfigurationInput>;
}

export interface ImageInputWithPreviewProps {
  form: UseFormReturn<WebsiteConfigurationInput>;
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  showToggleState?: boolean;
  onToggle?: (show: boolean) => void;
}

// CRUD component props
export interface TestimonialManagerProps {
  form: UseFormReturn<WebsiteConfigurationInput>;
  accountId: bigint;
}

export interface OfficeManagerProps {
  form: UseFormReturn<WebsiteConfigurationInput>;
  accountId: bigint;
}
