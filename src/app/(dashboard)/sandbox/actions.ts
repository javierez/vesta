"use server";

import { db } from "~/server/db";
import {
  type Property,
  LEON_NEIGHBORHOODS,
  mockUsers,
  contacts as mockContacts,
  mockAccounts,
  mockWebsiteConfigs,
} from "~/lib/data";
import {
  users,
  contacts,
  accounts,
  websiteProperties,
} from "~/server/db/schema";
import { createLocation } from "~/server/queries/locations";
import { createAccount } from "~/server/queries/accounts";
import { getCurrentUserAccountId } from "~/lib/dal";
import { sql } from "drizzle-orm";

// Type for database property with correct boolean conversion
type DbProperty = Omit<Property, "builtInWardrobes"> & {
  builtInWardrobes?: boolean;
};

// Helper function to convert property to DB format
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toDbProperty(property: Property): Partial<DbProperty> {
  const dbProperty: Partial<DbProperty> = {
    referenceNumber: property.referenceNumber,
    title: property.title,
    description: property.description,
    propertyType: property.propertyType,
    propertySubtype: property.propertySubtype,
    price: property.price,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    squareMeter: property.squareMeter,
    street: property.street,
    exterior: property.exterior,
    bright: property.bright,
    isActive: true,
    hasHeating: property.hasHeating,
    hasElevator: property.hasElevator,
    hasGarage: property.hasGarage,
    hasStorageRoom: property.hasStorageRoom,
  };

  // Only add optional fields if they are defined
  if (property.addressDetails !== undefined)
    dbProperty.addressDetails = property.addressDetails;
  if (property.postalCode !== undefined)
    dbProperty.postalCode = property.postalCode;
  if (property.neighborhoodId !== undefined)
    dbProperty.neighborhoodId = property.neighborhoodId;
  if (property.latitude !== undefined) dbProperty.latitude = property.latitude;
  if (property.longitude !== undefined)
    dbProperty.longitude = property.longitude;
  if (property.energyCertification !== undefined)
    dbProperty.energyCertification = property.energyCertification;
  if (property.heatingType !== undefined)
    dbProperty.heatingType = property.heatingType;
  if (property.yearBuilt !== undefined)
    dbProperty.yearBuilt = property.yearBuilt;
  if (property.cadastralReference !== undefined)
    dbProperty.cadastralReference = property.cadastralReference;
  if (property.builtSurfaceArea !== undefined)
    dbProperty.builtSurfaceArea = property.builtSurfaceArea;

  // Add amenity fields
  if (property.gym !== undefined) dbProperty.gym = property.gym;
  if (property.sportsArea !== undefined)
    dbProperty.sportsArea = property.sportsArea;
  if (property.childrenArea !== undefined)
    dbProperty.childrenArea = property.childrenArea;
  if (property.suiteBathroom !== undefined)
    dbProperty.suiteBathroom = property.suiteBathroom;
  if (property.nearbyPublicTransport !== undefined)
    dbProperty.nearbyPublicTransport = property.nearbyPublicTransport;
  if (property.communityPool !== undefined)
    dbProperty.communityPool = property.communityPool;
  if (property.privatePool !== undefined)
    dbProperty.privatePool = property.privatePool;
  if (property.tennisCourt !== undefined)
    dbProperty.tennisCourt = property.tennisCourt;

  // Convert string boolean fields to actual booleans for database storage
  if (property.builtInWardrobes !== undefined) {
    dbProperty.builtInWardrobes =
      typeof property.builtInWardrobes === "string"
        ? property.builtInWardrobes === "true" ||
          property.builtInWardrobes === "1"
        : Boolean(property.builtInWardrobes);
  }

  return dbProperty;
}

// Seed accounts data
async function seedAccounts() {
  try {
    for (const account of mockAccounts) {
      await createAccount({
        name: account.name,
        shortName: account.shortName,
        legalName: account.legalName,
        logo: account.logo,
        address: account.address,
        phone: account.phone,
        email: account.email,
        website: account.website,
        taxId: account.taxId,
        registryDetails: account.registryDetails,
        legalEmail: account.legalEmail,
        jurisdiction: account.jurisdiction,
        privacyEmail: account.privacyEmail,
        dpoEmail: account.dpoEmail,
        portalSettings: account.portalSettings,
        paymentSettings: account.paymentSettings,
        preferences: account.preferences,
        plan: account.plan,
        subscriptionType: account.subscriptionType,
        subscriptionStatus: account.subscriptionStatus,
        subscriptionStartDate: account.subscriptionStartDate,
        subscriptionEndDate: account.subscriptionEndDate,
        status: account.status,
        isActive: account.isActive,
      });
    }
    console.log("Accounts seeded successfully");
  } catch (error) {
    console.error("Error seeding accounts:", error);
    throw error;
  }
}

