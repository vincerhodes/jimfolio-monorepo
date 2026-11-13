import type { Metadata } from "next";
import { logoWideHqSvg } from "@/lib/svgs";
import { iconSvgs } from "@/lib/icon-svgs";
import {
  strategyPoints,
  sportConcepts,
  uiConcepts,
  notes,
  creditLine,
  hugeIconsSamples,
  type IconConcept,
  type IconOption,
} from "@/lib/icon-options";
import IconsPreview from "./color-toggle";

export const metadata: Metadata = {
  title: "Icon Options — Kickoff Logo Lab",
  description: "SVG icon shortlist for replacing emojis on kickoff-hq.com",
};

function IconGlyph({ id, size }: { id: string; size: number }) {
  const svg = iconSvgs[id];
  if (!svg) {
    return (
      <span
        className="inline-flex items-center justify-center rounded border border-red-900 bg-red-950 text-[9px] text-red-400"
        style={{ width: size, height: size }}
      >
        ?
      </span>
    );
  }
  return (
    <span
      className="icon-slot shrink-0"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function LiveDot({ size }: { size: number }) {
  return (
    <span
      className="live-dot inline-block shrink-0 rounded-full bg-red-500"
      style={{ width: size, height: size }}
    />
  );
}

function OptionPreview({ option }: { option: IconOption }) {
  const sizes = [16, 24];
  return (
    <div
      className={`relative rounded-lg border p-3 ${
        option.recommended
          ? "border-neutral-600 bg-neutral-900"
          : "border-neutral-800 bg-neutral-950"
      }`}
    >
      {option.recommended && (
        <span className="absolute right-2 top-2 rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-900">
          Recommended
        </span>
      )}
      <div className="flex items-end gap-3">
        {sizes.map((size) =>
          option.id === "css-live-dot" ? (
            <LiveDot key={size} size={size} />
          ) : (
            <span key={size} className="flex flex-col items-center gap-1">
              <IconGlyph id={option.id} size={size} />
              {option.extraIds?.map((extraId) => (
                <IconGlyph key={extraId} id={extraId} size={size} />
              ))}
            </span>
          )
        )}
        <span className="pb-0.5 text-[10px] text-neutral-600">16 / 24px</span>
      </div>
      <p className="mt-2 font-mono text-xs text-neutral-300">
        {option.id === "css-live-dot" ? (
          "css: red dot + pulse"
        ) : (
          <>
            {option.id}
            {option.extraIds?.map((extraId) => (
              <span key={extraId}>
                {" "}
                +<br />
                {extraId}
              </span>
            ))}
          </>
        )}
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        {option.set} · {option.style}
      </p>
      <p className="mt-1 text-xs text-neutral-400">{option.why}</p>
    </div>
  );
}

function ConceptCard({ concept, compact }: { concept: IconConcept; compact?: boolean }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex items-start gap-3">
        <div className="flex w-14 shrink-0 flex-col items-center gap-1">
          <span className="text-3xl leading-none">{concept.currentEmoji ?? "●"}</span>
          <span className="text-center text-[10px] text-neutral-600">current</span>
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-neutral-100">{concept.name}</h3>
          <p className="mt-0.5 text-xs text-neutral-500">{concept.usage}</p>
        </div>
      </div>
      <div
        className={`mt-3 grid gap-3 ${
          compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {concept.options.map((option) => (
          <OptionPreview key={option.id} option={option} />
        ))}
      </div>
    </div>
  );
}

export default function IconsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10">
      <header className="flex flex-col items-start gap-6 border-b border-neutral-800 pb-8">
        <div
          className="logo"
          style={{ width: 280, color: "#F5A302" }}
          dangerouslySetInnerHTML={{ __html: logoWideHqSvg }}
        />
        <div>
          <h1 className="text-2xl font-semibold text-neutral-100">
            Icon Options — replacing the emojis
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-400">
            A shortlist of SVG icon candidates for kickoff-hq.com, compiled to
            replace the sport and UI emojis currently scattered across the
            site. Nothing here is decided yet — this page exists so Nordy (and
            anyone else) can compare how each option actually renders at the
            sizes we use. Feedback wanted: picks, rejects, and anything that
            reads wrong at 16px. Toggle the swatches below to preview icons
            in kickoff-hq&apos;s site palette — brand orange is the default,
            matching --primary #F59F0A.
          </p>
        </div>
      </header>

      <IconsPreview>
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-neutral-100">Strategy</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-400">
          {strategyPoints.map((point) => (
            <li key={point.slice(0, 40)}>{point}</li>
          ))}
        </ul>
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <h3 className="text-sm font-semibold text-neutral-200">
            Option B — HugeIcons single family
          </h3>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-4">
            {hugeIconsSamples.map((sample) => (
              <span key={sample.id} className="flex w-14 flex-col items-center gap-1.5">
                <IconGlyph id={sample.id} size={24} />
                <span className="text-center text-[10px] leading-tight text-neutral-500">
                  {sample.label}
                </span>
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            One family, one stroke weight, covers 12+ sports.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-neutral-100">
          1. Sport icons
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Each card shows the current emoji, then every candidate rendered at
          16px and 24px — small-size legibility is the whole point.
        </p>
        <div className="mt-4 space-y-4">
          {sportConcepts.map((concept) => (
            <ConceptCard key={concept.name} concept={concept} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-neutral-100">
          2. UI &amp; symbol icons
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          The site already ships lucide-react 0.446, so every Lucide pick below
          is zero-dependency; MDI/Tabler are listed as alternates.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {uiConcepts.map((concept) => (
            <ConceptCard key={concept.name} concept={concept} compact />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-neutral-100">3. Notes</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-400">
          {notes.map((note) => (
            <li key={note.slice(0, 40)}>{note}</li>
          ))}
        </ul>
      </section>

      <footer className="mt-12 border-t border-neutral-800 pt-6 pb-4">
        <p className="text-xs text-neutral-500">{creditLine}</p>
      </footer>
      </IconsPreview>
    </main>
  );
}
