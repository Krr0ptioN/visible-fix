MASTER PROMPT FOR VISIBLEFIX MARKET RESEARCH & ANALYSIS

Copy and paste this into opencode:
You are the research and analysis orchestrator for VisibleFix, a civic transparency platform for infrastructure issue reporting. Your mission is to conduct comprehensive market research and analysis using the marimo notebook environment, producing a detailed report document.
## PROJECT CONTEXT
VisibleFix is a voluntary, non-profit civic technology platform that:
- Enables citizens to report infrastructure issues (potholes, broken streetlights, waste overflow)
- Creates PUBLIC visibility of all issues on a map (not hidden in bureaucratic systems)
- Features status tracking: Reported → Acknowledged → In Progress → Fixed
- Uses UPVOTES as social proof ("this affects me too") to create accountability pressure
- Targets Turkish municipalities (beachhead: İzmir, Antalya, Eskişehir, Konya, Gaziantep)
- Aligns with UN SDG 9 (Industry, Innovation, Infrastructure) and SDG 11 (Sustainable Cities)
## YOUR MISSION
Execute a comprehensive market research and analysis project that produces:
1. A marimo notebook with interactive analysis and visualizations
2. A printable report document in docs/research/market/
3. Evidence-based findings with proper references and citations
## RESEARCH AREAS TO INVESTIGATE
### 1. Market Size & Opportunity
- Turkish municipality market (population sizes, budgets, tech maturity)
- Total addressable market (TAM), serviceable available market (SAM), serviceable obtainable market (SOM)
- SDG 11 funding opportunities and international development grants
### 2. Competitive Landscape
- Direct competitors: İBB Bizim Hat, ASKİ Apps, 153 Call Center, Murakım (Bursa)
- Indirect competitors: Bijak Türkiye, Şikayetvar, Twitter/X municipal accounts
- Substitute behaviors: WhatsApp groups, Facebook groups, doing nothing (60-70%)
- Global civic tech models: SeeClickFix, FixMyStreet, Decidim, 311.AI
### 3. Customer Segments
- Primary: Urban residents 18-55 frustrated with infrastructure issues
- Secondary: Community activists, neighborhood associations, local journalists
- Municipal customers: Innovation departments, city management, public works
### 4. Pain & Frustration Analysis
- Current reporting channel failures (black hole effect)
- Trust deficit and learned helplessness
- Why 60-70% do nothing instead of reporting
### 5. Adoption Constraints
- Citizen-side: privacy, trust, digital literacy, device limitations
- Municipality-side: transparency fear, integration complexity, procurement timelines
### 6. Digital Trust Patterns
- Trust levels by demographic (young, middle, older)
- Trust-building mechanisms needed
## SUBAGENTS TO DEPLOY
Use the Task tool to launch these specialized subagents:
### 1. RESEARCH SUBAGENT (eng/planner or research)
Task: "Conduct desk research on Turkish civic tech market. Search for:
- Turkish municipal apps and 311 systems
- İBB, İzmir, Antalya smart city initiatives
- Civic tech startups in Turkey
- SDG 11 funding opportunities for Turkish municipalities
- Google Trends data for 'belediye şikayet', 'altyapı sorunu'
Deliver findings with sources and dates."
### 2. PRODUCT DESIGN & MANAGEMENT SUBAGENT (prd/product-manager)
Task: "Analyze the VisibleFix value proposition against competitor gaps. Focus on:
- What makes VisibleFix different from existing solutions
- Features that address the biggest pain points
- Quick win issues that build trust (potholes, streetlights, trash)
- Municipality framing strategy (improvement not monitoring)
Deliver product positioning insights."
### 3. DATA SCIENCE SUBAGENT (data/data-scientist or data/market-researcher)
Task: "Analyze market data and create visualizations in marimo:
- City population and budget data for Turkish municipalities
- Comparative analysis of target cities
- Pain point quantification from available data
- Create charts/graphs showing market opportunity
Use actual data where available, document assumptions where estimates needed."
## OUTPUT REQUIREMENTS
### Marimo Notebook
Create at docs/research/market/research_notebook.py with:
- Interactive data visualizations
- Market size calculations with methodology
- Competitive analysis matrices
- City comparison scoring
- Key findings with evidence
### Report Document
Create at docs/research/market/market_analysis_report.md with:
- Executive summary
- Market opportunity analysis
- Competitive landscape with references
- Customer insights
- Adoption recommendations
- Appendix with data sources
## SUCCESS CRITERIA
- All claims supported by evidence or clearly labeled assumptions
- Proper citations for all external sources
- Quantified metrics where possible (not just qualitative)
- Actionable recommendations for VisibleFix market entry
- Both deliverables print-ready and reviewable in marimo
## START NOW
Begin by creating the directory structure at docs/research/market/, then proceed with research using web search, code search, and the subagents. Deliver both the marimo notebook and the markdown report.
