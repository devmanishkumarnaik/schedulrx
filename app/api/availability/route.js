import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Availability from '@/models/Availability';

// GET /api/availability
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    let availability = await Availability.findOne({ userId: session.user.id });

    if (!availability) {
      // Create default availability if it doesn't exist
      availability = await Availability.create({ userId: session.user.id });
    }

    return NextResponse.json({ availability });
  } catch (error) {
    console.error('Get availability error:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

// PUT /api/availability — Update availability settings
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { schedule, timezone, bufferBefore, bufferAfter, minimumNotice, daysInAdvance } = body;

    await connectDB();
    const availability = await Availability.findOneAndUpdate(
      { userId: session.user.id },
      { schedule, timezone, bufferBefore, bufferAfter, minimumNotice, daysInAdvance },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ availability });
  } catch (error) {
    console.error('Update availability error:', error);
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}
