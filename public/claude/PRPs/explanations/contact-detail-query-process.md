# Contact Detail Query Process and Data Fetching

## Overview
This document explains the complete data query process and components involved in displaying a contact's detailed information in the Vesta application. The system follows a multi-layered architecture with server-side data fetching, authentication, and client-side state management.

## Main Entry Point

### Contact Detail Page (`src/app/(dashboard)/contactos/[id]/page.tsx`)

**Primary Query Function**: `getContactByIdWithTypeWithAuth(contactId)`

The page component serves as the main entry point and performs the initial data fetch:

1. **Route Parameter Extraction**: Unwraps the dynamic `id` parameter from Next.js
2. **Main Contact Query**: Calls `getContactByIdWithTypeWithAuth(parseInt(id))`
3. **Error Handling**: Returns `notFound()` if contact doesn't exist
4. **Data Transformation**: Converts the raw contact data into `ExtendedContact` format
5. **Component Rendering**: Passes transformed data to `ContactDetailLayout`

```typescript
const contact = await getContactByIdWithTypeWithAuth(parseInt(unwrappedParams.id));
```

## Authentication Layer

### Data Access Layer (`src/lib/dal.ts`)

**Core Security Function**: `getCurrentUserAccountId()`

The authentication system ensures multi-tenant data isolation:

1. **Session Validation**: Extracts user session from headers
2. **Account ID Extraction**: Gets the user's organization/account ID
3. **Security Enforcement**: All queries are filtered by the authenticated user's account
4. **Error Handling**: Throws errors for invalid sessions or missing account context

```typescript
export async function getCurrentUserAccountId(): Promise<number> {
  const session = await getSecureSession();
  if (!session) {
    throw new Error("No authenticated user session found");
  }
  return session.user.accountId;
}
```

## Primary Contact Query

### Contact Query Service (`src/server/queries/contact.ts`)

**Main Query Function**: `getContactByIdWithType(contactId, accountId)`

This function performs a comprehensive data fetch including:

#### 1. Basic Contact Information Query
```sql
SELECT contactId, firstName, lastName, email, phone, additionalInfo, 
       orgId, isActive, createdAt, updatedAt
FROM contacts
WHERE contactId = ? AND accountId = ? AND isActive = true
```

**Data Fetched:**
- `contactId` - Unique identifier for the contact
- `firstName` - Contact's first name
- `lastName` - Contact's last name  
- `email` - Contact's email address
- `phone` - Contact's phone number
- `additionalInfo` - JSON object with custom fields and notes
- `orgId` - Organization/company the contact belongs to
- `isActive` - Whether the contact is active or soft-deleted
- `createdAt` - When the contact was first created
- `updatedAt` - Last modification timestamp

**Used in:**
- Contact header display (`ContactFormHeader`)
- Contact information tab forms
- Breadcrumb navigation
- Contact badges and status indicators

#### 2. Owner Count Query
```sql
SELECT COUNT(*) FROM listingContacts 
WHERE contactId = ? AND contactType = 'owner' AND isActive = true
```

**Data Fetched:**
- Count of active property listings where this contact is the owner

**Used in:**
- Owner badge display with count (`ContactFormHeader`)
- Tab visibility logic (shows "Propiedades" tab if > 0)
- Role-based feature access

#### 3. Buyer Count Query  
```sql
SELECT COUNT(*) FROM listingContacts 
WHERE contactId = ? AND contactType = 'buyer' AND isActive = true
```

**Data Fetched:**
- Count of active property listings where this contact is interested as a buyer

**Used in:**
- Buyer/Demandante badge display with count
- Tab visibility for buyer-specific features
- Property interests tracking

#### 4. Prospect Count Query
```sql  
SELECT COUNT(*) FROM prospects WHERE contactId = ?
```

**Data Fetched:**
- Count of search criteria/prospect records for this contact

**Used in:**
- "Interesado" badge display with count
- "Solicitudes" tab visibility
- Search request management

#### 5. Prospect Details Query
```sql
SELECT listingType, propertyType, preferredAreas, createdAt
FROM prospects 
WHERE contactId = ? 
ORDER BY createdAt DESC
```

**Data Fetched:**
- `listingType` - Type of listing sought (rent/sale)
- `propertyType` - Type of property desired (apartment/house/etc)
- `preferredAreas` - JSON array of preferred neighborhoods/locations
- `createdAt` - When the prospect was created

