import { useState, useEffect } from "react";
import { useEnterKeyNavigation } from "~/hooks/useEnterKeyNavigation";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import {
  ChevronLeft,
  GraduationCap,
  PawPrint,
  Zap,
  Car,
  Package,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { updateProperty } from "~/server/queries/properties";
import { createListing, updateListingWithAuth } from "~/server/queries/listing";
import { formFormatters } from "~/lib/utils";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import FormSkeleton from "./form-skeleton";

// Type definitions
interface ListingDetails {
  propertyType?: string;
  listingType?: string;
  listingId?: number | string;
  propertyId?: number | string;
  agentId?: number | string;
  formPosition?: number;
  hasKeys?: boolean;
  studentFriendly?: boolean;
  petsAllowed?: boolean;
  appliancesIncluded?: boolean;
  isFurnished?: boolean;
  furnitureQuality?: string;
  optionalGaragePrice?: number | string;
  optionalStorageRoomPrice?: number | string;
  price?: number | string;
  internet?: boolean;
  hasGarage?: boolean;
  hasStorageRoom?: boolean;
}

interface GlobalFormData {
  listingDetails?: ListingDetails | null;
}

interface RentPageProps {
  listingId?: string; // Made optional since it's unused
  globalFormData: GlobalFormData;
  onNext?: () => void; // Made optional since it's unused
  onBack?: () => void;
  refreshListingDetails?: () => void;
}

interface RentPageFormData {
  hasKeys: boolean;
  studentFriendly: boolean;
  petsAllowed: boolean;
  appliancesIncluded: boolean;
  isFurnished: boolean;
  furnitureQuality: string;
  optionalGaragePrice: number;
  optionalStorageRoomPrice: number;
  rentalPrice: number;
  duplicateForRent: boolean;
  internet: boolean;
}

const initialFormData: RentPageFormData = {
  hasKeys: false,
  studentFriendly: false,
  petsAllowed: false,
  appliancesIncluded: false,
  isFurnished: false,
  furnitureQuality: "",
  optionalGaragePrice: 0,
  optionalStorageRoomPrice: 0,
  rentalPrice: 0,
  duplicateForRent: false,
  internet: false,
};

export default function RentPage({
  globalFormData,
  onBack,
  refreshListingDetails,
}: RentPageProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<RentPageFormData>(initialFormData);
  const [propertyType, setPropertyType] = useState<string>("");
  const [isSaleListing, setIsSaleListing] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const updateFormData = (field: keyof RentPageFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Use centralized data instead of fetching
  useEffect(() => {
    if (globalFormData?.listingDetails) {
      const details = globalFormData.listingDetails;
      setPropertyType(details.propertyType ?? "");
      setIsSaleListing(details.listingType === "Sale");
      setFormData((prev) => ({
        ...prev,
        hasKeys: details.hasKeys ?? false,
        studentFriendly: details.studentFriendly ?? false,
        petsAllowed: details.petsAllowed ?? false,
        appliancesIncluded: details.appliancesIncluded ?? false,
        isFurnished: details.isFurnished ?? false,
        furnitureQuality: details.furnitureQuality ?? "",
        optionalGaragePrice: Number(details.optionalGaragePrice) || 0,
        optionalStorageRoomPrice: Number(details.optionalStorageRoomPrice) || 0,
        rentalPrice: Number(details.price) || 0,
        internet: details.internet ?? false,
      }));
    }
  }, [globalFormData?.listingDetails]);

  // Add Enter key navigation (same as clicking Finalizar)
  useEnterKeyNavigation(handleNext);

  // Handle price input with formatting for garage and storage room
  const handleGaragePriceChange = formFormatters.handleNumericPriceInputChange(
    (value) => updateFormData("optionalGaragePrice", value),
  );

  const handleStorageRoomPriceChange =
    formFormatters.handleNumericPriceInputChange((value) =>
      updateFormData("optionalStorageRoomPrice", value),
    );

  const handleRentalPriceChange = formFormatters.handleNumericPriceInputChange(
    (value) => updateFormData("rentalPrice", value),
  );

  const handleNext = () => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    // Validate rental price if creating rental listing
    if (
      isSaleListing &&
      formData.duplicateForRent &&
      formData.rentalPrice <= 0
    ) {
      alert("Por favor, introduce el precio del alquiler.");
      return;
    }

    // Set submitting state
    setIsSubmitting(true);

    // Navigate IMMEDIATELY (optimistic) - finish form instantly!
    if (globalFormData?.listingDetails?.listingId) {
      router.push(`/propiedades/${globalFormData.listingDetails.listingId}`);
    }

    // Save data in background (completely silent)
    void saveInBackground();
  };

  // Background save function - completely silent and non-blocking
  const saveInBackground = async () => {
    try {
      // Fire and forget - no await, no blocking!
      if (globalFormData?.listingDetails?.propertyId) {
        const listingDetails = globalFormData.listingDetails;

        // Update property form position
        await updateProperty(Number(listingDetails.propertyId), {
          formPosition:
            !listingDetails.formPosition || listingDetails.formPosition < 12
              ? 12
              : listingDetails.formPosition,
        });

        // Refresh global data after successful save
        refreshListingDetails?.();

        // Update the sale listing status to 'Active'
        if (listingDetails.listingId) {
          await updateListingWithAuth(Number(listingDetails.listingId), {
            status: "Active",
            internet: formData.internet,
          });
        }

        // Only create rental listing if it's a sale property and user wants to duplicate for rent
        if (
          isSaleListing &&
          formData.duplicateForRent &&
          listingDetails.agentId &&
          listingDetails.propertyId
        ) {
          const rentListingData = {
            propertyId: BigInt(listingDetails.propertyId),
            listingType: "Rent" as const,
            price: formData.rentalPrice.toString(),
            agentId: listingDetails.agentId?.toString() ?? "",
            studentFriendly: formData.studentFriendly,
            petsAllowed: formData.petsAllowed,
            appliancesIncluded: formData.appliancesIncluded,
            internet: formData.internet,
            optionalGaragePrice: formData.optionalGaragePrice.toString(),
            optionalStorageRoomPrice:
              formData.optionalStorageRoomPrice.toString(),
            hasKeys: false,
            optionalStorageRoom: false,
            status: "Active" as const,
            isActive: true,
            isFeatured: false,
            isBankOwned: false,
            visibilityMode: 1,
            isFurnished: formData.isFurnished,
            furnitureQuality: formData.furnitureQuality,
            viewCount: 0,
            inquiryCount: 0,
          };

          await createListing(rentListingData);
        }
      }
    } catch (error) {
      console.error("Error saving form data:", error);
      // Silent error - user doesn't know it failed
      // Could implement retry logic here if needed
    }
  };

  if (globalFormData?.listingDetails === null) {
    return <FormSkeleton />;
  }

  // If it's a sale listing, show the Apple-like UI
  if (isSaleListing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-6"
      >
        <motion.div
          className="space-y-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-gray-900">
            ¿También para alquiler?
          </h2>
        </motion.div>

        <motion.div
          className="flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="relative h-12 w-full max-w-sm rounded-lg bg-gray-100 p-1">
            <motion.div
              className="absolute left-1 top-1 h-10 w-[calc(50%-2px)] rounded-md bg-gradient-to-r from-blue-400 to-yellow-300 shadow-sm"
              animate={{
                x: formData.duplicateForRent ? "calc(100% - 5px)" : 0,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <div className="relative flex h-full">
              <button
                type="button"
                onClick={() => updateFormData("duplicateForRent", false)}
                className={cn(
                  "relative z-10 flex-1 rounded-md text-sm font-medium transition-colors duration-200",
                  !formData.duplicateForRent ? "text-white" : "text-gray-400",
                )}
              >
                Solo Venta
              </button>
              <button
                type="button"
                onClick={() => updateFormData("duplicateForRent", true)}
                className={cn(
                  "relative z-10 flex-1 rounded-md text-sm font-medium transition-colors duration-200",
                  formData.duplicateForRent ? "text-white" : "text-gray-400",
                )}
              >
                También Alquiler
              </button>
            </div>
          </div>
        </motion.div>

        {/* Show rental characteristics when toggle is set to "También Alquiler" */}
        {formData.duplicateForRent && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            {/* Rental Price - Mandatory */}
            <div className="rounded-lg border-2 bg-blue-50 p-4 shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  Precio del Alquiler
                </h4>
              </div>
              <Input
                type="text"
                value={formFormatters.formatPriceInput(formData.rentalPrice)}
                onChange={handleRentalPriceChange}
                placeholder="0 €"
                className="h-10 border-0 bg-white text-sm shadow-md"
              />
            </div>

            {/* Garage Price - Hide for solar and garage properties */}
            {propertyType !== "solar" &&
              propertyType !== "garage" &&
              globalFormData?.listingDetails?.hasGarage && (
                <div className="rounded-lg p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-xs font-medium text-gray-600">
                      Garaje (€/mes)
                    </h4>
                    <Car className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    value={formFormatters.formatPriceInput(
                      formData.optionalGaragePrice,
                    )}
                    onChange={handleGaragePriceChange}
                    placeholder="0 €"
                    className="h-8 border-0 text-xs shadow-md"
                  />
                </div>
              )}

            {/* Storage Room Price - Hide for solar and garage properties */}
            {propertyType !== "solar" &&
              propertyType !== "garage" &&
              globalFormData?.listingDetails?.hasStorageRoom && (
                <div className="rounded-lg p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-xs font-medium text-gray-600">
                      Trastero (€/mes)
                    </h4>
                    <Package className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    value={formFormatters.formatPriceInput(
                      formData.optionalStorageRoomPrice,
                    )}
                    onChange={handleStorageRoomPriceChange}
                    placeholder="0 €"
                    className="h-8 border-0 text-xs shadow-md"
                  />
                </div>
              )}

            {/* Rental Characteristics - Hide for solar and garage properties */}
            {propertyType !== "solar" && propertyType !== "garage" && (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Student Friendly - Hide for local properties */}
                  {propertyType !== "local" && (
                    <div className="space-y-4 rounded-lg p-4 shadow-md">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-xs font-medium text-gray-600">
                          Estudiantes
                        </h4>
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="studentFriendly"
                          checked={formData.studentFriendly}
                          onCheckedChange={(checked) =>
                            updateFormData("studentFriendly", !!checked)
                          }
                        />
                        <Label htmlFor="studentFriendly" className="text-sm">
                          Admite estudiantes
                        </Label>
                      </div>
                    </div>
                  )}

                  {/* Pets Allowed - Hide for local properties */}
                  {propertyType !== "local" && (
                    <div className="space-y-4 rounded-lg p-4 shadow-md">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-xs font-medium text-gray-600">
                          Mascotas
                        </h4>
                        <PawPrint className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="petsAllowed"
                          checked={formData.petsAllowed}
                          onCheckedChange={(checked) =>
                            updateFormData("petsAllowed", !!checked)
                          }
                        />
                        <Label htmlFor="petsAllowed" className="text-sm">
                          Admite mascotas
                        </Label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Appliances Included - Show for all property types except solar and garage */}
                <div className="space-y-4 rounded-lg p-4 shadow-md">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-xs font-medium text-gray-600">
                      Electrodomésticos
                    </h4>
                    <Zap className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="appliancesIncluded"
                        checked={formData.appliancesIncluded}
                        onCheckedChange={(checked) =>
                          updateFormData("appliancesIncluded", !!checked)
                        }
                      />
                      <Label htmlFor="appliancesIncluded" className="text-sm">
                        Incluye electrodomésticos
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="internet"
                        checked={formData.internet}
                        onCheckedChange={(checked) =>
                          updateFormData("internet", !!checked)
                        }
                      />
                      <Label htmlFor="internet" className="text-sm">
                        Incluye internet
                      </Label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

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

          <motion.div
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          >
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center space-x-1 bg-gray-900 hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Finalizando...</span>
                </>
              ) : (
                <span>Finalizar</span>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // If it's a rent listing, show the rental characteristics
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      <motion.div
        className="space-y-1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-gray-900">
          Propiedades del Alquiler
        </h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {/* Rental Characteristics - Hide for solar and garage properties */}
        {propertyType !== "solar" && propertyType !== "garage" && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Student Friendly - Hide for local properties */}
              {propertyType !== "local" && (
                <div className="space-y-4 rounded-lg p-4 shadow-md">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-xs font-medium text-gray-600">
                      Estudiantes
                    </h4>
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="studentFriendly"
                      checked={formData.studentFriendly}
                      onCheckedChange={(checked) =>
                        updateFormData("studentFriendly", !!checked)
                      }
                    />
                    <Label htmlFor="studentFriendly" className="text-sm">
                      Admite estudiantes
                    </Label>
                  </div>
                </div>
              )}

              {/* Pets Allowed - Hide for local properties */}
              {propertyType !== "local" && (
                <div className="space-y-4 rounded-lg p-4 shadow-md">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-xs font-medium text-gray-600">
                      Mascotas
                    </h4>
                    <PawPrint className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="petsAllowed"
                      checked={formData.petsAllowed}
                      onCheckedChange={(checked) =>
                        updateFormData("petsAllowed", !!checked)
                      }
                    />
                    <Label htmlFor="petsAllowed" className="text-sm">
                      Admite mascotas
                    </Label>
                  </div>
                </div>
              )}
            </div>

            {/* Appliances Included - Show for all property types except solar and garage */}
            <div className="space-y-4 rounded-lg p-4 shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-medium text-gray-600">
                  Electrodomésticos
                </h4>
                <Zap className="h-4 w-4 text-gray-400" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="appliancesIncluded"
                    checked={formData.appliancesIncluded}
                    onCheckedChange={(checked) =>
                      updateFormData("appliancesIncluded", !!checked)
                    }
                  />
                  <Label htmlFor="appliancesIncluded" className="text-sm">
                    Incluye electrodomésticos
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="internet"
                    checked={formData.internet}
                    onCheckedChange={(checked) =>
                      updateFormData("internet", !!checked)
                    }
                  />
                  <Label htmlFor="internet" className="text-sm">
                    Incluye internet
                  </Label>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Removed saveError state and AnimatePresence notification */}

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

        <motion.div
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        >
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center space-x-1 bg-gray-900 hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Finalizando...</span>
              </>
            ) : (
              <span>Finalizar</span>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
