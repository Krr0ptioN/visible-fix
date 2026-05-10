# DELIVERABLE 3 — Market Research Plan

## Research Questions

### Primary Research Questions
1. **How do citizens currently report infrastructure issues?** What channels exist, which are used, and why do they succeed or fail?
2. **What is the pain intensity around civic issue reporting?** Quantify frustration levels, abandoned attempts, and resolution expectations.
3. **What do municipalities actually want?** Beyond stated requirements, what are the operational constraints and hidden concerns?
4. **What whitespace exists between government tools and social media?** Where do current solutions fail to deliver?
5. **What triggers municipal adoption?** What events, pressures, or champions drive decision-making?

### Secondary Research Questions
6. **What is the competitive landscape in Türkiye?** What apps, systems, and tools currently exist for citizen issue reporting?
7. **What substitute behaviors dominate?** How do citizens currently "solve" the problem when official channels fail?
8. **What procurement processes apply?** How do municipalities acquire civic tech solutions?
9. **What trust barriers exist?** How does digital trust vary by demographic, and can transparency overcome skepticism?
10. **What data availability exists?** What public data could validate market size and pain intensity?

---

## Hypotheses

### H1: Channel Fragmentation Hypothesis
Municipalities have multiple reporting channels (phone, website, app, social media) that don't connect, creating citizen confusion and duplicate work for staff.

### H2: Transparency Gap Hypothesis
Current systems provide no public visibility into issue status, creating "black hole" perception that suppresses citizen reporting motivation.

### H3: Social Proof Demand Hypothesis
Citizens would report more if they saw others caring about the same issues (social validation) rather than reporting alone.

### H4: Municipal Skepticism Hypothesis
Municipalities will resist transparent public tracking because it exposes performance, unless framed as "citizen service improvement."

### H5: Quick Win Dominance Hypothesis
Low-skill, visible issues (potholes, broken lights, trash) will generate most engagement if resolved quickly, building trust for harder issues.

### H6: Mobile-First Reality Hypothesis
All interaction must work flawlessly on mobile because desktop usage is negligible for this use case.

### H7: Trust Threshold Hypothesis
Users need only 2-3 successful experiences to build platform trust, but 1-2 failures can cause permanent abandonment.

---

## Competitor Landscape Framework

### Direct Competitors (Same Function)
| Competitor | Platform | Coverage | Features | Limitations |
|------------|----------|----------|----------|-------------|
| İBB Bizim Hat | App + Web | İstanbul only | Issue submission, tracking | No public visibility, bureaucratic UX |
| ASKİ Apps | Various | Utility-specific | Water/utility issues only | Fragmented, no cross-category |
| 153 Call Center | Phone | City-wide | Voice reports | No tracking, not self-service |
| Murakım (Bursa) | App | Bursa | Basic reporting | Limited features, regional |

### Indirect Competitors (Same Audience)
| Competitor | Platform | Coverage | Features | Limitations |
|------------|----------|----------|----------|-------------|
| Bijak Türkiye | Web | National | Consumer complaints | Not civic-focused |
| Şikayetvar | Web | National | Consumer complaints | Not civic infrastructure |
| Twitter/X Municipal | Social | City-specific | Public complaints | No structure, viral not systematic |

### Substitute Solutions
| Substitute | Usage Rate | Strengths | Weaknesses |
|------------|------------|-----------|------------|
| WhatsApp groups | High (40%+) | Direct to local contacts | Not public, no tracking |
| Local Facebook groups | Medium (25%) | Wide reach | No structure, not actionable |
| Nextdoor Türkiye | Low (<10%) | Neighborhood focus | Not issue-focused |
| Walking to municipal office | Very low | Direct interaction | Inaccessible, not scalable |

### Government Internal Tools (Not Competitors, But Context)
- CRM systems (Salesforce, Dynamics, custom)
- GIS systems for maintenance routing
- Asset management databases
- Internal workflow tools

**Key Insight:** Government internal tools are not competitors—they could become integration partners or customers if VisibleFix proves valuable as the citizen-facing layer.

---

## Municipality / City Solution Landscape

