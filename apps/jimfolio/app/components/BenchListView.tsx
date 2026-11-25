'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Lock, Search } from 'lucide-react';
import type { GarageStation } from '../garage/types';

interface BenchListViewProps {
  stations: GarageStation[];
  isOpen: boolean;
  isWebGLFallback?: boolean;
  onClose?: () => void;
  isTouchDevice?: boolean;
}

function StationCard({ station }: { station: GarageStation }) {
  const isShipped = station.category === 'shipped';
  const isFarm = station.category === 'farm';

  return (
    <article className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.06]">
      <div className="flex items-start justify-between gap-2">
        {isShipped || isFarm ? (
          station.domainLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 font-mono text-[9px] tracking-wide text-emerald-300">
              <span className="relative flex h-1.5 w-1.5">
                {isShipped && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                )}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              {station.domainLabel}
            </span>
          )
        ) : (
          <span
            className="rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-[0.18em]"
            style={{
              borderColor: `${station.accentHex}55`,
              color: station.accentHex,
            }}
          >
            {station.tag}
          </span>
        )}
        <div className="flex items-center gap-1.5">
          {station.status404 && (
            <span className="rounded-full border border-rose-400/35 bg-rose-400/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-rose-300">
              404
            </span>
          )}
          {station.privateAuth && (
            <span className="flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[9px] font-medium text-amber-300">
              <Lock size={10} />
              Private
            </span>
          )}
        </div>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-white">{station.name}</h3>
      <p className="mt-0.5 text-xs font-medium" style={{ color: station.accentHex }}>
        {station.tagline}
      </p>
      <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-zinc-400">
        {station.description}
      </p>
      {station.tech.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {station.tech.map((tech) => (
            <span
              key={tech}
              className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400"
            >
              {tech}
            </span>
          ))}
        </div>
      )}
      {station.status404 ? (
        <button
          type="button"
          disabled
          className="mt-4 cursor-not-allowed rounded-full border border-rose-400/20 bg-rose-400/5 py-2 text-xs font-semibold text-rose-300/60"
        >
          404 — URL Pending
        </button>
      ) : (
        <a
          href={station.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-4 flex items-center justify-center gap-1.5 rounded-full border py-2 text-xs font-semibold transition-colors ${
            isShipped || isFarm
              ? 'border-emerald-400/25 text-emerald-200 hover:border-emerald-400/60 hover:bg-emerald-400/10'
              : 'border-white/15 text-zinc-100 hover:border-amber-400/60 hover:bg-amber-400/10 hover:text-amber-200'
          }`}
        >
          {station.id === 'matt-preparingforai'
            ? 'Listen to Podcast'
            : station.id === 'matt-descartwright'
              ? 'Visit Gallery'
              : isFarm
                ? 'Visit Site'
                : isShipped
                  ? 'Visit Live Site'
                  : 'Launch App'}
          <ArrowUpRight size={13} />
        </a>
      )}
    </article>
  );
}

export default function BenchListView({
  stations,
  isOpen,
  isWebGLFallback = false,
  onClose,
  isTouchDevice = false,
}: BenchListViewProps) {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('All');

  const tags = useMemo(
    () => ['All', ...Array.from(new Set(stations.map((station) => station.tag)))],
    [stations],
  );

  useEffect(() => {
    if (isWebGLFallback || !isOpen || !onClose) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isWebGLFallback, onClose]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return stations.filter((station) => {
      if (activeTag !== 'All' && station.tag !== activeTag) return false;
      if (!needle) return true;
      const haystack = [
        station.name,
        station.domainLabel ?? '',
        station.tag,
        station.tagline,
        station.description,
        ...station.tech,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [stations, query, activeTag]);

  if (!isOpen && !isWebGLFallback) return null;

  const shippedStations = filtered.filter(
    (station) => station.category === 'shipped',
  );
  const experimentStations = filtered.filter(
    (station) => station.category === 'experiment',
  );
  const farmStations = filtered.filter((station) => station.category === 'farm');
  const shellClass = isWebGLFallback
    ? 'min-h-screen bg-zinc-950 text-zinc-100'
    : 'fixed inset-0 z-50 overflow-y-auto bg-zinc-950/95 backdrop-blur-xl text-zinc-100';

  return (
    <div
      className={shellClass}
      onClick={isWebGLFallback ? undefined : onClose}
      role={isWebGLFallback ? undefined : 'presentation'}
    >
      <div
        className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-4 py-8 sm:px-8 sm:py-12"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
              Jim&apos;s Garage
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Bench List
            </h1>
          </div>
          {!isWebGLFallback && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={14} />
              {isTouchDevice ? 'Back to 3D Garage' : 'Back to 3D Garage (Esc / L)'}
            </button>
          )}
        </header>

        {isWebGLFallback && (
          <p className="mt-3 max-w-xl text-sm text-zinc-400">
            Your browser couldn&apos;t start WebGL, so here&apos;s the workbench
            directory in flat form. Everything on the bench is still one click away.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the bench…"
              aria-label="Search stations"
              className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-amber-400/50 focus:bg-white/10"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                aria-pressed={tag === activeTag}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  tag === activeTag
                    ? 'border-amber-400/60 bg-amber-400/15 text-amber-200'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <main className="mt-8 flex flex-1 flex-col gap-9">
          {shippedStations.length > 0 && (
            <section aria-labelledby="shipped-products-heading">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                <h2
                  id="shipped-products-heading"
                  className="font-mono text-[11px] font-semibold tracking-[0.18em] text-emerald-300"
                >
                  SHIPPED // OUT IN THE WILD ({shippedStations.length})
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shippedStations.map((station) => (
                  <StationCard key={station.id} station={station} />
                ))}
              </div>
            </section>
          )}

          {experimentStations.length > 0 && (
            <section aria-labelledby="garage-experiments-heading">
              <div className="mb-4 flex items-center gap-2.5">
                <h2
                  id="garage-experiments-heading"
                  className="font-mono text-[11px] font-semibold tracking-[0.18em] text-amber-300"
                >
                  ON THE BENCH // GARAGE EXPERIMENTS ({experimentStations.length})
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {experimentStations.map((station) => (
                  <StationCard key={station.id} station={station} />
                ))}
              </div>
            </section>
          )}

          {farmStations.length > 0 && (
            <section
              aria-labelledby="matt-farm-heading"
              className="rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.025] p-4 sm:p-5"
            >
              <div className="mb-4 flex flex-wrap items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.55)]" />
                <h2
                  id="matt-farm-heading"
                  className="font-mono text-[11px] font-semibold tracking-[0.14em] text-amber-200"
                >
                  NEXT DOOR // MATT&apos;S FARM ({farmStations.length})
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {farmStations.map((station) => (
                  <StationCard key={station.id} station={station} />
                ))}
              </div>
            </section>
          )}

          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-zinc-500">
              Nothing on the bench matches that search.
            </p>
          )}
        </main>

        <footer className="mt-10 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">About</h2>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-zinc-400">
                Jim&apos;s Garage — Experiments, tools &amp; side builds by Jimmy
                Rhodes.
              </p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Contact</h2>
              <ul className="mt-1 space-y-1 text-xs">
                <li>
                  <a
                    href="mailto:jim@jimsgarage.dev"
                    className="text-zinc-400 underline-offset-4 transition-colors hover:text-amber-200 hover:underline"
                  >
                    jim@jimsgarage.dev
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/vincerhodes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 underline-offset-4 transition-colors hover:text-amber-200 hover:underline"
                  >
                    github.com/vincerhodes
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
