// ===================== STATE =====================

let flashcards = [];
let fcIndex = 0;
let fcFlipped = false;
let learnedCards = new Set(JSON.parse(localStorage.getItem('jade_learned') || '[]'));

let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

let vocabFilter = 'all';
let phraseFilter = 'all';

// ===================== INIT =====================

function init() {
  populateLessonSelects();
  initFlashcards();
  renderVocab();
  renderPhrases();
  renderNumbers();
  updateStats();
  document.addEventListener('keydown', handleKeys);
}

// ===================== LESSON SELECTS =====================

function populateLessonSelects() {
  const selIds = ['fc-lesson', 'quiz-lesson'];
  const groups = {};
  lessons.forEach(l => {
    if (!groups[l.hsk]) groups[l.hsk] = [];
    groups[l.hsk].push(l);
  });

  selIds.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '';
    const allOpt = document.createElement('option');
    allOpt.value = 'all';
    allOpt.textContent = 'All Lessons';
    sel.appendChild(allOpt);
    Object.keys(groups).sort().forEach(hsk => {
      const grp = document.createElement('optgroup');
      grp.label = '── HSK ' + hsk + ' ──';
      groups[hsk].forEach(lesson => {
        const opt = document.createElement('option');
        opt.value = lesson.id;
        opt.textContent = lesson.title + ' (' + lesson.words.length + ')';
        grp.appendChild(opt);
      });
      sel.appendChild(grp);
    });
  });
}

// ===================== TABS =====================

function showTab(name) {
  document.querySelectorAll('.tab-section').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('tab-active');
    b.classList.add('text-slate-600', 'hover:bg-jade-50');
  });
  document.getElementById('section-' + name).classList.remove('hidden');
  const btn = document.getElementById('tab-' + name);
  btn.classList.add('tab-active');
  btn.classList.remove('text-slate-600', 'hover:bg-jade-50');
}

// ===================== FLASHCARDS =====================

function getFilteredVocab() {
  const lessonId = document.getElementById('fc-lesson').value;
  if (lessonId === 'all') return [...vocabulary];
  const lesson = lessons.find(l => l.id === lessonId);
  return lesson ? lesson.words.map(w => ({ ...w, hsk: lesson.hsk, lesson: lesson.id })) : [];
}

function initFlashcards() {
  flashcards = [...getFilteredVocab()];
  fcIndex = 0;
  fcFlipped = false;
  renderCard();
}

function renderCard() {
  if (!flashcards.length) return;
  const card = flashcards[fcIndex];
  const mode = document.getElementById('fc-mode').value;

  document.getElementById('card-inner').classList.remove('flipped');
  fcFlipped = false;
  document.getElementById('fc-action-btns').classList.add('hidden');

  const isZhEn = mode === 'zh-en';
  document.getElementById('fc-front-label').textContent = isZhEn ? 'What does this mean?' : 'How do you say this?';
  document.getElementById('fc-front-main').textContent = isZhEn ? card.zh : card.en;
  document.getElementById('fc-front-main').className = isZhEn
    ? 'hanzi text-7xl font-bold text-jade-800 leading-none'
    : 'text-4xl font-bold text-jade-800';
  document.getElementById('fc-front-sub').textContent = '';

  document.getElementById('fc-back-main').textContent = isZhEn ? card.en : card.zh;
  document.getElementById('fc-back-main').className = isZhEn
    ? 'text-4xl font-bold leading-none'
    : 'hanzi text-5xl font-bold leading-none';
  document.getElementById('fc-back-pinyin').textContent = card.py;
  const lesson = lessons.find(l => l.id === card.lesson);
  const lessonLabel = lesson ? lesson.title + ' · HSK ' + card.hsk : 'HSK ' + card.hsk;
  document.getElementById('fc-back-category').textContent = lessonLabel;

  const progress = ((fcIndex + 1) / flashcards.length) * 100;
  document.getElementById('fc-progress').style.width = progress + '%';
  document.getElementById('fc-counter').textContent = `Card ${fcIndex + 1} / ${flashcards.length}`;
  document.getElementById('fc-learned-count').textContent = `${learnedCards.size} learned`;
}

function flipCard() {
  const inner = document.getElementById('card-inner');
  fcFlipped = !fcFlipped;
  inner.classList.toggle('flipped', fcFlipped);
  if (fcFlipped) {
    document.getElementById('fc-action-btns').classList.remove('hidden');
  }
}

