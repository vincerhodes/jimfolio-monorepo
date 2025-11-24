# Wealth Inequality in the UK - Interactive Data Story

An engaging, accessible scrollytelling experience that educates the public about rising wealth inequality in the UK and motivates action through wealth taxation.

## 🎯 Project Overview

This interactive web experience tells the story of wealth inequality in the UK from post-war prosperity (1945) to today's crisis, explaining the mechanisms that concentrate wealth and presenting evidence-based solutions.

### Key Features

- **9 narrative sections** covering the complete story arc
- **Interactive scrollytelling** with smooth animations
- **Data-driven visualizations** (to be implemented)
- **Mobile-first responsive design**
- **Accessible** with screen reader support and reduced motion options

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Scrollytelling**: Scrollama.js (to be integrated)
- **Visualizations**: D3.js (to be implemented)
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## 📁 Project Structure

```
wealthinequality/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx             # Main page with all sections
│   ├── globals.css          # Global styles
│   └── sections/            # Story sections
│       ├── Hero.tsx
│       ├── PostWarEra.tsx
│       ├── TurningPoint.tsx
│       ├── FinancialCrisis.tsx
│       ├── CovidAcceleration.tsx
│       ├── HowItWorks.tsx
│       ├── HumanCost.tsx
│       ├── Solution.tsx
│       ├── CaseStudies.tsx
│       └── CallToAction.tsx
├── components/              # Reusable components (to be added)
├── data/                    # Data files (to be added)
├── lib/                     # Utility functions (to be added)
└── public/                  # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.9.0
- npm >= 10.0.0

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app will be available at `http://localhost:3002`

## 📊 Data Sources

All data is sourced from reputable institutions:

- **World Inequality Database** (WID.world)
- **Office for National Statistics** (ONS)
- **Bank of England**
- **OECD Data**
- **IMF World Economic Outlook**

## 🎨 Design System

### Colors

- **Inequality Red**: `#DC2626` - Used for negative trends
- **Solution Green**: `#059669` - Used for positive outcomes
- **Data Blue**: `#2563EB` - Used for data visualizations
- **Wealth Gold**: `#F59E0B` - Used for wealth-related content
- **Poverty Gray**: `#6B7280` - Used for human cost sections

### Typography

- **Display**: Poppins (headings)
- **Body**: Inter (content)
- **Mono**: JetBrains Mono (data/numbers)

## 📈 Next Steps

### Phase 1: Core Functionality ✅
- [x] Set up Next.js project
- [x] Create section components
- [x] Implement basic layout
- [x] Add animations

### Phase 2: Data & Visualizations (In Progress)
- [ ] Integrate Scrollama for scroll-triggered animations
- [ ] Create D3.js visualization components
- [ ] Add data files
- [ ] Implement interactive charts

### Phase 3: Content & Polish
- [ ] Add detailed narrative content
- [ ] Optimize performance
- [ ] Accessibility audit
- [ ] Mobile testing

### Phase 4: Launch
- [ ] SEO optimization
- [ ] Analytics integration
- [ ] Deploy to production

## 🤝 Contributing

This project is part of jimfolio.space. For questions or suggestions, please reach out.

## 📝 License

All data sources are properly cited. When using this research:
- Cite original sources
- Link to raw data
- Document methodology
- Provide transparency

## 🔗 Related Resources

- [Planning Documentation](./.windsurf/planning/)
- [World Inequality Database](https://wid.world/)
- [ONS Wealth Statistics](https://www.ons.gov.uk/)
- [Bank of England Statistics](https://www.bankofengland.co.uk/statistics)

---

**Created by Jimmy** | [jimfolio.space](https://jimfolio.space)
