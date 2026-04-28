# DELIVERABLE 4 — Product Strategy

## Product Vision

VisibleFix is the transparent backbone of civic infrastructure—a platform that transforms passive citizens into active urban sensors, transforms municipal responsiveness into public accountability, and transforms infrastructure issues into resolved communities.

**Core Vision Statement:** "Every infrastructure problem visible, every resolution tracked, every citizen's voice heard."

**3-Year Vision:**
- Leading civic transparency platform in Türkiye
- Expanding to 15+ municipalities
- Adding predictive maintenance features for municipal customers
- Building data asset for urban planning insights

---

## Design Principles

### 1. Transparency First
Everything is visible by default. No black boxes, no hidden processes. Citizens see what municipalities see.

### 2. Frictionless Reporting
Report an issue in under 60 seconds. Photo + auto-location + category = done. No accounts required for basic reporting.

### 3. Social Proof as Pressure
Upvotes, comments, and shares aren't engagement gimmicks—they're real-time民意 that drives municipal prioritization.

### 4. Progress is the Product
The resolution status (not just the report) is the core value. Users return to see change, not just to submit.

### 5. Trust Through Action
Platform earns trust through visible resolutions. Every fixed issue is a trust deposit.

### 6. Mobile-Native
Designed for phone-first interaction. Gestures over forms. Camera over keyboard.

### 7. Graceful Degradation
Works without perfect GPS. Works without perfect photos. Works without perfect descriptions.

### 8. Deduplication

The system suggests and provides accurate search result for citizens in which people build upon existing case.

---


## Differentiation Strategy

### Different from Government Apps
| Our Approach | Government Apps |
|--------------|-----------------|
| Public transparency | Internal tracking only |
| Social-Media Oriented engagement | Single-user experience |
| Community prioritization | Bureaucratic prioritization |
| Open data | Siloed data |
| Citizen-first UX | Compliance-first UX |

### Different from Social Media Complaints
| Our Approach | Social Media |
|--------------|--------------|
| Structured, actionable | Viral but not systematic |
| Status tracking | Just venting |
| Data for planning | Just noise |
| Integration with resolution | Just awareness |

### Different from Generic Issue Apps
| Our Approach | Generic Apps |
|--------------|--------------|
| Social proof focus | Simple submission only |
| Public accountability | Internal workflow |
| Community organization | Isolated users |
| Trust through transparency | Trust through claims |

---

## Feature Strategy

### Core Features (MVP)

#### Issue Reporting
- **Photo capture:** Camera integration with preview
- **Location:** GPS auto-detect with manual adjustment option
- **Category selection:** Pothole, streetlight, waste, sidewalk, water leak, accessibility, other
- **Description:** Short text field (500 char max)
- **Anonymous option:** No account required for reporting

#### Public Map View
- **Map visualization:** All issues pinned with status colors
- **Filtering:** By category, status, date, proximity
- **Search:** Address or neighborhood search
- **Clustering:** Dense areas shown as clusters

#### Issue Detail Page
- **Photo gallery:** Full-size image viewing
- **Status timeline:** Complete history from report to resolution
- **Upvote button:** One-click "me too"
- **Share button:** Social sharing for amplification
- **Location map:** Mini-map showing exact position

#### Status Tracking System
- **Reported:** Initial submission (auto)
- **Acknowledged:** Municipality has seen it (manual by staff)
- **In Progress:** Work has started (manual by staff)
- **Resolved:** Issue fixed (manual by staff)
- **Rejected:** Won't be fixed (with reason, manual by staff)

#### Upvote System
- **One-click upvote:** Express solidarity
- **Upvote count display:** Social proof visible
- **Nearby upvote aggregation:** "5 others nearby care"

### Feature Strategy by Phase

| Phase | Features | Rationale |
|-------|----------|----------|
| MVP | Reporting, Map, Detail, Status, Upvotes | Core loop: report → see → track |
| MVP+1 | Comments, Notifications, Categories v2 | Engagement deepening |
| MVP+2 | Admin Dashboard, Analytics, Bulk status | Municipal value add |

---

## Scope Boundaries

### In Scope (MVP)
- Issue reporting with photo, location, category
- Public map with all issues
- Issue detail with status timeline
- Upvote functionality
- Shareable links
- Basic status tracking (Reported → Acknowledged → In Progress → Resolved)

