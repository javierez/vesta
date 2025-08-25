
import { useEffect } from "react";
import { Share2 } from "lucide-react";
import { SocialLinksInput } from "./components/social-links-input";
import type { SocialSectionProps } from "../types/website-sections";

export function SocialSection({ form, isActive, onUnsavedChanges }: SocialSectionProps) {
  // Watch for form changes to detect unsaved changes - PRESERVE existing logic
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith('socialLinks')) {
        onUnsavedChanges(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onUnsavedChanges]);

  // Only render when active section
  if (!isActive) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <Share2 className="h-5 w-5 text-gray-500" />
          Redes Sociales
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Enlaces a tus perfiles en redes sociales
        </p>
      </div>

      {/* INTEGRATE SocialLinksInput component for the complex logic */}
      <SocialLinksInput form={form} />
    </div>
  );
}