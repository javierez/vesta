name: "Calendar Event Integration with Appointment System"
description: |

## Purpose

Transform the existing calendar from mock data display to a fully functional appointment management system with real-time database integration, appointment creation, and interactive calendar functionality.

## Core Principles

1. **Follow Existing Patterns**: Mirror established form, modal, and database patterns in the codebase
2. **Maintain Calendar UX**: Preserve existing calendar views while enhancing functionality
3. **Database Security**: Use existing DAL patterns for multi-tenant security
4. **Component Reusability**: Create reusable appointment form for multiple entry points

---

## Goal

Create a fully integrated calendar system that displays real appointments from the database, allows creation of new appointments through multiple entry points, and provides click-to-create functionality for empty time slots. Extend calendar time range from 7:00-21:00 to full 24-hour display while maintaining 9:00 AM default view.

## Why

- **Business Value**: Transform calendar from demo to production-ready appointment management
- **User Productivity**: Enable direct appointment creation from calendar interface
- **Data Integration**: Connect existing appointment database to calendar visualization
- **Workflow Enhancement**: Provide quick access to appointment creation from operations dashboard
- **Mobile Support**: Ensure appointment management works across all devices

## What

**User-visible behavior:**
1. Calendar displays real appointments from database with proper time positioning
2. Click empty time slots to create appointments with pre-populated date/time
3. "Crear Evento" button opens appointment creation modal
4. Operations dashboard "Programar Cita" opens same appointment creation modal
5. 24-hour time range (00:00-23:59) with 9:00 AM default scroll position
6. Appointment creation modal with contact selection, property linking, and trip time
7. Real-time calendar updates after appointment creation/modification

**Technical requirements:**
- Maintain existing calendar view modes (list, calendar, weekly)
- Use existing appointment schema and database queries
- Follow established form patterns from contact creation
- Implement responsive design with proper mobile support
- Preserve DAL security filtering for multi-tenant access

### Success Criteria

- [ ] Calendar displays real appointments positioned by database start/end times
- [ ] Click empty calendar slots opens pre-populated appointment creation form
- [ ] Appointment creation modal accessible from 3 entry points (calendar, operations, URL param)
- [ ] 24-hour calendar grid renders properly on desktop and mobile
- [ ] New appointments appear immediately in calendar after creation
- [ ] All database operations use existing security patterns
- [ ] Form validation prevents invalid appointments (end before start, etc.)
- [ ] Trip time field integrated into appointment creation

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window

- file: src/app/(dashboard)/calendario/page.tsx
  why: Existing calendar implementation with calculateEventStyle() function for positioning
  critical: Current 7:00-21:00 time range logic must be extended to 24-hour

- file: src/components/contactos/crear/contact-form.tsx
  why: Multi-step form pattern with FloatingLabelInput and Framer Motion transitions
  critical: Must follow exact validation and state management patterns

- file: src/server/queries/appointment.ts
  why: Complete CRUD operations and database query patterns
  critical: Use createAppointment() function and handle BigInt conversions

- file: src/components/ui/dialog.tsx
  why: Modal implementation pattern with Radix UI
  critical: Follow exact open/close state management pattern

- file: src/components/ui/floating-label-input.tsx
  why: Form input component with animations and validation styling
  critical: Required for consistent form field appearance

- file: src/server/db/schema.ts (lines 439-457)
  why: Complete appointments table schema including tripTimeMinutes field
  critical: Must handle all entity relationships (contact, listing, lead, deal)

- url: https://www.radix-ui.com/primitives/docs/components/dialog
  section: Dialog API reference
  critical: Modal accessibility and keyboard navigation patterns

- url: https://www.framer.com/motion/
  section: AnimatePresence and motion.div
  critical: Form transition animations between steps

- file: src/components/dashboard/OperacionesQuickActionsCard.tsx
  why: Existing "Programar Cita" quick action pattern
  critical: Already links to /calendario?new=true parameter
