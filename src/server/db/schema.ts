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
  time,
} from "drizzle-orm/singlestore-core";

// Accounts table (CRM organization/tenant - top level entity)
export const accounts = singlestoreTable("accounts", {
  accountId: bigint("account_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  shortName: varchar("short_name", { length: 50 }), // Abbreviated company names
  legalName: varchar("legal_name", { length: 255 }), // Full legal company name
  logo: varchar("logo", { length: 2048 }), // S3 URL for organization logo
  address: varchar("address", { length: 500 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  // Legal information fields
  taxId: varchar("tax_id", { length: 50 }), // Tax identification number (CIF/NIF)
  registryDetails: text("registry_details"), // Commercial registry information
  legalEmail: varchar("legal_email", { length: 255 }), // Legal contact email address
  jurisdiction: varchar("jurisdiction", { length: 255 }), // Legal jurisdiction and applicable courts
  privacyEmail: varchar("privacy_email", { length: 255 }), // Privacy/GDPR contact email address
  dpoEmail: varchar("dpo_email", { length: 255 }), // Data Protection Officer email address
  // Settings JSON fields for flexible configuration
  portalSettings: json("portal_settings").default({}), // Fotocasa, Idealista, etc.
  paymentSettings: json("payment_settings").default({}), // Stripe, PayPal, etc.
  preferences: json("preferences").default({}), // General account preferences
  // Subscription/billing info
  plan: varchar("plan", { length: 50 }).default("basic"), // basic, pro, enterprise
  subscriptionType: varchar("subscription_type", { length: 100 }), // More detailed subscription type
  subscriptionStatus: varchar("subscription_status", { length: 20 }).default(
    "active",
  ),
  subscriptionStartDate: timestamp("subscription_start_date"), // Subscription start date
  subscriptionEndDate: timestamp("subscription_end_date"), // Subscription end date
  status: varchar("status", { length: 20 }).default("active"), // active/inactive/suspended
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// Offices table (for accounts with multiple offices)
export const offices = singlestoreTable("offices", {
  officeId: bigint("office_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  name: varchar("name", { length: 100 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// Users table (Enhanced for BetterAuth compatibility)
export const users = singlestoreTable("users", {
  // BetterAuth required fields (with exact names it expects)
  id: varchar("id", { length: 36 }).primaryKey(), // BetterAuth expects string id
  name: varchar("name", { length: 200 }).notNull(), // BetterAuth expects 'name' field
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: boolean("email_verified").default(false),
  emailVerifiedAt: timestamp("email_verified_at"),
  image: varchar("image", { length: 255 }), // BetterAuth expects 'image' not 'profileImageUrl'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  password: varchar("password", { length: 255 }),

  // Your additional fields
  accountId: bigint("account_id", { mode: "bigint" }), // FK → accounts.account_id (nullable for social login)
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  language: varchar("language", { length: 10 }).default("en"),
  preferences: json("preferences").default({}),
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
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id (BetterAuth compatible)
  roleId: bigint("role_id", { mode: "bigint" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// BetterAuth tables for authentication
export const sessions = singlestoreTable("sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: varchar("user_id", { length: 36 }).notNull(), // Changed to varchar to match users.id
});

// OAuth provider accounts linked to users
export const authAccounts = singlestoreTable("account", {
  id: varchar("id", { length: 36 }).primaryKey(),
  accountId: text("account_id").notNull(), // OAuth provider account ID
  providerId: text("provider_id").notNull(), // e.g., "google", "apple", "linkedin"
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"), // For email/password auth
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const verificationTokens = singlestoreTable("verification_tokens", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
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
  neighborhoodClean: varchar("neighborhood_clean", { length: 100 }),
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

  // Account for multi-tenant security
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id

  // Basic Information
  referenceNumber: varchar("reference_number", { length: 32 }),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  propertyType: varchar("property_type", { length: 20 }).default("piso"), // 'piso' | 'casa' | 'local' | 'garaje' | 'solar'
  propertySubtype: varchar("property_subtype", { length: 50 }), // For piso: 'Piso' | 'Apartment' | 'Ground floor' // For casa: 'Casa' // For local: 'Otros' | 'Offices' // For garaje: 'Individual' // For solar: 'Suelo residencial'
  formPosition: int("form_position").notNull().default(1),

  // Property Specifications
  bedrooms: smallint("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  squareMeter: int("square_meter"),
  yearBuilt: smallint("year_built"),
  cadastralReference: varchar("cadastral_reference", { length: 255 }),
  builtSurfaceArea: decimal("built_surface_area", { precision: 10, scale: 2 }),
  conservationStatus: smallint("conservation_status").default(1), // 1='Buen estado' | 2='A reformar' | 3='Casi nuevo' | 4='Para reformar' | 6='Reformado'

  // Location Information
  street: varchar("street", { length: 255 }),
  addressDetails: varchar("address_details", { length: 255 }),
  postalCode: varchar("postal_code", { length: 20 }),
  neighborhoodId: bigint("neighborhood_id", { mode: "bigint" }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),

  // Energy and Heating
  energyCertification: text("energy_certification"),
  energyCertificateStatus: varchar("energy_certificate_status", { length: 20 }), // 'disponible' | 'en_tramite' | 'pendiente' | 'no_indicado' | 'exento'
  energyConsumptionScale: varchar("energy_consumption_scale", { length: 2 }), // 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' (A=most efficient, G=least efficient)
  energyConsumptionValue: decimal("energy_consumption_value", {
    precision: 6,
    scale: 2,
  }), // kWh/m² año
  emissionsScale: varchar("emissions_scale", { length: 2 }), // 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' (A=lowest emissions, G=highest emissions)
  emissionsValue: decimal("emissions_value", { precision: 6, scale: 2 }), // kg CO2/m² año
  hasHeating: boolean("has_heating").default(false),
  heatingType: varchar("heating_type", { length: 50 }), // 'Gas natural' | 'Calefacción central' | 'Eléctrica' | 'gas' | 'induccion' | 'vitroceramica' | 'carbon' | 'electrico' | 'mixto'

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
  kitchenType: varchar("kitchen_type", { length: 50 }), // 'gas' | 'induccion' | 'vitroceramica' | 'carbon' | 'electrico' | 'mixto'
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
  builtInWardrobes: boolean("built_in_wardrobes").default(false),
  mainFloorType: varchar("main_floor_type", { length: 50 }), // Floor material type (parquet, ceramic, marble, etc.)
  shutterType: varchar("shutter_type", { length: 50 }),
  carpentryType: varchar("carpentry_type", { length: 50 }),
  orientation: varchar("orientation", { length: 50 }), // 'norte' | 'noreste' | 'este' | 'sureste' | 'sur' | 'suroeste' | 'oeste' | 'noroeste'
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

  // Data Processing Fields
  scrapedText: varchar("scraped_text", { length: 1024 }), // S3 path for property scraped text data
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

  // Account for multi-tenant security
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id

  // Basic Information
  propertyId: bigint("property_id", { mode: "bigint" }).notNull(), // FK → properties.property_id
  agentId: varchar("agent_id", { length: 36 }).notNull(), // FK → users.user_id (agent) - Changed to varchar to match users.id
  listingType: varchar("listing_type", { length: 20 }).notNull(), // 'Sale' | 'Rent' | 'Transfer' | 'RentWithOption' | 'RoomSharing'
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'En Venta' | 'En Alquiler' | 'Vendido' | 'Draft'

  // Listing Features
  isFurnished: boolean("is_furnished"),
  furnitureQuality: varchar("furniture_quality", { length: 50 }), // 'basic' | 'standard' | 'high' | 'luxury' (Básico | Estándar | Alta | Lujo)
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
  publishToWebsite: boolean("publish_to_website").default(false), // Controls whether listing appears on company website
  visibilityMode: smallint("visibility_mode").default(1), // 1=Exact location | 2=Street level | 3=Zone/neighborhood level

  // Analytics
  viewCount: int("view_count").default(0),
  inquiryCount: int("inquiry_count").default(0),

  // Portal Publication Fields (Spanish real estate portals)
  fotocasa: boolean("fotocasa").default(false), // Fotocasa.es publication status
  idealista: boolean("idealista").default(false), // Idealista.com publication status
  habitaclia: boolean("habitaclia").default(false), // Habitaclia.com publication status
  pisoscom: boolean("pisoscom").default(false), // Pisos.com publication status
  yaencontre: boolean("yaencontre").default(false), // Yaencontre.com publication status
  milanuncios: boolean("milanuncios").default(false), // Milanuncios.com publication status

  // System Fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Contacts (external people: buyers, sellers, etc.)
export const contacts = singlestoreTable("contacts", {
  contactId: bigint("contact_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  // Account for multi-tenant security
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
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
// Enhanced to replace leads table functionality
export const listingContacts = singlestoreTable("listing_contacts", {
  listingContactId: bigint("listing_contact_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  listingId: bigint("listing_id", { mode: "bigint" }), // FK → listings.listing_id (nullable)
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.contact_id
  contactType: varchar("contact_type", { length: 20 }).notNull(), // "buyer", "owner", "viewer"
  
  // NEW COLUMNS (from leads table):
  prospectId: bigint("prospect_id", { mode: "bigint" }), // FK → prospects.id (nullable)
  source: varchar("source", { length: 50 }), // e.g. "Website", "Walk-In", "Appointment"
  status: varchar("status", { length: 50 }), // Lead status workflow
  
  // Existing columns:
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


// Deals (potential or closed transaction)
export const deals = singlestoreTable("deals", {
  dealId: bigint("deal_id", { mode: "bigint" }).primaryKey().autoincrement(),
  listingId: bigint("listing_id", { mode: "bigint" }).notNull(), // FK → listings.listing_id
  listingContactId: bigint("listing_contact_id", { mode: "bigint" }), // FK → listing_contacts.listing_contact_id (nullable)
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
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id (BetterAuth compatible)
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.contact_id
  listingId: bigint("listing_id", { mode: "bigint" }), // FK → listings.listing_id (nullable)
  listingContactId: bigint("listing_contact_id", { mode: "bigint" }), // FK → listing_contacts.listing_contact_id (nullable)
  dealId: bigint("deal_id", { mode: "bigint" }), // FK → deals.deal_id (nullable)
  prospectId: bigint("prospect_id", { mode: "bigint" }), // FK → prospects.prospect_id (nullable)
  datetimeStart: timestamp("datetime_start").notNull(),
  datetimeEnd: timestamp("datetime_end").notNull(),
  tripTimeMinutes: smallint("trip_time_minutes"), // Travel time in minutes
  status: varchar("status", { length: 20 }).notNull().default("Scheduled"),
  notes: text("notes"),
  type: varchar("type", { length: 50 }),
  // Google Calendar integration fields
  googleEventId: varchar("google_event_id", { length: 255 }), // Google Calendar event ID
  googleEtag: varchar("google_etag", { length: 255 }), // For conflict resolution
  lastSyncedAt: timestamp("last_synced_at"), // Track sync status
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// User Integrations table (for OAuth tokens and sync metadata)
export const userIntegrations = singlestoreTable("user_integrations", {
  integrationId: bigint("integration_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  provider: varchar("provider", { length: 50 }).notNull(), // "google_calendar"
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiryDate: timestamp("expiry_date"),
  calendarId: varchar("calendar_id", { length: 255 }).default("primary"),
  syncToken: text("sync_token"), // For incremental sync
  channelId: varchar("channel_id", { length: 64 }), // Webhook channel ID
  resourceId: varchar("resource_id", { length: 255 }), // Webhook resource ID
  channelExpiration: timestamp("channel_expiration"),
  syncDirection: varchar("sync_direction", { length: 20 }).default("bidirectional"), // "bidirectional", "vesta_to_google", "google_to_vesta", "none"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Tasks
export const tasks = singlestoreTable("tasks", {
  taskId: bigint("task_id", { mode: "bigint" }).primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id (BetterAuth compatible)
  title: varchar("title", { length: 255 }).notNull(), // Task title
  description: text("description").notNull(),
  dueDate: timestamp("due_date"),
  dueTime: time("due_time"),
  completed: boolean("completed").default(false),
  listingId: bigint("listing_id", { mode: "bigint" }), // FK → listings.listing_id (nullable)
  listingContactId: bigint("listing_contact_id", { mode: "bigint" }), // FK → listing_contacts.listing_contact_id (nullable)
  dealId: bigint("deal_id", { mode: "bigint" }), // FK → deals.deal_id (nullable)
  appointmentId: bigint("appointment_id", { mode: "bigint" }), // FK → appointments.appointment_id (nullable)
  prospectId: bigint("prospect_id", { mode: "bigint" }), // FK → prospects.prospect_id (nullable)
  contactId: bigint("contact_id", { mode: "bigint" }), // FK → contacts.contact_id (nullable)
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
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id (who uploaded, BetterAuth compatible)

  // Entity relationships (only one should be set per document)
  propertyId: bigint("property_id", { mode: "bigint" }), // FK → properties.property_id (nullable)
  contactId: bigint("contact_id", { mode: "bigint" }), // FK → contacts.contact_id (nullable)
  listingId: bigint("listing_id", { mode: "bigint" }), // FK → listings.listing_id (nullable)
  listingContactId: bigint("listing_contact_id", { mode: "bigint" }), // FK → listing_contacts.listing_contact_id (nullable)
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

// Prospects table (Enhanced for dual-type prospect system)
export const prospects = singlestoreTable("prospects", {
  id: bigint("prospect_id", { mode: "bigint" }).primaryKey().autoincrement(),
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.id
  status: varchar("status", { length: 50 }).notNull(), // ENUM equivalent - index this
  listingType: varchar("listing_type", { length: 20 }), // ENUM('Sale', 'Rent') - type of listing they're looking for

  // Dual-type discriminator field
  prospectType: varchar("prospect_type", { length: 20 })
    .notNull()
    .default("search"), // 'search' | 'listing'

  // Search prospect fields (existing - for people looking FOR properties)
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

  // Listing prospect fields (new - for people wanting to LIST properties)
  // NOTE: These fields are commented out because they don't exist in the database yet
  // propertyToList: json("property_to_list"), // { address, propertyType, estimatedValue, condition, readyToList }
  // valuationStatus: varchar("valuation_status", { length: 50 }), // 'pending' | 'scheduled' | 'completed'
  // listingAgreementStatus: varchar("listing_agreement_status", { length: 50 }), // 'not_started' | 'in_progress' | 'signed'

  // Common fields
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
  changedBy: varchar("changed_by", { length: 36 }).notNull(), // FK → users.id (BetterAuth compatible)
  changeReason: text("change_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Testimonials table
export const testimonials = singlestoreTable("testimonials", {
  testimonialId: bigint("testimonial_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  content: text("content").notNull(),
  avatar: varchar("avatar", { length: 1024 }),
  rating: smallint("rating").notNull().default(5),
  isVerified: boolean("is_verified").default(true),
  sortOrder: int("sort_order").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Website configuration table
export const websiteProperties = singlestoreTable("website_config", {
  id: bigint("id", { mode: "bigint" }).primaryKey().autoincrement(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull().unique(), // FK → accounts.account_id
  socialLinks: text("social_links").notNull(), // JSON containing social media links
  seoProps: text("seo_props").notNull(), // JSON containing SEO properties
  logo: varchar("logo", { length: 1024 }).notNull(), // URL to logo file
  logotype: varchar("logotype", { length: 1024 }).notNull(), // URL to logotype file
  favicon: varchar("favicon", { length: 1024 }).notNull(), // URL to favicon file
  heroProps: text("hero_props").notNull(), // JSON containing hero section properties
  featuredProps: text("featured_props").notNull(), // JSON containing featured section properties
  aboutProps: text("about_props").notNull(), // JSON containing about section properties
  propertiesProps: text("properties_props").notNull(), // JSON containing properties section configuration
  testimonialProps: text("testimonial_props").notNull(), // JSON containing testimonial section properties
  contactProps: text("contact_props"), // JSON containing contact section properties
  footerProps: text("footer_props").notNull(), // JSON containing footer configuration
  headProps: text("head_props").notNull(), // JSON containing head section properties
  watermarkProps: text("watermark_props").notNull().default('{}'), // JSON containing watermark configuration
  metadata: text("metadata"), // JSON containing metadata configuration
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Comments table
export const comments = singlestoreTable("comments", {
  commentId: bigint("comment_id", { mode: "bigint" }).primaryKey().autoincrement(),
  listingId: bigint("listing_id", { mode: "bigint" }).notNull(), // FK → listings.listing_id
  propertyId: bigint("property_id", { mode: "bigint" }).notNull(), // FK → properties.property_id
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  content: text("content").notNull(),
  parentId: bigint("parent_id", { mode: "bigint" }), // Self-reference for replies
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// User Comments table (Contact-based comments)
export const userComments = singlestoreTable("user_comments", {
  commentId: bigint("comment_id", { mode: "bigint" }).primaryKey().autoincrement(),
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.contact_id
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  content: text("content").notNull(),
  parentId: bigint("parent_id", { mode: "bigint" }), // Self-reference for replies
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Cartel Configurations table
export const cartelConfigurations = singlestoreTable("cartel_configurations", {
  id: bigint("id", { mode: "bigint" }).primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 36 }), // FK → users.id (nullable)
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  propertyId: bigint("property_id", { mode: "bigint" }), // FK → properties.property_id (nullable)
  name: varchar("name", { length: 255 }).notNull(),
  templateConfig: json("template_config").notNull(),
  propertyOverrides: json("property_overrides").default("{}"),
  selectedContacts: json("selected_contacts").default("{}"),
  selectedImageIndices: json("selected_image_indices").default("[]"),
  isDefault: boolean("is_default").default(false),
  isGlobal: boolean("is_global").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Feedback table
export const feedback = singlestoreTable("feedback", {
  feedbackId: bigint("feedback_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  feedbackComment: text("feedback_comment").notNull(),
  scale: smallint("scale").notNull(), // 1-4 scale rating
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Account-specific roles table
export const accountRoles = singlestoreTable("account_roles", {
  accountRoleId: bigint("account_role_id", { mode: "bigint" }).primaryKey().autoincrement(),
  roleId: bigint("role_id", { mode: "bigint" }).notNull(), // References the role type (1=Agente, 2=Superadmin, 3=Admin de Cuenta)
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  permissions: json("permissions").notNull().default({}), // JSON with all permissions for this role in this account
  isSystem: boolean("is_system").default(false), // True for default roles that shouldn't be deleted
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  isActive: boolean("is_active").default(true),
});
