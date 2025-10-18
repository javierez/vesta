"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, Calendar, Clock, User, FileSignature, Phone, Mail, FileText } from "lucide-react";
import type { CompactVisitCardProps } from "~/types/activity";

export function CompactVisitCard({
  appointment,
  contact,
  agent,
  hasSignatures,
}: CompactVisitCardProps) {
  const isCompleted = appointment.status === "Completed";
  const isScheduled = appointment.status === "Scheduled";

  const duration = Math.round(
    (appointment.datetimeEnd.getTime() - appointment.datetimeStart.getTime()) /
      60000
  );

  const borderColor = isCompleted
    ? "border-green-500"
    : isScheduled
    ? "border-blue-500"
    : "border-gray-300";

  const iconColor = isCompleted
    ? "text-green-600"
    : isScheduled
    ? "text-blue-600"
    : "text-gray-400";

  const StatusIcon = isCompleted ? Check : Calendar;

  const formatVisitTime = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Hoy";
    if (diffDays === -1) return "Mañana";
    if (diffDays === 1) return "Ayer";

    return format(date, "d MMM, yyyy", { locale: es });
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm hover:shadow-md
        border-l-4 ${borderColor}
        p-4 space-y-2
        transition-all duration-200
        ${appointment.status === "Cancelled" ? "opacity-60" : ""}
      `}
    >
      {/* Header: Name and Time */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
          <span className="text-gray-900 font-semibold">
            {contact.firstName ?? ""} {contact.lastName ?? ""}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          {formatVisitTime(appointment.datetimeStart)},{" "}
          {format(appointment.datetimeStart, "HH:mm")} -{" "}
          {format(appointment.datetimeEnd, "HH:mm")}
        </div>
      </div>

      {/* Agent and Duration */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-gray-700">
          <User className="w-4 h-4" />
          <span>Agente: {agent.name ?? "Sin asignar"}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <Clock className="w-4 h-4" />
          <span>
            {duration} min
            {appointment.tripTimeMinutes &&
              ` (+ ${appointment.tripTimeMinutes} min viaje)`}
          </span>
        </div>
      </div>

      {/* Contact Info (for scheduled visits) */}
      {isScheduled && (contact.phone ?? contact.email) && (
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {contact.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {contact.phone}
            </span>
          )}
          {contact.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {contact.email}
            </span>
          )}
        </div>
      )}

      {/* Notes (for completed visits) */}
      {isCompleted && appointment.notes && (
        <div className="flex items-start gap-2 text-sm text-gray-600 italic">
          <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">&quot;{appointment.notes}&quot;</span>
        </div>
      )}

      {/* Signatures indicator */}
      {isCompleted && hasSignatures && (
        <div className="flex items-center gap-1 text-sm text-green-600">
          <FileSignature className="w-4 h-4" />
          <span>Firmas: Cliente ✓ | Agente ✓</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        {isCompleted ? (
          <>
            <button className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors">
              Ver Detalles
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors">
              Seguimiento
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors">
              Nueva Tarea
            </button>
          </>
        ) : (
          <>
            <button className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors">
              Reprogramar
            </button>
            <button className="text-sm text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors">
              Cancelar
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors">
              Añadir Nota
            </button>
          </>
        )}
      </div>
    </div>
  );
}
