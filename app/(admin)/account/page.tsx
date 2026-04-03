'use client';

import { useState } from 'react';
import { FiKey, FiSave, FiShield, FiUser } from 'react-icons/fi';
import {
  useAppSelector,
  useChangeOwnPasswordMutation,
  useUpdateOwnProfileMutation,
} from '@/redux';
import { useToast } from '@/lib/toast';

type ProfileFormState = {
  name: string;
  email: string;
};

type PasswordFormState = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== 'object' || error === null) {
    return fallback;
  }

  const maybeError = error as {
    data?: {
      message?: string | string[];
    };
  };

  if (Array.isArray(maybeError.data?.message)) {
    return maybeError.data.message.join(', ');
  }

  return maybeError.data?.message || fallback;
}

export default function AccountPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { addToast } = useToast();
  const [updateOwnProfile, { isLoading: isSavingProfile }] = useUpdateOwnProfileMutation();
  const [changeOwnPassword, { isLoading: isSavingPassword }] = useChangeOwnPasswordMutation();
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    name: user?.name ?? '',
    email: user?.email ?? '',
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange =
    (field: keyof ProfileFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setProfileForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handlePasswordChange =
    (field: keyof PasswordFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user?.id) {
      addToast('Your session is missing user details. Please sign in again.', 'error');
      return;
    }

    try {
      const response = await updateOwnProfile({
        id: user.id,
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
      }).unwrap();

      addToast(response.message || 'Your account details were updated.', 'success');
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to update your account.'), 'error');
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user?.id) {
      addToast('Your session is missing user details. Please sign in again.', 'error');
      return;
    }

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      addToast('Fill in all password fields before saving.', 'info');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      addToast('Use a new password with at least 8 characters.', 'info');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('The new password and confirmation do not match.', 'info');
      return;
    }

    try {
      const response = await changeOwnPassword({
        id: user.id,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();

      addToast(response.message || 'Your password was updated successfully.', 'success');
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to update your password.'), 'error');
    }
  };

  return (
    <main className="min-h-full bg-[linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_rgba(37,99,235,0.12),_rgba(14,165,233,0.08)_42%,_rgba(168,85,247,0.14))] px-6 py-7 shadow-[0_24px_80px_rgba(59,130,246,0.12)] sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">Account Settings</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">My Profile</h1>
              <p className="max-w-3xl text-sm text-slate-600 sm:text-base">
                Keep your account details current and update your password whenever you need to.
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Account Role</p>
              <p className="mt-1 text-xl font-black text-slate-900">{user?.role || 'USER'}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(239,246,255,0.8))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-[0_14px_26px_rgba(59,130,246,0.28)]">
                <FiUser className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">Profile Details</h2>
                <p className="text-sm text-slate-600">Update the name and email tied to your account.</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="mt-8 grid gap-6">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Full Name</span>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={handleProfileChange('name')}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="John Doe"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Email Address</span>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={handleProfileChange('email')}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="john@example.com"
                />
              </label>

              <div className="flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">Changes here update your own account details.</p>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#2563eb,_#06b6d4)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(37,99,235,0.22)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
                >
                  <FiSave className="h-4 w-4" />
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(245,243,255,0.82))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_14px_26px_rgba(139,92,246,0.28)]">
                <FiKey className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">Password</h2>
                <p className="text-sm text-slate-600">Use your current password before setting a new one.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="mt-8 grid gap-5">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Current Password</span>
                <input
                  type="password"
                  required
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange('oldPassword')}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  placeholder="OldPassword123"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">New Password</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange('newPassword')}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  placeholder="NewPassword123"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Confirm New Password</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange('confirmPassword')}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  placeholder="Repeat your new password"
                />
              </label>

              <div className="rounded-2xl border border-violet-100 bg-[linear-gradient(135deg,_rgba(237,233,254,0.95),_rgba(243,232,255,0.88))] px-4 py-4">
                <div className="flex items-start gap-3">
                  <FiShield className="mt-0.5 h-4 w-4 text-violet-600" />
                  <p className="text-sm text-violet-800">
                    Your password update is applied only to your own account after your current password is verified.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingPassword}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#7c3aed,_#d946ef)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(139,92,246,0.24)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <FiKey className="h-4 w-4" />
                {isSavingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
