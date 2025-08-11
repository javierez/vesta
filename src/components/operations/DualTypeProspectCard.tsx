"use client";

import React from "react";
import type { DualProspectOperationCard } from "~/types/dual-prospects";
import SearchProspectCard from "~/components/prospects/SearchProspectCard";
import ListingProspectCard from "~/components/prospects/ListingProspectCard";

interface DualTypeProspectCardProps {
  card: DualProspectOperationCard;
}

// Memoized component for performance optimization during drag operations
const DualTypeProspectCard = React.memo(function DualTypeProspectCard({
  card,
}: DualTypeProspectCardProps) {
  // Type discrimination based on prospectType
  if (card.prospectType === "search") {
    return <SearchProspectCard card={card} />;
  }

  if (card.prospectType === "listing") {
    return <ListingProspectCard card={card} />;
  }

  // Fallback for unknown prospect types
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-900">
          {card.contactName ?? "Contacto sin nombre"}
        </span>
      </div>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="text-sm text-gray-600">
          Tipo de prospecto desconocido: {card.prospectType}
        </p>
      </div>
    </div>
  );
});

export default DualTypeProspectCard;
