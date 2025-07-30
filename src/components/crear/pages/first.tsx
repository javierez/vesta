import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { FloatingLabelInput } from "~/components/ui/floating-label-input";
import { ChevronLeft, ChevronRight, Info, Plus, User } from "lucide-react";
import { cn } from "~/lib/utils";
import { formFormatters } from "~/lib/utils";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { updateProperty } from "~/server/queries/properties";
import { updateListing } from "~/server/queries/listing";
import { updateListingOwners } from "~/server/queries/contact";
import FormSkeleton from "./form-skeleton";
import ContactPopup from "./contact-popup";
import { Checkbox } from "~/components/ui/checkbox";

// Type definitions
interface Contact {
  id: number;
  name: string;
}

interface Agent {
  id: string; // Changed from number to match users.id type
  name: string;
}

interface ListingDetails {
  price?: number | string;
  listingType?: string;
  propertyType?: string;
  propertySubtype?: string;
  agentId?: number | string;
  propertyId?: number | string;
  formPosition?: number;
}

interface GlobalFormData {
  listingDetails?: ListingDetails;
  contacts?: Contact[];
  currentContacts?: string[];
  agents?: Agent[];
}

interface NewContact {
  contactId: number | string;
  firstName: string;
  lastName: string;
}

interface FirstPageProps {
  listingId: string;
  globalFormData: GlobalFormData;
  onNext: () => void;
  onBack?: () => void;
  refreshListingDetails?: () => void;
}

// Form data interface for first page
interface FirstPageFormData {
  price: string;
  listingType: string;
  propertyType: string;
  propertySubtype: string;
  agentId: string;
  selectedContactIds: string[];
}

const initialFormData: FirstPageFormData = {
  price: "",
  listingType: "Sale",
  propertyType: "piso",
  propertySubtype: "",
  agentId: "",
  selectedContactIds: [],
};

