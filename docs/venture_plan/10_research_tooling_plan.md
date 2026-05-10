# DELIVERABLE 10 — Research Automation / Tooling Plan

## Research Tooling Overview

This section outlines internal tools and scripts to assist research and validation for this civic tech startup. Each tool is designed to automate data collection, normalize information, and accelerate market understanding.

---

## Tool 1: Municipal Portal Inventory Crawler

### Purpose
Automatically discover and catalog all municipal reporting channels in target cities.

### Inputs
- List of city names (Türkiye cities)
- Search queries (municipality, reporting, 153, app keywords)

### Outputs
- JSON file with: portal URLs, app store links, 153 numbers, social media accounts
- Classification: portal/app/phone/social

### Data Model
```typescript
interface MunicipalPortal {
  city: string;
  name: string;
  website: string;
  reportingPortal?: string;
  mobileApp?: { ios: string; android: string };
  phone: string;
  socialMedia: { twitter?: string; facebook?: string; instagram?: string };
  lastVerified: Date;
}
```

### Stack
- Node.js + Puppeteer (for dynamic sites)
- CLI tool
- JSON output

### Automation Level
- Fully automated crawling
- Manual verification recommended for critical data

---

## Tool 2: App Review Miner

### Purpose
Extract and analyze reviews from existing civic apps to identify pain points and feature gaps.

### Inputs
- App Store URLs (Google Play, iOS)
- Review count to fetch (default: 100 per app)

### Outputs
- CSV with: app name, rating, date, review text, sentiment score
- Summary: top complaints, top praise

### Data Model
```typescript
interface AppReview {
  appName: string;
  platform: 'ios' | 'android';
  rating: number;
  date: string;
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords: string[];
}
```

### Stack
- Python + Google Play scraper + App Store API
- Jupyter notebook for analysis

### Automation Level
- Automated scraping
- Manual keyword tagging for insight

---

## Tool 3: Competitor Catalog Builder

### Purpose
Maintain a living database of all competitors in the civic tech space.

### Inputs
- Market research findings
- New app discoveries

### Outputs
- Structured Notion/SQL database
- Dashboard view

### Data Model
```typescript
interface Competitor {
  name: string;
  type: 'direct' | 'indirect' | 'substitute' | 'government';
  description: string;
  features: string[];
  pricing: { type: string; amount: number }[];
  coverage: string[];
  launchDate: Date;
  funding: string;
  lastUpdated: Date;
}
```

### Stack
- Notion API or SQLite
- Web dashboard

### Automation Level
- Manual entry with structured templates
- Automated enrichment from public data

---

## Tool 4: Issue Taxonomy Builder

### Purpose
Create and maintain a structured taxonomy of civic issues for classification.

### Inputs
- Existing civic issue datasets
- Municipal categorization systems
- Survey results

### Outputs
- Hierarchical taxonomy JSON
- Mapping to categories/subcategories
- Arabic/Turkish/English labels

### Data Model
```typescript
interface IssueTaxonomy {
  id: string;
  name: { tr: string; en: string };
  description: string;
  parent: string | null;
  keywords: string[];
  department: string;
  severity: 'low' | 'medium' | 'high';
}
```

### Stack
- Python + JSON
- Web UI for editing

### Automation Level
- Manual creation based on research
- Automated keyword extraction

---

## Tool 5: City Attractiveness Scoring Notebook

### Purpose
Score and rank cities for market entry prioritization.

### Inputs
- Population data
- Infrastructure budgets
- Digital maturity indicators
- Competitive intensity
- Political will signals

### Outputs
- Ranked city list with scores
- Recommendation matrix

### Data Model
```typescript
interface CityScore {
  city: string;
  population: number;
  digitalScore: number;      // 0-100
  infrastructureScore: number; // 0-100
  competitiveScore: number;    // 0-100
  politicalScore: number;     // 0-100
  overallScore: number;      // Weighted average
  recommendation: 'high' | 'medium' | 'low';
}
```

### Stack
- Jupyter/Colab notebook
- Python + Pandas

### Automation Level
- Automated data collection where possible
- Manual scoring for qualitative factors

---

## Tool 6: Survey Result Analyzer

### Purpose
Process and visualize survey data from citizen research.

### Inputs
- Raw survey responses (CSV)
- Question metadata

### Outputs
- Statistical summary
- Visualization charts
- Key insights

### Stack
- Python + Pandas + Matplotlib
- Streamlit dashboard

### Automation Level
- Fully automated analysis
- Manual interpretation

---

## Tool 7: User Interview Note Parser

### Purpose
Transcribe and extract structured insights from user interviews.

### Inputs
- Interview transcripts (text/audio)
- Interview metadata

### Outputs
- Structured notes in Notion/JSON
- Pain point extraction
- Feature request tagging

### Stack
- Python for text processing
- Manual transcription (or Whisper API)

### Automation Level
- Manual transcription
- Automated keyword extraction

---

## Tool 8: PRD Generator from Structured Inputs

### Purpose
Generate a PRD skeleton from structured product inputs.

### Inputs
- Feature list
- User personas
- Success metrics

### Outputs
- Markdown PRD document
- Section templates

### Stack
- TypeScript CLI
- Template engine

### Automation Level
- Fully automated skeleton generation
- Manual content filling

---

## Tool 9: API Schema Generator from PRD

### Purpose
Generate API schema from PRD requirements.

### Inputs
- PRD document
- Entity definitions

### Outputs
- OpenAPI spec (YAML)
- TypeScript interfaces

### Stack
- TypeScript CLI
- OpenAPI generator

### Automation Level
- Automated from structured input

---

## Tool 10: Design Token Scaffold Generator

### Purpose
Generate design tokens from brand guidelines.

### Inputs
- Brand colors (hex)
- Typography specs
- Spacing system

### Outputs
- CSS variables
- Tailwind config
- React Native StyleSheet

### Stack
- TypeScript CLI
- Template files

### Automation Level
- Fully automated

---

## Recommended Tools to Build First (Priority Order)

### Phase 1: Foundation (Weeks 1-2)
1. **City Attractiveness Scoring Notebook** - For initial market research
2. **Survey Result Analyzer** - For validating pain hypotheses
3. **Municipal Portal Inventory** - For competitive analysis

### Phase 2: Validation (Weeks 3-4)
4. **Competitor Catalog Builder** - For ongoing competitive tracking
5. **App Review Miner** - For product gap analysis

### Phase 3: Execution (Weeks 5+)
6. **Issue Taxonomy Builder** - For product classification
7. **PRD Generator** - For fasterPRD creation

### Phase 4: Scale (Later)
8. **User Interview Parser** - For research scaling
9. **API Schema Generator** - For development acceleration
10. **Design Token Generator** - For consistent UI

---

## Legal / Ethical Caveats

### Data Collection
- **App reviews:** Follow platform terms of service, don't overload servers
- **Public data:** Ensure compliance with GDPR, KVKK for Türkiye
- **Scraping:** Check robots.txt, respect rate limits

### Privacy
- **Interview data:** Get consent, store securely, anonymize for analysis
- **Personal data:** Don't collect without clear purpose

### Usage
- **Research only:** Tools are for internal research, not competitive intelligence abuse
- **Attribution:** Credit sources appropriately
- **Accuracy:** Verify automated analysis, don't trust blindly