### Existing Solution Categories
1. **311-style call centers** - Phone-based intake, ticket creation, routing
2. **Citizen portal websites** - Web forms, ticket submission, basic tracking
3. **Mobile apps** - Native apps for reporting, varying quality and adoption
4. **Social media monitoring** - Manual tracking of mentions, reactive response
5. **Field worker apps** - Staff-only apps for status updates, maintenance logging
6. **CRM integration** - Citizen data in Salesforce/Dynamics/Oracle

### Solution Gaps Identified
| Gap | Current State | Desired State | Opportunity |
|-----|---------------|---------------|--------------|
| Public transparency | None | Live status visibility | Core differentiation |
| Social proof | None | Upvotes, community engagement | Engagement driver |
| Cross-channel unification | Fragmented | Single citizen view | Value add |
| Predictive maintenance | Reactive | Data-informed planning | Premium feature |
| Citizen satisfaction | Unknown | Tracked, benchmarked | ROI justification |

---

## Startup / SaaS / Civic-Tech Competitor Framework

### Global Civic Tech Models
| Model | Examples | Relevance |
|-------|----------|-----------|
| 311 SaaS | SeeClickFix, GovQA, NextRequest | Enterprise features, can be bloated |
| Issue mapping | FixMyStreet, Munimachi | Open source, limited features |
| Citizen engagement | Decidim, Consul | Participatory democracy focus |
| AI triage | 311.AI | Emerging, could be differentiator |

### Türkiye-Specific Landscape
| Competitor | Type | Notes |
|------------|------|-------|
| İBB Apps | Government | Multiple apps, fragmented |
| Belediye366 | Startup | Municipal management SaaS |
| ÇözümPark | Forum | Citizen-government mediation |

---

## Substitute Behaviors

### Current "Solutions" Citizens Use

| Behavior | % of Citizens | Trigger | Limitation |
|----------|---------------|---------|------------|
| Do nothing | 60-70% | "Nothing changes anyway" | No resolution, learned helplessness |
| Social media complaint | 15-20% | Quick venting, wants visibility | No structured follow-up |
| Call 153/156 | 10-15% | Urgent issues | No tracking, impersonal |
| WhatsApp local contacts | 5-10% | Has personal connections | Privileged, not scalable |
| Visit municipal office | <5% | Serious issues only | Inaccessible, time-consuming |

**Strategic Implication:** The 60-70% "do nothing" segment represents the core opportunity—those willing to act if reporting delivers results.

---

## Procurement Realities

### Municipal Tech Procurement in Türkiye

**Typical Process:**
1. Need identification (bottom-up from departments)
2. Budget request (October-November for next fiscal)
3. IT evaluation and security review
4. Procurement committee approval
5. Tender/RFP process (if above threshold)
6. Pilot period
7. Full deployment

**Timeline:** 6-18 months from initial interest to contract signature

**Decision Factors:**
- Cost (critical but not primary)
- Integration with existing systems
- Ease of use for citizens
- Data security and privacy
- Vendor support and SLAs

**Budget Sources:**
- Municipal general budget
- Provincial government grants
- Ministry of Environment grants (infrastructure)
- EU IPA funds (development projects)
- International development bank loans

---

## Adoption Constraints

### Citizen-Side Constraints
| Constraint | Description | Mitigation |
|------------|-------------|------------|
| Privacy concerns | Reluctance to share exact location | Approximate location option |
| Trust deficit | Skepticism anything will happen | Quick wins, transparency |
| Digital literacy | Variable across demographics | Simple UX, guided flow |
| Device limitations | Older smartphones | Progressive enhancement |
| Language barriers | For migrant populations | Multilingual support |

### Municipality-Side Constraints
| Constraint | Description | Mitigation |
|------------|-------------|------------|
| Transparency fear | Exposes slow response times | Frame as improvement, not monitoring |
| Integration complexity | Multiple legacy systems | Start standalone, integrate later |
| Staffing limitations | No dedicated tech support | Managed service model |
| Data sovereignty | Government data requirements | Local deployment options |
| Legal liability | Public platform risks | Terms of service, moderation |

---

## Digital Trust Constraints

### Trust Factors by Demographic
| Factor | Young (18-30) | Middle (30-50) | Older (50+) |
|--------|---------------|----------------|--------------|
| Platform trust | Low | Medium | Low |
| Government trust | Very low | Low | Medium |
| Social proof impact | High | High | Medium |
| Data sharing comfort | Medium | Low | Very low |
| Mobile preference | Very high | High | Medium |

