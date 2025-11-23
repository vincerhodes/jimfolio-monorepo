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

        <Link href="http://localhost:3000" target="_blank" className="block">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-900 border border-white/10 cursor-pointer hover:border-white/30 transition-all duration-300"
          >
            {/* Live Dashboard iframe */}
            <iframe
              src="http://localhost:3000"
              className="absolute inset-0 w-full h-full pointer-events-none scale-[0.85] origin-top-left"
              style={{ 
                transform: 'scale(0.85) translateY(-5%)',
                filter: 'brightness(0.9)'
              }}
            />

            {/* Interactive Overlay */}
            <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-between z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/70 group-hover:via-black/20 transition-all duration-500">
              <div className="flex justify-between items-start">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm border border-white/10 group-hover:bg-white/20 transition-colors">
                  LIVE DEMO
                </div>
                <div className="p-4 bg-white text-black rounded-full group-hover:scale-110 transition-transform duration-300">
                  <ArrowRight size={24} />
                </div>
              </div>

              <div>
                <h3 className="text-4xl md:text-7xl font-bold mb-4 group-hover:text-white/90 transition-colors">Sweet Reach</h3>
                <p className="text-lg text-gray-300 max-w-xl mb-8 group-hover:text-white/80 transition-colors">
                  A best-in-class insight gathering platform. Features real-time analytics,
                  interactive dashboards, and a premium user interface.
                </p>
                <div className="flex items-center gap-2 text-white group-hover:text-white/90 transition-colors">
                  <span>View Live Demo</span>
                  <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
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
