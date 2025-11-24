'use client';

import { motion } from 'framer-motion';
import HousePriceComparison from '@/components/visualizations/HousePriceComparison';
import housePriceData from '@/data/house-prices.json';

export default function HumanCost() {
  return (
    <section id="human-cost" className="section-container bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="section-content">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-sans text-3xl md:text-4xl font-bold mb-8 text-poverty-gray">
            The Human Cost
          </h2>
          
          <p className="font-sans text-base text-gray-300 mb-12">
            Behind the statistics are real people. Real lives affected by these abstract economic forces.
          </p>

          <HousePriceComparison data={housePriceData.data} />

          <div className="grid md:grid-cols-2 gap-8 mb-12 mt-16">
            <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">Housing Crisis</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-inequality-red mb-1">22 years</div>
                  <div className="font-sans text-gray-400">To save for a house deposit (vs 3 years in 1980)</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-inequality-red mb-1">9.1x</div>
                  <div className="font-sans text-gray-400">House price to income ratio (vs 3.5x in 1970)</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">Generational Divide</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-solution-green mb-1">21%</div>
                  <div className="font-sans text-gray-400">Baby Boomers' wealth share at age 35</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-inequality-red mb-1">4.8%</div>
                  <div className="font-sans text-gray-400">Millennials' wealth share at age 35</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/30 border-l-4 border-poverty-gray p-8 rounded-lg">
            <p className="font-sans text-lg md:text-xl text-gray-200 mb-4">
              A generation locked out of homeownership. Families choosing between heating and eating. 
              Social mobility in reverse.
            </p>
            <p className="font-sans text-base text-gray-300">
              This isn't just about money. It's about opportunity, security, and the kind of society we want to be.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
