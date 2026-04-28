#import "@preview/touying:0.5.3": *
#import themes.simple: *
#show: simple-theme.with(aspect-ratio: "16-9")

// Import local slide components
#import "components/slide-components.typ": *

// ============================================
// SLIDE DECK CONTENT
// ============================================

// Title slide - SDG9 Focus
#title-slide(
  title: "United Nations Sustainable Development Goal 9",
  subtitle: "Why We Should All Work Toward SDG 9",
  contact: "VisibleFix Alignment | Industry, Innovation & Infrastructure",
)

// What is SDG 9?
#content-slide(
  header: "SUSTAINABLE DEVELOPMENT GOAL 9",
)[
  #text(size: 24pt, weight: "bold")[Build resilient infrastructure]
  #v(0.3em)
  #text(size: 24pt, weight: "bold")[Promote inclusive and sustainable industrialization]
  #v(0.3em)
  #text(size: 24pt, weight: "bold")[Foster innovation]
  #v(1.5em)
  #highlight-box[
    #text(size: 14pt)[
      Target 9.a: "Develop quality, reliable, sustainable and 
      resilient infrastructure, including regional and transborder 
      infrastructure, to support economic development and 
      human well-being"
    ]
  ]
]

// Why SDG 9 Matters - The Foundation
#content-slide(
  header: "WHY SDG 9 MATTERS",
)[
  #text(size: 28pt, weight: "bold")[Infrastructure is the backbone]
  #text(size: 28pt, weight: "bold")[of modern society]
  #v(1em)
  #highlight-box(bg: accent_dark, text-color: white)[
    #text(size: 14pt, fill: white)[
      Without reliable infrastructure, there can be no:
      #v(0.3em)
      • Economic growth
      • Healthcare delivery
      • Education access
      • Safe communities
      • Quality of life
    ]
  ]
]

// The Critical Problem - The Gap
#content-slide(
  header: "THE PROBLEM",
)[
  #text(size: 26pt, weight: "bold")[Governments don't know]
  #text(size: 26pt, weight: "bold")[what citizens actually face]
  #v(0.8em)
  #text(size: 16pt, fill: muted_color)[Traditional infrastructure management:]
  #v(0.3em)
  #highlight-box(bg: rgb(245, 245, 245))[
    #text(size: 13pt)[
      • Drive around looking for issues
      • Budget-driven prioritization
      • Inspector schedules vs. citizen needs
    ]
  ]
  #v(0.6em)
  #text(size: 18pt, weight: "bold", fill: highlight)[They're flying blind.]
]

// The VisibleFix Solution
#content-slide(
  header: "THE SOLUTION",
)[
  #text(size: 28pt, weight: "bold")[Every citizen = a sensor]
  #v(0.8em)
  #highlight-box(bg: rgb(200, 230, 201))[
    #text(size: 16pt)[What people report = what matters]
  ]
  #v(1em)
  #text(size: 14pt, fill: muted_color)[VisibleFix transforms:]
  #v(0.3em)
  #text(size: 13pt)[
    • #text(weight: "bold")[Citizen complaints] → #text(weight: "bold")[Data points]
    • #text(weight: "bold")[Individual reports] → #text(weight: "bold")[Public visibility]
    • #text(weight: "bold")[Invisible issues] → #text(weight: "bold")[Social accountability]
  ]
]

// SDG9 Alignment - The Framework
#content-slide(
  header: "SDG 9 ALIGNMENT",
)[
  #text(size: 20pt, weight: "bold")[How VisibleFix Advances SDG 9]
  #v(0.8em)
  #text(size: 14pt)[
    #text(weight: "bold")[1. Resilient infrastructure] #h(0.5em)→ Issues identified before becoming crises
  ]
  #v(0.3em)
  #text(size: 14pt)[
    #text(weight: "bold")[2. Inclusive participation] #h(0.5em)→ Every citizen = infrastructure stakeholder
  ]
  #v(0.3em)
  #text(size: 14pt)[
    #text(weight: "bold")[3. Data-driven investment] #h(0.5em)→ Resources flow to where problems exist
  ]
  #v(0.3em)
  #text(size: 14pt)[
    #text(weight: "bold")[4. Innovation in governance] #h(0.5em)→ Technology bridges government-citizen gap
  ]
]

// Why We Must Act - The Urgency
#quote-slide(
  header: "THE URGENCY",
  quote: [78% of citizen reports go unacknowledged for 30+ days],
  attribution: "Citizens stop reporting. They experience \"learned helplessness\"",
)

// The Impact - Why It Matters
#content-slide(
  header: "WHY THIS MATTERS",
)[
  #text(size: 22pt, weight: "bold")[Direct Impact]
  #v(0.3em)
  #text(size: 14pt)[
    • Faster issue resolution through public visibility
    • Resource allocation based on citizen priorities
    • Restored trust between governments and citizens
  ]
  #v(1em)
  #text(size: 22pt, weight: "bold")[Systemic Impact]
  #v(0.3em)
  #text(size: 14pt)[
    • Infrastructure maintained proactively, not reactively
    • Data-driven municipal planning
    • Empowered civic engagement
  ]
]

// Call to Action
#title-slide(
  title: "JOIN THE MOVEMENT",
  subtitle: "The infrastructure that matters = infrastructure people report",
  contact: "Every citizen deserves visibility. | partnerships@visiblefix.org",
)