/* ==========================================================================
   Quiz App — Router
   Lightweight hash-based SPA router rendering into #page-container.
   ========================================================================== */

const Router = (() => {
  const routes = {};
  let container = null;
  let currentRoute = null;

  function register(path, renderFn) {
    routes[path] = renderFn;
  }

  function init(containerEl) {
    container = containerEl;
    window.addEventListener('hashchange', resolve);
    resolve();
  }

  function navigate(path) {
    if (window.location.hash === `#${path}`) {
      resolve();
    } else {
      window.location.hash = path;
    }
  }

  function resolve() {
    let path = window.location.hash.replace('#', '') || '/home';
    const [base, query] = path.split('?');
    const params = {};
    if (query) {
      query.split('&').forEach((pair) => {
        const [k, v] = pair.split('=');
        params[k] = decodeURIComponent(v || '');
      });
    }
    const renderFn = routes[base] || routes['/home'];
    currentRoute = base;
    container.innerHTML = '';
    updateNav(base);
    renderFn(container, params);
    container.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function updateNav(base) {
    document.querySelectorAll('.nav-item').forEach((el) => {
      el.classList.toggle('active', el.dataset.route === base);
    });
  }

  function current() {
    return currentRoute;
  }

  return { register, init, navigate, current };
})();
