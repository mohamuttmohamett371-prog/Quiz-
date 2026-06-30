/* ==========================================================================
   Quiz App — Rewards Page
   ========================================================================== */

const Pages_rewards_ns = window.Pages || (window.Pages = {});

Pages_rewards_ns.rewards = function (root) {
  const profile = Storage.get().profile;
  const earnedBadges = Storage.get().badges;
  const allBadges = App.getData().rewards.badges || [];
  const xpReq = App.xpForNextLevel();
  const xpPct = Math.min(100, Math.round((profile.xp / xpReq) * 100));

  root.innerHTML = `
    <div class="page">
      <div class="section-title">Your Rewards</div>
      <div class="reward-stat-grid">
        <div class="reward-stat"><div class="ico">🪙</div><div class="v">${profile.coins}</div><div class="l">Coins</div></div>
        <div class="reward-stat"><div class="ico">⭐</div><div class="v">${profile.stars}</div><div class="l">Stars</div></div>
        <div class="reward-stat"><div class="ico">📈</div><div class="v">Lv. ${profile.level}</div><div class="l">Level</div></div>
        <div class="reward-stat"><div class="ico">🔥</div><div class="v">${profile.streak}</div><div class="l">Day Streak</div></div>
      </div>

      <div class="xp-bar-wrap">
        <div style="display:flex; justify-content:space-between; font-size:12px; opacity:0.7; margin-bottom:6px;">
          <span>XP Progress</span><span>${profile.xp} / ${xpReq}</span>
        </div>
        <div class="xp-bar"><div class="xp-bar-fill" style="width:${xpPct}%"></div></div>
      </div>

      <button class="btn btn-primary" id="claim-btn">🎁 Claim Daily Reward</button>

      <div class="section-title">Badges & Achievements</div>
      <div class="badge-grid">
        ${allBadges.map((b) => `
          <div class="badge-item ${earnedBadges.includes(b.id) ? 'unlocked' : ''}">
            <div class="ico">${b.icon}</div>
            <div class="name">${b.name}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  root.querySelector('#claim-btn').addEventListener('click', () => {
    const claimed = App.claimDailyReward();
    if (claimed) { Anim.confetti(30); Anim.toast('🎁 Reward claimed!'); Pages_rewards_ns.rewards(root); }
    else Anim.toast('✅ Already claimed today');
  });
};
