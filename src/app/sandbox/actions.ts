'use server'

import { db } from "~/server/db"
import { properties, type Property, propertyImages as mockPropertyImages, LEON_NEIGHBORHOODS } from "~/lib/data"
import { properties as dbProperties } from "~/server/db/schema"
import { createProperty } from "~/server/queries/properties"
import { createListing } from "~/server/queries/listing"
import { createPropertyImage } from "~/server/queries/property_images"
import { createLocation } from "~/server/queries/location"
import { sql } from "drizzle-orm"

// Helper function to convert property to DB format
function toDbProperty(property: Property) {
  return {
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
    referenceNumber: property.referenceNumber,
    hasHeating: property.hasHeating,
    hasElevator: property.hasElevator,
    hasGarage: property.hasGarage,
    hasStorageRoom: property.hasStorageRoom,
    // Optional fields with defaults
    addressDetails: property.addressDetails,
    postalCode: property.postalCode,
    neighborhoodId: property.neighborhoodId,
    latitude: property.latitude,
    longitude: property.longitude,
    energyCertification: property.energyCertification,
    heatingType: property.heatingType,
    yearBuilt: property.yearBuilt
  }
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

export async function seedDatabase() {
  try {
    // First seed locations
    await seedLocations();

    // Then seed properties
    for (const property of properties) {
      const dbProperty = toDbProperty(property)
      const createdProperty = await createProperty(dbProperty)
      
      // Create a listing for each property
      if (createdProperty) {
        await createListing({
          propertyId: BigInt(createdProperty.propertyId),
          agentId: BigInt(1), // Default agent ID
          ownerContactId: BigInt(1), // Default owner contact ID
          listingType: 'Sale',
          price: property.price,
          status: 'Active',
          isActive: true,
          isFeatured: false,
          isBankOwned: false,
          viewCount: 0,
          inquiryCount: 0
        })

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
                s3key: image.s3key
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