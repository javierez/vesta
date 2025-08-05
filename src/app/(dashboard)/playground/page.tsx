"use client";

import { useState } from "react";
import { ConfigurableTemplate } from "~/components/admin/carteleria/templates/configurable-template";
import {
  mockPropertyData,
  getExtendedDefaultPropertyData,
} from "~/lib/carteleria/mock-data";
import type {
  TemplateConfiguration,
  ExtendedTemplatePropertyData,
} from "~/types/template-data";
import { DisplayToggles } from "~/components/admin/carteleria/controls/display-toggles";
import { AdditionalFieldsSelector } from "~/components/admin/carteleria/controls/additional-fields-selector";
import { ImageCountSelector } from "~/components/admin/carteleria/controls/image-count-selector";
import { ListingTypeSelector } from "~/components/admin/carteleria/controls/listing-type-selector";
import { TemplateStyleSelector } from "~/components/admin/carteleria/controls/template-style-selector";
import { cn } from "~/lib/utils";

export default function PlaygroundPage() {
  const [propertyData, setPropertyData] =
    useState<ExtendedTemplatePropertyData>(
      getExtendedDefaultPropertyData("piso"),
    );

  // Template configuration state for new controls
  const [config, setConfig] = useState<TemplateConfiguration>({
    templateStyle: "modern",
    orientation: "vertical",
    propertyType: "piso",
    imageCount: 3,
    showIcons: true,
    showQR: true,
    showWatermark: false,
    showPhone: true,
    showShortDescription: false,
    listingType: "venta",
    additionalFields: [],
  });

  // Handler for updating template configuration
  const updateConfig = (updates: Partial<TemplateConfiguration>) => {
    setConfig((prev) => {
      const newConfig = { ...prev, ...updates };

      // Update title when listingType changes
      if (updates.listingType) {
        const title = `${propertyData.propertyType.charAt(0).toUpperCase() + propertyData.propertyType.slice(1)} en ${updates.listingType}`;
        setPropertyData((prevData) => ({ ...prevData, title }));
      }

      return newConfig;
    });
  };

  const handlePropertyTypeChange = (
    propertyType: "piso" | "casa" | "local" | "garaje" | "solar",
  ) => {
    // Use extended property data with additional fields
    const extendedData = getExtendedDefaultPropertyData(propertyType);
    // Update title based on propertyType and listingType
    const title = `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} en ${config.listingType}`;
    setPropertyData({ ...extendedData, title });
    // Update config as well
    updateConfig({ propertyType });
  };

  const handleLocationChange = (city: string, neighborhood: string) => {
    setPropertyData((prev) => ({
      ...prev,
      location: { city, neighborhood },
    }));
  };

  const handlePriceChange = (price: number) => {
    setPropertyData((prev) => ({ ...prev, price }));
  };

  const handleSquareMetersChange = (squareMeters: number) => {
    setPropertyData((prev) => ({
      ...prev,
      specs: { ...prev.specs, squareMeters },
    }));
  };

  const handleBedroomsChange = (bedrooms: number | undefined) => {
    setPropertyData((prev) => ({
      ...prev,
      specs: { ...prev.specs, bedrooms },
    }));
  };

  const handleBathroomsChange = (bathrooms: number | undefined) => {
    setPropertyData((prev) => ({
      ...prev,
      specs: { ...prev.specs, bathrooms },
    }));
  };

  const handlePhoneChange = (phone: string) => {
    setPropertyData((prev) => ({
      ...prev,
      contact: { ...prev.contact, phone },
    }));
  };

  const handleEmailChange = (email: string) => {
    setPropertyData((prev) => ({
      ...prev,
      contact: { ...prev.contact, email },
    }));
  };

  const cities = [
    { value: "León|Centro", label: "León - Centro" },
    { value: "León|Ensanche", label: "León - Ensanche" },
    { value: "León|Crucero", label: "León - Crucero" },
    { value: "León|La Palomera", label: "León - La Palomera" },
    { value: "León|Eras de Renueva", label: "León - Eras de Renueva" },
    { value: "León|Trobajo del Camino", label: "León - Trobajo del Camino" },
    { value: "León|Armunia", label: "León - Armunia" },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-8 text-3xl font-bold">
        Área de Pruebas de Plantilla Moderna
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Panel de Controles - Single scrollable list */}
        <div>
          <div className="h-[800px] overflow-y-auto rounded-lg border p-6">
            <h2 className="sticky top-0 mb-6 border-b bg-white pb-2 text-xl font-semibold">
              Controles de Plantilla
            </h2>

            <div className="space-y-6">
              {/* Template Style Selector */}
              <div>
                <TemplateStyleSelector
                  config={config}
                  onChange={updateConfig}
                />
              </div>

              {/* Selector de Orientación */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Orientación
                </label>
                <select
                  value={config.orientation}
                  onChange={(e) =>
                    updateConfig({
                      orientation: e.target.value as "vertical" | "horizontal",
                    })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2"
                >
                  <option value="vertical">Vertical (A4 Retrato)</option>
                  <option value="horizontal">Horizontal (A4 Paisaje)</option>
                </select>
              </div>

              {/* Selector de Tipo de Propiedad */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tipo de Propiedad
                </label>
                <select
                  value={propertyData.propertyType}
                  onChange={(e) =>
                    handlePropertyTypeChange(
                      e.target.value as
                        | "piso"
                        | "casa"
                        | "local"
                        | "garaje"
                        | "solar",
                    )
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2"
                >
                  {Object.keys(mockPropertyData).map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Listing Type Selector */}
              <div>
                <ListingTypeSelector config={config} onChange={updateConfig} />
              </div>

              {/* Localización */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Localización
                </label>
                <select
                  value={`${propertyData.location.city}|${propertyData.location.neighborhood}`}
                  onChange={(e) => {
                    const [city, neighborhood] = e.target.value.split("|");
                    handleLocationChange(city!, neighborhood!);
                  }}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                >
                  {cities.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo de Precio */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Precio ({config.listingType === "alquiler" ? "€/mes" : "€"})
                </label>
                <input
                  type="number"
                  value={propertyData.price}
                  onChange={(e) => handlePriceChange(Number(e.target.value))}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>

              {/* Campo de Metros Cuadrados */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Metros Cuadrados
                </label>
                <input
                  type="number"
                  value={propertyData.specs.squareMeters}
                  onChange={(e) =>
                    handleSquareMetersChange(Number(e.target.value))
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>

              {/* Campo de Habitaciones */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Habitaciones
                </label>
                <input
                  type="number"
                  value={propertyData.specs.bedrooms ?? ""}
                  onChange={(e) =>
                    handleBedroomsChange(
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  placeholder="Opcional"
                />
              </div>

              {/* Campo de Baños */}
              <div>
                <label className="mb-2 block text-sm font-medium">Baños</label>
                <input
                  type="number"
                  value={propertyData.specs.bathrooms ?? ""}
                  onChange={(e) =>
                    handleBathroomsChange(
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  placeholder="Opcional"
                />
              </div>

              {/* Campo de Teléfono */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={propertyData.contact.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>

              {/* Campo de Correo Electrónico */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={propertyData.contact.email ?? ""}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  placeholder="Opcional"
                />
              </div>

              {/* Image Count Selector */}
              <div>
                <ImageCountSelector config={config} onChange={updateConfig} />
              </div>

              {/* Display Toggles */}
              <div>
                <DisplayToggles config={config} onChange={updateConfig} />
              </div>

              {/* Additional Fields Selector */}
              <div>
                <AdditionalFieldsSelector
                  config={config}
                  onChange={updateConfig}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vista Previa de Plantilla */}
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Vista Previa de Plantilla
          </h2>
          <div className="flex justify-center">
            <div
              className={cn(
                "w-full",
                config.orientation === "vertical" ? "max-w-md" : "max-w-lg",
              )}
            >
              <ConfigurableTemplate
                data={propertyData}
                config={config}
                className="border shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
