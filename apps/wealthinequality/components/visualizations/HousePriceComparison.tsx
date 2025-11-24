'use client';

import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

interface HousePriceData {
  year: number;
  ratio: number;
  yearsToSave: number;
  color: string;
}

interface HousePriceComparisonProps {
  data: HousePriceData[];
}

export default function HousePriceComparison({ data }: HousePriceComparisonProps) {
  const maxRatio = Math.max(...data.map((d) => d.ratio));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-3xl mx-auto my-12"
    >
      <div className="grid grid-cols-2 gap-8 items-end">
        {data.map((item, index) => (
          <motion.div
            key={item.year}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.3, duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center"
            style={{ transformOrigin: 'bottom' }}
          >
            {/* Bar */}
            <div className="relative w-full flex flex-col items-center">
              <motion.div
                className="w-32 rounded-t-lg relative flex flex-col items-center justify-end pb-4"
                style={{
                  height: `${(item.ratio / maxRatio) * 300}px`,
                  backgroundColor: item.color,
                  minHeight: '100px',
                }}
                whileHover={{ scale: 1.05 }}
              >
                {/* House icon at top */}
                <div className="absolute -top-8">
                  <Home
                    className="w-12 h-12"
                    style={{ color: item.color }}
                  />
                </div>

                {/* Ratio */}
                <div className="text-white font-bold text-3xl font-mono mb-2">
                  {item.ratio}x
                </div>
              </motion.div>

              {/* Year label */}
              <div className="mt-4 text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {item.year}
                </div>
                <div className="text-gray-400 text-sm">
                  House price to income
                </div>
              </div>

              {/* Years to save */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.3 + 0.5, duration: 0.5 }}
                className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold font-mono" style={{ color: item.color }}>
                    {item.yearsToSave}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    years to save for deposit
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-12 text-center"
      >
        <p className="text-gray-300 text-lg italic">
          Your grandparents needed <span className="text-solution-green font-bold">3 years</span> to save for a house.
          <br />
          You need <span className="text-inequality-red font-bold">22 years</span>.
        </p>
        <p className="text-gray-400 text-sm mt-4">
          That's not because you're not working hard enough.
        </p>
      </motion.div>
    </motion.div>
  );
}
