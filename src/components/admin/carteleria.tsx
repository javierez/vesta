"use client";

import type { FC } from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Settings,
  Palette,
  FileText,
  Building,
  LayoutTemplate,
  Eye,
} from "lucide-react";
import { useToast } from "~/components/hooks/use-toast";

// Import all the sub-components
import { StyleSelector } from "./carteleria/style-selector";
import { FormatSelector } from "./carteleria/format-selector";
import { PropertyTypeSelector } from "./carteleria/property-type-selector";
import { TemplateGallery } from "./carteleria/template-gallery";
import { TemplatePreview } from "./carteleria/template-preview";
import { TemplateCustomizer } from "./carteleria/template-customizer";

import type {
  CarteleriaState,
  CarteleriaSelection,
  CarteleriaTemplate,
} from "~/types/carteleria";
import {
  templateStyles,
  templateFormats,
  propertyTypes,
  getTemplatesByFilters,
} from "~/lib/carteleria/templates";

type Step = "style" | "format" | "property" | "template" | "customize";

interface StepConfig {
  id: Step;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isComplete: (state: CarteleriaState) => boolean;
  canProceed: (state: CarteleriaState) => boolean;
}

const steps: StepConfig[] = [
  {
    id: "style",
    title: "Estilo",
    description: "Elige tu estilo principal",
    icon: Palette,
    isComplete: (state) => state.selections.styleId !== null,
    canProceed: (state) => state.selections.styleId !== null,
  },
  {
    id: "format",
    title: "Formatos",
    description: "Selecciona los tamaños",
    icon: FileText,
    isComplete: (state) => state.selections.formatIds.length > 0,
    canProceed: (state) => state.selections.formatIds.length > 0,
  },
  {
    id: "property",
    title: "Tipos",
    description: "Tipos de propiedad",
    icon: Building,
    isComplete: (state) => state.selections.propertyTypeIds.length > 0,
    canProceed: (state) => state.selections.propertyTypeIds.length > 0,
  },
  {
    id: "template",
    title: "Plantillas",
    description: "Elige tus plantillas",
    icon: LayoutTemplate,
    isComplete: (state) => state.selections.templateIds.length > 0,
    canProceed: (state) => state.selections.templateIds.length > 0,
  },
  {
    id: "customize",
    title: "Personalizar",
    description: "Ajusta los detalles",
    icon: Settings,
    isComplete: () => true, // Always completable
    canProceed: () => true,
  },
];

const STORAGE_KEY = "carteleria_selection";

