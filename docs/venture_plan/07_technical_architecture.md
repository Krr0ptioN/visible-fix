# DELIVERABLE 7 — Technical Architecture

## Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐ │
│  │   Pages     │  │  Components  │  │     State/Queries         │ │
│  │  /map       │  │  /ui         │  │     React Query +         │ │
│  │  /report    │  │  /map        │  │     Zustand                │ │
│  │  /issue     │  │  /issue      │  │                            │ │
│  └─────────────┘  └─────────────┘  └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND (NestJS)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐  │
│  │  REST API   │  │  Services   │  │     Drizzle ORM          │  │
│  │  /issues    │  │  Issue      │  │     + PostgreSQL         │  │
│  │  /upvotes   │  │  Upvote     │  │                            │  │
│  │  /admin     │  │  Auth       │  │                            │  │
│  └─────────────┘  └─────────────┘  └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐   │
│  │  Supabase   │  │ Cloudflare  │  │     Mapbox/Leaflet       │   │
│  │  PostgreSQL │  │    R2       │  │     (tiles)              │   │
│  └─────────────┘  └─────────────┘  └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Monorepo Structure (Nx)

### Workspace Layout
```
visiblefix/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/       # App router pages
│   │   │   ├── components/# Shared components
│   │   │   ├── lib/       # Utilities, hooks
│   │   │   └── styles/    # Global styles
│   │   ├── public/        # Static assets
│   │   └── next.config.ts
│   │
│   ├── mobile/            # React Native mobile app
│   │   ├── src/
│   │   │   ├── app/        # Navigation/screens
│   │   │   ├── components/ # Shared components
│   │   │   ├── hooks/      # Custom hooks
│   │   │   ├── lib/       # Utils
│   │   │   └── assets/    # Images, fonts
│   │   ├── app.json
│   │   ├── babel.config.js
│   │   └── index.js
│   │
│   └── api/              # NestJS backend
│       ├── src/
│       │   ├── issues/   # Issue module
│       │   ├── upvotes/   # Upvote module
│       │   ├── auth/     # Auth module (future)
│       │   ├── admin/    # Admin module
│       │   └── main.ts
│       └── nest-cli.json
│
├── libs/
│   ├── shared/
│   │   ├── types/        # Shared TypeScript types
│   │   └── utils/        # Shared utilities
│   │
│   ├── data-access/
│   │   └── api/         # API client, generated client
│   │
│   └── mobile-ui/        # Shared mobile components
│       └── components/   # React Native components
│
├── tools/
│   └── generators/      # Custom Nx generators
│
├── nx.json
├── package.json
├── tsconfig.base.json
└── .env.example
```

### Mobile App Structure (React Native + Expo)

| Component | Technology | Notes |
|-----------|------------|-------|
| Framework | Expo SDK 52 | Latest stable |
| Navigation | React Navigation v6 | Native stack + bottom tabs |
| Maps | react-native-maps | Google Maps/Apple Maps |
| State | React Query + Zustand | Same as web |
| Forms | React Hook Form | With Zod validation |
| Image Picker | expo-image-picker | Camera + gallery |
| Location | expo-location | GPS + geocoding |
| Notifications | expo-notifications | Push notifications |
| Storage | @react-native-async-storage/async-storage | Local storage |

### App and Lib Boundaries

