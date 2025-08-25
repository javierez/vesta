## FEATURE:

Comprehensive refactoring and modularization of the large Website Configuration component. The current `@src/components/admin/account/website-configuration.tsx` file is approximately 2,908 lines long and needs to be divided into smaller, manageable, and maintainable components following a clear separation of concerns architecture.

## EXAMPLES:

### Current Monolithic Structure
- `@src/components/admin/account/website-configuration.tsx` - Main component that handles all website configuration sections with complex state management, multiple form sections, and extensive UI logic

### Proposed Modular Architecture

**Core Components:**
- `website-configuration.tsx` - Main wrapper component with shared state and navigation
- `website-sidebar.tsx` - Navigation sidebar with section tabs
- `website-save-button.tsx` - Reusable save button with state management

**Section Components:**
Located in `@src/components/admin/account/website-sections/`:
- `seo-section.tsx` - SEO optimization fields (title, description, keywords, og image)
- `branding-section.tsx` - Logo and favicon management
- `hero-section.tsx` - Hero section configuration (title, subtitle, background image, buttons)
- `featured-section.tsx` - Featured properties section settings
- `about-section.tsx` - About us section with KPIs and services configuration
- `properties-section.tsx` - Properties listing configuration
- `testimonials-section.tsx` - Testimonials management with CRUD operations
- `contact-section.tsx` - Contact information and offices management
- `footer-section.tsx` - Footer configuration and link visibility
- `social-section.tsx` - Social media links management
- `head-section.tsx` - Custom scripts and tracking codes
- `meta-section.tsx` - Metadata configuration

**Specialized Sub-Components:**
Located in `@src/components/admin/account/website-sections/components/`:
- `office-manager.tsx` - Office CRUD operations and forms
- `testimonial-manager.tsx` - Testimonial CRUD operations and forms
- `social-links-input.tsx` - Social media links input component
- `image-input-with-preview.tsx` - Image upload with preview functionality
- `kpi-configuration.tsx` - KPI fields management component

## DOCUMENTATION:

### Current Component Analysis:

**State Management Complexity:**
- 22 different useState hooks managing component state
- Complex form state with nested objects and arrays
- Section-specific state that could be isolated within section components
- Multiple loading states and UI toggle states that increase complexity

**Section Breakdown (Current Lines of Code):**
- **SEO Section**: ~82 lines (777-859)
- **Branding Section**: ~87 lines (862-949) 
- **Hero Section**: ~130 lines (952-1082)
- **Featured Section**: ~58 lines (1085-1143)
- **About Section**: ~283 lines (1146-1428) - Most complex with KPIs
- **Properties Section**: ~93 lines (1431-1523)
- **Testimonials Section**: ~323 lines (1526-1849) - Complex CRUD operations
- **Contact Section**: ~421 lines (1852-2272) - Most complex with offices management
- **Footer Section**: ~222 lines (2275-2497)
- **Social Section**: ~185 lines (2500-2685)
- **Head Section**: ~67 lines (2689-2755)
- **Meta Section**: ~113 lines (2758-2871)

**Shared Functionality:**
- Form state management and validation across all sections
- Save operation logic with section-specific data extraction
- Loading states and error handling patterns
- Image preview and upload functionality
- Dynamic form field showing/hiding

**Complex Sub-Features:**
- **Office Management**: Full CRUD with nested address, phone, email, schedule objects
- **Testimonial Management**: Database operations with local state synchronization
- **Social Links**: Dynamic input showing/hiding with icon management
- **KPI Configuration**: Conditional rendering based on showKPI toggle

## OTHER CONSIDERATIONS:

### Refactoring Strategy:

**Phase 1: Core Infrastructure**
- Extract shared hooks and utilities (`useWebsiteForm`, `useWebsiteSave`)
- Create base types and interfaces for section props
- Implement shared component patterns (SectionHeader, FormWrapper)
- Set up folder structure and component organization

**Phase 2: Simple Sections First**
- Refactor smaller sections (SEO, Branding, Featured, Head, Meta)
- Establish patterns for form field management
- Test data flow and save operations with simpler components
- Validate TypeScript interfaces and prop passing

**Phase 3: Complex Sections**
- Refactor sections with complex state (About with KPIs, Properties)
- Extract specialized components (KPI Configuration, Image Input)
- Ensure proper state isolation and parent-child communication

**Phase 4: CRUD-Heavy Sections**
- Refactor Testimonials and Contact sections with complex CRUD operations
- Extract Office Manager and Testimonial Manager components
- Implement proper local state synchronization with database operations

**Data Flow Architecture:**
- **Parent Component**: Maintains form state, active section, and save operations
- **Section Components**: Receive form control and section-specific props
- **Sub-Components**: Handle specialized UI logic and local state where needed
- **Shared Services**: Database operations, validation, and API calls

**Component Communication Patterns:**
- Form state passed down via React Hook Form's `control` prop
- Section-specific callbacks for complex operations (CRUD)
- Shared loading and error states managed at parent level
- UI state (modals, inputs visibility) managed locally in sections

**TypeScript Integration:**
- Strict typing for all section props and component interfaces
- Shared types for form data, API responses, and component state
- Generic components for reusable patterns (ImageInput, CRUDManager)
- Proper form validation schema integration across components

### Migration Benefits:

**Maintainability:**
- Smaller, focused components easier to understand and modify
- Clear separation of concerns reduces coupling between features
- Individual sections can be developed and tested independently

**Performance:**
- Reduced bundle size through code splitting by section
- Lazy loading opportunities for infrequently used sections
- Optimized re-renders with isolated state management

**Developer Experience:**
- Easier debugging with smaller component scope
- Better code navigation and organization
- Simplified testing with focused component responsibilities
- Reduced merge conflicts with multiple developers

**Scalability:**
- Easy to add new website configuration sections
- Reusable patterns for similar admin interfaces
- Standardized architecture for future form-heavy components

