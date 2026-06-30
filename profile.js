/* ==========================================================================
   Quiz App — Profile Page
   ========================================================================== */

(function () {
  const Pages = window.Pages || (window.Pages = {});

  const AVATARS = ['🧑‍🎓', '👩‍🎓', '🧑‍💻', '👨‍🔬', '👩‍🔬', '🧑‍🚀', '🦸', '🦸‍♀️'];

  Pages.profile = function (root) {
    const profile = Storage.get().profile;
    const badges = Storage.get().badges;
    const allBadges = App.getData().rewards.badges || [];
    const history = Storage.get().history;
    const avgScore = history.length ? Math.round(history.reduce((a, h) => a + h.pct, 0) / history.length) : 0;

    root.innerHTML = `
      <div class="page">
        <div class="profile-header">
          <div class="avatar-ring" id="avatar-display">${profile.avatar}</div>
          <h2 id="username-display">${profile.username}</h2>
          <div class="lvl-tag">Level ${profile.level} · ${profile.coins} coins</div>
        </div>

        <div class="stats-grid">
          <div class="item"><div class="v">${profile.quizzesCompleted}</div><div class="l">Quizzes Completed</div></div>
          <div class="item"><div class="v">${profile.examsPassed}</div><div class="l">Exams Passed</div></div>
          <div class="item"><div class="v">${profile.perfectScores}</div><div class="l">Perfect Scores</div></div>
          <div class="item"><div class="v">${avgScore}%</div><div class="l">Average Score</div></div>
        </div>

        <div class="section-title">Choose Avatar</div>
        <div class="chip-row" id="avatar-row">
          ${AVATARS.map((a) => `<button class="chip ${a === profile.avatar ? 'active' : ''}" data-val="${a}" style="font-size:18px;">${a}</button>`).join('')}
        </div>

        <div class="section-title">Edit Username</div>
        <div class="search-bar">
          <input type="text" id="username-input" value="${profile.username}" placeholder="Your name">
          <button class="icon-btn" id="save-username-btn">💾</button>
        </div>

        <div class="section-title">Achievements</div>
        <div class="badge-grid">
          ${allBadges.map((b) => `
            <div class="badge-item ${badges.includes(b.id) ? 'unlocked' : ''}">
              <div class="ico">${b.icon}</div><div class="name">${b.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    root.querySelectorAll('#avatar-row .chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        Storage.set((st) => { st.profile.avatar = btn.dataset.val; });
        Pages.profile(root);
      });
    });

    root.querySelector('#save-username-btn').addEventListener('click', () => {
      const val = root.querySelector('#username-input').value.trim();
      if (val) {
        Storage.set((st) => { st.profile.username = val; });
        Anim.toast('✅ Username updated');
        Pages.profile(root);
      }
    });
  };
})();
