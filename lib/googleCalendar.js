/**
 * Google Calendar REST API helpers
 * Uses direct fetch — no googleapis SDK required.
 */

const GOOGLE_TOKEN_URL    = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_URL = 'https://www.googleapis.com/calendar/v3';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

/** Build the Google OAuth2 authorization URL */
export function getGoogleAuthUrl(state) {
  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID,
    redirect_uri:  process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '),
    access_type: 'offline',
    prompt:      'consent',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/** Exchange authorization code for tokens */
export async function exchangeGoogleCode(code) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri:  process.env.GOOGLE_REDIRECT_URI,
      grant_type:    'authorization_code',
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error_description || 'Failed to exchange Google code');
  }
  return res.json();
}

/** Refresh an expired Google access token */
export async function refreshGoogleToken(refreshToken) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type:    'refresh_token',
    }),
  });
  if (!res.ok) throw new Error('Failed to refresh Google token');
  return res.json();
}

/** Get Google user info (email, name) */
export async function getGoogleUserInfo(accessToken) {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch Google user info');
  return res.json();
}

/**
 * Get a valid access token — auto-refreshes if expired.
 * Mutates and saves the connection document.
 */
export async function getValidGoogleToken(connection) {
  const now = new Date();
  if (connection.tokenExpiry && connection.tokenExpiry > new Date(now.getTime() + 120_000)) {
    return connection.accessToken;
  }
  if (!connection.refreshToken) {
    throw new Error('No refresh token. Please reconnect Google Calendar.');
  }
  const tokens = await refreshGoogleToken(connection.refreshToken);
  connection.accessToken = tokens.access_token;
  connection.tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);
  await connection.save();
  return tokens.access_token;
}

/**
 * Create a Google Calendar event.
 * @returns {string} Google Calendar event ID
 */
export async function createGoogleCalendarEvent(accessToken, {
  title, description, location, startTime, endTime, guestName, guestEmail,
}) {
  const event = {
    summary:     title,
    description: description || '',
    location:    location || '',
    start: { dateTime: new Date(startTime).toISOString(), timeZone: 'UTC' },
    end:   { dateTime: new Date(endTime).toISOString(),   timeZone: 'UTC' },
    attendees: [{ email: guestEmail, displayName: guestName }],
    reminders: {
      useDefault: false,
      overrides:  [{ method: 'email', minutes: 60 }, { method: 'popup', minutes: 15 }],
    },
  };

  const res = await fetch(`${GOOGLE_CALENDAR_URL}/calendars/primary/events?sendUpdates=all`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(event),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to create Google Calendar event');
  }

  const data = await res.json();
  return data.id;
}

/** Delete a Google Calendar event */
export async function deleteGoogleCalendarEvent(accessToken, eventId) {
  const res = await fetch(
    `${GOOGLE_CALENDAR_URL}/calendars/primary/events/${eventId}?sendUpdates=all`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok && res.status !== 404) {
    throw new Error('Failed to delete Google Calendar event');
  }
}

/**
 * Build a Google Calendar "Add to Calendar" deep link for guests.
 */
export function buildGoogleCalendarLink({ title, description, location, startTime, endTime }) {
  const fmt = (d) => new Date(d).toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  const params = new URLSearchParams({
    action:   'TEMPLATE',
    text:     title,
    dates:    `${fmt(startTime)}/${fmt(endTime)}`,
    details:  description || '',
    location: location || '',
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
