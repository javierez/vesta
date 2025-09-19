"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "~/components/ui/card";
import { Loader, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  getListingDetailsWithAuth,
  getAllAgentsWithAuth,
} from "~/server/queries/listing";
import { FormProvider, useFormContext, type CompleteFormData } from "~/components/crear/form-context";
import CloseConfirmationDialog from "~/components/crear/close-confirmation-dialog";
import FirstPage from "~/components/crear/pages/first";
import SecondPage from "~/components/crear/pages/second";
import ThirdPage from "~/components/crear/pages/third";
import { saveQuickFormData } from "~/server/queries/forms/quickform/save-quick-form";
import RegistrationProgressBar from "./registration-progress-bar";

interface QuickRegistrationFormProps {
  listingId: string;
}

// Interface for listing details data returned from database
interface ListingDetailsData {
  // Listing fields
  listingId?: number;
  propertyId?: number;
  agentId?: number;
  listingType?: string;
  price?: number;
  status?: string;
  
  // Property fields
  referenceNumber?: string;
  title?: string;
  description?: string;
  propertyType?: string;
  propertySubtype?: string;
  bedrooms?: number;
  bathrooms?: number;
  totalSurface?: number;
  usefulSurface?: number;
  buildYear?: number;
  renovationYear?: number;
  isRenovated?: boolean;
  conservationStatus?: number;
  
  // Location fields
  address?: string;
  addressDetails?: string;
  city?: string;
  province?: string;
  municipality?: string;
  postalCode?: string;
  neighborhood?: string;
  
  // Cadastral and geographic data
  latitude?: number;
  longitude?: number;
  cadastralReference?: string;
  
  // Form meta
  formPosition?: number;
  
  // Allow for additional properties from database
  [key: string]: unknown;
}

// Step definitions for registration (only 3 steps)
interface Step {
  id: string;
  title: string;
}

const registrationSteps: Step[] = [
  { id: "basic", title: "Información Básica" },
  { id: "details", title: "Detalles de la Propiedad" },
  { id: "address", title: "Dirección" },
];

// Convert fetched database data to CompleteFormData format
function convertFetchedDataToFormData(listingDetails: ListingDetailsData | null): CompleteFormData {
  if (!listingDetails) return {};
  
  return {
    // Meta data
    formPosition: Math.min(listingDetails.formPosition ?? 1, 3), // Max 3 for registration
    
    // Page 1 - Basic Info & IDs
    propertyId: listingDetails.propertyId,
    listingId: listingDetails.listingId,
    price: listingDetails.price?.toString() ?? "",
    listingType: listingDetails.listingType ?? "Sale", 
    propertyType: listingDetails.propertyType ?? "piso",
    propertySubtype: listingDetails.propertySubtype ?? "",
    agentId: listingDetails.agentId?.toString() ?? "",
    
    // Page 2 - Details  
    bedrooms: listingDetails.bedrooms ?? undefined,
    bathrooms: listingDetails.bathrooms ?? undefined,
    totalSurface: listingDetails.totalSurface ?? undefined,
    usefulSurface: listingDetails.usefulSurface ?? undefined,
    buildYear: listingDetails.buildYear ?? undefined,
    renovationYear: listingDetails.renovationYear ?? undefined,
    isRenovated: listingDetails.isRenovated ?? false,
    conservationStatus: listingDetails.conservationStatus ?? 3,
    
    // Page 3 - Address
    address: listingDetails.address ?? "",
    addressDetails: listingDetails.addressDetails ?? "",
    city: listingDetails.city ?? "",
    province: listingDetails.province ?? "",
    municipality: listingDetails.municipality ?? "",
    postalCode: listingDetails.postalCode ?? "",
    neighborhood: listingDetails.neighborhood ?? "",
    
    // Cadastral and geographic data
    latitude: listingDetails.latitude ?? undefined,
    longitude: listingDetails.longitude ?? undefined,
    cadastralReference: listingDetails.cadastralReference ?? "",
  };
}


