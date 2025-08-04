"use client";

import type { FC } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Building2,
  Home,
  Store,
  Car,
  TreePine,
  MapPin,
  Users,
  Building,
} from "lucide-react";
import type { PropertyTypeSelectorProps } from "~/types/carteleria";
import { propertyTypes } from "~/lib/carteleria/templates";

// Icon mapping for property types
const iconMap = {
  Building2: Building2,
  Home: Home,
  Store: Store,
  Car: Car,
  TreePine: TreePine,
  MapPin: MapPin,
  Users: Users,
  Building: Building,
};

const categoryIcons = {
  residential: Home,
  commercial: Building,
  land: TreePine,
};

const categoryLabels = {
  residential: "Residencial",
  commercial: "Comercial",
  land: "Terrenos",
};

export const PropertyTypeSelector: FC<PropertyTypeSelectorProps> = ({
  selectedPropertyTypeIds,
  onPropertyTypeToggle,
  propertyTypes: propTypes = propertyTypes,
}) => {
  const residentialTypes = propTypes.filter(
    (pt) => pt.category === "residential",
  );
  const commercialTypes = propTypes.filter(
    (pt) => pt.category === "commercial",
  );
  const landTypes = propTypes.filter((pt) => pt.category === "land");

  const categories = [
    {
      key: "residential",
      label: categoryLabels.residential,
      types: residentialTypes,
      icon: categoryIcons.residential,
    },
    {
      key: "commercial",
      label: categoryLabels.commercial,
      types: commercialTypes,
      icon: categoryIcons.commercial,
    },
    {
      key: "land",
      label: categoryLabels.land,
      types: landTypes,
      icon: categoryIcons.land,
    },
  ].filter((category) => category.types.length > 0);

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Tipos de Propiedad</h2>
        <p className="text-gray-600">
          Selecciona los tipos de propiedades para los que necesitas carteles
        </p>
      </div>

      {categories.map((category) => {
        const CategoryIcon = category.icon;
        return (
          <div key={category.key} className="space-y-4">
            <div className="flex items-center gap-2">
              <CategoryIcon className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">
                {category.label}
              </h3>
              <Badge variant="secondary" className="ml-2">
                {category.types.length} tipo
                {category.types.length > 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {category.types.map((propertyType) => (
                <PropertyTypeCard
                  key={propertyType.id}
                  propertyType={propertyType}
                  isSelected={selectedPropertyTypeIds.includes(propertyType.id)}
                  onToggle={() => onPropertyTypeToggle(propertyType.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Selection Summary */}
      {selectedPropertyTypeIds.length > 0 && (
        <div className="mt-6 rounded-lg border border-primary/20 bg-primary/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-medium text-primary">
              {selectedPropertyTypeIds.length} tipo
              {selectedPropertyTypeIds.length > 1 ? "s" : ""} seleccionado
              {selectedPropertyTypeIds.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedPropertyTypeIds.map((propertyTypeId) => {
              const propertyType = propTypes.find(
                (pt) => pt.id === propertyTypeId,
              );
              return propertyType ? (
                <Badge
                  key={propertyTypeId}
                  variant="outline"
                  className="text-xs"
                >
                  {propertyType.name}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface PropertyTypeCardProps {
  propertyType: (typeof propertyTypes)[0];
  isSelected: boolean;
  onToggle: () => void;
}

const PropertyTypeCard: FC<PropertyTypeCardProps> = ({
  propertyType,
  isSelected,
  onToggle,
}) => {
  // Get the appropriate icon component
  const IconComponent =
    iconMap[propertyType.icon as keyof typeof iconMap] || Building2;

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? "bg-primary/5 shadow-md ring-2 ring-primary"
          : "hover:bg-gray-50"
      }`}
      onClick={onToggle}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg p-2 ${
                isSelected
                  ? "bg-primary/20 text-primary"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">{propertyType.name}</CardTitle>
          </div>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            className="mt-1"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <CardDescription className="text-sm leading-relaxed">
          {propertyType.description}
        </CardDescription>

        {/* Default Fields Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Campos por defecto:</span>
            <Badge variant="outline" className="text-xs">
              {propertyType.defaultFields.length} campos
            </Badge>
          </div>

          {/* Show sample of default fields */}
          <div className="flex flex-wrap gap-1">
            {propertyType.defaultFields.slice(0, 3).map((field) => (
              <Badge
                key={field.id}
                variant="secondary"
                className="px-2 py-1 text-xs"
              >
                {field.name}
              </Badge>
            ))}
            {propertyType.defaultFields.length > 3 && (
              <Badge variant="secondary" className="px-2 py-1 text-xs">
                +{propertyType.defaultFields.length - 3} más
              </Badge>
            )}
          </div>
        </div>

        {/* Category Badge */}
        <div className="border-t border-gray-100 pt-2">
          <Badge
            variant="outline"
            className={`text-xs capitalize ${
              propertyType.category === "residential"
                ? "border-blue-200 text-blue-700"
                : propertyType.category === "commercial"
                  ? "border-green-200 text-green-700"
                  : "border-orange-200 text-orange-700"
            }`}
          >
            {categoryLabels[propertyType.category]}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