| Category | Can Import | Notes |
|----------|------------|-------|
| apps/web | libs/*, apps/api | Frontend can use shared types |
| apps/mobile | libs/*, apps/api | Mobile can use shared types |
| apps/api | libs/shared/* | Backend can use shared types |
| libs/shared | No cross-lib imports | Only leaf utilities |
| libs/data-access | libs/shared/* | API client uses shared types |
| libs/mobile-ui | No external deps | Standalone RN components |

### Package Naming Convention
```
@visiblefix/web        # Frontend app
@visiblefix/api        # Backend app
@visiblefix/shared     # Shared utilities
@visiblefix/types      # Shared TypeScript types
@visiblefix/api-client # Generated API client
```

---

## Domain Modules

### Backend Module Structure (NestJS)

```
src/
├── main.ts                    # Application bootstrap
├── app.module.ts              # Root module
│
├── issues/                    # Issue domain
│   ├── issues.module.ts
│   ├── issues.controller.ts  # REST endpoints
│   ├── issues.service.ts      # Business logic
│   ├── issues.repository.ts   # Data access (Drizzle)
│   ├── dto/                   # Data transfer objects
│   │   ├── create-issue.dto.ts
│   │   └── update-status.dto.ts
│   └── entities/
│       └── issue.entity.ts
│
├── upvotes/                   # Upvote domain
│   ├── upvotes.module.ts
│   ├── upvotes.controller.ts
│   ├── upvotes.service.ts
│   └── upvotes.repository.ts
│
├── auth/                       # Auth domain (future)
│   ├── auth.module.ts
│   └── auth.service.ts
│
├── admin/                      # Admin domain
│   ├── admin.module.ts
│   ├── admin.controller.ts
│   └── admin.guard.ts          # Role-based guards
│
└── common/                     # Shared utilities
    ├── filters/
    ├── interceptors/
    └── decorators/
```

---

## Backend Services

### Issue Service Methods

| Method | HTTP | Description |
|--------|------|--------------|
| `createIssue()` | POST /issues | Create new issue |
| `getIssueById()` | GET /issues/:id | Get single issue |
| `getIssues()` | GET /issues | List with filters |
| `updateStatus()` | PATCH /issues/:id/status | Update issue status |
| `getIssuesByStatus()` | GET /issues?status=X | Filter by status |
| `searchIssues()` | GET /issues?search=X | Text search |

### Upvote Service Methods

| Method | HTTP | Description |
|--------|------|--------------|
| `createUpvote()` | POST /upvotes | Add upvote |
| `removeUpvote()` | DELETE /upvotes/:id | Remove upvote |
| `getUpvotesByIssue()` | GET /issues/:id/upvotes | Issue upvotes |

### Admin Service Methods

| Method | HTTP | Description |
|--------|------|--------------|
| `getAllIssues()` | GET /admin/issues | Full list for admin |
| `updateIssueStatus()` | PATCH /admin/issues/:id | Status update |
| `getStats()` | GET /admin/stats | Basic analytics |

---

## Data Model (Drizzle ORM + PostgreSQL)

### Schema

```typescript
// issues table
export const issues = pgTable('issues', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('reported'),
  imageUrl: varchar('image_url', { length: 500 }),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  address: varchar('address', { length: 500 }),
  reportedAt: timestamp('reported_at').defaultNow().notNull(),
  acknowledgedAt: timestamp('acknowledged_at'),
  inProgressAt: timestamp('in_progress_at'),
  resolvedAt: timestamp('resolved_at'),
  rejectedAt: timestamp('rejected_at'),
  rejectReason: text('reject_reason'),
  createdByDeviceId: varchar('created_by_device_id', { length: 100 }),
  cityId: varchar('city_id', { length: 50 }),
});

export const upvotes = pgTable('upvotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  issueId: uuid('issue_id').references(() => issues.id).notNull(),
  deviceId: varchar('device_id', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Indexes
export const issuesStatusIdx = index('issues_status_idx').on(issues.status);
export const issuesCategoryIdx = index('issues_category_idx').on(issues.category);
export const issuesLocationIdx = index('issues_location_idx').on(issues.latitude, issues.longitude);
export const upvotesIssueIdx = index('upvotes_issue_idx').on(upvotes.issueId);
```

### Status Enum
```typescript
export const IssueStatus = {
  REPORTED: 'reported',
  ACKNOWLEDGED: 'acknowledged', 
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
} as const;
```

### Category Enum
```typescript
export const IssueCategory = {
  POTHOLE: 'pothole',
  STREETLIGHT: 'streetlight',
  WASTE: 'waste',
  SIDEWALK: 'sidewalk',
  WATER_LEAK: 'water_leak',
  ACCESSIBILITY: 'accessibility',
  OTHER: 'other',
} as const;
```

---

## API Design (REST)

### Issue Endpoints

| Method | Endpoint | Request | Response |
|--------|-----------|---------|----------|
| POST | /api/v1/issues | {title, category, description, imageUrl, lat, lng, deviceId} | Issue |
| GET | /api/v1/issues | ?status, category, page, limit | Issue[] |
| GET | /api/v1/issues/:id | - | Issue |
| PATCH | /api/v1/issues/:id/status | {status, note?} | Issue |
| GET | /api/v1/issues/search | ?q, lat, lng, radius | Issue[] |

### Upvote Endpoints

| Method | Endpoint | Request | Response |
|--------|-----------|---------|----------|
| POST | /api/v1/upvotes | {issueId, deviceId} | Upvote |
| DELETE | /api/v1/upvotes/:id | - | {deleted} |
| GET | /api/v1/issues/:id/upvotes | - | Upvote[] |

### Admin Endpoints

| Method | Endpoint | Request | Response |
|--------|-----------|---------|----------|
| GET | /api/v1/admin/issues | ?status, category | Issue[] |
| PATCH | /api/v1/admin/issues/:id/status | {status, note} | Issue |
| GET | /api/v1/admin/stats | - | Stats |

### Response Formats

```typescript
// Success response
{
  success: true,
  data: Issue[],
  meta: {
    page: number,
    limit: number,
    total: number,
    hasMore: boolean
  }
}

// Error response
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR',
    message: string,
    details?: Record<string, any>
  }
}
```

---

## Event / Workflow Design

### Issue Lifecycle State Machine

```
REPORTED ──[acknowledge]──→ ACKNOWLEDGED ──[start]──→ IN_PROGRESS ──[resolve]──→ RESOLVED
   │                         │                      │                      │
   │                         │                      │                      │
   └─────[reject]──→ REJECTED←───[reject]────┘←──[reject]───────┘
```

### Workflow Implementation

| Trigger | Action | Side Effects |
|---------|--------|---------------|
| Issue created | Set status=REPORTED, reportedAt=NOW | - |
| Municipality acknowledges | Set status=ACKNOWLEDGED, acknowledgedAt=NOW | - |
| Municipality starts work | Set status=IN_PROGRESS, inProgressAt=NOW | - |
| Municipality resolves | Set status=RESOLVED, resolvedAt=NOW | - |
| Municipality rejects | Set status=REJECTED, rejectedAt=NOW, rejectReason=NOTE | - |

### Future Events (MVP+1)
- Send notification on status change
- Trigger email digest
- Update aggregation statistics

---

## Deployment Architecture

### Development
```
┌──────────────┐      ┌──────────────┐
│   Local      │      │   Local      │
│  Next.js     │──────│   NestJS     │
│  localhost   │      │   localhost  │
└──────────────┘      └──────────────┘
         │                   │
         ▼                   ▼
┌─────────────────────────────────────┐
│         Local PostgreSQL             │
│         (Docker)                    │
└─────────────────────────────────────┘
```

### Staging/Production
```
┌─────────────────────────────────────────────────────────┐
│                      Cloudflare                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Pages/    │  │    R2      │  │    Workers      │ │
│  │   CDN       │  │  (Images)  │  │   (Edge)       │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Render / Railway / VPS                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │  Next.js    │  │   NestJS   │  │    PostgreSQL  │   │
│  │  (SSR/API)  │  │  (API)     │  │    (Supabase)  │   │
│  └─────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Infrastructure Choices

| Service | Choice | Justification |
|----------|--------|---------------|
| Database | Supabase (PostgreSQL) | Free tier, managed, Drizzle compatible |
| Images | Cloudflare R2 | No egress fees, S3 compatible |
| Hosting | Render/Railway | Free tier, easy Next.js + NestJS |
| Maps | Mapbox | Best mobile SDK, or Leaflet (free) |
| Auth | NextAuth.js | Flexible, can add later |

---

## Security Basics

### Authentication Strategy (MVP)
- **No required auth** for reporting
- **Device ID** stored for upvote tracking (localStorage)
- **Future:** Email/password for "My Issues" feature

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| Anonymous | Report issues, view all, upvote |
| User (future) | All above + view own reports, comment |
| Municipal Staff | View assigned issues, update status |
| Admin | Full access, user management |

### Basic Security Measures

| Measure | Implementation |
|---------|----------------|
| Rate limiting | 10 requests/minute per IP |
| Input validation | Zod schemas on all endpoints |
| SQL injection | Drizzle ORM (parameterized) |
| XSS | React default escaping |
| CORS | Whitelist allowed origins |
| Environment variables | All secrets in .env |

---

## Privacy Considerations

### Data Handling

| Data | Storage | Retention | Access |
|------|---------|-----------|--------|
| Issue photos | R2/CDN | Indefinite | Public (URL) |
| Location | PostgreSQL | Indefinite | Public (map) |
| Device ID | PostgreSQL | 2 years | Internal only |
| Email (future) | PostgreSQL | User choice | Internal |

### Privacy Features
- Approximate location option (random offset 50-200m)
- No exact address stored, only coordinates
- GDPR-compliant export/delete (future)
- Clear privacy policy

---

## Rate Limiting / Abuse Controls

### Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /issues | 10 | Per IP, per hour |
| POST /upvotes | 50 | Per device, per hour |
| GET /issues | 100 | Per IP, per minute |

### Abuse Prevention

| Mechanism | Implementation |
|-----------|----------------|
| Duplicate detection | Same photo + location within 1 hour |
| Image moderation | Basic AI screening (future) |
| Device fingerprinting | Track repeat offenders |
| Manual moderation queue | Flagged content review |

---

## Moderation and Image Handling

### Image Upload Flow
```
User captures photo
       │
       ▼
Client compresses (< 5MB)
       │
       ▼
POST to /uploads endpoint
       │
       ▼
Server validates (type, size)
       │
       ▼
Upload to R2/S3
       │
       ▼
Return URL, store in issue
```

### Moderation Workflow
1. Auto-scan for explicit content (future)
2. User reports abuse → queue
3. Admin reviews → remove/keep
4. Notify user of action taken

---

## Status Transition Model

### State Transitions (Enforced in Service)

```typescript
const validTransitions = {
  reported: ['acknowledged', 'rejected'],
  acknowledged: ['in_progress', 'rejected'],
  in_progress: ['resolved', 'rejected'],
  resolved: [], // Terminal state
  rejected: [], // Terminal state
};

function canTransition(from: Status, to: Status): boolean {
  return validTransitions[from]?.includes(to) ?? false;
}
```

---

## Future Extensibility Path

### MVP → MVP+1
- Add user accounts (NextAuth)
- Add comments table
- Add notifications (Push + Email)

### MVP → MVP+2
- Add department routing
- Add integration APIs
- Add analytics dashboard

### Long-term
- Mobile native apps (React Native)
- AI issue classification
- Predictive maintenance ML
- Multi-city federation
