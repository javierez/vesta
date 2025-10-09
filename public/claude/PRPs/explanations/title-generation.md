# Title Generation and Location Handling System

## Overview
This document explains how the Vesta real estate platform generates property titles based on `propertyType` and `location`, and how it handles neighborhood identification and database storage.

## Property Title Generation

### Primary Function: `generatePropertyTitle`
**Location**: `src/components/propiedades/form/common/property-title.tsx:12-37`

```typescript
export function generatePropertyTitle(
  propertyType: string,
  street = "",
  neighborhood = "",
) {
  const getPropertyTypeText = (type: string) => {
    switch (type) {
      case "piso": return "Piso";
      case "casa": return "Casa";
      case "local": return "Local";
      case "solar": return "Solar";
      case "garaje": return "Garaje";
      default: return type;
    }
  };

  const type = getPropertyTypeText(propertyType);
  const neighborhoodText = neighborhood ? `(${neighborhood})` : "";
  return `${type} en ${street} ${neighborhoodText}`.trim();
}
```

### Title Format
- **Pattern**: `{PropertyType} en {Street} ({Neighborhood})`
- **Example**: `Piso en Calle Mayor (Centro)`
- **Without neighborhood**: `Casa en Calle Menor`

### Property Type Mapping
| Input Code | Display Text |
|------------|--------------|
| piso       | Piso         |
| casa       | Casa         |
| local      | Local        |
| solar      | Solar        |
| garaje     | Garaje       |
| *other*    | *unchanged*  |


## Location and Neighborhood Handling

### Database Schema
**Location**: `src/server/db/schema.ts` - locations table

```sql
CREATE TABLE locations (
  neighborhood_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  municipality VARCHAR(100) NOT NULL,
  neighborhood VARCHAR(100) NOT NULL,
  neighborhood_clean VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

### Key Functions for Location Management

#### 1. `findOrCreateLocation`
**Location**: `src/server/queries/locations.ts:16-66`

**Purpose**: Find existing location or create new one and return neighborhood ID

**Process**:
1. **Search** for existing location using all four fields:
   - `city`
   - `province`
   - `municipality`
   - `neighborhood`

2. **Return existing** if found: `Number(existingLocation[0].neighborhoodId)`

3. **Create new** if not found:
   - Insert new location with `isActive: true`
   - Query back to get the auto-generated `neighborhoodId`
   - Return `Number(newLocation.neighborhoodId)`

```typescript
const existingLocation = await db
  .select()
  .from(locations)
  .where(
    and(
      eq(locations.city, locationData.city),
      eq(locations.province, locationData.province),
      eq(locations.municipality, locationData.municipality),
      eq(locations.neighborhood, locationData.neighborhood),
    ),
  )
  .limit(1);
```

#### 2. `retrieveGeocodingData`
**Location**: `src/server/googlemaps/retrieve_geo.tsx:29-93`

**Purpose**: Get geocoding data from OpenStreetMap Nominatim API and handle neighborhood storage

**Process**:
1. **API Call** to Nominatim:
   ```typescript
   const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1&limit=1`;
   ```

2. **Extract location data**:
   - `neighborhood` from `result.address.suburb`
   - `municipality` from `result.address.city`
   - `province` from `result.address.province` or `result.address.state`

3. **Create/Find neighborhood** if neighborhood exists:
   ```typescript
   if (neighborhood) {
     neighborhoodId = await findOrCreateLocation({
       city: municipality,
       province: province,
       municipality: municipality,
       neighborhood: neighborhood,
     });
   }
   ```

4. **Return formatted data**:
   ```typescript
   return {
     latitude: result.lat,
     longitude: result.lon,
     neighborhood,
     neighborhoodId,
     city: addressData.city,
     municipality: addressData.city,
     province: addressData.province ?? addressData.state,
   };
   ```

## Property Creation Workflow

### Complete Property Creation Flow
1. **User enters address** → Property form
2. **Geocoding triggered** → `retrieveGeocodingData(address)`
3. **Nominatim API call** → Extract location components
4. **Neighborhood handling** → `findOrCreateLocation(locationData)`
5. **Database operation**:
   - Search for existing location with exact match
   - If found: return existing `neighborhood_id`
   - If not found: insert new location + return new `neighborhood_id`
6. **Title generation** → `generatePropertyTitle(propertyType, street, neighborhood)`

### Data Flow Diagram
```
Address Input
    ↓
Nominatim API (OpenStreetMap)
    ↓
Location Data Extraction
    ↓
findOrCreateLocation()
    ↓
Database Query/Insert
    ↓
neighborhood_id returned
    ↓
generatePropertyTitle()
    ↓
Final Title: "Piso en Calle Mayor (Centro)"
```

## Additional Location Query Functions

### Utility Functions
**Location**: `src/server/queries/locations.ts`

- `getLocationByNeighborhoodId(neighborhoodId)` - Get location by ID
- `getLocationByNeighborhood(neighborhood)` - Get location by name
- `getAllCities()` - Get all unique cities
- `getNeighborhoodsByCity(city)` - Get neighborhoods for a city
- `getAllLocationsForSelection()` - Get all locations for dropdowns
- `locationExists(locationData)` - Check if location exists

### Location Search and Management
- All functions include proper error handling
- Active record filtering with `isActive: true`
- Pagination support for large datasets
- Distinct queries for unique values

## Error Handling

### Geocoding Failures
- Returns `null` if API fails or no results
- Continues without `neighborhoodId` if location creation fails
- Graceful degradation - titles still generated without neighborhood

### Database Failures
- All location functions include try/catch blocks
- Console logging for debugging
- Proper error propagation to calling functions

## Usage Examples

### Property Title Generation
```typescript
// With neighborhood
generatePropertyTitle("piso", "Calle Mayor", "Centro")
// Returns: "Piso en Calle Mayor (Centro)"

// Without neighborhood
generatePropertyTitle("casa", "Avenida Libertad", "")
// Returns: "Casa en Avenida Libertad"
```

### Location Creation
```typescript
// Create/find neighborhood
const neighborhoodId = await findOrCreateLocation({
  city: "Madrid",
  province: "Madrid",
  municipality: "Madrid",
  neighborhood: "Centro"
});
// Returns: neighborhood_id (number)
```

This system provides a robust foundation for property title generation and location management, with proper error handling and database consistency.