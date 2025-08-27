"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ContactFilter } from "~/components/contactos/table-components/contact-filter";
import { ContactSpreadsheetTable } from "~/components/contactos/table/contact-table";
import { listContactsWithTypesWithAuth } from "~/server/queries/contact";
import type { Contact } from "~/lib/data";

// Extended Contact type to include contactType for the UI
interface ExtendedContact extends Omit<Contact, "contactType"> {
  ownerCount?: number;
  buyerCount?: number;
  prospectCount?: number;
  // Server-provided role flags
  isOwner?: boolean;
  isBuyer?: boolean;
  isInteresado?: boolean;
  // All prospect titles (array)
  prospectTitles?: string[];
  // All listings for this contact
  allListings?: Array<{
    listingId: bigint;
    contactType: string;
    street?: string;
    city?: string;
    propertyType?: string;
    listingType?: string;
    status?: string;
  }>;
}

// Type for a contact returned by listContactsWithTypes
type DbContact = Omit<Contact, "contactType"> & {
  email?: string | null;
  orgId?: bigint | null;
  ownerCount?: number;
  buyerCount?: number;
  prospectCount?: number;
  isOwner?: boolean;
  isBuyer?: boolean;
  isInteresado?: boolean;
  prospectTitles?: string[];
  allListings?: Array<{
    listingId: bigint;
    contactType: string;
    street?: string;
    city?: string;
    propertyType?: string;
    listingType?: string;
    status?: string;
  }>;
};

export default function ContactsPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [contactsList, setContactsList] = useState<ExtendedContact[]>([]);

  // Get filter parameters from URL
  const getFiltersFromUrl = useCallback(() => {
    const roles = searchParams.get("roles");
    const q = searchParams.get("q");
    const sort = searchParams.get("sort");
    const lastContact = searchParams.get("lastContact");

    return {
      roles: roles ? roles.split(",") : ["owner"],
      searchQuery: q ?? "",
      sortOrder: sort ?? "alphabetical",
      lastContactFilter: lastContact ?? "all",
    };
  }, [searchParams]);

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        const filters = getFiltersFromUrl();

        // Fetch contacts from the database with filters
        const rawContacts = await listContactsWithTypesWithAuth(1, 100, {
          searchQuery: filters.searchQuery,
          roles: filters.roles,
          lastContactFilter: filters.lastContactFilter,
        });
        // Type assertion for safety
        const dbContacts: DbContact[] = (rawContacts as DbContact[]).map(
          (c) => ({
            ...c,
            email: c.email ?? undefined,
            orgId: c.orgId ?? undefined,
          }),
        );

        // Use the data directly from the query
        const extendedContacts: ExtendedContact[] = dbContacts.map(
          (contact) => ({
            contactId: contact.contactId,
            firstName: contact.firstName,
            lastName: contact.lastName,
            // Ensure email is undefined if null
            email: contact.email ?? undefined,
            phone: contact.phone,
            additionalInfo: contact.additionalInfo,
            // Ensure orgId is undefined if null
            orgId: contact.orgId ?? undefined,
            isActive: contact.isActive,
            createdAt: contact.createdAt,
            updatedAt: contact.updatedAt,
            ownerCount: contact.ownerCount,
            buyerCount: contact.buyerCount,
            prospectCount: contact.prospectCount,
            isOwner: contact.isOwner,
            isBuyer: contact.isBuyer,
            isInteresado: contact.isInteresado,
            prospectTitles: contact.prospectTitles ?? [], // Use nullish coalescing
            allListings: contact.allListings ?? [], // Use nullish coalescing
          }),
        );

        // Apply sorting
        const sortedContacts = extendedContacts.sort((a, b) => {
          if (filters.sortOrder === "lastContact") {
            // Sort by last contact date (most recent first)
            const aDate = a.updatedAt || new Date(0);
            const bDate = b.updatedAt || new Date(0);
            return bDate.getTime() - aDate.getTime();
          } else {
            // Default alphabetical sort by full name
            const aName = `${a.firstName} ${a.lastName}`.toLowerCase();
            const bName = `${b.firstName} ${b.lastName}`.toLowerCase();
            return aName.localeCompare(bName);
          }
        });

        setContactsList(sortedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        // Fallback to empty array if there's an error
        setContactsList([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchContacts(); // Mark as intentionally unhandled
  }, [searchParams, getFiltersFromUrl]); // getFiltersFromUrl is now stable

  // Removed unused eslint-disable directive
  const handleFilterChange = (_filters: {
    searchQuery: string;
    roles: string[];
    sortOrder: string;
    lastContactFilter: string;
  }) => {
    // The filtering is now handled by the database query and URL parameters
    // This function is called by the ContactFilter component to update the URL
    // The useEffect above will re-fetch data when URL changes
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contactos</h1>
        <Button asChild>
          <Link href="/contactos/crear">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Contacto
          </Link>
        </Button>
      </div>

      <ContactFilter onFilterChange={handleFilterChange} />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <ContactSpreadsheetTable
            contacts={contactsList}
            currentFilter={getFiltersFromUrl().roles}
          />
        </div>
      )}
    </div>
  );
}
