# DELIVERABLE 5 — Product Requirements Document

## Product Overview

### Product Name
VisibleFix

### Product Type
Civic transparency and issue tracking platform (mobile-first web application)

### Summary
A community-powered infrastructure issue reporting and tracking platform that makes municipal responsiveness visible, trackable, and socially accountable through public status updates, community engagement, and social proof mechanisms.

### Target Release
MVP launch: Q2 2025
Target markets: İzmir, Antalya, Eskişehir (pilot cities)

---

## Business Goals

| Goal | Success Metric | Timeline |
|------|---------------|----------|
| Reduce issue resolution time | 30% faster than baseline | 6 months |
| Achieve 10,000 citizen reports | Active user base | 6 months |
| Secure 3 municipal pilots | Signed pilot agreements | 6 months |
| Build trust through transparency | 40% return rate | 6 months |
| Generate qualified leads | 50 municipal conversations | 6 months |

---

## User Problems

### Problem 1: Reporting Black Hole
**User:** Frustrated citizen
**Problem:** "I reported a pothole through the municipal app 3 weeks ago. I have no idea if anyone ever saw it. Nothing has changed. I don't know if I should report again or just give up."

**Root Cause:** No public visibility into report status. Citizens submit and then receive zero feedback.

### Problem 2: Lonely Reporting
**User:** Community-minded citizen
**Problem:** "I reported a broken streetlight last month. I'm the only one who cares. It would be helpful to know if anyone else is affected by this, but there's no way to find out."

**Root Cause:** No social proof mechanism. Citizens feel they're reporting into a void alone.

### Problem 3: Can't Track Progress
**User:** Civic-minded citizen
**Problem:** "Even when I do report something, I have no way to check if it's being worked on. I don't know if ignoring it is the right choice or if I should keep following up."

**Root Cause:** No status tracking or progress visibility. No way to see resolution process.

### Problem 4: Municipal Blind Spots
**User:** Municipal engineer
**Problem:** "We get reports from phone calls, the website, social media, and walk-ins—but they all go to different systems. We have no way to see what's happening across channels or prioritize based on real citizen impact."

**Root Cause:** Fragmented systems with no unified view. No citizen-as-sensor data aggregation.

---

## User Personas

### Persona 1: Yusuf, the Daily Commuter
- **Age:** 32
- **Role:** Graphic designer
- **Tech comfort:** High
- **Pain point:** Reports same pothole monthly, no response
- **Goal:** Fix commute route issues efficiently
- **Motivation:** Self-interest + community contribution
- **Behaviors:**
  - Uses Instagram for local news
  - Uses WhatsApp for community groups
  - Willing to report if sees others care
  - Would return to check status if notified
- **Success criteria:** See issue acknowledged within 48 hours

### Persona 2: Elif, the Neighborhood Advocate
- **Age:** 48
- **Role:** Primary school teacher, neighborhood association volunteer
- **Tech comfort:** Medium
- **Pain point:** Spends hours documenting sidewalk issues for meetings with no tracking
- **Goal:** Efficient advocacy with concrete results
- **Motivation:** Community leadership, results for neighbors
- **Behaviors:**
  - Uses Facebook for community organizing
  - Uses municipal website for official information
  - Would use platform to organize neighborhood campaigns
  - Would check status daily during active campaigns
- **Success criteria:** See organized data drive decisions

### Persona 3: Ahmet, the Municipal Engineer
- **Age:** 45
- **Role:** Public Works Department, Infrastructure Maintenance Division
- **Tech comfort:** Medium
- **Pain point:** Receives duplicate reports through multiple channels, struggles to prioritize
- **Goal:** Better citizen sensor data to optimize maintenance routes
- **Motivation:** Efficient resource allocation, data-driven decisions
- **Behaviors:**
  - Uses internal GIS systems daily
  - Uses email for official communication
  - Would check platform for citizen reports
  - Would update status when issues addressed
- **Success criteria:** Reduce duplicate reports by 40%

