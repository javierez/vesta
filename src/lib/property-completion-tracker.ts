/**
 * Property Completion Tracker
 * Validates property listing fields and categorizes them by importance
 */

export interface FieldRule {
  id: string;
  label: string; // Spanish user-facing label
  fieldPath: string; // Path in listing object
  importance: "mandatory" | "nth"; // Field importance category
  category: string; // Card/module name
  validator: (value: unknown, listing?: Record<string, unknown>) => boolean;
}

export const fieldRules: FieldRule[] = [
  // ==================== MANDATORY FIELDS ====================
  // Essential for portal publishing (12 fields)

  {
    id: "price",
    label: "Precio",
    fieldPath: "price",
    importance: "mandatory",
    category: "Información Básica",
    validator: (v) => v !== null && v !== undefined && Number(v) > 0,
  },
  {
    id: "listingType",
    label: "Tipo de anuncio",
    fieldPath: "listingType",
    importance: "mandatory",
    category: "Información Básica",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "propertyType",
    label: "Tipo de propiedad",
    fieldPath: "propertyType",
    importance: "mandatory",
    category: "Información Básica",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "squareMeter",
    label: "Superficie",
    fieldPath: "squareMeter",
    importance: "mandatory",
    category: "Detalles de la Propiedad",
    validator: (v) => v !== null && v !== undefined && Number(v) > 0,
  },
  {
    id: "bedrooms",
    label: "Dormitorios",
    fieldPath: "bedrooms",
    importance: "mandatory",
    category: "Detalles de la Propiedad",
    validator: (v) => v !== null && v !== undefined,
  },
  {
    id: "bathrooms",
    label: "Baños",
    fieldPath: "bathrooms",
    importance: "mandatory",
    category: "Detalles de la Propiedad",
    validator: (v) => v !== null && v !== undefined,
  },
  {
    id: "street",
    label: "Calle",
    fieldPath: "street",
    importance: "mandatory",
    category: "Dirección",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "city",
    label: "Ciudad",
    fieldPath: "city",
    importance: "mandatory",
    category: "Dirección",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "province",
    label: "Provincia",
    fieldPath: "province",
    importance: "mandatory",
    category: "Dirección",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "postalCode",
    label: "Código postal",
    fieldPath: "postalCode",
    importance: "mandatory",
    category: "Dirección",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "description",
    label: "Descripción completa",
    fieldPath: "description",
    importance: "mandatory",
    category: "Descripción",
    validator: (v) => {
      if (!v) return false;
      if (typeof v === 'string') return v.trim().length >= 20;
      return false;
    },
  },
  {
    id: "images",
    label: "Imágenes (mínimo 5)",
    fieldPath: "imageCount",
    importance: "mandatory",
    category: "Imágenes",
    validator: (v) => v !== null && v !== undefined && Number(v) >= 5,
  },

  // ==================== NTH FIELDS (Nice to Have) ====================
  // Improves listing quality (~80 fields)

  {
    id: "title",
    label: "Título",
    fieldPath: "title",
    importance: "nth",
    category: "Información Básica",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "shortDescription",
    label: "Descripción corta",
    fieldPath: "shortDescription",
    importance: "nth",
    category: "Descripción",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "propertySubtype",
    label: "Subtipo de propiedad",
    fieldPath: "propertySubtype",
    importance: "nth",
    category: "Información Básica",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "yearBuilt",
    label: "Año de construcción",
    fieldPath: "yearBuilt",
    importance: "nth",
    category: "Detalles de la Propiedad",
    validator: (v) => v !== null && v !== undefined && Number(v) > 1800,
  },
  {
    id: "lastRenovationYear",
    label: "Año de última reforma",
    fieldPath: "lastRenovationYear",
    importance: "nth",
    category: "Detalles de la Propiedad",
    validator: (v) => v !== null && v !== undefined && Number(v) > 1800,
  },
  {
    id: "conservationStatus",
    label: "Estado de conservación",
    fieldPath: "conservationStatus",
    importance: "nth",
    category: "Detalles de la Propiedad",
    validator: (v) => v !== null && v !== undefined,
  },
  {
    id: "buildingFloors",
    label: "Plantas del edificio",
    fieldPath: "buildingFloors",
    importance: "nth",
    category: "Detalles de la Propiedad",
    validator: (v) => v !== null && v !== undefined && Number(v) > 0,
  },
  {
    id: "builtSurfaceArea",
    label: "Superficie construida",
    fieldPath: "builtSurfaceArea",
    importance: "nth",
    category: "Detalles de la Propiedad",
    validator: (v) => v !== null && v !== undefined && Number(v) > 0,
  },
  {
    id: "cadastralReference",
    label: "Referencia catastral",
    fieldPath: "cadastralReference",
    importance: "nth",
    category: "Información Básica",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "newConstruction",
    label: "Obra nueva",
    fieldPath: "newConstruction",
    importance: "nth",
    category: "Información Básica",
    validator: (v) => v === true,
  },
  {
    id: "neighborhood",
    label: "Barrio",
    fieldPath: "neighborhood",
    importance: "nth",
    category: "Dirección",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "municipality",
    label: "Municipio",
    fieldPath: "municipality",
    importance: "nth",
    category: "Dirección",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "addressDetails",
    label: "Detalles de dirección",
    fieldPath: "addressDetails",
    importance: "nth",
    category: "Dirección",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "hasElevator",
    label: "Ascensor",
    fieldPath: "hasElevator",
    importance: "nth",
    category: "Características",
    validator: (v) => v === true,
  },
  {
    id: "hasGarage",
    label: "Garaje",
    fieldPath: "hasGarage",
    importance: "nth",
    category: "Características",
    validator: (v) => v === true,
  },
  {
    id: "garageType",
    label: "Tipo de garaje",
    fieldPath: "garageType",
    importance: "nth",
    category: "Características",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "garageSpaces",
    label: "Plazas de garaje",
    fieldPath: "garageSpaces",
    importance: "nth",
    category: "Características",
    validator: (v) => v !== null && v !== undefined && Number(v) > 0,
  },
  {
    id: "hasStorageRoom",
    label: "Trastero",
    fieldPath: "hasStorageRoom",
    importance: "nth",
    category: "Características",
    validator: (v) => v === true,
  },
  {
    id: "storageRoomSize",
    label: "Tamaño del trastero",
    fieldPath: "storageRoomSize",
    importance: "nth",
    category: "Características",
    validator: (v) => v !== null && v !== undefined && Number(v) > 0,
  },
  {
    id: "hasHeating",
    label: "Calefacción",
    fieldPath: "hasHeating",
    importance: "nth",
    category: "Características",
    validator: (v) => v === true,
  },
  {
    id: "heatingType",
    label: "Tipo de calefacción",
    fieldPath: "heatingType",
    importance: "nth",
    category: "Características",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "hotWaterType",
    label: "Agua caliente",
    fieldPath: "hotWaterType",
    importance: "nth",
    category: "Características",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "airConditioningType",
    label: "Aire acondicionado",
    fieldPath: "airConditioningType",
    importance: "nth",
    category: "Características",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "isFurnished",
    label: "Amueblado",
    fieldPath: "isFurnished",
    importance: "nth",
    category: "Características",
    validator: (v) => v === true,
  },
  {
    id: "exterior",
    label: "Exterior",
    fieldPath: "exterior",
    importance: "nth",
    category: "Orientación",
    validator: (v) => v === true,
  },
  {
    id: "bright",
    label: "Luminoso",
    fieldPath: "bright",
    importance: "nth",
    category: "Orientación",
    validator: (v) => v === true,
  },
  {
    id: "orientation",
    label: "Orientación",
    fieldPath: "orientation",
    importance: "nth",
    category: "Orientación",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "disabledAccessible",
    label: "Accesible para discapacitados",
    fieldPath: "disabledAccessible",
    importance: "nth",
    category: "Características Adicionales",
    validator: (v) => v === true,
  },
  {
    id: "videoIntercom",
    label: "Videoportero",
    fieldPath: "videoIntercom",
    importance: "nth",
    category: "Características Adicionales",
    validator: (v) => v === true,
  },
  {
    id: "alarm",
    label: "Alarma",
    fieldPath: "alarm",
    importance: "nth",
    category: "Características Adicionales",
    validator: (v) => v === true,
  },
  {
    id: "securityDoor",
    label: "Puerta de seguridad",
    fieldPath: "securityDoor",
    importance: "nth",
    category: "Características Adicionales",
    validator: (v) => v === true,
  },
  {
    id: "kitchenType",
    label: "Tipo de cocina",
    fieldPath: "kitchenType",
    importance: "nth",
    category: "Características Adicionales",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
  {
    id: "views",
    label: "Vistas",
    fieldPath: "views",
    importance: "nth",
    category: "Características Premium",
    validator: (v) => v === true,
  },
  {
    id: "mountainViews",
    label: "Vistas a la montaña",
    fieldPath: "mountainViews",
    importance: "nth",
    category: "Características Premium",
    validator: (v) => v === true,
  },
  {
    id: "seaViews",
    label: "Vistas al mar",
    fieldPath: "seaViews",
    importance: "nth",
    category: "Características Premium",
    validator: (v) => v === true,
  },
  {
    id: "pool",
    label: "Piscina",
    fieldPath: "pool",
    importance: "nth",
    category: "Características Premium",
    validator: (v) => v === true,
  },
  {
    id: "garden",
    label: "Jardín",
    fieldPath: "garden",
    importance: "nth",
    category: "Características Premium",
    validator: (v) => v === true,
  },
  {
    id: "terrace",
    label: "Terraza",
    fieldPath: "terrace",
    importance: "nth",
    category: "Espacios Adicionales",
    validator: (v) => v === true,
  },
  {
    id: "terraceSize",
    label: "Tamaño de terraza",
    fieldPath: "terraceSize",
    importance: "nth",
    category: "Espacios Adicionales",
    validator: (v) => v !== null && v !== undefined && Number(v) > 0,
  },
  {
    id: "balconyCount",
    label: "Número de balcones",
    fieldPath: "balconyCount",
    importance: "nth",
    category: "Espacios Adicionales",
    validator: (v) => v !== null && v !== undefined && Number(v) > 0,
  },
  {
    id: "builtInWardrobes",
    label: "Armarios empotrados",
    fieldPath: "builtInWardrobes",
    importance: "nth",
    category: "Espacios Adicionales",
    validator: (v) => v === true,
  },
  {
    id: "mainFloorType",
    label: "Tipo de suelo",
    fieldPath: "mainFloorType",
    importance: "nth",
    category: "Materiales",
    validator: (v) => !!v && typeof v === 'string' && v.trim().length > 0,
  },
];

export interface CompletionResult {
  mandatory: {
    completed: Array<FieldRule & { isCompleted: boolean }>;
    pending: Array<FieldRule & { isCompleted: boolean }>;
    total: number;
    completedCount: number;
  };
  nth: {
    completed: Array<FieldRule & { isCompleted: boolean }>;
    pending: Array<FieldRule & { isCompleted: boolean }>;
    total: number;
    completedCount: number;
  };
  overallPercentage: number;
  overallCompleted: number;
  overallTotal: number;
  canPublishToPortals: boolean;
}

export function calculateCompletion(listing: Record<string, unknown>): CompletionResult {
  const mandatory = {
    completed: [] as Array<FieldRule & { isCompleted: boolean }>,
    pending: [] as Array<FieldRule & { isCompleted: boolean }>,
    total: 0,
    completedCount: 0,
  };

  const nth = {
    completed: [] as Array<FieldRule & { isCompleted: boolean }>,
    pending: [] as Array<FieldRule & { isCompleted: boolean }>,
    total: 0,
    completedCount: 0,
  };

  // If no listing data, return empty result
  if (!listing) {
    return {
      mandatory,
      nth,
      overallPercentage: 0,
      overallCompleted: 0,
      overallTotal: fieldRules.length,
      canPublishToPortals: false,
    };
  }

  fieldRules.forEach((rule) => {
    const fieldValue = listing[rule.fieldPath];
    const isValid = rule.validator(fieldValue, listing);
    const fieldInfo = { ...rule, isCompleted: isValid };

    if (rule.importance === "mandatory") {
      mandatory.total++;
      if (isValid) {
        mandatory.completed.push(fieldInfo);
        mandatory.completedCount++;
      } else {
        mandatory.pending.push(fieldInfo);
      }
    } else {
      nth.total++;
      if (isValid) {
        nth.completed.push(fieldInfo);
        nth.completedCount++;
      } else {
        nth.pending.push(fieldInfo);
      }
    }
  });

  const overallCompleted = mandatory.completedCount + nth.completedCount;
  const overallTotal = mandatory.total + nth.total;

  return {
    mandatory,
    nth,
    overallPercentage: overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0,
    overallCompleted,
    overallTotal,
    canPublishToPortals: mandatory.pending.length === 0,
  };
}