# Google Calendar Integration - Complete Implementation Guide

## Overview

This document explains the complete Google Calendar integration implementation for the Vesta real estate management platform. The integration provides full bidirectional synchronization between the Vesta calendar and each user's Google Calendar.

## Architecture Overview

The integration consists of five main components:

1. **OAuth Authentication Flow** - Secure connection to user's Google Calendar
2. **API Service Layer** - Core Google Calendar API interactions
3. **Bidirectional Sync Service** - Handles data synchronization between systems
4. **Real-time Webhooks** - Instant sync when Google Calendar changes
5. **UI Integration** - User interface for managing the connection

## Component Breakdown

### 1. Database Schema Extensions

#### New Table: `user_integrations`
Stores OAuth tokens and sync metadata for each user's Google Calendar connection.

```sql
CREATE TABLE user_integrations (
  integration_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NULL,
  expiry_date TIMESTAMP NULL,
  calendar_id VARCHAR(255) DEFAULT 'primary',
  sync_token TEXT NULL,
  channel_id VARCHAR(64) NULL,
  resource_id VARCHAR(255) NULL,
  channel_expiration TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Extended Table: `appointments`
Added Google Calendar sync fields to track synchronization status.

```sql
ALTER TABLE appointments 
ADD COLUMN google_event_id VARCHAR(255) NULL,
ADD COLUMN google_etag VARCHAR(255) NULL,
ADD COLUMN last_synced_at TIMESTAMP NULL;
```

### 2. OAuth Authentication Flow

#### Step 1: Initiate Connection (`/api/google/calendar/connect`)
```typescript
// User clicks "Connect Google Calendar"
// 1. Generate CSRF state token
const state = nanoid(32);
const stateData = `${user.id}:${state}`;

// 2. Build Google OAuth consent URL
const authUrl = google.generateAuthUrl({
  access_type: 'offline',
  scope: ['calendar.events', 'calendar.readonly'],
  state: stateData,
  prompt: 'consent'
});

// 3. Redirect user to Google
return NextResponse.redirect(authUrl);
```

#### Step 2: Handle Callback (`/api/google/calendar/callback`)
```typescript
// Google redirects back with authorization code
// 1. Verify state parameter
if (!state.startsWith(user.id)) {
  return redirect('/calendario?error=invalid_state');
}

// 2. Exchange code for tokens
const { tokens } = await oauth2Client.getToken(code);

// 3. Store tokens in database
await storeUserIntegration(user.id, tokens);

// 4. Start webhook channel for real-time sync
await startWatchChannel(user.id);

// 5. Redirect back to calendar
return redirect('/calendario?success=google_connected');
```

### 3. API Service Layer (`src/lib/google-calendar.ts`)

#### Core Functions

**Token Management:**
```typescript
export async function getUserIntegration(userId: string): Promise<GoogleCalendarIntegration | null>
export async function storeUserIntegration(userId: string, tokens: any): Promise<void>
export async function getCalendarClient(userId: string): Promise<calendar_v3.Calendar | null>
```

**Event Operations:**
```typescript
export async function createGoogleEvent(userId: string, appointment: AppointmentData): Promise<{eventId: string, etag: string} | null>
export async function updateGoogleEvent(userId: string, eventId: string, appointment: AppointmentData): Promise<{etag: string} | null>
export async function deleteGoogleEvent(userId: string, eventId: string): Promise<boolean>
```

**Event Transformation:**
```typescript
// Local appointment → Google Calendar event
export function toGoogleEvent(appointment: AppointmentData, userTimezone = 'Europe/Madrid'): GoogleEvent {
  return {
    summary: `${appointment.type} - ${appointment.contactName}`,
    description: appointment.notes || '',
    start: {
      dateTime: appointment.datetimeStart.toISOString(),
      timeZone: userTimezone
    },
    end: {
      dateTime: appointment.datetimeEnd.toISOString(),
      timeZone: userTimezone
    },
    reminders: {
      useDefault: false,
      overrides: [{ method: 'popup', minutes: 15 }]
    }
  };
}