export default function FirstPage({
  listingId,
  globalFormData,
  onNext,
  onBack,
  refreshListingDetails,
}: FirstPageProps) {
  const [formData, setFormData] = useState<FirstPageFormData>(initialFormData);
  const [showListingTypeTooltip, setShowListingTypeTooltip] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [localContacts, setLocalContacts] = useState<Contact[]>([]);

  // Fallback price formatting functions in case formFormatters is undefined
  const formatPriceInput = (value: string | number): string => {
    if (!value) return "";
    const numericValue =
      typeof value === "string"
        ? value.replace(/[^\d]/g, "")
        : value.toString();
    if (!numericValue) return "";
    // Add thousand separators
    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return formatted;
  };

  const getNumericPrice = (formattedValue: string): string => {
    return formattedValue.replace(/[^\d]/g, "");
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".tooltip-container")) {
        setShowListingTypeTooltip(false);
      }
    };

    if (showListingTypeTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showListingTypeTooltip]);

  // Use centralized data instead of fetching
  useEffect(() => {
    if (globalFormData?.listingDetails) {
      const details = globalFormData.listingDetails;

      // Convert price from float to integer for display
      let displayPrice = "";
      if (details.price) {
        // If price is a float (e.g., 3.00), convert to integer
        const priceValue =
          typeof details.price === "number"
            ? details.price
            : parseFloat(details.price.toString());
        displayPrice = Math.floor(priceValue).toString();
      }

      // Pre-populate form with existing data
      setFormData((prev) => ({
        ...prev,
        price: displayPrice,
        listingType: details.listingType ?? "Sale",
        propertyType: details.propertyType ?? "piso",
        propertySubtype: details.propertySubtype ?? "",
        agentId: details.agentId ? details.agentId.toString() : "",
        selectedContactIds: globalFormData.currentContacts ?? [],
      }));
    }
  }, [globalFormData]);

  // Sync local contacts with global data
  useEffect(() => {
    if (globalFormData?.contacts) {
      setLocalContacts(globalFormData.contacts);
    }
  }, [globalFormData?.contacts]);

  const updateFormData = (
    field: keyof FirstPageFormData,
    value: string | string[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle price input with formatting
  const handlePriceChange = (value: string) => {
    const numericValue =
      formFormatters?.getNumericPrice(value) || getNumericPrice(value);
    updateFormData("price", numericValue);
  };

  // Filter contacts based on search (using local contacts for immediate updates)
  const filteredContacts = localContacts.filter((contact: Contact) =>
    contact.name.toLowerCase().includes(contactSearch.toLowerCase()),
  );

  // Update the toggle logic and state management
  const handleListingTypeTab = (type: string) => {
    // Reset all secondary toggles
    updateFormData("listingType", type);
  };

  const handleNext = () => {
    // Validate required fields
    if (!formData.price.trim()) {
      alert("Por favor, introduce el precio de la propiedad.");
      return;
    }

    if (!formData.agentId) {
      alert("Por favor, selecciona un agente.");
      return;
    }

    if (formData.selectedContactIds.length === 0) {
      alert("Por favor, selecciona al menos un contacto.");
      return;
    }

    // Navigate IMMEDIATELY (optimistic) - no waiting!
    onNext();

    // Save data in background (completely silent)
    void saveInBackground();
  };

  // Background save function - completely silent and non-blocking
  const saveInBackground = async () => {
    try {
      const promises = [];
      
      // Update property if we have a valid propertyId
      const propertyId = globalFormData?.listingDetails?.propertyId;
      if (propertyId) {
        const updateData: Record<string, unknown> = {
          propertyType: formData.propertyType,
          propertySubtype: formData.propertySubtype || null,
        };

        // Only update formPosition if current position is lower than 2
        const currentPosition = globalFormData?.listingDetails?.formPosition;
        if (!currentPosition || currentPosition < 2) {
          updateData.formPosition = 2;
        }

        promises.push(updateProperty(Number(propertyId), updateData));
      }

      // Update listing if we have valid listingId
      if (listingId) {
        const listingUpdate: {
          price: string;
          listingType: "Sale" | "Rent";
          agentId?: string;
        } = {
          price: formData.price,
          listingType: formData.listingType as "Sale" | "Rent",
        };
        
        // Add agentId if it exists
        if (formData.agentId) {
          listingUpdate.agentId = formData.agentId;
        }
        
        promises.push(updateListing(Number(listingId), listingUpdate));
      }

      // Update listing contacts if we have valid listingId and contacts
      if (listingId && formData.selectedContactIds.length > 0) {
        const validContactIds = formData.selectedContactIds
          .filter((id) => id && !isNaN(Number(id)))
          .map((id) => Number(id));
          
        if (validContactIds.length > 0) {
          promises.push(updateListingOwners(Number(listingId), validContactIds));
        }
      }

      // Execute all promises
      await Promise.all(promises);

      // Refresh global data after successful save
      refreshListingDetails?.();
    } catch (error) {
      console.error("Error saving form data:", error);
      // Silent error - user doesn't know it failed
      // Could implement retry logic here if needed
    }
  };

  const toggleContact = (contactId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedContactIds: prev.selectedContactIds.includes(contactId)
        ? prev.selectedContactIds.filter((id) => id !== contactId)
        : [...prev.selectedContactIds, contactId],
    }));
  };

  const handleContactCreated = (contact: unknown) => {
    console.log("New contact created:", contact);

    // Type guard to check if contact has the expected properties
    const isValidContact = (obj: unknown): obj is NewContact => {
      return (
        typeof obj === "object" &&
        obj !== null &&
        "contactId" in obj &&
        "firstName" in obj &&
        "lastName" in obj
      );
    };

    // Immediately add the new contact to local state for instant UI update
    if (isValidContact(contact)) {
      const newContactForList: Contact = {
        id: Number(contact.contactId),
        name: `${contact.firstName} ${contact.lastName}`,
      };

      setLocalContacts((prev) => [...prev, newContactForList]);

      // Auto-select the new contact
      setFormData((prev) => ({
        ...prev,
        selectedContactIds: [
          ...prev.selectedContactIds,
          contact.contactId.toString(),
        ],
      }));
    }

    // Also refresh the global data for consistency
    refreshListingDetails?.();
  };

  // Show loading only if globalFormData is not ready
  if (!globalFormData?.listingDetails) {
    return <FormSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Price Section */}
      <FloatingLabelInput
        id="price"
        value={
          formFormatters?.formatPriceInput(formData.price) ||
          formatPriceInput(formData.price)
        }
        onChange={handlePriceChange}
        placeholder="Precio (€)"
        type="text"
      />

      {/* Listing Type Section */}
      <div className="space-y-2">
        <div className="mb-4 flex items-center space-x-3">
          <h3 className="text-md font-medium text-gray-900">Tipo de Anuncio</h3>
          <div className="tooltip-container relative">
            <button
              className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
              onClick={() => setShowListingTypeTooltip(!showListingTypeTooltip)}
            >
              <Info className="h-3 w-3" />
            </button>
            {showListingTypeTooltip && (
              <div className="absolute left-0 top-0 z-10 w-72 rounded-lg bg-black p-3 text-xs text-white shadow-lg">
                <p>
                  Al final del proceso podrás duplicar el anuncio para ponerlo
                  en alquiler o venta
                </p>
                <div className="absolute left-3 top-3 h-2 w-2 rotate-45 transform bg-black"></div>
              </div>
            )}
          </div>
        </div>
        <div className="relative h-10 rounded-lg bg-gray-100 p-1">
          <motion.div
            className="absolute left-1 top-1 h-8 w-[calc(50%-2px)] rounded-md bg-white shadow-sm"
            animate={{
              x:
                formData.listingType === "Sale" ||
                formData.listingType === "Transfer"
                  ? 0
                  : "calc(100% - 5px)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <div className="relative flex h-full">
            <button
              onClick={() => handleListingTypeTab("Sale")}
              className={cn(
                "relative z-10 flex-1 rounded-md text-sm font-medium transition-colors duration-200",
                formData.listingType === "Sale" ||
                  formData.listingType === "Transfer"
                  ? "text-gray-900"
                  : "text-gray-600",
              )}
            >
              Venta
            </button>
            <button
              onClick={() => handleListingTypeTab("Rent")}
              className={cn(
                "relative z-10 flex-1 rounded-md text-sm font-medium transition-colors duration-200",
                formData.listingType === "Rent" ||
                  formData.listingType === "RentWithOption" ||
                  formData.listingType === "RoomSharing"
                  ? "text-gray-900"
                  : "text-gray-600",
              )}
            >
              Alquiler
            </button>
          </div>
        </div>
      </div>
      {/* Replace the secondary toggles with checkboxes */}
      {["Rent", "RentWithOption", "RoomSharing"].includes(
        formData.listingType,
      ) && (
        <div className="mb-6 ml-6 flex flex-row items-center gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="roomSharing"
              checked={formData.listingType === "RoomSharing"}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateFormData("listingType", "RoomSharing");
                } else {
                  updateFormData("listingType", "Rent");
                }
              }}
            />
            <label
              htmlFor="roomSharing"
              className="cursor-pointer select-none text-xs text-gray-700"
            >
              Compartir habitación
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="rentWithOption"
              checked={formData.listingType === "RentWithOption"}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateFormData("listingType", "RentWithOption");
                } else {
                  updateFormData("listingType", "Rent");
                }
              }}
            />
            <label
              htmlFor="rentWithOption"
              className="cursor-pointer select-none text-xs text-gray-700"
            >
              Alquiler con opción a compra
            </label>
          </div>
        </div>
      )}
      {["Sale", "Transfer"].includes(formData.listingType) && (
        <div className="mb-6 ml-6 flex flex-row items-center gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="transfer"
              checked={formData.listingType === "Transfer"}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateFormData("listingType", "Transfer");
                } else {
                  updateFormData("listingType", "Sale");
                }
              }}
            />
            <label
              htmlFor="transfer"
              className="cursor-pointer select-none text-xs text-gray-700"
            >
              Transferencia
            </label>
          </div>
        </div>
      )}

      {/* Property Type Section */}
      <div className="space-y-2">
        <h3 className="text-md font-medium text-gray-900">Tipo de Propiedad</h3>
        <div className="relative h-10 rounded-lg bg-gray-100 p-1">
          <motion.div
            className="absolute left-1 top-1 h-8 w-[calc(20%-2px)] rounded-md bg-white shadow-sm"
            animate={{
              x:
                formData.propertyType === "piso"
                  ? 0
                  : formData.propertyType === "casa"
                    ? "100%"
                    : formData.propertyType === "local"
                      ? "200%"
                      : formData.propertyType === "solar"
                        ? "300%"
                        : "400%",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <div className="relative flex h-full">
            <button
              onClick={() => {
                updateFormData("propertyType", "piso");
                updateFormData("propertySubtype", "Piso");
              }}
              className={cn(
                "relative z-10 flex-1 rounded-md text-sm font-medium transition-colors duration-200",
                formData.propertyType === "piso"
                  ? "text-gray-900"
                  : "text-gray-600",
              )}
            >
              Piso
            </button>
            <button
              onClick={() => {
                updateFormData("propertyType", "casa");
                updateFormData("propertySubtype", "Casa");
              }}
              className={cn(
                "relative z-10 flex-1 rounded-md text-sm font-medium transition-colors duration-200",
                formData.propertyType === "casa"
                  ? "text-gray-900"
                  : "text-gray-600",
              )}
            >
              Casa
            </button>
            <button
              onClick={() => {
                updateFormData("propertyType", "local");
                updateFormData("propertySubtype", "Otros");
              }}
              className={cn(
                "relative z-10 flex-1 rounded-md text-sm font-medium transition-colors duration-200",
                formData.propertyType === "local"
                  ? "text-gray-900"
                  : "text-gray-600",
              )}
            >
              Local
            </button>
            <button
              onClick={() => {
                updateFormData("propertyType", "solar");
                updateFormData("propertySubtype", "Suelo residencial");
              }}
              className={cn(
                "relative z-10 flex-1 rounded-md text-sm font-medium transition-colors duration-200",
                formData.propertyType === "solar"
                  ? "text-gray-900"
                  : "text-gray-600",
              )}
            >
              Solar
            </button>
            <button
              onClick={() => {
                updateFormData("propertyType", "garage");
                updateFormData("propertySubtype", "Individual");
              }}
              className={cn(
                "relative z-10 flex-1 rounded-md text-sm font-medium transition-colors duration-200",
                formData.propertyType === "garage"
                  ? "text-gray-900"
                  : "text-gray-600",
              )}
            >
              Garaje
            </button>
          </div>
        </div>
      </div>

      {/* Property Subtype Section */}
      <div className="space-y-2">
        <h3 className="text-md font-medium text-gray-900">
          Subtipo de Propiedad
        </h3>
        <Select
          value={
            formData.propertySubtype ||
            (formData.propertyType === "piso"
              ? "Piso"
              : formData.propertyType === "casa"
                ? "Casa"
                : formData.propertyType === "local"
                  ? "Otros"
                  : formData.propertyType === "solar"
                    ? "Suelo residencial"
                    : formData.propertyType === "garage" ||
                        formData.propertyType === "garaje"
                      ? "Individual"
                      : "")
          }
          onValueChange={(value) => updateFormData("propertySubtype", value)}
        >
          <SelectTrigger className="h-10 border-0 shadow-md">
            <SelectValue placeholder="Seleccionar subtipo" />
          </SelectTrigger>
          <SelectContent>
            {formData.propertyType === "piso" && (
              <>
                <SelectItem value="Tríplex">Tríplex</SelectItem>
                <SelectItem value="Dúplex">Dúplex</SelectItem>
                <SelectItem value="Ático">Ático</SelectItem>
                <SelectItem value="Estudio">Estudio</SelectItem>
                <SelectItem value="Loft">Loft</SelectItem>
                <SelectItem value="Piso">Piso</SelectItem>
                <SelectItem value="Apartamento">Apartamento</SelectItem>
                <SelectItem value="Bajo">Bajo</SelectItem>
              </>
            )}
            {formData.propertyType === "casa" && (
              <>
                <SelectItem value="Casa">Casa</SelectItem>
                <SelectItem value="Casa adosada">Casa adosada</SelectItem>
                <SelectItem value="Casa pareada">Casa pareada</SelectItem>
                <SelectItem value="Chalet">Chalet</SelectItem>
                <SelectItem value="Casa rústica">Casa rústica</SelectItem>
                <SelectItem value="Bungalow">Bungalow</SelectItem>
              </>
            )}
            {formData.propertyType === "local" && (
              <>
                <SelectItem value="Residencial">Residencial</SelectItem>
                <SelectItem value="Otros">Otros</SelectItem>
                <SelectItem value="Mixto residencial">
                  Mixto residencial
                </SelectItem>
                <SelectItem value="Oficinas">Oficinas</SelectItem>
                <SelectItem value="Hotel">Hotel</SelectItem>
              </>
            )}
            {formData.propertyType === "solar" && (
              <>
                <SelectItem value="Suelo residencial">
                  Suelo residencial
                </SelectItem>
                <SelectItem value="Suelo industrial">
                  Suelo industrial
                </SelectItem>
                <SelectItem value="Suelo rústico">Suelo rústico</SelectItem>
              </>
            )}
            {(formData.propertyType === "garage" ||
              formData.propertyType === "garaje") && (
              <>
                <SelectItem value="Moto">Moto</SelectItem>
                <SelectItem value="Doble">Doble</SelectItem>
                <SelectItem value="Individual">Individual</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Agent Section */}
      <div className="space-y-2">
        <h3 className="text-md font-medium text-gray-900">Agente</h3>
        <Select
          value={formData.agentId}
          onValueChange={(value) => updateFormData("agentId", value)}
        >
          <SelectTrigger className="h-10 border-0 shadow-md">
            <SelectValue placeholder="Seleccionar agente" />
          </SelectTrigger>
          <SelectContent>
            {globalFormData?.agents?.map((agent: Agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Contacts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-medium text-gray-900">Contactos</h3>
          <Button
            variant="outline"
            size="sm"
            className="flex h-8 items-center space-x-2"
            onClick={() => setShowContactPopup(true)}
          >
            <Plus className="h-3 w-3" />
            <span>Agregar</span>
          </Button>
        </div>

        {/* Contact Search */}
        <Input
          placeholder="Buscar contactos..."
          value={contactSearch}
          onChange={(e) => setContactSearch(e.target.value)}
          className="h-10 border-0 shadow-md"
        />

        {/* Contact List */}
        <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg p-2 shadow-md">
          {filteredContacts.length === 0 ? (
            <p className="py-3 text-center text-sm text-gray-500">
              No se encontraron contactos
            </p>
          ) : (
            filteredContacts.map((contact: Contact) => (
              <div
                key={contact.id}
                className={cn(
                  "flex cursor-pointer items-center space-x-2 rounded-md p-2 transition-colors",
                  formData.selectedContactIds.includes(contact.id.toString())
                    ? "bg-gray-100"
                    : "hover:bg-gray-50",
                )}
                onClick={() => toggleContact(contact.id.toString())}
              >
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">{contact.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <motion.div
        className="flex justify-between border-t pt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={!onBack}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Anterior</span>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleNext}
            className="flex items-center space-x-1 bg-gray-900 hover:bg-gray-800"
          >
            <span>Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Contact Creation Popup */}
      <ContactPopup
        isOpen={showContactPopup}
        onClose={() => setShowContactPopup(false)}
        onContactCreated={handleContactCreated}
      />
    </div>
  );
}
