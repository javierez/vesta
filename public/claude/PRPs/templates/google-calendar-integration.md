## FEATURE:

- Full two‑way sync between the app calendar (`/calendario`) and each user’s Google Calendar.
- Users can create, edit, and delete events in either place; changes appear on both sides automatically.
- OAuth sign‑in per user; store and refresh tokens securely; per‑user channel/webhook to receive change notifications.
- Initial target: sync a single calendar per user (Google `primary`) to reduce complexity.

## EXAMPLES:

### Where to hook in the existing app
- UI calendar page: `src/app/(dashboard)/calendario/page.tsx` (creation/edit flows via modal; weekly/list views).
- Appointment modal + form: `src/components/appointments/appointment-modal.tsx`, `src/components/appointments/appointment-form.tsx`.
- Server actions: `src/server/actions/appointments.ts` (create/update currently centralize validation and persistence; ideal place to also call Google APIs).
- Appointment queries: `src/server/queries/appointment.ts` (DB I/O; consider adding helpers for Google sync metadata).

### Minimal data model additions (proposed)
- Table: `appointments`
  - `googleEventId` (string | null)
  - `googleEtag` (string | null)
  - `lastSyncedAt` (timestamp | null)
- Table: `user_integrations`
  - `userId` (string, FK → users)
  - `provider` = "google_calendar"
  - `accessToken`, `refreshToken`, `expiryDate` (Date)
  - `calendarId` (string, default "primary")
  - `syncToken` (string | null) for incremental sync
  - `channelId` (string | null), `resourceId` (string | null), `channelExpiration` (Date | null) for push notifications

### User flow (simple terms)
- Connect: user clicks “Connect Google Calendar” → Google consent → app stores tokens → starts a watch channel → pulls initial events.
- Create/edit/delete in app: after DB save in `createAppointmentAction`/`updateAppointmentAction`/delete, call Google Events API to mirror the change; store `googleEventId`/`etag`.
- Change in Google: Google sends a webhook; app pulls changes with `events.list` + `syncToken`, updates local DB rows to match (create/update/soft‑delete).

### Pseudocode snippets
```ts
// After local create
if (userHasGoogle) {
  const event = toGoogleEvent(payload);
  const g = await google.events.insert(calendarId, event);
  await updateAppointmentGoogleMeta(id, { googleEventId: g.id, googleEtag: g.etag });
}

// After local update
if (userHasGoogle && googleEventId) {
  const event = toGoogleEvent(payload);
  await google.events.patch(calendarId, googleEventId, event, { ifMatch: googleEtag });
}

// After local delete
if (userHasGoogle && googleEventId) {
  await google.events.delete(calendarId, googleEventId);
}

// Webhook handler (push notifications)
// Verify headers; then do incremental sync
const { syncToken } = getUserIntegration(userId);
const resp = await google.events.list(calendarId, { syncToken });
for (const change of resp.items) {
  upsertLocalAppointmentFromGoogle(change);
}
saveSyncToken(resp.nextSyncToken);
```

## DOCUMENTATION:

### Google APIs to use
- Overview: `https://developers.google.com/workspace/calendar/api/guides/overview`
- Quickstart (JS/Browser): `https://developers.google.com/workspace/calendar/api/quickstart/js`
- REST reference: `https://developers.google.com/workspace/calendar/api/v3/reference`

### Scopes
- Recommended: `https://www.googleapis.com/auth/calendar.events`
- If reading calendar metadata: `https://www.googleapis.com/auth/calendar.readonly`

### OAuth setup
- ✅ **Already configured**: OAuth 2.0 Client ID with redirect URIs:
  - Production: `https://v0-vesta-eight.vercel.app/api/google/calendar/callback`
  - Local dev: `http://localhost:3000/api/google/calendar/callback`
- Store `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in server environment variables.
- Never expose secrets to the browser; all OAuth operations happen server-side.
- Persist `access_token`, `refresh_token`, and `expiryDate` in `user_integrations` table per user.

### OAuth flow implementation steps
1. **Connect button** → `GET /api/google/calendar/connect`
   - Generate `state` parameter (anti-CSRF token)
   - Build Google consent URL: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_URI}&response_type=code&scope=https://www.googleapis.com/auth/calendar.events&access_type=offline&prompt=consent&state=${state}`
   - Store `state` in session/DB temporarily
   - Redirect user to Google

2. **Google callback** → `GET /api/google/calendar/callback`
   - Verify `state` parameter matches stored value
   - Exchange `code` for tokens via `POST https://oauth2.googleapis.com/token`
   - Store tokens in `user_integrations` table
   - Start initial sync and watch channel
   - Redirect back to `/calendario` with success message

3. **Token refresh** (background)
   - Check `expiryDate` before API calls
   - If expired, use `refresh_token` to get new `access_token`
   - Update `user_integrations` with new tokens
   - Retry original API call

### Watch channels (push notifications)
- Use `events.watch` per user to track changes on their `primary` calendar.
- Provide a public HTTPS endpoint `/api/google/calendar/webhook` that validates `X-Goog-*` headers, then triggers incremental sync using stored `syncToken`.
- Channels expire; schedule renewal before `channelExpiration`.