### Intentionally Out of Scope (MVP)
- User accounts (optional, deferred)
- Comments (MVP+1)
- Notifications (MVP+1)
- Messaging system
- Municipal admin dashboard (MVP+2)
- Real-time updates (polling sufficient)
- Multi-language (MVP+1)
- Offline mode (future)
- AI classification (future)
- Automated routing (future)

### What Should Be Fake-Doored

| Feature | Implementation | Notes |
|---------|----------------|-------|
| Issue categories | Hardcoded 7 categories | Expand after user research |
| Status workflow | Manual transitions | Automate after pilot |
| Email notifications | Simulated (console log) | Build real after MVP |
| Map clustering | Simple client-side | Optimize after data volume |
| Search filtering | Basic backend filter | Enhance after MVP |

---

## Trust and Transparency Model

### Public by Default
1. **All issues visible:** No private issues, no hidden reports
2. **All statuses public:** Complete timeline visible
3. **All timestamps accurate:** When reported, when acknowledged, when resolved
4. **All counts accurate:** Upvote counts, view counts, resolution times

### Building Trust Mechanisms

#### Transparency Signals
- Platform is independent (not government-owned)
- No political affiliation
- Open about data usage
- Clear terms of service

#### Social Proof Signals
- "1,247 issues resolved this month"
- "89% of reported issues acknowledged within 48 hours"
- Real user counts (no fake numbers)

#### Progress Signals
- Before/after photos when resolved
- Resolution time averages
- Category-based statistics

### Trust Erosion Prevention
- Never fake data (obvious once real usage starts)
- Never remove negative content (unless abusive)
- Never obscure slow resolution times
- Always show when municipality hasn't responded

---

## Citizen Engagement Model

### Engagement Loop

```
DISCOVERY → REPORT → ENGAGEMENT → ADVOCACY → ORGANIZING
    ↓          ↓           ↓            ↓          ↓
[Community] [Report]  [Check status] [Share]  [Campaign]
 push       issue     + upvoting     links    organize
```

### Engagement Mechanisms

| Mechanism | Purpose | Metric |
|-----------|---------|--------|
| Upvotes | Social proof, prioritization | Upvotes per issue |
| Status notifications | Return visits | Return rate |
| Share buttons | Viral reach | Share rate |
| Before/after | Trust building | Resolution satisfaction |
| Leaderboard (future) | Recognition | Community contributions |

### Adoption Funnel

1. **Awareness:** Community seeding, social media, local groups
2. **First report:** Frictionless reporting, immediate confirmation
3. **First upvote:** See others care, feel impact
4. **First resolution:** Complete the loop, build trust
5. **Advocacy:** Share with network, organize around issues

---

## Issue Lifecycle and Status Model

### Status Flow

```
REPORTED → ACKNOWLEDGED → IN_PROGRESS → RESOLVED
    ↓          ↓              ↓              ↓
[Auto]    [Municipality]  [Municipality]  [Municipality]
          Can reject →    Can go back    Can reopen
          REJECTED                          if复发
```

### Status Transitions

| From | To | Trigger | Actor | Visibility |
|------|-----|---------|-------|-------------|
| Reported | Acknowledged | Staff reviews issue | Municipality | Public |
| Reported | Rejected (with reason) | Invalid/out of scope | Municipality | Public with reason |
| Acknowledged | In Progress | Work scheduled | Municipality | Public |
| Acknowledged | Rejected | Budget constraints | Municipality | Public with reason |
| In Progress | Resolved | Work completed | Municipality | Public with photo |
| In Progress | In Progress | More work needed | Municipality | Public (status note) |
| Resolved | (Can reopen) | Issue recurs | Citizen | Public |

### Status Display Rules

| Status | Color | Icon | Timeline Position |
|--------|-------|------|-------------------|
| Reported | Orange | 📍 | 1st (always) |
| Acknowledged | Blue | 👁️ | 2nd |
| In Progress | Yellow | 🔧 | 3rd |
| Resolved | Green | ✅ | Final |
| Rejected | Gray | ❌ | With reason |

---

## Moderation / Abuse Prevention Model

### Content Guidelines
- No personal attacks or harassment
- No hate speech
- No sexually explicit content
- No spam or commercial promotion
- No false/fake reports (verifiable)

