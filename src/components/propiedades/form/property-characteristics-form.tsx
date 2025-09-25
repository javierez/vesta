"use client";

import React, { useState, useEffect } from "react";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { 
  Building2, 
  ChevronDown
} from "lucide-react";
import { getAllAgentsWithAuth } from "~/server/queries/listing";
import {
  getAllPotentialOwnersWithAuth,
  getCurrentListingOwnersWithAuth,
  updateListingOwnersWithAuth,
} from "~/server/queries/contact";
import { findOrCreateLocation } from "~/server/queries/locations";
import { useRouter, useSearchParams } from "next/navigation";
import { updateProperty } from "~/server/queries/properties";
import { updateListingWithAuth, toggleListingKeysWithAuth, toggleListingPublishToWebsiteWithAuth, getListingDetailsWithAuth } from "~/server/queries/listing";
import { toast } from "sonner";
import { PropertyTitle } from "./common/property-title";
import { ModernSaveIndicator } from "./common/modern-save-indicator";
import { PropertySummaryCard } from "./cards/property-summary-card";
import { PropertyDetailsCard } from "./cards/property-details-card";
import { FeaturesCard } from "./cards/features-card";
import { PremiumFeaturesCard } from "./cards/premium-features-card";
import { OrientationCard } from "./cards/orientation-card";
import { AdditionalCharacteristicsCard } from "./cards/additional-characteristics-card";
import { AdditionalSpacesCard } from "./cards/additional-spaces-card";
import { MaterialsCard } from "./cards/materials-card";
import { RentalPropertiesCard } from "./cards/rental-properties-card";
import { DescriptionCard } from "./cards/description-card";
import { Separator } from "~/components/ui/separator";
import Image from "next/image";
import { generatePropertyDescription, generateShortPropertyDescription } from "~/server/openai/property_descriptions";
import { ExternalLinkPopup } from "~/components/ui/external-link-popup";
import { generatePropertyTitle } from "~/lib/property-title";
import { DeleteConfirmationModal } from "~/components/ui/delete-confirmation-modal";
import { deletePropertyWithAuth, deleteListingWithAuth, discardListingWithAuth, recoverListingWithAuth } from "~/server/queries/listing";

import type { PropertyListing } from "~/types/property-listing";

// Type definitions
interface Agent {
  id: string; // Changed from number to match users.id type
  name: string;
}

interface Owner {
  id: number;
  name: string;
}

type SaveState = "idle" | "modified" | "saving" | "saved" | "error";

interface ModuleState {
  saveState: SaveState;
  hasChanges: boolean;
  lastSaved?: Date;
}

type ModuleName =
  | "basicInfo"
  | "propertyDetails"
  | "location"
  | "features"
  | "description"
  | "contactInfo"
  | "orientation"
  | "additionalCharacteristics"
  | "premiumFeatures"
  | "additionalSpaces"
  | "materials"
  | "rentalProperties";

interface PropertyCharacteristicsFormProps {
  listing: PropertyListing;
}