**Used in:**
- Prospect title generation for display
- Search criteria summary in badges
- Prospect management in "Solicitudes" tab

#### 6. Multi-Table Joins for Complete Data
The query system uses complex JOINs to gather related data:
- `contacts` ← `listingContacts` (for role relationships)
- `listingContacts` ← `listings` (for property listings)
- `listings` ← `properties` (for property details)
- `properties` ← `locations` (for geographic information)
- `contacts` ← `prospects` (for buyer interests)

## Component Architecture

### ContactDetailLayout (`src/components/contactos/detail/contact-detail-layout.tsx`)

**Role**: Layout orchestrator and data transformer

1. **Data Transformation**: Converts server data to client-compatible format
2. **Component Composition**: Renders three main sub-components:
   - `ContactBreadcrumb` - Navigation breadcrumbs
   - `ContactFormHeader` - Contact summary and badges
   - `ContactTabs` - Tabbed interface for detailed information

### ContactTabs (`src/components/contactos/detail/contact-tabs.tsx`)

**Role**: Primary data management and user interface

This component handles multiple data sources and user interactions:

#### Additional Data Fetching (Client-Side)

##### 1. Property Listings Query (For Owners)
**Function**: `getOwnerListingsWithAuth(contactId)`

```sql
SELECT l.listingId, l.propertyId, l.price, l.status, l.listingType, l.isActive,
       l.isFeatured, l.isBankOwned, l.viewCount, l.inquiryCount,
       p.referenceNumber, p.title, p.propertyType, p.bedrooms, p.bathrooms,
       p.squareMeter, p.street, p.addressDetails, p.postalCode, 
       p.latitude, p.longitude,
       loc.city, loc.province, loc.municipality, loc.neighborhood,
       (SELECT image_url FROM property_images WHERE property_id = p.propertyId 
        AND is_active = true AND image_order = 1 LIMIT 1) as imageUrl,
       (SELECT s3key FROM property_images WHERE property_id = p.propertyId 
        AND is_active = true AND image_order = 1 LIMIT 1) as s3key
FROM listingContacts lc
INNER JOIN listings l ON lc.listingId = l.listingId
INNER JOIN properties p ON l.propertyId = p.propertyId  
LEFT JOIN locations loc ON p.neighborhoodId = loc.neighborhoodId
WHERE lc.contactId = ? AND lc.contactType = 'owner' AND lc.isActive = true
```

**Data Fetched:**
- **Listing Details**: ID, price, status, type, featured status, bank ownership
- **Property Info**: Reference number, title, type, bedrooms, bathrooms, size
- **Location Data**: Street address, city, province, neighborhood
- **Images**: Primary and secondary property images with S3 keys
- **Metrics**: View count, inquiry count for analytics

**Used in:**
- "Propiedades" tab property cards display
- Property thumbnails and basic info
- Owner portfolio management
- Property performance metrics

##### 2. Property Listings Query (For Buyers)  
**Function**: `getBuyerListingsWithAuth(contactId)`

```sql
SELECT l.listingId, l.propertyId, l.price, l.status, l.listingType, l.isActive,
       l.isFeatured, l.isBankOwned, l.viewCount, l.inquiryCount,
       (SELECT CONCAT(u.first_name, ' ', u.last_name) FROM users u 
        WHERE u.id = l.agentId) as agentName,
       p.referenceNumber, p.title, p.propertyType, p.bedrooms, p.bathrooms,
       p.squareMeter, p.street, p.addressDetails, p.postalCode,
       p.latitude, p.longitude,
       loc.city, loc.province, loc.municipality, loc.neighborhood,
       [image queries same as above]
FROM listingContacts lc
INNER JOIN listings l ON lc.listingId = l.listingId  
INNER JOIN properties p ON l.propertyId = p.propertyId
LEFT JOIN locations loc ON p.neighborhoodId = loc.neighborhoodId
WHERE lc.contactId = ? AND lc.contactType = 'buyer' AND lc.isActive = true
```

**Data Fetched:**
- Same property/listing data as owner query
- **Additional**: Agent name for buyer inquiries
- Buyer-specific relationship context

