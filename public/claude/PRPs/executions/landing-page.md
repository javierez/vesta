# PRP: Landing Page for Vesta Real Estate CRM

## Overview
Create a commercial landing page in Spanish for the Vesta real estate CRM platform. This involves moving the existing dashboard from `/src/app/page.tsx` to `/src/app/dashboard/page.tsx` and creating a new landing page that showcases the platform's features.

## Context and Background

### Current State
- The current `/src/app/page.tsx` contains a dashboard with quick stats, performance metrics, and action cards
- The entire application is in Spanish without i18n
- UI built with shadcn/ui components and Tailwind CSS
- No authentication system implemented yet
- Navigation structure uses Next.js 13+ app router

### References to Update
These files contain routes that need updating from "/" to "/dashboard":
- `/src/components/navbar.tsx` line 92
- `/src/components/property/property-listing-form.tsx` line 271
- `/src/components/layout/dashboard-layout.tsx` line 19

### UI Component Library
All components are from shadcn/ui located in `/src/components/ui/`:
- Button, Card, Dialog, Form, Input for main UI elements
- Use `cn()` utility for conditional classes
- Follow existing patterns: shadow-md, rounded-2xl, hover states

## Implementation Blueprint

### Phase 1: Move Dashboard Content

1. **Create dashboard directory and move content**
   ```bash
   mkdir -p src/app/dashboard
   ```
   
2. **Move page.tsx content**
   - Copy entire content from `/src/app/page.tsx` to `/src/app/dashboard/page.tsx`
   - Keep all imports and components intact
   - Ensure the dashboard layout wrapper is preserved

3. **Update route references**
   - Update navbar.tsx, property-listing-form.tsx, and dashboard-layout.tsx
   - Change href="/" to href="/dashboard" in specified locations

### Phase 2: Create Landing Page Structure

```typescript
// src/app/page.tsx - New Landing Page Structure
import { Navbar } from "~/components/navbar"
import { HeroSection } from "~/components/landing/HeroSection"
import { FeaturesGrid } from "~/components/landing/FeaturesGrid"
import { IntegrationsSection } from "~/components/landing/IntegrationsSection"
import { FutureFeatures } from "~/components/landing/FutureFeatures"
import { CTASection } from "~/components/landing/CTASection"
import { Footer } from "~/components/landing/Footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      <IntegrationsSection />
      <FutureFeatures />
      <CTASection />
      <Footer />
    </div>
  )
}
```

### Phase 3: Landing Page Components

#### HeroSection Component
```typescript
// Key elements:
- Compelling headline: "Gestiona tu Negocio Inmobiliario con Inteligencia"
- Subheadline about CRM features
- Two CTAs: "Comenzar Gratis" (primary) and "Ver Demo" (outline)
- Login dialog trigger
- Hero image or illustration
```

#### FeaturesGrid Component
Based on existing features:
1. **Gestión de Propiedades** - Comprehensive property management
2. **CRM de Contactos** - Lead and client tracking
3. **Publicación Multi-Portal** - Fotocasa, Habitaclia, Idealista, Milanuncios
4. **Calendario Integrado** - Appointment scheduling
5. **Descripciones con IA** - OpenAI-powered descriptions
6. **Procesamiento de Documentos** - OCR with AWS Textract

Use card pattern from `/src/components/ui/card.tsx` with icons from lucide-react.

#### IntegrationsSection Component
Showcase current integrations:
- Portal logos (Fotocasa, Habitaclia, Idealista, Milanuncios)
- Technology stack (OpenAI, AWS, Google Maps)
- Visual grid or carousel layout

#### FutureFeatures Component
Aspirational features to highlight:
1. **Integración con Twilio** - WhatsApp and SMS conversations
2. **Sistema de Autenticación** - Secure login system
3. **Pasarela de Pagos** - Payment processing
4. **Asistente de Alquiler** - Rent management assistant
5. **Agente Conversacional** - AI property assistant

#### CTASection Component
- Strong call-to-action: "Transforma tu Negocio Inmobiliario Hoy"
- Email capture form
- Login button for existing users

### Phase 4: Login Dialog Implementation

```typescript
// Use Dialog component from shadcn/ui
// Structure:
- Email input field
- Password input field
- "Iniciar Sesión" button
- Note: "Sistema de autenticación próximamente"
- Link to dashboard for demo: "Explorar Demo"
```

### Phase 5: Responsive Design
- Mobile-first approach
- Use Tailwind breakpoints: sm, md, lg, xl
- Collapsible mobile menu following navbar.tsx pattern
- Touch-friendly buttons and links

## Features to Highlight

### Current Features (Live)
- **Gestión Integral de Propiedades**: Create detailed listings with AI descriptions
- **CRM Avanzado**: Track leads, conversions, and client interactions
- **Publicación Multi-Portal**: One-click publishing to major platforms
- **Calendario Sincronizado**: Never miss an appointment
- **Procesamiento Inteligente**: OCR for documents, AI for descriptions
- **Búsqueda en Tiempo Real**: Advanced filtering and search

