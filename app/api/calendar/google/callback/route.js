import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CalendarConnection from '@/models/CalendarConnection';
import { exchangeGoogleCode, getGoogleUserInfo } from '@/lib/googleCalendar';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code      = searchParams.get('code');
  const state     = searchParams.get('state');
  const error     = searchParams.get('error');
  const errorDesc = searchParams.get('error_description') || '';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Google returns error=access_denied when:
  // 1. App is in Testing mode & user is not added as a Test User
  // 2. User clicked "Cancel" on the consent screen
  if (error === 'access_denied') {
    return NextResponse.redirect(
      `${appUrl}/dashboard/calendar?error=google_access_denied`
    );
  }

  if (error) {
    const msg = encodeURIComponent(errorDesc || error);
    return NextResponse.redirect(
      `${appUrl}/dashboard/calendar?error=google_other&msg=${msg}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${appUrl}/dashboard/calendar?error=invalid_callback`
    );
  }

  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString());
    const userId  = decoded?.userId;
    if (!userId) throw new Error('Invalid state — missing userId');

    const tokens   = await exchangeGoogleCode(code);
    const userInfo = await getGoogleUserInfo(tokens.access_token);

    await connectDB();

    await CalendarConnection.findOneAndUpdate(
      { userId, provider: 'google' },
      {
        userId,
        provider:      'google',
        accessToken:   tokens.access_token,
        refreshToken:  tokens.refresh_token || '',
        tokenExpiry:   tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
        providerEmail: userInfo.email || '',
        providerName:  userInfo.name  || '',
        isActive:      true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.redirect(`${appUrl}/dashboard/calendar?success=google`);
  } catch (err) {
    console.error('[Google OAuth callback]', err.message);
    const msg = encodeURIComponent(err.message || 'Unknown error');
    return NextResponse.redirect(
      `${appUrl}/dashboard/calendar?error=google_failed&msg=${msg}`
    );
  }
}
