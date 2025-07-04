'use server'

import { getListingDetails } from "../queries/listing"
import { getPropertyImages } from "../queries/property_images"

// Fotocasa API Types
interface FotocasaProperty {
  ExternalId: string
  AgencyReference: string
  TypeId: number
  SubTypeId: number
  ContactTypeId: number
  PropertyAddress: PropertyAddress[]
  PropertyDocument?: PropertyDocument[]
  PropertyFeature: PropertyFeature[]
  PropertyContactInfo: PropertyContactInfo[]
  PropertyPublications?: PropertyPublication[]
  PropertyTransaction: PropertyTransaction[]
}

interface PropertyAddress {
  ZipCode?: string
  FloorId?: number
  x: number
  y: number
  VisibilityModeId: number
  Street?: string
  Number?: string
}

interface PropertyDocument {
  TypeId: number
  Url: string
  SortingId: number
}

interface PropertyFeature {
  FeatureId: number
  DecimalValue?: number
  BoolValue?: boolean
  DateValue?: string
  TextValue?: string
}

interface PropertyContactInfo {
  TypeId: number
  Value: string
}

interface PropertyPublication {
  PublicationId: number
  PublicationTypeId: number
}

interface PropertyTransaction {
  TransactionTypeId: number
  Price: number
  ShowPrice?: boolean
}

// Property type mapping (from our schema to Fotocasa)
const PROPERTY_TYPE_MAPPING: Record<string, number> = {
  'piso': 1,
  'casa': 2,
  'chalet': 2,
  'duplex': 3,
  'atico': 4,
  'estudio': 5,
  'loft': 6,
  'oficina': 7,
  'local': 8,
  'garaje': 10,
  'trastero': 12
}

// Property subtype mapping (basic mapping - can be expanded)
const PROPERTY_SUBTYPE_MAPPING: Record<string, number> = {
  'piso': 2,
  'casa': 3,
  'chalet': 4,
  'duplex': 5,
  'atico': 6,
  'estudio': 7,
  'loft': 9,
  'oficina': 10,
  'local': 11,
  'garaje': 13,
  'trastero': 17
}

// Transaction type mapping
const TRANSACTION_TYPE_MAPPING: Record<string, number> = {
  'Sale': 1,
  'Rent': 3
}

