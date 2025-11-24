'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface WealthData {
  group: string;
  percentage: number;
  color: string;
  description: string;
}

interface WealthPyramidProps {
  data: WealthData[];
}

export default function WealthPyramid({ data }: WealthPyramidProps) {
  const [counts, setCounts] = useState<number[]>(data.map(() => 0));

  useEffect(() => {
    const timers = data.map((item, index) => {
      return setTimeout(() => {
        const duration = 1500;
        const steps = 60;
        const increment = item.percentage / steps;
        let current = 0;

        const counter = setInterval(() => {
          current += increment;
          if (current >= item.percentage) {
            setCounts((prev) => {
              const newCounts = [...prev];
              newCounts[index] = item.percentage;
              return newCounts;
            });
            clearInterval(counter);
          } else {
            setCounts((prev) => {
              const newCounts = [...prev];
              newCounts[index] = current;
              return newCounts;
            });
          }
        }, duration / steps);
      }, index * 200);
    });

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [data]);

  // UK population: ~68 million people
  // Total UK wealth: ~£15 trillion
  const ukPopulation = 68000000;
  const ukTotalWealth = 15000000000000;

  // Combine data into 3 tiers
  const pyramidData = [
    {
      label: 'Top 10%',
      population: 0.10,
      wealth: data[0].percentage + data[1].percentage, // 23 + 34 = 57%
      color: '#DC2626',
      populationCount: '6.8m',
      wealthAmount: '£8.6tn'
    },
    {
      label: 'Middle 40%',
      population: 0.40,
      wealth: data[2].percentage, // 38%
      color: '#6B7280',
      populationCount: '27.2m',
      wealthAmount: '£5.7tn'
    },
    {
      label: 'Bottom 50%',
      population: 0.50,
      wealth: data[3].percentage, // 5%
      color: '#374151',
      populationCount: '34.0m',
      wealthAmount: '£0.8tn'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-4xl mx-auto my-16"
    >
      <div className="text-center mb-8">
        <h3 className="font-sans text-2xl font-bold text-white mb-2">UK Wealth Distribution</h3>
        <p className="font-sans text-gray-400">68 million people • £15 trillion total wealth</p>
      </div>

      {/* Two side-by-side pyramids */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Population Pyramid */}
        <div className="text-center">
          <h3 className="font-sans text-xl font-bold text-gray-300 mb-6">People</h3>
          <div className="flex flex-col-reverse items-center space-y-reverse space-y-2">
            {pyramidData.map((tier, index) => {
              const populationWidth = tier.population * 200; // 10% = 20%, 40% = 80%, 50% = 100%
              
              return (
                <motion.div
                  key={`pop-${tier.label}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.2, duration: 0.7 }}
                  className="relative"
                  style={{ transformOrigin: 'center', width: '100%' }}
                >
                  <div
                    className="mx-auto bg-gray-700 flex flex-col items-center justify-center rounded"
                    style={{
                      height: '90px',
                      width: `${populationWidth}%`,
                    }}
                  >
                    <span className="font-sans text-white font-bold text-xl">
                      {tier.populationCount}
                    </span>
                    <span className="font-sans text-white/80 text-sm mt-1">
                      {tier.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: Wealth Pyramid (inverted!) */}
        <div className="text-center">
          <h3 className="font-sans text-xl font-bold text-inequality-red mb-6">Wealth</h3>
          <div className="flex flex-col-reverse items-center space-y-reverse space-y-2">
            {pyramidData.map((tier, index) => {
              const wealthWidth = tier.wealth * 1.75; // Scale for visual impact
              
              return (
                <motion.div
                  key={`wealth-${tier.label}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.2 + 0.3, duration: 0.7 }}
                  className="relative"
                  style={{ transformOrigin: 'center', width: '100%' }}
                >
                  <div
                    className="mx-auto flex flex-col items-center justify-center shadow-lg rounded"
                    style={{
                      height: '90px',
                      width: `${Math.max(wealthWidth, 10)}%`,
                      backgroundColor: tier.color,
                    }}
                  >
                    <span className="font-sans text-white font-bold text-xl">
                      {tier.wealthAmount}
                    </span>
                    <span className="font-sans text-white/90 text-sm mt-1">
                      {tier.wealth.toFixed(0)}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-12 text-center space-y-3">
        <p className="font-sans text-gray-300 text-lg font-bold">
          34 million people own just £800 billion
        </p>
        <p className="font-sans text-gray-400">
          While 6.8 million own £8.6 trillion
        </p>
      </div>
    </motion.div>
  );
}
