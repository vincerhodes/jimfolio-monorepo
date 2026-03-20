"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { lessons, vocabulary, type VocabWord } from "@/lib/data";

type QuizMode = "zh-en" | "en-zh" | "pinyin";

export default function Quiz() {
  const [lessonId, setLessonId] = useState("all");
  const [quizType, setQuizType] = useState<QuizMode>("zh-en");
  const [questions, setQuestions] = useState<VocabWord[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [phase, setPhase] = useState<"setup" | "playing" | "results">("setup");
  const [options, setOptions] = useState<string[]>([]);

  const lessonGroups = useMemo(() => {
    const groups: Record<number, typeof lessons> = {};
    lessons.forEach((l) => {
      if (!groups[l.hsk]) groups[l.hsk] = [];
      groups[l.hsk].push(l);
    });
    return groups;
  }, []);

  const getPool = useCallback((): VocabWord[] => {
    if (lessonId === "all") return [...vocabulary];
    const lesson = lessons.find((l) => l.id === lessonId);
    return lesson
      ? lesson.words.map((w) => ({ ...w, hsk: lesson.hsk, lesson: lesson.id }))
      : [];
  }, [lessonId]);

  const buildQuestion = useCallback(
    (q: VocabWord, pool: VocabWord[], type: QuizMode) => {
      const optionKey = type === "zh-en" ? "en" : "zh";
      const correct = q[optionKey];
      const wrongs = pool
        .filter((w) => w.zh !== q.zh)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => w[optionKey]);
      const opts = [...wrongs, correct].sort(() => Math.random() - 0.5);
      setOptions(opts);
      setCorrectAnswer(correct);
    },
    []
  );

  const startQuiz = useCallback(() => {
    const pool = getPool();
    if (pool.length < 4) {
      alert("Not enough words in this level for a quiz!");
      return;
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const qs = shuffled.slice(0, Math.min(10, shuffled.length));
    setQuestions(qs);
    setQIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setPhase("playing");
    buildQuestion(qs[0], pool, quizType);
  }, [getPool, quizType, buildQuestion]);

  const checkAnswer = useCallback(
    (selected: string) => {
      if (answered) return;
      setAnswered(true);
      setSelectedAnswer(selected);
      if (selected === correctAnswer) {
        setScore((s) => s + 1);
      }
    },
    [answered, correctAnswer]
  );

  const nextQuestion = useCallback(() => {
    const nextIdx = qIndex + 1;
    if (nextIdx >= questions.length) {
      setPhase("results");
    } else {
      setQIndex(nextIdx);
      setAnswered(false);
      setSelectedAnswer(null);
      buildQuestion(questions[nextIdx], getPool(), quizType);
    }
  }, [qIndex, questions, buildQuestion, getPool, quizType]);

  const q = questions[qIndex];
  const pct = questions.length
    ? Math.round((score / questions.length) * 100)
    : 0;

  let resultEmoji = "\uD83D\uDCDA";
  let resultTitle = "Keep studying!";
  let resultMsg = "Review the flashcards and try again.";
  if (pct === 100) {
    resultEmoji = "\uD83C\uDFC6";
    resultTitle = "Perfect Score!";
    resultMsg = "Outstanding! You mastered this set!";
  } else if (pct >= 80) {
    resultEmoji = "\uD83C\uDF89";
    resultTitle = "Great job!";
    resultMsg = "You're doing really well. Keep it up!";
  } else if (pct >= 60) {
    resultEmoji = "\uD83D\uDC4D";
    resultTitle = "Good effort!";
    resultMsg = "Practice makes perfect. Try again!";
  }

  return (
    <div className="fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quick Quiz</h2>
          <p className="text-slate-500 text-sm mt-1">
            Test your Mandarin knowledge
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Score</p>
          <p className="text-3xl font-bold text-jade-700">
            {score} / {questions.length || 0}
          </p>
        </div>
      </div>

      {phase === "setup" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h3 className="font-semibold text-slate-700 mb-4">Quiz Settings</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-slate-500 mb-1 block">
                Lesson
              </label>
              <select
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-jade-400 outline-none"
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
            </div>
            <div>
              <label className="text-sm text-slate-500 mb-1 block">
                Question Type
              </label>
              <select
                value={quizType}
                onChange={(e) => setQuizType(e.target.value as QuizMode)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-jade-400 outline-none"
              >
                <option value="zh-en">Chinese → English</option>
                <option value="en-zh">English → Chinese</option>
                <option value="pinyin">Pinyin → Chinese</option>
              </select>
            </div>
          </div>
          <button
            onClick={startQuiz}
            className="w-full py-3 bg-jade-700 text-white rounded-xl font-medium hover:bg-jade-600 transition-colors"
          >
            Start Quiz →
          </button>
        </div>
      )}

      {phase === "playing" && q && (
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-4 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">
              {quizType === "zh-en"
                ? "What does this mean in English?"
                : quizType === "en-zh"
                  ? "How do you write this in Chinese?"
                  : "Which character matches this pinyin?"}
            </p>
            <p
              className={
                quizType === "zh-en"
                  ? "hanzi text-6xl font-bold text-jade-800 mb-3 leading-none"
                  : quizType === "en-zh"
                    ? "text-3xl font-bold text-jade-800 mb-3"
                    : "text-4xl font-bold text-jade-800 mb-3"
              }
            >
              {quizType === "zh-en"
                ? q.zh
                : quizType === "en-zh"
                  ? q.en
                  : q.py}
            </p>
            {quizType === "zh-en" && (
              <p className="text-slate-400 text-lg">{q.py}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {options.map((opt) => {
              let extraClass = "";
              if (answered) {
                if (opt === correctAnswer) {
                  extraClass = "border-jade-500 bg-jade-50 text-jade-700";
                } else if (opt === selectedAnswer && opt !== correctAnswer) {
                  extraClass = "shake border-red-400 bg-red-50 text-red-600";
                }
                if (opt === selectedAnswer && opt === correctAnswer) {
                  extraClass += " pulse-correct";
                }
              }
              const isHanzi = quizType !== "zh-en";
              return (
                <button
                  key={opt}
                  onClick={() => checkAnswer(opt)}
                  disabled={answered}
                  className={`p-4 rounded-xl border-2 border-slate-200 text-center hover:border-jade-400 hover:bg-jade-50 transition-all font-medium ${isHanzi ? "hanzi text-3xl" : "text-base"} ${extraClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {answered && (
            <div
              className={`rounded-2xl p-4 border mb-4 text-center ${
                selectedAnswer === correctAnswer
                  ? "border-jade-300 bg-jade-50"
                  : "border-red-300 bg-red-50"
              }`}
            >
              <p
                className={`font-semibold text-lg ${
                  selectedAnswer === correctAnswer
                    ? "text-jade-700"
                    : "text-red-600"
                }`}
              >
                {selectedAnswer === correctAnswer
                  ? "✓ Correct!"
                  : "✗ Not quite!"}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                {selectedAnswer === correctAnswer
                  ? `${q.zh} (${q.py}) = ${q.en}`
                  : `The answer was: ${q.zh} (${q.py}) = ${q.en}`}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">
              Q {qIndex + 1} of {questions.length}
            </span>
            {answered && (
              <button
                onClick={nextQuestion}
                className="px-6 py-2 bg-jade-700 text-white rounded-lg hover:bg-jade-600 transition-colors"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      )}

      {phase === "results" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
          <div className="text-6xl mb-4">{resultEmoji}</div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">
            {resultTitle}
          </h3>
          <p className="text-slate-500 mb-2">
            {score} / {questions.length} correct ({pct}%)
          </p>
          <p className="text-jade-600 font-medium mb-6">{resultMsg}</p>
          <button
            onClick={() => setPhase("setup")}
            className="px-8 py-3 bg-jade-700 text-white rounded-xl font-medium hover:bg-jade-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
