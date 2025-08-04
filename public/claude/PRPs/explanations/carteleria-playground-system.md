# Cartelería Playground System - Complete Technical Explanation

## Overview

The Cartelería Playground System is a comprehensive real estate template configuration tool built for the Vesta platform. It allows users to dynamically customize property listing templates with 10+ configurable controls, supporting both vertical (A4 portrait) and horizontal (A4 landscape) orientations.

## System Architecture

### Core Components Structure

```
src/
├── app/(dashboard)/playground/page.tsx          # Main playground interface
├── components/admin/carteleria/
│   ├── templates/
│   │   ├── configurable-template.tsx            # Dynamic template router
│   │   ├── basic-template.tsx                   # Basic style template
│   │   └── [other-templates.tsx]                # Future template styles
│   ├── controls/                                # Control components
│   │   ├── template-style-selector.tsx          # Template style selector
│   │   ├── display-toggles.tsx                  # Boolean feature toggles
│   │   ├── additional-fields-selector.tsx       # Property field selector
│   │   ├── image-count-selector.tsx             # 3 or 4 image selection
│   │   └── listing-type-selector.tsx            # Venta/Alquiler toggle
│   └── qr-code.tsx                             # QR code generator
├── lib/carteleria/
│   ├── mock-data.ts                            # Property data & utilities
│   └── s3-images.ts                            # Image URL management
└── types/template-data.ts                      # TypeScript interfaces
```

## 1. Main Playground Interface (`page.tsx`)

### Purpose
Central control panel that manages all template configuration options and renders the live preview.

### Key Features
- **Single Scrollable Panel**: All controls consolidated into one 800px height panel
- **Real-time Preview**: Changes instantly reflected in template
- **Spanish Localization**: All UI elements in Spanish
- **Responsive Layout**: Grid layout adapts to screen size

### State Management
```typescript
// Template configuration state
const [config, setConfig] = useState<TemplateConfiguration>({
  templateStyle: "modern",
  orientation: "vertical",
  propertyType: "piso",
  imageCount: 3,
  showIcons: true,
  showQR: true,
  showWatermark: false,
  showPhone: true,
  showShortDescription: false,
  listingType: "venta",
  additionalFields: []
});

// Property data state
const [propertyData, setPropertyData] = useState<ExtendedTemplatePropertyData>(
  getExtendedDefaultPropertyData("piso")
);
```

### Control Sections

#### 1. **Template Style Selection**
```typescript
const TEMPLATE_STYLES = [
  { value: "modern", label: "Moderno", icon: "🏢", available: true },
  { value: "basic", label: "Básico", icon: "📋", available: true },
  { value: "classic", label: "Clásico", icon: "🏛️", available: false },
  { value: "luxury", label: "Lujo", icon: "💎", available: false },
  { value: "professional", label: "Profesional", icon: "💼", available: false },
  { value: "creative", label: "Creativo", icon: "🎨", available: false }
];
```

#### 2. **Template Orientation**
```typescript
<select
  value={config.orientation}
  onChange={(e) => updateConfig({ orientation: e.target.value as "vertical" | "horizontal" })}
>
  <option value="vertical">Vertical (A4 Retrato)</option>
  <option value="horizontal">Horizontal (A4 Paisaje)</option>
</select>
```

#### 3. **Property Type Selection**
- Piso, Casa, Local, Garaje, Solar
- Updates mock data and title automatically

#### 4. **Location Selector**
León neighborhoods:
- Centro, Ensanche, Crucero, La Palomera, Eras de Renueva, Trobajo del Camino, Armunia

#### 5. **Auto-Generated Title**
```typescript
const title = `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} en ${listingType}`;
```
Examples: "Casa en venta", "Local en alquiler"

#### 6. **Dynamic Price Formatting**
```typescript
const handlePriceChange = (price: number) => {
  // Shows €/mes for rentals, € for sales
  const suffix = config.listingType === "alquiler" ? "€/mes" : "€";
};
```

## 2. Configurable Template System

### Purpose
Dynamic template routing system that renders different template styles based on configuration.

