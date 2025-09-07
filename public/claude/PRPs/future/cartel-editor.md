# PRP: Cartel Editor Configuration Save/Load System

## Overview

This PRP documents the analysis and implementation plan for adding a "GUARDAR CONFIGURACI�N" feature to the cartel editor, allowing users to save and reuse cartel template configurations.

## Current State Analysis

### 1. State Variables and Management

The cartel editor (`cartel-editor-client.tsx`) manages state through several key variables:

**Configuration State (`TemplateConfiguration`):**
- `config` - Main template configuration with 189+ styling and display properties
- Managed via `updateConfig()` function that merges partial updates
- Controls: orientation, colors, fonts, alignment, positioning, sizes, visibility toggles

**Property Data State (`ExtendedTemplatePropertyData`):**
- `propertyData` - Property-specific information and content
- Contains: title, price, location, specs, images, contact info, descriptions
- Managed via `updatePropertyData()` function

**UI State Variables:**
- `selectedImageIndices` - Array of selected image indices (3-4 images)
- `locationText` - Formatted location string (neighborhood + city)
- `selectedPhone/selectedEmail` - Contact information selections
- Various UI states: `isGenerating`, `showPreview`, `previewZoom`, etc.

### 2. Data Structure Analysis

**TemplateConfiguration Structure (189 properties):**
```typescript
{
  // Basic settings
  templateStyle: "classic" | "modern" | "luxury" | etc.
  orientation: "vertical" | "horizontal"
  propertyType: "piso" | "casa" | "local" | "garaje" | "solar"
  listingType: "venta" | "alquiler"
  
  // Visual toggles
  showPhone, showEmail, showWebsite, showQR, showWatermark, showIcons, etc.
  
  // Typography settings (for title, location, price, description, bullets)
  *Font: "default" | "serif" | "sans" | "mono" | "elegant" | "modern"
  *Alignment: "left" | "center" | "right"  
  *Size: number (pixel values)
  *Color: string (hex/CSS colors)
  *PositionX/Y: number (offset pixels)
  
  // Layout settings
  imageCount: 3 | 4
  overlayColor: predefined colors or account palette
  iconSize, iconSpacing, borderRadius values
  additionalFields: string[] (max 2 property features)
}
```

**ExtendedTemplatePropertyData Structure:**
- Extends base `TemplatePropertyData` with additional database fields
- Contains property specs, contact info, descriptions, images
- Includes optional fields: energy rating, elevator, garage, etc.

### 3. Section Analysis

**Section 1 (Configuraci�n) - Template Design Settings:**
- Basic settings: orientation, background color
- Display toggles: contact info, visual elements (QR, watermark, icons)
- Typography controls: fonts, sizes, alignment, colors, positioning
- Icon customization: size, spacing
- Additional fields selector (property features)

**Section 2 (Propiedad) - Property Information:**
- Property data: title, price, location, specifications  
- Contact selection from database-provided options
- Image selection and management
- Short description and icon list customization

### 4. Data Source Analysis

**Database vs User Configuration:**
- **From Database:** Core property data (specs, location, contact options, images)
- **From Account:** Color palette, branding preferences  
- **User Configurable:** All styling, positioning, visibility toggles, selected contacts
- **Mixed:** Property type/listing type (DB default, user override)

### 5. Current Persistence Patterns

**No Configuration Saving Currently Exists:**
- All settings are session-based only
- Configuration resets on page reload
- Only PDF generation persists results (as files)

**Existing Infrastructure:**
- Account/User preferences JSON fields in database
- Document storage system for generated PDFs
- API endpoints for property-related operations

## Implementation Plan for "GUARDAR CONFIGURACI�N"

### Phase 1: Database Schema Extension

**Dedicated Table Implementation:**
```sql
CREATE TABLE cartel_configurations (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  account_id BIGINT REFERENCES accounts(id) ON DELETE CASCADE,
  property_id BIGINT REFERENCES properties(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  template_config JSONB NOT NULL,
  property_overrides JSONB DEFAULT '{}',
  selected_contacts JSONB DEFAULT '{}',
  selected_image_indices JSONB DEFAULT '[]',
  is_default BOOLEAN DEFAULT FALSE,
  is_global BOOLEAN DEFAULT TRUE, -- Can be used for any property
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_default_per_user UNIQUE(user_id, is_default) DEFERRABLE INITIALLY DEFERRED,
  INDEX idx_cartel_configs_user_account (user_id, account_id),
  INDEX idx_cartel_configs_property (property_id)
);
```

