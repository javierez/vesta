"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  MoreHorizontal,
  User,
  Home,
  ExternalLink,
  ChevronDown,
  MapPin,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
}

export function LeadTable({
  leads,
  currentPage,
  totalPages,
  onPageChange,
  onLeadUpdate,
}: LeadTableProps) {
  const router = useRouter();
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [optimisticStatuses, setOptimisticStatuses] = useState<
    Record<string, LeadStatus>
  >({});

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

  const getStatusBadgeVariant = (status: LeadStatus) => {
    switch (status) {
      case "Info Incompleta":
        return "secondary";
      case "Info Solicitada":
        return "outline";
      case "Respuesta Pendiente":
        return "outline";
      case "Visita Pendiente":
        return "default";
      case "Visita Realizada":
        return "default";
      case "Oferta Presentada":
        return "default";
      case "Oferta Pendiente":
        return "default";
      case "Oferta Aceptada":
        return "default";
      case "Oferta Rechazada":
        return "destructive";
      case "Cerrado":
        return "secondary";
      default:
        return "secondary";
    }
  };

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

  const handleViewContact = (contactId: bigint) => {
    router.push(`/contactos/${contactId.toString()}`);
  };

  const handleViewListing = (listingId: bigint | null | undefined) => {
    if (listingId) {
      router.push(`/propiedades/${listingId.toString()}`);
    }
  };

  const handleViewLead = (leadId: bigint) => {
    // Future: navigate to lead detail page
    router.push(`/operaciones/leads/${leadId.toString()}`);
  };

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
            {uniqueLeads.map((lead) => {
              const leadId = lead.leadId?.toString() ?? '';
              const currentStatus = optimisticStatuses[leadId] ?? lead.status;
              const isUpdating = updatingStatus === leadId;

              return (
                <TableRow key={leadId}>
                  {/* Contact */}
                  <TableCell>
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
                  </TableCell>

                  {/* Property */}
                  <TableCell>
                    {lead.listing ? (
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
                    )}
                  </TableCell>

                  {/* Owner */}
                  <TableCell>
                    {lead.owner ? (
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
