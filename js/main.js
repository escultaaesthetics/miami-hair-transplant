/* Miami Hair Transplant — shared behavior
   Progressive enhancement: everything works without JS. */

document.documentElement.classList.add('js');

/* ---------- Mobile navigation ---------- */
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    document.body.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });

  mainNav.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      mainNav.classList.remove('open');
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---------- Scroll reveals ----------
   Position-based instead of IntersectionObserver so reveals also fire
   in headless renderers and backgrounded tabs where IO never calls back.
   Elements are visible by default without JS; html.js arms the hide.
   When the Motion library (CDN) is present, it drives the entrance with
   spring physics; otherwise the CSS transition in styles.css takes over. */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls = Array.from(document.querySelectorAll('.reveal'));

const M = typeof window.Motion === 'object' && window.Motion.animate ? window.Motion : null;
if (M && !reduceMotion) document.documentElement.classList.add('motion');

const springIn = (el) => {
  const delay = parseFloat(getComputedStyle(el).getPropertyValue('--reveal-delay')) || 0;
  M.animate(
    el,
    { opacity: [0, 1], transform: ['translateY(28px)', 'translateY(0px)'] },
    { delay, type: 'spring', stiffness: 110, damping: 18, mass: 0.9 }
  );
};

if (reduceMotion) {
  revealEls.forEach((el) => el.classList.add('in'));
} else {
  let pending = revealEls.slice();

  const check = () => {
    if (!pending.length) return;
    const limit = window.innerHeight * 0.92;
    pending = pending.filter((el) => {
      if (el.getBoundingClientRect().top < limit) {
        el.classList.add('in');
        if (M) springIn(el);
        return false;
      }
      return true;
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      check();
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Double rAF: guarantee one painted frame in the hidden state so the
  // entrance transition actually animates for above-the-fold content.
  requestAnimationFrame(() => requestAnimationFrame(check));

  // Safety net: one late re-check in case early layout shifted things
  // into view (fonts, images) without a scroll event.
  setTimeout(check, 1800);
}

/* ---------- Before / after comparison sliders ----------
   Each .ba-compare contains an <input type="range" class="ba-range">
   that drives the --split custom property. Works with mouse drag,
   touch, and keyboard (arrow keys on the focused range input). */
document.querySelectorAll('.ba-compare').forEach((compare) => {
  const range = compare.querySelector('.ba-range');
  if (!range) return;

  const apply = () => {
    compare.style.setProperty('--split', range.value + '%');
  };

  range.addEventListener('input', apply);
  apply();
});

/* ---------- Case gallery carousels ----------
   Each .case-card holds a stack of photos; arrows and dots switch
   the visible one. First photo is the composed before/after. */
document.querySelectorAll('.case-card').forEach((card) => {
  const imgs = Array.from(card.querySelectorAll('.case-viewer img'));
  const dots = Array.from(card.querySelectorAll('.case-dot'));
  if (imgs.length < 2) return;

  let current = 0;

  const show = (next) => {
    const n = (next + imgs.length) % imgs.length;
    imgs[current].classList.remove('active');
    dots[current].removeAttribute('aria-current');
    imgs[n].classList.add('active');
    dots[n].setAttribute('aria-current', 'true');
    current = n;
  };

  card.querySelector('.case-nav-prev').addEventListener('click', () => show(current - 1));
  card.querySelector('.case-nav-next').addEventListener('click', () => show(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
});

/* ---------- Results gallery filters ---------- */
const filterBar = document.querySelector('.filter-bar');

if (filterBar) {
  const buttons = filterBar.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.results-grid .ba-card');

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));

    const filter = btn.dataset.filter;
    cards.forEach((card) => {
      const match = filter === 'all' || card.dataset.procedure === filter;
      card.classList.toggle('hidden', !match);
    });
  });
}
