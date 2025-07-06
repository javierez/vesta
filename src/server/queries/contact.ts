'use server'

import { db } from "../db"
import { contacts, listings, properties, locations } from "../db/schema"
import { eq, and, or, like, sql } from "drizzle-orm"
import type { Contact } from "../../lib/data"
import { listingContacts } from "../db/schema"

// Create a new contact
export async function createContact(data: Omit<Contact, "contactId" | "createdAt" | "updatedAt">) {
  try {
    const [result] = await db.insert(contacts).values({
      ...data,
      isActive: true,
    }).$returningId();
    if (!result) throw new Error("Failed to create contact");
    const [newContact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.contactId, BigInt(result.contactId)));
    return newContact;
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
}

// Get contact by ID
export async function getContactById(contactId: number) {
  try {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.contactId, BigInt(contactId)),
          eq(contacts.isActive, true)
        )
      );
    return contact;
  } catch (error) {
    console.error("Error fetching contact:", error);
    throw error;
  }
}

// Get contacts by organization ID
export async function getContactsByOrgId(orgId: number) {
  try {
    const orgContacts = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.orgId, BigInt(orgId)),
          eq(contacts.isActive, true)
        )
      );
    return orgContacts;
  } catch (error) {
    console.error("Error fetching organization contacts:", error);
    throw error;
  }
}

// Search contacts by name or email
export async function searchContacts(query: string) {
  try {
    const searchResults = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.isActive, true),
          or(
            like(contacts.firstName, `%${query}%`),
            like(contacts.lastName, `%${query}%`),
            like(contacts.email, `%${query}%`)
          )
        )
      );
    return searchResults;
  } catch (error) {
    console.error("Error searching contacts:", error);
    throw error;
  }
}

// Update contact
export async function updateContact(
  contactId: number,
  data: Omit<Partial<Contact>, "contactId" | "createdAt" | "updatedAt">
) {
  try {
    await db
      .update(contacts)
      .set(data)
      .where(
        and(
          eq(contacts.contactId, BigInt(contactId)),
          eq(contacts.isActive, true)
        )
      );
    const [updatedContact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.contactId, BigInt(contactId)));
    return updatedContact;
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
}

// Soft delete contact (set isActive to false)
export async function softDeleteContact(contactId: number) {
  try {
    await db
      .update(contacts)
      .set({ isActive: false })
      .where(eq(contacts.contactId, BigInt(contactId)));
    return { success: true };
  } catch (error) {
    console.error("Error soft deleting contact:", error);
    throw error;
  }
}

