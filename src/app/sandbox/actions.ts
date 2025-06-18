'use server'

import { db } from "~/server/db"
import { properties, type Property, propertyImages as mockPropertyImages, LEON_NEIGHBORHOODS, listings as mockListings, mockUsers, contacts as mockContacts, listingContacts as mockListingContacts } from "~/lib/data"
import { properties as dbProperties, listings as dbListings, propertyImages, locations, users, contacts, listingContacts } from "~/server/db/schema"
import { createProperty } from "~/server/queries/properties"
import { createListing } from "~/server/queries/listing"
import { createPropertyImage } from "~/server/queries/property_images"
import { createLocation } from "~/server/queries/location"
import { sql } from "drizzle-orm"

// Helper function to convert property to DB format
function toDbProperty(property: Property) {
  const dbProperty: any = {
    referenceNumber: property.referenceNumber,
    title: property.title,
    description: property.description,
    propertyType: property.propertyType,
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
  }

  // Only add optional fields if they are defined
  if (property.addressDetails) dbProperty.addressDetails = property.addressDetails;
  if (property.postalCode) dbProperty.postalCode = property.postalCode;
  if (property.neighborhoodId) dbProperty.neighborhoodId = property.neighborhoodId;
  if (property.latitude) dbProperty.latitude = property.latitude;
  if (property.longitude) dbProperty.longitude = property.longitude;
  if (property.energyCertification) dbProperty.energyCertification = property.energyCertification;
  if (property.heatingType) dbProperty.heatingType = property.heatingType;
  if (property.yearBuilt) dbProperty.yearBuilt = property.yearBuilt;
  if (property.cadastralReference) dbProperty.cadastralReference = property.cadastralReference;
  if (property.builtSurfaceArea) dbProperty.builtSurfaceArea = property.builtSurfaceArea;

  return dbProperty;
}

// Seed locations data
async function seedLocations() {
  try {
    for (const location of LEON_NEIGHBORHOODS) {
      await createLocation({
        neighborhoodId: location.neighborhoodId,
        city: location.city,
        province: location.province,
        municipality: location.municipality,
        neighborhood: location.neighborhood,
        isActive: true
      });
    }
    console.log('Locations seeded successfully');
  } catch (error) {
    console.error('Error seeding locations:', error);
    throw error;
  }
}