**Used in:**
- "Propiedades" tab for buyer's interested properties
- Buyer inquiry tracking
- Agent contact information display

##### 3. Detailed Prospect Data Query
**Function**: `getProspectsByContactWithAuth(contactId)`

```sql  
SELECT p.id, p.contactId, p.status, p.listingType, p.propertyType,
       p.maxPrice, p.preferredAreas, p.minBedrooms, p.minBathrooms,
       p.minSquareMeters, p.moveInBy, p.extras, p.urgencyLevel,
       p.fundingReady, p.notesInternal, p.createdAt, p.updatedAt,
       c.contactId, c.firstName, c.lastName, c.email, c.phone
FROM prospects p
INNER JOIN contacts c ON p.contactId = c.contactId
WHERE p.contactId = ? AND c.accountId = ?
ORDER BY p.createdAt DESC
```

**Data Fetched:**
- **Search Criteria**: Listing type, property type, price range
- **Requirements**: Bedrooms, bathrooms, minimum size
- **Preferences**: Preferred areas (JSON), move-in timeline
- **Buyer Context**: Urgency level, funding readiness
- **Internal Notes**: Agent notes and comments
- **Contact Info**: Associated contact details

**Used in:**
- "Solicitudes" tab prospect management
- Compact prospect cards display
- Detailed prospect editing forms
- Search criteria matching algorithms

#### Dynamic Query Execution

The component performs additional queries based on user interactions:

##### 4. Location Lookup Query
**Function**: `getLocationByNeighborhoodId(neighborhoodId)`

```sql
SELECT neighborhoodId, neighborhood, city, municipality, province
FROM locations 
WHERE neighborhoodId = ?
```

**Data Fetched:**
- Complete location hierarchy for a neighborhood
- Used for converting stored neighborhood IDs to display names

**Used in:**
- Prospect form area selection
- Converting preferred area IDs to readable names
- Location-based search functionality

##### 5. Contact Update Query
**Function**: `updateContactWithAuth(contactId, data)`

```sql
UPDATE contacts 
SET firstName = ?, lastName = ?, email = ?, phone = ?, additionalInfo = ?
WHERE contactId = ? AND accountId = ? AND isActive = true
```

**Data Updated:**
- Basic contact information fields
- Additional info JSON with notes and custom fields

**Used in:**
- Contact information tab form saves
- Notes section updates
- Contact detail modifications

##### 6. Prospect Management Queries
**Function**: `createProspectWithAuth(prospectData)` / `updateProspectWithAuth(id, data)`

```sql
-- Create
INSERT INTO prospects (contactId, status, listingType, propertyType, maxPrice, 
                      preferredAreas, minBedrooms, minBathrooms, minSquareMeters,
                      moveInBy, extras, urgencyLevel, fundingReady, notesInternal)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

-- Update  
UPDATE prospects 
SET status = ?, listingType = ?, propertyType = ?, maxPrice = ?,
    preferredAreas = ?, minBedrooms = ?, minBathrooms = ?, minSquareMeters = ?,
    moveInBy = ?, extras = ?, urgencyLevel = ?, fundingReady = ?, notesInternal = ?
WHERE id = ? AND contactId IN (SELECT contactId FROM contacts WHERE accountId = ?)
```

**Data Managed:**
- Complete prospect/search criteria records
- Buyer preferences and requirements
- Search parameters for property matching

**Used in:**
- "Solicitudes" tab prospect creation/editing
- Search criteria management
- Buyer requirement tracking

## Complete Query Summary

### All Queries by Execution Context

#### Server-Side Queries (Initial Load)
| Query Function | Data Fetched | Usage | Performance Impact |
|---------------|--------------|-------|-------------------|
| `getCurrentUserAccountId()` | User's account ID | Multi-tenant security | Low - cached session |
| `getContactByIdWithType()` | Basic contact info + role counts | Header, badges, tabs | Medium - multiple counts |
| Basic contact query | firstName, lastName, email, phone, etc. | Contact forms, header display | Low - single record |
| Owner count query | Count of owned properties | Owner badge, tab visibility | Low - simple count |
| Buyer count query | Count of buyer interests | Buyer badge, tab visibility | Low - simple count |  
| Prospect count query | Count of search requests | Interesado badge, tab visibility | Low - simple count |
| Prospect titles query | Prospect details for title generation | Badge summaries | Medium - multiple records + processing |

