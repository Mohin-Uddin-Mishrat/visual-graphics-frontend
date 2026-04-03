'use client';

import type { AuthUser } from '@/redux';

const ACCESS_TOKEN_KEY = 'vg_access_token';
const USER_KEY = 'vg_auth_user';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function readStoredAuth() {
  if (!isBrowser()) {
    return {
      accessToken: null,
      user: null,
    };
  }

  const accessToken = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  const rawUser = window.sessionStorage.getItem(USER_KEY);

  if (!accessToken || !rawUser) {
    return {
      accessToken: null,
      user: null,
    };
  }

  try {
    return {
      accessToken,
      user: JSON.parse(rawUser) as AuthUser,
    };
  } catch {
    clearStoredAuth();
    return {
      accessToken: null,
      user: null,
    };
  }
}

export function writeStoredAuth(accessToken: string, user: AuthUser) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(USER_KEY);
}
