import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import type { AdminIssueFilters, AdminOverview, ApiResponse, AuthUser, Issue } from '@visiblefix/shared/types';
import { parseApiResponse, serverApiRequest } from './server-api';

function redirectForAuthStatus(status: number) {
  if (status === 401) {
    redirect('/sign-in?next=%2Fadmin');
  }

  if (status === 403) {
    redirect('/');
  }
}

export const getAdminSession = cache(async (): Promise<AuthUser | null> => {
  const response = await serverApiRequest('/api/v1/auth/me');

  if (response.status === 401) {
    return null;
  }

  redirectForAuthStatus(response.status);

  const body = await parseApiResponse<AuthUser>(response);
  return body.data;
});

export const getAdminOverview = cache(async (): Promise<AdminOverview> => {
  const response = await serverApiRequest('/api/v1/admin/overview');
  redirectForAuthStatus(response.status);

  const body = await parseApiResponse<AdminOverview>(response);
  return body.data;
});

export async function getAdminIssues(filters: AdminIssueFilters) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.category) {
    params.set('category', filters.category);
  }

  if (filters.q?.trim()) {
    params.set('q', filters.q.trim());
  }

  if (filters.page) {
    params.set('page', String(filters.page));
  }

  if (filters.limit) {
    params.set('limit', String(filters.limit));
  }

  const query = params.toString();
  const response = await serverApiRequest(`/api/v1/admin/issues${query ? `?${query}` : ''}`);
  redirectForAuthStatus(response.status);

  return parseApiResponse<Issue[]>(response) as Promise<ApiResponse<Issue[]>>;
}