export async function buildFotocasaPayload(listingId: number): Promise<FotocasaProperty> {
  try {
    // Get listing details and property images
    const listing = await getListingDetails(listingId)
    const images = await getPropertyImages(listing.propertyId)

    // Extract floor number from addressDetails (get second number if exists)
    const getFloorId = (addressDetails: string | null): number | undefined => {
      if (!addressDetails) return undefined
      
      // Floor mapping according to Fotocasa specification
      const floorMapping: Record<string, number> = {
        'basement': 1,
        'sotano': 1,
        'ground': 3,
        'ground floor': 3,
        'planta baja': 3,
        'mezzanine': 4,
        'entresuelo': 4,
        'first': 6,
        'primera': 6,
        '1st': 6,
        'second': 7,
        'segunda': 7,
        '2nd': 7,
        'third': 8,
        'tercera': 8,
        '3rd': 8,
        'fourth': 9,
        'cuarta': 9,
        '4th': 9,
        'fifth': 10,
        'quinta': 10,
        '5th': 10,
        'sixth': 11,
        'sexta': 11,
        '6th': 11,
        'seventh': 12,
        'septima': 12,
        '7th': 12,
        'eighth': 13,
        'octava': 13,
        '8th': 13,
        'ninth': 14,
        'novena': 14,
        '9th': 14,
        'tenth': 15,
        'decima': 15,
        '10th': 15,
        'penthouse': 22,
        'atico': 22,
        'other': 31
      }
      
      // Convert to lowercase for case-insensitive matching
      const lowerAddress = addressDetails.toLowerCase()
      
      // Try to match floor descriptions
      for (const [floorDesc, floorId] of Object.entries(floorMapping)) {
        if (lowerAddress.includes(floorDesc)) {
          return floorId
        }
      }
      
      // If no specific floor description found, try to extract number and map it
      const numbers = addressDetails.match(/\d+/g)
      if (numbers && numbers.length > 0) {
        const floorNumber = parseInt(numbers[0])
        
        // Map numeric floors to IDs
        if (floorNumber === 0) return 3 // Ground floor
        if (floorNumber === 1) return 6 // First
        if (floorNumber === 2) return 7 // Second
        if (floorNumber === 3) return 8 // Third
        if (floorNumber === 4) return 9 // Fourth
        if (floorNumber === 5) return 10 // Fifth
        if (floorNumber === 6) return 11 // Sixth
        if (floorNumber === 7) return 12 // Seventh
        if (floorNumber === 8) return 13 // Eighth
        if (floorNumber === 9) return 14 // Ninth
        if (floorNumber === 10) return 15 // Tenth
        if (floorNumber > 10) return 16 // Tenth upwards
      }
      
      return undefined
    }

    // Extract street name (text before first comma)
    const getStreetName = (street: string | null): string | undefined => {
      if (!street) return undefined
      return street.split(',')[0]?.trim()
    }

    // Extract street number (first number after comma)
    const getStreetNumber = (street: string | null, addressDetails: string | null): string | undefined => {
      const fullAddress = `${street || ''} ${addressDetails || ''}`.trim()
      const numbers = fullAddress.match(/\d+/g)
      return numbers && numbers.length > 0 ? numbers[0] : undefined
    }

    // Build PropertyAddress
    const propertyAddress: PropertyAddress[] = [{
      ZipCode: listing.postalCode || undefined,
      FloorId: getFloorId(listing.addressDetails),
      x: listing.longitude ? parseFloat(listing.longitude.toString()) : 0,
      y: listing.latitude ? parseFloat(listing.latitude.toString()) : 0,
      VisibilityModeId: listing.visibilityMode || 1, // 1=Exact, 2=Street, 3=Zone
      Street: getStreetName(listing.street),
      Number: getStreetNumber(listing.street, listing.addressDetails)
    }]

    // Build PropertyFeatures
    const propertyFeatures: PropertyFeature[] = []

    // Square meters (FeatureId: 1)
    if (listing.squareMeter) {
      propertyFeatures.push({
        FeatureId: 1,
        DecimalValue: listing.squareMeter
      })
    }

    // Title (FeatureId: 2)
    if (listing.title) {
      propertyFeatures.push({
        FeatureId: 2,
        TextValue: listing.title
      })
    }

    // Description (FeatureId: 3)
    if (listing.description) {
      propertyFeatures.push({
        FeatureId: 3,
        TextValue: listing.description
      })
    }

    // Bedrooms (FeatureId: 11)
    if (listing.bedrooms) {
      propertyFeatures.push({
        FeatureId: 11,
        DecimalValue: listing.bedrooms
      })
    }

    // Bathrooms (FeatureId: 12)
    if (listing.bathrooms) {
      propertyFeatures.push({
        FeatureId: 12,
        DecimalValue: parseFloat(listing.bathrooms.toString())
      })
    }

    // Is Furnished (FeatureId: 30)
    if (listing.isFurnished !== null) {
      propertyFeatures.push({
        FeatureId: 30,
        BoolValue: listing.isFurnished || false
      })
    }

    // Elevator (FeatureId: 22)
    if (listing.hasElevator !== null) {
      propertyFeatures.push({
        FeatureId: 22,
        BoolValue: listing.hasElevator || false
      })
    }

    // Home Automation (FeatureId: 142)
    if (listing.homeAutomation !== null) {
      propertyFeatures.push({
        FeatureId: 142,
        BoolValue: listing.homeAutomation || false
      })
    }

    // Internet (FeatureId: 286)
    if (listing.internet !== null) {
      propertyFeatures.push({
        FeatureId: 286,
        BoolValue: listing.internet || false
      })
    }

    // Gym (FeatureId: 309)
    if (listing.gym !== null) {
      propertyFeatures.push({
        FeatureId: 309,
        BoolValue: listing.gym || false
      })
    }

    // Sports Area (FeatureId: 302)
    if (listing.sportsArea !== null) {
      propertyFeatures.push({
        FeatureId: 302,
        BoolValue: listing.sportsArea || false
      })
    }

    // Children Area (FeatureId: 303)
    if (listing.childrenArea !== null) {
      propertyFeatures.push({
        FeatureId: 303,
        BoolValue: listing.childrenArea || false
      })
    }

    // Suite Bathroom (FeatureId: 260)
    if (listing.suiteBathroom !== null) {
      propertyFeatures.push({
        FeatureId: 260,
        BoolValue: listing.suiteBathroom || false
      })
    }

    // Appliances Included (FeatureId: 259)
    if (listing.appliancesIncluded !== null) {
      propertyFeatures.push({
        FeatureId: 259,
        BoolValue: listing.appliancesIncluded || false
      })
    }

    // Year Built (FeatureId: 231)
    if (listing.yearBuilt) {
      propertyFeatures.push({
        FeatureId: 231,
        DecimalValue: listing.yearBuilt
      })
    }

    // Individual appliances
    if (listing.oven !== null) {
      propertyFeatures.push({ FeatureId: 288, BoolValue: listing.oven || false })
    }
    if (listing.washingMachine !== null) {
      propertyFeatures.push({ FeatureId: 293, BoolValue: listing.washingMachine || false })
    }
    if (listing.microwave !== null) {
      propertyFeatures.push({ FeatureId: 287, BoolValue: listing.microwave || false })
    }
    if (listing.fridge !== null) {
      propertyFeatures.push({ FeatureId: 292, BoolValue: listing.fridge || false })
    }
    if (listing.tv !== null) {
      propertyFeatures.push({ FeatureId: 291, BoolValue: listing.tv || false })
    }
    if (listing.stoneware !== null) {
      propertyFeatures.push({ FeatureId: 295, BoolValue: listing.stoneware || false })
    }

    // Pets Allowed (FeatureId: 313)
    if (listing.petsAllowed !== null) {
      propertyFeatures.push({
        FeatureId: 313,
        BoolValue: listing.petsAllowed || false
      })
    }

    // Nearby Public Transport (FeatureId: 176)
    if (listing.nearbyPublicTransport !== null) {
      propertyFeatures.push({
        FeatureId: 176,
        BoolValue: listing.nearbyPublicTransport || false
      })
    }

    // Security Door (FeatureId: 294)
    if (listing.securityDoor !== null) {
      propertyFeatures.push({
        FeatureId: 294,
        BoolValue: listing.securityDoor || false
      })
    }

    // Alarm (FeatureId: 235)
    if (listing.alarm !== null) {
      propertyFeatures.push({
        FeatureId: 235,
        BoolValue: listing.alarm || false
      })
    }

    // Private Pool (FeatureId: 25)
    if (listing.privatePool !== null) {
      propertyFeatures.push({
        FeatureId: 25,
        BoolValue: listing.privatePool || false
      })
    }

    // Community Pool (FeatureId: 300)
    if (listing.communityPool !== null) {
      propertyFeatures.push({
        FeatureId: 300,
        BoolValue: listing.communityPool || false
      })
    }

    // Parking/Garage (FeatureId: 23)
    if (listing.hasGarage !== null) {
      propertyFeatures.push({
        FeatureId: 23,
        BoolValue: listing.hasGarage || false
      })
    }

    // Jacuzzi (FeatureId: 274)
    if (listing.jacuzzi !== null) {
      propertyFeatures.push({
        FeatureId: 274,
        BoolValue: listing.jacuzzi || false
      })
    }

    // Tennis Court (FeatureId: 310)
    if (listing.tennisCourt !== null) {
      propertyFeatures.push({
        FeatureId: 310,
        BoolValue: listing.tennisCourt || false
      })
    }

    // Laundry Room (FeatureId: 257)
    if (listing.laundryRoom !== null) {
      propertyFeatures.push({
        FeatureId: 257,
        BoolValue: listing.laundryRoom || false
      })
    }

    // Built-in Wardrobes (FeatureId: 258)
    if (listing.builtInWardrobes) {
      propertyFeatures.push({
        FeatureId: 258,
        BoolValue: true
      })
    }

    // Storage Room (FeatureId: 24)
    if (listing.hasStorageRoom !== null) {
      propertyFeatures.push({
        FeatureId: 24,
        BoolValue: listing.hasStorageRoom || false
      })
    }

    // Garden (FeatureId: 263)
    if (listing.garden !== null) {
      propertyFeatures.push({
        FeatureId: 263,
        BoolValue: listing.garden || false
      })
    }

    // Equipped Kitchen (FeatureId: 314)
    if (listing.furnishedKitchen !== null) {
      propertyFeatures.push({
        FeatureId: 314,
        BoolValue: listing.furnishedKitchen || false
      })
    }

    // Build PropertyDocument (images)
    const propertyDocuments: PropertyDocument[] = images.map((image, index) => ({
      TypeId: 1, // Image type
      Url: image.imageUrl,
      SortingId: index + 1
    }))

    // Build PropertyContactInfo (hardcoded for now - should come from agent/owner data)
    const propertyContactInfo: PropertyContactInfo[] = [
      {
        TypeId: 1, // Email
        Value: listing.agent?.email || "demo@adevinta.com"
      },
      {
        TypeId: 2, // Phone
        Value: listing.agent?.phone || "942862711"
      }
    ]

    // Build PropertyTransaction
    const propertyTransaction: PropertyTransaction[] = [{
      TransactionTypeId: TRANSACTION_TYPE_MAPPING[listing.listingType] || 1,
      Price: parseFloat(listing.price.toString()),
      ShowPrice: true
    }]

    // Build the complete payload
    const fotocasaPayload: FotocasaProperty = {
      ExternalId: listing.listingId.toString(),
      AgencyReference: listing.referenceNumber || listing.listingId.toString(),
      TypeId: PROPERTY_TYPE_MAPPING[listing.propertyType || 'piso'] || 1,
      SubTypeId: PROPERTY_SUBTYPE_MAPPING[listing.propertySubtype || listing.propertyType || 'piso'] || 2,
      ContactTypeId: 3, // Agency contact (hardcoded for now)
      PropertyAddress: propertyAddress,
      PropertyDocument: propertyDocuments.length > 0 ? propertyDocuments : undefined,
      PropertyFeature: propertyFeatures,
      PropertyContactInfo: propertyContactInfo,
      PropertyTransaction: propertyTransaction,
      PropertyPublications: [
        {
          PublicationId: 31, // Fotocasa publication ID
          PublicationTypeId: 2
        }
      ]
    }

    return fotocasaPayload

  } catch (error) {
    console.error("Error building Fotocasa payload:", error)
    throw error
  }
}

// Server action to be called when confirming Fotocasa portal
export async function publishToFotocasa(listingId: number): Promise<{ success: boolean; payload?: FotocasaProperty; error?: string }> {
  try {
    console.log(`Publishing listing ${listingId} to Fotocasa...`)
    
    // Build the payload
    const payload = await buildFotocasaPayload(listingId)
    
    // Log the payload for debugging
    console.log("Fotocasa Payload:", JSON.stringify(payload, null, 2))
    
    // Here you would make the actual API call to Fotocasa
    // For now, we'll just return success with the payload
    
    return {
      success: true,
      payload
    }
    
  } catch (error) {
    console.error("Error publishing to Fotocasa:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}