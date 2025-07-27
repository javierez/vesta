import { notFound } from "next/navigation";
import { getContactByIdWithType } from "~/server/queries/contact";
import { ContactDetailLayout } from "~/components/contactos/detail/contact-detail-layout";
import type { Contact } from "~/lib/data";

interface ContactPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Define the type for listings associated with a contact
type ContactListing = {
  listingId: bigint;
  contactType: string;
  street?: string;
  city?: string;
  propertyType?: string;
  listingType?: string;
  status?: string;
  createdAt: Date;
};

interface ExtendedContact {
  [key: string]: unknown; // <-- Add this line
  contactId: bigint;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  contactType:
    | "demandante"
    | "propietario"
    | "banco"
    | "agencia"
    | "interesado";
  isActive: boolean | null;
  createdAt: Date;
  orgId?: bigint;
  additionalInfo?: Contact["additionalInfo"];
  ownerCount?: number;
  buyerCount?: number;
  prospectCount?: number;
  isOwner?: boolean;
  isBuyer?: boolean;
  isInteresado?: boolean;
  prospectTitles?: string[];
  allListings?: ContactListing[];
}

export default async function ContactPage({ params }: ContactPageProps) {
  try {
    const unwrappedParams = await params;
    const contact = await getContactByIdWithType(parseInt(unwrappedParams.id));

    if (!contact) {
      notFound();
    }

    // Use explicit types and nullish coalescing for safety
    const extendedContact: ExtendedContact = {
      ...contact,
      contactId: contact.contactId,
      createdAt: contact.createdAt,
      // Ensure orgId is undefined if null, to match the type
      orgId: contact.orgId ?? undefined,
      additionalInfo: (
        contact as { additionalInfo?: Contact["additionalInfo"] }
      ).additionalInfo,
      prospectTitles:
        (contact as { prospectTitles?: string[] }).prospectTitles ?? [],
      allListings:
        (contact as { allListings?: ContactListing[] }).allListings ?? [],
      contactType: (contact as unknown as { contactType: string })
        .contactType as
        | "demandante"
        | "propietario"
        | "banco"
        | "agencia"
        | "interesado",
    };

    return <ContactDetailLayout contact={extendedContact} />;
  } catch (error) {
    console.error("Error in ContactPage:", error);
    notFound();
  }
}
