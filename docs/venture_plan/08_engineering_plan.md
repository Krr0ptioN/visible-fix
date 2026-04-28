# DELIVERABLE 8 — Engineering Plan

## Implementation Roadmap Overview

### Timeline (12 Weeks)

| Week | Phase | Focus |
|------|-------|-------|
| 1-2 | Setup | Project initialization, infrastructure |
| 3-4 | Backend Core | Database, API for issues |
| 5-6 | Frontend Core | Map, reporting flow |
| 7-8 | Features | Status tracking, upvotes |
| 9 | Polish | Edge cases, testing |
| 10 | Beta | Internal testing |
| 11-12 | Launch | Pilot deployment |

---

## Milestones

### Milestone 1: Project Foundation (Week 1-2)
- [ ] Initialize Nx monorepo
- [ ] Set up Next.js app in apps/web
- [ ] Set up NestJS app in apps/api
- [ ] Configure PostgreSQL (Supabase)
- [ ] Set up Drizzle ORM with schema
- [ ] Configure Cloudflare R2 for images
- [ ] Set up CI/CD pipeline

### Milestone 2: Backend API (Week 3-4)
- [ ] Implement issues CRUD API
- [ ] Implement upvotes API
- [ ] Add device ID tracking
- [ ] Add rate limiting
- [ ] Add input validation
- [ ] Write unit tests for services

### Milestone 3: Frontend Core (Week 5-6)
- [ ] Build map view with Mapbox
- [ ] Build issue reporting flow
- [ ] Build issue detail page
- [ ] Implement status display
- [ ] Add upvote functionality

### Milestone 4: Admin Features (Week 7-8)
- [ ] Build admin login
- [ ] Build issue management list
- [ ] Build status update workflow
- [ ] Add basic statistics

### Milestone 5: Polish & Launch (Week 9-12)
- [ ] Edge case handling
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Security audit
- [ ] Beta testing
- [ ] Pilot deployment

---

## Epics

### Epic 1: Infrastructure Setup
**Description:** Set up development environment and CI/CD

| Task | Estimate | Dependencies |
|------|----------|---------------|
| Initialize Nx workspace | 2h | - |
| Set up Next.js app | 4h | Nx workspace |
| Set up NestJS app | 4h | Nx workspace |
| Configure PostgreSQL | 2h | - |
| Configure Drizzle ORM | 4h | PostgreSQL |
| Configure image storage | 2h | - |
| Set up GitHub Actions | 4h | - |

### Epic 2: Issue API
**Description:** Build REST API for issue management

| Task | Estimate | Dependencies |
|------|----------|---------------|
| Define Drizzle schema | 4h | Database |
| Create issue service | 8h | Schema |
| Create issue controller | 4h | Service |
| Add validation (Zod) | 2h | Controller |
| Add rate limiting | 2h | Controller |
| Write unit tests | 8h | Service |

### Epic 3: Upvote API
**Description:** Build upvote functionality

| Task | Estimate | Dependencies |
|------|----------|---------------|
| Create upvote service | 4h | Issue API |
| Create upvote controller | 2h | Service |
| Add device tracking | 2h | - |
| Write unit tests | 4h | Service |

### Epic 4: Frontend Map
**Description:** Build public map view

| Task | Estimate | Dependencies |
|------|----------|---------------|
| Set up Mapbox | 4h | API ready |
| Create map component | 8h | Mapbox |
| Add issue pins | 4h | Map |
| Add clustering | 4h | Pins |
| Add filters | 4h | Pins |
| Add search | 2h | Map |

### Epic 5: Issue Reporting
**Description:** Build reporting flow

| Task | Estimate | Dependencies |
|------|----------|---------------|
| Create camera component | 8h | - |
| Create location picker | 4h | - |
| Create category selector | 2h | - |
| Build form flow | 4h | Components |
| Add image upload | 4h | Storage |
| Build confirmation UI | 2h | Form |

### Epic 6: Issue Detail
**Description:** Build issue detail page

| Task | Estimate | Dependencies |
|------|----------|---------------|
| Create detail layout | 4h | - |
| Create photo gallery | 4h | - |
| Create status timeline | 4h | - |
| Create upvote button | 2h | API |
| Create share button | 2h | - |

### Epic 7: Admin Dashboard
**Description:** Build municipal admin interface

| Task | Estimate | Dependencies |
|------|----------|---------------|
| Create auth guard | 4h | - |
| Create login page | 4h | Guard |
| Create issue list | 8h | API |
| Create status controls | 4h | API |
| Create stats view | 4h | API |

---

## Feature Breakdown

### Issue Reporting Flow

```
[Report Screen]
    │
    ├─→ CameraCapture: Open camera, capture photo
    │
    ├─→ LocationPicker: Auto-detect GPS, allow manual adjustment
    │
    ├─→ CategorySelector: 7 categories, single select
    │
    ├─→ DescriptionInput: Optional text field
    │
    └─→ SubmitHandler: POST to /api/v1/issues
```

### Map Interaction Flow

