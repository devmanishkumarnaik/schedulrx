# SchedulrX — Smart Scheduling Platform

A full-stack Calendly-style scheduling platform. All 5 key features implemented.

## 🚀 Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local — fill in MONGODB_URI + NEXTAUTH_SECRET
npm run dev
# → http://localhost:3000
```

---

## ✅ Key Features

### 1. User Registration & Authentication
- Register with name, email, username, password + **confirm password** + **eye toggle**
- **Password strength meter** (Weak / Fair / Good / Strong)
- Real-time password match validation
- JWT-based sessions (30-day expiry), bcrypt password hashing
- Auto sign-in after registration

### 2. Calendar Integration (Google Calendar + Outlook)
- Full **OAuth 2.0 flow** — no SDKs, direct REST API calls
- **Auto-sync** every confirmed booking to Google Calendar / Outlook
- Auto **delete** calendar event when booking is cancelled
- Guest added as **attendee** (receives calendar invite)
- **"Add to Calendar"** links (Google + Outlook) on confirmation screen for guests
- Token auto-refresh — stays connected without re-authorizing

**If you get "Error 403: access_denied" from Google:**
> Your app is in Testing mode. Go to:
> Google Cloud Console → APIs & Services → OAuth consent screen → **Test users** → Add your Gmail address → Save.
> Then try connecting again.

### 3. Appointment Scheduling
- Create multiple **event types** (15 min, 30 min, 1 hr, etc.) with custom color, location, description
- Set **weekly availability** per day with start/end times
- Buffer time before/after meetings, minimum notice, advance booking window
- Public booking page: `/username` (profile) + `/username/event-slug` (full booking flow)
- 3-step booking flow: Date → Time slot → Details → Confirmation

### 4. Time Zone Support
- **Searchable timezone dropdown** with 50+ IANA zones and UTC offset labels
- **Auto-detect** guest's local timezone via `Intl.DateTimeFormat`
- All slots shown in **guest's timezone**
- Host sets their own timezone for availability calculation
- Booking confirmation shows timezone explicitly

### 5. Intuitive User Interface
- Responsive mobile-first design
- Glassmorphism dark theme with amber accents
- Animated booking calendar with today indicator
- Real-time slot loading, search in bookings, expandable booking notes
- Toast notifications, error banners with step-by-step fix instructions

---

## ⚙️ Environment Variables

```env
# Required
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/schedulrx
NEXTAUTH_SECRET=your-random-32-char-hex
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google Calendar (optional — enables Google sync)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/google/callback

# Outlook Calendar (optional — enables Outlook sync)
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=http://localhost:3000/api/calendar/outlook/callback
```

Generate `NEXTAUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📅 Google Calendar Setup (3 minutes)

1. **[Google Cloud Console](https://console.cloud.google.com)** → Create/select project
2. **APIs & Services → Library** → Enable **"Google Calendar API"**
3. **APIs & Services → OAuth consent screen** → External → Fill app name → Save
4. **Test users section** → **+ ADD USERS** → Add your Gmail → Save *(critical step)*
5. **Credentials → Create → OAuth 2.0 Client ID** → Web application
6. Authorized redirect URI: `http://localhost:3000/api/calendar/google/callback`
7. Copy **Client ID** + **Client Secret** → add to `.env.local` → restart server

## 📅 Outlook Calendar Setup (3 minutes)

1. **[Azure Portal](https://portal.azure.com)** → Microsoft Entra ID → App registrations → New
2. Name: SchedulrX, Accounts: **Any Microsoft account**
3. Redirect URI (Web): `http://localhost:3000/api/calendar/outlook/callback`
4. **API permissions** → Add: `Calendars.ReadWrite`, `User.Read`, `offline_access`
5. **Certificates & secrets** → New client secret → Copy **Value** (shown once!)
6. Add **Client ID** (from Overview) + **Client Secret** → `.env.local` → restart

---

## 🚢 Deploy to Vercel

1. Push to GitHub → [Vercel](https://vercel.com) → Import project
2. Add all env vars in **Settings → Environment Variables**
3. Update redirect URIs in Google Cloud + Azure to your Vercel domain
4. Deploy ✅

---

## 🗂️ Project Structure

```
schedulrx/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/      # JWT auth
│   │   ├── calendar/
│   │   │   ├── google/connect/      # Redirect to Google OAuth
│   │   │   ├── google/callback/     # Handle Google token exchange
│   │   │   ├── outlook/connect/     # Redirect to Microsoft OAuth
│   │   │   ├── outlook/callback/    # Handle Outlook token exchange
│   │   │   ├── status/              # Which calendars are connected
│   │   │   └── disconnect/          # Revoke calendar connection
│   │   ├── bookings/                # CRUD + auto-calendar-sync
│   │   ├── events/ & events/[id]/   # Event type CRUD
│   │   ├── availability/            # Weekly schedule
│   │   ├── slots/                   # Available time slot generation
│   │   └── users/                   # Registration + profile
│   ├── dashboard/
│   │   ├── calendar/                # Calendar integration UI
│   │   ├── events/                  # Manage event types
│   │   ├── availability/            # Set working hours
│   │   ├── bookings/                # View & manage bookings
│   │   └── settings/                # Profile + timezone
│   ├── [username]/                  # Public booking profile
│   │   └── [eventSlug]/             # Full 3-step booking flow
│   ├── login/ & register/
│   └── page.js                      # Landing page
├── components/
│   ├── BookingFlow.js               # Calendar + time + form + Add to Calendar
│   ├── TimezoneSelect.js            # Searchable 50+ timezone dropdown
│   ├── DashboardSidebar.js
│   ├── EventModal.js
│   └── CopyButton.js
├── lib/
│   ├── googleCalendar.js            # Google Calendar REST helpers
│   ├── outlookCalendar.js           # Microsoft Graph REST helpers
│   ├── mongodb.js
│   └── utils.js
└── models/
    ├── User.js
    ├── Event.js
    ├── Availability.js
    ├── Booking.js                   # +calendarEventIds
    └── CalendarConnection.js        # OAuth tokens per provider
```
