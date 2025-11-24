# Technology Stack Recommendations
## Complete Technical Implementation Guide

---

## Executive Summary

**Recommended Stack**: React + Next.js + Scrollama + D3.js + Framer Motion + Tailwind CSS

**Why This Stack**:
- **Performance**: Next.js provides excellent performance out of the box
- **Scrollytelling**: Scrollama is the industry standard, battle-tested
- **Visualizations**: D3.js offers maximum flexibility for custom charts
- **Animations**: Framer Motion provides smooth, declarative animations
- **Styling**: Tailwind enables rapid, consistent styling
- **Deployment**: Vercel (creators of Next.js) offers seamless deployment

---

## Core Framework

### Next.js 14+ (React Framework)

**Why Next.js**:
- Server-side rendering for fast initial load
- Automatic code splitting
- Image optimization built-in
- SEO-friendly
- Great developer experience
- Easy deployment to Vercel

**Installation**:
```bash
npx create-next-app@latest wealth-inequality
cd wealth-inequality
```

**Configuration** (`next.config.js`):
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-image-cdn.com'],
  },
  // Enable experimental features if needed
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig
```

---

## Scrollytelling

### Scrollama.js

**Why Scrollama**:
- Lightweight (5kb gzipped)
- Intersection Observer based (performant)
- Widely used (NYT, The Pudding, etc.)
- Great documentation
- Works perfectly with React

**Installation**:
```bash
npm install scrollama intersection-observer
```

**Basic Implementation**:
```javascript
import { useEffect, useRef } from 'react';
import scrollama from 'scrollama';

export default function ScrollySection() {
  const scrollerRef = useRef(null);

  useEffect(() => {
    const scroller = scrollama();

    scroller
      .setup({
        step: '.step',
        offset: 0.5,
        debug: false,
      })
      .onStepEnter((response) => {
        // Trigger visualization update
        console.log('Entered step:', response.index);
      })
      .onStepExit((response) => {
        console.log('Exited step:', response.index);
      });

    return () => scroller.destroy();
  }, []);

  return (
    <div ref={scrollerRef}>
      <div className="step">Step 1 content</div>
      <div className="step">Step 2 content</div>
    </div>
  );
}
```

**Alternative**: `react-scrollama` (React wrapper)
```bash
npm install react-scrollama
```

---

## Data Visualization

### D3.js v7

**Why D3**:
- Most powerful visualization library
- Complete control over SVG/Canvas
- Huge ecosystem and examples
- Perfect for custom, unique visualizations
- Works well with React (with proper patterns)

**Installation**:
```bash
npm install d3
```

**React + D3 Pattern** (Recommended):
```javascript
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function LineChart({ data }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    // D3 code here
    // Let React handle the DOM, D3 handles the math and rendering

  }, [data]);

  return <svg ref={svgRef} width={800} height={400} />;
}
```

**Useful D3 Modules**:
- `d3-scale`: Scales for mapping data to visual properties
- `d3-axis`: Axes generation
- `d3-shape`: Line, area, pie generators
- `d3-transition`: Smooth animations
- `d3-interpolate`: Value interpolation
- `d3-format`: Number formatting
- `d3-time-format`: Date formatting

**Alternative for Simple Charts**: Chart.js or Recharts
- Easier to use
- Less flexible
- Good for standard chart types

---

## Animation

### Framer Motion

**Why Framer Motion**:
- Declarative animations in React
- Excellent performance
- Scroll-triggered animations
- Gesture support
- Great documentation

**Installation**:
```bash
npm install framer-motion
```

**Usage Examples**:

**Fade In on Scroll**:
```javascript
import { motion } from 'framer-motion';

export default function FadeInSection({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}
```

**Number Counter Animation**:
```javascript
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export default function AnimatedNumber({ value }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}
```

---

## Styling

### Tailwind CSS

**Why Tailwind**:
- Utility-first approach
- Rapid development
- Consistent design system
- Excellent documentation
- Great with Next.js

**Installation**:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Configuration** (`tailwind.config.js`):
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette for wealth inequality theme
        'inequality-red': '#DC2626',
        'solution-green': '#059669',
        'data-blue': '#2563EB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

**Custom Components**: Consider shadcn/ui for pre-built components
```bash
npx shadcn-ui@latest init
```

---

## Typography

### Google Fonts

**Recommended Fonts**:
- **Headings**: Poppins (bold, modern, serious)
- **Body**: Inter (highly readable, professional)
- **Data/Numbers**: JetBrains Mono (monospace for clarity)

**Installation** (Next.js):
```javascript
import { Inter, Poppins, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ 
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins'
});
const jetbrains = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono'
});