// Seed users data
async function seedUsers() {
  try {
    for (const user of mockUsers) {
      await db.insert(users).values({
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        profileImageUrl: user.profileImageUrl,
        timezone: user.timezone,
        language: user.language,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
        isVerified: user.isVerified,
        isActive: user.isActive
      });
    }
    console.log('Users seeded successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

// Seed contacts data
async function seedContacts() {
  try {
    for (const contact of mockContacts) {
      await db.insert(contacts).values({
        contactId: contact.contactId,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        additionalInfo: contact.additionalInfo,
        isActive: contact.isActive,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      });
    }
    console.log('Contacts seeded successfully');
  } catch (error) {
    console.error('Error seeding contacts:', error);
    throw error;
  }
}

// Seed listing contacts data
async function seedListingContacts() {
  try {
    for (const listingContact of mockListingContacts) {
      await db.insert(listingContacts).values({
        listingContactId: listingContact.listingContactId,
        listingId: listingContact.listingId,
        contactId: listingContact.contactId,
        contactType: listingContact.contactType,
        createdAt: listingContact.createdAt,
        updatedAt: listingContact.updatedAt,
        isActive: listingContact.isActive
      });
    }
    console.log('Listing contacts seeded successfully');
  } catch (error) {
    console.error('Error seeding listing contacts:', error);
    throw error;
  }
}

// Clear all data from relevant tables
async function clearDatabase() {
  try {
    // Delete in reverse order of dependencies to avoid foreign key constraints
    await db.delete(listingContacts);
    await db.delete(dbListings);
    await db.delete(propertyImages);
    await db.delete(dbProperties);
    await db.delete(contacts);
    await db.delete(locations);
    await db.delete(users);
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

export async function seedDatabase() {
  try {
    // First clear existing data
    await clearDatabase();

    // Then seed users
    await seedUsers();

    // Then seed contacts
    await seedContacts();

    // Then seed locations
    await seedLocations();

    // Then seed properties and listings
    const createdListings = new Map<bigint, bigint>(); // Map to store propertyId -> listingId

    for (const property of properties) {
      const dbProperty = toDbProperty(property)
      const createdProperty = await createProperty(dbProperty)
      
      // Create a listing for each property
      if (createdProperty) {
        // Find the corresponding listing in the mock data
        const mockListing = mockListings.find((l: { propertyId: bigint }) => l.propertyId === property.propertyId);
        
        if (!mockListing) {
          console.warn(`No mock listing found for property ${property.propertyId}, using defaults`);
        }

        const newListing = await createListing({
          propertyId: BigInt(createdProperty.propertyId),
          agentId: mockListing?.agentId || BigInt(1),
          listingType: mockListing?.listingType || 'Sale',
          price: mockListing?.price || property.price || "0",
          status: mockListing?.status || 'Active',
          isActive: mockListing?.isActive ?? true,
          isFeatured: mockListing?.isFeatured ?? false,
          isBankOwned: mockListing?.isBankOwned ?? false,
          viewCount: mockListing?.viewCount ?? 0,
          inquiryCount: mockListing?.inquiryCount ?? 0,
          isFurnished: mockListing?.isFurnished ?? false,
          furnitureQuality: mockListing?.furnitureQuality,
          optionalGarage: mockListing?.optionalGarage ?? false,
          optionalGaragePrice: mockListing?.optionalGaragePrice,
          optionalStorageRoom: mockListing?.optionalStorageRoom ?? false,
          optionalStorageRoomPrice: mockListing?.optionalStorageRoomPrice,
          hasKeys: mockListing?.hasKeys ?? false,
          studentFriendly: mockListing?.studentFriendly ?? false,
          petsAllowed: mockListing?.petsAllowed ?? false,
          appliancesIncluded: mockListing?.appliancesIncluded ?? false
        });

        // Store the mapping of property ID to listing ID
        if (newListing) {
          createdListings.set(property.propertyId, newListing.listingId);
        }

        // Create property images for this property
        try {
          const propertyImages = mockPropertyImages.filter(
            img => img.referenceNumber === property.referenceNumber
          )

          console.log(`Found ${propertyImages.length} images for property ${property.referenceNumber}`)

          for (const image of propertyImages) {
            try {
              await createPropertyImage({
                propertyId: BigInt(createdProperty.propertyId),
                referenceNumber: image.referenceNumber,
                imageUrl: image.imageUrl,
                isActive: image.isActive,
                imageKey: image.imageKey,
                imageTag: image.imageTag,
                s3key: image.s3key,
                imageOrder: image.imageOrder
              })
              console.log(`Successfully created image ${image.imageKey} for property ${property.referenceNumber}`)
            } catch (imageError) {
              console.error(`Error creating image ${image.imageKey} for property ${property.referenceNumber}:`, imageError)
              // Continue with next image even if one fails
              continue
            }
          }
        } catch (propertyImagesError) {
          console.error(`Error processing images for property ${property.referenceNumber}:`, propertyImagesError)
          // Continue with next property even if images fail
          continue
        }
      }
    }

    // Finally seed listing contacts with correct listing IDs
    for (const listingContact of mockListingContacts) {
      // Find the corresponding property ID from the mock data
      const mockListing = mockListings.find(l => l.listingId === listingContact.listingId);
      if (!mockListing) {
        console.warn(`No mock listing found for listing contact ${listingContact.listingId}, skipping`);
        continue;
      }

      // Get the actual listing ID from our mapping
      const actualListingId = createdListings.get(mockListing.propertyId);
      if (!actualListingId) {
        console.warn(`No actual listing ID found for property ${mockListing.propertyId}, skipping`);
        continue;
      }

      await db.insert(listingContacts).values({
        listingContactId: listingContact.listingContactId,
        listingId: actualListingId, // Use the actual listing ID
        contactId: listingContact.contactId,
        contactType: listingContact.contactType,
        createdAt: listingContact.createdAt,
        updatedAt: listingContact.updatedAt,
        isActive: listingContact.isActive
      });
    }

    console.log('Database seeding completed successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

export async function testDatabaseConnection() {
  try {
    // Log connection details (excluding password)
    console.log('Attempting connection with:', {
      host: process.env.SINGLESTORE_HOST,
      port: process.env.SINGLESTORE_PORT,
      user: process.env.SINGLESTORE_USER,
      database: process.env.SINGLESTORE_DB,
      password: process.env.SINGLESTORE_PASS,
    })

    const result = await db.execute(sql`SELECT 1 as test`)
    console.log('Connection successful! Result:', result)
    // Convert the result to a plain object to avoid serialization issues
    const plainResult = JSON.parse(JSON.stringify(result))
    return { success: true, result: plainResult }
  } catch (error) {
    console.error('Database connection error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        host: process.env.SINGLESTORE_HOST,
        port: process.env.SINGLESTORE_PORT,
        user: process.env.SINGLESTORE_USER,
        database: process.env.SINGLESTORE_DB,
        password: process.env.SINGLESTORE_PASS,
      }
    }
  }
} 