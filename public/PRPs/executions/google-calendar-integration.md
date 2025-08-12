name: "Google Calendar Integration PRP - Full Bidirectional Sync with Connect/Disconnect"
description: |

## Goal

Implement a complete Google Calendar integration that provides full bidirectional synchronization between the Vesta calendar (`/calendario`) and each user's Google Calendar, with easy connect/disconnect functionality.

## Why

- **User Convenience**: Users can manage appointments in either Vesta or Google Calendar and see changes reflected immediately in both places
- **Real-time Sync**: Eliminates manual double-entry and reduces scheduling conflicts
- **Professional Integration**: Modern real estate professionals expect seamless calendar integration
- **Optional Usage**: Users can choose to connect or disconnect at any time without losing local data

## What

### Success Criteria

- [ ] Users can connect their Google Calendar via OAuth 2.0 with a simple button click
- [ ] Users can disconnect their Google Calendar integration while preserving local appointments
- [ ] All appointments created in Vesta appear in Google Calendar automatically
- [ ] All appointments created in Google Calendar appear in Vesta automatically  
- [ ] Changes made in either calendar sync to the other in real-time via webhooks
- [ ] Appointment deletions sync bidirectionally
- [ ] Integration status is clearly visible in the calendar UI
- [ ] Manual "Sync Now" option for debugging/testing
- [ ] Proper error handling and user feedback for sync issues

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://developers.google.com/workspace/calendar/api/guides/overview
  why: Complete API overview and authentication setup

- url: https://developers.google.com/workspace/calendar/api/v3/reference/events
  why: Events API reference for CRUD operations

- url: https://developers.google.com/workspace/calendar/api/guides/push
  why: Push notifications/webhooks for real-time sync

- url: https://developers.google.com/workspace/calendar/api/quickstart/js
  why: OAuth setup and token management patterns

- file: src/app/(dashboard)/calendario/page.tsx
  why: Current calendar UI patterns and integration points

- file: src/components/appointments/appointment-modal.tsx
  why: Appointment creation/editing flow to hook into

- file: src/server/actions/appointments.ts
  why: Existing appointment CRUD actions for sync integration

- file: src/server/db/schema.ts
  why: Database patterns and existing appointment table structure

- file: src/lib/auth.ts
  why: BetterAuth patterns and user session management
```

### Current Codebase Patterns

```typescript
// CRITICAL: BetterAuth patterns from src/lib/auth.ts
// - User ID is string type (varchar(36))
// - OAuth accounts stored in authAccounts table
// - Session management via betterAuth.api.getSession()

// CRITICAL: Appointment patterns from src/server/actions/appointments.ts  
// - Always call getCurrentUserAccountId() for security
// - Use BigInt for database IDs
// - Pattern: revalidatePath("/calendario") after changes
// - Error handling returns { success: boolean, error?: string }

// CRITICAL: Database patterns from src/server/db/schema.ts
// - appointments table has: appointmentId (bigint), userId (varchar), datetimeStart/End (timestamp)
// - Contact relationship via contactId (bigint)
// - Status field: "Scheduled" | "Completed" | "Cancelled"
// - Type field: "Visita" | "Reunión" | "Firma" | "Cierre" | "Viaje"
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Google Calendar API requires HTTPS for webhooks
// - Use ngrok for local development webhook testing
// - Production webhooks must be publicly accessible HTTPS URLs

// CRITICAL: OAuth token management
// - Refresh tokens on API calls when expired
// - Store tokens securely in database, never in localStorage
// - Handle token revocation gracefully

// CRITICAL: Webhook security
// - Verify X-Goog-Channel-Token and X-Goog-Signature headers
// - Use unique UUIDs for channel IDs
// - Channels expire after 7 days max, need renewal

// CRITICAL: Rate limiting
// - Google Calendar API: 1000 requests per 100 seconds per user
// - Implement exponential backoff on 429 responses
// - Batch operations when possible

