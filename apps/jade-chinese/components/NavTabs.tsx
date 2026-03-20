"use client";

type Tab = "flashcards" | "quiz" | "vocab" | "phrases" | "tones" | "numbers";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "flashcards", label: "Flashcards", icon: "\uD83C\uDCCF" },
  { id: "quiz", label: "Quiz", icon: "\uD83E\uDDE0" },
  { id: "vocab", label: "Vocabulary", icon: "\uD83D\uDCD6" },
  { id: "phrases", label: "Phrases", icon: "\uD83D\uDCAC" },
  { id: "tones", label: "Tones", icon: "\uD83C\uDFB5" },
  { id: "numbers", label: "Numbers", icon: "\uD83D\uDD22" },
];

type Props = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export default function NavTabs({ activeTab, onTabChange }: Props) {
  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-[68px] z-40">
      <div className="max-w-6xl mx-auto px-4 flex gap-1 py-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "tab-active"
                : "text-slate-600 hover:bg-jade-50"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
