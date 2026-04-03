'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux';

export function AdminOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isHydrated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [isHydrated, router, user]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Checking access</h1>
          <p className="mt-2 text-sm text-slate-600">Please wait while we verify your permissions.</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
}
