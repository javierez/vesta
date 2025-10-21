"use client";

import { Clock, MessageSquare } from "lucide-react";
import { cn } from "~/lib/utils";
import { getContactCardColor } from "../color/contact-colors";

interface NombreProps {
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastContact?: Date;
  updatedAt: Date;
  isOwner?: boolean;
  isBuyer?: boolean;
  isInteresado?: boolean;
  notes?: string;
}

export function Nombre({
  firstName,
  lastName,
  isActive,
  lastContact,
  updatedAt,
  isOwner,
  isBuyer,
  isInteresado,
  notes,
}: NombreProps) {
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `Hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`;
    } else if (diffDays < 56) {
      // 8 weeks = 56 days
      const weeks = Math.ceil(diffDays / 7);
      return `Hace ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
    } else if (diffDays < 365) {
      // Less than 1 year
      const months = Math.ceil(diffDays / 30);
      return `Hace ${months} ${months === 1 ? "mes" : "meses"}`;
    } else {
      // More than 12 months, use years
      const years = Math.ceil(diffDays / 365);
      return `Hace ${years} ${years === 1 ? "año" : "años"}`;
    }
  };

  // Create a contact object for the color function
  const contactForColor = { isOwner, isBuyer, isInteresado };

  const fullName = `${firstName} ${lastName}`;

  return (
    <div className="space-y-0.5">
      {/* Contact Name with Color Indicator */}
      <div className="flex items-center gap-2">
        <div
          className="h-6 w-1 flex-shrink-0 rounded-full"
          style={getContactCardColor(contactForColor)}
        />
        <span
          className={cn(
            "truncate font-medium",
            isActive ? "" : "text-gray-500",
          )}
          title={fullName}
        >
          {fullName}
        </span>
      </div>

      {/* Last Contact Date */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3 flex-shrink-0" />
        <span className="truncate">
          {lastContact
            ? formatRelativeTime(lastContact)
            : formatRelativeTime(updatedAt)}
        </span>
      </div>

      {/* Notes */}
      {notes && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MessageSquare className="h-3 w-3 flex-shrink-0" />
          <span className="truncate italic" title={notes}>
            {notes}
          </span>
        </div>
      )}
    </div>
  );
}
