# DELIVERABLE 6 — UX/UI Research and Design Direction

## UX Research Goals

### Primary Research Questions
1. How do citizens currently capture and report infrastructure issues with their phones?
2. What is the minimum viable interaction to get from "I see a problem" to "issue submitted"?
3. What status display creates the strongest perception of progress without being overwhelming?
4. What visual language signals "official but accessible" rather than "government bureaucratic"?

### Research Methods
- **Usability testing:** 5 users attempt reporting flow with clickable prototype
- **Card sorting:** 10 users categorize issue types
- **First-click testing:** Where do users look to report issues?
- **Contextual inquiry:** Observe citizens in their actual environment encountering issues

### Research Schedule
| Phase | Method | Participants | Output |
|-------|--------|---------------|--------|
| Week 1 | Competitive audit | N/A | UX comparison report |
| Week 2 | Card sorting | 10 users | Category hierarchy |
| Week 3 | Clickable prototype | 5 users | Usability findings |
| Week 4 | Iteration testing | 5 users | Refined designs |

---

## Information Architecture

### Site Structure
```
/                           # Map home - all issues
/report                     # Report new issue
/issue/[id]                 # Issue detail
/my-issues                  # User's reported issues
/admin                      # Municipal dashboard (protected)
/admin/issues               # Issue management
/admin/stats                # Basic statistics
```

### Navigation Structure
- **Primary (bottom bar, mobile):**
  - Map (home)
  - Report (+)
  - My Issues

- **Secondary (header):**
  - Filter toggle
  - Search
  - Profile/Login (future)

### Content Hierarchy
1. **Issue pin** → Most important, shows status via color
2. **Issue detail** → Full information, timeline, actions
3. **Map** → Overview, discovery, exploration
4. **Forms** → Reporting flow, optimized for mobile

---

## Primary User Flows

### Flow 1: Quick Report (Target: <60 seconds)
```
Open App → Tap Report → Camera Opens → Capture Photo → Auto-Location Confirms → Select Category → Tap Submit → See on Map
```

**Key Design Decisions:**
- Camera opens immediately on "Report" tap
- Location auto-detects in background
- Single scrollable category list
- Submit button always visible (sticky bottom)
- Confirmation animation before redirect

### Flow 2: Check Status
```
Open App → See Issue on Map → Tap Issue Pin → View Detail → See "My Reports" Section → Tap Issue → View Full Timeline
```

**Key Design Decisions:**
- Recent issues highlighted on home screen
- "My Reports" section in profile
- Status badge prominently displayed
- Timeline shows each transition with date

### Flow 3: Upvote Support
```
Browse Map → See Issue → Tap to View Detail → Tap Upvote → See Count Increment → Optionally Share
```

**Key Design Decisions:**
- Upvote is primary action (not buried)
- Count clearly visible
- Share button next to upvote
- Confirms with micro-animation

---

## Low-Friction Reporting Flow

### Principles for Reporting UX
1. **Zero friction:** Maximum 3 screens to submit
2. **Smart defaults:** Auto-location, suggest category from photo
3. **Progressive disclosure:** Only essential fields initially
4. **Instant feedback:** Every action shows response
5. **Forgiving:** Can edit after submission

### Screen Sequence

| Screen | Fields | Actions | Target Time |
|--------|--------|---------|-------------|
| 1. Camera | Photo only | Capture/select | 5 seconds |
| 2. Details | Category, description, location | Edit/confirm | 15 seconds |
| 3. Confirm | Review summary | Submit | 5 seconds |

### Form Specifications

| Field | Type | Validation | Default |
|-------|------|-------------|---------|
| Photo | File input | Required, <10MB | None |
| Location | GPS auto + manual | Required | Auto-detect |
| Category | Single select | Required | Based on photo AI |
| Description | Textarea | Optional, <500ch | Empty |

---

## Map/List/Status/Issue-Detail/Admin Workflows

### Map View (Home)
- Full-screen map with colored pins
- Bottom sheet for issue preview (swipe up)
- Filter chips horizontally scrollable
- FAB for "Report" (bottom right)
- Search bar (top)

