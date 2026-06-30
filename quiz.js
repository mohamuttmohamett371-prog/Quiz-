/* ==========================================================================
   Quiz App — Quiz, Exam, Stories, Home, Search & Leaderboard Pages
   ========================================================================== */

const Pages = window.Pages || (window.Pages = {});
let QuizSession = null; // current quiz/exam runtime session

/* ---------------------------------------------------------------------- */
/* HOME                                                                   */
/* ---------------------------------------------------------------------- */
Pages.home = function (root) {
  const profile = Storage.get().profile;
  root.innerHTML = `
    <div class="page">
      <div class="greeting">
        <h1>Hi, ${profile.username} 👋</h1>
        <p>Ready to test your knowledge today?</p>
      </div>

      <div class="stat-row">
        <div class="stat-pill"><div class="val">${profile.coins}</div><div class="lbl">🪙 Coins</div></div>
        <div class="stat-pill"><div class="val">${profile.level}</div><div class="lbl">⭐ Level</div></div>
        <div class="stat-pill"><div class="val">${profile.streak}</div><div class="lbl">🔥 Streak</div></div>
      </div>

      <button class="btn btn-primary" id="daily-reward-btn">🎁 Claim Daily Reward</button>

      <div class="section-title">Explore</div>
      <div class="menu-grid">
        <div class="menu-card" data-route="/quiz"><div class="ico">📝</div><div class="title">Start Quiz</div><div class="sub">Pick a category</div></div>
        <div class="menu-card" data-route="/exams"><div class="ico">⏱️</div><div class="title">Exams</div><div class="sub">Timed challenges</div></div>
        <div class="menu-card" data-route="/stories"><div class="ico">📚</div><div class="title">Stories</div><div class="sub">Learn & enjoy</div></div>
        <div class="menu-card" data-route="/rewards"><div class="ico">🏆</div><div class="title">Rewards</div><div class="sub">Badges & XP</div></div>
        <div class="menu-card" data-route="/profile"><div class="ico">👤</div><div class="title">Profile</div><div class="sub">Your stats</div></div>
        <div class="menu-card" data-route="/leaderboard"><div class="ico">📊</div><div class="title">Leaderboard</div><div class="sub">Top players</div></div>
        <div class="menu-card" data-route="/settings"><div class="ico">⚙️</div><div class="title">Settings</div><div class="sub">Customize app</div></div>
        <div class="menu-card" data-route="/about"><div class="ico">ℹ️</div><div class="title">About</div><div class="sub">App info</div></div>
      </div>
    </div>
  `;
  root.querySelectorAll('.menu-card').forEach((c) => c.addEventListener('click', () => Router.navigate(c.dataset.route)));
  root.querySelector('#daily-reward-btn').addEventListener('click', () => {
    const claimed = App.claimDailyReward();
    if (claimed) { Anim.confetti(30); Anim.toast('🎁 Daily reward claimed!'); Pages.home(root); }
    else Anim.toast('✅ Already claimed today — come back tomorrow!');
  });
};

