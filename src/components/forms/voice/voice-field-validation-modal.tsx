"use client";

import { useState } from "react";
import { Check, X, Edit3, Eye, EyeOff, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import type { ExtractedFieldResult, EnhancedExtractedPropertyData } from "~/types/textract-enhanced";

// Spanish field labels mapping
const FIELD_LABELS: Record<string, string> = {
  // Basic Information
  title: "Título",
  description: "Descripción",
  propertyType: "Tipo de Propiedad",
  propertySubtype: "Subtipo",

  // Specifications
  bedrooms: "Dormitorios",
  bathrooms: "Baños",
  squareMeter: "Metros Cuadrados",
  yearBuilt: "Año de Construcción",
  builtSurfaceArea: "Superficie Construida",
  conservationStatus: "Estado de Conservación",

  // Location
  street: "Dirección",
  addressDetails: "Detalles de Dirección",
  postalCode: "Código Postal",

  // Energy
  energyConsumptionScale: "Certificado Energético",
  energyConsumptionValue: "Consumo Energético",
  emissionsScale: "Escala de Emisiones",

  // Basic Amenities
  hasElevator: "Ascensor",
  hasGarage: "Garaje",
  hasStorageRoom: "Trastero",

  // Features
  terrace: "Terraza",
  pool: "Piscina",
  garden: "Jardín",
  gym: "Gimnasio",
  communityPool: "Piscina Comunitaria",

  // Property Condition
  furnished: "Amueblado",
  brandNew: "Nuevo",
  needsRenovation: "Necesita Reforma",

  // Kitchen
  kitchenType: "Tipo de Cocina",
  openKitchen: "Cocina Abierta",
  furnishedKitchen: "Cocina Amueblada",

  // Pricing (listings table)
  price: "Precio",
  listingType: "Tipo de Operación",
  isFurnished: "Amueblado",

  // Additional
  orientation: "Orientación",
  airConditioningType: "Aire Acondicionado",
};

// Field categories for better organization
const FIELD_CATEGORIES = {
  basic: {
    label: "Información Básica",
    fields: ["title", "description", "propertyType", "propertySubtype"],
    icon: "🏠",
  },
  specifications: {
    label: "Especificaciones",
    fields: ["bedrooms", "bathrooms", "squareMeter", "builtSurfaceArea", "yearBuilt"],
    icon: "📐",
  },
  location: {
    label: "Ubicación",
    fields: ["street", "addressDetails", "postalCode"],
    icon: "📍",
  },
  pricing: {
    label: "Precio",
    fields: ["price", "listingType"],
    icon: "💰",
  },
  features: {
    label: "Características",
    fields: ["hasElevator", "hasGarage", "hasStorageRoom", "terrace", "pool", "garden", "furnished", "airConditioningType"],
    icon: "✨",
  },
  technical: {
    label: "Información Técnica",
    fields: ["energyConsumptionScale", "conservationStatus", "orientation"],
    icon: "🔧",
  },
};

interface VoiceFieldValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedFields: ExtractedFieldResult[];
  onConfirm: (confirmedData: EnhancedExtractedPropertyData) => void;
  onRetry: () => void;
  onManualEntry: () => void;
}