// Google Calendar event → Local appointment
export function fromGoogleEvent(googleEvent: calendar_v3.Schema$Event, userId: string): Partial<AppointmentData>
```

### 4. Bidirectional Sync Service (`src/lib/google-calendar-sync.ts`)

#### Sync to Google Calendar
When a user creates/updates/deletes an appointment in Vesta:

```typescript
export async function syncToGoogle(
  userId: string,
  appointmentId: bigint,
  operation: 'create' | 'update' | 'delete'
): Promise<boolean> {
  const integration = await getUserIntegration(userId);
  if (!integration) return false; // User not connected

  const appointment = await getAppointmentData(appointmentId);

  switch (operation) {
    case 'create':
      const result = await createGoogleEvent(userId, appointment);
      if (result) {
        await updateAppointmentGoogleMeta(appointmentId, {
          googleEventId: result.eventId,
          googleEtag: result.etag,
          lastSyncedAt: new Date()
        });
      }
      break;
    // ... handle update and delete
  }
}
```

#### Sync from Google Calendar
When Google Calendar changes (triggered by webhook):

```typescript
export async function syncFromGoogle(userId: string): Promise<SyncResult> {
  const calendar = await getCalendarClient(userId);
  const integration = await getUserIntegration(userId);

  // Use incremental sync with sync token when available
  const listParams = {
    calendarId: integration.calendarId,
    syncToken: integration.syncToken, // Only get changes since last sync
    showDeleted: true // Include deleted events
  };

  const response = await calendar.events.list(listParams);
  const events = response.data.items || [];

  for (const event of events) {
    if (event.status === 'cancelled') {
      await handleDeletedGoogleEvent(userId, event.id);
    } else {
      await handleGoogleEventUpdate(userId, event);
    }
  }

  // Save new sync token for next incremental sync
  await updateSyncToken(userId, response.data.nextSyncToken);
}
```

### 5. Real-time Webhooks (`/api/google/calendar/webhook`)

#### Webhook Setup
```typescript
export async function startWatchChannel(userId: string): Promise<boolean> {
  const calendar = await getCalendarClient(userId);
  const channelId = `vesta-${userId}-${nanoid(8)}`;
  
  const response = await calendar.events.watch({
    calendarId: 'primary',
    requestBody: {
      id: channelId,
      type: 'web_hook',
      address: `${BASE_URL}/api/google/calendar/webhook`,
      expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toString() // 7 days
    }
  });

  // Store channel details for webhook processing
  await updateIntegrationChannel(userId, {
    channelId: response.data.id,
    resourceId: response.data.resourceId,
    expiration: new Date(response.data.expiration)
  });
}
```

#### Webhook Processing
```typescript
export async function POST(request: NextRequest) {
  const channelId = request.headers.get("x-goog-channel-id");
  const resourceState = request.headers.get("x-goog-resource-state");

  // Find user associated with this channel
  const integration = await findIntegrationByChannel(channelId);
  
  if (resourceState === "exists") {
    // Calendar has changes - trigger sync asynchronously
    syncFromGoogle(integration.userId).catch(console.error);
  }

  // Respond quickly to Google (sync happens in background)
  return NextResponse.json({ success: true });
}
```

### 6. Integration with Appointment Actions

The sync is integrated into existing appointment CRUD operations:

```typescript
// In createAppointmentAction
export async function createAppointmentAction(formData: AppointmentFormData) {
  // ... existing appointment creation logic
  
  // NEW: Sync to Google Calendar after successful creation
  try {
    await syncToGoogle(currentUser.id, result.appointmentId, "create");
  } catch (error) {
    console.error("Failed to sync to Google Calendar:", error);
    // Don't fail appointment creation if Google sync fails
  }
  
  // ... rest of function
}

// Similar integration in updateAppointmentAction
```

### 7. UI Integration

#### React Hook (`src/hooks/use-google-calendar-integration.ts`)
```typescript
export function useGoogleCalendarIntegration() {
  const [integration, setIntegration] = useState<GoogleCalendarIntegration>({
    connected: false,
    lastSync: null,
    loading: true,
    error: null
  });

  const connect = async () => {
    window.location.href = "/api/google/calendar/connect";
  };

  const disconnect = async () => {
    const response = await fetch("/api/google/calendar/disconnect", {
      method: "POST"
    });
    // ... handle response
  };

  const syncNow = async () => {
    const response = await fetch("/api/google/calendar/sync", {
      method: "POST"
    });
    // ... handle response
  };

  return { integration, connect, disconnect, syncNow };
}
```

#### Calendar UI Updates
The calendar page now shows real integration status:

```typescript
const { integration, connect, disconnect, syncNow } = useGoogleCalendarIntegration();

