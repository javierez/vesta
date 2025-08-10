"use server";

import { db } from "~/server/db";
import { 
  prospects, 
  leads, 
  deals, 
  contacts, 
  listings, 
  properties
} from "~/server/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { getCurrentUserAccountId } from "~/lib/dal";
import type { 
  KanbanData, 
  KanbanColumn, 
  OperationCard, 
  OperationType, 
  ListingTypeFilter,
  OperationFilters 
} from "~/types/operations";
import { getStatusesForOperationType } from "~/types/operations";

// Get kanban data for a specific operation type
export async function getKanbanData(
  operationType: OperationType,
  filters: OperationFilters = {}
): Promise<KanbanData> {
  const accountId = await getCurrentUserAccountId();
  
  try {
    const { listingType = 'all', status, searchQuery } = filters;
    
    // Get all operations for this type
    const operations = await getOperationsByType(
      operationType, 
      BigInt(accountId), 
      { listingType, status, searchQuery }
    );
    
    // Get valid statuses for this operation type
    const validStatuses = getStatusesForOperationType(operationType);
    
    // Create columns for each status
    const columns: KanbanColumn[] = validStatuses.map(statusName => {
      const statusOperations = operations.filter(op => op.status === statusName);
      
      return {
        id: statusName,
        title: statusName,
        status: statusName,
        items: statusOperations,
        itemCount: statusOperations.length,
      };
    });
    
    return {
      columns,
      totalCount: operations.length,
    };
    
  } catch (error) {
    console.error(`Error fetching kanban data for ${operationType}:`, error);
    return {
      columns: [],
      totalCount: 0,
    };
  }
}

// Get operations by type with proper joins and filtering
async function getOperationsByType(
  operationType: OperationType,
  accountId: bigint,
  filters: { listingType?: ListingTypeFilter; status?: string; searchQuery?: string } = {}
): Promise<OperationCard[]> {
  const { listingType = 'all', status, searchQuery } = filters;
  
  switch (operationType) {
    case 'prospects':
      return getProspectsAsCards(accountId, { listingType, status, searchQuery });
      
    case 'leads':
      return getLeadsAsCards(accountId, { listingType, status, searchQuery });
      
    case 'deals':
      return getDealsAsCards(accountId, { listingType, status, searchQuery });
      
    default:
      return [];
  }
}

// Get prospects formatted as operation cards
async function getProspectsAsCards(
  accountId: bigint,
  filters: { listingType?: ListingTypeFilter; status?: string; searchQuery?: string }
): Promise<OperationCard[]> {
  const { listingType, status, searchQuery: _searchQuery } = filters;
  
  // Build WHERE conditions
  const conditions = [eq(contacts.accountId, accountId)];
  
  if (listingType && listingType !== 'all') {
    conditions.push(eq(prospects.listingType, listingType === 'sale' ? 'Sale' : 'Rent'));
  }
  
  if (status) {
    conditions.push(eq(prospects.status, status));
  }
  
  const prospectsQuery = await db
    .select({
      // Prospect data
      id: prospects.id,
      status: prospects.status,
      listingType: prospects.listingType,
      propertyType: prospects.propertyType,
      minPrice: prospects.minPrice,
      maxPrice: prospects.maxPrice,
      urgencyLevel: prospects.urgencyLevel,
      createdAt: prospects.createdAt,
      updatedAt: prospects.updatedAt,
      
      // Contact data
      contactName: sql<string>`CONCAT(${contacts.firstName}, ' ', ${contacts.lastName})`,
      contactEmail: contacts.email,
      contactPhone: contacts.phone,
      
      // TODO: Get latest task and activity data
    })
    .from(prospects)
    .innerJoin(contacts, eq(prospects.contactId, contacts.contactId))
    .where(and(...conditions))
    .orderBy(desc(prospects.updatedAt));
  
  // Convert to OperationCard format
  return prospectsQuery.map(prospect => ({
    id: prospect.id,
    type: 'prospect' as const,
    status: prospect.status,
    listingType: (prospect.listingType as 'Sale' | 'Rent') ?? 'Sale',
    contactName: prospect.contactName,
    needSummary: buildNeedSummary(prospect),
    urgencyLevel: prospect.urgencyLevel || undefined,
    lastActivity: prospect.updatedAt,
    // TODO: Get actual next task from tasks table
    nextTask: undefined,
  }));
}

