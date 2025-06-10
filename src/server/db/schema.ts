import { 
  bigint, 
  varchar, 
  timestamp, 
  boolean,
  singlestoreTable,
  json,
  index,
  uniqueIndex,
  text,
  decimal,
  smallint,
  int
} from "drizzle-orm/singlestore-core";

// Users table
export const users = singlestoreTable("users", {
  userId: bigint("user_id", { mode: "bigint" }).primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  profileImageUrl: varchar("profile_image_url", { length: 255 }),
  timezone: varchar("timezone", { length: 50 }).default('UTC'),
  language: varchar("language", { length: 10 }).default('en'),
  preferences: json("preferences").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  lastLogin: timestamp("last_login"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  emailIdx: uniqueIndex("email_idx").on(table.email),
  statusIdx: index("status_idx").on(table.isActive, table.isVerified),
}));

// Roles table
export const roles = singlestoreTable("roles", {
  roleId: bigint("role_id", { mode: "bigint" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 50 }).notNull(),
  description: varchar("description", { length: 255 }),
  permissions: json("permissions").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  nameIdx: uniqueIndex("name_idx").on(table.name),
  activeNameIdx: index("active_name_idx").on(table.isActive, table.name),
}));

// UserRoles junction table (Many-to-Many relationship between users and roles)
export const userRoles = singlestoreTable("user_roles", {
  userRoleId: bigint("user_role_id", { mode: "bigint" }).primaryKey().autoincrement(),
  userId: bigint("user_id", { mode: "bigint" }).notNull(),
  roleId: bigint("role_id", { mode: "bigint" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  userRoleIdx: uniqueIndex("user_role_idx").on(table.userId, table.roleId),
}));

// Locations table
export const locations = singlestoreTable("locations", {
  neighborhoodId: varchar("neighborhood_id", { length: 50 }).primaryKey(),
  city: varchar("city", { length: 100 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  municipality: varchar("municipality", { length: 100 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  cityIdx: index("idx_locations_city").on(table.city),
  provinceIdx: index("idx_locations_province").on(table.province),
  municipalityIdx: index("idx_locations_municipality").on(table.municipality),
  neighborhoodIdx: index("idx_locations_neighborhood").on(table.neighborhood),
}));

// Properties table
export const properties = singlestoreTable("properties", {
  // Primary Key
  propertyId: bigint("property_id", { mode: "bigint" }).primaryKey().autoincrement(),

  // Basic Information
  referenceNumber: varchar("reference_number", { length: 20 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  propertyType: varchar("property_type", { length: 20 }).notNull(),

  // Property Specifications
  bedrooms: smallint("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  squareMeter: int("square_meter").notNull(),
  yearBuilt: smallint("year_built"),

  // Location Information
  street: varchar("street", { length: 255 }).notNull(),
  addressDetails: varchar("address_details", { length: 255 }),
  postalCode: varchar("postal_code", { length: 20 }),
  neighborhoodId: varchar("neighborhood_id", { length: 50 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),

  // Energy and Heating
  energyCertification: text("energy_certification"),
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
}, (table) => ({
  // Indexes for common queries
  propertyTypeIdx: index("idx_properties_type").on(table.propertyType),
  neighborhoodIdIdx: index("idx_properties_neighborhood").on(table.neighborhoodId),
  bedroomsIdx: index("idx_properties_bedrooms").on(table.bedrooms),
  squareMeterIdx: index("idx_properties_sqm").on(table.squareMeter),
}));

export const propertyImages = singlestoreTable("property_images", {
  propertyImageId: bigint("property_image_id", { mode: "bigint" }).primaryKey().autoincrement(),
  propertyId: bigint("property_id", { mode: "bigint" }).notNull(),
  referenceNumber: varchar("reference_number", { length: 20 }).notNull(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  imageKey: varchar("image_key", { length: 2048 }).notNull(),
  imageTag: varchar("image_tag", { length: 255 }),
  s3key: varchar("s3key", { length: 2048 }).notNull(),
}, (table) => ({
  propertyImageIdx: index("idx_property_images").on(table.propertyId),
  referenceNumberIdx: index("idx_property_images_reference").on(table.referenceNumber),
}));

export const listings = singlestoreTable("listings", {
  // Primary Key
  listingId: bigint("listing_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),

  // Basic Information
  propertyId: bigint("property_id", { mode: "bigint" }).notNull(),        // FK → properties.property_id
  agentId: bigint("agent_id", { mode: "bigint" }).notNull(),               // FK → users.user_id (agent)
  ownerContactId: bigint("owner_contact_id", { mode: "bigint" }).notNull(),// FK → contacts.contact_id
  listingType: varchar("listing_type", { length: 20 }).notNull(),          // e.g. "Sale" or "Rent"
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),                     // e.g. "Active", "Pending", "Sold"

  // Listing Features
  isFurnished: boolean("is_furnished"),
  furnitureQuality: varchar("furniture_quality", { length: 50 }),
  optionalGarage: boolean("optional_garage"),
  optionalGaragePrice: decimal("optional_garage_price", { precision: 12, scale: 2 }),
  studentFriendly: boolean("student_friendly"),
  petsAllowed: boolean("pets_allowed"),
  appliancesIncluded: boolean("appliances_included"),

  // Listing Status and Visibility
  isFeatured: boolean("is_featured").default(false),
  isBankOwned: boolean("is_bank_owned").default(false),
  isActive: boolean("is_active").default(true),

  // Analytics
  viewCount: int("view_count").default(0),
  inquiryCount: int("inquiry_count").default(0),

  // System Fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  propertyIdx: index("idx_listings_property").on(table.propertyId),
  agentIdx: index("idx_listings_agent").on(table.agentId),
  ownerIdx: index("idx_listings_owner").on(table.ownerContactId),
  statusIdx: index("idx_listings_status").on(table.status),
  featuredIdx: index("idx_listings_featured").on(table.isFeatured),
  priceIdx: index("idx_listings_price").on(table.price),
}));

// Contacts (external people: buyers, sellers, etc.)
export const contacts = singlestoreTable("contacts", {
  contactId: bigint("contact_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  contactType: varchar("contact_type", { length: 20 }).notNull().default('demandante'),
  additionalInfo: json("additional_info").default({}),
  orgId: bigint("org_id", { mode: "bigint" }), // Nullable FK to organizations
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orgIdIdx: index("idx_contacts_org_id").on(table.orgId),
  statusIdx: index("idx_contacts_status").on(table.isActive),
  contactTypeIdx: index("idx_contacts_type").on(table.contactType),
}));

// Organizations (companies, law firms, banks)
export const organizations = singlestoreTable("organizations", {
  orgId: bigint("org_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  orgName: varchar("org_name", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }),
}, (table) => ({
  orgNameIdx: index("idx_organizations_name").on(table.orgName),
  locationIdx: index("idx_organizations_location").on(table.city, table.state, table.country),
}));

// Leads (inbound interest for a listing)
export const leads = singlestoreTable("leads", {
  leadId: bigint("lead_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.contact_id
  listingId: bigint("listing_id", { mode: "bigint" }),            // FK → listings.listing_id (nullable)
  source: varchar("source", { length: 50 }).notNull(),             // e.g. "Website", "Walk-In"
  status: varchar("status", { length: 20 }).notNull(),             // e.g. "New", "Working", "Converted", "Disqualified"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  contactIdx: index("idx_leads_contact").on(table.contactId),
  listingIdx: index("idx_leads_listing").on(table.listingId),
  statusIdx: index("idx_leads_status").on(table.status),
}));

// Deals (potential or closed transaction)
export const deals = singlestoreTable("deals", {
  dealId: bigint("deal_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  listingId: bigint("listing_id", { mode: "bigint" }).notNull(), // FK → listings.listing_id
  status: varchar("stage", { length: 20 }).notNull(),              // e.g. "Offer", "UnderContract", "Closed", "Lost"
  closeDate: timestamp("close_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  listingIdx: index("idx_deals_listing").on(table.listingId),
  statusIdx: index("idx_deals_status").on(table.status),
}));

// Deal Participants (people involved in a deal)
export const dealParticipants = singlestoreTable(
  "deal_participants",
  {
    dealId: bigint("deal_id", { mode: "bigint" }).notNull(),         // FK → deals.deal_id
    contactId: bigint("contact_id", { mode: "bigint" }).notNull(),   // FK → contacts.contact_id
    role: varchar("role", { length: 50 }).notNull(),                // e.g. "Buyer", "Seller", "Lawyer"
  },
  (table) => ({
    // Composite primary key
    pk: { primaryKey: [table.dealId, table.contactId, table.role] },
    dealIdx: index("idx_deal_participants_deal").on(table.dealId),
    contactIdx: index("idx_deal_participants_contact").on(table.contactId),
  })
);

// Appointments table
export const appointments = singlestoreTable("appointments", {
  appointmentId: bigint("appointment_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  userId: bigint("user_id", { mode: "bigint" }).notNull(),         // FK → users.user_id
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(),     // FK → contacts.contact_id
  listingId: bigint("listing_id", { mode: "bigint" }),             // FK → listings.listing_id (nullable)
  leadId: bigint("lead_id", { mode: "bigint" }),                     // FK → leads.lead_id (nullable)
  dealId: bigint("deal_id", { mode: "bigint" }),                     // FK → deals.deal_id (nullable)
  prospectId: bigint("prospect_id", { mode: "bigint" }),             // FK → prospects.prospect_id (nullable)
  datetimeStart: timestamp("datetime_start").notNull(),
  datetimeEnd: timestamp("datetime_end").notNull(),
  status: varchar("status", { length: 20 }).notNull().default('Scheduled'),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("idx_appointments_user").on(table.userId),
  contactIdx: index("idx_appointments_contact").on(table.contactId),
  listingIdx: index("idx_appointments_listing").on(table.listingId),
  leadIdx: index("idx_appointments_lead").on(table.leadId),
  dealIdx: index("idx_appointments_deal").on(table.dealId),
  prospectIdx: index("idx_appointments_prospect").on(table.prospectId),
  statusIdx: index("idx_appointments_status").on(table.status),
  datetimeIdx: index("idx_appointments_datetime").on(table.datetimeStart, table.datetimeEnd),
}));

// Tasks
export const tasks = singlestoreTable("tasks", {
  taskId: bigint("task_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  userId: bigint("user_id", { mode: "bigint" }).notNull(),         // FK → users.user_id
  description: text("description").notNull(),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false),
  listingId: bigint("listing_id", { mode: "bigint" }),             // FK → listings.listing_id (nullable)
  leadId: bigint("lead_id", { mode: "bigint" }),                   // FK → leads.lead_id (nullable)
  dealId: bigint("deal_id", { mode: "bigint" }),                   // FK → deals.deal_id (nullable)
  appointmentId: bigint("appointment_id", { mode: "bigint" }),     // FK → appointments.appointment_id (nullable)
  prospectId: bigint("prospect_id", { mode: "bigint" }),           // FK → prospects.prospect_id (nullable)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("idx_tasks_user").on(table.userId),
  listingIdx: index("idx_tasks_listing").on(table.listingId),
  leadIdx: index("idx_tasks_lead").on(table.leadId),
  dealIdx: index("idx_tasks_deal").on(table.dealId),
  appointmentIdx: index("idx_tasks_appointment").on(table.appointmentId),
  prospectIdx: index("idx_tasks_prospect").on(table.prospectId),
  completedIdx: index("idx_tasks_completed").on(table.completed),
  statusIdx: index("idx_tasks_status").on(table.isActive),
}));

// Documents table
export const documents = singlestoreTable("documents", {
  docId: bigint("doc_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),           // e.g. "PDF", "Image"
  fileUrl: varchar("file_url", { length: 2048 }).notNull(),
  userId: bigint("user_id", { mode: "bigint" }).notNull(),            // FK → users.user_id
  contactId: bigint("contact_id", { mode: "bigint" }),                // FK → contacts.contact_id (nullable)
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  listingId: bigint("listing_id", { mode: "bigint" }),                // FK → listings.listing_id (nullable)
  leadId: bigint("lead_id", { mode: "bigint" }),                      // FK → leads.lead_id (nullable)
  dealId: bigint("deal_id", { mode: "bigint" }),                      // FK → deals.deal_id (nullable)
  appointmentId: bigint("appointment_id", { mode: "bigint" }),        // FK → appointments.appointment_id (nullable)
  prospectId: bigint("prospect_id", { mode: "bigint" }),              // FK → prospects.prospect_id (nullable)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("idx_documents_user").on(table.userId),
  contactIdx: index("idx_documents_contact").on(table.contactId),
  listingIdx: index("idx_documents_listing").on(table.listingId),
  leadIdx: index("idx_documents_lead").on(table.leadId),
  dealIdx: index("idx_documents_deal").on(table.dealId),
  appointmentIdx: index("idx_documents_appointment").on(table.appointmentId),
  prospectIdx: index("idx_documents_prospect").on(table.prospectId),
  fileTypeIdx: index("idx_documents_type").on(table.fileType),
  statusIdx: index("idx_documents_status").on(table.isActive),
}));

// Prospects table
export const prospects = singlestoreTable("prospects", {
  prospectId: bigint("prospect_id", { mode: "bigint" }).primaryKey().autoincrement(),
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(),
  sourceType: varchar("source_type", { length: 50 }).notNull(),
  sourceDetails: text("source_details"),
  status: varchar("status", { length: 50 }).notNull(),
  statusUpdatedAt: timestamp("status_updated_at").defaultNow().notNull(),
  listingId: bigint("listing_id", { mode: "bigint" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  contactIdx: index("idx_prospects_contact").on(table.contactId),
  statusIdx: index("idx_prospects_status").on(table.status),
  sourceTypeIdx: index("idx_prospects_source").on(table.sourceType),
  listingIdx: index("idx_prospects_listing").on(table.listingId),
}));

// Prospect History table to track status changes
export const prospectHistory = singlestoreTable("prospect_history", {
  historyId: bigint("history_id", { mode: "bigint" }).primaryKey().autoincrement(),
  prospectId: bigint("prospect_id", { mode: "bigint" }).notNull(),
  previousStatus: varchar("previous_status", { length: 50 }),
  newStatus: varchar("new_status", { length: 50 }).notNull(),
  changedBy: bigint("changed_by", { mode: "bigint" }).notNull(), // FK → users.user_id
  changeReason: text("change_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  prospectIdx: index("idx_prospect_history_prospect").on(table.prospectId),
  statusChangeIdx: index("idx_prospect_history_status").on(table.previousStatus, table.newStatus),
  changedByIdx: index("idx_prospect_history_user").on(table.changedBy),
  createdAtIdx: index("idx_prospect_history_created").on(table.createdAt),
}));

