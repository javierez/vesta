'use client'

import React, { useState, useEffect } from "react"
import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Checkbox } from "~/components/ui/checkbox"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { Building2, ChevronDown, Circle, Loader2, MoreVertical } from "lucide-react"
import { getAllAgents } from "~/server/queries/listing"
import { getAllPotentialOwners, getCurrentListingOwners, updateListingOwners } from "~/server/queries/contact"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Textarea } from "~/components/ui/textarea"
import { PropertyCharacteristicsFormGarage } from "./property-characteristics-form-garage"
import { PropertyCharacteristicsFormSolar } from "./property-characteristics-form-solar"
import { PropertyCharacteristicsFormLocal } from "./property-characteristics-form-local"
import { useRouter, useSearchParams } from 'next/navigation'
import { updateProperty } from "~/server/queries/properties"
import { updateListing } from "~/server/queries/listing"
import { toast } from "sonner"
import { PropertyTitle } from "./common/property-title"
import { ModernSaveIndicator } from "./common/modern-save-indicator"
import { Separator } from "~/components/ui/separator"
import Image from "next/image"
import { generatePropertyDescription } from '~/server/openai/property_descriptions'
import { ExternalLinkPopup } from "~/components/ui/external-link-popup"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog"

import type { PropertyListing } from "~/types/property-listing"

// Type definitions
interface Agent {
  id: number
  name: string
}

interface Owner {
  id: number
  name: string
}

type SaveState = "idle" | "modified" | "saving" | "saved" | "error"

interface ModuleState {
  saveState: SaveState
  hasChanges: boolean
  lastSaved?: Date
}

type ModuleName = "basicInfo" | "propertyDetails" | "location" | "features" | "description" | "contactInfo" | "orientation" | "additionalCharacteristics" | "premiumFeatures" | "additionalSpaces" | "materials" | "rentalProperties"

interface PropertyCharacteristicsFormProps {
  listing: PropertyListing
}

