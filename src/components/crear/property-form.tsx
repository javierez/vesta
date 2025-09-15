"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "~/components/ui/card";
import { Loader, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  getListingDetailsWithAuth,
  getAllAgentsWithAuth,
} from "~/server/queries/listing";
import {
  getAllPotentialOwnersWithAuth,
  getCurrentListingOwnersWithAuth,
} from "~/server/queries/contact";
import { FormProvider, useFormContext, type CompleteFormData } from "./form-context";
import { FormSaveService } from "./save-service";
import ProgressBar from "./progress-bar";
import CloseConfirmationDialog from "./close-confirmation-dialog";
import FirstPage from "./pages/first";
import SecondPage from "./pages/second";
import ThirdPage from "./pages/third";
import FourthPage from "./pages/fourth";
import FifthPage from "./pages/fifth";
import SixthPage from "./pages/sixth";
import SeventhPage from "./pages/seventh";
import EighthPage from "./pages/eighth";
import NinethPage from "./pages/nineth";
import DescriptionPage from "./pages/description";
import RentPage from "./pages/rent";

interface PropertyFormProps {
  listingId: string;
}

// Step definitions
interface Step {
  id: string;
  title: string;
}

const steps: Step[] = [
  { id: "basic", title: "Información Básica" },
  { id: "details", title: "Detalles de la Propiedad" },
  { id: "address", title: "Dirección" },
  { id: "equipment", title: "Equipamiento y Servicios" },
  { id: "orientation", title: "Orientación y Exposición" },
  { id: "additional", title: "Características Adicionales" },
  { id: "luxury", title: "Lujo y Confort" },
  { id: "spaces", title: "Espacios Complementarios" },
  { id: "materials", title: "Materiales y Acabados" },
  { id: "description", title: "Descripción" },
  { id: "rent", title: "Alquiler" },
];

// Static form options - memoized to prevent recreation
const STATIC_FORM_OPTIONS = {
  heatingOptions: [
    "Si, Sin especificar",
    "Gas Individual",
    "Gasóleo Individual",
    "Gas Colectivo",
    "Gasóleo Colectivo",
    "Eléctrica",
    "Tarifa Nocturno",
    "Propano",
    "Suelo Radiante",
    "Eléctrica por Acumulador",
    "Placas Fotovoltaicas",
    "Biomasa",
    "Bomba de calor",
    "Geotermia",
    "Aerotermia",
  ],
  airConditioningOptions: [
    { value: "central", label: "Central" },
    { value: "split", label: "Split" },
    { value: "portatil", label: "Portátil" },
    { value: "conductos", label: "Conductos" },
    { value: "cassette", label: "Cassette" },
    { value: "ventana", label: "Ventana" },
  ],
  furnitureQualityOptions: [
    { value: "basic", label: "Básico", color: "bg-gray-500" },
    { value: "standard", label: "Estándar", color: "bg-gray-600" },
    { value: "high", label: "Alta", color: "bg-gray-700" },
    { value: "luxury", label: "Lujo", color: "bg-gray-900" },
  ],
  propertyTypes: ["piso", "casa", "local", "solar", "garage"],
  listingTypes: ["Sale", "Rent"],
};