export default function RootLayout({ children }) {
  return (
    <html className={`${inter.variable} ${poppins.variable} ${jetbrains.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

---

## Project Structure

```
wealth-inequality/
├── app/
│   ├── layout.js                 # Root layout
│   ├── page.js                   # Landing page
│   ├── sections/
│   │   ├── Hero.jsx
│   │   ├── PostWarEra.jsx
│   │   ├── TurningPoint.jsx
│   │   ├── FinancialCrisis.jsx
│   │   ├── CovidAcceleration.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── HumanCost.jsx
│   │   ├── Solution.jsx
│   │   ├── CaseStudies.jsx
│   │   └── CallToAction.jsx
│   └── globals.css
├── components/
│   ├── visualizations/
│   │   ├── LineChart.jsx
│   │   ├── AreaChart.jsx
│   │   ├── BarChart.jsx
│   │   ├── SankeyDiagram.jsx
│   │   ├── AnimatedCounter.jsx
│   │   └── Timeline.jsx
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   └── ScrollIndicator.jsx
│   └── ScrollySection.jsx
├── data/
│   ├── processed/
│   │   ├── viz-01-postwar-growth.json
│   │   ├── viz-02-great-divergence.json
│   │   └── ...
│   └── sources.json
├── lib/
│   ├── dataLoader.js
│   ├── formatters.js
│   └── utils.js
├── public/
│   ├── images/
│   └── fonts/
├── styles/
│   └── visualizations.css
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## Performance Optimization

### Image Optimization

**Use Next.js Image Component**:
```javascript
import Image from 'next/image';

<Image
  src="/images/hero-bg.jpg"
  alt="Wealth inequality visualization"
  width={1920}
  height={1080}
  priority // For above-the-fold images
  quality={85}
/>
```

### Code Splitting

**Dynamic Imports for Heavy Components**:
```javascript
import dynamic from 'next/dynamic';

const HeavyVisualization = dynamic(
  () => import('@/components/visualizations/ComplexChart'),
  { 
    loading: () => <p>Loading...</p>,
    ssr: false // Disable SSR for client-only components
  }
);
```

### Data Loading

**Use SWR or React Query for Data Fetching**:
```bash
npm install swr
```

```javascript
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function DataComponent() {
  const { data, error } = useSWR('/data/viz-01.json', fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  return <Visualization data={data} />;
}
```

---

## Deployment

### Vercel (Recommended)

**Why Vercel**:
- Built by Next.js creators
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Preview deployments for PRs
- Analytics built-in

**Deployment Steps**:
1. Push code to GitHub
2. Import project in Vercel
3. Deploy (automatic)

**Custom Domain**:
- Add `wealthinequality.jimfolio.space` in Vercel dashboard
- Update DNS records

### Alternative: Netlify

**Why Netlify**:
- Similar to Vercel
- Good Next.js support
- Form handling built-in
- Split testing

---

## Analytics & Monitoring

### Vercel Analytics

**Installation**:
```bash
npm install @vercel/analytics
```

```javascript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Plausible Analytics (Privacy-Friendly Alternative)

**Why Plausible**:
- GDPR compliant
- No cookies
- Lightweight
- Privacy-focused

```javascript
<Script
  defer
  data-domain="wealthinequality.jimfolio.space"
  src="https://plausible.io/js/script.js"
/>
```

---

## Accessibility

### Focus Management

```javascript
import { useEffect, useRef } from 'react';

export default function AccessibleSection({ title }) {
  const headingRef = useRef(null);

  useEffect(() => {
    // Announce section changes to screen readers
    headingRef.current?.focus();
  }, []);

  return <h2 ref={headingRef} tabIndex={-1}>{title}</h2>;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Framer Motion Support**:
```javascript
import { motion, useReducedMotion } from 'framer-motion';

export default function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
    >
      Content
    </motion.div>
  );
}
```

---

## Development Tools

### ESLint & Prettier

```bash
npm install -D eslint prettier eslint-config-prettier
```

### TypeScript (Optional but Recommended)

```bash
npx create-next-app@latest --typescript
```

**Benefits**:
- Type safety for data structures
- Better IDE support
- Catch errors early

---

## Testing

### Jest + React Testing Library

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

### Playwright (E2E Testing)

```bash
npm install -D @playwright/test
```

---

## Complete Package.json

```json
{
  "name": "wealth-inequality",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "d3": "^7.8.5",
    "scrollama": "^3.2.0",
    "intersection-observer": "^0.12.2",
    "framer-motion": "^10.16.4",
    "swr": "^2.2.4"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.5",
    "postcss": "^8.4.31",
    "autoprefixer": "^10.4.16",
    "@vercel/analytics": "^1.1.1",
    "eslint": "^8.54.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

---

## Getting Started

### Quick Start Commands

```bash
# Create Next.js app
npx create-next-app@latest wealth-inequality

# Install dependencies
cd wealth-inequality
npm install d3 scrollama framer-motion swr intersection-observer

# Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Run development server
npm run dev
```

---

## Key Implementation Tips

1. **Keep visualizations in separate components** - easier to test and maintain
2. **Use React for DOM, D3 for calculations** - avoid conflicts
3. **Lazy load heavy visualizations** - improve initial load time
4. **Test on mobile early** - scrollytelling can be tricky on small screens
5. **Use semantic HTML** - better for SEO and accessibility
6. **Optimize images** - use WebP format, Next.js Image component
7. **Implement error boundaries** - graceful degradation if viz fails
8. **Add loading states** - better UX while data loads
9. **Version control data files** - track changes to datasets
10. **Document data transformations** - make it reproducible

---

## Estimated Development Timeline

- **Setup & Configuration**: 1-2 days
- **Basic Layout & Routing**: 2-3 days
- **Scrollytelling Framework**: 3-4 days
- **Data Visualizations** (25-30 charts): 15-20 days
- **Content Integration**: 5-7 days
- **Styling & Polish**: 5-7 days
- **Responsive Design**: 3-5 days
- **Accessibility**: 2-3 days
- **Testing & Bug Fixes**: 5-7 days
- **Performance Optimization**: 2-3 days

**Total**: 6-8 weeks

---

This stack provides the perfect balance of power, performance, and developer experience for creating an engaging wealth inequality storytelling site.
