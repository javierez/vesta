import type {
  DualProspect,
  SearchProspect,
  ListingProspect,
  ProspectSummary,
  DualProspectOperationCard,
} from "~/types/dual-prospects";
import {
  isSearchProspect,
  isListingProspect,
  VALUATION_STATUS_TRANSLATIONS,
  LISTING_AGREEMENT_STATUS_TRANSLATIONS,
} from "~/types/dual-prospects";

// Prospect type detection utilities
export function getProspectTypeDetails(prospect: DualProspect) {
  if (isSearchProspect(prospect)) {
    return {
      type: "search" as const,
      icon: "🔍",
      label: "Búsqueda",
      description: "Buscando propiedad",
      color: "blue",
    };
  }

  return {
    type: "listing" as const,
    icon: "🏠",
    label: "Listado",
    description: "Quiere vender/alquilar",
    color: "green",
  };
}

// Build prospect summary for card descriptions
export function buildProspectSummary(prospect: DualProspect): ProspectSummary {
  if (isSearchProspect(prospect)) {
    return buildSearchProspectSummary(prospect);
  }

  return buildListingProspectSummary(prospect);
}

function buildSearchProspectSummary(prospect: SearchProspect): ProspectSummary {
  const parts: string[] = [];

  // Property type
  if (prospect.propertyType) {
    parts.push(prospect.propertyType);
  }

  // Price range
  if (prospect.minPrice || prospect.maxPrice) {
    const min = prospect.minPrice
      ? formatCurrency(prospect.minPrice)
      : "Sin mín";
    const max = prospect.maxPrice
      ? formatCurrency(prospect.maxPrice)
      : "Sin máx";
    parts.push(`${min} - ${max}`);
  }

  // Bedrooms
  if (prospect.minBedrooms) {
    parts.push(`${prospect.minBedrooms}+ habitaciones`);
  }

  // Areas
  if (prospect.preferredAreas && prospect.preferredAreas.length > 0) {
    const areas = prospect.preferredAreas
      .slice(0, 2)
      .map((area) => area.name)
      .join(", ");
    const moreCount = prospect.preferredAreas.length - 2;
    parts.push(moreCount > 0 ? `${areas} (+${moreCount} más)` : areas);
  }

  const title = `Busca ${prospect.listingType === "Sale" ? "comprar" : "alquilar"}`;
  const description = parts.join(" • ") || "Sin criterios específicos";

  return {
    title,
    description,
    priority: getUrgencyPriority(prospect.urgencyLevel),
    tags: buildSearchProspectTags(prospect),
  };
}

function buildListingProspectSummary(
  prospect: ListingProspect,
): ProspectSummary {
  const parts: string[] = [];

  if (prospect.propertyToList) {
    const property = prospect.propertyToList;

    // Property type and address
    if (property.propertyType) {
      parts.push(property.propertyType);
    }

    if (property.address) {
      parts.push(property.address);
    }

    // Estimated value
    if (property.estimatedValue) {
      parts.push(formatCurrency(property.estimatedValue));
    }

    // Property details
    const details: string[] = [];
    if (property.bedrooms) details.push(`${property.bedrooms} hab`);
    if (property.bathrooms) details.push(`${property.bathrooms} baños`);
    if (property.squareMeters) details.push(`${property.squareMeters} m²`);

    if (details.length > 0) {
      parts.push(`(${details.join(", ")})`);
    }
  }

  const title = `Quiere ${prospect.listingType === "Sale" ? "vender" : "alquilar"}`;
  const description = parts.join(" • ") || "Propiedad sin detalles";

  return {
    title,
    description,
    priority: getUrgencyPriority(prospect.urgencyLevel),
    tags: buildListingProspectTags(prospect),
  };
}

