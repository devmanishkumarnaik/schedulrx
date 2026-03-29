'use client';

import { useState, useEffect } from 'react';
import { Save, Loader } from 'lucide-react';
import TimezoneSelect from '@/components/TimezoneSelect';

const DAY_NAMES  = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const DAY_SHORT  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const TIMES = [];
for (let h=0;h<24;h++) for (let m of [0,30]) {
  TIMES.push({ val:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, label:`${h===0?12:h>12?h-12:h}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}` });
}
const defaultSched = () => ({ sunday:{enabled:false,start:'09:00',end:'17:00'}, monday:{enabled:true,start:'09:00',end:'17:00'}, tuesday:{enabled:true,start:'09:00',end:'17:00'}, wednesday:{enabled:true,start:'09:00',end:'17:00'}, thursday:{enabled:true,start:'09:00',end:'17:00'}, friday:{enabled:true,start:'09:00',end:'17:00'}, saturday:{enabled:false,start:'09:00',end:'17:00'} });

export default function AvailabilityPage() {
  const [data, setData]     = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    fetch('/api/availability').then(r=>r.json()).then(d => {
      if (d.availability) setData({ schedule:d.availability.schedule||defaultSched(), timezone:d.availability.timezone||'UTC', bufferBefore:d.availability.bufferBefore||0, bufferAfter:d.availability.bufferAfter||0, minimumNotice:d.availability.minimumNotice||60, daysInAdvance:d.availability.daysInAdvance||60 });
      else setData({ schedule:defaultSched(), timezone:'UTC', bufferBefore:0, bufferAfter:0, minimumNotice:60, daysInAdvance:60 });
    });
  }, []);

  const updateDay = (day, field, val) =>
    setData(p => ({ ...p, schedule:{ ...p.schedule, [day]:{ ...p.schedule[day], [field]:val } } }));

  const handleSave = async () => {
    setSaving(true); setError('');
    const res = await fetch('/api/availability',{ method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(()=>setSaved(false),2500); }
    else { const d=await res.json(); setError(d.error||'Failed to save'); }
  };

  if (!data) return <div className="flex items-center justify-center h-64"><Loader className="animate-spin text-navy-400"/></div>;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">Availability</h1>
          <p className="text-navy-300 mt-1 text-sm">Set when you're available for bookings.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary shrink-0">
          {saving?<Loader size={15} className="animate-spin"/>:<Save size={15}/>}
          {saving?'Saving…':saved?'✓ Saved!':'Save Changes'}
        </button>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

      {/* Timezone */}
      <div className="glass-card p-4 sm:p-6">
        <h2 className="font-display font-semibold text-white mb-1 text-base">Your Timezone</h2>
        <p className="text-navy-400 text-xs sm:text-sm mb-4">All availability windows use this timezone.</p>
        <label className="field-label">Timezone</label>
        <TimezoneSelect value={data.timezone} onChange={tz=>setData(p=>({...p,timezone:tz}))} />
      </div>

      {/* Weekly schedule */}
      <div className="glass-card p-4 sm:p-6">
        <h2 className="font-display font-semibold text-white mb-4 text-base">Weekly Schedule</h2>
        <div className="space-y-2">
          {DAY_NAMES.map((day, i) => {
            const d = data.schedule[day] || { enabled:false, start:'09:00', end:'17:00' };
            return (
              <div key={day} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-3.5 rounded-xl transition-all ${d.enabled?'glass-card-light':'opacity-50'}`}>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => updateDay(day,'enabled',!d.enabled)}
                    className={`toggle shrink-0 ${d.enabled?'bg-navy-500':'bg-navy-700'}`}>
                    <span className={`toggle-thumb ${d.enabled?'translate-x-5':'translate-x-0'}`}/>
                  </button>
                  <span className="font-display font-semibold text-sm text-white w-10 shrink-0">{DAY_SHORT[i]}</span>
                </div>
                {d.enabled ? (
                  <div className="flex items-center gap-2 flex-1 flex-wrap">
                    <select className="input-field flex-1 min-w-[100px] py-2 text-xs" style={{ minHeight:44 }}
                      value={d.start} onChange={e=>updateDay(day,'start',e.target.value)}>
                      {TIMES.map(t=><option key={t.val} value={t.val} style={{background:'#0a0f1e'}}>{t.label}</option>)}
                    </select>
                    <span className="text-navy-500 text-xs">to</span>
                    <select className="input-field flex-1 min-w-[100px] py-2 text-xs" style={{ minHeight:44 }}
                      value={d.end} onChange={e=>updateDay(day,'end',e.target.value)}>
                      {TIMES.map(t=><option key={t.val} value={t.val} style={{background:'#0a0f1e'}}>{t.label}</option>)}
                    </select>
                  </div>
                ) : <span className="text-navy-600 text-sm italic flex-1 pl-0 sm:pl-2">Unavailable</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Advanced */}
      <div className="glass-card p-4 sm:p-6">
        <h2 className="font-display font-semibold text-white mb-4 text-base">Advanced Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key:'bufferBefore', label:'Buffer Before', opts:[0,5,10,15,30], fmt:v=>v===0?'None':`${v} min` },
            { key:'bufferAfter',  label:'Buffer After',  opts:[0,5,10,15,30], fmt:v=>v===0?'None':`${v} min` },
            { key:'minimumNotice',label:'Minimum Notice',opts:[0,30,60,120,240,480,1440], fmt:v=>v===0?'None':v<60?`${v} min`:v<1440?`${v/60} hr`:'1 day' },
            { key:'daysInAdvance',label:'Days in Advance',opts:[7,14,30,60,90,180], fmt:v=>`${v} days` },
          ].map(({ key, label, opts, fmt }) => (
            <div key={key}>
              <label className="field-label">{label}</label>
              <select className="input-field" value={data[key]}
                onChange={e=>setData(p=>({...p,[key]:Number(e.target.value)}))}>
                {opts.map(v=><option key={v} value={v} style={{background:'#0a0f1e'}}>{fmt(v)}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