export function PropertyCharacteristicsForm({
  listing,
}: PropertyCharacteristicsFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPropertyType =
    searchParams.get("type") ?? listing.propertyType ?? "piso";
  
  // Local state to track current property type
  const [propertyType, setPropertyType] = useState(initialPropertyType);

  // Check if property type has been changed from the original
  const hasPropertyTypeChanged =
    listing.propertyType &&
    propertyType &&
    listing.propertyType !== propertyType;

  // Module states
  const [moduleStates, setModuleStates] = useState<Record<string, ModuleState>>(
    () => {
      // Initialize with property type change detection
      const initialState = {
        basicInfo: {
          saveState: "idle" as SaveState,
          hasChanges: Boolean(hasPropertyTypeChanged),
        },
        propertyDetails: { saveState: "idle" as SaveState, hasChanges: false },
        location: { saveState: "idle" as SaveState, hasChanges: false },
        features: { saveState: "idle" as SaveState, hasChanges: false },
        contactInfo: { saveState: "idle" as SaveState, hasChanges: false },
        orientation: { saveState: "idle" as SaveState, hasChanges: false },
        additionalCharacteristics: {
          saveState: "idle" as SaveState,
          hasChanges: false,
        },
        premiumFeatures: { saveState: "idle" as SaveState, hasChanges: false },
        additionalSpaces: { saveState: "idle" as SaveState, hasChanges: false },
        materials: { saveState: "idle" as SaveState, hasChanges: false },
        description: { saveState: "idle" as SaveState, hasChanges: false },
        rentalProperties: { saveState: "idle" as SaveState, hasChanges: false },
      };

      // Set basicInfo to modified if property type changed
      if (hasPropertyTypeChanged) {
        initialState.basicInfo.saveState = "modified";
      }

      return initialState;
    },
  );

  // Update module states when property type change is detected
  useEffect(() => {
    if (hasPropertyTypeChanged) {
      setModuleStates((prev) => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          saveState: "modified",
          hasChanges: true,
        },
      }));
    }
  }, [hasPropertyTypeChanged]);

  // Function to update module state
  const updateModuleState = (moduleName: ModuleName, hasChanges: boolean) => {
    setModuleStates((prev) => {
      const currentState = prev[moduleName] ?? {
        saveState: "idle" as SaveState,
        hasChanges: false,
      };
      return {
        ...prev,
        [moduleName]: {
          ...currentState,
          saveState: hasChanges ? "modified" : "idle",
          hasChanges,
          lastSaved: currentState.lastSaved,
        },
      };
    });
  };

  // Function to save module data
  const saveModule = async (moduleName: ModuleName) => {
    setModuleStates((prev) => {
      const currentState = prev[moduleName] ?? {
        saveState: "idle" as SaveState,
        hasChanges: false,
      };
      return {
        ...prev,
        [moduleName]: {
          ...currentState,
          saveState: "saving",
          hasChanges: currentState.hasChanges,
        },
      };
    });

    try {
      const propertyId = Number(listing.propertyId);
      const listingId = Number(listing.listingId);

      let propertyData = {};
      let listingData = {};

      switch (moduleName) {
        case "basicInfo":
          // Generate the title based on current propertyType
          const generatedTitle = generatePropertyTitle(
            propertyType,
            listing.street ?? "",
            listing.neighborhood ?? ""
          );

          listingData = {
            listingType: listingTypes[0],
            isBankOwned,
            price: (document.getElementById("price") as HTMLInputElement)
              ?.value,
          };
          propertyData = {
            propertyType,
            propertySubtype: listing.propertySubtype,
            cadastralReference: (
              document.getElementById("cadastralReference") as HTMLInputElement
            )?.value,
            newConstruction,
            title: generatedTitle, // Move title to propertyData since it belongs in properties table
          };
          break;

        case "propertyDetails":
          propertyData = {
            bedrooms: Number(
              (document.getElementById("bedrooms") as HTMLInputElement)?.value,
            ),
            bathrooms: Number(
              (document.getElementById("bathrooms") as HTMLInputElement)?.value,
            ),
            squareMeter: Number(
              (document.getElementById("squareMeter") as HTMLInputElement)
                ?.value,
            ),
            builtSurfaceArea: Math.round(
              Number(
                (
                  document.getElementById(
                    "builtSurfaceArea",
                  ) as HTMLInputElement
                )?.value,
              ),
            ),
            yearBuilt: Number(
              (document.getElementById("yearBuilt") as HTMLInputElement)?.value,
            ),
            lastRenovationYear: lastRenovationYear || null,
            buildingFloors: buildingFloors,
            conservationStatus: listing.conservationStatus ?? 1,
          };
          break;

        case "location":
          // Handle location data with proper locations table integration
          const streetValue = (document.getElementById("street") as HTMLInputElement)?.value;
          const addressDetailsValue = (document.getElementById("addressDetails") as HTMLInputElement)?.value;
          const postalCodeValue = (document.getElementById("postalCode") as HTMLInputElement)?.value;
          
          // Find or create location in locations table and get neighborhoodId
          let neighborhoodId: bigint | null = null;
          
          if (city && province && municipality && listing.neighborhood) {
            try {
              neighborhoodId = BigInt(await findOrCreateLocation({
                city,
                province,
                municipality,
                neighborhood: listing.neighborhood,
              }));
              console.log("🏘️ Created/found location with neighborhoodId:", neighborhoodId);
            } catch (error) {
              console.error("Error handling location:", error);
              // neighborhoodId will remain null if location update fails
            }
          }

          propertyData = {
            street: streetValue,
            addressDetails: addressDetailsValue,
            postalCode: postalCodeValue,
            ...(neighborhoodId && { neighborhoodId }),
            nearbyPublicTransport,
          };
          break;

        case "features":
          propertyData = {
            hasElevator: (
              document.getElementById("hasElevator") as HTMLInputElement
            )?.checked,
            hasGarage,
            garageType,
            garageSpaces: !isNaN(garageSpaces) ? garageSpaces : 1,
            garageInBuilding,
            garageNumber,
            hasStorageRoom,
            storageRoomSize: !isNaN(storageRoomSize) ? storageRoomSize : 0,
            storageRoomNumber,
            hasHeating: isHeating,
            heatingType,
            hotWaterType: isHotWater ? hotWaterType : null,
            airConditioningType: isAirConditioning ? airConditioningType : null,
            isFurnished,
          };
          listingData = {
            optionalGaragePrice: (() => {
              const value = (
                document.getElementById("optionalGaragePrice") as HTMLInputElement
              )?.value;
              const num = Number(value);
              return !isNaN(num) ? Math.round(num) : 0;
            })(),
            optionalStorageRoomPrice: (() => {
              const value = (
                document.getElementById("optionalStorageRoomPrice") as HTMLInputElement
              )?.value;
              const num = Number(value);
              return !isNaN(num) ? Math.round(num) : 0;
            })(),
            oven,
            microwave,
            washingMachine,
            fridge,
            tv,
            stoneware,
          };
          break;

        case "contactInfo":
          if (!selectedAgentId || selectedAgentId === "") {
            throw new Error("Please select an agent");
          }
          if (selectedOwnerIds.length === 0) {
            throw new Error("Please select at least one owner");
          }

          // Update listing with agent
          listingData = {
            agentId: selectedAgentId,
          };

          // Update owner relationships separately
          await updateListingOwnersWithAuth(
            listingId,
            selectedOwnerIds.map((id) => Number(id)),
          );
          break;

        case "orientation":
          propertyData = {
            exterior: isExterior,
            bright: isBright,
            orientation,
          };
          break;

        case "additionalCharacteristics":
          propertyData = {
            disabledAccessible,
            vpo,
            videoIntercom,
            conciergeService,
            securityGuard,
            satelliteDish,
            doubleGlazing,
            alarm,
            securityDoor,
            kitchenType,
            openKitchen,
            frenchKitchen,
            furnishedKitchen,
            pantry,
            suiteBathroom,
          };
          break;

        case "premiumFeatures":
          propertyData = {
            views,
            mountainViews,
            seaViews,
            beachfront,
            jacuzzi,
            hydromassage,
            garden,
            pool,
            homeAutomation,
            musicSystem,
            laundryRoom,
            coveredClothesline,
            fireplace,
            gym,
            sportsArea,
            childrenArea,
            communityPool,
            privatePool,
            tennisCourt,
          };
          break;

        case "additionalSpaces":
          propertyData = {
            terrace,
            terraceSize,
            wineCellar,
            wineCellarSize,
            livingRoomSize,
            balconyCount,
            galleryCount,
            buildingFloors,
            builtInWardrobes,
          };
          break;

        case "materials":
          propertyData = {
            mainFloorType,
            shutterType,
            carpentryType,
            windowType,
            doubleGlazing,
            securityDoor,
          };
          break;

        case "description":
          // Both description and short description go to listings table only
          listingData = {
            description: (
              document.getElementById("description") as HTMLTextAreaElement
            )?.value,
            shortDescription: (  // Use camelCase for TypeScript/Drizzle field name
              document.getElementById("shortDescription") as HTMLTextAreaElement
            )?.value,
          };
          // No propertyData for descriptions - they belong in listings only
          break;

        case "rentalProperties":
          listingData = {
            internet,
            studentFriendly,
            petsAllowed,
            appliancesIncluded,
            rentalPrice,
          };
          propertyData = {
            duplicateForRent,
          };
          break;
      }

      // Update property if there's property data
      if (Object.keys(propertyData).length > 0) {
        await updateProperty(propertyId, propertyData);
      }

      // Update listing if there's listing data
      if (Object.keys(listingData).length > 0) {
        await updateListingWithAuth(listingId, listingData);
      }

      setModuleStates((prev) => {
        const currentState = prev[moduleName] ?? {
          saveState: "idle" as SaveState,
          hasChanges: false,
        };
        return {
          ...prev,
          [moduleName]: {
            ...currentState,
            saveState: "saved",
            hasChanges: false,
            lastSaved: new Date(),
          },
        };
      });

      toast.success("Cambios guardados correctamente");

      // Reset to idle state after 2 seconds
      setTimeout(() => {
        setModuleStates((prev) => {
          const currentState = prev[moduleName] ?? {
            saveState: "idle" as SaveState,
            hasChanges: false,
          };
          return {
            ...prev,
            [moduleName]: {
              ...currentState,
              saveState: "idle",
              hasChanges: currentState.hasChanges,
            },
          };
        });
      }, 2000);
    } catch (error) {
      console.error(`Error saving ${moduleName}:`, error);

      setModuleStates((prev) => {
        const currentState = prev[moduleName] ?? {
          saveState: "idle" as SaveState,
          hasChanges: false,
        };
        return {
          ...prev,
          [moduleName]: {
            ...currentState,
            saveState: "error",
            hasChanges: currentState.hasChanges,
          },
        };
      });

      toast.error("Error al guardar los cambios");

      // Reset to modified state after 3 seconds if there are changes
      setTimeout(() => {
        setModuleStates((prev) => {
          const currentState = prev[moduleName] ?? {
            saveState: "idle" as SaveState,
            hasChanges: false,
          };
          return {
            ...prev,
            [moduleName]: {
              ...currentState,
              saveState: currentState.hasChanges ? "modified" : "idle",
              hasChanges: currentState.hasChanges,
            },
          };
        });
      }, 3000);
    }
  };

  const [listingTypes, setListingTypes] = useState<string[]>(
    listing.listingType ? [listing.listingType] : ["Sale"], // Default to 'Sale' if none selected
  );
  const [isBankOwned, setIsBankOwned] = useState(listing.isBankOwned ?? false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isFurnished, setIsFurnished] = useState(listing.isFurnished ?? false);
  const [isHeating, setIsHeating] = useState(listing.hasHeating ?? false);
  const [heatingType, setHeatingType] = useState(listing.heatingType ?? "");
  const [isHotWater, setIsHotWater] = useState(!!listing.hotWaterType);
  const [isAirConditioning, setIsAirConditioning] = useState(
    !!listing.airConditioningType,
  );
  const [airConditioningType, setAirConditioningType] = useState(
    listing.airConditioningType ?? "",
  );
  const [studentFriendly, setStudentFriendly] = useState(
    listing.studentFriendly ?? false,
  );
  const [petsAllowed, setPetsAllowed] = useState(listing.petsAllowed ?? false);
  const [appliancesIncluded, setAppliancesIncluded] = useState(
    listing.appliancesIncluded ?? false,
  );
  const [isExterior, setIsExterior] = useState(listing.exterior ?? false);
  const [orientation, setOrientation] = useState(listing.orientation ?? "");
  const [isBright, setIsBright] = useState(listing.bright ?? false);
  const [garageType, setGarageType] = useState(listing.garageType ?? "");
  const [garageSpaces, setGarageSpaces] = useState(() => {
    const spaces = listing.garageSpaces;
    return spaces && !isNaN(Number(spaces)) ? Number(spaces) : 1;
  });
  const [garageInBuilding, setGarageInBuilding] = useState(
    listing.garageInBuilding ?? false,
  );
  const [garageNumber, setGarageNumber] = useState(listing.garageNumber ?? "");
  const [storageRoomSize, setStorageRoomSize] = useState(() => {
    const size = listing.storageRoomSize;
    return size && !isNaN(Number(size)) ? Number(size) : 0;
  });
  const [storageRoomNumber, setStorageRoomNumber] = useState(
    listing.storageRoomNumber ?? "",
  );
  const [hasGarage, setHasGarage] = useState(listing.hasGarage ?? false);
  const [hasStorageRoom, setHasStorageRoom] = useState(
    listing.hasStorageRoom ?? false,
  );
  const [disabledAccessible, setDisabledAccessible] = useState(
    listing.disabledAccessible ?? false,
  );
  const [vpo, setVpo] = useState(listing.vpo ?? false);
  const [videoIntercom, setVideoIntercom] = useState(
    listing.videoIntercom ?? false,
  );
  const [conciergeService, setConciergeService] = useState(
    listing.conciergeService ?? false,
  );
  const [securityGuard, setSecurityGuard] = useState(
    listing.securityGuard ?? false,
  );
  const [satelliteDish, setSatelliteDish] = useState(
    listing.satelliteDish ?? false,
  );
  const [doubleGlazing, setDoubleGlazing] = useState(
    listing.doubleGlazing ?? false,
  );
  const [alarm, setAlarm] = useState(listing.alarm ?? false);
  const [securityDoor, setSecurityDoor] = useState(
    listing.securityDoor ?? false,
  );
  const [lastRenovationYear, setLastRenovationYear] = useState(
    listing.lastRenovationYear ?? listing.yearBuilt ?? "",
  );
  const [kitchenType, setKitchenType] = useState(listing.kitchenType ?? "");
  const [hotWaterType, setHotWaterType] = useState(listing.hotWaterType ?? "");
  const [openKitchen, setOpenKitchen] = useState(listing.openKitchen ?? false);
  const [frenchKitchen, setFrenchKitchen] = useState(
    listing.frenchKitchen ?? false,
  );
  const [furnishedKitchen, setFurnishedKitchen] = useState(
    listing.furnishedKitchen ?? false,
  );
  const [pantry, setPantry] = useState(listing.pantry ?? false);
  const [terrace, setTerrace] = useState(listing.terrace ?? false);
  const [terraceSize, setTerraceSize] = useState(listing.terraceSize ?? 0);
  const [wineCellar, setWineCellar] = useState(listing.wineCellar ?? false);
  const [wineCellarSize, setWineCellarSize] = useState(
    listing.wineCellarSize ?? 0,
  );
  const [livingRoomSize, setLivingRoomSize] = useState(
    listing.livingRoomSize ?? 0,
  );
  const [balconyCount, setBalconyCount] = useState(listing.balconyCount ?? 0);
  const [galleryCount, setGalleryCount] = useState(listing.galleryCount ?? 0);
  const [buildingFloors, setBuildingFloors] = useState(
    listing.buildingFloors ?? 0,
  );
  const [builtInWardrobes, setBuiltInWardrobes] = useState<boolean>(
    Boolean(listing.builtInWardrobes) ?? false,
  );
  const [mainFloorType, setMainFloorType] = useState(
    listing.mainFloorType ?? "",
  );
  const [shutterType, setShutterType] = useState(listing.shutterType ?? "");
  const [carpentryType, setCarpentryType] = useState(
    listing.carpentryType ?? "",
  );
  const [windowType, setWindowType] = useState(listing.windowType ?? "");
  const [views, setViews] = useState(listing.views ?? false);
  const [mountainViews, setMountainViews] = useState(
    listing.mountainViews ?? false,
  );
  const [seaViews, setSeaViews] = useState(listing.seaViews ?? false);
  const [beachfront, setBeachfront] = useState(listing.beachfront ?? false);
  const [jacuzzi, setJacuzzi] = useState(listing.jacuzzi ?? false);
  const [hydromassage, setHydromassage] = useState(
    listing.hydromassage ?? false,
  );
  const [garden, setGarden] = useState(listing.garden ?? false);
  const [pool, setPool] = useState(listing.pool ?? false);
  const [homeAutomation, setHomeAutomation] = useState(
    listing.homeAutomation ?? false,
  );
  const [musicSystem, setMusicSystem] = useState(listing.musicSystem ?? false);
  const [laundryRoom, setLaundryRoom] = useState(listing.laundryRoom ?? false);
  const [coveredClothesline, setCoveredClothesline] = useState(
    listing.coveredClothesline ?? false,
  );
  const [fireplace, setFireplace] = useState(listing.fireplace ?? false);
  const [city, setCity] = useState(listing.city ?? "");
  const [province, setProvince] = useState(listing.province ?? "");
  const [municipality, setMunicipality] = useState(listing.municipality ?? "");
  const [showAdditionalCharacteristics, setShowAdditionalCharacteristics] =
    useState(false);
  const [showMaterials, setShowMaterials] = useState(false);
  const [optionalGaragePrice, setOptionalGaragePrice] = useState(() => {
    const price = listing.optionalGaragePrice;
    return price && !isNaN(Number(price)) ? Number(price) : 0;
  });
  const [optionalStorageRoomPrice, setOptionalStorageRoomPrice] = useState(
    () => {
      const price = listing.optionalStorageRoomPrice;
      return price && !isNaN(Number(price)) ? Number(price) : 0;
    },
  );
  const [selectedAgentId, setSelectedAgentId] = useState(
    listing.agent?.id?.toString() ?? "",
  );
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<string[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [newConstruction, setNewConstruction] = useState(
    listing.newConstruction ?? false,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingShort, setIsGeneratingShort] = useState(false);
  const [description, setDescription] = useState(listing.description ?? "");
  const [shortDescription, setShortDescription] = useState(listing.shortDescription ?? "");
  const [isCatastroPopupOpen, setIsCatastroPopupOpen] = useState(false);
  const [isMapsPopupOpen, setIsMapsPopupOpen] = useState(false);
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);
  const [signature, setSignature] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteListingModalOpen, setIsDeleteListingModalOpen] = useState(false);
  const [isDeletingListing, setIsDeletingListing] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  // State for collapsible sections (all closed by default)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    basicInfo: true,
    propertyDetails: true,
    location: true,
    features: true,
    contactInfo: true,
    orientation: true,
    additionalCharacteristics: true,
    premiumFeatures: true,
    additionalSpaces: true,
    materials: true,
    description: true,
    rentalProperties: true,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // New community amenity states
  const [gym, setGym] = useState(listing.gym ?? false);
  const [sportsArea, setSportsArea] = useState(listing.sportsArea ?? false);
  const [childrenArea, setChildrenArea] = useState(
    listing.childrenArea ?? false,
  );
  const [suiteBathroom, setSuiteBathroom] = useState(
    listing.suiteBathroom ?? false,
  );
  const [nearbyPublicTransport, setNearbyPublicTransport] = useState(
    listing.nearbyPublicTransport ?? false,
  );
  const [communityPool, setCommunityPool] = useState(
    listing.communityPool ?? false,
  );
  const [privatePool, setPrivatePool] = useState(listing.privatePool ?? false);
  const [tennisCourt, setTennisCourt] = useState(listing.tennisCourt ?? false);

  // Appliance states from listings
  const [internet, setInternet] = useState(listing.internet ?? false);
  const [oven, setOven] = useState(listing.oven ?? false);
  const [microwave, setMicrowave] = useState(listing.microwave ?? false);
  const [washingMachine, setWashingMachine] = useState(
    listing.washingMachine ?? false,
  );
  const [fridge, setFridge] = useState(listing.fridge ?? false);
  const [tv, setTv] = useState(listing.tv ?? false);
  const [stoneware, setStoneware] = useState(listing.stoneware ?? false);
  
  // Rental duplicate state
  const [duplicateForRent, setDuplicateForRent] = useState(false);
  const [rentalPrice, setRentalPrice] = useState(0);
  
  // Toggle button states
  const [hasKeys, setHasKeys] = useState<boolean>(false);
  const [keysLoading, setKeysLoading] = useState(false);
  const [publishToWebsite, setPublishToWebsite] = useState<boolean>(false);
  const [websiteLoading, setWebsiteLoading] = useState(false);
  

  // Filter owners based on search
  const filteredOwners = owners.filter((owner) =>
    owner.name.toLowerCase().includes(ownerSearch.toLowerCase()),
  );



  // Set selectedAgentId when listing agent data is available
  useEffect(() => {
    if (listing.agent?.id) {
      setSelectedAgentId(listing.agent.id.toString());
    }
  }, [listing.agent?.id]);

  // Comprehensive data fetching - batch all API calls
  useEffect(() => {
    const fetchAllFormData = async () => {
      try {
        console.log('Fetching all form data in single batch...');
        
        // Batch all API calls in parallel for maximum performance
        const [agentsData, potentialOwnersData, currentOwnersData, listingDetailsData] = await Promise.all([
          getAllAgentsWithAuth(),
          getAllPotentialOwnersWithAuth(),
          listing.listingId ? getCurrentListingOwnersWithAuth(Number(listing.listingId)) : Promise.resolve([]),
          listing.listingId ? getListingDetailsWithAuth(Number(listing.listingId)) : Promise.resolve(null),
        ]);

        // Process agents data
        setAgents(
          agentsData.map((agent) => ({
            id: agent.id,
            name: agent.name,
          })),
        );

        // Process owners data
        setOwners(
          potentialOwnersData.map((owner) => ({
            id: Number(owner.id),
            name: owner.name,
          })),
        );

        // Process current listing owners
        if (currentOwnersData.length > 0) {
          setSelectedOwnerIds(
            currentOwnersData.map((owner) => owner.id.toString()),
          );
        }

        // Process listing details for toggle states
        if (listingDetailsData) {
          const details = listingDetailsData as { hasKeys?: boolean; publishToWebsite?: boolean };
          setHasKeys(details.hasKeys ?? false);
          setPublishToWebsite(details.publishToWebsite ?? false);
        }

        console.log('✅ All form data fetched successfully - Performance optimized!');
      } catch (error) {
        console.error('❌ Error fetching form data:', error);
        // Set fallback values on error
        setAgents([]);
        setOwners([]);
        setSelectedOwnerIds([]);
        setHasKeys(false);
        setPublishToWebsite(false);
      }
    };

    void fetchAllFormData();
  }, [listing.listingId]);

  // Toggle handlers
  const handleToggleKeys = async () => {
    if (keysLoading) return;
    
    setKeysLoading(true);
    const previousValue = hasKeys;
    
    // Optimistic update
    setHasKeys(!hasKeys);
    
    try {
      const result = await toggleListingKeysWithAuth(Number(listing.listingId));
      setHasKeys(result.hasKeys);
    } catch (error) {
      console.error('Error toggling keys:', error);
      // Revert optimistic update on error
      setHasKeys(previousValue);
    } finally {
      setKeysLoading(false);
    }
  };

  const handleToggleWebsite = async () => {
    if (websiteLoading) return;
    
    setWebsiteLoading(true);
    const previousValue = publishToWebsite;
    
    // Optimistic update
    setPublishToWebsite(!publishToWebsite);
    
    try {
      const result = await toggleListingPublishToWebsiteWithAuth(Number(listing.listingId));
      setPublishToWebsite(result.publishToWebsite);
    } catch (error) {
      console.error('Error toggling publishToWebsite:', error);
      // Revert optimistic update on error
      setPublishToWebsite(previousValue);
    } finally {
      setWebsiteLoading(false);
    }
  };

  const toggleListingType = (type: string) => {
    setListingTypes([type]); // Replace the current type with the new one
    updateModuleState("basicInfo", true);
  };

  const handleSecondaryListingType = (
    type: "RentWithOption" | "RoomSharing" | "Transfer",
  ) => {
    if (type === "RentWithOption") {
      if (listingTypes[0] === "RentWithOption") {
        setListingTypes(["Rent"]);
      } else {
        setListingTypes(["RentWithOption"]);
      }
    } else if (type === "RoomSharing") {
      if (listingTypes[0] === "RoomSharing") {
        setListingTypes(["Rent"]);
      } else {
        setListingTypes(["RoomSharing"]);
      }
    } else if (type === "Transfer") {
      if (listingTypes[0] === "Transfer") {
        setListingTypes(["Sale"]);
      } else {
        setListingTypes(["Transfer"]);
      }
    }
    updateModuleState("basicInfo", true);
  };

  const handlePropertyTypeChange = async (newType: string) => {
    setPropertyType(newType); // Update local state only, don't change URL
    
    // Generate new title based on the new property type
    const newTitle = generatePropertyTitle(newType, listing.street, listing.neighborhood);
    
    // Update the property title in the database
    try {
      const propertyId = Number(listing.propertyId);
      if (!propertyId) {
        throw new Error("Property ID is required");
      }
      
      await updateProperty(propertyId, {
        propertyType: newType,
        title: newTitle,
      });
      
      // Update local listing data
      listing.propertyType = newType;
      
      toast.success("Tipo de propiedad y título actualizados");
    } catch (error) {
      console.error("Error updating property type and title:", error);
      toast.error("Error al actualizar el tipo de propiedad");
    }
    
    // Remove URL update to prevent component re-mounting which causes form switching
    // const params = new URLSearchParams(searchParams.toString());
    // params.set("type", newType);
    // router.push(`?${params.toString()}`);
  };

  const handleGenerateDescription = async () => {
    try {
      setIsGenerating(true);
      const listingWithNumberTypes = {
        ...listing,
        lastRenovationYear: lastRenovationYear ? String(lastRenovationYear) : undefined,
      };
      const generatedDescription = await generatePropertyDescription(
        listingWithNumberTypes,
      );
      setDescription(generatedDescription);
      // Update the textarea value
      const descriptionTextarea = document.getElementById(
        "description",
      ) as HTMLTextAreaElement;
      if (descriptionTextarea) {
        descriptionTextarea.value = generatedDescription;
        // Trigger the change event to mark the module as modified
        updateModuleState("description", true);
      }
    } catch (error) {
      console.error("Error generating description:", error);
      // You might want to show a toast notification here
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateShortDescription = async () => {
    try {
      setIsGeneratingShort(true);
      
      // Check if we have a full description to summarize
      if (!description || description.trim() === "") {
        // If no full description exists, generate it first
        await handleGenerateDescription();
      }
      
      // Now generate short description based on the full description
      if (description && description.trim() !== "") {
        const listingWithStringTypes = {
          ...listing,
          lastRenovationYear: lastRenovationYear ? String(lastRenovationYear) : undefined,
        };
        
        const generatedShortDescription = await generateShortPropertyDescription(
          description,
          listingWithStringTypes
        );
        
        setShortDescription(generatedShortDescription);
        
        // Update the textarea value
        const shortDescTextarea = document.getElementById(
          "shortDescription",
        ) as HTMLTextAreaElement;
        if (shortDescTextarea) {
          shortDescTextarea.value = generatedShortDescription;
          // Trigger the change event to mark the module as modified
          updateModuleState("description", true);
        }
      } else {
        console.error("No full description available to summarize");
      }
    } catch (error) {
      console.error("Error generating short description:", error);
    } finally {
      setIsGeneratingShort(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!listing.propertyId) {
      toast.error("No se pudo encontrar la propiedad a eliminar");
      return;
    }

    setIsDeleting(true);
    
    try {
      const result = await deletePropertyWithAuth(Number(listing.propertyId));
      
      if (result.success) {
        toast.success(result.message);
        // Redirect to properties list after successful deletion
        router.push("/propiedades");
      } else {
        toast.error("Error al eliminar la propiedad");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Error al eliminar la propiedad");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!listing.listingId) {
      toast.error("No se pudo encontrar el anuncio a eliminar");
      return;
    }

    setIsDeletingListing(true);
    
    try {
      const result = await deleteListingWithAuth(Number(listing.listingId));
      
      if (result.success) {
        toast.success(result.message);
        // Redirect to properties list after successful deletion
        router.push("/propiedades");
      } else {
        toast.error("Error al eliminar el anuncio");
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Error al eliminar el anuncio");
    } finally {
      setIsDeletingListing(false);
      setIsDeleteListingModalOpen(false);
    }
  };

  const handleDiscardListing = async () => {
    if (!listing.listingId) {
      toast.error("No se pudo encontrar el anuncio a descartar");
      return;
    }

    setIsDiscarding(true);
    
    try {
      const result = await discardListingWithAuth(Number(listing.listingId));
      
      if (result.success) {
        toast.success(result.message);
        // Reload the page to reflect the updated status
        window.location.reload();
      } else {
        toast.error("Error al descartar el anuncio");
      }
    } catch (error) {
      console.error("Error discarding listing:", error);
      toast.error("Error al descartar el anuncio");
    } finally {
      setIsDiscarding(false);
      setIsDiscardModalOpen(false);
    }
  };

  const handleRecoverListing = async () => {
    if (!listing.listingId) {
      toast.error("No se pudo encontrar el anuncio a recuperar");
      return;
    }

    setIsDiscarding(true);
    
    try {
      const result = await recoverListingWithAuth(Number(listing.listingId));
      
      if (result.success) {
        toast.success(result.message);
        // Reload the page to reflect the updated status
        window.location.reload();
      } else {
        toast.error("Error al recuperar el anuncio");
      }
    } catch (error) {
      console.error("Error recovering listing:", error);
      toast.error("Error al recuperar el anuncio");
    } finally {
      setIsDiscarding(false);
      setIsDiscardModalOpen(false);
    }
  };

  const getCardStyles = (moduleName: string) => {
    const state = moduleStates[moduleName]?.saveState;

    switch (state) {
      case "modified":
        return "ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10 border-amber-500/20";
      case "saving":
        return "ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10 border-amber-500/20";
      case "saved":
        return "ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10 border-emerald-500/20";
      case "error":
        return "ring-2 ring-red-500/20 shadow-lg shadow-red-500/10 border-red-500/20";
      default:
        return "hover:shadow-lg transition-all duration-300";
    }
  };

  // Add this near the top of the component, after listingTypes is defined
  const currentListingType = listingTypes[0] ?? "";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2">
      {/* Property Summary */}
      <PropertySummaryCard
        listing={listing}
        propertyType={propertyType}
        selectedOwnerIds={selectedOwnerIds}
        owners={owners}
        selectedAgentId={selectedAgentId}
        agents={agents}
        hasKeys={hasKeys}
        keysLoading={keysLoading}
        publishToWebsite={publishToWebsite}
        websiteLoading={websiteLoading}
        onToggleKeys={handleToggleKeys}
        onToggleWebsite={handleToggleWebsite}
      />

      {/* Basic Information */}
      <Card
        className={cn(
          "relative p-4 transition-all duration-500 ease-out",
          getCardStyles("basicInfo"),
        )}
      >
        <ModernSaveIndicator
          state={moduleStates.basicInfo?.saveState ?? "idle"}
          onSave={() => saveModule("basicInfo")}
        />
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggleSection("basicInfo")}
            className="group flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                RESUMEN DEL INMUEBLE
              </h3>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                collapsedSections.basicInfo && "rotate-180",
              )}
            />
          </button>
        </div>
        <div
          className={cn(
            "space-y-3 overflow-hidden transition-all duration-200",
            collapsedSections.basicInfo ? "max-h-0" : "max-h-[2000px]",
          )}
        >
          <div className="space-y-1.5">
            <PropertyTitle
              propertyType={propertyType}
              street={listing.street}
              neighborhood={listing.neighborhood}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Tipo de Anuncio</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={
                  ["Sale", "Transfer"].includes(currentListingType)
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => {
                  toggleListingType("Sale");
                  updateModuleState("basicInfo", true);
                }}
                className="flex-1"
              >
                Venta
              </Button>
              <Button
                type="button"
                variant={
                  ["Rent", "RentWithOption", "RoomSharing"].includes(
                    currentListingType,
                  )
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => {
                  toggleListingType("Rent");
                  updateModuleState("basicInfo", true);
                }}
                className="flex-1"
              >
                Alquiler
              </Button>
            </div>
          </div>

          {/* Secondary checkboxes, vertical for rent types */}
          {["Rent", "RentWithOption", "RoomSharing"].includes(
            currentListingType,
          ) && (
            <div className="ml-2 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="roomSharingProperty"
                  checked={currentListingType === "RoomSharing"}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleSecondaryListingType("RoomSharing");
                    } else {
                      toggleListingType("Rent");
                    }
                  }}
                />
                <Label
                  htmlFor="roomSharingProperty"
                  className="cursor-pointer select-none text-xs text-gray-700"
                >
                  Compartir habitación
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rentWithOptionProperty"
                  checked={currentListingType === "RentWithOption"}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleSecondaryListingType("RentWithOption");
                    } else {
                      toggleListingType("Rent");
                    }
                  }}
                />
                <Label
                  htmlFor="rentWithOptionProperty"
                  className="cursor-pointer select-none text-xs text-gray-700"
                >
                  Alquiler con opción a compra
                </Label>
              </div>
            </div>
          )}
          {["Sale", "Transfer"].includes(currentListingType) && (
            <div className="ml-2 flex flex-row items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="transferProperty"
                  checked={currentListingType === "Transfer"}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleSecondaryListingType("Transfer");
                    } else {
                      toggleListingType("Sale");
                    }
                  }}
                />
                <Label
                  htmlFor="transferProperty"
                  className="cursor-pointer select-none text-xs text-gray-700"
                >
                  Transferencia
                </Label>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="propertyType" className="text-sm">
              Tipo de Propiedad
            </Label>
            <Select
              value={propertyType}
              onValueChange={async (value) => {
                await handlePropertyTypeChange(value);
                updateModuleState("basicInfo", true);
              }}
            >
              <SelectTrigger className="h-8 text-gray-500">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="piso">Piso</SelectItem>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="solar">Solar</SelectItem>
                <SelectItem value="garaje">Garaje</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="propertySubtype" className="text-sm">
              Subtipo de Propiedad
            </Label>
            <Select
              value={
                listing.propertySubtype ??
                (propertyType === "piso"
                  ? "Piso"
                  : propertyType === "casa"
                    ? "Casa"
                    : propertyType === "local"
                      ? "Otros"
                      : propertyType === "solar"
                        ? "Suelo residencial"
                        : propertyType === "garaje"
                          ? "Individual"
                          : "")
              }
              onValueChange={(value) => {
                // Note: This directly modifies the listing object - consider using state instead
                if (listing.propertySubtype !== undefined) {
                  listing.propertySubtype = value;
                }
                updateModuleState("basicInfo", true);
              }}
            >
              <SelectTrigger className="h-8 text-gray-500">
                <SelectValue placeholder="Seleccionar subtipo" />
              </SelectTrigger>
              <SelectContent>
                {propertyType === "piso" && (
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
                {propertyType === "casa" && (
                  <>
                    <SelectItem value="Casa">Casa</SelectItem>
                    <SelectItem value="Casa adosada">Casa adosada</SelectItem>
                    <SelectItem value="Casa pareada">Casa pareada</SelectItem>
                    <SelectItem value="Chalet">Chalet</SelectItem>
                    <SelectItem value="Casa rústica">Casa rústica</SelectItem>
                    <SelectItem value="Bungalow">Bungalow</SelectItem>
                  </>
                )}
                {propertyType === "local" && (
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
                {propertyType === "solar" && (
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
                {propertyType === "garaje" && (
                  <>
                    <SelectItem value="Moto">Moto</SelectItem>
                    <SelectItem value="Doble">Doble</SelectItem>
                    <SelectItem value="Individual">Individual</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-sm">
              Precio
            </Label>
            <Input
              id="price"
              type="number"
              defaultValue={
                listing.price ? parseInt(listing.price.toString()) : undefined
              }
              className="h-8 text-gray-500"
              min="0"
              step="1"
              onChange={() => updateModuleState("basicInfo", true)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cadastralReference" className="text-sm">
              Referencia Catastral
            </Label>
            <div className="flex gap-2">
              <Input
                id="cadastralReference"
                type="text"
                defaultValue={listing.cadastralReference}
                className="h-8 text-gray-500"
                onChange={() => updateModuleState("basicInfo", true)}
              />
              {listing.cadastralReference && (
                <button
                  onClick={() => setIsCatastroPopupOpen(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <Image
                    src="https://vesta-configuration-files.s3.amazonaws.com/logos/logo-catastro.png"
                    alt="Catastro"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </button>
              )}
            </div>
          </div>

          <div className="my-2 border-t border-border" />

          <div className="flex items-center gap-2">
            <Button
              variant={isBankOwned ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setIsBankOwned(!isBankOwned);
                updateModuleState("basicInfo", true);
              }}
            >
              <Building2 className="mr-1 h-3.5 w-3.5" />
              {propertyType === "piso" 
                ? "Piso de banco" 
                : propertyType === "casa" 
                  ? "Casa de banco"
                  : propertyType === "local"
                    ? "Local de banco"
                    : propertyType === "garaje"
                      ? "Garaje de banco"
                      : propertyType === "solar"
                        ? "Solar de banco"
                        : "Propiedad de banco"}
            </Button>
            <Button
              variant={newConstruction ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setNewConstruction(!newConstruction);
                updateModuleState("basicInfo", true);
              }}
            >
              <Building2 className="mr-1 h-3.5 w-3.5" />
              Obra nueva
            </Button>
          </div>

          <div className="my-2 border-t border-border" />
        </div>
      </Card>

      {/* Property Details */}
      <PropertyDetailsCard
        listing={listing}
        propertyType={propertyType}
        lastRenovationYear={lastRenovationYear.toString()}
        buildingFloors={buildingFloors}
        collapsedSections={collapsedSections}
        saveState={moduleStates.propertyDetails?.saveState ?? "idle"}
        onToggleSection={toggleSection}
        onSave={() => saveModule("propertyDetails")}
        onUpdateModule={(hasChanges) => updateModuleState("propertyDetails", hasChanges)}
        setLastRenovationYear={setLastRenovationYear}
        setBuildingFloors={setBuildingFloors}
        getCardStyles={getCardStyles}
      />

      {/* Location */}
      <Card
        className={cn(
          "relative p-4 transition-all duration-500 ease-out",
          getCardStyles("location"),
        )}
      >
        <ModernSaveIndicator
          state={moduleStates.location?.saveState ?? "idle"}
          onSave={() => saveModule("location")}
        />
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggleSection("location")}
            className="group flex flex-1 items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                DIRECCIÓN DEL INMUEBLE
              </h3>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMapsPopupOpen(true);
                }}
                className="flex h-6 w-6 items-center justify-center rounded-md bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <Image
                  src="https://vesta-configuration-files.s3.amazonaws.com/logos/googlemapsicon.png"
                  alt="Google Maps"
                  width={14}
                  height={14}
                  className="object-contain"
                />
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                collapsedSections.location && "rotate-180",
              )}
            />
          </button>
        </div>
        <div
          className={cn(
            "space-y-3 overflow-hidden transition-all duration-200",
            collapsedSections.location ? "max-h-0" : "max-h-[2000px]",
          )}
        >
          <div className="space-y-1.5">
            <Label htmlFor="street" className="text-sm">
              Calle
            </Label>
            <Input
              id="street"
              defaultValue={listing.street}
              className="h-8 text-gray-500"
              onChange={() => updateModuleState("location", true)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="addressDetails" className="text-sm">
              Detalles de la dirección
            </Label>
            <Input
              id="addressDetails"
              defaultValue={listing.addressDetails}
              className="h-8 text-gray-500"
              placeholder="Piso, puerta, escalera, etc."
              onChange={() => updateModuleState("location", true)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="postalCode" className="text-sm">
                Código Postal
              </Label>
              <Input
                id="postalCode"
                defaultValue={listing.postalCode}
                className="h-8 text-gray-500"
                onChange={() => updateModuleState("location", true)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="neighborhood" className="text-sm">
                Barrio
              </Label>
              <Input
                id="neighborhood"
                defaultValue={listing.neighborhood}
                className="h-8 bg-muted"
                disabled
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-sm">
                Ciudad
              </Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  updateModuleState("location", true);
                }}
                className="h-8 text-gray-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="municipality" className="text-sm">
                Municipio
              </Label>
              <Input
                id="municipality"
                value={municipality}
                onChange={(e) => {
                  setMunicipality(e.target.value);
                  updateModuleState("location", true);
                }}
                className="h-8 text-gray-500"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="province" className="text-sm">
              Provincia
            </Label>
            <Input
              id="province"
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                updateModuleState("location", true);
              }}
              className="h-8 text-gray-500"
            />
          </div>
        </div>
      </Card>

      {/* Features */}
      <FeaturesCard
        listing={listing}
        propertyType={propertyType}
        isFurnished={isFurnished}
        isHeating={isHeating}
        heatingType={heatingType}
        isHotWater={isHotWater}
        hotWaterType={hotWaterType}
        isAirConditioning={isAirConditioning}
        airConditioningType={airConditioningType}
        hasGarage={hasGarage}
        garageType={garageType}
        garageSpaces={garageSpaces}
        garageInBuilding={garageInBuilding}
        garageNumber={garageNumber}
        hasStorageRoom={hasStorageRoom}
        storageRoomSize={storageRoomSize}
        storageRoomNumber={storageRoomNumber}
        optionalGaragePrice={optionalGaragePrice}
        optionalStorageRoomPrice={optionalStorageRoomPrice}
        oven={oven}
        microwave={microwave}
        washingMachine={washingMachine}
        fridge={fridge}
        tv={tv}
        stoneware={stoneware}
        collapsedSections={collapsedSections}
        saveState={moduleStates.features?.saveState ?? "idle"}
        onToggleSection={toggleSection}
        onSave={() => saveModule("features")}
        onUpdateModule={(hasChanges) => updateModuleState("features", hasChanges)}
        setIsFurnished={setIsFurnished}
        setIsHeating={setIsHeating}
        setHeatingType={setHeatingType}
        setIsHotWater={setIsHotWater}
        setHotWaterType={setHotWaterType}
        setIsAirConditioning={setIsAirConditioning}
        setAirConditioningType={setAirConditioningType}
        setHasGarage={setHasGarage}
        setGarageType={setGarageType}
        setGarageSpaces={setGarageSpaces}
        setGarageInBuilding={setGarageInBuilding}
        setGarageNumber={setGarageNumber}
        setHasStorageRoom={setHasStorageRoom}
        setStorageRoomSize={setStorageRoomSize}
        setStorageRoomNumber={setStorageRoomNumber}
        setOptionalGaragePrice={setOptionalGaragePrice}
        setOptionalStorageRoomPrice={setOptionalStorageRoomPrice}
        setOven={setOven}
        setMicrowave={setMicrowave}
        setWashingMachine={setWashingMachine}
        setFridge={setFridge}
        setTv={setTv}
        setStoneware={setStoneware}
        getCardStyles={getCardStyles}
      />

      {/* Contact Information */}
      <Card
        className={cn(
          "relative p-4 transition-all duration-500 ease-out",
          getCardStyles("contactInfo"),
        )}
      >
        <ModernSaveIndicator
          state={moduleStates.contactInfo?.saveState ?? "idle"}
          onSave={() => saveModule("contactInfo")}
        />
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggleSection("contactInfo")}
            className="group flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                DATOS DE CONTACTO
              </h3>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                collapsedSections.contactInfo && "rotate-180",
              )}
            />
          </button>
        </div>
        <div
          className={cn(
            "space-y-3 overflow-hidden transition-all duration-200",
            collapsedSections.contactInfo ? "max-h-0" : "max-h-[1000px]",
          )}
        >
          <div className="space-y-1.5">
            <Label htmlFor="owners" className="text-sm">
              Propietarios
            </Label>
            <div className="flex gap-2">
              <Select
                value={selectedOwnerIds[0]} // We'll handle multiple selection differently
                onValueChange={(value) => {
                  if (!selectedOwnerIds.includes(value)) {
                    setSelectedOwnerIds([...selectedOwnerIds, value]);
                    updateModuleState("contactInfo", true);
                  }
                }}
              >
                <SelectTrigger className="h-8 flex-1 text-gray-500">
                  <SelectValue placeholder="Añadir propietario" />
                </SelectTrigger>
                <SelectContent>
                  <div className="flex items-center px-3 pb-2">
                    <input
                      className="flex h-9 w-full rounded-md bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Buscar propietario..."
                      value={ownerSearch}
                      onChange={(e) => setOwnerSearch(e.target.value)}
                    />
                  </div>
                  <Separator className="mb-2" />
                  {filteredOwners.map((owner) => (
                    <SelectItem
                      key={owner.id}
                      value={owner.id.toString()}
                      disabled={selectedOwnerIds.includes(owner.id.toString())}
                    >
                      {owner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Display selected owners */}
            {selectedOwnerIds.length > 0 && (
              <div className="mt-2 space-y-1">
                {selectedOwnerIds.map((ownerId) => {
                  const owner = owners.find((o) => o.id.toString() === ownerId);
                  return owner ? (
                    <div
                      key={ownerId}
                      className="flex cursor-pointer items-center justify-between rounded-md bg-blue-50 px-2 py-1 shadow-md transition-all duration-200 hover:border-blue-300 hover:bg-blue-100"
                      onClick={() => router.push(`/contactos/${owner.id}`)}
                    >
                      <span className="text-sm">{owner.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent onClick
                          setSelectedOwnerIds(
                            selectedOwnerIds.filter((id) => id !== ownerId),
                          );
                          updateModuleState("contactInfo", true);
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="agent" className="text-sm">
              Agente
            </Label>
            <div className="flex gap-2">
              <Select
                value={selectedAgentId}
                onValueChange={(value) => {
                  setSelectedAgentId(value);
                  updateModuleState("contactInfo", true);
                }}
              >
                <SelectTrigger className="h-8 flex-1 text-gray-500">
                  <SelectValue placeholder="Seleccionar agente" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Orientation and Exposure */}
      <OrientationCard
        isExterior={isExterior}
        isBright={isBright}
        orientation={orientation}
        propertyType={propertyType}
        collapsedSections={collapsedSections}
        saveState={moduleStates.orientation?.saveState ?? "idle"}
        onToggleSection={toggleSection}
        onSave={() => saveModule("orientation")}
        onUpdateModule={(hasChanges) => updateModuleState("orientation", hasChanges)}
        setIsExterior={setIsExterior}
        setIsBright={setIsBright}
        setOrientation={setOrientation}
        getCardStyles={getCardStyles}
      />

      {/* Separator for secondary sections */}
      <div className="col-span-full">
        <Separator className="my-3 opacity-50" />
      </div>

      {/* Additional Characteristics */}
      <AdditionalCharacteristicsCard
        disabledAccessible={disabledAccessible}
        vpo={vpo}
        videoIntercom={videoIntercom}
        conciergeService={conciergeService}
        securityGuard={securityGuard}
        satelliteDish={satelliteDish}
        doubleGlazing={doubleGlazing}
        alarm={alarm}
        securityDoor={securityDoor}
        kitchenType={kitchenType}
        openKitchen={openKitchen}
        frenchKitchen={frenchKitchen}
        furnishedKitchen={furnishedKitchen}
        pantry={pantry}
        propertyType={propertyType}
        showAdditionalCharacteristics={showAdditionalCharacteristics}
        saveState={moduleStates.additionalCharacteristics?.saveState ?? "idle"}
        onSave={() => saveModule("additionalCharacteristics")}
        onUpdateModule={(hasChanges) => updateModuleState("additionalCharacteristics", hasChanges)}
        setDisabledAccessible={setDisabledAccessible}
        setVpo={setVpo}
        setVideoIntercom={setVideoIntercom}
        setConciergeService={setConciergeService}
        setSecurityGuard={setSecurityGuard}
        setSatelliteDish={setSatelliteDish}
        setDoubleGlazing={setDoubleGlazing}
        setAlarm={setAlarm}
        setSecurityDoor={setSecurityDoor}
        setKitchenType={setKitchenType}
        setOpenKitchen={setOpenKitchen}
        setFrenchKitchen={setFrenchKitchen}
        setFurnishedKitchen={setFurnishedKitchen}
        setPantry={setPantry}
        setShowAdditionalCharacteristics={setShowAdditionalCharacteristics}
        getCardStyles={getCardStyles}
      />

      {/* Premium Features */}
      <PremiumFeaturesCard
        propertyType={propertyType}
        views={views}
        mountainViews={mountainViews}
        seaViews={seaViews}
        beachfront={beachfront}
        jacuzzi={jacuzzi}
        hydromassage={hydromassage}
        garden={garden}
        pool={pool}
        homeAutomation={homeAutomation}
        musicSystem={musicSystem}
        laundryRoom={laundryRoom}
        coveredClothesline={coveredClothesline}
        fireplace={fireplace}
        gym={gym}
        sportsArea={sportsArea}
        childrenArea={childrenArea}
        suiteBathroom={suiteBathroom}
        nearbyPublicTransport={nearbyPublicTransport}
        communityPool={communityPool}
        privatePool={privatePool}
        tennisCourt={tennisCourt}
        collapsedSections={collapsedSections}
        saveState={moduleStates.premiumFeatures?.saveState ?? "idle"}
        onToggleSection={toggleSection}
        onSave={() => saveModule("premiumFeatures")}
        onUpdateModule={(hasChanges) => updateModuleState("premiumFeatures", hasChanges)}
        setViews={setViews}
        setMountainViews={setMountainViews}
        setSeaViews={setSeaViews}
        setBeachfront={setBeachfront}
        setJacuzzi={setJacuzzi}
        setHydromassage={setHydromassage}
        setGarden={setGarden}
        setPool={setPool}
        setHomeAutomation={setHomeAutomation}
        setMusicSystem={setMusicSystem}
        setLaundryRoom={setLaundryRoom}
        setCoveredClothesline={setCoveredClothesline}
        setFireplace={setFireplace}
        setGym={setGym}
        setSportsArea={setSportsArea}
        setChildrenArea={setChildrenArea}
        setSuiteBathroom={setSuiteBathroom}
        setNearbyPublicTransport={setNearbyPublicTransport}
        setCommunityPool={setCommunityPool}
        setPrivatePool={setPrivatePool}
        setTennisCourt={setTennisCourt}
        getCardStyles={getCardStyles}
      />

      {/* Additional Spaces */}
      <AdditionalSpacesCard
        terrace={terrace}
        terraceSize={terraceSize}
        wineCellar={wineCellar}
        wineCellarSize={wineCellarSize}
        livingRoomSize={livingRoomSize}
        balconyCount={balconyCount}
        galleryCount={galleryCount}
        builtInWardrobes={builtInWardrobes}
        propertyType={propertyType}
        collapsedSections={collapsedSections}
        saveState={moduleStates.additionalSpaces?.saveState ?? "idle"}
        onToggleSection={toggleSection}
        onSave={() => saveModule("additionalSpaces")}
        onUpdateModule={(hasChanges) => updateModuleState("additionalSpaces", hasChanges)}
        setTerrace={setTerrace}
        setTerraceSize={setTerraceSize}
        setWineCellar={setWineCellar}
        setWineCellarSize={setWineCellarSize}
        setLivingRoomSize={setLivingRoomSize}
        setBalconyCount={setBalconyCount}
        setGalleryCount={setGalleryCount}
        setBuiltInWardrobes={setBuiltInWardrobes}
        getCardStyles={getCardStyles}
      />

      <MaterialsCard
        mainFloorType={mainFloorType}
        shutterType={shutterType}
        carpentryType={carpentryType}
        windowType={windowType}
        propertyType={propertyType}
        showMaterials={showMaterials}
        saveState={moduleStates.materials?.saveState ?? "idle"}
        onSave={() => saveModule("materials")}
        onUpdateModule={(hasChanges) => updateModuleState("materials", hasChanges)}
        setMainFloorType={setMainFloorType}
        setShutterType={setShutterType}
        setCarpentryType={setCarpentryType}
        setWindowType={setWindowType}
        setShowMaterials={setShowMaterials}
        getCardStyles={getCardStyles}
      />

      {/* Separator before Description */}
      <div className="col-span-full">
        <Separator className="my-3 opacity-50" />
      </div>

      {/* Description Module */}
      <DescriptionCard
        description={description}
        shortDescription={shortDescription}
        isGenerating={isGenerating}
        isGeneratingShort={isGeneratingShort}
        signature={signature}
        isSignatureDialogOpen={isSignatureDialogOpen}
        saveState={moduleStates.description?.saveState ?? "idle"}
        onSave={() => saveModule("description")}
        onUpdateModule={(hasChanges) => updateModuleState("description", hasChanges)}
        onGenerateDescription={handleGenerateDescription}
        onGenerateShortDescription={handleGenerateShortDescription}
        setSignature={setSignature}
        setIsSignatureDialogOpen={setIsSignatureDialogOpen}
        setDescription={setDescription}
        setShortDescription={setShortDescription}
        getCardStyles={getCardStyles}
      />

      {/* Rental Properties Module */}
      <div className="col-span-full">
        <RentalPropertiesCard
          listingType={currentListingType}
          propertyType={propertyType}
          internet={internet}
          studentFriendly={studentFriendly}
          petsAllowed={petsAllowed}
          appliancesIncluded={appliancesIncluded}
          duplicateForRent={duplicateForRent}
          rentalPrice={rentalPrice}
          collapsedSections={collapsedSections}
          saveState={moduleStates.rentalProperties?.saveState ?? "idle"}
          // Listing data for duplication
          propertyId={listing.propertyId}
          listingId={listing.listingId}
          agentId={listing.agent?.id}
          isFurnished={isFurnished}
          furnitureQuality={listing.furnitureQuality ?? ""}
          optionalGaragePrice={optionalGaragePrice}
          optionalStorageRoomPrice={optionalStorageRoomPrice}
          onToggleSection={toggleSection}
          onSave={() => saveModule("rentalProperties")}
          onUpdateModule={(hasChanges) => updateModuleState("rentalProperties", hasChanges)}
          setInternet={setInternet}
          setStudentFriendly={setStudentFriendly}
          setPetsAllowed={setPetsAllowed}
          setAppliancesIncluded={setAppliancesIncluded}
          setDuplicateForRent={setDuplicateForRent}
          setRentalPrice={setRentalPrice}
          getCardStyles={getCardStyles}
        />
      </div>
      
      {/* Action Buttons - Discard, Delete Listing, and Delete Property */}
      <div className="col-span-full mt-6">
        <div className="flex justify-center gap-4 flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDiscardModalOpen(true)}
            className="text-gray-600 hover:text-gray-800"
          >
            {listing.status === "Descartado" ? "Recuperar Anuncio" : "Descartar Anuncio"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setIsDeleteListingModalOpen(true)}
            className="bg-white hover:bg-red-50 border-2 border-red-500 border-dashed text-red-600 hover:text-red-700"
          >
            Borrar Anuncio
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Eliminar Propiedad
          </Button>
        </div>
      </div>
      <ExternalLinkPopup
        isOpen={isCatastroPopupOpen}
        onClose={() => setIsCatastroPopupOpen(false)}
        url={`https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCConCiud.aspx?UrbRus=U&RefC=${listing.cadastralReference}&esBice=&RCBice1=&RCBice2=&DenoBice=&from=OVCBusqueda&pest=rc&RCCompleta=${listing.cadastralReference}&final=&del=24&mun=900`}
        title="Catastro Reference"
      />
      <ExternalLinkPopup
        isOpen={isMapsPopupOpen}
        onClose={() => setIsMapsPopupOpen(false)}
        url={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${listing.street}, ${city}`)}`}
        title="Google Maps Location"
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProperty}
        title="¿Eliminar propiedad?"
        description="Esta acción eliminará permanentemente la propiedad, todos sus anuncios, imágenes y contactos asociados. No se puede deshacer."
        isDeleting={isDeleting}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteListingModalOpen}
        onClose={() => setIsDeleteListingModalOpen(false)}
        onConfirm={handleDeleteListing}
        title="¿Eliminar anuncio?"
        description="Esta acción eliminará el anuncio y sus contactos asociados. La propiedad se mantendrá intacta y podrás crear nuevos anuncios para ella."
        isDeleting={isDeletingListing}
      />
      <DeleteConfirmationModal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        onConfirm={listing.status === "Descartado" ? handleRecoverListing : handleDiscardListing}
        title={listing.status === "Descartado" ? "¿Recuperar anuncio?" : "¿Descartar anuncio?"}
        description={
          listing.status === "Descartado" 
            ? "Esta acción reactivará el anuncio y lo volverá a hacer disponible."
            : "Esta acción marcará el anuncio como descartado. Podrás reactivarlo más tarde si es necesario. No se eliminarán datos."
        }
        confirmText={listing.status === "Descartado" ? "Recuperar" : "Descartar"}
        loadingText={listing.status === "Descartado" ? "Recuperando..." : "Descartando..."}
        variant={listing.status === "Descartado" ? "default" : "destructive"}
        isDeleting={isDiscarding}
      />
    </div>
  );
}
