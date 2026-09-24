/* ==========================================================
 * Animesh Mondal — Portfolio
 * Vanilla JS, no dependencies. Progressive enhancement:
 * everything is readable and navigable without it.
 * ========================================================== */

(() => {
  'use strict';

  const doc = document;
  const root = doc.documentElement;
  const pf = doc.getElementById('pf');
  const mq = (q) => (window.matchMedia ? window.matchMedia(q) : { matches: false });
  const reduceMotion = mq('(prefers-reduced-motion: reduce)').matches;
  const finePointer = mq('(hover: hover) and (pointer: fine)').matches;
  const hasIO = 'IntersectionObserver' in window;
  const motion = !reduceMotion;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  /* --------------------------------------------------------
   * Theme — follows the OS until the visitor picks one; the
   * pick is persisted. Switch uses a circular View Transition.
   * ------------------------------------------------------ */
  const THEME_KEY = 'am.theme';
  const themeBtn = doc.getElementById('theme-toggle');
  const sysLight = mq('(prefers-color-scheme: light)');

  const getSaved = () => {
    try {
      const v = localStorage.getItem(THEME_KEY);
      return v === 'light' || v === 'dark' ? v : null;
    } catch (_) { return null; }
  };
  const save = (v) => { try { localStorage.setItem(THEME_KEY, v); } catch (_) {} };

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    if (themeBtn) {
      const label = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
      themeBtn.setAttribute('aria-label', label);
      themeBtn.setAttribute('title', label);
    }
  };

  applyTheme(getSaved() || (sysLight.matches ? 'light' : 'dark'));

  const onSysChange = () => { if (!getSaved()) applyTheme(sysLight.matches ? 'light' : 'dark'); };
  if (sysLight.addEventListener) sysLight.addEventListener('change', onSysChange);
  else if (sysLight.addListener) sysLight.addListener(onSysChange);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      save(next);
      if (doc.startViewTransition && motion) {
        const b = themeBtn.getBoundingClientRect();
        const x = b.left + b.width / 2;
        const y = b.top + b.height / 2;
        const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        root.style.setProperty('--vt-x', x + 'px');
        root.style.setProperty('--vt-y', y + 'px');
        root.style.setProperty('--vt-r', Math.ceil(r) + 'px');
        try { doc.startViewTransition(() => applyTheme(next)); return; } catch (_) {}
      }
      applyTheme(next);
    });
  }

  /* --------------------------------------------------------
   * Mobile menu (burger morphs via CSS; links stagger in,
   * the panel fades out on close)
   * ------------------------------------------------------ */
  const menuBtn = doc.getElementById('menu-toggle');
  const menu = doc.getElementById('mmenu');
  let menuTimer = 0;
  const setMenu = (open) => {
    if (!menuBtn || !menu) return;
    clearTimeout(menuTimer);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { menu.classList.remove('closing'); menu.hidden = false; return; }
    if (menu.hidden) return;
    if (!motion) { menu.hidden = true; return; }
    menu.classList.add('closing');
    menuTimer = setTimeout(() => { menu.hidden = true; menu.classList.remove('closing'); }, 190);
  };
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    doc.querySelector('.brand')?.addEventListener('click', () => setMenu(false));
    doc.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
    });
    mq('(min-width: 761px)').addEventListener?.('change', (e) => { if (e.matches) setMenu(false); });
  }

  /* --------------------------------------------------------
   * Smooth in-page scrolling with nav offset (CSS
   * scroll-padding does the offset); focus follows the target.
   * ------------------------------------------------------ */
  doc.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const id = a.getAttribute('href').slice(1);
    const target = id ? doc.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    if (id === 'top') window.scrollTo({ top: 0, behavior: motion ? 'smooth' : 'auto' });
    else target.scrollIntoView({ behavior: motion ? 'smooth' : 'auto', block: 'start' });
    if (history.pushState) history.pushState(null, '', '#' + id);
    const focusable = target.matches('a, button, input, textarea, select, [tabindex]');
    if (!focusable) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* --------------------------------------------------------
   * Scroll progress bar + nav shadow once scrolled
   * ------------------------------------------------------ */
  const progress = doc.getElementById('progress');
  const nav = doc.querySelector('.nav');
  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const se = doc.scrollingElement || root;
      const max = se.scrollHeight - se.clientHeight;
      const p = max > 0 ? clamp(se.scrollTop / max, 0, 1) : 0;
      if (progress) progress.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      if (nav) nav.classList.toggle('scrolled', se.scrollTop > 8);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --------------------------------------------------------
   * Active nav link + a pill that slides between links
   * ------------------------------------------------------ */
  const navLinks = Array.from(doc.querySelectorAll('.nl[data-nav]'));
  const navWrap = doc.querySelector('.navlinks');
  let activeLink = null;
  let placePill = () => {};

  if (navWrap && navLinks.length) {
    const pill = doc.createElement('span');
    pill.className = 'navpill';
    pill.setAttribute('aria-hidden', 'true');
    navWrap.prepend(pill);
    navWrap.classList.add('has-pill');
    let shown = false;
    let current = null;

    placePill = (a) => {
      current = a;
      if (!a || !a.offsetWidth) { pill.classList.remove('on'); shown = false; return; }
      const W = navWrap.clientWidth;
      const H = navWrap.clientHeight;
      const set = () => {
        pill.style.setProperty('--pl', a.offsetLeft + 'px');
        pill.style.setProperty('--pr', (W - a.offsetLeft - a.offsetWidth) + 'px');
        pill.style.setProperty('--pt', a.offsetTop + 'px');
        pill.style.setProperty('--pb', (H - a.offsetTop - a.offsetHeight) + 'px');
      };
      if (!shown) {
        // appear in place instead of sliding in from the edge
        pill.style.transition = 'opacity .3s';
        set();
        void pill.offsetWidth;
        pill.style.transition = '';
      } else set();
      pill.classList.add('on');
      shown = true;
    };

    navLinks.forEach((a) => {
      a.addEventListener('pointerenter', () => placePill(a));
      a.addEventListener('focus', () => placePill(a));
      a.addEventListener('blur', () => placePill(activeLink));
    });
    navWrap.addEventListener('pointerleave', () => placePill(activeLink));
    window.addEventListener('resize', () => placePill(current), { passive: true });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(() => placePill(current));
  }

  if (hasIO && navLinks.length) {
    const secIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const id = en.target.getAttribute('data-section');
        activeLink = null;
        navLinks.forEach((a) => {
          const on = a.getAttribute('data-nav') === id;
          a.classList.toggle('active', on);
          if (on) { a.setAttribute('aria-current', 'true'); activeLink = a; } else a.removeAttribute('aria-current');
        });
        if (!navWrap || !navWrap.matches(':hover')) placePill(activeLink);
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    doc.querySelectorAll('[data-section]').forEach((s) => secIO.observe(s));
    // clear the active state when back in the hero
    const hero = doc.getElementById('top');
    if (hero) {
      new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          navLinks.forEach((a) => { a.classList.remove('active'); a.removeAttribute('aria-current'); });
          activeLink = null;
          if (!navWrap || !navWrap.matches(':hover')) placePill(null);
        }
      }, { rootMargin: '-40% 0px -55% 0px' }).observe(hero);
    }
  }

  /* --------------------------------------------------------
   * Stagger indices + split section headings into words
   * ------------------------------------------------------ */
  doc.querySelectorAll('.metrics, .facts, .sitems, .xp .bul, .xp .chips').forEach((list) => {
    let i = 0;
    Array.from(list.children).forEach((li) => {
      if (li.classList.contains('chips-label')) return;
      li.style.setProperty('--i', String(i++));
    });
  });

  const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  if (motion) {
    doc.querySelectorAll('[data-split]').forEach((h) => {
      if (h.children.length) return; // plain-text headings only
      const text = h.textContent.trim().replace(/\s+/g, ' ');
      const words = text.split(' ').map((w, i) => '<span class="w" style="--wi:' + i + '">' + esc(w) + '</span>').join(' ');
      h.innerHTML = words; // same text, one span per word (no duplicate copy for crawlers)
    });
  }

  /* --------------------------------------------------------
   * Reveal on scroll + count-ups (metrics, GPA)
   * ------------------------------------------------------ */
  const fmt = (el, p) => {
    const to = parseFloat(el.getAttribute('data-count')) || 0;
    const dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const v = dec ? (to * p).toFixed(dec) : String(Math.round(to * p));
    return (el.getAttribute('data-prefix') || '') + v + (el.getAttribute('data-suffix') || '');
  };
  const countUp = (els, dur) => {
    const finals = els.map((el) => el.textContent);
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      els.forEach((el, i) => { el.textContent = t === 1 ? finals[i] : fmt(el, eased); });
      if (t < 1) requestAnimationFrame(tick);
      else els.forEach((el) => restart(el, 'tick'));
    };
    els.forEach((el) => { el.textContent = fmt(el, 0); });
    requestAnimationFrame(tick);
    return finals;
  };

  if (hasIO && motion && pf) {
    pf.classList.add('anim');

    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    doc.querySelectorAll('[data-reveal]').forEach((el) => revealIO.observe(el));

    const metricsEl = doc.getElementById('metrics');
    const counters = Array.from(doc.querySelectorAll('#metrics [data-count]'));
    if (metricsEl) {
      const finals = counters.map((el) => el.textContent);
      counters.forEach((el) => { el.textContent = fmt(el, 0); });
      const metricIO = new IntersectionObserver((entries) => {
        if (!entries.some((en) => en.isIntersecting)) return;
        metricIO.disconnect();
        metricsEl.classList.add('in');
        counters.forEach((el, i) => { el.textContent = finals[i]; });
        if (counters.length) countUp(counters, 1700);
      }, { threshold: 0.3 });
      metricIO.observe(metricsEl);
    }

    const gpa = doc.querySelector('.gpa-n[data-count]');
    if (gpa) {
      const gpaIO = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        gpaIO.disconnect();
        setTimeout(() => countUp([gpa], 1300), 250);
      }, { threshold: 0.6 });
      gpaIO.observe(gpa);
    }
  }

  /* --------------------------------------------------------
   * Copy email: icon morphs to a check, label flips, toast
   * ------------------------------------------------------ */
  const EMAIL = 'mondalarup808@gmail.com';
  const toast = doc.getElementById('toast');
  const toastMsg = toast ? toast.querySelector('span') : null;
  const copyBtns = Array.from(doc.querySelectorAll('[data-copy-email]'));
  const longLabels = Array.from(doc.querySelectorAll('[data-email-long]'));
  const shortLabels = Array.from(doc.querySelectorAll('[data-email-short]'));
  let copyTimer = 0;

  const setCopied = (copied) => {
    longLabels.forEach((el) => { el.textContent = copied ? 'Copied to clipboard' : EMAIL; });
    shortLabels.forEach((el) => { el.textContent = copied ? 'Copied' : 'Copy email'; });
    if (motion) longLabels.concat(shortLabels).forEach((el) => restart(el, 'label-flip'));
    copyBtns.forEach((b) => b.classList.toggle('is-copied', copied));
    if (toast) toast.classList.toggle('show', copied);
    if (toastMsg) toastMsg.textContent = copied ? 'Email copied to clipboard' : '';
  };
  if (toastMsg) toastMsg.textContent = '';

  const legacyCopy = (text) => {
    const ta = doc.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    doc.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = doc.execCommand('copy'); } catch (_) {}
    ta.remove();
    return ok;
  };

  copyBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      let ok = false;
      try {
        if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(EMAIL); ok = true; }
      } catch (_) {}
      if (!ok) ok = legacyCopy(EMAIL);
      if (!ok) { window.location.href = 'mailto:' + EMAIL; return; }
      setCopied(true);
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => setCopied(false), 2200);
    });
  });

  /* --------------------------------------------------------
   * Pointer effects: fine pointers only, never with reduced
   * motion. Spotlight, 3D tilt.
   * ------------------------------------------------------ */
  if (finePointer) {
    doc.querySelectorAll('[data-spot]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const b = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - b.left) + 'px');
        el.style.setProperty('--my', (e.clientY - b.top) + 'px');
      }, { passive: true });
    });
  }

  if (finePointer && motion) {
    // 3D tilt, lerped in rAF so it glides instead of snapping.
    const tilt = (el, opt) => {
      let tx = 0, ty = 0, cx = 0, cy = 0, tl = 0, cl = 0;
      let rect = null, over = false, id = 0;
      const measure = () => {
        const b = el.getBoundingClientRect();
        rect = { left: b.left + window.scrollX, top: b.top + window.scrollY, w: b.width, h: b.height };
      };
      const frame = () => {
        cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12; cl += (tl - cl) * 0.14;
        el.style.setProperty('--rx', (-cy * opt.max).toFixed(3) + 'deg');
        el.style.setProperty('--ry', (cx * opt.max).toFixed(3) + 'deg');
        if (opt.lift) el.style.setProperty('--lift', cl.toFixed(2) + 'px');
        if (opt.parallax) {
          el.style.setProperty('--ix', (-cx * opt.parallax).toFixed(2) + 'px');
          el.style.setProperty('--iy', (-cy * opt.parallax).toFixed(2) + 'px');
        }
        if (opt.glare) {
          el.style.setProperty('--px', ((cx + 1) * 50).toFixed(1) + '%');
          el.style.setProperty('--py', ((cy + 1) * 50).toFixed(1) + '%');
        }
        const moving = Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002 || Math.abs(tl - cl) > 0.02;
        if (moving || over) { id = requestAnimationFrame(frame); return; }
        id = 0;
        el.classList.remove('is-tilting');
        ['--rx', '--ry', '--lift', '--ix', '--iy', '--px', '--py'].forEach((p) => el.style.removeProperty(p));
      };
      const kick = () => { if (!id) id = requestAnimationFrame(frame); };
      el.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse' || getComputedStyle(el).animationName !== 'none') return;
        over = true; measure(); tl = opt.lift || 0;
        el.classList.add('is-tilting');
        kick();
      });
      el.addEventListener('pointermove', (e) => {
        if (!over || !rect) return;
        const x = e.pageX - rect.left;
        const y = e.pageY - rect.top;
        tx = clamp(x / rect.w * 2 - 1, -1, 1);
        ty = clamp(y / rect.h * 2 - 1, -1, 1);
        kick();
      }, { passive: true });
      el.addEventListener('pointerleave', () => { over = false; tx = 0; ty = 0; tl = 0; kick(); });
    };

    const pcard = doc.querySelector('.pcard[data-tilt]');
    if (pcard) {
      // The entrance animation owns `transform` until it ends; then hand over to tilt.
      const settle = () => { pcard.style.animation = 'none'; };
      pcard.addEventListener('animationend', (e) => { if (e.target === pcard) settle(); });
      setTimeout(settle, 2000);
      tilt(pcard, { max: 6, parallax: 6, glare: true });
    }
    doc.querySelectorAll('.card[data-tilt]').forEach((c) => tilt(c, { max: 3, lift: -4 }));
  }

  /* --------------------------------------------------------
   * Footer year
   * ------------------------------------------------------ */
  const year = doc.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
