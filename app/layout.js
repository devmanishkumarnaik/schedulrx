import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import SessionProvider from '@/components/SessionProvider';
import './globals.css';

export const metadata = {
  title: 'SchedulrX — Smart Scheduling, Simplified',
  description: 'Book meetings without the back-and-forth. Share your SchedulrX link and let others pick a time that works.',
  keywords: 'scheduling, calendar, meetings, appointments, booking',
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        {/* Google Fonts via standard link — avoids next/font ESM Windows bug */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-navy-900 text-white antialiased">
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
