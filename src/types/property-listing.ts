// Shared PropertyListing interface for consistent typing across the application
export interface PropertyListing {
  // Core IDs
  propertyId?: number | string
  listingId?: number | string
  
  // Basic property info
  propertyType?: string
  propertySubtype?: string
  listingType?: string
  price?: number | string
  cadastralReference?: string
  
  // Status flags
  isBankOwned?: boolean
  isFeatured?: boolean
  newConstruction?: boolean
  
  // Dimensions
  bedrooms?: number
  bathrooms?: number
  squareMeter?: number
  builtSurfaceArea?: number
  
  // Construction details
  yearBuilt?: number
  lastRenovationYear?: string
  buildingFloors?: number
  conservationStatus?: number
  
  // Location
  street?: string
  addressDetails?: string
  postalCode?: string
  neighborhood?: string
  city?: string
  province?: string
  municipality?: string
  
  // Features
  hasElevator?: boolean
  hasGarage?: boolean
  garageType?: string
  garageSpaces?: number
  garageInBuilding?: boolean
  garageNumber?: string
  optionalGaragePrice?: number
  
  // Storage
  hasStorageRoom?: boolean
  storageRoomSize?: number
  storageRoomNumber?: string
  optionalStorageRoomPrice?: number
  
  // Utilities
  hasHeating?: boolean
  heatingType?: string
  hotWaterType?: string
  airConditioningType?: string
  
  // Furnishing
  isFurnished?: boolean
  furnitureQuality?: string
  studentFriendly?: boolean
  petsAllowed?: boolean
  appliancesIncluded?: boolean
  
  // Characteristics
  exterior?: boolean
  orientation?: string
  bright?: boolean
  disabledAccessible?: boolean
  vpo?: boolean
  
  // Security & amenities
  videoIntercom?: boolean
  conciergeService?: boolean
  securityGuard?: boolean
  satelliteDish?: boolean
  doubleGlazing?: boolean
  alarm?: boolean
  securityDoor?: boolean
  
  // Kitchen
  kitchenType?: string
  openKitchen?: boolean
  frenchKitchen?: boolean
  furnishedKitchen?: boolean
  pantry?: boolean
  
  // Outdoor spaces
  terrace?: boolean
  terraceSize?: number
  wineCellar?: boolean
  wineCellarSize?: number
  livingRoomSize?: number
  balconyCount?: number
  galleryCount?: number
  
  // Materials & finishes
  builtInWardrobes?: string
  mainFloorType?: string
  shutterType?: string
  carpentryType?: string
  windowType?: string
  
  // Views
  views?: boolean
  mountainViews?: boolean
  seaViews?: boolean
  beachfront?: boolean
  
  // Luxury features
  jacuzzi?: boolean
  hydromassage?: boolean
  garden?: boolean
  pool?: boolean
  homeAutomation?: boolean
  musicSystem?: boolean
  
  // Additional spaces
  laundryRoom?: boolean
  coveredClothesline?: boolean
  fireplace?: boolean
  gym?: boolean
  sportsArea?: boolean
  childrenArea?: boolean
  suiteBathroom?: boolean
  
  // Community features
  nearbyPublicTransport?: boolean
  communityPool?: boolean
  privatePool?: boolean
  tennisCourt?: boolean
  
  // Appliances
  internet?: boolean
  oven?: boolean
  microwave?: boolean
  washingMachine?: boolean
  fridge?: boolean
  tv?: boolean
  stoneware?: boolean
  
  // Content
  description?: string
  
  // Relationships
  agent?: {
    id: number
    name: string
  }
}

// Type guard to check if an object is a PropertyListing
export function isPropertyListing(obj: unknown): obj is PropertyListing {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    ('propertyId' in obj || 'listingId' in obj)
  )
}

