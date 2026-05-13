'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthUser } from '@visiblefix/shared/types';

type AuthResponse = {
  data?: AuthUser;
  message?: string;
};

export const authQueryKeys = {
  currentUser: ['auth', 'current-user'] as const,
};

async function parseAuthResponse(response: Response) {
  return (await response.json().catch(() => null)) as AuthResponse | null;
}

export async function fetchCurrentUser() {
  const response = await fetch('/api/v1/auth/me', {
    credentials: 'include',
    headers: {
      accept: 'application/json',
    },
  });

  if (response.status === 401) return null;
  if (!response.ok) return null;

  const body = await parseAuthResponse(response);
  return body?.data ?? null;
}

export async function signIn(input: { email: string; password: string }) {
  const response = await fetch('/api/v1/auth/sign-in', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const body = await parseAuthResponse(response);
  if (!response.ok || !body?.data) {
    throw new Error(body?.message || 'Unable to sign in.');
  }

  return body.data;
}

export async function signUp(input: { name: string; email: string; password: string }) {
  const response = await fetch('/api/v1/auth/sign-up', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const body = await parseAuthResponse(response);
  if (!response.ok || !body?.data) {
    throw new Error(body?.message || 'Unable to create your account.');
  }

  return body.data;
}

export function useCurrentUserQuery(initialUser?: AuthUser | null) {
  return useQuery({
    queryKey: authQueryKeys.currentUser,
    queryFn: fetchCurrentUser,
    enabled: initialUser === undefined,
    initialData: initialUser,
  });
}

export function useSignInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signIn,
    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKeys.currentUser, user);
    },
  });
}

export function useSignUpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signUp,
    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKeys.currentUser, user);
    },
  });
}
