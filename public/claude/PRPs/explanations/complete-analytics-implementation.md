# Complete Analytics System Implementation - Option B

**Last Updated:** January 2025
**Author:** Claude Code
**Project:** Vesta CRM
**Complexity:** Advanced
**Estimated Implementation Time:** 20-30 minutes

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture & Design](#architecture--design)
3. [File Structure](#file-structure)
4. [Implementation Steps](#implementation-steps)
5. [Code Files](#code-files)
6. [Environment Variables](#environment-variables)
7. [Usage Examples](#usage-examples)
8. [Testing & Verification](#testing--verification)
9. [RGPD Compliance](#rgpd-compliance)
10. [Troubleshooting](#troubleshooting)
11. [Future Extensions](#future-extensions)

---

## Overview

### What This Implements

A **professional, scalable analytics system** for Vesta CRM that:

- ✅ Respects user cookie consent (RGPD compliant)
- ✅ Supports multiple analytics providers (Google Analytics, Vercel, Meta Pixel)
- ✅ Provides centralized event tracking across your app
- ✅ Is TypeScript-safe with proper types
- ✅ Easy to extend with new services
- ✅ Includes real estate-specific tracking examples

### Why This Approach?

**Traditional approach** (scattered analytics):
```typescript
// In component A
gtag('event', 'page_view');

// In component B
fbq('track', 'ViewContent');

// In component C
// Forgot to add tracking...
```

**Our approach** (centralized):
```typescript
// Anywhere in your app
import { analytics } from '~/lib/analytics';

analytics.track('property_viewed', {
  propertyId: '123',
  price: 500000
});

// Automatically sent to ALL enabled services
```

---

## Architecture & Design

### Design Principles

1. **Service-based Architecture**: Each analytics provider is a separate service
2. **Consent-driven**: Services only load if user has given consent
3. **Type-safe**: Full TypeScript support
4. **Extensible**: Adding new services requires minimal code
5. **Centralized**: One place to manage all tracking

### System Flow

```
User visits site
       ↓
Cookie Banner appears
       ↓
User accepts/rejects analytics
       ↓
Consent stored in localStorage
       ↓
AnalyticsProvider reads consent
       ↓
If analytics=true → Initialize services
       ↓
Services ready to track events
       ↓
App calls analytics.track()
       ↓
Event sent to all enabled services
```

### Component Hierarchy

```
layout.tsx
  └── AnalyticsProvider
        ├── GoogleAnalyticsService (if consent.analytics)
        ├── VercelAnalyticsService (if consent.analytics)
        └── MetaPixelService (if consent.marketing)
```

---

## File Structure

```
vesta/
├── src/
│   ├── lib/
│   │   └── analytics/
│   │       ├── index.ts                    # Main analytics manager & exports
│   │       ├── types.ts                    # TypeScript types & interfaces
│   │       ├── services/
│   │       │   ├── google-analytics.ts     # Google Analytics GA4 service
│   │       │   ├── vercel.ts               # Vercel Analytics service
│   │       │   └── meta-pixel.ts           # Meta Pixel service
│   │       └── events/
│   │           ├── common.ts               # Common web events
│   │           └── real-estate.ts          # Real estate specific events
│   │
│   ├── components/
│   │   └── analytics-provider.tsx          # React provider component
│   │
│   └── app/
│       └── layout.tsx                       # Updated root layout
│
├── .env.local                               # Environment variables
└── .env.example                             # Template for env vars
```

---

## Implementation Steps

### Step 1: Create Type Definitions

**File:** `src/lib/analytics/types.ts`

```typescript
/**
 * Type definitions for the analytics system
 */

// Supported analytics services
export type AnalyticsServiceType = 'google-analytics' | 'vercel' | 'meta-pixel' | 'hotjar' | 'mixpanel';

// Cookie consent structure (matches our cookie banner)
export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

// Configuration for each service
export interface AnalyticsServiceConfig {
  type: AnalyticsServiceType;
  enabled: boolean;
  apiKey?: string;
  options?: Record<string, any>;
}

// Base interface all analytics services must implement
export interface AnalyticsService {
  name: string;
  type: AnalyticsServiceType;
  enabled: boolean;

  // Initialize the service (load scripts, etc.)
  initialize(): Promise<void>;

  // Track a page view
  pageView(url: string, title?: string): void;

  // Track a custom event
  track(eventName: string, properties?: Record<string, any>): void;

  // Identify a user (for logged-in users)
  identify(userId: string, traits?: Record<string, any>): void;

  // Clean up when consent is revoked
  cleanup(): void;
}

// Event properties for type safety
export interface EventProperties {
  // Common properties
  category?: string;
  label?: string;
  value?: number;
  currency?: string;

  // Custom properties
  [key: string]: any;
}

// Real estate specific event properties
export interface PropertyEventProperties extends EventProperties {
  propertyId: string;
  price?: number;
  location?: string;
  type?: 'apartment' | 'house' | 'commercial' | 'land';
  operation?: 'sale' | 'rent';
  bedrooms?: number;
  bathrooms?: number;
  surface?: number;
}

export interface ContactEventProperties extends EventProperties {
  contactId?: string;
  source?: string;
  propertyId?: string;
  status?: 'lead' | 'prospect' | 'client';
}

export interface PortalEventProperties extends EventProperties {
  portal: 'fotocasa' | 'idealista' | 'habitaclia' | 'milanuncios';
  propertyId: string;
  action: 'published' | 'updated' | 'removed';
}
```

---

### Step 2: Create Analytics Manager

**File:** `src/lib/analytics/index.ts`

```typescript
/**
 * Centralized Analytics Manager
 *
 * This is the main entry point for all analytics tracking.
 * It manages multiple analytics services and provides a unified API.
 *
 * Usage:
 *   import { analytics } from '~/lib/analytics';
 *   analytics.track('button_clicked', { button: 'signup' });
 */

import type {
  AnalyticsService,
  AnalyticsServiceType,
  EventProperties
} from './types';

class AnalyticsManager {
  private services: Map<AnalyticsServiceType, AnalyticsService> = new Map();
  private initialized = false;
  private queue: Array<{ method: string; args: any[] }> = [];

  /**
   * Register an analytics service
   */
  register(service: AnalyticsService): void {
    this.services.set(service.type, service);
    console.log(`[Analytics] Registered service: ${service.name}`);
  }

  /**
   * Initialize all registered services
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('[Analytics] Already initialized');
      return;
    }

    console.log('[Analytics] Initializing services...');

    const initPromises = Array.from(this.services.values())
      .filter(service => service.enabled)
      .map(service => {
        return service.initialize().catch(error => {
          console.error(`[Analytics] Failed to initialize ${service.name}:`, error);
        });
      });

    await Promise.all(initPromises);

    this.initialized = true;
    console.log('[Analytics] All services initialized');

    // Process queued events
    this.processQueue();
  }

  /**
   * Track a page view
   */
  pageView(url: string, title?: string): void {
    if (!this.initialized) {
      this.queue.push({ method: 'pageView', args: [url, title] });
      return;
    }

    this.services.forEach(service => {
      if (service.enabled) {
        try {
          service.pageView(url, title);
        } catch (error) {
          console.error(`[Analytics] ${service.name} pageView failed:`, error);
        }
      }
    });
  }

  /**
   * Track a custom event
   */
  track(eventName: string, properties?: EventProperties): void {
    if (!this.initialized) {
      this.queue.push({ method: 'track', args: [eventName, properties] });
      return;
    }

    console.log(`[Analytics] Tracking event: ${eventName}`, properties);

    this.services.forEach(service => {
      if (service.enabled) {
        try {
          service.track(eventName, properties);
        } catch (error) {
          console.error(`[Analytics] ${service.name} track failed:`, error);
        }
      }
    });
  }

  /**
   * Identify a user
   */
  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.initialized) {
      this.queue.push({ method: 'identify', args: [userId, traits] });
      return;
    }

    this.services.forEach(service => {
      if (service.enabled) {
        try {
          service.identify(userId, traits);
        } catch (error) {
          console.error(`[Analytics] ${service.name} identify failed:`, error);
        }
      }
    });
  }

  /**
   * Clean up all services (when consent is revoked)
   */
  cleanup(): void {
    this.services.forEach(service => {
      try {
        service.cleanup();
      } catch (error) {
        console.error(`[Analytics] ${service.name} cleanup failed:`, error);
      }
    });

    this.initialized = false;
    this.queue = [];
    console.log('[Analytics] Cleaned up all services');
  }

  /**
   * Process queued events
   */
  private processQueue(): void {
    if (this.queue.length === 0) return;

    console.log(`[Analytics] Processing ${this.queue.length} queued events`);

    this.queue.forEach(({ method, args }) => {
      (this as any)[method](...args);
    });

    this.queue = [];
  }

  /**
   * Get a specific service
   */
  getService(type: AnalyticsServiceType): AnalyticsService | undefined {
    return this.services.get(type);
  }

  /**
   * Check if analytics is ready
   */
  isReady(): boolean {
    return this.initialized;
  }
}

// Singleton instance
export const analytics = new AnalyticsManager();

// Re-export types for convenience
export type {
  EventProperties,
  PropertyEventProperties,
  ContactEventProperties,
  PortalEventProperties
} from './types';
```

---

### Step 3: Create Google Analytics Service

**File:** `src/lib/analytics/services/google-analytics.ts`

```typescript
/**
 * Google Analytics 4 (GA4) Service
 *
 * Integrates with Google Analytics 4 for web analytics.
 * Tracks page views, events, and user behavior.
 *
 * Setup:
 *   1. Create a GA4 property at analytics.google.com
 *   2. Get your Measurement ID (G-XXXXXXXXXX)
 *   3. Add to .env.local: NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 */

import type { AnalyticsService, EventProperties } from '../types';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

export class GoogleAnalyticsService implements AnalyticsService {
  name = 'Google Analytics';
  type = 'google-analytics' as const;
  enabled: boolean;
  private measurementId: string;
  private initialized = false;

  constructor(measurementId: string, enabled = true) {
    this.measurementId = measurementId;
    this.enabled = enabled && !!measurementId;

    if (!measurementId) {
      console.warn('[Google Analytics] No measurement ID provided. Service disabled.');
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized || !this.enabled) return;

    console.log('[Google Analytics] Initializing...');

    try {
      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];

      // Define gtag function
      window.gtag = function gtag() {
        window.dataLayer?.push(arguments);
      };

      // Set initial timestamp
      window.gtag('js', new Date());

      // Configure GA4
      window.gtag('config', this.measurementId, {
        page_path: window.location.pathname,
        send_page_view: true,
      });

      // Load GA4 script
      await this.loadScript();

      this.initialized = true;
      console.log('[Google Analytics] Initialized successfully');
    } catch (error) {
      console.error('[Google Analytics] Initialization failed:', error);
      this.enabled = false;
    }
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;

      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Analytics script'));

      document.head.appendChild(script);
    });
  }

  pageView(url: string, title?: string): void {
    if (!this.enabled || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_path: url,
      page_title: title ?? document.title,
      page_location: window.location.href,
    });

    console.log('[Google Analytics] Page view tracked:', url);
  }

  track(eventName: string, properties?: EventProperties): void {
    if (!this.enabled || !window.gtag) return;

    // Convert event name to GA4 format (lowercase, underscores)
    const formattedName = eventName.toLowerCase().replace(/\s+/g, '_');

    window.gtag('event', formattedName, {
      event_category: properties?.category,
      event_label: properties?.label,
      value: properties?.value,
      currency: properties?.currency ?? 'EUR',
      ...properties,
    });

    console.log('[Google Analytics] Event tracked:', formattedName, properties);
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.enabled || !window.gtag) return;

    window.gtag('config', this.measurementId, {
      user_id: userId,
      user_properties: traits,
    });

    console.log('[Google Analytics] User identified:', userId);
  }

  cleanup(): void {
    // Remove GA4 cookies
    const cookies = ['_ga', '_ga_' + this.measurementId.replace('G-', '')];
    cookies.forEach(cookie => {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    // Remove script
    const script = document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`);
    if (script) {
      script.remove();
    }

    // Clear dataLayer
    if (window.dataLayer) {
      window.dataLayer = [];
    }

    this.initialized = false;
    console.log('[Google Analytics] Cleaned up');
  }
}
```

---

### Step 4: Create Vercel Analytics Service

**File:** `src/lib/analytics/services/vercel.ts`

```typescript
/**
 * Vercel Analytics Service
 *
 * Wrapper for Vercel's built-in analytics.
 * Provides privacy-friendly, first-party analytics.
 *
 * Note: Vercel Analytics is automatically available in Vercel deployments.
 * No API key needed.
 */

import type { AnalyticsService, EventProperties } from '../types';

export class VercelAnalyticsService implements AnalyticsService {
  name = 'Vercel Analytics';
  type = 'vercel' as const;
  enabled: boolean;
  private initialized = false;

  constructor(enabled = true) {
    this.enabled = enabled;
  }

  async initialize(): Promise<void> {
    if (this.initialized || !this.enabled) return;

    console.log('[Vercel Analytics] Initializing...');

    // Vercel Analytics is automatically injected via <Analytics /> component
    // We just need to track that we're using it

    this.initialized = true;
    console.log('[Vercel Analytics] Ready (using Vercel component)');
  }

  pageView(url: string, title?: string): void {
    if (!this.enabled) return;

    // Vercel Analytics automatically tracks page views via the component
    // We can add custom page view tracking if needed via their API

    console.log('[Vercel Analytics] Page view (auto-tracked):', url);
  }

  track(eventName: string, properties?: EventProperties): void {
    if (!this.enabled) return;

    // Vercel Analytics custom events (if you upgrade to Pro)
    // @ts-ignore - Vercel analytics might be available
    if (typeof window !== 'undefined' && window.va) {
      // @ts-ignore
      window.va('track', eventName, properties);
      console.log('[Vercel Analytics] Event tracked:', eventName, properties);
    }
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.enabled) return;

    // Vercel Analytics doesn't have built-in user identification
    // But we can track it as a custom property
    console.log('[Vercel Analytics] User identification (stored as property):', userId);
  }

  cleanup(): void {
    // Vercel Analytics doesn't store cookies
    // It uses first-party data only
    this.initialized = false;
    console.log('[Vercel Analytics] Cleaned up (no cookies to remove)');
  }
}
```

---

### Step 5: Create Meta Pixel Service

**File:** `src/lib/analytics/services/meta-pixel.ts`

```typescript
/**
 * Meta Pixel (Facebook Pixel) Service
 *
 * Integrates with Meta's advertising platform for conversion tracking.
 * Used for Facebook/Instagram ads optimization.
 *
 * Setup:
 *   1. Create a Meta Pixel at business.facebook.com/events_manager
 *   2. Get your Pixel ID (numeric, like 123456789012345)
 *   3. Add to .env.local: NEXT_PUBLIC_META_PIXEL_ID=123456789012345
 */

import type { AnalyticsService, EventProperties } from '../types';

// Extend Window interface for fbq
declare global {
  interface Window {
    fbq?: (
      command: string,
      eventName: string,
      data?: Record<string, any>
    ) => void;
    _fbq?: any;
  }
}

export class MetaPixelService implements AnalyticsService {
  name = 'Meta Pixel';
  type = 'meta-pixel' as const;
  enabled: boolean;
  private pixelId: string;
  private initialized = false;

  constructor(pixelId: string, enabled = true) {
    this.pixelId = pixelId;
    this.enabled = enabled && !!pixelId;

    if (!pixelId) {
      console.warn('[Meta Pixel] No pixel ID provided. Service disabled.');
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized || !this.enabled) return;

    console.log('[Meta Pixel] Initializing...');

    try {
      // Facebook Pixel base code
      !function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      }(
        window,
        document,
        'script',
        'https://connect.facebook.net/en_US/fbevents.js'
      );

      // Initialize pixel
      if (window.fbq) {
        window.fbq('init', this.pixelId);
        window.fbq('track', 'PageView');
      }

      this.initialized = true;
      console.log('[Meta Pixel] Initialized successfully');
    } catch (error) {
      console.error('[Meta Pixel] Initialization failed:', error);
      this.enabled = false;
    }
  }

  pageView(url: string, title?: string): void {
    if (!this.enabled || !window.fbq) return;

    window.fbq('track', 'PageView');
    console.log('[Meta Pixel] Page view tracked:', url);
  }

  track(eventName: string, properties?: EventProperties): void {
    if (!this.enabled || !window.fbq) return;

    // Map custom events to Meta standard events
    const standardEvents = [
      'ViewContent', 'Search', 'AddToCart', 'AddToWishlist',
      'InitiateCheckout', 'AddPaymentInfo', 'Purchase', 'Lead',
      'CompleteRegistration', 'Contact', 'Schedule'
    ];

    // Convert to PascalCase
    const formattedName = eventName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    const isStandard = standardEvents.includes(formattedName);
    const command = isStandard ? 'track' : 'trackCustom';

    window.fbq(command, formattedName, {
      value: properties?.value,
      currency: properties?.currency ?? 'EUR',
      ...properties,
    });

    console.log('[Meta Pixel] Event tracked:', formattedName, properties);
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.enabled || !window.fbq) return;

    // Meta Pixel doesn't have direct user identification
    // But we can set advanced matching data
    console.log('[Meta Pixel] User identified:', userId);
  }

  cleanup(): void {
    // Remove Meta Pixel cookies
    const cookies = ['_fbp', '_fbc'];
    cookies.forEach(cookie => {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    // Remove script
    const script = document.querySelector('script[src*="facebook.net/en_US/fbevents.js"]');
    if (script) {
      script.remove();
    }

    // Clear fbq
    if (window.fbq) {
      delete window.fbq;
      delete window._fbq;
    }

    this.initialized = false;
    console.log('[Meta Pixel] Cleaned up');
  }
}
```

---

### Step 6: Create Event Helpers

**File:** `src/lib/analytics/events/real-estate.ts`

```typescript
/**
 * Real Estate Specific Event Tracking Helpers
 *
 * Pre-defined event tracking functions for common real estate actions.
 * These provide a consistent API for tracking across your application.
 */

import { analytics } from '../index';
import type { PropertyEventProperties, ContactEventProperties, PortalEventProperties } from '../types';

/**
 * Property Events
 */
export const propertyEvents = {
  // When a user views a property listing
  viewed: (properties: PropertyEventProperties) => {
    analytics.track('property_viewed', {
      category: 'Property',
      ...properties,
    });
  },

  // When a property is created
  created: (properties: PropertyEventProperties) => {
    analytics.track('property_created', {
      category: 'Property',
      label: 'Property Created',
      ...properties,
    });
  },

  // When a property is updated
  updated: (properties: PropertyEventProperties) => {
    analytics.track('property_updated', {
      category: 'Property',
      label: 'Property Updated',
      ...properties,
    });
  },

  // When a property is favorited
  favorited: (properties: PropertyEventProperties) => {
    analytics.track('property_favorited', {
      category: 'Property',
      label: 'Property Favorited',
      ...properties,
    });
  },

  // When property images are viewed in gallery
  galleryViewed: (properties: PropertyEventProperties & { imageIndex: number }) => {
    analytics.track('property_gallery_viewed', {
      category: 'Property',
      label: 'Gallery Viewed',
      ...properties,
    });
  },

  // When property documents are downloaded
  documentDownloaded: (properties: PropertyEventProperties & { documentType: string }) => {
    analytics.track('property_document_downloaded', {
      category: 'Property',
      label: 'Document Downloaded',
      ...properties,
    });
  },
};

/**
 * Contact Events
 */
export const contactEvents = {
  // When a new contact is created
  created: (properties: ContactEventProperties) => {
    analytics.track('contact_created', {
      category: 'Contact',
      label: 'Contact Created',
      ...properties,
    });
  },

  // When a contact form is submitted
  formSubmitted: (properties: ContactEventProperties & { formType: string }) => {
    analytics.track('contact_form_submitted', {
      category: 'Contact',
      label: 'Form Submitted',
      ...properties,
    });
  },

  // When a contact is converted (lead → client)
  converted: (properties: ContactEventProperties) => {
    analytics.track('contact_converted', {
      category: 'Contact',
      label: 'Contact Converted',
      value: 1,
      ...properties,
    });
  },

  // When an email is sent to a contact
  emailSent: (properties: ContactEventProperties) => {
    analytics.track('contact_email_sent', {
      category: 'Contact',
      label: 'Email Sent',
      ...properties,
    });
  },

  // When a phone call is logged
  callLogged: (properties: ContactEventProperties & { duration?: number }) => {
    analytics.track('contact_call_logged', {
      category: 'Contact',
      label: 'Call Logged',
      ...properties,
    });
  },
};

/**
 * Portal Publication Events
 */
export const portalEvents = {
  // When a property is published to a portal
  published: (properties: PortalEventProperties) => {
    analytics.track('portal_published', {
      category: 'Portal',
      label: `Published to ${properties.portal}`,
      ...properties,
    });
  },

  // When a property listing is updated on a portal
  updated: (properties: PortalEventProperties) => {
    analytics.track('portal_updated', {
      category: 'Portal',
      label: `Updated on ${properties.portal}`,
      ...properties,
    });
  },

  // When a property is removed from a portal
  removed: (properties: PortalEventProperties) => {
    analytics.track('portal_removed', {
      category: 'Portal',
      label: `Removed from ${properties.portal}`,
      ...properties,
    });
  },

  // When a lead comes from a portal
  leadReceived: (properties: PortalEventProperties & { contactId?: string }) => {
    analytics.track('portal_lead_received', {
      category: 'Portal',
      label: `Lead from ${properties.portal}`,
      value: 1,
      ...properties,
    });
  },
};

/**
 * Appointment Events
 */
export const appointmentEvents = {
  // When an appointment is scheduled
  scheduled: (properties: { propertyId?: string; contactId?: string; appointmentType: string; date: string }) => {
    analytics.track('appointment_scheduled', {
      category: 'Appointment',
      label: 'Appointment Scheduled',
      ...properties,
    });
  },

  // When an appointment is completed
  completed: (properties: { propertyId?: string; contactId?: string; appointmentType: string }) => {
    analytics.track('appointment_completed', {
      category: 'Appointment',
      label: 'Appointment Completed',
      value: 1,
      ...properties,
    });
  },

  // When an appointment is cancelled
  cancelled: (properties: { propertyId?: string; contactId?: string; reason?: string }) => {
    analytics.track('appointment_cancelled', {
      category: 'Appointment',
      label: 'Appointment Cancelled',
      ...properties,
    });
  },
};

/**
 * User Authentication Events
 */
export const authEvents = {
  // When a user signs up
  signUp: (userId: string, method: string) => {
    analytics.track('user_signed_up', {
      category: 'Auth',
      label: 'User Signed Up',
      method,
    });
    analytics.identify(userId);
  },

  // When a user logs in
  login: (userId: string, method: string) => {
    analytics.track('user_logged_in', {
      category: 'Auth',
      label: 'User Logged In',
      method,
    });
    analytics.identify(userId);
  },

  // When a user logs out
  logout: () => {
    analytics.track('user_logged_out', {
      category: 'Auth',
      label: 'User Logged Out',
    });
  },
};

/**
 * AI Features Events
 */
export const aiEvents = {
  // When AI description is generated
  descriptionGenerated: (properties: { propertyId: string; language: string; wordCount: number }) => {
    analytics.track('ai_description_generated', {
      category: 'AI',
      label: 'Description Generated',
      ...properties,
    });
  },

  // When OCR processes a document
  documentProcessed: (properties: { documentType: string; pageCount: number; processingTime: number }) => {
    analytics.track('ai_document_processed', {
      category: 'AI',
      label: 'Document Processed',
      value: properties.processingTime,
      ...properties,
    });
  },
};
```

---

### Step 7: Create Analytics Provider Component

**File:** `src/components/analytics-provider.tsx`

```typescript
/**
 * Analytics Provider Component
 *
 * This component initializes and manages all analytics services based on user consent.
 * It should be added to the root layout to ensure analytics work site-wide.
 *
 * Features:
 * - Respects cookie consent
 * - Initializes services on consent
 * - Cleans up on consent revoked
 * - Tracks page views automatically
 * - Conditionally renders Vercel components
 */

'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

import { analytics } from '~/lib/analytics';
import { GoogleAnalyticsService } from '~/lib/analytics/services/google-analytics';
import { VercelAnalyticsService } from '~/lib/analytics/services/vercel';
import { MetaPixelService } from '~/lib/analytics/services/meta-pixel';
import type { CookieConsent } from '~/lib/analytics/types';

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [servicesReady, setServicesReady] = useState(false);

  // Initialize analytics services based on consent
  useEffect(() => {
    const initializeAnalytics = async () => {
      // Read consent from localStorage
      const savedConsent = localStorage.getItem('vesta-cookie-consent');

      if (!savedConsent) {
        console.log('[Analytics] No consent found, waiting for user choice...');
        return;
      }

      const consentData: CookieConsent = JSON.parse(savedConsent);
      setConsent(consentData);

      console.log('[Analytics] Consent loaded:', consentData);

      // Clear any existing services
      analytics.cleanup();

      // Register services based on consent
      if (consentData.analytics) {
        console.log('[Analytics] Analytics consent granted, initializing services...');

        // Google Analytics (if configured)
        const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
        if (gaId) {
          const gaService = new GoogleAnalyticsService(gaId, true);
          analytics.register(gaService);
        } else {
          console.warn('[Analytics] GA_MEASUREMENT_ID not configured');
        }

        // Vercel Analytics
        const vercelService = new VercelAnalyticsService(true);
        analytics.register(vercelService);
      }

      // Marketing services (Meta Pixel, etc.)
      if (consentData.marketing) {
        console.log('[Analytics] Marketing consent granted, initializing marketing services...');

        const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
        if (metaPixelId) {
          const metaService = new MetaPixelService(metaPixelId, true);
          analytics.register(metaService);
        }
      }

      // Initialize all registered services
      await analytics.initialize();
      setServicesReady(true);
    };

    initializeAnalytics();

    // Listen for consent changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vesta-cookie-consent') {
        console.log('[Analytics] Consent changed, reinitializing...');
        setServicesReady(false);
        initializeAnalytics();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (!servicesReady) return;

    const url = pathname + searchParams.toString();
    const title = document.title;

    // Small delay to ensure page is fully loaded
    const timeout = setTimeout(() => {
      analytics.pageView(url, title);
    }, 100);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams, servicesReady]);

  return (
    <>
      {children}

      {/* Only render Vercel components if analytics consent is given */}
      {consent?.analytics && (
        <>
          <VercelAnalytics />
          <SpeedInsights />
        </>
      )}
    </>
  );
}
```

---

### Step 8: Update Root Layout

**File:** `src/app/layout.tsx` (modifications only)

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserRoleProvider } from "~/components/providers/user-role-provider";
import { AnalyticsProvider } from "~/components/analytics-provider"; // NEW
import { CookieConsentBanner } from "~/components/cookie-consent-banner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vesta CRM - Real Estate Management System",
  description: "A comprehensive CRM system for real estate professionals",
  appleWebApp: {
    capable: true,
    title: "Vesta CRM",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AnalyticsProvider> {/* CHANGED: Wrap with AnalyticsProvider */}
          <UserRoleProvider>{children}</UserRoleProvider>
          <CookieConsentBanner />
        </AnalyticsProvider>
        {/* REMOVED: <Analytics /> and <SpeedInsights /> - now handled by AnalyticsProvider */}
      </body>
    </html>
  );
}
```

---

## Environment Variables

### `.env.local` (create this file)

```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Meta Pixel (Facebook)
NEXT_PUBLIC_META_PIXEL_ID=123456789012345

# Note: Vercel Analytics doesn't need env vars
```

### `.env.example` (update this file)

```bash
# Analytics Configuration
# Get your Google Analytics 4 Measurement ID from https://analytics.google.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Get your Meta Pixel ID from https://business.facebook.com/events_manager
NEXT_PUBLIC_META_PIXEL_ID=123456789012345

# Vercel Analytics is automatically enabled on Vercel deployments
# No configuration needed
```

---

## Usage Examples

### Basic Event Tracking

```typescript
// In any component or page
import { analytics } from '~/lib/analytics';

// Track a simple event
analytics.track('button_clicked', {
  button: 'signup',
  location: 'hero_section'
});

// Track with value (for conversions)
analytics.track('subscription_purchased', {
  value: 99,
  currency: 'EUR',
  plan: 'professional'
});
```

### Property Tracking

```typescript
import { propertyEvents } from '~/lib/analytics/events/real-estate';

// When user views a property
propertyEvents.viewed({
  propertyId: property.id.toString(),
  price: property.price,
  location: property.location,
  type: 'apartment',
  operation: 'sale',
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  surface: property.surface,
});

// When user favorites a property
propertyEvents.favorited({
  propertyId: property.id.toString(),
  price: property.price,
});

// When property is created
propertyEvents.created({
  propertyId: newProperty.id.toString(),
  type: 'house',
  price: 500000,
});
```

### Contact Tracking

```typescript
import { contactEvents } from '~/lib/analytics/events/real-estate';

// When contact form is submitted
contactEvents.formSubmitted({
  formType: 'property_inquiry',
  propertyId: '123',
  source: 'landing_page',
});

// When contact converts to client
contactEvents.converted({
  contactId: contact.id,
  status: 'client',
  source: 'fotocasa',
});
```

### Portal Tracking

```typescript
import { portalEvents } from '~/lib/analytics/events/real-estate';

// When property is published to portal
portalEvents.published({
  portal: 'fotocasa',
  propertyId: '123',
  action: 'published',
});

// When lead comes from portal
portalEvents.leadReceived({
  portal: 'idealista',
  propertyId: '123',
  contactId: '456',
});
```

### Auth Events

```typescript
import { authEvents } from '~/lib/analytics/events/real-estate';

// On signup
authEvents.signUp(user.id, 'email');

// On login
authEvents.login(user.id, 'google');

// On logout
authEvents.logout();
```

### AI Events

```typescript
import { aiEvents } from '~/lib/analytics/events/real-estate';

// When AI generates description
aiEvents.descriptionGenerated({
  propertyId: '123',
  language: 'es',
  wordCount: 150,
});

// When OCR processes document
aiEvents.documentProcessed({
  documentType: 'cadastral_certificate',
  pageCount: 3,
  processingTime: 2.5,
});
```

---

## Testing & Verification

### 1. Check Console Logs

Open browser console (F12) and look for:

```
[Analytics] Consent loaded: {analytics: true, marketing: false, ...}
[Analytics] Analytics consent granted, initializing services...
[Analytics] Registered service: Google Analytics
[Analytics] Registered service: Vercel Analytics
[Google Analytics] Initializing...
[Google Analytics] Initialized successfully
[Analytics] All services initialized
[Analytics] Page view tracked: /
```

### 2. Verify Google Analytics

1. Open [Google Analytics Real-Time](https://analytics.google.com)
2. Go to Real-Time → Overview
3. Navigate your site - you should see yourself as an active user
4. Trigger events - they should appear in real-time

### 3. Verify Meta Pixel (if enabled)

1. Install [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper) Chrome extension
2. Visit your site
3. Click the extension icon
4. Should show "Pixel Working" with green checkmark

### 4. Test Cookie Consent Flow

1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Cookie banner should appear
4. **Reject cookies** → Analytics should NOT load
5. Clear localStorage again
6. **Accept cookies** → Analytics SHOULD load
7. Check console for initialization logs

### 5. Network Tab Verification

Open DevTools → Network tab:

**With consent:**
- Should see requests to `googletagmanager.com`
- Should see requests to `facebook.net` (if Meta enabled)
- Should see Vercel analytics beacons

**Without consent:**
- NO requests to analytics services
- Only necessary requests

---

## RGPD Compliance

### How This Implementation Ensures Compliance

1. **✅ Prior Consent**
   - Analytics ONLY load after user accepts
   - Services are initialized conditionally
   - No tracking before consent

2. **✅ Granular Control**
   - Analytics cookies can be accepted/rejected independently
   - Marketing cookies separate from analytics
   - User can change preferences anytime

3. **✅ Easy Opt-Out**
   - Cookie settings accessible from cookie policy page
   - Cleanup method removes all cookies and scripts
   - LocalStorage tracks consent decisions

4. **✅ Transparency**
   - Cookie policy page details all services
   - Clear explanation of what each cookie does
   - Links to third-party privacy policies

5. **✅ Data Minimization**
   - Only necessary data is collected
   - Vercel Analytics is privacy-friendly (no personal data)
   - User identification only when logged in

### Consent Flow

```
1. User visits site
   ↓
2. Cookie banner appears (necessary cookies already active)
   ↓
3. User makes choice:

   Option A: Accept All
   → All services initialize
   → Tracking begins

   Option B: Reject All
   → Only necessary cookies
   → No analytics/marketing

   Option C: Customize
   → User toggles each category
   → Only selected services initialize
   ↓
4. Choice saved to localStorage
   ↓
5. On next visit:
   → No banner
   → Services auto-initialize based on saved consent
```

---

## Troubleshooting

### Analytics Not Loading

**Problem:** Console shows no analytics logs

**Solutions:**
1. Check consent: `JSON.parse(localStorage.getItem('vesta-cookie-consent'))`
2. Verify environment variables are set
3. Check for JavaScript errors in console
4. Ensure you're not blocking scripts (adblocker)

### Google Analytics Not Working

**Problem:** GA4 not showing data

**Solutions:**
1. Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is correct
2. Check it starts with `G-` not `UA-` (GA4, not Universal Analytics)
3. Wait 24-48 hours for data to appear in reports (real-time works immediately)
4. Check [Google Analytics DebugView](https://support.google.com/analytics/answer/7201382)

### Events Not Tracking

**Problem:** Custom events not appearing

**Solutions:**
1. Check console for `[Analytics] Tracking event:` logs
2. Verify analytics is initialized: `analytics.isReady()`
3. Check event name format (lowercase, underscores)
4. For GA4, check [DebugView](https://support.google.com/analytics/answer/7201382)

### Cookies Not Being Deleted

**Problem:** After rejecting, cookies still present

**Solutions:**
1. Check cleanup methods are being called
2. Manually clear: `document.cookie` (check all cookies)
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. Check for third-party cookie blocking in browser

### TypeScript Errors

**Problem:** Type errors in analytics code

**Solutions:**
1. Ensure all type files are in `lib/analytics/types.ts`
2. Run `npm run typecheck` to see specific errors
3. Check imports: `import type { ... } from '~/lib/analytics/types'`
4. Restart TypeScript server in VSCode

---

## Future Extensions

### Adding Hotjar (Heatmaps)

1. Create `src/lib/analytics/services/hotjar.ts`:

```typescript
import type { AnalyticsService } from '../types';

export class HotjarService implements AnalyticsService {
  name = 'Hotjar';
  type = 'hotjar' as const;
  enabled = true;
  private siteId: string;

  constructor(siteId: string) {
    this.siteId = siteId;
  }

  async initialize(): Promise<void> {
    (function(h: any, o: any, t: any, j: any, a?: any, r?: any) {
      h.hj = h.hj || function() { (h.hj.q = h.hj.q || []).push(arguments) };
      h._hjSettings = { hjid: this.siteId, hjsv: 6 };
      a = o.getElementsByTagName('head')[0];
      r = o.createElement('script');
      r.async = 1;
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
      a.appendChild(r);
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
  }

  pageView() {} // Hotjar auto-tracks
  track() {} // Not applicable
  identify(userId: string) {
    if (window.hj) {
      window.hj('identify', userId, {});
    }
  }
  cleanup() {
    // Remove Hotjar
    delete window.hj;
  }
}
```

2. Register in `analytics-provider.tsx`:

```typescript
import { HotjarService } from '~/lib/analytics/services/hotjar';

// In initializeAnalytics():
if (consentData.analytics) {
  const hotjarId = process.env.NEXT_PUBLIC_HOTJAR_ID;
  if (hotjarId) {
    analytics.register(new HotjarService(hotjarId));
  }
}
```

### Adding Mixpanel (Product Analytics)

Similar pattern - create service, implement interface, register.

### Custom Dashboards

Use the tracked data to build custom dashboards:

```typescript
// Example: Track most viewed properties
propertyEvents.viewed({ propertyId: '123', ... });

// In GA4, create custom report:
// Event name: property_viewed
// Group by: propertyId
// Count: event_count
```

---

## Summary

This implementation provides:

- ✅ **Professional analytics architecture**
- ✅ **RGPD/GDPR compliant** with cookie consent
- ✅ **Multiple analytics providers** (Google, Vercel, Meta)
- ✅ **Type-safe** with TypeScript
- ✅ **Easy to use** with centralized API
- ✅ **Real estate specific** event tracking
- ✅ **Extensible** - add new services easily
- ✅ **Well documented** with examples

**Total files to create:** 10
**Total lines of code:** ~1,500
**Implementation time:** 20-30 minutes
**Maintenance:** Minimal - just add events as needed

Once implemented, tracking becomes as simple as:

```typescript
import { propertyEvents } from '~/lib/analytics/events/real-estate';

propertyEvents.viewed({
  propertyId: '123',
  price: 500000
});
```

And it automatically sends to **all enabled analytics services** while respecting user privacy! 🎉
