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

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-900 border border-white/10"
        >
          {/* Project Content */}
          <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-between z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
            <div className="flex justify-between items-start">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm border border-white/10">
                FEATURED DEMO
              </div>
              <Link
                href="/sweet-reach"
                target="_blank"
                className="p-4 bg-white text-black rounded-full hover:scale-110 transition-transform duration-300"
              >
                <ArrowRight size={24} />
              </Link>
            </div>

            <div>
              <h3 className="text-4xl md:text-7xl font-bold mb-4">Sweet Reach</h3>
              <p className="text-lg text-gray-300 max-w-xl mb-8">
                A best-in-class insight gathering platform. Features real-time analytics,
                interactive dashboards, and a premium user interface.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/sweet-reach"
                  target="_blank"
                  className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors group/link"
                >
                  View Live Demo <ExternalLink size={16} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Abstract Background / Placeholder for Screenshot */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/40 via-gray-900 to-black z-10 group-hover:scale-105 transition-transform duration-700" />
        </motion.div>
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
