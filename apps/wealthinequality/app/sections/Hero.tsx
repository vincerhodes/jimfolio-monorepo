'use client';

import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import WealthTimeline from '@/components/visualizations/WealthTimeline';
import timelineData from '@/data/wealth-timeline.json';

export default function Hero() {
  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-inequality-red/10 via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-sans text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            The Wealth Divide
          </h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-sans text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            The top <span className="text-inequality-red font-bold">10%</span> of UK households own more than{' '}
            <span className="text-inequality-red font-bold">half</span> of the wealth.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="font-sans text-base md:text-lg text-gray-400 mb-8"
          >
            Watch how this inequality has grown since 1970 — and what we can do about it.
          </motion.p>

          <WealthTimeline timeline={timelineData.timeline} />

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            onClick={scrollToNext}
            className="inline-flex items-center gap-2 px-8 py-4 bg-data-blue hover:bg-data-blue/80 text-white rounded-full font-semibold transition-colors"
            aria-label="Scroll to begin story"
          >
            Begin the Story
            <ArrowDown className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
