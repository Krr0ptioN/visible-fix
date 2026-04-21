import type { MongoAbility } from '@casl/ability';

export enum Action {
  Manage = 'manage',
  Read = 'read',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
}

export type AppSubjects = 'Issue' | 'AdminDashboard' | 'User' | 'all';
export type AppAbility = MongoAbility<[Action, AppSubjects]>;
