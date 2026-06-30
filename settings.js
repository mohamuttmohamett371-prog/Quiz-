/* ==========================================================================
   Quiz App — Settings & About Pages
   ========================================================================== */

(function () {
  const Pages = window.Pages || (window.Pages = {});

  Pages.settings = function (root) {
    const s = Storage.get().settings;

    root.innerHTML = `
      <div class="page">
        <div class="settings-group">
          <h4>Appearance</h4>
          <div class="settings-row">
            <div class="label">🌙 Dark Mode</div>
            <button class="toggle ${s.theme === 'dark' ? 'on' : ''}" id="dark-toggle"></button>
          </div>
          <div class="settings-row">
            <div class="label">☀️ Light Mode</div>
            <button class="toggle ${s.theme === 'light' ? 'on' : ''}" id="light-toggle"></button>
          </div>
        </div>

        <div class="settings-group">
          <h4>Preferences</h4>
          <div class="settings-row">
            <div class="label">🔊 Sound</div>
            <button class="toggle ${s.sound ? 'on' : ''}" id="sound-toggle"></button>
          </div>
          <div class="settings-row">
            <div class="label">🎬 Animations</div>
            <button class="toggle ${s.animations ? 'on' : ''}" id="anim-toggle"></button>
          </div>
          <div class="settings-row">
            <div class="label">🌐 Language</div>
            <select class="select-input" id="lang-select">
              <option value="en" ${s.language === 'en' ? 'selected' : ''}>English</option>
              <option value="ar" ${s.language === 'ar' ? 'selected' : ''}>العربية</option>
              <option value="so" ${s.language === 'so' ? 'selected' : ''}>Soomaali</option>
            </select>
          </div>
        </div>

        <div class="settings-group">
          <h4>Data</h4>
          <div class="settings-row" id="reset-row" style="cursor:pointer;">
            <div class="label">🗑️ Reset Progress</div><div>›</div>
          </div>
        </div>

        <div class="settings-group">
          <h4>Information</h4>
          <div class="settings-row" id="privacy-row" style="cursor:pointer;"><div class="label">🔒 Privacy Policy</div><div>›</div></div>
          <div class="settings-row" id="terms-row" style="cursor:pointer;"><div class="label">📄 Terms of Service</div><div>›</div></div>
          <div class="settings-row" id="about-row" style="cursor:pointer;"><div class="label">ℹ️ About</div><div>›</div></div>
          <div class="settings-row" id="feedback-row" style="cursor:pointer;"><div class="label">💬 Feedback</div><div>›</div></div>
        </div>
      </div>
    `;

    root.querySelector('#dark-toggle').addEventListener('click', () => {
      Storage.set((st) => { st.settings.theme = 'dark'; });
      App.applyPreferences();
      Pages.settings(root);
    });
    root.querySelector('#light-toggle').addEventListener('click', () => {
      Storage.set((st) => { st.settings.theme = 'light'; });
      App.applyPreferences();
      Pages.settings(root);
    });
    root.querySelector('#sound-toggle').addEventListener('click', () => {
      Storage.set((st) => { st.settings.sound = !st.settings.sound; });
      Pages.settings(root);
    });
    root.querySelector('#anim-toggle').addEventListener('click', () => {
      Storage.set((st) => { st.settings.animations = !st.settings.animations; });
      App.applyPreferences();
      Pages.settings(root);
    });
    root.querySelector('#lang-select').addEventListener('change', (e) => {
      Storage.set((st) => { st.settings.language = e.target.value; });
      Anim.toast('🌐 Language preference saved');
    });
    root.querySelector('#reset-row').addEventListener('click', () => {
      if (confirm('Reset all progress? This cannot be undone.')) {
        Storage.reset();
        App.applyPreferences();
        Anim.toast('✅ Progress reset');
        Router.navigate('/home');
      }
    });
    root.querySelector('#privacy-row').addEventListener('click', () => Anim.toast('🔒 We respect your privacy — no data leaves this device.'));
    root.querySelector('#terms-row').addEventListener('click', () => Anim.toast('📄 By using this app you agree to fair, respectful use.'));
    root.querySelector('#about-row').addEventListener('click', () => Router.navigate('/about'));
    root.querySelector('#feedback-row').addEventListener('click', () => Anim.toast('💬 Thanks! Feedback feature coming soon.'));
  };

  Pages.about = function (root) {
    root.innerHTML = `
      <div class="page" style="text-align:center;">
        <img src="./assets/logo/logo.svg" alt="Quiz App Logo" style="width:90px; height:90px; margin: 20px auto;">
        <h2 style="font-size:20px; font-weight:800;">Quiz App</h2>
        <p style="font-size:13px; opacity:0.6; margin-top:6px;">Version 1.0.0</p>
        <p style="font-size:13px; opacity:0.6; margin-top:14px; line-height:1.7;">
          A modern, premium quiz platform featuring timed exams, educational stories,
          rewards, and progress tracking — built fully offline-capable as a Progressive Web App.
        </p>
        <div class="glass-card" style="margin-top:24px;">
          <div style="font-size:14px; font-weight:700;">Created by Mohamud JK</div>
          <div style="font-size:12px; opacity:0.55; margin-top:4px;">© 2026 · All Rights Reserved</div>
        </div>
        <button class="btn btn-outline" id="back-settings" style="width:100%; margin-top:20px;">← Back to Settings</button>
      </div>
    `;
    root.querySelector('#back-settings').addEventListener('click', () => Router.navigate('/settings'));
  };
})();