```
[Map Screen]
    │
    ├─→ MapView: Load all issues as pins
    │
    ├─→ PinTap: Open issue preview bottom sheet
    │
    ├─→ FilterChips: Filter by category/status
    │
    ├─→ SearchBar: Search by location
    │
    └─→ FAB: Navigate to report flow
```

### Admin Workflow

```
[Admin Dashboard]
    │
    ├─→ Login: Email/password auth
    │
    ├─→ IssueList: Paginated list, filters
    │
    ├─→ IssueRow: Show issue, status dropdown
    │
    └─→ StatusUpdate: PATCH to update status
```

---

## Technical Spikes

| Spike | Purpose | Duration | Output |
|-------|---------|----------|--------|
| Map provider | Evaluate Mapbox vs Leaflet | 4h | Decision + POC |
| Image upload | Verify R2 + upload flow | 4h | Working upload |
| Device ID | Test device fingerprinting | 2h | Method choice |
| Rate limiting | Test rate limit implementation | 2h | Config |
| Drizzle queries | Verify query performance | 4h | Optimized queries |

---

## Dependencies

### Build Dependencies
```
nx
@nx/next
@nx/nest
@nx/js
typescript
drizzle-orm
postgres
@mapbox/mapbox-gl
react-hook-form
zod
@tanstack/react-query
zustand
```

### Development Dependencies
```
eslint
prettier
jest
testing-library
cypress
```

---

## Sprint-Level Delivery Plan

### Sprint 1: Foundation (Week 1-2)

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Initialize Nx | Monorepo ready |
| 2 | Set up Next.js | App running |
| 3 | Set up NestJS | API running |
| 4-5 | Set up PostgreSQL + Drizzle | Schema ready |
| 6 | Configure image storage | Upload working |
| 7 | Set up CI/CD | Pipeline ready |

### Sprint 2: Backend Core (Week 3-4)

| Day | Task | Deliverable |
|-----|------|-------------|
| 8-9 | Issue service | CRUD working |
| 10 | Issue controller | Endpoints ready |
| 11 | Validation | Inputs validated |
| 12-13 | Upvote service | Upvoting works |
| 14 | Rate limiting | Protected API |

### Sprint 3: Frontend Core (Week 5-6)

| Day | Task | Deliverable |
|-----|------|-------------|
| 15-16 | Map setup | Map visible |
| 17 | Issue pins | Pins on map |
| 18 | Filters | Filtering works |
| 19-20 | Report form | Can submit |
| 21 | Detail page | Issue details |

### Sprint 4: Features & Polish (Week 7-8)

| Day | Task | Deliverable |
|-----|------|-------------|
| 22-23 | Status display | Timeline visible |
| 24 | Upvotes | Can upvote |
| 25-26 | Admin login | Auth works |
| 27-28 | Admin features | Status updates |

### Sprint 5: Launch Prep (Week 9-12)

| Day | Task | Deliverable |
|-----|------|-------------|
| 29-30 | Edge cases | Robust app |
| 31-32 | Testing | Bugs fixed |
| 33-34 | Beta test | Users testing |
| 35-36 | Launch | Pilot live |

---

## What Should Be Mocked First

| Feature | Mock Strategy | Rationale |
|---------|--------------|----------|
| Map data | Static JSON file | API not ready |
| Image upload | Local storage | R2 not configured |
| Location | Default coordinates | GPS may fail |
| Upvote counts | Static values | Backend not ready |
| Status timeline | Hardcoded dates | No data yet |

## What Should Be Real From Day One

| Feature | Implementation | Rationale |
|---------|---------------|------------|
| Form validation | Real Zod schemas | Prevent bad data |
| Error handling | Real error states | UX critical |
| Rate limiting | Real implementation | Security from start |
| Environment config | Real env setup | Avoid tech debt |
| Git hooks | Real husky/lint-staged | Code quality |

## What Should Be Deferred

| Feature | Deferred To | Reason |
|---------|-------------|--------|
| User accounts | MVP+1 | Not required for core value |
| Comments | MVP+1 | Engagement deepening |
| Notifications | MVP+1 | Complexity |
| Real-time updates | MVP+2 | Polling sufficient |
| Analytics dashboard | MVP+2 | Manual stats OK |
| Multi-city support | MVP+2 | Single city first |
| SMS/WhatsApp | MVP+2 | Not critical |

---

## Suggested Nx Workspace Layout

```
visiblefix/
├── apps/
│   ├── web/                    # Next.js frontend
│   └── api/                    # NestJS backend
├── libs/
│   ├── shared/
│   │   ├── types/              # @visiblefix/types
│   │   └── utils/              # @visiblefix/utils
│   └── data-access/
│       └── api-client/         # @visiblefix/api-client
├── tools/
│   └── generators/            # Custom generators
├── nx.json
├── package.json
├── tsconfig.base.json
├── drizzle.config.ts
└── .env.example
```

## Suggested Package Naming

| Package | Scope | Path |
|---------|-------|------|
| Frontend app | @visiblefix/web | apps/web |
| Backend app | @visiblefix/api | apps/api |
| Types | @visiblefix/types | libs/shared/types |
| Utils | @visiblefix/utils | libs/shared/utils |
| API Client | @visiblefix/api-client | libs/data-access/api-client |