// Convert fetched database data to CompleteFormData format
function convertFetchedDataToFormData(listingDetails: any): CompleteFormData {
  if (!listingDetails) return {};
  
  return {
    // Meta data
    formPosition: listingDetails.formPosition || 1,
    
    // Page 1 - Basic Info & IDs
    propertyId: listingDetails.propertyId,
    listingId: listingDetails.listingId,
    price: listingDetails.price?.toString() || "",
    listingType: listingDetails.listingType || "Sale", 
    propertyType: listingDetails.propertyType || "piso",
    propertySubtype: listingDetails.propertySubtype || "",
    agentId: listingDetails.agentId?.toString() || "",
    
    // Page 2 - Details  
    bedrooms: listingDetails.bedrooms || undefined,
    bathrooms: listingDetails.bathrooms || undefined,
    totalSurface: listingDetails.totalSurface || undefined,
    usefulSurface: listingDetails.usefulSurface || undefined,
    plotSurface: listingDetails.plotSurface || undefined,
    floor: listingDetails.floor || undefined,
    totalFloors: listingDetails.totalFloors || undefined,
    buildYear: listingDetails.buildYear || undefined,
    condition: listingDetails.condition || undefined,
    energyCertificate: listingDetails.energyCertificate || undefined,
    emissions: listingDetails.emissions || undefined,
    cadastralReference: listingDetails.cadastralReference || "",
    
    // Page 3 - Address
    address: listingDetails.address || "",
    city: listingDetails.city || "",
    province: listingDetails.province || "",
    postalCode: listingDetails.postalCode || "",
    neighborhood: listingDetails.neighborhood || "",
    latitude: listingDetails.latitude || undefined,
    longitude: listingDetails.longitude || undefined,
    
    // Page 4 - Equipment
    heating: listingDetails.heating || "",
    airConditioning: listingDetails.airConditioning || [],
    hasElevator: listingDetails.hasElevator || false,
    hasGarage: listingDetails.hasGarage || false,
    hasStorageRoom: listingDetails.hasStorageRoom || false,
    hasGarden: listingDetails.hasGarden || false,
    hasSwimmingPool: listingDetails.hasSwimmingPool || false,
    hasTerrace: listingDetails.hasTerrace || false,
    hasBalcony: listingDetails.hasBalcony || false,
    
    // Page 5 - Orientation
    orientation: listingDetails.orientation || "",
    views: listingDetails.views || [],
    luminosity: listingDetails.luminosity || "",
    
    // Page 6 - Additional
    accessibility: listingDetails.accessibility || false,
    securitySystem: listingDetails.securitySystem || false,
    doorman: listingDetails.doorman || false,
    builtInWardrobes: listingDetails.builtInWardrobes || false,
    
    // Page 7 - Luxury
    luxuryFeatures: listingDetails.luxuryFeatures || [],
    highEndFinishes: listingDetails.highEndFinishes || false,
    designerKitchen: listingDetails.designerKitchen || false,
    smartHome: listingDetails.smartHome || false,
    
    // Page 8 - Spaces
    hasAttic: listingDetails.hasAttic || false,
    hasBasement: listingDetails.hasBasement || false,
    hasLaundryRoom: listingDetails.hasLaundryRoom || false,
    hasOffice: listingDetails.hasOffice || false,
    hasDressingRoom: listingDetails.hasDressingRoom || false,
    
    // Page 9 - Materials
    floorMaterial: listingDetails.floorMaterial || "",
    wallMaterial: listingDetails.wallMaterial || "",
    kitchenMaterial: listingDetails.kitchenMaterial || "",
    bathroomMaterial: listingDetails.bathroomMaterial || "",
    
    // Page 10 - Description
    description: listingDetails.description || "",
    highlights: listingDetails.highlights || [],
    
    // Page 11 - Rent
    hasKeys: listingDetails.hasKeys || false,
    studentFriendly: listingDetails.studentFriendly || false,
    petsAllowed: listingDetails.petsAllowed || false,
    appliancesIncluded: listingDetails.appliancesIncluded || false,
    isFurnished: listingDetails.isFurnished || false,
    furnitureQuality: listingDetails.furnitureQuality || "",
    optionalGaragePrice: listingDetails.optionalGaragePrice || 0,
    optionalStorageRoomPrice: listingDetails.optionalStorageRoomPrice || 0,
    internet: listingDetails.internet || false,
  };
}