// CRITICAL: Timezone handling
// - Always include timeZone in Google event start/end
// - Use user's timezone from database or default to 'Europe/Madrid'
// - Convert between local timestamps and Google Calendar format
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// New table: user_integrations (for OAuth tokens and sync metadata)
export const userIntegrations = singlestoreTable("user_integrations", {
  integrationId: bigint("integration_id", { mode: "bigint" }).primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  provider: varchar("provider", { length: 50 }).notNull(), // "google_calendar"
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiryDate: timestamp("expiry_date"),
  calendarId: varchar("calendar_id", { length: 255 }).default("primary"),
  syncToken: text("sync_token"), // For incremental sync
  channelId: varchar("channel_id", { length: 64 }), // Webhook channel
  resourceId: varchar("resource_id", { length: 255 }), // Webhook resource
  channelExpiration: timestamp("channel_expiration"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Extend appointments table
export const appointments = singlestoreTable("appointments", {
  // ... existing fields
  googleEventId: varchar("google_event_id", { length: 255 }), // Google Calendar event ID
  googleEtag: varchar("google_etag", { length: 255 }), // For conflict resolution
  lastSyncedAt: timestamp("last_synced_at"), // Track sync status
});

// Types for Google Calendar integration
interface GoogleEvent {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  reminders?: { useDefault: boolean; overrides: Array<{ method: string; minutes: number }> };
}

interface CalendarIntegration {
  id: string;
  provider: "google_calendar";
  connected: boolean;
  calendarId: string;
  lastSync: Date | null;
}
```

### List of Tasks (Implementation Order)

```yaml
Task 1: Create Database Schema Extensions
MODIFY src/server/db/schema.ts:
  - ADD userIntegrations table with OAuth token storage
  - ADD googleEventId, googleEtag, lastSyncedAt to appointments table
  - RUN pnpm db:push to apply schema changes

Task 2: Create Google Calendar API Service
CREATE src/lib/google-calendar.ts:
  - IMPLEMENT OAuth 2.0 token management (get, refresh, validate)
  - IMPLEMENT Google Calendar Events API client
  - IMPLEMENT event transformation functions (Vesta ↔ Google)
  - PATTERN: Use existing error handling from appointments.ts
  - INCLUDE proper TypeScript types for all functions

Task 3: Create OAuth Routes
CREATE src/app/api/google/calendar/connect/route.ts:
  - IMPLEMENT OAuth consent URL generation with state parameter
  - PATTERN: Use getCurrentUserAccountId() for security
  - REDIRECT to Google with proper scopes and callback URL

CREATE src/app/api/google/calendar/callback/route.ts:
  - IMPLEMENT OAuth code exchange for tokens
  - STORE tokens in userIntegrations table
  - START initial sync and webhook channel
  - REDIRECT back to /calendario with success message

CREATE src/app/api/google/calendar/disconnect/route.ts:
  - STOP webhook channel if active
  - SOFT DELETE integration (set isActive = false)
  - PRESERVE local appointments (remove googleEventId only)
  - PATTERN: Return { success: boolean, message: string }

Task 4: Create Webhook Handler
CREATE src/app/api/google/calendar/webhook/route.ts:
  - VERIFY X-Goog-Channel-Token and X-Goog-Signature headers
  - EXTRACT user from X-Goog-Resource-URI 
  - TRIGGER incremental sync using stored syncToken
  - RETURN 200 OK quickly (process async)
  - HANDLE sync_token invalidation gracefully

Task 5: Extend Appointment Actions for Sync
MODIFY src/server/actions/appointments.ts:
  - INJECT Google Calendar sync into createAppointmentAction
  - INJECT Google Calendar sync into updateAppointmentAction  
  - INJECT Google Calendar sync into delete operations
  - PRESERVE existing error handling patterns
  - ADD sync status to return values

Task 6: Create Sync Service
CREATE src/lib/google-calendar-sync.ts:
  - IMPLEMENT syncToGoogle(appointment) for local → Google
  - IMPLEMENT syncFromGoogle(userId) for Google → local  
  - IMPLEMENT bidirectional conflict resolution using etags
  - IMPLEMENT incremental sync with syncToken
  - HANDLE deletions, updates, and creations

Task 7: Add UI Integration Points
MODIFY src/app/(dashboard)/calendario/page.tsx:
  - REPLACE mock "Integrado" status with real integration check
  - ADD connect/disconnect buttons in integrations dropdown
  - ADD manual "Sync Now" option for debugging
  - SHOW sync status and last sync time
  - PATTERN: Follow existing dropdown structure

Task 8: Create Integration Management Hook
CREATE src/hooks/use-google-calendar-integration.ts:
  - IMPLEMENT useGoogleCalendarIntegration() hook
  - PROVIDE connection status, connect/disconnect functions
  - HANDLE loading states and error messages
  - PATTERN: Follow existing useWeeklyAppointments patterns

Task 9: Background Job for Channel Renewal
CREATE src/lib/cron/renew-calendar-channels.ts:
  - CHECK channelExpiration daily
  - RENEW channels before expiration (48h before)
  - STOP old channels and create new ones
  - UPDATE userIntegrations with new channel details
  - LOG renewal status for monitoring

Task 10: Error Handling and User Feedback
MODIFY src/components/appointments/appointment-modal.tsx:
  - ADD sync status indicator for appointments
  - SHOW Google Calendar sync errors if they occur
  - PRESERVE existing modal patterns and styling

Task 11: Testing and Validation
CREATE __tests__/google-calendar-integration.test.ts:
  - TEST OAuth flow end-to-end
  - TEST bidirectional sync scenarios
  - TEST error handling and edge cases
  - TEST webhook processing
  - MOCK Google Calendar API responses
```

### Integration Points

```yaml
DATABASE:
  - migration: "Add userIntegrations table and extend appointments"
  - index: "CREATE INDEX idx_user_integrations_lookup ON user_integrations(userId, provider)"
  - index: "CREATE INDEX idx_appointments_google_sync ON appointments(googleEventId)"

CONFIG:
  - add to: .env.local
  - pattern: |
    GOOGLE_CLIENT_ID=your_oauth_client_id
    GOOGLE_CLIENT_SECRET=your_oauth_client_secret  
    GOOGLE_CALENDAR_WEBHOOK_SECRET=random_webhook_secret
    GOOGLE_CALENDAR_WEBHOOK_URL=https://yourdomain.com/api/google/calendar/webhook

ROUTES:
  - add: /api/google/calendar/connect (OAuth initiation)
  - add: /api/google/calendar/callback (OAuth completion)
  - add: /api/google/calendar/disconnect (Remove integration)
  - add: /api/google/calendar/webhook (Push notifications)
  - add: /api/google/calendar/sync (Manual sync trigger)
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm typecheck                      # Type checking
pnpm lint                          # ESLint checks
pnpm format:write                  # Prettier formatting

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests

```typescript
// CREATE __tests__/google-calendar-integration.test.ts
describe('Google Calendar Integration', () => {
  it('should connect Google Calendar successfully', async () => {
    const mockUser = createMockUser();
    const result = await connectGoogleCalendar(mockUser.id, mockTokens);
    expect(result.success).toBe(true);
    expect(result.integration).toHaveProperty('calendarId', 'primary');
  });

  it('should sync appointment to Google Calendar', async () => {
    const appointment = createMockAppointment();
    const result = await syncAppointmentToGoogle(appointment);
    expect(result.success).toBe(true);
    expect(result.googleEventId).toBeDefined();
  });

  it('should handle webhook notifications', async () => {
    const webhookPayload = createMockWebhook();
    const response = await POST(webhookPayload);
    expect(response.status).toBe(200);
  });

  it('should disconnect integration gracefully', async () => {
    const result = await disconnectGoogleCalendar(mockUser.id);
    expect(result.success).toBe(true);
    // Local appointments should remain
    const appointments = await getUserAppointments(mockUser.id);
    expect(appointments.length).toBeGreaterThan(0);
  });
});
```

```bash
# Run and iterate until passing:
pnpm test google-calendar-integration.test.ts
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test

```bash
# Test OAuth flow
curl -X GET http://localhost:3000/api/google/calendar/connect \
  -H "Cookie: better-auth.session_token=test_session"
# Expected: Redirect to Google OAuth consent screen

# Test webhook endpoint
curl -X POST http://localhost:3000/api/google/calendar/webhook \
  -H "Content-Type: application/json" \
  -H "X-Goog-Channel-Token: test_token" \
  -d '{"resourceState": "exists"}'
# Expected: 200 OK response

# Test manual sync
curl -X POST http://localhost:3000/api/google/calendar/sync \
  -H "Cookie: better-auth.session_token=test_session"
# Expected: {"success": true, "syncedEvents": 5}
```

### Level 4: UI and User Experience Validation

```bash
# Manual testing checklist:
echo "✓ Connect button works and redirects to Google OAuth"
echo "✓ After OAuth, user returns to calendar with success message"  
echo "✓ Integration status shows 'Connected' with last sync time"
echo "✓ Creating appointment in Vesta creates event in Google Calendar"
echo "✓ Creating event in Google Calendar creates appointment in Vesta"
echo "✓ Editing appointment in either place syncs to the other"
echo "✓ Deleting appointment in either place removes from both"
echo "✓ Disconnect button works and preserves local appointments"
echo "✓ Manual 'Sync Now' triggers immediate synchronization"
echo "✓ Error messages appear for sync failures"
```

## Final Validation Checklist

- [ ] All tests pass: `pnpm test`
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm typecheck`
- [ ] OAuth flow works end-to-end
- [ ] Bidirectional sync works in real-time
- [ ] Connect/disconnect functionality works
- [ ] Error cases handled gracefully
- [ ] Webhook processing works correctly
- [ ] UI shows proper integration status
- [ ] Database schema updated correctly

---

## Anti-Patterns to Avoid

- ❌ Don't store OAuth tokens in localStorage or client-side
- ❌ Don't create webhook channels without expiration handling
- ❌ Don't ignore Google Calendar API rate limits
- ❌ Don't sync on every keystroke - only after successful saves
- ❌ Don't fail appointment creation if Google sync fails
- ❌ Don't expose Google client secrets to the browser
- ❌ Don't trust webhook notifications without verification
- ❌ Don't create appointments without checking for duplicates

## Connect/Disconnect Requirements

### Connect Flow
1. User clicks "Connect Google Calendar" button in calendar UI
2. Redirect to OAuth consent with calendar.events scope
3. After consent, store tokens and start webhook channel
4. Perform initial sync of existing events (both directions)
5. Show success message and update UI status to "Connected"

### Disconnect Flow  
1. User clicks "Disconnect" button in integrations dropdown
2. Stop active webhook channel via Google API
3. Soft delete integration (set isActive = false)
4. Remove googleEventId from all local appointments (preserve local data)
5. Show confirmation and update UI status to "Not Connected"

### UI Status Indicators
- **Connected**: Green checkmark, show last sync time, "Disconnect" option
- **Not Connected**: Gray x-circle, "Connect Google Calendar" button  
- **Syncing**: Loading spinner, "Syncing..." text
- **Error**: Red warning icon, error message, "Retry" option

---

**Confidence Score: 9/10** - This PRP provides comprehensive context, follows existing codebase patterns, includes proper error handling, and covers all edge cases for successful one-pass implementation.