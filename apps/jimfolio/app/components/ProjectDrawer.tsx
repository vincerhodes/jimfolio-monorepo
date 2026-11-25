'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, X } from 'lucide-react';
import type { GarageStation } from '../garage/types';

interface ProjectDrawerProps {
  station: GarageStation | null;
  onClose: () => void;
  isTouchDevice?: boolean;
}

export default function ProjectDrawer({
  station,
  onClose,
  isTouchDevice = false,
}: ProjectDrawerProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const slide = isDesktop
    ? { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }
    : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } };

  return (
    <AnimatePresence>
      {station && (
        <>
          <motion.div
            key="drawer-backdrop"
            className="fixed inset-0 z-40 bg-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            key="project-drawer"
            role="dialog"
            aria-modal="false"
            aria-label={`${station.name} project details`}
            className="fixed z-50 flex flex-col overflow-hidden border-white/10 bg-zinc-950/85 backdrop-blur-xl max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[85vh] max-md:rounded-t-3xl max-md:border-t md:bottom-0 md:right-0 md:top-0 md:w-[420px] md:border-l"
            initial={slide.initial}
            animate={slide.animate}
            exit={slide.exit}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close project details"
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="flex-1 overflow-y-auto p-6 pt-14 sm:p-8 sm:pt-16">
              {station.category === 'shed' ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/35 bg-orange-400/10 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.12em] text-orange-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
                    MATT&apos;S POTTING SHED · JOINT PODCAST
                  </span>
                  {station.domainLabel && (
                    <span className="inline-flex rounded-full border border-orange-300/20 bg-orange-300/5 px-2.5 py-1 font-mono text-[10px] text-orange-100/80">
                      {station.domainLabel}
                    </span>
                  )}
                </div>
              ) : station.category === 'shipped' ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.14em] text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    SHIPPED // OUT IN THE WILD
                  </span>
                  {station.domainLabel && (
                    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-zinc-300">
                      {station.domainLabel}
                    </span>
                  )}
                </div>
              ) : (
                <span
                  className="inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.2em]"
                  style={{
                    borderColor: `${station.accentHex}66`,
                    color: station.accentHex,
                  }}
                >
                  {station.tag}
                </span>
              )}

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white">
                {station.name}
              </h2>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                {station.propLabel}
              </p>
              <p className="mt-3 text-sm font-medium" style={{ color: station.accentHex }}>
                {station.tagline}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                {station.description}
              </p>

              {station.category === 'shed' && station.badgeNote && (
                <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-orange-300/20 bg-orange-300/[0.06] px-4 py-3 text-orange-100/75">
                  {station.privateAuth && (
                    <Lock size={14} className="mt-0.5 shrink-0 text-amber-300" />
                  )}
                  <p className="text-xs leading-relaxed">{station.badgeNote}</p>
                </div>
              )}

              {station.tech.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    Tech Stack
                  </h3>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {station.tech.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {station.privateAuth && (
                <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
                  <Lock size={14} className="shrink-0 text-amber-300" />
                  <div>
                    <p className="text-xs font-semibold text-amber-200">
                      Private Access (BasicAuth)
                    </p>
                    <p className="text-[11px] text-amber-200/60">
                      Ask Jim for credentials before launching.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 border-t border-white/10 p-4 sm:p-5">
              <a
                href={station.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-colors ${
                  station.category === 'shipped'
                    ? 'bg-emerald-400 hover:bg-emerald-300'
                    : 'bg-amber-400 hover:bg-amber-300'
                }`}
              >
                {station.category === 'shed'
                  ? 'Listen to Podcast ↗'
                  : station.category === 'shipped'
                    ? 'Visit Live Site ↗'
                    : 'Launch App ↗'}
              </a>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/15 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                {isTouchDevice ? 'Step Back' : 'Step Back (Esc)'}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
