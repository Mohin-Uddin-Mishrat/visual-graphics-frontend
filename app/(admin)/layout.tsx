'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import {
  FiBarChart2,
  FiGrid,
  FiKey,
  FiLogOut,
  FiPackage,
  FiUploadCloud,
  FiUserPlus,
  FiUsers,
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

  const menuItems: MenuItem[] = [
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

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      addToast('Logged out successfully.', 'success');
      router.replace('/login');
    } catch {
      addToast('Logout failed. Your local session was cleared.', 'info');
      router.replace('/login');
    }
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-slate-100">
        <aside className="flex w-72 flex-col bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#111827_42%,_#020617_100%)] text-white shadow-[20px_0_60px_rgba(15,23,42,0.18)]">
          <div className="border-b border-white/10 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/90">Visual Graphics</p>
          </div>

          <div className="border-b border-white/10 px-6 py-5">
            <p className="text-sm font-semibold text-white">{user?.name || 'Authenticated User'}</p>
            <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
            <p className="mt-3 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-200">
              {user?.role || 'USER'}
            </p>
            <Link
              href="/account"
              className={`mt-4 flex items-center justify-between rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                isActive('/account')
                  ? 'border-blue-400/30 bg-blue-500/12 text-white'
                  : 'border-white/10 bg-white/6 text-slate-200 hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-white'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/8">
                  <FiKey className="h-3.5 w-3.5" />
                </span>
                My Profile
              </span>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Open</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-6">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">Workspace</p>
            <ul className="mt-3 space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
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
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {user?.role === 'ADMIN' && (
              <>
                <p className="mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">Administration</p>
                <ul className="mt-3 space-y-2">
                  {adminOnlyMenuItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
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
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
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
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
};

export default AdminLayout;
