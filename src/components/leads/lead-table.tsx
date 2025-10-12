"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
  ChevronDown,
  MapPin,
} from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { PaginationControls } from "~/components/ui/pagination-controls";
import { cn } from "~/lib/utils";
import { LEAD_STATUSES, type LeadStatus } from "~/lib/constants/lead-statuses";
import { updateLeadWithAuth } from "~/server/queries/lead";
import { toast } from "~/components/hooks/use-toast";
import { useRouter } from "next/navigation";

// Lead type with joined data (based on what we expect from queries)
export type LeadWithDetails = {
  leadId: bigint;
  contactId: bigint;
  listingId?: bigint | null;
  prospectId?: bigint | null;
  source: string;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
  // Joined contact data
  contact: {
    contactId: bigint;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
  };
  // Joined listing data (optional)
  listing?: {
    listingId: bigint;
    referenceNumber?: string | null;
    title?: string | null;
    street?: string | null;
    price: string;
    listingType?: string | null;
    propertyType?: string | null;
    bedrooms?: number | null;
    squareMeter?: number | null;
  } | null;
  // Joined owner data (optional)
  owner?: {
    contactId: bigint;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
  } | null;
};

interface LeadTableProps {
  leads: LeadWithDetails[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLeadUpdate?: () => void;
  onPrefetchPage?: (page: number) => Promise<void>;
}

export function LeadTable({
  leads,
  currentPage,
  totalPages,
  onPageChange,
  onLeadUpdate,
  onPrefetchPage,
}: LeadTableProps) {
  const router = useRouter();
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [optimisticStatuses, setOptimisticStatuses] = useState<
    Record<string, LeadStatus>
  >({});
  const [visibleRows, setVisibleRows] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Deduplicate leads by leadId to prevent duplicate keys
  const uniqueLeads = leads.reduce((acc, lead) => {
    const key = lead.leadId?.toString();
    if (key && !acc.some(existingLead => existingLead.leadId?.toString() === key)) {
      acc.push(lead);
    } else if (!key) {
      // Keep leads without leadId (shouldn't happen, but just in case)
      acc.push(lead);
    }
    return acc;
  }, [] as LeadWithDetails[]);


  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const handleStatusUpdate = async (leadId: string, newStatus: LeadStatus) => {
    const leadIdString = leadId;
    setUpdatingStatus(leadIdString);

    // Optimistic update
    setOptimisticStatuses((prev) => ({
      ...prev,
      [leadIdString]: newStatus,
    }));

    try {
      await updateLeadWithAuth(Number(leadId), { status: newStatus });

      toast({
        title: "Estado actualizado",
        description: `El lead se ha actualizado a "${newStatus}"`,
      });

      // Call parent update function if provided
      onLeadUpdate?.();
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error("Unknown error");
      console.error("Error updating lead status:", errorObj);

      // Revert optimistic update
      setOptimisticStatuses((prev) => {
        const newState = { ...prev };
        delete newState[leadIdString];
        return newState;
      });

      const errorMessage = errorObj.message;
      toast({
        title: "Error al actualizar",
        description: `No se pudo actualizar el estado del lead: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewListing = (listingId: bigint | null | undefined) => {
    if (listingId) {
      router.push(`/propiedades/${listingId.toString()}`);
    }
  };

  // Memoize unique leads for stable reference
  const memoizedUniqueLeads = useMemo(() => uniqueLeads, [uniqueLeads]);

  // Intersection Observer for lazy loading
  const observeRow = useCallback((element: HTMLElement | null, leadId: string) => {
    if (!element || !observerRef.current) return;

    // Add dataset to track which lead this element represents
    element.dataset.leadId = leadId;
    observerRef.current.observe(element);
  }, []);

  // Initialize Intersection Observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const leadId = entry.target.getAttribute('data-lead-id');
          if (!leadId) return;

          if (entry.isIntersecting) {
            setVisibleRows((prev) => new Set(prev).add(leadId));
          }
        });
      },
      {
        root: null,
        rootMargin: '100px', // Start loading content 100px before they come into view
        threshold: 0.1,
      }
    );

    // Clean up observer on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Initialize visible rows for first few items (above fold)
  useEffect(() => {
    const initialVisibleIds = memoizedUniqueLeads.slice(0, 5).map(lead => lead.leadId?.toString() ?? '');
    setVisibleRows(new Set(initialVisibleIds));
  }, [memoizedUniqueLeads]);

  // Smart prefetching - preload next page when user is near the end
  useEffect(() => {
    if (!onPrefetchPage || currentPage >= totalPages) return;

    let hasTriggeredPrefetch = false;

    const prefetchNextPage = () => {
      if (hasTriggeredPrefetch) return;

      // Prefetch next page when user scrolls to 80% of current content
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollY + windowHeight >= documentHeight * 0.8) {
        hasTriggeredPrefetch = true;
        console.log(`Triggering prefetch for page ${currentPage + 1}`);
        onPrefetchPage(currentPage + 1).catch(console.error);
      }
    };

    const handleScroll = () => {
      requestAnimationFrame(prefetchNextPage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage, totalPages, onPrefetchPage]);

  // Prefetch adjacent pages on component mount
  useEffect(() => {
    if (!onPrefetchPage) return;

    const prefetchAdjacentPages = async () => {
      const pagesToPrefetch = [];

      // Prefetch next page
      if (currentPage < totalPages) {
        pagesToPrefetch.push(currentPage + 1);
      }

      // Prefetch previous page
      if (currentPage > 1) {
        pagesToPrefetch.push(currentPage - 1);
      }

      // Prefetch in background without blocking UI
      pagesToPrefetch.forEach(page => {
        setTimeout(() => {
          onPrefetchPage(page).catch(() => {
            // Silently handle prefetch errors
          });
        }, 1000); // Wait 1 second after initial load
      });
    };

    void prefetchAdjacentPages();
  }, [currentPage, totalPages, onPrefetchPage]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contacto</TableHead>
              <TableHead>Propiedad</TableHead>
              <TableHead>Propietario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memoizedUniqueLeads.map((lead) => {
              const leadId = lead.leadId?.toString() ?? '';
              const currentStatus = optimisticStatuses[leadId] ?? lead.status;
              const isUpdating = updatingStatus === leadId;
              const isVisible = visibleRows.has(leadId);

              return (
                <TableRow
                  key={leadId}
                  ref={(el) => observeRow(el, leadId)}
                >
                  {/* Contact */}
                  <TableCell>
                    {isVisible ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-pointer">
                              <div className="font-medium">
                                {lead.contact.firstName} {lead.contact.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {lead.contact.email ?? "Sin email"}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p>
                                <strong>Email:</strong>{" "}
                                {lead.contact.email ?? "No disponible"}
                              </p>
                              <p>
                                <strong>Teléfono:</strong>{" "}
                                {lead.contact.phone ?? "No disponible"}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Skeleton className="h-10 w-full" />
                    )}
                  </TableCell>

                  {/* Property */}
                  <TableCell>
                    {isVisible ? (
                      lead.listing ? (
                        <div
                          className="cursor-pointer rounded-lg bg-gray-50 p-2 shadow-sm transition-all hover:bg-gray-100 hover:shadow-md"
                          onClick={() => handleViewListing(lead.listingId)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">
                                {lead.listing.title ?? "Sin título"}
                              </div>
                              <div className="flex items-center truncate text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                                {lead.listing.street ?? "Sin dirección"}
                              </div>
                            </div>
                            <div className="ml-2 text-right">
                              <div className="text-xs font-medium text-gray-900">
                                {lead.listing.price
                                  ? new Intl.NumberFormat("es-ES").format(
                                      Number(lead.listing.price),
                                    ) + "€"
                                  : "Sin precio"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {lead.listing.bedrooms
                                  ? `${lead.listing.bedrooms}hab`
                                  : ""}
                                {lead.listing.squareMeter
                                  ? ` • ${lead.listing.squareMeter}m²`
                                  : ""}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-md border border-dashed p-2 text-center text-xs text-muted-foreground">
                          Sin propiedad
                        </div>
                      )
                    ) : (
                      <Skeleton className="h-16 w-full rounded-lg" />
                    )}
                  </TableCell>

                  {/* Owner */}
                  <TableCell>
                    {isVisible ? (
                      lead.owner ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-pointer">
                                <div className="font-medium">
                                  {lead.owner.firstName} {lead.owner.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {lead.owner.email ?? "Sin email"}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <p>
                                  <strong>Email:</strong>{" "}
                                  {lead.owner.email ?? "No disponible"}
                                </p>
                                <p>
                                  <strong>Teléfono:</strong>{" "}
                                  {lead.owner.phone ?? "No disponible"}
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <div className="text-muted-foreground">No disponible</div>
                      )
                    ) : (
                      <Skeleton className="h-10 w-full" />
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="group h-8 px-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                          disabled={isUpdating}
                        >
                          <span className="truncate">{currentStatus}</span>
                          <ChevronDown className="ml-1 h-3 w-3 opacity-40 transition-opacity group-hover:opacity-70" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center">
                        {LEAD_STATUSES.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusUpdate(leadId, status)}
                            disabled={isUpdating}
                            className={cn(
                              currentStatus === status && "bg-gray-100",
                            )}
                          >
                            {status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>

                  {/* Created */}
                  <TableCell className="text-xs">
                    {formatDate(lead.createdAt)}
                  </TableCell>

                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
