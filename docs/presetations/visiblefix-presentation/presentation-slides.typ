#import "@preview/touying:0.5.3": *
#import themes.simple: *
#show: simple-theme.with(aspect-ratio: "16-9")

#let accent_color = rgb(0, 77, 142)
#let muted_color = rgb(46,46,46)

// Title slide
#title-slide[
  #text(size: 56pt, weight: 900)[VisibleFix]
  
  #v(0.5em)
  #text(size: 22pt, fill: accent_color, weight: "bold")[Infrastructure is broken]
  
  #v(2em)
  #text(size: 16pt, fill: muted_color)[
    Civic Transparency Through Public Visibility
    
    SDG9: Industry, Innovation & Infrastructure
  ]
]

// Problem slide
#slide[
  #align(left)[
    #text(size: 14pt, weight: "bold", fill: accent_color)[THE PROBLEM]
    
    #v(0.5em)
    #text(size: 36pt, weight: 900)[Nobody knows]
    #text(size: 36pt, weight: 900)[if anything]
    #text(size: 36pt, weight: 900)[gets fixed]
    
    #v(1em)
    #text(size: 18pt, fill: muted_color)[
      Report -> Government Black Hole -> ???
    ]
    
    #v(1.5em)
    #text(size: 20pt, weight: "bold", fill: accent_color)[
      "I reported a pothole 3 weeks ago. No idea if anyone saw it."
    ]
  ]
]

// Critical insight
#slide[
  #align(center)[
    #text(size: 14pt, weight: "bold", fill: accent_color)[THE INSIGHT]
    
    #v(1em)
    #text(size: 42pt, weight: 900)[A problem is]
    #text(size: 42pt, weight: 900)[not a problem]
    #text(size: 42pt, weight: 900)[until someone]
    #text(size: 42pt, weight: 900)[complains]
    
    #v(1.5em)
    #box(fill: rgb(26, 26, 46), inset: 1.5em)[
      #text(size: 18pt, fill: white)[
        Infrastructure that nobody notices 
        = infrastructure that doesn't matter
      ]
    ]
  ]
]

// Data slide
#slide[
  #align(left)[
    #text(size: 14pt, weight: "bold", fill: accent_color)[THE MISSING DATA]
    
    #v(1em)
    #text(size: 28pt, weight: 900)[Municipalities have:]
    #text(size: 18pt, fill: muted_color)[Inspector schedules · Budget cycles · Contractor reports]
    
    #v(1em)
    #text(size: 28pt, weight: 900)[Municipalities missing:]
    #text(size: 18pt, fill: accent_color, weight: "bold")[What citizens actually notice]
    
    #v(2em)
    #text(size: 32pt, weight: 900)[The complaint = the data point]
  ]
]

// Solution slide
#slide[
  #align(left)[
    #text(size: 14pt, weight: "bold", fill: accent_color)[THE SOLUTION]
    
    #v(0.5em)
    #text(size: 48pt, weight: 900)[Make it visible]
    
    #v(1em)
    #text(size: 20pt)[
      #box(fill: rgb(224, 224, 224), inset: 0.8em)[Old: Submit -> Black hole]
      #v(0.5em)
      #box(fill: rgb(200, 230, 201), inset: 0.8em)[New: Report -> Public -> Upvotes -> Pressure -> Fix]
    ]
    
    #v(1.5em)
    #text(size: 16pt, weight: "bold")[Core:]
    #text(size: 16pt)[Report · Track · Upvote · Public Map]
  ]
]

// Features slide
#slide[
  #align(left)[
    #text(size: 14pt, weight: "bold", fill: accent_color)[WHAT WE BUILD]
    
    #v(1em)
    #grid(
      columns: (1fr, 1fr),
      gutter: 1.5em,
      [
        #text(size: 24pt, weight: 900)[Report]
        #text(size: 16pt, fill: muted_color)[Photo + location + category in 30 seconds]
      ],
      [
        #text(size: 24pt, weight: 900)[Track]
        #text(size: 16pt, fill: muted_color)[Reported -> Acknowledged -> In Progress -> Fixed]
      ],
      [
        #text(size: 24pt, weight: 900)[Upvote]
        #text(size: 16pt, fill: muted_color)["This affects me too" - quantifies impact]
      ],
      [
        #text(size: 24pt, weight: 900)[Visible]
        #text(size: 16pt, fill: muted_color)[Public map - anyone can see anything]
      ],
    )
    
    #v(2em)
    #text(size: 28pt, weight: 900)[Social pressure = accountability]
  ]
]

// SDG9 slide
#slide[
  #align(center)[
    #text(size: 14pt, weight: "bold", fill: accent_color)[SDG9 ALIGNMENT]
    
    #v(1em)
    #text(size: 40pt, weight: 900)[What people report]
    #text(size: 40pt, weight: 900)[= what matters]
    
    #v(1.5em)
    #text(size: 16pt, fill: muted_color)[Every citizen = a sensor]
    #text(size: 16pt, fill: muted_color)[Resources - where citizens notice]
    #text(size: 16pt, fill: muted_color)[Infrastructure maintained before crisis]
  ]
]

// Market slide
#slide[
  #align(left)[
    #text(size: 14pt, weight: "bold", fill: accent_color)[MARKET]
    
    #v(0.5em)
    #text(size: 48pt, weight: 900)[8,900+]
    #text(size: 18pt, fill: muted_color)[US municipalities]
    
    #v(1em)
    #text(size: 48pt, weight: 900)[100,000+]
    #text(size: 18pt, fill: muted_color)[Global]
    
    #v(1.5em)
    #text(size: 20pt, weight: "bold")[Pricing:]
    #text(size: 16pt)[Small: 5K USD/yr · Medium: 15K USD/yr · Large: 40K USD/yr]
  ]
]

// Impact slide
#slide[
  #align(left)[
    #text(size: 14pt, weight: "bold", fill: accent_color)[IMPACT]
    
    #v(1em)
    #text(size: 24pt, weight: 900)[Engagement]
    #text(size: 16pt, fill: muted_color)[Active reporters · Reports per 1K residents]
    
    #v(1em)
    #text(size: 24pt, weight: 900)[Outcome]
    #text(size: 16pt, fill: muted_color)[Report-to-fix time · 30/60/90 day resolution]
    
    #v(1em)
    #text(size: 24pt, weight: 900)[Perception]
    #text(size: 16pt, fill: muted_color)[Issue density per capita · Civic trust velocity]
  ]
]

// Closing slide
#title-slide[
  #text(size: 42pt, weight: 900)[Infrastructure that matters]
  #text(size: 42pt, weight: 900)[= infrastructure people report]
  
  #v(2em)
  #text(size: 20pt, fill: accent_color, weight: "bold")[
    Every citizen deserves visibility
  ]
  
]