```

### Current Codebase Structure (relevant files)

```bash
src/
├── app/(dashboard)/
│   ├── calendario/
│   │   └── page.tsx                    # Main calendar component (MODIFY)
│   └── operaciones/
│       └── page.tsx                    # Operations dashboard
├── components/
│   ├── contactos/crear/
│   │   └── contact-form.tsx           # Form pattern to mirror
│   ├── dashboard/
│   │   ├── OperacionesQuickActionsCard.tsx  # Has "Programar Cita" action
│   │   └── WorkQueueCard.tsx          # Recently updated with trip time
│   └── ui/
│       ├── dialog.tsx                 # Modal component
│       └── floating-label-input.tsx   # Form input component
├── server/
│   ├── db/
│   │   └── schema.ts                  # Appointments schema (lines 439-457)
│   └── queries/
│       ├── appointment.ts             # CRUD operations
│       └── operaciones-dashboard.ts   # Dashboard appointment queries
└── lib/
    ├── dal.ts                        # Security layer with getCurrentUserAccountId()
    └── data.ts                       # Type definitions
```

### Desired Codebase Structure (files to be added)

```bash
src/
├── components/
│   └── appointments/
│       ├── appointment-form.tsx       # CREATE: Reusable appointment creation form
│       ├── appointment-modal.tsx      # CREATE: Modal wrapper for appointment form
│       └── calendar-event.tsx         # CREATE: Individual calendar event component
├── server/
│   └── actions/
│       └── appointments.ts            # CREATE: Server actions for appointment CRUD
└── hooks/
    └── use-appointments.ts            # CREATE: Hook for appointment data fetching
```

### Known Gotchas of our codebase & Library Quirks

```typescript
// CRITICAL: Next.js requires 'use client' directive for interactive components
"use client";

// CRITICAL: BigInt conversions required for database operations
const appointmentId = BigInt(id); // Convert string to BigInt for queries

// CRITICAL: BetterAuth uses string IDs, not numbers
userId: string // Not number - must match BetterAuth format

// CRITICAL: Drizzle ORM requires specific timestamp handling
datetimeStart: new Date(dateString) // Convert to Date object

// CRITICAL: FloatingLabelInput expects specific onChange pattern
onChange={handleInputChange("fieldName")} // Function that returns function

// CRITICAL: Framer Motion AnimatePresence requires unique keys
<AnimatePresence mode="wait">
  <motion.div key={currentStep}> // Key is critical for transitions

// CRITICAL: Calendar positioning uses absolute positioning with pixel calculations
// Each hour = 60px height, starting from 7:00 AM baseline
const topPosition = ((startMinutes - 7 * 60) / 60) * 60;

// CRITICAL: Account-based filtering required for all queries
const accountId = await getCurrentUserAccountId(); // From DAL

// CRITICAL: Soft delete pattern - never hard delete appointments
isActive: false // Use soft delete, don't remove records
```

## Implementation Blueprint

### Data models and structure

```typescript
// Appointment Form Data Structure
interface AppointmentFormData {
  contactId: bigint;
  listingId?: bigint;
  leadId?: bigint;
  dealId?: bigint;
  prospectId?: bigint;
  startDate: string;      // YYYY-MM-DD format
  startTime: string;      // HH:mm format
  endDate: string;        // YYYY-MM-DD format
  endTime: string;        // HH:mm format
  tripTimeMinutes?: number;
  notes?: string;
  appointmentType: "Visita" | "Reunión" | "Firma" | "Cierre" | "Viaje";
}

// Calendar Event Display Type
interface CalendarEvent {
  appointmentId: bigint;
  contactName: string;
  propertyAddress?: string;
  startTime: Date;
  endTime: Date;
  status: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled" | "NoShow";
  type: string;
  tripTimeMinutes?: number;
  notes?: string;
}

// Extended calculateEventStyle for 24-hour range
interface EventStyle {
  top: string;      // CSS position from calendar top
  height: string;   // CSS height based on duration
  zIndex?: number;  // For overlapping events
}
```

### List of tasks to be completed to fulfill the PRP in the order they should be completed

```yaml
Task 1: Extend Calendar Time Range
MODIFY src/app/(dashboard)/calendario/page.tsx:
  - FIND calculateEventStyle function
  - CHANGE time range from 7:00-21:00 to 00:00-23:59
  - ADD default scroll position to 9:00 AM
  - UPDATE hour labels in grid from 7-21 to 0-23
  - TEST positioning calculations work with new range

