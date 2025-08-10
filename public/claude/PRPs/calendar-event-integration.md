## FEATURE:

**Calendar Event Integration with Appointment System**

Integrate the existing appointment database system with the calendar interface to display real-time events in the calendar grid. This involves:

1. **Calendar Time Range Extension**: Extend calendar view from current 7:00-21:00 to full 24-hour range (00:00-23:59) with default view starting at 9:00 AM
2. **Real Appointment Display**: Replace mock data with real appointments from the database, positioning them based on start/end times in the calendar grid
3. **Appointment Creation Modal**: Create a reusable appointment creation form accessible from:
   - Calendar page "crear evento" button
   - Operations dashboard quick action "Programar Cita" 
   - Clicking empty calendar time slots (pre-populates date/time)
4. **Click-to-Create Functionality**: Allow users to click any empty calendar time slot to open appointment creation modal with pre-populated date and time
5. **Modal Navigation**: Implement modal with X close button that returns to previous page/state

**Technical Requirements:**
- Maintain existing calendar view modes (list, calendar, weekly)
- Use existing appointment schema and database queries
- Follow established form patterns from contact creation
- Implement responsive design with proper mobile support
- Real-time calendar updates after appointment creation/modification

## EXAMPLES:

**Calendar Component Pattern**: `/Users/javierperezgarcia/Downloads/vesta/src/app/(dashboard)/calendario/page.tsx`
- Shows existing weekly calendar grid implementation with time-based event positioning
- Contains `calculateEventStyle()` function for positioning events in grid
- Implements interactive event selection and detail panel display
- Demonstrates filtering and view mode switching patterns

**Form Creation Pattern**: `/Users/javierperezgarcia/Downloads/vesta/src/components/contactos/crear/contact-form.tsx`
- Multi-step wizard form with progress indicators
- Uses `FloatingLabelInput` custom component for consistent styling
- Implements form validation and state management patterns
- Shows Framer Motion transitions between form steps

**Quick Action Pattern**: `/Users/javierperezgarcia/Downloads/vesta/src/components/dashboard/OperacionesQuickActionsCard.tsx`
- Grid layout for action buttons with icons
- Already includes "Programar Cita" action linking to `/calendario?new=true`
- Uses Framer Motion for hover animations and interactions

**Database Integration**: `/Users/javierperezgarcia/Downloads/vesta/src/server/queries/appointment.ts`
- Complete CRUD operations for appointments
- Query patterns for filtering by user, contact, date range, status
- Proper TypeScript typing with existing appointment model

**Dialog/Modal Pattern**: `/Users/javierperezgarcia/Downloads/vesta/src/components/ui/dialog.tsx`
- Radix UI Dialog implementation with proper accessibility
- Includes overlay, content, header, and footer structure
- Shows proper open/close state management

## DOCUMENTATION:

**Internal Documentation:**
- **Appointment Schema**: `/Users/javierperezgarcia/Downloads/vesta/src/server/db/schema.ts` - Lines 439-457 contain complete appointments table definition
- **Appointment Queries**: `/Users/javierperezgarcia/Downloads/vesta/src/server/queries/appointment.ts` - All CRUD operations and filtering logic
- **Data Types**: `/Users/javierperezgarcia/Downloads/vesta/src/lib/data.ts` - TypeScript interfaces for Appointment model
- **Dashboard Integration**: `/Users/javierperezgarcia/Downloads/vesta/src/server/queries/operaciones-dashboard.ts` - Shows how appointments are currently fetched for dashboard display

**External Documentation:**
- **Radix UI Dialog**: https://www.radix-ui.com/primitives/docs/components/dialog - For modal implementation patterns
- **Framer Motion**: https://www.framer.com/motion/ - For form transitions and animations
- **React Hook Form**: https://react-hook-form.com/ - For form validation patterns (if not already using)
- **Tailwind CSS Grid**: https://tailwindcss.com/docs/grid-template-columns - For calendar grid positioning

**Calendar Libraries Reference:**
- **FullCalendar**: https://fullcalendar.io/docs - For advanced calendar features if needed
- **React Big Calendar**: https://jquense.github.io/react-big-calendar/ - Alternative calendar component patterns

## OTHER CONSIDERATIONS:

**Database & Security:**
- Appointments are already properly secured through DAL (Data Access Layer) with `getCurrentUserAccountId()` filtering
- Trip time field recently added to schema - ensure new forms include this field
- All appointment queries use account-based filtering for multi-tenant security

**Calendar Grid Calculations:**
- Current `calculateEventStyle()` function uses 14-hour range (7:00-21:00)
- **Critical**: Must recalculate positioning logic for 24-hour range while maintaining 9:00 AM default start view
- Event overlap handling may need adjustment for longer time ranges
- Consider performance impact of rendering 24-hour grid vs. current 14-hour

**Form Integration Gotchas:**
- **Contact Selection**: New appointment form must integrate with existing contact system
- **Property Linking**: Allow linking appointments to specific listings/properties
- **Lead/Deal Association**: Support linking to existing leads or deals
- **Validation**: Ensure end time is after start time, prevent double-booking warnings
- **Time Zones**: Current schema includes user timezone - ensure proper handling

**UI/UX Considerations:**
- **Mobile Responsiveness**: Calendar grid becomes challenging on mobile with 24-hour range
- **Empty Slot Detection**: Click handling must differentiate between existing events and empty slots
- **Loading States**: Show proper loading when fetching real appointment data
- **Real-time Updates**: Consider WebSocket or polling for real-time calendar updates when other users create appointments

**Performance Considerations:**
- **Data Fetching**: Implement proper date range queries to avoid loading all appointments
- **Virtual Scrolling**: May be needed for 24-hour calendar grid on mobile devices
- **Caching**: Consider caching appointment data for frequently accessed date ranges

**Testing Requirements:**
- **Date/Time Edge Cases**: Test across different timezones, daylight saving changes
- **Appointment Overlap**: Test visual handling of overlapping appointments
- **Form Validation**: Test all appointment creation scenarios (contact selection, property linking, etc.)
- **Mobile Calendar**: Extensive testing of 24-hour grid on various mobile devices

**Code Architecture:**
- **Component Reusability**: Create appointment form as reusable component for multiple entry points
- **State Management**: Consider global state for calendar view (current date, selected appointment, etc.)
- **Error Handling**: Proper error boundaries for calendar rendering failures
- **Accessibility**: Ensure keyboard navigation works for calendar grid interaction