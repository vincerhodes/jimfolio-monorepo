'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DoorClosed,
  DoorOpen,
  Grid,
  Info,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type {
  BuildingId,
  GarageStage,
  LightingMode,
  ProjectedLabel,
  StationId,
  ViewPreset,
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
  isTouchDevice?: boolean;
  activeViewPreset?: ViewPreset;
  onPanView?: (preset: ViewPreset) => void;
  activeBuilding?: BuildingId;
  onSwitchBuilding?: (building: BuildingId) => void;
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

const VIEW_PRESETS: { preset: ViewPreset; label: string }[] = [
  { preset: 'left', label: 'Left Bench' },
  { preset: 'center', label: 'Center' },
  { preset: 'right', label: 'Shipped Wall' },
];

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
  isTouchDevice,
  activeViewPreset,
  onPanView,
  activeBuilding = 'jim',
  onSwitchBuilding,
}: GarageHUDProps) {
  const [dockCategory, setDockCategory] = useState<'experiment' | 'shipped'>(
    'experiment',
  );
  const [touchDetected, setTouchDetected] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    if (isTouchDevice !== undefined) return;
    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => setTouchDetected(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [isTouchDevice]);

  useEffect(() => {
    if (!aboutOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAboutOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [aboutOpen]);

  const isTouch = isTouchDevice ?? touchDetected;
  const isJim = activeBuilding === 'jim';

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
        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
          <div className={`${pillBase} shrink-0`}>
            {isJim ? (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
            ) : (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-30" />
                <span className="relative inline-flex h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              </span>
            )}
            <span className="whitespace-nowrap text-[13px] font-semibold tracking-[0.18em] text-white">
              {isJim ? "JIM'S GARAGE" : "MATT'S SHED"}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 font-mono text-[10px] leading-none ${
                isJim
                  ? 'bg-white/10 text-zinc-300'
                  : 'bg-amber-400/15 text-amber-300'
              }`}
            >
              {isJim ? '.dev' : '.wip'}
            </span>
          </div>

          {onSwitchBuilding && (
            <div
              role="group"
              aria-label="Switch building"
              className="pointer-events-auto flex rounded-full border border-white/10 bg-zinc-950/75 p-1 shadow-lg shadow-black/20 backdrop-blur-md"
            >
              <button
                type="button"
                aria-pressed={activeBuilding === 'jim'}
                onClick={() => onSwitchBuilding('jim')}
                className={`whitespace-nowrap rounded-full px-2.5 py-1.5 text-[10px] font-semibold transition-colors sm:px-3 sm:text-xs ${
                  activeBuilding === 'jim'
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                Jim&apos;s Garage
              </button>
              <button
                type="button"
                aria-pressed={activeBuilding === 'matt'}
                onClick={() => onSwitchBuilding('matt')}
                className={`whitespace-nowrap rounded-full px-2.5 py-1.5 text-[10px] font-semibold transition-colors sm:px-3 sm:text-xs ${
                  activeBuilding === 'matt'
                    ? 'bg-orange-400/20 text-orange-200 shadow-sm'
                    : 'text-zinc-500 hover:text-orange-200'
                }`}
              >
                Matt&apos;s Shed
              </button>
            </div>
          )}
        </div>

        <nav className="pointer-events-auto ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAboutOpen((open) => !open)}
            aria-pressed={aboutOpen}
            aria-label="About Jim"
            className={`${pillBase} ${
              aboutOpen ? 'border-amber-400/50 text-amber-200' : ''
            }`}
          >
            <Info
              size={14}
              className={aboutOpen ? 'text-amber-300' : 'text-zinc-400'}
            />
            <span className="hidden sm:inline">About</span>
          </button>

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
            {!isTouch && <KeyHint>M</KeyHint>}
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
            {!isTouch && <KeyHint>T</KeyHint>}
          </button>

          <button
            type="button"
            onClick={doorIsOpen ? onCloseDoor : onOpenDoor}
            className={pillBase}
            aria-label={`${doorIsOpen ? 'Close' : 'Open'} ${isJim ? 'garage' : 'shed'} door`}
          >
            {doorIsOpen ? (
              <DoorClosed size={14} className="text-zinc-400" />
            ) : (
              <DoorOpen size={14} className="text-amber-300" />
            )}
            <span className="hidden sm:inline">
              {doorIsOpen ? 'Close Door' : isJim ? 'Open Door' : 'Open Shed'}
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
            {!isTouch && <KeyHint>L</KeyHint>}
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

      {aboutOpen && (
        <button
          type="button"
          aria-label="Dismiss about popover"
          onClick={() => setAboutOpen(false)}
          className="pointer-events-auto fixed inset-0 z-30 cursor-default bg-transparent"
        />
      )}

      <AnimatePresence>
        {aboutOpen && (
          <motion.div
            key="about-popover"
            role="dialog"
            aria-label="About Jimmy Rhodes"
            className="pointer-events-auto absolute right-4 top-[4.5rem] z-40 w-[calc(100vw-2rem)] max-w-72 rounded-2xl border border-white/10 bg-zinc-950/90 p-4 shadow-xl shadow-black/40 backdrop-blur-xl sm:right-5"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <button
              type="button"
              onClick={() => setAboutOpen(false)}
              aria-label="Close about popover"
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={13} />
            </button>
            <h2 className="text-sm font-semibold text-white">Jimmy Rhodes</h2>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Builder &amp; tinkerer · jimsgarage.dev
            </p>
            <p className="mt-2.5 text-xs leading-relaxed text-zinc-300">
              Home to shipped products like Browzr and KickoffHQ alongside live
              side builds and AI experiments.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs">
              <li>
                <a
                  href="mailto:jim@jimsgarage.dev"
                  className="text-zinc-300 underline-offset-4 transition-colors hover:text-amber-200 hover:underline"
                >
                  jim@jimsgarage.dev
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/vincerhodes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-300 underline-offset-4 transition-colors hover:text-amber-200 hover:underline"
                >
                  github.com/vincerhodes
                </a>
              </li>
            </ul>
            <button
              type="button"
              onClick={() => {
                onToggleBenchList();
                setAboutOpen(false);
              }}
              className="mt-4 flex w-full items-center justify-center rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
            >
              Open Bench List
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {stage === 'exterior' && (
        <div className="absolute bottom-8 left-1/2 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col items-center gap-2.5">
          <p className="max-w-[calc(100vw-2rem)] rounded-full border border-white/10 bg-zinc-950/75 px-4 py-1.5 text-center text-[11px] font-medium text-zinc-200 backdrop-blur-md">
            {isJim ? (
              <>
                Jimmy Rhodes — builder of Browzr, KickoffHQ &amp; 11 live
                experiments. Step inside.
              </>
            ) : (
              "Matt's Potting Shed — one finished podcast, four shelves of immaculate potential."
            )}
          </p>
          <p className="rounded-full bg-zinc-950/75 px-3 py-1 text-center text-xs tracking-wide text-zinc-200 backdrop-blur-md">
            {isJim ? (
              isTouch ? (
                "Tap door to open · Swipe → for Matt's Shed"
              ) : (
                <>
                  Click door or press{' '}
                  <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
                    Enter
                  </kbd>{' '}
                  · Scroll or → for Matt&apos;s Shed next door
                </>
              )
            ) : (
              <>
                Warning: door sticks · Click shed door or press{' '}
                <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
                  Enter
                </kbd>
              </>
            )}
          </p>
          <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/75 p-1.5 backdrop-blur-md sm:rounded-full sm:gap-3 sm:pl-4">
            {isJim ? (
              <>
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
                  className="px-2 text-xs text-zinc-400 underline-offset-4 transition-colors hover:text-zinc-200 hover:underline"
                >
                  Skip to Bench List
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onOpenDoor}
                  className="rounded-full bg-orange-500 px-4 py-1.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-orange-400"
                >
                  Push Open Shed
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchBuilding?.('jim')}
                  disabled={!onSwitchBuilding}
                  className="px-2 text-xs font-medium text-orange-200 underline-offset-4 transition-colors hover:text-orange-100 hover:underline disabled:cursor-default disabled:opacity-50"
                >
                  ← Back to Jim&apos;s Garage
                </button>
              </>
            )}
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

          {isJim && onPanView && (
            <div
              role="tablist"
              aria-label="Quick pan views"
              className="pointer-events-auto flex rounded-full border border-white/10 bg-zinc-950/75 p-1 shadow-lg shadow-black/20 backdrop-blur-md md:hidden"
            >
              {VIEW_PRESETS.map(({ preset, label }) => {
                const active = (activeViewPreset ?? 'center') === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => onPanView(preset)}
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold transition-colors ${
                      active
                        ? 'bg-amber-400/90 text-zinc-950'
                        : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {isJim ? (
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
          ) : (
            <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-orange-300/20 bg-zinc-950/80 p-1.5 shadow-xl shadow-black/20 backdrop-blur-md">
              <button
                type="button"
                onClick={() => onSelectStation('matt-preparingforai')}
                aria-pressed={selectedStationId === 'matt-preparingforai'}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  selectedStationId === 'matt-preparingforai' ||
                  hoveredStationId === 'matt-preparingforai'
                    ? 'bg-orange-400 text-zinc-950'
                    : 'bg-orange-400/15 text-orange-200 hover:bg-orange-400/25'
                }`}
              >
                Preparing for AI
              </button>
              <span className="whitespace-nowrap rounded-full border border-dashed border-white/10 px-3 py-1.5 text-[10px] text-zinc-500">
                + 4 empty WIP shelves
              </span>
              <button
                type="button"
                onClick={() => onSwitchBuilding?.('jim')}
                disabled={!onSwitchBuilding}
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-medium text-orange-200 transition-colors hover:bg-orange-400/10 hover:text-orange-100 disabled:cursor-default disabled:opacity-50"
              >
                ← Back to Jim&apos;s Garage
              </button>
            </div>
          )}
          <p className="rounded-full border border-white/10 bg-zinc-950/75 px-3.5 py-1 text-center text-[10px] tracking-wide text-zinc-200 backdrop-blur-md">
            {isJim
              ? isTouch
                ? 'Tap any prop or plaque · Swipe to look around'
                : 'Click any prop, plaque, or wall switch · Drag to look around'
              : isTouch
                ? 'Tap the podcast bench · Four shelves still gathering dust'
                : 'Click the podcast bench · Mind the empty shelves'}
          </p>
        </div>
      )}

      {isTouch && stage === 'interior' && typeof window !== 'undefined' &&
        projectedLabels
          .filter(
            (label) =>
              label.visible &&
              label.y > 90 &&
              label.y < window.innerHeight - 175 &&
              label.x > 44 &&
              label.x < window.innerWidth - 44,
          )
          .map((label) => (
            <button
              key={label.id}
              type="button"
              onClick={() => onSelectStation(label.id)}
              className="pointer-events-auto absolute flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-zinc-950/80 px-2.5 py-1 text-[10px] font-medium text-white shadow-md backdrop-blur-md"
              style={{
                left: label.x,
                top: label.y,
                transform: 'translate(-50%, -130%)',
              }}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  label.category === 'shipped'
                    ? 'bg-emerald-400'
                    : 'bg-amber-400'
                }`}
              />
              {label.name}
            </button>
          ))}

      {!isTouch && hoveredLabel && (
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
