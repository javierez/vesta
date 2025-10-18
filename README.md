# Vesta - Real Estate Management Platform

A comprehensive real estate management platform built with Next.js, featuring property listings, contact management, calendar scheduling, and multi-portal integration capabilities.

## 🌟 Features

### Core Functionality
- **Property Management**: Create, edit, and manage property listings with detailed characteristics
- **Contact Management**: Track prospects, leads, and clients with detailed profiles
- **Calendar System**: Schedule appointments and manage real estate operations
- **Multi-Portal Integration**: Publish properties to multiple platforms (Fotocasa, Habitaclia, Idealista, etc.)
- **Document Management**: OCR processing and automated document handling
- **Image Management**: Gallery system with watermarking capabilities

### Advanced Features
- **AI-Powered Descriptions**: Automated property descriptions using OpenAI
- **Cadastral Integration**: Retrieve property information from official sources
- **Google Maps Integration**: Location services and property mapping
- **AWS S3 Integration**: Secure file storage and management
- **Real-time Search**: Advanced property and contact filtering

## 🚀 Tech Stack

- **Framework**: Next.js 15.2.3 with React 19
- **Database**: MySQL with Drizzle ORM
- **Styling**: Tailwind CSS with Radix UI components
- **Authentication**: Built-in auth system
- **Cloud Storage**: AWS S3
- **AI Services**: OpenAI GPT integration
- **Maps**: Google Maps API
- **Package Manager**: pnpm

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── propiedades/       # Property management pages
│   ├── contactos/         # Contact management pages
│   ├── calendario/        # Calendar scheduling
│   └── vender/           # Selling workflow
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── propiedades/      # Property-specific components
│   ├── contactos/        # Contact management components
│   └── layout/           # Layout components
├── server/               # Server-side logic
│   ├── db/              # Database schema and connection
│   ├── queries/         # Database queries
│   ├── portals/         # Third-party integrations
│   └── openai/          # AI integration
└── lib/                 # Utilities and helpers
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd vesta
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with your configuration:
   ```
   DATABASE_URL=your_database_url
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   OPENAI_API_KEY=your_openai_key
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

4. **Set up the database**
   ```bash
   pnpm db:push
   pnpm db:migrate
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

## 📜 Available Scripts

