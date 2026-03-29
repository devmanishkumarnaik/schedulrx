'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]         = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    if (res?.error) { setError(res.error); setLoading(false); }
    else { router.push('/dashboard'); router.refresh(); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 dot-grid">
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background:'radial-gradient(circle,#3a5ab4 0%,transparent 70%)' }} />

      <div className="w-full max-w-sm sm:max-w-md animate-in relative z-10">
        {/* Logo */}
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-navy-900"
              style={{ background:'linear-gradient(135deg,#f59e0b,#fbbf24)' }}>X</div>
            <span className="font-display font-bold text-xl text-white">SchedulrX</span>
          </Link>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">Welcome back</h1>
          <p className="text-navy-300 mt-1.5 text-sm">Sign in to your account</p>
        </div>

        <div className="glass-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="field-label">Email address</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input-field pr-12"
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white transition-colors p-1.5 rounded-lg touch-manipulation"
                  tabIndex={-1}>
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠️</span>{error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>Signing in…</span> : 'Sign In →'}
            </button>
          </form>
        </div>

        <p className="text-center text-navy-300 text-sm mt-5">
          Don't have an account?{' '}
          <Link href="/register" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
            Create one free →
          </Link>
        </p>
      </div>
    </div>
  );
}
