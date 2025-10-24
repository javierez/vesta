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
  listingContact: _listingContact,
  hasUpcomingVisit,
  hasMissedVisit,
  hasCompletedVisit,
  hasCancelledVisit,
  hasOffer,
  offer,
  visitCount: _visitCount,
  listingId,
  onContactClick,
}: CompactContactCardProps) {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const handleCardClick = () => {
    if (onContactClick) {
      onContactClick({
        contact,
        hasUpcomingVisit,
        hasMissedVisit,
        hasCompletedVisit,
        hasCancelledVisit,
        hasOffer,
        offer,
      });
    }
  };

  return (
    <div
      onClick={handleCardClick}
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
          onClick={(!hasUpcomingVisit && !hasMissedVisit && !hasCompletedVisit && !hasCancelledVisit && !hasOffer) || (hasMissedVisit && !hasUpcomingVisit && !hasOffer) || (hasCancelledVisit && !hasUpcomingVisit && !hasOffer) ? handleCreateVisit : undefined}
          className={cn(
            "inline-flex items-center justify-center gap-1 rounded-full px-2 py-0 text-xs font-medium min-w-[120px] h-5",
            // Visita pendiente - upcoming visit scheduled (highest priority)
            hasUpcomingVisit &&
              "bg-amber-100 text-amber-800",
            // Oferta realizada - has offer (regardless of visit status)
            hasOffer && !hasUpcomingVisit &&
              "bg-orange-100 text-orange-800",
            // Visita cancelada - has cancelled visit, clickable to reschedule
            hasCancelledVisit && !hasUpcomingVisit && !hasOffer &&
              "bg-white text-orange-700 border-2 border-dashed border-orange-400 cursor-pointer hover:bg-orange-50 hover:border-orange-500 transition-colors",
            // Visita perdida - missed visit, clickable to reschedule
            hasMissedVisit && !hasUpcomingVisit && !hasCancelledVisit && !hasOffer &&
              "bg-white text-amber-700 border-2 border-dashed border-amber-400 cursor-pointer hover:bg-amber-50 hover:border-amber-500 transition-colors",
            // Visita completada - completed visit without offer yet
            hasCompletedVisit && !hasOffer && !hasUpcomingVisit && !hasMissedVisit && !hasCancelledVisit &&
              "bg-amber-50 text-amber-700",
            // Crear visita - no visits at all and no offer
            !hasUpcomingVisit && !hasMissedVisit && !hasCompletedVisit && !hasCancelledVisit && !hasOffer &&
              "bg-white text-amber-700 border-2 border-dashed border-amber-300 cursor-pointer hover:bg-amber-50 hover:border-amber-400 transition-colors"
          )}
        >
          {hasUpcomingVisit && "Visita pendiente"}
          {hasOffer && !hasUpcomingVisit && "Oferta realizada"}
          {hasCancelledVisit && !hasUpcomingVisit && !hasOffer && "Visita cancelada"}
          {hasMissedVisit && !hasUpcomingVisit && !hasCancelledVisit && !hasOffer && "Visita perdida"}
          {hasCompletedVisit && !hasOffer && !hasUpcomingVisit && !hasMissedVisit && !hasCancelledVisit && "Visita completada"}
          {!hasUpcomingVisit && !hasMissedVisit && !hasCompletedVisit && !hasCancelledVisit && !hasOffer && (
            <>
              <CalendarPlus className="h-2.5 w-2.5" />
              Crear visita
            </>
          )}
        </span>
      </div>
    </div>
  );
}
