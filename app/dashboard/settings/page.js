'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Save, Loader, ExternalLink } from 'lucide-react';
import TimezoneSelect from '@/components/TimezoneSelect';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [form, setForm]   = useState({ name:'', bio:'', timezone:'UTC', welcomeMessage:'' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    fetch('/api/users').then(r=>r.json()).then(d => {
      if (d.user) setForm({ name:d.user.name||'', bio:d.user.bio||'', timezone:d.user.timezone||'UTC', welcomeMessage:d.user.welcomeMessage||'' });
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    const res  = await fetch('/api/users',{ method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
    const data = await res.json();
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(()=>setSaved(false),2500); await update({ name:form.name }); }
    else setError(data.error||'Failed to save');
  };

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  return (
    <div className="space-y-5 sm:space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">Settings</h1>
        <p className="text-navy-300 mt-1 text-sm">Manage your profile and account.</p>
      </div>

      {/* Booking page */}
      <div className="glass-card p-4 sm:p-6">
        <h2 className="font-display font-semibold text-white mb-3 text-base">Your Booking Page</h2>
        <div className="flex items-center gap-2">
          <div className="input-field flex-1 text-xs truncate py-2.5 text-navy-300 min-h-0" style={{ minHeight:44 }}>
            {appUrl}/{session?.user?.username}
          </div>
          <a href={`/${session?.user?.username}`} target="_blank" rel="noreferrer"
            className="btn-accent text-xs py-2.5 px-4 shrink-0 flex items-center gap-1.5">
            <ExternalLink size={14}/> View
          </a>
        </div>
      </div>

      {/* Profile */}
      <div className="glass-card p-4 sm:p-6">
        <h2 className="font-display font-semibold text-white mb-4 text-base">Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="field-label">Display Name</label>
            <input type="text" className="input-field" value={form.name}
              onChange={e=>setForm(p=>({...p,name:e.target.value}))} required/>
          </div>
          <div>
            <label className="field-label">Bio</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Short description shown on your booking page…"
              value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))} maxLength={200}/>
            <p className="text-navy-600 text-xs mt-1">{form.bio.length}/200</p>
          </div>
          <div>
            <label className="field-label">Welcome Message</label>
            <input type="text" className="input-field" placeholder="e.g. Looking forward to speaking with you!"
              value={form.welcomeMessage} onChange={e=>setForm(p=>({...p,welcomeMessage:e.target.value}))}/>
          </div>
          <div>
            <label className="field-label">Default Timezone</label>
            <TimezoneSelect value={form.timezone} onChange={tz=>setForm(p=>({...p,timezone:tz}))}/>
          </div>
          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving?<Loader size={15} className="animate-spin"/>:<Save size={15}/>}
            {saving?'Saving…':saved?'✓ Saved!':'Save Profile'}
          </button>
        </form>
      </div>

      {/* Account */}
      <div className="glass-card p-4 sm:p-6">
        <h2 className="font-display font-semibold text-white mb-4 text-base">Account</h2>
        <div className="space-y-3">
          {[
            ['Email',    session?.user?.email],
            ['Username', `@${session?.user?.username}`],
          ].map(([l,v])=>(
            <div key={l} className="flex justify-between items-center py-2 border-b border-navy-700/25 last:border-0 gap-3 flex-wrap">
              <span className="text-navy-400 text-sm">{l}</span>
              <span className="text-white text-sm font-mono break-all">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