### Trust-Building Mechanisms
1. **Transparency:** Show everything, hide nothing
2. **Social proof:** Others using and benefiting
3. **Quick resolution:** Early wins build confidence
4. **Consistency:** Reliable status updates
5. **Community:** Real users, not bots

---

## Operational Workflow Constraints

### Municipal Workflow Realities
1. **Siloed departments:** Roads, lighting, waste, water—each handles specific issues
2. **Field-based work:** Most resolution happens outdoors, limited digital access
3. **Budget cycles:** Repair decisions tied to annual budget allocation
4. **Seasonal patterns:** Winter damage, summer maintenance, tourism peaks
5. **Staff limitations:** Few people, many responsibilities

### Integration Considerations
- Start as standalone (easiest path)
- Later: API for CRM integration
- Later: Field worker mobile app
- Later: GIS/asset management sync

---

## Research Plan Components

### 1. Desk Research Plan

#### Official Sources
- Turkish Statistical Institute (TÜİK) urban data
- Ministry of Environment urban infrastructure reports
- Municipal annual reports from pilot cities
- KOSGEB entrepreneurship data
- Startup ecosystem reports (DBI, Endeavor)

#### App Store Analysis
- Google Play and App Store search for "belediye," "şikayet," "altyapı"
- Download counts, ratings, reviews for existing solutions
- Feature analysis of top 10 civic apps

#### Municipal Source Audit
- City websites for existing reporting tools
- 153/156 call center information
- Open data portal availability
- Smart city initiative documentation

#### News & Media
- Local news coverage of infrastructure issues
- Municipal technology adoption stories
- Civic tech startup coverage

#### Academic Sources
- ITU, Boğaziçi, ODTÜ urban planning research
- SDG 11 implementation papers
- E-government transformation studies

#### Search Strategies
```
Türkiye:
- "belediye mobil uygulama 2024"
- "akıllı şehir belediye"
- "vatandaş şikayet sistemi"
- "altyapı sorunu bildirim"
- "İzmir belediye inovasyon"

Middle-income countries:
- "civic tech Brazil municipality"
- "citizen reporting India urban"
- "smart city Mexico civic engagement"
```

#### Competitor Classification Taxonomy
```
Level 1: Direct (Same function)
Level 2: Indirect (Same audience)  
Level 3: Substitute (Same problem solved differently)
Level 4: Government internal (Integration potential)
```

#### Data Extraction Schema
| Field | Source Type | Extraction Method |
|-------|-------------|-------------------|
| App name | App stores | Manual + automated |
| Downloads | App stores | Scraped/ranked |
| Rating | App stores | Scraped |
| Reviews | App stores | Sampled (50/app) |
| Features | App description | Manual extraction |
| Last updated | App stores | Auto-captured |
| Company | App stores | Manual research |

---

### 2. Primary Research Plan

#### Interview Guide: Citizens (n=30)

**Recruitment:** Social media ads, neighborhood associations, online panels
**Method:** 30-minute semi-structured interviews

**Script Outline:**
1. Warm-up: Demographics, neighborhood, commute patterns
2. Discovery: Last time they reported an issue, what happened
3. Pain mapping: Tried to fix? What stopped them? How frustrating?
4. Current behavior: How do they currently handle issues?
5. Value test: Would X feature help? (presented concepts)
6. Pricing: Would they pay? (hypothetical)
7. Closing: What would make this essential?

**Key Questions:**
- "Can you tell me about a time you tried to report a city infrastructure issue?"
- "What happened after you submitted the report?"
- "What would make you feel like reporting actually matters?"
- "If you could see all the issues in your neighborhood on a map, would that change how you report?"

#### Interview Guide: Municipal Staff (n=15)

**Recruitment:** LinkedIn outreach, municipal innovation events, warm intros
**Method:** 45-minute executive-level interviews

**Script Outline:**
1. Role: Department, responsibilities, tenure
2. Current state: How do citizens report? What happens?
3. Pain points: What's broken? What's frustrating?
4. Data needs: What would help? What's missing?
5. Adoption concerns: What worries you about public transparency?
6. Procurement: How would you acquire something like this?
7. Vision: What would the ideal solution look like?

**Key Questions:**
- "Walk me through what happens when a citizen reports a pothole."
- "What frustrates you most about the current process?"
- "If you could know instantly about every infrastructure problem in your district, what would you do with that information?"
- "What concerns would you have about making issue status public?"

