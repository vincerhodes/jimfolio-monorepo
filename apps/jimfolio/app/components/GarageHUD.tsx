'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DoorClosed,
  DoorOpen,
  Grid,
  Moon,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type {
  GarageStage,
  LightingMode,
  ProjectedLabel,
  StationId,
} from '../garage/types';

interface GarageHUDProps {
  stage: GarageStage;
  lightingMode: LightingMode;
  isBenchListOpen: boolean;
  hoveredStationId: StationId | null;
  selectedStationId: StationId | null;
  projectedLabels: ProjectedLabel[];
  onOpenDoor: () => void;
  onCloseDoor: () => void;
  onToggleLighting: () => void;
  onToggleBenchList: () => void;
  onSelectStation: (id: StationId) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  toastMessage?: string | null;
  hoverHint?: string | null;
}

const QUICK_DOCK: {
  experiment: { id: StationId; name: string }[];
  shipped: { id: StationId; name: string }[];
} = {
  experiment: [
    { id: 'predictr', name: 'Predictr' },
    { id: 'plannr', name: 'Plannr' },
    { id: 'crema', name: 'Crema' },
    { id: 'pantry', name: 'Pantry' },
    { id: 'chinahols', name: 'China Holidays' },
    { id: 'book-adventure', name: 'Book Adventure' },
    { id: 'rocketsfc', name: 'Rockets FC' },
    { id: 'preppr', name: 'Preppr' },
  ],
  shipped: [
    { id: 'browzr', name: 'Browzr' },
    { id: 'kickoff-hq', name: 'KickoffHQ' },
    { id: 'rovr', name: 'Rovr' },
    { id: 'preparingforai', name: 'Preparing for AI' },
    { id: 'rightcourtsc', name: 'Right Court SC' },
  ],
};

const pillBase =
  'pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950/70 px-3.5 py-2 text-xs font-medium text-zinc-200 backdrop-blur-md transition-colors hover:bg-zinc-900/90 hover:text-white';

function KeyHint({ children }: { children: string }) {
  return (
    <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] leading-none text-zinc-400">
      {children}
    </kbd>
  );
}

