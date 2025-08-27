"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card } from "~/components/ui/card";
import { FloatingLabelInput } from "~/components/ui/floating-label-input";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Home,
  Loader,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createContact, createContactWithListings } from "~/server/queries/contact";
import { listListingsCompactWithAuth } from "~/server/queries/listing";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Search, Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { CompactPropertyCard } from "./compact-property-card";

// Contact form data interface
interface ContactFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;

  // Property Selection
  selectedListings: bigint[];
  contactType: "owner" | "buyer";
}

const initialFormData: ContactFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: "",
  selectedListings: [],
  contactType: "owner",
};

// Step definitions
interface Step {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    id: "personal",
    title: "Información Personal",
    icon: <User className="h-5 w-5" />,
  },
  {
    id: "property",
    title: "Seleccionar Propiedades",
    icon: <Home className="h-5 w-5" />,
  },
];

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

export default function ContactForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    listingType: [] as string[],
    propertyType: [] as string[],
  });
  const [listings, setListings] = useState<ListingData[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [showOwnershipDialog, setShowOwnershipDialog] = useState(false);
  const [ownershipAction, setOwnershipAction] = useState<
    "change" | "add" | null
  >(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch listings on component mount
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoadingListings(true);
      try {
        const listingsData = await listListingsCompactWithAuth();
        setListings(listingsData);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setIsLoadingListings(false);
      }
    };

    void fetchListings();
  }, []);

  const updateFormData = (field: keyof ContactFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange =
    (field: keyof ContactFormData) => (value: string) => {
      updateFormData(field, value);
    };

  const handleEventInputChange =
    (field: keyof ContactFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateFormData(field, e.target.value);
    };

  const handleListingSelection = (listingId: bigint, _checked: boolean) => {
    setFormData((prev) => {
      const currentArray = prev.selectedListings;
      if (currentArray.includes(listingId)) {
        return {
          ...prev,
          selectedListings: currentArray.filter((item) => item !== listingId),
        };
      } else {
        return { ...prev, selectedListings: [...currentArray, listingId] };
      }
    });
  };

  const validatePersonalStep = () => {
    if (!formData.firstName.trim()) {
      alert("Por favor, introduce el nombre.");
      return false;
    }
    if (!formData.lastName.trim()) {
      alert("Por favor, introduce el apellido.");
      return false;
    }
    if (!formData.email.trim() && !formData.phone.trim()) {
      alert("Por favor, introduce al menos un email o teléfono.");
      return false;
    }
    // Basic email validation if provided
    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      alert("Por favor, introduce un email válido.");
      return false;
    }
    return true;
  };

  const validatePropertyStep = () => {
    // Property selection is now optional
    setValidationError(null);
    return true;
  };

  const handleCreateContact = async () => {
    if (!validatePropertyStep()) return;

    // If no properties selected, proceed directly to contact creation
    if (formData.selectedListings.length === 0) {
      await createContactProcess();
      return;
    }

    // Check if any selected listing is owned
    const ownedListings = formData.selectedListings.filter((listingId) => {
      const listing = listings.find((l) => l.listingId === listingId);
      return listing?.isOwned;
    });

    // Only show ownership dialog if:
    // 1. There are owned listings selected AND
    // 2. The contact type is 'owner' (not 'buyer')
    if (ownedListings.length > 0 && formData.contactType === "owner") {
      // Show ownership confirmation dialog
      setShowOwnershipDialog(true);
      return;
    }

    // Proceed with contact creation (for buyers or non-owned properties)
    await createContactProcess();
  };

  const createContactProcess = async () => {
    try {
      setIsCreating(true);

      // Prepare additional info based on form data
      const additionalInfo: Record<string, unknown> = {};
      // Store selected listings and contact type for reference if listings are selected
      if (formData.selectedListings.length > 0) {
        additionalInfo.selectedListings = formData.selectedListings.map((id) =>
          id.toString(),
        );
        additionalInfo.contactType = formData.contactType;
        // Add ownership action if specified
        if (ownershipAction) {
          additionalInfo.ownershipAction = ownershipAction;
        }
      }
      // Add notes if provided
      if (formData.notes.trim()) {
        additionalInfo.notes = formData.notes.trim();
      }

      const contactData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        additionalInfo,
        orgId: BigInt(1), // Default org ID - you might want to make this dynamic
        isActive: true,
      };

      let newContact;
      
      if (formData.selectedListings.length === 0) {
        // Create contact without listing relationships
        newContact = await createContact(contactData);
        console.log("Contact created without listings:", newContact);
      } else {
        // Create contact with listing relationships
        newContact = await createContactWithListings(
          contactData,
          formData.selectedListings,
          formData.contactType,
          ownershipAction ?? undefined,
        );
        console.log("Contact created with listings:", newContact);
      }

      // Redirect to contact detail page
      if (newContact?.contactId) {
        router.push(`/contactos/${newContact.contactId}`);
      } else {
        router.push("/contactos");
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      alert("Error al crear el contacto. Por favor, inténtalo de nuevo.");
    } finally {
      setIsCreating(false);
      setShowOwnershipDialog(false);
      setOwnershipAction(null);
    }
  };

  const handleOwnershipAction = (action: "change" | "add") => {
    setOwnershipAction(action);
    setShowOwnershipDialog(false);
    // Proceed with contact creation
    void createContactProcess();
  };

  const nextStep = async () => {
    if (currentStep === 0) {
      if (!validatePersonalStep()) return;
      setDirection("forward");
      setCurrentStep(1);
    } else if (currentStep === 1) {
      await handleCreateContact();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection("backward");
      setCurrentStep((prev) => prev - 1);
    }
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

  const renderStepContent = () => {
    const step = steps[currentStep];

    if (!step) {
      return <div>Step not found</div>;
    }

    switch (step.id) {
      case "personal":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FloatingLabelInput
                id="firstName"
                value={formData.firstName}
                onChange={handleInputChange("firstName")}
                placeholder="Nombre"
                required
              />
              <FloatingLabelInput
                id="lastName"
                value={formData.lastName}
                onChange={handleInputChange("lastName")}
                placeholder="Apellidos"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FloatingLabelInput
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                placeholder="Email"
              />
              <FloatingLabelInput
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange("phone")}
                placeholder="Teléfono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={handleEventInputChange("notes")}
                placeholder="Información adicional sobre el contacto..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="mt-4 text-xs text-gray-500">
              * Campos obligatorios. Debe introducir al menos email o teléfono.
            </div>
          </div>
        );

      case "property":
        return (
          <div className="space-y-6">
            {/* Contact Type Selection */}
            <div className="space-y-2">
              <Label>Relación con las propiedades</Label>
              <div className="relative h-10 max-w-md flex-1 rounded-lg bg-gray-100 p-1">
                {formData.contactType && (
                  <motion.div
                    className="absolute left-1 top-1 h-8 rounded-md bg-white shadow-sm"
                    animate={{
                      width: "calc(50% - 4px)",
                      x: formData.contactType === "owner" ? "0%" : "100%",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative flex h-full">
                  <button
                    type="button"
                    onClick={() => updateFormData("contactType", "owner")}
                    className={cn(
                      "relative z-10 flex-1 rounded-md text-sm font-medium transition-colors duration-200",
                      formData.contactType === "owner"
                        ? "text-gray-900"
                        : "text-gray-600",
                    )}
                  >
                    Propietario
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFormData("contactType", "buyer")}
                    className={cn(
                      "relative z-10 flex-1 rounded-md text-sm font-medium transition-colors duration-200",
                      formData.contactType === "buyer"
                        ? "text-gray-900"
                        : "text-gray-600",
                    )}
                  >
                    Demandante
                  </button>
                </div>
              </div>
            </div>

            {/* Property Search and Filters */}
            <div className="space-y-4">
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
                      {filters.listingType.length +
                        filters.propertyType.length >
                        0 && (
                        <Badge
                          variant="secondary"
                          className="ml-2 rounded-sm px-1 font-normal"
                        >
                          {filters.listingType.length +
                            filters.propertyType.length}
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
                            <div
                              key={type}
                              className="flex items-center space-x-2"
                            >
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
            </div>

            {/* Property List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {formData.selectedListings.length > 0 ? (
                    <span>{formData.selectedListings.length} propiedades seleccionadas</span>
                  ) : (
                    <span className="text-gray-500">Selecciona propiedades para asociar al contacto (opcional)</span>
                  )}
                </div>
                {validationError && (
                  <div className="flex items-center space-x-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>
              <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-3">
                  {isLoadingListings ? (
                    <div className="flex justify-center py-8">
                      <Loader className="h-6 w-6 animate-spin" />
                    </div>
                  ) : filteredListings.length > 0 ? (
                    filteredListings.map((listing: ListingData) => {
                      const isSelected = formData.selectedListings.includes(
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
                      <Home className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                      <p>No se encontraron propiedades</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        );

      default:
        return <div>Contenido no encontrado</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl">
        <Card className="p-6">
          <div className="mb-6">
            <h1 className="mb-6 text-center text-xl font-semibold text-gray-900">
              CREAR NUEVO CONTACTO
            </h1>

            {/* Progress indicator */}
            <div className="mb-6 flex items-center justify-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      index <= currentStep
                        ? "border-transparent bg-gradient-to-r from-blue-400 to-yellow-300 text-white shadow-lg"
                        : "border-2 border-gray-300 bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step.icon}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 w-16 ${
                        index < currentStep
                          ? "bg-gradient-to-r from-blue-400 to-yellow-300"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="mb-4 text-lg font-medium text-gray-900">
              {steps[currentStep]?.title}
            </h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: direction === "forward" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction === "forward" ? -20 : 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-between border-t pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0 || isCreating}
              className="flex h-10 items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior </span>
            </Button>

            <Button
              onClick={nextStep}
              disabled={isCreating}
              className="flex h-10 items-center space-x-2"
            >
              {isCreating ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Creando contacto...</span>
                </>
              ) : (
                <>
                  <span>
                    {currentStep === steps.length - 1
                      ? "Crear Contacto"
                      : "Siguiente"}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Ownership Confirmation Dialog */}
      <Dialog open={showOwnershipDialog} onOpenChange={setShowOwnershipDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <DialogTitle>Confirmar acción de propiedad</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Has seleccionado propiedades que ya tienen propietario registrado.
              ¿Qué acción deseas realizar?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="flex h-auto flex-col items-start space-y-2 p-4 text-left"
                onClick={() => handleOwnershipAction("change")}
              >
                <div className="font-medium text-gray-900">
                  Cambio de Propietario
                </div>
                <div className="text-sm text-gray-500">
                  Reemplazar el propietario actual con el nuevo contacto
                </div>
              </Button>

              <Button
                variant="outline"
                className="flex h-auto flex-col items-start space-y-2 p-4 text-left"
                onClick={() => handleOwnershipAction("add")}
              >
                <div className="font-medium text-gray-900">
                  Adición de Propietario
                </div>
                <div className="text-sm text-gray-500">
                  Agregar el nuevo contacto como propietario adicional
                </div>
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowOwnershipDialog(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
