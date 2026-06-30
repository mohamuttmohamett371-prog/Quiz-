/* ==========================================================================
   Quiz App — Service Worker Registration & Install Prompt
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------------- Register the Service Worker ------------------ */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then((registration) => {
          console.log('[SW] Registered with scope:', registration.scope);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateToast(registration);
              }
            });
          });
        })
        .catch((err) => console.error('[SW] Registration failed:', err));

      // Reload once the new SW takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    });
  }

  /* ---------------------- Update available toast ------------------------ */
  function showUpdateToast(registration) {
    const toast = document.createElement('div');
    toast.className = 'sw-update-toast';
    toast.innerHTML = `
      <span>🚀 A new version is available!</span>
      <button id="sw-update-btn">Update</button>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    document.getElementById('sw-update-btn').addEventListener('click', () => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      toast.remove();
    });
  }

  /* ---------------------- Install (Add to Home Screen) Prompt ----------- */
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });

  function showInstallButton() {
    const btn = document.getElementById('install-app-btn');
    if (!btn) return;
    btn.classList.remove('hidden');
    btn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      btn.classList.add('hidden');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] Install prompt outcome:', outcome);
      deferredPrompt = null;
    });
  }

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App successfully installed');
    const btn = document.getElementById('install-app-btn');
    if (btn) btn.classList.add('hidden');
  });

  /* ---------------------- Online / Offline indicator --------------------- */
  function updateConnectionStatus() {
    document.body.classList.toggle('is-offline', !navigator.onLine);
  }
  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
  document.addEventListener('DOMContentLoaded', updateConnectionStatus);
})();
