import { 
  int, 
  bigint, 
  text, 
  varchar, 
  decimal, 
  timestamp, 
  boolean,
  smallint,
  index,
  singlestoreTable
} from "drizzle-orm/singlestore-core";

// Users table
export const users = singlestoreTable("flexweb_users", {
  userId: bigint("user_id", { mode: "bigint" }).primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  userType: varchar("user_type", { length: 20 }).notNull(),  // We'll validate the enum values in the application layer
  profileImageUrl: varchar("profile_image_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  lastLogin: timestamp("last_login"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
});

// Agents table
export const agents = singlestoreTable("flexweb_agents", {
  userId: bigint("user_id", { mode: "bigint" }).primaryKey(),  // This is both PK and FK to users.userId
  licenseNumber: varchar("license_number", { length: 50 }).notNull(),
  bio: text("bio"),
  specialization: varchar("specialization", { length: 100 }),
  yearsExperience: int("years_experience"),
  officeId: bigint("office_id", { mode: "bigint" }),
});

// Offices table
export const offices = singlestoreTable("flexweb_offices", {
  officeId: bigint("office_id", { mode: "bigint" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
});

// Properties table
export const properties = singlestoreTable("flexweb_properties", {
  propertyId: bigint("property_id", { mode: "bigint" }).primaryKey().autoincrement(),
  referenceNumber: varchar("reference_number", { length: 20 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  propertyType: varchar("property_type", { length: 20 }).notNull(), // Enum handled in application
  status: varchar("status", { length: 20 }).notNull(), // Enum handled in application
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  bedrooms: smallint("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  squareFeet: int("square_feet").notNull(),
  lotSize: int("lot_size"),
  yearBuilt: smallint("year_built"),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 100 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isFeatured: boolean("is_featured").default(false),
  isBankOwned: boolean("is_bank_owned").default(false),
  energyCertification: varchar("energy_certification", { length: 1 }), // Enum handled in application
  hasHeating: boolean("has_heating").default(false),
  heatingType: varchar("heating_type", { length: 50 }),
  hasElevator: boolean("has_elevator").default(false),
  hasGarage: boolean("has_garage").default(false),
  hasStorageRoom: boolean("has_storage_room").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  listedByAgentId: bigint("listed_by_agent_id", { mode: "bigint" }),
  ownerId: bigint("owner_id", { mode: "bigint" }),
}, (table) => ({
  propertyTypeIdx: index("idx_property_type").on(table.propertyType),
  statusIdx: index("idx_status").on(table.status),
  cityIdx: index("idx_city").on(table.city),
  priceIdx: index("idx_price").on(table.price),
  bedroomsIdx: index("idx_bedrooms").on(table.bedrooms),
  squareFeetIdx: index("idx_square_feet").on(table.squareFeet),
  featuredIdx: index("idx_featured").on(table.isFeatured),
}));
