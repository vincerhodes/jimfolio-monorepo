'use client';

import { motion } from 'framer-motion';
import { Globe, TrendingUp } from 'lucide-react';

export default function CaseStudies() {
  return (
    <section id="case-studies" className="section-container bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="section-content">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-sans text-3xl md:text-4xl font-bold mb-8 text-data-blue">
            It Works: International Evidence
          </h2>
          
          <p className="font-sans text-base text-gray-300 mb-12">
            Wealth taxes aren't theoretical. They're working right now in multiple countries.
          </p>

          <div className="space-y-8">
            <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700">
              <div className="flex items-start gap-4 mb-4">
                <Globe className="w-8 h-8 text-data-blue flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Norway</h3>
                  <p className="text-gray-400">Wealth tax since 1892</p>
                </div>
              </div>
              <p className="font-sans text-base text-gray-300 mb-4">
                1.1% tax on net wealth above ~£150,000. Raises significant revenue while maintaining 
                one of the world's highest living standards.
              </p>
              <div className="flex gap-6">
                <div>
                  <div className="text-2xl font-bold text-solution-green">1.1%</div>
                  <div className="text-sm text-gray-400">Tax rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-solution-green">~£4bn</div>
                  <div className="text-sm text-gray-400">Annual revenue</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700">
              <div className="flex items-start gap-4 mb-4">
                <Globe className="w-8 h-8 text-data-blue flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Switzerland</h3>
                  <p className="text-gray-400">Cantonal wealth taxes</p>
                </div>
              </div>
              <p className="font-sans text-base text-gray-300 mb-4">
                Progressive wealth taxes at cantonal level. Rates vary by canton, averaging 0.3-1%. 
                No mass exodus of wealthy residents.
              </p>
              <div className="flex gap-6">
                <div>
                  <div className="text-2xl font-bold text-solution-green">0.3-1%</div>
                  <div className="text-sm text-gray-400">Tax range</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-solution-green">Stable</div>
                  <div className="text-sm text-gray-400">Wealthy population</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700">
              <div className="flex items-start gap-4 mb-4">
                <Globe className="w-8 h-8 text-data-blue flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Spain</h3>
                  <p className="text-gray-400">Wealth tax reinstated 2021</p>
                </div>
              </div>
              <p className="font-sans text-base text-gray-300 mb-4">
                Progressive rates from 0.2% to 3.5% on wealth above €700,000. 
                Helps fund public services without economic collapse.
              </p>
              <div className="flex gap-6">
                <div>
                  <div className="text-2xl font-bold text-solution-green">0.2-3.5%</div>
                  <div className="text-sm text-gray-400">Progressive rates</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-solution-green">€700k</div>
                  <div className="text-sm text-gray-400">Threshold</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-data-blue/10 border border-data-blue/30 p-8 rounded-lg mt-12">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 text-data-blue flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-white mb-3">The "They'll Leave" Myth</h3>
                <p className="font-sans text-base text-gray-300 mb-4">
                  Data from these countries shows minimal emigration of wealthy individuals. 
                  People don't abandon their homes, families, and networks over modest taxes.
                </p>
                <p className="font-sans text-base text-gray-300">
                  In Norway, fewer than 0.1% of wealth tax payers emigrate annually — 
                  lower than the general population migration rate.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
