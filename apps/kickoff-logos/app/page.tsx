"use client";

import { useState } from "react";
import { faviconSvg, logoSvg, logoWideSvg } from "@/lib/svgs";

const PRESETS = [
  { id: "gold", name: "Gold", color: "#F5A302" },
  { id: "blue", name: "Blue", color: "#1E5AA8" },
  { id: "f1", name: "F1 Red", color: "#E10600" },
  { id: "orange", name: "Orange", color: "#FF6B1A" },
  { id: "white", name: "White", color: "#FFFFFF" },
];

const FLAGS = [
  { id: "england", name: "England", color: "#FFFFFF", stripes: ["#FFFFFF", "#CE1124", "#FFFFFF"] },
  { id: "spain", name: "Spain", color: "#AA151B", stripes: ["#AA151B", "#F1BF00", "#AA151B"] },
  { id: "germany", name: "Germany", color: "#FFCC00", stripes: ["#000000", "#DD0000", "#FFCC00"] },
  { id: "france", name: "France", color: "#0055A4", stripes: ["#0055A4", "#FFFFFF", "#EF4135"] },
  { id: "brazil", name: "Brazil", color: "#009739", stripes: ["#009739", "#FEDD00", "#012169"] },
  { id: "argentina", name: "Argentina", color: "#75AADB", stripes: ["#75AADB", "#FFFFFF", "#75AADB"] },
  { id: "italy", name: "Italy", color: "#008C45", stripes: ["#008C45", "#FFFFFF", "#CD212A"] },
  { id: "netherlands", name: "Netherlands", color: "#FF6600", stripes: ["#AE1C28", "#FFFFFF", "#21468B"] },
  { id: "portugal", name: "Portugal", color: "#046A38", stripes: ["#046A38", "#DA291C", "#FFE900"] },
  { id: "scotland", name: "Scotland", color: "#0065BF", stripes: ["#0065BF", "#FFFFFF", "#0065BF"] },
];

const KITS = [
  { id: "real-madrid", name: "Real Madrid", color: "#FFFFFF", secondary: "#00529F" },
  { id: "barcelona", name: "Barcelona", color: "#A50044", secondary: "#004D98" },
  { id: "man-utd", name: "Man Utd", color: "#DA291C", secondary: "#FBE122" },
  { id: "liverpool", name: "Liverpool", color: "#C8102E", secondary: "#00B2A9" },
  { id: "arsenal", name: "Arsenal", color: "#EF0107", secondary: "#FFFFFF" },
  { id: "chelsea", name: "Chelsea", color: "#034694", secondary: "#FFFFFF" },
  { id: "man-city", name: "Man City", color: "#6CABDD", secondary: "#FFFFFF" },
  { id: "juventus", name: "Juventus", color: "#000000", secondary: "#FFFFFF" },
  { id: "bayern", name: "Bayern", color: "#DC052D", secondary: "#FFFFFF" },
  { id: "celtic", name: "Celtic", color: "#018749", secondary: "#FFFFFF" },
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function stripeBackground(colors: string[]) {
  const pct = 100 / colors.length;
  const stops = colors
    .map((c, i) => `${c} ${(i * pct).toFixed(1)}%, ${c} ${((i + 1) * pct).toFixed(1)}%`)
    .join(", ");
  return `linear-gradient(to right, ${stops})`;
}

export default function Home() {
  const [color, setColor] = useState("#F5A302");
  const [hexInput, setHexInput] = useState("#F5A302");
  const [selected, setSelected] = useState("preset:gold");

  function apply(nextColor: string, id: string) {
    setColor(nextColor);
    setHexInput(nextColor);
    setSelected(id);
  }

  function applyCustom(nextColor: string) {
    setHexInput(nextColor);
    if (HEX_RE.test(nextColor)) {
      setColor(nextColor);
      setSelected("custom");
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.reload();
  }

  const logos = [
    { name: "Favicon", svg: faviconSvg, width: 200 },
    { name: "Logo", svg: logoSvg, width: 450 },
    { name: "Logo wide", svg: logoWideSvg, width: 600 },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-100">
            Kickoff Logo Lab
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Current colour: <span className="font-mono text-neutral-300">{color}</span>
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-neutral-800 px-3 py-1.5 text-sm text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
        >
          Log out
        </button>
      </header>

      <section className="mt-8 space-y-6 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
        <div>
          <h2 className="text-sm font-medium text-neutral-400">Custom colour</h2>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="color"
              value={HEX_RE.test(color) ? color : "#F5A302"}
              onChange={(e) => apply(e.target.value, "custom")}
              className="h-9 w-14 cursor-pointer rounded border border-neutral-800 bg-neutral-900"
            />
            <input
              type="text"
              value={hexInput}
              onChange={(e) => applyCustom(e.target.value)}
              spellCheck={false}
              className={`w-28 rounded-lg border bg-neutral-900 px-3 py-2 font-mono text-sm text-neutral-100 outline-none ${
                HEX_RE.test(hexInput) ? "border-neutral-800" : "border-red-700"
              }`}
            />
            <div className="flex gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  title={p.name}
                  onClick={() => apply(p.color, `preset:${p.id}`)}
                  style={{ backgroundColor: p.color }}
                  className={`h-8 w-8 rounded-full border border-neutral-700 ${
                    selected === `preset:${p.id}`
                      ? "ring-2 ring-white ring-offset-2 ring-offset-neutral-950"
                      : ""
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-neutral-400">Flags</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {FLAGS.map((f) => (
              <button
                key={f.id}
                onClick={() => apply(f.color, `flag:${f.id}`)}
                className={`flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-300 hover:border-neutral-600 ${
                  selected === `flag:${f.id}` ? "ring-2 ring-white" : ""
                }`}
              >
                <span
                  className="h-4 w-7 rounded-sm border border-neutral-700"
                  style={{ background: stripeBackground(f.stripes) }}
                />
                {f.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-neutral-400">Kits</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {KITS.map((k) => (
              <button
                key={k.id}
                onClick={() => apply(k.color, `kit:${k.id}`)}
                className={`flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-300 hover:border-neutral-600 ${
                  selected === `kit:${k.id}` ? "ring-2 ring-white" : ""
                }`}
              >
                <span
                  className="h-4 w-7 rounded-sm border border-neutral-700"
                  style={{ background: stripeBackground([k.color, k.secondary]) }}
                />
                {k.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 space-y-6">
        {logos.map((l) => (
          <div
            key={l.name}
            className="rounded-xl border border-neutral-800 bg-neutral-950 p-6"
          >
            <h2 className="mb-4 text-sm font-medium text-neutral-400">{l.name}</h2>
            <div
              className="logo mx-auto max-w-full"
              style={{ color, width: l.width }}
              dangerouslySetInnerHTML={{ __html: l.svg }}
            />
          </div>
        ))}
      </section>
    </main>
  );
}
