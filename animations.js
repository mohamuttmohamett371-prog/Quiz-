/* ==========================================================================
   Quiz App — Animations Helper
   Small reusable visual effects: confetti, toast, shake.
   ========================================================================== */

const Anim = (() => {
  function confetti(count = 40) {
    const colors = ['#1565ff', '#00d4ff', '#16d97a', '#ffb020', '#ff4d6d'];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = (Math.random() * 0.4) + 's';
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 2800);
    }
  }

  function toast(message, duration = 2200) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  function shake(element) {
    element.classList.add('anim-shake');
    setTimeout(() => element.classList.remove('anim-shake'), 420);
  }

  function pop(element) {
    element.classList.add('anim-pop');
    setTimeout(() => element.classList.remove('anim-pop'), 400);
  }

  return { confetti, toast, shake, pop };
})();
