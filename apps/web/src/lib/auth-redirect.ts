import type { AuthUser } from '@visiblefix/shared/types';

function sanitizeNextPath(nextPath: string | null | undefined) {
  if (!nextPath || !nextPath.startsWith('/')) {
    return null;
  }

  if (nextPath.startsWith('//')) {
    return null;
  }

  return nextPath;
}

export function canAccessAdminDashboard(user: Pick<AuthUser, 'role'>) {
  return user.role === 'admin' || user.role === 'municipal_staff';
}

export function getDefaultSignedInPath(user: Pick<AuthUser, 'role'>) {
  return canAccessAdminDashboard(user) ? '/admin' : '/';
}

export function getPostAuthRedirectPath(user: Pick<AuthUser, 'role'>, nextPath?: string | null) {
  const safeNextPath = sanitizeNextPath(nextPath);

  if (safeNextPath?.startsWith('/admin')) {
    return canAccessAdminDashboard(user) ? safeNextPath : '/';
  }

  return safeNextPath || getDefaultSignedInPath(user);
}