### Persona 4: Deniz, the Concerned Citizen
- **Age:** 24
- **Role:** Graduate student
- **Tech comfort:** Very high
- **Pain point:** Frustrated that nothing ever changes, feels powerless
- **Goal:** See tangible results from civic engagement
- **Motivation:** Validation that civic participation matters
- **Behaviors:**
  - Active on Twitter/X
  - Downloads apps quickly, deletes fast if poor UX
  - Would share on social media if resolution visible
- **Success criteria:** At least one issue resolved with visible impact

---

## Jobs to Be Done

### Citizen Jobs

| Job # | Job Statement | Priority | Current Alternative |
|-------|--------------|----------|----------------------|
| J1 | Report an infrastructure issue in under 60 seconds | Must have | Call 153, use app, post social media |
| J2 | See my issue on a public map with others | Must have | None exist |
| J3 | Know the status of my reported issue | Must have | Call and ask, visit office |
| J4 | Show others I care about an issue (social proof) | Must have | Share on social media |
| J5 | Share an issue to amplify pressure | Should have | Share on social media |
| J6 | Get notified when status changes | Should have | None exist |
| J7 | Comment on issues in my neighborhood | Could have | Facebook groups |
| J8 | Organize a community campaign around an issue | Could have | WhatsApp groups |

### Municipal Jobs

| Job # | Job Statement | Priority | Current Alternative |
|-------|--------------|----------|----------------------|
| M1 | See all citizen reports in one place | Must have | Multiple fragmented channels |
| M2 | Update issue status publicly | Must have | None exist |
| M3 | See which issues have most community impact | Should have | None exist |
| M4 | Route issues to appropriate departments | Should have | Manual routing |
| M5 | Generate reports on infrastructure issues | Could have | Manual data compilation |
| M6 | Integrate with existing CRM/asset management | Could have | Manual exports |

---

## Use Cases

### UC-1: Report New Issue (Happy Path)
**Actor:** Citizen (Yusuf)
**Trigger:** Yusuf encounters pothole on commute
**Flow:**
1. Opens app (or visits website)
2. App detects location automatically
3. Taps "Report Issue" button
4. Takes photo with camera
5. Selects category "Pothole" from list
6. Adds brief description
7. Submits
8. Sees confirmation and issue on map

**Success Criteria:** Issue appears on public map within 10 seconds

### UC-2: View Issue Status
**Actor:** Citizen (Yusuf)
**Trigger:** Yusuf wants to check his reported issue
**Flow:**
1. Opens app
2. Finds issue in "My Reports" section
3. Views status timeline (Reported → Acknowledged → In Progress → Resolved)
4. Sees timestamp for each status change
5. Optionally shares link with friends

**Success Criteria:** Clear status visibility within 3 taps

### UC-3: Upvote Existing Issue
**Actor:** Citizen (Deniz)
**Trigger:** Deniz sees pothole on map that's already reported
**Flow:**
1. Opens map view
2. Pans to location
3. Taps issue pin
4. Views issue detail
5. Taps upvote button
6. Sees upvote count increment

**Success Criteria:** Single-tap upvote, immediate feedback

### UC-4: Browse Public Map
**Actor:** Concerned citizen (any)
**Trigger:** User wants to see issues in their neighborhood
**Flow:**
1. Opens app to map view
2. Map loads showing all issues as pins
3. Pins colored by status
4. Can tap to filter by category or status
5. Can tap pin for issue detail

**Success Criteria:** Map loads within 3 seconds, pins show status colors

### UC-5: Municipality Status Update
**Actor:** Municipal engineer (Ahmet)
**Trigger:** Ahmet's team has completed work on an issue
**Flow:**
1. Logs into municipal dashboard
2. Views list of acknowledged/in-progress issues
3. Selects issue
4. Changes status to "Resolved"
5. Optionally adds resolution photo
6. Confirms change

**Success Criteria:** Status changes visible to public within 1 minute