/* ---------------------------------------------------------------------- */
/* QUIZ SETUP                                                              */
/* ---------------------------------------------------------------------- */
Pages.quizSetup = function (root) {
  const data = App.getData().questions;
  const favorites = Storage.get().favorites;
  let selectedCat = 'all';
  let selectedDiff = 'all';

  function renderQuestionPreview() {
    let pool = data.questions;
    if (selectedCat !== 'all') pool = pool.filter((q) => q.category === selectedCat);
    if (selectedDiff !== 'all') pool = pool.filter((q) => q.difficulty === selectedDiff);
    return pool.length;
  }

  function draw() {
    const count = renderQuestionPreview();
    root.innerHTML = `
      <div class="page">
        <div class="section-title">Choose a Category</div>
        <div class="chip-row" id="cat-chips">
          <button class="chip ${selectedCat === 'all' ? 'active' : ''}" data-val="all">🔀 All</button>
          ${data.categories.map((c) => `<button class="chip ${selectedCat === c.id ? 'active' : ''}" data-val="${c.id}">${c.icon} ${c.name}</button>`).join('')}
        </div>

        <div class="section-title">Difficulty</div>
        <div class="chip-row" id="diff-chips">
          ${['all', 'easy', 'medium', 'hard'].map((d) => `<button class="chip ${selectedDiff === d ? 'active' : ''}" data-val="${d}">${d === 'all' ? '🎯 All' : d.charAt(0).toUpperCase() + d.slice(1)}</button>`).join('')}
        </div>

        <div class="glass-card" style="text-align:center; margin-top:8px;">
          <div style="font-size:36px; font-weight:800;">${count}</div>
          <div style="font-size:12px; opacity:0.6;">questions available</div>
        </div>

        <button class="btn btn-primary" id="start-quiz-btn" style="margin-top:18px;" ${count === 0 ? 'disabled' : ''}>▶️ Start Quiz</button>
        <button class="btn btn-outline" id="random-quiz-btn" style="width:100%; margin-top:10px;">🎲 Random Quiz</button>
        <button class="btn btn-outline" id="fav-quiz-btn" style="width:100%; margin-top:10px;">❤️ Favorites (${favorites.length})</button>
      </div>
    `;

    root.querySelectorAll('#cat-chips .chip').forEach((b) => b.addEventListener('click', () => { selectedCat = b.dataset.val; draw(); }));
    root.querySelectorAll('#diff-chips .chip').forEach((b) => b.addEventListener('click', () => { selectedDiff = b.dataset.val; draw(); }));

    root.querySelector('#start-quiz-btn').addEventListener('click', () => {
      startQuizSession(selectedCat, selectedDiff, false);
    });
    root.querySelector('#random-quiz-btn').addEventListener('click', () => {
      startQuizSession('all', 'all', true);
    });
    root.querySelector('#fav-quiz-btn').addEventListener('click', () => {
      if (favorites.length === 0) { Anim.toast('No favorite questions yet'); return; }
      const pool = data.questions.filter((q) => favorites.includes(q.id));
      QuizSession = { questions: pool, index: 0, answers: [], mode: 'quiz', startTime: Date.now() };
      Router.navigate('/quiz-play');
    });
  };

  draw();
};

function startQuizSession(cat, diff, random) {
  const data = App.getData().questions;
  let pool = data.questions;
  if (cat !== 'all') pool = pool.filter((q) => q.category === cat);
  if (diff !== 'all') pool = pool.filter((q) => q.difficulty === diff);
  if (pool.length === 0) { Anim.toast('No questions found'); return; }
  if (random) pool = [...pool].sort(() => Math.random() - 0.5);
  pool = pool.slice(0, 10);
  QuizSession = { questions: pool, index: 0, answers: [], mode: 'quiz', startTime: Date.now() };
  Router.navigate('/quiz-play');
}

/* ---------------------------------------------------------------------- */
/* QUIZ PLAY (also reused for EXAM PLAY)                                  */
/* ---------------------------------------------------------------------- */
Pages.quizPlay = function (root) { renderQuestionRunner(root, 'quiz'); };
Pages.examPlay = function (root) { renderQuestionRunner(root, 'exam'); };

