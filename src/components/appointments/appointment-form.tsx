"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { FloatingLabelInput } from "~/components/ui/floating-label-input";
import { Textarea } from "~/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Check,
  Loader,
  Search,
  Clock,
  Car,
  Home,
  Users,
  PenTool,
  Handshake,
  Train,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createAppointmentAction,
  updateAppointmentAction,
  validateAppointmentForm,
} from "~/server/actions/appointments";
import { searchContactsWithAuth } from "~/server/queries/contact";
import { listListingsCompactWithAuth } from "~/server/queries/listing";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

// Appointment form data interface from PRP
interface AppointmentFormData {
  contactId: bigint;
  listingId?: bigint;
  leadId?: bigint;
  dealId?: bigint;
  prospectId?: bigint;
  startDate: string; // YYYY-MM-DD format
  startTime: string; // HH:mm format
  endDate: string; // YYYY-MM-DD format
  endTime: string; // HH:mm format
  tripTimeMinutes?: number;
  notes?: string;
  appointmentType: "Visita" | "Reunión" | "Firma" | "Cierre" | "Viaje";
}

interface Contact {
  contactId: bigint;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
}

interface Listing {
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
  imageUrl: string | null;
}

// Props interface
interface AppointmentFormProps {
  initialData?: Partial<AppointmentFormData>;
  onSubmit?: (appointmentId: bigint) => void;
  onCancel?: () => void;
  mode?: "create" | "edit"; // New prop to distinguish between create and edit modes
  appointmentId?: bigint; // Required for edit mode
}

const initialFormData: Omit<AppointmentFormData, "contactId"> = {
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  tripTimeMinutes: 15,
  notes: "",
  appointmentType: "Visita",
};

// Step definitions
interface Step {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    id: "contact",
    title: "Seleccionar Contacto",
    icon: <User className="h-5 w-5" />,
  },
  {
    id: "details",
    title: "Detalles de la Cita",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    id: "confirmation",
    title: "Confirmar",
    icon: <Check className="h-5 w-5" />,
  },
];

const appointmentTypes = [
  {
    value: "Visita",
    label: "Visita",
    color: "bg-blue-100 text-blue-800",
    icon: <Home className="h-4 w-4" />,
  },
  {
    value: "Reunión",
    label: "Reunión",
    color: "bg-purple-100 text-purple-800",
    icon: <Users className="h-4 w-4" />,
  },
  {
    value: "Firma",
    label: "Firma",
    color: "bg-green-100 text-green-800",
    icon: <PenTool className="h-4 w-4" />,
  },
  {
    value: "Cierre",
    label: "Cierre",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Handshake className="h-4 w-4" />,
  },
  {
    value: "Viaje",
    label: "Viaje",
    color: "bg-emerald-100 text-emerald-800",
    icon: <Train className="h-4 w-4" />,
  },
];