function nextCard() {
  fcIndex = (fcIndex + 1) % flashcards.length;
  renderCard();
}

function prevCard() {
  fcIndex = (fcIndex - 1 + flashcards.length) % flashcards.length;
  renderCard();
}

function shuffleCards() {
  for (let i = flashcards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flashcards[i], flashcards[j]] = [flashcards[j], flashcards[i]];
  }
  fcIndex = 0;
  renderCard();
}

function markCard(known) {
  const card = flashcards[fcIndex];
  if (known) {
    learnedCards.add(card.zh);
    localStorage.setItem('jade_learned', JSON.stringify([...learnedCards]));
    updateStats();
  }
  nextCard();
}

function handleKeys(e) {
  const active = document.querySelector('.tab-section:not(.hidden)').id;
  if (active === 'section-flashcards') {
    if (e.key === 'ArrowRight') nextCard();
    if (e.key === 'ArrowLeft') prevCard();
    if (e.key === ' ') { e.preventDefault(); flipCard(); }
  }
}

function updateStats() {
  document.getElementById('stat-learned').textContent = learnedCards.size;
  const streak = parseInt(localStorage.getItem('jade_streak') || '0');
  document.getElementById('stat-streak').textContent = streak;
}

// ===================== QUIZ =====================

function getQuizPool() {
  const lessonId = document.getElementById('quiz-lesson').value;
  if (lessonId === 'all') return [...vocabulary];
  const lesson = lessons.find(l => l.id === lessonId);
  return lesson ? lesson.words.map(w => ({ ...w, hsk: lesson.hsk, lesson: lesson.id })) : [];
}

function startQuiz() {
  const pool = getQuizPool();
  if (pool.length < 4) { alert('Not enough words in this level for a quiz!'); return; }

  quizScore = 0;
  quizIndex = 0;
  quizAnswered = false;

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  quizQuestions = shuffled.slice(0, Math.min(10, shuffled.length));

  document.getElementById('quiz-setup').classList.add('hidden');
  document.getElementById('quiz-results').classList.add('hidden');
  document.getElementById('quiz-question-area').classList.remove('hidden');

  document.getElementById('quiz-score').textContent = 0;
  document.getElementById('quiz-total').textContent = quizQuestions.length;
  document.getElementById('quiz-qcount').textContent = quizQuestions.length;

  renderQuestion();
}

function renderQuestion() {
  const q = quizQuestions[quizIndex];
  const type = document.getElementById('quiz-type').value;
  const pool = getQuizPool();
  quizAnswered = false;

  document.getElementById('quiz-feedback').classList.add('hidden');
  document.getElementById('quiz-next-btn').classList.add('hidden');
  document.getElementById('quiz-qnum').textContent = quizIndex + 1;

  let questionText, questionSub, label, correctAnswer, optionKey;
  if (type === 'zh-en') {
    label = 'What does this mean in English?';
    questionText = q.zh;
    questionSub = q.py;
    correctAnswer = q.en;
    optionKey = 'en';
  } else if (type === 'en-zh') {
    label = 'How do you write this in Chinese?';
    questionText = q.en;
    questionSub = '';
    correctAnswer = q.zh;
    optionKey = 'zh';
  } else {
    label = 'Which character matches this pinyin?';
    questionText = q.py;
    questionSub = '';
    correctAnswer = q.zh;
    optionKey = 'zh';
  }

  document.getElementById('quiz-q-label').textContent = label;
  const qEl = document.getElementById('quiz-question');
  qEl.textContent = questionText;
  qEl.className = type === 'zh-en'
    ? 'hanzi text-6xl font-bold text-jade-800 mb-3 leading-none'
    : (type === 'en-zh' ? 'text-3xl font-bold text-jade-800 mb-3' : 'text-4xl font-bold text-jade-800 mb-3');
  document.getElementById('quiz-question-sub').textContent = questionSub;

  const wrongPool = pool.filter(w => w.zh !== q.zh);
  const wrongs = wrongPool.sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [...wrongs.map(w => w[optionKey]), correctAnswer].sort(() => Math.random() - 0.5);

  const optContainer = document.getElementById('quiz-options');
  optContainer.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = `p-4 rounded-xl border-2 border-slate-200 text-center hover:border-jade-400 hover:bg-jade-50 transition-all font-medium ${optionKey === 'zh' ? 'hanzi text-3xl' : 'text-base'}`;
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(opt, correctAnswer, q, btn);
    optContainer.appendChild(btn);
  });
}

