"use client";

export default function Tones() {
  return (
    <div className="fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        Mandarin Tones
      </h2>
      <p className="text-slate-500 mb-8">
        Mandarin Chinese has 4 tones (+ a neutral tone). The same syllable
        spoken in different tones has completely different meanings.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Tone 1 */}
        <div className="bg-white rounded-2xl shadow-sm border-l-4 border-red-400 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-red-100 text-red-500 font-bold flex items-center justify-center text-sm">
              1
            </span>
            <div>
              <h3 className="font-bold text-slate-800">
                First Tone — Flat &amp; High
              </h3>
              <p className="text-slate-500 text-sm">
                High level, sustained pitch
              </p>
            </div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 mb-3">
            <svg viewBox="0 0 200 60" className="w-full h-12">
              <line
                x1="20"
                y1="15"
                x2="180"
                y2="15"
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-red-50 rounded-lg p-2">
              <p className="hanzi text-2xl text-red-500">妈</p>
              <p className="text-xs text-slate-500">mā (mother)</p>
            </div>
            <div className="bg-red-50 rounded-lg p-2">
              <p className="hanzi text-2xl text-red-500">书</p>
              <p className="text-xs text-slate-500">shū (book)</p>
            </div>
            <div className="bg-red-50 rounded-lg p-2">
              <p className="hanzi text-2xl text-red-500">飞</p>
              <p className="text-xs text-slate-500">fēi (fly)</p>
            </div>
          </div>
        </div>

        {/* Tone 2 */}
        <div className="bg-white rounded-2xl shadow-sm border-l-4 border-amber-400 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-500 font-bold flex items-center justify-center text-sm">
              2
            </span>
            <div>
              <h3 className="font-bold text-slate-800">
                Second Tone — Rising
              </h3>
              <p className="text-slate-500 text-sm">
                Rising, like asking a question
              </p>
            </div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 mb-3">
            <svg viewBox="0 0 200 60" className="w-full h-12">
              <line
                x1="20"
                y1="45"
                x2="180"
                y2="10"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-amber-50 rounded-lg p-2">
              <p className="hanzi text-2xl text-amber-500">麻</p>
              <p className="text-xs text-slate-500">má (hemp)</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-2">
              <p className="hanzi text-2xl text-amber-500">来</p>
              <p className="text-xs text-slate-500">lái (come)</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-2">
              <p className="hanzi text-2xl text-amber-500">人</p>
              <p className="text-xs text-slate-500">rén (person)</p>
            </div>
          </div>
        </div>

        {/* Tone 3 */}
        <div className="bg-white rounded-2xl shadow-sm border-l-4 border-green-400 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-green-100 text-green-500 font-bold flex items-center justify-center text-sm">
              3
            </span>
            <div>
              <h3 className="font-bold text-slate-800">
                Third Tone — Dipping
              </h3>
              <p className="text-slate-500 text-sm">
                Falls then rises (V-shape)
              </p>
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 mb-3">
            <svg viewBox="0 0 200 60" className="w-full h-12">
              <path
                d="M 20 15 Q 100 55 180 15"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-50 rounded-lg p-2">
              <p className="hanzi text-2xl text-green-600">马</p>
              <p className="text-xs text-slate-500">mǎ (horse)</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              <p className="hanzi text-2xl text-green-600">你</p>
              <p className="text-xs text-slate-500">nǐ (you)</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              <p className="hanzi text-2xl text-green-600">好</p>
              <p className="text-xs text-slate-500">hǎo (good)</p>
            </div>
          </div>
        </div>

        {/* Tone 4 */}
        <div className="bg-white rounded-2xl shadow-sm border-l-4 border-blue-400 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 font-bold flex items-center justify-center text-sm">
              4
            </span>
            <div>
              <h3 className="font-bold text-slate-800">
                Fourth Tone — Falling
              </h3>
              <p className="text-slate-500 text-sm">
                Sharp downward, like a command
              </p>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 mb-3">
            <svg viewBox="0 0 200 60" className="w-full h-12">
              <line
                x1="20"
                y1="10"
                x2="180"
                y2="50"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="hanzi text-2xl text-blue-500">骂</p>
              <p className="text-xs text-slate-500">mà (scold)</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="hanzi text-2xl text-blue-500">大</p>
              <p className="text-xs text-slate-500">dà (big)</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="hanzi text-2xl text-blue-500">是</p>
              <p className="text-xs text-slate-500">shì (is)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Neutral Tone */}
      <div className="bg-white rounded-2xl shadow-sm border-l-4 border-purple-400 p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-500 font-bold flex items-center justify-center text-sm">
            0
          </span>
          <div>
            <h3 className="font-bold text-slate-800">
              Neutral Tone — Light &amp; Short
            </h3>
            <p className="text-slate-500 text-sm">
              Brief, unstressed syllable. No tone mark written.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center max-w-xs">
          <div className="bg-purple-50 rounded-lg p-2">
            <p className="hanzi text-2xl text-purple-500">吗</p>
            <p className="text-xs text-slate-500">ma (question)</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-2">
            <p className="hanzi text-2xl text-purple-500">的</p>
            <p className="text-xs text-slate-500">de (particle)</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-2">
            <p className="hanzi text-2xl text-purple-500">呢</p>
            <p className="text-xs text-slate-500">ne (and you?)</p>
          </div>
        </div>
      </div>

      {/* Ma example */}
      <div className="bg-gradient-to-br from-jade-800 to-jade-700 text-white rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-4 text-jade-100">
          The Classic Example: &ldquo;ma&rdquo; in all 4 tones
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="hanzi text-4xl font-bold text-red-300">妈</p>
            <p className="text-jade-200 mt-1">mā</p>
            <p className="text-jade-100 font-medium">mother</p>
            <p className="text-jade-300 text-xs mt-1">1st tone</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="hanzi text-4xl font-bold text-amber-300">麻</p>
            <p className="text-jade-200 mt-1">má</p>
            <p className="text-jade-100 font-medium">hemp / numb</p>
            <p className="text-jade-300 text-xs mt-1">2nd tone</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="hanzi text-4xl font-bold text-green-300">马</p>
            <p className="text-jade-200 mt-1">mǎ</p>
            <p className="text-jade-100 font-medium">horse</p>
            <p className="text-jade-300 text-xs mt-1">3rd tone</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="hanzi text-4xl font-bold text-blue-300">骂</p>
            <p className="text-jade-200 mt-1">mà</p>
            <p className="text-jade-100 font-medium">to scold</p>
            <p className="text-jade-300 text-xs mt-1">4th tone</p>
          </div>
        </div>
      </div>
    </div>
  );
}