export function VoiceFieldValidationModal({
  isOpen,
  onClose,
  extractedFields,
  onConfirm,
  onRetry,
  onManualEntry,
}: VoiceFieldValidationModalProps) {
  const [editableFields, setEditableFields] = useState<ExtractedFieldResult[]>(extractedFields);
  const [showLowConfidence, setShowLowConfidence] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);

  // Filter fields by confidence
  const filteredFields = showLowConfidence 
    ? editableFields 
    : editableFields.filter(field => field.confidence >= 60);

  // Group fields by category
  const groupedFields = Object.entries(FIELD_CATEGORIES).map(([key, category]) => {
    const categoryFields = filteredFields.filter(field => 
      category.fields.includes(field.dbColumn)
    );
    return {
      ...category,
      key,
      fields: categoryFields,
    };
  }).filter(category => category.fields.length > 0);


  // Get confidence badge variant
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return "default";
    if (confidence >= 60) return "secondary";
    return "destructive";
  };

  // Format field value for display
  const formatFieldValue = (field: ExtractedFieldResult) => {
    if (typeof field.value === "boolean") {
      return field.value ? "Sí" : "No";
    }
    if (field.dbColumn === "price" && typeof field.value === "number") {
      return field.value.toLocaleString("es-ES", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
      });
    }
    if ((field.dbColumn === "squareMeter" || field.dbColumn === "builtSurfaceArea") && typeof field.value === "number") {
      return `${field.value} m²`;
    }
    return String(field.value);
  };

  // Handle field edit
  const handleFieldEdit = (fieldId: string, newValue: string) => {
    setEditableFields(prev =>
      prev.map(field => {
        if (`${field.dbTable}.${field.dbColumn}` === fieldId) {
          let convertedValue: string | number | boolean = newValue;
          
          // Convert based on field type
          if (field.fieldType === "number") {
            convertedValue = parseFloat(newValue) || 0;
          } else if (field.fieldType === "boolean") {
            convertedValue = newValue.toLowerCase() === "sí" || newValue.toLowerCase() === "si";
          }

          return {
            ...field,
            value: convertedValue,
          };
        }
        return field;
      })
    );
  };

  // Remove field
  const handleRemoveField = (fieldId: string) => {
    setEditableFields(prev =>
      prev.filter(field => `${field.dbTable}.${field.dbColumn}` !== fieldId)
    );
  };

  // Build final data object
  const buildConfirmedData = (): EnhancedExtractedPropertyData => {
    const data: EnhancedExtractedPropertyData = {};
    editableFields.forEach(field => {
      if (field.dbTable === "properties") {
        (data as Record<string, unknown>)[field.dbColumn] = field.value;
      }
    });
    return data;
  };

  // Handle confirm
  const handleConfirm = () => {
    const confirmedData = buildConfirmedData();
    onConfirm(confirmedData);
  };

  // Statistics
  const stats = {
    total: editableFields.length,
    highConfidence: editableFields.filter(f => f.confidence >= 80).length,
    mediumConfidence: editableFields.filter(f => f.confidence >= 60 && f.confidence < 80).length,
    lowConfidence: editableFields.filter(f => f.confidence < 60).length,
    avgConfidence: editableFields.length > 0 
      ? Math.round(editableFields.reduce((sum, f) => sum + f.confidence, 0) / editableFields.length)
      : 0,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-400 to-rose-400 text-white p-2 rounded-lg">
              🎤
            </div>
            <div>
              <div className="text-xl font-semibold">Datos Extraídos de Grabación</div>
              <div className="text-sm text-gray-600 font-normal">
                Revisa y confirma la información detectada automáticamente
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Statistics Bar */}
        <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-4 text-sm">
              <span className="font-medium">Total: {stats.total} campos</span>
              <span className="font-medium">Confianza promedio: {stats.avgConfidence}%</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLowConfidence(!showLowConfidence)}
                className="h-8 px-3"
              >
                {showLowConfidence ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showLowConfidence ? "Ocultar baja confianza" : "Mostrar todos"}
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200">
              Alta: {stats.highConfidence}
            </Badge>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200">
              Media: {stats.mediumConfidence}
            </Badge>
            <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200">
              Baja: {stats.lowConfidence}
            </Badge>
          </div>
        </div>

        {/* Fields by Category */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {groupedFields.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron campos que mostrar</p>
              <p className="text-sm text-gray-500 mt-2">
                {showLowConfidence ? "No hay campos extraídos" : "Todos los campos tienen baja confianza"}
              </p>
            </div>
          ) : (
            groupedFields.map((category) => (
              <Card key={category.key} className="border-gray-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{category.icon}</span>
                    <h3 className="font-semibold text-gray-900">{category.label}</h3>
                    <Badge variant="outline" className="ml-auto">
                      {category.fields.length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {category.fields.map((field) => {
                      const fieldId = `${field.dbTable}.${field.dbColumn}`;
                      const isEditing = editingField === fieldId;
                      return (
                        <div
                          key={fieldId}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Label className="text-sm font-medium text-gray-700">
                                {FIELD_LABELS[field.dbColumn] ?? field.dbColumn}
                              </Label>
                              <Badge
                                variant={getConfidenceBadge(field.confidence)}
                                className="h-5 text-xs"
                              >
                                {Math.round(field.confidence)}%
                              </Badge>
                              <Badge variant="outline" className="h-5 text-xs">
                                {field.extractionSource === "gpt4" ? "IA" : "Patrón"}
                              </Badge>
                            </div>
                            {isEditing ? (
                              <Input
                                value={String(field.value)}
                                onChange={(e) => handleFieldEdit(fieldId, e.target.value)}
                                onBlur={() => setEditingField(null)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") setEditingField(null);
                                  if (e.key === "Escape") setEditingField(null);
                                }}
                                autoFocus
                                className="h-8"
                              />
                            ) : (
                              <div className="font-medium text-gray-900">
                                {formatFieldValue(field)}
                              </div>
                            )}
                            {field.originalText && (
                              <div className="text-xs text-gray-500 mt-1 truncate">
                                &quot;{field.originalText}&quot;
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingField(isEditing ? null : fieldId)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveField(fieldId)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Separator />

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-1">
            <Button
              variant="outline"
              onClick={onRetry}
              className="flex-1 sm:flex-initial"
            >
              🎤 Volver a Grabar
            </Button>
            <Button
              variant="outline"
              onClick={onManualEntry}
              className="flex-1 sm:flex-initial"
            >
              ✏️ Entrada Manual
            </Button>
          </div>
          <Button
            onClick={handleConfirm}
            disabled={editableFields.length === 0}
            className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white flex-1 sm:flex-initial"
          >
            <Check className="h-4 w-4 mr-2" />
            Confirmar y Continuar ({stats.total} campos)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}