// Get leads formatted as operation cards
async function getLeadsAsCards(
  accountId: bigint,
  filters: { listingType?: ListingTypeFilter; status?: string; searchQuery?: string }
): Promise<OperationCard[]> {
  const { listingType, status, searchQuery: _searchQuery } = filters;
  
  // Build WHERE conditions
  const conditions = [eq(contacts.accountId, accountId)];
  
  if (status) {
    conditions.push(eq(leads.status, status));
  }
  
  const leadsQuery = await db
    .select({
      // Lead data
      id: leads.leadId,
      status: leads.status,
      source: leads.source,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
      
      // Contact data
      contactName: sql<string>`CONCAT(${contacts.firstName}, ' ', ${contacts.lastName})`,
      
      // Listing data (if available)
      listingType: listings.listingType,
      listingAddress: sql<string>`
        CASE WHEN ${listings.listingId} IS NOT NULL 
        THEN CONCAT(${properties.street}, ', ', ${properties.addressDetails})
        ELSE NULL END
      `,
    })
    .from(leads)
    .innerJoin(contacts, eq(leads.contactId, contacts.contactId))
    .leftJoin(listings, eq(leads.listingId, listings.listingId))
    .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
    .where(and(...conditions))
    .orderBy(desc(leads.updatedAt));
  
  // Filter by listing type after query if specified
  const filteredLeads = listingType && listingType !== 'all'
    ? leadsQuery.filter(lead => {
        const expectedType = listingType === 'sale' ? 'Sale' : 'Rent';
        return !lead.listingType || lead.listingType === expectedType;
      })
    : leadsQuery;
  
  // Convert to OperationCard format
  return filteredLeads.map(lead => ({
    id: lead.id,
    type: 'lead' as const,
    status: lead.status,
    listingType: (lead.listingType as 'Sale' | 'Rent') || 'Sale',
    contactName: lead.contactName,
    listingAddress: lead.listingAddress || undefined,
    source: lead.source || undefined,
    lastActivity: lead.updatedAt,
    // TODO: Get actual next task from tasks table
    nextTask: undefined,
  }));
}

// Get deals formatted as operation cards
async function getDealsAsCards(
  accountId: bigint,
  filters: { listingType?: ListingTypeFilter; status?: string; searchQuery?: string }
): Promise<OperationCard[]> {
  const { listingType, status, searchQuery: _searchQuery } = filters;
  
  // Build WHERE conditions
  const conditions = [eq(properties.accountId, accountId)];
  
  if (listingType && listingType !== 'all') {
    conditions.push(eq(listings.listingType, listingType === 'sale' ? 'Sale' : 'Rent'));
  }
  
  if (status) {
    conditions.push(eq(deals.status, status));
  }
  
  const dealsQuery = await db
    .select({
      // Deal data
      id: deals.dealId,
      status: deals.status,
      closeDate: deals.closeDate,
      createdAt: deals.createdAt,
      updatedAt: deals.updatedAt,
      
      // Listing data
      listingType: listings.listingType,
      listingPrice: listings.price,
      listingAddress: sql<string>`CONCAT(${properties.street}, ', ', ${properties.addressDetails})`,
      
      // TODO: Get participants and amount data
    })
    .from(deals)
    .innerJoin(listings, eq(deals.listingId, listings.listingId))
    .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
    .where(and(...conditions))
    .orderBy(desc(deals.updatedAt));
  
  // Convert to OperationCard format
  return dealsQuery.map(deal => ({
    id: deal.id,
    type: 'deal' as const,
    status: deal.status,
    listingType: (deal.listingType as 'Sale' | 'Rent') || 'Sale',
    listingAddress: deal.listingAddress || undefined,
    amount: deal.listingPrice ? Number(deal.listingPrice) : undefined,
    closeDate: deal.closeDate || undefined,
    lastActivity: deal.updatedAt,
    // TODO: Get participants from deal_participants table
    participants: [],
    // TODO: Get actual next task from tasks table
    nextTask: undefined,
  }));
}