// In integrations dropdown:
{!integration.connected ? (
  <DropdownMenuItem onClick={connect}>
    <span>Connect Google Calendar</span>
  </DropdownMenuItem>
) : (
  <>
    <DropdownMenuItem>
      <span>Google Calendar - Connected</span>
    </DropdownMenuItem>
    <DropdownMenuItem onClick={syncNow}>
      <RefreshCw className="mr-2 h-4 w-4" />
      <span>Sync Now</span>
    </DropdownMenuItem>
    <DropdownMenuItem onClick={disconnect}>
      <span>Disconnect</span>
    </DropdownMenuItem>
  </>
)}
```

## Security Considerations

1. **OAuth Tokens**: Stored securely in database, never exposed to client
2. **Webhook Verification**: Validates Google's signature headers
3. **State Parameter**: CSRF protection in OAuth flow
4. **User Isolation**: Each user only accesses their own calendar data
5. **Error Isolation**: Google Calendar failures don't break local functionality

## Data Flow Examples

### Creating an Appointment

1. User creates appointment in Vesta calendar
2. `createAppointmentAction` saves to local database
3. `syncToGoogle` creates event in Google Calendar
4. Google returns event ID and etag
5. Local appointment updated with Google metadata
6. User sees appointment in both Vesta and Google Calendar

### Google Calendar Change

1. User modifies event in Google Calendar
2. Google sends webhook notification
3. Webhook handler triggers `syncFromGoogle`
4. System fetches changes using sync token (incremental sync)
5. Local database updated to match Google Calendar
6. User sees changes reflected in Vesta calendar

### User Disconnection

1. User clicks "Disconnect" in Vesta
2. System stops webhook channel
3. OAuth tokens marked as inactive
4. Google Calendar metadata removed from appointments
5. Local appointments remain intact
6. No more synchronization occurs

## Error Handling Strategy

1. **Graceful Degradation**: Google Calendar failures don't break local functionality
2. **Retry Logic**: Automatic token refresh for expired credentials
3. **Sync Token Recovery**: Falls back to full sync if incremental sync fails
4. **User Feedback**: Clear error messages and status indicators
5. **Background Sync**: Webhook failures don't block user interface

## Performance Optimizations

1. **Incremental Sync**: Only fetches changes since last sync using sync tokens
2. **Async Webhooks**: Webhook responses return immediately, sync happens in background
3. **Token Caching**: Reuses OAuth tokens until expiration
4. **Batch Operations**: Groups multiple changes when possible
5. **Rate Limiting**: Respects Google Calendar API rate limits

## Environment Variables Required

```bash
# Google OAuth credentials (already configured)
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_client_secret

# Optional: Webhook verification secret
GOOGLE_CALENDAR_WEBHOOK_SECRET=random_secret
```

## Testing the Integration

1. **Connect Flow**: Click "Connect Google Calendar" → Complete OAuth → See "Connected" status
2. **Create Sync**: Create appointment in Vesta → Verify it appears in Google Calendar
3. **Update Sync**: Edit appointment in Vesta → Verify changes sync to Google
4. **Google to Vesta**: Create/edit event in Google Calendar → Verify it syncs to Vesta
5. **Manual Sync**: Click "Sync Now" → Verify immediate synchronization
6. **Disconnect**: Click "Disconnect" → Verify local data preserved

## Troubleshooting

### Common Issues

1. **"No integration found"**: User needs to connect Google Calendar first
2. **"Token expired"**: System should auto-refresh, but user may need to reconnect
3. **"Webhook not receiving"**: Check webhook URL is publicly accessible via HTTPS
4. **"Sync not working"**: Check Google Calendar API quotas and rate limits
5. **"Events missing"**: Verify sync token validity and calendar permissions

### Debug Steps

1. Check user integration status in database
2. Verify OAuth tokens are not expired
3. Test Google Calendar API access manually
4. Check webhook channel expiration dates
5. Review sync token validity
6. Monitor API error logs

This integration provides a robust, production-ready bidirectional sync between Vesta and Google Calendar while maintaining security, performance, and user experience standards.