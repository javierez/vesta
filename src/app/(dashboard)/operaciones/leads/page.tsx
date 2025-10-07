"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { TrendingUp, Plus } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { LeadFilter } from "~/components/leads/lead-filter";
import { LeadTable } from "~/components/leads/lead-table";
import type { LeadWithDetails } from "~/components/leads/lead-table";
import {
  LeadPageSkeleton,
  EmptyLeadsState,
} from "~/components/leads/lead-skeletons";
import { listLeadsWithAuth } from "~/server/queries/lead";
import { toast } from "~/components/hooks/use-toast";
import type { LeadStatus } from "~/lib/constants/lead-statuses";

const ITEMS_PER_PAGE = 20;

export default function LeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<LeadWithDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const prefetchCacheRef = useRef<Map<number, LeadWithDetails[]>>(new Map());

  // Get view mode from URL (default to list since Kanban is disabled)
  const view = (searchParams.get("view") ?? "list") as "kanban" | "list";

  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Get all filter parameters from URL
        const page = parseInt(searchParams.get("page") ?? "1");
        const search = searchParams.get("search") ?? "";
        const statusFilters = searchParams.get("status")?.split(",") ?? [];
        const sourceFilters = searchParams.get("source")?.split(",") ?? [];

        setCurrentPage(page);

        // Use enhanced query with filtering support
        const result = await listLeadsWithAuth(
          page,
          ITEMS_PER_PAGE,
          search || undefined,
          statusFilters.length > 0 ? statusFilters : undefined,
          sourceFilters.length > 0 ? sourceFilters : undefined,
        );

        // Handle enhanced query response with proper structure
        if (result && "leads" in result) {
          // Enhanced query response with pagination data
          /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
          setLeads(
            result.leads.map((item: any) => ({
              leadId: item.listingContactId,
              contactId: item.contactId,
              listingId: item.listingId ?? null,
              prospectId: item.prospectId ?? null,
              source: item.source,
              status: item.status as LeadStatus,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              contact: item.contact,
              listing: item.listing?.listingId
                ? {
                    listingId: item.listing.listingId,
                    referenceNumber: item.listing.referenceNumber,
                    title: item.listing.title,
                    street: item.listing.street,
                    price: item.listing.price ?? "0",
                    listingType: item.listing.listingType,
                    propertyType: item.listing.propertyType,
                    bedrooms: item.listing.bedrooms,
                    squareMeter: item.listing.squareMeter,
                  }
                : undefined,
              owner: item.owner?.contactId
                ? {
                    contactId: item.owner.contactId,
                    firstName: item.owner.firstName,
                    lastName: item.owner.lastName,
                    email: item.owner.email,
                    phone: item.owner.phone,
                  }
                : undefined,
            })),
          );
          /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */

          setTotalPages(result.totalPages);
        } else {
          setLeads([]);
          setTotalPages(1);
        }
      } catch (error: unknown) {
        const errorObj =
          error instanceof Error ? error : new Error("Unknown error");
        console.error("Error fetching leads:", errorObj);
        const errorMessage = errorObj.message;
        setError(errorMessage);
        toast({
          title: "Error al cargar leads",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchLeads();
  }, [searchParams]);

  // Prefetch handler
  const handlePrefetchPage = useCallback(async (page: number) => {
    // Check if already cached
    if (prefetchCacheRef.current.has(page)) {
      console.log(`Page ${page} already cached`);
      return;
    }

    try {
      console.log(`Prefetching page ${page}`);
      const search = searchParams.get("search") ?? "";
      const statusFilters = searchParams.get("status")?.split(",") ?? [];
      const sourceFilters = searchParams.get("source")?.split(",") ?? [];

      const result = await listLeadsWithAuth(
        page,
        ITEMS_PER_PAGE,
        search || undefined,
        statusFilters.length > 0 ? statusFilters : undefined,
        sourceFilters.length > 0 ? sourceFilters : undefined,
      );

      if (result && "leads" in result) {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
        const processedLeads = result.leads.map((item: any) => ({
          leadId: item.listingContactId,
          contactId: item.contactId,
          listingId: item.listingId ?? null,
          prospectId: item.prospectId ?? null,
          source: item.source,
          status: item.status as LeadStatus,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          contact: item.contact,
          listing: item.listing?.listingId
            ? {
                listingId: item.listing.listingId,
                referenceNumber: item.listing.referenceNumber,
                title: item.listing.title,
                street: item.listing.street,
                price: item.listing.price ?? "0",
                listingType: item.listing.listingType,
                propertyType: item.listing.propertyType,
                bedrooms: item.listing.bedrooms,
                squareMeter: item.listing.squareMeter,
              }
            : undefined,
          owner: item.owner?.contactId
            ? {
                contactId: item.owner.contactId,
                firstName: item.owner.firstName,
                lastName: item.owner.lastName,
                email: item.owner.email,
                phone: item.owner.phone,
              }
            : undefined,
        }));
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */

        prefetchCacheRef.current.set(page, processedLeads);
        console.log(`Successfully prefetched page ${page}`);
      }
    } catch (error) {
      console.error(`Failed to prefetch page ${page}:`, error);
    }
  }, [searchParams]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/operaciones/leads?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewChange = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view === "kanban" ? "list" : "kanban");
    router.push(`/operaciones/leads?${params.toString()}`);
  };

  const handleLeadUpdate = () => {
    // Refresh data when a lead is updated
    window.location.reload();
  };

  // Loading state
  if (isLoading) {
    return <LeadPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Leads</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona las conexiones entre demandantes y propietarios
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="text-red-800">
            <p className="font-medium">Error al cargar datos</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!leads.length && !searchParams.toString()) {
    return <EmptyLeadsState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las conexiones entre demandantes y propietarios
          </p>
        </div>

        {/* Future: Add create lead button */}
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <Plus className="mr-2 h-4 w-4" />
            Crear lead
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <LeadFilter view={view} onViewChange={handleViewChange} />

      {/* Content */}
      {view === "list" ? (
        <LeadTable
          leads={leads}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPrefetchPage={handlePrefetchPage}
          onLeadUpdate={handleLeadUpdate}
        />
      ) : (
        // Future: Kanban view will be implemented here
        <div className="rounded-lg border bg-gray-50 p-12 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">Vista Kanban</h3>
          <p className="text-muted-foreground">
            La vista Kanban para leads estará disponible próximamente.
          </p>
        </div>
      )}
    </div>
  );
}
