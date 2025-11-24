# Wealth Inequality Storytelling Project
## Master Project Overview

**Project Goal**: Create an engaging, accessible, and beautiful web-based narrative that educates the general public about rising wealth inequality in the UK, demonstrates the problem through compelling visualizations, and motivates action through wealth taxation.

---

## Project Vision

A scrollytelling experience on jimfolio.space that transforms complex economic data into an emotional, understandable journey. The site will guide visitors from post-WW2 economic stability through the acceleration of inequality, explaining the mechanisms that concentrate wealth, and concluding with actionable solutions backed by international case studies.

---

## Target Audience

**Primary**: General public with no economics background
- Age range: 18-65
- Politically engaged or curious
- Concerned about cost of living, housing affordability
- May feel the effects of inequality but don't understand the mechanisms

**Tone**: Accessible, empathetic, fact-based, urgent but not alarmist

---

## Core Narrative Arc

### Act 1: The Golden Age (1945-1971)
**Theme**: "When the system worked for everyone"
- Post-war consensus and shared prosperity
- Bretton Woods stability
- Rising wages matching productivity
- Affordable housing and education
- **Emotional beat**: Nostalgia, "this was possible"

### Act 2: The Great Divergence (1971-2008)
**Theme**: "When the rules changed"
- End of gold standard (1971)
- Deregulation era (1980s)
- Wages stagnate while productivity rises
- Asset prices begin to soar
- The rich-poor gap widens
- **Emotional beat**: Confusion, "what happened?"

### Act 3: The Acceleration (2008-Present)
**Theme**: "Crisis as wealth transfer mechanism"
- 2008 Financial Crisis & QE
- COVID-19 pandemic & unprecedented money printing
- House prices vs wages reach breaking point
- Top 1% wealth share explodes
- **Emotional beat**: Anger, recognition, "this is rigged"

### Act 4: Understanding the Machine
**Theme**: "How wealth inequality perpetuates itself"
- Gary's Economics concepts explained simply
- Asset price inflation mechanism
- Why QE enriches the wealthy
- The feedback loop of wealth concentration
- **Emotional beat**: Clarity, "now I understand"

### Act 5: The Path Forward
**Theme**: "Solutions exist and they work"
- Why wealth tax is necessary
- International case studies (Norway, Switzerland, Spain)
- Debunking common objections
- What happens if we do nothing
- **Emotional beat**: Hope, urgency, "we can fix this"

---

## Key Visualizations Required

### Historical Timeline Visualizations
1. **Post-war economic growth chart** (1945-1971)
   - GDP, wages, productivity all rising together
   - Annotated with key events

2. **The Great Divergence chart** (1971-present)
   - Productivity vs wages (the gap)
   - House prices vs wages
   - Top 1%/10% wealth share over time

3. **Key moments timeline**
   - Interactive timeline with annotations
   - Bretton Woods (1944)
   - End of gold standard (1971)
   - Deregulation (1980s)
   - Financial crisis (2008)
   - COVID & QE (2020-2021)

### Wealth Distribution Visualizations
4. **Wealth concentration animation**
   - How wealth share has shifted 1980-2024
   - Top 10%, top 1%, bottom 50%
   - Animated bar chart or area chart

5. **UK wealth pyramid**
   - Current distribution
   - Interactive: hover to see your position

### Mechanism Explanations
6. **Asset price inflation explainer**
   - Animated diagram showing wealth → asset competition → price increases
   - Simple visual metaphor (musical chairs?)

7. **QE money flow diagram**
   - Where printed money goes
   - How it flows back to wealthy
   - Animated Sankey diagram or flow visualization

8. **The feedback loop**
   - Circular diagram showing self-perpetuating nature
   - Wealth → assets → more wealth → repeat

### Comparative Visualizations
9. **House price vs wage growth**
   - Dual line chart, dramatically diverging
   - Show what £100k in 1980 vs 2024 could buy

10. **International comparison**
    - UK vs other developed nations
    - Gini coefficient or wealth share comparison

### Solution Visualizations
11. **Wealth tax impact modeling**
    - What revenue could be raised
    - How it would affect different wealth brackets

12. **Case study comparisons**
    - Norway, Switzerland, Spain wealth tax outcomes
    - Before/after metrics

---

## Content Structure

### Landing Section
- Powerful opening statistic
- "The bottom 50% of UK households own less than 5% of the wealth"
- Immediate scroll prompt

### Section 1: The Story Begins (1945-1971)
- Brief historical context
- Visualizations of shared prosperity
- "This is what's possible when the system is designed for everyone"