### UC-6: Share Issue Externally
**Actor:** Community advocate (Elif)
**Trigger:** Elif wants to amplify an issue to build support
**Flow:**
1. Opens issue detail
2. Taps "Share" button
3. Chooses sharing channel (copy link, WhatsApp, Twitter)
4. Shares with community

**Success Criteria:** Shared link opens to issue detail page

---

## User Stories

### Priority: Must Have

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-1 | As a citizen, I can report an issue with a photo so that the municipality can see the problem | - Photo capture works<br>- Photo uploads successfully<br>- Photo displays in issue detail |
| US-2 | As a citizen, I can report an issue with location so that it's placed on the map | - GPS auto-detects location<br>- Manual location adjustment works<br>- Issue shows at correct map position |
| US-3 | As a citizen, I can categorize my issue so that it's routed correctly | - Category selection available<br>- 7 categories minimum<br>- Category displays on issue |
| US-4 | As a citizen, I can see all issues on a public map so that I know what's reported | - Map displays all issues<br>- Pins show status color<br>- Map is searchable/filterable |
| US-5 | As a citizen, I can view issue details so that I can see full information | - Issue detail shows photo, description, location, status<br>- Status timeline is visible |
| US-6 | As a citizen, I can track issue status so that I know progress | - Status displayed prominently<br>- Status changes are visible<br>- Timestamps shown |
| US-7 | As a citizen, I can upvote issues so that I can show I care | - Upvote button works<br>- Count increments<br>- Upvote persists |
| US-8 | As a citizen, I can share issues so that I can amplify pressure | - Share button works<br>- Link copies to clipboard<br>- Shared link opens issue detail |
| US-9 | As a municipal staff, I can view all reported issues so that I can manage them | - Issue list loads<br>- Filterable by status/category<br>- Sortable by date/upvotes |
| US-10 | As a municipal staff, I can update issue status so that citizens know progress | - Status dropdown works<br>- Status change persists<br>- Public sees change |

### Priority: Should Have

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-11 | As a citizen, I can filter issues by category so that I can focus on what's relevant | - Category filter works<br>- Multiple categories selectable |
| US-12 | As a citizen, I can filter issues by status so that I can find issues I care about | - Status filter works<br>- Multiple statuses selectable |
| US-13 | As a citizen, I can search by address so that I can find nearby issues | - Search input accepts text<br>- Results show matching issues |
| US-14 | As a citizen, I can see how many others upvoted so that I know community impact | - Upvote count displays<br>- "Others nearby" shows |
| US-15 | As a municipal staff, I can acknowledge issues so that citizens know we've seen them | - Acknowledge action works<br>- Status updates to "Acknowledged" |
| US-16 | As a municipal staff, I can add resolution photos so that citizens see the result | - Photo upload works<br>- Photo displays in detail |

### Priority: Could Have

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-17 | As a citizen, I can comment on issues so that I can add context | - Comment field works<br>- Comments display |
| US-18 | As a citizen, I can receive notifications so that I know when status changes | - Notification permission prompt<br>- Notifications fire on status change |
| US-19 | As a citizen, I can create an account so that I can track my reports | - Registration flow works<br>- Login persists |
| US-20 | As a municipal staff, I can generate reports so that I can analyze data | - Export to CSV works<br>- Data includes key fields |

---

## Functional Requirements

### F1: Issue Reporting
- **F1.1:** User can capture photo from device camera
- **F1.2:** User can select existing photo from gallery
- **F1.3:** Photo is compressed for upload (max 5MB)
- **F1.4:** GPS location is auto-detected
- **F1.5:** User can manually adjust location on map
- **F1.6:** User can select category from predefined list
- **F1.7:** User can add description (max 500 characters)
- **F1.8:** User can submit issue without creating account
- **F1.9:** Confirmation message displays after submission
- **F1.10:** Issue appears on public map within 10 seconds

