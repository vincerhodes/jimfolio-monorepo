'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Github, Mail } from 'lucide-react';
import Link from 'next/link';
import { APPS, type AppEntry } from './apps';
import ThemeToggle from './components/ThemeToggle';

function AppCard({ app }: { app: AppEntry }) {
  return (
    <a
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group h-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="h-full rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 flex flex-col gap-4 hover:border-stone-400 dark:hover:border-white/30 hover:-translate-y-1 transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <span
            className={`px-3 py-1 rounded-full text-xs border font-medium ${app.chip}`}
          >
            {app.tag}
          </span>
          <span className="p-2 rounded-full bg-stone-900 text-white dark:bg-white dark:text-black group-hover:scale-110 transition-transform duration-300">
            <ArrowUpRight size={16} />
          </span>
        </div>
        <h3
          className={`text-2xl font-bold bg-gradient-to-r ${app.gradient} bg-clip-text text-transparent`}
        >
          {app.name}
        </h3>
        <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed flex-1">
          {app.tagline}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-400 dark:text-stone-500">
          {app.tech.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </motion.div>
    </a>
  );
}

function FeaturedCard({ app }: { app: AppEntry }) {
  return (
    <a
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative w-full aspect-video rounded-2xl overflow-hidden border border-stone-200 dark:border-white/10 group-hover:border-stone-400 dark:group-hover:border-white/30 transition-all duration-500"
      >
        {app.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={app.image}
            alt={`${app.name} preview`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute top-0 left-0 right-0 bg-white/85 dark:bg-[#1a1a1a]/90 backdrop-blur px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <span
              className={`px-3 py-1 rounded-full text-xs border font-medium ${app.chip}`}
            >
              {app.tag}
            </span>
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                {app.name}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-300">
                {app.tagline}
              </p>
            </div>
          </div>
          <span className="p-3 bg-stone-900 text-white dark:bg-white dark:text-black rounded-full group-hover:scale-110 transition-transform duration-300">
            <ArrowUpRight size={20} />
          </span>
        </div>
      </motion.div>
    </a>
  );
}

export default function Home() {
  const featured = APPS.filter((a) => a.featured);
  const rest = APPS.filter((a) => !a.featured);

  return (
    <main className="min-h-screen text-stone-900 dark:text-stone-100 selection:bg-stone-300 dark:selection:bg-white/20">
      {/* Header */}
      <header className="sticky top-0 w-full z-50 px-6 py-4 flex justify-between items-center border-b border-stone-200 dark:border-white/10 bg-[#fafaf9]/80 dark:bg-[#0a0a0a]/80 backdrop-blur">
        <Link href="/" className="text-xl font-bold tracking-tighter">
          JIMFOLIO
        </Link>
        <nav className="flex items-center gap-4 md:gap-6 text-sm font-medium">
          <Link
            href="#work"
            className="hidden sm:inline hover:text-stone-500 dark:hover:text-stone-400 transition-colors"
          >
            WORK
          </Link>
          <Link
            href="#about"
            className="hidden sm:inline hover:text-stone-500 dark:hover:text-stone-400 transition-colors"
          >
            ABOUT
          </Link>
          <Link
            href="#contact"
            className="hidden sm:inline hover:text-stone-500 dark:hover:text-stone-400 transition-colors"
          >
            CONTACT
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 md:pt-28 md:pb-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter leading-[0.95] mb-6">
            Apps, experiments
            <br />
            <span className="text-stone-400 dark:text-stone-500">
              & data stories.
            </span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl text-stone-500 dark:text-stone-400 leading-relaxed">
            Jimmy Rhodes — full-stack developer. This is the hub for{' '}
            {APPS.length} live projects on jimfolio.space.
          </p>
        </motion.div>
      </section>

      {/* Work grid */}
      <section id="work" className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            SELECTED WORK
          </h2>
          <span className="text-stone-400 dark:text-stone-500 hidden md:block">
            {APPS.length} LIVE
          </span>
        </div>

        <div className="space-y-6 mb-6">
          {featured.map((app) => (
            <FeaturedCard key={app.slug} app={app} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((app) => (
            <AppCard key={app.slug} app={app} />
          ))}
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="py-24 px-6 max-w-7xl mx-auto border-t border-stone-200 dark:border-white/10"
      >
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <h2 className="text-3xl md:text-4xl font-bold">ABOUT ME</h2>
          <div className="space-y-6 text-base md:text-lg text-stone-500 dark:text-stone-400 leading-relaxed">
            <p>
              I&apos;m a full-stack developer passionate about bridging the gap
              between design and engineering. The best digital products are born
              at the intersection of form and function.
            </p>
            <p>
              With Next.js, React and modern web tooling, I build applications
              that don&apos;t compromise on visual appeal — every card above is
              live and clickable.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="py-24 px-6 max-w-7xl mx-auto border-t border-stone-200 dark:border-white/10"
      >
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-7xl font-bold tracking-tighter mb-10">
            LET&apos;S TALK
          </h2>
          <div className="flex gap-6">
            <a
              href="mailto:vincerhodes@gmail.com"
              aria-label="Email"
              className="p-4 rounded-full border border-stone-300 dark:border-white/10 hover:bg-stone-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
            >
              <Mail size={24} />
            </a>
            <a
              href="https://github.com/vincerhodes"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-4 rounded-full border border-stone-300 dark:border-white/10 hover:bg-stone-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
            >
              <Github size={24} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-stone-200 dark:border-white/10 text-center text-stone-400 dark:text-stone-600 text-sm">
        © {new Date().getFullYear()} JIMFOLIO. All rights reserved.
      </footer>
    </main>
  );
}
