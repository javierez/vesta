"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "~/components/ui/card";
import { Home, Bed, Bath, Square, Euro } from "lucide-react";

// Simple type for prospect with contact data (matching ACTUAL database structure)
type ProspectWithContact = {
  prospects: {
    id: bigint;
    contactId: bigint;
    status: string;
    listingType: string | null;
    // prospectType field does NOT exist in actual database
    propertyType: string | null;
    minPrice: string | null;
    maxPrice: string | null;
    preferredAreas: unknown;
    minBedrooms: number | null;
    minBathrooms: number | null;
    minSquareMeters: number | null;
    maxSquareMeters: number | null;
    moveInBy: Date | null;
    extras: unknown;
    urgencyLevel: number | null;
    fundingReady: boolean | null;
    // propertyToList, valuationStatus, listingAgreementStatus may also not exist
    notesInternal: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  contacts: {
    contactId: bigint;
    accountId: bigint;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    additionalInfo: unknown;
    orgId: bigint | null;
    isActive: boolean | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

interface SimpleProspectCardProps {
  prospect: ProspectWithContact;
}

export function SimpleProspectCard({ prospect }: SimpleProspectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: prospect.prospects.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const contactName = `${prospect.contacts.firstName} ${prospect.contacts.lastName}`;

  // Get operation title
  const getOperationTitle = () => {
    const { listingType } = prospect.prospects;
    if (!listingType) return "Búsqueda";
    switch (listingType) {
      case "Sale":
        return "Demanda de Venta";
      case "Rent":
        return "Búsqueda de Alquiler";
      default:
        return "Búsqueda";
    }
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
          {/* Title - Main focus */}
          <div className="mb-4">
            <h3 className="mb-1 text-base font-semibold text-gray-900">
              {getOperationTitle()}
            </h3>
          </div>

          {/* Contact Card - Same as table */}
          <div
            className="-m-2 mb-4 cursor-pointer rounded-lg p-2 transition-all duration-200 hover:scale-[1.01] hover:bg-gray-100 hover:shadow-md"
            onClick={() =>
              (window.location.href = `/contactos/${prospect.contacts.contactId}`)
            }
          >
            <div className="font-medium text-gray-900">{contactName}</div>
            {prospect.contacts.email && (
              <div className="text-sm text-gray-500">
                {prospect.contacts.email}
              </div>
            )}
          </div>

          {/* Characteristics with icons - minimalistic */}
          <div className="space-y-2">
            {/* Property Type */}
            {prospect.prospects.propertyType && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Home className="h-4 w-4" />
                <span>{prospect.prospects.propertyType}</span>
              </div>
            )}

            {/* Bedrooms */}
            {prospect.prospects.minBedrooms && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Bed className="h-4 w-4" />
                <span>
                  {">"}
                  {prospect.prospects.minBedrooms}
                </span>
              </div>
            )}

            {/* Bathrooms */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Bath className="h-4 w-4" />
              <span>
                {">"}
                {prospect.prospects.minBathrooms ?? 1}
              </span>
            </div>

            {/* Square meters */}
            {prospect.prospects.minSquareMeters && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Square className="h-4 w-4" />
                <span>
                  {">"}
                  {prospect.prospects.minSquareMeters}m²
                </span>
              </div>
            )}

            {/* Budget */}
            {(prospect.prospects.minPrice ?? prospect.prospects.maxPrice) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Euro className="h-4 w-4" />
                <span>
                  {(() => {
                    const min = prospect.prospects.minPrice
                      ? Number(prospect.prospects.minPrice)
                      : null;
                    const max = prospect.prospects.maxPrice
                      ? Number(prospect.prospects.maxPrice)
                      : null;

                    if (min && max) {
                      return `€${min.toLocaleString()} - €${max.toLocaleString()}`;
                    } else if (min) {
                      return `>€${min.toLocaleString()}`;
                    } else if (max) {
                      return `<€${max.toLocaleString()}`;
                    }
                    return null;
                  })()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
