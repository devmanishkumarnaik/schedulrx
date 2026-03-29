import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import CalendarConnection from '@/models/CalendarConnection';

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  await CalendarConnection.findOneAndDelete({
    userId:   session.user.id,
    provider: 'google',
  });

  return NextResponse.json({ message: 'Google Calendar disconnected' });
}
