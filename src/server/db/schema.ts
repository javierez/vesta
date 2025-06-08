import { 
  bigint, 
  varchar, 
  timestamp, 
  boolean,
  singlestoreTable,
  json,
  type SingleStoreBigInt64BuilderInitial,
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
  name: varchar("name", { length: 50 }).notNull().unique(),
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

// Properties table
export const properties = singlestoreTable("properties", {
  propertyId: bigint("property_id", { mode: "bigint" }).primaryKey().autoincrement(),
  referenceNumber: varchar("reference_number", { length: 20 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  propertyType: varchar("property_type", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  bedrooms: smallint("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  squareMeter: int("square_meter").notNull(),
  yearBuilt: smallint("year_built"),
  street: varchar("street", { length: 255 }).notNull(),
  addressDetails: varchar("address_details", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  province: varchar("province", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  neighborhood: varchar("neighborhood", { length: 100 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isFeatured: boolean("is_featured").default(false),
  isBankOwned: boolean("is_bank_owned").default(false),
  energyCertification: text("energy_certification"),
  hasHeating: boolean("has_heating").default(false),
  heatingType: varchar("heating_type", { length: 50 }),
  hasElevator: boolean("has_elevator").default(false),
  hasGarage: boolean("has_garage").default(false),
  hasStorageRoom: boolean("has_storage_room").default(false),
  features: json("features").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  listedByAgentId: bigint("listed_by_agent_id", { mode: "bigint" }),
  ownerId: bigint("owner_id", { mode: "bigint" }),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  propertyTypeIdx: index("idx_properties_type").on(table.propertyType),
  statusIdx: index("idx_properties_status").on(table.status),
  cityIdx: index("idx_properties_city").on(table.city),
  priceIdx: index("idx_properties_price").on(table.price),
  bedroomsIdx: index("idx_properties_bedrooms").on(table.bedrooms),
  squareMeterIdx: index("idx_properties_sqm").on(table.squareMeter),
  featuredIdx: index("idx_properties_featured").on(table.isFeatured),
  listedByAgentIdx: index("idx_properties_agent").on(table.listedByAgentId),
  ownerIdx: index("idx_properties_owner").on(table.ownerId),
}));

export const propertyImages = singlestoreTable("property_images", {
  propertyImageId: bigint("property_image_id", { mode: "bigint" }).primaryKey().autoincrement(),
  propertyId: bigint("property_id", { mode: "bigint" }).notNull(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  imageKey: varchar("image_key", { length: 2048 }).notNull(),
  imageTag: varchar("image_tag", { length: 255 }),
}, (table) => ({
  propertyImageIdx: index("idx_property_images").on(table.propertyId),
}));

export const listings = singlestoreTable("listings", {
  listingId: bigint("listing_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  propertyId: bigint("property_id", { mode: "bigint" }).notNull(),        // FK → properties.property_id
  agentId: bigint("agent_id", { mode: "bigint" }).notNull(),               // FK → users.user_id (agent)
  ownerContactId: bigint("owner_contact_id", { mode: "bigint" }).notNull(),// FK → contacts.contact_id
  listingType: varchar("listing_type", { length: 20 }).notNull(),          // e.g. "Sale" or "Rent"
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),                     // e.g. "Active", "Pending", "Sold"
  viewCount: int("view_count").default(0),
  inquiryCount: int("inquiry_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  propertyIdx: index("idx_listings_property").on(table.propertyId),
  agentIdx: index("idx_listings_agent").on(table.agentId),
  ownerIdx: index("idx_listings_owner").on(table.ownerContactId),
  statusIdx: index("idx_listings_status").on(table.status),
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