#### Client-Side Queries (Lazy Load)
| Query Function | Data Fetched | Trigger | Usage |
|---------------|--------------|---------|-------|
| `getOwnerListingsWithAuth()` | Complete owner property data | Tab access + isOwner=true | Property cards, portfolio |
| `getBuyerListingsWithAuth()` | Complete buyer property interests | Tab access + isBuyer=true | Interest tracking |
| `getProspectsByContactWithAuth()` | Detailed prospect criteria | Tab access + hasProspects | Prospect management |
| `getLocationByNeighborhoodId()` | Location hierarchy data | Prospect editing | Area selection |

#### User-Triggered Queries (On Demand)
| Query Function | Data Operation | Trigger | Usage |
|---------------|----------------|---------|-------|
| `updateContactWithAuth()` | Update contact fields | Form saves | Contact modifications |
| `createProspectWithAuth()` | Insert new prospect | New search request | Buyer requirements |
| `updateProspectWithAuth()` | Update prospect criteria | Edit search request | Requirement changes |
| `deleteProspectWithAuth()` | Remove prospect | Delete search request | Cleanup |

### Query Dependencies and Relationships

```mermaid
graph TD
    A[User Request] --> B[Authentication Check]
    B --> C[getContactByIdWithType]
    C --> D[Basic Contact Data]
    C --> E[Role Counts]
    C --> F[Prospect Titles]
    
    G[Tab Access] --> H{Contact Role?}
    H -->|Owner| I[getListingsByContact]
    H -->|Buyer| J[getListingsByContactAsBuyer]  
    H -->|Has Prospects| K[getProspectsByContact]
    
    L[User Actions] --> M{Action Type?}
    M -->|Edit Contact| N[updateContact]
    M -->|Edit Prospect| O[updateProspect]
    M -->|New Prospect| P[createProspect]
    
    Q[Location Needs] --> R[getLocationByNeighborhoodId]
```

### Key Differences: Owner vs Buyer Listings Queries

#### `getOwnerListingsWithAuth()` vs `getBuyerListingsWithAuth()`

| Aspect | Owner Listings Query | Buyer Listings Query |
|--------|---------------------|---------------------|
| **Purpose** | Get properties owned by contact | Get properties contact is interested in buying |
| **Relationship** | `contactType = 'owner'` | `contactType = 'buyer'` |
| **Business Context** | Portfolio management | Interest tracking |
| **Additional Data** | Property performance metrics | Agent contact information |
| **Use Case** | Show what contact owns | Show what contact wants to buy |

#### Detailed Differences:

**1. Relationship Type:**
- **Owner Query**: Finds listings where `listingContacts.contactType = 'owner'`
- **Buyer Query**: Finds listings where `listingContacts.contactType = 'buyer'`

**2. Additional Fields:**
- **Owner Query**: Focuses on property management data (view counts, inquiry metrics)
- **Buyer Query**: Includes `agentName` for buyer inquiries and contact

**3. Business Purpose:**
- **Owner Query**: Portfolio management - "What properties does this contact own?"
- **Buyer Query**: Interest tracking - "What properties is this contact interested in buying?"

**4. UI Context:**
- **Owner Query**: Used in "Propiedades" tab when `isOwner = true`
- **Buyer Query**: Used in "Propiedades" tab when `isBuyer = true`

**5. Data Relationships:**
```
Owner: Contact → listingContacts (as owner) → Listings → Properties
Buyer: Contact → listingContacts (as buyer) → Listings → Properties → Agent Info
```

Both queries return similar property data (price, type, location, images) but with different relationship contexts and additional fields based on the contact's role.

### Data Usage Across Components

#### ContactFormHeader Component
- **Primary Data**: Basic contact info (name, email, phone)
- **Display Logic**: Role flags (isOwner, isBuyer, isInteresado) 
- **Badge Counts**: ownerCount, buyerCount, prospectCount
- **Status Info**: isActive, createdAt

#### ContactTabs - Information Tab
- **Form Fields**: firstName, lastName, email, phone
- **Notes Field**: additionalInfo.notes
- **Save Operations**: updateContactWithAuth()

