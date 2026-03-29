'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ name:'', email:'', username:'', password:'', confirmPassword:'' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showCf, setShowCf]   = useState(false);

  const getStrength = (pw) => {
    if (!pw) return null;
    let s = 0;
    if (pw.length >= 6) s++; if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    if (s <= 1) return { label:'Weak',   color:'#ef4444', w:'25%'  };
    if (s <= 2) return { label:'Fair',   color:'#f59e0b', w:'50%'  };
    if (s <= 3) return { label:'Good',   color:'#3b82f6', w:'75%'  };
    return           { label:'Strong', color:'#10b981', w:'100%' };
  };
  const strength      = getStrength(form.password);
  const match         = form.confirmPassword && form.password === form.confirmPassword;
  const mismatch      = form.confirmPassword && form.password !== form.confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: name==='username' ? value.toLowerCase().replace(/[^a-z0-9_-]/g,'') : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (form.username.length < 3) { setError('Username must be at least 3 characters'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res  = await fetch('/api/users',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name:form.name, email:form.email, username:form.username, password:form.password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return; }
      const si = await signIn('credentials',{ email:form.email, password:form.password, redirect:false });
      si?.error ? router.push('/login') : (router.push('/dashboard'), router.refresh());
    } catch { setError('Something went wrong.'); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 dot-grid">
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background:'radial-gradient(circle,#3a5ab4 0%,transparent 70%)' }} />

      <div className="w-full max-w-sm sm:max-w-md animate-in relative z-10">
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-navy-900"
              style={{ background:'linear-gradient(135deg,#f59e0b,#fbbf24)' }}>X</div>
            <span className="font-display font-bold text-xl text-white">SchedulrX</span>
          </Link>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">Create your account</h1>
          <p className="text-navy-300 mt-1.5 text-sm">Free forever. No credit card required.</p>
        </div>

        <div className="glass-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Full Name</label>
              <input type="text" name="name" className="input-field" placeholder="Jane Smith"
                value={form.name} onChange={handleChange} required />
            </div>

            <div>
              <label className="field-label">Email Address</label>
              <input type="email" name="email" className="input-field" placeholder="jane@company.com"
                value={form.email} onChange={handleChange} required />
            </div>

            <div>
              <label className="field-label">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 text-xs pointer-events-none select-none hidden xs:block">
                  schedulrx.app/
                </span>
                <input type="text" name="username"
                  className="input-field sm:pl-[7.5rem] pl-4"
                  placeholder="janesmith" value={form.username} onChange={handleChange}
                  minLength={3} maxLength={30} required />
              </div>
              <p className="text-navy-500 text-xs mt-1">3–30 chars: lowercase, numbers, - and _</p>
            </div>

            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <input type={showPw?'text':'password'} name="password" className="input-field pr-12"
                  placeholder="Min. 6 characters" value={form.password} onChange={handleChange} minLength={6} required />
                <button type="button" onClick={()=>setShowPw(v=>!v)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white transition-colors p-1.5 rounded-lg touch-manipulation">
                  {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
              {form.password && strength && (
                <div className="mt-2">
                  <div className="h-1 rounded-full bg-navy-700 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width:strength.w, backgroundColor:strength.color }}/>
                  </div>
                  <p className="text-xs mt-1" style={{ color:strength.color }}>{strength.label} password</p>
                </div>
              )}
            </div>

            <div>
              <label className="field-label">Confirm Password</label>
              <div className="relative">
                <input type={showCf?'text':'password'} name="confirmPassword"
                  className={`input-field pr-12 transition-all ${match?'border-green-500/50':mismatch?'border-red-500/50':''}`}
                  placeholder="Re-enter your password" value={form.confirmPassword} onChange={handleChange} required />
                <button type="button" onClick={()=>setShowCf(v=>!v)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white transition-colors p-1.5 rounded-lg touch-manipulation">
                  {showCf?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
              {match   && <p className="text-xs mt-1.5 text-green-400">✓ Passwords match</p>}
              {mismatch && <p className="text-xs mt-1.5 text-red-400">✗ Passwords don't match</p>}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
                <span className="shrink-0">⚠️</span>{error}
              </div>
            )}

            <button type="submit" className="btn-accent w-full mt-2" disabled={loading || !!mismatch}>
              {loading?<span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>Creating…</span>:'Create Account →'}
            </button>
          </form>
        </div>

        <p className="text-center text-navy-300 text-sm mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
