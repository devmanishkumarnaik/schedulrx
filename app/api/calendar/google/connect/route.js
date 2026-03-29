import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { getGoogleAuthUrl } from '@/lib/googleCalendar';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
    return NextResponse.json(
      { error: 'Google Calendar integration is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables.' },
      { status: 503 }
    );
  }

  // Encode user ID in state so we know who to link the token to after callback
  const state   = Buffer.from(JSON.stringify({ userId: session.user.id, ts: Date.now() })).toString('base64url');
  const authUrl = getGoogleAuthUrl(state);

  return NextResponse.redirect(authUrl);
}
