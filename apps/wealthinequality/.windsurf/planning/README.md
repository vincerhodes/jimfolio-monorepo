# Wealth Inequality Storytelling Project
## Research & Planning Documentation

---

## 📋 Project Overview

This repository contains comprehensive research and planning for a web-based storytelling project about wealth inequality in the UK. The goal is to create an engaging, accessible, and beautiful scrollytelling experience on **jimfolio.space** that educates the general public about rising wealth inequality and motivates action through wealth taxation.

---

## 📚 Documentation Structure

### Core Documents

1. **[00-PROJECT-OVERVIEW.md](./00-PROJECT-OVERVIEW.md)**
   - Master project outline
   - Vision and goals
   - Narrative arc summary
   - Success metrics
   - Timeline estimates

2. **[01-NARRATIVE-STRUCTURE.md](./01-NARRATIVE-STRUCTURE.md)**
   - Detailed story arc (9 sections)
   - Example prose for each section
   - Emotional journey mapping
   - Pacing and tone guidelines
   - ~15-20 minute reading experience

3. **[02-DATA-SOURCES.md](./02-DATA-SOURCES.md)**
   - Complete catalog of data sources
   - Access methods and APIs
   - Data specifications for each visualization
   - Validation checklist
   - Update schedule

4. **[03-TECHNOLOGY-STACK.md](./03-TECHNOLOGY-STACK.md)**
   - Recommended tech stack (Next.js + D3.js + Scrollama)
   - Implementation guides
   - Code examples
   - Performance optimization
   - Deployment strategy

5. **[04-CONTENT-RESEARCH.md](./04-CONTENT-RESEARCH.md)**
   - Deep research with citations
   - Key facts and statistics
   - Historical context
   - Example prose passages
   - Gary's Economics concepts explained

6. **[05-WEALTH-TAX-CASE-STUDIES.md](./05-WEALTH-TAX-CASE-STUDIES.md)**
   - International examples (Norway, Switzerland, Spain, France)
   - Counter-arguments debunked
   - Implementation recommendations
   - Revenue projections

---

## 🎯 Quick Start Guide

### For Content Creation
1. Start with **01-NARRATIVE-STRUCTURE.md** for story flow
2. Use **04-CONTENT-RESEARCH.md** for facts and example prose
3. Reference **05-WEALTH-TAX-CASE-STUDIES.md** for solution section

### For Development
1. Read **03-TECHNOLOGY-STACK.md** for tech recommendations
2. Review **02-DATA-SOURCES.md** for data requirements
3. Follow **00-PROJECT-OVERVIEW.md** for project structure

### For Data Analysis
1. Check **02-DATA-SOURCES.md** for all data sources
2. Download datasets from listed URLs
3. Follow data processing pipeline guidelines

---

## 🎨 Project Vision

### The Story We're Telling

**Act 1**: Post-war prosperity (1945-1971) - when the system worked for everyone  
**Act 2**: The turning point (1971-1990) - policy changes that broke the consensus  
**Act 3**: Financial crisis (2008-2012) - QE and wealth transfer  
**Act 4**: COVID acceleration (2020-2024) - unprecedented inequality surge  
**Act 5**: Understanding the machine - how wealth inequality perpetuates  
**Act 6**: Human cost - real-world impacts  
**Act 7**: The solution - wealth tax explained  
**Act 8**: International proof - case studies  
**Act 9**: Call to action - what you can do  

### Target Audience

- **General public** with no economics background
- Age range: 18-65
- Politically engaged or curious
- Concerned about cost of living, housing affordability

### Tone

- Accessible, empathetic, fact-based
- Urgent but not alarmist
- Use "we" and "our" to build solidarity
- Avoid jargon, explain everything simply

---

## 📊 Key Statistics

### Wealth Inequality (UK)
- **Bottom 50%**: Own just 5% of wealth
- **Top 10%**: Own 57% of wealth
- **Top 1%**: Own 23% of wealth

### Housing Crisis
- **1970**: House price to income ratio 3.5x
- **2024**: House price to income ratio 9.1x
- **1980**: 3 years to save for deposit
- **2024**: 22 years to save for deposit

### Generational Gap
- **Baby Boomers** at age 35: 21% of national wealth
- **Millennials** at age 35: 4.8% of national wealth

### Wealth Tax Potential
- **1% above £10m**: ~£10-15bn/year
- **Affects**: 0.5% of population
- **Could fund**: 100,000 social homes/year + NHS boost + free university

---

## 🛠️ Technology Stack

### Recommended
- **Framework**: Next.js 14+ (React)
- **Scrollytelling**: Scrollama.js
- **Visualizations**: D3.js v7
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

### Why This Stack
- Performance optimized
- Industry-standard scrollytelling
- Maximum visualization flexibility
- Smooth animations
- Easy deployment

---

## 📈 Visualizations Required

### Timeline & Historical (5 visualizations)
1. Post-war economic growth (GDP, wages, productivity)
2. The Great Divergence (productivity vs wages)
3. House price to income ratio (1970-2024)
4. Top tax rate decline
5. Union membership decline

### Wealth Distribution (4 visualizations)
6. Wealth share over time (animated)
7. UK wealth pyramid (current)
8. Asset ownership by percentile
9. Generational wealth comparison