// Hard delete contact (remove from database)
export async function deleteContact(contactId: number) {
  try {
    await db
      .delete(contacts)
      .where(eq(contacts.contactId, BigInt(contactId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
}

// List all contact-listing relationships (each contact can appear multiple times)
export async function listContactsWithTypes(
  page = 1,
  limit = 10,
  filters?: {
    orgId?: number;
    isActive?: boolean;
  }
) {
  try {
    const offset = (page - 1) * limit;
    
    // Build the where conditions array
    const whereConditions = [];
    if (filters) {
      if (filters.orgId) {
        whereConditions.push(eq(contacts.orgId, BigInt(filters.orgId)));
      }
      if (filters.isActive !== undefined) {
        whereConditions.push(eq(contacts.isActive, filters.isActive));
      }
    } else {
      // By default, only show active contacts
      whereConditions.push(eq(contacts.isActive, true));
    }

    // Get all contact-listing relationships with property and location info
    const contactListingRelationships = await db
      .select({
        contactId: contacts.contactId,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        email: contacts.email,
        phone: contacts.phone,
        additionalInfo: contacts.additionalInfo,
        orgId: contacts.orgId,
        isActive: contacts.isActive,
        createdAt: contacts.createdAt,
        updatedAt: contacts.updatedAt,
        contactType: listingContacts.contactType,
        listingId: listingContacts.listingId,
        listingContactId: listingContacts.listingContactId,
        street: properties.street,
        city: locations.city,
        propertyType: properties.propertyType,
        listingType: listings.listingType,
      })
      .from(contacts)
      .innerJoin(
        listingContacts,
        and(
          eq(contacts.contactId, listingContacts.contactId),
          eq(listingContacts.isActive, true)
        )
      )
      .innerJoin(
        listings,
        eq(listingContacts.listingId, listings.listingId)
      )
      .innerJoin(
        properties,
        eq(listings.propertyId, properties.propertyId)
      )
      .leftJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId)
      )
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(contacts.createdAt);

    // Also get contacts that don't have any listing relationships (to show them as 'demandante')
    const contactsWithoutListings = await db
      .select({
        contactId: contacts.contactId,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        email: contacts.email,
        phone: contacts.phone,
        additionalInfo: contacts.additionalInfo,
        orgId: contacts.orgId,
        isActive: contacts.isActive,
        createdAt: contacts.createdAt,
        updatedAt: contacts.updatedAt,
        contactType: sql<string>`'demandante'`,
        listingId: sql<null>`NULL`,
        listingContactId: sql<null>`NULL`,
        street: sql<null>`NULL`,
        city: sql<null>`NULL`,
        propertyType: sql<null>`NULL`,
        listingType: sql<null>`NULL`,
      })
      .from(contacts)
      .leftJoin(
        listingContacts,
        and(
          eq(contacts.contactId, listingContacts.contactId),
          eq(listingContacts.isActive, true)
        )
      )
      .where(
        and(
          ...whereConditions,
          sql`${listingContacts.contactId} IS NULL`
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(contacts.createdAt);

    // Combine both results
    const allContacts = [...contactListingRelationships, ...contactsWithoutListings];
    
    return allContacts;
  } catch (error) {
    console.error("Error listing contacts with types:", error);
    throw error;
  }
}

// List all contacts (with pagination and optional filters)
export async function listContacts(
  page = 1,
  limit = 10,
  filters?: {
    orgId?: number;
    isActive?: boolean;
  }
) {
  try {
    const offset = (page - 1) * limit;
    
    // Build the where conditions array
    const whereConditions = [];
    if (filters) {
      if (filters.orgId) {
        whereConditions.push(eq(contacts.orgId, BigInt(filters.orgId)));
      }
      if (filters.isActive !== undefined) {
        whereConditions.push(eq(contacts.isActive, filters.isActive));
      }
    } else {
      // By default, only show active contacts
      whereConditions.push(eq(contacts.isActive, true));
    }

    // Create the base query
    const query = db.select().from(contacts);

    // Apply all where conditions at once
    const filteredQuery = whereConditions.length > 0 
      ? query.where(and(...whereConditions))
      : query;

    // Apply pagination
    const allContacts = await filteredQuery
      .limit(limit)
      .offset(offset);
    
    return allContacts;
  } catch (error) {
    console.error("Error listing contacts:", error);
    throw error;
  }
}

// Get all potential owners (active contacts)
export async function getAllPotentialOwners() {
  try {
    const owners = await db
      .select({
        id: contacts.contactId,
        name: sql<string>`CONCAT(${contacts.firstName}, ' ', ${contacts.lastName})`
      })
      .from(contacts)
      .where(
        and(
          eq(contacts.isActive, true)
        )
      )
      .orderBy(sql`CONCAT(${contacts.firstName}, ' ', ${contacts.lastName})`);

    return owners;
  } catch (error) {
    console.error("Error fetching potential owners:", error);
    throw error;
  }
}

// Get current owners for a specific listing
export async function getCurrentListingOwners(listingId: number) {
  try {
    const owners = await db
      .select({
        id: contacts.contactId,
        name: sql<string>`CONCAT(${contacts.firstName}, ' ', ${contacts.lastName})`
      })
      .from(listingContacts)
      .innerJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
      .where(
        and(
          eq(listingContacts.listingId, BigInt(listingId)),
          eq(listingContacts.contactType, 'owner'),
          eq(listingContacts.isActive, true),
          eq(contacts.isActive, true)
        )
      )
      .orderBy(sql`CONCAT(${contacts.firstName}, ' ', ${contacts.lastName})`);

    return owners;
  } catch (error) {
    console.error("Error fetching current listing owners:", error);
    throw error;
  }
}

// Update listing owners - replaces all existing owner relationships for a listing
export async function updateListingOwners(listingId: number, ownerIds: number[]) {
  try {
    // First, deactivate all existing owner relationships for this listing
    await db
      .update(listingContacts)
      .set({ isActive: false })
      .where(
        and(
          eq(listingContacts.listingId, BigInt(listingId)),
          eq(listingContacts.contactType, 'owner')
        )
      );

    // Then, create new active relationships for the selected owners
    if (ownerIds.length > 0) {
      const newRelationships = ownerIds.map(ownerId => ({
        listingId: BigInt(listingId),
        contactId: BigInt(ownerId),
        contactType: 'owner' as const,
        isActive: true
      }));

      await db.insert(listingContacts).values(newRelationships);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating listing owners:", error);
    throw error;
  }
}

// Get contact by ID with type information for display
export async function getContactByIdWithType(contactId: number) {
  try {
    // First get the basic contact
    const [contact] = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.contactId, BigInt(contactId)),
          eq(contacts.isActive, true)
        )
      );

    if (!contact) {
      return null;
    }

    // Try to get the contact type from listing relationships
    const [contactWithType] = await db
      .select({
        contactType: listingContacts.contactType
      })
      .from(listingContacts)
      .where(
        and(
          eq(listingContacts.contactId, BigInt(contactId)),
          eq(listingContacts.isActive, true)
        )
      )
      .limit(1);

    // Return contact with type (default to 'demandante' if no listing relationship)
    return {
      ...contact,
      contactType: contactWithType?.contactType || 'demandante'
    };
  } catch (error) {
    console.error("Error fetching contact with type:", error);
    throw error;
  }
}

// Get listings associated with a specific contact (owner)
export async function getListingsByContact(contactId: number) {
  try {
    const contactListings = await db
      .select({
        // Listing fields
        listingId: listings.listingId,
        propertyId: listings.propertyId,
        price: listings.price,
        status: listings.status,
        listingType: listings.listingType,
        isActive: listings.isActive,
        isFeatured: listings.isFeatured,
        isBankOwned: listings.isBankOwned,
        viewCount: listings.viewCount,
        inquiryCount: listings.inquiryCount,
        
        // Property fields
        referenceNumber: properties.referenceNumber,
        title: properties.title,
        propertyType: properties.propertyType,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        squareMeter: properties.squareMeter,
        street: properties.street,
        addressDetails: properties.addressDetails,
        postalCode: properties.postalCode,
        latitude: properties.latitude,
        longitude: properties.longitude,
        
        // Location fields
        city: locations.city,
        province: locations.province,
        municipality: locations.municipality,
        neighborhood: locations.neighborhood,
        
        // Agent information
        agentName: sql<string>`CONCAT(u.first_name, ' ', u.last_name)`,
        
        // Image fields (we'll get the first and second images for each listing)
        imageUrl: sql<string>`(
          SELECT pi.image_url 
          FROM property_images pi 
          WHERE pi.property_id = ${properties.propertyId} 
          AND pi.is_active = true 
          AND pi.image_order = 1
          LIMIT 1
        )`,
        imageUrl2: sql<string>`(
          SELECT pi.image_url 
          FROM property_images pi 
          WHERE pi.property_id = ${properties.propertyId} 
          AND pi.is_active = true 
          AND pi.image_order = 2
          LIMIT 1
        )`
      })
      .from(listingContacts)
      .innerJoin(
        listings,
        and(
          eq(listingContacts.listingId, listings.listingId),
          eq(listings.isActive, true)
        )
      )
      .innerJoin(
        properties,
        eq(listings.propertyId, properties.propertyId)
      )
      .leftJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId)
      )
      .leftJoin(
        sql`users u`,
        eq(listings.agentId, sql`u.user_id`)
      )
      .where(
        and(
          eq(listingContacts.contactId, BigInt(contactId)),
          eq(listingContacts.contactType, 'owner'),
          eq(listingContacts.isActive, true)
        )
      )
      .orderBy(listings.createdAt);

    return contactListings;
  } catch (error) {
    console.error("Error fetching listings by contact:", error);
    throw error;
  }
} 