### F2: Map Visualization
- **F2.1:** Map displays all issues as pins
- **F2.2:** Pins are colored by status
- **F2.3:** User can zoom/pan map
- **F2.4:** User can tap pin to view issue preview
- **F2.5:** User can filter by category
- **F2.6:** User can filter by status
- **F2.7:** User can search by address/neighborhood
- **F2.8:** Dense areas cluster into expandable groups
- **F2.9:** Map works on mobile devices

### F3: Issue Detail
- **F3.1:** Issue detail page shows full-size photo
- **F3.2:** Issue detail shows description text
- **F3.3:** Issue detail shows category
- **F3.4:** Issue detail shows location on mini-map
- **F3.5:** Issue detail shows status timeline
- **F3.6:** Issue detail shows timestamps for each status
- **F3.7:** Issue detail shows upvote count
- **F3.8:** Issue detail shows address/neighborhood

### F4: Upvote System
- **F4.1:** User can upvote with single tap
- **F4.2:** Upvote count increments immediately
- **F4.3:** User can remove upvote (toggle)
- **F4.4:** Upvote persists (stored locally if not logged in)
- **F4.5:** User can see "others nearby" who upvoted

### F5: Status Tracking
- **F5.1:** Status transitions follow defined workflow
- **F5.2:** Status displays prominently with icon and color
- **F5.3:** Timeline shows all status changes with timestamps
- **F5.4:** Status changes trigger public visibility update

### F6: Sharing
- **F6.1:** User can copy issue link to clipboard
- **F6.2:** User can share via native share (mobile)
- **F6.3:** Shared link opens to public issue detail
- **F6.4:** Open graph meta tags for social sharing preview

### F7: Municipal Dashboard (MVP+1)
- **F7.1:** Login-protected admin area
- **F7.2:** List view of all issues
- **F7.3:** Filter by status, category, date
- **F7.4:** Sort by date, upvotes
- **F7.5:** Status update controls
- **F7.6:** Basic statistics (total, by status, by category)

---

## Non-Functional Requirements

### Performance
- **NF1:** Map initial load < 3 seconds on 4G
- **NF2:** Issue submission < 2 seconds (excluding photo upload)
- **NF3:** Photo upload progress indicator visible
- **NF4:** Status changes reflect within 1 minute

### Reliability
- **NF5:** 99.5% uptime during pilot
- **NF6:** Graceful degradation if map tiles fail (show list fallback)
- **NF7:** Form validation prevents invalid submissions

### Security
- **NF8:** No PII stored without consent
- **NF9:** Location data stored with privacy (optional exact location)
- **NF10:** Rate limiting on submission endpoint (prevent spam)
- **NF11:** Basic CSRF protection

### Privacy
- **NF12:** Users can report without account
- **NF13:** Approximate location option for privacy
- **NF14:** Terms of service clearly displayed
- **NF15:** Photo moderation for inappropriate content

---

## UX Requirements

### Navigation
- **UX1:** Maximum 3 taps to complete core action
- **UX2:** Clear back navigation on every screen
- **UX3:** Bottom navigation bar for primary sections (Map, Report, My Issues)
- **UX4:** Consistent header with title and actions

### Forms
- **UX5:** Large touch targets (min 44px)
- **UX6:** Inline validation with helpful error messages
- **UX7:** Loading states shown during submission
- **UX8:** Success confirmation after submission

### Accessibility
- **UX9:** All interactive elements focusable
- **UX10:** Color not sole indicator of state
- **UX11:** Text contrast ratio > 4.5:1
- **UX12:** Screen reader compatible labels

### Mobile-First
- **UX13:** Responsive layout for mobile (320px+)
- **UX14:** Touch gestures supported (pinch zoom, pan)
- **UX15:** Keyboard-friendly for search inputs
- **UX16:** Works offline for previously loaded content

---

## Analytics Requirements

### Events to Track

| Event | Description | Trigger |
|-------|-------------|----------|
| issue_created | Issue submitted | On form submission |
| issue_viewed | Issue detail opened | On page view |
| upvoted | Issue upvoted | On upvote action |
| status_changed | Issue status updated | On municipal action |
| shared | Issue shared externally | On share action |
| map_loaded | Map view rendered | On page load |
| filtered | Filter applied | On filter action |
| searched | Search performed | On search submit |

