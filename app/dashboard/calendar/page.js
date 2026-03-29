'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle, XCircle, RefreshCw, Unlink,
  ExternalLink, AlertTriangle, AlertCircle,
  ChevronDown, ChevronUp, Zap, Shield, Copy, Check,
} from 'lucide-react';

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="pt-16 lg:pt-0 text-navy-400 text-sm animate-pulse">Loading…</div>}>
      <CalendarPageInner />
    </Suspense>
  );
}

function CalendarPageInner() {
  const searchParams               = useSearchParams();
  const [connected,  setConnected] = useState(null);   // null = loading
  const [configured, setConfigured] = useState(false);
  const [loading,    setLoading]   = useState(true);
  const [banner,     setBanner]    = useState(null);   // 'access_denied' | 'failed' | null
  const [bannerMsg,  setBannerMsg] = useState('');
  const [toast,      setToast]     = useState(null);
  const [copied,     setCopied]    = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/calendar/status');
      const data = await res.json();
      setConnected(data.connected || null);
      setConfigured(data.configured || false);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus();
    const success = searchParams.get('success');
    const error   = searchParams.get('error');
    const msg     = decodeURIComponent(searchParams.get('msg') || '');

    if (success === 'google') showToast('🎉 Google Calendar connected! Bookings will now auto-sync.');
    if (error === 'google_access_denied') setBanner('access_denied');
    if (error === 'google_failed')  { setBanner('failed'); setBannerMsg(msg); }
    if (error === 'google_other')   { setBanner('failed'); setBannerMsg(msg); }
    if (error === 'invalid_callback') showToast('Invalid callback — please try again.', 'error');
  }, [fetchStatus, searchParams]);

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Google Calendar?\nFuture bookings will not sync, but existing events remain.')) return;
    const res = await fetch('/api/calendar/disconnect', { method: 'DELETE' });
    if (res.ok) { showToast('Google Calendar disconnected.', 'info'); fetchStatus(); setBanner(null); }
  };

  const handleCopyEnvVars = () => {
    const text = `GOOGLE_CLIENT_ID=your_client_id_here\nGOOGLE_CLIENT_SECRET=your_client_secret_here\nGOOGLE_REDIRECT_URI=${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/calendar/google/callback`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const redirectUri = typeof window !== 'undefined'
    ? `${window.location.origin}/api/calendar/google/callback`
    : 'http://localhost:3000/api/calendar/google/callback';

  return (
    <div className="space-y-5 sm:space-y-6 max-w-2xl">

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">Calendar Integration</h1>
        <p className="text-navy-300 mt-1 text-sm">
          Connect Google Calendar so every booking syncs automatically.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-auto sm:max-w-sm z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in"
          style={{
            backdropFilter: 'blur(16px)',
            background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : toast.type === 'info' ? 'rgba(30,49,120,0.9)' : 'rgba(16,185,129,0.15)',
            border: toast.type === 'error' ? '1px solid rgba(239,68,68,0.4)' : toast.type === 'info' ? '1px solid rgba(82,113,195,0.4)' : '1px solid rgba(16,185,129,0.4)',
            color: toast.type === 'error' ? '#fca5a5' : toast.type === 'info' ? '#aab8e1' : '#6ee7b7',
          }}>
          {toast.type === 'error' ? <XCircle size={15}/> : <CheckCircle size={15}/>}
          <span className="flex-1">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="text-current opacity-60 hover:opacity-100 text-lg leading-none ml-2">×</button>
        </div>
      )}

      {/* Access denied banner */}
      {banner === 'access_denied' && <AccessDeniedBanner onDismiss={() => setBanner(null)} />}
      {banner === 'failed' && (
        <div className="p-4 rounded-xl flex items-start gap-3 animate-in"
          style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)' }}>
          <XCircle size={18} className="text-red-400 shrink-0 mt-0.5"/>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Google Calendar connection failed</p>
            <p className="text-red-300 text-xs mt-1 leading-relaxed break-words">{bannerMsg || 'Check your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local, then restart the server.'}</p>
          </div>
          <button onClick={() => setBanner(null)} className="text-red-500 hover:text-white text-xl leading-none shrink-0">×</button>
        </div>
      )}

      {/* Feature strips */}
      <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3">
        {[
          { icon:<Zap size={14} className="text-amber-400"/>,   label:'Auto-sync on booking' },
          { icon:<Shield size={14} className="text-blue-400"/>, label:'Secure OAuth 2.0' },
          { icon:<CheckCircle size={14} className="text-green-400"/>, label:'Cancellations removed' },
        ].map((f,i) => (
          <div key={i} className="glass-card-light p-3 flex items-center gap-2.5 rounded-xl">
            {f.icon}
            <span className="text-navy-300 text-xs font-medium">{f.label}</span>
          </div>
        ))}
      </div>

      {/* Google Calendar card */}
      <div className="glass-card overflow-hidden">
        {/* Card header */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}>
              <GoogleIcon size={26}/>
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-white text-lg sm:text-xl">Google Calendar</h2>
              <p className="text-navy-400 text-xs sm:text-sm mt-0.5">Gmail, Google Workspace, Android &amp; iOS</p>
            </div>
          </div>

          {!loading && (
            <div className="shrink-0">
              {connected
                ? <span className="badge badge-confirmed flex items-center gap-1.5 px-3 py-1.5"><CheckCircle size={12}/> Connected</span>
                : <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background:'rgba(107,114,128,0.15)', color:'#9ca3af', border:'1px solid rgba(107,114,128,0.25)' }}><XCircle size={12}/> Not connected</span>
              }
            </div>
          )}
        </div>

        {/* ── Connected ── */}
        {!loading && connected && (
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl"
              style={{ background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.2)' }}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
                  <p className="text-white text-sm font-semibold">{connected.email || connected.name}</p>
                </div>
                <p className="text-green-400 text-xs mt-1">✓ Bookings sync automatically to this calendar</p>
                {connected.needsReconnect && (
                  <p className="text-amber-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={11}/> Token expired — please reconnect
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {connected.needsReconnect && (
                  <button onClick={() => { window.location.href = '/api/calendar/google/connect'; }}
                    className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5">
                    <RefreshCw size={13}/> Reconnect
                  </button>
                )}
                <button onClick={handleDisconnect}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all min-h-[36px]"
                  style={{ color:'#f87171', border:'1px solid rgba(239,68,68,0.25)', background:'transparent' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <Unlink size={13}/> Disconnect
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Configured, not connected ── */}
        {!loading && !connected && configured && (
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-4">
            <div className="p-4 rounded-xl flex items-start gap-3"
              style={{ background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)' }}>
              <AlertTriangle size={15} className="text-amber-400 mt-0.5 shrink-0"/>
              <div>
                <p className="text-amber-300 text-sm font-semibold mb-1">⚠️ Add yourself as a Test User first</p>
                <p className="text-navy-400 text-xs leading-relaxed">
                  If your app is in <strong className="text-white">Testing mode</strong>, go to{' '}
                  <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noreferrer"
                    className="text-amber-400 underline hover:text-amber-300 inline-flex items-center gap-0.5">
                    OAuth consent screen → Test users <ExternalLink size={10}/>
                  </a>
                  {' '}and add your Gmail. Otherwise you'll get Error 403: access_denied.
                </p>
              </div>
            </div>
            <button onClick={() => { window.location.href = '/api/calendar/google/connect'; }}
              className="btn-primary w-full sm:w-auto flex items-center gap-2">
              Connect Google Calendar →
            </button>
            <p className="text-navy-600 text-xs">You'll be redirected to Google to grant calendar access. SchedulrX only creates/deletes events — it cannot read your other events.</p>
          </div>
        )}

        {/* ── Not configured ── */}
        {!loading && !connected && !configured && (
          <SetupGuide redirectUri={redirectUri} copied={copied} onCopy={handleCopyEnvVars}/>
        )}
      </div>

      {/* What syncs */}
      <div className="glass-card p-5 sm:p-6">
        <h2 className="font-display font-semibold text-white mb-4 text-base">What gets synced</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            ['✅', 'New confirmed booking → Google Calendar event created instantly'],
            ['🗑️', 'Cancelled booking → Calendar event deleted automatically'],
            ['🎊', 'Pending → confirmed → Event added at that moment'],
            ['📧', 'Guest added as attendee (receives Google Calendar invite)'],
            ['⏰', '15-minute reminder set automatically on every event'],
            ['📍', 'Meeting location or link included in the event'],
          ].map(([icon, label], i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="text-base leading-tight shrink-0">{icon}</span>
              <span className="text-navy-300 text-xs sm:text-sm leading-relaxed">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Access Denied Banner ─────────────────────────────────────────────────────
function AccessDeniedBanner({ onDismiss }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl overflow-hidden animate-in"
      style={{ border:'2px solid rgba(239,68,68,0.5)', background:'rgba(20,5,5,0.9)' }}>
      <div className="flex items-start gap-3 px-4 sm:px-5 py-4"
        style={{ background:'rgba(239,68,68,0.15)', borderBottom:'1px solid rgba(239,68,68,0.3)' }}>
        <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5"/>
        <div className="flex-1">
          <p className="text-white font-display font-bold text-sm">Error 403: access_denied</p>
          <p className="text-red-300 text-xs mt-1 leading-relaxed">
            Your app is in <strong className="text-white">Testing mode</strong> and your Gmail isn't added as a Test User. Fix takes 2 minutes:
          </p>
        </div>
        <button onClick={onDismiss} className="text-red-400 hover:text-white text-xl leading-none shrink-0">×</button>
      </div>

      <div className="p-4 sm:p-5">
        <button onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-red-300 hover:text-white transition-colors">
          {open ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
          {open ? 'Hide fix' : 'Show step-by-step fix'}
        </button>

        {open && (
          <div className="mt-4 space-y-5">
            {[
              {
                n: 1,
                title: 'Open OAuth consent screen',
                body: <p className="text-navy-300 text-sm leading-relaxed">
                  Go to <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noreferrer"
                    className="text-amber-400 underline hover:text-amber-300 inline-flex items-center gap-1">
                    Google Cloud Console → APIs &amp; Services → OAuth consent screen <ExternalLink size={11}/>
                  </a>
                </p>,
              },
              {
                n: 2,
                title: 'Add your Gmail as a Test User',
                body: <div>
                  <p className="text-navy-300 text-sm leading-relaxed">Scroll to the <strong className="text-white">"Test users"</strong> section → click <strong className="text-white">+ ADD USERS</strong> → enter your Gmail → <strong className="text-white">Save</strong>.</p>
                  <div className="mt-2 p-3 rounded-xl text-xs font-mono text-green-300" style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)' }}>
                    ✓ e.g. yourname@gmail.com
                  </div>
                </div>,
              },
              {
                n: 3,
                title: 'Try connecting again',
                body: <div>
                  <p className="text-navy-300 text-sm mb-3">After saving, return here and click Connect.</p>
                  <button onClick={() => { window.location.href = '/api/calendar/google/connect'; }}
                    className="btn-primary text-sm py-2.5 px-5">
                    Try Again →
                  </button>
                </div>,
              },
            ].map(step => (
              <div key={step.n} className="flex gap-3 sm:gap-4">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                  style={{ background:'rgba(239,68,68,0.3)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.4)' }}>{step.n}</div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm mb-2">{step.title}</p>
                  {step.body}
                </div>
              </div>
            ))}

            <div className="p-3 sm:p-4 rounded-xl text-xs sm:text-sm"
              style={{ background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-amber-300 font-semibold mb-1">Alternative: Publish the app</p>
              <p className="text-navy-400 leading-relaxed">Set Publishing status to <strong className="text-white">In production</strong> to remove the 100-user test limit. Requires <a href="https://support.google.com/cloud/answer/9110914" target="_blank" rel="noreferrer" className="text-amber-400 underline">Google verification</a> for sensitive scopes.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Setup Guide (credentials not configured) ─────────────────────────────────
function SetupGuide({ redirectUri, copied, onCopy }) {
  const [showSteps, setShowSteps] = useState(false);
  const envVars = `GOOGLE_CLIENT_ID=your_client_id_here\nGOOGLE_CLIENT_SECRET=your_client_secret_here\nGOOGLE_REDIRECT_URI=${redirectUri}`;

  return (
    <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-4">
      <div className="p-4 rounded-xl"
        style={{ background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)' }}>
        <p className="text-amber-300 text-sm font-semibold mb-2 flex items-center gap-2">
          <AlertCircle size={14}/> OAuth credentials not configured
        </p>
        <p className="text-navy-400 text-xs mb-3 leading-relaxed">
          Add these to your <code className="bg-navy-800/60 px-1.5 py-0.5 rounded font-mono">.env.local</code> file and restart the dev server:
        </p>
        <div className="relative">
          <pre className="text-xs font-mono text-green-300 px-4 py-3 rounded-lg overflow-x-auto"
            style={{ background:'rgba(10,15,30,0.8)', border:'1px solid rgba(82,113,195,0.2)' }}>
{envVars}
          </pre>
          <button onClick={onCopy}
            className="absolute top-2 right-2 p-1.5 rounded-lg transition-all text-navy-400 hover:text-white min-h-[32px] min-w-[32px] flex items-center justify-center"
            style={{ background:'rgba(30,49,120,0.7)' }}>
            {copied ? <Check size={13} className="text-green-400"/> : <Copy size={13}/>}
          </button>
        </div>
        <p className="text-navy-600 text-xs mt-2 break-all">
          Redirect URI: <span className="font-mono text-navy-500">{redirectUri}</span>
        </p>
      </div>

      <button onClick={() => setShowSteps(v => !v)}
        className="flex items-center gap-2 text-sm text-navy-400 hover:text-white transition-colors">
        {showSteps ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
        {showSteps ? 'Hide' : 'Show'} setup guide (3 minutes)
      </button>

      {showSteps && (
        <div className="space-y-3 text-sm">
          {[
            'Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" class="text-amber-400 underline">console.cloud.google.com</a> → select or create a project.',
            'Go to <strong class="text-white">APIs & Services → Library</strong> → search <strong class="text-white">"Google Calendar API"</strong> → Enable.',
            'Go to <strong class="text-white">APIs & Services → OAuth consent screen</strong> → External → fill app name & email → Save. Scroll to <strong class="text-white">Test users → + ADD USERS</strong> → add your Gmail → Save.',
            'Go to <strong class="text-white">Credentials → Create Credentials → OAuth 2.0 Client ID</strong> → Web application.',
            'Under <strong class="text-white">Authorized redirect URIs</strong> add: <code class="bg-navy-800/60 px-1.5 rounded font-mono text-xs text-green-300 break-all">' + redirectUri + '</code>',
            'Copy <strong class="text-white">Client ID</strong> and <strong class="text-white">Client Secret</strong> → add to .env.local → restart server → click Connect.',
          ].map((step, i) => (
            <div key={i} className="flex gap-3">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                style={{ background:'rgba(58,90,180,0.4)', color:'#aab8e1' }}>{i+1}</span>
              <p className="text-navy-300 text-xs sm:text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: step }}/>
            </div>
          ))}
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors mt-1">
            Open Google Cloud Console <ExternalLink size={11}/>
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Google Icon ──────────────────────────────────────────────────────────────
function GoogleIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
