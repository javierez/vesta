# Vesta Landing Page - Comprehensive UI Style Guide

## Table of Contents
1. [Overall Page Structure](#overall-page-structure)
2. [Color Palette & Design Tokens](#color-palette--design-tokens)
3. [Typography System](#typography-system)
4. [Layout Patterns](#layout-patterns)
5. [Component Breakdown](#component-breakdown)
6. [Animation Patterns](#animation-patterns)
7. [Interactive Elements](#interactive-elements)
8. [Responsive Design](#responsive-design)
9. [Style Recommendations](#style-recommendations)

---

## Overall Page Structure

The landing page follows a classic vertical layout with these main sections:

```
┌─────────────────────────────────┐
│ Sticky Navigation Bar           │
├─────────────────────────────────┤
│ Hero Section                    │
├─────────────────────────────────┤
│ Features Grid (Interactive)     │
├─────────────────────────────────┤
│ Testimonials Section            │
├─────────────────────────────────┤
│ CTA Section                     │
├─────────────────────────────────┤
│ Footer                          │
└─────────────────────────────────┘
```

**Main Container**: All sections use `mx-auto max-w-7xl` for consistent center alignment with maximum width of 1280px.

---

## Color Palette & Design Tokens

### Primary Colors
- **Gradient Brand**: `from-amber-400 to-rose-400` (primary brand gradient)
- **Background**: `bg-white` (clean white background)
- **Dark Surface**: `bg-gray-900` (footer and dark sections)

### Text Colors
- **Primary Text**: `text-gray-900` (main headings and content)
- **Secondary Text**: `text-gray-600` (descriptions and subtext)
- **Muted Text**: `text-gray-500` (less important information)
- **Light Text**: `text-white` (on dark backgrounds)
- **Light Muted**: `text-gray-300` (muted text on dark backgrounds)

### Accent Colors
- **Success**: `bg-green-100 text-green-800` (success states)
- **Warning**: `bg-amber-100 text-amber-800` (warning states)
- **Info**: `bg-blue-50` (informational backgrounds)

### Interactive States
- **Hover**: Colors become slightly darker (`hover:from-amber-500 hover:to-rose-500`)
- **Focus**: Ring utilities for accessibility
- **Active**: Scale transforms (`scale-95`, `scale-105`)

---

## Typography System

### Heading Hierarchy
```css
/* Main Title (Hero) */
h1: text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight

/* Section Headers */
h2: text-3xl sm:text-4xl font-bold tracking-tight

/* Subsection Headers */
h3: text-2xl font-bold

/* Card/Component Headers */
h4: font-semibold text-gray-900
h5: font-semibold text-gray-900 (smaller components)
```

### Body Text
```css
/* Large paragraph text */
.text-xl: Leading paragraphs and important descriptions

/* Standard paragraph text */
.text-base: Default body text

/* Small text */
.text-sm: Secondary information, labels, metadata

/* Extra small text */
.text-xs: Fine print, tiny labels
```

### Font Weights
- **Bold**: `font-bold` - Main headings
- **Semibold**: `font-semibold` - Subheadings, important labels
- **Medium**: `font-medium` - Interactive elements, emphasized text
- **Normal**: Default weight for body text

---

## Layout Patterns

### Grid Systems
```css
/* Two-column desktop, single on mobile */
lg:grid-cols-2

/* Three-column grid */
sm:grid-cols-3

/* Feature tabs responsive grid */
grid-cols-2 sm:grid-cols-3 lg:grid-cols-6

/* Four-column grid for small items */
lg:grid-cols-4
```

### Spacing System
```css
/* Section padding */
px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20

/* Card padding */
p-4 lg:p-8

/* Element spacing */
gap-4, gap-6, gap-8, gap-12 (responsive gaps)

/* Margins */
mb-6, mt-8, mx-auto (consistent spacing)
```

### Container Patterns
- **Full Width**: `w-full`
- **Constrained**: `max-w-7xl mx-auto`
- **Content Width**: `max-w-4xl mx-auto` (for centered content)
- **Reading Width**: `max-w-2xl mx-auto` (for text-heavy content)

---

## Component Breakdown

### 1. Navigation Bar

**Structure**: Sticky header with backdrop blur effect
```css
/* Header styling */
position: sticky
top: 0
z-index: 50
background: bg-background/95 backdrop-blur
border-bottom: border-b
```

**Layout**: Three-section layout (logo, navigation, actions)
- **Left**: Logo with building icon + brand name
- **Center**: Dropdown menus for desktop navigation
- **Right**: Social links, auth buttons, mobile menu toggle

**Mobile Navigation**: Slide-in panel from right
- Animated backdrop: `bg-black/40 backdrop-blur-[2px]`
- Panel: `w-[280px]` sliding panel with categorized navigation

### 2. Hero Section

**Layout**: Two-column grid (`lg:grid-cols-2`)
- **Left Column**: Text content and CTAs
- **Right Column**: Video preview with decorative elements

**Key Elements**:
```css
/* Gradient text effect */
bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent

/* Button styling */
bg-gradient-to-r from-amber-400 to-rose-400 hover:scale-105 shadow-lg

/* Animated indicators */
h-2 w-2 rounded-full bg-gradient-to-r from-amber-400 to-rose-400
```

**Video Container**:
- Aspect ratio: `aspect-[4/3]`
- Rounded corners: `rounded-2xl`
- Shadow: `shadow-2xl`
- Custom mute button with fade-in on hover

### 3. Features Grid

**Interactive Tabs**: 6-column responsive grid of feature tabs
```css
/* Tab styling */
p-4 rounded-xl transition-all duration-200 hover:scale-[1.02]

/* Active state */
bg-gradient-to-br from-amber-50 to-rose-50 shadow-lg

/* Inactive state */
bg-gray-50 shadow hover:shadow-lg
```

**Expandable Content**: Each feature shows detailed preview when selected
- **Layout**: Three-column grid (description + preview)
- **Background**: `bg-gradient-to-br from-amber-50/50 to-rose-50/50`
- **Cards**: White cards with subtle shadows and hover effects

### 4. Testimonials Section

**Main Card**: Large testimonial card with navigation
```css
/* Card styling */
rounded-2xl bg-white shadow-2xl overflow-hidden

/* Layout */
lg:grid-cols-3 (2/3 content, 1/3 metrics)
```

**Navigation**:
- Circular arrow buttons with hover animations
- Dot indicators at bottom
- Smooth slide transitions with AnimatePresence

**Metrics Sidebar**:
- Gradient background: `bg-gradient-to-br from-amber-50 to-rose-50`
- Interactive metric selector buttons
- Achievement badges with icons

### 5. CTA Section

**Background**: Full-width gradient section
```css
bg-gradient-to-r from-amber-400/90 to-rose-400/90
```

**Form Styling**:
```css
/* Input */
bg-white/90 text-gray-900 placeholder:text-gray-500

/* Button */
variant="secondary" with ArrowRight icon
```

**Social Proof**: Statistics grid with animated counters
- Three-column layout on desktop
- Border separator: `border-t border-white/20`

### 6. Footer

**Background**: `bg-gray-900` with white text
**Layout**: Three-column grid on desktop
- **Left**: Brand info, description, contact details
- **Center/Right**: Four-column navigation grid

**Link Styling**:
```css
text-gray-300 transition-colors hover:text-white
```

---

## Animation Patterns

### Motion Library
All animations use **Framer Motion** with consistent patterns:

### Entrance Animations
```jsx
// Fade in from bottom
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}

// Fade in from sides
initial={{ opacity: 0, x: -30 }}
animate={{ opacity: 1, x: 0 }}

// Scale in
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
```

### Stagger Animations
```jsx
// Parent container
variants={{
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}}

// Child elements
variants={{
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}}
```

### Hover Effects
```jsx
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

### Continuous Animations
```jsx
// Pulsing elements
animate={{ scale: [1, 1.2, 1] }}
transition={{ duration: 2, repeat: Infinity }}

// Floating elements
animate={{ y: [0, -10, 0] }}
transition={{ duration: 4, repeat: Infinity }}
```

---

## Interactive Elements

### Button Styles

**Primary Button** (Brand gradient):
```css
bg-gradient-to-r from-amber-400 to-rose-400 
text-white font-medium rounded-lg 
hover:from-amber-500 hover:to-rose-500 
transition-all hover:scale-105 shadow-lg
```

**Secondary Button** (White/outline):
```css
bg-white text-gray-700 hover:bg-gray-50 
shadow-md hover:shadow-lg transition-all
```

**Ghost Button**:
```css
variant="ghost" for subtle interactions
```

### Form Elements

**Input Fields**:
```css
/* Standard input */
bg-white border border-gray-300 rounded-lg
focus:ring-2 focus:ring-amber-200

/* On gradient backgrounds */
bg-white/90 text-gray-900 placeholder:text-gray-500
```

### Cards and Containers

**Standard Card**:
```css
bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow
padding: p-4 to p-8 depending on content
```

**Feature Card** (interactive):
```css
/* Base */
bg-gray-50 rounded-xl shadow hover:shadow-lg

/* Active */
bg-gradient-to-br from-amber-50 to-rose-50 shadow-lg
ring-2 ring-amber-200
```

---

## Responsive Design

### Breakpoint Strategy
```css
/* Mobile First Approach */
base: 0px (mobile)
sm: 640px (small tablets)
md: 768px (tablets)
lg: 1024px (laptops)
xl: 1280px (desktops)
```

### Navigation Responsive Behavior
- **Desktop**: Horizontal navigation with dropdowns
- **Mobile**: Hidden navigation, hamburger menu
- **Tablet**: Mix of both depending on space

### Grid Responsive Patterns
```css
/* Feature tabs */
grid-cols-2 sm:grid-cols-3 lg:grid-cols-6

/* Content sections */
lg:grid-cols-2 (side-by-side on large screens)

/* Footer navigation */
grid-cols-2 md:grid-cols-2 lg:grid-cols-4
```

### Typography Responsive
```css
/* Hero title */
text-4xl sm:text-5xl xl:text-6xl

/* Section headers */
text-3xl sm:text-4xl
```

### Spacing Responsive
```css
/* Section padding */
px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20

/* Grid gaps */
gap-3 sm:gap-4 lg:gap-6
```

---

## Style Recommendations

### 1. **Consistency is Key**
- Use the established color palette throughout
- Maintain consistent spacing using the defined system
- Follow the typography hierarchy religiously

### 2. **Brand Gradient Usage**
- Use `from-amber-400 to-rose-400` for primary actions and highlights
- Apply to buttons, icons, text highlights, and decorative elements
- Use subtle versions (`from-amber-50 to-rose-50`) for backgrounds

### 3. **Shadow and Depth Strategy**
```css
/* Subtle depth */
shadow-sm hover:shadow-md

/* Standard cards */
shadow-lg

/* Hero elements */
shadow-2xl

/* Interactive hover */
hover:shadow-xl
```

### 4. **Animation Guidelines**
- Keep animations subtle and purposeful
- Use consistent timing (0.3s for quick, 0.6s for entrance)
- Implement stagger effects for lists and grids
- Always include viewport-based triggering for performance

### 5. **Content Structure**
- Lead with value proposition
- Use progressive disclosure (features expand on interaction)
- Include social proof prominently
- End with clear call-to-action

### 6. **Mobile-First Considerations**
- Ensure touch targets are minimum 44px
- Simplify navigation on mobile
- Stack content vertically on small screens
- Maintain readable text sizes across devices

### 7. **Accessibility Features**
- Maintain color contrast ratios
- Include proper focus states
- Use semantic HTML structure
- Provide alternative text for interactive elements

### 8. **Performance Optimizations**
- Use CSS transforms for animations (hardware acceleration)
- Implement intersection observer for scroll-triggered animations
- Optimize images and videos for web
- Minimize layout shifts during load

---

## Implementation Notes

When replicating this style:

1. **Start with the color palette** - define your gradient and neutral colors first
2. **Establish your typography scale** - consistent heading sizes and weights
3. **Build your grid system** - responsive container and column patterns
4. **Create reusable components** - buttons, cards, form elements
5. **Add animation progressively** - start with basic interactions, add complexity
6. **Test responsiveness early** - ensure mobile experience is solid
7. **Consider accessibility** - keyboard navigation, screen reader compatibility

This design system creates a modern, professional appearance that balances visual appeal with functionality, perfect for SaaS and business applications in the real estate technology space.