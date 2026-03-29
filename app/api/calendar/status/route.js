import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import CalendarConnection from '@/models/CalendarConnection';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const conn = await CalendarConnection.findOne({
    userId:   session.user.id,
    provider: 'google',
    isActive: true,
  }).select('providerEmail providerName createdAt tokenExpiry refreshToken');

  return NextResponse.json({
    connected:  conn ? {
      email:          conn.providerEmail,
      name:           conn.providerName,
      connectedAt:    conn.createdAt,
      needsReconnect: conn.tokenExpiry && conn.tokenExpiry < new Date() && !conn.refreshToken,
    } : null,
    configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  });
}