function checkAnswer(selected, correct, q, btn) {
  if (quizAnswered) return;
  quizAnswered = true;

  const isCorrect = selected === correct;
  const allBtns = document.querySelectorAll('#quiz-options button');

  allBtns.forEach(b => {
    b.disabled = true;
    if (b.textContent === correct) {
      b.classList.add('border-jade-500', 'bg-jade-50', 'text-jade-700');
    }
  });

  if (isCorrect) {
    btn.classList.add('pulse-correct', 'border-jade-500', 'bg-jade-100');
    quizScore++;
    document.getElementById('quiz-score').textContent = quizScore;
  } else {
    btn.classList.add('shake', 'border-red-400', 'bg-red-50', 'text-red-600');
  }

  const fb = document.getElementById('quiz-feedback');
  const fbText = document.getElementById('quiz-feedback-text');
  const fbDetail = document.getElementById('quiz-feedback-detail');

  fb.classList.remove('hidden', 'border-jade-300', 'border-red-300', 'bg-jade-50', 'bg-red-50');
  if (isCorrect) {
    fb.classList.add('border-jade-300', 'bg-jade-50');
    fbText.className = 'font-semibold text-lg text-jade-700';
    fbText.textContent = '✓ Correct!';
    fbDetail.textContent = `${q.zh} (${q.py}) = ${q.en}`;
  } else {
    fb.classList.add('border-red-300', 'bg-red-50');
    fbText.className = 'font-semibold text-lg text-red-600';
    fbText.textContent = '✗ Not quite!';
    fbDetail.textContent = `The answer was: ${q.zh} (${q.py}) = ${q.en}`;
  }

  document.getElementById('quiz-next-btn').classList.remove('hidden');
}

function nextQuestion() {
  quizIndex++;
  if (quizIndex >= quizQuestions.length) {
    showQuizResults();
  } else {
    renderQuestion();
  }
}

function showQuizResults() {
  document.getElementById('quiz-question-area').classList.add('hidden');
  document.getElementById('quiz-results').classList.remove('hidden');

  const pct = Math.round((quizScore / quizQuestions.length) * 100);
  let emoji, title, msg;
  if (pct === 100)      { emoji = '🏆'; title = 'Perfect Score!';  msg = 'Outstanding! You mastered this set!'; }
  else if (pct >= 80)   { emoji = '🎉'; title = 'Great job!';       msg = "You're doing really well. Keep it up!"; }
  else if (pct >= 60)   { emoji = '👍'; title = 'Good effort!';     msg = 'Practice makes perfect. Try again!'; }
  else                  { emoji = '📚'; title = 'Keep studying!';   msg = 'Review the flashcards and try again.'; }

  document.getElementById('quiz-result-emoji').textContent = emoji;
  document.getElementById('quiz-result-title').textContent = title;
  document.getElementById('quiz-result-score').textContent = `${quizScore} / ${quizQuestions.length} correct (${pct}%)`;
  document.getElementById('quiz-result-msg').textContent = msg;
}

function restartQuiz() {
  document.getElementById('quiz-results').classList.add('hidden');
  document.getElementById('quiz-setup').classList.remove('hidden');
}

// ===================== VOCABULARY =====================

function filterVocab(level) {
  vocabFilter = level;
  document.querySelectorAll('.vocab-filter').forEach(b => {
    b.className = 'vocab-filter px-4 py-1.5 rounded-full text-sm font-medium border border-slate-200 text-slate-600 hover:bg-jade-50 transition-all';
  });
  document.getElementById('vf-' + level).className = 'vocab-filter px-4 py-1.5 rounded-full text-sm font-medium bg-jade-700 text-white transition-all';
  renderVocab();
}

function searchVocab() {
  renderVocab();
}

