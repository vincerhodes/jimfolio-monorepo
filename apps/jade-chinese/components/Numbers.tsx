"use client";

import { numbers, largeNumbers } from "@/lib/data";

export default function Numbers() {
  return (
    <div className="fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        Numbers &amp; Counting
      </h2>
      <p className="text-slate-500 mb-8">
        Chinese numbers follow a logical pattern. Master 1–10 and you can count
        to 99!
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
        {numbers.map((num) => (
          <div
            key={num.n}
            className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 text-center hover:shadow-md transition-shadow"
          >
            <p className="text-slate-400 text-sm font-medium">{num.n}</p>
            <p className="hanzi text-5xl font-bold text-jade-800 my-2">
              {num.zh}
            </p>
            <p className="text-jade-600 text-sm">{num.py}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-4">
            Tens &amp; Hundreds
          </h3>
          <div className="space-y-3">
            {largeNumbers.map((n) => (
              <div
                key={n.en}
                className="flex items-center gap-4 py-2 border-b border-slate-50"
              >
                <span className="w-16 text-right text-slate-500 text-sm font-medium">
                  {n.en}
                </span>
                <span className="hanzi text-2xl font-bold text-jade-800">
                  {n.zh}
                </span>
                <span className="text-jade-600 text-sm">{n.py}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-4">
            How to Form Numbers
          </h3>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="bg-jade-50 rounded-lg p-3">
              <p className="font-medium text-jade-800">11 → 十一 (shí yī)</p>
              <p className="text-jade-600">ten + one</p>
            </div>
            <div className="bg-jade-50 rounded-lg p-3">
              <p className="font-medium text-jade-800">
                35 → 三十五 (sān shí wǔ)
              </p>
              <p className="text-jade-600">three + ten + five</p>
            </div>
            <div className="bg-jade-50 rounded-lg p-3">
              <p className="font-medium text-jade-800">
                100 → 一百 (yī bǎi)
              </p>
              <p className="text-jade-600">one + hundred</p>
            </div>
            <div className="bg-jade-50 rounded-lg p-3">
              <p className="font-medium text-jade-800">
                2025 → 二零二五 (èr líng èr wǔ)
              </p>
              <p className="text-jade-600">Years are read digit by digit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
