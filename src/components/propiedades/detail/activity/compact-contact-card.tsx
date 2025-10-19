"use client";

import { Mail, Phone, User, Users, CalendarIcon, CalendarPlus, Home, Copy, Check, MessageCircle } from "lucide-react";
import { cn } from "~/lib/utils";
import { useState } from "react";
import { formatDistance } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import type { CompactContactCardProps } from "~/types/activity";

// Contact type colors and icons - matching appointment card style
const contactTypes = {
  buyer: {
    color: "bg-amber-100 text-amber-800",
    icon: <Home className="h-4 w-4" />,
  },
  viewer: {
    color: "bg-blue-100 text-blue-800",
    icon: <Users className="h-4 w-4" />,
  },
  owner: {
    color: "bg-purple-100 text-purple-800",
    icon: <User className="h-4 w-4" />,
  },
};

export function CompactContactCard({
  contact,
  listingContact,
  hasUpcomingVisit,
  hasMissedVisit,
  hasDoneVisit,
  visitCount,
  listingId,
}: CompactContactCardProps) {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const typeConfig = contactTypes[listingContact.contactType] ?? {
    color: "bg-gray-100 text-gray-800",
    icon: <CalendarIcon className="h-4 w-4" />,
  };

  console.log('🎨 CompactContactCard rendering:', {
    contactId: contact.contactId.toString(),
    name: `${contact.firstName} ${contact.lastName ?? ''}`,
    contactType: listingContact.contactType,
    status: listingContact.status,
    source: listingContact.source,
    hasUpcomingVisit,
    hasMissedVisit,
    hasDoneVisit,
    visitCount,
    typeConfig: {
      color: typeConfig.color,
      hasIcon: !!typeConfig.icon,
    },
  });

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const openEmail = (email: string) => {
    window.open(`mailto:${email}`, "_blank");
  };

  const openPhoneCall = (phone: string) => {
    window.open(`tel:${phone}`, "_blank");
  };

  const openWhatsApp = (phone: string) => {
    // Remove any non-digit characters and ensure it starts with country code
    const cleanPhone = phone.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${cleanPhone}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleCreateVisit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/calendario?new=true&contactId=${contact.contactId}&listingId=${listingId}`);
  };

  return (
    <div
      className={cn(
        "calendar-event relative cursor-pointer rounded-lg border bg-white p-4 transition-all duration-200 hover:shadow-md"
      )}
    >
      {/* Main content */}
      <div className="pr-32"> {/* Add right padding to avoid overlap with badges */}
        {/* Contact name */}
        <div className="font-medium text-gray-900 mb-2">
          {contact.firstName} {contact.lastName ?? ""}
          <span className="ml-2 text-xs font-normal text-gray-500">
            ({formatDistance(contact.createdAt, new Date(), {
              addSuffix: true,
              locale: es,
            })})
          </span>
        </div>

        {/* Contact Info - Email and Phone */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
          {contact.email && (
            <div className="group flex items-center">
              <div className="mr-1 flex items-center">
                <button
                  className="rounded p-1 transition-colors hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEmail(contact.email!);
                  }}
                  title="Enviar email"
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </button>
                <div className="flex w-0 items-center overflow-hidden opacity-0 transition-all duration-500 ease-out group-hover:w-auto group-hover:opacity-100">
                  <button
                    className="duration-400 ml-1 scale-0 transform rounded p-1 transition-all hover:bg-gray-100 group-hover:scale-100"
                    style={{ transitionDelay: "200ms" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      void copyToClipboard(contact.email!, `email-${contact.contactId}`);
                    }}
                    title="Copiar email"
                  >
                    {copiedField === `email-${contact.contactId}` ? (
                      <Check className="h-4 w-4 text-green-900" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
              <span className="truncate transition-all group-hover:font-bold">
                {contact.email}
              </span>
            </div>
          )}
          {contact.email && contact.phone && <span>•</span>}
          {contact.phone && (
            <div className="group flex items-center">
              <div className="mr-1 flex items-center">
                <button
                  className="rounded p-1 transition-colors hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPhoneCall(contact.phone!);
                  }}
                  title="Llamar"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </button>
                <div className="flex w-0 items-center overflow-hidden opacity-0 transition-all duration-500 ease-out group-hover:w-auto group-hover:opacity-100">
                  <button
                    className="duration-400 ml-1 scale-0 transform rounded p-1 transition-all hover:bg-gray-100 group-hover:scale-100"
                    style={{ transitionDelay: "200ms" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openWhatsApp(contact.phone!);
                    }}
                    title="Enviar WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    className="duration-400 ml-1 scale-0 transform rounded p-1 transition-all hover:bg-gray-100 group-hover:scale-100"
                    style={{ transitionDelay: "300ms" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      void copyToClipboard(contact.phone!, `phone-${contact.contactId}`);
                    }}
                    title="Copiar teléfono"
                  >
                    {copiedField === `phone-${contact.contactId}` ? (
                      <Check className="h-4 w-4 text-green-900" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
              <span className="truncate transition-all group-hover:font-bold">
                {contact.phone}
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Badges - Centered in the middle */}
      <div className="absolute top-1/2 right-3 transform -translate-y-1/2 flex flex-col gap-3">
        {/* Contact type badge */}
        <div
          className={cn(
            "flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            typeConfig.color,
          )}
        >
          <span>
            {listingContact.contactType === "buyer" ? "Comprador" :
             listingContact.contactType === "viewer" ? "Interesado" :
             listingContact.contactType === "owner" ? "Propietario" :
             listingContact.contactType}
          </span>
        </div>

        {/* Visit status badge */}
        <span
          onClick={(!hasUpcomingVisit && !hasMissedVisit && !hasDoneVisit) || (hasMissedVisit && !hasUpcomingVisit) ? handleCreateVisit : undefined}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
            !hasUpcomingVisit && !hasMissedVisit && !hasDoneVisit &&
              "bg-white text-gray-700 border-2 border-dashed border-gray-400 cursor-pointer hover:bg-gray-50 hover:border-gray-500 transition-colors",
            hasMissedVisit && !hasUpcomingVisit &&
              "bg-white text-red-800 border-2 border-dashed border-red-700 cursor-pointer hover:bg-red-50 hover:border-red-800 transition-colors",
            (hasUpcomingVisit || (hasDoneVisit && !hasUpcomingVisit && !hasMissedVisit)) &&
              "bg-gray-100 text-gray-700"
          )}
        >
          {!hasUpcomingVisit && !hasMissedVisit && !hasDoneVisit && (
            <CalendarPlus className="h-3 w-3" />
          )}
          {hasUpcomingVisit && "Visita pendiente"}
          {hasMissedVisit && !hasUpcomingVisit && "Visita perdida"}
          {hasDoneVisit && !hasUpcomingVisit && !hasMissedVisit && "Pendiente oferta"}
          {!hasUpcomingVisit && !hasMissedVisit && !hasDoneVisit && "Crear visita"}
        </span>
      </div>
    </div>
  );
}
