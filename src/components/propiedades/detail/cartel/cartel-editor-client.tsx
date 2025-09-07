"use client";

import React, { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Switch } from "~/components/ui/switch";
import { Input } from "~/components/ui/input";
import { Slider } from "~/components/ui/slider";
import {
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Settings,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { ClassicTemplate } from "~/components/admin/carteleria/templates/classic/classic-vertical-template";
import { getExtendedDefaultPropertyData } from "~/lib/carteleria/mock-data";
import type {
  TemplateConfiguration,
  ExtendedTemplatePropertyData,
} from "~/types/template-data";
import { AdditionalFieldsSelector } from "~/components/admin/carteleria/controls/additional-fields-selector";
import { toast } from "sonner";
import { getTemplateImages } from "~/lib/carteleria/s3-images";
import { CartelMiniGallery } from "./cartel-mini-gallery";
import type { PropertyImage } from "~/lib/data";

// Database to UI value mapping
const mapDatabaseListingType = (dbType?: "Sale" | "Rent"): "venta" | "alquiler" | null => {
  if (!dbType) return null;
  return dbType === "Sale" ? "venta" : "alquiler";
};

// Map database property types to UI values
const mapDatabasePropertyType = (dbType?: string): "piso" | "casa" | "local" | "garaje" | "solar" | null => {
  if (!dbType) return null;
  
  const mappings: Record<string, "piso" | "casa" | "local" | "garaje" | "solar"> = {
    "Piso": "piso",
    "Casa": "casa",
    "Chalet": "casa",
    "Villa": "casa",
    "Local comercial": "local",
    "Local": "local",
    "Oficina": "local",
    "Garaje": "garaje",
    "Plaza de garaje": "garaje",
    "Solar": "solar",
    "Terreno": "solar"
  };
  
  return mappings[dbType] ?? "piso"; // Default to piso if not found
};

// Types for contact data from database
interface ContactOffice {
  id: string;
  name: string;
  phoneNumbers: {
    main: string;
    sales?: string;
  };
  emailAddresses: {
    info: string;
    sales?: string;
  };
}

interface ContactProps {
  offices: ContactOffice[];
}

interface CartelEditorClientProps {
  images?: PropertyImage[];
  databaseListingType?: "Sale" | "Rent"; // NEW: Optional database value
  databasePropertyType?: string; // NEW: Optional database property type
  accountColorPalette?: string[]; // NEW: Account color palette
  databaseCity?: string; // NEW: Optional database city
  databaseNeighborhood?: string; // NEW: Optional database neighborhood
  databaseBedrooms?: number; // NEW: Optional database bedrooms
  databaseBathrooms?: number; // NEW: Optional database bathrooms
  databaseSquareMeter?: number; // NEW: Optional database square meters
  databaseContactProps?: string; // NEW: Optional database contact props JSON
  databaseWebsite?: string; // NEW: Optional database website
}

export function CartelEditorClient({ images = [], databaseListingType, databasePropertyType, accountColorPalette = [], databaseCity, databaseNeighborhood, databaseBedrooms, databaseBathrooms, databaseSquareMeter, databaseContactProps, databaseWebsite }: CartelEditorClientProps) {
  // Template configuration state
  const [config, setConfig] = useState<TemplateConfiguration>(() => {
    const mappedListingType = mapDatabaseListingType(databaseListingType);
    const mappedPropertyType = mapDatabasePropertyType(databasePropertyType);
    return {
      templateStyle: "classic",
      orientation: "vertical",
      propertyType: mappedPropertyType ?? "piso", // Use DB value or fallback
      listingType: mappedListingType ?? "venta", // Use DB value or fallback
      imageCount: 4,
      showPhone: true,
      showEmail: true,
      showWebsite: true,
      showQR: true,
      showReference: true,
      showWatermark: true,
      showIcons: true,
      showShortDescription: false,
      titleFont: "default",
      priceFont: "default",
      titleAlignment: "left",
      titleSize: 50,
      titleColor: "white",
      titlePositionX: 0,
      titlePositionY: 0,
      locationFont: "default",
      locationAlignment: "left",
      locationSize: 24,
      locationColor: "white",
      locationPositionX: 0,
      locationPositionY: 0,
      locationBorderRadius: 8,
      priceAlignment: "center",
      priceSize: 50,
      priceColor: "white",
      pricePositionX: 0,
      pricePositionY: 0,
      contactPositionX: 0,
      contactPositionY: 0,
      contactBackgroundColor: "default",
      contactBorderRadius: 8,
      iconSize: 1.0,
      iconSpacingHorizontal: 32,
      iconSpacingVertical: 12,
      overlayColor: "default",
      additionalFields: ["hasElevator", "hasGarage", "energyConsumptionScale"],
    };
  });

  // Property data state (using mock data as base)
  const [propertyData, setPropertyData] =
    useState<ExtendedTemplatePropertyData>(() => {
      const baseData = getExtendedDefaultPropertyData(config.propertyType);
      // Generate default title from listing type and property type in UPPERCASE
      const listingTypeText = config.listingType === "venta" ? "VENTA" : "ALQUILER";
      const propertyTypeText = {
        piso: "PISO",
        casa: "CASA", 
        local: "LOCAL",
        garaje: "GARAJE",
        solar: "SOLAR"
      }[config.propertyType] || "PROPIEDAD";
      
      // Use selected images if available
      const selectedImages = images.slice(0, 4).map(img => img.imageUrl).filter(Boolean);
      
      return {
        ...baseData,
        title: `${listingTypeText} ${propertyTypeText}`,
        images: selectedImages.length > 0 ? selectedImages : baseData.images,
        location: {
          neighborhood: databaseNeighborhood || baseData.location.neighborhood,
          city: databaseCity || baseData.location.city
        },
        specs: {
          ...baseData.specs,
          bedrooms: databaseBedrooms || baseData.specs.bedrooms,
          bathrooms: databaseBathrooms || baseData.specs.bathrooms,
          squareMeters: databaseSquareMeter || baseData.specs.squareMeters
        }
      };
    });

  // Location field state - format: "neighborhood (city)"
  const [locationText, setLocationText] = useState(() => {
    const neighborhood = databaseNeighborhood || "Salamanca";
    const city = databaseCity || "Madrid";
    return `${neighborhood} (${city})`;
  });

  // Contact data state
  const [contactData, setContactData] = useState<ContactOffice[]>(() => {
    if (databaseContactProps) {
      try {
        // Handle double-escaped JSON from database
        let cleanedJson = databaseContactProps;
        if (cleanedJson.includes('""')) {
          // Replace double quotes with single quotes
          cleanedJson = cleanedJson.replace(/""/g, '"');
        }
        
        console.log("🔄 Parsing contact props:", cleanedJson);
        const parsed: ContactProps = JSON.parse(cleanedJson);
        console.log("✅ Parsed contact data:", parsed);
        return parsed.offices || [];
      } catch (error) {
        console.error("❌ Error parsing contact props:", error);
        console.error("Raw contact props:", databaseContactProps);
      }
    }
    return [];
  });

  // Selected contact options state
  const [selectedPhone, setSelectedPhone] = useState<string>("");
  const [selectedEmail, setSelectedEmail] = useState<string>("");

  // Initialize contact selections when contact data changes
  React.useEffect(() => {
    console.log("🔄 Contact data updated:", contactData);
    if (contactData.length > 0) {
      const firstOffice = contactData[0];
      console.log("🏢 First office:", firstOffice);
      if (!selectedPhone && firstOffice?.phoneNumbers?.main) {
        console.log("📞 Setting phone:", firstOffice.phoneNumbers.main);
        setSelectedPhone(firstOffice.phoneNumbers.main);
      }
      if (!selectedEmail && firstOffice?.emailAddresses?.info) {
        console.log("📧 Setting email:", firstOffice.emailAddresses.info);
        setSelectedEmail(firstOffice.emailAddresses.info);
      }
    }
  }, [contactData]);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [lastGeneratedPdf, setLastGeneratedPdf] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState(0.4); // Default zoom level
  
  // Selected images for cartel (using indices instead of URLs)
  // Auto-select first 3-4 images on load
  const [selectedImageIndices, setSelectedImageIndices] = useState<number[]>(() => {
    // Auto-select first 3-4 images (minimum 3, maximum 4)
    const minImages = 3;
    const maxImages = 4;
    const availableImages = images.length;
    
    if (availableImages >= minImages) {
      const imageCount = Math.min(availableImages, maxImages);
      return images.slice(0, imageCount).map((_, index) => index);
    }
    
    // If less than 3 images available, select all
    return images.map((_, index) => index);
  });
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 3;
  
  // Title customization toggle state
  const [showTitleCustomization, setShowTitleCustomization] = useState(false);
  
  // Location customization toggle state
  const [showLocationCustomization, setShowLocationCustomization] = useState(false);
  
  // Price customization toggle state
  const [showPriceCustomization, setShowPriceCustomization] = useState(false);
  
  // Contact customization toggle state
  const [showContactCustomization, setShowContactCustomization] = useState(false);
  
  // Icon grid customization toggle state
  const [showIconCustomization, setShowIconCustomization] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  // Get template images for positioning controls - use selected images or fallback to default S3 images
  const templateImages = selectedImageIndices.length > 0 
    ? selectedImageIndices.slice(0, config.imageCount).map(index => images[index]?.imageUrl).filter(Boolean) as string[]
    : getTemplateImages(config.imageCount);

  // Debug logging
  React.useEffect(() => {
    console.log("🖼️ Template Images Debug:", {
      totalImages: images.length,
      selectedIndices: selectedImageIndices,
      templateImages,
      imageCount: config.imageCount
    });
  }, [images, selectedImageIndices, templateImages, config.imageCount]);

  // Update selected images when images prop changes (after server-side load)
  React.useEffect(() => {
    if (images.length > 0 && selectedImageIndices.length === 0) {
      const minImages = 3;
      const maxImages = 4;
      const availableImages = images.length;
      
      if (availableImages >= minImages) {
        const imageCount = Math.min(availableImages, maxImages);
        setSelectedImageIndices(images.slice(0, imageCount).map((_, index) => index));
      } else {
        setSelectedImageIndices(images.map((_, index) => index));
      }
    }
  }, [images]);

  // Update imageCount based on selected images (3 or 4)
  React.useEffect(() => {
    const selectedCount = selectedImageIndices.length;
    if (selectedCount >= 3 && selectedCount <= 4) {
      updateConfig({ imageCount: selectedCount as 3 | 4 });
    }
  }, [selectedImageIndices]);

  // Parse location text and update property data
  const parseLocationText = (locationText: string) => {
    const match = locationText.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      const [, neighborhood, city] = match;
      return {
        neighborhood: neighborhood?.trim() || "",
        city: city?.trim() || ""
      };
    }
    // Fallback if format doesn't match
    return {
      neighborhood: locationText.trim(),
      city: "Madrid"
    };
  };

  // Update property data when location text changes
  React.useEffect(() => {
    const { neighborhood, city } = parseLocationText(locationText);
    updatePropertyData({
      location: { neighborhood, city }
    });
  }, [locationText]);

  // Update property data when contact selections change
  React.useEffect(() => {
    updatePropertyData({
      contact: {
        phone: selectedPhone,
        email: selectedEmail,
        website: databaseWebsite || undefined,
      }
    });
  }, [selectedPhone, selectedEmail, databaseWebsite]);

  // Handle configuration updates
  const updateConfig = (updates: Partial<TemplateConfiguration>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  // Handle property data updates
  const updatePropertyData = (
    updates: Partial<ExtendedTemplatePropertyData>,
  ) => {
    setPropertyData((prev) => ({
      ...prev,
      ...updates,
      location: {
        ...prev.location,
        ...(updates.location ?? {}),
      },
      specs: {
        ...prev.specs,
        ...(updates.specs ?? {}),
      },
      contact: {
        ...prev.contact,
        ...(updates.contact ?? {}),
      },
    }));
  };

  // Handle image positioning updates
  const updateImagePosition = (imageUrl: string, x: number, y: number) => {
    setPropertyData((prev) => ({
      ...prev,
      imagePositions: {
        ...prev.imagePositions,
        [imageUrl]: { x, y },
      },
    }));
  };

  // Zoom control functions
  const zoomIn = () => setPreviewZoom((prev) => Math.min(prev + 0.1, 1.0));
  const zoomOut = () => setPreviewZoom((prev) => Math.max(prev - 0.1, 0.2));
  const resetZoom = () =>
    setPreviewZoom(config.orientation === "vertical" ? 0.4 : 0.35);

  // Generate PDF using Puppeteer
  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      console.log("🚀 Starting PDF generation...");

      const response = await fetch("/api/puppet/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateConfig: config,
          propertyData: {
            ...propertyData,
            images: templateImages
          },
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
      setLastGeneratedPdf(pdfUrl);

      // Automatically download the PDF
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `property-template-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("PDF generado exitosamente!");
      console.log("✅ PDF generated and downloaded");
    } catch (error) {
      console.error("❌ PDF generation error:", error);
      toast.error(
        `Error al generar PDF: ${error instanceof Error ? error.message : "Error desconocido"}`,
      );
    } finally {
      setIsGenerating(false);
    }
  };


  // Preview the template in a new window
  const previewTemplate = () => {
    const templateUrl = new URL("/api/puppet/template", window.location.origin);
    templateUrl.searchParams.set("config", JSON.stringify(config));
    templateUrl.searchParams.set("data", JSON.stringify({
      ...propertyData,
      images: templateImages
    }));

    window.open(
      templateUrl.toString(),
      "_blank",
      "width=820,height=1160,scrollbars=yes,resizable=yes",
    );
  };

  // Wizard step titles
  const stepTitles = [
    "Configuración",
    "Datos de la Propiedad",
    "Imágenes"
  ];

  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="w-full">
      {/* Image Selection Section */}
      {images.length > 0 && (
        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <CartelMiniGallery
                images={images}
                title="Selecciona 3 o 4 imágenes para el cartel"
                maxSelection={4}
                selectedIndices={selectedImageIndices}
                onSelectionChange={setSelectedImageIndices}
              />
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Configuration Panel */}
        <div className="space-y-6 xl:col-span-1">
          {/* Step 1: Configuration */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <span className="mr-1">1.</span>
                  Configuración
                </CardTitle>
              <CardDescription>
                Configura el diseño de la plantilla
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Settings */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="orientation">Orientación</Label>
                  <Select
                    value={config.orientation}
                    onValueChange={(value: "vertical" | "horizontal") =>
                      updateConfig({ orientation: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vertical">
                        Vertical
                      </SelectItem>
                      <SelectItem value="horizontal">
                        Horizontal
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>


                <div>
                  <Label htmlFor="overlayColor">Color de Fondo</Label>
                  <Select
                    value={config.overlayColor}
                    onValueChange={(value) => updateConfig({ overlayColor: value as "default" | "dark" | "light" | "blue" | "green" | "purple" | "red" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Default color options */}
                      <SelectItem value="default">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: "#9CA3AF" }}
                          />
                          <span>Gris</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: "#E5E7EB" }}
                          />
                          <span>Claro</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: "#1F2937" }}
                          />
                          <span>Oscuro</span>
                        </div>
                      </SelectItem>
                      
                      {/* Account color palette */}
                      {accountColorPalette.length > 0 && accountColorPalette.map((color, index) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: color }}
                            />
                            <span>Color {index + 1}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Display Options - Grouped */}
              <div className="space-y-4">
                <h4 className="font-medium">Opciones de Visualización</h4>
                
                {/* Contact Information Group */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground">Contacto</h5>
                  <div className="space-y-2">
                    {[
                      { key: "showPhone" as const, label: "Teléfono" },
                      { key: "showEmail" as const, label: "Email" },
                      { key: "showWebsite" as const, label: "Website" },
                    ].map(({ key, label }) => (
                      <div
                        key={key}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={key}
                          checked={config[key] ?? false}
                          onCheckedChange={(checked) =>
                            updateConfig({ [key]: checked })
                          }
                          className="no-checkmark h-3 w-3"
                        />
                        <Label htmlFor={key} className="text-xs">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Elements Group */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground">Elementos Visuales</h5>
                  <div className="space-y-2">
                    {[
                      { key: "showQR" as const, label: "Código QR" },
                      { key: "showWatermark" as const, label: "Marca de Agua" },
                      { key: "showIcons" as const, label: "Iconos" },
                    ].map(({ key, label }) => (
                      <div
                        key={key}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={key}
                          checked={config[key] ?? false}
                          onCheckedChange={(checked) =>
                            updateConfig({ [key]: checked })
                          }
                          className="no-checkmark h-3 w-3"
                        />
                        <Label htmlFor={key} className="text-xs">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Group */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground">Contenido</h5>
                  <div className="space-y-2">
                    {[
                      { key: "showReference" as const, label: "Referencia" },
                      {
                        key: "showShortDescription" as const,
                        label: "Descripción Corta",
                      },
                    ].map(({ key, label }) => (
                      <div
                        key={key}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={key}
                          checked={config[key] ?? false}
                          onCheckedChange={(checked) =>
                            updateConfig({ [key]: checked })
                          }
                          className="no-checkmark h-3 w-3"
                        />
                        <Label htmlFor={key} className="text-xs">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Fields Selector */}
              <div>
                <AdditionalFieldsSelector
                  config={config}
                  onChange={updateConfig}
                />
              </div>

              {/* Icon Grid Customization */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Personalización de Iconos</h3>
                  <button
                    type="button"
                    onClick={() => setShowIconCustomization(!showIconCustomization)}
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-150 group"
                    title="Personalizar iconos"
                  >
                    <div className={`
                      transition-transform duration-200 text-gray-400 group-hover:text-gray-600
                      ${showIconCustomization ? 'rotate-180' : 'rotate-0'}
                    `}>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>
                </div>

                {/* Icon Customization Controls */}
                {showIconCustomization && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg mt-3">
                    <div className="space-y-4">
                      {/* Icon Size */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium">Tamaño de Iconos</Label>
                          <span className="text-sm font-mono text-gray-600 bg-white px-2 py-1 rounded">
                            {config.iconSize.toFixed(1)}x
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-gray-500">
                            <div className="w-3 h-3 border border-gray-400 rounded-sm"></div>
                            <span className="text-xs">Pequeño</span>
                          </div>
                          <Slider
                            value={[config.iconSize]}
                            onValueChange={([value]) => updateConfig({ iconSize: value })}
                            max={2.0}
                            min={0.5}
                            step={0.1}
                            className="flex-1"
                          />
                          <div className="flex items-center gap-1 text-gray-500">
                            <div className="w-5 h-5 border-2 border-gray-400 rounded-sm"></div>
                            <span className="text-xs">Grande</span>
                          </div>
                        </div>
                      </div>

                      {/* Spacing Controls */}
                      <div className="space-y-3">
                        <Label className="font-medium">Separación entre Iconos</Label>
                        
                        {/* Horizontal Spacing */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">↔️ Horizontal</span>
                            <span className="text-xs font-mono text-gray-600 bg-white px-2 py-1 rounded">
                              {config.iconSpacingHorizontal}px
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-gray-500">
                              <div className="flex gap-0.5">
                                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                              </div>
                              <span className="text-xs">Junto</span>
                            </div>
                            <Slider
                              value={[config.iconSpacingHorizontal]}
                              onValueChange={([value]) => updateConfig({ iconSpacingHorizontal: value })}
                              max={80}
                              min={8}
                              step={2}
                              className="flex-1"
                            />
                            <div className="flex items-center gap-1 text-gray-500">
                              <div className="flex gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                              </div>
                              <span className="text-xs">Separado</span>
                            </div>
                          </div>
                        </div>

                        {/* Vertical Spacing */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">↕️ Vertical</span>
                            <span className="text-xs font-mono text-gray-600 bg-white px-2 py-1 rounded">
                              {config.iconSpacingVertical}px
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-gray-500">
                              <div className="flex flex-col gap-0.5">
                                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                              </div>
                              <span className="text-xs">Compacto</span>
                            </div>
                            <Slider
                              value={[config.iconSpacingVertical]}
                              onValueChange={([value]) => updateConfig({ iconSpacingVertical: value })}
                              max={40}
                              min={4}
                              step={2}
                              className="flex-1"
                            />
                            <div className="flex items-center gap-1 text-gray-500">
                              <div className="flex flex-col gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                              </div>
                              <span className="text-xs">Espaciado</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Navigation */}
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={goToNextStep}
                  disabled={selectedImageIndices.length < 3}
                  title={selectedImageIndices.length < 3 ? "Selecciona al menos 3 imágenes" : ""}
                >
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Step 2: Property Data */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="mr-1">2.</span>
                  Datos de la Propiedad
                </CardTitle>
              <CardDescription>Edita la información de la propiedad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={propertyData.title}
                      onChange={(e) =>
                        updatePropertyData({ title: e.target.value })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTitleCustomization(!showTitleCustomization)}
                    className="mt-6 p-2 rounded-md hover:bg-gray-100 transition-colors duration-150 group"
                    title="Personalizar título"
                  >
                    <div className={`
                      transition-transform duration-200 text-gray-400 group-hover:text-gray-600
                      ${showTitleCustomization ? 'rotate-180' : 'rotate-0'}
                    `}>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>
                </div>

                {showTitleCustomization && (
                  <div className="space-y-4 p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {/* Font Style */}
                        <div>
                          <Label htmlFor="titleFont">Fuente</Label>
                          <Select
                            value={config.titleFont}
                            onValueChange={(value: "default" | "serif" | "sans" | "mono" | "elegant" | "modern") =>
                              updateConfig({ titleFont: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Por defecto</SelectItem>
                              <SelectItem value="serif" style={{ fontFamily: 'serif' }}>Serif</SelectItem>
                              <SelectItem value="sans" style={{ fontFamily: 'sans-serif' }}>Sans</SelectItem>
                              <SelectItem value="mono" style={{ fontFamily: 'monospace' }}>Mono</SelectItem>
                              <SelectItem value="elegant" style={{ fontFamily: 'Times, serif' }}>Elegant</SelectItem>
                              <SelectItem value="modern" style={{ fontFamily: 'Arial, sans-serif' }}>Modern</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Text Color */}
                        <div>
                          <Label htmlFor="titleColor">Color del texto</Label>
                          <div className="flex justify-end">
                            <Select
                              value={config.titleColor}
                              onValueChange={(value) => updateConfig({ titleColor: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {/* Default Colors */}
                                <SelectItem value="white">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div>
                                    Blanco
                                  </div>
                                </SelectItem>
                                <SelectItem value="black">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-black"></div>
                                    Negro
                                  </div>
                                </SelectItem>
                                <SelectItem value="gray">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                    Gris
                                  </div>
                                </SelectItem>
                                {/* Corporate Colors */}
                                {accountColorPalette.length > 0 && (
                                  <>
                                    {accountColorPalette.map((color, index) => (
                                      <SelectItem key={color} value={color}>
                                        <div className="flex items-center gap-2">
                                          <div 
                                            className="w-3 h-3 rounded-full border border-gray-300" 
                                            style={{ backgroundColor: color }}
                                          ></div>
                                          Corporativo {index + 1}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Text Alignment */}
                        <div>
                          <Label>Alineación</Label>
                          <div className="flex gap-1 mt-1">
                            <Button
                              variant={config.titleAlignment === "left" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateConfig({ titleAlignment: "left" })}
                              className="p-2"
                            >
                              <AlignLeft className="h-3 w-3" />
                            </Button>
                            <Button
                              variant={config.titleAlignment === "center" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateConfig({ titleAlignment: "center" })}
                              className="p-2"
                            >
                              <AlignCenter className="h-3 w-3" />
                            </Button>
                            <Button
                              variant={config.titleAlignment === "right" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateConfig({ titleAlignment: "right" })}
                              className="p-2"
                            >
                              <AlignRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Text Size */}
                        <div>
                          <Label>Tamaño</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs">A</span>
                            <Slider
                              value={[config.titleSize]}
                              onValueChange={([value]) => updateConfig({ titleSize: value })}
                              max={60}
                              min={16}
                              step={2}
                              className="flex-1"
                            />
                            <span className="text-lg font-bold">A</span>
                          </div>
                        </div>
                      </div>

                      {/* Position Controls */}
                      <div>
                        <Label className="text-sm text-gray-600">Posición</Label>
                        <div className="flex items-center justify-center mt-2">
                          <div className="flex flex-col items-center">
                            {/* Up Arrow */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 mb-0.5"
                              onClick={() => updateConfig({ titlePositionY: Math.max((config.titlePositionY || 0) - 5, -30) })}
                              disabled={(config.titlePositionY || 0) <= -30}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            
                            <div className="flex items-center gap-0.5">
                              {/* Left Arrow */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => updateConfig({ titlePositionX: Math.max((config.titlePositionX || 0) - 5, -50) })}
                                disabled={(config.titlePositionX || 0) <= -50}
                              >
                                <ChevronLeft className="h-3 w-3" />
                              </Button>
                              
                              {/* Center/Reset Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0 rounded-full"
                                onClick={() => updateConfig({ titlePositionX: 0, titlePositionY: 0 })}
                              >
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              </Button>
                              
                              {/* Right Arrow */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => updateConfig({ titlePositionX: Math.min((config.titlePositionX || 0) + 5, 50) })}
                                disabled={(config.titlePositionX || 0) >= 50}
                              >
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            {/* Down Arrow */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 mt-0.5"
                              onClick={() => updateConfig({ titlePositionY: Math.min((config.titlePositionY || 0) + 5, 30) })}
                              disabled={(config.titlePositionY || 0) >= 30}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Location Section */}
              <div>
                <div className="flex items-end gap-1">
                  <div className="flex-1">
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={locationText}
                      onChange={(e) => setLocationText(e.target.value)}
                      placeholder="Barrio (Ciudad)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLocationCustomization(!showLocationCustomization)}
                    className="mt-6 p-2 rounded-md hover:bg-gray-100 transition-colors duration-150 group"
                    title="Personalizar ubicación"
                  >
                    <div className={`
                      transition-transform duration-200 text-gray-400 group-hover:text-gray-600
                      ${showLocationCustomization ? 'rotate-180' : 'rotate-0'}
                    `}>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>
                </div>

                {showLocationCustomization && (
                  <div className="space-y-4 p-3 bg-gray-50 rounded-lg mt-3">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {/* Font Style */}
                        <div>
                          <Label htmlFor="locationFont">Fuente</Label>
                          <Select
                            value={config.locationFont}
                            onValueChange={(value: "default" | "serif" | "sans" | "mono" | "elegant" | "modern") =>
                              updateConfig({ locationFont: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Por defecto</SelectItem>
                              <SelectItem value="serif" style={{ fontFamily: 'serif' }}>Serif</SelectItem>
                              <SelectItem value="sans" style={{ fontFamily: 'sans-serif' }}>Sans</SelectItem>
                              <SelectItem value="mono" style={{ fontFamily: 'monospace' }}>Mono</SelectItem>
                              <SelectItem value="elegant" style={{ fontFamily: 'Times, serif' }}>Elegant</SelectItem>
                              <SelectItem value="modern" style={{ fontFamily: 'Arial, sans-serif' }}>Modern</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Text Color */}
                        <div>
                          <Label htmlFor="locationColor">Color del texto</Label>
                          <div className="flex justify-end">
                            <Select
                              value={config.locationColor}
                              onValueChange={(value) => updateConfig({ locationColor: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {/* Default Colors */}
                                <SelectItem value="white">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div>
                                    Blanco
                                  </div>
                                </SelectItem>
                                <SelectItem value="black">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-black"></div>
                                    Negro
                                  </div>
                                </SelectItem>
                                <SelectItem value="gray">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                    Gris
                                  </div>
                                </SelectItem>
                                {/* Corporate Colors */}
                                {accountColorPalette.length > 0 && (
                                  <>
                                    {accountColorPalette.map((color, index) => (
                                      <SelectItem key={color} value={color}>
                                        <div className="flex items-center gap-2">
                                          <div 
                                            className="w-3 h-3 rounded-full border border-gray-300" 
                                            style={{ backgroundColor: color }}
                                          ></div>
                                          Corporativo {index + 1}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Text Alignment */}
                        <div>
                          <Label>Alineación</Label>
                          <div className="flex gap-1 mt-1">
                            <Button
                              variant={config.locationAlignment === "left" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateConfig({ locationAlignment: "left" })}
                              className="p-2"
                            >
                              <AlignLeft className="h-3 w-3" />
                            </Button>
                            <Button
                              variant={config.locationAlignment === "center" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateConfig({ locationAlignment: "center" })}
                              className="p-2"
                            >
                              <AlignCenter className="h-3 w-3" />
                            </Button>
                            <Button
                              variant={config.locationAlignment === "right" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateConfig({ locationAlignment: "right" })}
                              className="p-2"
                            >
                              <AlignRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Text Size */}
                        <div>
                          <Label>Tamaño</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs">A</span>
                            <Slider
                              value={[config.locationSize]}
                              onValueChange={([value]) => updateConfig({ locationSize: value })}
                              max={32}
                              min={16}
                              step={2}
                              className="flex-1"
                            />
                            <span className="text-lg font-bold">A</span>
                          </div>
                        </div>
                      </div>

                      {/* Position Controls */}
                      <div>
                        <Label className="text-sm text-gray-600">Posición</Label>
                        <div className="flex items-center justify-center mt-2">
                          <div className="flex flex-col items-center">
                            {/* Up Arrow */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 mb-0.5"
                              onClick={() => updateConfig({ locationPositionY: Math.max((config.locationPositionY || 0) - 5, -30) })}
                              disabled={(config.locationPositionY || 0) <= -30}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            
                            <div className="flex items-center gap-0.5">
                              {/* Left Arrow */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => updateConfig({ locationPositionX: Math.max((config.locationPositionX || 0) - 5, -50) })}
                                disabled={(config.locationPositionX || 0) <= -50}
                              >
                                <ChevronLeft className="h-3 w-3" />
                              </Button>
                              
                              {/* Center/Reset Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0 rounded-full"
                                onClick={() => updateConfig({ locationPositionX: 0, locationPositionY: 0 })}
                              >
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              </Button>
                              
                              {/* Right Arrow */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => updateConfig({ locationPositionX: Math.min((config.locationPositionX || 0) + 5, 50) })}
                                disabled={(config.locationPositionX || 0) >= 50}
                              >
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            {/* Down Arrow */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 mt-0.5"
                              onClick={() => updateConfig({ locationPositionY: Math.min((config.locationPositionY || 0) + 5, 30) })}
                              disabled={(config.locationPositionY || 0) >= 30}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Border Radius Control */}
                      <div>
                        <Label className="text-sm text-gray-600">Esquinas redondeadas</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs">◼</span>
                          <Slider
                            value={[config.locationBorderRadius]}
                            onValueChange={([value]) => updateConfig({ locationBorderRadius: value })}
                            max={20}
                            min={0}
                            step={2}
                            className="flex-1"
                          />
                          <span className="text-xs">◯</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Section */}
              <div>
                <div className="flex items-end gap-1">
                  <div className="flex-1">
                    <Label htmlFor="price">Precio (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={propertyData.price}
                      onChange={(e) =>
                        updatePropertyData({ price: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPriceCustomization(!showPriceCustomization)}
                    className="mt-6 p-2 rounded-md hover:bg-gray-100 transition-colors duration-150 group"
                    title="Personalizar precio"
                  >
                    <div className={`
                      transition-transform duration-200 text-gray-400 group-hover:text-gray-600
                      ${showPriceCustomization ? 'rotate-180' : 'rotate-0'}
                    `}>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>
                </div>

                {showPriceCustomization && (
                  <div className="space-y-4 p-3 bg-gray-50 rounded-lg mt-3">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {/* Font Style */}
                        <div>
                          <Label htmlFor="priceFont">Fuente</Label>
                          <Select
                            value={config.priceFont}
                            onValueChange={(value: "default" | "serif" | "sans" | "mono" | "elegant" | "modern") =>
                              updateConfig({ priceFont: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Por defecto</SelectItem>
                              <SelectItem value="serif" style={{ fontFamily: 'serif' }}>Serif</SelectItem>
                              <SelectItem value="sans" style={{ fontFamily: 'sans-serif' }}>Sans</SelectItem>
                              <SelectItem value="mono" style={{ fontFamily: 'monospace' }}>Mono</SelectItem>
                              <SelectItem value="elegant" style={{ fontFamily: 'Times, serif' }}>Elegant</SelectItem>
                              <SelectItem value="modern" style={{ fontFamily: 'Arial, sans-serif' }}>Modern</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Text Color */}
                        <div>
                          <Label htmlFor="priceColor">Color del texto</Label>
                          <div className="flex justify-end">
                            <Select
                              value={config.priceColor}
                              onValueChange={(value) => updateConfig({ priceColor: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {/* Default Colors */}
                                <SelectItem value="white">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div>
                                    Blanco
                                  </div>
                                </SelectItem>
                                <SelectItem value="black">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-black"></div>
                                    Negro
                                  </div>
                                </SelectItem>
                                <SelectItem value="gray">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                    Gris
                                  </div>
                                </SelectItem>
                                {/* Corporate Colors */}
                                {accountColorPalette.length > 0 && (
                                  <>
                                    {accountColorPalette.map((color, index) => (
                                      <SelectItem key={color} value={color}>
                                        <div className="flex items-center gap-2">
                                          <div 
                                            className="w-3 h-3 rounded-full border border-gray-300" 
                                            style={{ backgroundColor: color }}
                                          ></div>
                                          Corporativo {index + 1}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Text Alignment */}
                        <div>
                          <Label>Alineación</Label>
                          <div className="flex gap-1 mt-1">
                            <Button
                              variant={config.priceAlignment === "left" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateConfig({ priceAlignment: "left" })}
                              className="p-2"
                            >
                              <AlignLeft className="h-3 w-3" />
                            </Button>
                            <Button
                              variant={config.priceAlignment === "center" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateConfig({ priceAlignment: "center" })}
                              className="p-2"
                            >
                              <AlignCenter className="h-3 w-3" />
                            </Button>
                            <Button
                              variant={config.priceAlignment === "right" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateConfig({ priceAlignment: "right" })}
                              className="p-2"
                            >
                              <AlignRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Text Size */}
                        <div>
                          <Label>Tamaño</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs">A</span>
                            <Slider
                              value={[config.priceSize]}
                              onValueChange={([value]) => updateConfig({ priceSize: value })}
                              max={80}
                              min={24}
                              step={4}
                              className="flex-1"
                            />
                            <span className="text-lg font-bold">A</span>
                          </div>
                        </div>
                      </div>

                      {/* Position Controls */}
                      <div>
                        <Label className="text-sm text-gray-600">Posición</Label>
                        <div className="flex items-center justify-center mt-2">
                          <div className="flex flex-col items-center">
                            {/* Up Arrow */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 mb-0.5"
                              onClick={() => updateConfig({ pricePositionY: Math.max((config.pricePositionY || 0) - 5, -30) })}
                              disabled={(config.pricePositionY || 0) <= -30}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            
                            <div className="flex items-center gap-0.5">
                              {/* Left Arrow */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => updateConfig({ pricePositionX: Math.max((config.pricePositionX || 0) - 5, -50) })}
                                disabled={(config.pricePositionX || 0) <= -50}
                              >
                                <ChevronLeft className="h-3 w-3" />
                              </Button>
                              
                              {/* Center/Reset Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0 rounded-full"
                                onClick={() => updateConfig({ pricePositionX: 0, pricePositionY: 0 })}
                              >
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              </Button>
                              
                              {/* Right Arrow */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => updateConfig({ pricePositionX: Math.min((config.pricePositionX || 0) + 5, 50) })}
                                disabled={(config.pricePositionX || 0) >= 50}
                              >
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            {/* Down Arrow */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 mt-0.5"
                              onClick={() => updateConfig({ pricePositionY: Math.min((config.pricePositionY || 0) + 5, 30) })}
                              disabled={(config.pricePositionY || 0) >= 30}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>



              {/* Contact Information from Database */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Información de Contacto</h3>
                  <button
                    type="button"
                    onClick={() => setShowContactCustomization(!showContactCustomization)}
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-150 group"
                    title="Personalizar información de contacto"
                  >
                    <div className={`
                      transition-transform duration-200 text-gray-400 group-hover:text-gray-600
                      ${showContactCustomization ? 'rotate-180' : 'rotate-0'}
                    `}>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>
                </div>
                
                {contactData.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {/* Phone Selector */}
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Select value={selectedPhone} onValueChange={setSelectedPhone}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar teléfono" />
                        </SelectTrigger>
                        <SelectContent>
                          {contactData.map((office) => (
                            <React.Fragment key={office.id}>
                              {office.phoneNumbers?.main && (
                                <SelectItem value={office.phoneNumbers.main}>
                                  {office.phoneNumbers.main}
                                </SelectItem>
                              )}
                              {office.phoneNumbers?.sales && (
                                <SelectItem value={office.phoneNumbers.sales}>
                                  {office.phoneNumbers.sales}
                                </SelectItem>
                              )}
                            </React.Fragment>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Email Selector */}
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Select value={selectedEmail} onValueChange={setSelectedEmail}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar email" />
                        </SelectTrigger>
                        <SelectContent>
                          {contactData.map((office) => (
                            <React.Fragment key={office.id}>
                              {office.emailAddresses?.info && (
                                <SelectItem value={office.emailAddresses.info}>
                                  {office.name}
                                </SelectItem>
                              )}
                              {office.emailAddresses?.sales && (
                                <SelectItem value={office.emailAddresses.sales}>
                                  {office.name}
                                </SelectItem>
                              )}
                            </React.Fragment>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Website Display */}
                    {databaseWebsite && (
                      <div>
                        <Label>Website</Label>
                        <Input
                          value={databaseWebsite}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                    <p>No se encontró información de contacto en la configuración del sitio web.</p>
                    <p className="text-xs mt-1">Configura los datos de contacto en la sección de configuración del sitio web.</p>
                  </div>
                )}

                {/* Contact Customization Controls */}
                {showContactCustomization && (
                  <div className="space-y-4 p-3 bg-gray-50 rounded-lg mt-3">
                    <div className="space-y-3">
                      {/* Background Color */}
                      <div>
                        <Label>Color de Fondo</Label>
                        <Select
                          value={config.contactBackgroundColor}
                          onValueChange={(value) => updateConfig({ contactBackgroundColor: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Default Colors */}
                            <SelectItem value="default">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                                <span>Gris Oscuro</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="white">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full border border-gray-300"
                                  style={{ backgroundColor: "white" }}
                                />
                                <span>Blanco</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="black">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full border border-gray-300"
                                  style={{ backgroundColor: "black" }}
                                />
                                <span>Negro</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="gray">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full border border-gray-300"
                                  style={{ backgroundColor: "#6B7280" }}
                                />
                                <span>Gris</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="light">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full border border-gray-300"
                                  style={{ backgroundColor: "#E5E7EB" }}
                                />
                                <span>Claro</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="dark">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full border border-gray-300"
                                  style={{ backgroundColor: "#1F2937" }}
                                />
                                <span>Oscuro</span>
                              </div>
                            </SelectItem>
                            
                            {/* Account color palette */}
                            {accountColorPalette.length > 0 && accountColorPalette.map((color, index) => (
                              <SelectItem key={color} value={color}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: color }}
                                  />
                                  <span>Color {index + 1}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Border Radius */}
                      <div>
                        <Label>Esquinas Redondeadas</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs">0</span>
                          <Slider
                            value={[config.contactBorderRadius]}
                            onValueChange={([value]) => updateConfig({ contactBorderRadius: value })}
                            max={20}
                            min={0}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-xs">20</span>
                        </div>
                      </div>

                      {/* Position Controls */}
                      <div>
                        <Label>Posición</Label>
                        <div className="flex justify-center mt-2">
                          <div className="flex flex-col items-center">
                            {/* Up Arrow */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 mb-0.5"
                              onClick={() => updateConfig({ contactPositionY: Math.max((config.contactPositionY || 0) - 5, -30) })}
                              disabled={(config.contactPositionY || 0) <= -30}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            
                            <div className="flex items-center gap-0.5">
                              {/* Left Arrow */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => updateConfig({ contactPositionX: Math.max((config.contactPositionX || 0) - 5, -50) })}
                                disabled={(config.contactPositionX || 0) <= -50}
                              >
                                <ChevronLeft className="h-3 w-3" />
                              </Button>
                              
                              {/* Center/Reset Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0 rounded-full"
                                onClick={() => updateConfig({ contactPositionX: 0, contactPositionY: 0 })}
                              >
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              </Button>
                              
                              {/* Right Arrow */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => updateConfig({ contactPositionX: Math.min((config.contactPositionX || 0) + 5, 50) })}
                                disabled={(config.contactPositionX || 0) >= 50}
                              >
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            {/* Down Arrow */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 mt-0.5"
                              onClick={() => updateConfig({ contactPositionY: Math.min((config.contactPositionY || 0) + 5, 30) })}
                              disabled={(config.contactPositionY || 0) >= 30}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={goToPreviousStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <Button onClick={goToNextStep}>
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Step 3: Image Positioning Controls */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  <span className="mr-1">3.</span>
                  Imágenes
                </CardTitle>
              <CardDescription>
                Arrastra y posiciona las imágenes dentro de sus contenedores para
                mejor encuadre
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {templateImages.map((imageUrl, index) => {
                const position = propertyData.imagePositions?.[imageUrl] ?? {
                  x: 50,
                  y: 50,
                };
                return (
                  <div key={`image-${index}`} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Imagen {index + 1}
                      </span>
                      {index === 0 && (
                        <span className="text-xs text-muted-foreground">
                          (Principal)
                        </span>
                      )}
                    </div>

                    {/* Image preview with positioning */}
                    <div className="relative h-20 w-full overflow-hidden rounded-md border bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt={`Preview ${index + 1}`}
                        className="absolute h-full w-full object-cover"
                        style={{
                          objectPosition: `${position.x}% ${position.y}%`,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                        <span className="text-xs font-medium text-white">
                          {position.x.toFixed(0)}%, {position.y.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Position Controls - Joystick Style */}
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Posición</Label>
                      <div className="text-xs text-muted-foreground">
                        {position.x.toFixed(0)}%, {position.y.toFixed(0)}%
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <div className="flex flex-col items-center">
                        {/* Up Arrow */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0 mb-0.5"
                          onClick={() => updateImagePosition(imageUrl, position.x, Math.max(position.y - 5, 0))}
                          disabled={position.y <= 0}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        
                        <div className="flex items-center gap-0.5">
                          {/* Left Arrow */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => updateImagePosition(imageUrl, Math.min(position.x + 5, 100), position.y)}
                            disabled={position.x >= 100}
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </Button>
                          
                          {/* Center/Reset Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0 rounded-full"
                            onClick={() => updateImagePosition(imageUrl, 50, 50)}
                          >
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          </Button>
                          
                          {/* Right Arrow */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => updateImagePosition(imageUrl, Math.max(position.x - 5, 0), position.y)}
                            disabled={position.x <= 0}
                          >
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {/* Down Arrow */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0 mt-0.5"
                          onClick={() => updateImagePosition(imageUrl, position.x, Math.min(position.y + 5, 100))}
                          disabled={position.y >= 100}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Navigation */}
              <div className="flex justify-start mt-6">
                <Button variant="outline" onClick={goToPreviousStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
              </div>
            </CardContent>
          </Card>
          )}

        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Preview en Vivo
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={zoomOut}
                      disabled={previewZoom <= 0.2}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[60px] text-center text-sm font-medium">
                      {Math.round(previewZoom * 100)}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={zoomIn}
                      disabled={previewZoom >= 1.0}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetZoom}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Preview en tiempo real de la plantilla con configuración actual.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  ref={previewRef}
                  className="overflow-auto border border-gray-300 bg-gray-100 p-4"
                  style={{
                    height: "600px",
                    minHeight: "400px",
                    maxHeight: "80vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${previewZoom})`,
                      transformOrigin: "center center",
                      border: "1px solid #ccc",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      transition: "transform 0.2s ease-in-out",
                      maxWidth: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <ClassicTemplate
                      data={{
                        ...propertyData,
                        images: templateImages
                      }}
                      config={config}
                      className="print-preview"
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    <p>
                      Preview al {Math.round(previewZoom * 100)}% escala. PDF
                      actual:{" "}
                      {config.orientation === "vertical"
                        ? "794×1123"
                        : "1123×794"}
                      px
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Zoom:</span>
                    <Slider
                      value={[previewZoom]}
                      onValueChange={([value]) => setPreviewZoom(value!)}
                      max={1.0}
                      min={0.2}
                      step={0.05}
                      className="w-24"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Action Buttons - Below Preview */}
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={generatePDF}
                    disabled={isGenerating || selectedImageIndices.length < 3}
                    size="lg"
                    title={selectedImageIndices.length < 3 ? "Selecciona al menos 3 imágenes" : ""}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando PDF...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Generar PDF
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={previewTemplate}
                    variant="outline"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview de Plantilla
                  </Button>
                  

                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="outline"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {showPreview ? "Ocultar Preview" : "Mostrar Preview"}
                  </Button>

                  {lastGeneratedPdf && (
                    <Button
                      onClick={() => window.open(lastGeneratedPdf, "_blank")}
                      variant="secondary"
                      className="col-span-2"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Abrir Último PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}