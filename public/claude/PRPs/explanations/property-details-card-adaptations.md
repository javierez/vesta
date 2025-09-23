# PropertyDetailsCard Component Adaptations

## Overview

The PropertyDetailsCard component was transformed from a static form card to a dynamic component that adapts its content based on property type. This change enables the component to show/hide fields and modify labels according to the specific requirements of different property types (piso, casa, local, garaje, solar).

## Architecture Changes

### Component Modularization
- **Before**: Property details section was inline within the main form component (~167 lines of JSX)
- **After**: Extracted into a dedicated, reusable PropertyDetailsCard component
- **Benefits**: Better code organization, reusability, and maintainability

### Interface Enhancement
```typescript
interface PropertyDetailsCardProps {
  // Existing props...
  propertyType: string; // 🆕 Added property type for dynamic behavior
  // Other props...
}
```

## Property-Type Specific Adaptations

### Local Properties
- **Label Change**: "Habitaciones" → "Estancias"
- **Rationale**: Commercial properties use "estancias" (rooms) instead of "habitaciones" (bedrooms)

### Garaje Properties
- **Removed Fields**:
  - Habitaciones (bedrooms)
  - Baños (bathrooms) 
  - Superficie (surface area)
  - Construida (built area)
  - Última reforma (last renovation)
  - Plantas edificio (building floors)
- **Retained Fields**:
  - Año de construcción (year built)
  - Estado conservación (conservation status)

### Solar Properties
- **Removed Fields**:
  - Habitaciones (bedrooms)
  - Baños (bathrooms)
  - Año construcción (year built)
  - Última reforma (last renovation)
  - Plantas edificio (building floors)
  - Estado conservación (conservation status)
- **Label Change**: "Construida (m²)" → "Edificable (m²)"
- **Retained Fields**:
  - Superficie (surface area)
  - Edificable (buildable area)

## Implementation Strategy

### Conditional Rendering Pattern
```typescript
{propertyType !== "garaje" && propertyType !== "solar" && (
  // Field rendering logic
)}
```

### Dynamic Label Logic
```typescript
{propertyType === "local" ? "Estancias" : "Habitaciones"}
{propertyType === "solar" ? "Edificable (m²)" : "Construida (m²)"}
```

## Integration with Main Form

### Component Replacement
- **Removed**: 167 lines of inline JSX (lines 1355-1522)
- **Added**: Single PropertyDetailsCard component call
- **Props Passed**: All necessary state and handlers for full functionality

### Type Safety Improvements
- **Issue**: TypeScript type mismatches between string/number types
- **Solution**: Proper type conversion (`lastRenovationYear.toString()`)
- **Result**: Full type safety maintained throughout the component hierarchy

## Benefits Achieved

1. **Code Reusability**: Component can be used in different contexts
2. **Maintainability**: Property-specific logic centralized in one location
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **User Experience**: Appropriate fields shown for each property type
5. **Code Organization**: Cleaner separation of concerns

## Technical Considerations

### State Management
- Component receives all necessary state through props
- Maintains existing save state functionality
- Preserves collapse/expand behavior

### Performance
- No additional re-renders introduced
- Conditional rendering optimizes DOM updates
- Maintains existing form validation patterns

## Future Extensibility

The conditional rendering pattern makes it easy to:
- Add new property types
- Modify field visibility rules
- Update labels for specific property types
- Implement property-type-specific validation rules

This architecture provides a solid foundation for continued development while maintaining the existing user experience and functionality.

## Extension to FeaturesCard Component

Following the same successful transformation pattern, the **FeaturesCard component** has been updated with identical property-type-aware functionality:

### **Implementation Changes**
1. **Added `propertyType: string` prop** to FeaturesCardProps interface
2. **Implemented conditional rendering** using the same pattern as PropertyDetailsCard
3. **Replaced inline features section** in main form (lines 1517-2029) with modular FeaturesCard component
4. **Added import** in main form: `import { FeaturesCard } from "./cards/features-card";`

### **Property-Type Specific Adaptations Applied**

#### **For Garaje Properties:**
- ✅ **Keep**: Ascensor, Garaje (parking space details)
- ❌ **Remove**: Trastero, Calefacción, Agua caliente, Aire acondicionado, Amueblado + all appliances

#### **For Solar Properties:**
- ❌ **Remove**: ALL features (Ascensor, Garaje, Trastero, Calefacción, Agua caliente, Aire acondicionado, Amueblado + all appliances)

#### **For Piso/Casa/Local Properties:**
- ✅ **Keep**: All features unchanged

### **Integration Benefits**
- **Consistency**: Both PropertyDetailsCard and FeaturesCard now follow the same modular pattern
- **Property-Type Awareness**: Features automatically adapt based on property type selection
- **Code Reduction**: Removed ~500 lines of inline JSX from main form
- **Maintainability**: Feature logic centralized in dedicated component
- **Type Safety**: Full TypeScript support with proper prop interfaces

### **Technical Implementation Pattern**
```typescript
// Conditional rendering pattern used in both components
{propertyType !== "garaje" && propertyType !== "solar" && (
  // Feature rendering logic
)}

{propertyType !== "solar" && (
  // Property-specific features
)}
```

This modular approach ensures consistent behavior across all property form cards while maintaining clean separation of concerns and enabling future extensibility.

## Change Control

When requesting modifications to property-type-aware cards, please follow this structured approach:

### **Request Format**
Specify exactly which property types should be affected and what changes are needed:
- **Property Types**: piso, casa, local, garaje, solar
- **Action**: show/hide fields, change labels, modify behavior
- **Affected Fields**: list specific fields or features

### **Example Request**
```
For "garaje" properties:
- ✅ Keep: Ascensor, Garaje features
- ❌ Remove: Trastero, Calefacción, Agua caliente, Aire acondicionado, Amueblado + all appliances

For "solar" properties:
- ❌ Remove: ALL features (show inactive state instead)
```

### **Implementation Tracking**
Each change will update:
1. **Component files**: The actual card component implementation
2. **Main form integration**: Props passing and component usage
3. **This documentation**: Record of all property-type adaptations
4. **Type safety**: Interface updates to support new props/behavior

### **Validation Checklist**
Before marking any card modification as complete:
- [ ] TypeScript compilation passes (`pnpm typecheck`)
- [ ] ESLint validation passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] All property types tested and behave correctly
- [ ] Documentation updated with change details
- [ ] Inactive states implemented where applicable (e.g., solar properties)

This structured approach ensures all property form cards maintain consistency while enabling precise control over property-type-specific behavior.