#### ContactTabs - Solicitudes Tab  
- **Display Data**: Prospect compact cards from getProspectsByContact
- **Edit Data**: Full prospect details for forms
- **Operations**: create/update/delete prospects
- **Location Data**: getLocationByNeighborhoodId for area selection

#### ContactTabs - Propiedades Tab
- **Owner View**: getOwnerListingsWithAuth results
- **Buyer View**: getBuyerListingsWithAuth results  
- **Display**: Property cards with images, details, location
- **Metrics**: View counts, inquiry counts

## Data Flow Architecture

### 1. Initial Page Load
```
User Request → Next.js Route → ContactPage Component
    ↓
Authentication Layer (dal.ts) → getCurrentUserAccountId()
    ↓
Contact Query (contact.ts) → getContactByIdWithTypeWithAuth()
    ↓
Database Queries:
  - Basic contact info
  - Role counts (owner/buyer/prospect)
  - Prospect titles generation
    ↓
Data Transformation → ExtendedContact format
    ↓
ContactDetailLayout → Component rendering
```

### 2. Client-Side Data Loading
```
ContactTabs Component Mount
    ↓
Parallel useEffect Hooks:
  - Load Property Listings (if owner/buyer)
  - Load Prospect Details
    ↓
Additional Database Queries:
  - getListingsByContact* functions
  - getProspectsByContactWithAuth
    ↓
State Updates → UI Rendering
```

### 3. User Interactions
```
User Actions (Edit/Save) → Component State Changes
    ↓
Validation & Processing
    ↓
Server Actions:
  - updateContactWithAuth
  - updateProspectWithAuth
  - createProspectWithAuth
    ↓
Database Updates → UI State Refresh
```

## Database Schema Relationships

### Core Tables Involved

1. **contacts** - Primary contact information
2. **listingContacts** - Many-to-many relationship between contacts and listings
3. **listings** - Property listings 
4. **properties** - Property details
5. **locations** - Geographic information (neighborhoods, cities)
6. **prospects** - Buyer search criteria and preferences
7. **users** - Authentication and account relationships

### Key Relationships
- `contacts.accountId` → Multi-tenant security boundary
- `contacts.contactId` ← `listingContacts.contactId` (M:N with listings)
- `contacts.contactId` ← `prospects.contactId` (1:N with search criteria)
- `properties.neighborhoodId` → `locations.neighborhoodId` (geographic lookups)

## Security Model

### Multi-Tenant Architecture
- **Account-Level Isolation**: All queries filtered by user's `accountId`
- **Authentication Required**: No data access without valid session
- **Role-Based Access**: Contact types determine available features/tabs

### Query Security Patterns
```typescript
// All queries follow this pattern:
WHERE entity.accountId = getCurrentUserAccountId() 
  AND entity.isActive = true 
  AND [additional_conditions]
```

## Performance Optimizations

### Query Optimizations
1. **Batch Fetching**: Multiple related records fetched in single queries
2. **Conditional Loading**: Property/prospect data only loaded when needed
3. **SQL Aggregation**: Role counts calculated in database rather than application
4. **Index Usage**: All queries utilize database indexes on `accountId` and foreign keys

### Client-Side Optimizations
1. **Lazy Loading**: Additional data loaded only when tabs are accessed
2. **State Management**: Local state prevents unnecessary re-fetching
3. **Debounced Updates**: Form changes batched before server updates

## Error Handling

### Server-Side Errors
- **Authentication Failures**: Redirect to login
- **Authorization Errors**: Return `notFound()` for invalid access
- **Database Errors**: Logged and propagated with user-friendly messages

### Client-Side Errors
- **Network Failures**: Toast notifications with retry options
- **Validation Errors**: Inline form validation and feedback
- **State Errors**: Graceful fallbacks and error boundaries

## Component Communication

### Data Flow Between Components
1. **Server → Client**: Initial data passed through props
2. **Parent → Child**: Contact data flows down through component props
3. **Child → Parent**: Updates flow up through callback functions
4. **Sibling Components**: Shared state managed in parent component

### State Management Strategy
- **Server State**: Initial data from server-side queries
- **Local State**: Form inputs and UI state in individual components  
- **Derived State**: Role flags and display logic computed from server data
- **Async State**: Loading states and error handling for API calls

This architecture ensures secure, efficient, and maintainable data access while providing a responsive user experience for contact management.