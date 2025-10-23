"use client";

import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useState, useEffect } from "react";
import { User, Plus } from "lucide-react";
import {
  ContactInterestForm,
  type InterestFormData,
} from "./forms/contact-interest-form";
import { getProspectsByContactWithAuth } from "~/server/queries/prospect";
import { ContactProspectCompact } from "./forms/contact-prospect-compact";
import { getLocationByNeighborhoodId } from "~/server/queries/locations";

// Define ProspectData interface to match database schema
interface ProspectData {
  id: bigint;
  contactId: bigint;
  status: string;
  listingType: string | null;
  propertyType: string | null;
  maxPrice: string | null;
  preferredAreas: Array<{ neighborhoodId?: number; name?: string }> | null;
  minBedrooms: number | null;
  minBathrooms: number | null;
  minSquareMeters: number | null;
  moveInBy: Date | null;
  extras: Record<string, unknown> | null;
  urgencyLevel: number | null;
  fundingReady: boolean | null;
  notesInternal: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ContactSolicitudesProps {
  contactId: bigint;
}

export function ContactSolicitudes({ contactId }: ContactSolicitudesProps) {
  // Interest forms state - Start empty, only show when explicitly creating/editing
  const [interestForms, setInterestForms] = useState<InterestFormData[]>([]);

  // Prospects state for tracking existing prospects
  const [prospects, setProspects] = useState<ProspectData[]>([]);
  const [, setEditingProspectId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // Load existing prospects for this contact
  useEffect(() => {
    const loadProspects = async () => {
      try {
        const existingProspects = await getProspectsByContactWithAuth(contactId);
        setProspects(
          existingProspects.map((item) => item.prospects) as ProspectData[],
        );
      } catch (error) {
        console.error("Error loading prospects:", error);
      }
    };

    void loadProspects();
  }, [contactId]);

  // Function to handle editing a prospect
  const handleEditProspect = async (prospect: ProspectData) => {
    // Convert preferredAreas back to selectedNeighborhoods format
    let selectedNeighborhoods: Array<{
      neighborhoodId: bigint;
      neighborhood: string;
      city: string;
      municipality: string;
      province: string;
    }> = [];

    if (
      Array.isArray(prospect.preferredAreas) &&
      prospect.preferredAreas.length > 0
    ) {
      // Fetch full location data for each neighborhood ID
      const locationPromises = prospect.preferredAreas.map(
        async (area: { neighborhoodId?: number; name?: string }) => {
          try {
            if (typeof area.neighborhoodId !== "number") return null;
            const location = await getLocationByNeighborhoodId(
              area.neighborhoodId,
            );
            return location
              ? {
                  neighborhoodId: location.neighborhoodId,
                  neighborhood: location.neighborhood,
                  city: location.city,
                  municipality: location.municipality,
                  province: location.province,
                }
              : null;
          } catch (error) {
            console.error("Error fetching location:", error);
            return null;
          }
        },
      );

      const locations = await Promise.all(locationPromises);
      selectedNeighborhoods = locations.filter(
        (loc: unknown): loc is NonNullable<typeof loc> => loc !== null,
      ) as Array<{
        neighborhoodId: bigint;
        neighborhood: string;
        city: string;
        municipality: string;
        province: string;
      }>;
    }

    // Convert prospect to InterestFormData format
    const convertedForm: InterestFormData = {
      id: `prospect-${prospect.id.toString()}`,
      demandType: prospect.listingType ?? "",
      maxPrice: prospect.maxPrice ? Number(prospect.maxPrice) : 200000,
      preferredArea: selectedNeighborhoods
        .map((n) => n.neighborhood)
        .join(", "),
      selectedNeighborhoods: selectedNeighborhoods,
      propertyTypes: prospect.propertyType ? [prospect.propertyType] : [],
      minBedrooms: prospect.minBedrooms ?? 0,
      minBathrooms: prospect.minBathrooms ?? 0,
      minSquareMeters: prospect.minSquareMeters ?? 80,
      urgencyLevel: prospect.urgencyLevel ?? 3,
      fundingReady: prospect.fundingReady ?? false,
      moveInBy: prospect.moveInBy
        ? prospect.moveInBy.toISOString().split("T")[0]!
        : "",
      extras: (prospect.extras as Record<string, boolean>) ?? {},
      notes: prospect.notesInternal ?? "",
    };

    setInterestForms([convertedForm]);
    setEditingProspectId(prospect.id.toString());
    setShowNewForm(false);
  };

  // Function to handle saving and returning to compact view
  const handleFormSaved = () => {
    setShowNewForm(false);
    setEditingProspectId(null);
    setInterestForms([]);
    // Reload prospects
    const loadProspects = async () => {
      try {
        const existingProspects = await getProspectsByContactWithAuth(contactId);
        setProspects(
          existingProspects.map((item) => item.prospects) as ProspectData[],
        );
      } catch (error) {
        console.error("Error loading prospects:", error);
      }
    };
    void loadProspects();
  };

  // Function to create new form
  const createNewForm = () => {
    const newForm: InterestFormData = {
      id: `form-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      demandType: "",
      maxPrice: 150000,
      preferredArea: "",
      selectedNeighborhoods: [],
      propertyTypes: [],
      minBedrooms: 0,
      minBathrooms: 0,
      minSquareMeters: 80,
      urgencyLevel: 3,
      fundingReady: false,
      moveInBy: "",
      extras: {},
      notes: "",
    };
    setInterestForms([newForm]);
    setShowNewForm(true);
    setEditingProspectId(null);
  };

  // Function to update interest form
  const updateInterestForm = (id: string, data: InterestFormData) => {
    setInterestForms(
      interestForms.map((form) => (form.id === id ? data : form)),
    );
  };

  return (
    <Card className="relative p-4 transition-all duration-500 ease-out">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide">
          SOLICITUDES DE BÚSQUEDA
        </h3>
        {!showNewForm && interestForms.length === 0 && (
          <Button
            onClick={createNewForm}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Añadir solicitud
          </Button>
        )}
      </div>

      {/* Show saved prospects in compact view - Always visible */}
      {prospects.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {prospects.map((prospect) => (
              <ContactProspectCompact
                key={prospect.id.toString()}
                prospect={prospect}
                onEdit={handleEditProspect}
              />
            ))}
          </div>
        </div>
      )}

      {/* Show edit form when editing or creating new */}
      {(showNewForm || interestForms.length > 0) && (
        <div className="space-y-6">
          {interestForms.map((form, index) => (
            <div key={form.id} className="space-y-4">
              <ContactInterestForm
                data={form}
                onUpdate={(data) => updateInterestForm(form.id, data)}
                onRemove={() => {
                  setInterestForms([]);
                  setShowNewForm(false);
                  setEditingProspectId(null);
                }}
                isRemovable={true}
                index={index}
                contactId={contactId}
                onSaved={handleFormSaved}
                onDeleted={handleFormSaved}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {prospects.length === 0 && !showNewForm && interestForms.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <User className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-sm">
            No hay solicitudes de búsqueda configuradas
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Haz clic en &quot;Añadir solicitud&quot; para crear la primera
            solicitud
          </p>
        </div>
      )}
    </Card>
  );
}
