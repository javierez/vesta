## FEATURE:

Property characteristics form standardization and validation system. We have a master property characteristics form that serves as the UI and functionality template, with specialized adaptations for different property types that show/hide specific fields based on property requirements.

## EXAMPLES:

### Master Template Form
- `@src/components/propiedades/form/property-characteristics-form.tsx` - This is the master template that defines the standard UI components, layout patterns, save functionality, and field organization. All specialized forms should follow this structure for consistency.

### Property Type Specific Forms
The following forms need to be validated and potentially updated to match the master template:
- `@src/components/propiedades/form/property-characteristics-form-solar.tsx` - Solar/land properties (simplified form with fewer fields)
- `@src/components/propiedades/form/property-characteristics-form-garage.tsx` - Garage properties (focused on parking-specific features)  
- `@src/components/propiedades/form/property-characteristics-form-local.tsx` - Commercial/local properties (business-focused fields)

### Multi-step Creation Form
- `@src/components/crear/property-form.tsx` - Contains field display logic for the property creation workflow that may also need alignment

### Field Adaptation Examples:
- **Solar properties**: Should not display bedroom/bathroom counts, kitchen features, or residential amenities
- **Garage properties**: Focus on parking spaces, security features, building location, but skip residential features
- **Local properties**: Emphasize commercial features, accessibility, business amenities

## DOCUMENTATION:

- Master form structure in `property-characteristics-form.tsx` defines:
  - Module-based organization (basicInfo, propertyDetails, location, features, etc.)
  - Save state management system
  - Card-based UI layout with ModernSaveIndicator
  - Field validation and data handling patterns
- Property type routing logic in master form (lines ~26-28 show imports of specialized forms)
- Field conditional rendering patterns used throughout the codebase

## OTHER CONSIDERATIONS:

- **UI Consistency**: All forms must maintain the same visual design, card layout, save indicators, and interaction patterns as the master form
- **Save State Management**: Each specialized form should implement the same module-based save state system (idle/modified/saving/saved/error)
- **Field Validation**: Ensure required fields are appropriate for each property type - don't require residential fields for commercial properties
- **Performance**: Avoid duplicate code - consider extracting common components and logic into shared utilities
- **Type Safety**: All forms should use the same TypeScript interfaces and property listing types
- **Responsive Design**: Forms must work consistently across desktop and mobile devices
- **Accessibility**: Maintain proper form labels, keyboard navigation, and screen reader compatibility
- **Data Integrity**: Validate that saved data makes sense for the property type (e.g., don't save bedroom count for garage)

### Key Validation Points:
1. Do specialized forms follow the master template's module organization?
2. Are inappropriate fields properly hidden for each property type?
3. Is the save state management consistent across all forms?
4. Do all forms use the same UI components and styling patterns?
5. Are TypeScript types and interfaces properly aligned?