### Section 2: The Turning Point (1971-1990s)
- Nixon ends gold standard
- What this meant for money
- Deregulation begins
- Charts showing the divergence starting

### Section 3: Acceleration (2000s-2008)
- Housing bubble
- Financial crisis
- First round of QE
- "The rescue that made inequality worse"

### Section 4: The Pandemic Wealth Transfer (2020-2024)
- Unprecedented money printing
- Where the money went
- Asset price explosion
- "The biggest wealth transfer in modern history"

### Section 5: How It Works (Educational)
- Gary's Economics principles
- Asset competition mechanism
- Why inflation hurts the poor, helps the rich
- The self-perpetuating cycle

### Section 6: The Human Cost
- Real-world impacts
- Housing unaffordability
- Generational wealth gap
- Social mobility collapse

### Section 7: The Solution
- Why wealth tax
- How it works
- International examples
- Debunking objections

### Section 8: Call to Action
- What happens if we do nothing
- How to get involved
- Resources and organizations
- "The choice is ours"

---

## Design Principles

### Visual Identity
- **Clean, modern, serious but accessible**
- Dark mode with accent colors for data
- Generous white space
- Typography: Clear hierarchy, readable body text
- Color palette: Professional blues/grays with red for inequality, green for solutions

### Interaction Patterns
- Scroll-triggered animations
- Smooth transitions between sections
- Data reveals as you scroll
- Minimal UI chrome - let content lead
- Mobile-first responsive design

### Accessibility
- High contrast ratios
- Alt text for all visualizations
- Keyboard navigation
- Screen reader friendly
- Reduced motion option

---

## Technical Approach (Detailed in separate doc)

**Recommended Stack**:
- **Framework**: React with Next.js (for performance)
- **Scrollytelling**: Scrollama.js
- **Visualizations**: D3.js for custom charts
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS
- **Deployment**: Vercel or Netlify

---

## Data Sources (Detailed in separate doc)

### Primary Sources
1. **World Inequality Database (WID.world)**
   - Wealth share data
   - Income inequality metrics
   - Historical data back to 1945

2. **Office for National Statistics (ONS)**
   - UK-specific wealth distribution
   - Income data
   - Housing statistics

3. **Bank of England**
   - QE data
   - Money supply metrics
   - Interest rate history

4. **OECD Data**
   - International comparisons
   - Gini coefficients
   - Wealth tax data from other countries

5. **House Price Index**
   - Nationwide, Halifax historical data
   - Regional breakdowns

---

## Success Metrics

### Engagement
- Time on page (target: 5+ minutes)
- Scroll depth (target: 80%+ reach end)
- Social shares

### Impact
- Click-through to action resources
- Newsletter signups
- Feedback/testimonials

### Technical
- Page load time <3 seconds
- Smooth 60fps animations
- Works on mobile/tablet/desktop

---

## Project Timeline Estimate

### Phase 1: Research & Content (2-3 weeks)
- Gather all data sources
- Write narrative prose
- Create content outline
- Fact-checking

### Phase 2: Design (1-2 weeks)
- Visual design system
- Wireframes for each section
- Data visualization designs
- Interaction patterns

### Phase 3: Data Processing (1 week)
- Clean and format datasets
- Create data APIs/JSON files
- Validate accuracy

### Phase 4: Development (4-6 weeks)
- Set up project structure
- Build scrollytelling framework
- Implement visualizations
- Content integration
- Responsive design
- Testing

### Phase 5: Polish & Launch (1 week)
- Performance optimization
- Accessibility audit
- Copy editing
- Soft launch & feedback
- Public launch

**Total: 9-13 weeks**

---

## Next Steps

1. Review and approve this outline
2. Dive into detailed research documents:
   - Narrative structure with example prose
   - Data sources and specifications
   - Technology implementation guide
   - Wealth tax case studies
3. Begin data gathering and validation
4. Start writing narrative content
5. Design visual system and wireframes

---

## Related Documents

- `01-NARRATIVE-STRUCTURE.md` - Detailed story arc with example prose
- `02-DATA-SOURCES.md` - Complete data source catalog with access methods
- `03-TECHNOLOGY-STACK.md` - Technical implementation guide
- `04-CONTENT-RESEARCH.md` - Deep research with citations and example passages
- `05-WEALTH-TAX-CASE-STUDIES.md` - International examples and counter-arguments
- `06-VISUALIZATION-SPECS.md` - Detailed specifications for each chart/animation