### Crisis & QE (4 visualizations)
10. QE timeline and money supply
11. Asset prices vs wages (2008-2024)
12. Billionaire wealth growth (2020-2024)
13. Inflation impact on real wages

### Mechanism Explanations (3 visualizations)
14. Asset competition diagram (animated)
15. QE money flow (Sankey diagram)
16. The feedback loop (circular diagram)

### Solutions (5 visualizations)
17. Wealth tax brackets
18. Revenue projection
19. International comparison
20. Migration data ("will they leave?")
21. Two futures projection

**Total**: ~21 interactive visualizations

---

## 📅 Timeline Estimate

### Phase 1: Research & Content (2-3 weeks) ✅
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

**Total**: 9-13 weeks

---

## 🎓 Key Research Sources

### Data
- World Inequality Database (WID.world)
- Office for National Statistics (ONS)
- Bank of England
- OECD Data
- IMF World Economic Outlook

### Academic
- Piketty, "Capital in the Twenty-First Century"
- Atkinson, "Inequality: What Can Be Done?"
- Saez & Zucman, "The Triumph of Injustice"
- Wealth Tax Commission Final Report (2020)

### Contemporary
- Gary Stevenson, "The Trading Game"
- Resolution Foundation reports
- Institute for Fiscal Studies
- Oxfam inequality reports

---

## 💡 Design Principles

### Visual Identity
- Clean, modern, serious but accessible
- Dark mode with accent colors for data
- Generous white space
- Clear typography hierarchy

### Interaction
- Scroll-triggered animations
- Smooth transitions
- Data reveals as you scroll
- Minimal UI chrome
- Mobile-first responsive

### Accessibility
- High contrast ratios
- Alt text for all visualizations
- Keyboard navigation
- Screen reader friendly
- Reduced motion option

---

## 🚀 Next Steps

### Immediate (Week 1-2)
1. ✅ Review all research documents
2. Download primary datasets from sources
3. Begin writing final narrative prose
4. Create visual design mockups

### Short-term (Week 3-4)
1. Set up Next.js project
2. Implement basic scrollytelling framework
3. Create first 3-5 visualizations
4. Test on mobile devices

### Medium-term (Week 5-8)
1. Complete all visualizations
2. Integrate all content
3. Responsive design
4. Performance optimization

### Pre-launch (Week 9-10)
1. Accessibility audit
2. User testing
3. Copy editing
4. Soft launch to small audience
5. Gather feedback

### Launch (Week 11)
1. Final polish
2. Public launch
3. Social media promotion
4. Press outreach

---

## 📞 Call to Action Elements

### Organizations to Link
- Patriotic Millionaires UK
- Oxfam inequality campaign
- Tax Justice Network
- Equality Trust
- 99% Organisation

### Actions for Visitors
1. Share the story
2. Contact MP (template provided)
3. Support organizations
4. Vote for candidates backing wealth tax
5. Join local campaigns

---

## 📖 How to Use This Documentation

### For Writers
- Use example prose as starting points
- Adapt tone and style as needed
- Ensure all facts are cited
- Keep language accessible (Grade 8-10 reading level)

### For Developers
- Follow tech stack recommendations
- Use code examples as templates
- Prioritize performance and accessibility
- Test on multiple devices

### For Designers
- Reference design principles
- Create consistent visual system
- Design for mobile-first
- Ensure accessibility standards

### For Data Analysts
- Validate all data sources
- Document methodology
- Create reproducible pipeline
- Version control datasets

---

## 🔗 Useful Links

### Data Sources
- [World Inequality Database](https://wid.world/)
- [ONS Wealth Statistics](https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/incomeandwealth)
- [Bank of England Statistics](https://www.bankofengland.co.uk/statistics)

### Technology
- [Next.js Documentation](https://nextjs.org/docs)
- [D3.js Documentation](https://d3js.org/)
- [Scrollama Documentation](https://github.com/russellgoldenberg/scrollama)

### Inspiration
- [The Pudding](https://pudding.cool/) - Data storytelling examples
- [NYT Graphics](https://www.nytimes.com/spotlight/graphics) - Scrollytelling
- [Our World in Data](https://ourworldindata.org/) - Data visualization

---

## 📝 License & Attribution

This research is compiled for the wealth inequality storytelling project on jimfolio.space.

All data sources are properly cited. When using this research:
- Cite original sources
- Link to raw data
- Document methodology
- Provide transparency

---

## 🤝 Contributing

This is a living document. As new data becomes available or research evolves:
1. Update relevant sections
2. Add new sources
3. Refine narrative
4. Improve visualizations

---

## ✨ Final Thoughts

This project aims to make complex economic concepts accessible to everyone. The goal is not just to inform, but to inspire action.

Wealth inequality is not inevitable. It's the result of policy choices. And policy choices can be changed.

By telling this story clearly, beautifully, and compellingly, we can help people understand what's happening and why we need wealth tax.

The research is done. The story is outlined. The technology is ready.

Now it's time to build it.

---

**Last Updated**: November 24, 2024  
**Project Status**: Research Complete, Ready for Development  
**Estimated Launch**: Q1 2025