### Watch channel implementation
1. **Start watching** (after OAuth success)
   ```ts
   const channel = await google.events.watch({
     calendarId: 'primary',
     requestBody: {
       id: `user-${userId}-${Date.now()}`,
       type: 'web_hook',
       address: `${BASE_URL}/api/google/calendar/webhook`,
       expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
     }
   });
   // Store channelId, resourceId, channelExpiration in user_integrations
   ```

2. **Webhook endpoint** `/api/google/calendar/webhook`
   - Verify `X-Goog-Signature` and `X-Goog-Channel-Token` headers
   - Extract `X-Goog-Resource-URI` to identify which user's calendar changed
   - Trigger incremental sync for that user using stored `syncToken`
   - Return `200 OK` quickly (sync happens asynchronously)

3. **Channel renewal** (background job)
   - Check `channelExpiration` daily
   - Before expiration, create new channel and stop old one
   - Update `user_integrations` with new channel details

### Event mapping
- Local → Google: map `startDate+startTime`, `endDate+endTime`, `notes`, `type` to Google `summary`, `description`, `start`, `end`.
- Timezone: always include `timeZone` on `start` and `end` (use user’s tz, fallback to server tz).
- Store returned `id` (as `googleEventId`) and `etag` for concurrency control.

## OTHER CONSIDERATIONS:

- Concurrency: use `etag` with `If-Match` on updates to avoid overwriting changes from Google.
- Incremental sync: prefer `syncToken` to avoid full scans; on token invalidation, fall back to `updatedMin` window, then re‑establish a new `syncToken`.
- Deletes: mirror Google deletions by soft‑deleting local appointments (`isActive=false`), and mirror local deletes to Google with `events.delete`.
- Permissions: if a user disconnects, stop the watch channel and clear tokens/Google IDs; keep local events intact.
- Rate limits: batch work and backoff on `429`/`5xx`; avoid syncing on every keystroke—sync after successful DB write.
- Multi‑user: associate appointments to `userId` (already present). Only sync events created/owned by that user’s calendar unless configured otherwise.

---

### Implementation checklist (app-specific)
- UI
  - Add “Connect/Disconnect Google Calendar” in `/calendario` (current Integrations menu shows Google as integrated; wire it to OAuth connect state).
  - Show a small badge when connected; provide manual “Sync now” action for debugging.
- Server
  - Add routes: `/api/google/calendar/connect`, `/api/google/calendar/callback`, `/api/google/calendar/webhook`, `/api/google/calendar/disconnect`, `/api/google/calendar/sync`.
  - Extend `createAppointmentAction`/`updateAppointmentAction`/delete path to call Google mirror ops when user is connected.
  - Add helpers to map `Appointment` ↔ Google Event and to manage tokens/watch channels.
- DB
  - Add fields to `appointments` and create `user_integrations` as described above in `src/server/db/schema.ts`.

### How it works (for dummies)
- Think of your app calendar and Google Calendar as two notebooks. When you write or erase in one, a messenger immediately copies that change to the other. The messenger is:
  - A secure connection to Google (OAuth) so we’re allowed to write/read.
  - A little bell (webhook) that rings when Google changes something, telling us to fetch just the changes (not everything).
  - A tag (`googleEventId`) on each event so we know which note in Google matches which note in our app.

---

### Event transformation functions
```ts
// Local appointment → Google Event
function toGoogleEvent(appointment: Appointment, userTimezone: string = 'Europe/Madrid') {
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
      overrides: [
        { method: 'popup', minutes: 15 }
      ]
    }
  };
}

// Google Event → Local appointment
function fromGoogleEvent(googleEvent: any, userId: string): Partial<Appointment> {
  return {
    userId,
    contactId: null, // Will need to be mapped or created
    datetimeStart: new Date(googleEvent.start.dateTime || googleEvent.start.date),
    datetimeEnd: new Date(googleEvent.end.dateTime || googleEvent.end.date),
    notes: googleEvent.description || '',
    type: extractTypeFromSummary(googleEvent.summary), // Parse "Visita - John Doe" → "Visita"
    status: 'Scheduled' as const,
    isActive: true
  };
}

// Helper to extract appointment type from Google event summary
function extractTypeFromSummary(summary: string): Appointment['type'] {
  const typeMap: Record<string, Appointment['type']> = {
    'Visita': 'Visita',
    'Reunión': 'Reunión', 
    'Firma': 'Firma',
    'Cierre': 'Cierre',
    'Viaje': 'Viaje'
  };
  
  for (const [key, value] of Object.entries(typeMap)) {
    if (summary.includes(key)) return value;
  }
  return 'Reunión'; // Default fallback
}
```

### Environment variables needed
```bash
# .env.local
GOOGLE_CLIENT_ID=your_oauth_client_id_here
GOOGLE_CLIENT_SECRET=your_oauth_client_secret_here
GOOGLE_CALENDAR_WEBHOOK_SECRET=random_secret_for_webhook_verification
```