---

## Backend Module Boundaries

```
apps/api/src/
├── main.ts                     # Bootstrap
├── app.module.ts               # Root
├── issues/                     # Feature module
│   ├── issues.module.ts
│   ├── issues.controller.ts    # REST
│   ├── issues.service.ts       # Business logic
│   ├── issues.repository.ts    # Drizzle queries
│   └── dto/
│       ├── create-issue.dto.ts
│       └── update-status.dto.ts
├── upvotes/
│   ├── upvotes.module.ts
│   ├── upvotes.controller.ts
│   ├── upvotes.service.ts
│   └── upvotes.repository.ts
├── admin/
│   ├── admin.module.ts
│   ├── admin.controller.ts
│   └── admin.guard.ts
└── common/
    ├── filters/
    ├── interceptors/
    └── decorators/
```

---

## Frontend Route Structure

```
apps/web/src/app/
├── layout.tsx                  # Root layout
├── page.tsx                    # Map home
├── globals.css                 # Tailwind imports
├── report/
│   └── page.tsx               # Report flow
├── issue/
│   └── [id]/
│       └── page.tsx           # Issue detail
├── my-issues/
│   └── page.tsx               # User's issues
└── admin/
    ├── login/
    │   └── page.tsx          # Admin login
    └── dashboard/
        └── page.tsx          # Admin view
```

## Component Architecture

```
components/
├── ui/                         # Base components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   └── Loading.tsx
├── map/                        # Map components
│   ├── MapView.tsx
│   ├── IssuePin.tsx
│   ├── MapControls.tsx
│   └── MapFilters.tsx
├── issue/                      # Issue components
│   ├── IssueCard.tsx
│   ├── IssueDetail.tsx
│   ├── IssueForm.tsx
│   ├── StatusBadge.tsx
│   ├── Timeline.tsx
│   ├── UpvoteButton.tsx
│   └── ShareButton.tsx
└── layout/
    ├── Header.tsx
    ├── BottomNav.tsx
    └── PageContainer.tsx
```

---

## State Management Approach

### Server State (React Query)
- Issue list fetching
- Issue detail fetching
- Upvote mutations
- Status updates

```typescript
// Example: useIssues hook
export function useIssues(filters: IssueFilters) {
  return useQuery({
    queryKey: ['issues', filters],
    queryFn: () => api.issues.list(filters),
  });
}
```

### Client State (Zustand)
- Current map viewport
- Active filters
- Draft issue form
- User session (device ID)

```typescript
// Example: useMapStore
const useMapStore = create<MapState>((set) => ({
  viewport: { lat: 38.4, lng: 27.1, zoom: 12 },
  setViewport: (viewport) => set({ viewport }),
  filters: { status: 'all', category: 'all' },
  setFilters: (filters) => set({ filters }),
}));
```

---

## Form Handling Approach

### React Hook Form + Zod

```typescript
// Issue creation form
const issueSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  category: z.enum(['pothole', 'streetlight', ...]),
  latitude: z.number(),
  longitude: z.number(),
  imageUrl: z.string().url(),
});

type IssueFormData = z.infer<typeof issueSchema>;
```

### Form Flow
1. Step 1: Photo capture
2. Step 2: Location confirmation
3. Step 3: Category + description
4. Step 4: Review + submit

---

## File Upload Approach

### Client-Side
1. Compress image (max 5MB)
2. Generate preview
3. POST to /api/uploads (get signed URL)
4. Upload directly to R2/S3
5. Get final URL, submit issue

### Server-Side
1. Validate file type
2. Validate file size
3. Scan for malware (future)
4. Generate unique filename
5. Store and return URL

---

## Map Integration Approach

### Option A: Mapbox GL JS
- Full-featured, excellent mobile support
- Requires API key, has costs at scale
- Better performance for many markers

### Option B: Leaflet + OpenStreetMap
- Free, open-source
- Slightly less polished mobile experience
- Adequate for MVP

### Recommendation: Start with Mapbox
- Better mobile SDK
- Better clustering
- More professional look
- Free tier sufficient for MVP

### Key Components
```typescript
// Map wrapper with issue pins
<MapView
  issues={issues}
  onPinClick={handlePinClick}
  onClusterClick={handleClusterClick}
/>

// Custom pin component
<IssuePin
  status={issue.status}
  category={issue.category}
  isActive={isSelected}
/>
```

---

## Acceptance Criteria Format

Each task should have:
- **Functional:** What it does
- **Visual:** How it looks
- **Performance:** Speed requirements
- **Accessibility:** A11y requirements
- **Testing:** Test coverage minimum

Example:
```markdown
### Issue Submission

- [ ] **Functional:** User can submit issue with photo, location, category
- [ ] **Visual:** Confirmation shows issue on map within 3 seconds  
- [ ] **Performance:** Submission completes in under 5 seconds (excl. upload)
- [ ] **Accessibility:** Form accessible via keyboard
- [ ] **Testing:** Unit tests cover validation, service mocks pass
```