export default function GarageHUD({
  stage,
  lightingMode,
  isBenchListOpen,
  hoveredStationId,
  selectedStationId,
  projectedLabels,
  onOpenDoor,
  onCloseDoor,
  onToggleLighting,
  onToggleBenchList,
  onSelectStation,
  isMuted = false,
  onToggleMute,
  toastMessage,
  hoverHint,
}: GarageHUDProps) {
  const [dockCategory, setDockCategory] = useState<'experiment' | 'shipped'>(
    'experiment',
  );
  const hoveredLabel =
    stage === 'interior' && hoveredStationId
      ? projectedLabels.find(
          (label) => label.id === hoveredStationId && label.visible,
        )
      : undefined;

  const doorIsOpen = stage === 'interior' || stage === 'inspecting';

  return (
    <div className="pointer-events-none fixed inset-0 z-30 select-none">
      <header className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
        <div className={pillBase}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[13px] font-semibold tracking-[0.18em] text-white">
            JIM&apos;S GARAGE
          </span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] leading-none text-zinc-300">
            .dev
          </span>
        </div>

        <nav className="pointer-events-auto ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            className={pillBase}
            aria-label={isMuted ? 'Unmute workshop audio' : 'Mute workshop audio'}
            aria-pressed={isMuted}
            title="Toggle workshop audio (M)"
          >
            {isMuted ? (
              <VolumeX size={14} className="text-zinc-400" />
            ) : (
              <Volume2 size={14} className="text-emerald-300" />
            )}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound'}</span>
            <KeyHint>M</KeyHint>
          </button>

          <button
            type="button"
            onClick={onToggleLighting}
            className={pillBase}
            aria-label="Toggle lighting mode"
          >
            {lightingMode === 'day' ? (
              <Sun size={14} className="text-amber-300" />
            ) : (
              <Moon size={14} className="text-sky-300" />
            )}
            <span className="hidden sm:inline">Light Switch</span>
            <KeyHint>T</KeyHint>
          </button>

          <button
            type="button"
            onClick={doorIsOpen ? onCloseDoor : onOpenDoor}
            className={pillBase}
            aria-label={doorIsOpen ? 'Close garage door' : 'Open garage door'}
          >
            {doorIsOpen ? (
              <DoorClosed size={14} className="text-zinc-400" />
            ) : (
              <DoorOpen size={14} className="text-amber-300" />
            )}
            <span className="hidden sm:inline">
              {doorIsOpen ? 'Close Door' : 'Open Door'}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleBenchList}
            aria-pressed={isBenchListOpen}
            className={`${pillBase} ${
              isBenchListOpen ? 'border-amber-400/50 text-amber-200' : ''
            }`}
            aria-label="Toggle bench list"
          >
            <Grid size={14} />
            <span className="hidden sm:inline">Bench List</span>
            <KeyHint>L</KeyHint>
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            key={toastMessage}
            role="status"
            aria-live="polite"
            className="absolute left-1/2 top-20 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-amber-300/25 bg-zinc-950/85 px-4 py-2 text-xs font-medium text-amber-100 shadow-xl shadow-black/30 backdrop-blur-md"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', damping: 24, stiffness: 360 }}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.8)]" />
            <span className="overflow-hidden text-ellipsis">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {stage === 'exterior' && (
        <div className="absolute bottom-8 left-1/2 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col items-center gap-2.5">
          <p className="text-xs tracking-wide text-zinc-400">
            Click garage door or press{' '}
            <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
              Enter
            </kbd>{' '}
            to roll open
          </p>
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/10 bg-zinc-950/75 p-1.5 pl-4 backdrop-blur-md">
            <button
              type="button"
              onClick={onOpenDoor}
              className="rounded-full bg-amber-400 px-4 py-1.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
            >
              Open Garage
            </button>
            <button
              type="button"
              onClick={onToggleBenchList}
              className="pr-2 text-xs text-zinc-400 underline-offset-4 transition-colors hover:text-zinc-200 hover:underline"
            >
              Skip to Bench List
            </button>
          </div>
        </div>
      )}

      {stage === 'interior' && (
        <div className="absolute bottom-5 left-1/2 flex w-[calc(100vw-2rem)] max-w-3xl -translate-x-1/2 flex-col items-center gap-2">
          <AnimatePresence>
            {hoverHint && (
              <motion.div
                key={hoverHint}
                role="status"
                className="max-w-full rounded-full border border-white/10 bg-zinc-950/80 px-3 py-1.5 text-center text-[11px] font-medium text-zinc-200 shadow-lg shadow-black/20 backdrop-blur-md"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.16 }}
              >
                {hoverHint}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pointer-events-auto flex max-w-full flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-zinc-950/75 p-1.5 shadow-xl shadow-black/20 backdrop-blur-md">
            <div
              role="tablist"
              aria-label="Quick dock categories"
              className="flex rounded-full border border-white/10 bg-black/20 p-0.5"
            >
              <button
                type="button"
                role="tab"
                aria-selected={dockCategory === 'experiment'}
                onClick={() => setDockCategory('experiment')}
                className={`rounded-full px-3 py-1 text-[10px] font-semibold transition-colors ${
                  dockCategory === 'experiment'
                    ? 'bg-amber-400/90 text-zinc-950'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                On the Bench (8)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={dockCategory === 'shipped'}
                onClick={() => setDockCategory('shipped')}
                className={`rounded-full px-3 py-1 text-[10px] font-semibold transition-colors ${
                  dockCategory === 'shipped'
                    ? 'bg-emerald-400/90 text-zinc-950'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                Shipped Wall (5)
              </button>
            </div>

            <div className="flex max-w-full items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {QUICK_DOCK[dockCategory].map((station) => {
                const active =
                  station.id === selectedStationId ||
                  station.id === hoveredStationId;
                return (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => onSelectStation(station.id)}
                    aria-pressed={station.id === selectedStationId}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
                      active
                        ? dockCategory === 'shipped'
                          ? 'bg-emerald-400/90 text-zinc-950'
                          : 'bg-amber-400/90 text-zinc-950'
                        : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {station.name}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="rounded-full border border-white/10 bg-zinc-950/75 px-3.5 py-1 text-center text-[10px] tracking-wide text-zinc-200 backdrop-blur-md">
            Click any prop, plaque, or wall switch · Drag to look around
          </p>
        </div>
      )}

      {hoveredLabel && (
        <div
          className="absolute"
          style={{
            left: hoveredLabel.x,
            top: hoveredLabel.y,
            transform: 'translate(-50%, -130%)',
          }}
        >
          <div className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-white/15 bg-zinc-950/90 px-3 py-1.5 shadow-xl shadow-black/40 backdrop-blur-md">
            <span className="font-mono text-[9px] tracking-[0.2em] text-amber-300">
              {hoveredLabel.tag}
            </span>
            <span className="text-xs font-semibold text-white">
              {hoveredLabel.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