// Utility function to convert database listing to PropertyListing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertDbListingToPropertyListing(dbListing: any): PropertyListing {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
  return {
    propertyId: dbListing.propertyId ? Number(dbListing.propertyId) : undefined,
    listingId: dbListing.listingId ? Number(dbListing.listingId) : undefined,
    propertyType: dbListing.propertyType ?? undefined,
    propertySubtype: dbListing.propertySubtype ?? undefined,
    listingType: dbListing.listingType ?? undefined,
    price: dbListing.price ?? undefined,
    cadastralReference: dbListing.cadastralReference ?? undefined,
    isBankOwned: dbListing.isBankOwned ?? undefined,
    isFeatured: dbListing.isFeatured ?? undefined,
    newConstruction: dbListing.newConstruction ?? undefined,
    bedrooms: dbListing.bedrooms ?? undefined,
    bathrooms: dbListing.bathrooms ?? undefined,
    squareMeter: dbListing.squareMeter ?? undefined,
    builtSurfaceArea: dbListing.builtSurfaceArea ?? undefined,
    yearBuilt: dbListing.yearBuilt ?? undefined,
    lastRenovationYear: dbListing.lastRenovationYear ?? undefined,
    buildingFloors: dbListing.buildingFloors ?? undefined,
    conservationStatus: dbListing.conservationStatus ?? undefined,
    street: dbListing.street ?? undefined,
    addressDetails: dbListing.addressDetails ?? undefined,
    postalCode: dbListing.postalCode ?? undefined,
    neighborhood: dbListing.neighborhood ?? undefined,
    city: dbListing.city ?? undefined,
    province: dbListing.province ?? undefined,
    municipality: dbListing.municipality ?? undefined,
    hasElevator: dbListing.hasElevator ?? undefined,
    hasGarage: dbListing.hasGarage ?? undefined,
    garageType: dbListing.garageType ?? undefined,
    garageSpaces: dbListing.garageSpaces ?? undefined,
    garageInBuilding: dbListing.garageInBuilding ?? undefined,
    garageNumber: dbListing.garageNumber ?? undefined,
    optionalGaragePrice: dbListing.optionalGaragePrice ?? undefined,
    hasStorageRoom: dbListing.hasStorageRoom ?? undefined,
    storageRoomSize: dbListing.storageRoomSize ?? undefined,
    storageRoomNumber: dbListing.storageRoomNumber ?? undefined,
    optionalStorageRoomPrice: dbListing.optionalStorageRoomPrice ?? undefined,
    hasHeating: dbListing.hasHeating ?? undefined,
    heatingType: dbListing.heatingType ?? undefined,
    hotWaterType: dbListing.hotWaterType ?? undefined,
    airConditioningType: dbListing.airConditioningType ?? undefined,
    isFurnished: dbListing.isFurnished ?? undefined,
    furnitureQuality: dbListing.furnitureQuality ?? undefined,
    studentFriendly: dbListing.studentFriendly ?? undefined,
    petsAllowed: dbListing.petsAllowed ?? undefined,
    appliancesIncluded: dbListing.appliancesIncluded ?? undefined,
    exterior: dbListing.exterior ?? undefined,
    orientation: dbListing.orientation ?? undefined,
    bright: dbListing.bright ?? undefined,
    disabledAccessible: dbListing.disabledAccessible ?? undefined,
    vpo: dbListing.vpo ?? undefined,
    videoIntercom: dbListing.videoIntercom ?? undefined,
    conciergeService: dbListing.conciergeService ?? undefined,
    securityGuard: dbListing.securityGuard ?? undefined,
    satelliteDish: dbListing.satelliteDish ?? undefined,
    doubleGlazing: dbListing.doubleGlazing ?? undefined,
    alarm: dbListing.alarm ?? undefined,
    securityDoor: dbListing.securityDoor ?? undefined,
    kitchenType: dbListing.kitchenType ?? undefined,
    openKitchen: dbListing.openKitchen ?? undefined,
    frenchKitchen: dbListing.frenchKitchen ?? undefined,
    furnishedKitchen: dbListing.furnishedKitchen ?? undefined,
    pantry: dbListing.pantry ?? undefined,
    terrace: dbListing.terrace ?? undefined,
    terraceSize: dbListing.terraceSize ?? undefined,
    wineCellar: dbListing.wineCellar ?? undefined,
    wineCellarSize: dbListing.wineCellarSize ?? undefined,
    livingRoomSize: dbListing.livingRoomSize ?? undefined,
    balconyCount: dbListing.balconyCount ?? undefined,
    galleryCount: dbListing.galleryCount ?? undefined,
    builtInWardrobes: dbListing.builtInWardrobes ?? undefined,
    mainFloorType: dbListing.mainFloorType ?? undefined,
    shutterType: dbListing.shutterType ?? undefined,
    carpentryType: dbListing.carpentryType ?? undefined,
    windowType: dbListing.windowType ?? undefined,
    views: dbListing.views ?? undefined,
    mountainViews: dbListing.mountainViews ?? undefined,
    seaViews: dbListing.seaViews ?? undefined,
    beachfront: dbListing.beachfront ?? undefined,
    jacuzzi: dbListing.jacuzzi ?? undefined,
    hydromassage: dbListing.hydromassage ?? undefined,
    garden: dbListing.garden ?? undefined,
    pool: dbListing.pool ?? undefined,
    homeAutomation: dbListing.homeAutomation ?? undefined,
    musicSystem: dbListing.musicSystem ?? undefined,
    laundryRoom: dbListing.laundryRoom ?? undefined,
    coveredClothesline: dbListing.coveredClothesline ?? undefined,
    fireplace: dbListing.fireplace ?? undefined,
    gym: dbListing.gym ?? undefined,
    sportsArea: dbListing.sportsArea ?? undefined,
    childrenArea: dbListing.childrenArea ?? undefined,
    suiteBathroom: dbListing.suiteBathroom ?? undefined,
    nearbyPublicTransport: dbListing.nearbyPublicTransport ?? undefined,
    communityPool: dbListing.communityPool ?? undefined,
    privatePool: dbListing.privatePool ?? undefined,
    tennisCourt: dbListing.tennisCourt ?? undefined,
    internet: dbListing.internet ?? undefined,
    oven: dbListing.oven ?? undefined,
    microwave: dbListing.microwave ?? undefined,
    washingMachine: dbListing.washingMachine ?? undefined,
    fridge: dbListing.fridge ?? undefined,
    tv: dbListing.tv ?? undefined,
    stoneware: dbListing.stoneware ?? undefined,
    description: dbListing.description ?? undefined,
    agent: dbListing.agent ? {
      id: Number(dbListing.agent.id),
      name: `${dbListing.agent.firstName} ${dbListing.agent.lastName}`
    } : undefined
  }
} 