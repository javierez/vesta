import type { FC } from "react";
import { useState, useEffect, useRef } from "react";
import { DisplayOptions } from "./controls/display-options";
import { ModernTemplate } from "./templates/modern/modern-template";
import { ClassicTemplate } from "./templates/classic/classic-vertical-template";
import { getExtendedDefaultPropertyData } from "~/lib/carteleria/mock-data";
import type { TemplateConfiguration } from "~/types/template-data";
import type {
  PersonalizationProps,
  PosterPreferences,
} from "~/types/poster-preferences";

export const Personalization: FC<PersonalizationProps> = ({
  currentSelection,
  preferences: initialPreferences,
  onUpdate,
}) => {
  const [preferences, setPreferences] =
    useState<PosterPreferences>(initialPreferences);
  const templateRef = useRef<HTMLDivElement>(null);

  // Template property data for preview (like Playground)
  const propertyData = getExtendedDefaultPropertyData("piso");

  // Template configuration for preview (mapping from preferences)
  const [config, setConfig] = useState<TemplateConfiguration>({
    templateStyle: (currentSelection.styleId ??
      "modern") as TemplateConfiguration["templateStyle"],
    orientation:
      currentSelection.formatIds[0] === "horizontal"
        ? "horizontal"
        : "vertical",
    propertyType: "piso",
    imageCount: 3,
    showIcons: preferences.show_icons,
    showQR: preferences.show_qr_code,
    showWatermark: preferences.show_watermark,
    showPhone: preferences.show_phone,
    showEmail: preferences.show_email,
    showWebsite: preferences.show_website,
    showReference: preferences.show_reference,
    showShortDescription: preferences.show_description,
    titleFont: "default",
    priceFont: "default",
    overlayColor: "default",
    listingType: "venta",
    additionalFields: [],
  });

  // Update config when currentSelection changes
  useEffect(() => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      templateStyle: (currentSelection.styleId ??
        "modern") as TemplateConfiguration["templateStyle"],
      orientation:
        currentSelection.formatIds[0] === "horizontal"
          ? "horizontal"
          : "vertical",
    }));
  }, [currentSelection.styleId, currentSelection.formatIds]);

  // Update local preferences when parent changes them
  useEffect(() => {
    setPreferences(initialPreferences);
  }, [initialPreferences]);

  const handlePreferenceChange = (updates: Partial<PosterPreferences>) => {
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);

    // Update template config to reflect the new preferences
    setConfig((prevConfig) => ({
      ...prevConfig,
      showIcons: newPrefs.show_icons,
      showQR: newPrefs.show_qr_code,
      showWatermark: newPrefs.show_watermark,
      showPhone: newPrefs.show_phone,
      showEmail: newPrefs.show_email,
      showWebsite: newPrefs.show_website,
      showReference: newPrefs.show_reference,
      showShortDescription: newPrefs.show_description,
    }));

    // Notify parent component (no auto-save)
    onUpdate({ displayOptions: newPrefs });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Personalización</h2>
        <p className="text-gray-600">
          Personaliza las opciones de visualización para tus carteles
        </p>
      </div>

      {/* Two-column layout - Controls and Preview */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Controls Panel */}
        <div className="space-y-6">
          <DisplayOptions
            preferences={preferences}
            onChange={handlePreferenceChange}
          />

          {/* Simple Tip */}
          <div className="rounded-lg bg-blue-50 p-3 text-sm text-gray-700">
            💡 Los cambios se reflejan automáticamente en la vista previa.
          </div>
        </div>

        {/* Vista Previa de Plantilla */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Vista Previa de Plantilla</h2>
          </div>
          <div className="flex justify-center">
            <div
              ref={templateRef}
              className="relative overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg"
              style={{
                width: config.orientation === "vertical" ? "278px" : "393px", // 794*0.35 and 1123*0.35
                height: config.orientation === "vertical" ? "393px" : "278px", // 1123*0.35 and 794*0.35
              }}
            >
              <div
                style={{
                  transform: "scale(0.35)",
                  transformOrigin: "top left",
                  width: config.orientation === "vertical" ? "794px" : "1123px",
                  height:
                    config.orientation === "vertical" ? "1123px" : "794px",
                }}
              >
                {config.templateStyle === "classic" ? (
                  <ClassicTemplate
                    data={propertyData}
                    config={config}
                    className=""
                  />
                ) : (
                  <ModernTemplate
                    data={propertyData}
                    config={config}
                    className=""
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
