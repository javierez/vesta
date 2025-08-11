"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import SearchProspectCard from "./SearchProspectCard";
import ListingProspectCard from "./ListingProspectCard";
import type { DualProspect } from "~/types/dual-prospects";

interface ProspectKanbanCardProps {
  prospect: DualProspect;
}

export function ProspectKanbanCard({ prospect }: ProspectKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: prospect.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
    >
      <Card
        className={`transition-all duration-200 hover:shadow-md ${isDragging ? "shadow-lg" : ""}`}
      >
        <CardContent className="p-4">
          {/* Prospect Type Badge */}
          <div className="mb-3 flex items-start justify-between">
            <Badge
              variant="outline"
              className={`text-xs ${
                prospect.prospectType === "search"
                  ? "border-blue-200 bg-blue-50 text-blue-600"
                  : "border-green-200 bg-green-50 text-green-600"
              }`}
            >
              {prospect.prospectType === "search"
                ? "🔍 Búsqueda"
                : "🏠 Listado"}
            </Badge>

            <Badge variant="secondary" className="text-xs">
              {prospect.listingType}
            </Badge>
          </div>

          {/* Render appropriate prospect card based on type */}
          {prospect.prospectType === "search" ? (
            <SearchProspectCard
              card={{
                ...prospect,
                contactName: prospect.contactName,
                needSummary: buildNeedSummary(prospect),
                budgetRange: buildBudgetRange(prospect),
                preferredAreasText: buildPreferredAreasText(prospect),
                urgencyLevel: prospect.urgencyLevel,
                nextTask: undefined, // TODO: Get from tasks
                lastActivity: prospect.updatedAt,
              }}
            />
          ) : (
            <ListingProspectCard
              card={{
                ...prospect,
                contactName: prospect.contactName,
                propertyAddress: getPropertyAddress(prospect),
                estimatedValue: getEstimatedValue(prospect),
                propertyCondition: getPropertyCondition(prospect),
                valuationStatus: getValuationStatus(prospect),
                listingAgreementStatus: getListingAgreementStatus(prospect),
                urgencyLevel: prospect.urgencyLevel,
                nextTask: undefined, // TODO: Get from tasks
                lastActivity: prospect.updatedAt,
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions to extract data from dual prospects
function buildNeedSummary(prospect: DualProspect): string {
  if (prospect.prospectType !== "search") return "";

  const parts: string[] = [];
  if (prospect.propertyType) parts.push(prospect.propertyType);
  if (prospect.minBedrooms) parts.push(`${prospect.minBedrooms}+ dorm`);
  if (prospect.minSquareMeters) parts.push(`${prospect.minSquareMeters}+ m²`);

  return parts.join(", ") || "Sin especificar";
}

function buildBudgetRange(prospect: DualProspect): string {
  if (prospect.prospectType !== "search") return "";

  const min = prospect.minPrice;
  const max = prospect.maxPrice;

  if (min && max) {
    return `€${min.toLocaleString()} - €${max.toLocaleString()}`;
  } else if (min) {
    return `Desde €${min.toLocaleString()}`;
  } else if (max) {
    return `Hasta €${max.toLocaleString()}`;
  }

  return "Sin especificar";
}

function buildPreferredAreasText(prospect: DualProspect): string {
  if (prospect.prospectType !== "search" || !prospect.preferredAreas) return "";

  return prospect.preferredAreas.map((area) => area.name).join(", ");
}

function getPropertyAddress(prospect: DualProspect): string {
  if (prospect.prospectType !== "listing" || !prospect.propertyToList)
    return "";

  return prospect.propertyToList.address || "Dirección no especificada";
}

function getEstimatedValue(prospect: DualProspect): number | undefined {
  if (prospect.prospectType !== "listing" || !prospect.propertyToList)
    return undefined;

  return prospect.propertyToList.estimatedValue;
}

function getPropertyCondition(prospect: DualProspect): string {
  if (prospect.prospectType !== "listing" || !prospect.propertyToList)
    return "";

  return prospect.propertyToList.condition || "Sin especificar";
}

function getValuationStatus(prospect: DualProspect): string {
  if (prospect.prospectType !== "listing") return "";

  const statusMap = {
    pending: "Pendiente",
    scheduled: "Programada",
    completed: "Completada",
  };

  return statusMap[prospect.valuationStatus!] || "Pendiente";
}

function getListingAgreementStatus(prospect: DualProspect): string {
  if (prospect.prospectType !== "listing") return "";

  const statusMap = {
    not_started: "No iniciado",
    in_progress: "En progreso",
    signed: "Firmado",
  };

  return statusMap[prospect.listingAgreementStatus!] || "No iniciado";
}
