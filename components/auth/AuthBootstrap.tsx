'use client';

import { useEffect, useRef } from 'react';
import { setAuthHydrated, setCredentials, useAppDispatch, useAppSelector } from '@/redux';
import { clearStoredAuth, readStoredAuth, writeStoredAuth } from '@/lib/authStorage';

export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const hasRestored = useRef(false);
  const { accessToken, user, isHydrated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (hasRestored.current) {
      return;
    }

    hasRestored.current = true;

    const storedAuth = readStoredAuth();

    if (storedAuth.accessToken && storedAuth.user) {
      dispatch(
        setCredentials({
          accessToken: storedAuth.accessToken,
          user: storedAuth.user,
        })
      );
      return;
    }

    dispatch(setAuthHydrated());
  }, [dispatch]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (accessToken && user) {
      writeStoredAuth(accessToken, user);
      return;
    }

    clearStoredAuth();
  }, [accessToken, isHydrated, user]);

  return null;
}
