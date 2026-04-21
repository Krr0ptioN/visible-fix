import type { UserRole } from '@visiblefix/shared/types';

export interface RequestUser {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  municipalityId: number | null;
}
