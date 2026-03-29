'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
         isSameDay, isSameMonth, isToday, isPast, addMonths, subMonths } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { ChevronLeft, ChevronRight, Clock, MapPin, CheckCircle, CalendarPlus } from 'lucide-react';
import { buildGoogleCalendarLink } from '@/lib/googleCalendar';
import TimezoneSelect from '@/components/TimezoneSelect';

const STEPS = { DATE:'date', TIME:'time', FORM:'form', CONFIRM:'confirm' };

export default function BookingFlow({ user, event }) {
  const [step, setStep]             = useState(STEPS.DATE);
  const [guestTz, setGuestTz]       = useState('UTC');
  const [currentMonth, setCurrent]  = useState(new Date());
  const [selectedDate, setDate]     = useState(null);
  const [slots, setSlots]           = useState([]);
  const [slotsLoading, setSlotsLoad]= useState(false);
  const [selectedSlot, setSlot]     = useState(null);
  const [form, setForm]             = useState({ name:'', email:'', notes:'' });
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking]       = useState(null);
  const [calSync, setCalSync]       = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    try { const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; if (tz) setGuestTz(tz); } catch {}
  }, []);

  const fetchSlots = useCallback(async (date) => {
    if (!date) return;
    setSlotsLoad(true); setSlots([]);
    try {
      const res  = await fetch(`/api/slots?username=${user.username}&eventSlug=${event.slug}&date=${format(date,'yyyy-MM-dd')}&timezone=${encodeURIComponent(guestTz)}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch { setSlots([]); }
    setSlotsLoad(false);
  }, [user.username, event.slug, guestTz]);

  const handleDateClick = (date) => {
    if (isPast(date) && !isToday(date)) return;
    setDate(date); setSlot(null); fetchSlots(date); setStep(STEPS.TIME);
  };

  const handleSlotClick = (slot) => { setSlot(slot); setStep(STEPS.FORM); };

  const handleBook = async (e) => {
    e.preventDefault(); setSubmitting(true); setError('');
    const res  = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username:user.username, eventSlug:event.slug, startTime:selectedSlot.startTime, endTime:selectedSlot.endTime, guestName:form.name, guestEmail:form.email, guestNotes:form.notes, timezone:guestTz }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) { setBooking(data.booking); setCalSync(data.calendarSync || false); setStep(STEPS.CONFIRM); }
    else setError(data.error || 'Booking failed. Please try again.');
  };

  const calDays = [];
  let d = startOfWeek(startOfMonth(currentMonth));
  while (d <= endOfWeek(endOfMonth(currentMonth))) { calDays.push(d); d = addDays(d,1); }

  return (
    <div className="min-h-screen bg-navy-900 dot-grid flex flex-col items-center py-6 sm:py-12 px-4">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background:'radial-gradient(circle,#3a5ab4 0%,transparent 70%)' }}/>

      <div className="w-full max-w-5xl relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-5 overflow-hidden">
          <a href={`/${user.username}`} className="text-navy-400 hover:text-white text-sm flex items-center gap-1 transition-colors shrink-0">
            <ChevronLeft size={14}/>{user.name}
          </a>
          <span className="text-navy-600">/</span>
          <span className="text-navy-300 text-sm truncate">{event.title}</span>
        </div>

        {/* ── Confirmation ── */}
        {step === STEPS.CONFIRM && booking && (
          <div className="glass-card p-6 sm:p-10 max-w-lg mx-auto text-center animate-in">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={28} className="text-green-400"/>
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-white mb-2">You're booked! 🎉</h2>
            <p className="text-navy-300 text-sm mb-1">
              Confirmed with <strong className="text-white">{user.name}</strong>.
            </p>
            {calSync && (
              <p className="text-green-400 text-xs mb-5">✓ Added to {user.name}'s Google Calendar</p>
            )}

            {/* Booking summary */}
            <div className="glass-card-light p-4 text-left space-y-2.5 mb-5">
              {[
                ['Event',    event.title],
                ['Date',     formatInTimeZone(new Date(booking.startTime), guestTz, 'EEEE, MMMM d, yyyy')],
                ['Time',     `${formatInTimeZone(new Date(booking.startTime), guestTz, 'h:mm a')} — ${formatInTimeZone(new Date(booking.endTime), guestTz, 'h:mm a')}`],
                ['Timezone', guestTz.replace(/_/g, ' ')],
                ['Location', event.location || '—'],
                ['Ref #',    booking.uid],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between gap-2">
                  <span className="text-navy-400 text-xs shrink-0">{l}</span>
                  <span className="text-white text-xs text-right break-all">{v}</span>
                </div>
              ))}
            </div>

            {/* Add to YOUR calendar (guest) */}
            <div className="mb-5">
              <p className="text-navy-500 text-xs mb-2">Add to your calendar:</p>
              <a href={buildGoogleCalendarLink({
                  title:       `${event.title} with ${user.name}`,
                  description: `Booked via SchedulrX · Ref: ${booking.uid}`,
                  location:    event.location || '',
                  startTime:   booking.startTime,
                  endTime:     booking.endTime,
                })}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white border border-navy-600/50 hover:border-navy-400 hover:bg-navy-700/30 transition-all w-full sm:w-auto">
                <GoogleCalIcon/> Add to Google Calendar
              </a>
            </div>

            <a href={`/${user.username}`} className="btn-secondary text-sm w-full sm:w-auto">← Book another meeting</a>
          </div>
        )}

        {/* ── Main booking flow ── */}
        {step !== STEPS.CONFIRM && (
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Left info panel */}
            <div className="lg:w-64 shrink-0">
              <div className="glass-card p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center font-bold text-white text-sm shrink-0">
                    {user.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-navy-400 text-xs truncate">{user.name}</p>
                    <p className="font-display font-semibold text-white text-sm truncate">{event.title}</p>
                  </div>
                </div>

                {event.description && (
                  <p className="text-navy-400 text-xs mb-4 leading-relaxed">{event.description}</p>
                )}

                <div className="space-y-2 text-xs mb-4">
                  <div className="flex items-center gap-2 text-navy-300">
                    <Clock size={12} style={{ color: event.color }}/>{event.duration} minutes
                  </div>
                  <div className="flex items-center gap-2 text-navy-300">
                    <MapPin size={12} style={{ color: event.color }}/>{event.location}
                  </div>
                </div>

                <p className="field-label mb-2">Your Timezone</p>
                <TimezoneSelect
                  value={guestTz}
                  onChange={tz => { setGuestTz(tz); if (selectedDate) fetchSlots(selectedDate); }}
                />

                {selectedDate && step !== STEPS.DATE && (
                  <div className="mt-4 pt-4 border-t border-navy-700/40">
                    <p className="text-white text-xs font-semibold">{format(selectedDate, 'EEE, MMM d')}</p>
                    {selectedSlot && <p className="text-amber-400 text-xs mt-0.5">{formatInTimeZone(new Date(selectedSlot.startTime), guestTz, 'h:mm a')}</p>}
                    <button onClick={() => { setStep(STEPS.DATE); setSlot(null); }}
                      className="text-navy-500 hover:text-white text-xs mt-2 transition-colors">↩ Change date</button>
                  </div>
                )}
              </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 min-w-0">
              {/* Date picker */}
              {step === STEPS.DATE && (
                <div className="glass-card p-4 sm:p-6 animate-in">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-semibold text-white text-base">Select a Date</h2>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => setCurrent(subMonths(currentMonth,1))}
                        className="p-2 rounded-xl hover:bg-navy-700/50 text-navy-400 hover:text-white transition-all min-h-[40px] min-w-[40px] flex items-center justify-center">
                        <ChevronLeft size={16}/>
                      </button>
                      <span className="text-sm font-medium text-white w-28 text-center">{format(currentMonth,'MMM yyyy')}</span>
                      <button onClick={() => setCurrent(addMonths(currentMonth,1))}
                        className="p-2 rounded-xl hover:bg-navy-700/50 text-navy-400 hover:text-white transition-all min-h-[40px] min-w-[40px] flex items-center justify-center">
                        <ChevronRight size={16}/>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 mb-1">
                    {['S','M','T','W','T','F','S'].map((x,i) => (
                      <div key={i} className="text-center text-xs text-navy-600 font-medium py-1">{x}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                    {calDays.map((day, idx) => {
                      const inMonth = isSameMonth(day, currentMonth);
                      const past    = isPast(day) && !isToday(day);
                      const sel     = selectedDate && isSameDay(day, selectedDate);
                      const today   = isToday(day);
                      return (
                        <button key={idx} disabled={past || !inMonth} onClick={() => handleDateClick(day)}
                          className={`aspect-square rounded-xl text-sm font-medium transition-all relative min-h-[38px] sm:min-h-[42px]
                            ${!inMonth ? 'opacity-0 pointer-events-none' : ''}
                            ${past ? 'text-navy-800 cursor-not-allowed' : ''}
                            ${!past && inMonth ? 'hover:bg-navy-600/50 cursor-pointer active:opacity-70' : ''}
                            ${sel ? 'text-white' : inMonth && !past ? 'text-navy-200' : ''}`}
                          style={sel ? { backgroundColor: event.color } : {}}>
                          {format(day,'d')}
                          {today && !sel && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400"/>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Time picker */}
              {step === STEPS.TIME && (
                <div className="glass-card p-4 sm:p-6 animate-in">
                  <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => setStep(STEPS.DATE)}
                      className="text-navy-400 hover:text-white transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center">
                      <ChevronLeft size={18}/>
                    </button>
                    <div>
                      <h2 className="font-display font-semibold text-white text-base">{format(selectedDate,'EEE, MMMM d')}</h2>
                      <p className="text-navy-500 text-xs mt-0.5">Times in {guestTz.replace(/_/g,' ')}</p>
                    </div>
                  </div>

                  {slotsLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="w-6 h-6 border-2 border-navy-400 border-t-white rounded-full animate-spin"/>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="text-3xl mb-3">😔</div>
                      <p className="text-navy-400 text-sm">No available slots on this day.</p>
                      <button onClick={() => setStep(STEPS.DATE)}
                        className="text-amber-400 text-sm mt-2 hover:text-amber-300 transition-colors">
                        Choose another date →
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
                      {slots.map((slot, i) => (
                        <button key={i} onClick={() => handleSlotClick(slot)}
                          className="py-2.5 sm:py-3 px-3 rounded-xl text-sm font-medium text-center transition-all border border-navy-600/50 hover:border-navy-400 hover:bg-navy-700/40 text-white min-h-[48px] active:opacity-70">
                          {formatInTimeZone(new Date(slot.startTime), guestTz, 'h:mm a')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Booking form */}
              {step === STEPS.FORM && (
                <div className="glass-card p-4 sm:p-6 animate-in">
                  <div className="flex items-center gap-3 mb-5">
                    <button onClick={() => setStep(STEPS.TIME)}
                      className="text-navy-400 hover:text-white transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center">
                      <ChevronLeft size={18}/>
                    </button>
                    <h2 className="font-display font-semibold text-white text-base">Your Details</h2>
                  </div>

                  <form onSubmit={handleBook} className="space-y-4">
                    <div>
                      <label className="field-label">Your Name *</label>
                      <input type="text" className="input-field" placeholder="Jane Smith"
                        value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required/>
                    </div>
                    <div>
                      <label className="field-label">Email Address *</label>
                      <input type="email" className="input-field" placeholder="jane@company.com"
                        value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required/>
                    </div>
                    <div>
                      <label className="field-label">Notes (optional)</label>
                      <textarea className="input-field resize-none" rows={3} placeholder="Anything you'd like the host to know?"
                        value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}/>
                    </div>

                    <div className="glass-card-light p-4 rounded-xl space-y-2">
                      {[
                        ['Date',     format(selectedDate, 'EEEE, MMMM d, yyyy')],
                        ['Time',     `${formatInTimeZone(new Date(selectedSlot.startTime), guestTz, 'h:mm a')} — ${formatInTimeZone(new Date(selectedSlot.endTime), guestTz, 'h:mm a')}`],
                        ['Timezone', guestTz.replace(/_/g, ' ')],
                        ['With',     user.name],
                      ].map(([l, v]) => (
                        <div key={l} className="flex justify-between gap-2">
                          <span className="text-navy-400 text-xs">{l}</span>
                          <span className="text-white text-xs text-right">{v}</span>
                        </div>
                      ))}
                    </div>

                    {error && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
                    )}

                    <button type="submit" className="btn-accent w-full" disabled={submitting}>
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>Confirming…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2"><CalendarPlus size={16}/> Confirm Booking</span>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleCalIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