// Inner component that uses the form context
function QuickRegistrationFormInner({ listingId }: QuickRegistrationFormProps) {
  const { state, setInitialData, setLoading, updateFormData } = useFormContext();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle close button click - show confirmation dialog
  const handleCloseForm = () => {
    setShowCloseConfirmation(true);
  };

  // Handle save and close action
  const handleSaveAndClose = async () => {
    router.push("/propiedades");
  };

  // Handle discard and close action
  const handleDiscardAndClose = () => {
    router.push("/propiedades");
  };

  // Handle close confirmation dialog close
  const handleCloseConfirmationDialog = () => {
    setShowCloseConfirmation(false);
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel (no currentContacts since this is a new property)
        const [listingDetails, agents] =
          await Promise.all([
            getListingDetailsWithAuth(Number(listingId)),
            getAllAgentsWithAuth(),
          ]);

        // Set current step based on form position (max 3 for registration)
        const typedListingDetails = listingDetails as ListingDetailsData | null;
        
        console.log("=== FETCHED LISTING DETAILS ===");
        console.log("Raw listingDetails from DB:", listingDetails);
        console.log("typedListingDetails:", typedListingDetails);
        console.log("propertyId from DB:", typedListingDetails?.propertyId);
        console.log("typeof propertyId from DB:", typeof typedListingDetails?.propertyId);
        console.log("listingId from DB:", typedListingDetails?.listingId);
        console.log("typeof listingId from DB:", typeof typedListingDetails?.listingId);
        console.log("URL listingId parameter:", listingId);
        console.log("typeof URL listingId parameter:", typeof listingId);
        
        if (typedListingDetails?.formPosition) {
          const stepIndex = Math.max(
            0,
            Math.min(typedListingDetails.formPosition - 1, registrationSteps.length - 1),
          );
          setCurrentStep(stepIndex);
        }

        // Convert fetched data and set as local working copy
        const convertedFormData = convertFetchedDataToFormData(typedListingDetails);
        console.log("=== CONVERTED FORM DATA ===");
        console.log("convertedFormData:", convertedFormData);
        console.log("convertedFormData.propertyId:", convertedFormData.propertyId);
        
        setInitialData({
          fetchedFormData: convertedFormData,
          agents: agents.map((agent) => ({
            id: agent.id,
            name: agent.name,
          })),
          currentContacts: [], // New property has no existing owners
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchAllData();
  }, [listingId, setInitialData, setLoading]);

  // Save all data when registration is complete
  const saveRegistrationData = useCallback(async () => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      
      console.log("=== STARTING SAVE REGISTRATION DATA ===");
      console.log("Listing ID:", listingId);
      console.log("Current Form State:", state.formData);
      console.log("Form Data Keys:", Object.keys(state.formData));
      console.log("Form Data Details:", {
        // Page 1 data
        price: state.formData.price,
        listingType: state.formData.listingType,
        propertyType: state.formData.propertyType,
        propertySubtype: state.formData.propertySubtype,
        agentId: state.formData.agentId,
        selectedContactIds: state.formData.selectedContactIds,
        // Page 2 data
        bedrooms: state.formData.bedrooms,
        bathrooms: state.formData.bathrooms,
        totalSurface: state.formData.totalSurface,
        usefulSurface: state.formData.usefulSurface,
        buildYear: state.formData.buildYear,
        renovationYear: state.formData.renovationYear,
        conservationStatus: state.formData.conservationStatus,
        totalFloors: state.formData.totalFloors,
        // Page 3 data
        address: state.formData.address,
        addressDetails: state.formData.addressDetails,
        city: state.formData.city,
        province: state.formData.province,
        municipality: state.formData.municipality,
        neighborhood: state.formData.neighborhood,
        postalCode: state.formData.postalCode,
        title: state.formData.title,
      });
      
      // Extract basic listing details from form data for save service
      console.log("=== DEBUGGING PROPERTY ID RESOLUTION ===");
      console.log("state.formData.propertyId:", state.formData.propertyId);
      console.log("typeof state.formData.propertyId:", typeof state.formData.propertyId);
      console.log("listingId:", listingId);
      console.log("parseInt(listingId):", parseInt(listingId));
      
      const listingDetails = {
        propertyId: state.formData.propertyId 
          ? (typeof state.formData.propertyId === 'number' 
            ? state.formData.propertyId 
            : parseInt(state.formData.propertyId.toString()))
          : undefined, // Don't use listingId as fallback - it's incorrect
        listingType: state.formData.listingType,
        propertyType: state.formData.propertyType,
        agentId: state.formData.agentId,
        price: state.formData.price,
      };
      
      console.log("Final Listing Details being passed:", listingDetails);
      console.log("Will attempt to update propertyId:", listingDetails.propertyId);
      console.log("=== CALLING saveQuickFormData ===");
      
      // Save all form data using the quick form save function
      const result = await saveQuickFormData(
        listingId,
        state.formData,
        listingDetails,
        { markAsCompleted: true }
      );
      
      console.log("Save Result:", result);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to save registration data");
      }
      
      return true;
    } catch (error) {
      console.error("Save registration error:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [listingId, state.formData, isSaving]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setDirection("backward");
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((stepIndex: number) => {
    const formPosition = state.formData?.formPosition ?? 1;
    const currentFormStep = formPosition - 1;

    // Allow navigation to the immediate next step
    if (stepIndex === currentFormStep + 1) {
      setDirection("forward");
      setCurrentStep(stepIndex);
    }
    // Allow backward navigation to any previous step
    else if (stepIndex < currentFormStep) {
      setDirection(stepIndex < currentStep ? "backward" : "forward");
      setCurrentStep(stepIndex);
    }
  }, [currentStep, state.formData.formPosition]);

  // Navigation without auto-save - just move between steps
  const navigateToNextStep = useCallback(async () => {
    if (currentStep < registrationSteps.length - 1) {
      setDirection("forward");
      setCurrentStep(currentStep + 1);
    } else {
      // Last step - save all data and complete registration
      const saved = await saveRegistrationData();
      if (saved) {
        router.push(`/propiedades`);
      } else {
        // Show error, don't navigate
        alert("Error al guardar el registro. Por favor, inténtalo de nuevo.");
      }
    }
  }, [currentStep, saveRegistrationData, router, listingId]);

  // Shared props for all form pages
  const sharedPageProps = useMemo(
    () => ({
      listingId,
      onNext: navigateToNextStep,
      onBack: currentStep > 0 ? prevStep : undefined,
    }),
    [listingId, navigateToNextStep, currentStep, prevStep],
  );

  const renderStepContent = useCallback(() => {
    const step = registrationSteps[currentStep];

    if (!step) {
      return <div>Step not found</div>;
    }

    const pageProps = {
      ...sharedPageProps,
      onBack: step.id === "basic" && currentStep === 0 ? undefined : prevStep,
    };

    switch (step.id) {
      case "basic":
        return <FirstPage {...pageProps} />;
      case "details":
        return <SecondPage {...pageProps} />;
      case "address":
        return <ThirdPage {...pageProps} nextButtonText="Finalizar" />;
      default:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Contenido para el paso {step.id}
            </p>
          </div>
        );
    }
  }, [currentStep, sharedPageProps, prevStep]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl">
        <Card className="relative p-6">
          {/* Close Button */}
          <button
            onClick={handleCloseForm}
            className="absolute right-4 top-4 z-10 rounded-full p-2 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cerrar formulario"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-4">
            <h1 className="mb-8 mt-2 bg-gradient-to-r from-gray-700 to-yellow-800 bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent">
              REGISTRO DE INMUEBLE
            </h1>

            <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-gray-700 to-yellow-800"></div>


            {/* Registration Progress Bar */}
            <RegistrationProgressBar
              currentStep={currentStep}
              steps={registrationSteps}
              formPosition={state.formData?.formPosition ?? 1}
              onStepClick={goToStep}
            />
          </div>

          {state.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <Loader className="h-6 w-6 animate-spin text-gray-500" />
                <span className="text-gray-600">
                  Cargando agentes y contactos...
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{
                      opacity: 0,
                      x: direction === "forward" ? 20 : -20,
                    }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction === "forward" ? -20 : 20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Save indicator with bolt animation */}
              {isSaving && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
                >
                  <div className="text-center">
                    {/* Animated bolt icon */}
                    <div className="mb-6 mx-auto w-24 h-24 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full flex items-center justify-center transition-all duration-700 ease-in-out">
                      <Zap className="h-14 w-14 text-white scale-110 transition-all duration-700 ease-in-out" />
                    </div>
                    
                    {/* Loading text */}
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <span className="text-sm font-medium">Completando registro...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </Card>

        {/* Close Confirmation Dialog */}
        <CloseConfirmationDialog
          isOpen={showCloseConfirmation}
          onClose={handleCloseConfirmationDialog}
          onSaveAndClose={handleSaveAndClose}
          onDiscardAndClose={handleDiscardAndClose}
          hasUnsavedChanges={state.hasUnsavedChanges}
        />
      </div>
    </div>
  );
}

// Main component that provides the form context
export default function QuickRegistrationForm({ listingId }: QuickRegistrationFormProps) {
  return (
    <FormProvider>
      <QuickRegistrationFormInner listingId={listingId} />
    </FormProvider>
  );
}