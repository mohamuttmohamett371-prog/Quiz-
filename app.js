/* ==========================================================================
   Quiz App — Main Application Bootstrap
   Loads data, manages theme, splash screen, header, bottom nav and routes.
   ========================================================================== */

const App = (() => {
  const state = Storage.get();

  /* Embedded fallback data — used only if fetching the JSON data files
     fails (e.g. opened directly via file:// without a local server). */
  const FALLBACK_DATA = {
    questions: null,
    stories: null,
    rewards: null
  };

  let DATA = { questions: null, stories: null, rewards: null };

  async function fetchJSON(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('Bad response');
      return await res.json();
    } catch (e) {
      console.warn('[App] Failed to fetch', path, '— using fallback if available.');
      return null;
    }
  }

  async function loadData() {
    const [questions, stories, rewards] = await Promise.all([
      fetchJSON('./data/questions.json'),
      fetchJSON('./data/stories.json'),
      fetchJSON('./data/rewards.json')
    ]);
    DATA.questions = questions || FALLBACK_DATA.questions || { categories: [], questions: [] };
    DATA.stories = stories || FALLBACK_DATA.stories || { stories: [] };
    DATA.rewards = rewards || FALLBACK_DATA.rewards || { badges: [], dailyReward: { coins: 50, xp: 20 }, levelXpRequirement: 100 };
  }

  function getData() { return DATA; }

  /* --------------------------- Theme Handling --------------------------- */
  function applyTheme(theme) {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(theme === 'light' ? 'theme-light' : 'theme-dark');
  }

  function applyPreferences() {
    const s = Storage.get().settings;
    applyTheme(s.theme);
    document.body.classList.toggle('no-animations', !s.animations);
  }

  /* --------------------------- Splash Screen ----------------------------- */
  function hideSplash() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.classList.add('hide');
      setTimeout(() => splash.remove(), 700);
    }
  }

  /* --------------------------- Header / Nav ------------------------------ */
  function wireHeaderActions() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const s = Storage.get().settings;
        const next = s.theme === 'dark' ? 'light' : 'dark';
        Storage.set((st) => { st.settings.theme = next; });
        applyTheme(next);
        Anim.toast(next === 'dark' ? '🌙 Dark mode on' : '☀️ Light mode on');
      });
    }
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => Router.navigate('/search'));
    }
  }

  function wireBottomNav() {
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => Router.navigate(btn.dataset.route));
    });
  }

  /* --------------------------- Reward / Level Helpers --------------------- */
  function xpForNextLevel() {
    return DATA.rewards.levelXpRequirement || 100;
  }

  function addXP(amount) {
    Storage.set((st) => {
      st.profile.xp += amount;
      const req = xpForNextLevel();
      while (st.profile.xp >= req) {
        st.profile.xp -= req;
        st.profile.level += 1;
        st.profile.stars += 1;
        Anim.toast(`🎉 Level Up! You're now level ${st.profile.level}`);
      }
    });
    checkBadges();
  }

  function addCoins(amount) {
    Storage.set((st) => { st.profile.coins += amount; });
  }

  function checkBadges() {
    const profile = Storage.get().profile;
    const earned = Storage.get().badges;
    (DATA.rewards.badges || []).forEach((badge) => {
      if (earned.includes(badge.id)) return;
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function('quizzesCompleted', 'perfectScores', 'streak', 'level', 'examsPassed',
          `return (${badge.condition});`);
        const ok = fn(profile.quizzesCompleted, profile.perfectScores, profile.streak, profile.level, profile.examsPassed);
        if (ok) {
          Storage.set((st) => st.badges.push(badge.id));
          Anim.toast(`🏆 Badge unlocked: ${badge.name}`);
        }
      } catch (e) { /* ignore malformed condition */ }
    });
  }

  function claimDailyReward() {
    const profile = Storage.get().profile;
    const today = new Date().toDateString();
    if (profile.lastDailyReward === today) return false;
    const reward = DATA.rewards.dailyReward || { coins: 50, xp: 20 };
    addCoins(reward.coins);
    addXP(reward.xp);
    Storage.set((st) => {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      st.profile.streak = st.profile.lastDailyReward === yesterday ? st.profile.streak + 1 : 1;
      st.profile.lastDailyReward = today;
    });
    checkBadges();
    return true;
  }

  /* --------------------------- Init --------------------------------------- */
  async function init() {
    applyPreferences();
    wireHeaderActions();
    wireBottomNav();
    await loadData();

    registerRoutes();
    Router.init(document.getElementById('page-container'));

    setTimeout(hideSplash, 2400);
  }

  function registerRoutes() {
    Router.register('/home', Pages.home);
    Router.register('/quiz', Pages.quizSetup);
    Router.register('/quiz-play', Pages.quizPlay);
    Router.register('/answers', Pages.answers);
    Router.register('/exams', Pages.exams);
    Router.register('/exam-play', Pages.examPlay);
    Router.register('/stories', Pages.stories);
    Router.register('/story-read', Pages.storyRead);
    Router.register('/rewards', Pages.rewards);
    Router.register('/profile', Pages.profile);
    Router.register('/settings', Pages.settings);
    Router.register('/about', Pages.about);
    Router.register('/search', Pages.search);
    Router.register('/leaderboard', Pages.leaderboard);
  }

  document.addEventListener('DOMContentLoaded', init);

  return { getData, applyTheme, applyPreferences, addXP, addCoins, checkBadges, claimDailyReward, xpForNextLevel };
})();
