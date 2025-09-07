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

export default function PuppeteerPlayground() {
  // Template configuration state
  const [config, setConfig] = useState<TemplateConfiguration>({
    templateStyle: "classic",
    orientation: "vertical",
    propertyType: "piso",
    listingType: "venta",
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
    overlayColor: "default",
    additionalFields: ["hasElevator", "hasGarage", "energyConsumptionScale"],
    titleAlignment: "left",
    titleSize: 32,
    titleColor: "#000000",
    titlePositionX: 0,
    titlePositionY: 0,
    locationFont: "default",
    locationAlignment: "left",
    locationSize: 24,
    locationColor: "#666666",
    locationPositionX: 0,
    locationPositionY: 0,
    locationBorderRadius: 8,
    priceAlignment: "left",
    priceSize: 48,
    priceColor: "#000000",
    pricePositionX: 0,
    pricePositionY: 0,
    contactPositionX: 0,
    contactPositionY: 0,
    contactBackgroundColor: "#ffffff",
    contactBorderRadius: 8,
    iconSize: 1.0,
    iconSpacingHorizontal: 20,
    iconSpacingVertical: 10,
    // Description styling defaults
    descriptionFont: "default",
    descriptionAlignment: "left",
    descriptionSize: 16,
    descriptionColor: "#000000",
    descriptionPositionX: 0,
    descriptionPositionY: 0,
    // Bullet styling defaults
    bulletFont: "default",
    bulletAlignment: "left",
    bulletSize: 14,
    bulletColor: "#000000",
    bulletPositionX: 0,
    bulletPositionY: 0,
  });

  // Property data state (using mock data as base)
  const [propertyData, setPropertyData] =
    useState<ExtendedTemplatePropertyData>(() =>
      getExtendedDefaultPropertyData("piso"),
    );

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [lastGeneratedPdf, setLastGeneratedPdf] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState(0.4); // Default zoom level

  const previewRef = useRef<HTMLDivElement>(null);

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

  // Get template images for positioning controls
  const templateImages = getTemplateImages(config.imageCount);

  // Zoom control functions
  const zoomIn = () => setPreviewZoom((prev) => Math.min(prev + 0.1, 1.0));
  const zoomOut = () => setPreviewZoom((prev) => Math.max(prev - 0.1, 0.2));
  const resetZoom = () =>
    setPreviewZoom(config.orientation === "vertical" ? 0.4 : 0.35);

  // Generate PDF using Puppeteer
  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      console.log("=� Starting PDF generation...");

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
      setLastGeneratedPdf(pdfUrl);

      // Automatically download the PDF
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `property-template-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("PDF generado exitosamente!");
      console.log(" PDF generated and downloaded");
    } catch (error) {
      console.error("L PDF generation error:", error);
      toast.error(
        `Error generating PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Preview the template in a new window
  const previewTemplate = () => {
    const templateUrl = new URL("/api/puppet/template", window.location.origin);
    templateUrl.searchParams.set("config", JSON.stringify(config));
    templateUrl.searchParams.set("data", JSON.stringify(propertyData));

    window.open(
      templateUrl.toString(),
      "_blank",
      "width=820,height=1160,scrollbars=yes,resizable=yes",
    );
  };

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Puppeteer PDF Generator</h1>
        <p className="text-muted-foreground">
          Generate high-quality PDFs using the print-optimized ClassicTemplate
          with Puppeteer integration
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Template Configuration
              </CardTitle>
              <CardDescription>
                Configure the template appearance and layout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Settings */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="orientation">Orientation</Label>
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
                        Vertical (794x1123)
                      </SelectItem>
                      <SelectItem value="horizontal">
                        Horizontal (1123x794)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="listingType">Listing Type</Label>
                  <Select
                    value={config.listingType}
                    onValueChange={(value: "venta" | "alquiler") =>
                      updateConfig({ listingType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venta">Venta</SelectItem>
                      <SelectItem value="alquiler">Alquiler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="imageCount">Image Count</Label>
                  <Select
                    value={config.imageCount.toString()}
                    onValueChange={(value) =>
                      updateConfig({ imageCount: parseInt(value) as 3 | 4 })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Images</SelectItem>
                      <SelectItem value="4">4 Images</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select
                    value={config.propertyType}
                    onValueChange={(
                      value: "piso" | "casa" | "local" | "garaje" | "solar",
                    ) => {
                      updateConfig({ propertyType: value });
                      // Update property data to match
                      setPropertyData(getExtendedDefaultPropertyData(value));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piso">Piso</SelectItem>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="garaje">Garaje</SelectItem>
                      <SelectItem value="solar">Solar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="overlayColor">Overlay Color</Label>
                  <Select
                    value={config.overlayColor}
                    onValueChange={(
                      value:
                        | "default"
                        | "dark"
                        | "light"
                        | "blue"
                        | "green"
                        | "purple"
                        | "red",
                    ) => updateConfig({ overlayColor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Gray</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Display Options */}
              <div className="space-y-3">
                <h4 className="font-medium">Display Options</h4>
                <div className="space-y-2">
                  {[
                    { key: "showPhone" as const, label: "Show Phone" },
                    { key: "showEmail" as const, label: "Show Email" },
                    { key: "showWebsite" as const, label: "Show Website" },
                    { key: "showQR" as const, label: "Show QR Code" },
                    { key: "showReference" as const, label: "Show Reference" },
                    { key: "showWatermark" as const, label: "Show Watermark" },
                    { key: "showIcons" as const, label: "Show Icons" },
                    {
                      key: "showShortDescription" as const,
                      label: "Short Description",
                    },
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <Label htmlFor={key} className="text-sm">
                        {label}
                      </Label>
                      <Switch
                        id={key}
                        checked={config[key] ?? false}
                        onCheckedChange={(checked) =>
                          updateConfig({ [key]: checked })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Fields Selector */}
              <div>
                <AdditionalFieldsSelector
                  config={config}
                  onChange={updateConfig}
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Property Data
              </CardTitle>
              <CardDescription>Edit the property information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={propertyData.title}
                  onChange={(e) =>
                    updatePropertyData({ title: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="price">Price (�)</Label>
                <Input
                  id="price"
                  type="number"
                  value={propertyData.price}
                  onChange={(e) =>
                    updatePropertyData({ price: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={propertyData.specs.bedrooms ?? 0}
                    onChange={(e) =>
                      updatePropertyData({
                        specs: {
                          ...propertyData.specs,
                          bedrooms: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={propertyData.specs.bathrooms ?? 0}
                    onChange={(e) =>
                      updatePropertyData({
                        specs: {
                          ...propertyData.specs,
                          bathrooms: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sqm">Square Meters</Label>
                <Input
                  id="sqm"
                  type="number"
                  value={propertyData.specs.squareMeters}
                  onChange={(e) =>
                    updatePropertyData({
                      specs: {
                        ...propertyData.specs,
                        squareMeters: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={propertyData.location.city}
                    onChange={(e) =>
                      updatePropertyData({
                        location: {
                          ...propertyData.location,
                          city: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="neighborhood">Neighborhood</Label>
                  <Input
                    id="neighborhood"
                    value={propertyData.location.neighborhood}
                    onChange={(e) =>
                      updatePropertyData({
                        location: {
                          ...propertyData.location,
                          neighborhood: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={propertyData.contact.phone}
                  onChange={(e) =>
                    updatePropertyData({
                      contact: {
                        ...propertyData.contact,
                        phone: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Positioning Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Image Positioning
              </CardTitle>
              <CardDescription>
                Drag and position images within their containers for better
                framing
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
                        Image {index + 1}
                      </span>
                      {index === 0 && (
                        <span className="text-xs text-muted-foreground">
                          (Main)
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

                    {/* X Position Slider */}
                    <div className="space-y-2">
                      <Label className="text-xs">
                        Horizontal Position ({position.x.toFixed(0)}%)
                      </Label>
                      <Slider
                        value={[position.x]}
                        onValueChange={([value]) =>
                          updateImagePosition(imageUrl, value!, position.y)
                        }
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Y Position Slider */}
                    <div className="space-y-2">
                      <Label className="text-xs">
                        Vertical Position ({position.y.toFixed(0)}%)
                      </Label>
                      <Slider
                        value={[position.y]}
                        onValueChange={([value]) =>
                          updateImagePosition(imageUrl, position.x, value!)
                        }
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Reset button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateImagePosition(imageUrl, 50, 50)}
                      className="w-full text-xs"
                    >
                      Reset to Center
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button
                  onClick={generatePDF}
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Generate PDF
                    </>
                  )}
                </Button>

                <Button
                  onClick={previewTemplate}
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Template
                </Button>

                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  className="w-full"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </Button>

                {lastGeneratedPdf && (
                  <Button
                    onClick={() => window.open(lastGeneratedPdf, "_blank")}
                    variant="secondary"
                    className="w-full"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Open Last PDF
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Live Preview
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
                  Real-time preview of the template with current configuration.
                  Use zoom controls to magnify for detailed image positioning.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  ref={previewRef}
                  className="overflow-auto border border-gray-300 bg-gray-100 p-4"
                  style={{
                    height: "600px",
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
                    }}
                  >
                    <ClassicTemplate
                      data={propertyData}
                      config={config}
                      className="print-preview"
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Preview at {Math.round(previewZoom * 100)}% scale. Actual
                    PDF:{" "}
                    {config.orientation === "vertical"
                      ? "794×1123"
                      : "1123×794"}
                    px
                  </p>
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
          </div>
        )}
      </div>
    </div>
  );
}