This approach provides:
- Clean separation of configuration data
- Efficient querying and indexing
- Support for user-specific and property-specific configurations
- Scalable architecture for future enhancements

### Phase 2: API Endpoints

```typescript
// API Routes to implement
POST   /api/cartel-configurations      // Save new configuration
GET    /api/cartel-configurations      // List user's configurations
PUT    /api/cartel-configurations/[id] // Update configuration
DELETE /api/cartel-configurations/[id] // Delete configuration
GET    /api/cartel-configurations/default // Get default configuration
POST   /api/cartel-configurations/[id]/set-default // Set as default
```

### Phase 3: UI Implementation

**3.1 Save Configuration Button & Modal**
```typescript
// Add to cartel-editor-client.tsx button section
<Button
  onClick={() => setShowSaveModal(true)}
  variant="outline"
  className="flex items-center gap-2"
>
  <Settings className="h-4 w-4" />
  GUARDAR CONFIGURACI�N
</Button>
```

**Modal Features:**
- Configuration name input field
- "Set as default template" checkbox
- "Save for this property only" vs "Save as general template" toggle
- Save button with loading state

**3.2 Load Configuration Dropdown**
```typescript
<Select onValueChange={loadConfiguration}>
  <SelectTrigger>
    <SelectValue placeholder="Cargar configuraci�n..." />
  </SelectTrigger>
  <SelectContent>
    {savedConfigurations.map(config => (
      <SelectItem key={config.id} value={config.id}>
        {config.name} {config.isDefault && "(Por defecto)"}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**3.3 Configuration Management Panel**
- List of saved configurations
- Rename functionality
- Delete with confirmation
- Default configuration toggle

### Phase 4: State Management Enhancement

```typescript
// Add to existing state
const [savedConfigurations, setSavedConfigurations] = useState<SavedConfiguration[]>([])
const [currentConfigurationId, setCurrentConfigurationId] = useState<string | null>(null)
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
const [showSaveModal, setShowSaveModal] = useState(false)

// Change tracking
useEffect(() => {
  const hasChanges = currentConfigurationId && 
    !isEqual(config, savedConfigurations.find(c => c.id === currentConfigurationId)?.templateConfig)
  setHasUnsavedChanges(hasChanges)
}, [config, propertyData, selectedImageIndices, currentConfigurationId])
```

## Data Structure for Persistence

```typescript
interface SavedCartelConfiguration {
  id: string
  name: string
  userId: string
  accountId: string
  propertyId?: string // For property-specific configs
  templateConfig: TemplateConfiguration
  propertyOverrides: Partial<ExtendedTemplatePropertyData>
  selectedContacts: { 
    phone?: string
    email?: string 
  }
  selectedImageIndices: number[]
  isDefault: boolean
  isGlobal: boolean // Can be used for any property
  createdAt: Date
  updatedAt: Date
}
```

## What Gets Saved vs Excluded

### Included in Configuration Save:
**From Section 1 (Configuraci�n):**
- All visual styling (fonts, colors, sizes, positions)
- Display toggles (phone, email, QR, watermark, icons)
- Layout settings (orientation, image count, overlay colors)
- Typography settings for all text elements
- Icon customization
- Additional fields selections

**From Section 2 (Propiedad):**
- Font styles and positioning for property elements
- Contact preferences (which phone/email to show)
- Image layout preferences
- Styling overrides for property-specific elements

### Excluded from Configuration Save:
**Property-Specific Data (comes from database):**
- Property title, price, location, specifications
- Available images (though selection indices are saved)
- Available contact options
- Property descriptions and features

## Implementation Priority

1. **High Priority**: Basic save/load functionality with database storage
2. **Medium Priority**: Default configuration system
3. **Low Priority**: Advanced features (auto-save, configuration sharing, templates)

## Technical Considerations

- **Database Choice**: PostgreSQL with JSONB for flexible configuration storage
- **Validation**: Ensure saved configurations are compatible with current template structure
- **Migration**: Handle existing users gracefully with default configurations
- **Performance**: Index configurations by user/account for fast retrieval
- **Versioning**: Consider configuration versioning for future template updates

## Success Metrics

- Users can save and reload configurations without data loss
- Configuration loading preserves all styling and preferences
- Default configurations load automatically for new cartels
- System maintains backward compatibility with existing workflow