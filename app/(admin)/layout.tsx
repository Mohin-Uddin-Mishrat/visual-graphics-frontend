'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAppSelector, useLogoutMutation } from '@/redux';
import { useToast } from '@/lib/toast';

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

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'List Of Asset', href: '/listOfAsset' },
    { name: 'Upload', href: '/upload' },
    { name: 'Orders', href: '/clientUploads' },
  ];

  const adminOnlyMenuItems = [
    { name: 'Users', href: '/users' },
    { name: 'Add User', href: '/users/new' },
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
      <div className="flex h-screen bg-gray-50">
        <aside className="flex w-72 flex-col bg-gray-900 text-white">
          <div className="border-b border-gray-800 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Vizual Graphics Ltd</p>
            <h1 className="mt-2 text-2xl font-bold">Admin Panel</h1>
          </div>

          <div className="border-b border-gray-800 px-6 py-5">
            <p className="text-sm font-semibold text-white">{user?.name || 'Authenticated User'}</p>
            <p className="mt-1 text-sm text-gray-400">{user?.email}</p>
            <p className="mt-3 inline-flex rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200">
              {user?.role || 'USER'}
            </p>
          </div>

          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block rounded-lg px-4 py-3 transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              {user?.role === 'ADMIN' &&
                adminOnlyMenuItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded-lg px-4 py-3 transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>

          <div className="border-t border-gray-800 p-6">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mb-4 inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? 'Signing out...' : 'Logout'}
            </button>
            <p className="text-xs text-gray-400">Protected with backend cookie auth.</p>
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
