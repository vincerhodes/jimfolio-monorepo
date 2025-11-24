'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const sections = [
  'hero',
  'post-war',
  'turning-point',
  'financial-crisis',
  'covid-acceleration',
  'how-it-works',
  'human-cost',
  'solution',
  'case-studies',
  'call-to-action',
];

export default function GlobalNav() {
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sections.indexOf(entry.target.id);
            if (index !== -1) {
              setCurrentSection(index);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (index: number) => {
    const element = document.getElementById(sections[index]);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const canGoUp = currentSection > 0;
  const canGoDown = currentSection < sections.length - 1;

  return (
    <>
      {/* Mobile: Horizontal at top */}
      <div className="md:hidden fixed top-4 left-1/2 -translate-x-1/2 flex flex-row gap-4 z-50">
        {canGoUp && (
          <motion.button
            onClick={() => scrollToSection(currentSection - 1)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800/60 hover:bg-gray-700/70 border border-gray-700/60 transition-colors group opacity-60 hover:opacity-100 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Scroll to previous section"
          >
            <ChevronUp className="w-6 h-6 text-gray-400 group-hover:text-gray-300" />
          </motion.button>
        )}
        
        {canGoDown && (
          <motion.button
            onClick={() => scrollToSection(currentSection + 1)}
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
        {canGoUp && (
          <motion.button
            onClick={() => scrollToSection(currentSection - 1)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800/60 hover:bg-gray-700/70 border border-gray-700/60 transition-colors group opacity-60 hover:opacity-100 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Scroll to previous section"
          >
            <ChevronUp className="w-6 h-6 text-gray-400 group-hover:text-gray-300" />
          </motion.button>
        )}
        
        {canGoDown && (
          <motion.button
            onClick={() => scrollToSection(currentSection + 1)}
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
