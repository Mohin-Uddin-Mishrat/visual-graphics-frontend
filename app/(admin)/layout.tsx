'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import {
  FiBarChart2,
  FiChevronRight,
  FiGrid,
  FiKey,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiUploadCloud,
  FiUserPlus,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAppSelector, useLogoutMutation } from '@/redux';
import { useToast } from '@/lib/toast';

type MenuItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const AdminLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { addToast } = useToast();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems: MenuItem[] = [
    { name: 'My Profile', href: '/account', icon: FiKey },
    { name: 'Overview', href: '/dashboard', icon: FiBarChart2 },
    { name: 'Asset Library', href: '/listOfAsset', icon: FiGrid },
    { name: 'Upload Center', href: '/upload', icon: FiUploadCloud },
    { name: 'Client Orders', href: '/clientUploads', icon: FiPackage },
  ];

  const adminOnlyMenuItems: MenuItem[] = [
    { name: 'Team Access', href: '/users', icon: FiUsers },
    { name: 'Invite Member', href: '/users/new', icon: FiUserPlus },
  ];

  const isActive = (href: string) => pathname === href;

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      addToast('Logged out successfully.', 'success');
      closeMobileMenu();
      router.replace('/login');
    } catch {
      addToast('Logout failed. Your local session was cleared.', 'info');
      closeMobileMenu();
      router.replace('/login');
    }
  };

  const renderNavLink = (item: MenuItem) => (
    <li key={item.href}>
      <Link
        href={item.href}
        onClick={closeMobileMenu}
        className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
          isActive(item.href)
            ? 'border-blue-400/30 bg-[linear-gradient(135deg,_rgba(37,99,235,0.98),_rgba(59,130,246,0.9))] text-white shadow-[0_16px_30px_rgba(37,99,235,0.32)]'
            : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/6 hover:text-white'
        }`}
      >
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition ${
            isActive(item.href)
              ? 'bg-white/14 text-white'
              : 'bg-white/6 text-slate-300 group-hover:bg-white/10 group-hover:text-white'
          }`}
        >
          <item.icon className="h-[18px] w-[18px]" />
        </span>
        <span className="flex-1">{item.name}</span>
        <FiChevronRight className="h-4 w-4 text-white/40" />
      </Link>
    </li>
  );

  const sidebarContent = (
    <>
      <div className="border-b border-white/10 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/90">Vizual Graphics Ltd</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Control Center</h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">Workspace</p>
        <ul className="mt-3 space-y-2">{menuItems.map(renderNavLink)}</ul>

        {user?.role === 'ADMIN' && (
          <>
            <p className="mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">Administration</p>
            <ul className="mt-3 space-y-2">{adminOnlyMenuItems.map(renderNavLink)}</ul>
          </>
        )}
      </nav>

      <div className="border-t border-white/10 p-6">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiLogOut className="h-4 w-4" />
          {isLoggingOut ? 'Signing out...' : 'Logout'}
        </button>
        <p className="text-xs text-slate-500">Protected with secure backend cookie authentication.</p>
      </div>
    </>
  );

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-100">
        <aside className="hidden w-72 shrink-0 flex-col bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#111827_42%,_#020617_100%)] text-white shadow-[20px_0_60px_rgba(15,23,42,0.18)] lg:flex">
          {sidebarContent}
        </aside>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"
              onClick={closeMobileMenu}
            />
            <aside className="relative flex h-full w-[88vw] max-w-[340px] flex-col bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#111827_42%,_#020617_100%)] text-white shadow-[20px_0_60px_rgba(15,23,42,0.24)]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/90">Vizual Graphics Ltd</p>
                  <p className="mt-1 text-sm font-semibold text-white">Navigation</p>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={closeMobileMenu}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              {sidebarContent}
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 overflow-x-hidden">
          <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-600">Vizual Graphics Ltd</p>
                <h2 className="truncate text-lg font-bold text-slate-900">Control Center</h2>
              </div>
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setIsMobileMenuOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm"
              >
                <FiMenu className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="px-4 py-5 sm:px-6 lg:p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
};

export default AdminLayout;
