# Template System Architecture

## Overview

The Vesta property template system is a comprehensive PDF generation solution that creates property marketing materials (carteles) using dynamic templates. The system consists of template rendering components, PDF generation via Puppeteer, and a management interface for uploading and managing generated PDFs.

## Core Components

### 1. Template Page (`/src/app/templates/page.tsx`)

**Purpose**: Standalone template renderer for PDF generation
**Called by**: Puppeteer via `/templates` URL endpoint
**Calls**: 
- `ClassicTemplate` component
- `getExtendedDefaultPropertyData()` from mock-data
- Template configuration and property data via URL params

**Key Features**:
- Receives template configuration and property data via URL query parameters
- Renders the template with print-optimized styling
- Signals readiness for PDF capture with `window.templateReady = true`
- Waits for all images to load before marking ready
- Has fallback timeout of 5 seconds

```typescript
// URL format: /templates?config=JSON&data=JSON
// Renders ClassicTemplate with passed configuration
```

### 2. PDF Generation API (`/src/app/api/puppet/generate-pdf/route.ts`)

**Purpose**: Puppeteer-based PDF generation service
**Called by**: Client applications and playground
**Calls**: 
- Templates page via URL navigation
- Puppeteer for browser automation

**Process Flow**:
1. Receives `templateConfig` and `propertyData` via POST
2. Launches headless Chromium browser
3. Navigates to `/templates` with configuration as URL params
4. Waits for template to be ready (`window.templateReady`)
5. Generates PDF with A4 dimensions
6. Returns PDF as downloadable file

**Key Features**:
- Optimized browser settings for PDF generation
- Dynamic viewport sizing based on orientation
- Wait conditions for template readiness
- Error handling and cleanup

### 3. Carteles Manager (`/src/components/propiedades/detail/carteles-manager.tsx`)

**Purpose**: Property-specific PDF cartel management interface
**Called by**: Property detail pages
**Calls**:
- `/api/properties/[id]/carteles` for CRUD operations
- File upload functionality

**Key Features**:
- Upload PDF files (validates PDF format)
- Display existing carteles with preview
- Delete carteles with S3 cleanup
- Drag & drop file upload
- PDF preview using iframe

### 4. Carteles API (`/src/app/api/properties/[id]/carteles/route.ts`)

**Purpose**: CRUD operations for property carteles
**Called by**: CartelesManager component
**Calls**: 
- Document upload/deletion services
- S3 client for file operations
- Database queries for document management

**Operations**:
- **POST**: Upload new cartel PDF
- **GET**: Fetch property carteles list
- **DELETE**: Remove cartel (both S3 and database)

### 5. Template Components

#### Classic Template (`/src/components/admin/carteleria/templates/classic/classic-vertical-template.tsx`)

**Purpose**: Main template implementation used in production
**Called by**: Templates page
**Calls**:
- `PropertyQRCode` component
- `getTemplateImages()` for S3 image URLs
- Various formatting utilities
- `FeaturesGrid` component

**Key Features**:
- Print-optimized dimensions and styling
- Dynamic image layouts (3 or 4 images)
- Property information display
- QR code integration
- Watermark support
- Responsive typography
- Multiple overlay colors
- Contact information display

#### Template Renderer (`/src/components/admin/carteleria/templates/template-renderer.tsx`)

**Purpose**: Dynamic template component selector
**Called by**: Admin interfaces and playground
**Calls**: Various template components based on styleId

**Supported Templates**:
- `base`: BaseTemplate
- `basic`: BasicTemplateWrapper
- `modern`: ModernTemplateWrapper (image preview)
- `classic`: ClassicTemplateWrapper (null - handled separately)
- `minimalist`: MinimalistTemplate
- `luxury`: LuxuryTemplate
- `creative`: CreativeTemplate
- `professional`: ProfessionalTemplate

### 6. Configuration & Data Types

#### Template Configuration (`/src/types/template-data.ts`)

