'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, Github, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold tracking-tighter"
        >
          JIMFOLIO
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-6 text-sm font-medium"
        >
          <Link href="#work" className="hover:text-gray-400 transition-colors">WORK</Link>
          <Link href="#about" className="hover:text-gray-400 transition-colors">ABOUT</Link>
          <Link href="#contact" className="hover:text-gray-400 transition-colors">CONTACT</Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="h-screen flex flex-col justify-center px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-[12vw] leading-[0.9] font-bold tracking-tighter mb-8">
            DIGITAL <br />
            <span className="text-gray-500">CRAFTSMAN</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl text-gray-400 leading-relaxed">
            Building premium digital experiences with a focus on performance,
            aesthetics, and user-centric design.
          </p>
        </motion.div>
      </section>

      {/* Featured Project: Sweet Reach */}
      <section id="work" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="mb-16 flex items-end justify-between">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">SELECTED WORK</h2>
          <span className="text-gray-500 hidden md:block">01 / 02</span>
        </div>

        {/* Wealth Inequality Project */}
        <Link href="https://jimfolio.space/wealthinequality" target="_blank" rel="noopener noreferrer" className="block group mb-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/30 transition-all duration-500 bg-gradient-to-br from-red-950/20 to-gray-950"
          >
            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <div className="text-center">
                <h3 className="text-6xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  The Wealth Divide
                </h3>
                <p className="text-xl text-gray-300 mb-6">
                  Interactive data story on UK wealth inequality
                </p>
                <div className="flex gap-4 justify-center text-sm text-gray-400">
                  <span>Next.js</span>
                  <span>•</span>
                  <span>D3.js</span>
                  <span>•</span>
                  <span>Framer Motion</span>
                </div>
              </div>
            </div>

            {/* Top Banner Overlay */}
            <div className="absolute top-0 left-0 right-0 h-[15%] bg-[#1a1a1a]/90 px-6 py-4 flex items-center justify-between z-10 transition-all duration-500">
              <div className="flex items-center gap-4">
                <div className="bg-red-500/20 px-3 py-1 rounded-full text-xs border border-red-400/30 font-medium text-red-300">
                  DATA STORYTELLING
                </div>
                <div className="text-white">
                  <h3 className="font-bold text-sm">
                    UK Wealth Inequality
                  </h3>
                  <p className="text-xs text-gray-300">
                    Scrollytelling experience with interactive visualizations
                  </p>
                </div>
              </div>
              <div className="p-3 bg-white text-black rounded-full group-hover:scale-110 transition-transform duration-300">
                <ExternalLink size={20} />
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Sweet Reach */}
        <Link href="/sweet-reach" className="block group">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/30 transition-all duration-500"
          >
            {/* Front Image */}
            <img 
              src="/assets/Sweet-Reach_card_front.jpg" 
              alt="Sweet Reach Dashboard" 
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
            />
            
            {/* Back Image */}
            <img 
              src="/assets/Sweet-Reach_card_back.png" 
              alt="Sweet Reach Features" 
              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />

            {/* Top Banner Overlay - Always Visible */}
            <div className="absolute top-0 left-0 right-0 h-[15%] bg-[#1a1a1a]/90 px-6 py-4 flex items-center justify-between z-10 transition-all duration-500">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 px-3 py-1 rounded-full text-xs border border-white/20 font-medium group-hover:bg-emerald-500/20 group-hover:border-emerald-400/30 group-hover:text-emerald-300 transition-all duration-500">
                  <span className="group-hover:hidden">FEATURED DEMO</span>
                  <span className="hidden group-hover:inline">LIVE DEMO</span>
                </div>
                <div className="text-white">
                  <h3 className="font-bold text-sm transition-all duration-500">
                    <span className="group-hover:hidden">Sweet Reach Insight Platform</span>
                    <span className="hidden group-hover:inline">Click to Explore</span>
                  </h3>
                  <p className="text-xs text-gray-300 transition-all duration-500">
                    <span className="group-hover:hidden">Real-time analytics & interactive dashboards</span>
                    <span className="hidden group-hover:inline">Experience the full platform in action</span>
                  </p>
                </div>
              </div>
              <div className="p-3 bg-white text-black rounded-full group-hover:scale-110 transition-transform duration-300">
                <ArrowRight size={20} />
              </div>
            </div>
          </motion.div>
        </Link>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="grid md:grid-cols-2 gap-16">
          <h2 className="text-4xl font-bold">ABOUT ME</h2>
          <div className="space-y-8 text-lg text-gray-400 leading-relaxed">
            <p>
              I'm a full-stack developer passionate about bridging the gap between
              design and engineering. I believe that the best digital products are
              born at the intersection of form and function.
            </p>
            <p>
              With expertise in Next.js, React, and modern web technologies,
              I create scalable applications that don't compromise on visual appeal.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-5xl md:text-8xl font-bold tracking-tighter mb-12">
            LET'S TALK
          </h2>
          <div className="flex gap-8">
            <a href="#" className="p-4 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all duration-300">
              <Mail size={24} />
            </a>
            <a href="#" className="p-4 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all duration-300">
              <Github size={24} />
            </a>
            <a href="#" className="p-4 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all duration-300">
              <Linkedin size={24} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} JIMFOLIO. All rights reserved.
      </footer>
    </main>
  );
}
