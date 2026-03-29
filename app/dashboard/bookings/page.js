'use client';

import { useState, useEffect } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { useSession } from 'next-auth/react';
import { Clock, MapPin, Mail, X, CheckCircle, Calendar, ChevronDown, Search } from 'lucide-react';

const TABS = [
  { key: 'upcoming',  label: 'Upcoming',  emoji: '⏰' },
  { key: 'past',      label: 'Past',      emoji: '📂' },
  { key: 'cancelled', label: 'Cancelled', emoji: '🚫' },
];

export default function BookingsPage() {
  const { data: session } = useSession();
  const [tab, setTab]           = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    const res  = await fetch(`/api/bookings?status=${tab}`);
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [tab]);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking? The guest will lose their slot.')) return;
    await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: id, status: 'cancelled' }),
    });
    fetchBookings();
  };

  const handleConfirm = async (id) => {
    await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: id, status: 'confirmed' }),
    });
    fetchBookings();
  };

  const filtered = search
    ? bookings.filter(b =>
        b.guestName.toLowerCase().includes(search.toLowerCase()) ||
        b.guestEmail.toLowerCase().includes(search.toLowerCase()) ||
        b.eventId?.title?.toLowerCase().includes(search.toLowerCase())
      )
    : bookings;

  const counts = { upcoming: 0, past: 0, cancelled: 0 };
  if (tab === 'upcoming')  counts.upcoming  = bookings.length;
  if (tab === 'past')      counts.past      = bookings.length;
  if (tab === 'cancelled') counts.cancelled = bookings.length;

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      <div>
        <h1 className="font-display font-bold text-3xl text-white">Bookings</h1>
        <p className="text-navy-300 mt-1">Manage all your scheduled meetings.</p>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 glass-card p-1.5 w-fit rounded-xl">
          {TABS.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setSearch(''); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-navy-600/80 text-white shadow'
                  : 'text-navy-400 hover:text-white'
              }`}>
              <span>{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card h-28 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="text-5xl mb-4">{search ? '🔍' : tab === 'upcoming' ? '📭' : '📂'}</div>
          <p className="text-navy-300 text-sm">
            {search ? `No bookings match "${search}"` : `No ${tab} bookings.`}
          </p>
          {tab === 'upcoming' && !search && (
            <p className="text-navy-600 text-xs mt-2">
              Share your booking link to start receiving meetings.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking, i) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              tab={tab}
              onCancel={handleCancel}
              onConfirm={handleConfirm}
              i={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, tab, onCancel, onConfirm, i }) {
  const [expanded, setExpanded] = useState(false);
  const start = new Date(booking.startTime);
  const end   = new Date(booking.endTime);
  const tz    = booking.timezone || 'UTC';

  const calSynced = booking.googleCalendarEventId;

  return (
    <div
      className="glass-card overflow-hidden animate-in"
      style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}
    >
      {/* Main row */}
      <div className="p-5 flex flex-col sm:flex-row gap-4">
        {/* Colored left bar */}
        <div
          className="w-full sm:w-1 sm:h-auto h-1 rounded-full shrink-0"
          style={{ backgroundColor: booking.eventId?.color || '#3b82f6' }}
        />

        {/* Date block */}
        <div className="shrink-0 text-left sm:w-24">
          <p className="font-display font-black text-3xl text-white leading-none">
            {formatInTimeZone(start, tz, 'd')}
          </p>
          <p className="text-navy-400 text-xs uppercase tracking-widest mt-0.5">
            {formatInTimeZone(start, tz, 'MMM yyyy')}
          </p>
          <p className="text-white text-xs font-semibold mt-1">
            {formatInTimeZone(start, tz, 'h:mm a')}
          </p>
          <p className="text-navy-500 text-xs">
            → {formatInTimeZone(end, tz, 'h:mm a')}
          </p>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <p className="font-display font-bold text-white text-base">{booking.guestName}</p>
            <span className={`badge badge-${booking.status}`}>{booking.status}</span>
            {calSynced && (
              <span className="text-xs text-green-400 flex items-center gap-1"
                title="Synced to calendar">
                <Calendar size={11} /> Synced
              </span>
            )}
          </div>
          <p className="text-navy-400 text-sm mt-0.5">{booking.eventId?.title}</p>

          <div className="flex flex-wrap gap-3 mt-2 text-xs text-navy-500">
            <span className="flex items-center gap-1">
              <Mail size={11} /> {booking.guestEmail}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {booking.eventId?.duration} min
            </span>
            {booking.location && (
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {booking.location}
              </span>
            )}
            <span className="text-navy-700 font-mono">{booking.uid}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col gap-2 items-start shrink-0">
          {tab === 'upcoming' && (
            <>
              {booking.status === 'pending' && (
                <button onClick={() => onConfirm(booking._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', background: 'rgba(16,185,129,0.08)' }}>
                  <CheckCircle size={12} /> Confirm
                </button>
              )}
              <button onClick={() => onCancel(booking._id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', background: 'transparent' }}>
                <X size={12} /> Cancel
              </button>
            </>
          )}
          {(booking.guestNotes || booking.cancellationReason) && (
            <button onClick={() => setExpanded(v => !v)}
              className="text-navy-500 hover:text-navy-300 transition-colors text-xs flex items-center gap-1">
              <ChevronDown size={13} className={expanded ? 'rotate-180' : ''} />
              {expanded ? 'Less' : 'More'}
            </button>
          )}
        </div>
      </div>

      {/* Expandable notes */}
      {expanded && (
        <div className="px-5 pb-4 border-t border-navy-700/30 pt-4 space-y-2">
          {booking.guestNotes && (
            <div className="text-xs">
              <span className="text-navy-500 uppercase tracking-wide text-xs">Guest notes</span>
              <p className="text-navy-300 mt-1 italic">"{booking.guestNotes}"</p>
            </div>
          )}
          {booking.cancellationReason && (
            <div className="text-xs">
              <span className="text-navy-500 uppercase tracking-wide text-xs">Cancellation reason</span>
              <p className="text-red-400 mt-1">{booking.cancellationReason}</p>
            </div>
          )}
          {booking.timezone && (
            <p className="text-navy-600 text-xs">
              Guest timezone: {booking.timezone}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
