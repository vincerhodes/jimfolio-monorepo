"use client";

type Props = {
  learnedCount: number;
};

export default function Header({ learnedCount }: Props) {
  return (
    <header className="bg-gradient-to-r from-jade-800 to-jade-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold text-gold-400 hanzi select-none">
            玉
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">JADE Chinese</h1>
            <p className="text-jade-200 text-xs">Learn Mandarin the smart way</p>
          </div>
        </div>
        <div className="flex gap-4 text-sm text-jade-100">
          <span>
            Learned: <strong className="text-gold-400">{learnedCount}</strong>
          </span>
        </div>
      </div>
    </header>
  );
}
