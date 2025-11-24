'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function Solution() {
  return (
    <section id="solution" className="section-container bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="section-content">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-sans text-3xl md:text-4xl font-bold mb-8 text-solution-green">
            The Solution: Wealth Tax
          </h2>
          
          <p className="font-sans text-base text-gray-300 mb-6">
            The problem is clear. The solution is simple: tax wealth, not just income.
          </p>

          <p className="font-sans text-base text-gray-300 mb-12">
            A modest wealth tax on the richest 0.5% could raise £10-15 billion per year. 
            Enough to transform our society.
          </p>

          <div className="bg-solution-green/10 border border-solution-green/30 p-8 rounded-lg mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">Proposed Wealth Tax</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Check className="w-6 h-6 text-solution-green flex-shrink-0" />
                <div>
                  <span className="font-bold text-white">1% annual tax</span> on wealth above £10 million
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Check className="w-6 h-6 text-solution-green flex-shrink-0" />
                <div>
                  <span className="font-bold text-white">2% annual tax</span> on wealth above £50 million
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Check className="w-6 h-6 text-solution-green flex-shrink-0" />
                <div>
                  <span className="font-bold text-white">Affects only 0.5%</span> of the population
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="font-sans text-4xl font-bold text-solution-green mb-2">£10-15bn</div>
              <div className="font-sans text-gray-400">Annual revenue potential</div>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="font-sans text-4xl font-bold text-solution-green mb-2">100,000</div>
              <div className="font-sans text-gray-400">Social homes per year</div>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="font-sans text-4xl font-bold text-solution-green mb-2">0.5%</div>
              <div className="font-sans text-gray-400">Of population affected</div>
            </div>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 p-8 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">What it could fund:</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-solution-green flex-shrink-0 mt-1" />
                <span>Build 100,000 social homes per year</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-solution-green flex-shrink-0 mt-1" />
                <span>Abolish university tuition fees</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-solution-green flex-shrink-0 mt-1" />
                <span>Boost NHS funding significantly</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-solution-green flex-shrink-0 mt-1" />
                <span>Invest in green infrastructure</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