### Template Router
```typescript
export const ConfigurableTemplate: FC<ConfigurableTemplateProps> = ({ data, config, className }) => {
  // Route to different template components based on style
  switch (config.templateStyle) {
    case "basic":
      return <BasicTemplate data={data} config={config} className={className} />;
    case "classic":
      // return <ClassicTemplate data={data} config={config} className={className} />;
      // Fallback to modern until classic is implemented
      break;
    case "modern":
    default:
      // Modern template implementation
      break;
  }
  // ... modern template implementation continues
};
```

### Available Templates

#### Modern Template (Default)
- **Colors**: Neutral grays with blue accents (#64748b, #3b82f6)
- **Style**: Clean, minimalist design
- **Features**: Full feature support

#### Basic Template
- **Colors**: Simple palette with green accents (#16a34a, #22c55e)  
- **Style**: Functional and straightforward
- **Features**: Identical functionality to modern, different styling

### Shared Template Structure
Each template follows the same structural pattern:

```typescript
return (
  <div className={cn(
    "relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm",
    config.orientation === "vertical" ? "aspect-[210/297]" : "aspect-[297/210]", // A4 ratios
    "w-full h-full"
  )}>
    {/* Watermark (conditional) */}
    {/* Header with title, price, location */}
    {/* Short description (conditional) */}
    {/* Image grid */}
    {/* Specifications (icons vs bullets) */}
    {/* Additional fields (icons vs bullets) */}
    {/* Footer with contact & QR */}
  </div>
);
```

### Image Rendering System

#### Grid Layouts
```typescript
// Vertical 4 images: 2-column main + 3-row sidebar
<div className="grid h-full grid-cols-4 gap-2">
  <div className="relative col-span-2 overflow-hidden rounded-lg">
    <Image src={templateImages[0]} alt="Main" fill className="object-cover" />
  </div>
  <div className="col-span-2 grid grid-rows-3 gap-2">
    {templateImages.slice(1, 4).map(...)}
  </div>
</div>

// Horizontal 3 images: 2-row main + 2-column bottom
<div className="grid h-full grid-rows-3 gap-2 p-4">
  <div className="relative row-span-2 overflow-hidden rounded-lg">
    <Image src={templateImages[0]} alt="Main" fill className="object-cover" />
  </div>
  <div className="grid grid-cols-2 gap-2">
    {templateImages.slice(1, 3).map(...)}
  </div>
</div>
```

### Conditional Rendering: Icons vs Bullets

#### With Icons (showIcons: true)
```typescript
<div className="grid grid-cols-3 gap-2">
  <div className="rounded-lg p-2 text-center" style={{ backgroundColor: modernColors.muted }}>
    <Bed className="mx-auto mb-1 h-4 w-4" style={{ color: modernColors.primary }} />
    <div className="text-xs font-medium">{data.specs.bedrooms}</div>
    <div className="text-xs">hab.</div>
  </div>
</div>
```

#### Without Icons (showIcons: false)
```typescript
<div className="space-y-1">
  <div className="flex items-center text-sm">
    <span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: modernColors.primary }}></span>
    <span>{data.specs.squareMeters} m²</span>
  </div>
  <div className="flex items-center text-sm">
    <span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: modernColors.primary }}></span>
    <span>{data.specs.bedrooms} habitaciones</span>
  </div>
</div>
```

## 3. Control Components

### Template Style Selector (`template-style-selector.tsx`)
Visual selector for choosing template styles:

```typescript
const TEMPLATE_STYLES = [
  { value: "modern", label: "Moderno", icon: "🏢", available: true },
  { value: "basic", label: "Básico", icon: "📋", available: true },
  { value: "classic", label: "Clásico", icon: "🏛️", available: false },
  // ... more styles
];
```

Features:
- **Visual Selection**: Cards with icons and descriptions
- **Availability Status**: Shows "Próximamente" for unavailable styles
- **Color Coding**: Different colors for each style
- **Fallback Handling**: Unavailable styles fall back to modern

### Display Toggles (`display-toggles.tsx`)
Boolean switches for template features:
- **showIcons**: Toggle between icon cards and bullet lists
- **showQR**: Show/hide QR code in footer
- **showWatermark**: Add diagonal "MUESTRA" overlay
- **showPhone**: Display contact phone number
- **showShortDescription**: Show property description text

```typescript
<div className="grid grid-cols-2 gap-4">
  {DISPLAY_OPTIONS.map((option) => (
    <label key={option.key} className="flex items-center space-x-3">
      <input
        type="checkbox"
        checked={config[option.key]}
        onChange={(e) => onChange({ [option.key]: e.target.checked })}
      />
      <span>{option.label}</span>
    </label>
  ))}
</div>
```

### Image Count Selector (`image-count-selector.tsx`)
Visual grid selector for 3 or 4 images:

```typescript
const IMAGE_COUNT_OPTIONS = [
  { count: 3, label: "3 Imágenes", description: "Layout clásico con imagen principal" },
  { count: 4, label: "4 Imágenes", description: "Máxima información visual" }
];
```

### Listing Type Selector (`listing-type-selector.tsx`)
Toggle between "Venta" and "Alquiler" with visual feedback:

```typescript
const LISTING_TYPES = [
  { value: "venta", label: "Venta", icon: "🏷️", color: "green" },
  { value: "alquiler", label: "Alquiler", icon: "🔑", color: "blue" }
];
```

### Additional Fields Selector (`additional-fields-selector.tsx`)
Grid-based selector with 2-field limit:

```typescript
const AVAILABLE_FIELDS = [
  { value: "energyConsumptionScale", label: "Certificación Energética", icon: "⚡" },
  { value: "yearBuilt", label: "Año de Construcción", icon: "📅" },
  { value: "hasElevator", label: "Ascensor", icon: "🏢" },
  // ... more fields
];
```

## 4. Data Management System

### Mock Data Structure (`mock-data.ts`)

#### Base Property Interface
```typescript
interface TemplatePropertyData {
  id: string;
  title: string;
  price: number;
  location: { neighborhood: string; city: string; };
  specs: { bedrooms?: number; bathrooms?: number; squareMeters: number; };
  images: string[];
  contact: { phone: string; email?: string; };
  propertyType: "piso" | "casa" | "local" | "garaje" | "solar";
}
```

#### Extended Properties
```typescript
interface ExtendedTemplatePropertyData extends TemplatePropertyData {
  energyConsumptionScale?: string;
  yearBuilt?: number;
  hasElevator?: boolean;
  hasGarage?: boolean;
  hasStorageRoom?: boolean;
  terrace?: boolean;
  orientation?: string;
  conservationStatus?: number;
  heatingType?: string;
  shortDescription?: string;
  listingType: "venta" | "alquiler";
}
```

#### Property Data by Type
```typescript
export const mockPropertyData: Record<string, TemplatePropertyData[]> = {
  piso: [
    {
      id: "piso-1",
      title: "Piso en venta",
      price: 185000,
      location: { neighborhood: "Centro", city: "León" },
      specs: { bedrooms: 3, bathrooms: 2, squareMeters: 95 },
      // ...
    }
  ],
  casa: [...],
  local: [...],
  garaje: [...],
  solar: [...]
};
```

### Image Management (`s3-images.ts`)

#### S3 Configuration
```typescript
const S3_BASE_URL = "https://vesta-configuration-files.s3.amazonaws.com/templates/";
const AVAILABLE_TEMPLATE_IMAGES = ["IMG_0744.JPG", "IMG_0745.JPG", "IMG_0749.JPG"];
```

#### Dynamic Image Selection
```typescript
export const getTemplateImages = (count: 3 | 4): string[] => {
  const images = AVAILABLE_TEMPLATE_IMAGES.slice(0, count);
  
  // For 4 images, duplicate first image if needed
  if (count === 4 && images.length < 4) {
    const remainingCount = 4 - images.length;
    for (let i = 0; i < remainingCount; i++) {
      images.push(AVAILABLE_TEMPLATE_IMAGES[0]!);
    }
  }
  
  return images.map(img => `${S3_BASE_URL}${img}`);
};
```

## 5. TypeScript Type System

### Template Configuration
```typescript
interface TemplateConfiguration {
  templateStyle: "modern" | "basic" | "classic" | "luxury" | "professional" | "creative";
  orientation: "vertical" | "horizontal";
  propertyType: "piso" | "casa" | "local" | "garaje" | "solar";
  imageCount: 3 | 4;
  showIcons: boolean;
  showQR: boolean;
  showWatermark: boolean;
  showPhone: boolean;
  showShortDescription: boolean;
  listingType: "venta" | "alquiler";
  additionalFields: string[];
}
```

### Component Props
```typescript
interface ConfigurableTemplateProps {
  data: ExtendedTemplatePropertyData;
  config: TemplateConfiguration;
  className?: string;
}
```

## 6. Utility Functions

### Price Formatting
```typescript
export const formatPrice = (price: number, propertyType?: string, listingType?: string): string => {
  const isRental = listingType === "alquiler" || (propertyType === "local" && price < 5000);
  const suffix = isRental ? "€/mes" : "€";
  return price.toLocaleString("es-ES") + " " + suffix;
};
```

### Location Formatting
```typescript
export const formatLocation = (location: { neighborhood: string; city: string; }): string => {
  return `${location.neighborhood} (${location.city})`;
};
```

## 7. A4 Optimization System

### Aspect Ratio Management
```typescript
className={cn(
  "relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm",
  config.orientation === "vertical" ? "aspect-[210/297]" : "aspect-[297/210]", // Exact A4 ratios
  "w-full h-full"
)}
```

### Responsive Element Sizing
- **Images**: 30% height vertical, 40% horizontal
- **Icons**: 4x4 pixels (down from 5x5)
- **Text**: xs/sm sizes throughout
- **Padding**: Reduced from p-6 to p-3/p-4
- **QR Codes**: 50px vertical, 60px horizontal

## 8. Modern Color System

```typescript
const modernColors = {
  primary: "#64748b",    // Neutral gray
  secondary: "#94a3b8",  // Light gray
  accent: "#3b82f6",     // Blue accent
  background: "#ffffff", // White
  text: "#1f2937",       // Dark gray
  border: "#e2e8f0",     // Light border
  muted: "#f8fafc",      // Very light gray
};
```

## 9. Usage Examples

### Basic Configuration
```typescript
// Modern vertical piso with icons and QR
const config = {
  templateStyle: "modern",
  orientation: "vertical",
  propertyType: "piso",
  imageCount: 3,
  showIcons: true,
  showQR: true,
  showWatermark: false,
  showPhone: true,
  showShortDescription: false,
  listingType: "venta",
  additionalFields: ["energyConsumptionScale", "hasElevator"]
};
```

### Advanced Configuration
```typescript
// Basic horizontal casa rental with bullet lists
const config = {
  templateStyle: "basic",
  orientation: "horizontal",
  propertyType: "casa",
  imageCount: 4,
  showIcons: false,        // Bullet lists instead
  showQR: true,
  showWatermark: true,     // Show sample watermark
  showPhone: true,
  showShortDescription: true,
  listingType: "alquiler", // Shows €/mes pricing
  additionalFields: ["yearBuilt", "hasGarage"]
};
```

## 10. Key Features Summary

### 🎛️ **11 Configurable Controls**
1. **Template style** (modern, basic, classic*, luxury*, professional*, creative*)
2. Template orientation (vertical/horizontal)
3. Property type (piso, casa, local, garaje, solar)
4. Image count (3 or 4)
5. Icon display toggle
6. QR code toggle
7. Watermark toggle
8. Phone display toggle
9. Short description toggle
10. Listing type (venta/alquiler)
11. Additional fields (max 2 from 9 options)

*\* Available soon - currently shows modern template as fallback*

### 📱 **Responsive Design**
- A4 aspect ratios maintained
- Elements scale appropriately
- Mobile-friendly controls

### 🌐 **Spanish Localization**
- All UI elements in Spanish
- Spanish number formatting
- Local real estate terminology

### ⚡ **Real-time Updates**
- Instant preview updates
- State synchronization
- No page refreshes needed

### 🎨 **Professional Styling**
- Modern color palette
- Clean typography
- Subtle shadows and borders

This system provides a comprehensive, user-friendly interface for creating professional real estate templates with maximum flexibility while maintaining design consistency and A4 print compatibility.