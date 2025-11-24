'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Home, Repeat } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-container bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="section-content">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-sans text-3xl md:text-4xl font-bold mb-8 text-data-blue">
            How the Machine Works
          </h2>
          
          <p className="font-sans text-base text-gray-300 mb-12">
            Understanding the mechanism is key. This isn't about individual greed — it's about how the system is designed.
          </p>

          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-data-blue/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-data-blue" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">1. Money Printing</h3>
                <p className="font-sans text-base text-gray-300">
                  Central banks create money and use it to buy bonds from wealthy investors. 
                  Those investors now have cash to spend.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-wealth-gold/20 rounded-full flex items-center justify-center">
                <Home className="w-8 h-8 text-wealth-gold" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">2. Asset Competition</h3>
                <p className="font-sans text-base text-gray-300">
                  With nowhere else to put it, that cash floods into assets: houses, stocks, land. 
                  More money chasing the same assets = prices rise.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-inequality-red/20 rounded-full flex items-center justify-center">
                <Repeat className="w-8 h-8 text-inequality-red" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">3. The Feedback Loop</h3>
                <p className="font-sans text-base text-gray-300">
                  Asset owners get richer. They buy more assets. Prices rise further. 
                  Those without assets fall further behind. The gap widens exponentially.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 p-8 rounded-lg mt-12">
            <p className="font-sans text-lg md:text-xl text-gray-200 italic">
              "If you don't own assets, you're not just standing still — you're falling behind. 
              Every year, the gap gets wider."
            </p>
            <p className="text-gray-400 mt-4">— Gary Stevenson, former trader</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
