import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Event from '@/models/Event';
import BookingFlow from '@/components/BookingFlow';

export async function generateMetadata({ params }) {
  await connectDB();
  const user  = await User.findOne({ username: params.username });
  const event = user ? await Event.findOne({ userId: user._id, slug: params.eventSlug }) : null;
  if (!user || !event) return { title: 'Not found' };
  return { title: `Book: ${event.title} with ${user.name} — SchedulrX` };
}

export default async function BookingPage({ params }) {
  await connectDB();
  const user = await User.findOne({ username: params.username });
  if (!user) notFound();

  const event = await Event.findOne({ userId: user._id, slug: params.eventSlug, isActive: true });
  if (!event) notFound();

  return (
    <BookingFlow
      user={{ name: user.name, username: user.username, bio: user.bio, timezone: user.timezone }}
      event={{
        id:          event._id.toString(),
        title:       event.title,
        description: event.description,
        duration:    event.duration,
        color:       event.color,
        location:    event.location,
        slug:        event.slug,
      }}
    />
  );
}