### List View (Alternative)
- Card-based list below map toggle
- Sort by: Newest, Most upvoted, Nearest
- Infinite scroll pagination

### Status System Visuals
```
REPORTED    → Orange pin, "⏳ Reported"
ACKNOWLEDGED → Blue pin, "👁️ Seen"
IN_PROGRESS → Yellow pin, "🔧 Working on it"
RESOLVED    → Green pin, "✓ Fixed"
REJECTED    → Gray pin, "○ Not fixable"
```

### Issue Detail Page Layout
```
┌─────────────────────────────┐
│ [Photo - Full width]        │
│                             │
├─────────────────────────────┤
│ [Status Badge]              │
│ Category • Address         │
│ Description text...        │
├─────────────────────────────┤
│ TIMELINE                   │
│ ✓ Fixed - Jan 15           │
│ 🔧 In Progress - Jan 10    │
│ 👁️ Seen - Jan 5            │
│ ⏳ Reported - Jan 3         │
├─────────────────────────────┤
│ [↑ Upvote] [↗ Share]       │
│ 24 people care about this  │
└─────────────────────────────┘
```

### Municipal Admin Workflow
- Simple list view with filters
- Dropdown to change status
- Optional notes field for changes
- Basic stats at top (cards)

---

## Accessibility and Inclusive Design

### WCAG 2.1 AA Compliance Targets
- All interactive elements keyboard accessible
- Color not sole indicator (add icons/text)
- Focus indicators visible
- Touch targets minimum 44x44px
- Text contrast ratio 4.5:1 minimum

### Inclusive Design Considerations
| Consideration | Implementation |
|---------------|-----------------|
| Motor impairments | Large tap targets, no timeouts |
| Visual impairments | Screen reader labels, high contrast mode |
| Cognitive load | Simple flows, clear labels, progress indicators |
| Language | Clear Turkish, avoid jargon |
| Connectivity | Progressive enhancement, offline-friendly |

### Mobile-First Priorities

| Priority | Rationale |
|----------|-----------|
| Touch gestures | Native mobile experience |
| Bottom navigation | Thumb zone accessibility |
| Single-handed use | Common usage pattern |
| Landscape optional | Portrait primary |
| Variable connection | Works on 3G+ |

---

## Design Heuristics for Trust, Clarity, and Legitimacy

### Trust Signals
1. **Professional typography** - Not comic sans, not generic system fonts
2. **Consistent spacing** - No cramped layouts
3. **Clear status** - No ambiguous states
4. **Transparent data** - Show real numbers
5. **Brand legitimacy** - Official-looking but modern

### Clarity Principles
1. **One primary action per screen**
2. **Progressive disclosure** - Show essentials first
3. **Consistent patterns** - Same UI patterns across screens
4. **Helpful defaults** - Smart suggestions
5. **Clear feedback** - Every action has response

### Legitimacy Cues
1. **HTTPS always** - Secure indicators visible
2. **Contact information** - Physical address, support email
3. **Terms accessible** - Footer links
4. **Privacy visible** - Data handling explanations
5. **No suspicious patterns** - No dark patterns, no trickery

---

## Tone and Microcopy Guidelines

### Tone Voice
- **Professional but warm** - Not corporate cold, not casual
- **Clear and direct** - No jargon, no fluff
- **Encouraging** - Thanks for reporting, welcome back
- **Transparent** - Honestly about process, timeframes

### Microcopy Examples

| Context | Avoid | Use |
|---------|-------|-----|
| Report success | "Submission received" | "Thank you! Your issue is now visible to the community." |
| Status update | "Status changed" | "Great news! This issue is now being worked on." |
| Empty map | "No issues found" | "No issues reported yet. Be the first to report!" |
| Upvote | "Upvoted" | "✓ You showed you care!" |
| Error | "An error occurred" | "Something went wrong. Please try again." |

### Error Handling
- Be specific about what went wrong
- Suggest next steps
- Never blame the user
- Offer alternatives

