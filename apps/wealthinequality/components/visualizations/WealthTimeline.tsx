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

interface WealthTimelineProps {
  timeline: TimelineData[];
}

export default function WealthTimeline({ timeline }: WealthTimelineProps) {
  const [currentIndex, setCurrentIndex] = useState(timeline.length - 1); // Start at 2024
  const [isPlaying, setIsPlaying] = useState(false);

  const currentData = timeline[currentIndex];

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
      <div className="flex items-center justify-center gap-4 mb-8">
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

        <div className="flex gap-2">
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

      {/* Current Year Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentData.year}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-8"
        >
          <div className="font-sans text-5xl font-bold text-white">
            {currentData.year}
          </div>
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
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
