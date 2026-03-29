import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Event from '@/models/Event';
import Booking from '@/models/Booking';
import Availability from '@/models/Availability';
import CalendarConnection from '@/models/CalendarConnection';
import {
  getValidGoogleToken,
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
} from '@/lib/googleCalendar';
import { sendEmail, isSmtpConfigured } from '@/lib/mailer';
import {
  bookingConfirmedGuestEmail,
  bookingNotificationHostEmail,
  bookingPendingGuestEmail,
  bookingApprovedGuestEmail,
  bookingCancelledGuestEmail,
  bookingCancelledHostEmail,
} from '@/lib/emailTemplates';

// ─── Sync booking to Google Calendar ─────────────────────────────────────────
async function syncToGoogleCalendar(booking, host, eventType) {
  const conn = await CalendarConnection.findOne({ userId: host._id, provider: 'google', isActive: true });
  if (!conn) return;

  try {
    const token   = await getValidGoogleToken(conn);
    const eventId = await createGoogleCalendarEvent(token, {
      title:       `${eventType.title} with ${booking.guestName}`,
      description: `SchedulrX Booking\n\nGuest: ${booking.guestName} (${booking.guestEmail})${booking.guestNotes ? `\nNotes: ${booking.guestNotes}` : ''}\nRef: ${booking.uid}`,
      location:    eventType.location || '',
      startTime:   booking.startTime,
      endTime:     booking.endTime,
      guestName:   booking.guestName,
      guestEmail:  booking.guestEmail,
    });
    booking.googleCalendarEventId = eventId;
    await booking.save();
  } catch (err) {
    console.error('[Google Calendar sync]', err.message);
  }
}

// ─── Delete booking from Google Calendar ─────────────────────────────────────
async function deleteFromGoogleCalendar(booking, hostId) {
  if (!booking.googleCalendarEventId) return;
  const conn = await CalendarConnection.findOne({ userId: hostId, provider: 'google', isActive: true });
  if (!conn) return;

  try {
    const token = await getValidGoogleToken(conn);
    await deleteGoogleCalendarEvent(token, booking.googleCalendarEventId);
  } catch (err) {
    console.error('[Google Calendar delete]', err.message);
  }
}

// ─── GET /api/bookings ────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    await connectDB();

    const query = { hostId: session.user.id };
    const now   = new Date();
    if (status === 'upcoming')  { query.startTime = { $gte: now }; query.status = { $ne: 'cancelled' }; }
    if (status === 'past')      { query.startTime = { $lt: now };  query.status = { $ne: 'cancelled' }; }
    if (status === 'cancelled') { query.status = 'cancelled'; }

    const bookings = await Booking.find(query)
      .populate('eventId', 'title color duration location')
      .sort({ startTime: status === 'past' ? -1 : 1 })
      .limit(50);

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// ─── POST /api/bookings — Create (public) ─────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, eventSlug, startTime, endTime, guestName, guestEmail, guestNotes, timezone } = body;

    if (!username || !eventSlug || !startTime || !guestName || !guestEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const host = await User.findOne({ username });
    if (!host) return NextResponse.json({ error: 'Host not found' }, { status: 404 });

    const eventType = await Event.findOne({ userId: host._id, slug: eventSlug, isActive: true });
    if (!eventType) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const slotStart = new Date(startTime);
    const slotEnd   = new Date(endTime);

    // Conflict check
    const conflict = await Booking.findOne({
      hostId: host._id, status: { $nin: ['cancelled'] },
      startTime: { $lt: slotEnd }, endTime: { $gt: slotStart },
    });
    if (conflict) return NextResponse.json({ error: 'This time slot is no longer available' }, { status: 409 });

    // Minimum notice
    const availability = await Availability.findOne({ userId: host._id });
    if (availability) {
      const minNoticeMs = (availability.minimumNotice || 60) * 60 * 1000;
      if (slotStart - new Date() < minNoticeMs) {
        return NextResponse.json({ error: 'This slot is too soon to book' }, { status: 400 });
      }
    }

    const isPending = eventType.requiresConfirmation;

    const booking = await Booking.create({
      eventId:    eventType._id,
      hostId:     host._id,
      guestName,
      guestEmail,
      guestNotes: guestNotes || '',
      startTime:  slotStart,
      endTime:    slotEnd,
      timezone:   timezone || 'UTC',
      location:   eventType.location,
      status:     isPending ? 'pending' : 'confirmed',
    });

    // Auto-sync to Google Calendar
    if (!isPending) {
      await syncToGoogleCalendar(booking, host, eventType);
    }

    await booking.populate('eventId', 'title color duration location');

    // Send emails
    if (isSmtpConfigured()) {
      const ctx = { booking, event: eventType, host, guestTz: timezone || 'UTC' };
      if (isPending) {
        await sendEmail({ to: guestEmail, ...bookingPendingGuestEmail(ctx) });
      } else {
        await sendEmail({ to: guestEmail, ...bookingConfirmedGuestEmail(ctx) });
      }
      await sendEmail({ to: host.email, ...bookingNotificationHostEmail({ booking, event: eventType, host }) });
    }

    return NextResponse.json({
      booking,
      message:     'Booking created successfully',
      calendarSync: !!booking.googleCalendarEventId,
      emailSent:    isSmtpConfigured(),
    }, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

// ─── PATCH /api/bookings — Cancel or confirm ──────────────────────────────────
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { bookingId, status, cancellationReason } = await request.json();
    await connectDB();

    const booking = await Booking.findOne({ _id: bookingId, hostId: session.user.id });
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const prev             = booking.status;
    booking.status         = status;
    booking.cancellationReason = cancellationReason || '';
    await booking.save();

    const [eventType, host] = await Promise.all([
      Event.findById(booking.eventId),
      User.findById(session.user.id),
    ]);

    // Cancelled → delete from Google Calendar + emails
    if (status === 'cancelled' && prev !== 'cancelled') {
      await deleteFromGoogleCalendar(booking, session.user.id);

      if (isSmtpConfigured() && eventType && host) {
        const ctx = { booking, event: eventType, host, guestTz: booking.timezone, reason: cancellationReason };
        await Promise.all([
          sendEmail({ to: booking.guestEmail, ...bookingCancelledGuestEmail(ctx) }),
          sendEmail({ to: host.email,         ...bookingCancelledHostEmail(ctx) }),
        ]);
      }
    }

    // Pending → confirmed → add to Google Calendar + email guest
    if (status === 'confirmed' && prev === 'pending') {
      if (eventType && host) {
        await syncToGoogleCalendar(booking, host, eventType);

        if (isSmtpConfigured()) {
          await sendEmail({
            to: booking.guestEmail,
            ...bookingApprovedGuestEmail({ booking, event: eventType, host, guestTz: booking.timezone }),
          });
        }
      }
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