export const Carteleria: FC = () => {
  const { toast } = useToast();

  // Main state management
  const [state, setState] = useState<CarteleriaState>({
    currentStep: "style",
    selections: {
      styleId: null,
      formatIds: [],
      propertyTypeIds: [],
      templateIds: [],
      customizations: {},
    },
    previewTemplate: null,
  });

  // Modal states
  const [showPreview, setShowPreview] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customizerTemplate, setCustomizerTemplate] =
    useState<CarteleriaTemplate | null>(null);

  // Load saved state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedState = JSON.parse(saved) as CarteleriaSelection;
        setState((prev) => ({
          ...prev,
          selections: parsedState,
        }));
      }
    } catch (error) {
      console.error("Error loading saved state:", error);
    }
  }, []);

  // Save state to localStorage whenever selections change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.selections));
    } catch (error) {
      console.error("Error saving state:", error);
    }
  }, [state.selections]);

  // Helper functions
  const updateSelections = (updates: Partial<CarteleriaSelection>) => {
    setState((prev) => ({
      ...prev,
      selections: { ...prev.selections, ...updates },
    }));
  };

  const setCurrentStep = (step: Step) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const currentStepIndex = steps.findIndex(
    (step) => step.id === state.currentStep,
  );
  const currentStepConfig = steps[currentStepIndex];
  const canGoNext = currentStepConfig?.canProceed(state) ?? false;
  const canGoPrevious = currentStepIndex > 0;

  // Navigation handlers
  const goToStep = (stepId: Step) => {
    setCurrentStep(stepId);
  };

  const goNext = () => {
    if (canGoNext && currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1];
      if (nextStep) {
        setCurrentStep(nextStep.id);
      }
    }
  };

  const goPrevious = () => {
    if (canGoPrevious) {
      const prevStep = steps[currentStepIndex - 1];
      if (prevStep) {
        setCurrentStep(prevStep.id);
      }
    }
  };

  // Selection handlers
  const handleStyleSelect = (styleId: string) => {
    updateSelections({ styleId });
    // Auto-advance to next step
    setTimeout(() => goNext(), 500);
  };

  const handleFormatToggle = (formatId: string) => {
    const formatIds = state.selections.formatIds.includes(formatId)
      ? state.selections.formatIds.filter((id) => id !== formatId)
      : [...state.selections.formatIds, formatId];

    updateSelections({ formatIds });
  };

  const handlePropertyTypeToggle = (propertyTypeId: string) => {
    const propertyTypeIds = state.selections.propertyTypeIds.includes(
      propertyTypeId,
    )
      ? state.selections.propertyTypeIds.filter((id) => id !== propertyTypeId)
      : [...state.selections.propertyTypeIds, propertyTypeId];

    updateSelections({ propertyTypeIds });
  };

  const handleTemplateToggle = (templateId: string) => {
    const templateIds = state.selections.templateIds.includes(templateId)
      ? state.selections.templateIds.filter((id) => id !== templateId)
      : [...state.selections.templateIds, templateId];

    updateSelections({ templateIds });
  };

  const handleCustomizationChange = (
    templateId: string,
    key: string,
    value: unknown,
  ) => {
    const templateCustomizations =
      state.selections.customizations[templateId] ?? {};
    const updatedCustomizations = {
      ...state.selections.customizations,
      [templateId]: {
        ...templateCustomizations,
        [key]: value,
      },
    };

    updateSelections({ customizations: updatedCustomizations });
  };

  const handlePreviewTemplate = (template: CarteleriaTemplate) => {
    setState((prev) => ({ ...prev, previewTemplate: template }));
    setShowPreview(true);
  };

  const handleCustomizeTemplate = (template: CarteleriaTemplate) => {
    setCustomizerTemplate(template);
    setShowCustomizer(true);
  };

  // Get filtered templates based on current selections
  const availableTemplates = getTemplatesByFilters({
    styleId: state.selections.styleId,
    formatIds: state.selections.formatIds,
    propertyTypeIds: state.selections.propertyTypeIds,
  });

  // Calculate progress
  const completedSteps = steps.filter((step) => step.isComplete(state)).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="space-y-8">
      {/* Progress Header */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Configurar Cartelería
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Personaliza tus plantillas de carteles inmobiliarios
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            Paso {currentStepIndex + 1} de {steps.length}
          </Badge>
        </div>

        {/* Modern Progress Bar */}
        <div className="space-y-6">
          {/* Custom Progress Bar */}
          <div className="relative h-3 overflow-hidden rounded-full bg-gray-100 shadow-inner">
            <div
              className="h-full rounded-full shadow-sm transition-all duration-700 ease-out"
              style={{
                width: `${progressPercentage}%`,
                background:
                  "linear-gradient(90deg, #c2c2d6 0%, #a8a8c8 50%, #c2c2d6 100%)",
                boxShadow:
                  progressPercentage > 0
                    ? "0 1px 3px rgba(194, 194, 214, 0.4)"
                    : "none",
              }}
            />
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-center space-x-4 overflow-x-auto pb-2">
          {steps.map((step, _index) => {
            const Icon = step.icon;
            const isActive = step.id === state.currentStep;
            const isCompleted = step.isComplete(state);

            return (
              <Button
                key={step.id}
                variant={
                  isActive ? "default" : isCompleted ? "outline" : "ghost"
                }
                size="sm"
                onClick={() => goToStep(step.id)}
                className={`flex min-w-fit items-center gap-2 ${
                  isActive ? "ring-2 ring-primary/20" : ""
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{step.title}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {currentStepConfig && (
              <>
                <currentStepConfig.icon className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>{currentStepConfig.title}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {currentStepConfig.description}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="min-h-[500px]">
          {state.currentStep === "style" && (
            <StyleSelector
              selectedStyleId={state.selections.styleId}
              onStyleSelect={handleStyleSelect}
              styles={templateStyles}
            />
          )}

          {state.currentStep === "format" && (
            <FormatSelector
              selectedFormatIds={state.selections.formatIds}
              onFormatToggle={handleFormatToggle}
              formats={templateFormats}
            />
          )}

          {state.currentStep === "property" && (
            <PropertyTypeSelector
              selectedPropertyTypeIds={state.selections.propertyTypeIds}
              onPropertyTypeToggle={handlePropertyTypeToggle}
              propertyTypes={propertyTypes}
            />
          )}

          {state.currentStep === "template" && (
            <TemplateGallery
              templates={availableTemplates}
              selectedTemplateIds={state.selections.templateIds}
              onTemplateToggle={handleTemplateToggle}
              filters={{
                styleId: state.selections.styleId,
                formatIds: state.selections.formatIds,
                propertyTypeIds: state.selections.propertyTypeIds,
              }}
            />
          )}

          {state.currentStep === "customize" && (
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Personalización Final
                </h2>
                <p className="text-gray-600">
                  Revisa tus selecciones y personaliza cada plantilla
                </p>
              </div>

              {/* Selection Summary */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Palette className="h-4 w-4 text-primary" />
                      <span className="font-medium">Estilo</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {templateStyles.find(
                        (s) => s.id === state.selections.styleId,
                      )?.name ?? "No seleccionado"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-medium">Formatos</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {state.selections.formatIds.length} seleccionados
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <LayoutTemplate className="h-4 w-4 text-primary" />
                      <span className="font-medium">Plantillas</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {state.selections.templateIds.length} seleccionadas
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Selected Templates Actions */}
              {state.selections.templateIds.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Tus Plantillas Seleccionadas
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {availableTemplates
                      .filter((t) =>
                        state.selections.templateIds.includes(t.id),
                      )
                      .map((template) => (
                        <Card
                          key={template.id}
                          className="transition-shadow hover:shadow-md"
                        >
                          <CardContent className="p-4">
                            <h4 className="mb-2 font-medium">
                              {template.name}
                            </h4>
                            <p className="mb-4 text-sm text-gray-600">
                              {template.description}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePreviewTemplate(template)}
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                Ver
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleCustomizeTemplate(template)
                                }
                              >
                                <Settings className="mr-1 h-4 w-4" />
                                Personalizar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goPrevious}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-4">
          {state.currentStep === "customize" ? (
            <Button
              onClick={() => {
                toast({
                  title: "¡Configuración completada!",
                  description: "Tu cartelería ha sido configurada exitosamente",
                });
              }}
              disabled={state.selections.templateIds.length === 0}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Finalizar Configuración
            </Button>
          ) : (
            <Button onClick={goNext} disabled={!canGoNext}>
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Modals */}
      <TemplatePreview
        template={state.previewTemplate}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />

      <TemplateCustomizer
        template={customizerTemplate!}
        customizations={state.selections.customizations}
        onCustomizationChange={handleCustomizationChange}
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        onSave={() => setShowCustomizer(false)}
      />
    </div>
  );
};
