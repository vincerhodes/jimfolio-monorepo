'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Mail, Share2, Users, TrendingUp } from 'lucide-react';

export default function CallToAction() {
  return (
    <section id="call-to-action" className="section-container bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="section-content">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-sans text-3xl md:text-4xl font-bold mb-8 text-center">
            What You Can Do
          </h2>
          
          <p className="font-sans text-lg md:text-xl text-gray-300 mb-12 text-center max-w-3xl mx-auto">
            Wealth inequality isn't inevitable. It's a choice. And we can choose differently.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 hover:border-data-blue transition-colors">
              <Share2 className="w-10 h-10 text-data-blue mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Share This Story</h3>
              <p className="text-gray-300 mb-4">
                Help others understand what's happening and why it matters.
              </p>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'The Wealth Divide - UK Inequality Story',
                      text: 'The bottom 50% of UK households own less than 5% of the wealth. This is the story of how we got here.',
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="text-data-blue hover:text-data-blue/80 font-semibold flex items-center gap-2 cursor-pointer"
              >
                Share on social media
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 hover:border-solution-green transition-colors">
              <Mail className="w-10 h-10 text-solution-green mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Contact Your MP</h3>
              <p className="text-gray-300 mb-4">
                Tell your representative you support wealth taxation.
              </p>
              <a 
                href="https://www.writetothem.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-solution-green hover:text-solution-green/80 font-semibold flex items-center gap-2"
              >
                Find your MP
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 hover:border-wealth-gold transition-colors">
              <Users className="w-10 h-10 text-wealth-gold mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Join Organizations</h3>
              <p className="text-gray-300 mb-4">
                Support groups campaigning for economic justice.
              </p>
              <div className="space-y-2">
                <a href="https://patrioticmillionaires.uk/" target="_blank" rel="noopener noreferrer" className="text-wealth-gold hover:text-wealth-gold/80 font-semibold flex items-center gap-2">
                  Patriotic Millionaires UK
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a href="https://www.taxjustice.uk/" target="_blank" rel="noopener noreferrer" className="text-wealth-gold hover:text-wealth-gold/80 font-semibold flex items-center gap-2">
                  Tax Justice UK
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 hover:border-inequality-red transition-colors">
              <TrendingUp className="w-10 h-10 text-inequality-red mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Vote for Change</h3>
              <p className="text-gray-300 mb-4">
                Support candidates who back wealth taxation and economic justice.
              </p>
              <p className="text-inequality-red font-semibold">
                Make it an election issue
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-data-blue/10 via-solution-green/10 to-data-blue/10 border border-gray-700 p-12 rounded-lg text-center">
            <p className="text-2xl md:text-3xl font-bold text-white mb-6">
              The choice is ours
            </p>
            <p className="font-sans text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              We can continue down this path of ever-widening inequality, or we can choose 
              a fairer system that works for everyone.
            </p>
            <p className="font-sans text-base text-gray-400">
              The research is done. The solutions exist. The time to act is now.
            </p>
          </div>

          <div className="mt-16 text-center text-gray-500 text-sm">
            <p>Created by <a href="https://jimfolio.space" className="text-data-blue hover:underline">Jimmy</a></p>
            <p className="mt-2">Data sources: World Inequality Database, ONS, Bank of England, OECD</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
