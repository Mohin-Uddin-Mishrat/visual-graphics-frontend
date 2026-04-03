'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux';

type AuthGuardProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isHydrated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace('/');
    }
  }, [allowedRoles, isHydrated, pathname, router, user]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] px-6">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Vizual Graphics Ltd</p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Checking your session</h1>
          <p className="mt-2 text-sm text-slate-600">Please wait while we verify your access.</p>
        </div>
      </div>
    );
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
