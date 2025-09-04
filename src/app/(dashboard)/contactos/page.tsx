"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ContactFilter } from "~/components/contactos/table-components/contact-filter";
import { ContactSpreadsheetTable } from "~/components/contactos/table/contact-table";
import {
  listContactsOwnerDataWithAuth,
  listContactsBuyerDataWithAuth,
} from "~/server/queries/contact";
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
  // Tasks for this contact
  tasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
    dueDate?: Date;
  }>;
}

// Type for a contact returned by optimized queries - only fields we actually fetch and use
type DbContact = {
  contactId: bigint;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  additionalInfo?: Record<string, unknown> | null;
  isActive: boolean;
  updatedAt: Date;
  // Computed role counts and flags
  ownerCount?: number;
  buyerCount?: number;
  prospectCount?: number;
  isOwner?: boolean;
  isBuyer?: boolean;
  isInteresado?: boolean;
  // Additional processed data
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
  // Tasks for this contact
  tasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
    dueDate?: Date;
  }>;
};

export default function ContactsPage() {
  const searchParams = useSearchParams();

  // Simplified single-state approach since URL changes trigger re-fetch anyway
  const [contacts, setContacts] = useState<ExtendedContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Helper function to process raw contact data
  const processContactsData = useCallback(
    (
      rawContacts: DbContact[],
      filters: ReturnType<typeof getFiltersFromUrl>,
    ): ExtendedContact[] => {
      // Transform to ExtendedContact format
      const extendedContacts: ExtendedContact[] = rawContacts.map((contact) => ({
        contactId: contact.contactId,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email ?? undefined,
        phone: contact.phone ?? undefined,
        additionalInfo: contact.additionalInfo ?? undefined,
        isActive: contact.isActive,
        createdAt: new Date(), // Default value since not fetched  
        updatedAt: contact.updatedAt,
        ownerCount: contact.ownerCount,
        buyerCount: contact.buyerCount,
        prospectCount: contact.prospectCount,
        isOwner: contact.isOwner,
        isBuyer: contact.isBuyer,
        isInteresado: contact.isInteresado,
        prospectTitles: contact.prospectTitles ?? [],
        allListings: contact.allListings ?? [],
        tasks: contact.tasks ?? [],
      }));

      // Apply sorting
      return extendedContacts.sort((a, b) => {
        if (filters.sortOrder === "lastContact") {
          const aDate = a.updatedAt || new Date(0);
          const bDate = b.updatedAt || new Date(0);
          return bDate.getTime() - aDate.getTime();
        } else {
          const aName = `${a.firstName} ${a.lastName}`.toLowerCase();
          const bName = `${b.firstName} ${b.lastName}`.toLowerCase();
          return aName.localeCompare(bName);
        }
      });
    },
    [],
  );

  useEffect(() => {
    const filters = getFiltersFromUrl();
    const isOwnerView = filters.roles.includes("owner");

    // Fetch appropriate data based on current URL filter
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Use the appropriate optimized query based on view
        const rawContacts = isOwnerView 
          ? await listContactsOwnerDataWithAuth(1, 100, {
              searchQuery: filters.searchQuery,
              roles: ["owner"],
              lastContactFilter: filters.lastContactFilter,
            })
          : await listContactsBuyerDataWithAuth(1, 100, {
              searchQuery: filters.searchQuery,
              roles: ["buyer"],
              lastContactFilter: filters.lastContactFilter,
            });

        // Process and sort contacts
        const processedContacts = processContactsData(
          rawContacts as DbContact[],
          filters,
        );
        setContacts(processedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        setContacts([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [searchParams, getFiltersFromUrl, processContactsData]); // Re-fetch when URL parameters change

  // Get current filter for passing to table component
  const currentFilter = getFiltersFromUrl().roles;

  // Show skeleton only if loading and no data exists
  const showSkeleton = isLoading && contacts.length === 0;

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
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/contactos/crear">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Contacto
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contactos/borradores">
              <FileText className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <ContactFilter onFilterChange={handleFilterChange} />

      {showSkeleton ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <ContactSpreadsheetTable
            contacts={contacts}
            currentFilter={currentFilter}
          />
        </div>
      )}
    </div>
  );
}