function renderQuestionRunner(root, mode) {
  if (!QuizSession || QuizSession.questions.length === 0) { Router.navigate(mode === 'exam' ? '/exams' : '/quiz'); return; }
  const q = QuizSession.questions[QuizSession.index];
  const total = QuizSession.questions.length;
  const favorites = Storage.get().favorites;
  let timeLeft = q.time;
  let answered = false;
  let timerInterval = null;

  root.innerHTML = `
    <div class="page">
      <div class="quiz-meta">
        <div class="timer-badge" id="timer-badge">⏳ ${timeLeft}s</div>
        <button class="icon-btn" id="fav-toggle-btn">${favorites.includes(q.id) ? '❤️' : '🤍'}</button>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${(QuizSession.index / total) * 100}%"></div></div>
      <div style="font-size:11px; opacity:0.55; margin-bottom:10px;">Question ${QuizSession.index + 1} of ${total} · ${q.difficulty.toUpperCase()}</div>
      <div class="question-text">${q.question}</div>
      <div class="options-list" id="options-list">
        ${q.options.map((opt, i) => `
          <div class="option-item" data-index="${i}">
            <div class="letter">${'ABCD'[i]}</div>
            <div>${opt}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const badge = root.querySelector('#timer-badge');
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    badge.textContent = `⏳ ${timeLeft}s`;
    if (timeLeft <= 5) badge.classList.add('warn');
    if (timeLeft <= 0) { clearInterval(timerInterval); if (!answered) selectOption(-1); }
  }, 1000);

  root.querySelector('#fav-toggle-btn').addEventListener('click', () => {
    Storage.set((st) => {
      const idx = st.favorites.indexOf(q.id);
      if (idx >= 0) st.favorites.splice(idx, 1); else st.favorites.push(q.id);
    });
    renderQuestionRunner(root, mode);
  });

  root.querySelectorAll('.option-item').forEach((el) => {
    el.addEventListener('click', () => { if (!answered) selectOption(parseInt(el.dataset.index, 10)); });
  });

  function selectOption(index) {
    answered = true;
    clearInterval(timerInterval);
    const isCorrect = index === q.answer;
    QuizSession.answers.push({ questionId: q.id, selected: index, correct: isCorrect });

    root.querySelectorAll('.option-item').forEach((el, i) => {
      if (i === q.answer) el.classList.add('correct');
      if (i === index && index !== q.answer) el.classList.add('wrong');
    });
    if (!isCorrect) Anim.shake(root.querySelector('.options-list'));

    setTimeout(() => {
      if (QuizSession.index < total - 1) {
        QuizSession.index += 1;
        renderQuestionRunner(root, mode);
      } else {
        finishSession(mode);
      }
    }, 1000);
  }
}

function finishSession(mode) {
  const correct = QuizSession.answers.filter((a) => a.correct).length;
  const total = QuizSession.answers.length;
  const pct = Math.round((correct / total) * 100);
  const timeTaken = Math.round((Date.now() - QuizSession.startTime) / 1000);

  Storage.set((st) => {
    st.profile.quizzesCompleted += 1;
    if (pct === 100) st.profile.perfectScores += 1;
    if (mode === 'exam' && pct >= 60) st.profile.examsPassed += 1;
    st.history.push({ date: new Date().toISOString(), correct, total, pct, mode });
    const lb = st.leaderboard.find((p) => p.name === st.profile.username);
    if (lb) lb.score += correct * 10;
  });
  App.addXP(correct * 8);
  App.addCoins(correct * 5);
  App.checkBadges();

  QuizSession.result = { correct, total, pct, timeTaken, mode };
  Router.navigate('/answers');
}

/* ---------------------------------------------------------------------- */
/* ANSWERS / RESULTS                                                      */
/* ---------------------------------------------------------------------- */
Pages.answers = function (root) {
  if (!QuizSession || !QuizSession.result) { Router.navigate('/home'); return; }
  const { correct, total, pct, mode } = QuizSession.result;
  const wrong = total - correct;
  if (pct >= 70) setTimeout(() => Anim.confetti(36), 200);

  root.innerHTML = `
    <div class="page">
      <div class="section-title" style="text-align:center;">${mode === 'exam' ? 'Exam Result' : 'Quiz Complete'}</div>
      <div class="result-circle" style="--pct:${pct}">
        <div class="pct">${pct}%</div>
        <div class="lbl">Score</div>
      </div>
      <div class="result-stats">
        <div class="result-stat correct"><div class="v">${correct}</div><div class="l">Correct</div></div>
        <div class="result-stat wrong"><div class="v">${wrong}</div><div class="l">Wrong</div></div>
        <div class="result-stat"><div class="v">${total}</div><div class="l">Total</div></div>
      </div>
      <button class="btn btn-primary" id="retry-btn">🔁 Retry</button>
      <button class="btn btn-outline" id="share-btn" style="width:100%; margin-top:10px;">📤 Share Score</button>
      <button class="btn btn-outline" id="home-btn" style="width:100%; margin-top:10px;">🏠 Back Home</button>
    </div>
  `;

  root.querySelector('#retry-btn').addEventListener('click', () => {
    Router.navigate(mode === 'exam' ? '/exams' : '/quiz');
  });
  root.querySelector('#share-btn').addEventListener('click', async () => {
    const text = `I scored ${pct}% (${correct}/${total}) on Quiz App! 🎯`;
    if (navigator.share) { try { await navigator.share({ text }); } catch (e) {} }
    else { Anim.toast('Score copied: ' + text); }
  });
  root.querySelector('#home-btn').addEventListener('click', () => Router.navigate('/home'));
};