// Helper function to build need summary for prospects
function buildNeedSummary(prospect: {
  propertyType?: string | null;
  minPrice?: string | null;
  maxPrice?: string | null;
  minBedrooms?: number | null;
  minSquareMeters?: number | null;
}): string {
  const parts: string[] = [];
  
  if (prospect.propertyType) {
    parts.push(prospect.propertyType);
  }
  
  if (prospect.minBedrooms) {
    parts.push(`${prospect.minBedrooms}+ bedrooms`);
  }
  
  if (prospect.minSquareMeters) {
    parts.push(`${prospect.minSquareMeters}+ m²`);
  }
  
  if (prospect.minPrice || prospect.maxPrice) {
    const minPrice = prospect.minPrice ? `€${Number(prospect.minPrice).toLocaleString()}` : '';
    const maxPrice = prospect.maxPrice ? `€${Number(prospect.maxPrice).toLocaleString()}` : '';
    
    if (minPrice && maxPrice) {
      parts.push(`${minPrice} - ${maxPrice}`);
    } else if (minPrice) {
      parts.push(`from ${minPrice}`);
    } else if (maxPrice) {
      parts.push(`up to ${maxPrice}`);
    }
  }
  
  return parts.join(', ') || 'No specific requirements';
}

// Get operation counts by status for filter toggle
export async function getOperationCounts(
  operationType: OperationType,
  accountId?: number
): Promise<{ sale: number; rent: number; all: number }> {
  const resolvedAccountId = accountId || await getCurrentUserAccountId();
  
  try {
    let saleCount = 0;
    let rentCount = 0;
    
    switch (operationType) {
      case 'prospects':
        const prospectCounts = await db
          .select({
            listingType: prospects.listingType,
            count: sql<number>`COUNT(*)`,
          })
          .from(prospects)
          .innerJoin(contacts, eq(prospects.contactId, contacts.contactId))
          .where(eq(contacts.accountId, BigInt(resolvedAccountId)))
          .groupBy(prospects.listingType);
        
        for (const row of prospectCounts) {
          if (row.listingType === 'Sale') saleCount = row.count;
          if (row.listingType === 'Rent') rentCount = row.count;
        }
        break;
        
      case 'leads':
        const leadCounts = await db
          .select({
            listingType: listings.listingType,
            count: sql<number>`COUNT(*)`,
          })
          .from(leads)
          .innerJoin(contacts, eq(leads.contactId, contacts.contactId))
          .leftJoin(listings, eq(leads.listingId, listings.listingId))
          .where(eq(contacts.accountId, BigInt(resolvedAccountId)))
          .groupBy(listings.listingType);
        
        for (const row of leadCounts) {
          if (row.listingType === 'Sale') saleCount = row.count;
          if (row.listingType === 'Rent') rentCount = row.count;
        }
        break;
        
      case 'deals':
        const dealCounts = await db
          .select({
            listingType: listings.listingType,
            count: sql<number>`COUNT(*)`,
          })
          .from(deals)
          .innerJoin(listings, eq(deals.listingId, listings.listingId))
          .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
          .where(eq(properties.accountId, BigInt(resolvedAccountId)))
          .groupBy(listings.listingType);
        
        for (const row of dealCounts) {
          if (row.listingType === 'Sale') saleCount = row.count;
          if (row.listingType === 'Rent') rentCount = row.count;
        }
        break;
    }
    
    return {
      sale: saleCount,
      rent: rentCount,
      all: saleCount + rentCount,
    };
    
  } catch (error) {
    console.error(`Error fetching operation counts for ${operationType}:`, error);
    return { sale: 0, rent: 0, all: 0 };
  }
}

// Wrapper functions with automatic account filtering
export async function getKanbanDataWithAuth(
  operationType: OperationType,
  filters?: OperationFilters
): Promise<KanbanData> {
  return getKanbanData(operationType, filters);
}

export async function getOperationCountsWithAuth(
  operationType: OperationType
): Promise<{ sale: number; rent: number; all: number }> {
  return getOperationCounts(operationType);
}