'use client';

import { motion } from 'framer-motion';

export default function FinancialCrisis() {
  return (
    <section id="financial-crisis" className="section-container bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="section-content">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-sans text-3xl md:text-4xl font-bold mb-8 text-inequality-red">
            The Financial Crisis (2008-2012)
          </h2>
          
          <p className="font-sans text-base text-gray-300 mb-6">
            When the banks collapsed in 2008, governments had a choice. They chose to save the financial system 
            by printing money — lots of it.
          </p>

          <p className="font-sans text-base text-gray-300 mb-6">
            <span className="font-bold text-white">Quantitative Easing (QE)</span>: The Bank of England created 
            £445 billion out of thin air. But this money didn't go to workers or public services.
          </p>

          <div className="bg-inequality-red/10 border border-inequality-red/30 p-8 rounded-lg my-8">
            <p className="font-sans text-lg md:text-xl text-gray-200 mb-4">
              The newly created money went to buy government bonds from wealthy investors.
            </p>
            <p className="font-sans text-base text-gray-300">
              Those investors took that cash and bought assets: property, stocks, bonds. 
              Asset prices soared. The rich got richer. Everyone else got left behind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="font-sans text-4xl font-bold text-inequality-red mb-2">£445bn</div>
              <div className="font-sans text-gray-400">Created through QE (2009-2012)</div>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="font-sans text-4xl font-bold text-inequality-red mb-2">+68%</div>
              <div className="font-sans text-gray-400">House prices rose (2009-2019)</div>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="font-sans text-4xl font-bold text-inequality-red mb-2">+0.3%</div>
              <div className="font-sans text-gray-400">Real wages grew (same period)</div>
            </div>
          </div>

          <p className="font-sans text-base text-gray-400 mt-12 italic">
            The rescue that made inequality worse.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
