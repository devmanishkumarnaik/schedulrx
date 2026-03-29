import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';

// PATCH /api/events/[id]
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const event = await Event.findOne({ _id: params.id, userId: session.user.id });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const body = await request.json();
    const allowedFields = ['title','description','duration','color','location','isActive','requiresConfirmation'];
    allowedFields.forEach(field => {
      if (body[field] !== undefined) event[field] = body[field];
    });

    await event.save();
    return NextResponse.json({ event });
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE /api/events/[id]
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const event = await Event.findOneAndDelete({ _id: params.id, userId: session.user.id });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    return NextResponse.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