// Inner component that uses the form context
function PropertyFormInner({ listingId }: PropertyFormProps) {
  const { state, setInitialData, setLoading } = useFormContext();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [saveError] = useState<string | null>(null);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  // Handle close button click - show confirmation dialog
  const handleCloseForm = () => {
    setShowCloseConfirmation(true);
  };

  // Handle save and close action
  const handleSaveAndClose = async () => {
    // Save all form data before closing
    if (state.hasUnsavedChanges) {
      // Extract basic listing details from form data for save service
      const listingDetails = {
        propertyId: parseInt(listingId), // Use listingId from props
        listingType: state.formData.listingType,
        propertyType: state.formData.propertyType,
        agentId: state.formData.agentId,
        price: state.formData.price,
      };
      
      await FormSaveService.saveAllFormData(
        listingId,
        state.formData,
        listingDetails,
        { showLoading: false } // Don't show loading for close action
      );
    }
    
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

  // Pre-fetch ALL data once - no more redundant API calls in child components
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel for maximum speed
        const [listingDetails, agents, contacts, currentContacts] =
          await Promise.all([
            getListingDetailsWithAuth(Number(listingId)),
            getAllAgentsWithAuth(),
            getAllPotentialOwnersWithAuth(),
            getCurrentListingOwnersWithAuth(Number(listingId)),
          ]);

        // Set current step based on form position
        const typedListingDetails = listingDetails as any;
        if (typedListingDetails?.formPosition) {
          const stepIndex = Math.max(
            0,
            Math.min(typedListingDetails.formPosition - 1, steps.length - 1),
          );
          setCurrentStep(stepIndex);
        }

        // Convert fetched data to single CompleteFormData and set as local working copy
        setInitialData({
          fetchedFormData: convertFetchedDataToFormData(listingDetails),
          agents: agents.map((agent) => ({
            id: agent.id, // Keep as string - don't convert to Number
            name: agent.name,
          })),
          contacts: contacts.map((contact) => ({
            id: Number(contact.id),
            name: contact.name,
          })),
          currentContacts: currentContacts.map((contact) =>
            contact.id.toString(),
          ),
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchAllData();
  }, [listingId, setInitialData, setLoading]);


  // Sync currentStep with formPosition when listingDetails updates
  // useEffect(() => {
  //   const listingDetails = globalFormData.listingDetails as {
  //     formPosition?: number;
  //   } | null;
  //   if (listingDetails?.formPosition) {
  //     const stepIndex = Math.max(
  //       0,
  //       Math.min((listingDetails.formPosition ?? 1) - 1, steps.length - 1),
  //     );
  //     setCurrentStep(stepIndex);
  //   }
  // }, [globalFormData.listingDetails]);

  // Memoize skipped steps calculation
  const getSkippedSteps = useCallback((propertyType: string): number[] => {
    if (propertyType === "solar") {
      // Solar properties skip: fourth (3), fifth (4), sixth (5), eighth (7), nineth (8)
      return [3, 4, 5, 7, 8];
    } else if (propertyType === "garage") {
      // Garage properties skip: fifth (4), seventh (6), eighth (7), nineth (8)
      return [4, 6, 7, 8];
    }
    return [];
  }, []);

  // Memoize skipped steps for current property type
  const skippedSteps = useMemo(() => {
    const propertyType = state.formData?.propertyType ?? "";
    return getSkippedSteps(propertyType);
  }, [state.formData.propertyType, getSkippedSteps]);

  // Get the next non-skipped step
  const getNextNonSkippedStep = useCallback(
    (currentStepIndex: number): number => {
      let nextStep = currentStepIndex + 1;

      // Keep incrementing until we find a non-skipped step
      while (skippedSteps.includes(nextStep) && nextStep < steps.length) {
        nextStep++;
      }

      return Math.min(nextStep, steps.length - 1);
    },
    [skippedSteps],
  );

  // Get the previous non-skipped step
  const getPrevNonSkippedStep = useCallback(
    (currentStepIndex: number): number => {
      let prevStep = currentStepIndex - 1;

      // Keep decrementing until we find a non-skipped step
      while (skippedSteps.includes(prevStep) && prevStep >= 0) {
        prevStep--;
      }

      return Math.max(prevStep, 0);
    },
    [skippedSteps],
  );

  // Remove unused _nextStep variable
  // const _nextStep = useCallback(() => {
  //   setDirection("forward")
  //   const nextStepIndex = getNextNonSkippedStep(currentStep)
  //   setCurrentStep(nextStepIndex)
  // }, [currentStep, getNextNonSkippedStep])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setDirection("backward");
      const prevStepIndex = getPrevNonSkippedStep(currentStep);
      setCurrentStep(prevStepIndex);
    }
  }, [currentStep, getPrevNonSkippedStep]);

  const goToStep = useCallback(
    (stepIndex: number) => {
      const formPosition = state.formData?.formPosition ?? 1;
      const currentFormStep = formPosition - 1;

      // Only allow navigation to the immediate next step
      if (stepIndex === currentFormStep + 1) {
        setDirection("forward");
        setCurrentStep(stepIndex);
      }
      // Allow backward navigation to any previous step
      else if (stepIndex < currentFormStep) {
        setDirection(stepIndex < currentStep ? "backward" : "forward");
        setCurrentStep(stepIndex);
      }
      // Block forward navigation beyond next step
      // else: do nothing - navigation blocked
    },
    [currentStep, state.formData.formPosition],
  );

  // Instant navigation function - no saves, just navigate
  const navigateToNextStep = useCallback(() => {
    // Navigate immediately - completely instant
    setDirection("forward");
    const nextStepIndex = getNextNonSkippedStep(currentStep);
    setCurrentStep(nextStepIndex);
    
    // No save operations - purely local state navigation
  }, [currentStep, getNextNonSkippedStep]);

  // Shared props for all form pages - no more individual data fetching!
  const sharedPageProps = useMemo(
    () => ({
      listingId,
      onNext: navigateToNextStep,
      onBack: currentStep > 0 ? prevStep : undefined,
    }),
    [
      listingId,
      navigateToNextStep,
      currentStep,
      prevStep,
    ],
  );

  const renderStepContent = useCallback(() => {
    const step = steps[currentStep];

    if (!step) {
      return <div>Step not found</div>;
    }

    // Pass shared props to eliminate individual data fetching
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
        return <ThirdPage {...pageProps} />;
      case "equipment":
        return <FourthPage {...pageProps} />;
      case "orientation":
        return <FifthPage {...pageProps} />;
      case "additional":
        return <SixthPage {...pageProps} />;
      case "luxury":
        return <SeventhPage {...pageProps} />;
      case "spaces":
        return <EighthPage {...pageProps} />;
      case "materials":
        return <NinethPage {...pageProps} />;
      case "description":
        return <DescriptionPage {...pageProps} />;
      case "rent":
        return <RentPage {...pageProps} />;
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
            <h1 className="mb-3 mt-2 bg-gradient-to-r from-gray-700 to-yellow-800 bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent">
              ALTA NUEVO INMUEBLE
            </h1>

            <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-gray-700 to-yellow-800"></div>

            <p className="mb-8 text-center text-sm tracking-tight text-gray-500">
              Completa la información del inmueble paso a paso
            </p>

            {/* Progress Bar */}
            <ProgressBar
              currentStep={currentStep}
              steps={steps}
              formPosition={state.formData?.formPosition ?? 1}
              onStepClick={goToStep}
              propertyType={state.formData?.propertyType ?? ""}
            />
          </div>

          {state.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <Loader className="h-6 w-6 animate-spin text-gray-500" />
                <span className="text-gray-600">
                  Cargando datos del inmueble...
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

              {/* Save Error Notification */}
              {saveError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3"
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <p className="text-sm text-red-700">{saveError}</p>
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
export default function PropertyForm({ listingId }: PropertyFormProps) {
  return (
    <FormProvider>
      <PropertyFormInner listingId={listingId} />
    </FormProvider>
  );
}
