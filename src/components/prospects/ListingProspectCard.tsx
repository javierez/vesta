"use client";

import {
  Home,
  MapPin,
  Euro,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import type { DualProspectOperationCard } from "~/types/dual-prospects";

interface ListingProspectCardProps {
  card: DualProspectOperationCard;
}

// Status color configurations
const VALUATION_STATUS_COLORS = {
  Pendiente: "bg-gray-100 text-gray-800 border-gray-200",
  Programada: "bg-blue-100 text-blue-800 border-blue-200",
  Completada: "bg-green-100 text-green-800 border-green-200",
} as const;

const AGREEMENT_STATUS_COLORS = {
  "No iniciado": "bg-gray-100 text-gray-800 border-gray-200",
  "En progreso": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Firmado: "bg-green-100 text-green-800 border-green-200",
} as const;

const URGENCY_CONFIG = {
  1: { color: "bg-green-100 text-green-800 border-green-200", label: "Baja" },
  2: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    label: "Media",
  },
  3: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    label: "Media-Alta",
  },
  4: { color: "bg-red-100 text-red-800 border-red-200", label: "Alta" },
  5: { color: "bg-red-200 text-red-900 border-red-300", label: "Urgente" },
} as const;

export default function ListingProspectCard({
  card,
}: ListingProspectCardProps) {
  // Format currency for Spanish locale
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-3">
      {/* Header with home icon and contact name */}
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-green-100 p-1.5">
          <Home className="h-4 w-4 text-green-600" />
        </div>
        <span className="font-medium text-gray-900">
          {card.contactName ?? "Contacto sin nombre"}
        </span>
      </div>

      {/* Property address */}
      {card.propertyAddress && (
        <div className="rounded-lg border border-green-100 bg-green-50 p-3">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Propiedad:</p>
              <p className="mt-0.5 line-clamp-2 text-sm text-green-700">
                {card.propertyAddress}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estimated value */}
      {card.estimatedValue && (
        <div className="flex items-center gap-2">
          <Euro className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium">
            <span className="text-gray-500">Valor estimado:</span>{" "}
            <span className="font-semibold text-green-600">
              {formatCurrency(card.estimatedValue)}
            </span>
          </span>
        </div>
      )}

      {/* Property condition */}
      {card.propertyCondition && (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-700">
            <span className="text-gray-500">Estado:</span>{" "}
            {card.propertyCondition}
          </span>
        </div>
      )}

      {/* Valuation status */}
      {card.valuationStatus && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Valoración:
            </span>
            <Badge
              variant="secondary"
              className={
                VALUATION_STATUS_COLORS[
                  card.valuationStatus as keyof typeof VALUATION_STATUS_COLORS
                ] || VALUATION_STATUS_COLORS.Pendiente
              }
            >
              {card.valuationStatus}
            </Badge>
          </div>
        </div>
      )}

      {/* Listing agreement status */}
      {card.listingAgreementStatus && (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Hoja encargo:
            </span>
            <Badge
              variant="secondary"
              className={
                AGREEMENT_STATUS_COLORS[
                  card.listingAgreementStatus as keyof typeof AGREEMENT_STATUS_COLORS
                ] || AGREEMENT_STATUS_COLORS["No iniciado"]
              }
            >
              {card.listingAgreementStatus}
            </Badge>
          </div>
        </div>
      )}

      {/* Urgency level */}
      {card.urgencyLevel && (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-gray-400" />
          <Badge
            variant="secondary"
            className={
              URGENCY_CONFIG[card.urgencyLevel as keyof typeof URGENCY_CONFIG]
                ?.color || URGENCY_CONFIG[1].color
            }
          >
            Prioridad{" "}
            {URGENCY_CONFIG[card.urgencyLevel as keyof typeof URGENCY_CONFIG]
              ?.label || "Baja"}
          </Badge>
        </div>
      )}

      {/* Next task for listing prospects */}
      {card.nextTask && (
        <div className="rounded border border-blue-100 bg-blue-50 p-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Próximo:</span>
          </div>
          <p className="mt-1 text-xs text-blue-700">{card.nextTask}</p>
        </div>
      )}

      {/* Contact information */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>Prospecto de listado</span>
        </div>
        {card.lastActivity && (
          <span>
            {new Intl.DateTimeFormat("es-ES", {
              month: "short",
              day: "numeric",
            }).format(card.lastActivity)}
          </span>
        )}
      </div>
    </div>
  );
}
