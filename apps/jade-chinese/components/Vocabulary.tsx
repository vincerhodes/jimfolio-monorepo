"use client";

import { useState, useMemo } from "react";
import { lessons, vocabulary } from "@/lib/data";

type Props = {
  learnedCards: Set<string>;
};

export default function Vocabulary({ learnedCards }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const words = useMemo(() => {
    let filtered =
      filter === "all"
        ? vocabulary
        : vocabulary.filter((v) => v.hsk === parseInt(filter));
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.zh.includes(s) ||
          v.py.toLowerCase().includes(s) ||
          v.en.toLowerCase().includes(s)
      );
    }
    return filtered;
  }, [filter, search]);

  const filters = ["all", "1", "2", "3"];

  return (
    <div className="fade-in">
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <h2 className="text-2xl font-bold text-slate-800 mr-2">Vocabulary</h2>
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? "bg-jade-700 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-jade-50"
              }`}
            >
              {f === "all" ? "All" : `HSK ${f}`}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search words..."
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-jade-400 outline-none w-48"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {words.map((word) => {
          const isLearned = learnedCards.has(word.zh);
          const lessonObj = lessons.find((l) => l.id === word.lesson);
          return (
            <div
              key={`${word.zh}-${word.lesson}`}
              className={`bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow ${
                isLearned ? "border-jade-200 bg-jade-50/30" : ""
              }`}
            >
              <div className="hanzi text-4xl font-bold text-jade-800 w-14 text-center flex-shrink-0">
                {word.zh}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">
                  {word.en}
                </p>
                <p className="text-jade-600 text-sm">{word.py}</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {word.cat} · HSK {word.hsk}
                  {lessonObj ? ` · ${lessonObj.title}` : ""}
                </p>
              </div>
              {isLearned && (
                <span className="text-jade-500 text-xs font-medium bg-jade-100 px-2 py-0.5 rounded-full flex-shrink-0">
                  ✓ Learned
                </span>
              )}
            </div>
          );
        })}
        {!words.length && (
          <div className="col-span-3 text-center text-slate-400 py-12">
            No words found.
          </div>
        )}
      </div>
    </div>
  );
}
