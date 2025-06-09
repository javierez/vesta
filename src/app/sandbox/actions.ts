'use server'

import { db } from "~/server/db"
import { properties, type Property, propertyImages as mockPropertyImages } from "~/lib/data"
import { properties as dbProperties } from "~/server/db/schema"
import { createProperty } from "~/server/queries/properties"
import { createListing } from "~/server/queries/listing"
import { createPropertyImage } from "~/server/queries/property_images"

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
    city: property.city,
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
    province: property.province,
    postalCode: property.postalCode,
    neighborhood: property.neighborhood,
    latitude: property.latitude,
    longitude: property.longitude,
    energyCertification: property.energyCertification,
    heatingType: property.heatingType,
    yearBuilt: property.yearBuilt
  }
}

export async function seedDatabase() {
  try {
    // Seed properties
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
        const propertyImages = mockPropertyImages.filter(
          img => img.referenceNumber === property.referenceNumber
        )

        for (const image of propertyImages) {
          await createPropertyImage({
            propertyId: BigInt(createdProperty.propertyId),
            referenceNumber: image.referenceNumber,
            imageUrl: image.imageUrl,
            isActive: image.isActive,
            imageKey: image.imageKey,
            imageTag: image.imageTag,
            s3key: image.s3key
          })
        }
      }
    }
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
} 