function renderVocab() {
  const search = document.getElementById('vocab-search').value.toLowerCase();
  let words = vocabFilter === 'all' ? vocabulary : vocabulary.filter(v => v.hsk === parseInt(vocabFilter));
  if (search) {
    words = words.filter(v =>
      v.zh.includes(search) || v.py.toLowerCase().includes(search) || v.en.toLowerCase().includes(search)
    );
  }

  const grid = document.getElementById('vocab-grid');
  grid.innerHTML = '';

  words.forEach(word => {
    const isLearned = learnedCards.has(word.zh);
    const card = document.createElement('div');
    card.className = `bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow ${isLearned ? 'border-jade-200 bg-jade-50/30' : ''}`;
    card.innerHTML = `
      <div class="hanzi text-4xl font-bold text-jade-800 w-14 text-center flex-shrink-0">${word.zh}</div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-slate-800 truncate">${word.en}</p>
        <p class="text-jade-600 text-sm">${word.py}</p>
        <p class="text-slate-400 text-xs mt-0.5">${word.cat} · HSK ${word.hsk}${word.lesson ? ' · ' + (lessons.find(l => l.id === word.lesson) || {}).title : ''}</p>
      </div>
      ${isLearned ? '<span class="text-jade-500 text-xs font-medium bg-jade-100 px-2 py-0.5 rounded-full flex-shrink-0">✓ Learned</span>' : ''}
    `;
    grid.appendChild(card);
  });

  if (!words.length) {
    grid.innerHTML = '<div class="col-span-3 text-center text-slate-400 py-12">No words found.</div>';
  }
}

// ===================== PHRASES =====================

function renderPhrases() {
  const cats = [...new Set(phrases.map(p => p.cat))];
  const filterDiv = document.getElementById('phrase-filters');
  filterDiv.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.id = 'pf-all';
  allBtn.className = 'phrase-filter px-4 py-1.5 rounded-full text-sm font-medium bg-jade-700 text-white transition-all';
  allBtn.textContent = 'All';
  allBtn.onclick = () => filterPhrases('all');
  filterDiv.appendChild(allBtn);

  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.id = 'pf-' + cat;
    btn.className = 'phrase-filter px-4 py-1.5 rounded-full text-sm font-medium border border-slate-200 text-slate-600 hover:bg-jade-50 transition-all';
    btn.textContent = cat;
    btn.onclick = () => filterPhrases(cat);
    filterDiv.appendChild(btn);
  });

  renderPhraseList();
}

function filterPhrases(cat) {
  phraseFilter = cat;
  document.querySelectorAll('.phrase-filter').forEach(b => {
    b.className = 'phrase-filter px-4 py-1.5 rounded-full text-sm font-medium border border-slate-200 text-slate-600 hover:bg-jade-50 transition-all';
  });
  const activeEl = document.getElementById('pf-' + cat);
  if (activeEl) activeEl.className = 'phrase-filter px-4 py-1.5 rounded-full text-sm font-medium bg-jade-700 text-white transition-all';
  renderPhraseList();
}

function renderPhraseList() {
  const list = phraseFilter === 'all' ? phrases : phrases.filter(p => p.cat === phraseFilter);
  const div = document.getElementById('phrase-list');
  div.innerHTML = '';
  list.forEach(phrase => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow';
    card.innerHTML = `
      <p class="hanzi text-2xl font-bold text-jade-800 mb-1">${phrase.zh}</p>
      <p class="text-jade-600 text-sm mb-2">${phrase.py}</p>
      <p class="text-slate-600">${phrase.en}</p>
      <span class="inline-block mt-3 text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">${phrase.cat}</span>
    `;
    div.appendChild(card);
  });
}

// ===================== NUMBERS =====================

function renderNumbers() {
  const grid = document.getElementById('numbers-grid');
  numbers.forEach(num => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-sm border border-slate-100 p-4 text-center hover:shadow-md transition-shadow';
    card.innerHTML = `
      <p class="text-slate-400 text-sm font-medium">${num.n}</p>
      <p class="hanzi text-5xl font-bold text-jade-800 my-2">${num.zh}</p>
      <p class="text-jade-600 text-sm">${num.py}</p>
    `;
    grid.appendChild(card);
  });

  const lnDiv = document.getElementById('large-numbers');
  largeNumbers.forEach(n => {
    const row = document.createElement('div');
    row.className = 'flex items-center gap-4 py-2 border-b border-slate-50';
    row.innerHTML = `
      <span class="w-16 text-right text-slate-500 text-sm font-medium">${n.en}</span>
      <span class="hanzi text-2xl font-bold text-jade-800">${n.zh}</span>
      <span class="text-jade-600 text-sm">${n.py}</span>
    `;
    lnDiv.appendChild(row);
  });
}

// ===================== START =====================
window.addEventListener('DOMContentLoaded', init);
