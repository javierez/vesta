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
import { sql } from "drizzle-orm"

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

// Accounts table
export const accounts = singlestoreTable("flexweb_accounts", {
  accountId: bigint("account_id", { mode: "bigint" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  shortName: varchar("short_name", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // active, inactive, suspended
  subscriptionType: varchar("subscription_type", { length: 50 }).notNull(),
  subscriptionStartDate: timestamp("subscription_start_date").notNull(),
  subscriptionEndDate: timestamp("subscription_end_date"),
  maxOffices: int("max_offices").default(1),
  maxUsers: int("max_users").default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  statusIdx: index("idx_account_status").on(table.status),
  subscriptionTypeIdx: index("idx_subscription_type").on(table.subscriptionType),
}));

// Offices table
export const offices = singlestoreTable("flexweb_offices", {
  officeId: bigint("office_id", { mode: "bigint" }).primaryKey().autoincrement(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // Reference to accounts table
  name: varchar("name", { length: 100 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
}, (table) => ({
  accountIdIdx: index("idx_account_id").on(table.accountId),
}));

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
  features: text("features"), // Stored as JSON array of strings
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

// Property Images table
export const propertyImages = singlestoreTable("flexweb_property_images", {
  imageId: bigint("image_id", { mode: "bigint" }).primaryKey().autoincrement(),
  propertyId: bigint("property_id", { mode: "bigint" }).notNull(), // Reference to properties table
  fileId: varchar("file_id", { length: 255 }).notNull(), // Unique identifier from storage service
  url: varchar("url", { length: 1024 }).notNull(), // Full URL to the image
  name: varchar("name", { length: 255 }).notNull(), // Original filename
  size: int("size").notNull(), // File size in bytes
  mimeType: varchar("mime_type", { length: 100 }).notNull(), // e.g., "image/jpeg", "image/png"
  width: int("width"), // Image width in pixels
  height: int("height"), // Image height in pixels
  isFeatured: boolean("is_featured").default(false), // Main property image
  sortOrder: int("sort_order").default(0), // For controlling display order
  altText: varchar("alt_text", { length: 255 }), // For accessibility
  caption: varchar("caption", { length: 500 }), // Optional image description
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  propertyIdIdx: index("idx_property_images_property").on(table.propertyId),
  fileIdIdx: index("idx_property_images_file").on(table.fileId),
  featuredIdx: index("idx_property_images_featured").on(table.isFeatured),
}));

export const folders = singlestoreTable("flexweb_folders", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  parentId: text("parent_id"),
  path: text("path").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
})

export const files = singlestoreTable("flexweb_files", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  folderId: text("folder_id").notNull(),
  path: text("path").notNull(),
  size: int("size").notNull(),
  mimeType: text("mime_type").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
})

export const websiteProperties = singlestoreTable("flexweb_config", {
  id: bigint("id", { mode: "bigint" }).primaryKey().autoincrement(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // Reference to accounts table
  socialLinks: text("social_links").notNull(), // JSON containing social media links
  seoProps: text("seo_props").notNull(), // JSON containing SEO properties
  logo: varchar("logo", { length: 1024 }).notNull(), // URL to logo file
  favicon: varchar("favicon", { length: 1024 }).notNull(), // URL to favicon file
  heroProps: text("hero_props").notNull(), // JSON containing hero section properties
  featuredProps: text("featured_props").notNull(), // JSON containing featured section properties
  aboutProps: text("about_props").notNull(), // JSON containing about section properties
  propertiesProps: text("properties_props").notNull(), // JSON containing properties section configuration
  testimonialProps: text("testimonial_props").notNull(), // JSON containing testimonial section properties
  contactProps: text("contact_props").notNull(), // JSON containing contact section properties
  footerProps: text("footer_props").notNull(), // JSON containing footer configuration
  headProps: text("head_props").notNull(), // JSON containing head section properties
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // Add index on updatedAt to help with caching and fetching latest config
  updatedAtIdx: index("idx_website_props_updated").on(table.updatedAt),
}));

// Testimonials table
export const testimonials = singlestoreTable("flexweb_testimonials", {
  testimonialId: bigint("testimonial_id", { mode: "bigint" }).primaryKey().autoincrement(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // Reference to accounts table
  name: varchar("name", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }),
  content: text("content").notNull(),
  avatar: varchar("avatar", { length: 1024 }), // URL to avatar image
  rating: smallint("rating").default(5), // Rating from 1-5
  isVerified: boolean("is_verified").default(false),
  sortOrder: int("sort_order").default(0), // For controlling display order
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  accountIdIdx: index("idx_testimonials_account").on(table.accountId),
  ratingIdx: index("idx_testimonials_rating").on(table.rating),
  activeIdx: index("idx_testimonials_active").on(table.isActive),
  sortOrderIdx: index("idx_testimonials_sort").on(table.sortOrder),
}));