export default function AppointmentForm({
  initialData = {},
  onSubmit,
  onCancel,
  mode = "create",
  appointmentId,
}: AppointmentFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<AppointmentFormData>>({
    ...initialFormData,
    ...initialData,
  });
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [isCreating, setIsCreating] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [listingSearchQuery, setListingSearchQuery] = useState("");

  // Fetch last 10 contacts on mount, then fetch when user searches
  useEffect(() => {
    // For initial data with contactId, we need to fetch all contacts to find the match (only once)
    const needsAllContacts =
      initialData.contactId && !selectedContact && contacts.length === 0;
    // For initial load, fetch last 10 contacts
    const isInitialLoad = contacts.length === 0 && searchQuery.length === 0;
    // For search, we fetch based on query
    const hasSearchQuery = searchQuery.length > 0;

    if (!needsAllContacts && !isInitialLoad && !hasSearchQuery) {
      return;
    }

    const fetchContacts = async () => {
      setIsLoadingContacts(true);
      try {
        let contactsData;

        if (needsAllContacts) {
          // For initial data, we need all contacts to find the match
          const { listContactsWithAuth } = await import(
            "~/server/queries/contact"
          );
          contactsData = await listContactsWithAuth();
        } else if (isInitialLoad) {
          // For initial load, get last 10 contacts
          const { listContactsWithAuth } = await import(
            "~/server/queries/contact"
          );
          contactsData = await listContactsWithAuth(1, 10); // page 1, limit 10
        } else {
          // For search, use the optimized search function
          contactsData = await searchContactsWithAuth(searchQuery.trim());
        }

        setContacts(contactsData);

        // Set selected contact from initial data if provided and not already set
        if (initialData.contactId && !selectedContact) {
          const matchedContact = contactsData.find(
            (contact) => contact.contactId === initialData.contactId,
          );
          if (matchedContact) {
            setSelectedContact(matchedContact);
            // Don't set search query - let user search freely
          }
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
        setContacts([]);
      } finally {
        setIsLoadingContacts(false);
      }
    };

    // Debounce the search to avoid too many requests (but not for initial loads)
    if (needsAllContacts || isInitialLoad) {
      void fetchContacts();
    } else {
      const debounceTimer = setTimeout(() => {
        void fetchContacts();
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, initialData.contactId, selectedContact, contacts.length]);

  // Fetch last 10 listings on mount when on step 2, then fetch when user searches
  useEffect(() => {
    // For initial data with listingId, we need to fetch all listings to find the match (only once)
    const needsAllListings =
      initialData.listingId && !selectedListing && listings.length === 0;
    // For initial load on step 2, fetch last 10 listings
    const isInitialLoad =
      currentStep === 1 &&
      listings.length === 0 &&
      listingSearchQuery.length === 0;
    // For search, we fetch based on query
    const hasSearchQuery = listingSearchQuery.length > 0;

    if (!needsAllListings && !isInitialLoad && !hasSearchQuery) {
      return;
    }

    const fetchListings = async () => {
      setIsLoadingListings(true);
      try {
        let listingsData;

        if (needsAllListings) {
          // For initial data, we need all listings to find the match
          listingsData = await listListingsCompactWithAuth({
            status: "Active",
          });
        } else if (isInitialLoad) {
          // For initial load on step 2, get last 10 listings
          listingsData = await listListingsCompactWithAuth({
            status: "Active",
            page: 1,
            limit: 10,
          });
          console.log("Initial load listings:", listingsData);
        } else {
          // For search, use optimized search with query
          listingsData = await listListingsCompactWithAuth({
            status: "Active",
            searchQuery: listingSearchQuery.trim(),
          });
        }

        setListings(listingsData);

        // Set selected listing from initial data if provided and not already set
        if (initialData.listingId && !selectedListing) {
          const matchedListing = listingsData.find(
            (listing) => listing.listingId === initialData.listingId,
          );
          if (matchedListing) {
            setSelectedListing(matchedListing);
            // Don't set search query - let user search freely
          }
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
        setListings([]);
      } finally {
        setIsLoadingListings(false);
      }
    };

    // Debounce the search to avoid too many requests (but not for initial loads)
    if (needsAllListings || isInitialLoad) {
      void fetchListings();
    } else {
      const debounceTimer = setTimeout(() => {
        void fetchListings();
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [
    listingSearchQuery,
    initialData.listingId,
    currentStep,
    selectedListing,
    listings.length,
  ]);

  // Filter contacts based on search query and exclude selected contact
  const filteredContacts = contacts.filter((contact) => {
    // Exclude selected contact from search results
    if (selectedContact && contact.contactId === selectedContact.contactId) {
      return false;
    }

    // If no search query, show all contacts
    if (searchQuery.length === 0) {
      return true;
    }

    return (
      `${contact.firstName} ${contact.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false) ||
      (contact.phone?.includes(searchQuery) ?? false)
    );
  });

  // Filter listings based on search query and exclude selected listing
  const filteredListings = listings.filter((listing) => {
    // Exclude selected listing from search results
    if (selectedListing && listing.listingId === selectedListing.listingId) {
      return false;
    }

    // If no search query, show all listings
    if (listingSearchQuery.length === 0) {
      return true;
    }

    return (
      listing.title?.toLowerCase().includes(listingSearchQuery.toLowerCase()) ??
      listing.referenceNumber
        ?.toLowerCase()
        .includes(listingSearchQuery.toLowerCase()) ??
      listing.city?.toLowerCase().includes(listingSearchQuery.toLowerCase())
    );
  });

  // Generate time options (15-minute intervals)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        options.push(time);
      }
    }
    return options;
  };

  // Handle input changes
  const handleInputChange =
    (field: keyof AppointmentFormData) => (value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setValidationError(null);

      // Clear listing selection if appointment type changes from "Visita"
      if (field === "appointmentType" && value !== "Visita") {
        handleClearListing();
      }
    };

  // Handle contact selection
  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setFormData((prev) => ({ ...prev, contactId: contact.contactId }));
    // Don't modify search query - keep it as is for future searches
    setValidationError(null);
  };

  // Handle clearing contact selection
  const handleClearContact = () => {
    setSelectedContact(null);
    setFormData((prev) => ({ ...prev, contactId: undefined }));
    setSearchQuery("");
    setContacts([]);
    setValidationError(null);
  };

  // Handle listing selection
  const handleListingSelect = (listing: Listing) => {
    setSelectedListing(listing);
    setFormData((prev) => ({ ...prev, listingId: listing.listingId }));
    // Don't modify search query - keep it as is for future searches
    setValidationError(null);
  };

  // Handle clearing listing selection
  const handleClearListing = () => {
    setSelectedListing(null);
    setFormData((prev) => ({ ...prev, listingId: undefined }));
    setListingSearchQuery("");
    setValidationError(null);
  };

  // Step validation
  const validateCurrentStep = async () => {
    switch (currentStep) {
      case 0: // Contact selection
        if (!formData.contactId) {
          setValidationError("Debe seleccionar un contacto");
          return false;
        }
        return true;
      case 1: // Details
        // Check if listing is required for "Visita" appointments
        if (formData.appointmentType === "Visita" && !formData.listingId) {
          setValidationError("Debe seleccionar una propiedad para las visitas");
          return false;
        }

        const validation = await validateAppointmentForm(
          formData as AppointmentFormData,
        );
        if (!validation.valid) {
          setValidationError(validation.errors[0] ?? "Datos incompletos");
          return false;
        }
        return true;
      case 2: // Confirmation
        return true;
      default:
        return true;
    }
  };

  // Navigation handlers
  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length - 1) {
      setDirection("forward");
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection("backward");
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Form submission
  const handleSubmit = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setIsCreating(true);
    try {
      let result;

      if (mode === "edit" && appointmentId) {
        // Update existing appointment
        console.log(
          "Updating appointment in edit mode with ID:",
          appointmentId,
        );
        result = await updateAppointmentAction(
          appointmentId,
          formData as AppointmentFormData,
        );
      } else {
        // Create new appointment
        console.log("Creating new appointment in create mode");
        result = await createAppointmentAction(formData as AppointmentFormData);
      }

      if (result.success) {
        onSubmit?.(result.appointmentId!);
      } else {
        setValidationError(result.error ?? "Error desconocido");
      }
    } catch (error) {
      const errorMessage =
        mode === "edit"
          ? "Error al actualizar la cita"
          : "Error al crear la cita";
      setValidationError(errorMessage);
      console.error(
        `Error ${mode === "edit" ? "updating" : "creating"} appointment:`,
        error,
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Contact Selection
        return (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="contact-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar contactos..."
                className="h-9 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {selectedContact && (
              // Show selected contact
              <div className="rounded-lg border border-primary bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">
                        {selectedContact.firstName} {selectedContact.lastName}
                      </div>
                      {selectedContact.email && (
                        <div className="text-sm text-muted-foreground">
                          {selectedContact.email}
                        </div>
                      )}
                      {selectedContact.phone && (
                        <div className="text-sm text-muted-foreground">
                          {selectedContact.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearContact}
                    className="h-8 w-8 p-0"
                    title="Cambiar contacto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <ScrollArea className="h-[300px]">
              {isLoadingContacts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredContacts.length === 0 && searchQuery.length > 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No se encontraron contactos
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.contactId.toString()}
                      className="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted"
                      onClick={() => handleContactSelect(contact)}
                    >
                      <div className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </div>
                      {contact.email && (
                        <div className="text-sm text-muted-foreground">
                          {contact.email}
                        </div>
                      )}
                      {contact.phone && (
                        <div className="text-sm text-muted-foreground">
                          {contact.phone}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        );

      case 1: // Details
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FloatingLabelInput
                id="startDate"
                value={formData.startDate ?? ""}
                onChange={handleInputChange("startDate")}
                placeholder="Fecha de inicio"
                type="date"
                required
              />
              <FloatingLabelInput
                id="endDate"
                value={formData.endDate ?? ""}
                onChange={handleInputChange("endDate")}
                placeholder="Fecha de fin"
                type="date"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora de inicio</label>
                <Select
                  value={formData.startTime}
                  onValueChange={handleInputChange("startTime")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hora" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {generateTimeOptions().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hora de fin</label>
                <Select
                  value={formData.endTime}
                  onValueChange={handleInputChange("endTime")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hora" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {generateTimeOptions().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de cita</label>
              <Select
                value={formData.appointmentType}
                onValueChange={handleInputChange("appointmentType")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Listing selection - only show for "Visita" appointments */}
            {formData.appointmentType === "Visita" && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Home className="h-4 w-4" />
                  Seleccionar Propiedad
                </label>
                {!selectedListing && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={listingSearchQuery}
                      onChange={(e) => setListingSearchQuery(e.target.value)}
                      placeholder="Buscar propiedades..."
                      className="h-9 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                )}

                {selectedListing && (
                  // Show selected listing
                  <div className="rounded-lg border border-primary bg-primary/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Home className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">
                            {selectedListing.title ??
                              `${selectedListing.propertyType} en ${selectedListing.city}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Ref: {selectedListing.referenceNumber} •{" "}
                            {selectedListing.city} • €{selectedListing.price}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {selectedListing.bedrooms &&
                              `${selectedListing.bedrooms} hab`}
                            {selectedListing.bathrooms &&
                              ` • ${selectedListing.bathrooms} baños`}
                            {selectedListing.squareMeter &&
                              ` • ${selectedListing.squareMeter}m²`}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearListing}
                        className="h-8 w-8 p-0"
                        title="Cambiar propiedad"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {!selectedListing && (
                  <ScrollArea className="h-[180px]">
                    {isLoadingListings ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader className="h-6 w-6 animate-spin" />
                      </div>
                    ) : filteredListings.length === 0 &&
                      listingSearchQuery.length > 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        No se encontraron propiedades
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredListings.map((listing) => (
                          <div
                            key={listing.listingId.toString()}
                            className="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted"
                            onClick={() => handleListingSelect(listing)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="font-medium">
                                  {listing.title ??
                                    `${listing.propertyType} en ${listing.city}`}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Ref: {listing.referenceNumber} •{" "}
                                  {listing.city} • €{listing.price}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {listing.bedrooms &&
                                    `${listing.bedrooms} hab`}
                                  {listing.bathrooms &&
                                    ` • ${listing.bathrooms} baños`}
                                  {listing.squareMeter &&
                                    ` • ${listing.squareMeter}m²`}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                )}
              </div>
            )}

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Car className="h-4 w-4" />
                Tiempo de viaje (minutos)
              </label>
              <input
                id="tripTimeMinutes"
                value={formData.tripTimeMinutes?.toString() ?? ""}
                onChange={(e) =>
                  handleInputChange("tripTimeMinutes")(
                    parseInt(e.target.value) ?? 0,
                  )
                }
                placeholder="0"
                type="number"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notas</label>
              <Textarea
                value={formData.notes ?? ""}
                onChange={(e) => handleInputChange("notes")(e.target.value)}
                placeholder="Notas adicionales sobre la cita..."
                className="min-h-[80px]"
              />
            </div>
          </div>
        );

      case 2: // Confirmation
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Confirmar Cita</h3>
              <p className="text-muted-foreground">
                Revise los detalles antes de crear la cita
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {selectedContact?.firstName} {selectedContact?.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedContact?.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {formData.startDate} • {formData.startTime} -{" "}
                    {formData.endTime}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {
                      appointmentTypes.find(
                        (t) => t.value === formData.appointmentType,
                      )?.label
                    }
                  </div>
                </div>
              </div>

              {selectedListing && formData.appointmentType === "Visita" && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Home className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {selectedListing.title ??
                        `${selectedListing.propertyType} en ${selectedListing.city}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Ref: {selectedListing.referenceNumber} • €
                      {selectedListing.price}
                    </div>
                  </div>
                </div>
              )}

              {formData.tripTimeMinutes && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Car className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Tiempo de viaje</div>
                    <div className="text-sm text-muted-foreground">
                      {formData.tripTimeMinutes} minutos
                    </div>
                  </div>
                </div>
              )}

              {formData.notes && (
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Notas</div>
                    <div className="text-sm text-muted-foreground">
                      {formData.notes}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-8">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step.id} className="flex items-center space-x-2">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isActive &&
                      "border-primary bg-primary text-primary-foreground",
                    isCompleted && "border-green-500 bg-green-500 text-white",
                    !isActive && !isCompleted && "border-muted bg-background",
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : step.icon}
                </div>
                <div
                  className={cn(
                    "hidden text-sm font-medium sm:block",
                    isActive && "text-primary",
                    isCompleted && "text-green-600",
                    !isActive && !isCompleted && "text-muted-foreground",
                  )}
                >
                  {step.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex flex-1 flex-col space-y-6 overflow-hidden">
        <div className="flex-1 overflow-auto">
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

        {/* Validation Error */}
        {validationError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {validationError}
          </div>
        )}

        {/* Navigation Buttons - Fixed at bottom */}
        <div className="flex items-center justify-between border-t bg-background pt-6">
          <div>
            {currentStep > 0 ? (
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
            ) : (
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < steps.length - 1 ? (
              <Button onClick={nextStep}>
                Siguiente
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isCreating}
                className="min-w-[120px]"
              >
                {isCreating ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : mode === "edit" ? (
                  "Actualizar"
                ) : (
                  "Crear Cita"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