- `pnpm dev` - Start development server with Turbo
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm format:write` - Format code with Prettier

## 🔗 Integrations

### Real Estate Portals
- **Fotocasa**: Property listing and lead management
- **Habitaclia**: Multi-channel property publishing
- **Idealista**: Premium property portal integration
- **Milanuncios**: Classified ads integration

### External Services
- **Google Maps**: Geocoding and location services
- **AWS Textract**: OCR document processing
- **OpenAI**: AI-powered content generation
- **Cadastral API**: Official property data retrieval

## 🎯 Key Features

### Property Management
- Comprehensive property forms with step-by-step creation
- Image galleries with drag-and-drop upload
- Energy certificate management
- Automated property descriptions
- Multi-portal publishing capabilities

### Contact & Lead Management
- Prospect to client conversion tracking
- Detailed contact profiles with interaction history
- Interest-based property matching
- Appointment scheduling integration

### Dashboard & Analytics
- Real-time property statistics
- Operation tracking and management
- Quick action shortcuts
- Performance metrics

## 📱 Mobile Support

The platform is fully responsive and optimized for mobile devices, ensuring real estate professionals can manage their business on the go.

## 🚀 Deployment

The application is configured for deployment on Vercel with the included `vercel.json` configuration.

```bash
pnpm build
```
revert 

---

# TODOs: 

- Cartelería
   - Check saving configuration of templates

- Webpage
   - Add SEO to the page
   - Add slider
   
- Webscraping
   - Re-learn how to use it

- Boost Efficiency
   - Make use of caché and memoized items

- Add Notifications to DB

- MatchSeeker
   - Be able to send out notifications to other accounts

- Generación de Nota de encargo: P000460

- Pasarela de pagos 

- Object Removal

- Reforma and amueblado

- Operations page
   - Deals page


## Low Priority
- Rent: add deposit information

- Separators (tabs on top) in Property and Contact detail pages -> improve UI 

- Short name for barrios

- Integración Idealista










## To Validate
- Properties: Reading the formulario nueva creación
- Reading Ficha de Venta: try out other formularios
- Authentication: check if we really have separation of data per request and user.
- Make sure forms are 'similar' to the casa/piso one (!)

- Watermark:
   - Determine whether we want to include it or not.
   - Investigate a way to upload them without saving the image with watermark


## To improve
- Progress bar when uploading logo -- also changing the tooltip of best recommendations to before when image was uploaded
- Add multimedia material in Fotocasa integration (videos, tours)
- Add multichannel publishing (spanishhouses, kyero, pisos.com, think spain, listglobally basic)



     


### Operations Page?
With and without tasks to do. Each of it with its process and its documents
- Prospect: ---
- Lead: ----
- Deal: -------


### Rent: Rent Assistant (xxx)

### Portal: Integración Idealista (not urgent)

### Properties: Converesational agent




FIXES
- Cliked state in Finalizar -- change the clicked state.
- Armarios empotrados -- apparently fixed (to be checked)
- Código de invitación (non-mock) -- apparently fixed (to be checked)
- Change design of 'Redirigiendo al dashboard' -- change cliked state
- When changing data in propiedades and coming back and forward from tabs, the data is not propertly updated -- to be fixed
- Deleting State for Image Gallery, multiple images -- to be fixed
- Redirecting me to pages if I want to go quick: from first to second, to third, and so on. (changed but to be tested)
- After I click on @property-identification-form on siguiente (once is ready). It has like a clicked state where it says cargando or something like that. But between that and before the property-form is reached, there is some time where I don't have anything and I would be able to click on finish again.
- Authentication with Google 
- Authentication in general
- Reduce barrios lenght (admin task)

OPTIMIZATIONS
- Concurrent data fethcing: contacts, listings, etc.
- Query Optimization: reduced queries
- Middleware caching: 2 minute cache for auth session validation
- Data Caching: when needed 



M


## Performance Optimizations

- **Memoize session data in PropertyTabs**: Use React.useMemo to prevent unnecessary re-renders when session data hasn't changed
  Impact: Reduce component re-renders and improve UI responsiveness on property detail pages

- **Implement lazy loading for tab data**: Only fetch data when user switches to specific tabs instead of loading all data upfront
  Impact: Faster initial page load and reduced memory usage, especially for properties with many images/documents

- **Add React Query for data caching**: Replace manual fetch logic with React Query to cache API responses across components
  Impact: Eliminate duplicate API calls when navigating between pages and provide automatic background refetching

- **Cache property images with service worker**: Implement service worker caching strategy for property images to reduce bandwidth usage
  Impact: Faster image loading on repeat visits and offline capability for previously viewed properties



> allow yourself to change as you want  and how you think its better all the filters in @src/components/propiedades/property-filter.tsx from a perspsective of elegance, minimalism, usability.\
Don't change the fact that theres a component collabpsible for filters. 
  ⎿  Read src/components/propiedades/property-filter.tsx (730 lines)

⏺ I'll analyze the current filter component and redesign it for better elegance, minimalism, and usability while keeping the collapsible structure.

⏺ After analyzing the current filter component, I've identified several areas for improvement:

  Current Issues:
  1. Too many visual elements competing for attention
  2. Filter button shows count badge that duplicates information
  3. Agent filter is separate from main filters (inconsistent UX)
  4. Sliders require manual "apply" action (not intuitive)
  5. Price/area ranges displayed twice (in slider and as active filters)
  6. Nested collapsibles create visual complexity
  7. "Borrar filtros" appears twice (one for properties, one for agents)

  Proposed Improvements:
  1. Merge agent filter into main filter panel for consistency
  2. Make sliders apply automatically on change (remove manual apply)
  3. Simplify the active filter count logic
  4. Create a cleaner visual hierarchy with better spacing
  5. Consolidate all "clear" actions into one unified control
  6. Improve mobile responsiveness

  Let me implement these changes:

⏺ Update(src/components/propiedades/property-filter.tsx)
  ⎿  Updated src/components/propiedades/property-filter.tsx with 7 removals
       2    
       3    import { useState, useEffect } from "react";
       4    import { Button } from "~/components/ui/button";
       5 -  import {
       6 -    Popover,
       7 -    PopoverContent,
       8 -    PopoverTrigger,
       9 -  } from "~/components/ui/popover";
       5    import { Badge } from "~/components/ui/badge";
       6 -  import { ScrollArea } from "~/components/ui/scroll-area";
       6    import {
       7      Collapsible,
       8      CollapsibleContent,
     ...
       30      LayoutGrid,
       31      Table as TableIcon,
       32      Map as MapIcon,
       33 -    User,
       33    } from "lucide-react";
       34    import { PropertySearch } from "./property-search";
       35    import { useRouter, useSearchParams } from "next/navigation";

⏺ Update(src/components/propiedades/property-filter.tsx)
  ⎿  Updated src/components/propiedades/property-filter.tsx with 8 removals          
       61      });
       62      const [agentFilters, setAgentFilters] = useState<string[]>([]);
       63      const [isFiltersOpen, setIsFiltersOpen] = useState(false);
       64 -    const [expandedCategories, setExpandedCategories] = useState<
       65 -      Record<string, boolean>
       66 -    >({
       67 -      status: true,
       68 -      type: true,
       69 -      agent: true,
       70 -      advanced: true,
       71 -    });
       64      const [priceSliderValues, setPriceSliderValues] = useState<number[]>([
       65        priceRange.minPrice,
       66        priceRange.maxPrice,

⏺ Update(src/components/propiedades/property-filter.tsx)
  ⎿  Updated src/components/propiedades/property-filter.tsx with 2 additions and 4 removals
       274          maxPrice: values[1],
       275        };
       276        setPropertyFilters(newFilters);
       277 +      updateUrlParams(newFilters, agentFilters, searchQuery);
       278      };
       279    
       280      const handleAreaSliderChange = (values: number[]) => {
     ...
       285          maxSquareMeter: values[1],
       286        };
       287        setPropertyFilters(newFilters);
       288 +      updateUrlParams(newFilters, agentFilters, searchQuery);
       289      };
       290    
       291 -    const applySliderFilters = () => {
       292 -      updateUrlParams(propertyFilters, agentFilters, searchQuery);
       293 -    };
       294 -  
       291      const clearPropertyFilters = () => {
       292        const newFilters = {
       293          status: [],

⏺ Update(src/components/propiedades/property-filter.tsx)
  ⎿  Updated src/components/propiedades/property-filter.tsx with 3 additions and 7 removals
       289        updateUrlParams(newFilters, agentFilters, searchQuery);
       290      };
       291    
       292 -    const clearPropertyFilters = () => {
       292 +    const clearAllFilters = () => {
       293        const newFilters = {
       294          status: [],
       295          type: [],
     ...
       303          maxSquareMeter: undefined,
       304        };
       305        setPropertyFilters(newFilters);
       306 +      setAgentFilters([]);
       307        setPriceSliderValues([priceRange.minPrice, priceRange.maxPrice]);
       308        setAreaSliderValues([areaRange.minArea, areaRange.maxArea]);
       309        setIsPriceSliderTouched(false);
       310        setIsAreaSliderTouched(false);
       311 -      updateUrlParams(newFilters, agentFilters, searchQuery);
       311 +      updateUrlParams(newFilters, [], searchQuery);
       312      };
       313    
       314 -    const clearAgentFilters = () => {
       315 -      setAgentFilters([]);
       316 -      updateUrlParams(propertyFilters, [], searchQuery);
       317 -    };
       318 -  
       314      const handleSearchChange = (value: string) => {
       315        setSearchQuery(value);
       316        updateUrlParams(propertyFilters, agentFilters, value);

⏺ Update(src/components/propiedades/property-filter.tsx)
  ⎿  Updated src/components/propiedades/property-filter.tsx with 3 additions and 2 removals                  
       329        propertyFilters.type.length === 0;
       330    
       331      // Only count as active filters if they differ from defaults
       332 -    const activePropertyFiltersCount =
       332 +    const activeFiltersCount =
       333        (isDefaultStatusFilter ? 0 : propertyFilters.status.length + propertyFilters.type.length) +
       334        (propertyFilters.city ? 1 : 0) +
       335        (propertyFilters.neighborhood ? 1 : 0) +
       336        (propertyFilters.minBedrooms !== undefined ? 1 : 0) +
       337        (propertyFilters.minBathrooms !== undefined ? 1 : 0) +
       338        (isPriceSliderTouched ? 1 : 0) +
       339 -      (isAreaSliderTouched ? 1 : 0);
       339 +      (isAreaSliderTouched ? 1 : 0) +
       340 +      agentFilters.length;
       341    
       342      const FilterOption = ({
       343        value,
  ⎿  Found 19 new diagnostic issues in 1 file (ctrl-o to expand)

⏺ Now let me redesign the entire filter section with a cleaner, more elegant structure:

⏺ Update(src/components/propiedades/property-filter.tsx)
  ⎿  Updated src/components/propiedades/property-filter.tsx with 7 additions and 35 removals                             
       339        (isAreaSliderTouched ? 1 : 0) +
       340        agentFilters.length;
       341    
       342 -    const FilterOption = ({
       342 +    const FilterCheckbox = ({
       343        value,
       344        label,
       345        category,
     ...
       355          : category ? propertyFilters[category].includes(value) : false;
       356    
       357        return (
       358 -        <div
       359 -          className="flex cursor-pointer items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent"
       358 +        <button
       359 +          type="button"
       360 +          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
       361            onClick={() =>
       362              isAgent
       363                ? toggleAgentFilter(value)
     ...
       364            }
       365          >
       366            <div
       367 -            className={`flex h-4 w-4 items-center justify-center rounded border ${
       367 +            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
       368                isSelected ? "border-primary bg-primary" : "border-input"
       369              }`}
       370            >
       371              {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
       372            </div>
       373 -          <span className={`text-sm ${isSelected ? "font-medium" : ""}`}>
       374 -            {label}
       375 -          </span>
       376 -        </div>
       373 +          <span className={isSelected ? "font-medium" : ""}>{label}</span>
       374 +        </button>
       375        );
       376      };
       377    
       378 -    const FilterCategory = ({
       379 -      title,
       380 -      category,
       381 -      children,
       382 -    }: {
       383 -      title: string;
       384 -      category: string;
       385 -      children: React.ReactNode;
       386 -    }) => (
       387 -      <div className="space-y-2">
       388 -        <div
       389 -          className="flex cursor-pointer items-center justify-between"
       390 -          onClick={() => toggleCategory(category)}
       391 -        >
       392 -          <h5 className="text-sm font-medium text-muted-foreground">{title}</h5>
       393 -          <ChevronDown
       394 -            className={`h-4 w-4 text-muted-foreground transition-transform ${
       395 -              expandedCategories[category] ? "rotate-180 transform" : ""
       396 -            }`}
       397 -          />
       398 -        </div>
       399 -        {expandedCategories[category] && (
       400 -          <div className="space-y-1">{children}</div>
       401 -        )}
       402 -      </div>
       403 -    );
       404 -  
       378      const handleViewChange = (newView: "grid" | "table" | "map") => {
       379        const params = new URLSearchParams(searchParams.toString());
       380        params.set("view", newView);

⏺ Now let me completely redesign the return JSX for a cleaner, more elegant layout:

⏺ Update(src/components/propiedades/property-filter.tsx)
  ⎿  Updated src/components/propiedades/property-filter.tsx with 184 additions and 233 removals                                      
       384    
       385      return (
       386        <div className="flex flex-col gap-4">
       387 -        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
       388 -          <div className="flex flex-1 items-center space-x-2">
       387 +        {/* Top Bar: Search + View Controls + Filter Toggle */}
       388 +        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
       389 +          <div className="flex-1">
       390              <PropertySearch
       391                onSearchChange={handleSearchChange}
       392                onSearch={() =>
     ...
       393                }
       394              />
       395            </div>
       396 -          <div className="flex items-center space-x-2">
       397 -            <Popover>
       398 -              <PopoverTrigger asChild>
       399 -                <Button variant="outline" size="icon" className="relative">
       400 -                  <User className="h-4 w-4" />
       401 -                  {agentFilters.length > 0 && (
       402 -                    <Badge
       403 -                      variant="secondary"
       404 -                      className="absolute -right-1 -top-1 rounded-sm px-1 font-normal"
       405 -                    >
       406 -                      {agentFilters.length}
       407 -                    </Badge>
       408 -                  )}
       409 -                </Button>
       410 -              </PopoverTrigger>
       411 -              <PopoverContent className="w-80 p-0" align="end">
       412 -                <div className="flex flex-col">
       413 -                  <ScrollArea className="h-[300px]">
       414 -                    <div className="space-y-6 p-4">
       415 -                      <div className="space-y-1">
       416 -                        {agents.map((agent) => (
       417 -                          <FilterOption
       418 -                            key={agent.id.toString()}
       419 -                            value={agent.id.toString()}
       420 -                            label={agent.name}
       421 -                            isAgent={true}
       422 -                          />
       423 -                        ))}
       424 -                      </div>
       425 -                    </div>
       426 -                  </ScrollArea>
       427 -                  {agentFilters.length > 0 && (
       428 -                    <div className="border-t p-2">
       429 -                      <Button
       430 -                        variant="ghost"
       431 -                        size="sm"
       432 -                        onClick={clearAgentFilters}
       433 -                        className="h-7 w-full text-xs"
       434 -                      >
       435 -                        <X className="mr-1.5 h-3.5 w-3.5" />
       436 -                        Borrar filtros
       437 -                      </Button>
       438 -                    </div>
       439 -                  )}
       440 -                </div>
       441 -              </PopoverContent>
       442 -            </Popover>
       443 -            <div className="flex items-center gap-1 rounded-md bg-white p-1 shadow">
       396 +  
       397 +          <div className="flex items-center gap-2">
       398 +            {/* View Switcher */}
       399 +            <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
       400                <Button
       401                  variant={view === "grid" ? "secondary" : "ghost"}
       402                  size="icon"
       403                  onClick={() => handleViewChange("grid")}
       404 -                title="Ver como cuadrícula"
       405 -                className="h-9 w-9"
       404 +                title="Vista de cuadrícula"
       405 +                className="h-8 w-8"
       406                >
       407                  <LayoutGrid className="h-4 w-4" />
       408                </Button>
     ...
       454                  variant={view === "table" ? "secondary" : "ghost"}
       455                  size="icon"
       456                  onClick={() => handleViewChange("table")}
       457 -                title="Ver como tabla"
       458 -                className="h-9 w-9"
       457 +                title="Vista de tabla"
       458 +                className="h-8 w-8"
       459                >
       460                  <TableIcon className="h-4 w-4" />
       461                </Button>
     ...
       463                  variant={view === "map" ? "secondary" : "ghost"}
       464                  size="icon"
       465                  onClick={() => handleViewChange("map")}
       466 -                title="Ver mapa"
       467 -                className="h-9 w-9"
       466 +                title="Vista de mapa"
       467 +                className="h-8 w-8"
       468                >
       469                  <MapIcon className="h-4 w-4" />
       470                </Button>
       471              </div>
       472 +  
       473 +            {/* Filter Toggle Button */}
       474              <Button
       475                variant="outline"
       476 -              className="relative"
       476                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
       477 +              className="gap-2"
       478              >
       479 -              <Filter className="mr-2 h-4 w-4" />
       480 -              Filtros
       481 -              {activePropertyFiltersCount > 0 && (
       482 -                <Badge
       483 -                  variant="secondary"
       484 -                  className="ml-2 rounded-sm px-1 font-normal"
       485 -                >
       486 -                  {activePropertyFiltersCount}
       479 +              <Filter className="h-4 w-4" />
       480 +              <span>Filtros</span>
       481 +              {activeFiltersCount > 0 && (
       482 +                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
       483 +                  {activeFiltersCount}
       484                  </Badge>
       485                )}
       486                <ChevronDown
       487 -                className={`ml-2 h-4 w-4 transition-transform ${
       488 -                  isFiltersOpen ? "rotate-180 transform" : ""
       487 +                className={`h-4 w-4 transition-transform ${
       488 +                  isFiltersOpen ? "rotate-180" : ""
       489                  }`}
       490                />
       491              </Button>
       492            </div>
       493          </div>
       494    
       495 +        {/* Collapsible Filter Panel */}
       496          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
       497 -          <CollapsibleContent className="space-y-4">
       498 -            <div className="rounded-lg border bg-card p-4">
       499 -              {/* Advanced Filters Section */}
       500 -              <div className="mb-6 space-y-4">
       501 -                <h4 className="text-sm font-medium text-muted-foreground">
       502 -                  Filtros de Búsqueda
       503 -                </h4>
       504 -                <div className="grid gap-4 md:grid-cols-4">
       505 -                  {/* Location Filter */}
       506 -                  <div className="col-span-2 space-y-2">
       507 -                    <Label className="text-sm font-medium">Ubicación</Label>
       508 -                    <TwoLevelLocationSelect
       509 -                      cities={cities}
       510 -                      selectedCity={propertyFilters.city}
       511 -                      selectedNeighborhood={propertyFilters.neighborhood}
       512 -                      onCityChange={(city) =>
       513 -                        updateLocationFilter(city, "")
       514 -                      }
       515 -                      onNeighborhoodChange={(neighborhood) =>
       516 -                        updateLocationFilter(propertyFilters.city, neighborhood)
       517 -                      }
       518 -                      cityPlaceholder="Todas las ciudades"
       519 -                      neighborhoodPlaceholder="Todos los barrios"
       520 -                    />
       521 -                  </div>
       497 +          <CollapsibleContent>
       498 +            <div className="rounded-lg border bg-card">
       499 +              <div className="p-6 space-y-6">
       500 +                {/* Location & Basic Filters */}
       501 +                <div className="space-y-4">
       502 +                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
       503 +                    {/* Location */}
       504 +                    <div className="sm:col-span-2 space-y-2">
       505 +                      <Label className="text-sm font-medium">Ubicación</Label>
       506 +                      <TwoLevelLocationSelect
       507 +                        cities={cities}
       508 +                        selectedCity={propertyFilters.city}
       509 +                        selectedNeighborhood={propertyFilters.neighborhood}
       510 +                        onCityChange={(city) => updateLocationFilter(city, "")}
       511 +                        onNeighborhoodChange={(neighborhood) =>
       512 +                          updateLocationFilter(propertyFilters.city, neighborhood)
       513 +                        }
       514 +                        cityPlaceholder="Todas las ciudades"
       515 +                        neighborhoodPlaceholder="Todos los barrios"
       516 +                      />
       517 +                    </div>
       518    
       519 -                  {/* Bedrooms Filter */}
       520 -                  <div className="space-y-2">
       521 -                    <Label htmlFor="bedrooms" className="text-sm font-medium">
       522 -                      Habitaciones
       523 -                    </Label>
       524 -                    <Select
       525 -                      value={
       526 -                        propertyFilters.minBedrooms?.toString() ?? "any"
       527 -                      }
       528 -                      onValueChange={(value) =>
       529 -                        updateSelectFilter("minBedrooms", value === "any" ? "" : value)
       530 -                      }
       531 -                    >
       532 -                      <SelectTrigger id="bedrooms">
       533 -                        <SelectValue placeholder="Cualquiera" />
       534 -                      </SelectTrigger>
       535 -                      <SelectContent>
       536 -                        <SelectItem value="any">Cualquiera</SelectItem>
       537 -                        <SelectItem value="1">1+</SelectItem>
       538 -                        <SelectItem value="2">2+</SelectItem>
       539 -                        <SelectItem value="3">3+</SelectItem>
       540 -                        <SelectItem value="4">4+</SelectItem>
       541 -                        <SelectItem value="5">5+</SelectItem>
       542 -                      </SelectContent>
       543 -                    </Select>
       544 -                  </div>
       519 +                    {/* Bedrooms */}
       520 +                    <div className="space-y-2">
       521 +                      <Label htmlFor="bedrooms" className="text-sm font-medium">
       522 +                        Habitaciones
       523 +                      </Label>
       524 +                      <Select
       525 +                        value={propertyFilters.minBedrooms?.toString() ?? "any"}
       526 +                        onValueChange={(value) =>
       527 +                          updateSelectFilter("minBedrooms", value === "any" ? "" : value)
       528 +                        }
       529 +                      >
       530 +                        <SelectTrigger id="bedrooms">
       531 +                          <SelectValue placeholder="Cualquiera" />
       532 +                        </SelectTrigger>
       533 +                        <SelectContent>
       534 +                          <SelectItem value="any">Cualquiera</SelectItem>
       535 +                          <SelectItem value="1">1+</SelectItem>
       536 +                          <SelectItem value="2">2+</SelectItem>
       537 +                          <SelectItem value="3">3+</SelectItem>
       538 +                          <SelectItem value="4">4+</SelectItem>
       539 +                          <SelectItem value="5">5+</SelectItem>
       540 +                        </SelectContent>
       541 +                      </Select>
       542 +                    </div>
       543    
       544 -                  {/* Bathrooms Filter */}
       545 -                  <div className="space-y-2">
       546 -                    <Label htmlFor="bathrooms" className="text-sm font-medium">
       547 -                      Baños
       548 -                    </Label>
       549 -                    <Select
       550 -                      value={
       551 -                        propertyFilters.minBathrooms?.toString() ?? "any"
       552 -                      }
       553 -                      onValueChange={(value) =>
       554 -                        updateSelectFilter("minBathrooms", value === "any" ? "" : value)
       555 -                      }
       556 -                    >
       557 -                      <SelectTrigger id="bathrooms">
       558 -                        <SelectValue placeholder="Cualquiera" />
       559 -                      </SelectTrigger>
       560 -                      <SelectContent>
       561 -                        <SelectItem value="any">Cualquiera</SelectItem>
       562 -                        <SelectItem value="1">1+</SelectItem>
       563 -                        <SelectItem value="2">2+</SelectItem>
       564 -                        <SelectItem value="3">3+</SelectItem>
       565 -                        <SelectItem value="4">4+</SelectItem>
       566 -                      </SelectContent>
       567 -                    </Select>
       544 +                    {/* Bathrooms */}
       545 +                    <div className="space-y-2">
       546 +                      <Label htmlFor="bathrooms" className="text-sm font-medium">
       547 +                        Baños
       548 +                      </Label>
       549 +                      <Select
       550 +                        value={propertyFilters.minBathrooms?.toString() ?? "any"}
       551 +                        onValueChange={(value) =>
       552 +                          updateSelectFilter("minBathrooms", value === "any" ? "" : value)
       553 +                        }
       554 +                      >
       555 +                        <SelectTrigger id="bathrooms">
       556 +                          <SelectValue placeholder="Cualquiera" />
       557 +                        </SelectTrigger>
       558 +                        <SelectContent>
       559 +                          <SelectItem value="any">Cualquiera</SelectItem>
       560 +                          <SelectItem value="1">1+</SelectItem>
       561 +                          <SelectItem value="2">2+</SelectItem>
       562 +                          <SelectItem value="3">3+</SelectItem>
       563 +                          <SelectItem value="4">4+</SelectItem>
       564 +                        </SelectContent>
       565 +                      </Select>
       566 +                    </div>
       567                    </div>
       568 -                </div>
       568    
       569 -                <div className="grid gap-4 md:grid-cols-2">
       570 -                  {/* Price Range Filter */}
       571 -                  <div className="space-y-2">
       572 -                    <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
       573 -                      <Label className="text-sm font-medium">Precio</Label>
       574 -                      <span className="text-xs text-muted-foreground text-center sm:text-right">
       575 -                        {formatNumber(priceSliderValues[0] ?? 0)}€ -{" "}
       576 -                        {formatNumber(priceSliderValues[1] ?? 0)}€
       577 -                      </span>
       569 +                  {/* Price & Area Sliders */}
       570 +                  <div className="grid gap-6 sm:grid-cols-2">
       571 +                    {/* Price Range */}
       572 +                    <div className="space-y-3">
       573 +                      <div className="flex items-baseline justify-between">
       574 +                        <Label className="text-sm font-medium">Precio</Label>
       575 +                        <span className="text-xs text-muted-foreground">
       576 +                          {formatNumber(priceSliderValues[0] ?? 0)}€ - {formatNumber(priceSliderValues[1] ?? 0)}€
       577 +                        </span>
       578 +                      </div>
       579 +                      <Slider
       580 +                        value={priceSliderValues}
       581 +                        min={priceRange.minPrice}
       582 +                        max={priceRange.maxPrice}
       583 +                        step={10000}
       584 +                        onValueChange={handlePriceSliderChange}
       585 +                        className="py-4"
       586 +                      />
       587                      </div>
       588 -                    <Slider
       589 -                      value={priceSliderValues}
       590 -                      min={priceRange.minPrice}
       591 -                      max={priceRange.maxPrice}
       592 -                      step={10000}
       593 -                      onValueChange={handlePriceSliderChange}
       594 -                      onValueCommit={applySliderFilters}
       595 -                      className="py-4"
       596 -                    />
       597 -                  </div>
       588    
       589 -                  {/* Area Range Filter */}
       590 -                  <div className="space-y-2">
       591 -                    <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
       592 -                      <Label className="text-sm font-medium">Superficie</Label>
       593 -                      <span className="text-xs text-muted-foreground text-center sm:text-right">
       594 -                        {formatNumber(areaSliderValues[0] ?? 0)}m² -{" "}
       595 -                        {formatNumber(areaSliderValues[1] ?? 0)}m²
       596 -                      </span>
       589 +                    {/* Area Range */}
       590 +                    <div className="space-y-3">
       591 +                      <div className="flex items-baseline justify-between">
       592 +                        <Label className="text-sm font-medium">Superficie</Label>
       593 +                        <span className="text-xs text-muted-foreground">
       594 +                          {formatNumber(areaSliderValues[0] ?? 0)}m² - {formatNumber(areaSliderValues[1] ?? 0)}m²
       595 +                        </span>
       596 +                      </div>
       597 +                      <Slider
       598 +                        value={areaSliderValues}
       599 +                        min={areaRange.minArea}
       600 +                        max={areaRange.maxArea}
       601 +                        step={10}
       602 +                        onValueChange={handleAreaSliderChange}
       603 +                        className="py-4"
       604 +                      />
       605                      </div>
       606 -                    <Slider
       607 -                      value={areaSliderValues}
       608 -                      min={areaRange.minArea}
       609 -                      max={areaRange.maxArea}
       610 -                      step={10}
       611 -                      onValueChange={handleAreaSliderChange}
       612 -                      onValueCommit={applySliderFilters}
       613 -                      className="py-4"
       614 -                    />
       606                    </div>
       607                  </div>
       608 -              </div>
       608    
       609 -              {/* Existing Status/Type Filters */}
       610 -              <div className="grid gap-6 md:grid-cols-2 border-t pt-4">
       611 -                <FilterCategory title="Estado" category="status">
       612 -                  <FilterOption
       613 -                    value="for-sale"
       614 -                    label="En Venta"
       615 -                    category="status"
       616 -                  />
       617 -                  <FilterOption
       618 -                    value="for-rent"
       619 -                    label="En Alquiler"
       620 -                    category="status"
       621 -                  />
       622 -                  <FilterOption
       623 -                    value="sold"
       624 -                    label="Vendido"
       625 -                    category="status"
       626 -                  />
       627 -                  <FilterOption
       628 -                    value="rented"
       629 -                    label="Alquilado"
       630 -                    category="status"
       631 -                  />
       632 -                  <FilterOption
       633 -                    value="discarded"
       634 -                    label="Descartado"
       635 -                    category="status"
       636 -                  />
       637 -                </FilterCategory>
       609 +                {/* Status, Type & Agent Filters */}
       610 +                <div className="border-t pt-6">
       611 +                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
       612 +                    {/* Status */}
       613 +                    <div className="space-y-3">
       614 +                      <Label className="text-sm font-medium">Estado</Label>
       615 +                      <div className="space-y-1">
       616 +                        <FilterCheckbox value="for-sale" label="En Venta" category="status" />
       617 +                        <FilterCheckbox value="for-rent" label="En Alquiler" category="status" />
       618 +                        <FilterCheckbox value="sold" label="Vendido" category="status" />
       619 +                        <FilterCheckbox value="rented" label="Alquilado" category="status" />
       620 +                        <FilterCheckbox value="discarded" label="Descartado" category="status" />
       621 +                      </div>
       622 +                    </div>
       623    
       624 -                <FilterCategory title="Tipo" category="type">
       625 -                  <FilterOption value="piso" label="Piso" category="type" />
       626 -                  <FilterOption value="casa" label="Casa" category="type" />
       627 -                  <FilterOption value="local" label="Local" category="type" />
       628 -                  <FilterOption value="solar" label="Solar" category="type" />
       629 -                  <FilterOption
       630 -                    value="garaje"
       631 -                    label="Garaje"
       632 -                    category="type"
       633 -                  />
       634 -                </FilterCategory>
       635 -              </div>
       624 +                    {/* Type */}
       625 +                    <div className="space-y-3">
       626 +                      <Label className="text-sm font-medium">Tipo de Propiedad</Label>
       627 +                      <div className="space-y-1">
       628 +                        <FilterCheckbox value="piso" label="Piso" category="type" />
       629 +                        <FilterCheckbox value="casa" label="Casa" category="type" />
       630 +                        <FilterCheckbox value="local" label="Local" category="type" />
       631 +                        <FilterCheckbox value="solar" label="Solar" category="type" />
       632 +                        <FilterCheckbox value="garaje" label="Garaje" category="type" />
       633 +                      </div>
       634 +                    </div>
       635    
       636 -              {activePropertyFiltersCount > 0 && (
       637 -                <div className="mt-4 flex justify-end border-t pt-4">
       638 -                  <Button
       639 -                    variant="ghost"
       640 -                    size="sm"
       641 -                    onClick={clearPropertyFilters}
       642 -                    className="h-8"
       643 -                  >
       644 -                    <X className="mr-1.5 h-3.5 w-3.5" />
       645 -                    Borrar filtros
       646 -                  </Button>
       636 +                    {/* Agents */}
       637 +                    {agents.length > 0 && (
       638 +                      <div className="space-y-3">
       639 +                        <Label className="text-sm font-medium">Agente</Label>
       640 +                        <div className="space-y-1 max-h-[200px] overflow-y-auto pr-2">
       641 +                          {agents.map((agent) => (
       642 +                            <FilterCheckbox
       643 +                              key={agent.id.toString()}
       644 +                              value={agent.id.toString()}
       645 +                              label={agent.name}
       646 +                              isAgent={true}
       647 +                            />
       648 +                          ))}
       649 +                        </div>
       650 +                      </div>
       651 +                    )}
       652 +                  </div>
       653                  </div>
       654 -              )}
       654 +  
       655 +                {/* Clear Filters */}
       656 +                {activeFiltersCount > 0 && (
       657 +                  <div className="border-t pt-4 flex justify-end">
       658 +                    <Button
       659 +                      variant="ghost"
       660 +                      size="sm"
       661 +                      onClick={clearAllFilters}
       662 +                      className="gap-2"
       663 +                    >
       664 +                      <X className="h-4 w-4" />
       665 +                      Limpiar filtros
       666 +                    </Button>
       667 +                  </div>
       668 +                )}
       669 +              </div>
       670              </div>
       671            </CollapsibleContent>
       672          </Collapsible>

⏺ Now let me run type checking and linting to ensure everything is correct:

⏺ Bash(pnpm typecheck)
  ⎿  Error: > flexweb@0.1.0 typecheck /Users/javierperezgarcia/Downloads/vesta
     > tsc --noEmit

     src/components/propiedades/form/property-characteristics-form.tsx(1673,7): error TS17015: Expected corresponding closing tag for JSX fragment.
     src/components/propiedades/form/property-characteristics-form.tsx(1674,3): error TS1109: Expression expected.
      ELIFECYCLE  Command failed with exit code 2.

⏺ Bash(pnpm lint)
  ⎿  Error: ./src/components/propiedades/form/property-characteristics-form.tsx
     1673:6  Error: Parsing error: Expected corresponding closing tag for JSX fragment.

     ./src/components/propiedades/property-filter.tsx
     239:9  Warning: 'toggleCategory' is assigned a value but never used.  @typescript-eslint/no-unused-vars
     240:5  Error: Unsafe call of a(n) `error` type typed value.  @typescript-eslint/no-unsafe-call
     240:38  Error: Unsafe return of a value of type `any`.  @typescript-eslint/no-unsafe-return
     242:25  Error: Unsafe member access [category] on an `any` value.  @typescript-eslint/no-unsafe-member-access

     info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
     … +6 lines (ctrl+o to see all)

⏺ I see there are some errors. Let me fix the unused toggleCategory function and the type safety issues:

⏺ Update(src/components/propiedades/property-filter.tsx)
  ⎿  Updated src/components/propiedades/property-filter.tsx with 7 removals           
       236        updateUrlParams(propertyFilters, newFilters, searchQuery);
       237      };
       238    
       239 -    const toggleCategory = (category: string) => {
       240 -      setExpandedCategories((prev) => ({
       241 -        ...prev,
       242 -        [category]: !prev[category],
       243 -      }));
       244 -    };
       245 -  
       239      const updateLocationFilter = (city: string, neighborhood: string) => {
       240        const newFilters = {
       241          ...propertyFilters,

⏺ Good! Now let me check the property-characteristics-form error that's preventing the build:

⏺ Read(src/components/propiedades/form/property-characteristics-form.tsx)
  ⎿  Read 7 lines

⏺ The error seems to be in a different file. Let me check around line 1673 more carefully:

⏺ Bash(grep -n "Expected corresponding closing tag" /Users/javierperezgarcia/Downloads/vesta/src/components/propiedades/form/property-characteristics-form.tsx || echo…)
  ⎿  No match found in file, checking for JSX fragment issues...

⏺ Let me search for unclosed JSX fragments in that file:

⏺ Bash(grep -n "<>" /Users/javierperezgarcia/Downloads/vesta/src/components/propiedades/form/property-characteristics-form.tsx | tail -5)
  ⎿  (No content)

⏺ Bash(wc -l /Users/javierperezgarcia/Downloads/vesta/src/components/propiedades/form/property-characteristics-form.tsx)
  ⎿      1675 /Users/javierperezgarcia/Downloads/vesta/src/components/propiedades/form/property-characteristics-form.tsx

⏺ The file is 1675 lines long (way over the 400 line limit specified in CLAUDE.md!). Let me check if there's an actual syntax error. Let me read more around that area:

⏺ Read(src/components/propiedades/form/property-characteristics-form.tsx)
  ⎿  Read 30 lines

⏺ This is not related to my changes. Let me try to just typecheck only the property-filter file:

⏺ Bash(npx tsc --noEmit src/components/propiedades/property-filter.tsx 2>&1 | head -20)
  ⎿ node_modules/.pnpm/next@15.3.0_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/build/templates/app-page.d.ts(10,40): error TS2307: Cannot find module 'VAR_MODULE_GLOBAL_ERROR' or its corresponding type declarations.                                                                                                                     
    node_modules/.pnpm/next@15.3.0_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/build/webpack-config.d.ts(9,104): error TS2694: Namespace '"/Users/javierperezgarcia/Downloads/vesta/node_modules/.pnpm/next@15.3.0_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/compiled/webpack/webpack".webpack' has no exported mem
    ber 'RuleSetUseItem'.
    … +23 lines (ctrl+o to expand)


⏺ These are just Next.js type definition issues unrelated to my code. The existing property-characteristics-form error is also unrelated to my changes. Let me just run a simple check to see if my filter component compiles:

⏺ Bash(pnpm build 2>&1 | head -50) timeout: 1m 0s
  ⎿  Running in the background (down arrow to manage)

⏺ Let me wait for the build to complete:

⏺ BashOutput(Reading shell output)
  ⎿  (No content)

⏺ Let me wait a bit more and check again:

⏺ Bash(sleep 10)
  ⎿  (No content)

⏺ BashOutput(Reading shell output)
  ⎿  (No content)

✻ Testing and refining the new filter design… (esc to interrupt · ctrl+t to hide todos · 366s · ↓ 10.4k tokens)
  ⎿  ☒ Analyze current filter UI/UX issues and plan improvements
     ☒ Redesign filter layout for better visual hierarchy
     ☒ Simplify filter controls and interactions
     ☒ Improve responsive design for mobile
     ☐ Test and refine the new filter design
(base) ➜  vesta git:(main) ✗ claude 