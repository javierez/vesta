"use client";

import { ContactBreadcrumb } from "./contact-breadcrumb";
import { ContactFormHeader } from "./contact-form-header";
import { ContactTabs } from "./contact-tabs";
import { updateContactRating } from "~/app/(dashboard)/contactos/[id]/actions";
import { useTransition } from "react";
import { toast } from "sonner";

interface ContactDetailLayoutProps {
  contact: {
    contactId: bigint;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    contactType?: string;
    isActive: boolean | null;
    createdAt: Date;
    rating?: number | null;
    // Flags and counts from server (optional)
    ownerCount?: number;
    buyerCount?: number;
    prospectCount?: number;
    isOwner?: boolean;
    isBuyer?: boolean;
    isInteresado?: boolean;
    // Add other properties that ContactCharacteristicsForm might need
    [key: string]: unknown;
  };
}

export function ContactDetailLayout({ contact }: ContactDetailLayoutProps) {
  const [, startTransition] = useTransition();

  const handleRatingChange = (rating: number | null) => {
    startTransition(async () => {
      const result = await updateContactRating(Number(contact.contactId), rating);
      if (result.success) {
        toast.success(
          rating
            ? `Valoración actualizada a ${rating}/5`
            : "Valoración eliminada",
        );
      } else {
        toast.error("Error al actualizar la valoración");
      }
    });
  };

  // Transform contact to match ContactCharacteristicsForm interface
  const transformedContact = {
    contactId: contact.contactId,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email ?? undefined,
    phone: contact.phone ?? undefined,
    contactType: (contact.contactType ?? undefined) as
      | "demandante"
      | "propietario"
      | "banco"
      | "agencia"
      | "interesado",
    isActive: contact.isActive ?? true,
    // Pass through flags and counts so tabs can derive visibility without contactType
    ownerCount: contact.ownerCount,
    buyerCount: contact.buyerCount,
    prospectCount: contact.prospectCount,
    isOwner: contact.isOwner,
    isBuyer: contact.isBuyer,
    isInteresado: contact.isInteresado,
    additionalInfo:
      typeof contact.additionalInfo === "object" &&
      contact.additionalInfo !== null
        ? contact.additionalInfo
        : {},
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <ContactBreadcrumb
        firstName={contact.firstName}
        lastName={contact.lastName}
      />

      {/* Contact Header */}
      <ContactFormHeader
        contact={{
          ...contact,
          contactType: contact.contactType ?? "demandante",
        }}
        onRatingChange={handleRatingChange}
      />

      {/* Contact Tabs */}
      <div className="pb-16">
        <ContactTabs
          contact={{
            ...transformedContact,
            // Ensure the prop satisfies the ContactTabs expected type
            contactType: transformedContact.contactType ?? "demandante",
          }}
        />
      </div>
    </div>
  );
}