Task 2: Create Appointment Server Actions  
CREATE src/server/actions/appointments.ts:
  - IMPORT existing queries from src/server/queries/appointment.ts
  - CREATE server action for appointment creation with form data
  - HANDLE BigInt conversions and Date object creation
  - USE getCurrentUserAccountId() for security
  - IMPLEMENT proper error handling and validation

Task 3: Create Reusable Appointment Form Component
CREATE src/components/appointments/appointment-form.tsx:
  - MIRROR pattern from src/components/contactos/crear/contact-form.tsx
  - USE multi-step form structure (contact selection → details → confirmation)
  - IMPLEMENT FloatingLabelInput for all form fields
  - ADD contact search/selection functionality
  - INCLUDE tripTimeMinutes field
  - ADD form validation for time conflicts

Task 4: Create Appointment Modal Wrapper
CREATE src/components/appointments/appointment-modal.tsx:
  - MIRROR pattern from src/components/ui/dialog.tsx
  - WRAP appointment form in Dialog component
  - HANDLE modal open/close state management
  - SUPPORT URL parameter triggering (new=true)
  - ADD close button with proper navigation

Task 5: Create Calendar Event Component
CREATE src/components/appointments/calendar-event.tsx:
  - CREATE individual event display component
  - HANDLE click events for event selection
  - APPLY appointment type color coding
  - SHOW contact name, time, and property address
  - SUPPORT responsive design for mobile

Task 6: Create Appointments Data Hook
CREATE src/hooks/use-appointments.ts:
  - CREATE custom hook for fetching appointment data
  - IMPLEMENT date range filtering for calendar views
  - HANDLE loading and error states
  - SUPPORT real-time updates after creation

Task 7: Integrate Real Appointments into Calendar
MODIFY src/app/(dashboard)/calendario/page.tsx:
  - REPLACE mock appointment data with real database queries
  - USE use-appointments hook for data fetching
  - UPDATE calculateEventStyle calls with real appointment times
  - IMPLEMENT click handling for empty time slots
  - ADD appointment creation modal integration

Task 8: Add Click-to-Create Functionality
MODIFY src/app/(dashboard)/calendario/page.tsx:
  - ADD click event handlers to empty calendar time slots
  - CALCULATE clicked date/time from grid position
  - OPEN appointment modal with pre-populated date/time
  - PREVENT clicks on existing events from creating new appointments

Task 9: Handle URL Parameters for Modal Triggering
MODIFY src/app/(dashboard)/calendario/page.tsx:
  - READ URLSearchParams for "new=true" parameter
  - OPEN appointment modal automatically when parameter present
  - CLEAR parameter after modal closes
  - SUPPORT pre-population from additional URL parameters

Task 10: Connect Operations Dashboard Quick Action
VERIFY src/components/dashboard/OperacionesQuickActionsCard.tsx:
  - CONFIRM "Programar Cita" links to /calendario?new=true
  - TEST modal opens correctly from operations dashboard
  - ENSURE proper navigation after appointment creation
```

### Per task pseudocode for critical tasks

```typescript
// Task 1: Calculate Event Style for 24-hour Range
function calculateEventStyle(startTime: string, endTime: string): EventStyle {
  const start = parseTime(startTime); // { hours: 14, minutes: 30 }
  const end = parseTime(endTime);
  
  // CRITICAL: Change from 7:00 baseline to 00:00 baseline
  const startMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;
  
  // Position from calendar top (each hour = 60px)
  const topPosition = (startMinutes / 60) * 60; // No offset needed for 00:00 start
  const duration = endMinutes - startMinutes;
  const height = (duration / 60) * 60;
  
  return {
    top: `${topPosition}px`,
    height: `${height}px`
  };
}

