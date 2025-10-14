"use client";

import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Mail, Phone, Calendar, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";
import {
  CONTACT_PALETTE,
  getContactBadgeColor,
} from "../table-components/color/contact-colors";

interface ContactFormHeaderProps {
  contact: {
    contactId: bigint;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    contactType: string;
    isActive: boolean | null;
    createdAt: Date;
    // Role counts and flags for badge display
    ownerCount?: number;
    buyerCount?: number;
    prospectCount?: number;
    isOwner?: boolean;
    isBuyer?: boolean;
    isInteresado?: boolean;
  };
}

export function ContactFormHeader({ contact }: ContactFormHeaderProps) {
  const [copied, setCopied] = useState<{
    field: "email" | "phone" | null;
    value: string;
  }>({ field: null, value: "" });

  function handleCopy(field: "email" | "phone", value: string) {
    void navigator.clipboard.writeText(value);
    setCopied({ field, value });
    setTimeout(() => setCopied({ field: null, value: "" }), 1200);
  }

  return (
    <div className="mb-8">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-gray-100 text-gray-600">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-gray-900">
                {contact.firstName} {contact.lastName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {/* Propietario badge - always show if contact is owner */}
                {contact.isOwner === true && (
                  <Badge
                    className={cn(
                      "whitespace-nowrap rounded-full px-3 text-sm font-medium shadow-md",
                      getContactBadgeColor("owner", contact.isActive ?? true),
                    )}
                    style={{ background: CONTACT_PALETTE.earth }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1 h-4 w-4"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9,22 9,12 15,12 15,22" />
                    </svg>
                    Propietario
                    {contact.ownerCount && contact.ownerCount > 1
                      ? ` (${contact.ownerCount})`
                      : ""}
                  </Badge>
                )}

                {/* Demandante badge - always show if contact is buyer */}
                {contact.isBuyer === true && (
                  <Badge
                    className={cn(
                      "whitespace-nowrap rounded-full px-3 text-sm font-medium shadow-md",
                      getContactBadgeColor("buyer", contact.isActive ?? true),
                    )}
                    style={{ background: CONTACT_PALETTE.moss }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1 h-4 w-4"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    Demandante
                    {contact.buyerCount && contact.buyerCount > 1
                      ? ` (${contact.buyerCount})`
                      : ""}
                  </Badge>
                )}

                {/* Interesado badge - always show if contact has interests */}
                {contact.isInteresado === true && (
                  <Badge
                    className={cn(
                      "whitespace-nowrap rounded-full px-3 text-sm font-medium shadow-md",
                      getContactBadgeColor(
                        "interested",
                        contact.isActive ?? true,
                      ),
                    )}
                    style={{ background: CONTACT_PALETTE.sage }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1 h-4 w-4"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    Interesado
                    {contact.prospectCount && contact.prospectCount > 1
                      ? ` (${contact.prospectCount})`
                      : ""}
                  </Badge>
                )}

                {/* Fallback badge - only show if ALL flags are false/undefined */}
                {contact.isOwner !== true &&
                  contact.isBuyer !== true &&
                  contact.isInteresado !== true && (
                    <Badge
                      className={cn(
                        "whitespace-nowrap rounded-full px-3 text-sm font-medium shadow-md",
                        getContactBadgeColor(
                          "unclassified",
                          contact.isActive ?? true,
                        ),
                      )}
                      style={{ background: CONTACT_PALETTE.sand }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1 h-4 w-4"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                      Sin clasificar
                    </Badge>
                  )}

                {!contact.isActive && (
                  <Badge variant="secondary" className="bg-red-50 text-red-600">
                    Inactivo
                  </Badge>
                )}
              </div>
              <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                {contact.email && (
                  <div className="group flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="transition-all duration-200 group-hover:font-semibold">
                      {contact.email}
                    </span>
                    <div className="flex w-0 items-center overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:w-auto group-hover:opacity-100">
                      <button
                        onClick={() => handleCopy("email", contact.email!)}
                        className="scale-0 transform rounded p-1 transition-all duration-200 hover:bg-gray-100 group-hover:scale-100"
                        title="Copiar email"
                      >
                        {copied.field === "email" &&
                        copied.value === contact.email ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700" />
                        )}
                      </button>
                      <a
                        href={`mailto:${contact.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 scale-0 transform rounded p-1 transition-all duration-200 hover:bg-gray-100 group-hover:scale-100"
                        style={{ transitionDelay: "100ms" }}
                        title="Enviar email"
                      >
                        <Mail className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700" />
                      </a>
                    </div>
                  </div>
                )}
                {contact.phone && (
                  <div className="group flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span className="transition-all duration-200 group-hover:font-semibold">
                      {contact.phone}
                    </span>
                    <div className="flex w-0 items-center overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:w-auto group-hover:opacity-100">
                      <button
                        onClick={() => handleCopy("phone", contact.phone!)}
                        className="scale-0 transform rounded p-1 transition-all duration-200 hover:bg-gray-100 group-hover:scale-100"
                        title="Copiar teléfono"
                      >
                        {copied.field === "phone" &&
                        copied.value === contact.phone ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700" />
                        )}
                      </button>
                      <a
                        href={`tel:${contact.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 scale-0 transform rounded p-1 transition-all duration-200 hover:bg-gray-100 group-hover:scale-100"
                        style={{ transitionDelay: "100ms" }}
                        title="Llamar"
                      >
                        <Phone className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700" />
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Creado:{" "}
                    {new Date(contact.createdAt).toLocaleDateString("es-ES")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
