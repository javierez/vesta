"use client";

import { Mail, Phone, CalendarPlus, Copy, Check, MessageCircle } from "lucide-react";
import { cn } from "~/lib/utils";
import { useState } from "react";
import { formatDistance } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import type { CompactContactCardProps } from "~/types/activity";

export function CompactContactCard({
  contact,
  listingContact,
  hasUpcomingVisit,
  hasMissedVisit,
  hasCompletedVisit,
  hasCancelledVisit,
  hasOffer,
  visitCount,
  listingId,
}: CompactContactCardProps) {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  console.log('🎨 CompactContactCard rendering:', {
    contactId: contact.contactId.toString(),
    name: `${contact.firstName} ${contact.lastName ?? ''}`,
    contactType: listingContact.contactType,
    status: listingContact.status,
    source: listingContact.source,
    hasUpcomingVisit,
    hasMissedVisit,
    hasCompletedVisit,
    hasCancelledVisit,
    hasOffer,
    visitCount,
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
        "calendar-event relative cursor-pointer rounded-lg border bg-white p-2.5 transition-all duration-200 hover:shadow-md"
      )}
    >
      {/* Main content */}
      <div className="pr-28"> {/* Add right padding to avoid overlap with badges */}
        {/* Contact name */}
        <div className="font-medium text-sm text-gray-900 mb-1">
          {contact.firstName} {contact.lastName ?? ""}
          <span className="ml-2 text-xs font-normal text-gray-500">
            ({formatDistance(contact.createdAt, new Date(), {
              addSuffix: true,
              locale: es,
            })})
          </span>
        </div>

        {/* Contact Info - Email and Phone */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
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
                  <Mail className="h-3 w-3 text-muted-foreground" />
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
                      <Check className="h-3 w-3 text-green-900" />
                    ) : (
                      <Copy className="h-3 w-3 text-muted-foreground" />
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
                  <Phone className="h-3 w-3 text-muted-foreground" />
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
                    <MessageCircle className="h-3 w-3 text-muted-foreground" />
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
                      <Check className="h-3 w-3 text-green-900" />
                    ) : (
                      <Copy className="h-3 w-3 text-muted-foreground" />
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

      {/* Badge - Top right */}
      <div className="absolute top-2 right-2">
        {/* Visit status badge */}
        <span
          onClick={(!hasUpcomingVisit && !hasMissedVisit && !hasCompletedVisit && !hasCancelledVisit) || (hasMissedVisit && !hasUpcomingVisit) || (hasCancelledVisit && !hasUpcomingVisit) ? handleCreateVisit : undefined}
          className={cn(
            "inline-flex items-center justify-center gap-1 rounded-full px-2 py-0 text-xs font-medium min-w-[120px] h-5",
            // Crear visita - no visits at all
            !hasUpcomingVisit && !hasMissedVisit && !hasCompletedVisit && !hasCancelledVisit &&
              "bg-white text-gray-700 border-2 border-dashed border-gray-400 cursor-pointer hover:bg-gray-50 hover:border-gray-500 transition-colors",
            // Visita cancelada - has cancelled visit, clickable to reschedule
            hasCancelledVisit && !hasUpcomingVisit &&
              "bg-white text-orange-800 border-2 border-dashed border-orange-600 cursor-pointer hover:bg-orange-50 hover:border-orange-700 transition-colors",
            // Visita perdida - missed visit, clickable to reschedule
            hasMissedVisit && !hasUpcomingVisit && !hasCancelledVisit &&
              "bg-white text-red-800 border-2 border-dashed border-red-700 cursor-pointer hover:bg-red-50 hover:border-red-800 transition-colors",
            // Visita pendiente - upcoming visit scheduled
            hasUpcomingVisit &&
              "bg-blue-100 text-blue-800",
            // Oferta realizada - completed visit with offer made
            hasCompletedVisit && hasOffer && !hasUpcomingVisit && !hasMissedVisit && !hasCancelledVisit &&
              "bg-green-100 text-green-800",
            // Visita completada - completed visit without offer yet
            hasCompletedVisit && !hasOffer && !hasUpcomingVisit && !hasMissedVisit && !hasCancelledVisit &&
              "bg-gray-100 text-gray-700"
          )}
        >
          {!hasUpcomingVisit && !hasMissedVisit && !hasCompletedVisit && !hasCancelledVisit && (
            <CalendarPlus className="h-2.5 w-2.5" />
          )}
          {hasUpcomingVisit && "Visita pendiente"}
          {hasCancelledVisit && !hasUpcomingVisit && "Visita cancelada"}
          {hasMissedVisit && !hasUpcomingVisit && !hasCancelledVisit && "Visita perdida"}
          {hasCompletedVisit && hasOffer && !hasUpcomingVisit && !hasMissedVisit && !hasCancelledVisit && "Oferta realizada"}
          {hasCompletedVisit && !hasOffer && !hasUpcomingVisit && !hasMissedVisit && !hasCancelledVisit && "Visita completada"}
          {!hasUpcomingVisit && !hasMissedVisit && !hasCompletedVisit && !hasCancelledVisit && "Crear visita"}
        </span>
      </div>
    </div>
  );
}
