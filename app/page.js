import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-navy-900 dot-grid overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3"
        style={{ background:'rgba(10,15,30,0.92)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(82,113,195,0.15)' }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-sm text-navy-900"
            style={{ background:'linear-gradient(135deg,#f59e0b,#fbbf24)' }}>X</div>
          <span className="font-display font-bold text-base sm:text-lg tracking-tight text-white">SchedulrX</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login"    className="btn-secondary text-xs px-3 py-2 min-h-[36px]">Sign In</Link>
          <Link href="/register" className="btn-accent   text-xs px-3 py-2 min-h-[36px]">Get Started</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 text-center max-w-5xl mx-auto">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background:'radial-gradient(circle,#3a5ab4 0%,transparent 70%)' }} />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold mb-5 border border-amber-500/30 text-amber-400 bg-amber-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Scheduling made effortless
          </span>

          <h1 className="font-display font-black leading-[1.05] mb-5"
            style={{ fontSize:'clamp(2rem,8vw,4.5rem)' }}>
            <span className="text-gradient">Stop the email</span>
            <br />
            <span className="text-white">back-and-forth.</span>
          </h1>

          <p className="text-navy-200 max-w-xl mx-auto mb-8 leading-relaxed"
            style={{ fontSize:'clamp(0.9rem,2.5vw,1.15rem)' }}>
            SchedulrX lets people book time with you — syncing to your availability, timezone, and calendar. Share one link. Done.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className="btn-accent text-sm px-6 py-3.5 w-full sm:w-auto rounded-2xl">
              Create Free Account →
            </Link>
            <Link href="/login" className="btn-secondary text-sm px-6 py-3.5 w-full sm:w-auto rounded-2xl">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon:'🗓️', title:'Smart Availability',  desc:'Set your schedule once. SchedulrX blocks busy times and shows only real open slots.' },
            { icon:'🌍', title:'Timezone Aware',       desc:'Every booking shown in the guest\'s local time. No more timezone math.' },
            { icon:'⚡', title:'Instant Booking',      desc:'Guests pick a slot, enter details, and get a confirmed booking immediately.' },
            { icon:'🔗', title:'Shareable Link',       desc:'Your booking page at one URL. Drop it in emails, bio, Slack — anywhere.' },
            { icon:'📧', title:'Email Notifications',  desc:'Automatic emails for registrations, confirmations, reminders and cancellations.' },
            { icon:'📅', title:'Calendar Sync',        desc:'Auto-sync to Google Calendar or Outlook. Events created and deleted automatically.' },
          ].map((f, i) => (
            <div key={i} className="glass-card p-5 animate-in hover:border-navy-500/40 transition-all"
              style={{ animationDelay:`${i*.07}s`, opacity:0 }}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-display font-semibold text-white mb-1.5 text-base">{f.title}</h3>
              <p className="text-navy-300 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24 max-w-4xl mx-auto">
        <h2 className="font-display font-bold text-white text-center mb-8 sm:mb-12"
          style={{ fontSize:'clamp(1.5rem,4vw,2.2rem)' }}>
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { step:'01', title:'Set your hours',   desc:'Configure when you\'re available each week.' },
            { step:'02', title:'Share your link',  desc:'Send people your SchedulrX URL and let them pick a slot.' },
            { step:'03', title:'Show up & meet',   desc:'Bookings land in your dashboard and calendar.' },
          ].map((s, i) => (
            <div key={i} className="glass-card p-6 sm:p-7 text-center animate-in stagger-2">
              <div className="font-display font-black text-4xl sm:text-5xl mb-3"
                style={{ background:'linear-gradient(135deg,#3a5ab4,#5271c3)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                {s.step}
              </div>
              <h3 className="font-display font-semibold text-white mb-2 text-base">{s.title}</h3>
              <p className="text-navy-300 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 sm:px-6 pb-20 sm:pb-28">
        <div className="max-w-4xl mx-auto glass-card p-8 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-15 pointer-events-none"
            style={{ background:'radial-gradient(ellipse at center,#3a5ab4 0%,transparent 70%)' }} />
          <div className="relative z-10">
            <h2 className="font-display font-black text-white mb-3"
              style={{ fontSize:'clamp(1.4rem,4vw,2.2rem)' }}>
              Ready to reclaim your time?
            </h2>
            <p className="text-navy-200 mb-7 text-sm sm:text-base max-w-md mx-auto">
              Join thousands who schedule smarter with SchedulrX. Free forever.
            </p>
            <Link href="/register" className="btn-accent px-8 py-4 text-base rounded-2xl">
              Get Started — It's Free
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-6 px-4 text-center text-navy-600 text-xs sm:text-sm"
        style={{ borderTop:'1px solid rgba(82,113,195,0.1)' }}>
        © {new Date().getFullYear()} SchedulrX — Built with Next.js & MongoDB
      </footer>
    </div>
  );
}
