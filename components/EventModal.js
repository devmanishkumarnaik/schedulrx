'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { EVENT_COLORS } from '@/lib/utils';

const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function EventModal({ event, onClose, onSaved }) {
  const isEdit = !!event;
  const [form, setForm]   = useState({ title:'', description:'', duration:30, color:'#3b82f6', location:'Video Call', requiresConfirmation:false });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (event) setForm({ title:event.title, description:event.description||'', duration:event.duration, color:event.color, location:event.location||'Video Call', requiresConfirmation:event.requiresConfirmation||false });
  }, [event]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    const method = isEdit ? 'PATCH' : 'POST';
    const url    = isEdit ? `/api/events/${event._id}` : '/api/events';
    const res    = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
    const data   = await res.json();
    if (!res.ok) { setError(data.error || 'Failed to save'); setLoading(false); }
    else onSaved();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel p-5 sm:p-7" onClick={e => e.stopPropagation()}>
        {/* Handle bar (mobile) */}
        <div className="w-10 h-1 rounded-full bg-navy-600 mx-auto mb-5 sm:hidden" />

        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg sm:text-xl text-white">
            {isEdit ? 'Edit Event Type' : 'New Event Type'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-navy-700/60 text-navy-400 hover:text-white transition-all">
            <X size={18}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Event Name *</label>
            <input type="text" className="input-field" placeholder="e.g. 30-minute intro call"
              value={form.title} onChange={e => setForm({...form, title:e.target.value})} required />
          </div>

          <div>
            <label className="field-label">Description</label>
            <textarea className="input-field resize-none" rows={3} placeholder="What is this meeting for?"
              value={form.description} onChange={e => setForm({...form, description:e.target.value})} />
          </div>

          <div>
            <label className="field-label">Duration</label>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map(d => (
                <button key={d} type="button" onClick={() => setForm({...form, duration:d})}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                    form.duration === d ? 'bg-navy-500 border border-navy-400 text-white' : 'glass-card-light text-navy-300 hover:text-white'}`}>
                  {d < 60 ? `${d} min` : `${d/60} hr`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label">Color</label>
            <div className="flex gap-2.5 flex-wrap">
              {EVENT_COLORS.map(c => (
                <button key={c.value} type="button" onClick={() => setForm({...form, color:c.value})}
                  className={`w-9 h-9 rounded-full transition-all touch-manipulation ${form.color===c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-navy-900 scale-110':''}`}
                  style={{ backgroundColor:c.value }} title={c.label}/>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label">Location / Meeting URL</label>
            <input type="text" className="input-field" placeholder="Video Call, Phone, Zoom link…"
              value={form.location} onChange={e => setForm({...form, location:e.target.value})} />
          </div>

          <div className="flex items-center justify-between glass-card-light p-4 rounded-xl">
            <div>
              <p className="text-white text-sm font-medium">Require Confirmation</p>
              <p className="text-navy-400 text-xs mt-0.5">Manually approve each booking</p>
            </div>
            <button type="button" onClick={() => setForm({...form, requiresConfirmation:!form.requiresConfirmation})}
              className={`toggle ${form.requiresConfirmation?'bg-navy-500':'bg-navy-700'}`}>
              <span className={`toggle-thumb ${form.requiresConfirmation?'translate-x-5':'translate-x-0'}`}/>
            </button>
          </div>

          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
