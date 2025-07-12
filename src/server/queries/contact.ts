'use server'

import { db } from "../db"
import { contacts, listings, properties, locations, prospects } from "../db/schema"
import { eq, and, or, like, sql } from "drizzle-orm"
import type { Contact } from "../../lib/data"
import { listingContacts } from "../db/schema"
import { prospectUtils } from "../../lib/utils"

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
    roles?: string[]; // Changed from contactType to roles
    searchQuery?: string;
    lastContactFilter?: string;
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
      if (filters.searchQuery) {
        whereConditions.push(
          or(
            like(contacts.firstName, `%${filters.searchQuery}%`),
            like(contacts.lastName, `%${filters.searchQuery}%`),
            like(contacts.email, `%${filters.searchQuery}%`),
            like(contacts.phone, `%${filters.searchQuery}%`)
          )
        );
      }
    } else {
      // By default, only show active contacts
      whereConditions.push(eq(contacts.isActive, true));
    }

    // Get unique contacts with calculated role counts using LEFT JOINs and GROUP BY
    const uniqueContacts = await db
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
        // Calculate role counts using conditional aggregation
        ownerCount: sql<number>`
          COUNT(CASE WHEN ${listingContacts.contactType} = 'owner' AND ${listingContacts.isActive} = true THEN 1 END)
        `,
        buyerCount: sql<number>`
          COUNT(CASE WHEN ${listingContacts.contactType} = 'buyer' AND ${listingContacts.isActive} = true THEN 1 END)
        `,
        // Count prospects for this contact
        prospectCount: sql<number>`
          (SELECT COUNT(*) FROM prospects WHERE contact_id = ${contacts.contactId})
        `,
        // Get basic property info from first active listing (if any)
        firstListingId: sql<bigint | null>`
          MAX(CASE WHEN ${listingContacts.isActive} = true THEN ${listingContacts.listingId} END)
        `,
        street: sql<string | null>`
          MAX(CASE WHEN ${listingContacts.isActive} = true THEN ${properties.street} END)
        `,
        city: sql<string | null>`
          MAX(CASE WHEN ${listingContacts.isActive} = true THEN ${locations.city} END)
        `,
        propertyType: sql<string | null>`
          MAX(CASE WHEN ${listingContacts.isActive} = true THEN ${properties.propertyType} END)
        `,
        listingType: sql<string | null>`
          MAX(CASE WHEN ${listingContacts.isActive} = true THEN ${listings.listingType} END)
        `,
      })
      .from(contacts)
      .leftJoin(
        listingContacts,
        and(
          eq(contacts.contactId, listingContacts.contactId),
          eq(listingContacts.isActive, true)
        )
      )
      .leftJoin(
        listings,
        and(
          eq(listingContacts.listingId, listings.listingId),
          eq(listings.isActive, true)
        )
      )
      .leftJoin(
        properties,
        eq(listings.propertyId, properties.propertyId)
      )
      .leftJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId)
      )
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(
        contacts.contactId,
        contacts.firstName,
        contacts.lastName,
        contacts.email,
        contacts.phone,
        contacts.additionalInfo,
        contacts.orgId,
        contacts.isActive,
        contacts.createdAt,
        contacts.updatedAt
      )
      .limit(limit)
      .offset(offset)
      .orderBy(contacts.createdAt);

    // OPTIMIZATION: Batch fetch all prospects for all contacts in one query
    const contactIds = uniqueContacts.map(c => c.contactId);
    const allProspects = await db
      .select({
        contactId: prospects.contactId,
        listingType: prospects.listingType,
        propertyType: prospects.propertyType,
        preferredAreas: prospects.preferredAreas,
        createdAt: prospects.createdAt
      })
      .from(prospects)
      .where(
        and(
          sql`${prospects.contactId} IN (${contactIds.join(',')})`,
          sql`${prospects.contactId} IS NOT NULL`
        )
      )
      .orderBy(sql`${prospects.createdAt} DESC`);

    // Group prospects by contactId for faster lookup
    const prospectsByContact = allProspects.reduce((acc, prospect) => {
      const contactId = prospect.contactId.toString();
      if (!acc[contactId]) {
        acc[contactId] = [];
      }
      acc[contactId].push(prospect);
      return acc;
    }, {} as Record<string, typeof allProspects>);

    // For each contact, process their prospects
    const contactsWithProspects = uniqueContacts.map((contact) => {
      const contactId = contact.contactId.toString();
      const contactProspects = prospectsByContact[contactId] || [];
      
      // Generate titles for prospects (limit to most recent 5 for performance)
      const prospectTitles = contactProspects
        .slice(0, 5) // Limit to 5 most recent prospects
        .map(prospect => {
          let preferredArea: string | undefined;
          if (prospect.preferredAreas) {
            let areas: any[] = [];
            if (typeof prospect.preferredAreas === 'string') {
              try {
                areas = JSON.parse(prospect.preferredAreas);
              } catch (e) {
                preferredArea = prospect.preferredAreas;
              }
            } else if (Array.isArray(prospect.preferredAreas)) {
              areas = prospect.preferredAreas;
            }

            if (Array.isArray(areas) && areas.length > 0) {
              if (areas.length === 1) {
                preferredArea = areas[0]?.name;
              } else if (areas.length > 1) {
                preferredArea = contact.city || areas[0]?.name;
              }
            }
          }

          const title = prospectUtils.generateSimpleProspectTitle(
            prospect.listingType || undefined,
            prospect.propertyType || undefined,
            preferredArea
          );

          return title;
        })
        .filter(title => title.trim() !== ''); // Remove empty titles

      const contactData = {
        ...contact,
        prospectTitles, // Now an array of all prospect titles
        prospectCount: contact.prospectCount,
        // Role flags for UI - based on counts
        isOwner: contact.ownerCount > 0,
        isBuyer: contact.buyerCount > 0,
        isInteresado: contact.prospectCount > 0,
        // Role counts for display
        ownerCount: contact.ownerCount,
        buyerCount: contact.buyerCount
      };

      return contactData;
    });

    // Apply role filtering after determining role flags
    let filteredContacts = contactsWithProspects;
    if (filters?.roles && filters.roles.length > 0) {
      filteredContacts = filteredContacts.filter(contact => {
        // Check if contact has any of the requested roles
        return filters.roles!.some(role => {
          switch (role) {
            case 'owner':
              return contact.isOwner;
            case 'buyer':
              return contact.isBuyer;
            case 'interested':
              return contact.isInteresado;
            default:
              return false;
          }
        });
      });
    }

    // Apply last contact date filtering
    if (filters?.lastContactFilter && filters.lastContactFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

      filteredContacts = filteredContacts.filter(contact => {
        const lastContactDate = contact.updatedAt; // Using updatedAt as proxy for last contact
        
        switch (filters.lastContactFilter) {
          case 'today':
            return lastContactDate >= today;
          case 'week':
            return lastContactDate >= weekAgo;
          case 'month':
            return lastContactDate >= monthAgo;
          case 'quarter':
            return lastContactDate >= quarterAgo;
          case 'year':
            return lastContactDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    return filteredContacts;
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
    // First, get the basic contact information
    const [contact] = await db
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
      })
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

    // Then, get the role counts separately to avoid complex JOIN issues
    const ownerCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(listingContacts)
      .where(
        and(
          eq(listingContacts.contactId, BigInt(contactId)),
          eq(listingContacts.contactType, 'owner'),
          eq(listingContacts.isActive, true)
        )
      );

    const buyerCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(listingContacts)
      .where(
        and(
          eq(listingContacts.contactId, BigInt(contactId)),
          eq(listingContacts.contactType, 'buyer'),
          eq(listingContacts.isActive, true)
        )
      );

    const ownerCount = ownerCountResult[0]?.count || 0;
    const buyerCount = buyerCountResult[0]?.count || 0;

    // Get prospect count
    const prospectCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(prospects)
      .where(eq(prospects.contactId, BigInt(contactId)));

    const prospectCount = prospectCountResult[0]?.count || 0;

    // Get all prospect titles for this contact
    let prospectTitles: string[] = [];
    
    if (prospectCount > 0) {
      const contactProspects = await db
        .select({
          listingType: prospects.listingType,
          propertyType: prospects.propertyType,
          preferredAreas: prospects.preferredAreas,
          createdAt: prospects.createdAt
        })
        .from(prospects)
        .where(eq(prospects.contactId, BigInt(contactId)))
        .orderBy(sql`${prospects.createdAt} DESC`);

      prospectTitles = contactProspects.map(prospect => {
                let preferredArea: string | undefined;
        if (prospect.preferredAreas) {
          let areas: any[] = [];
          
          if (typeof prospect.preferredAreas === 'string') {
            try {
              areas = JSON.parse(prospect.preferredAreas);
            } catch (e) {
              preferredArea = prospect.preferredAreas;
            }
          } else if (Array.isArray(prospect.preferredAreas)) {
            areas = prospect.preferredAreas;
          }
          
          if (Array.isArray(areas) && areas.length > 0) {
            if (areas.length === 1) {
              preferredArea = areas[0]?.name;
            } else if (areas.length > 1) {
              preferredArea = areas[0]?.name;
            }
          }
        }

        const title = prospectUtils.generateSimpleProspectTitle(
          prospect.listingType || undefined,
          prospect.propertyType || undefined,
          preferredArea
        );

        // Log each prospect title generation for individual contact (simplified)
        console.log(`🔍 Individual Prospect Title for Contact ${contactId}:`, {
          areasCount: Array.isArray(prospect.preferredAreas) ? prospect.preferredAreas.length : 0,
          parsedPreferredArea: preferredArea,
          generatedTitle: title
        });

        return title;
      }).filter(title => title.trim() !== '');

      // Log final prospect titles array for individual contact
      console.log(`📝 Final prospectTitles for Contact ${contactId}:`, {
        contactId: contactId.toString(),
        prospectCount: prospectCount,
        prospectTitlesCount: prospectTitles.length,
        prospectTitles: prospectTitles
      });
    }

    return {
      ...contact,
      prospectTitles, // Now an array of all prospect titles
      // Include role counts and flags for UI consistency
      ownerCount,
      buyerCount,
      prospectCount,
      isOwner: ownerCount > 0,
      isBuyer: buyerCount > 0,
      isInteresado: prospectCount > 0
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

// Get listings associated with a specific contact (buyer)
export async function getListingsByContactAsBuyer(contactId: number) {
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
        agentName: sql<string | null>`(
          SELECT CONCAT(u.first_name, ' ', u.last_name)
          FROM users u
          WHERE u.user_id = ${listings.agentId}
        )`,
        
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

        // Image fields
        imageUrl: sql<string | null>`(
          SELECT image_url 
          FROM property_images 
          WHERE property_id = ${properties.propertyId} 
          AND is_active = true 
          AND image_order = 1
          LIMIT 1
        )`,
        s3key: sql<string | null>`(
          SELECT s3key 
          FROM property_images 
          WHERE property_id = ${properties.propertyId} 
          AND is_active = true 
          AND image_order = 1
          LIMIT 1
        )`,
        imageUrl2: sql<string | null>`(
          SELECT image_url 
          FROM property_images 
          WHERE property_id = ${properties.propertyId} 
          AND is_active = true 
          AND image_order = 2
          LIMIT 1
        )`,
        s3key2: sql<string | null>`(
          SELECT s3key 
          FROM property_images 
          WHERE property_id = ${properties.propertyId} 
          AND is_active = true 
          AND image_order = 2
          LIMIT 1
        )`,
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
      .where(
        and(
          eq(listingContacts.contactId, BigInt(contactId)),
          eq(listingContacts.contactType, 'buyer'),
          eq(listingContacts.isActive, true)
        )
      )
      .orderBy(listings.createdAt);

    return contactListings;
  } catch (error) {
    console.error("Error fetching listings by contact as buyer:", error);
    throw error;
  }
} 