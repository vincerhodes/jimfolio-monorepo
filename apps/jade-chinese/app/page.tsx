"use client";

import { useState, useEffect, useCallback } from "react";
import { lessons, vocabulary, type VocabWord } from "@/lib/data";
import Header from "@/components/Header";
import NavTabs from "@/components/NavTabs";
import Flashcards from "@/components/Flashcards";
import Quiz from "@/components/Quiz";
import Vocabulary from "@/components/Vocabulary";
import Phrases from "@/components/Phrases";
import Tones from "@/components/Tones";
import Numbers from "@/components/Numbers";

type Tab = "flashcards" | "quiz" | "vocab" | "phrases" | "tones" | "numbers";

export default function Page() {
  const [activeTab, setActiveTab] = useState<Tab>("flashcards");
  const [learnedCards, setLearnedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem("jade_learned");
    if (saved) {
      setLearnedCards(new Set(JSON.parse(saved)));
    }
  }, []);

  const markLearned = useCallback((zh: string) => {
    setLearnedCards((prev) => {
      const next = new Set(prev);
      next.add(zh);
      localStorage.setItem("jade_learned", JSON.stringify([...next]));
      return next;
    });
  }, []);

  return (
    <>
      <Header learnedCount={learnedCards.size} />
      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "flashcards" && (
          <Flashcards learnedCards={learnedCards} onMarkLearned={markLearned} />
        )}
        {activeTab === "quiz" && <Quiz />}
        {activeTab === "vocab" && <Vocabulary learnedCards={learnedCards} />}
        {activeTab === "phrases" && <Phrases />}
        {activeTab === "tones" && <Tones />}
        {activeTab === "numbers" && <Numbers />}
      </main>
      <footer className="mt-16 bg-white border-t border-slate-100 py-6 text-center text-sm text-slate-400">
        <p>JADE Chinese &mdash; Your Mandarin learning companion</p>
        <p className="hanzi text-jade-600 text-lg mt-1">
          加油！(jiā yóu) Keep it up!
        </p>
      </footer>
    </>
  );
}
