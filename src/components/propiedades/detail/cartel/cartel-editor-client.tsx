"use client";

import React, { useState, useRef, useEffect } from "react";

import { generateStaticDescription, mapDatabaseListingType, mapDatabasePropertyType, parseContactData } from "~/lib/cartel-editor/utils";
import type { CartelEditorClientProps, ContactOffice } from "~/lib/cartel-editor/types";
import { useParams } from "next/navigation";
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
import { Input } from "~/components/ui/input";
import { Slider } from "~/components/ui/slider";
import {
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Settings,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Save,
} from "lucide-react";
import { getExtendedDefaultPropertyData } from "~/lib/carteleria/mock-data";
import { getTemplateComponent, getTemplateStyleName } from "~/lib/carteleria/template-resolver";
import type {
  TemplateConfiguration,
  ExtendedTemplatePropertyData,
  SavedCartelConfiguration,
  SaveConfigurationRequest,
} from "~/types/template-data";
import { AdditionalFieldsSelector } from "~/components/admin/carteleria/controls/additional-fields-selector";
import { toast } from "sonner";
import { getTemplateImages } from "~/lib/carteleria/s3-images";
import { CartelMiniGallery } from "./cartel-mini-gallery";
import { SaveConfigurationModal } from "./save-configuration-modal";
import { SavedConfigurations } from "./saved-configurations";
import type { PropertyImage } from "~/lib/data";
import { getListingCartelSaveData } from "~/server/queries/listing";


