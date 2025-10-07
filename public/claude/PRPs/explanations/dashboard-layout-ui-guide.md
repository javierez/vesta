# Vesta Dashboard Layout - Comprehensive UI Style Guide

## Table of Contents
1. [Overall Layout Architecture](#overall-layout-architecture)
2. [Color Palette & Design System](#color-palette--design-system)
3. [Typography & Iconography](#typography--iconography)
4. [Sidebar Navigation System](#sidebar-navigation-system)
5. [Mobile Responsive Design](#mobile-responsive-design)
6. [Animation & Interaction Patterns](#animation--interaction-patterns)
7. [Component Breakdown](#component-breakdown)
8. [State Management & Accessibility](#state-management--accessibility)
9. [Style Recommendations](#style-recommendations)

---

## Overall Layout Architecture

The dashboard follows a classic **sidebar + main content** layout pattern:

```
┌─────────────────────────────────────────────────────┐
│                    Desktop Layout                   │
├───────────┬─────────────────────────────────────────┤
│           │ ┌─────────────────────────────────────┐ │
│           │ │        Mobile Menu Toggle         │ │
│  Sidebar  │ │     (Hidden on Desktop)           │ │
│  (Fixed   │ ├─────────────────────────────────────┤ │
│  Width    │ │                                   │ │
│  264px)   │ │          Main Content             │ │
│           │ │        (Dynamic Width)            │ │
│           │ │                                   │ │
│           │ │                                   │ │
└───────────┴─────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                    Mobile Layout                    │
├─────────────────────────────────────────────────────┤
│ ┌─────┐                                           │ │
│ │ ☰   │          Main Content                     │ │
│ └─────┘         (Full Width)                      │ │
│                                                   │ │
│  (Sidebar slides in from left as overlay)         │ │
└─────────────────────────────────────────────────────┘
```

**Key Layout Properties:**
- **Container**: `min-h-screen bg-gray-50` (full viewport height, light gray background)
- **Desktop Sidebar**: `lg:fixed lg:inset-y-0 lg:w-64` (fixed position, 256px width)
- **Main Content**: `lg:pl-64` (left padding to account for sidebar)
- **Mobile Overlay**: `fixed inset-0 z-40` (full-screen overlay with backdrop)

---

## Color Palette & Design System

### Background Colors
```css
/* Main background */
bg-gray-50          /* #f9fafb - Light neutral background */

/* Sidebar background */
bg-white            /* #ffffff - Clean white sidebar */

/* Mobile overlay backdrop */
bg-gray-600 bg-opacity-75  /* Semi-transparent dark overlay */
```

### Navigation Colors
```css
/* Default navigation text */
text-gray-600       /* #4b5563 - Medium gray for inactive items */

/* Active navigation text */
text-gray-900       /* #111827 - Dark gray for active items */

/* Active navigation background */
bg-gray-100         /* #f3f4f6 - Light gray highlight */

/* Hover states */
hover:bg-gray-50    /* #f9fafb - Subtle hover background */
hover:text-gray-900 /* #111827 - Darker text on hover */
```

### Icon Colors
```css
/* Default icons */
text-gray-400       /* #9ca3af - Light gray for icons */

/* Active icons */
text-gray-500       /* #6b7280 - Medium gray for active */

/* Hover icons */
group-hover:text-gray-500  /* Interactive state */
```

### Border Colors
```css
/* Sidebar border */
border-gray-200     /* #e5e7eb - Subtle border separation */

/* Section dividers */
border-t border-gray-200   /* Top border for sections */
```

### Disabled States
```css
/* Disabled text and icons */
text-gray-400 opacity-50   /* Muted and semi-transparent */
cursor-not-allowed         /* Visual feedback for disabled items */
```

---

## Typography & Iconography

### Text Hierarchy
```css
/* Main navigation items */
text-sm font-medium        /* 14px, medium weight */

/* Sub-navigation items */
text-xs font-normal        /* 12px, normal weight */

/* User profile name */
text-sm font-medium        /* 14px, medium weight */

/* User profile email */
text-xs                    /* 12px for secondary info */

/* Coming soon labels */
text-[10px]               /* 10px for micro text */
text-[9px]                /* 9px for smallest labels */
```

### Icon System
All icons use **Lucide React** with consistent sizing:

```css
/* Main navigation icons */
h-5 w-5                   /* 20x20px for primary navigation */

/* Sub-navigation icons */
h-3.5 w-3.5              /* 14x14px for secondary navigation */

/* User profile icon */
h-4 w-4                  /* 16x16px for user avatar */

/* Utility icons (close, menu) */
h-5 w-5                  /* 20x20px for action buttons */

/* Chevron indicators */
h-4 w-4                  /* 16x16px for expandable sections */
```

### Icon Categories
- **Building2**: Properties/Real Estate
- **Users**: Contacts/People
- **Calendar**: Scheduling
- **BarChart3**: Analytics/Reports  
- **Briefcase**: Operations/Business
- **Shield**: Admin/Security
- **Search**: Prospects/Discovery
- **TrendingUp**: Connections/Growth
- **HandHeart**: Deals/Agreements
- **Coins**: Accounting/Finance

---

## Sidebar Navigation System

### Main Navigation Structure
```css
/* Navigation container */
nav: flex-1 space-y-1 px-2 py-4

/* Navigation items */
.nav-item: rounded-md px-2 py-2 text-sm font-medium

/* Icon spacing */
.nav-icon: mr-3 h-5 w-5 flex-shrink-0
```

### Navigation States

**Default State:**
```css
text-gray-600 hover:bg-gray-50 hover:text-gray-900
```

**Active State:**
```css
bg-gray-100 text-gray-900
/* Icons: text-gray-500 */
```

**Disabled State:**
```css
text-gray-400 opacity-50 cursor-not-allowed
/* Includes "(próximamente)" label */
```

### Expandable Section (Operaciones)

**Parent Button:**
```css
/* Base styling */
group flex flex-1 items-center rounded-md px-2 py-2

/* Icon positioning */
Briefcase: mr-3 h-5 w-5 flex-shrink-0
ChevronDown: ml-auto h-4 w-4 transition-transform

/* Expanded state */
rotate-180 (for chevron when expanded)
```

**Sub-navigation:**
```css
/* Container */
relative ml-8 space-y-0.5

/* Vertical connector line */
absolute bottom-0 left-0 top-0 -ml-4 w-px bg-gray-300

/* Sub-items */
px-2 py-1.5 text-xs font-normal
```

### Animated Vertical Line
```css
@keyframes drawLine {
  from { height: 0%; }
  to { height: 100%; }
}

/* Applied to connector */
animation: drawLine 0.8s ease-out 0.6s forwards
```

---

## Mobile Responsive Design

### Breakpoint Strategy
- **Mobile**: `base` to `lg` (0-1024px) - Overlay sidebar
- **Desktop**: `lg+` (1024px+) - Fixed sidebar

### Mobile Sidebar Overlay
```css
/* Backdrop */
fixed inset-0 bg-gray-600 bg-opacity-75

/* Sidebar panel */
fixed inset-y-0 left-0 flex w-64 flex-col bg-white

/* Z-index layering */
z-40 (for overlay), z-50 (for sidebar content)
```

### Mobile Menu Toggle
```css
/* Toggle button */
lg:hidden           /* Only visible on mobile */
px-4                /* Consistent padding */

/* Menu/X icon */
h-5 w-5             /* Standard icon size */
```

### Desktop Sidebar
```css
/* Container */
hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col

/* Content area adjustment */
lg:pl-64            /* Left padding for main content */
```

---

## Animation & Interaction Patterns

### Hover Animations
```css
/* Navigation items */
transition-colors           /* Smooth color transitions */
hover:bg-gray-50           /* Background change */
hover:text-gray-900        /* Text color change */

/* Icon hover states */
group-hover:text-gray-500  /* Icon color follows parent hover */
```

### Expandable Section Animations
```css
/* Chevron rotation */
transition-transform
rotate-180 (when expanded)

/* Sub-item entrance */
animate-in slide-in-from-left-2 fade-in duration-300
/* Staggered animation delays: 0ms, 200ms, 400ms */
```

### Line Drawing Animation
```css
/* Custom CSS keyframe */
@keyframes drawLine {
  from { height: 0%; }
  to { height: 100%; }
}

/* Applied with delays */
animation: drawLine 0.8s ease-out 0.6s forwards
```

---

## Component Breakdown

### 1. Logo Section
```css
/* Container */
flex h-16 items-center px-4 mt-2

/* Logo positioning */
flex items-center ml-8

/* Logo sizing */
h-16 w-auto max-w-42 (desktop)
h-16 w-auto max-w-36 (mobile)
```

### 2. Main Navigation Items
```css
/* Item container */
group flex items-center rounded-md px-2 py-2 text-sm font-medium

/* Icon */
mr-3 h-5 w-5 flex-shrink-0

/* Text */
flex-1 (to push "coming soon" labels to the right)

/* Coming soon label */
text-[10px] text-gray-400
```

### 3. Expandable Operations Section
```css
/* Section container */
space-y-1

/* Toggle button */
group flex flex-1 items-center rounded-md px-2 py-2

/* Sub-navigation container */
relative ml-8 space-y-0.5

/* Sub-items */
animate-in slide-in-from-left-2 fade-in group flex items-center rounded-md px-2 py-1.5 text-xs
```

### 4. User Profile Section
```css
/* Container */
border-t border-gray-200 p-4

/* Layout */
flex items-center

/* Avatar */
flex h-8 w-8 items-center justify-center rounded-full bg-gray-300

/* User info */
ml-3 min-w-0 flex-1

/* Sign out button */
ml-2 (positioned at the end)
```

### 5. Feedback Button
```css
/* Container */
px-2 pb-2

/* Button styling */
w-full justify-start text-gray-600 hover:bg-gray-50 hover:text-gray-900

/* Icon */
mr-2 h-4 w-4
```

---

## State Management & Accessibility

### Interactive States
```css
/* Focus states */
focus-visible:outline-none focus-visible:ring-2

/* Active states */
bg-gray-100 text-gray-900 (for active navigation)

/* Disabled states */
cursor-not-allowed opacity-50 text-gray-400
```

### Responsive Behavior
- **Mobile**: Overlay sidebar with backdrop
- **Desktop**: Fixed sidebar with content offset
- **Touch targets**: Minimum 44px for mobile accessibility

### Keyboard Navigation
- All navigation items are focusable
- Proper tab order maintained
- Space/Enter activate navigation items

---

## Style Recommendations

### 1. **Consistent Spacing System**
```css
/* Use consistent padding/margin scale */
px-2, px-4    /* Horizontal padding */
py-1.5, py-2  /* Vertical padding */
space-y-1     /* Consistent spacing between items */
```

### 2. **Icon Usage Guidelines**
- Use semantic icons that clearly represent functionality
- Maintain consistent sizing (h-5 w-5 for main, h-4 w-4 for secondary)
- Apply `flex-shrink-0` to prevent icon distortion
- Use `mr-3` for consistent icon-to-text spacing

### 3. **Color Hierarchy**
```css
/* Primary content */
text-gray-900     /* Most important text */

/* Secondary content */
text-gray-600     /* Navigation labels */

/* Tertiary content */
text-gray-400     /* Icons, disabled text */

/* Subtle content */
text-gray-300     /* Borders, dividers */
```

### 4. **Navigation States**
```css
/* Clear visual hierarchy */
Default → Hover → Active
gray-600 → gray-900 → gray-900 + gray-100 bg

/* Smooth transitions */
transition-colors (for all interactive elements)
```

### 5. **Mobile-First Approach**
- Design for mobile overlay first
- Use `lg:` prefixes for desktop-specific styles
- Ensure touch targets meet minimum size requirements
- Test sidebar usability on various screen sizes

### 6. **Animation Principles**
```css
/* Subtle and purposeful */
duration-300      /* Standard timing for most animations */
ease-out         /* Comfortable easing for entrances */

/* Staggered reveals */
animation-delay   /* For sequential item reveals */
```

### 7. **Accessibility Considerations**
- Maintain sufficient color contrast (gray-600 on white = 7.23:1)
- Provide clear focus indicators
- Use semantic HTML structure
- Include proper ARIA labels where needed

### 8. **Content Organization**
- Group related navigation items
- Use visual separators (borders) between sections
- Place admin functions at the bottom
- Include user context (profile) in dedicated area

### 9. **Responsive Design Patterns**
```css
/* Mobile overlay pattern */
fixed inset-0 + backdrop + slide-in panel

/* Desktop fixed sidebar pattern */
lg:fixed + lg:pl-64 content offset

/* Consistent across breakpoints */
Same navigation structure, different presentation
```

### 10. **Performance Considerations**
- Use CSS transitions instead of JavaScript animations
- Minimize layout shifts during interactions
- Optimize images (logo) with proper sizing
- Use efficient selectors for hover/focus states

---

## Implementation Notes

When replicating this dashboard layout:

1. **Start with the basic layout structure** - sidebar + main content
2. **Establish the color system** - use the gray scale consistently
3. **Build navigation components** - start with simple items, add complexity
4. **Implement responsive behavior** - mobile overlay, desktop fixed
5. **Add interactive states** - hover, active, disabled
6. **Include animation progressively** - start with basic transitions
7. **Test across devices** - ensure mobile overlay works smoothly
8. **Optimize for accessibility** - keyboard navigation, screen readers

This dashboard layout creates a professional, enterprise-ready interface that balances functionality with usability, perfect for business applications requiring clear navigation hierarchy and responsive design.

---

## Design System Extensions

### Button Integration
The dashboard uses the shadcn/ui button system:

```css
/* Ghost variant (most common) */
variant="ghost" hover:bg-accent hover:text-accent-foreground

/* Size variants */
size="sm" (h-9 rounded-md px-3)
size="icon" (h-10 w-10)

/* Standard button properties */
inline-flex items-center justify-center gap-2
transition-colors focus-visible:outline-none
```

### Layout Flexibility
- Content area adjusts automatically to sidebar width
- Maintains consistent padding/margins across screen sizes
- Supports dynamic content without breaking layout structure
- Accommodates future navigation additions seamlessly