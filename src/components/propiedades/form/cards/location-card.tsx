"use client";

import React from "react";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { ModernSaveIndicator } from "../common/modern-save-indicator";
import type { PropertyListing } from "~/types/property-listing";
import type { SaveState } from "~/types/save-state";

interface LocationCardProps {
  listing: PropertyListing;
  city: string;
  province: string;
  municipality: string;
  collapsedSections: Record<string, boolean>;
  saveState: SaveState;
  onToggleSection: (section: string) => void;
  onSave: () => Promise<void>;
  onUpdateModule: (hasChanges: boolean) => void;
  setCity: (value: string) => void;
  setProvince: (value: string) => void;
  setMunicipality: (value: string) => void;
  setIsMapsPopupOpen: (value: boolean) => void;
  getCardStyles: (moduleName: string) => string;
}

export function LocationCard({
  listing,
  city,
  province,
  municipality,
  collapsedSections,
  saveState,
  onToggleSection,
  onSave,
  onUpdateModule,
  setCity,
  setProvince,
  setMunicipality,
  setIsMapsPopupOpen,
  getCardStyles,
}: LocationCardProps) {
  return (
    <Card
      className={cn(
        "relative p-4 transition-all duration-500 ease-out",
        getCardStyles("location"),
      )}
    >
      <ModernSaveIndicator
        state={saveState}
        onSave={onSave}
      />
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onToggleSection("location")}
          className="group flex flex-1 items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
              DIRECCIÓN DEL INMUEBLE
            </h3>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsMapsPopupOpen(true);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              <Image
                src="https://vesta-configuration-files.s3.amazonaws.com/logos/googlemapsicon.png"
                alt="Google Maps"
                width={14}
                height={14}
                className="object-contain"
              />
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              collapsedSections.location && "rotate-180",
            )}
          />
        </button>
      </div>
      <div
        className={cn(
          "space-y-3 overflow-hidden transition-all duration-200",
          collapsedSections.location ? "max-h-0" : "max-h-[2000px]",
        )}
      >
        <div className="space-y-1.5">
          <Label htmlFor="street" className="text-sm">
            Calle
          </Label>
          <Input
            id="street"
            defaultValue={listing.street}
            className="h-8 text-gray-500"
            onChange={() => onUpdateModule(true)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="addressDetails" className="text-sm">
            Detalles de la dirección
          </Label>
          <Input
            id="addressDetails"
            defaultValue={listing.addressDetails}
            className="h-8 text-gray-500"
            placeholder="Piso, puerta, escalera, etc."
            onChange={() => onUpdateModule(true)}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="postalCode" className="text-sm">
              Código Postal
            </Label>
            <Input
              id="postalCode"
              defaultValue={listing.postalCode}
              className="h-8 text-gray-500"
              onChange={() => onUpdateModule(true)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="neighborhood" className="text-sm">
              Barrio
            </Label>
            <Input
              id="neighborhood"
              defaultValue={listing.neighborhood}
              className="h-8 bg-muted"
              disabled
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-sm">
              Ciudad
            </Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                onUpdateModule(true);
              }}
              className="h-8 text-gray-500"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="municipality" className="text-sm">
              Municipio
            </Label>
            <Input
              id="municipality"
              value={municipality}
              onChange={(e) => {
                setMunicipality(e.target.value);
                onUpdateModule(true);
              }}
              className="h-8 text-gray-500"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="province" className="text-sm">
            Provincia
          </Label>
          <Input
            id="province"
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              onUpdateModule(true);
            }}
            className="h-8 text-gray-500"
          />
        </div>
      </div>
    </Card>
  );
}