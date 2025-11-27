'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface TimelineData {
  year: number;
  top10Wealth: number;
  bottom90Wealth: number;
  top10Amount: string;
  bottom90Amount: string;
  top10People: string;
  bottom90People: string;
}

interface EraMeta {
  label: string;
  badgeClass: string;
  description: string;
}

function getEraMeta(year: number): EraMeta {
  if (year === 1970) {
    return {
      label: 'Golden Age',
      badgeClass:
        'bg-solution-green/15 text-solution-green border border-solution-green/40',
      description:
        'Post-war “golden age” when wages, productivity and living standards rose together.',
    };
  }

  if (year === 1990) {
    return {
      label: 'Rules Changed',
      badgeClass:
        'bg-wealth-gold/15 text-wealth-gold border border-wealth-gold/40',
      description:
        'After the end of the gold standard and 1980s deregulation, the top begins to pull away.',
    };
  }

  if (year === 2008) {
    return {
      label: 'Financial Crisis & QE',
      badgeClass:
        'bg-inequality-red/15 text-inequality-red border border-inequality-red/40',
      description:
        'The financial crash and quantitative easing rescue asset owners while wages stagnate.',
    };
  }

  if (year >= 2020) {
    return {
      label: 'Today',
      badgeClass:
        'bg-data-blue/15 text-data-blue border border-data-blue/40',
      description:
        'After COVID and years of money printing, wealth inequality is locked in at historic highs.',
    };
  }

  return {
    label: 'Wealth Divide',
    badgeClass:
      'bg-data-blue/15 text-data-blue border border-data-blue/40',
    description:
      'The balance between the top 10% and bottom 90% has shifted dramatically over time.',
  };
}

interface WealthTimelineProps {
  timeline: TimelineData[];
}

