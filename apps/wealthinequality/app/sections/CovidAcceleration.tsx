'use client';

import { motion } from 'framer-motion';

export default function CovidAcceleration() {
  return (
    <section id="covid-acceleration" className="section-container bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="section-content">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-sans text-3xl md:text-4xl font-bold mb-8 text-inequality-red">
            COVID: The Acceleration (2020-2024)
          </h2>
          
          <p className="font-sans text-base text-gray-300 mb-6">
            When COVID-19 hit, central banks printed money on an unprecedented scale. 
            £450 billion more in the UK alone.
          </p>

          <p className="font-sans text-base text-gray-300 mb-6">
            Once again, this money flowed to asset owners. House prices surged 25% in just three years. 
            Billionaire wealth exploded. Meanwhile, real wages fell as inflation ate away at paychecks.
          </p>

          <div className="bg-inequality-red/10 border-l-4 border-inequality-red p-8 rounded-lg my-8">
            <p className="text-3xl font-bold text-white mb-4">
              The biggest wealth transfer in modern history
            </p>
            <p className="font-sans text-base text-gray-300">
              In just four years (2020-2024), the wealth gap widened more than in the previous two decades combined.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="font-sans text-4xl font-bold text-inequality-red mb-2">+£800bn</div>
              <div className="font-sans text-gray-400">Billionaire wealth gain (2020-2024)</div>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="font-sans text-4xl font-bold text-inequality-red mb-2">-3%</div>
              <div className="font-sans text-gray-400">Real wages fell (same period)</div>
            </div>
          </div>

          <p className="font-sans text-base text-gray-400 mt-12">
            This wasn't a natural disaster. It was a policy choice.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
