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
import ProgressBar from "./progress-bar";
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

// Global form data interface
interface ListingDetails {
  formPosition?: number;
  propertyType?: string;
  propertyId?: number;
  listingType?: string;
  agentId?: number | string;
  price?: number | string;
  [key: string]: unknown; // Allow other properties
}

interface GlobalFormData {
  listingDetails?: ListingDetails;
  agents: Array<{ id: string; name: string }>; // Changed from number to string
  contacts: Array<{ id: number; name: string }>;
  currentContacts: string[];
  staticOptions: typeof STATIC_FORM_OPTIONS;
}

export default function PropertyForm({ listingId }: PropertyFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [saveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Centralized data state - passed to all child components
  const [globalFormData, setGlobalFormData] = useState<GlobalFormData>({
    listingDetails: undefined,
    agents: [],
    contacts: [],
    currentContacts: [],
    staticOptions: STATIC_FORM_OPTIONS,
  });

  // Handle form close
  const handleCloseForm = () => {
    router.push("/propiedades");
  };

  // Pre-fetch ALL data once - no more redundant API calls in child components
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);

        // Fetch all data in parallel for maximum speed
        const [listingDetails, agents, contacts, currentContacts] =
          await Promise.all([
            getListingDetailsWithAuth(Number(listingId)),
            getAllAgentsWithAuth(),
            getAllPotentialOwnersWithAuth(),
            getCurrentListingOwnersWithAuth(Number(listingId)),
          ]);

        // Set current step based on form position
        const typedListingDetails = listingDetails as ListingDetails;
        if (typedListingDetails?.formPosition) {
          const stepIndex = Math.max(
            0,
            Math.min(typedListingDetails.formPosition - 1, steps.length - 1),
          );
          setCurrentStep(stepIndex);
        }

        // Set global form data
        setGlobalFormData({
          listingDetails: listingDetails as ListingDetails,
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
          staticOptions: STATIC_FORM_OPTIONS,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchAllData();
  }, [listingId]);

  // Refresh listing details and current contacts (for saves)
  const refreshListingDetails = useCallback(async () => {
    try {
      const [updatedDetails, currentContacts] = await Promise.all([
        getListingDetailsWithAuth(Number(listingId)),
        getCurrentListingOwnersWithAuth(Number(listingId)),
      ]);

      setGlobalFormData((prev) => ({
        ...prev,
        listingDetails: updatedDetails as ListingDetails,
        currentContacts: currentContacts.map((contact) =>
          contact.id.toString(),
        ),
      }));
    } catch (error) {
      console.error("Error refreshing listing details:", error);
    }
  }, [listingId]);

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
    const propertyType = globalFormData.listingDetails?.propertyType ?? "";
    return getSkippedSteps(propertyType);
  }, [globalFormData.listingDetails, getSkippedSteps]);

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
      const formPosition = globalFormData.listingDetails?.formPosition ?? 1;
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
    [currentStep, globalFormData.listingDetails],
  );

  // Optimistic navigation function - navigate immediately, save in background
  const navigateToNextStep = useCallback(() => {
    // Navigate immediately (optimistic)
    setDirection("forward");
    const nextStepIndex = getNextNonSkippedStep(currentStep);
    setCurrentStep(nextStepIndex);

    // Update formPosition in globalFormData immediately for instant UI updates
    const newFormPosition = nextStepIndex + 1;
    setGlobalFormData((prev) => {
      const listingDetails = prev.listingDetails;
      return {
        ...prev,
        listingDetails: listingDetails
          ? {
              ...listingDetails,
              formPosition: Math.max(
                listingDetails.formPosition ?? 1,
                newFormPosition,
              ),
            }
          : undefined,
      };
    });

    // Note: refreshListingDetails() is called by each page's background save
    // No need to call it here as it can cause navigation conflicts
  }, [currentStep, getNextNonSkippedStep]);

  // Shared props for all form pages - no more individual data fetching!
  const sharedPageProps = useMemo(
    () => ({
      listingId,
      globalFormData,
      onNext: navigateToNextStep,
      onBack: currentStep > 0 ? prevStep : undefined,
      refreshListingDetails,
    }),
    [
      listingId,
      globalFormData,
      navigateToNextStep,
      currentStep,
      prevStep,
      refreshListingDetails,
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
              formPosition={
                globalFormData.listingDetails?.formPosition ?? 1
              }
              onStepClick={goToStep}
              propertyType={
                globalFormData.listingDetails?.propertyType ?? ""
              }
            />
          </div>

          {isLoading ? (
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
      </div>
    </div>
  );
}