function buildSearchProspectTags(prospect: SearchProspect): string[] {
  const tags: string[] = [];

  if (prospect.fundingReady) {
    tags.push("Financiación lista");
  }

  if (prospect.moveInBy) {
    const daysUntil = Math.ceil(
      (prospect.moveInBy.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (daysUntil <= 30) {
      tags.push("Urgente");
    }
  }

  if (prospect.extras && Object.keys(prospect.extras).length > 0) {
    const essentials = Object.entries(prospect.extras)
      .filter(([_, required]) => required)
      .map(([feature, _]) => feature);

    if (essentials.length > 0) {
      tags.push(`${essentials.length} requisitos`);
    }
  }

  return tags;
}

function buildListingProspectTags(prospect: ListingProspect): string[] {
  const tags: string[] = [];

  if (prospect.valuationStatus) {
    const status = VALUATION_STATUS_TRANSLATIONS[prospect.valuationStatus];
    tags.push(`Valoración: ${status}`);
  }

  if (
    prospect.listingAgreementStatus &&
    prospect.listingAgreementStatus !== "not_started"
  ) {
    const status =
      LISTING_AGREEMENT_STATUS_TRANSLATIONS[prospect.listingAgreementStatus];
    tags.push(`Encargo: ${status}`);
  }

  if (prospect.propertyToList?.readyToList) {
    tags.push("Lista para publicar");
  }

  if (prospect.propertyToList?.condition) {
    tags.push(`Estado: ${prospect.propertyToList.condition}`);
  }

  return tags;
}

// Convert dual prospect to operation card format
export function convertToOperationCard(
  prospect: DualProspect,
): DualProspectOperationCard {
  const summary = buildProspectSummary(prospect);

  const baseCard: DualProspectOperationCard = {
    id: prospect.id,
    type: "prospect",
    status: prospect.status,
    listingType: prospect.listingType,
    prospectType: prospect.prospectType,
    contactName: prospect.contactName,
    contactEmail: prospect.contactEmail,
    contactPhone: prospect.contactPhone,
    urgencyLevel: prospect.urgencyLevel,
    lastActivity: prospect.updatedAt,
    nextTask: generateNextTask(prospect),
  };

  if (isSearchProspect(prospect)) {
    return {
      ...baseCard,
      needSummary: summary.description,
      budgetRange: formatBudgetRange(prospect.minPrice, prospect.maxPrice),
      preferredAreasText: formatPreferredAreas(prospect.preferredAreas),
    };
  }

  if (isListingProspect(prospect)) {
    return {
      ...baseCard,
      propertyAddress: prospect.propertyToList?.address,
      estimatedValue: prospect.propertyToList?.estimatedValue,
      valuationStatus: prospect.valuationStatus
        ? VALUATION_STATUS_TRANSLATIONS[prospect.valuationStatus]
        : undefined,
      listingAgreementStatus: prospect.listingAgreementStatus
        ? LISTING_AGREEMENT_STATUS_TRANSLATIONS[prospect.listingAgreementStatus]
        : undefined,
      propertyCondition: prospect.propertyToList?.condition,
    };
  }

  return baseCard;
}

// Generate next task recommendations based on prospect status and type
function generateNextTask(prospect: DualProspect): string | undefined {
  if (isSearchProspect(prospect)) {
    switch (prospect.status) {
      case "Información básica":
        return "Completar criterios de búsqueda";
      case "En búsqueda":
        return prospect.preferredAreas?.length
          ? "Buscar propiedades coincidentes"
          : "Definir zonas preferidas";
      default:
        return "Seguimiento con cliente";
    }
  }

  if (isListingProspect(prospect)) {
    switch (prospect.status) {
      case "Información básica":
        return "Agendar visita para valoración";
      case "Valoración":
        switch (prospect.valuationStatus) {
          case "pending":
            return "Programar valoración";
          case "scheduled":
            return "Realizar valoración";
          case "completed":
            return "Preparar hoja de encargo";
          default:
            return "Contactar para valoración";
        }
      case "Hoja de encargo":
        return prospect.listingAgreementStatus === "signed"
          ? "Preparar propiedad para listado"
          : "Firmar hoja de encargo";
      case "En búsqueda":
        return "Preparar marketing y publicación";
      default:
        return "Seguimiento con cliente";
    }
  }

  return "Revisar estado del prospecto";
}

// Utility functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatBudgetRange(
  minPrice?: number,
  maxPrice?: number,
): string | undefined {
  if (!minPrice && !maxPrice) return undefined;

  const min = minPrice ? formatCurrency(minPrice) : "Sin mínimo";
  const max = maxPrice ? formatCurrency(maxPrice) : "Sin máximo";

  return `${min} - ${max}`;
}

function formatPreferredAreas(
  areas?: Array<{ neighborhoodId: bigint; name: string }>,
): string | undefined {
  if (!areas || areas.length === 0) return undefined;

  if (areas.length <= 3) {
    return areas.map((area) => area.name).join(", ");
  }

  const first = areas
    .slice(0, 2)
    .map((area) => area.name)
    .join(", ");
  const remaining = areas.length - 2;

  return `${first} (+${remaining} más)`;
}

function getUrgencyPriority(urgencyLevel?: number): "high" | "medium" | "low" {
  if (!urgencyLevel) return "low";

  if (urgencyLevel >= 4) return "high";
  if (urgencyLevel >= 3) return "medium";
  return "low";
}

// Prospect matching utilities for recommendations
export function calculateProspectMatchScore(
  searchProspect: SearchProspect,
  listingProspect: ListingProspect,
): number {
  let score = 0;

  // Listing type match (must match)
  if (searchProspect.listingType !== listingProspect.listingType) {
    return 0;
  }
  score += 30;

  // Property type match
  if (
    searchProspect.propertyType === listingProspect.propertyToList?.propertyType
  ) {
    score += 20;
  }

  // Price range match
  if (listingProspect.propertyToList?.estimatedValue) {
    const propertyValue = listingProspect.propertyToList.estimatedValue;
    const minPrice = searchProspect.minPrice ?? 0;
    const maxPrice = searchProspect.maxPrice ?? Infinity;

    if (propertyValue >= minPrice && propertyValue <= maxPrice) {
      score += 25;
    }
  }

  // Bedrooms match
  if (searchProspect.minBedrooms && listingProspect.propertyToList?.bedrooms) {
    if (listingProspect.propertyToList.bedrooms >= searchProspect.minBedrooms) {
      score += 15;
    }
  }

  // Square meters match
  if (
    searchProspect.minSquareMeters &&
    listingProspect.propertyToList?.squareMeters
  ) {
    if (
      listingProspect.propertyToList.squareMeters >=
      searchProspect.minSquareMeters
    ) {
      score += 10;
    }
  }

  return Math.min(100, score);
}

// Utility for filtering prospects by multiple criteria
export function filterProspects<T extends DualProspect>(
  prospects: T[],
  filters: {
    prospectType?: "search" | "listing" | "all";
    listingType?: "Sale" | "Rent" | "all";
    urgencyLevel?: number;
    status?: string;
    searchQuery?: string;
  },
): T[] {
  return prospects.filter((prospect) => {
    // Prospect type filter
    if (filters.prospectType && filters.prospectType !== "all") {
      if (prospect.prospectType !== filters.prospectType) return false;
    }

    // Listing type filter
    if (filters.listingType && filters.listingType !== "all") {
      if (prospect.listingType !== filters.listingType) return false;
    }

    // Urgency level filter (minimum level)
    if (filters.urgencyLevel && prospect.urgencyLevel) {
      if (prospect.urgencyLevel < filters.urgencyLevel) return false;
    }

    // Status filter
    if (filters.status) {
      if (prospect.status !== filters.status) return false;
    }

    // Search query filter (searches in contact name and notes)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = [
        prospect.contactName,
        prospect.notesInternal,
        isListingProspect(prospect) ? prospect.propertyToList?.address : "",
        isSearchProspect(prospect)
          ? prospect.preferredAreas?.map((a) => a.name).join(" ")
          : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(query)) return false;
    }

    return true;
  });
}
