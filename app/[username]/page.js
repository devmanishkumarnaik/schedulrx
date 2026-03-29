import { notFound } from 'next/navigation';
import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Event from '@/models/Event';

export async function generateMetadata({ params }) {
  await connectDB();
  const user = await User.findOne({ username: params.username });
  if (!user) return { title: 'Not found' };
  return { title: `Book with ${user.name} — SchedulrX`, description: user.bio || `Schedule a meeting with ${user.name}` };
}

export default async function UserProfilePage({ params }) {
  await connectDB();
  const user = await User.findOne({ username: params.username });
  if (!user) notFound();
  const events = await Event.find({ userId: user._id, isActive: true }).sort({ duration: 1 });

  return (
    <div className="min-h-screen bg-navy-900 dot-grid flex flex-col items-center py-10 sm:py-16 px-4">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background:'radial-gradient(circle,#3a5ab4 0%,transparent 70%)' }}/>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8 animate-in">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-2xl sm:text-3xl font-bold mx-auto mb-4 border-2 border-navy-500/50 text-white">
            {user.name[0].toUpperCase()}
          </div>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-white">{user.name}</h1>
          {user.welcomeMessage && <p className="text-amber-400 text-sm mt-1 italic">"{user.welcomeMessage}"</p>}
          {user.bio && <p className="text-navy-300 text-sm mt-2 max-w-sm mx-auto leading-relaxed">{user.bio}</p>}
        </div>

        {events.length === 0 ? (
          <div className="glass-card p-10 sm:p-12 text-center">
            <p className="text-navy-300 text-sm">No events available for booking.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, i) => (
              <Link key={event._id.toString()} href={`/${params.username}/${event.slug}`}
                className="glass-card p-4 sm:p-5 flex items-center gap-4 hover:border-navy-500/50 transition-all group animate-in block active:opacity-80"
                style={{ animationDelay:`${i*.08}s`, opacity:0 }}>
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor:event.color }}/>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-white group-hover:text-amber-300 transition-colors text-sm sm:text-base truncate">
                    {event.title}
                  </p>
                  {event.description && <p className="text-navy-400 text-xs mt-0.5 truncate">{event.description}</p>}
                  <p className="text-navy-400 text-xs mt-0.5">{event.duration} min · {event.location}</p>
                </div>
                <div className="text-navy-400 group-hover:text-white transition-colors shrink-0 text-lg">→</div>
              </Link>
            ))}
          </div>
        )}

        <p className="text-center text-navy-600 text-xs mt-8">
          Powered by <Link href="/" className="text-navy-500 hover:text-white transition-colors">SchedulrX</Link>
        </p>
      </div>
    </div>
  );
}