// Seed website config data
async function seedWebsiteConfig() {
  try {
    for (const config of mockWebsiteConfigs) {
      await db.insert(websiteProperties).values({
        accountId: config.accountId,
        socialLinks: config.socialLinks,
        seoProps: config.seoProps,
        logo: config.logo,
        logotype: config.logo, // Using logo as logotype for now
        favicon: config.favicon,
        heroProps: config.heroProps,
        featuredProps: config.featuredProps,
        aboutProps: config.aboutProps,
        propertiesProps: config.propertiesProps,
        testimonialProps: config.testimonialProps,
        contactProps: config.contactProps,
        footerProps: config.footerProps,
        headProps: config.headProps,
        watermarkProps: config.watermarkProps,
        metadata: config.metadata,
      });
    }
    console.log("Website configs seeded successfully");
  } catch (error) {
    console.error("Error seeding website configs:", error);
    throw error;
  }
}

// Seed locations data
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function seedLocations() {
  try {
    for (const location of LEON_NEIGHBORHOODS) {
      await createLocation({
        neighborhoodId: location.neighborhoodId,
        city: location.city,
        province: location.province,
        municipality: location.municipality,
        neighborhood: location.neighborhood,
        isActive: true,
      });
    }
    console.log("Locations seeded successfully");
  } catch (error) {
    console.error("Error seeding locations:", error);
    throw error;
  }
}

// Seed users data
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function seedUsers() {
  try {
    for (const user of mockUsers) {
      await db.insert(users).values({
        id: user.userId, // Already a string for BetterAuth compatibility
        name: `${user.firstName} ${user.lastName}`, // Required by BetterAuth schema
        accountId: user.accountId, // Use the accountId from user data
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        image: user.profileImageUrl, // Correct field name from schema
        timezone: user.timezone,
        language: user.language,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
        isVerified: user.isVerified,
        isActive: user.isActive,
      });
    }
    console.log("Users seeded successfully");
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
}

// Seed contacts data
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function seedContacts() {
  try {
    const accountId = await getCurrentUserAccountId();
    for (const contact of mockContacts) {
      await db.insert(contacts).values({
        accountId: BigInt(accountId),
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        additionalInfo: contact.additionalInfo,
        isActive: contact.isActive,
      });
    }
    console.log("Contacts seeded successfully");
  } catch (error) {
    console.error("Error seeding contacts:", error);
    throw error;
  }
}

// Clear only accounts and website_config tables
async function clearDatabase() {
  try {
    // Delete website configs first (depends on accounts)
    await db.delete(websiteProperties).where(sql`1=1`);
    // Then delete accounts
    await db.delete(accounts).where(sql`1=1`);
    console.log("Accounts and website configs cleared successfully");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
}

export async function seedDatabase() {
  try {
    // First clear existing data from accounts and website_config only
    await clearDatabase();

    // Seed accounts first
    await seedAccounts();

    // Then seed website configs (depends on accounts)
    await seedWebsiteConfig();

    console.log("Accounts and website configs seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

export async function testDatabaseConnection() {
  try {
    // Log connection details (excluding password)
    console.log("Attempting connection with:", {
      host: process.env.SINGLESTORE_HOST,
      port: process.env.SINGLESTORE_PORT,
      user: process.env.SINGLESTORE_USER,
      database: process.env.SINGLESTORE_DB,
      password: process.env.SINGLESTORE_PASS,
    });

    const result = await db.execute(sql`SELECT 1 as test`);
    console.log("Connection successful! Result:", result);
    // Convert the result to a plain object to avoid serialization issues
    const plainResult = JSON.parse(JSON.stringify(result)) as unknown;
    return { success: true, result: plainResult };
  } catch (error) {
    console.error("Database connection error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: {
        host: process.env.SINGLESTORE_HOST,
        port: process.env.SINGLESTORE_PORT,
        user: process.env.SINGLESTORE_USER,
        database: process.env.SINGLESTORE_DB,
        password: process.env.SINGLESTORE_PASS,
      },
    };
  }
}
