import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import Booking from '@/models/Booking';
import User from '@/models/User';
import CalendarConnection from '@/models/CalendarConnection';
import Link from 'next/link';
import { formatInTimeZone } from 'date-fns-tz';
import CopyButton from '@/components/CopyButton';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  await connectDB();

  const [user, events, upcomingBookings, calConn] = await Promise.all([
    User.findById(session.user.id),
    Event.find({ userId: session.user.id, isActive: true }).limit(3),
    Booking.find({ hostId: session.user.id, startTime: { $gte: new Date() }, status: { $ne: 'cancelled' } })
      .populate('eventId', 'title color duration').sort({ startTime: 1 }).limit(5),
    CalendarConnection.findOne({ userId: session.user.id, provider: 'google', isActive: true })
      .select('providerEmail'),
  ]);

  const totalBookings  = await Booking.countDocuments({ hostId: session.user.id });
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthBookings  = await Booking.countDocuments({ hostId: session.user.id, createdAt: { $gte: thisMonthStart } });

  const userTz     = user?.timezone || 'UTC';
  const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${session.user.username}`;
  const h          = new Date().getHours();
  const greeting   = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="animate-in">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
          Good {greeting}, {session.user.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-navy-300 mt-1 text-sm">Here's your schedule at a glance.</p>
      </div>

      {/* Connect Google Calendar banner */}
      {!calConn && (
        <div className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in stagger-1"
          style={{ borderColor:'rgba(245,158,11,0.25)', background:'rgba(245,158,11,0.05)' }}>
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">📅</span>
            <div>
              <p className="text-white text-sm font-semibold">Connect Google Calendar</p>
              <p className="text-navy-400 text-xs mt-0.5">Sync bookings automatically — events appear instantly when booked.</p>
            </div>
          </div>
          <Link href="/dashboard/calendar" className="btn-accent text-xs py-2 px-4 shrink-0 w-full sm:w-auto justify-center">
            Connect Now
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in stagger-1">
        {[
          { label:'Active Events',  value:events.length,          icon:'🗓️' },
          { label:'Upcoming',       value:upcomingBookings.length, icon:'⏰' },
          { label:'This Month',     value:monthBookings,           icon:'📈' },
          { label:'Total Bookings', value:totalBookings,           icon:'✅' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 sm:p-5">
            <div className="text-xl sm:text-2xl mb-1.5">{stat.icon}</div>
            <div className="font-display font-bold text-xl sm:text-2xl text-white">{stat.value}</div>
            <div className="text-navy-400 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Google Calendar connected badge */}
      {calConn && (
        <div className="glass-card p-4 animate-in stagger-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
              <p className="text-green-400 text-sm font-semibold">Google Calendar connected</p>
              {calConn.providerEmail && <p className="text-navy-500 text-xs hidden sm:block">· {calConn.providerEmail}</p>}
            </div>
            <Link href="/dashboard/calendar" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">Manage →</Link>
          </div>
        </div>
      )}

      {/* Upcoming bookings */}
      <div className="glass-card p-4 sm:p-6 animate-in stagger-2">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-display font-semibold text-base sm:text-lg text-white">Upcoming Bookings</h2>
          <Link href="/dashboard/bookings" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">View all →</Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="text-center py-8 sm:py-10">
            <div className="text-3xl sm:text-4xl mb-3">📭</div>
            <p className="text-navy-300 text-sm">No upcoming bookings yet.</p>
            <p className="text-navy-500 text-xs mt-1">Share your booking link to get started.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcomingBookings.map(b => (
              <div key={b._id.toString()} className="glass-card-light p-3 sm:p-4 flex items-center gap-3">
                <div className="w-2 h-8 sm:h-10 rounded-full shrink-0" style={{ backgroundColor: b.eventId?.color || '#3b82f6' }}/>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{b.guestName}</p>
                  <p className="text-navy-400 text-xs truncate">{b.eventId?.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white text-xs font-medium">{formatInTimeZone(new Date(b.startTime), userTz, 'MMM d')}</p>
                  <p className="text-navy-400 text-xs">{formatInTimeZone(new Date(b.startTime), userTz, 'h:mm a')}</p>
                </div>
                {b.googleCalendarEventId && (
                  <span title="Synced to Google Calendar" className="text-xs shrink-0">🔵</span>
                )}
                <span className={`badge badge-${b.status} hidden sm:inline-flex`}>{b.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in stagger-3">
        <div className="glass-card p-4 sm:p-6">
          <h3 className="font-display font-semibold text-white mb-1 text-sm sm:text-base">Your Booking Page</h3>
          <p className="text-navy-400 text-xs sm:text-sm mb-3">Share this link so anyone can book time with you.</p>
          <div className="flex items-center gap-2">
            <div className="input-field flex-1 text-xs truncate py-2.5 text-navy-300" style={{ minHeight:44 }}>
              {bookingUrl}
            </div>
            <CopyButton text={bookingUrl} />
          </div>
        </div>

        <div className="glass-card p-4 sm:p-6">
          <h3 className="font-display font-semibold text-white mb-1 text-sm sm:text-base">Quick Actions</h3>
          <p className="text-navy-400 text-xs sm:text-sm mb-3">Set up and manage your scheduling.</p>
          <div className="flex flex-col gap-2">
            <Link href="/dashboard/events"   className="btn-primary text-xs py-2.5 w-full justify-center">+ Create Event Type</Link>
            <Link href="/dashboard/calendar" className="btn-secondary text-xs py-2.5 w-full justify-center">📅 Connect Google Calendar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
