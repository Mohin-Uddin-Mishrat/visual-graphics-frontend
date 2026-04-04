'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { setCredentials, useAppDispatch, useLoginMutation, useAppSelector } from '@/redux';
import { useToast } from '@/lib/toast';
import { writeStoredAuth } from '@/lib/authStorage';

function getErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return 'Login failed. Please try again.';
  }

  const maybeError = error as {
    data?: { message?: string };
  };

  return maybeError.data?.message || 'Login failed. Please check your credentials.';
}

export function LoginPageClient({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const { user } = useAppSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();
  const [formState, setFormState] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      router.replace(nextPath);
    }
  }, [nextPath, router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await login(formState).unwrap();
      const { accessToken, user } = response.data;

      dispatch(
        setCredentials({
          accessToken,
          user,
        })
      );
      writeStoredAuth(accessToken, user);

      addToast('Logged in successfully.', 'success');
      router.replace(nextPath);
    } catch (error) {
      addToast(getErrorMessage(error), 'error');
    }
  };

  return (
    <main className="flex min-h-screen items-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] px-4 py-12">
      <div className="mx-auto w-full max-w-xl">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">Sign In</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Use your email and password to open the admin area.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={formState.email}
                onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="admin@example.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={formState.password}
                onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Enter your password"
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Need to go back?{' '}
            <Link href="/" className="font-semibold text-blue-600 hover:text-blue-700">
              Return home
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