export function CartelEditorClient({ images = [], databaseListingType, databasePropertyType, accountColorPalette = [], databaseCity, databaseNeighborhood, databaseBedrooms, databaseBathrooms, databaseSquareMeter, databaseContactProps, databaseWebsite, accountPreferences }: CartelEditorClientProps) {
  // Get listing ID from URL
  const params = useParams();
  const listingId = params.id ? parseInt(params.id as string, 10) : null;
  
  // Debug logging
  console.log("CartelEditorClient - listingId from URL:", listingId);
  
  // Get the appropriate template component based on account preferences
  const TemplateComponent = getTemplateComponent(accountPreferences);
  
  // Template configuration state
  const [config, setConfig] = useState<TemplateConfiguration>(() => {
    const mappedListingType = mapDatabaseListingType(databaseListingType);
    const mappedPropertyType = mapDatabasePropertyType(databasePropertyType);
    const resolvedTemplateStyle = getTemplateStyleName(accountPreferences);
    return {
      templateStyle: resolvedTemplateStyle,
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
      showShortDescription: true,
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
      priceColor: "#000000",
      pricePositionX: 0,
      pricePositionY: 0,
      contactPositionX: 0,
      contactPositionY: 0,
      contactBackgroundColor: "default",
      contactBorderRadius: 8,
      iconSize: 1.0,
      iconTextGap: 8,
      iconPairGap: 16,
      overlayColor: "default",
      additionalFields: ["hasElevator", "hasGarage", "energyConsumptionScale"],
      // Description styling defaults
      descriptionFont: "default",
      descriptionAlignment: "left",
      descriptionSize: 16,
      descriptionColor: "#ffffff",
      descriptionPositionX: 0,
      descriptionPositionY: 0,
      // Bullet styling defaults
      bulletFont: "default",
      bulletAlignment: "left",
      bulletSize: 14,
      bulletColor: "#000000",
      bulletPositionX: 0,
      bulletPositionY: 0,
      referenceTextColor: "#000000",
    };
  });

  // Property data state (using mock data as base)
  const [propertyData, setPropertyData] =
    useState<ExtendedTemplatePropertyData>(() => {
      const baseData = getExtendedDefaultPropertyData(config.propertyType);
      // Generate default title - just the property type in uppercase (listing type is handled separately in template)
      const propertyTypeText = {
        piso: "PISO",
        casa: "CASA", 
        local: "LOCAL",
        garaje: "GARAJE",
        solar: "SOLAR"
      }[config.propertyType] ?? "PROPIEDAD";
      
      // Use selected images if available
      const selectedImages = images.slice(0, 4).map(img => img.imageUrl).filter(Boolean);
      
      // Extract logo URL from account preferences
      let logoUrl = null;
      try {
        if (accountPreferences) {
          const preferences = typeof accountPreferences === 'string' 
            ? JSON.parse(accountPreferences) 
            : accountPreferences;
          logoUrl = preferences?.logoTransparent || null;
        }
      } catch (error) {
        console.warn('Error parsing account preferences for logo:', error);
      }
      
      return {
        ...baseData,
        title: propertyTypeText,
        propertyType: config.propertyType, // Ensure propertyType is explicitly set
        images: selectedImages.length > 0 ? selectedImages : baseData.images,
        logoUrl: logoUrl, // Add logo URL from account preferences
        location: {
          neighborhood: databaseNeighborhood ?? baseData.location.neighborhood,
          city: databaseCity ?? baseData.location.city
        },
        specs: {
          ...baseData.specs,
          bedrooms: databaseBedrooms ?? baseData.specs.bedrooms,
          bathrooms: databaseBathrooms ?? baseData.specs.bathrooms,
          squareMeters: databaseSquareMeter ?? baseData.specs.squareMeters
        },
        shortDescription: generateStaticDescription(
          baseData.propertyType,
          databaseNeighborhood ?? baseData.location.neighborhood,
          databaseCity ?? baseData.location.city,
          databaseBedrooms ?? baseData.specs.bedrooms ?? 0,
          databaseBathrooms ?? baseData.specs.bathrooms ?? 0,
          databaseSquareMeter ?? baseData.specs.squareMeters ?? 0
        ),
        iconListText: `• ${databaseBedrooms ?? baseData.specs.bedrooms ?? 0} dormitorios\n• ${databaseBathrooms ?? baseData.specs.bathrooms ?? 0} baños\n• ${databaseSquareMeter ?? baseData.specs.squareMeters ?? 0} m²`
      };
    });

  // Location field state - format: "neighborhood (city)"
  const [locationText, setLocationText] = useState(() => {
    const neighborhood = databaseNeighborhood ?? "Salamanca";
    const city = databaseCity ?? "Madrid";
    return `${neighborhood} (${city})`;
  });

  // Contact data state
  const [contactData] = useState<ContactOffice[]>(() => {
    return parseContactData(databaseContactProps);
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
  }, [contactData, selectedPhone, selectedEmail]);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview] = useState(true);
  const [lastGeneratedPdf, setLastGeneratedPdf] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState(0.4); // Default zoom level
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
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
  
  // Configuration management state
  const [savedConfigurations, setSavedConfigurations] = useState<SavedCartelConfiguration[]>([]);
  const [currentConfigurationId, setCurrentConfigurationId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isLoadingConfigurations, setIsLoadingConfigurations] = useState(false);
  
  // Cartel save state
  const [isSavingCartel, setIsSavingCartel] = useState(false);
  

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
  }, [images, selectedImageIndices.length]);

  // Update imageCount based on selected images (3 or 4)
  React.useEffect(() => {
    const selectedCount = selectedImageIndices.length;
    if (selectedCount >= 3 && selectedCount <= 4) {
      updateConfig({ imageCount: selectedCount as 3 | 4 });
    }
  }, [selectedImageIndices]);

  // Parse location text and update property data
  const parseLocationText = (locationText: string) => {
    const match = /^(.*?)\s*\((.*?)\)$/.exec(locationText);
    if (match) {
      const [, neighborhood, city] = match;
      return {
        neighborhood: neighborhood?.trim() ?? "",
        city: city?.trim() ?? ""
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
        website: databaseWebsite ?? undefined,
      }
    });
  }, [selectedPhone, selectedEmail, databaseWebsite]);

  // Handle configuration updates
  const updateConfig = (updates: Partial<TemplateConfiguration>) => {
    setConfig((prev) => {
      const newConfig = { ...prev, ...updates };
      
      // If switching to basic template, ensure only 2 contact elements max
      if (updates.templateStyle === "basic") {
        const contactElements = [
          { key: "showPhone" as const, value: newConfig.showPhone },
          { key: "showEmail" as const, value: newConfig.showEmail },
          { key: "showWebsite" as const, value: newConfig.showWebsite },
        ].filter(el => el.value);
        
        // If more than 2 contact elements are selected, keep only the first 2
        if (contactElements.length > 2) {
          const elementsToKeep = contactElements.slice(0, 2);
          const elementsToRemove = contactElements.slice(2);
          
          elementsToRemove.forEach(el => {
            newConfig[el.key] = false;
          });
        }
      }
      
      return newConfig;
    });
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
  const resetZoom = () => {
    setPreviewZoom(config.orientation === "vertical" ? 0.4 : 0.35);
    setPanX(0);
    setPanY(0);
  };

  // Trackpad/mouse wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY;
    const zoomFactor = 0.1;
    
    if (delta < 0) {
      // Zoom in
      setPreviewZoom((prev) => Math.min(prev + zoomFactor, 1.0));
    } else {
      // Zoom out
      setPreviewZoom((prev) => Math.max(prev - zoomFactor, 0.2));
    }
  };

  // Drag start handler
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
    e.preventDefault();
  };


  // Add global mouse event listeners for dragging
  React.useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newPanX = e.clientX - dragStart.x;
      const newPanY = e.clientY - dragStart.y;
      
      setPanX(newPanX);
      setPanY(newPanY);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart.x, dragStart.y]);

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
          }
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

  // Save cartel as document to database and S3
  const saveCartelAsDocument = async () => {
    if (!listingId) {
      toast.error("No se puede guardar: ID de listing no disponible");
      return;
    }

    setIsSavingCartel(true);
    try {
      console.log("🚀 Starting cartel save process...");

      // Get listing data for reference number
      const listingData = await getListingCartelSaveData(listingId);

      // Generate PDF blob
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
          }
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? "PDF generation failed");
      }

      // Get the PDF blob
      const pdfBlob = await response.blob();

      // Convert blob to File object for upload
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `cartel_${listingData.referenceNumber}_${timestamp}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      // Create FormData for upload using the existing API endpoint
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderType', 'carteles');

      // Upload using the properties documents API (which handles authentication internally)
      const uploadResponse = await fetch(`/api/properties/${listingId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json() as { error?: string };
        throw new Error(errorData.error ?? 'Failed to upload document');
      }

      toast.success("Cartel guardado exitosamente en documentos!");
      console.log("✅ Cartel saved successfully");
    } catch (error) {
      console.error("❌ Cartel save error:", error);
      toast.error(
        `Error al guardar cartel: ${error instanceof Error ? error.message : "Error desconocido"}`,
      );
    } finally {
      setIsSavingCartel(false);
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


  // Configuration management functions
  const fetchConfigurations = async () => {
    setIsLoadingConfigurations(true);
    try {
      const response = await fetch('/api/cartel-configurations');
      const data = await response.json() as { success: boolean; data?: SavedCartelConfiguration[]; error?: string };
      
      if (data.success) {
        setSavedConfigurations(data.data ?? []);
      }
    } catch (error) {
      console.error('Error fetching configurations:', error);
    } finally {
      setIsLoadingConfigurations(false);
    }
  };

  const saveConfiguration = async (request: SaveConfigurationRequest): Promise<boolean> => {
    try {
      const response = await fetch('/api/cartel-configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json() as { success: boolean; data?: SavedCartelConfiguration; error?: string };
      
      if (data.success) {
        await fetchConfigurations(); // Refresh the list
        setCurrentConfigurationId(data.data?.id ?? null);
        setHasUnsavedChanges(false);
        return true;
      } else {
        toast.error(data.error ?? 'Error al guardar la configuración');
        return false;
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Error al guardar la configuración');
      return false;
    }
  };

  const loadConfiguration = (configuration: SavedCartelConfiguration) => {
    try {
      setConfig(configuration.templateConfig);
      
      // Apply property overrides if any
      if (configuration.propertyOverrides) {
        setPropertyData(prev => ({ ...prev, ...configuration.propertyOverrides }));
      }
      
      // Apply selected contacts
      if (configuration.selectedContacts?.phone) {
        setSelectedPhone(configuration.selectedContacts.phone);
      }
      if (configuration.selectedContacts?.email) {
        setSelectedEmail(configuration.selectedContacts.email);
      }
      
      // Apply selected image indices
      setSelectedImageIndices(configuration.selectedImageIndices);
      
      setCurrentConfigurationId(configuration.id);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast.error('Error al cargar la configuración');
    }
  };

  const deleteConfiguration = async (configurationId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/cartel-configurations/${configurationId}`, {
        method: 'DELETE',
      });

      const data = await response.json() as { success: boolean; error?: string };
      
      if (data.success) {
        await fetchConfigurations(); // Refresh the list
        if (currentConfigurationId === configurationId) {
          setCurrentConfigurationId(null);
          setHasUnsavedChanges(false);
        }
      } else {
        throw new Error(data.error ?? 'Error deleting configuration');
      }
    } catch (error) {
      console.error('Error deleting configuration:', error);
      throw error;
    }
  };

  const setDefaultConfiguration = async (configurationId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/cartel-configurations/${configurationId}/set-default`, {
        method: 'POST',
      });

      const data = await response.json() as { success: boolean; error?: string };
      
      if (data.success) {
        await fetchConfigurations(); // Refresh the list
      } else {
        throw new Error(data.error ?? 'Error setting default configuration');
      }
    } catch (error) {
      console.error('Error setting default configuration:', error);
      throw error;
    }
  };

  // Load configurations on component mount
  useEffect(() => {
    void fetchConfigurations();
  }, []);

  // Track changes to detect unsaved modifications
  useEffect(() => {
    if (currentConfigurationId) {
      const currentConfig = savedConfigurations.find(c => c.id === currentConfigurationId);
      if (currentConfig) {
        const hasConfigChanges = JSON.stringify(config) !== JSON.stringify(currentConfig.templateConfig);
        const hasContactChanges = selectedPhone !== (currentConfig.selectedContacts?.phone ?? '') ||
                                selectedEmail !== (currentConfig.selectedContacts?.email ?? '');
        const hasImageChanges = JSON.stringify(selectedImageIndices) !== JSON.stringify(currentConfig.selectedImageIndices);
        
        setHasUnsavedChanges(hasConfigChanges || hasContactChanges || hasImageChanges);
      }
    } else {
      setHasUnsavedChanges(false);
    }
  }, [config, selectedPhone, selectedEmail, selectedImageIndices, currentConfigurationId, savedConfigurations]);

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
    <div className="w-full p-4 md:p-6">
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
      
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="space-y-4 md:space-y-6 lg:col-span-1">
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
                    onValueChange={(value) => updateConfig({ overlayColor: value })}
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
                      
                      {/* Standard color options - matching other selectors */}
                      <SelectItem value="white">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-white border border-gray-300"></div>
                          <span>Blanco</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="black">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-black"></div>
                          <span>Negro</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="gray">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                          <span>Gris Estándar</span>
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
                            <span>Corporativo {index + 1}</span>
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
                  {config.templateStyle === "basic" && (
                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                      <strong>Nota:</strong> La plantilla básica solo permite mostrar 2 elementos de contacto máximo.
                    </div>
                  )}
                  <div className="space-y-2">
                    {[
                      { key: "showPhone" as const, label: "Teléfono" },
                      { key: "showEmail" as const, label: "Email" },
                      { key: "showWebsite" as const, label: "Website" },
                    ].map(({ key, label }) => {
                      const isChecked = config[key] ?? false;
                      
                      // Count currently selected contact elements
                      const selectedCount = [
                        config.showPhone,
                        config.showEmail,
                        config.showWebsite
                      ].filter(Boolean).length;
                      
                      // Disable if trying to select more than 2 elements in basic template
                      const wouldExceedLimit = config.templateStyle === "basic" && 
                        !isChecked && 
                        selectedCount >= 2;
                      
                      return (
                        <div
                          key={key}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={key}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (config.templateStyle === "basic" && checked && selectedCount >= 2) {
                                // If trying to select a 3rd element in basic template, deselect another one
                                const otherKeys = ["showPhone", "showEmail", "showWebsite"].filter(k => k !== key);
                                const firstOtherKey = otherKeys.find(k => config[k as keyof typeof config]) as keyof typeof config;
                                if (firstOtherKey) {
                                  updateConfig({ [firstOtherKey]: false, [key]: true });
                                }
                              } else {
                                updateConfig({ [key]: checked === true });
                              }
                            }}
                            disabled={wouldExceedLimit}
                            className="no-checkmark h-3 w-3"
                          />
                          <Label 
                            htmlFor={key} 
                            className={`text-xs ${wouldExceedLimit ? 'text-gray-500' : ''}`}
                          >
                            {label}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Visual Elements Group */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground">Elementos Visuales</h5>
                  <div className="space-y-2">
                    {/* QR Code Checkbox */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showQR"
                        checked={config.showQR ?? false}
                        onCheckedChange={(checked) =>
                          updateConfig({ showQR: checked === true })
                        }
                        className="no-checkmark h-3 w-3"
                      />
                      <Label htmlFor="showQR" className="text-xs">
                        Código QR
                      </Label>
                    </div>
                    
                    {/* Watermark Checkbox */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showWatermark"
                        checked={config.showWatermark ?? false}
                        onCheckedChange={(checked) =>
                          updateConfig({ showWatermark: checked === true })
                        }
                        className="no-checkmark h-3 w-3"
                      />
                      <Label htmlFor="showWatermark" className="text-xs">
                        Marca de Agua
                      </Label>
                    </div>
                    
                    {/* Icons with Editable List */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showIcons"
                          checked={config.showIcons ?? false}
                          onCheckedChange={(checked) =>
                            updateConfig({ showIcons: checked === true })
                          }
                          className="no-checkmark h-3 w-3"
                        />
                        <Label htmlFor="showIcons" className="text-xs">
                          Iconos
                        </Label>
                      </div>
                      {!config.showIcons && (
                        <div className="ml-5">
                          <textarea
                            value={propertyData.iconListText ?? ""}
                            onChange={(e) =>
                              updatePropertyData({ iconListText: e.target.value })
                            }
                            placeholder="Lista de características (una por línea)..."
                            className="w-full p-3 text-sm rounded border border-gray-200 resize-none md:p-2 md:text-xs"
                            rows={4}
                          />
                          
                          {/* Bullet List Styling Controls */}
                          <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg">
                            <Label className="text-xs font-medium">Personalización de Lista</Label>
                            
                            {/* Font and Size */}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <div>
                                <Label className="text-xs">Fuente</Label>
                                <Select
                                  value={config.bulletFont}
                                  onValueChange={(value) =>
                                    updateConfig({ bulletFont: value as TemplateConfiguration["bulletFont"] })
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="default">Por defecto</SelectItem>
                                    <SelectItem value="serif">Serif</SelectItem>
                                    <SelectItem value="sans">Sans</SelectItem>
                                    <SelectItem value="mono">Mono</SelectItem>
                                    <SelectItem value="elegant">Elegante</SelectItem>
                                    <SelectItem value="modern">Moderno</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label className="text-xs">Tamaño</Label>
                                <div className="flex items-center space-x-2">
                                  <Slider
                                    value={[config.bulletSize]}
                                    onValueChange={([value]) =>
                                      updateConfig({ bulletSize: value })
                                    }
                                    max={24}
                                    min={12}
                                    step={1}
                                    className="flex-1"
                                  />
                                  <span className="text-xs w-8">{config.bulletSize}px</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Alignment and Color */}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <div>
                                <Label className="text-xs">Alineación</Label>
                                <div className="flex border rounded-md">
                                  <button
                                    type="button"
                                    onClick={() => updateConfig({ bulletAlignment: "left" })}
                                    className={`flex-1 p-2 rounded-l-md border-r ${
                                      config.bulletAlignment === "left"
                                        ? "bg-blue-500 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    <AlignLeft className="w-4 h-4 mx-auto" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateConfig({ bulletAlignment: "center" })}
                                    className={`flex-1 p-2 border-r ${
                                      config.bulletAlignment === "center"
                                        ? "bg-blue-500 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    <AlignCenter className="w-4 h-4 mx-auto" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateConfig({ bulletAlignment: "right" })}
                                    className={`flex-1 p-2 rounded-r-md ${
                                      config.bulletAlignment === "right"
                                        ? "bg-blue-500 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    <AlignRight className="w-4 h-4 mx-auto" />
                                  </button>
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-xs">Color</Label>
                                <Input
                                  type="color"
                                  value={config.bulletColor}
                                  onChange={(e) =>
                                    updateConfig({ bulletColor: e.target.value })
                                  }
                                  className="h-8"
                                />
                              </div>
                            </div>
                            
                            {/* Position Controls - Joystick Style */}
                            <div>
                              <Label className="text-xs text-gray-600">Posición</Label>
                              <div className="flex items-center justify-center mt-2">
                                <div className="flex flex-col items-center">
                                  {/* Up Arrow */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 w-6 p-0 mb-0.5"
                                    onClick={() => updateConfig({ bulletPositionY: Math.max((config.bulletPositionY || 0) - 5, -30) })}
                                    disabled={(config.bulletPositionY || 0) <= -30}
                                  >
                                    <ChevronUp className="h-3 w-3" />
                                  </Button>
                                  
                                  <div className="flex items-center gap-0.5">
                                    {/* Left Arrow */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => updateConfig({ bulletPositionX: Math.max((config.bulletPositionX || 0) - 5, -50) })}
                                      disabled={(config.bulletPositionX || 0) <= -50}
                                    >
                                      <ChevronLeft className="h-3 w-3" />
                                    </Button>
                                    
                                    {/* Center/Reset Button */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 w-6 p-0 rounded-full"
                                      onClick={() => updateConfig({ bulletPositionX: 0, bulletPositionY: 0 })}
                                    >
                                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    </Button>
                                    
                                    {/* Right Arrow */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => updateConfig({ bulletPositionX: Math.min((config.bulletPositionX || 0) + 5, 50) })}
                                      disabled={(config.bulletPositionX || 0) >= 50}
                                    >
                                      <ChevronRight className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  
                                  {/* Down Arrow */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 w-6 p-0 mt-0.5"
                                    onClick={() => updateConfig({ bulletPositionY: Math.min((config.bulletPositionY || 0) + 5, 30) })}
                                    disabled={(config.bulletPositionY || 0) >= 30}
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="text-center mt-2">
                                <span className="text-xs text-gray-500">
                                  {config.bulletPositionX}px, {config.bulletPositionY}px
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Group */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground">Contenido</h5>
                  <div className="space-y-2">
                    {/* Reference Checkbox */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showReference"
                        checked={config.showReference ?? false}
                        onCheckedChange={(checked) =>
                          updateConfig({ showReference: checked === true })
                        }
                        className="no-checkmark h-3 w-3"
                      />
                      <Label htmlFor="showReference" className="text-xs">
                        Referencia
                      </Label>
                    </div>
                    
                    {/* Reference Text Color - Only show when reference is enabled */}
                    {config.showReference && (
                      <div>
                        <Label className="text-xs">Color del texto de referencia</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={config.referenceTextColor || "#000000"}
                            onChange={(e) =>
                              updateConfig({ referenceTextColor: e.target.value })
                            }
                            className="h-8 flex-1"
                          />
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => updateConfig({ referenceTextColor: "#000000" })}
                              className={`px-2 py-1 text-xs rounded ${
                                config.referenceTextColor === "#000000" || !config.referenceTextColor
                                  ? "bg-black text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              Negro
                            </button>
                            <button
                              type="button"
                              onClick={() => updateConfig({ referenceTextColor: "#ffffff" })}
                              className={`px-2 py-1 text-xs rounded ${
                                config.referenceTextColor === "#ffffff"
                                  ? "bg-white text-black border border-gray-300"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              Blanco
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Short Description with Edit */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showShortDescription"
                          checked={config.showShortDescription ?? false}
                          onCheckedChange={(checked) =>
                            updateConfig({ showShortDescription: checked === true })
                          }
                          className="no-checkmark h-3 w-3"
                        />
                        <Label htmlFor="showShortDescription" className="text-xs">
                          Descripción Corta
                        </Label>
                      </div>
                      {config.showShortDescription && (
                        <div className="ml-5">
                          <textarea
                            value={propertyData.shortDescription ?? ""}
                            onChange={(e) => {
                              console.log('Updating shortDescription:', e.target.value);
                              updatePropertyData({ shortDescription: e.target.value });
                            }}
                            placeholder="Escribe una descripción personalizada..."
                            className="w-full p-3 text-sm rounded border border-gray-200 resize-none md:p-2 md:text-xs"
                            rows={2}
                          />
                          
                          {/* Description Styling Controls */}
                          <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg">
                            <Label className="text-xs font-medium">Personalización de Descripción</Label>
                            
                            {/* Font and Size */}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <div>
                                <Label className="text-xs">Fuente</Label>
                                <Select
                                  value={config.descriptionFont}
                                  onValueChange={(value) =>
                                    updateConfig({ descriptionFont: value as TemplateConfiguration["descriptionFont"] })
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="default">Por defecto</SelectItem>
                                    <SelectItem value="serif">Serif</SelectItem>
                                    <SelectItem value="sans">Sans</SelectItem>
                                    <SelectItem value="mono">Mono</SelectItem>
                                    <SelectItem value="elegant">Elegante</SelectItem>
                                    <SelectItem value="modern">Moderno</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label className="text-xs">Tamaño</Label>
                                <div className="flex items-center space-x-2">
                                  <Slider
                                    value={[config.descriptionSize]}
                                    onValueChange={([value]) =>
                                      updateConfig({ descriptionSize: value })
                                    }
                                    max={32}
                                    min={12}
                                    step={1}
                                    className="flex-1"
                                  />
                                  <span className="text-xs w-8">{config.descriptionSize}px</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Alignment and Color */}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <div>
                                <Label className="text-xs">Alineación</Label>
                                <div className="flex border rounded-md">
                                  <button
                                    type="button"
                                    onClick={() => updateConfig({ descriptionAlignment: "left" })}
                                    className={`flex-1 p-2 rounded-l-md border-r ${
                                      config.descriptionAlignment === "left"
                                        ? "bg-blue-500 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    <AlignLeft className="w-4 h-4 mx-auto" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateConfig({ descriptionAlignment: "center" })}
                                    className={`flex-1 p-2 border-r ${
                                      config.descriptionAlignment === "center"
                                        ? "bg-blue-500 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    <AlignCenter className="w-4 h-4 mx-auto" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateConfig({ descriptionAlignment: "right" })}
                                    className={`flex-1 p-2 rounded-r-md ${
                                      config.descriptionAlignment === "right"
                                        ? "bg-blue-500 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    <AlignRight className="w-4 h-4 mx-auto" />
                                  </button>
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-xs">Color</Label>
                                <Input
                                  type="color"
                                  value={config.descriptionColor}
                                  onChange={(e) =>
                                    updateConfig({ descriptionColor: e.target.value })
                                  }
                                  className="h-8"
                                />
                              </div>
                            </div>
                            
                            {/* Position Controls */}
                            <div>
                              <Label className="text-xs text-gray-600">Posición</Label>
                              <div className="flex items-center justify-center mt-2">
                                <div className="flex flex-col items-center">
                                  {/* Up Arrow */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 w-6 p-0 mb-0.5"
                                    onClick={() => updateConfig({ descriptionPositionY: Math.max((config.descriptionPositionY || 0) - 5, -30) })}
                                    disabled={(config.descriptionPositionY || 0) <= -30}
                                  >
                                    <ChevronUp className="h-3 w-3" />
                                  </Button>
                                  
                                  <div className="flex items-center gap-0.5">
                                    {/* Left Arrow */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => updateConfig({ descriptionPositionX: Math.max((config.descriptionPositionX || 0) - 5, -50) })}
                                      disabled={(config.descriptionPositionX || 0) <= -50}
                                    >
                                      <ChevronLeft className="h-3 w-3" />
                                    </Button>
                                    
                                    {/* Center/Reset Button */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 w-6 p-0 rounded-full"
                                      onClick={() => updateConfig({ descriptionPositionX: 0, descriptionPositionY: 0 })}
                                    >
                                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    </Button>
                                    
                                    {/* Right Arrow */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => updateConfig({ descriptionPositionX: Math.min((config.descriptionPositionX || 0) + 5, 50) })}
                                      disabled={(config.descriptionPositionX || 0) >= 50}
                                    >
                                      <ChevronRight className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  
                                  {/* Down Arrow */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 w-6 p-0 mt-0.5"
                                    onClick={() => updateConfig({ descriptionPositionY: Math.min((config.descriptionPositionY || 0) + 5, 30) })}
                                    disabled={(config.descriptionPositionY || 0) >= 30}
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

              {/* Icon Grid Customization - Only show when icons are enabled */}
              {config.showIcons && (
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
                        <Label className="font-medium">Tamaño de Iconos</Label>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">A</span>
                          <Slider
                            value={[config.iconSize]}
                            onValueChange={([value]) => updateConfig({ iconSize: value })}
                            max={2.0}
                            min={0.5}
                            step={0.1}
                            className="flex-1"
                          />
                          <span className="text-xl font-bold text-gray-500">A</span>
                        </div>
                      </div>

                      {/* Spacing Controls */}
                      <div className="space-y-3">
                        <Label className="font-medium">Separación de Iconos</Label>
                        
                        {/* Icon-Text Gap */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Distancia Icono-Número</span>
                            <span className="text-xs font-mono text-gray-600 bg-white px-2 py-1 rounded">
                              {config.iconTextGap}px
                            </span>
                          </div>
                          <Slider
                            value={[config.iconTextGap]}
                            onValueChange={([value]) => updateConfig({ iconTextGap: value })}
                            max={20}
                            min={2}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        {/* Icon Pair Gap */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Distancia entre Pares</span>
                            <span className="text-xs font-mono text-gray-600 bg-white px-2 py-1 rounded">
                              {config.iconPairGap}px
                            </span>
                          </div>
                          <Slider
                            value={[config.iconPairGap]}
                            onValueChange={([value]) => updateConfig({ iconPairGap: value })}
                            max={40}
                            min={8}
                            step={2}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              )}
              
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
                  Propiedad
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
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

                      {/* Border Radius Control - Only show for classic template */}
                      {config.templateStyle !== "basic" && (
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
                      )}
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
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                Posiciona las imágenes dentro de sus contenedores para
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
                          onClick={() => updateImagePosition(imageUrl, position.x, Math.max(position.y - 5, -500))}
                          disabled={position.y <= -500}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        
                        <div className="flex items-center gap-0.5">
                          {/* Left Arrow */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                          onClick={() => updateImagePosition(imageUrl, Math.min(position.x + 5, 500), position.y)}
                          disabled={position.x >= 500}
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
                          onClick={() => updateImagePosition(imageUrl, Math.max(position.x - 5, -500), position.y)}
                          disabled={position.x <= -500}
                          >
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {/* Down Arrow */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0 mt-0.5"
                          onClick={() => updateImagePosition(imageUrl, position.x, Math.min(position.y + 5, 500))}
                          disabled={position.y >= 500}
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
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Previsualización
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetZoom}
                      title="Reset zoom and position"
                    >
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
                  className="overflow-auto border border-gray-300 bg-gray-100 p-2 md:p-4"
                  style={{
                    height: "60vh",
                    minHeight: "400px",
                    maxHeight: "90vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    cursor: isDragging ? "grabbing" : "grab",
                    paddingTop: "20px",
                  }}
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                >
                  <div
                    style={{
                      transform: `scale(${previewZoom}) translate(${panX}px, ${panY}px)`,
                      transformOrigin: "top center",
                      border: "1px solid #ccc",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      transition: isDragging ? "none" : "transform 0.2s ease-in-out",
                      maxWidth: "100%",
                      overflow: "visible",
                    }}
                  >
                    <TemplateComponent
                      data={{
                        ...propertyData,
                        images: templateImages
                      }}
                      config={config}
                      className="print-preview"
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-end">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Zoom:</span>
                    <Slider
                      value={[previewZoom]}
                      onValueChange={([value]) => setPreviewZoom(value!)}
                      max={1.0}
                      min={0.2}
                      step={0.05}
                      className="w-16 md:w-24"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Action Buttons - Below Preview */}
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                    onClick={saveCartelAsDocument}
                    disabled={isSavingCartel || !listingId || selectedImageIndices.length < 3}
                    className="flex items-center gap-2"
                    title={!listingId ? "ID de listing no disponible" : selectedImageIndices.length < 3 ? "Selecciona al menos 3 imágenes" : ""}
                  >
                    {isSavingCartel ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Guardar Cartel
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => setShowSaveModal(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Guardar Plantilla
                  </Button>

                  <Button
                    onClick={previewTemplate}
                    variant="outline"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Vista Rápida
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

            {/* Saved Configurations Section */}
            <SavedConfigurations
              savedConfigurations={savedConfigurations}
              selectedConfigurationId={currentConfigurationId}
              isLoading={isLoadingConfigurations}
              onLoadConfiguration={loadConfiguration}
              onDeleteConfiguration={deleteConfiguration}
              onSetDefaultConfiguration={setDefaultConfiguration}
              onRefreshConfigurations={fetchConfigurations}
            />
          </div>
        )}
      </div>
      
      {/* Save Configuration Modal */}
      <SaveConfigurationModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        templateConfig={config}
        selectedContacts={{ phone: selectedPhone, email: selectedEmail }}
        selectedImageIndices={selectedImageIndices}
        onSave={saveConfiguration}
      />
    </div>
  );
}