import { notFound } from "next/navigation";
import { getContactByIdWithTypeWithAuth } from "~/server/queries/contact";
import { ContactDetailLayout } from "~/components/contactos/detail/contact-detail-layout";
import type { Contact } from "~/lib/data";

interface ContactPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    roles?: string;
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

export default async function ContactPage({
  params,
  searchParams,
}: ContactPageProps) {
  try {
    const unwrappedParams = await params;
    const unwrappedSearchParams = await searchParams;

    const contact = await getContactByIdWithTypeWithAuth(
      parseInt(unwrappedParams.id),
    );

    if (!contact) {
      notFound();
    }

    // Get URL filter parameter - defaults to "owner" to match table behavior
    const roleFilter = unwrappedSearchParams.roles ?? "owner";
    const isOwnerView = roleFilter.includes("owner");

    // Filter listings based on URL role parameter to match table behavior
    const rawListings =
      (contact as { allListings?: ContactListing[] }).allListings ?? [];
    let filteredListings: ContactListing[] = [];

    if (isOwnerView) {
      // Show only owner listings when in owner view
      filteredListings = rawListings.filter(
        (listing) => listing.contactType === "owner",
      );
    } else {
      // Show only buyer listings when in buyer view
      filteredListings = rawListings.filter(
        (listing) => listing.contactType === "buyer",
      );
    }

    // Filter prospect titles - only show in buyer view to match table behavior
    const prospectTitles = isOwnerView
      ? []
      : ((contact as { prospectTitles?: string[] }).prospectTitles ?? []);

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
      prospectTitles, // Use filtered prospect titles based on URL filter
      allListings: filteredListings, // Use filtered listings based on URL filter
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
