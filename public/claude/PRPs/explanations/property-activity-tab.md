# Property Activity Tab - Implementation Plan

## Table of Contents
1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Component Architecture](#component-architecture)
4. [Data Structure](#data-structure)
5. [UI/UX Specifications](#uiux-specifications)
6. [Implementation Steps](#implementation-steps)
7. [Technical Details](#technical-details)

---

## Overview

### Purpose
The **Activity Tab** provides real estate agents with a quick, beautiful overview of property engagement through two primary metrics:
- **Visits** (scheduled and completed)
- **New Contacts** (interested buyers/viewers)

### Key Features
- **KPI Summary Cards** - High-level metrics at a glance
- **Expandable Detail Views** - Compact, information-dense cards for each item
- **Visual Status Indicators** - Quick identification of visit status
- **Actionable Quick Actions** - Context-specific buttons for common tasks

### Design Principles
Following Vesta's design system:
- **90% colorless** - Neutral grays and whites
- **Shadows over borders** - Clean, modern elevation
- **Color for status only** - Green (completed), Blue (scheduled), Gray (cancelled)
- **Information density** - Maximum data in minimal space

---

## Design Philosophy

### Visual Hierarchy
```
┌─────────────────────────────────────────────────────────────┐
│  [Actividad Tab]                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  📊 Visitas      │  │  👥 Contactos    │  ← KPI Cards  │
│  │  8 realizadas    │  │  5 nuevos        │               │
│  │  3 pendientes    │  │  12 total        │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Visitas Realizadas (8)                       [▼]    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ [Compact visit card 1]                              │   │
│  │ [Compact visit card 2]                              │   │
│  │ ...                                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Visitas Pendientes (3)                       [▼]    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ [Compact visit card 1]                              │   │
│  │ [Compact visit card 2]                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Nuevos Contactos (5)                         [▼]    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ [Compact contact card 1]                            │   │
│  │ [Compact contact card 2]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. **KPI Summary Cards**

Two side-by-side cards showing high-level metrics.

#### Visits KPI Card
```typescript
interface VisitsKPIProps {
  completedCount: number;
  scheduledCount: number;
  totalCount: number;
}
```

**Visual Specs:**
```
┌────────────────────────────┐
│  🏠 Visitas                │
│                            │
│  8 realizadas    ✓         │
│  3 pendientes    📅        │
│  11 total                  │
└────────────────────────────┘
```

**Styling:**
- Background: `bg-white`
- Shadow: `shadow-md hover:shadow-lg`
- Rounded: `rounded-xl`
- Padding: `p-6`
- Text colors:
  - Title: `text-gray-900 font-semibold text-lg`
  - Completed: `text-green-600 font-medium`
  - Scheduled: `text-blue-600 font-medium`
  - Total: `text-gray-500 text-sm`

#### Contacts KPI Card
```typescript
interface ContactsKPIProps {
  newContactsCount: number; // Contacts added in last 30 days
  totalContactsCount: number;
}
```

**Visual Specs:**
```
┌────────────────────────────┐
│  👥 Contactos Interesados  │
│                            │
│  5 nuevos      ⭐         │
│  12 total                  │
└────────────────────────────┘
```

**Styling:**
- Same as Visits KPI
- New contacts: `text-amber-600 font-medium`

---

### 2. **Expandable Section Component**

Reusable collapsible section with header and expandable content.

```typescript
interface ExpandableSectionProps {
  title: string;
  count: number;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}
```

**Visual Specs:**
```
┌─────────────────────────────────────────────────┐
│ Visitas Realizadas (8)               [▼]       │  ← Header (clickable)
├─────────────────────────────────────────────────┤
│                                                 │
│  [Content when expanded]                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

**States:**
- Collapsed: Shows only header
- Expanded: Shows header + content
- Transition: `transition-all duration-200`

**Styling:**
- Container: `bg-white rounded-xl shadow-md`
- Header: `p-4 cursor-pointer hover:bg-gray-50`
- Content: `p-4 pt-0 border-t border-gray-100`
- Chevron: Rotates 180° on expand

---

### 3. **Compact Visit Card**

Information-dense card showing visit details.

```typescript
interface CompactVisitCardProps {
  appointment: {
    appointmentId: bigint;
    datetimeStart: Date;
    datetimeEnd: Date;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    tripTimeMinutes?: number;
    notes?: string;
    type?: string;
  };
  contact: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  agent: {
    name: string;
  };
  hasSignatures: boolean;
}
```

**Visual Specs - Completed Visit:**
```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Juan García Pérez                   Hoy, 14:30 - 15:15   │
│  👨‍💼 Agente: María López     🕒 45 min (+ 15 min viaje)    │
│  📝 "Cliente muy interesado. Preguntó por..."               │
│  ✍️ Firmas: Cliente ✓ | Agente ✓                            │
│                                                             │
│  [Ver Detalles]  [Seguimiento]  [Nueva Tarea]              │
└─────────────────────────────────────────────────────────────┘
```

**Visual Specs - Scheduled Visit:**
```
┌─────────────────────────────────────────────────────────────┐
│  📅 Ana Martínez                   Mañana, 10:00 - 10:45    │
│  👨‍💼 Agente: Carlos Ruiz      🕒 45 min (+ 20 min viaje)   │
│  📞 +34 600 123 456  📧 ana.martinez@email.com              │
│                                                             │
│  [Reprogramar]  [Cancelar]  [Añadir Nota]                  │
└─────────────────────────────────────────────────────────────┘
```

**Styling:**

**Completed visits:**
- Border-left: `border-l-4 border-green-500`
- Status icon: `text-green-600`
- Background: `bg-white hover:bg-gray-50`
- Shadow: `shadow-sm hover:shadow-md`
- Transition: `transition-all duration-200`

**Scheduled visits:**
- Border-left: `border-l-4 border-blue-500`
- Status icon: `text-blue-600`

**Cancelled visits:**
- Border-left: `border-l-4 border-gray-300`
- Status icon: `text-gray-400`
- Opacity: `opacity-60`

**Layout:**
- Padding: `p-4`
- Gap between elements: `gap-2`
- Rounded: `rounded-lg`

**Typography:**
- Contact name: `text-gray-900 font-semibold text-base`
- Date/time: `text-gray-600 text-sm`
- Agent: `text-gray-700 text-sm`
- Duration: `text-gray-500 text-xs`
- Notes preview: `text-gray-600 text-sm italic line-clamp-2`
- Contact info: `text-gray-500 text-xs`

**Actions:**
- Buttons: `text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md`

---

### 4. **Compact Contact Card**

Shows new contact information with quick actions.

```typescript
interface CompactContactCardProps {
  contact: {
    contactId: bigint;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    createdAt: Date;
  };
  listingContact: {
    source?: string; // 'Website', 'Walk-In', 'Appointment'
    status?: string;
    contactType: 'buyer' | 'owner' | 'viewer';
  };
  hasUpcomingVisit: boolean;
  visitCount: number;
}
```

**Visual Specs:**
```
┌─────────────────────────────────────────────────────────────┐
│  👤 Ana Martínez                         Hace 2 días        │
│  🌐 Fuente: Consulta web  |  📊 Estado: Primer contacto     │
│  📧 ana.martinez@email.com  |  📞 +34 600 123 456           │
│  🏠 1 visita programada                                     │
│                                                             │
│  [Ver Perfil]  [Programar Visita]  [Enviar Email]          │
└─────────────────────────────────────────────────────────────┘
```

**Styling:**

**Container:**
- Background: `bg-white hover:bg-gray-50`
- Shadow: `shadow-sm hover:shadow-md`
- Rounded: `rounded-lg`
- Padding: `p-4`
- Border-left accent:
  - Buyer: `border-l-4 border-amber-400`
  - Viewer: `border-l-4 border-blue-400`
  - Owner: `border-l-4 border-purple-400`

**Typography:**
- Name: `text-gray-900 font-semibold text-base`
- Time ago: `text-gray-500 text-xs`
- Source/Status: `text-gray-600 text-sm`
- Contact info: `text-gray-500 text-xs`
- Visit count: `text-blue-600 text-sm font-medium`

**Badges:**
- Source badge: `bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium`
- Status badge: `bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium`

**Actions:**
- Same styling as visit card actions

---

## Data Structure

### Database Queries Needed

#### 1. Get Visits Summary
```typescript
export async function getListingVisitsSummary(listingId: bigint) {
  const allVisits = await db
    .select({
      appointmentId: appointments.appointmentId,
      datetimeStart: appointments.datetimeStart,
      datetimeEnd: appointments.datetimeEnd,
      status: appointments.status,
      tripTimeMinutes: appointments.tripTimeMinutes,
      notes: appointments.notes,
      type: appointments.type,
      contactFirstName: contacts.firstName,
      contactLastName: contacts.lastName,
      contactEmail: contacts.email,
      contactPhone: contacts.phone,
      agentName: users.name,
      googleEventId: appointments.googleEventId,
    })
    .from(appointments)
    .leftJoin(contacts, eq(appointments.contactId, contacts.contactId))
    .leftJoin(users, eq(appointments.userId, users.id))
    .where(
      and(
        eq(appointments.listingId, listingId),
        eq(appointments.isActive, true),
        or(
          eq(appointments.type, 'Visita'),
          isNull(appointments.type)
        )
      )
    )
    .orderBy(desc(appointments.datetimeStart));

  // Check for signatures for each appointment
  const appointmentIds = allVisits.map(v => v.appointmentId);
  const signatures = await db
    .select({
      appointmentId: documents.appointmentId,
      count: sql<number>`COUNT(*)`,
    })
    .from(documents)
    .where(
      and(
        inArray(documents.appointmentId, appointmentIds),
        eq(documents.documentTag, 'firma-visita'),
        eq(documents.isActive, true)
      )
    )
    .groupBy(documents.appointmentId);

  const signatureMap = new Map(
    signatures.map(s => [s.appointmentId.toString(), s.count])
  );

  return allVisits.map(visit => ({
    ...visit,
    hasSignatures: (signatureMap.get(visit.appointmentId.toString()) ?? 0) >= 2,
  }));
}
```

#### 2. Get Contacts Summary
```typescript
export async function getListingContactsSummary(listingId: bigint) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const allContacts = await db
    .select({
      contactId: contacts.contactId,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      email: contacts.email,
      phone: contacts.phone,
      contactType: listingContacts.contactType,
      source: listingContacts.source,
      status: listingContacts.status,
      createdAt: listingContacts.createdAt,
    })
    .from(listingContacts)
    .innerJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
    .where(
      and(
        eq(listingContacts.listingId, listingId),
        eq(listingContacts.isActive, true),
        in(listingContacts.contactType, ['buyer', 'viewer'])
      )
    )
    .orderBy(desc(listingContacts.createdAt));

  // Get visit counts for each contact
  const contactIds = allContacts.map(c => c.contactId);
  const visitCounts = await db
    .select({
      contactId: appointments.contactId,
      totalVisits: sql<number>`COUNT(*)`,
      upcomingVisits: sql<number>`SUM(CASE WHEN ${appointments.datetimeStart} > NOW() AND ${appointments.status} = 'Scheduled' THEN 1 ELSE 0 END)`,
    })
    .from(appointments)
    .where(
      and(
        inArray(appointments.contactId, contactIds),
        eq(appointments.listingId, listingId),
        eq(appointments.isActive, true)
      )
    )
    .groupBy(appointments.contactId);

  const visitMap = new Map(
    visitCounts.map(v => [v.contactId.toString(), v])
  );

  return allContacts.map(contact => ({
    ...contact,
    visitCount: visitMap.get(contact.contactId.toString())?.totalVisits ?? 0,
    hasUpcomingVisit: (visitMap.get(contact.contactId.toString())?.upcomingVisits ?? 0) > 0,
    isNew: contact.createdAt >= thirtyDaysAgo,
  }));
}
```

---

## UI/UX Specifications

### Interaction Patterns

#### 1. **Expandable Sections**
- **Default state:** All sections expanded on first load
- **User preference:** Collapse state persisted in localStorage
- **Animation:** Smooth 200ms transition
- **Visual feedback:** Chevron rotates, subtle hover state on header

#### 2. **Card Hover Effects**
- **Elevation:** `shadow-sm` → `shadow-md` on hover
- **Background:** Subtle `bg-gray-50` on hover
- **Duration:** `transition-all duration-200`

#### 3. **Quick Actions**
- **Visibility:** Always visible (not hidden until hover)
- **Spacing:** Equal spacing between buttons
- **Feedback:** Hover state changes background and text color
- **Icons:** Optional small icons before text

#### 4. **Time Display**
- **Relative time** for recent events: "Hace 2 horas", "Ayer", "Hace 3 días"
- **Absolute time** for older events: "15 Oct, 2024"
- **Format:** "Hoy, 14:30 - 15:15" for visit times

#### 5. **Empty States**

**No Completed Visits:**
```
┌─────────────────────────────────────────────────┐
│ Visitas Realizadas (0)                   [▼]   │
├─────────────────────────────────────────────────┤
│                                                 │
│         🏠                                      │
│    No hay visitas realizadas aún               │
│    Las visitas completadas aparecerán aquí     │
│                                                 │
│         [Programar Primera Visita]             │
│                                                 │
└─────────────────────────────────────────────────┘
```

**No Scheduled Visits:**
```
┌─────────────────────────────────────────────────┐
│ Visitas Pendientes (0)                   [▼]   │
├─────────────────────────────────────────────────┤
│                                                 │
│         📅                                      │
│    No hay visitas programadas                  │
│    Programa una visita para este inmueble      │
│                                                 │
│         [Programar Visita]                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

**No New Contacts:**
```
┌─────────────────────────────────────────────────┐
│ Nuevos Contactos (0)                     [▼]   │
├─────────────────────────────────────────────────┤
│                                                 │
│         👥                                      │
│    No hay contactos nuevos                     │
│    Los contactos recientes aparecerán aquí     │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Styling for empty states:**
- Center aligned text
- Icon: `text-gray-300 text-5xl mb-4`
- Title: `text-gray-500 font-medium text-base`
- Subtitle: `text-gray-400 text-sm`
- Action button: Secondary button style

---

### Responsive Design

#### Desktop (≥1024px)
- KPI cards: 2 columns, side by side
- Compact cards: Full width with all information visible
- Actions: All visible in a row

#### Tablet (768px - 1023px)
- KPI cards: 2 columns, smaller padding
- Compact cards: Full width, slightly compressed
- Actions: All visible but smaller spacing

#### Mobile (<768px)
- KPI cards: 1 column, stacked
- Compact cards: Adjusted layout
  - Name and date on separate lines
  - Contact info stacked
  - Actions: Horizontal scroll or dropdown menu
- Sections: All collapsed by default

---

## Implementation Steps

### Phase 1: Core Components (Day 1-2)

1. **Create base components:**
   ```
   src/components/propiedades/detail/activity/
   ├── visits-kpi-card.tsx
   ├── contacts-kpi-card.tsx
   ├── expandable-section.tsx
   ├── compact-visit-card.tsx
   ├── compact-contact-card.tsx
   └── activity-tab-content.tsx
   ```

2. **Implement queries:**
   ```
   src/server/queries/
   ├── activity.ts  (New file with both summary queries)
   ```

3. **Add to property-tabs.tsx:**
   - Add "Actividad" tab trigger
   - Add tab content with ActivityTabContent component

### Phase 2: Data Integration (Day 3)

1. **Fetch data in property page:**
   - Get visits summary
   - Get contacts summary
   - Pass to PropertyTabs component

2. **Add loading states:**
   - Skeleton for KPI cards
   - Skeleton for compact cards

3. **Add error handling:**
   - Error boundaries
   - Graceful error messages

### Phase 3: Interactions (Day 4)

1. **Implement quick actions:**
   - Ver Detalles → Navigate to visit/contact detail
   - Programar/Reprogramar → Open calendar modal
   - Seguimiento → Create task
   - Enviar Email → Open email modal

2. **Add localStorage persistence:**
   - Save collapse/expand state
   - Restore on page load

3. **Optimize performance:**
   - Memoize components
   - Lazy load action modals

### Phase 4: Polish & Testing (Day 5)

1. **Responsive testing:**
   - Test all breakpoints
   - Adjust mobile layout

2. **Accessibility:**
   - Keyboard navigation
   - Screen reader labels
   - Focus management

3. **Edge cases:**
   - Very long names
   - Missing data (no email, no phone)
   - Large numbers (100+ visits)

---

## Technical Details

### Component File Structure

#### `activity-tab-content.tsx` (Main container)
```typescript
"use client";

import { useState } from "react";
import { VisitsKPICard } from "./visits-kpi-card";
import { ContactsKPICard } from "./contacts-kpi-card";
import { ExpandableSection } from "./expandable-section";
import { CompactVisitCard } from "./compact-visit-card";
import { CompactContactCard } from "./compact-contact-card";

interface ActivityTabContentProps {
  visits: VisitWithDetails[];
  contacts: ContactWithDetails[];
  listingId: bigint;
}

export function ActivityTabContent({ visits, contacts, listingId }: ActivityTabContentProps) {
  const completedVisits = visits.filter(v => v.status === 'Completed');
  const scheduledVisits = visits.filter(v => v.status === 'Scheduled');
  const newContacts = contacts.filter(c => c.isNew);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VisitsKPICard
          completedCount={completedVisits.length}
          scheduledCount={scheduledVisits.length}
          totalCount={visits.length}
        />
        <ContactsKPICard
          newContactsCount={newContacts.length}
          totalContactsCount={contacts.length}
        />
      </div>

      {/* Completed Visits Section */}
      <ExpandableSection
        title="Visitas Realizadas"
        count={completedVisits.length}
        defaultExpanded={true}
      >
        <div className="space-y-3">
          {completedVisits.length === 0 ? (
            <EmptyState type="completed-visits" />
          ) : (
            completedVisits.map(visit => (
              <CompactVisitCard
                key={visit.appointmentId.toString()}
                appointment={visit}
                contact={visit.contact}
                agent={visit.agent}
                hasSignatures={visit.hasSignatures}
              />
            ))
          )}
        </div>
      </ExpandableSection>

      {/* Scheduled Visits Section */}
      <ExpandableSection
        title="Visitas Pendientes"
        count={scheduledVisits.length}
        defaultExpanded={true}
      >
        <div className="space-y-3">
          {scheduledVisits.length === 0 ? (
            <EmptyState type="scheduled-visits" />
          ) : (
            scheduledVisits.map(visit => (
              <CompactVisitCard
                key={visit.appointmentId.toString()}
                appointment={visit}
                contact={visit.contact}
                agent={visit.agent}
                hasSignatures={false}
              />
            ))
          )}
        </div>
      </ExpandableSection>

      {/* New Contacts Section */}
      <ExpandableSection
        title="Nuevos Contactos"
        count={newContacts.length}
        defaultExpanded={true}
      >
        <div className="space-y-3">
          {newContacts.length === 0 ? (
            <EmptyState type="new-contacts" />
          ) : (
            newContacts.map(contact => (
              <CompactContactCard
                key={contact.contactId.toString()}
                contact={contact}
                listingContact={contact.listingContact}
                hasUpcomingVisit={contact.hasUpcomingVisit}
                visitCount={contact.visitCount}
              />
            ))
          )}
        </div>
      </ExpandableSection>
    </div>
  );
}
```

#### `expandable-section.tsx` (Reusable collapsible)
```typescript
"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface ExpandableSectionProps {
  title: string;
  count: number;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  storageKey?: string; // For persisting state
}

export function ExpandableSection({
  title,
  count,
  defaultExpanded = true,
  children,
  storageKey,
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Load from localStorage on mount
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setIsExpanded(saved === 'true');
      }
    }
  }, [storageKey]);

  // Save to localStorage when changed
  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, String(newState));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <button
        onClick={handleToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          {title} ({count})
        </h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}
```

#### `compact-visit-card.tsx` (Visit display)
```typescript
"use client";

import { format, formatDistance } from "date-fns";
import { es } from "date-fns/locale";
import { Check, Calendar, Clock, User, FileSignature } from "lucide-react";

interface CompactVisitCardProps {
  appointment: {
    appointmentId: bigint;
    datetimeStart: Date;
    datetimeEnd: Date;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    tripTimeMinutes?: number;
    notes?: string;
    type?: string;
  };
  contact: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  agent: {
    name: string;
  };
  hasSignatures: boolean;
}

export function CompactVisitCard({
  appointment,
  contact,
  agent,
  hasSignatures,
}: CompactVisitCardProps) {
  const isCompleted = appointment.status === 'Completed';
  const isScheduled = appointment.status === 'Scheduled';

  const duration = Math.round(
    (appointment.datetimeEnd.getTime() - appointment.datetimeStart.getTime()) / 60000
  );

  const borderColor = isCompleted
    ? 'border-green-500'
    : isScheduled
    ? 'border-blue-500'
    : 'border-gray-300';

  const iconColor = isCompleted
    ? 'text-green-600'
    : isScheduled
    ? 'text-blue-600'
    : 'text-gray-400';

  const StatusIcon = isCompleted ? Check : Calendar;

  const formatVisitTime = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === -1) return 'Mañana';
    if (diffDays === 1) return 'Ayer';

    return format(date, "d MMM, yyyy", { locale: es });
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm hover:shadow-md
        border-l-4 ${borderColor}
        p-4 space-y-2
        transition-all duration-200
        ${appointment.status === 'Cancelled' ? 'opacity-60' : ''}
      `}
    >
      {/* Header: Name and Time */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
          <span className="text-gray-900 font-semibold">
            {contact.firstName} {contact.lastName}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          {formatVisitTime(appointment.datetimeStart)},{' '}
          {format(appointment.datetimeStart, 'HH:mm')} -{' '}
          {format(appointment.datetimeEnd, 'HH:mm')}
        </div>
      </div>

      {/* Agent and Duration */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-gray-700">
          <User className="w-4 h-4" />
          <span>Agente: {agent.name}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <Clock className="w-4 h-4" />
          <span>
            {duration} min
            {appointment.tripTimeMinutes && ` (+ ${appointment.tripTimeMinutes} min viaje)`}
          </span>
        </div>
      </div>

      {/* Contact Info (for scheduled visits) */}
      {isScheduled && (contact.phone || contact.email) && (
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {contact.phone && <span>📞 {contact.phone}</span>}
          {contact.email && <span>📧 {contact.email}</span>}
        </div>
      )}

      {/* Notes (for completed visits) */}
      {isCompleted && appointment.notes && (
        <div className="text-sm text-gray-600 italic line-clamp-2">
          📝 "{appointment.notes}"
        </div>
      )}

      {/* Signatures indicator */}
      {isCompleted && hasSignatures && (
        <div className="flex items-center gap-1 text-sm text-green-600">
          <FileSignature className="w-4 h-4" />
          <span>Firmas: Cliente ✓ | Agente ✓</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        {isCompleted ? (
          <>
            <button className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors">
              Ver Detalles
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors">
              Seguimiento
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors">
              Nueva Tarea
            </button>
          </>
        ) : (
          <>
            <button className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors">
              Reprogramar
            </button>
            <button className="text-sm text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors">
              Cancelar
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors">
              Añadir Nota
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

#### `compact-contact-card.tsx` (Contact display)
```typescript
"use client";

import { formatDistance } from "date-fns";
import { es } from "date-fns/locale";
import { User, Mail, Phone, ExternalLink, Calendar, Send } from "lucide-react";

interface CompactContactCardProps {
  contact: {
    contactId: bigint;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    createdAt: Date;
  };
  listingContact: {
    source?: string;
    status?: string;
    contactType: 'buyer' | 'owner' | 'viewer';
  };
  hasUpcomingVisit: boolean;
  visitCount: number;
}

export function CompactContactCard({
  contact,
  listingContact,
  hasUpcomingVisit,
  visitCount,
}: CompactContactCardProps) {
  const borderColor =
    listingContact.contactType === 'buyer'
      ? 'border-amber-400'
      : listingContact.contactType === 'viewer'
      ? 'border-blue-400'
      : 'border-purple-400';

  const timeAgo = formatDistance(contact.createdAt, new Date(), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm hover:shadow-md
        border-l-4 ${borderColor}
        p-4 space-y-2
        transition-all duration-200
      `}
    >
      {/* Header: Name and Time */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <span className="text-gray-900 font-semibold">
            {contact.firstName} {contact.lastName}
          </span>
        </div>
        <span className="text-xs text-gray-500">{timeAgo}</span>
      </div>

      {/* Source and Status */}
      <div className="flex items-center gap-2 flex-wrap">
        {listingContact.source && (
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">
            🌐 Fuente: {listingContact.source}
          </span>
        )}
        {listingContact.status && (
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
            📊 {listingContact.status}
          </span>
        )}
      </div>

      {/* Contact Information */}
      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
        {contact.email && (
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {contact.email}
          </span>
        )}
        {contact.phone && (
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {contact.phone}
          </span>
        )}
      </div>

      {/* Visit Info */}
      {visitCount > 0 && (
        <div className="text-sm text-blue-600 font-medium">
          🏠 {visitCount} {visitCount === 1 ? 'visita' : 'visitas'}
          {hasUpcomingVisit && ' (1 programada)'}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <button className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          Ver Perfil
        </button>
        <button className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Programar Visita
        </button>
        <button className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1">
          <Send className="w-3 h-3" />
          Enviar Email
        </button>
      </div>
    </div>
  );
}
```

---

## Performance Considerations

### Optimization Strategies

1. **Memoization:**
   ```typescript
   const CompactVisitCard = React.memo(CompactVisitCardComponent);
   const CompactContactCard = React.memo(CompactContactCardComponent);
   ```

2. **Virtual Scrolling:**
   - If >50 items, implement virtual scrolling with `react-window`

3. **Lazy Loading:**
   - Load action modals only when needed
   - Defer non-critical data fetching

4. **Data Fetching:**
   - Parallel fetch visits and contacts
   - Cache results with React Query or SWR
   - Revalidate on tab switch

---

## Future Enhancements (V2)

1. **Filters:**
   - Date range picker
   - Filter by agent
   - Filter by contact source

2. **Sorting:**
   - Sort visits by date (newest/oldest)
   - Sort contacts by engagement

3. **Bulk Actions:**
   - Select multiple visits
   - Export to CSV
   - Send bulk emails

4. **Analytics:**
   - Conversion rate (contacts → visits → deals)
   - Average time to first visit
   - Most active time slots

5. **Real-time Updates:**
   - WebSocket for live visit updates
   - Notifications when new contact arrives

---

This document provides a complete blueprint for implementing the Property Activity Tab with a focus on beautiful, information-dense displays following Vesta's design system principles.
