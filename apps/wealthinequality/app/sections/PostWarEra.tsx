'use client';

import { motion } from 'framer-motion';

export default function PostWarEra() {
  return (
    <section id="post-war" className="section-container bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="section-content">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-sans text-3xl md:text-4xl font-bold mb-8 text-solution-green">
            The Golden Age (1945-1971)
          </h2>
          
          <p className="font-sans text-base text-gray-300 mb-6">
            After World War II, Britain built something remarkable: an economy that worked for everyone.
          </p>

          <p className="font-sans text-base text-gray-300 mb-6">
            Wages rose in lockstep with productivity. A single income could buy a house, raise a family, 
            and save for retirement. The gap between rich and poor was at its narrowest in modern history.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="font-sans text-4xl font-bold text-solution-green mb-2">3.5x</div>
              <div className="font-sans text-gray-400">House price to income ratio in 1970</div>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="font-sans text-4xl font-bold text-solution-green mb-2">98%</div>
              <div className="font-sans text-gray-400">Of productivity gains went to workers</div>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="font-sans text-4xl font-bold text-solution-green mb-2">60%</div>
              <div className="font-sans text-gray-400">Union membership at its peak</div>
            </div>
          </div>

          <p className="font-sans text-base text-gray-400 mt-12 italic">
            This wasn't an accident. It was the result of deliberate policy choices.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