### Automated Moderation
- **Image AI screening:** Basic content classification
- **Duplicate detection:** Same location + time window
- **Spam patterns:** Mass reporting from same device/IP

### Community Moderation
- **Report abuse button:** Users can flag inappropriate content
- **Community voting:** Multiple reports trigger review queue
- **Trust scores:** Users who report accurately gain trust

### Resolution Process
| Report Type | Action | Response Time |
|-------------|--------|----------------|
| Spam/duplicate | Merge or remove | Immediate |
| Miscategorization | Reassign category | < 24 hours |
| Abusive content | Remove + warn | < 4 hours |
| False report | Reject + educate | < 24 hours |
| Legal request | Escalate to legal | < 24 hours |

---

## Operational Routing Logic

### Category to Department Mapping (Configurable)

| Category | Default Department | Keywords |
|----------|---------------------|----------|
| Pothole | Roads | road, asphalt, hole, crack |
| Streetlight | Electricity | light, dark, lamp, pole |
| Waste | Sanitation | trash, garbage, bin, litter |
| Sidewalk | Roads | sidewalk, pavement, curb, ramp |
| Water leak | Water | leak, pipe, water, flood |
| Accessibility | Urban Planning | ramp, barrier, access, disabled |
| Other | General | general issues |

### Routing Logic (MVP)
1. Category → department mapping (simple config)
2. Location → district/zone assignment (map-based)
3. Priority → upvote-based (high upvotes = faster queue)

### Manual Operations (MVP)
- Status updates: Municipality staff manually changes
- Acknowledgments: Staff reviews and acknowledges
- Resolutions: Staff marks resolved with optional photo

**Why Manual First:** Automating before understanding workflow causes errors. Staff understanding of process is more valuable than code.

---

## Incentives and Adoption Mechanisms

### Citizen Incentives

| Incentive | Type | Target Behavior |
|-----------|------|-----------------|
| Quick resolution | Outcome | Report quality issues |
| Social proof | Social | Upvote others' issues |
| Community organizing | Identity | Lead neighborhood efforts |
| Impact visibility | Achievement | Return to check status |
| Recognition (future) | Status | Top reporters |

### Municipal Incentives

| Incentive | Type | Target Behavior |
|-----------|------|-----------------|
| Citizen satisfaction | Outcome | Respond to issues publicly |
| Reduced call volume | Cost | Promote self-service |
| Data for planning | Value | Use issue data |
| Transparency credit | Reputation | Adopt public tracking |
| Budget justification | ROI | Use resolved data |

### Community Organization Incentives

| Incentive | Type | Target Behavior |
|-----------|------|-----------------|
| Campaign tools | Capability | Organize around issues |
| Neighborhood stats | Status | Compare to others |
| Municipal access | Relationship | Direct engagement |

---

## Business Model Options

### Option A: B2G SaaS (Primary)
- Municipalities pay monthly/annual subscription
- Tiered pricing based on population and features
- Free tier for public facing, paid for municipal dashboard

### Option B: B2B2G (Exploratory)
- Partner with infrastructure companies who pay for better issue data
- Maintenance contractors get priority issue routing for service areas

### Option C: White-Label (Future)
- Large municipalities get custom-branded version
- Full customization, dedicated support

### Option D: Platform (Long-term)
- API access for third-party developers
- Data marketplace for urban planners
- Integration marketplace for civic tools

### Recommended Path: B2G SaaS with B2B2G expansion
Start with direct municipal sales, expand through contractor partnerships.

---

## Pricing Model

### Tier Structure

| Tier | Price | Features | Target |
|------|-------|----------|--------|
| **Free** | Free | Public map, reporting, upvotes, status | Citizens |
| **Standard** | ₺5,000/month | Dashboard, basic analytics, issue management, categories | Small municipalities |
| **Premium** | ₺15,000/month | Everything + custom branding, API access, priority support, advanced analytics | Large municipalities |
| **Enterprise** | Custom | White-label, dedicated support, SLA, custom integrations | Metros |

### Pricing Psychology
- Free tier must deliver full value to citizens (no catch)
- Pricing positioned as "infrastructure improvement" not "software cost"
- Pilot year: 50% discount for first 3 municipalities
- Multi-year: 20% discount for 2-year commitment
