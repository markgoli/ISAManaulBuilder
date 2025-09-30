'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, loginApi, logoutApi, meApi, updateProfileApi, changePasswordApi, UpdateProfilePayload, ensureCsrf } from '../lib/api';

type AuthContextState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  changePassword: (old_password: string, new_password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const me = await meApi();
      setUser(me);
      setError(null);
    } catch (e: any) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await ensureCsrf();
      } catch {}
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    try {
      const me = await loginApi(username, password);
      setUser(me);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Login failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutApi();
      setUser(null);
      setError(null);
      // Redirect to login page after successful logout
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (e: any) {
      setError(e.message || 'Logout failed');
      console.error('Logout error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    await updateProfileApi(payload);
    await refresh();
  }, [refresh]);

  const changePassword = useCallback(async (old_password: string, new_password: string) => {
    await changePasswordApi(old_password, new_password);
  }, []);

  const value: AuthContextState = { user, loading, error, login, logout, refresh, updateProfile, changePassword };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


