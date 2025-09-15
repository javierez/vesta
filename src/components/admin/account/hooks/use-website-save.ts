"use client";

import { useState, useTransition } from "react";
import type { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateWebsiteSectionAction } from "~/app/actions/website-settings";
import { type WebsiteConfigurationInput } from "~/types/website-settings";

// Hook return type for save operations
interface UseWebsiteSaveReturn {
  isPending: boolean;
  error: string | null;
  saveSection: (
    section: string,
    data?: Partial<WebsiteConfigurationInput>,
  ) => Promise<void>;
  saveAll: (activeSection: string) => Promise<void>;
}

// Custom hook for website save operations
export function useWebsiteSave(
  form: ReturnType<typeof useForm<WebsiteConfigurationInput>>,
  accountId: bigint | null,
  onSaveSuccess?: () => void,
): UseWebsiteSaveReturn {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Save specific section - PRESERVE existing section-specific data extraction
  const saveSection = async (
    section: string,
    customData?: Partial<WebsiteConfigurationInput>,
  ) => {
    if (!accountId) {
      setError("No se pudo identificar la cuenta");
      toast.error("No se pudo identificar la cuenta");
      return;
    }

    const formData = form.getValues();
    console.log("🎯 saveSection called for section:", section);
    console.log("🔑 accountId:", accountId);

    // Get only the data for the current section - PRESERVE existing switch logic
    const sectionData: Partial<WebsiteConfigurationInput> = {};

    switch (section) {
      case "seo":
        sectionData.seoProps = formData.seoProps;
        break;
      case "branding":
        sectionData.logo = formData.logo;
        sectionData.favicon = formData.favicon;
        sectionData.logotype = formData.logotype;
        break;
      case "hero":
        sectionData.heroProps = formData.heroProps;
        break;
      case "featured":
        sectionData.featuredProps = formData.featuredProps;
        break;
      case "about":
        sectionData.aboutProps = formData.aboutProps;
        break;
      case "properties":
        sectionData.propertiesProps = formData.propertiesProps;
        break;
      case "testimonials":
        sectionData.testimonialProps = formData.testimonialProps;
        break;
      case "contact":
        sectionData.contactProps = formData.contactProps;
        break;
      case "footer":
        sectionData.footerProps = formData.footerProps;
        break;
      case "head":
        sectionData.headProps = formData.headProps;
        break;
      case "social":
        sectionData.socialLinks = formData.socialLinks;
        break;
      case "watermark":
        sectionData.watermarkProps = formData.watermarkProps;
        break;
      case "meta":
        console.log(
          "💾 SAVE: Handling meta section with data:",
          formData.metadata,
        );
        sectionData.metadata = formData.metadata;
        break;
      default:
        console.error("❌ Unknown section:", section);
        setError("Sección desconocida");
        toast.error("Sección desconocida");
        return;
    }

    // Use custom data if provided (for specific section data)
    if (customData) {
      Object.assign(sectionData, customData);
    }

    console.log("📋 Section data to save:", sectionData);
    console.log("🚀 Starting section submission...");

    startTransition(async () => {
      try {
        setError(null);
        console.log("📡 Calling updateWebsiteSectionAction...");

        const result = await updateWebsiteSectionAction(
          accountId,
          section,
          sectionData,
        );
        console.log("📥 Server response:", result);

        if (result.success) {
          console.log("✅ Section saved successfully");
          toast.success(`Sección ${section} guardada correctamente`);
          onSaveSuccess?.();
        } else {
          console.error("❌ Server returned error:", result.error);
          setError(result.error ?? "Error al guardar la configuración");
          toast.error(result.error ?? "Error al guardar la configuración");
        }
      } catch (error) {
        console.error("💥 Unexpected error during save:", error);
        setError("Error inesperado al guardar la configuración");
        toast.error("Error inesperado al guardar la configuración");
      }
    });
  };

  // Save all data for the current active section
  const saveAll = async (activeSection: string) => {
    await saveSection(activeSection);
  };

  return {
    isPending,
    error,
    saveSection,
    saveAll,
  };
}
