#import "@local/mardincc-typst:0.1.0": *
#import "./system-flowchart.typ": research-system-flowchart

#let project-title = "VisibleFix: Civic Transparency Platform for Infrastructure Issue Reporting"

#show: project-research-template.with(
  title: project-title,
  subtitle: "Project-Problem-Solution Plan",
  author: "Mardin Nasouti, Emir Şahin",
  institution: "Acibadem University",
  department: "Computer and Systems Engineering",
  course: "ACU-315 UN Sustainability and Development",
  supervisors: ("Fatma Akgun", "Gunay Anacak"),
  keywords: (
    "Civic Transparency",
    "Infrastructure",
    "Issue Reporting",
    "Open Data",
    "Community Engagement",
  ),
)

#set text(size: 11pt)
#set par(leading: 0.7em)
#let accent = rgb("#1F3F74")
#let ui = (
  heading: rgb("#1F3F74"),
  subheading: rgb("#33568B"),
  accent: accent,
)
#show heading.where(level: 2): set block(above: 0.8em, below: 0.28em)
#show heading.where(level: 3): set block(above: 0.9em, below: 0.34em)
#show heading.where(level: 3): set text(fill: ui.accent, weight: "semibold")

#set list(marker: [#text(fill: ui.heading)[•]])

#set table(
  stroke: (x, y) => if y == 0 { 0.85pt + rgb("#7E8AA3") } else { 0.55pt + rgb("#AEB9CD") },
  inset: (x: 7pt, y: 5.5pt),
  fill: (x, y) => if y == 0 { rgb("#EAF0FF") } else if calc.rem(y, 2) == 0 { rgb("#F8FAFF") } else { white },
)
#show table.cell: set par(justify: false)

#let section-title(number, title, subtitle: none) = [
  #heading(level: 2)[#title]
  #if subtitle != none [
    #text(size: 9pt, fill: ui.subheading)[#subtitle]
  ]
]

#let subsection-title(label) = [
  #heading(level: 3, numbering: none)[#label]
  #v(0.3em)
]

= Project Form

#section-title(1, [Project title])

#v(0.4em)

#text(weight: "bold")[#project-title]

#v(0.4em)

#section-title(2, [Project description], subtitle: [Problem framing and measurable objectives.])

#subsection-title([Project objectives])

- Create a mobile-first platform for citizens to report infrastructure issues (potholes, broken streetlights, signage damage).
- Build a transparent, real-time dashboard showing issue status and municipal response times.
- Establish a community-driven data layer to identify systemic infrastructure neglect patterns.
- Reduce the "black hole effect" where citizen reports disappear without response or visibility.

#subsection-title([Problem statement])
#text(fill: ui.accent)[Infrastructure visibility gap]: Municipalities often lack real-time data on infrastructure conditions. Citizens report issues through fragmented channels (phone calls, social media, in-person visits) that lack transparency on resolution status.

#text(fill: ui.accent)[The Black Hole Effect]: 78% of citizen reports go unacknowledged for 30+ days. Citizens experience #text(weight: "bold")[learned helplessness] — they stop reporting issues because they believe nothing will be done.

#text(fill: ui.accent)[Our solution]: VisibleFix makes infrastructure reporting visible, trackable, and data-driven. Reports are geotagged, categorized, and mapped publicly. Municipalities gain a prioritized action list; citizens regain trust in civic engagement.

#v(0.4em)

#section-title(3, [Project design], subtitle: [Method, workflow, and system architecture.])

#subsection-title([Activities to achieve objectives])
#v(0.22em)
- Build mobile app with camera-first reporting, GPS auto-tagging, and category selection.
- Implement admin dashboard for municipal and volunteers teams to update issue status (Received → In Progress → Resolved).
- Create public map view showing all reported issues with status indicators.
- Develop analytics module to identify hotspots and track resolution times.

#table(
  columns: (1fr, 1.2fr, 1.8fr),
  align: (x, y) => if y == 0 { center + horizon } else if x == 0 { center + horizon } else { left + horizon },
  table.header([*System layer*], [*Design component*], [*Purpose in this project*]),
  [Input layer], [Mobile app + Web form], [Citizen reports with photo, location, category.],
  [Processing layer], [Issue triage engine], [Prioritize by severity, category, and geographic cluster.],
  [Analytics layer], [Resolution dashboard], [Track response times, identify systemic issues, generate reports.],
  [Output layer], [Public map + Municipal API], [Transparent status tracking and data-driven municipal planning.],
)

#v(0.4em)

#section-title(4, [Timeline-work table], subtitle: [MVP execution plan by week.])
Implementation window: Week 1 to Week 8.

#v(0.32em)

#table(
  columns: (0.15fr, 0.3fr, 1.2fr),
  align: (x, y) => if y == 0 { center + horizon } else if x == 0 { center + horizon } else { left + top },
  table.header(
    [*Week*],
    [*Phase*],
    [*Key output (end of week)*],
  ),

  [1-2],
  [Research],
  [User interviews (10+ citizens) feature prioritization.],

  [3-4],
  [Design],
  [Wireframes, UI prototype, database schema, API specification.],

  [5-6],
  [Development],
  [MVP mobile app (iOS/Android), admin dashboard, public map view, backend API.],

  [7],
  [Testing],
  [Beta testing with 3 users, bug fixes, performance optimization, security audit.],

  [8],
  [Launch],
  [Soft launch to pilot neighborhood, initial marketing.],
)

#v(0.4em)

#section-title(5, [Budget - estimated MVP cost], subtitle: [Resource planning for 8-week MVP launch.])

#table(
  columns: (2.2fr, 1fr),
  align: (x, y) => if y == 0 or x == 1 { center + horizon } else { left + horizon },
  table.header([*Budget item*], [*Estimated cost*]),
  [Development (3-month runway - 2 devs)], [TRY 0],
  [Infrastructure (cloud, hosting, CDN)], [500 TRY],
  [UI/UX design], [TRY 0],
  [Initial marketing], [Not Estimated],
  [*Estimated total*], [Above #text(weight: "bold")[1000 TRY]],
)

#v(0.32em)

#text(fill: ui.accent)[Funding strategy]: Pre-seed: Founder equity. Post-MVP: Seek 50K accelerator or municipal pilot funding.

#v(0.4em)

#section-title(7, [Impact and dissemination], subtitle: [Expected outcomes and growth strategy.])

#subsection-title([Expected outcomes])
- #text(fill: ui.accent)[10+ active reporters] within first week of post-launch.
- #text(fill: ui.accent)[Open dataset] of infrastructure conditions shared publicly (quarterly).
- Launch announcement via local media, social clubs in our university.

#v(0.6em)

#text(size: 9pt, fill: luma(60%))[Generated for VisibleFix MVP Development | Lean Startup Methodology]
