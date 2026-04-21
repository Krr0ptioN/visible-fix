import 'server-only';

import { cache } from 'react';
import type { AuthUser } from '@visiblefix/shared/types';
import { parseApiResponse, serverApiRequest } from './server-api';

export const getCurrentSession = cache(async (): Promise<AuthUser | null> => {
  const response = await serverApiRequest('/api/v1/auth/me');

  if (response.status === 401) {
    return null;
  }

  const body = await parseApiResponse<AuthUser>(response);
  return body.data;
});