export default function WealthTimeline({ timeline }: WealthTimelineProps) {
  const [currentIndex, setCurrentIndex] = useState(timeline.length - 1); // Start at 2024
  const [isPlaying, setIsPlaying] = useState(false);

  const currentData = timeline[currentIndex];
  const era = getEraMeta(currentData.year);
  const baseData = timeline[0];
  const hasChange = currentIndex > 0 && !!baseData;
  const deltaTop10 = hasChange
    ? currentData.top10Wealth - baseData.top10Wealth
    : 0;
  const deltaBottom90 = hasChange
    ? currentData.bottom90Wealth - baseData.bottom90Wealth
    : 0;
  const maxIndex = timeline.length - 1;
  const progress = maxIndex > 0 ? currentIndex / maxIndex : 0;
  const perPersonMultiple =
    currentData.bottom90Wealth > 0
      ? (currentData.top10Wealth * 9) / currentData.bottom90Wealth
      : null;
  const clampedPerPersonMultiple =
    perPersonMultiple !== null ? Math.min(perPersonMultiple, 12) : null;

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= timeline.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, [isPlaying, timeline.length]);

  const handleYearClick = (index: number) => {
    setIsPlaying(false);
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    if (currentIndex >= timeline.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-4xl mx-auto my-16"
    >
      {/* Title */}
      <div className="text-center mb-8">
        <h3 className="font-sans text-2xl font-bold text-white mb-2">
          UK Wealth Distribution Over Time
        </h3>
        <p className="font-sans text-gray-400">
          68 million people • £15 trillion total wealth
        </p>
      </div>

      {/* Timeline Controls */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={togglePlayPause}
            className="flex items-center gap-2 px-4 py-2 bg-data-blue/20 hover:bg-data-blue/30 border border-data-blue/40 rounded-full transition-colors font-sans text-sm font-semibold text-data-blue"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Play Timeline
              </>
            )}
          </button>

          <div className="flex flex-wrap justify-center gap-2">
            {timeline.map((data, index) => (
              <button
                key={data.year}
                onClick={() => handleYearClick(index)}
                className={`px-4 py-2 rounded-full font-sans text-sm font-semibold transition-all ${
                  currentIndex === index
                    ? 'bg-data-blue text-white scale-110'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {data.year}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="h-1.5 w-full rounded-full bg-gray-800/80 overflow-hidden">
            <motion.div
              className="h-full bg-data-blue"
              initial={false}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          {isPlaying && (
            <p className="mt-2 text-center font-sans text-xs text-gray-500">
              Playing timeline • {currentData.year}
            </p>
          )}
        </div>
      </div>

      {/* Current Year Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentData.year}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-10"
        >
          <div className="mb-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${era.badgeClass}`}
            >
              {era.label}
            </span>
          </div>
          <div className="font-sans text-5xl font-bold text-white">
            {currentData.year}
          </div>
          <p className="font-sans text-sm md:text-base text-gray-300 mt-3 max-w-xl mx-auto">
            {era.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Two-tier Pyramids */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Population Pyramid */}
        <div className="text-center">
          <h3 className="font-sans text-xl font-bold text-gray-300 mb-6">People</h3>
          <div className="flex flex-col-reverse items-center space-y-reverse space-y-2">
            {/* Bottom 90% */}
            <motion.div
              className="relative w-full flex justify-center"
              style={{ transformOrigin: 'center' }}
            >
              <motion.div
                className="bg-gray-700 flex flex-col items-center justify-center rounded"
                initial={false}
                animate={{ width: '100%' }}
                transition={{ duration: 0.6 }}
                style={{ height: '100px' }}
              >
                <span className="font-sans text-white font-bold text-xl">
                  {currentData.bottom90People}
                </span>
                <span className="font-sans text-white/80 text-sm mt-1">
                  Bottom 90%
                </span>
              </motion.div>
            </motion.div>

            {/* Top 10% */}
            <motion.div
              className="relative w-full flex justify-center"
              style={{ transformOrigin: 'center' }}
            >
              <motion.div
                className="bg-gray-700 flex flex-col items-center justify-center rounded"
                initial={false}
                animate={{ width: '20%' }}
                transition={{ duration: 0.6 }}
                style={{ height: '100px' }}
              >
                <span className="font-sans text-white font-bold text-xl">
                  {currentData.top10People}
                </span>
                <span className="font-sans text-white/80 text-sm mt-1">
                  Top 10%
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Right: Wealth Pyramid (inverted!) */}
        <div className="text-center">
          <h3 className="font-sans text-xl font-bold text-inequality-red mb-6">Wealth</h3>
          <div className="flex flex-col-reverse items-center space-y-reverse space-y-2">
            {/* Bottom 90% */}
            <motion.div
              className="relative w-full flex justify-center"
              style={{ transformOrigin: 'center' }}
            >
              <motion.div
                className="flex flex-col items-center justify-center shadow-lg rounded"
                initial={false}
                animate={{ width: `${currentData.bottom90Wealth * 1.75}%` }}
                transition={{ duration: 0.6 }}
                style={{
                  height: '100px',
                  backgroundColor: '#6B7280',
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`bottom-${currentData.year}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="font-sans text-white font-bold text-xl"
                  >
                    {currentData.bottom90Amount}
                  </motion.span>
                </AnimatePresence>
                <span className="font-sans text-white/90 text-sm mt-1">
                  {currentData.bottom90Wealth}%
                </span>
              </motion.div>
            </motion.div>

            {/* Top 10% */}
            <motion.div
              className="relative w-full flex justify-center"
              style={{ transformOrigin: 'center' }}
            >
              <motion.div
                className="flex flex-col items-center justify-center shadow-lg rounded"
                initial={false}
                animate={{ width: `${Math.max(currentData.top10Wealth * 1.75, 10)}%` }}
                transition={{ duration: 0.6 }}
                style={{
                  height: '100px',
                  backgroundColor: '#DC2626',
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`top-${currentData.year}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="font-sans text-white font-bold text-xl"
                  >
                    {currentData.top10Amount}
                  </motion.span>
                </AnimatePresence>
                <span className="font-sans text-white/90 text-sm mt-1">
                  {currentData.top10Wealth}%
                </span>
              </motion.div>
            </motion.div>
          </div>
          {perPersonMultiple !== null && (
            <div className="mt-8">
              <h4 className="font-sans text-xs font-semibold tracking-wide text-gray-400 uppercase mb-3">
                Average wealth per person
              </h4>
              <div className="flex items-end justify-center gap-8">
                <div className="flex flex-col items-center">
                  <div className="font-sans text-xs text-gray-400 mb-1">Bottom 90%</div>
                  <div className="relative w-6 h-24 bg-gray-800 rounded-full overflow-hidden flex items-end justify-center">
                    <motion.div
                      className="w-full bg-gray-500 rounded-full"
                      initial={false}
                      animate={{ height: '30%' }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                  <div className="mt-1 font-sans text-xs text-gray-400">1x</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="font-sans text-xs text-gray-400 mb-1">Top 10%</div>
                  <div className="relative w-6 h-24 bg-gray-800 rounded-full overflow-hidden flex items-end justify-center">
                    <motion.div
                      className="w-full bg-inequality-red rounded-full"
                      initial={false}
                      animate={{
                        height:
                          clampedPerPersonMultiple !== null
                            ? `${(clampedPerPersonMultiple / 12) * 100}%`
                            : '0%',
                      }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                  <div className="mt-1 font-sans text-xs text-gray-200">
                    {perPersonMultiple.toFixed(1)}x
                  </div>
                </div>
              </div>
              <p className="mt-3 font-sans text-xs text-gray-400 max-w-xs mx-auto">
                On average in {currentData.year}, someone in the top 10% has about{' '}
                {perPersonMultiple.toFixed(1)}&times; the wealth of someone in the bottom 90%.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentData.year}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-12 text-center space-y-3"
        >
          <p className="font-sans text-gray-300 text-lg font-bold">
            In {currentData.year}: {currentData.top10People} people owned {currentData.top10Amount}
          </p>
          <p className="font-sans text-gray-400">
            While {currentData.bottom90People} owned {currentData.bottom90Amount}
          </p>
          {hasChange && (
            <p className="font-sans text-gray-500 text-sm">
              Since {baseData.year}: the top 10% share has {deltaTop10 >= 0 ? 'grown by' : 'fallen by'}{' '}
              {Math.abs(deltaTop10)} percentage points, while the bottom 90% share has{' '}
              {deltaBottom90 <= 0 ? 'fallen by' : 'grown by'} {Math.abs(deltaBottom90)}.
            </p>
          )}
          <p className="font-sans text-gray-500 text-sm">
            The top 10% are 10% of the people, but now hold {currentData.top10Wealth}% of the wealth.
          </p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
