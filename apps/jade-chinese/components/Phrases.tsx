"use client";

import { useState, useMemo } from "react";
import { phrases } from "@/lib/data";

export default function Phrases() {
  const [filter, setFilter] = useState("all");

  const categories = useMemo(
    () => [...new Set(phrases.map((p) => p.cat))],
    []
  );

  const filtered = useMemo(
    () =>
      filter === "all" ? phrases : phrases.filter((p) => p.cat === filter),
    [filter]
  );

  return (
    <div className="fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Essential Phrases
      </h2>
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            filter === "all"
              ? "bg-jade-700 text-white"
              : "border border-slate-200 text-slate-600 hover:bg-jade-50"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === cat
                ? "bg-jade-700 text-white"
                : "border border-slate-200 text-slate-600 hover:bg-jade-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((phrase) => (
          <div
            key={phrase.zh}
            className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow"
          >
            <p className="hanzi text-2xl font-bold text-jade-800 mb-1">
              {phrase.zh}
            </p>
            <p className="text-jade-600 text-sm mb-2">{phrase.py}</p>
            <p className="text-slate-600">{phrase.en}</p>
            <span className="inline-block mt-3 text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
              {phrase.cat}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
