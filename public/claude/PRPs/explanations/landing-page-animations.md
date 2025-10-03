# Landing Page Animation Patterns Documentation

## Overview
The Vesta landing page implements a sophisticated animation system using **Framer Motion** with React. The animations create a smooth, professional user experience that guides attention and enhances interactivity.

## Core Animation Library: Framer Motion

All animations are powered by Framer Motion (`framer-motion`), a production-ready motion library for React that provides:
- Declarative animations
- Gesture support
- Scroll-triggered animations
- Spring physics
- Orchestration capabilities

## Animation Types and Patterns

### 1. Fade In Animations

#### Fade In with Direction
The most common pattern combines opacity changes with directional movement:

```typescript
// Fade in from left
initial={{ opacity: 0, x: -30 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.6, ease: "easeOut" }}

// Fade in from right
initial={{ opacity: 0, x: 50 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}

// Fade in from bottom (up)
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6, delay: 0.2 }}

// Fade in from top (down)
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}
```

### 2. Scale Animations

#### Scale with Opacity
Used for emphasis and attention-grabbing effects:

```typescript
// Scale up from smaller size
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.5, delay: 0.5 }}

// Scale with spring physics
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ 
  type: "spring", 
  stiffness: 300, 
  damping: 20 
}}

// Interactive scale on hover
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

### 3. Stagger Animations

#### Sequential Child Animations
Creates a cascading effect for list items or grouped elements:

```typescript
// Parent container
initial="hidden"
whileInView="visible"
viewport={{ once: true, amount: 0.3 }}
variants={{
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}}

// Child items
variants={{
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
}}
```

### 4. Continuous/Loop Animations

#### Pulsing Effects
Used for decorative elements and status indicators:

```typescript
// Pulsing dots
animate={{ scale: [1, 1.2, 1] }}
transition={{ 
  duration: 2, 
  repeat: Infinity, 
  repeatDelay: 1 
}}

// Decorative floating orbs
animate={{ 
  scale: [1, 1.2, 1], 
  opacity: [0.5, 0.8, 0.5] 
}}
transition={{ 
  duration: 4, 
  repeat: Infinity, 
  ease: "easeInOut" 
}}
```

### 5. Scroll-Triggered Animations

#### Viewport-Based Triggering
Animations that start when elements enter the viewport:

```typescript
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ 
  once: true,    // Only animate once
  amount: 0.3    // Trigger when 30% visible
}}
transition={{ duration: 0.6 }}
```

### 6. Page Transition Animations (AnimatePresence)

#### Component Switching with Animation
Smooth transitions between different states or components:

```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={currentTestimonial}
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    transition={{ duration: 0.5, ease: "easeInOut" }}
  >
    {/* Content */}
  </motion.div>
</AnimatePresence>
```

## Component-Specific Implementations

### HeroSection Animations

The hero section uses multiple animation layers:

1. **Text Content** - Slides in from left with staggered timing
2. **Gradient Text** - Scales up with delayed timing for emphasis
3. **Video Container** - Slides in from right
4. **Decorative Orbs** - Continuous floating animation
5. **Feature Bullets** - Pulsing dots with staggered delays

```typescript
// Main heading animation
<motion.div
  className="space-y-6"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.2 }}
>
  <h1>
    Gestiona tu Agencia Inmobiliaria de forma{" "}
    <motion.span
      className="bg-gradient-to-r from-amber-400 to-rose-400"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      Inteligente
    </motion.span>
  </h1>
</motion.div>
```

### FeaturesGrid Animations

Interactive feature tabs with complex state transitions:

1. **Tab Buttons** - Spring physics on interaction
2. **Content Panels** - Slide and fade transitions
3. **Stats** - Number counters (simplified animation)

```typescript
// Feature tab button
<motion.button
  variants={{
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
/>

// Feature content panel
<motion.div
  key={activeFeature}
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 20 }}
  transition={{ duration: 0.3 }}
/>
```

### TestimonialsSection Animations

Carousel with sophisticated transitions:

1. **Trust Indicators** - Animated counters
2. **Testimonial Cards** - Horizontal slide transitions
3. **Navigation Arrows** - Scale on interaction
4. **Indicator Dots** - Dynamic scaling based on state

```typescript
// Testimonial card transition
<AnimatePresence mode="wait">
  <motion.div
    key={currentTestimonial}
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    transition={{ duration: 0.5, ease: "easeInOut" }}
  />
