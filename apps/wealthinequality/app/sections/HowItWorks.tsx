'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Home, Repeat } from 'lucide-react';

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);

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

          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`w-full text-left rounded-lg border transition-colors ${
                activeStep === 1
                  ? 'border-data-blue/60 bg-data-blue/10'
                  : 'border-gray-700/70 bg-gray-800/40 hover:bg-gray-800/70'
              }`}
            >
              <div className="flex gap-6 items-start p-5 md:p-6">
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
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`w-full text-left rounded-lg border transition-colors ${
                activeStep === 2
                  ? 'border-wealth-gold/60 bg-wealth-gold/10'
                  : 'border-gray-700/70 bg-gray-800/40 hover:bg-gray-800/70'
              }`}
            >
              <div className="flex gap-6 items-start p-5 md:p-6">
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
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`w-full text-left rounded-lg border transition-colors ${
                activeStep === 3
                  ? 'border-inequality-red/60 bg-inequality-red/10'
                  : 'border-gray-700/70 bg-gray-800/40 hover:bg-gray-800/70'
              }`}
            >
              <div className="flex gap-6 items-start p-5 md:p-6">
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
            </button>
          </div>

          <div className="mt-10 bg-gray-900/60 border border-gray-700 rounded-lg p-6">
            <p className="font-sans text-sm md:text-base text-gray-300">
              {activeStep === 1 && 'Step 1 shows how new money enters the system at the very top, through wealthy investors.'}
              {activeStep === 2 &&
                'Step 2 shows that money chasing a limited number of houses, stocks and land, pushing asset prices higher.'}
              {activeStep === 3 &&
                'Step 3 shows the loop: higher asset prices make wealthy people richer, giving them even more to invest next time.'}
            </p>
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
