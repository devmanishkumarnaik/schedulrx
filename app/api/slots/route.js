import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Event from '@/models/Event';
import Availability from '@/models/Availability';
import Booking from '@/models/Booking';
import { generateTimeSlots, DAY_NAMES } from '@/lib/utils';
import { addDays, startOfDay, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

/**
 * GET /api/slots?username=john&eventSlug=30min&date=2024-01-15&timezone=America/New_York
 * Returns available time slots for a given day
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username  = searchParams.get('username');
    const eventSlug = searchParams.get('eventSlug');
    const dateStr   = searchParams.get('date');
    const guestTz   = searchParams.get('timezone') || 'UTC';

    if (!username || !eventSlug || !dateStr) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await connectDB();

    // Find host user
    const user = await User.findOne({ username });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Find event type
    const event = await Event.findOne({ userId: user._id, slug: eventSlug, isActive: true });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    // Get host availability
    const availability = await Availability.findOne({ userId: user._id });
    if (!availability) return NextResponse.json({ slots: [] });

    // Parse the requested date
    const requestedDate = parseISO(dateStr);
    const hostTz        = availability.timezone || 'UTC';

    // Get day of week in host's timezone
    const dateInHostTz = toZonedTime(requestedDate, hostTz);
    const dayIndex     = dateInHostTz.getDay(); // 0=Sunday
    const dayName      = DAY_NAMES[dayIndex];
    const daySchedule  = availability.schedule[dayName];

    if (!daySchedule?.enabled) {
      return NextResponse.json({ slots: [] });
    }

    // Check minimum notice
    const now = new Date();
    const minimumNoticeMs = (availability.minimumNotice || 60) * 60 * 1000;

    // Get existing bookings for this date
    const dayStart = startOfDay(requestedDate);
    const dayEnd   = addDays(dayStart, 1);

    const existingBookings = await Booking.find({
      hostId:    user._id,
      startTime: { $gte: dayStart, $lt: dayEnd },
      status:    { $nin: ['cancelled'] },
    }).select('startTime endTime');

    // Generate slots
    const slots = generateTimeSlots(
      requestedDate,
      daySchedule,
      event.duration,
      existingBookings,
      hostTz
    );

    return NextResponse.json({
      slots,
      eventTitle:   event.title,
      duration:     event.duration,
      hostTimezone: hostTz,
      guestTimezone: guestTz,
    });
  } catch (error) {
    console.error('Get slots error:', error);
    return NextResponse.json({ error: 'Failed to get available slots' }, { status: 500 });
  }
}
