'use client';

import { useEffect, useState } from 'react';
import { Clock, Edit2, Trash2, Plus, ToggleLeft, ToggleRight, Copy, Check } from 'lucide-react';
import EventModal from '@/components/EventModal';

export default function EventsPage() {
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [copiedId, setCopiedId]   = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    const res  = await fetch('/api/events');
    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleCopy = (event) => {
    fetch('/api/users').then(r=>r.json()).then(data => {
      const url = `${window.location.origin}/${data.user?.username}/${event.slug}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(event._id);
        setTimeout(() => setCopiedId(''), 2000);
      });
    });
  };

  const handleToggle = async (event) => {
    await fetch(`/api/events/${event._id}`,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ isActive:!event.isActive }) });
    fetchEvents();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event type?')) return;
    await fetch(`/api/events/${id}`,{ method:'DELETE' });
    fetchEvents();
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">Event Types</h1>
          <p className="text-navy-300 mt-1 text-sm">Create meeting types people can book with you.</p>
        </div>
        <button onClick={() => { setEditEvent(null); setShowModal(true); }} className="btn-accent shrink-0">
          <Plus size={16}/> New Event
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i=><div key={i} className="glass-card h-44 animate-pulse"/>)}
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card p-10 sm:p-16 text-center">
          <div className="text-4xl sm:text-5xl mb-4">📅</div>
          <h3 className="font-display font-semibold text-white text-lg sm:text-xl mb-2">No event types yet</h3>
          <p className="text-navy-400 text-sm mb-6 max-w-xs mx-auto">Create your first event type so people can start booking time with you.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={16}/> Create Event Type</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((event, i) => (
            <div key={event._id}
              className={`glass-card p-5 flex flex-col gap-4 animate-in transition-opacity ${!event.isActive?'opacity-40':''}`}
              style={{ animationDelay:`${i*.06}s` }}>
              <div className="flex items-start gap-3">
                <div className="w-3.5 h-3.5 rounded-full mt-1 shrink-0" style={{ backgroundColor:event.color }}/>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-white truncate text-sm sm:text-base">{event.title}</h3>
                  {event.description && <p className="text-navy-400 text-xs mt-0.5 line-clamp-2">{event.description}</p>}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-navy-400">
                <span className="flex items-center gap-1.5"><Clock size={11}/>{event.duration<60?`${event.duration} min`:`${event.duration/60} hr`}</span>
                <span>📍 {event.location}</span>
                {event.requiresConfirmation && <span className="text-amber-500">⏳ Manual confirm</span>}
              </div>

              <div className="flex items-center gap-2 mt-auto pt-3 border-t border-navy-700/40">
                <button onClick={() => handleToggle(event)} title={event.isActive?'Deactivate':'Activate'}
                  className="text-navy-400 hover:text-white transition-colors p-1 touch-manipulation">
                  {event.isActive?<ToggleRight size={22} className="text-green-400"/>:<ToggleLeft size={22}/>}
                </button>
                <button onClick={() => handleCopy(event)}
                  className="flex items-center gap-1 text-xs text-navy-400 hover:text-amber-400 transition-colors ml-1 min-h-[36px] px-2">
                  {copiedId===event._id?<><Check size={12} className="text-green-400"/>Copied!</>:<><Copy size={12}/>Copy link</>}
                </button>
                <div className="flex gap-1 ml-auto">
                  <button onClick={() => { setEditEvent(event); setShowModal(true); }}
                    className="p-2 rounded-xl hover:bg-navy-700/50 text-navy-400 hover:text-white transition-all min-h-[40px] min-w-[40px] flex items-center justify-center">
                    <Edit2 size={14}/>
                  </button>
                  <button onClick={() => handleDelete(event._id)}
                    className="p-2 rounded-xl hover:bg-red-500/10 text-navy-400 hover:text-red-400 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <EventModal event={editEvent} onClose={() => { setShowModal(false); setEditEvent(null); }} onSaved={() => { setShowModal(false); setEditEvent(null); fetchEvents(); }} />
      )}
    </div>
  );
}
