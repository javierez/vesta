"use client";

import { formatDistance } from "date-fns";
import { es } from "date-fns/locale";
import { User, Mail, Phone, ExternalLink, Calendar, Send, Globe, Activity, Home } from "lucide-react";
import type { CompactContactCardProps } from "~/types/activity";

export function CompactContactCard({
  contact,
  listingContact,
  hasUpcomingVisit,
  visitCount,
}: CompactContactCardProps) {
  const borderColor =
    listingContact.contactType === "buyer"
      ? "border-amber-400"
      : listingContact.contactType === "viewer"
      ? "border-blue-400"
      : "border-purple-400";

  const timeAgo = formatDistance(contact.createdAt, new Date(), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm hover:shadow-md
        border-l-4 ${borderColor}
        p-4 space-y-2
        transition-all duration-200
      `}
    >
      {/* Header: Name and Time */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <span className="text-gray-900 font-semibold">
            {contact.firstName} {contact.lastName ?? ""}
          </span>
        </div>
        <span className="text-xs text-gray-500">{timeAgo}</span>
      </div>

      {/* Source and Status */}
      <div className="flex items-center gap-2 flex-wrap">
        {listingContact.source && (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">
            <Globe className="w-3 h-3" />
            Fuente: {listingContact.source}
          </span>
        )}
        {listingContact.status && (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
            <Activity className="w-3 h-3" />
            {listingContact.status}
          </span>
        )}
      </div>

      {/* Contact Information */}
      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
        {contact.email && (
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {contact.email}
          </span>
        )}
        {contact.phone && (
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {contact.phone}
          </span>
        )}
      </div>

      {/* Visit Info */}
      {visitCount > 0 && (
        <div className="flex items-center gap-1 text-sm text-blue-600 font-medium">
          <Home className="w-4 h-4" />
          {visitCount} {visitCount === 1 ? "visita" : "visitas"}
          {hasUpcomingVisit && " (1 programada)"}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <button className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          Ver Perfil
        </button>
        <button className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Programar Visita
        </button>
        <button className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1">
          <Send className="w-3 h-3" />
          Enviar Email
        </button>
      </div>
    </div>
  );
}