### Upcoming Features (Aspirational)
- **Conversaciones Twilio**: Track WhatsApp and SMS with clients (see `/public/claude/PRPs/explanations/twilio-conversations-tutorial.md`)
- **Autenticación Segura**: Enterprise-grade security
- **Análisis Predictivo**: AI-powered market insights
- **Tours Virtuales**: 360° property tours
- **Gestión de Pagos**: Integrated payment processing

## Spanish Copy Guidelines

### Headlines
- Main: "Gestiona tu Negocio Inmobiliario con Inteligencia"
- Sub: "El CRM más completo para agentes y agencias inmobiliarias en España"

### Value Propositions
1. "Publica en todos los portales con un solo clic"
2. "Convierte más leads con seguimiento inteligente"
3. "Ahorra tiempo con descripciones generadas por IA"
4. "Mantén toda tu información en un solo lugar"

### CTAs
- Primary: "Comenzar Gratis"
- Secondary: "Ver Demo"
- Login: "Iniciar Sesión"

## Technical Implementation Details

### Routing Updates
1. Create new dashboard route structure
2. Update all internal links
3. Ensure dashboard layout only applies to /dashboard/*

### Component Reuse
- Use existing UI components from `/src/components/ui/`
- Follow button variants: default, outline, secondary, ghost
- Card pattern with shadow-md and rounded-2xl
- Consistent spacing: p-4, p-6, gap-4, gap-6

### Performance Considerations
- Lazy load images
- Use Next.js Image component
- Optimize for Core Web Vitals
- Implement proper meta tags for SEO

## Validation Gates

```bash
# Type checking
pnpm typecheck

# Linting with auto-fix
pnpm lint:fix

# Format code
pnpm format:write

# Build verification
pnpm build

# Route testing
echo "✓ Landing page loads at /"
echo "✓ Dashboard loads at /dashboard"
echo "✓ All navigation links updated"
echo "✓ Login dialog opens and closes"
echo "✓ Mobile menu works correctly"

# Visual testing checklist
echo "✓ Hero section displays correctly on desktop (1920x1080)"
echo "✓ Hero section displays correctly on mobile (375x667)"
echo "✓ Features grid is responsive"
echo "✓ All CTAs are clickable and visible"
echo "✓ Spanish copy is correct throughout"
echo "✓ No broken images or icons"
echo "✓ Smooth scrolling works"
echo "✓ All hover states work correctly"
```

## Implementation Order

1. **Move Dashboard** (30 min)
   - Create dashboard directory
   - Move page.tsx content
   - Update route references
   - Test dashboard access

2. **Create Landing Structure** (45 min)
   - Set up new page.tsx
   - Create component directories
   - Implement basic layout

3. **Build Hero Section** (1 hour)
   - Design hero layout
   - Add CTAs and login trigger
   - Implement responsive design

4. **Create Features Grid** (1 hour)
   - Design feature cards
   - Add icons and descriptions
   - Ensure responsive grid

5. **Add Remaining Sections** (1.5 hours)
   - Integrations showcase
   - Future features
   - CTA section
   - Footer

6. **Implement Login Dialog** (45 min)
   - Create dialog component
   - Add form fields
   - Connect to demo dashboard

7. **Testing and Polish** (1 hour)
   - Run all validation gates
   - Fix any issues
   - Polish animations and transitions

Total estimated time: 6-7 hours

## External Resources

### Landing Page Best Practices
- https://landingi.com/blog/real-estate-landing-pages/
- https://unbounce.com/landing-page-examples/real-estate-landing-page-examples/
- Average conversion rate for real estate: 7.4%

### Component Documentation
- Shadcn/ui components: https://ui.shadcn.com/docs/components/
- Tailwind CSS: https://tailwindcss.com/docs
- Lucide icons: https://lucide.dev/icons/

### Design Inspiration
- Keep headlines simple and benefit-oriented
- Use high-quality property images
- Include social proof (future implementation)
- Ensure CTAs are above the fold
- Mobile-first responsive design

## Success Criteria

1. Dashboard successfully moved to /dashboard route
2. Landing page displays all current and future features
3. All routes updated throughout the application
4. Login dialog functional (even if auth not implemented)
5. Fully responsive on all devices
6. All validation gates pass
7. Spanish copy is professional and compelling
8. Page loads quickly and performs well

## Potential Gotchas

1. **Route Updates**: Ensure ALL references to "/" are updated, not just the main ones
2. **Layout Conflicts**: The dashboard layout should not apply to the landing page
3. **Mobile Menu**: Test thoroughly on actual devices
4. **Image Optimization**: Use Next.js Image component for performance
5. **Spanish Accents**: Ensure proper character encoding for Spanish text

---

**Confidence Score: 9/10**

This PRP provides comprehensive context and specific implementation details that should enable one-pass implementation. The only uncertainty is around potential edge cases in route updates, but the validation gates should catch any issues.