#### Interview Guide: Field Workers (n=10)

**Recruitment:** Through municipal contacts
**Method:** 30-minute on-site or phone interviews

**Script Outline:**
1. Role: Daily responsibilities, typical day
2. Issue flow: How do they receive work orders?
3. Feedback: Do they know when issues are resolved? Citizens ask?
4. Tech comfort: What tools, what works, what doesn't
5. Improvement: What would make their job easier?

**Key Questions:**
- "How do you know where to go each day?"
- "Do citizens ever stop you about issues? What happens?"
- "If citizens could directly tell you about problems, how would that change things?"

#### Founder Discovery Scripts

**For co-founders/early employees of civic tech startups:**
1. Origin story: Why this problem? What did you learn?
2. Go-to-market: How did you acquire customers?
3. Growth: What worked? What failed?
4. Metrics: What numbers matter? What have you achieved?
5. Advice: What would you do differently? What should we know?

#### Survey Draft Questions

**Citizen Pain Survey (n=500)**

| Question | Type | Options |
|----------|------|---------|
| How often do you encounter infrastructure issues? | Frequency | Daily/Weekly/Monthly/Rarely |
| Have you ever tried to report an issue? | Binary | Yes/No |
| What channel did you use? | Multi-select | App/Website/Phone/Social media/Other |
| Did you receive follow-up? | Binary | Yes/No |
| Was the issue resolved? | Binary | Yes/No/No attempt |
| How satisfied are you with municipal response? | Scale | 1-10 |
| What would increase your reporting? | Open-ended | Text |
| Would you use an app that shows all issues publicly? | Binary | Yes/No |
| Would you upvote issues affecting you? | Scale | 1-5 |
| What features would you want? | Multi-select | Map/Status/Upvotes/Comments/Alerts |

---

### 3. Data Science / Market Validation Plan

#### Datasets to Acquire/Estimate

| Dataset | Source | Method | Use Case |
|---------|--------|--------|----------|
| City populations | TÜİK | Download | Market sizing |
| Infrastructure budgets | Municipal reports | Extract | Budget availability |
| 311 call volume | FOI requests | Request | Baseline metrics |
| App download data | App stores | Scrape | Competitive analysis |
| Issue frequency | Municipal data | Negotiate | Demand validation |
| Social media volume | Social APIs | Estimate | Substitute behavior |

#### Proxy Indicators for Demand

| Indicator | Proxy For | Measurement |
|-----------|-----------|--------------|
| # infrastructure-related tweets | Issue prevalence | Twitter API search |
| # neighborhood Facebook groups | Community organizing | Manual count |
| 153 call volume | Citizen reporting intent | FOI request |
| Search volume for "belediye şikayet" | Demand | Google Trends |
| App store search ranking | Interest | Regular tracking |

#### Measurable Indicators for Validation

| Indicator | Target | Measurement |
|-----------|--------|-------------|
| Survey pain score | >7/10 | Quantitative |
| Report attempt rate | >40% | Behavioral |
| Channel satisfaction | <3/10 | Quantitative |
| NPS if issue resolved | >50 | Post-resolution survey |
| Interest in public map | >60% | Survey question |
| Willingness to pay | >25% | Pricing question |

#### City Attractiveness Scoring Model

| Factor | Weight | Indicators |
|--------|--------|-------------|
| Population | 20% | 750K-2M optimal |
| Digital maturity | 20% | Existing apps, innovation office |
| Infrastructure gaps | 15% | News, budget data |
| Political will | 15% | Champion interviews |
| Budget availability | 15% | Municipal reports |
| Competitive intensity | 10% | App analysis |
| Community readiness | 5% | Association density |

---

## Validation Evidence Standards

### Strong Validation (Go)
- >60% survey respondents indicate high pain (7+/10)
- >30% report attempt rate in behavioral data
- >3 municipal interviews express pilot interest
- >50% interest in concept from citizen interviews
- Clear competitor gap identified with evidence

### Weak Validation (Iterate)
- Inconsistent survey results
- Mixed municipal signals
- High competitive intensity
- Unclear differentiation

### No Validation (Pivot)
- <40% pain recognition
- No municipal interest after 10+ outreach
- Strong alternative already exists
- Market too small or competitive
