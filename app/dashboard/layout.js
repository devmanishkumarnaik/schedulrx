import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-navy-900">
      <DashboardSidebar user={session.user} />
      {/* Offset for sidebar on desktop, top bar on mobile */}
      <main className="lg:ml-64 min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 pt-16 lg:pt-8 pb-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