</AnimatePresence>

// Navigation button
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 1 }}
/>
```

### CTASection Animations

Call-to-action with emphasis animations:

1. **Main Heading** - Scale and fade for impact
2. **Form Elements** - Delayed entrance
3. **Success State** - Spring animation on submit
4. **Value Props** - Staggered list animations

```typescript
// Success checkmark animation
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ 
    duration: 0.5, 
    type: "spring", 
    stiffness: 200 
  }}
>
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 0.5, delay: 0.1 }}
  >
    <Check className="h-5 w-5" />
  </motion.div>
</motion.div>
```

## Animation Utilities and Helpers

### Reusable Animation Variants

The project includes predefined animation variants in `animations.tsx`:

```typescript
// Fade in variations
export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// Stagger container for lists
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};
```

### Animation Components

Pre-built wrapper components for common animations:

```typescript
export const FadeInUp = ({ children, delay = 0 }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={fadeInUp}
    transition={{ delay }}
  >
    {children}
  </motion.div>
);

export const StaggerContainer = ({ children }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={staggerContainer}
  >
    {children}
  </motion.div>
);
```

### Animated Counter

Simple counter component for statistics:

```typescript
export const AnimatedCounter = ({
  to,
  duration = 2,
  prefix = "",
  suffix = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {prefix}
      <motion.span>{to.toLocaleString()}</motion.span>
      {suffix}
    </motion.div>
  );
};
```

## Best Practices and Performance Considerations

### 1. Viewport Triggering
- Use `viewport={{ once: true }}` to prevent re-triggering
- Set appropriate `amount` threshold (0.3 = 30% visible)

### 2. Animation Timing
- Keep durations between 0.3-0.8s for smooth UX
- Use delays to create visual hierarchy
- Apply easing functions for natural movement

### 3. Spring Physics
- Use for interactive elements (buttons, cards)
- Configure stiffness (100-500) and damping (10-30)
- Provides more natural feel than duration-based

### 4. Performance Optimization
- Limit simultaneous animations
- Use CSS transforms (scale, translate) over layout properties
- Implement `will-change` for heavy animations
- Consider `layoutId` for shared element transitions

### 5. Accessibility
- Respect `prefers-reduced-motion` user preference
- Provide animation-free alternatives
- Ensure content is readable during transitions

## Implementation Checklist

When implementing these animations in a new project:

1. **Install Framer Motion**
   ```bash
   npm install framer-motion
   ```

2. **Set up animation utilities**
   - Create animation variant objects
   - Build reusable animation components
   - Configure default transitions

3. **Apply animations systematically**
   - Hero sections: Bold entrance animations
   - Content sections: Scroll-triggered reveals
   - Interactive elements: Hover/tap feedback
   - Lists: Stagger animations
   - Transitions: AnimatePresence for state changes

4. **Test and optimize**
   - Check performance on lower-end devices
   - Verify animations work on all browsers
   - Test with reduced motion preference
   - Optimize bundle size (tree-shake unused features)

## Common Animation Patterns Summary

| Pattern | Use Case | Key Properties |
|---------|----------|----------------|
| Fade + Slide | Content entrance | opacity, x/y, duration |
| Scale | Emphasis, buttons | scale, spring physics |
| Stagger | Lists, grids | staggerChildren, delayChildren |
| Loop | Decorative, status | repeat: Infinity, repeatDelay |
| Viewport | Scroll reveals | whileInView, viewport |
| Presence | Page transitions | AnimatePresence, exit |

## Code Examples for Quick Reference

### Basic Fade In
```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
/>
```

### Hover Button
```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
/>
```

### Scroll Trigger
```typescript
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
/>
```

### Stagger List
```typescript
<motion.ul variants={staggerContainer}>
  {items.map(item => (
    <motion.li variants={staggerItem}>
      {item}
    </motion.li>
  ))}
</motion.ul>
```

This documentation provides a complete reference for implementing similar animation patterns in other projects, with all the necessary code snippets and best practices from the Vesta landing page implementation.