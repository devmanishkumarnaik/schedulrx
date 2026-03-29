import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import { slugify } from '@/lib/utils';

// GET /api/events — Get all events for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const events = await Event.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST /api/events — Create a new event type
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, description, duration, color, location, requiresConfirmation } = body;

    if (!title || !duration) {
      return NextResponse.json({ error: 'Title and duration are required' }, { status: 400 });
    }

    await connectDB();

    // Generate unique slug for this user
    let slug = slugify(title);
    let suffix = 0;
    while (await Event.exists({ userId: session.user.id, slug: suffix ? `${slug}-${suffix}` : slug })) {
      suffix++;
    }
    if (suffix) slug = `${slug}-${suffix}`;

    const event = await Event.create({
      userId: session.user.id,
      title,
      description: description || '',
      duration:    Number(duration),
      color:       color || '#3b82f6',
      location:    location || 'Video Call',
      slug,
      requiresConfirmation: requiresConfirmation || false,
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: Object.values(error.errors)[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
