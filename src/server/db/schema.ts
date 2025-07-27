import {
  bigint,
  varchar,
  timestamp,
  boolean,
  singlestoreTable,
  json,
  text,
  decimal,
  smallint,
  int,
} from "drizzle-orm/singlestore-core";

// Users table
export const users = singlestoreTable("users", {
  userId: bigint("user_id", { mode: "bigint" }).primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  profileImageUrl: varchar("profile_image_url", { length: 255 }),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  language: varchar("language", { length: 10 }).default("en"),
  preferences: json("preferences").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  lastLogin: timestamp("last_login"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
});

// Roles table
export const roles = singlestoreTable("roles", {
  roleId: bigint("role_id", { mode: "bigint" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 50 }).notNull(),
  description: varchar("description", { length: 255 }),
  permissions: json("permissions").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// UserRoles junction table (Many-to-Many relationship between users and roles)
export const userRoles = singlestoreTable("user_roles", {
  userRoleId: bigint("user_role_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  userId: bigint("user_id", { mode: "bigint" }).notNull(),
  roleId: bigint("role_id", { mode: "bigint" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// Locations table
export const locations = singlestoreTable("locations", {
  neighborhoodId: bigint("neighborhood_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  city: varchar("city", { length: 100 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  municipality: varchar("municipality", { length: 100 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// Properties table
export const properties = singlestoreTable("properties", {
  // Primary Key
  propertyId: bigint("property_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),

  // Basic Information
  referenceNumber: varchar("reference_number", { length: 32 }),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  propertyType: varchar("property_type", { length: 20 }).default("piso"),
  propertySubtype: varchar("property_subtype", { length: 50 }),
  formPosition: int("form_position").notNull().default(1),

  // Property Specifications
  bedrooms: smallint("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  squareMeter: int("square_meter"),
  yearBuilt: smallint("year_built"),
  cadastralReference: varchar("cadastral_reference", { length: 255 }),
  builtSurfaceArea: decimal("built_surface_area", { precision: 10, scale: 2 }),
  conservationStatus: smallint("conservation_status").default(1), // 1=Good, 2=Pretty good, 3=Almost new, 4=Needs renovation, 6=Renovated

  // Location Information
  street: varchar("street", { length: 255 }),
  addressDetails: varchar("address_details", { length: 255 }),
  postalCode: varchar("postal_code", { length: 20 }),
  neighborhoodId: bigint("neighborhood_id", { mode: "bigint" }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),

  // Energy and Heating
  energyCertification: text("energy_certification"),
  energyCertificateStatus: varchar("energy_certificate_status", { length: 20 }), // 'uploaded', 'en_tramite', 'exento'
  energyConsumptionScale: varchar("energy_consumption_scale", { length: 2 }), // A-G
  energyConsumptionValue: decimal("energy_consumption_value", {
    precision: 6,
    scale: 2,
  }), // kWh/m² año
  emissionsScale: varchar("emissions_scale", { length: 2 }), // A-G
  emissionsValue: decimal("emissions_value", { precision: 6, scale: 2 }), // kg CO2/m² año
  hasHeating: boolean("has_heating").default(false),
  heatingType: varchar("heating_type", { length: 50 }),

  // Basic Amenities
  hasElevator: boolean("has_elevator").default(false),
  hasGarage: boolean("has_garage").default(false),
  hasStorageRoom: boolean("has_storage_room").default(false),

  // System Fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  isActive: boolean("is_active").default(true),

  // Property Features
  garageType: varchar("garage_type", { length: 50 }),
  garageSpaces: smallint("garage_spaces"),
  garageInBuilding: boolean("garage_in_building"),
  elevatorToGarage: boolean("elevator_to_garage"),
  garageNumber: varchar("garage_number", { length: 20 }),

  // Community and Recreational Amenities
  gym: boolean("gym").default(false),
  sportsArea: boolean("sports_area").default(false),
  childrenArea: boolean("children_area").default(false),
  suiteBathroom: boolean("suite_bathroom").default(false),
  nearbyPublicTransport: boolean("nearby_public_transport").default(false),
  communityPool: boolean("community_pool").default(false),
  privatePool: boolean("private_pool").default(false),
  tennisCourt: boolean("tennis_court").default(false),

  // Property Characteristics
  disabledAccessible: boolean("disabled_accessible"),
  vpo: boolean("vpo"),
  videoIntercom: boolean("video_intercom"),
  conciergeService: boolean("concierge_service"),
  securityGuard: boolean("security_guard"),
  satelliteDish: boolean("satellite_dish"),
  doubleGlazing: boolean("double_glazing"),
  alarm: boolean("alarm"),
  securityDoor: boolean("security_door"),

  // Property Condition
  brandNew: boolean("brand_new"),
  newConstruction: boolean("new_construction"),
  underConstruction: boolean("under_construction"),
  needsRenovation: boolean("needs_renovation"),
  lastRenovationYear: smallint("last_renovation_year"),

  // Kitchen Features
  kitchenType: varchar("kitchen_type", { length: 50 }),
  hotWaterType: varchar("hot_water_type", { length: 50 }),
  openKitchen: boolean("open_kitchen"),
  frenchKitchen: boolean("french_kitchen"),
  furnishedKitchen: boolean("furnished_kitchen"),
  pantry: boolean("pantry"),

  // Storage and Additional Spaces
  storageRoomSize: int("storage_room_size"),
  storageRoomNumber: varchar("storage_room_number", { length: 20 }),
  terrace: boolean("terrace"),
  terraceSize: int("terrace_size"),
  wineCellar: boolean("wine_cellar"),
  wineCellarSize: int("wine_cellar_size"),
  livingRoomSize: int("living_room_size"),
  balconyCount: smallint("balcony_count"),
  galleryCount: smallint("gallery_count"),
  buildingFloors: smallint("building_floors"),

  // Interior Features
  builtInWardrobes: varchar("built_in_wardrobes", { length: 50 }),
  mainFloorType: varchar("main_floor_type", { length: 50 }),
  shutterType: varchar("shutter_type", { length: 50 }),
  carpentryType: varchar("carpentry_type", { length: 50 }),
  orientation: varchar("orientation", { length: 50 }),
  airConditioningType: varchar("air_conditioning_type", { length: 50 }),
  windowType: varchar("window_type", { length: 50 }),

  // Views and Location Features
  exterior: boolean("exterior"),
  bright: boolean("bright"),
  views: boolean("views"),
  mountainViews: boolean("mountain_views"),
  seaViews: boolean("sea_views"),
  beachfront: boolean("beachfront"),

  // Luxury Amenities
  jacuzzi: boolean("jacuzzi"),
  hydromassage: boolean("hydromassage"),
  garden: boolean("garden"),
  pool: boolean("pool"),
  homeAutomation: boolean("home_automation"),
  musicSystem: boolean("music_system"),
  laundryRoom: boolean("laundry_room"),
  coveredClothesline: boolean("covered_clothesline"),
  fireplace: boolean("fireplace"),
});

export const propertyImages = singlestoreTable("property_images", {
  propertyImageId: bigint("property_image_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  propertyId: bigint("property_id", { mode: "bigint" }).notNull(),
  referenceNumber: varchar("reference_number", { length: 32 }).notNull(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  imageKey: varchar("image_key", { length: 2048 }).notNull(),
  imageTag: varchar("image_tag", { length: 255 }),
  s3key: varchar("s3key", { length: 2048 }).notNull(),
  imageOrder: int("image_order").default(0).notNull(),
});

export const listings = singlestoreTable("listings", {
  // Primary Key
  listingId: bigint("listing_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),

  // Basic Information
  propertyId: bigint("property_id", { mode: "bigint" }).notNull(), // FK → properties.property_id
  agentId: bigint("agent_id", { mode: "bigint" }).notNull(), // FK → users.user_id (agent)
  listingType: varchar("listing_type", { length: 20 }).notNull(), // e.g. "Sale" or "Rent"
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // e.g. "En Venta", "En Alquiler", "Vendido"

  // Listing Features
  isFurnished: boolean("is_furnished"),
  furnitureQuality: varchar("furniture_quality", { length: 50 }),
  optionalGarage: boolean("optional_garage"),
  optionalGaragePrice: decimal("optional_garage_price", {
    precision: 12,
    scale: 2,
  }),
  optionalStorageRoom: boolean("optional_storage_room")
    .notNull()
    .default(false),
  optionalStorageRoomPrice: decimal("optional_storage_room_price", {
    precision: 12,
    scale: 2,
  }),
  hasKeys: boolean("has_keys").notNull().default(false),
  studentFriendly: boolean("student_friendly"),
  petsAllowed: boolean("pets_allowed"),
  appliancesIncluded: boolean("appliances_included"),

  // Appliances and Amenities
  internet: boolean("internet").default(false),
  oven: boolean("oven").default(false),
  microwave: boolean("microwave").default(false),
  washingMachine: boolean("washing_machine").default(false),
  fridge: boolean("fridge").default(false),
  tv: boolean("tv").default(false),
  stoneware: boolean("stoneware").default(false),

  // Listing Status and Visibility
  isFeatured: boolean("is_featured").default(false),
  isBankOwned: boolean("is_bank_owned").default(false),
  isActive: boolean("is_active").default(true),
  visibilityMode: smallint("visibility_mode").default(1), // 1=Exact, 2=Street, 3=Zone

  // Analytics
  viewCount: int("view_count").default(0),
  inquiryCount: int("inquiry_count").default(0),

  // Portal Publication Fields
  fotocasa: boolean("fotocasa").default(false),
  idealista: boolean("idealista").default(false),
  habitaclia: boolean("habitaclia").default(false),
  pisoscom: boolean("pisoscom").default(false),
  yaencontre: boolean("yaencontre").default(false),
  milanuncios: boolean("milanuncios").default(false),

  // System Fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Contacts (external people: buyers, sellers, etc.)
export const contacts = singlestoreTable("contacts", {
  contactId: bigint("contact_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  additionalInfo: json("additional_info").default({}),
  orgId: bigint("org_id", { mode: "bigint" }), // Nullable FK to organizations
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Listing Contact junction table (Many-to-Many relationship between listings and contacts)
export const listingContacts = singlestoreTable("listing_contacts", {
  listingContactId: bigint("listing_contact_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  listingId: bigint("listing_id", { mode: "bigint" }).notNull(), // FK → listings.listing_id
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.contact_id
  contactType: varchar("contact_type", { length: 20 }).notNull(), // e.g. "buyer", "owner", "viewer"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// Organizations (companies, law firms, banks)
export const organizations = singlestoreTable("organizations", {
  orgId: bigint("org_id", { mode: "bigint" }).primaryKey().autoincrement(),
  orgName: varchar("org_name", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }),
});

// Leads (inbound interest for a listing)
export const leads = singlestoreTable("leads", {
  leadId: bigint("lead_id", { mode: "bigint" }).primaryKey().autoincrement(),
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.contact_id
  listingId: bigint("listing_id", { mode: "bigint" }), // FK → listings.listing_id (nullable)
  source: varchar("source", { length: 50 }).notNull(), // e.g. "Website", "Walk-In"
  status: varchar("status", { length: 20 }).notNull(), // e.g. "New", "Working", "Converted", "Disqualified"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Deals (potential or closed transaction)
export const deals = singlestoreTable("deals", {
  dealId: bigint("deal_id", { mode: "bigint" }).primaryKey().autoincrement(),
  listingId: bigint("listing_id", { mode: "bigint" }).notNull(), // FK → listings.listing_id
  status: varchar("stage", { length: 20 }).notNull(), // e.g. "Offer", "UnderContract", "Closed", "Lost"
  closeDate: timestamp("close_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Deal Participants (people involved in a deal)
export const dealParticipants = singlestoreTable("deal_participants", {
  dealId: bigint("deal_id", { mode: "bigint" }).notNull(), // FK → deals.deal_id
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.contact_id
  role: varchar("role", { length: 50 }).notNull(), // e.g. "Buyer", "Seller", "Lawyer"
});

// Appointments table
export const appointments = singlestoreTable("appointments", {
  appointmentId: bigint("appointment_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  userId: bigint("user_id", { mode: "bigint" }).notNull(), // FK → users.user_id
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.contact_id
  listingId: bigint("listing_id", { mode: "bigint" }), // FK → listings.listing_id (nullable)
  leadId: bigint("lead_id", { mode: "bigint" }), // FK → leads.lead_id (nullable)
  dealId: bigint("deal_id", { mode: "bigint" }), // FK → deals.deal_id (nullable)
  prospectId: bigint("prospect_id", { mode: "bigint" }), // FK → prospects.prospect_id (nullable)
  datetimeStart: timestamp("datetime_start").notNull(),
  datetimeEnd: timestamp("datetime_end").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("Scheduled"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Tasks
export const tasks = singlestoreTable("tasks", {
  taskId: bigint("task_id", { mode: "bigint" }).primaryKey().autoincrement(),
  userId: bigint("user_id", { mode: "bigint" }).notNull(), // FK → users.user_id
  description: text("description").notNull(),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false),
  listingId: bigint("listing_id", { mode: "bigint" }), // FK → listings.listing_id (nullable)
  leadId: bigint("lead_id", { mode: "bigint" }), // FK → leads.lead_id (nullable)
  dealId: bigint("deal_id", { mode: "bigint" }), // FK → deals.deal_id (nullable)
  appointmentId: bigint("appointment_id", { mode: "bigint" }), // FK → appointments.appointment_id (nullable)
  prospectId: bigint("prospect_id", { mode: "bigint" }), // FK → prospects.prospect_id (nullable)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Documents table
export const documents = singlestoreTable("documents", {
  docId: bigint("doc_id", { mode: "bigint" }).primaryKey().autoincrement(),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(), // e.g. "PDF", "DOC", "Image"
  fileUrl: varchar("file_url", { length: 2048 }).notNull(), // Public S3 URL
  userId: bigint("user_id", { mode: "bigint" }).notNull(), // FK → users.user_id (who uploaded)

  // Entity relationships (only one should be set per document)
  propertyId: bigint("property_id", { mode: "bigint" }), // FK → properties.property_id (nullable)
  contactId: bigint("contact_id", { mode: "bigint" }), // FK → contacts.contact_id (nullable)
  listingId: bigint("listing_id", { mode: "bigint" }), // FK → listings.listing_id (nullable)
  leadId: bigint("lead_id", { mode: "bigint" }), // FK → leads.lead_id (nullable)
  dealId: bigint("deal_id", { mode: "bigint" }), // FK → deals.deal_id (nullable)
  appointmentId: bigint("appointment_id", { mode: "bigint" }), // FK → appointments.appointment_id (nullable)
  prospectId: bigint("prospect_id", { mode: "bigint" }), // FK → prospects.prospect_id (nullable)

  // AWS S3 fields (similar to property_images)
  documentKey: varchar("document_key", { length: 2048 }).notNull(), // S3 object key for operations
  s3key: varchar("s3key", { length: 2048 }).notNull(), // S3 storage key
  documentTag: varchar("document_tag", { length: 255 }), // Category/type tag (e.g., "contract", "ID", "deed")
  documentOrder: int("document_order").default(0).notNull(), // Display order within entity

  // System fields
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Prospects table
export const prospects = singlestoreTable("prospects", {
  id: bigint("prospect_id", { mode: "bigint" }).primaryKey().autoincrement(),
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.id
  status: varchar("status", { length: 50 }).notNull(), // ENUM equivalent - index this
  listingType: varchar("listing_type", { length: 20 }), // ENUM('Sale', 'Rent') - type of listing they're looking for
  propertyType: varchar("property_type", { length: 20 }), // ENUM('piso','casa','garaje','local','terreno')
  minPrice: decimal("min_price", { precision: 12, scale: 2 }),
  maxPrice: decimal("max_price", { precision: 12, scale: 2 }),
  preferredAreas: json("preferred_areas"), // Array of neighborhood objects: [{"neighborhoodId": 1, "name": "Salamanca"}, {"neighborhoodId": 2, "name": "Retiro"}]
  minBedrooms: smallint("min_bedrooms"), // 0-10 is enough
  minBathrooms: smallint("min_bathrooms"), // Same
  minSquareMeters: int("min_square_meters"),
  maxSquareMeters: int("max_square_meters"),
  moveInBy: timestamp("move_in_by"), // Desired move-in date; leave NULL if "when something comes up"
  extras: json("extras"), // { "ascensor": true, "terraza": true, "garaje": false }
  urgencyLevel: smallint("urgency_level"), // 1-5 - homemade lead-scoring
  fundingReady: boolean("funding_ready"), // Has mortgage/pre-approval?
  notesInternal: text("notes_internal"), // Everything the client shouldn't see
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Prospect History table to track status changes
export const prospectHistory = singlestoreTable("prospect_history", {
  historyId: bigint("history_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  prospectId: bigint("prospect_id", { mode: "bigint" }).notNull(),
  previousStatus: varchar("previous_status", { length: 50 }),
  newStatus: varchar("new_status", { length: 50 }).notNull(),
  changedBy: bigint("changed_by", { mode: "bigint" }).notNull(), // FK → users.user_id
  changeReason: text("change_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
