"use client";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { generatePropertyTitle } from "~/lib/property-title";

interface PropertyTitleProps {
  propertyType: string;
  street?: string;
  neighborhood?: string;
}

export function PropertyTitle({
  propertyType,
  street = "",
  neighborhood = "",
}: PropertyTitleProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="title" className="text-sm">
        Título
      </Label>
      <Input
        id="title"
        value={generatePropertyTitle(propertyType, street, neighborhood)}
        className="h-8 bg-muted"
        disabled
      />
    </div>
  );
}