/* ---------------------------------------------------------------------- */
/* EXAMS                                                                   */
/* ---------------------------------------------------------------------- */
Pages.exams = function (root) {
  const data = App.getData().questions;
  const exams = [
    { id: 'quick', name: 'Quick Exam', count: 5, duration: 90, desc: '5 mixed questions' },
    { id: 'standard', name: 'Standard Exam', count: 10, duration: 240, desc: '10 mixed questions' },
    { id: 'master', name: 'Master Exam', count: 15, duration: 420, desc: '15 hard questions' }
  ];

  root.innerHTML = `
    <div class="page">
      <div class="section-title">Available Exams</div>
      ${exams.map((e) => `
        <div class="exam-card">
          <div class="top"><strong>${e.name}</strong><span class="badge">${Math.floor(e.duration / 60)} min</span></div>
          <div style="font-size:12px; opacity:0.6; margin-bottom:12px;">${e.desc}</div>
          <button class="btn btn-primary btn-sm" data-id="${e.id}">Start Exam</button>
        </div>
      `).join('')}
    </div>
  `;

  root.querySelectorAll('[data-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const exam = exams.find((e) => e.id === btn.dataset.id);
      let pool = exam.id === 'master' ? data.questions.filter((q) => q.difficulty === 'hard') : data.questions;
      pool = [...pool].sort(() => Math.random() - 0.5).slice(0, exam.count);
      if (pool.length === 0) pool = [...data.questions].sort(() => Math.random() - 0.5).slice(0, exam.count);
      QuizSession = { questions: pool, index: 0, answers: [], mode: 'exam', startTime: Date.now(), examDuration: exam.duration, examName: exam.name };
      startExamCountdown(root, exam);
    });
  });
};

function startExamCountdown(root, exam) {
  let n = 3;
  root.innerHTML = `
    <div class="page" style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh;">
      <div style="font-size:14px; opacity:0.6; margin-bottom:8px;">${exam.name} starting in</div>
      <div class="countdown-big" id="countdown-num">${n}</div>
    </div>
  `;
  const numEl = root.querySelector('#countdown-num');
  const interval = setInterval(() => {
    n -= 1;
    if (n <= 0) { clearInterval(interval); Router.navigate('/exam-play'); }
    else numEl.textContent = n;
  }, 800);
}

/* ---------------------------------------------------------------------- */
/* STORIES                                                                 */
/* ---------------------------------------------------------------------- */
Pages.stories = function (root) {
  const data = App.getData().stories;
  const bookmarks = Storage.get().bookmarks;

  root.innerHTML = `
    <div class="page">
      <div class="search-bar">
        <span>🔍</span><input type="text" id="story-search" placeholder="Search stories...">
      </div>
      <div class="section-title">Educational Stories</div>
      <div id="story-list">
        ${data.stories.map((s) => storyCardHtml(s, bookmarks)).join('')}
      </div>
    </div>
  `;

  function attach() {
    root.querySelectorAll('.story-card').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.bookmark-btn')) return;
        Router.navigate(`/story-read?id=${el.dataset.id}`);
      });
    });
    root.querySelectorAll('.bookmark-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        Storage.set((st) => {
          const idx = st.bookmarks.indexOf(id);
          if (idx >= 0) st.bookmarks.splice(idx, 1); else st.bookmarks.push(id);
        });
        Pages.stories(root);
      });
    });
  }
  attach();

  root.querySelector('#story-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = data.stories.filter((s) => s.title.toLowerCase().includes(term) || s.category.toLowerCase().includes(term));
    root.querySelector('#story-list').innerHTML = filtered.length
      ? filtered.map((s) => storyCardHtml(s, Storage.get().bookmarks)).join('')
      : `<div class="empty-state"><div class="ico">📭</div><div>No stories found</div></div>`;
    attach();
  });
};

