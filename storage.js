/* ==========================================================================
   Quiz App — Storage Module
   Centralized localStorage wrapper for progress, settings, and user data.
   ========================================================================== */

const Storage = (() => {
  const KEY = 'quizapp_state_v1';

  const defaultState = {
    profile: {
      username: 'Player One',
      avatar: '🧑‍🎓',
      level: 1,
      xp: 0,
      coins: 100,
      stars: 0,
      quizzesCompleted: 0,
      perfectScores: 0,
      examsPassed: 0,
      streak: 0,
      lastPlayed: null,
      lastDailyReward: null
    },
    settings: {
      theme: 'dark',
      sound: true,
      animations: true,
      language: 'en'
    },
    favorites: [],
    bookmarks: [],
    badges: [],
    history: [],
    leaderboard: [
      { name: 'Amina Y.', score: 980 },
      { name: 'Mohamud JK', score: 940 },
      { name: 'Yusuf A.', score: 870 },
      { name: 'Khadra M.', score: 800 },
      { name: 'Player One', score: 0 }
    ]
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredCloneSafe(defaultState);
      const parsed = JSON.parse(raw);
      return deepMerge(structuredCloneSafe(defaultState), parsed);
    } catch (e) {
      console.error('[Storage] Failed to load state', e);
      return structuredCloneSafe(defaultState);
    }
  }

  function structuredCloneSafe(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function deepMerge(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  let state = load();

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function get() {
    return state;
  }

  function set(updater) {
    if (typeof updater === 'function') {
      updater(state);
    } else {
      state = deepMerge(state, updater);
    }
    save();
    return state;
  }

  function reset() {
    state = structuredCloneSafe(defaultState);
    save();
    return state;
  }

  return { get, set, reset };
})();
