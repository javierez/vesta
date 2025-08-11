"use client";

import {
  Search,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import type { DualProspectOperationCard } from "~/types/dual-prospects";

interface SearchProspectCardProps {
  card: DualProspectOperationCard;
}

// Urgency level colors and labels
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

export default function SearchProspectCard({ card }: SearchProspectCardProps) {
  // Format currency for Spanish locale
  return (
    <div className="space-y-3">
      {/* Header with search icon and contact name */}
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-blue-100 p-1.5">
          <Search className="h-4 w-4 text-blue-600" />
        </div>
        <span className="font-medium text-gray-900">
          {card.contactName ?? "Contacto sin nombre"}
        </span>
      </div>

      {/* Need summary - what they're looking for */}
      {card.needSummary && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
          <p className="text-sm font-medium text-blue-800">Busca:</p>
          <p className="mt-1 line-clamp-2 text-sm text-blue-700">
            {card.needSummary}
          </p>
        </div>
      )}

      {/* Budget range */}
      {card.budgetRange && (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-green-600">
            {card.budgetRange}
          </span>
        </div>
      )}

      {/* Preferred areas */}
      {card.preferredAreasText && (
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Zonas preferidas
            </span>
            <p className="mt-0.5 line-clamp-2 text-sm text-gray-700">
              {card.preferredAreasText}
            </p>
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

      {/* Next task for search prospects */}
      {card.nextTask && (
        <div className="rounded border border-yellow-100 bg-yellow-50 p-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-700">
              Próximo:
            </span>
          </div>
          <p className="mt-1 text-xs text-yellow-700">{card.nextTask}</p>
        </div>
      )}

      {/* Contact information */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>Prospecto de búsqueda</span>
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