function storyCardHtml(s, bookmarks) {
  return `
    <div class="story-card" data-id="${s.id}">
      <div class="cover">${s.cover}</div>
      <div class="info">
        <h3>${s.title}</h3>
        <p>${s.category.charAt(0).toUpperCase() + s.category.slice(1)} · ${s.readTime} min read</p>
      </div>
      <button class="icon-btn bookmark-btn" data-id="${s.id}">${bookmarks.includes(s.id) ? '🔖' : '📑'}</button>
    </div>
  `;
}

Pages.storyRead = function (root, params) {
  const data = App.getData().stories;
  const story = data.stories.find((s) => s.id === parseInt(params.id, 10));
  if (!story) { Router.navigate('/stories'); return; }
  root.innerHTML = `
    <div class="page">
      <div style="font-size:46px; text-align:center; margin-bottom:10px;">${story.cover}</div>
      <div class="section-title" style="text-align:center;">${story.title}</div>
      <div style="font-size:11px; opacity:0.55; text-align:center; margin-bottom:18px;">${story.category.toUpperCase()} · ${story.readTime} min read</div>
      <div class="glass-card story-reader">${story.content}</div>
      <button class="btn btn-outline" id="back-stories" style="width:100%; margin-top:18px;">← Back to Stories</button>
    </div>
  `;
  root.querySelector('#back-stories').addEventListener('click', () => Router.navigate('/stories'));
};

/* ---------------------------------------------------------------------- */
/* SEARCH                                                                  */
/* ---------------------------------------------------------------------- */
Pages.search = function (root) {
  const data = App.getData().questions;
  root.innerHTML = `
    <div class="page">
      <div class="search-bar"><span>🔍</span><input type="text" id="global-search" placeholder="Search questions..."></div>
      <div id="search-results"><div class="empty-state"><div class="ico">🔎</div><div>Type to search questions</div></div></div>
    </div>
  `;
  root.querySelector('#global-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    const resultsEl = root.querySelector('#search-results');
    if (!term) { resultsEl.innerHTML = `<div class="empty-state"><div class="ico">🔎</div><div>Type to search questions</div></div>`; return; }
    const results = data.questions.filter((q) => q.question.toLowerCase().includes(term));
    resultsEl.innerHTML = results.length
      ? results.map((q) => `<div class="glass-card" style="margin-bottom:10px;"><strong>${q.question}</strong><div style="font-size:11px; opacity:0.55; margin-top:6px;">${q.category} · ${q.difficulty}</div></div>`).join('')
      : `<div class="empty-state"><div class="ico">📭</div><div>No questions found</div></div>`;
  });
};

/* ---------------------------------------------------------------------- */
/* LEADERBOARD                                                            */
/* ---------------------------------------------------------------------- */
Pages.leaderboard = function (root) {
  const lb = [...Storage.get().leaderboard].sort((a, b) => b.score - a.score);
  root.innerHTML = `
    <div class="page">
      <div class="section-title">🏆 Leaderboard</div>
      ${lb.map((p, i) => `
        <div class="leaderboard-row">
          <div class="rank ${i < 3 ? 'top' : ''}">${i + 1}</div>
          <div class="info"><div class="n">${p.name}</div><div class="s">${p.score} pts</div></div>
        </div>
      `).join('')}
    </div>
  `;
};
