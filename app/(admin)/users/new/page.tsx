'use client';

import { useState } from 'react';
import { AdminOnly } from '@/components/auth/AdminOnly';
import { useCreateUserMutation } from '@/redux';
import { useToast } from '@/lib/toast';

type FormState = {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
};

const initialFormState: FormState = {
  name: '',
  email: '',
  password: '',
  role: 'USER',
};

function getErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return 'Failed to create user. Please try again.';
  }

  const maybeError = error as {
    data?: {
      message?: string | string[];
    };
  };

  if (Array.isArray(maybeError.data?.message)) {
    return maybeError.data.message.join(', ');
  }

  return maybeError.data?.message || 'Failed to create user. Please try again.';
}

export default function AddUserPage() {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [createUser, { isLoading }] = useCreateUserMutation();
  const { addToast } = useToast();

  const handleChange =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormState((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await createUser(formState).unwrap();
      addToast(response.message || 'User created successfully.', 'success');
      setFormState(initialFormState);
    } catch (error) {
      addToast(getErrorMessage(error), 'error');
    }
  };

  return (
    <AdminOnly>
      <main className="min-h-full bg-[linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">Admin Users</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Add New User</h1>
            <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
              Create a new backend user account from the admin panel.
            </p>
          </div>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Full Name</span>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={handleChange('name')}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="John Doe"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <input
                  type="email"
                  required
                  value={formState.email}
                  onChange={handleChange('email')}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="john@example.com"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Role</span>
                <select
                  value={formState.role}
                  onChange={handleChange('role')}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </label>

              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formState.password}
                  onChange={handleChange('password')}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="StrongPassword123"
                />
                <p className="text-xs text-slate-500">Use a strong password with at least 8 characters.</p>
              </label>

              <div className="md:col-span-2 flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-sm text-slate-600">This sends a `POST` request to `/api/v1/auth/users` on your backend.</p>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isLoading ? 'Creating User...' : 'Create User'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </AdminOnly>
  );
}
