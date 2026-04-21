import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthUser } from '../../../../libs/shared/types/src';
import api from '../services/api';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  signIn: async () => undefined,
  signUp: async () => undefined,
  signOut: async () => undefined,
  refreshUser: async () => undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await api.hydrateSessionFromStorage();
        const currentUser = await api.getMe();
        setUser(currentUser);
      } catch {
        await api.clearSession();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      signIn: async (email, password) => {
        const currentUser = await api.signIn(email, password);
        setUser(currentUser);
      },
      signUp: async (input) => {
        const currentUser = await api.signUp(input);
        setUser(currentUser);
      },
      signOut: async () => {
        await api.signOut();
        setUser(null);
      },
      refreshUser: async () => {
        const currentUser = await api.getMe();
        setUser(currentUser);
      },
    }),
    [isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
