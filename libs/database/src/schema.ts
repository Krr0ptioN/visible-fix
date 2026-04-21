import { pgTable, serial, text, timestamp, integer, boolean, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';

export const issueStatusEnum = pgEnum('issue_status', [
  'reported',
  'acknowledged',
  'in_progress',
  'resolved',
  'rejected'
]);

export const issueCategoryEnum = pgEnum('issue_category', [
  'pothole',
  'streetlight',
  'waste',
  'sidewalk',
  'water_leak',
  'accessibility',
  'other'
]);

export const issues = pgTable('issues', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: issueCategoryEnum('category').notNull().default('other'),
  status: issueStatusEnum('status').notNull().default('reported'),
  imageUrl: text('image_url'),
  latitude: integer('latitude').notNull(),
  longitude: integer('longitude').notNull(),
  address: text('address'),
  municipalityId: integer('municipality_id').notNull(),
  userId: integer('user_id'), // Nullable for anonymous reports
  deviceId: text('device_id'), // For anonymous device tracking
  acknowledgedAt: timestamp('acknowledged_at'),
  inProgressAt: timestamp('in_progress_at'),
  resolvedAt: timestamp('resolved_at'),
  rejectedAt: timestamp('rejected_at'),
  rejectReason: text('reject_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const upvotes = pgTable('upvotes', {
  id: serial('id').primaryKey(),
  issueId: integer('issue_id').notNull().references(() => issues.id, { onDelete: 'cascade' }),
  deviceId: text('device_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  issueDeviceUnique: uniqueIndex('upvotes_issue_device_unique').on(table.issueId, table.deviceId),
}));

export const municipalities = pgTable('municipalities', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull(), // e.g., "06-001"
  region: text('region').notNull(),
  province: text('province').notNull(),
  population: integer('population'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role').notNull().default('citizen'), // citizen, municipal_staff, admin
  passwordHash: text('password_hash'),
  municipalityId: integer('municipality_id').references(() => municipalities.id),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const authSessions = pgTable('auth_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  refreshTokenHash: text('refresh_token_hash').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;
export type Municipality = typeof municipalities.$inferSelect;
export type User = typeof users.$inferSelect;
export type Upvote = typeof upvotes.$inferSelect;
export type AuthSession = typeof authSessions.$inferSelect;