export function PropertyCharacteristicsForm({ listing }: PropertyCharacteristicsFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyType = searchParams.get('type') ?? listing.propertyType ?? "piso"

  // Check if property type has been changed
  const hasPropertyTypeChanged = listing.propertyType && searchParams.get('type') && 
    listing.propertyType !== searchParams.get('type')

  // Module states
  const [moduleStates, setModuleStates] = useState<Record<string, ModuleState>>(() => {
    // Initialize with property type change detection
    const initialState = {
      basicInfo: { saveState: "idle" as SaveState, hasChanges: Boolean(hasPropertyTypeChanged) },
      propertyDetails: { saveState: "idle" as SaveState, hasChanges: false },
      location: { saveState: "idle" as SaveState, hasChanges: false },
      features: { saveState: "idle" as SaveState, hasChanges: false },
      contactInfo: { saveState: "idle" as SaveState, hasChanges: false },
      orientation: { saveState: "idle" as SaveState, hasChanges: false },
      additionalCharacteristics: { saveState: "idle" as SaveState, hasChanges: false },
      premiumFeatures: { saveState: "idle" as SaveState, hasChanges: false },
      additionalSpaces: { saveState: "idle" as SaveState, hasChanges: false },
      materials: { saveState: "idle" as SaveState, hasChanges: false },
      description: { saveState: "idle" as SaveState, hasChanges: false },
      rentalProperties: { saveState: "idle" as SaveState, hasChanges: false }
    }
    
    // Set basicInfo to modified if property type changed
    if (hasPropertyTypeChanged) {
      initialState.basicInfo.saveState = "modified"
    }
    
    return initialState
  })

  // Update module states when property type change is detected
  useEffect(() => {
    if (hasPropertyTypeChanged) {
      setModuleStates(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          saveState: "modified",
          hasChanges: true
        }
      }))
    }
  }, [hasPropertyTypeChanged])

  // Function to update module state
  const updateModuleState = (moduleName: ModuleName, hasChanges: boolean) => {
    setModuleStates(prev => {
      const currentState = prev[moduleName] ?? { saveState: "idle" as SaveState, hasChanges: false }
      return {
        ...prev,
        [moduleName]: {
          ...currentState,
          saveState: hasChanges ? "modified" : "idle",
          hasChanges,
          lastSaved: currentState.lastSaved
        }
      }
    })
  }

  // Function to save module data
  const saveModule = async (moduleName: ModuleName) => {
    setModuleStates(prev => {
      const currentState = prev[moduleName] ?? { saveState: "idle" as SaveState, hasChanges: false }
      return {
        ...prev,
        [moduleName]: {
          ...currentState,
          saveState: "saving",
          hasChanges: currentState.hasChanges
        }
      }
    })

    try {
      const propertyId = Number(listing.propertyId)
      const listingId = Number(listing.listingId)

      let propertyData = {}
      let listingData = {}

      switch (moduleName) {
        case 'basicInfo':
          listingData = {
            listingType: listingTypes[0],
            isBankOwned,
            price: (document.getElementById('price') as HTMLInputElement)?.value
          }
          propertyData = {
            propertyType,
            propertySubtype: listing.propertySubtype,
            cadastralReference: (document.getElementById('cadastralReference') as HTMLInputElement)?.value,
            newConstruction
          }
          break

        case 'propertyDetails':
          propertyData = {
            bedrooms: Number((document.getElementById('bedrooms') as HTMLInputElement)?.value),
            bathrooms: Number((document.getElementById('bathrooms') as HTMLInputElement)?.value),
            squareMeter: Number((document.getElementById('squareMeter') as HTMLInputElement)?.value),
            builtSurfaceArea: Math.round(Number((document.getElementById('builtSurfaceArea') as HTMLInputElement)?.value)),
            yearBuilt: Number((document.getElementById('yearBuilt') as HTMLInputElement)?.value),
            lastRenovationYear: lastRenovationYear ? Math.min(Math.max(Number(lastRenovationYear), -32768), 32767) : null,
            buildingFloors: buildingFloors,
            conservationStatus: listing.conservationStatus ?? 1
          }
          break

        case 'location':
          propertyData = {
            street: (document.getElementById('street') as HTMLInputElement)?.value,
            addressDetails: (document.getElementById('addressDetails') as HTMLInputElement)?.value,
            postalCode: (document.getElementById('postalCode') as HTMLInputElement)?.value,
            city,
            province,
            municipality,
            nearbyPublicTransport
          }
          break

        case 'features':
          propertyData = {
            hasElevator: (document.getElementById('hasElevator') as HTMLInputElement)?.checked,
            hasGarage,
            garageType,
            garageSpaces,
            garageInBuilding,
            garageNumber,
            hasStorageRoom,
            storageRoomSize,
            storageRoomNumber,
            hasHeating: isHeating,
            heatingType,
            hotWaterType: isHotWater ? hotWaterType : null,
            airConditioningType: isAirConditioning ? airConditioningType : null,
            isFurnished
          }
          listingData = {
            optionalGaragePrice: Math.round(Number((document.getElementById('optionalGaragePrice') as HTMLInputElement)?.value) ?? 0),
            optionalStorageRoomPrice: Math.round(Number((document.getElementById('optionalStorageRoomPrice') as HTMLInputElement)?.value) ?? 0),
            oven,
            microwave,
            washingMachine,
            fridge,
            tv,
            stoneware
          }
          break

        case 'contactInfo':
          if (!selectedAgentId) {
            throw new Error("Please select an agent")
          }
          if (selectedOwnerIds.length === 0) {
            throw new Error("Please select at least one owner")
          }
          
          // Update listing with agent
          listingData = {
            agentId: BigInt(selectedAgentId)
          }
          
          // Update owner relationships separately
          await updateListingOwners(listingId, selectedOwnerIds.map(id => Number(id)))
          break

        case 'orientation':
          propertyData = {
            exterior: isExterior,
            bright: isBright,
            orientation
          }
          break

        case 'additionalCharacteristics':
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
            suiteBathroom
          }
          break

        case 'premiumFeatures':
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
            tennisCourt
          }
          break

        case 'additionalSpaces':
          propertyData = {
            terrace,
            terraceSize,
            wineCellar,
            wineCellarSize,
            livingRoomSize,
            balconyCount,
            galleryCount,
            buildingFloors,
            builtInWardrobes
          }
          break

        case 'materials':
          propertyData = {
            mainFloorType,
            shutterType,
            carpentryType,
            windowType,
            doubleGlazing,
            securityDoor
          }
          break

        case 'description':
          propertyData = {
            description: (document.getElementById('description') as HTMLTextAreaElement)?.value
          }
          break

        case 'rentalProperties':
          listingData = {
            internet,
            studentFriendly,
            petsAllowed,
            appliancesIncluded
          }
          break
      }

      // Update property if there's property data
      if (Object.keys(propertyData).length > 0) {
        await updateProperty(propertyId, propertyData)
      }

      // Update listing if there's listing data
      if (Object.keys(listingData).length > 0) {
        await updateListing(listingId, listingData)
      }

      setModuleStates(prev => {
        const currentState = prev[moduleName] ?? { saveState: "idle" as SaveState, hasChanges: false }
        return {
          ...prev,
          [moduleName]: {
            ...currentState,
            saveState: "saved",
            hasChanges: false,
            lastSaved: new Date()
          }
        }
      })

      toast.success('Cambios guardados correctamente')

      // Reset to idle state after 2 seconds
      setTimeout(() => {
        setModuleStates(prev => {
          const currentState = prev[moduleName] ?? { saveState: "idle" as SaveState, hasChanges: false }
          return {
            ...prev,
            [moduleName]: {
              ...currentState,
              saveState: "idle",
              hasChanges: currentState.hasChanges
            }
          }
        })
      }, 2000)

    } catch (error) {
      console.error(`Error saving ${moduleName}:`, error)
      
      setModuleStates(prev => {
        const currentState = prev[moduleName] ?? { saveState: "idle" as SaveState, hasChanges: false }
        return {
          ...prev,
          [moduleName]: {
            ...currentState,
            saveState: "error",
            hasChanges: currentState.hasChanges
          }
        }
      })

      toast.error('Error al guardar los cambios')

      // Reset to modified state after 3 seconds if there are changes
      setTimeout(() => {
        setModuleStates(prev => {
          const currentState = prev[moduleName] ?? { saveState: "idle" as SaveState, hasChanges: false }
          return {
            ...prev,
            [moduleName]: {
              ...currentState,
              saveState: currentState.hasChanges ? "modified" : "idle",
              hasChanges: currentState.hasChanges
            }
          }
        })
      }, 3000)
    }
  }

  // Function to mark module as saved - simplified to only update state
  const markModuleAsSaved = (moduleName: string) => {
    setModuleStates(prev => ({
      ...prev,
      [moduleName]: {
        saveState: "saved",
        hasChanges: false,
        lastSaved: new Date()
      }
    }))
  }

  // Function to render module status indicator
  const renderModuleStatus = (moduleName: string) => {
    const state = moduleStates[moduleName]
    if (!state) return null
    if (state.hasChanges) {
      return <Circle className="h-2 w-2 fill-yellow-500 text-yellow-500" />
    }
    if (state.saveState === "saved") {
      return <Circle className="h-2 w-2 fill-green-500 text-green-500" />
    }
    return null
  }

  const [listingTypes, setListingTypes] = useState<string[]>(
    listing.listingType ? [listing.listingType] : ['Sale'] // Default to 'Sale' if none selected
  )
  const [isBankOwned, setIsBankOwned] = useState(listing.isBankOwned ?? false)
  const [isFeatured, setIsFeatured] = useState(listing.isFeatured ?? false)
  const [agents, setAgents] = useState<Agent[]>([])
  const [isFurnished, setIsFurnished] = useState(listing.isFurnished ?? false)
  const [isHeating, setIsHeating] = useState(listing.hasHeating ?? false)
  const [heatingType, setHeatingType] = useState(listing.heatingType ?? "")
  const [isHotWater, setIsHotWater] = useState(!!listing.hotWaterType)
  const [isAirConditioning, setIsAirConditioning] = useState(!!listing.airConditioningType)
  const [airConditioningType, setAirConditioningType] = useState(listing.airConditioningType ?? "")
  const [studentFriendly, setStudentFriendly] = useState(listing.studentFriendly ?? false)
  const [petsAllowed, setPetsAllowed] = useState(listing.petsAllowed ?? false)
  const [appliancesIncluded, setAppliancesIncluded] = useState(listing.appliancesIncluded ?? false)
  const [isExterior, setIsExterior] = useState(listing.exterior ?? false)
  const [orientation, setOrientation] = useState(listing.orientation ?? "")
  const [isBright, setIsBright] = useState(listing.bright ?? false)
  const [garageType, setGarageType] = useState(listing.garageType ?? "")
  const [garageSpaces, setGarageSpaces] = useState(listing.garageSpaces ?? 1)
  const [garageInBuilding, setGarageInBuilding] = useState(listing.garageInBuilding ?? false)
  const [garageNumber, setGarageNumber] = useState(listing.garageNumber ?? "")
  const [storageRoomSize, setStorageRoomSize] = useState(listing.storageRoomSize ?? 0)
  const [storageRoomNumber, setStorageRoomNumber] = useState(listing.storageRoomNumber ?? "")
  const [hasGarage, setHasGarage] = useState(listing.hasGarage ?? false)
  const [hasStorageRoom, setHasStorageRoom] = useState(listing.hasStorageRoom ?? false)
  const [disabledAccessible, setDisabledAccessible] = useState(listing.disabledAccessible ?? false)
  const [vpo, setVpo] = useState(listing.vpo ?? false)
  const [videoIntercom, setVideoIntercom] = useState(listing.videoIntercom ?? false)
  const [conciergeService, setConciergeService] = useState(listing.conciergeService ?? false)
  const [securityGuard, setSecurityGuard] = useState(listing.securityGuard ?? false)
  const [satelliteDish, setSatelliteDish] = useState(listing.satelliteDish ?? false)
  const [doubleGlazing, setDoubleGlazing] = useState(listing.doubleGlazing ?? false)
  const [alarm, setAlarm] = useState(listing.alarm ?? false)
  const [securityDoor, setSecurityDoor] = useState(listing.securityDoor ?? false)
  const [lastRenovationYear, setLastRenovationYear] = useState(listing.lastRenovationYear ?? listing.yearBuilt ?? "")
  const [kitchenType, setKitchenType] = useState(listing.kitchenType ?? "")
  const [hotWaterType, setHotWaterType] = useState(listing.hotWaterType ?? "")
  const [openKitchen, setOpenKitchen] = useState(listing.openKitchen ?? false)
  const [frenchKitchen, setFrenchKitchen] = useState(listing.frenchKitchen ?? false)
  const [furnishedKitchen, setFurnishedKitchen] = useState(listing.furnishedKitchen ?? false)
  const [pantry, setPantry] = useState(listing.pantry ?? false)
  const [terrace, setTerrace] = useState(listing.terrace ?? false)
  const [terraceSize, setTerraceSize] = useState(listing.terraceSize ?? 0)
  const [wineCellar, setWineCellar] = useState(listing.wineCellar ?? false)
  const [wineCellarSize, setWineCellarSize] = useState(listing.wineCellarSize ?? 0)
  const [livingRoomSize, setLivingRoomSize] = useState(listing.livingRoomSize ?? 0)
  const [balconyCount, setBalconyCount] = useState(listing.balconyCount ?? 0)
  const [galleryCount, setGalleryCount] = useState(listing.galleryCount ?? 0)
  const [buildingFloors, setBuildingFloors] = useState(listing.buildingFloors ?? 0)
  const [builtInWardrobes, setBuiltInWardrobes] = useState(listing.builtInWardrobes ?? "")
  const [mainFloorType, setMainFloorType] = useState(listing.mainFloorType ?? "")
  const [shutterType, setShutterType] = useState(listing.shutterType ?? "")
  const [carpentryType, setCarpentryType] = useState(listing.carpentryType ?? "")
  const [windowType, setWindowType] = useState(listing.windowType ?? "")
  const [views, setViews] = useState(listing.views ?? false)
  const [mountainViews, setMountainViews] = useState(listing.mountainViews ?? false)
  const [seaViews, setSeaViews] = useState(listing.seaViews ?? false)
  const [beachfront, setBeachfront] = useState(listing.beachfront ?? false)
  const [jacuzzi, setJacuzzi] = useState(listing.jacuzzi ?? false)
  const [hydromassage, setHydromassage] = useState(listing.hydromassage ?? false)
  const [garden, setGarden] = useState(listing.garden ?? false)
  const [pool, setPool] = useState(listing.pool ?? false)
  const [homeAutomation, setHomeAutomation] = useState(listing.homeAutomation ?? false)
  const [musicSystem, setMusicSystem] = useState(listing.musicSystem ?? false)
  const [laundryRoom, setLaundryRoom] = useState(listing.laundryRoom ?? false)
  const [coveredClothesline, setCoveredClothesline] = useState(listing.coveredClothesline ?? false)
  const [fireplace, setFireplace] = useState(listing.fireplace ?? false)
  const [city, setCity] = useState(listing.city ?? "")
  const [province, setProvince] = useState(listing.province ?? "")
  const [municipality, setMunicipality] = useState(listing.municipality ?? "")
  const [showAdditionalCharacteristics, setShowAdditionalCharacteristics] = useState(false)
  const [showPremiumFeatures, setShowPremiumFeatures] = useState(false)
  const [showAdditionalSpaces, setShowAdditionalSpaces] = useState(false)
  const [showMaterials, setShowMaterials] = useState(false)
  const [optionalGaragePrice, setOptionalGaragePrice] = useState(listing.optionalGaragePrice ?? 0)
  const [optionalStorageRoomPrice, setOptionalStorageRoomPrice] = useState(listing.optionalStorageRoomPrice ?? 0)
  const [selectedAgentId, setSelectedAgentId] = useState(listing.agent?.id?.toString() ?? "")
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<string[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [ownerSearch, setOwnerSearch] = useState("")
  const [newConstruction, setNewConstruction] = useState(listing.newConstruction ?? false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [description, setDescription] = useState(listing.description ?? '')
  const [isCatastroPopupOpen, setIsCatastroPopupOpen] = useState(false)
  const [isMapsPopupOpen, setIsMapsPopupOpen] = useState(false)
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false)
  const [signature, setSignature] = useState("")

  // New community amenity states
  const [gym, setGym] = useState(listing.gym ?? false)
  const [sportsArea, setSportsArea] = useState(listing.sportsArea ?? false)
  const [childrenArea, setChildrenArea] = useState(listing.childrenArea ?? false)
  const [suiteBathroom, setSuiteBathroom] = useState(listing.suiteBathroom ?? false)
  const [nearbyPublicTransport, setNearbyPublicTransport] = useState(listing.nearbyPublicTransport ?? false)
  const [communityPool, setCommunityPool] = useState(listing.communityPool ?? false)
  const [privatePool, setPrivatePool] = useState(listing.privatePool ?? false)
  const [tennisCourt, setTennisCourt] = useState(listing.tennisCourt ?? false)

  // Appliance states from listings
  const [internet, setInternet] = useState(listing.internet ?? false)
  const [oven, setOven] = useState(listing.oven ?? false)
  const [microwave, setMicrowave] = useState(listing.microwave ?? false)
  const [washingMachine, setWashingMachine] = useState(listing.washingMachine ?? false)
  const [fridge, setFridge] = useState(listing.fridge ?? false)
  const [tv, setTv] = useState(listing.tv ?? false)
  const [stoneware, setStoneware] = useState(listing.stoneware ?? false)

  // Filter owners based on search
  const filteredOwners = owners.filter(owner => 
    owner.name.toLowerCase().includes(ownerSearch.toLowerCase())
  )

  const heatingOptions = [
    { id: 1, label: "Gas natural" },
    { id: 2, label: "Eléctrico" },
    { id: 3, label: "Gasóleo" },
    { id: 4, label: "Butano" },
    { id: 5, label: "Propano" },
    { id: 6, label: "Solar" }
  ]

  const getPropertyTypeText = (type: string) => {
    switch (type) {
      case 'piso':
        return 'Piso'
      case 'casa':
        return 'Casa'
      case 'local':
        return 'Local'
      case 'solar':
        return 'Solar'
      case 'garaje':
        return 'Garaje'
      default:
        return type
    }
  }

  const generateTitle = () => {
    const type = getPropertyTypeText(propertyType)
    const street = listing.street ?? ''
    const neighborhood = listing.neighborhood ? `(${listing.neighborhood})` : ''
    return `${type} en ${street} ${neighborhood}`.trim()
  }

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const agentsList = await getAllAgents()
        setAgents(agentsList.map(agent => ({
          id: Number(agent.id),
          name: agent.name
        })))
      } catch (error) {
        console.error("Error fetching agents:", error)
      }
    }
    void fetchAgents()
  }, [])

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        // Get all potential owners for the dropdown
        const potentialOwners = await getAllPotentialOwners()
        setOwners(potentialOwners.map(owner => ({
          id: Number(owner.id),
          name: owner.name
        })))

        // Get current owners for this listing
        if (listing.listingId) {
          const currentOwners = await getCurrentListingOwners(Number(listing.listingId))
          setSelectedOwnerIds(currentOwners.map(owner => owner.id.toString()))
        }
      } catch (error) {
        console.error("Error fetching owners:", error)
      }
    }
    void fetchOwners()
  }, [listing.listingId])

  const toggleListingType = (type: string) => {
    setListingTypes([type]) // Replace the current type with the new one
    updateModuleState('basicInfo', true)
  }

  const handleSecondaryListingType = (type: 'RentWithOption' | 'RoomSharing' | 'Transfer') => {
    if (type === 'RentWithOption') {
      if (listingTypes[0] === 'RentWithOption') {
        setListingTypes(['Rent'])
      } else {
        setListingTypes(['RentWithOption'])
      }
    } else if (type === 'RoomSharing') {
      if (listingTypes[0] === 'RoomSharing') {
        setListingTypes(['Rent'])
      } else {
        setListingTypes(['RoomSharing'])
      }
    } else if (type === 'Transfer') {
      if (listingTypes[0] === 'Transfer') {
        setListingTypes(['Sale'])
      } else {
        setListingTypes(['Transfer'])
      }
    }
    updateModuleState('basicInfo', true)
  }

  const handlePropertyTypeChange = (newType: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('type', newType)
    router.push(`?${params.toString()}`)
  }

  const handleGenerateDescription = async () => {
    try {
      setIsGenerating(true)
      const generatedDescription = await generatePropertyDescription(listing)
      setDescription(generatedDescription)
      // Update the textarea value
      const descriptionTextarea = document.getElementById('description') as HTMLTextAreaElement
      if (descriptionTextarea) {
        descriptionTextarea.value = generatedDescription
        // Trigger the change event to mark the module as modified
        updateModuleState('description', true)
      }
    } catch (error) {
      console.error('Error generating description:', error)
      // You might want to show a toast notification here
    } finally {
      setIsGenerating(false)
    }
  }

  // Add this function to handle signature changes
  const handleSignatureChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSignature(e.target.value)
    updateModuleState('description', true)
  }

  // If property type is garage, render the garage form
  if (propertyType === 'garaje') {
    return <PropertyCharacteristicsFormGarage listing={listing} />
  }

  // If property type is solar, render the solar form
  if (propertyType === 'solar') {
    return <PropertyCharacteristicsFormSolar listing={listing} />
  }

  // If property type is local, render the local form
  if (propertyType === 'local') {
    return <PropertyCharacteristicsFormLocal listing={listing} />
  }

  const getCardStyles = (moduleName: ModuleName) => {
    const state = moduleStates[moduleName]?.saveState

    switch (state) {
      case "modified":
        return "ring-2 ring-yellow-500/20 shadow-lg shadow-yellow-500/10 border-yellow-500/20"
      case "saving":
        return "ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10 border-amber-500/20"
      case "saved":
        return "ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10 border-emerald-500/20"
      case "error":
        return "ring-2 ring-red-500/20 shadow-lg shadow-red-500/10 border-red-500/20"
      default:
        return "hover:shadow-lg transition-all duration-300"
    }
  }

  // Add this near the top of the component, after listingTypes is defined
  const currentListingType = listingTypes[0] ?? "";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Basic Information */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("basicInfo"))}>
        <ModernSaveIndicator 
          state={moduleStates.basicInfo?.saveState ?? "idle"} 
          onSave={() => saveModule("basicInfo")} 
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">RESUMEN DEL INMUEBLE</h3>
          </div>
        </div>
        <div className="space-y-3">
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
                variant={['Sale', 'Transfer'].includes(currentListingType) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  toggleListingType('Sale')
                  updateModuleState('basicInfo', true)
                }}
                className="flex-1"
              >
                Venta
              </Button>
              <Button
                type="button"
                variant={['Rent', 'RentWithOption', 'RoomSharing'].includes(currentListingType) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  toggleListingType('Rent')
                  updateModuleState('basicInfo', true)
                }}
                className="flex-1"
              >
                Alquiler
              </Button>
            </div>
          </div>

          {/* Secondary checkboxes, vertical for rent types */}
          {['Rent', 'RentWithOption', 'RoomSharing'].includes(currentListingType) && (
            <div className="flex flex-col gap-2 ml-2 items-start">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="roomSharingProperty"
                  checked={currentListingType === 'RoomSharing'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleSecondaryListingType('RoomSharing')
                    } else {
                      toggleListingType('Rent')
                    }
                  }}
                />
                <Label htmlFor="roomSharingProperty" className="text-xs text-gray-700 select-none cursor-pointer">Compartir habitación</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rentWithOptionProperty"
                  checked={currentListingType === 'RentWithOption'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleSecondaryListingType('RentWithOption')
                    } else {
                      toggleListingType('Rent')
                    }
                  }}
                />
                <Label htmlFor="rentWithOptionProperty" className="text-xs text-gray-700 select-none cursor-pointer">Alquiler con opción a compra</Label>
              </div>
            </div>
          )}
          {['Sale', 'Transfer'].includes(currentListingType) && (
            <div className="flex flex-row gap-6 ml-2 items-center">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="transferProperty"
                  checked={currentListingType === 'Transfer'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleSecondaryListingType('Transfer')
                    } else {
                      toggleListingType('Sale')
                    }
                  }}
                />
                <Label htmlFor="transferProperty" className="text-xs text-gray-700 select-none cursor-pointer">Transferencia</Label>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="propertyType" className="text-sm">Tipo de Propiedad</Label>
            <Select 
              value={propertyType}
              onValueChange={(value) => {
                handlePropertyTypeChange(value)
                updateModuleState('basicInfo', true)
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
            <Label htmlFor="propertySubtype" className="text-sm">Subtipo de Propiedad</Label>
            <Select 
              value={listing.propertySubtype ?? (propertyType === "piso" ? "Piso" : propertyType === "casa" ? "Casa" : "")}
              onValueChange={(value) => {
                // Note: This directly modifies the listing object - consider using state instead
                if (listing.propertySubtype !== undefined) {
                  listing.propertySubtype = value
                }
                updateModuleState('basicInfo', true)
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
                    <SelectItem value="Mixto residencial">Mixto residencial</SelectItem>
                    <SelectItem value="Oficinas">Oficinas</SelectItem>
                    <SelectItem value="Hotel">Hotel</SelectItem>
                  </>
                )}
                {propertyType === "solar" && (
                  <>
                    <SelectItem value="Residential land">Residential land</SelectItem>
                    <SelectItem value="Industrial land">Industrial land</SelectItem>
                    <SelectItem value="Rustic land">Rustic land</SelectItem>
                  </>
                )}
                {propertyType === "garaje" && (
                  <>
                    <SelectItem value="Moto">Moto</SelectItem>
                    <SelectItem value="Double">Double</SelectItem>
                    <SelectItem value="Individual">Individual</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-sm">Precio</Label>
            <Input 
              id="price" 
              type="number" 
              defaultValue={listing.price ? parseInt(listing.price.toString()) : undefined} 
              className="h-8 text-gray-500" 
              min="0"
              step="1"
              onChange={() => updateModuleState('basicInfo', true)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cadastralReference" className="text-sm">Referencia Catastral</Label>
            <div className="flex gap-2">
              <Input 
                id="cadastralReference" 
                type="text" 
                defaultValue={listing.cadastralReference} 
                className="h-8 text-gray-500"
                onChange={() => updateModuleState('basicInfo', true)}
              />
              {listing.cadastralReference && (
                <button 
                  onClick={() => setIsCatastroPopupOpen(true)}
                  className="flex items-center justify-center h-8 w-8 rounded-md bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <Image
                    src="/logos/logo-catastro.png"
                    alt="Catastro"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-border my-2" />

          <div className="flex items-center gap-2">
            <Button
              variant={isBankOwned ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setIsBankOwned(!isBankOwned)
                updateModuleState('basicInfo', true)
              }}
            >
              <Building2 className="h-3.5 w-3.5 mr-1" />
              Piso de banco
            </Button>
            <Button
              variant={newConstruction ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setNewConstruction(!newConstruction)
                updateModuleState('basicInfo', true)
              }}
            >
              <Building2 className="h-3.5 w-3.5 mr-1" />
              Obra nueva
            </Button>
          </div>

          <div className="border-t border-border my-2" />
        </div>
      </Card>

      {/* Property Details */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("propertyDetails"))}>
        <ModernSaveIndicator 
          state={moduleStates.propertyDetails?.saveState ?? "idle"} 
          onSave={() => saveModule("propertyDetails")} 
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">DISTRIBUCIÓN Y SUPERFICIE</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="bedrooms" className="text-sm">Habitaciones</Label>
            <Input 
              id="bedrooms" 
              type="number" 
              defaultValue={listing.bedrooms?.toString() ?? ""} 
              className="h-8 text-gray-500"
              onChange={() => updateModuleState('propertyDetails', true)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bathrooms" className="text-sm">Baños</Label>
            <Input 
              id="bathrooms" 
              type="number" 
              defaultValue={listing.bathrooms ? Math.round(listing.bathrooms) : undefined} 
              className="h-8 text-gray-500" 
              min="0"
              step="1"
              onChange={() => updateModuleState('propertyDetails', true)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="squareMeter" className="text-sm">Superficie (m²)</Label>
              <Input 
                id="squareMeter" 
                type="number" 
                defaultValue={listing.squareMeter} 
                className="h-8 text-gray-500"
                onChange={() => updateModuleState('propertyDetails', true)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="builtSurfaceArea" className="text-sm">Construida (m²)</Label>
              <Input 
                id="builtSurfaceArea" 
                type="number" 
                defaultValue={listing.builtSurfaceArea ? Math.round(listing.builtSurfaceArea) : undefined} 
                className="h-8 text-gray-500"
                min="0"
                step="1"
                onChange={() => updateModuleState('propertyDetails', true)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="yearBuilt" className="text-sm">Año de Construcción</Label>
            <Input 
              id="yearBuilt" 
              type="number" 
              defaultValue={listing.yearBuilt} 
              className="h-8 text-gray-500"
              onChange={() => updateModuleState('propertyDetails', true)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastRenovationYear" className="text-sm">Año última reforma</Label>
            <Input 
              id="lastRenovationYear" 
              type="number" 
              value={lastRenovationYear}
              onChange={(e) => {
                setLastRenovationYear(e.target.value)
                updateModuleState('propertyDetails', true)
              }}
              className="h-8 text-gray-500" 
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="buildingFloors" className="text-sm">Plantas edificio</Label>
            <Input 
              id="buildingFloors" 
              type="number" 
              value={buildingFloors}
              onChange={(e) => {
                setBuildingFloors(parseInt(e.target.value))
                updateModuleState('propertyDetails', true)
              }}
              className="h-8 text-gray-500" 
              min="1"
              step="1"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="conservationStatus" className="text-sm">Estado de conservación</Label>
            <Select 
              value={listing.conservationStatus?.toString() ?? "1"} 
              onValueChange={(value) => {
                // Update the listing object directly for now
                listing.conservationStatus = parseInt(value)
                updateModuleState('propertyDetails', true)
              }}
            >
              <SelectTrigger className="h-8 text-gray-500">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Nuevo</SelectItem>
                <SelectItem value="6">Reformado</SelectItem>
                <SelectItem value="1">Bueno</SelectItem>
                <SelectItem value="2">Regular</SelectItem>
                <SelectItem value="4">Reformar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Location */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("location"))}>
        <ModernSaveIndicator 
          state={moduleStates.location?.saveState ?? "idle"} 
          onSave={() => saveModule("location")} 
        />
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold tracking-wide">DIRECCIÓN DEL INMUEBLE</h3>
          <button 
            onClick={() => setIsMapsPopupOpen(true)}
            className="flex items-center justify-center h-8 w-8 rounded-md bg-background hover:bg-accent hover:text-accent-foreground"
          >
            <Image
              src="/logos/googlemapsicon.png"
              alt="Google Maps"
              width={16}
              height={16}
              className="object-contain"
            />
          </button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="street" className="text-sm">Calle</Label>
            <Input 
              id="street" 
              defaultValue={listing.street} 
              className="h-8 text-gray-500"
              onChange={() => updateModuleState('location', true)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="addressDetails" className="text-sm">Detalles de la dirección</Label>
            <Input 
              id="addressDetails" 
              defaultValue={listing.addressDetails} 
              className="h-8 text-gray-500" 
              placeholder="Piso, puerta, escalera, etc."
              onChange={() => updateModuleState('location', true)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="postalCode" className="text-sm">Código Postal</Label>
              <Input 
                id="postalCode" 
                defaultValue={listing.postalCode} 
                className="h-8 text-gray-500"
                onChange={() => updateModuleState('location', true)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="neighborhood" className="text-sm">Barrio</Label>
              <Input 
                id="neighborhood" 
                defaultValue={listing.neighborhood} 
                className="h-8 bg-muted" 
                disabled 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-sm">Ciudad</Label>
              <Input 
                id="city" 
                value={city} 
                onChange={(e) => {
                  setCity(e.target.value)
                  updateModuleState('location', true)
                }} 
                className="h-8 text-gray-500" 
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="municipality" className="text-sm">Municipio</Label>
              <Input 
                id="municipality" 
                value={municipality} 
                onChange={(e) => {
                  setMunicipality(e.target.value)
                  updateModuleState('location', true)
                }} 
                className="h-8 text-gray-500" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="province" className="text-sm">Provincia</Label>
            <Input 
              id="province" 
              value={province} 
              onChange={(e) => {
                setProvince(e.target.value)
                updateModuleState('location', true)
              }} 
              className="h-8 text-gray-500" 
            />
          </div>
        </div>
      </Card>

      {/* Features */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("features"))}>
        <ModernSaveIndicator 
          state={moduleStates.features?.saveState ?? "idle"} 
          onSave={() => saveModule("features")} 
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">EQUIPAMIENTO Y SERVICIOS</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hasElevator" 
              defaultChecked={listing.hasElevator}
              onCheckedChange={() => updateModuleState('features', true)}
            />
            <Label htmlFor="hasElevator" className="text-sm">Ascensor</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hasGarage" 
              checked={hasGarage}
              onCheckedChange={(checked) => {
                setHasGarage(checked as boolean)
                if (!checked) {
                  setGarageType("")
                  setGarageSpaces(1)
                  setGarageInBuilding(false)
                  setGarageNumber("")
                }
                updateModuleState('features', true)
              }}
            />
            <Label htmlFor="hasGarage" className="text-sm">Garaje</Label>
          </div>
          {hasGarage && (
            <div className="ml-6 mt-1 space-y-2 border-l-2 pl-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="garageType" className="text-xs">Tipo</Label>
                  <Select value={garageType} onValueChange={setGarageType}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abierto">Abierto</SelectItem>
                      <SelectItem value="cerrado">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="garageSpaces" className="text-xs">Plazas</Label>
                  <Input 
                    id="garageSpaces" 
                    type="number" 
                    value={garageSpaces}
                    onChange={(e) => {
                      setGarageSpaces(parseInt(e.target.value))
                      updateModuleState('features', true)
                    }}
                    className="h-7 text-xs" 
                    min="1"
                    max="10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center space-x-1">
                  <Checkbox 
                    id="garageInBuilding" 
                    checked={garageInBuilding}
                    onCheckedChange={(checked) => {
                      setGarageInBuilding(checked as boolean)
                      updateModuleState('features', true)
                    }} 
                    className="h-3 w-3"
                  />
                  <Label htmlFor="garageInBuilding" className="text-xs">En edificio</Label>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="garageNumber" className="text-xs">Nº plaza</Label>
                  <Input 
                    id="garageNumber" 
                    value={garageNumber}
                    onChange={(e) => {
                      setGarageNumber(e.target.value)
                      updateModuleState('features', true)
                    }}
                    className="h-7 text-xs" 
                    placeholder="A-123"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="optionalGaragePrice" className="text-xs">Precio</Label>
                <Input 
                  id="optionalGaragePrice" 
                  type="number" 
                  value={Math.round(optionalGaragePrice)}
                  onChange={(e) => {
                    setOptionalGaragePrice(Math.round(Number(e.target.value)))
                    updateModuleState('features', true)
                  }}
                  className="h-7 text-xs" 
                  min="0"
                  step="1"
                  placeholder="0"
                />
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hasStorageRoom" 
              checked={hasStorageRoom}
              onCheckedChange={(checked) => {
                setHasStorageRoom(checked as boolean)
                if (!checked) {
                  setStorageRoomSize(0)
                  setStorageRoomNumber("")
                }
                updateModuleState('features', true)
              }}
            />
            <Label htmlFor="hasStorageRoom" className="text-sm">Trastero</Label>
          </div>
          {hasStorageRoom && (
            <div className="ml-6 mt-1 space-y-2 border-l-2 pl-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="storageRoomSize" className="text-xs">Tamaño (m²)</Label>
                  <Input 
                    id="storageRoomSize" 
                    type="number" 
                    value={storageRoomSize}
                    onChange={(e) => {
                      setStorageRoomSize(parseInt(e.target.value))
                      updateModuleState('features', true)
                    }}
                    className="h-7 text-xs" 
                    min="0"
                    step="1"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="storageRoomNumber" className="text-xs">Nº trastero</Label>
                  <Input 
                    id="storageRoomNumber" 
                    value={storageRoomNumber}
                    onChange={(e) => {
                      setStorageRoomNumber(e.target.value)
                      updateModuleState('features', true)
                    }}
                    className="h-7 text-xs" 
                    placeholder="T-45"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="optionalStorageRoomPrice" className="text-xs">Precio</Label>
                <Input 
                  id="optionalStorageRoomPrice" 
                  type="number" 
                  value={Math.round(optionalStorageRoomPrice)}
                  onChange={(e) => {
                    setOptionalStorageRoomPrice(Math.round(Number(e.target.value)))
                    updateModuleState('features', true)
                  }}
                  className="h-7 text-xs" 
                  min="0"
                  step="1"
                  placeholder="0"
                />
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox id="hasHeating" checked={isHeating} onCheckedChange={checked => {
              setIsHeating(!!checked)
              updateModuleState('features', true)
            }} />
            <Label htmlFor="hasHeating" className="text-sm">Calefacción</Label>
          </div>
          {isHeating && (
            <div className="ml-6 mt-2">
              <Select value={heatingType} onValueChange={(value) => {
                setHeatingType(value)
                updateModuleState('features', true)
              }}>
                <SelectTrigger className="h-6 text-xs text-gray-500 mt-1 px-2 py-0">
                  <SelectValue placeholder="Seleccionar tipo de calefacción" />
                </SelectTrigger>
                <SelectContent>
                  {heatingOptions.map(option => (
                    <SelectItem key={option.id} value={option.id.toString()}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox id="hasHotWater" checked={isHotWater} onCheckedChange={checked => {
              setIsHotWater(!!checked)
              if (!checked) {
                setHotWaterType("")
              }
              updateModuleState('features', true)
            }} />
            <Label htmlFor="hasHotWater" className="text-sm">Agua caliente</Label>
          </div>
          {isHotWater && (
            <div className="ml-6 mt-2">
              <Select value={hotWaterType} onValueChange={(value) => {
                setHotWaterType(value)
                updateModuleState('features', true)
              }}>
                <SelectTrigger className="h-6 text-xs text-gray-500 mt-1 px-2 py-0">
                  <SelectValue placeholder="Seleccionar tipo de agua caliente" />
                </SelectTrigger>
                <SelectContent>
                  {heatingOptions.map(option => (
                    <SelectItem key={option.id} value={option.id.toString()}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hasAirConditioning" 
              checked={isAirConditioning}
              onCheckedChange={(checked) => {
                setIsAirConditioning(checked as boolean)
                if (!checked) {
                  setAirConditioningType("")
                }
                updateModuleState('features', true)
              }}
            />
            <Label htmlFor="hasAirConditioning" className="text-sm">Aire acondicionado</Label>
          </div>
          {isAirConditioning && (
            <div className="ml-6 mt-1">
              <Select value={airConditioningType} onValueChange={(value) => {
                setAirConditioningType(value)
                updateModuleState('features', true)
              }}>
                <SelectTrigger className="h-6 text-xs text-gray-500 mt-1 px-2 py-0">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="central">Central</SelectItem>
                  <SelectItem value="split">Split</SelectItem>
                  <SelectItem value="portatil">Portátil</SelectItem>
                  <SelectItem value="conductos">Conductos</SelectItem>
                  <SelectItem value="cassette">Cassette</SelectItem>
                  <SelectItem value="ventana">Ventana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isFurnished" 
                checked={isFurnished}
                onCheckedChange={(checked) => {
                  setIsFurnished(checked as boolean)
                  updateModuleState('features', true)
                }} 
              />
              <Label htmlFor="isFurnished" className="text-sm">Amueblado</Label>
            </div>
            {isFurnished && (
              <div className="ml-4">
                <RadioGroup defaultValue={listing.furnitureQuality} className="flex flex-wrap gap-2">
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="basic" id="basic" className="text-muted-foreground h-3 w-3" />
                    <Label htmlFor="basic" className="text-xs text-muted-foreground">Básico</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="standard" id="standard" className="text-muted-foreground h-3 w-3" />
                    <Label htmlFor="standard" className="text-xs text-muted-foreground">Estándar</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="high" id="high" className="text-muted-foreground h-3 w-3" />
                    <Label htmlFor="high" className="text-xs text-muted-foreground">Alta</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="luxury" id="luxury" className="text-muted-foreground h-3 w-3" />
                    <Label htmlFor="luxury" className="text-xs text-muted-foreground">Lujo</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>

          {/* Appliances - only show when furnished */}
          {isFurnished && (
            <div className="space-y-2 border-t border-border pt-3">
              <h4 className="text-xs font-medium text-muted-foreground">Electrodomésticos incluidos</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                <div className="flex items-center space-x-1">
                  <Checkbox 
                    id="oven" 
                    checked={oven}
                    onCheckedChange={(checked) => {
                      setOven(checked as boolean)
                      updateModuleState('features', true)
                    }} 
                    className="h-3 w-3 no-checkmark"
                  />
                  <Label htmlFor="oven" className="text-xs">Horno</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <Checkbox 
                    id="microwave" 
                    checked={microwave}
                    onCheckedChange={(checked) => {
                      setMicrowave(checked as boolean)
                      updateModuleState('features', true)
                    }} 
                    className="h-3 w-3 no-checkmark"
                  />
                  <Label htmlFor="microwave" className="text-xs">Microondas</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <Checkbox 
                    id="washingMachine" 
                    checked={washingMachine}
                    onCheckedChange={(checked) => {
                      setWashingMachine(checked as boolean)
                      updateModuleState('features', true)
                    }} 
                    className="h-3 w-3 no-checkmark"
                  />
                  <Label htmlFor="washingMachine" className="text-xs">Lavadora</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <Checkbox 
                    id="fridge" 
                    checked={fridge}
                    onCheckedChange={(checked) => {
                      setFridge(checked as boolean)
                      updateModuleState('features', true)
                    }} 
                    className="h-3 w-3 no-checkmark"
                  />
                  <Label htmlFor="fridge" className="text-xs">Frigorífico</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <Checkbox 
                    id="tv" 
                    checked={tv}
                    onCheckedChange={(checked) => {
                      setTv(checked as boolean)
                      updateModuleState('features', true)
                    }} 
                    className="h-3 w-3 no-checkmark"
                  />
                  <Label htmlFor="tv" className="text-xs">Televisión</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <Checkbox 
                    id="stoneware" 
                    checked={stoneware}
                    onCheckedChange={(checked) => {
                      setStoneware(checked as boolean)
                      updateModuleState('features', true)
                    }} 
                    className="h-3 w-3 no-checkmark"
                  />
                  <Label htmlFor="stoneware" className="text-xs">Vajilla</Label>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Contact Information */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("contactInfo"))}>
        <ModernSaveIndicator 
          state={moduleStates.contactInfo?.saveState ?? "idle"} 
          onSave={() => saveModule("contactInfo")} 
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">DATOS DE CONTACTO</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="owners" className="text-sm">Propietarios</Label>
            <div className="flex gap-2">
              <Select 
                value={selectedOwnerIds[0]} // We'll handle multiple selection differently
                onValueChange={(value) => {
                  if (!selectedOwnerIds.includes(value)) {
                    setSelectedOwnerIds([...selectedOwnerIds, value])
                    updateModuleState('contactInfo', true)
                  }
                }}
              >
                <SelectTrigger className="h-8 text-gray-500 flex-1">
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
                  const owner = owners.find(o => o.id.toString() === ownerId)
                  return owner ? (
                    <div 
                      key={ownerId} 
                      className="flex items-center justify-between bg-blue-50 shadow-md px-2 py-1 rounded-md cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                      onClick={() => router.push(`/contactos/${owner.id}`)}
                    >
                      <span className="text-sm">
                        {owner.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation() // Prevent triggering the parent onClick
                          setSelectedOwnerIds(selectedOwnerIds.filter(id => id !== ownerId))
                          updateModuleState('contactInfo', true)
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ) : null
                })}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="agent" className="text-sm">Agente</Label>
            <div className="flex gap-2">
              <Select 
                value={selectedAgentId} 
                onValueChange={(value) => {
                  setSelectedAgentId(value)
                  updateModuleState('contactInfo', true)
                }}
              >
                <SelectTrigger className="h-8 text-gray-500 flex-1">
                  <SelectValue placeholder="Seleccionar agente" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem 
                      key={agent.id} 
                      value={agent.id.toString()}
                    >
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Exterior and Orientation */}
      <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("orientation"))}>
        <ModernSaveIndicator 
          state={moduleStates.orientation?.saveState ?? "idle"} 
          onSave={() => saveModule("orientation")} 
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">ORIENTACIÓN Y EXPOSICIÓN</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isExterior" 
              checked={isExterior}
              onCheckedChange={(checked) => {
                setIsExterior(checked as boolean)
                updateModuleState('orientation', true)
              }} 
            />
            <Label htmlFor="isExterior" className="text-sm">Exterior</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isBright" 
              checked={isBright}
              onCheckedChange={(checked) => {
                setIsBright(checked as boolean)
                updateModuleState('orientation', true)
              }} 
            />
            <Label htmlFor="isBright" className="text-sm">Luminoso</Label>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="orientation" className="text-sm">Orientación</Label>
            <Select value={orientation} onValueChange={(value) => {
              setOrientation(value)
              updateModuleState('orientation', true)
            }}>
              <SelectTrigger className="h-8 text-gray-500">
                <SelectValue placeholder="Seleccionar orientación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="norte">Norte</SelectItem>
                <SelectItem value="sur">Sur</SelectItem>
                <SelectItem value="este">Este</SelectItem>
                <SelectItem value="oeste">Oeste</SelectItem>
                <SelectItem value="noreste">Noreste</SelectItem>
                <SelectItem value="noroeste">Noroeste</SelectItem>
                <SelectItem value="sureste">Sureste</SelectItem>
                <SelectItem value="suroeste">Suroeste</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Additional Characteristics and Premium Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 col-span-full">
        {/* Additional Characteristics */}
        <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("additionalCharacteristics"))}>
          <ModernSaveIndicator 
            state={moduleStates.additionalCharacteristics?.saveState ?? "idle"} 
            onSave={() => saveModule("additionalCharacteristics")} 
          />
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setShowAdditionalCharacteristics(!showAdditionalCharacteristics)}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Características adicionales
                </h3>
              </div>
              <ChevronDown 
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  showAdditionalCharacteristics && "rotate-180"
                )} 
              />
            </button>
          </div>
          <div className={cn(
            "grid transition-all duration-200 ease-in-out",
            showAdditionalCharacteristics ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
          )}>
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {/* Security Features */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Seguridad</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="securityDoor" 
                        checked={securityDoor}
                        onCheckedChange={(checked) => {
                          setSecurityDoor(checked as boolean)
                          updateModuleState('additionalCharacteristics', true)
                        }} 
                      />
                      <Label htmlFor="securityDoor" className="text-sm">Puerta blindada</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="alarm" 
                        checked={alarm}
                        onCheckedChange={(checked) => {
                          setAlarm(checked as boolean)
                          updateModuleState('additionalCharacteristics', true)
                        }} 
                      />
                      <Label htmlFor="alarm" className="text-sm">Alarma</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="videoIntercom" 
                        checked={videoIntercom}
                        onCheckedChange={(checked) => {
                          setVideoIntercom(checked as boolean)
                          updateModuleState('additionalCharacteristics', true)
                        }} 
                      />
                      <Label htmlFor="videoIntercom" className="text-sm">Videoportero</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="securityGuard" 
                        checked={securityGuard}
                        onCheckedChange={(checked) => {
                          setSecurityGuard(checked as boolean)
                          updateModuleState('additionalCharacteristics', true)
                        }} 
                      />
                      <Label htmlFor="securityGuard" className="text-sm">Vigilante</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="conciergeService" 
                        checked={conciergeService}
                        onCheckedChange={(checked) => {
                          setConciergeService(checked as boolean)
                          updateModuleState('additionalCharacteristics', true)
                        }} 
                      />
                      <Label htmlFor="conciergeService" className="text-sm">Conserjería</Label>
                    </div>
                  </div>

                  {/* Building Features */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Características del edificio</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="vpo" 
                        checked={vpo}
                        onCheckedChange={(checked) => {
                          setVpo(checked as boolean)
                          updateModuleState('additionalCharacteristics', true)
                        }} 
                      />
                      <Label htmlFor="vpo" className="text-sm">VPO</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="disabledAccessible" 
                        checked={disabledAccessible}
                        onCheckedChange={(checked) => {
                          setDisabledAccessible(checked as boolean)
                          updateModuleState('additionalCharacteristics', true)
                        }} 
                      />
                      <Label htmlFor="disabledAccessible" className="text-sm">Accesible</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="satelliteDish" 
                        checked={satelliteDish}
                        onCheckedChange={(checked) => {
                          setSatelliteDish(checked as boolean)
                          updateModuleState('additionalCharacteristics', true)
                        }} 
                      />
                      <Label htmlFor="satelliteDish" className="text-sm">Antena</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="doubleGlazing" 
                        checked={doubleGlazing}
                        onCheckedChange={(checked) => {
                          setDoubleGlazing(checked as boolean)
                          updateModuleState('additionalCharacteristics', true)
                        }} 
                      />
                      <Label htmlFor="doubleGlazing" className="text-sm">Doble acristalamiento</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Kitchen Features */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Cocina</h4>
                    <div className="space-y-1.5">
                      <Label htmlFor="kitchenType" className="text-sm">Tipo de cocina</Label>
                      <Select value={kitchenType} onValueChange={(value) => {
                        setKitchenType(value)
                        updateModuleState('additionalCharacteristics', true)
                      }}>
                        <SelectTrigger className="h-8 text-gray-500">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gas">Gas</SelectItem>
                          <SelectItem value="induccion">Inducción</SelectItem>
                          <SelectItem value="vitroceramica">Vitrocerámica</SelectItem>
                          <SelectItem value="carbon">Carbón</SelectItem>
                          <SelectItem value="electrico">Eléctrico</SelectItem>
                          <SelectItem value="mixto">Mixto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="openKitchen" 
                        checked={openKitchen}
                        onCheckedChange={(checked) => {
                          setOpenKitchen(checked as boolean)
                          updateModuleState('additionalCharacteristics', true)
                        }} 
                      />
                      <Label htmlFor="openKitchen" className="text-sm">Cocina abierta</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="frenchKitchen" 
                        checked={frenchKitchen}
                        onCheckedChange={(checked) => {
                          setFrenchKitchen(checked as boolean)
                          updateModuleState('additionalCharacteristics', true)
                        }} 
                      />
                      <Label htmlFor="frenchKitchen" className="text-sm">Cocina francesa</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="furnishedKitchen" 
                        checked={furnishedKitchen}
                        onCheckedChange={(checked) => {
                          setFurnishedKitchen(checked as boolean)
                          updateModuleState('additionalCharacteristics', true)
                        }} 
                      />
                      <Label htmlFor="furnishedKitchen" className="text-sm">Cocina amueblada</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="pantry" 
                        checked={pantry}
                        onCheckedChange={(checked) => {
                          setPantry(checked as boolean)
                          updateModuleState('additionalCharacteristics', true)
                        }} 
                      />
                      <Label htmlFor="pantry" className="text-sm">Despensa</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Premium Features */}
        <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("premiumFeatures"))}>
          <ModernSaveIndicator 
            state={moduleStates.premiumFeatures?.saveState ?? "idle"} 
            onSave={() => saveModule("premiumFeatures")} 
          />
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setShowPremiumFeatures(!showPremiumFeatures)}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Extras de Lujo y Confort
                </h3>
              </div>
              <ChevronDown 
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  showPremiumFeatures && "rotate-180"
                )} 
              />
            </button>
          </div>
          <div className={cn(
            "grid transition-all duration-200 ease-in-out",
            showPremiumFeatures ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
          )}>
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {/* Views */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Vistas</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="views" 
                        checked={views}
                        onCheckedChange={(checked) => {
                          setViews(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="views" className="text-sm">Vistas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="mountainViews" 
                        checked={mountainViews}
                        onCheckedChange={(checked) => {
                          setMountainViews(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="mountainViews" className="text-sm">Vistas montaña</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="seaViews" 
                        checked={seaViews}
                        onCheckedChange={(checked) => {
                          setSeaViews(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="seaViews" className="text-sm">Vistas mar</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="beachfront" 
                        checked={beachfront}
                        onCheckedChange={(checked) => {
                          setBeachfront(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="beachfront" className="text-sm">Primera línea</Label>
                    </div>
                  </div>

                  {/* Wellness */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Bienestar</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="jacuzzi" 
                        checked={jacuzzi}
                        onCheckedChange={(checked) => {
                          setJacuzzi(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="jacuzzi" className="text-sm">Jacuzzi</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="hydromassage" 
                        checked={hydromassage}
                        onCheckedChange={(checked) => {
                          setHydromassage(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="hydromassage" className="text-sm">Hidromasaje</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="fireplace" 
                        checked={fireplace}
                        onCheckedChange={(checked) => {
                          setFireplace(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="fireplace" className="text-sm">Chimenea</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="suiteBathroom" 
                        checked={suiteBathroom}
                        onCheckedChange={(checked) => {
                          setSuiteBathroom(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="suiteBathroom" className="text-sm">Baño en suite</Label>
                    </div>
                  </div>

                  {/* Smart Home */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Domótica</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="homeAutomation" 
                        checked={homeAutomation}
                        onCheckedChange={(checked) => {
                          setHomeAutomation(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="homeAutomation" className="text-sm">Domótica</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="musicSystem" 
                        checked={musicSystem}
                        onCheckedChange={(checked) => {
                          setMusicSystem(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="musicSystem" className="text-sm">Sistema de música</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Outdoor Features */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Exterior</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="garden" 
                        checked={garden}
                        onCheckedChange={(checked) => {
                          setGarden(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="garden" className="text-sm">Jardín</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="pool" 
                        checked={pool}
                        onCheckedChange={(checked) => {
                          setPool(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="pool" className="text-sm">Piscina</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="privatePool" 
                        checked={privatePool}
                        onCheckedChange={(checked) => {
                          setPrivatePool(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="privatePool" className="text-sm">Piscina privada</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="communityPool" 
                        checked={communityPool}
                        onCheckedChange={(checked) => {
                          setCommunityPool(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="communityPool" className="text-sm">Piscina comunitaria</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="tennisCourt" 
                        checked={tennisCourt}
                        onCheckedChange={(checked) => {
                          setTennisCourt(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="tennisCourt" className="text-sm">Pista de tenis</Label>
                    </div>
                  </div>

                  {/* Community Amenities */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Comunitarios</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="gym" 
                        checked={gym}
                        onCheckedChange={(checked) => {
                          setGym(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="gym" className="text-sm">Gimnasio</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="sportsArea" 
                        checked={sportsArea}
                        onCheckedChange={(checked) => {
                          setSportsArea(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="sportsArea" className="text-sm">Zona deportiva</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="childrenArea" 
                        checked={childrenArea}
                        onCheckedChange={(checked) => {
                          setChildrenArea(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="childrenArea" className="text-sm">Zona infantil</Label>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Ubicación</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="nearbyPublicTransport" 
                        checked={nearbyPublicTransport}
                        onCheckedChange={(checked) => {
                          setNearbyPublicTransport(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="nearbyPublicTransport" className="text-sm">Transporte público cercano</Label>
                    </div>
                  </div>

                  {/* Utility Rooms */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Estancias</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="laundryRoom" 
                        checked={laundryRoom}
                        onCheckedChange={(checked) => {
                          setLaundryRoom(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="laundryRoom" className="text-sm">Lavadero</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="coveredClothesline" 
                        checked={coveredClothesline}
                        onCheckedChange={(checked) => {
                          setCoveredClothesline(checked as boolean)
                          updateModuleState('premiumFeatures', true)
                        }} 
                      />
                      <Label htmlFor="coveredClothesline" className="text-sm">Tendedero cubierto</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Spaces and Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 col-span-full">
        {/* Additional Spaces */}
        <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("additionalSpaces"))}>
          <ModernSaveIndicator 
            state={moduleStates.additionalSpaces?.saveState ?? "idle"} 
            onSave={() => saveModule("additionalSpaces")} 
          />
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setShowAdditionalSpaces(!showAdditionalSpaces)}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Zonas y Espacios Complementarios
                </h3>
              </div>
              <ChevronDown 
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  showAdditionalSpaces && "rotate-180"
                )} 
              />
            </button>
          </div>
          <div className={cn(
            "grid transition-all duration-200 ease-in-out",
            showAdditionalSpaces ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
          )}>
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {/* Outdoor Spaces */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Espacios exteriores</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="terrace" 
                        checked={terrace}
                        onCheckedChange={(checked) => {
                          setTerrace(checked as boolean)
                          updateModuleState('additionalSpaces', true)
                        }} 
                      />
                      <Label htmlFor="terrace" className="text-sm">Terraza</Label>
                    </div>
                    {terrace && (
                      <div className="ml-6 space-y-1.5">
                        <Label htmlFor="terraceSize" className="text-sm">Tamaño (m²)</Label>
                        <Input 
                          id="terraceSize" 
                          type="number" 
                          value={terraceSize}
                          onChange={(e) => {
                            setTerraceSize(parseInt(e.target.value))
                            updateModuleState('additionalSpaces', true)
                          }}
                          className="h-8 text-gray-500" 
                          min="0"
                          step="1"
                        />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Label htmlFor="balconyCount" className="text-sm">Nº balcones</Label>
                      <Input 
                        id="balconyCount" 
                        type="number" 
                        value={balconyCount}
                        onChange={(e) => {
                          setBalconyCount(parseInt(e.target.value))
                          updateModuleState('additionalSpaces', true)
                        }}
                        className="h-8 text-gray-500" 
                        min="0"
                        step="1"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="galleryCount" className="text-sm">Nº galerías</Label>
                      <Input 
                        id="galleryCount" 
                        type="number" 
                        value={galleryCount}
                        onChange={(e) => {
                          setGalleryCount(parseInt(e.target.value))
                          updateModuleState('additionalSpaces', true)
                        }}
                        className="h-8 text-gray-500" 
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>

                  {/* Storage Spaces */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Almacenamiento</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="wineCellar" 
                        checked={wineCellar}
                        onCheckedChange={(checked) => {
                          setWineCellar(checked as boolean)
                          updateModuleState('additionalSpaces', true)
                        }} 
                      />
                      <Label htmlFor="wineCellar" className="text-sm">Bodega</Label>
                    </div>
                    {wineCellar && (
                      <div className="ml-6 space-y-1.5">
                        <Label htmlFor="wineCellarSize" className="text-sm">Tamaño (m²)</Label>
                        <Input 
                          id="wineCellarSize" 
                          type="number" 
                          value={wineCellarSize}
                          onChange={(e) => {
                            setWineCellarSize(parseInt(e.target.value))
                            updateModuleState('additionalSpaces', true)
                          }}
                          className="h-8 text-gray-500" 
                          min="0"
                          step="1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Room Sizes */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Dimensiones</h4>
                    <div className="space-y-1.5">
                      <Label htmlFor="livingRoomSize" className="text-sm">Tamaño salón (m²)</Label>
                      <Input 
                        id="livingRoomSize" 
                        type="number" 
                        value={livingRoomSize}
                        onChange={(e) => {
                          setLivingRoomSize(parseInt(e.target.value))
                          updateModuleState('additionalSpaces', true)
                        }}
                        className="h-8 text-gray-500" 
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>

                  {/* Built-in Features */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Empotrados</h4>
                    <div className="space-y-1.5">
                      <Label htmlFor="builtInWardrobes" className="text-sm">Armarios empotrados</Label>
                      <Select value={builtInWardrobes} onValueChange={(value) => {
                        setBuiltInWardrobes(value)
                        updateModuleState('additionalSpaces', true)
                      }}>
                        <SelectTrigger className="h-8 text-gray-500">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ninguno">Ninguno</SelectItem>
                          <SelectItem value="parcial">Parcial</SelectItem>
                          <SelectItem value="completo">Completo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Materials and Finishes */}
        <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("materials"))}>
          <ModernSaveIndicator 
            state={moduleStates.materials?.saveState ?? "idle"} 
            onSave={() => saveModule("materials")} 
          />
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setShowMaterials(!showMaterials)}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Materiales y acabados
                </h3>
              </div>
              <ChevronDown 
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  showMaterials && "rotate-180"
                )} 
              />
            </button>
          </div>
          <div className={cn(
            "grid transition-all duration-200 ease-in-out",
            showMaterials ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
          )}>
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {/* Windows and Doors */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Ventanas y puertas</h4>
                    <div className="space-y-1.5">
                      <Label htmlFor="windowType" className="text-sm">Tipo de ventana</Label>
                      <Select 
                        value={windowType} 
                        onValueChange={(value) => {
                          setWindowType(value)
                          updateModuleState('materials', true)
                        }}
                      >
                        <SelectTrigger className="h-8 text-gray-500">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aluminio">Aluminio</SelectItem>
                          <SelectItem value="pvc">PVC</SelectItem>
                          <SelectItem value="madera">Madera</SelectItem>
                          <SelectItem value="climalit">Climalit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="carpentryType" className="text-sm">Tipo de carpintería</Label>
                      <Select value={carpentryType} onValueChange={setCarpentryType}>
                        <SelectTrigger className="h-8 text-gray-500">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aluminio">Aluminio</SelectItem>
                          <SelectItem value="pvc">PVC</SelectItem>
                          <SelectItem value="madera">Madera</SelectItem>
                          <SelectItem value="hierro">Hierro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="shutterType" className="text-sm">Tipo de persiana</Label>
                      <Select value={shutterType} onValueChange={setShutterType}>
                        <SelectTrigger className="h-8 text-gray-500">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="electrico">Eléctrica</SelectItem>
                          <SelectItem value="automatica">Automática</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Flooring */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Suelos</h4>
                    <div className="space-y-1.5">
                      <Label htmlFor="mainFloorType" className="text-sm">Tipo de suelo</Label>
                      <Select value={mainFloorType} onValueChange={setMainFloorType}>
                        <SelectTrigger className="h-8 text-gray-500">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="parquet">Parquet</SelectItem>
                          <SelectItem value="marmol">Mármol</SelectItem>
                          <SelectItem value="gres">Gres</SelectItem>
                          <SelectItem value="moqueta">Moqueta</SelectItem>
                          <SelectItem value="hidraulico">Hidráulico</SelectItem>
                          <SelectItem value="microcemento">Microcemento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Description Module */}
      <Card className={cn("relative p-4 col-span-full transition-all duration-500 ease-out", getCardStyles("description"))}>
        <ModernSaveIndicator 
          state={moduleStates.description?.saveState ?? "idle"} 
          onSave={() => saveModule("description")} 
        />
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide">DESCRIPCIÓN</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsSignatureDialogOpen(true)}>
                Añadir Firma
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm">Descripción</Label>
            <Textarea 
              id="description" 
              defaultValue={description}
              className="min-h-[200px] resize-y border-gray-200 focus:border-gray-400 focus:ring-gray-300 transition-colors"
              placeholder="Describe las características principales de la propiedad, su ubicación, y cualquier detalle relevante que pueda interesar a los potenciales compradores o inquilinos."
              onChange={() => updateModuleState('description', true)}
            />
          </div>
          <div className="pt-6 flex justify-center">
            <Button
              type="button"
              onClick={handleGenerateDescription}
              disabled={isGenerating}
              className="group relative overflow-hidden bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 text-white font-medium px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando descripción...
                </>
              ) : (
                <>
                  Asistente de descripción
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={isSignatureDialogOpen} onOpenChange={setIsSignatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Firma</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Escribe tu firma aquí..."
              value={signature}
              onChange={handleSignatureChange}
              className="min-h-[100px] resize-y"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSignatureDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              // Here you can add logic to append the signature to the description
              const descriptionTextarea = document.getElementById('description') as HTMLTextAreaElement
              if (descriptionTextarea) {
                descriptionTextarea.value = descriptionTextarea.value + "\n\n" + signature
                setDescription(descriptionTextarea.value)
                updateModuleState('description', true)
              }
              setIsSignatureDialogOpen(false)
            }}>
              Añadir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rental Properties Module */}
      {!(currentListingType === 'Sale' || currentListingType === 'Transfer') && (
        <Card className={cn("relative p-4 transition-all duration-500 ease-out", getCardStyles("rentalProperties"))}>
          <ModernSaveIndicator 
            state={moduleStates.rentalProperties?.saveState ?? "idle"} 
            onSave={() => saveModule("rentalProperties")} 
          />
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-wide">PROPIEDADES DEL ALQUILER</h3>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="internet" 
                  checked={internet}
                  onCheckedChange={(checked) => {
                    setInternet(checked as boolean)
                    updateModuleState('rentalProperties', true)
                  }} 
                />
                <Label htmlFor="internet" className="text-sm">Internet</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="studentFriendly" 
                  checked={studentFriendly}
                  onCheckedChange={(checked) => {
                    setStudentFriendly(checked as boolean)
                    updateModuleState('rentalProperties', true)
                  }} 
                />
                <Label htmlFor="studentFriendly" className="text-sm">Admite estudiantes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="petsAllowed" 
                  checked={petsAllowed}
                  onCheckedChange={(checked) => {
                    setPetsAllowed(checked as boolean)
                    updateModuleState('rentalProperties', true)
                  }} 
                />
                <Label htmlFor="petsAllowed" className="text-sm">Admite mascotas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="appliancesIncluded" 
                  checked={appliancesIncluded}
                  onCheckedChange={(checked) => {
                    setAppliancesIncluded(checked as boolean)
                    updateModuleState('rentalProperties', true)
                  }} 
                />
                <Label htmlFor="appliancesIncluded" className="text-sm">Incluye electrodomésticos</Label>
              </div>
            </div>
          </div>
        </Card>
      )}
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
    </div>
  )
} 