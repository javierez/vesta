# Contact Form Process Analysis

## Overview

The contact form system (`src/components/contactos/crear/contact-form.tsx`) is a multi-step wizard for creating new contacts and associating them with property listings. It handles both property owners and buyers/demandantes, with special logic for ownership management.

## Form Structure & Data Flow

### 1. Form Data Interface

```typescript
interface ContactFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;

  // Property Selection
  selectedListings: bigint[];
  contactType: "owner" | "buyer";
}
```

### 2. Multi-Step Process

The form is divided into two main steps:

#### Step 1: Personal Information (`personal`)
- **Fields**: First name, last name, email, phone, notes
- **Validation**: 
  - First name and last name are required
  - At least email or phone must be provided
  - Basic email format validation if provided
- **Component**: Uses `FloatingLabelInput` for animated labels

#### Step 2: Property Selection (`property`)
- **Contact Type Selection**: Toggle between "Propietario" (owner) and "Demandante" (buyer)
- **Property Search & Filtering**: 
  - Search by title, reference number, or city
  - Filter by listing type (Sale/Rent/Sold) and property type (piso/casa/local/solar/garaje)
- **Property List**: Displays available properties with images, details, and selection checkboxes
- **Validation**: At least one property must be selected

## Database Queries

### Primary Queries Used

#### 1. `listListingsCompactWithAuth()` 
**Location**: `src/server/queries/listing.ts:36-40`

- Fetches available properties for selection
- Returns essential listing data with ownership information
- Uses the `listListingsCompact()` function with account filtering
- **Key Fields Returned**:
  - `listingId`, `title`, `referenceNumber`, `price`
  - `listingType`, `propertyType`, `bedrooms`, `bathrooms`, `squareMeter`
  - `city`, `agentName`, `isOwned` (boolean indicating if property has owner)
  - `imageUrl` for property thumbnail

#### 2. `createContactWithListings()`
**Location**: `src/server/queries/contact.ts:182-262`

- Creates new contact and establishes listing relationships
- Handles ownership conflicts and ownership actions
- **Parameters**:
  - `contactData`: Contact information
  - `selectedListings`: Array of property IDs
  - `contactType`: "owner" or "buyer"
  - `ownershipAction`: Optional "change" or "add" for ownership conflicts

### Database Tables Involved

1. **`contacts`**: Stores contact personal information
2. **`listing_contacts`**: Junction table linking contacts to listings with relationship type
3. **`listings`**: Property listings data
4. **`properties`**: Property details and characteristics
5. **`locations`**: Geographic information (city, province, etc.)
6. **`users`**: Agent information
7. **`property_images`**: Property photos

## Key Features & Business Logic

### 1. Ownership Conflict Management

When a contact is marked as "owner" and selected properties already have owners:

- **Detection**: Checks `isOwned` flag from listing data
- **Dialog Presented**: Two options offered:
  - **"Cambio de Propietario"**: Deactivates existing owners, sets new owner
  - **"Adición de Propietario"**: Adds new owner alongside existing ones
- **Implementation**: 
  - "Change" action: Sets `isActive: false` for existing owner relationships
  - "Add" action: Creates additional owner relationships

### 2. Contact Type Handling

- **Propietario (Owner)**: Creates ownership relationships in `listing_contacts` table
- **Demandante (Buyer)**: Creates buyer interest relationships
- **Visual Indicators**: Properties show "En propiedad" badge for owned properties when contact type is "owner"

### 3. Search & Filtering System

**Search Implementation**:
```typescript
const matchesSearch = 
  !searchQuery ||
  listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  listing.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  listing.city?.toLowerCase().includes(searchQuery.toLowerCase());
```

**Filter Types**:
- **Listing Type**: Sale, Rent, Sold
- **Property Type**: piso, casa, local, solar, garaje

### 4. Form Validation

**Personal Step Validation** (`contact-form.tsx:180-202`):
- Required fields: firstName, lastName
- Conditional requirement: email OR phone must be provided
- Email format validation if provided

**Property Step Validation** (`contact-form.tsx:204-213`):
- At least one property must be selected
- Validation error displayed with warning icon

## UI Components & Dependencies

### Core UI Components
- **`FloatingLabelInput`**: Animated label input fields with motion effects
- **`Card`**: Container component for form sections
- **`Button`**: Action buttons with loading states
- **`Checkbox`**: Property selection controls
- **`Dialog`**: Ownership conflict resolution modal
- **`Popover`**: Filter dropdown interface
- **`ScrollArea`**: Scrollable property list

### External Libraries
- **Framer Motion**: Animations for step transitions and labels
- **Lucide React**: Icons throughout the interface
- **Next.js**: Routing and navigation

## Error Handling

### Form-Level Errors
- Validation errors displayed as alerts or inline messages
- Loading states prevent duplicate submissions
- Try-catch blocks around database operations

### Database Error Handling
- Transactions ensure data consistency
- Error logging to console
- User-friendly error messages on failure

## Performance Considerations

### Query Optimizations
- **Compact Listings Query**: Returns only essential fields needed for form
- **Account Filtering**: All queries filtered by current user's account
- **Image Optimization**: Only first image loaded for property cards
- **Pagination Support**: Built into listings query (though not currently used in form)

### Caching Strategy
- Listings fetched once on component mount
- Client-side filtering reduces server requests
- Image loading optimized with Next.js Image component

## Form Workflow Summary

1. **Component Mount**: Fetch available listings using `listListingsCompactWithAuth()`
2. **Step 1 - Personal Info**: User enters contact details with validation
3. **Step 2 - Property Selection**: 
   - User selects contact type (owner/buyer)
   - Search and filter available properties
   - Select one or more properties
4. **Ownership Conflict Check**: If owner type with existing owners, show resolution dialog
5. **Contact Creation**: Call `createContactWithListings()` with form data
6. **Database Operations**:
   - Insert new contact record
   - Create listing-contact relationships
   - Handle ownership changes if specified
7. **Navigation**: Redirect to contact detail page or contacts list

## Security & Data Integrity

- **Account Isolation**: All queries filtered by current user's account ID
- **Input Validation**: Both client-side and server-side validation
- **SQL Injection Protection**: Parameterized queries using Drizzle ORM
- **Transaction Safety**: Database operations wrapped in transactions
- **Active Record Filtering**: Only active contacts and listings are processed

This system provides a comprehensive solution for contact management with sophisticated property relationship handling and conflict resolution.