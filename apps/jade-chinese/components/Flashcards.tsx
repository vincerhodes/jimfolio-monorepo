"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { lessons, vocabulary, type VocabWord } from "@/lib/data";

type Props = {
  learnedCards: Set<string>;
  onMarkLearned: (zh: string) => void;
};

export default function Flashcards({ learnedCards, onMarkLearned }: Props) {
  const [lessonId, setLessonId] = useState("all");
  const [mode, setMode] = useState<"zh-en" | "en-zh">("zh-en");
  const [cards, setCards] = useState<VocabWord[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const getFiltered = useCallback(() => {
    if (lessonId === "all") return [...vocabulary];
    const lesson = lessons.find((l) => l.id === lessonId);
    return lesson
      ? lesson.words.map((w) => ({ ...w, hsk: lesson.hsk, lesson: lesson.id }))
      : [];
  }, [lessonId]);

  useEffect(() => {
    setCards(getFiltered());
    setIndex(0);
    setFlipped(false);
  }, [getFiltered]);

  const card = cards[index];

  const flip = useCallback(() => setFlipped((f) => !f), []);
  const next = useCallback(() => {
    setIndex((i) => (i + 1) % cards.length);
    setFlipped(false);
  }, [cards.length]);
  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + cards.length) % cards.length);
    setFlipped(false);
  }, [cards.length]);
  const shuffle = useCallback(() => {
    setCards((c) => {
      const copy = [...c];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
    setIndex(0);
    setFlipped(false);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " ") {
        e.preventDefault();
        flip();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, flip]);

  const lessonGroups = useMemo(() => {
    const groups: Record<number, typeof lessons> = {};
    lessons.forEach((l) => {
      if (!groups[l.hsk]) groups[l.hsk] = [];
      groups[l.hsk].push(l);
    });
    return groups;
  }, []);

  if (!card) return null;

  const isZhEn = mode === "zh-en";
  const progress = ((index + 1) / cards.length) * 100;
  const lessonObj = lessons.find((l) => l.id === card.lesson);
  const lessonLabel = lessonObj
    ? `${lessonObj.title} \u00B7 HSK ${card.hsk}`
    : `HSK ${card.hsk}`;

  return (
    <div className="fade-in flex flex-col items-center gap-6">
      <div className="w-full flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <select
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-jade-400 outline-none max-w-[220px]"
          >
            <option value="all">All Lessons</option>
            {Object.keys(lessonGroups)
              .sort()
              .map((hsk) => (
                <optgroup key={hsk} label={`── HSK ${hsk} ──`}>
                  {lessonGroups[Number(hsk)].map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.words.length})
                    </option>
                  ))}
                </optgroup>
              ))}
          </select>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "zh-en" | "en-zh")}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-jade-400 outline-none"
          >
            <option value="zh-en">Chinese → English</option>
            <option value="en-zh">English → Chinese</option>
          </select>
        </div>
        <div className="flex gap-2 text-sm text-slate-500">
          <span>
            Card {index + 1} / {cards.length}
          </span>
          <span>|</span>
          <span>{learnedCards.size} learned</span>
        </div>
      </div>

      <div className="w-full max-w-xl bg-slate-200 rounded-full h-2">
        <div
          className="progress-bar bg-jade-500 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        className="card-flip w-full max-w-xl h-72 cursor-pointer"
        onClick={flip}
      >
        <div
          className={`card-inner relative w-full h-full ${flipped ? "flipped" : ""}`}
        >
          <div className="card-front absolute inset-0 bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center justify-center gap-4 p-8">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
              {isZhEn ? "What does this mean?" : "How do you say this?"}
            </p>
            <p
              className={
                isZhEn
                  ? "hanzi text-7xl font-bold text-jade-800 leading-none"
                  : "text-4xl font-bold text-jade-800"
              }
            >
              {isZhEn ? card.zh : card.en}
            </p>
            <p className="text-slate-400 text-lg"></p>
          </div>
          <div className="card-back absolute inset-0 bg-gradient-to-br from-jade-700 to-jade-800 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-4 p-8 text-white">
            <p className="text-xs font-medium text-jade-200 uppercase tracking-widest">
              Answer
            </p>
            <p
              className={
                isZhEn
                  ? "text-4xl font-bold leading-none"
                  : "hanzi text-5xl font-bold leading-none"
              }
            >
              {isZhEn ? card.en : card.zh}
            </p>
            <p className="text-jade-200 text-xl font-light">{card.py}</p>
            <p className="text-jade-300 text-sm">{lessonLabel}</p>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="flex gap-3">
          <button
            onClick={() => next()}
            className="px-6 py-3 rounded-xl bg-red-100 text-red-600 font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
          >
            ✗ Again
          </button>
          <button
            onClick={() => {
              onMarkLearned(card.zh);
              next();
            }}
            className="px-6 py-3 rounded-xl bg-jade-100 text-jade-700 font-medium hover:bg-jade-200 transition-colors flex items-center gap-2"
          >
            ✓ Got it!
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={prev}
          className="px-5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          ← Prev
        </button>
        <button
          onClick={shuffle}
          className="px-5 py-2 rounded-lg border border-jade-200 text-jade-700 hover:bg-jade-50 transition-colors"
        >
          🔀 Shuffle
        </button>
        <button
          onClick={next}
          className="px-5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Next →
        </button>
      </div>

      <p className="text-slate-400 text-sm">
        Tap the card to flip · Use arrow keys to navigate
      </p>
    </div>
  );
}
