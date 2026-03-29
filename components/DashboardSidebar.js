'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import {
  LayoutDashboard, Calendar, Clock, BookOpen,
  Settings, LogOut, Link as LinkIcon, Menu, X, CalendarDays,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard',              label: 'Overview',      icon: LayoutDashboard },
  { href: '/dashboard/events',       label: 'Event Types',   icon: Calendar },
  { href: '/dashboard/availability', label: 'Availability',  icon: Clock },
  { href: '/dashboard/bookings',     label: 'Bookings',      icon: BookOpen },
  { href: '/dashboard/calendar',     label: 'Calendar Sync', icon: CalendarDays },
  { href: '/dashboard/settings',     label: 'Settings',      icon: Settings },
];

export default function DashboardSidebar({ user }) {
  const pathname     = usePathname();
  const [open, setOpen] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 mb-8">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-sm text-navy-900"
          style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)' }}>X</div>
        <span className="font-display font-bold text-lg text-white tracking-tight">SchedulrX</span>
      </div>

      {/* User card */}
      <div className="px-4 mb-5">
        <div className="glass-card-light p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#2d4696,#1e3178)' }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-navy-400 text-xs truncate">@{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Booking page link */}
      <div className="px-5 mb-4">
        <a href={`/${user?.username}`} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 transition-colors">
          <LinkIcon size={12} /><span className="truncate">Your booking page ↗</span>
        </a>
      </div>

      {/* Nav */}
      <nav className="px-2 space-y-0.5 flex-1">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`nav-item ${active ? 'active' : ''}`}
              onClick={() => setOpen(false)}>
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-2 pb-6 mt-4">
        <button onClick={() => setShowSignOutDialog(true)}
          className="nav-item w-full text-red-400 hover:bg-red-500/10 hover:text-red-300">
          <LogOut size={17} /><span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Sign Out Confirm Dialog */}
      {showSignOutDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowSignOutDialog(false)} />
          <div className="relative z-10 rounded-2xl p-6 w-80 shadow-2xl"
            style={{ background: 'rgba(10,15,30,0.97)', border: '1px solid rgba(82,113,195,0.25)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
                <LogOut size={18} className="text-red-400" />
              </div>
              <h3 className="text-white font-semibold text-base">Sign Out</h3>
            </div>
            <p className="text-navy-400 text-sm mb-5">Are you sure you want to sign out of your account?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSignOutDialog(false)}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(82,113,195,0.2)' }}>
                Cancel
              </button>
              <button onClick={() => signOut({ callbackUrl: '/' })}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                style={{ background: 'rgba(239,68,68,0.8)' }}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 glass-card flex items-center justify-center rounded-xl"
        onClick={() => setOpen(v => !v)}>
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />
      )}

      <aside className={`lg:hidden fixed top-0 left-0 h-full w-64 z-50 flex flex-col pt-6 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'rgba(10,15,30,0.97)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(82,113,195,0.18)' }}>
        <SidebarContent />
      </aside>

      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-64 flex-col pt-6"
        style={{ background: 'rgba(10,15,30,0.97)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(82,113,195,0.18)' }}>
        <SidebarContent />
      </aside>
    </>
  );
}
