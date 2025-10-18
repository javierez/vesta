"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
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
import { PropertySummaryCard } from "./cards/property-summary-card";
import { PropertyStatusRow } from "./cards/property-status-row";
import { BasicInfoCard } from "./cards/basic-info-card";
import { PropertyDetailsCard } from "./cards/property-details-card";
import { LocationCard } from "./cards/location-card";
import { FeaturesCard } from "./cards/features-card";
import { PremiumFeaturesCard } from "./cards/premium-features-card";
import { OrientationCard } from "./cards/orientation-card";
import { AdditionalCharacteristicsCard } from "./cards/additional-characteristics-card";
import { AdditionalSpacesCard } from "./cards/additional-spaces-card";
import { MaterialsCard } from "./cards/materials-card";
import { RentalPropertiesCard } from "./cards/rental-properties-card";
import { DescriptionCard } from "./cards/description-card";
import { ContactInfoCard } from "./cards/contact-info-card";
import { Separator } from "~/components/ui/separator";
import { generatePropertyDescription, generateShortPropertyDescription } from "~/server/openai/property_descriptions";
import { ExternalLinkPopup } from "~/components/ui/external-link-popup";
import { generatePropertyTitle } from "~/lib/property-title";
import { DeleteConfirmationModal } from "~/components/ui/delete-confirmation-modal";
import { deletePropertyWithAuth, deleteListingWithAuth, discardListingWithAuth, recoverListingWithAuth } from "~/server/queries/listing";
import { getFirstImage } from "~/app/actions/property-images";

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
          const neighborhoodValue = (document.getElementById("neighborhood") as HTMLInputElement)?.value;

          // Get city, province, municipality from either state or inputs (for immediate save after auto-complete)
          const cityValue = city || (document.getElementById("city") as HTMLInputElement)?.value;
          const provinceValue = province || (document.getElementById("province") as HTMLInputElement)?.value;
          const municipalityValue = municipality || (document.getElementById("municipality") as HTMLInputElement)?.value;

          console.log("💾 [SAVE] Starting location save with values:", {
            street: streetValue,
            addressDetails: addressDetailsValue,
            postalCode: postalCodeValue,
            city: cityValue,
            province: provinceValue,
            municipality: municipalityValue,
            neighborhood: neighborhoodValue,
            nearbyPublicTransport: nearbyPublicTransport,
          });

          // Find or create location in locations table and get neighborhoodId
          let neighborhoodId: bigint | null = null;

          if (cityValue && provinceValue && municipalityValue && neighborhoodValue) {
            console.log("✅ [SAVE] All 4 location fields present, calling findOrCreateLocation...");
            try {
              neighborhoodId = BigInt(await findOrCreateLocation({
                city: cityValue,
                province: provinceValue,
                municipality: municipalityValue,
                neighborhood: neighborhoodValue,
              }));
              console.log("🏘️ [SAVE] Created/found location with neighborhoodId:", neighborhoodId);
            } catch (error) {
              console.error("❌ [SAVE] Error handling location:", error);
              // neighborhoodId will remain null if location update fails
            }
          } else {
            console.warn("⚠️ [SAVE] Missing location fields, neighborhoodId will NOT be updated:", {
              hasCity: !!cityValue,
              hasProvince: !!provinceValue,
              hasMunicipality: !!municipalityValue,
              hasNeighborhood: !!neighborhoodValue,
            });
          }

          // Get coordinates from hidden inputs
          const latitudeValue = (document.getElementById("latitude") as HTMLInputElement)?.value;
          const longitudeValue = (document.getElementById("longitude") as HTMLInputElement)?.value;

          propertyData = {
            street: streetValue,
            addressDetails: addressDetailsValue,
            postalCode: postalCodeValue,
            cadastralReference: (document.getElementById("cadastralReference") as HTMLInputElement)?.value || null,
            ...(neighborhoodId && { neighborhoodId }),
            nearbyPublicTransport,
            latitude: latitudeValue || null,
            longitude: longitudeValue || null,
          };

          console.log("📝 [SAVE] Property data prepared for update:", {
            ...propertyData,
            neighborhoodId: neighborhoodId ? neighborhoodId.toString() : 'NOT SET',
          });

          // Note: city, province, municipality, neighborhood are NOT in listings table
          // They are stored in locations table via neighborhoodId foreign key
          // No listingData needed for location module
          break;

        case "features":
          propertyData = {
            hasElevator,
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
          };
          listingData = {
            isFurnished,
            furnitureQuality: isFurnished ? furnitureQuality : null,
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
            suiteBathroom,
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
          // Only save rental characteristics for Rent listings
          // For Sale listings, duplicateForRent is just UI state, not saved to DB
          listingData = {
            internet,
            studentFriendly,
            petsAllowed,
            appliancesIncluded,
          };
          // No propertyData for rental properties - these are listing-specific
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
  const [hasElevator, setHasElevator] = useState(listing.hasElevator ?? false);
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
  const [terraceSize, setTerraceSize] = useState<number | null>(listing.terraceSize ?? null);
  const [wineCellar, setWineCellar] = useState(listing.wineCellar ?? false);
  const [wineCellarSize, setWineCellarSize] = useState<number | null>(
    listing.wineCellarSize ?? null,
  );
  const [livingRoomSize, setLivingRoomSize] = useState<number | null>(
    listing.livingRoomSize ?? null,
  );
  const [balconyCount, setBalconyCount] = useState<number | null>(listing.balconyCount ?? null);
  const [galleryCount, setGalleryCount] = useState<number | null>(listing.galleryCount ?? null);
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

  // Ref for contact info card
  const contactInfoRef = useRef<HTMLDivElement>(null);

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

  // Handler to expand and scroll to contact info section
  const handleEditOwner = () => {
    // Expand the contact info section
    setCollapsedSections(prev => ({
      ...prev,
      contactInfo: false
    }));
    
    // Scroll to the contact info card after a short delay to allow the section to expand
    setTimeout(() => {
      contactInfoRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
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

  // Furniture quality state
  const [furnitureQuality, setFurnitureQuality] = useState(listing.furnitureQuality ?? "");

  // Rental duplicate state
  const [duplicateForRent, setDuplicateForRent] = useState(false);
  const [rentalPrice, setRentalPrice] = useState(0);
  
  // Toggle button states
  const [hasKeys, setHasKeys] = useState<boolean>(false);
  const [keysLoading, setKeysLoading] = useState(false);
  const [publishToWebsite, setPublishToWebsite] = useState<boolean>(false);
  const [websiteLoading, setWebsiteLoading] = useState(false);

  // First property image URL
  const [firstImageUrl, setFirstImageUrl] = useState<string | null>(null);

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
        const [agentsData, potentialOwnersData, currentOwnersData, listingDetailsData, firstImage] = await Promise.all([
          getAllAgentsWithAuth(),
          getAllPotentialOwnersWithAuth(),
          listing.listingId ? getCurrentListingOwnersWithAuth(Number(listing.listingId)) : Promise.resolve([]),
          listing.listingId ? getListingDetailsWithAuth(Number(listing.listingId)) : Promise.resolve(null),
          listing.propertyId ? getFirstImage(Number(listing.propertyId)) : Promise.resolve(null),
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

        // Set first image URL
        setFirstImageUrl(firstImage);

        console.log('✅ All form data fetched successfully - Performance optimized!');
      } catch (error) {
        console.error('❌ Error fetching form data:', error);
        // Set fallback values on error
        setAgents([]);
        setOwners([]);
        setSelectedOwnerIds([]);
        setHasKeys(false);
        setPublishToWebsite(false);
        setFirstImageUrl(null);
      }
    };

    void fetchAllFormData();
  }, [listing.listingId, listing.propertyId]);

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
      
      let fullDescription = description;
      
      // Check if we have a full description to summarize
      if (!fullDescription || fullDescription.trim() === "") {
        // If no full description exists, generate it first without setting isGenerating state
        const listingWithNumberTypes = {
          ...listing,
          lastRenovationYear: lastRenovationYear ? String(lastRenovationYear) : undefined,
        };
        fullDescription = await generatePropertyDescription(listingWithNumberTypes);
        setDescription(fullDescription);
      }
      
      // Now generate short description based on the full description
      if (fullDescription && fullDescription.trim() !== "") {
        const listingWithStringTypes = {
          ...listing,
          lastRenovationYear: lastRenovationYear ? String(lastRenovationYear) : undefined,
        };
        
        const generatedShortDescription = await generateShortPropertyDescription(
          fullDescription,
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
    <div className="space-y-4">
      {/* Top row - always full width */}
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
          onEditOwner={handleEditOwner}
        />

        {/* Property Status Row with Process Tracker and Image Preview */}
        <PropertyStatusRow
          firstImageUrl={firstImageUrl}
          prospectStatus={null}
          propertyType={propertyType}
          propertyId={listing.propertyId}
        />
      </div>

      {/* Two independent columns */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Column */}
        <div className="flex-1 space-y-4 w-full">
          {/* Basic Information */}
          <BasicInfoCard
            listing={listing}
            propertyType={propertyType}
            hasPropertyTypeChanged={Boolean(hasPropertyTypeChanged)}
            listingTypes={listingTypes}
            isBankOwned={isBankOwned}
            newConstruction={newConstruction}
            collapsedSections={collapsedSections}
            saveState={moduleStates.basicInfo?.saveState ?? "idle"}
            onToggleSection={toggleSection}
            onSave={() => saveModule("basicInfo")}
            onUpdateModule={(hasChanges) => updateModuleState("basicInfo", hasChanges)}
            onToggleListingType={toggleListingType}
            onHandleSecondaryListingType={handleSecondaryListingType}
            onPropertyTypeChange={handlePropertyTypeChange}
            setIsBankOwned={setIsBankOwned}
            setNewConstruction={setNewConstruction}
            getCardStyles={getCardStyles}
          />

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

          {/* Features */}
          <FeaturesCard
            listing={listing}
            propertyType={propertyType}
            hasElevator={hasElevator}
            isFurnished={isFurnished}
            furnitureQuality={furnitureQuality}
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
            setHasElevator={setHasElevator}
            setIsFurnished={setIsFurnished}
            setFurnitureQuality={setFurnitureQuality}
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
        </div>

        {/* Right Column */}
        <div className="flex-1 space-y-4 w-full">
          {/* Contact Information */}
          <ContactInfoCard
            ref={contactInfoRef}
            selectedOwnerIds={selectedOwnerIds}
            owners={owners}
            filteredOwners={filteredOwners}
            ownerSearch={ownerSearch}
            selectedAgentId={selectedAgentId}
            agents={agents}
            collapsedSections={collapsedSections}
            saveState={moduleStates.contactInfo?.saveState ?? "idle"}
            onToggleSection={toggleSection}
            onSave={() => saveModule("contactInfo")}
            onUpdateModule={(hasChanges) => updateModuleState("contactInfo", hasChanges)}
            setSelectedOwnerIds={setSelectedOwnerIds}
            setOwnerSearch={setOwnerSearch}
            setSelectedAgentId={setSelectedAgentId}
            getCardStyles={getCardStyles}
          />

          {/* Location */}
          <LocationCard
            listing={listing}
            city={city}
            province={province}
            municipality={municipality}
            collapsedSections={collapsedSections}
            saveState={moduleStates.location?.saveState ?? "idle"}
            onToggleSection={toggleSection}
            onSave={() => saveModule("location")}
            onUpdateModule={(hasChanges) => updateModuleState("location", hasChanges)}
            setCity={setCity}
            setProvince={setProvince}
            setMunicipality={setMunicipality}
            setIsMapsPopupOpen={setIsMapsPopupOpen}
            setIsCatastroPopupOpen={setIsCatastroPopupOpen}
            getCardStyles={getCardStyles}
          />

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
        </div>
      </div>

      {/* Separator for secondary sections */}
      <Separator className="my-3 opacity-50" />

      {/* Two independent columns for secondary cards */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Column */}
        <div className="flex-1 space-y-4 w-full">
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
        </div>

        {/* Right Column */}
        <div className="flex-1 space-y-4 w-full">
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

          {/* Materials */}
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
        </div>
      </div>

      {/* Separator before Description */}
      <Separator className="my-3 opacity-50" />

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

      {/* Action Buttons - Discard, Delete Listing, and Delete Property */}
      <div className="mt-6">
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