**Key Interfaces**:
- `TemplateConfiguration`: Template customization options
- `ExtendedTemplatePropertyData`: Property data with additional fields
- `ConfigurableTemplateProps`: Props for configurable templates

**Configuration Options**:
- Template style, orientation, property type
- Image count, display toggles
- Typography and overlay colors
- Additional property fields
- Listing type (venta/alquiler)

#### Mock Data (`/src/lib/carteleria/mock-data.ts`)

**Purpose**: Property data for template testing and defaults
**Provides**:
- Mock property data for all property types
- Extended property data with additional fields
- Formatting utilities for prices, locations, etc.

### 7. Admin Interface

#### Carteleria Main (`/src/components/admin/carteleria.tsx`)

**Purpose**: Multi-step template customization interface
**Called by**: `/account-admin/carteleria` page
**Features**:
- Style selection step
- Format selection step  
- Personalization step
- State persistence
- Preferences saving

#### Puppeteer Playground (`/src/app/(dashboard)/playground/puppet/page.tsx`)

**Purpose**: Template testing and PDF generation interface
**Called by**: Developer/admin access
**Features**:
- Real-time template preview
- Configuration controls
- PDF generation testing
- Zoom controls for preview

## Data Flow

### PDF Generation Flow
```
1. User configures template → 
2. Configuration sent to /api/puppet/generate-pdf → 
3. Puppeteer navigates to /templates?config=...&data=... → 
4. Templates page renders ClassicTemplate → 
5. Template signals ready → 
6. Puppeteer captures PDF → 
7. PDF returned to client
```

### Cartel Management Flow
```
1. User uploads PDF → 
2. CartelesManager calls /api/properties/[id]/carteles → 
3. File uploaded to S3 → 
4. Document record created in database → 
5. List refreshed with new cartel
```

### Template Rendering Flow
```
1. Component requests template → 
2. TemplateRenderer selects component by styleId → 
3. Template component renders with property data → 
4. Styling applied for print/screen optimization
```

## Key Files Mapping

### Core System Files
- `/src/app/templates/page.tsx` - Template rendering endpoint
- `/src/app/api/puppet/generate-pdf/route.ts` - PDF generation API
- `/src/app/api/properties/[id]/carteles/route.ts` - Cartel management API

### Template Components
- `/src/components/admin/carteleria/templates/classic/classic-vertical-template.tsx` - Main template
- `/src/components/admin/carteleria/templates/template-renderer.tsx` - Template selector
- `/src/components/admin/carteleria/templates/*/` - Various template styles

### Management Components
- `/src/components/propiedades/detail/carteles-manager.tsx` - Property cartel manager
- `/src/components/admin/carteleria.tsx` - Admin template configurator
- `/src/app/(dashboard)/playground/puppet/page.tsx` - Testing playground

### Configuration & Data
- `/src/types/template-data.ts` - Type definitions
- `/src/lib/carteleria/mock-data.ts` - Mock property data
- `/src/lib/carteleria/classic-vertical-constants.ts` - Print dimensions
- `/src/lib/carteleria/print-utils.ts` - Print utilities

## Usage Scenarios

### 1. Automated PDF Generation
Templates page is accessed programmatically by Puppeteer to generate PDFs with specific configurations.

### 2. Property Marketing Material Management
Property managers upload and manage PDF carteles for individual properties through the carteles manager.

### 3. Template Customization
Administrators use the carteleria interface to configure default template styles and preferences.

### 4. Development & Testing
Developers use the playground to test template rendering and PDF generation with various configurations.

## Integration Points

### S3 Storage
- Template images stored in `vesta-configuration-files` bucket
- Generated PDFs stored in main S3 bucket with folder structure
- Carteles uploaded by users stored with property-specific paths

### Database
- Document management for uploaded carteles
- User preferences for template configurations
- Property data integration for template rendering

### Authentication
- All cartel management operations require authentication
- User-specific preferences stored per account
- Property access validation for cartel operations
