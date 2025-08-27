"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Search, Filter, Home, Loader } from "lucide-react";
import { listListingsCompactWithAuth } from "~/server/queries/listing";
import { addListingContactRelationshipWithAuth } from "~/server/queries/contact";
import { CompactPropertyCard } from "~/components/contactos/crear/compact-property-card";
import { toast } from "sonner";

// Interface for listing data structure
interface ListingData {
  listingId: bigint;
  title: string | null;
  referenceNumber: string | null;
  price: string;
  listingType: string;
  propertyType: string | null;
  bedrooms: number | null;
  bathrooms: string | null;
  squareMeter: number | null;
  city: string | null;
  agentName: string | null;
  isOwned: boolean;
  imageUrl: string | null;
}

interface AddPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: bigint;
  onSuccess?: () => void;
}

const statusColors: Record<string, string> = {
  Sale: "bg-amber-50 text-amber-700 border-amber-200",
  Rent: "bg-amber-50 text-amber-700 border-amber-200",
  Sold: "bg-slate-50 text-slate-700 border-slate-200",
};

const statusLabels: Record<string, string> = {
  Sale: "En Venta",
  Rent: "En Alquiler",
  Sold: "Vendido",
};

export function AddPropertyDialog({
  open,
  onOpenChange,
  contactId,
  onSuccess,
}: AddPropertyDialogProps) {
  const [listings, setListings] = useState<ListingData[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListings, setSelectedListings] = useState<bigint[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [filters, setFilters] = useState({
    listingType: [] as string[],
    propertyType: [] as string[],
  });

  // Fetch listings when dialog opens
  useEffect(() => {
    if (open) {
      const fetchListings = async () => {
        setIsLoadingListings(true);
        try {
          const listingsData = await listListingsCompactWithAuth();
          setListings(listingsData);
        } catch (error) {
          console.error("Error fetching listings:", error);
          toast.error("Error al cargar las propiedades");
        } finally {
          setIsLoadingListings(false);
        }
      };

      void fetchListings();
    }
  }, [open]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedListings([]);
      setSearchQuery("");
      setFilters({ listingType: [], propertyType: [] });
    }
  }, [open]);

  const handleListingSelection = (listingId: bigint, _checked: boolean) => {
    setSelectedListings((prev) => {
      if (prev.includes(listingId)) {
        return prev.filter((id) => id !== listingId);
      } else {
        return [...prev, listingId];
      }
    });
  };

  const toggleFilter = (
    filterType: "listingType" | "propertyType",
    value: string,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((v) => v !== value)
        : [...prev[filterType], value],
    }));
  };

  const getPropertyTypeLabel = (type: string | null) => {
    switch (type) {
      case "piso":
        return "Piso";
      case "casa":
        return "Casa";
      case "local":
        return "Local";
      case "solar":
        return "Solar";
      case "garaje":
        return "Garaje";
      default:
        return type;
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("es-ES").format(Number(price));
  };

  // Filter listings based on search and filters
  const filteredListings = listings.filter((listing: ListingData) => {
    const matchesSearch =
      !searchQuery ||
      (listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false) ||
      (listing.referenceNumber
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ??
        false) ||
      (listing.city?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false);

    const matchesListingType =
      filters.listingType.length === 0 ||
      filters.listingType.includes(listing.listingType);

    const matchesPropertyType =
      filters.propertyType.length === 0 ||
      filters.propertyType.includes(listing.propertyType ?? "");

    return matchesSearch && matchesListingType && matchesPropertyType;
  });

  const handleAddProperties = async () => {
    if (selectedListings.length === 0) {
      toast.error("Por favor, selecciona al menos una propiedad");
      return;
    }

    setIsAdding(true);
    try {
      // Add each selected listing-contact relationship
      for (const listingId of selectedListings) {
        await addListingContactRelationshipWithAuth(
          Number(contactId),
          Number(listingId),
          "buyer",
        );
      }

      toast.success(
        `${selectedListings.length} propiedad${selectedListings.length > 1 ? "es" : ""} añadida${selectedListings.length > 1 ? "s" : ""} correctamente`,
      );

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding properties:", error);
      toast.error("Error al añadir las propiedades");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle>Añadir Propiedades de Interés</DialogTitle>
          <DialogDescription>
            Selecciona las propiedades que le interesan a este demandante
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Search and Filters */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Buscar propiedades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                  {filters.listingType.length + filters.propertyType.length >
                    0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 rounded-sm px-1 font-normal"
                    >
                      {filters.listingType.length + filters.propertyType.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4 p-4">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Estado</h5>
                      {["Sale", "Rent", "Sold"].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`listing-${type}`}
                            checked={filters.listingType.includes(type)}
                            onCheckedChange={(_checked) =>
                              toggleFilter("listingType", type)
                            }
                          />
                          <Label
                            htmlFor={`listing-${type}`}
                            className="text-sm"
                          >
                            {statusLabels[type]}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Tipo</h5>
                      {["piso", "casa", "local", "solar", "garaje"].map(
                        (type) => (
                          <div
                            key={type}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`property-${type}`}
                              checked={filters.propertyType.includes(type)}
                              onCheckedChange={(_checked) =>
                                toggleFilter("propertyType", type)
                              }
                            />
                            <Label
                              htmlFor={`property-${type}`}
                              className="text-sm"
                            >
                              {getPropertyTypeLabel(type)}
                            </Label>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          {/* Property List */}
          <div className="flex-1 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedListings.length > 0 ? (
                  <span>
                    {selectedListings.length} propiedades seleccionadas
                  </span>
                ) : (
                  <span className="text-gray-500">
                    Selecciona propiedades de interés
                  </span>
                )}
              </div>
            </div>

            <ScrollArea className="h-[400px] pr-2">
              <div className="space-y-3">
                {isLoadingListings ? (
                  <div className="flex justify-center py-8">
                    <Loader className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredListings.length > 0 ? (
                  filteredListings.map((listing: ListingData) => {
                    const isSelected = selectedListings.includes(
                      listing.listingId,
                    );
                    return (
                      <CompactPropertyCard
                        key={listing.listingId.toString()}
                        listing={listing}
                        isSelected={isSelected}
                        onClick={handleListingSelection}
                        statusColors={statusColors}
                        statusLabels={statusLabels}
                        getPropertyTypeLabel={getPropertyTypeLabel}
                        formatPrice={formatPrice}
                      />
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <Home className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    <p>No se encontraron propiedades</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddProperties}
            disabled={selectedListings.length === 0 || isAdding}
          >
            {isAdding ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Añadiendo...
              </>
            ) : (
              `Añadir ${selectedListings.length > 0 ? `(${selectedListings.length})` : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
