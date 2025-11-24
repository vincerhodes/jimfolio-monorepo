'use client';

import { motion } from 'framer-motion';
import DivergenceChart from '@/components/visualizations/DivergenceChart';
import divergenceData from '@/data/divergence-data.json';

export default function TurningPoint() {
  return (
    <section id="turning-point" className="section-container bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="section-content">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-sans text-3xl md:text-4xl font-bold mb-8 text-wealth-gold">
            The Turning Point (1971-2008)
          </h2>
          
          <p className="font-sans text-base text-gray-300 mb-6">
            In 1971, President Nixon ended the gold standard. Money was no longer tied to anything physical. 
            This single decision would reshape the global economy.
          </p>

          <p className="font-sans text-base text-gray-300 mb-6">
            Through the 1980s and 90s, the rules changed. Financial deregulation. Tax cuts for the wealthy. 
            Union power dismantled. The social contract that built the post-war prosperity was torn up.
          </p>

          <DivergenceChart data={divergenceData.data} />

          <div className="bg-gray-800/30 border-l-4 border-wealth-gold p-6 my-8">
            <p className="font-sans text-base text-gray-200 italic">
              "The Great Divergence began. Productivity kept rising, but wages flatlined. 
              The wealth we created together started flowing to the top."
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="font-sans text-4xl font-bold text-inequality-red mb-2">83%</div>
              <div className="font-sans text-gray-400">Top tax rate fell from 83% to 40%</div>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="font-sans text-4xl font-bold text-inequality-red mb-2">23%</div>
              <div className="font-sans text-gray-400">Union membership collapsed to 23%</div>
            </div>
          </div>

          <p className="font-sans text-base text-gray-400 mt-12">
            By 2008, the stage was set for the greatest wealth transfer in modern history.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