---

## Visual Design Directions

### Direction 1: Civic Trust Aesthetic

**Concept:** Professional, credible, official-but-modern. Like a well-designed government service that actually works.

**Visual Characteristics:**
- Clean, structured layouts with clear hierarchy
- Primary blue (#1E3A8A) as trust signal
- Secondary teal (#0D9488) for action elements
- White backgrounds with subtle gray borders
- Card-based content containers
- System-style icons (not decorative)

**Layout Approach:**
- Grid-based, predictable structure
- Generous whitespace (24px+ between sections)
- Clear visual hierarchy
- Status colors are functional not decorative

**Typography:**
- Sans-serif (Inter or system fonts)
- Bold headings, regular body
- 16px base size for body text
- Clear size differentiation (hierarchy)

**Interaction:**
- Subtle hover states
- Clear active/focus indicators
- Loading states for async actions
- Toast notifications for feedback

### Direction 2: Community-Forward Social Proof Aesthetic

**Concept:** Warm, human, community-driven. Like a neighborhood platform where real people solve real problems together.

**Visual Characteristics:**
- Vibrant but not overwhelming color palette
- Community-focused imagery
- Round avatars and profile elements
- Activity indicators visible
- "Others nearby" emphasis

**Color Approach:**
- Warm accent (coral #F97316) for actions
- Green for positive outcomes
- Orange for attention/active
- Purple for community elements
- Light cream backgrounds

**Layout Approach:**
- Card-heavy, feed-like
- Visible engagement metrics
- Community activity indicators
- Social sharing prominent

**Typography:**
- Friendly sans-serif (Nunito or similar)
- Rounded characters
- Larger text for accessibility

**Interaction:**
- Celebration animations on upvote
- Community activity feed
- Share-forward animations

### Direction 3: Professional Municipal Operations Aesthetic

**Concept:** Data-forward, operational, dashboard-style. Like a professional maintenance tracking tool that happens to be public.

**Visual Characteristics:**
- Dense but organized information
- Data visualization emphasis
- Status-focused design
- Functional over decorative

**Color Approach:**
- Neutral grays foundation
- Status-specific colors (consistent)
- High contrast for data
- Dark mode support

**Layout Approach:**
- Table/list views available
- Compact option
- Sidebar navigation
- Dashboard cards

**Typography:**
- Monospace for IDs/numbers
- Dense but readable body
- Data table ready

**Interaction:**
- Quick filters
- Batch operations
- Keyboard shortcuts (desktop)
- Export options

---

## Design System Starter Tokens

### Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `color-primary` | #1E3A8A | Primary actions, headers |
| `color-primary-hover` | #1E40AF | Button hover states |
| `color-secondary` | #0D9488 | Secondary actions |
| `color-success` | #10B981 | Resolved status, success |
| `color-warning` | #F59E0B | In progress status |
| `color-error` | #EF4444 | Errors, critical |
| `color-info` | #3B82F6 | Acknowledged status |
| `color-neutral` | #6B7280 | Neutral text, borders |
| `color-background` | #FFFFFF | Page background |
| `color-surface` | #F9FAFB | Card backgrounds |

### Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-xs` | 4px | Tight spacing |
| `spacing-sm` | 8px | Related elements |
| `spacing-md` | 16px | Standard spacing |
| `spacing-lg` | 24px | Section spacing |
| `spacing-xl` | 32px | Major sections |
| `spacing-2xl` | 48px | Page margins |

### Typography Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `font-family` | Inter, system-ui | Primary font |
| `font-size-sm` | 12px | Captions, metadata |
| `font-size-base` | 16px | Body text |
| `font-size-lg` | 18px | Lead text |
| `font-size-xl` | 24px | Section headers |
| `font-size-2xl` | 32px | Page titles |
| `font-weight-normal` | 400 | Body text |
| `font-weight-medium` | 500 | Labels, buttons |
| `font-weight-bold` | 700 | Headings |

### Component Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Small elements |
| `radius-md` | 8px | Cards, inputs |
| `radius-lg` | 12px | Buttons, modals |
| `radius-full` | 9999px | Pills, avatars |
| `shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) | Subtle elevation |
| `shadow-md` | 0 4px 6px rgba(0,0,0,0.1) | Cards |
| `shadow-lg` | 0 10px 15px rgba(0,0,0,0.1) | Modals |
| `touch-target` | 44px | Minimum touch target |

---

## Page Inventory

| Page | Route | Priority | Notes |
|------|-------|----------|-------|
| Map Home | `/` | Must | Main entry, full-screen map |
| Report Issue | `/report` | Must | Reporting flow |
| Issue Detail | `/issue/[id]` | Must | Full issue info + timeline |
| My Issues | `/my-issues` | Should | User's reported issues |
| Search Results | `/search` | Should | Issue search |
| Municipal Login | `/admin/login` | Future | Protected admin |
| Admin Dashboard | `/admin` | Future | Issue management |
| Admin Issue List | `/admin/issues` | Future | Filtered list |
| Admin Stats | `/admin/stats` | Future | Basic analytics |

---

## Wireframe Notes for Each Page

### Map Home (`/`)
- Full viewport map (100vh - nav)
- Floating filter chips (horizontal scroll)
- FAB bottom-right for report (+)
- Search bar top (sticky)
- Bottom sheet for issue preview on tap
- Bottom navigation bar (fixed)

### Report Issue (`/report`)
- Step indicator if multi-step
- Camera preview (full width, 16:9 aspect)
- Location preview (map thumbnail)
- Category chips (scrollable row)
- Description textarea
- Submit button (fixed bottom)

### Issue Detail (`/issue/[id]`)
- Hero image (full width, max 40vh)
- Status badge (prominent, below image)
- Title/address block
- Description text
- Timeline (vertical, chronological)
- Action bar (upvote, share)
- Related issues (horizontal scroll)

### My Issues (`/my-issues`)
- Empty state with illustration
- List of reported issues (cards)
- Each card: thumbnail, title, status, date
- Pull to refresh

---

## Component Inventory

| Component | States | Notes |
|-----------|--------|-------|
| IssuePin | reported, acknowledged, in_progress, resolved | Map marker |
| StatusBadge | reported, acknowledged, in_progress, resolved, rejected | Colored label |
| IssueCard | default, active, pressed | List item |
| CategoryChip | default, selected | Filter/report |
| UpvoteButton | default, upvoted, loading | Interactive |
| ShareButton | default, clicked | Social |
| PhotoCapture | idle, capturing, preview, error | Camera |
| LocationPicker | detecting, detected, manual, error | GPS |
| FilterChip | default, selected, count | Map filters |
| TimelineItem | default | Status history |
| EmptyState | various | Custom per context |
| LoadingState | skeleton, spinner | Various |
| ErrorState | retry, dismiss | Various |

---

## Frontend Implementation Guidance

### Technology Choices
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS with custom tokens
- **State:** React Query + Zustand (minimal)
- **Map:** Mapbox GL JS or react-map-gl
- **Forms:** React Hook Form
- **Components:** Headless UI + custom

### Code Organization (Feature-Sliced)
```
/app
  /map          # Map page feature
  /report       # Report feature
  /issue        # Issue detail feature
  /admin        # Admin feature
/components
  /ui           # Base components (Button, Input, etc.)
  /map          # Map-specific components
  /issue        # Issue-specific components
/lib
  /api          # API utilities
  /hooks        # Custom hooks
  /utils        # Helper functions
/styles
  /tokens.css   # Design system tokens
```

### Avoid Generic AI Boilerplate
- Use actual content, not lorem ipsum
- Include real error messages
- Add meaningful empty states
- Use Turkish labels where appropriate
- No placeholder "TODO" comments in production

### Map Integration Guidelines
- Use react-map-gl for declarative wrapper
- Implement custom markers for issue pins
- Add clustering for >100 pins
- Provide list fallback for poor connection
- Include search by coordinates option
