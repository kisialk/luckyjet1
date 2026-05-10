(function () {
  const btn = document.getElementById('nav-toggle');
  if (!btn) return;

  const panelId = btn.getAttribute('aria-controls') || 'mobile-nav-panel';
  const panel = document.getElementById(panelId);
  if (!panel) return;

  let lastFocused = null;

  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])'
  ].join(',');

  function getFocusable() {
    return Array.from(panel.querySelectorAll(focusableSelector))
      .filter(el => el.offsetParent !== null);
  }

  function openNav() {
    if (panel.classList.contains('open')) return;
    lastFocused = document.activeElement;
    panel.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');

    // фокус на перший елемент
    const first = getFocusable()[0];
    if (first) first.focus();

    document.addEventListener('keydown', onKeydown, true);
    document.addEventListener('click', onDocClick, true);
  }

  function closeNav() {
    if (!panel.classList.contains('open')) return;
    panel.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');

    document.removeEventListener('keydown', onKeydown, true);
    document.removeEventListener('click', onDocClick, true);

    // повернути фокус на кнопку
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    } else {
      btn.focus();
    }
  }

  function toggleNav() {
    panel.classList.contains('open') ? closeNav() : openNav();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeNav();
      return;
    }
    if (e.key === 'Tab' && panel.classList.contains('open')) {
      // простий focus trap
      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function onDocClick(e) {
    // Закриваємо, якщо клік поза панеллю (і не по кнопці)
    if (!panel.contains(e.target) && e.target !== btn && panel.classList.contains('open')) {
      closeNav();
    }
  }

  // Клік по кнопці — відкриття/закриття
  btn.addEventListener('click', toggleNav);

  // Клік по будь-якому пункту меню — закриваємо
  panel.addEventListener('click', (e) => {
    const link = e.target.closest('a, button');
    if (link) closeNav();
  });
})();

document.addEventListener('DOMContentLoaded', function () {
  const btn   = document.getElementById('sidebar-toggle');
  if (!btn) { console.warn('[drawer] no #sidebar-toggle'); return; }

  const panelId = btn.getAttribute('aria-controls') || 'sidebar-drawer';
  const panel   = document.getElementById(panelId);
  if (!panel) { console.warn('[drawer] no panel #' + panelId); return; }

  // очікуємо, що в середині вже є .drawer-backdrop і .drawer-inner (з твоєї розмітки)
  let backdrop = panel.querySelector('.drawer-backdrop');
  const inner  = panel.querySelector('.drawer-inner');
  if (!inner) { console.warn('[drawer] no .drawer-inner'); return; }
  if (!backdrop) {
    // підстрахуємось: якщо раптом нема — створимо
    backdrop = document.createElement('div');
    backdrop.className = 'drawer-backdrop';
    panel.prepend(backdrop);
  }

  let lastFocused = null;
  const focusSel = [
    'a[href]','button:not([disabled])','[tabindex]:not([tabindex="-1"])',
    'input:not([disabled])','select:not([disabled])','textarea:not([disabled])'
  ].join(',');

  const getFocusable = () =>
    Array.from(inner.querySelectorAll(focusSel)).filter(el => el.offsetParent !== null);

  function openDrawer() {
    if (panel.classList.contains('open')) return;
    lastFocused = document.activeElement;

    panel.classList.add('open');
    panel.removeAttribute('aria-hidden');
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('drawer-open');

    const f = getFocusable()[0] || inner;
    f.focus();

    document.addEventListener('keydown', onKeydown, true);
  }

  function closeDrawer() {
    if (!panel.classList.contains('open')) return;

    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-open');

    document.removeEventListener('keydown', onKeydown, true);

    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    else btn.focus();
  }

  function toggleDrawer() {
    panel.classList.contains('open') ? closeDrawer() : openDrawer();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeDrawer(); return; }
    if (e.key === 'Tab' && panel.classList.contains('open')) {
      const f = getFocusable(); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  // тригери
  btn.addEventListener('click', toggleDrawer);
  backdrop.addEventListener('click', closeDrawer);

  // закриття після кліку по будь-якому інтерактиву всередині
  inner.addEventListener('click', (e) => {
    const trigger = e.target.closest('a, button, [data-close]');
    if (trigger) closeDrawer();
  });
});

(function () {
  const btn = document.getElementById('sidebar-toggle');
  if (!btn) return;

  function triggerRipple(e) {
    const rect = btn.getBoundingClientRect();
    const x = (e.touches?.[0]?.clientX ?? e.clientX ?? (rect.left + rect.width/2)) - rect.left;
    const y = (e.touches?.[0]?.clientY ?? e.clientY ?? (rect.top  + rect.height/2)) - rect.top;

    // передамо координати в CSS-змінні
    btn.style.setProperty('--x', x + 'px');
    btn.style.setProperty('--y', y + 'px');

    // перезапустимо анімацію (скидаємо клас і знову додаємо)
    btn.classList.remove('rippling');
    // reflow-хак
    void btn.offsetWidth;
    btn.classList.add('rippling');
  }

  // миша/тач
  btn.addEventListener('pointerdown', triggerRipple);

  // клавіша Enter/Space — теж хай дає хвилю
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      triggerRipple(e);
    }
  });

  // прибираємо клас після завершення (щоб можна було знову анімувати)
  btn.addEventListener('animationend', (e) => {
    if (e.target.classList.contains('wave')) {
      // дочекайся завершення обох хвиль і зніми клас
      // простий спосіб — невелика затримка:
      setTimeout(() => btn.classList.remove('rippling'), 80);
    }
  }, true);
})();
document.addEventListener('DOMContentLoaded', () => {
  const THRESHOLD = 300;

  // 1) Знайти або створити кнопку
  let btn = document.querySelector('.back-to-top');
  if (!btn) {
    btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Вверх');
    document.body.appendChild(btn);
  }

  // 2) Показ/приховування
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggleBtn = () => {
    if (window.scrollY > THRESHOLD) {
      btn.classList.add('back-to-top--visible');
    } else {
      btn.classList.remove('back-to-top--visible');
    }
  };

  // 3) Клік — скрол нагору
  const scrollTop = () => {
    const behavior = mqReduce.matches ? 'auto' : 'smooth';
    window.scrollTo({ top: 0, behavior });
  };

  // 4) Обробники
  window.addEventListener('scroll', toggleBtn, { passive: true });
  window.addEventListener('resize', toggleBtn, { passive: true });
  btn.addEventListener('click', scrollTop);

  // для клавіатури (Enter/Space)
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollTop();
    }
  });

  // 5) Ініціалізація стану
  toggleBtn();
});