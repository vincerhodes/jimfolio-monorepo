'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface SectionNavProps {
  nextSection?: string;
  prevSection?: string;
}

export default function SectionNav({ nextSection, prevSection }: SectionNavProps) {
  const scrollToNext = () => {
    if (nextSection) {
      const element = document.getElementById(nextSection);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  const scrollToPrev = () => {
    if (prevSection) {
      const element = document.getElementById(prevSection);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Mobile: Horizontal at top */}
      <div className="md:hidden fixed top-4 left-1/2 -translate-x-1/2 flex flex-row gap-4 z-50">
        {prevSection && (
          <motion.button
            onClick={scrollToPrev}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800/60 hover:bg-gray-700/70 border border-gray-700/60 transition-colors group opacity-60 hover:opacity-100 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Scroll to previous section"
          >
            <ChevronUp className="w-6 h-6 text-gray-400 group-hover:text-gray-300" />
          </motion.button>
        )}
        
        {nextSection && (
          <motion.button
            onClick={scrollToNext}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800/60 hover:bg-gray-700/70 border border-data-blue/50 transition-colors group backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Scroll to next section"
          >
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ChevronDown className="w-6 h-6 text-data-blue group-hover:text-data-blue/80" />
            </motion.div>
          </motion.button>
        )}
      </div>

      {/* Desktop: Vertical on left */}
      <div className="hidden md:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col gap-4 z-50">
        {prevSection && (
          <motion.button
            onClick={scrollToPrev}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800/60 hover:bg-gray-700/70 border border-gray-700/60 transition-colors group opacity-60 hover:opacity-100 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Scroll to previous section"
          >
            <ChevronUp className="w-6 h-6 text-gray-400 group-hover:text-gray-300" />
          </motion.button>
        )}
        
        {nextSection && (
          <motion.button
            onClick={scrollToNext}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800/60 hover:bg-gray-700/70 border border-data-blue/50 transition-colors group backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Scroll to next section"
          >
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ChevronDown className="w-6 h-6 text-data-blue group-hover:text-data-blue/80" />
            </motion.div>
          </motion.button>
        )}
      </div>
    </>
  );
}