// Task 2: Server Action for Appointment Creation
async function createAppointmentAction(formData: AppointmentFormData) {
  "use server";
  
  // PATTERN: Always get account ID for security
  const accountId = await getCurrentUserAccountId();
  
  // CRITICAL: Convert form data to database format
  const appointmentData = {
    userId: (await getCurrentUser()).id, // String for BetterAuth
    contactId: BigInt(formData.contactId),
    listingId: formData.listingId ? BigInt(formData.listingId) : undefined,
    datetimeStart: new Date(`${formData.startDate}T${formData.startTime}`),
    datetimeEnd: new Date(`${formData.endDate}T${formData.endTime}`),
    tripTimeMinutes: formData.tripTimeMinutes,
    status: "Scheduled" as const,
    notes: formData.notes,
    isActive: true
  };
  
  try {
    // PATTERN: Use existing query function
    const result = await createAppointment(appointmentData);
    revalidatePath("/calendario"); // Refresh calendar data
    return { success: true, appointmentId: result.appointmentId };
  } catch (error) {
    console.error("Failed to create appointment:", error);
    return { success: false, error: error.message };
  }
}

// Task 3: Multi-Step Appointment Form
function AppointmentForm({ initialData, onSubmit, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AppointmentFormData>(initialData);
  
  const steps = [
    { id: "contact", title: "Seleccionar Contacto" },
    { id: "details", title: "Detalles de la Cita" },
    { id: "confirmation", title: "Confirmar" }
  ];
  
  // PATTERN: Step validation before proceeding
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: return formData.contactId !== null;
      case 1: return formData.startDate && formData.startTime && formData.endTime;
      default: return true;
    }
  };
  
  return (
    <AnimatePresence mode="wait">
      <motion.div key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        {renderStepContent()}
      </motion.div>
    </AnimatePresence>
  );
}

// Task 7: Empty Time Slot Click Handler
function handleTimeSlotClick(event: React.MouseEvent, dayIndex: number) {
  // PREVENT: Don't trigger if clicking on existing event
  if (event.target.closest('.calendar-event')) return;
  
  // CALCULATE: Clicked time from mouse position
  const rect = event.currentTarget.getBoundingClientRect();
  const relativeY = event.clientY - rect.top;
  const hour = Math.floor(relativeY / 60); // 60px per hour
  const minutes = Math.round(((relativeY % 60) / 60) * 60 / 15) * 15; // Snap to 15min
  
  // CREATE: Date object for clicked time
  const clickedDate = addDays(weekStart, dayIndex);
  const clickedTime = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  // OPEN: Modal with pre-populated data
  setModalData({
    startDate: format(clickedDate, 'yyyy-MM-dd'),
    startTime: clickedTime,
    endDate: format(clickedDate, 'yyyy-MM-dd'),
    endTime: format(addMinutes(new Date(`2000-01-01T${clickedTime}`), 60), 'HH:mm')
  });
  setShowModal(true);
}
```

### Integration Points

```yaml
DATABASE:
  - query: Use existing createAppointment() from src/server/queries/appointment.ts
  - security: Use getCurrentUserAccountId() for account filtering
  - types: Import Appointment type from src/lib/data.ts

ROUTING:
  - parameter: Handle ?new=true URL parameter for modal triggering
  - navigation: Use router.push() after successful appointment creation
  - revalidation: Call revalidatePath("/calendario") after data changes

STATE:
  - modal: useState for appointment modal open/close state
  - form: useState for multi-step form data
  - calendar: useState for selected date range and view mode

COMPONENTS:
  - dialog: Use existing Dialog components from src/components/ui/dialog.tsx
  - inputs: Use FloatingLabelInput from src/components/ui/floating-label-input.tsx
  - animations: Use Framer Motion for form transitions
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm typecheck                        # Type checking
pnpm lint                            # ESLint checking  
pnpm format:write                    # Prettier formatting

# Expected: No errors. If errors, READ the error message and fix.
# Common fixes:
# - Add 'use client' directive to interactive components
# - Import missing dependencies
# - Fix BigInt/number type mismatches
```

### Level 2: Component Tests

```typescript
// CREATE src/components/appointments/__tests__/appointment-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AppointmentForm from '../appointment-form';

