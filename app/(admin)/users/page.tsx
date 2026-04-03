'use client';

import { useMemo, useState } from 'react';
import { AdminOnly } from '@/components/auth/AdminOnly';
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserPasswordMutation,
  useUpdateUserRoleMutation,
} from '@/redux';
import { useToast } from '@/lib/toast';

type EditableState = {
  role: 'ADMIN' | 'USER';
  password: string;
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

export default function UsersPage() {
  const { data, isLoading, isError } = useGetUsersQuery();
  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();
  const [updateUserPassword, { isLoading: isUpdatingPassword }] = useUpdateUserPasswordMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const { addToast } = useToast();
  const [editState, setEditState] = useState<Record<string, EditableState>>({});

  const users = useMemo(() => data?.data ?? [], [data]);

  const getRowState = (id: string, role: string): EditableState =>
    editState[id] ?? {
      role: role === 'ADMIN' ? 'ADMIN' : 'USER',
      password: '',
    };

  const updateRowState = (id: string, nextState: Partial<EditableState>, role: string) => {
    setEditState((current) => ({
      ...current,
      [id]: {
        ...getRowState(id, role),
        ...nextState,
      },
    }));
  };

  const handleRoleSave = async (id: string, role: 'ADMIN' | 'USER') => {
    try {
      const response = await updateUserRole({ id, role }).unwrap();
      addToast(response.message || 'User role updated successfully.', 'success');
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to update user role.'), 'error');
    }
  };

  const handlePasswordSave = async (id: string, password: string, role: string) => {
    if (!password.trim()) {
      addToast('Enter a new password before saving.', 'info');
      return;
    }

    try {
      const response = await updateUserPassword({ id, newPassword: password }).unwrap();
      addToast(response.message || 'User password updated successfully.', 'success');
      updateRowState(id, { password: '' }, role);
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to update user password.'), 'error');
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`Delete user ${email}?`)) {
      return;
    }

    try {
      const response = await deleteUser(id).unwrap();
      addToast(response.message || 'User deleted successfully.', 'success');
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to delete user.'), 'error');
    }
  };

  return (
    <AdminOnly>
      <main className="min-h-full bg-[linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_rgba(37,99,235,0.12),_rgba(56,189,248,0.08)_42%,_rgba(168,85,247,0.14))] px-6 py-7 shadow-[0_24px_80px_rgba(59,130,246,0.12)] sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">Admin Users</p>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Manage Users</h1>
                <p className="max-w-3xl text-sm text-slate-600 sm:text-base">
                  Review all users and update role, password, or delete accounts from one place.
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Team Members</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{users.length}</p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            {isLoading && <div className="p-6 text-center text-slate-600">Loading users...</div>}
            {isError && <div className="p-6 text-center text-red-600">Failed to load users.</div>}

            {!isLoading && !isError && (
              <>
                <div className="divide-y divide-slate-100 md:hidden">
                  {users.map((user) => {
                    const rowState = getRowState(user.id, user.role);

                    return (
                      <article key={user.id} className="space-y-4 bg-[linear-gradient(180deg,_rgba(255,255,255,1),_rgba(248,250,252,0.94))] p-4">
                        <div className="flex flex-col gap-2">
                          <div>
                            <p className="text-base font-semibold text-slate-900">{user.name}</p>
                            <p className="text-sm text-slate-600">{user.email}</p>
                          </div>
                          <span
                            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                              user.role === 'ADMIN'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>

                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Edit Role</p>
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <select
                                value={rowState.role}
                                onChange={(event) =>
                                  updateRowState(
                                    user.id,
                                    { role: event.target.value as 'ADMIN' | 'USER' },
                                    user.role
                                  )
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                              >
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleRoleSave(user.id, rowState.role)}
                                disabled={isUpdatingRole}
                                className="rounded-xl bg-[linear-gradient(135deg,_#2563eb,_#0ea5e9)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.2)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:bg-slate-300"
                              >
                                Save
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Edit Password</p>
                            <div className="flex flex-col gap-2">
                              <input
                                type="password"
                                value={rowState.password}
                                onChange={(event) =>
                                  updateRowState(user.id, { password: event.target.value }, user.role)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                placeholder="New password"
                              />
                              <button
                                type="button"
                                onClick={() => handlePasswordSave(user.id, rowState.password, user.role)}
                                disabled={isUpdatingPassword}
                                className="rounded-xl bg-[linear-gradient(135deg,_#0f172a,_#334155)] px-4 py-2 text-sm font-semibold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:bg-slate-300"
                              >
                                Update Password
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(user.id, user.email)}
                          disabled={isDeleting}
                          className="w-full rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete User
                        </button>
                      </article>
                    );
                  })}

                  {users.length === 0 && <div className="p-6 text-center text-slate-600">No users found.</div>}
                </div>

                <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-[linear-gradient(180deg,_#f8fbff,_#f1f5f9)]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Edit Role</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Edit Password</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => {
                      const rowState = getRowState(user.id, user.role);

                      return (
                        <tr key={user.id} className="align-top transition hover:bg-sky-50/40">
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900">{user.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                user.role === 'ADMIN'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex min-w-48 items-center gap-2">
                              <select
                                value={rowState.role}
                                onChange={(event) =>
                                  updateRowState(
                                    user.id,
                                    { role: event.target.value as 'ADMIN' | 'USER' },
                                    user.role
                                  )
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                              >
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleRoleSave(user.id, rowState.role)}
                                disabled={isUpdatingRole}
                                className="rounded-xl bg-[linear-gradient(135deg,_#2563eb,_#0ea5e9)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.16)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:bg-slate-300"
                              >
                                Save
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex min-w-64 items-center gap-2">
                              <input
                                type="password"
                                value={rowState.password}
                                onChange={(event) =>
                                  updateRowState(user.id, { password: event.target.value }, user.role)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                placeholder="New password"
                              />
                              <button
                                type="button"
                                onClick={() => handlePasswordSave(user.id, rowState.password, user.role)}
                                disabled={isUpdatingPassword}
                                className="rounded-xl bg-[linear-gradient(135deg,_#0f172a,_#334155)] px-4 py-2 text-sm font-semibold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:bg-slate-300"
                              >
                                Update
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDelete(user.id, user.email)}
                              disabled={isDeleting}
                              className="rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>

                {users.length === 0 && <div className="hidden p-6 text-center text-slate-600 md:block">No users found.</div>}
              </>
            )}
          </section>
        </div>
      </main>
    </AdminOnly>
  );
}