### Metrics to Report

| Metric | Definition |
|--------|------------|
| Total issues reported | Count of all submissions |
| Issues by status | Breakdown of current status |
| Issues by category | Breakdown of categories |
| Average resolution time | Days from Reported to Resolved |
| Upvote engagement rate | Upvotes / Issue views |
| Return rate | % users returning within 30 days |
| Report completion rate | % users completing submission |

---

## Risk and Edge Cases

### Edge Cases

| Edge Case | Handling |
|-----------|----------|
| No GPS available | Show manual location picker |
| Very poor photo quality | Allow proceed with warning |
| Offline when submitting | Queue submission, sync when online |
| Duplicate issue detected | Show existing issue, offer upvote instead |
| Issue in no-service area | Accept report, queue upload |
| Very long description | Truncate display with "show more" |
| Issue on private property | Accept, municipality can reject |
| Municipal user mistake | Allow status correction with note |

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Spam/abuse | Rate limiting, content moderation, community flags |
| Privacy violations | Terms enforcement, content review, legal contact |
| Data loss | Regular backups, redundant storage |
| Performance at scale | CDN for static, database optimization, caching |
| Municipal non-response | Public accountability (status transparency), escalation |

---

## Success Metrics

### Primary Metrics
| Metric | Target | Timeline |
|--------|--------|----------|
| Issues reported (cumulative) | 10,000 | 6 months |
| Active monthly users | 5,000 | 6 months |
| Return rate | 40% | 6 months |
| Average resolution time | Reduce by 30% | 6 months |
| Share rate | 10% of issues | 6 months |

### Secondary Metrics
| Metric | Target | Timeline |
|--------|--------|----------|
| Upvote rate | 25% of issues | 6 months |
| Municipal staff active | 20 users | 6 months |
| NPS score | >40 | 6 months |
| Pilot cities secured | 3 | 6 months |

---

## Rollout Assumptions

### Assumptions
- **RA1:** Pilot launched in single neighborhood per city (limited scope)
- **RA2:** Municipality staff manually update status initially (no integration)
- **RA3:** Images stored in cloud storage (not on server)
- **RA4:** Map tiles from open source provider (not paid)
- **RA5:** No legal review completed yet (MVP at risk)

### Dependencies
- **D1:** Cloud storage account for images
- **D2:** Map provider integration
- **D3:** Basic email infrastructure for notifications (future)
- **D4:** Municipal champion in at least one pilot city

---

## Open Questions

| Question | Impact | Resolution Path |
|-----------|--------|-----------------|
| How do municipalities actually categorize departments? | High | Interview pilot city staff |
| What happens when issue crosses department boundaries? | Medium | Manual routing for now |
| Should anonymous reports be allowed? | Medium | Yes for MVP, consider auth for v2 |
| How to handle rejected issues gracefully? | Medium | Clear rejection reason display |
| Legal liability for public issue tracking? | High | Legal counsel consultation |
| Data retention requirements? | Medium | Research Türkiye data laws |
| Integration with existing municipal systems? | Low | Not for MVP |

---

## Out of Scope Items

### Not in MVP
- User accounts/authentication (optional, future)
- Real-time notifications
- In-app commenting
- Municipal analytics dashboard
- Mobile native apps (web-only MVP)
- Multi-language support
- Offline mode
- AI issue classification
- Automated routing
- Integration with CRM/asset systems
- SMS/WhatsApp notifications
- Newsletter/marketing emails
- Community leaderboards
- Gamification points/badges
- Research/data export API

### Future Phases
These features are planned for MVP+1 or later:
- Comments on issues
- Push notifications
- Email digests
- Basic municipal dashboard
- Category refinements
- Multi-city support
- Data export

### Never (or far future)
- Government acquisition support
- Payment processing for citizens
- Political campaign tools
- Non-civic issue categories