describe('AppointmentForm', () => {
  const mockInitialData = {
    contactId: null,
    startDate: '2024-01-15',
    startTime: '10:00',
    endDate: '2024-01-15', 
    endTime: '11:00',
    tripTimeMinutes: 15,
    appointmentType: 'Visita' as const
  };

  it('should render contact selection step first', () => {
    render(<AppointmentForm initialData={mockInitialData} onSubmit={jest.fn()} />);
    expect(screen.getByText('Seleccionar Contacto')).toBeInTheDocument();
  });

  it('should validate required fields before proceeding', async () => {
    render(<AppointmentForm initialData={mockInitialData} onSubmit={jest.fn()} />);
    
    const nextButton = screen.getByText('Siguiente');
    fireEvent.click(nextButton);
    
    // Should stay on same step if validation fails
    expect(screen.getByText('Seleccionar Contacto')).toBeInTheDocument();
  });

  it('should prevent end time before start time', async () => {
    const invalidData = {
      ...mockInitialData,
      startTime: '15:00',
      endTime: '14:00' // End before start
    };
    
    render(<AppointmentForm initialData={invalidData} onSubmit={jest.fn()} />);
    // Add validation test logic
  });
});
```

```bash
# Run component tests
pnpm test appointment-form.test.tsx
# If failing: Read error, fix component logic, re-run
```

### Level 3: Integration Tests

```bash
# Start development server
pnpm dev

# Test calendar page loads with new 24-hour range
open http://localhost:3000/calendario
# Expected: Calendar shows 00:00-23:59 hours, scrolls to 9:00 AM

# Test appointment creation modal opens from URL
open http://localhost:3000/calendario?new=true  
# Expected: Modal opens automatically

# Test operations dashboard quick action
open http://localhost:3000/operaciones
# Click "Programar Cita" button
# Expected: Redirects to calendar with modal open

# Test empty time slot clicking
# Click empty area in calendar grid
# Expected: Modal opens with pre-populated date/time

# Test appointment form submission
# Fill out complete form and submit
# Expected: New appointment appears in calendar
```

### Level 4: Manual Testing Checklist

```bash
# Desktop Testing (Chrome/Safari/Firefox)
✓ Calendar renders 24-hour grid correctly
✓ Events position correctly based on database times  
✓ Click empty slots opens modal with correct date/time
✓ Appointment form validates all required fields
✓ New appointments appear immediately after creation
✓ Modal closes and navigates correctly

# Mobile Testing (375px viewport)
✓ Calendar grid scrolls horizontally on mobile
✓ Time slots clickable on touch devices
✓ Modal form usable on small screens
✓ Form validation works on mobile keyboards
✓ Touch scrolling works with 24-hour calendar

# Edge Cases
✓ Overlapping appointments display correctly
✓ Midnight/edge hour appointments position correctly
✓ Form handles timezone edge cases properly
✓ Long appointment notes don't break layout
✓ Contact search handles large contact lists
```

## Final Validation Checklist

- [ ] All tests pass: `pnpm test`
- [ ] No linting errors: `pnpm lint`  
- [ ] No type errors: `pnpm typecheck`
- [ ] Calendar displays real appointments from database
- [ ] Click empty time slots opens pre-populated modal
- [ ] Appointment creation works from all 3 entry points
- [ ] 24-hour calendar renders and scrolls to 9:00 AM
- [ ] New appointments appear immediately in calendar
- [ ] Mobile responsive design works properly
- [ ] Form validation prevents invalid appointments
- [ ] Trip time field integrated and functional

---

## Anti-Patterns to Avoid

- ❌ Don't create new form patterns - follow contact-form.tsx exactly
- ❌ Don't bypass DAL security - always use getCurrentUserAccountId()
- ❌ Don't hardcode time calculations - extend existing calculateEventStyle()
- ❌ Don't ignore BigInt conversions - database requires proper types
- ❌ Don't skip form validation - prevent invalid appointment creation
- ❌ Don't break existing calendar views - maintain list/calendar/weekly modes
- ❌ Don't forget mobile responsiveness - test 24-hour grid on small screens
- ❌ Don't mock tests to pass - fix underlying issues instead

**Confidence Score: 9/10** - Comprehensive context provided with existing patterns, detailed implementation tasks, and thorough validation loops. The one potential challenge is the 24-hour calendar grid positioning calculations, but existing code provides clear patterns to extend.