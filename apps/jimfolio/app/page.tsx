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
          <span className="text-gray-500 hidden md:block">01 / 05</span>
        </div>

        <Link href="/sweet-reach" className="block group">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative w-full"
            style={{ perspective: '1000px' }}
          >
            {/* 3D Flip Container */}
            <div className="relative aspect-video w-full transition-transform duration-700 ease-out group-hover:[transform:rotateY(180deg)]" style={{ transformStyle: 'preserve-3d' }}>
              
              {/* Front Card */}
              <div 
                className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <img 
                  src="/assets/Sweet-Reach_card_front.jpg" 
                  alt="Sweet Reach Dashboard" 
                  className="w-full h-full object-cover"
                />
                
                {/* Top Banner Overlay - Front */}
                <div className="absolute top-0 left-0 right-0 h-[15%] bg-gradient-to-b from-black/90 via-black/70 to-transparent backdrop-blur-sm px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs border border-white/20 font-medium">
                      FEATURED DEMO
                    </div>
                    <div className="text-white">
                      <h3 className="font-bold text-sm">Sweet Reach Insight Platform</h3>
                      <p className="text-xs text-gray-300">Real-time analytics & interactive dashboards</p>
                    </div>
                  </div>
                  <div className="p-3 bg-white text-black rounded-full group-hover:scale-110 transition-transform duration-300">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>

              {/* Back Card */}
              <div 
                className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <img 
                  src="/assets/Sweet-Reach_card_back.png" 
                  alt="Sweet Reach Features" 
                  className="w-full h-full object-cover"
                />
                
                {/* Top Banner Overlay - Back */}
                <div className="absolute top-0 left-0 right-0 h-[15%] bg-gradient-to-b from-black/90 via-black/70 to-transparent backdrop-blur-sm px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full text-xs border border-emerald-400/30 font-medium text-emerald-300">
                      LIVE DEMO
                    </div>
                    <div className="text-white">
                      <h3 className="font-bold text-sm">Click to Explore</h3>
                      <p className="text-xs text-gray-300">Experience the full platform in action</p>
                    </div>
                  </div>
                  <div className="p-3 bg-white text-black rounded-full scale-110 transition-transform duration-300">
                    <ArrowRight size={20} />
                  </div>
                </div>
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
