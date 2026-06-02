/* ==========================================================
 * Animesh Mondal — Portfolio
 * Vanilla JS, no dependencies. Progressive enhancement.
 * ========================================================== */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fineCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Theme toggle (light / dark, with system default) ---------- */
  const THEME_KEY = 'am.theme';
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const systemMql = window.matchMedia('(prefers-color-scheme: dark)');

  const readStored = () => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved === 'light' || saved === 'dark' ? saved : null;
    } catch (_) { return null; }
  };
  const writeStored = (val) => {
    try { localStorage.setItem(THEME_KEY, val); } catch (_) {}
  };
  const systemTheme = () => (systemMql.matches ? 'dark' : 'light');

  /**
   * Default behaviour: follow system theme until the user explicitly clicks
   * the toggle. Once they toggle, that choice is persisted and overrides system.
   */
  const getInitialTheme = () => readStored() || systemTheme();

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    if (toggle) toggle.setAttribute('aria-pressed', String(theme === 'dark'));
  };

  applyTheme(getInitialTheme());

  // React to live OS theme changes only if user hasn't manually picked one.
  const onSystemChange = (e) => {
    if (!readStored()) applyTheme(e.matches ? 'dark' : 'light');
  };
  if (systemMql.addEventListener) {
    systemMql.addEventListener('change', onSystemChange);
  } else if (systemMql.addListener) {
    systemMql.addListener(onSystemChange); // Safari < 14
  }

  /**
   * Animated theme switch.
   * - Uses the View Transitions API for a circular reveal expanding from the
   *   click position, when supported.
   * - Falls back to a global, momentary cross-fade transition for older browsers.
   */
  const supportsViewTransitions =
    typeof document.startViewTransition === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (toggle) {
    toggle.addEventListener('click', (event) => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

      if (supportsViewTransitions) {
        const x = event.clientX;
        const y = event.clientY;
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => applyTheme(next));

        transition.ready.then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0 at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`
              ]
            },
            {
              duration: 650,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              pseudoElement: '::view-transition-new(root)'
            }
          );
        });
      } else {
        // Fallback cross-fade
        document.body.classList.add('theme-transitioning');
        applyTheme(next);
        setTimeout(() => document.body.classList.remove('theme-transitioning'), 650);
      }

      writeStored(next);
    });
  }

  /* ---------- Sticky header border + right-rail scroll progress ---------- */
  const header = document.querySelector('.site-header');
  const progressFill = document.querySelector('.rail-progress-fill');

  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 4);

    if (progressFill) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (y / docHeight) * 100) : 0;
      progressFill.style.setProperty('--scroll-progress', `${pct}%`);
      progressFill.style.height = `${pct}%`;
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Reveal-on-scroll (staggered) ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Hero word rotator (ship / scale / delight / last) ---------- */
  const rotator = document.querySelector('.word-rotator');
  if (rotator && !reduceMotion) {
    const inner = rotator.querySelector('.word-rotator-inner');
    const words = Array.from(rotator.querySelectorAll('[data-word]'));
    if (inner && words.length > 1) {
      let idx = 0;

      const setTo = (i) => {
        const target = words[i];
        const w = target.getBoundingClientRect().width;
        const lineH = target.getBoundingClientRect().height;
        rotator.style.setProperty('--rotator-w', `${Math.ceil(w)}px`);
        inner.style.setProperty('--rotator-y', `-${i * lineH}px`);
        rotator.classList.add('is-changing');
        clearTimeout(rotator._t);
        rotator._t = setTimeout(() => rotator.classList.remove('is-changing'), 650);
      };

      // Initial sizing once fonts are ready (so width measures correctly)
      const init = () => setTo(idx);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(init);
      } else {
        init();
      }
      // Resize handler — re-measure when viewport (and font sizes) change
      window.addEventListener('resize', () => setTo(idx), { passive: true });

      setInterval(() => {
        idx = (idx + 1) % words.length;
        setTo(idx);
      }, 2400);
    }
  }

  /* ===========================================================
   * Interactive layer (skipped if reduced motion or coarse pointer)
   * =========================================================== */
  if (reduceMotion || !fineCursor) return;

  /* ---------- Lerp helper for smooth follow ---------- */
  const lerp = (a, b, n) => a + (b - a) * n;

  /* ---------- Global cursor spotlight (whole viewport) ---------- */
  const spotlight = document.querySelector('.cursor-spotlight');
  if (spotlight) {
    let tx = 50, ty = 30, cx = 50, cy = 30;
    let animating = false;

    const animate = () => {
      cx = lerp(cx, tx, 0.14);
      cy = lerp(cy, ty, 0.14);
      spotlight.style.setProperty('--cursor-x', `${cx.toFixed(2)}%`);
      spotlight.style.setProperty('--cursor-y', `${cy.toFixed(2)}%`);
      if (Math.abs(cx - tx) > 0.1 || Math.abs(cy - ty) > 0.1) {
        requestAnimationFrame(animate);
      } else {
        animating = false;
      }
    };
    const start = () => { if (!animating) { animating = true; requestAnimationFrame(animate); } };

    document.addEventListener('pointermove', (e) => {
      tx = (e.clientX / window.innerWidth) * 100;
      ty = (e.clientY / window.innerHeight) * 100;
      document.body.classList.add('cursor-active');
      start();
    });
    document.addEventListener('pointerleave', () => {
      document.body.classList.remove('cursor-active');
    });
  }

  /* ---------- Card 3D tilt + glow ---------- */
  document.querySelectorAll('.card').forEach((card) => {
    let raf = null;
    let targetRX = 0, targetRY = 0, currRX = 0, currRY = 0;
    let targetMX = 50, targetMY = 50, currMX = 50, currMY = 50;

    const tick = () => {
      currRX = lerp(currRX, targetRX, 0.18);
      currRY = lerp(currRY, targetRY, 0.18);
      currMX = lerp(currMX, targetMX, 0.18);
      currMY = lerp(currMY, targetMY, 0.18);
      card.style.setProperty('--rx', `${currRX.toFixed(2)}deg`);
      card.style.setProperty('--ry', `${currRY.toFixed(2)}deg`);
      card.style.setProperty('--mx', `${currMX.toFixed(1)}%`);
      card.style.setProperty('--my', `${currMY.toFixed(1)}%`);
      if (
        Math.abs(currRX - targetRX) > 0.05 ||
        Math.abs(currRY - targetRY) > 0.05 ||
        Math.abs(currMX - targetMX) > 0.2 ||
        Math.abs(currMY - targetMY) > 0.2
      ) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(tick); };

    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;   // 0 → 1
      const py = (e.clientY - rect.top) / rect.height;
      targetRY = (px - 0.5) * 6;     // max ±3deg
      targetRX = (0.5 - py) * 4;     // max ±2deg
      targetMX = px * 100;
      targetMY = py * 100;
      card.classList.add('is-tilted');
      schedule();
    });

    card.addEventListener('pointerleave', () => {
      targetRX = 0; targetRY = 0; targetMX = 50; targetMY = 50;
      card.classList.remove('is-tilted');
      schedule();
    });
  });

  /* ---------- Magnetic primary buttons ---------- */
  document.querySelectorAll('.btn-primary').forEach((btn) => {
    let raf = null;
    let tx = 0, ty = 0, cx = 0, cy = 0;

    const tick = () => {
      cx = lerp(cx, tx, 0.22);
      cy = lerp(cy, ty, 0.22);
      btn.style.setProperty('--mx', `${cx.toFixed(2)}px`);
      btn.style.setProperty('--my', `${cy.toFixed(2)}px`);
      if (Math.abs(cx - tx) > 0.1 || Math.abs(cy - ty) > 0.1) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(tick); };

    btn.addEventListener('pointermove', (e) => {
      const rect = btn.getBoundingClientRect();
      tx = (e.clientX - (rect.left + rect.width / 2)) * 0.25;
      ty = (e.clientY - (rect.top + rect.height / 2)) * 0.25;
      schedule();
    });
    btn.addEventListener('pointerleave', () => {
      tx = 0; ty = 0;
      schedule();
    });
  });

  /* ---------- Hero title scroll parallax ---------- */
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    let raf = null;
    const update = () => {
      const y = Math.min(window.scrollY * 0.18, 80);
      heroTitle.style.setProperty('--parallax-y', `${y}px`);
      raf = null;
    };
    window.addEventListener(
      'scroll',
      () => { if (!raf) raf = requestAnimationFrame(update); },
      { passive: true }
    );
  }

})();
