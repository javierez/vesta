import type { FC } from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
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

  // Generate PDF sample using current configuration
  const downloadSample = async () => {
    setIsGeneratingPdf(true);
    try {
      console.log("🔽 Starting PDF sample generation...");

      const response = await fetch("/api/puppet/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateConfig: config,
          propertyData: propertyData,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? "PDF generation failed");
      }

      // Get the PDF blob
      const pdfBlob = await response.blob();

      // Create download link
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Automatically download the PDF
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `muestra-plantilla-${config.templateStyle}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(pdfUrl);

      toast.success("¡Muestra PDF generada exitosamente!");
      console.log("✅ PDF sample generated and downloaded");
    } catch (error) {
      console.error("❌ PDF sample generation error:", error);
      toast.error(
        `Error generando muestra: ${error instanceof Error ? error.message : "Error desconocido"}`,
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Personalización
        </h2>
        <p className="text-sm text-gray-600 sm:text-base">
          Personaliza las opciones de visualización para tus carteles
        </p>
      </div>

      {/* Two-column layout - Controls and Preview */}
      <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-2">
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
        <div className="rounded-2xl bg-white p-4 shadow-md sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold sm:text-xl">
              Vista Previa de Plantilla
            </h2>
          </div>
          <div className="flex justify-center overflow-hidden">
            <div
              ref={templateRef}
              className="relative max-w-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg"
              style={{
                width: config.orientation === "vertical" ? "300px" : "420px", // Responsive sizes for mobile/desktop
                height: config.orientation === "vertical" ? "424px" : "300px", // Maintain aspect ratio
                maxWidth: "100%",
              }}
            >
              <div
                style={{
                  transform:
                    config.orientation === "vertical"
                      ? "scale(0.378)" // 300/794 ≈ 0.378 for mobile-friendly size
                      : "scale(0.374)", // 420/1123 ≈ 0.374
                  transformOrigin: "top left",
                  width: config.orientation === "vertical" ? "794px" : "1123px",
                  height:
                    config.orientation === "vertical" ? "1123px" : "794px",
                }}
                className="origin-top-left"
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

          {/* Download Sample Button */}
          <div className="mt-4 flex justify-center">
            <Button
              onClick={downloadSample}
              disabled={isGeneratingPdf}
              className="w-full max-w-xs sm:max-w-sm"
              size="sm"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando muestra...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Muestra
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
