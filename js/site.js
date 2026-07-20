    // Side drawer menu
    (function () {
      var drawer = document.getElementById('drawer');
      var scrim = document.getElementById('drawer-scrim');
      var burger = document.querySelector('.nav-burger');
      function setOpen(open) {
        drawer.classList.toggle('open', open);
        scrim.hidden = false;
        requestAnimationFrame(function () { scrim.classList.toggle('open', open); });
        if (!open) setTimeout(function () { scrim.hidden = true; }, 280);
        document.body.classList.toggle('drawer-open', open);
        drawer.setAttribute('aria-hidden', String(!open));
        burger.setAttribute('aria-expanded', String(open));
      }
      burger.addEventListener('click', function () { setOpen(true); });
      document.querySelector('.drawer-close').addEventListener('click', function () { setOpen(false); });
      scrim.addEventListener('click', function () { setOpen(false); });
      drawer.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { setOpen(false); });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && drawer.classList.contains('open')) setOpen(false);
      });
      if (location.hash === '#menu') setOpen(true);
    })();

    // Consultation modal: every "#consult" CTA opens it
    (function () {
      var modal = document.getElementById('consult-modal');
      var scrim = document.getElementById('modal-scrim');
      var lastFocus = null;
      function setOpen(open) {
        if (open) { lastFocus = document.activeElement; }
        modal.classList.toggle('open', open);
        scrim.hidden = false;
        requestAnimationFrame(function () { scrim.classList.toggle('open', open); });
        if (!open) setTimeout(function () { scrim.hidden = true; }, 240);
        document.body.classList.toggle('modal-open', open);
        modal.setAttribute('aria-hidden', String(!open));
        if (open) { loadConsultForm(); }
        else if (lastFocus) { lastFocus.focus(); }
      }
      var formLoaded = false;
      function loadConsultForm() {
        if (formLoaded) return;
        formLoaded = true;
        var frame = document.getElementById('inline-svnJf2EAuAwNGxMDC2Iy');
        // Cache-buster: append a timestamp so the browser always fetches the
        // current form from GoHighLevel (style edits show up without a hard refresh).
        var src = frame.getAttribute('data-src');
        src += (src.indexOf('?') === -1 ? '?' : '&') + '_=' + Date.now();
        frame.src = src;
        // form_embed.js resizes the iframe once the form has rendered; use
        // that height change as the "loaded" signal (the script may replace
        // the element, so load events are unreliable). 6s fallback.
        var wrap = document.getElementById('modal-form-wrap');
        // Primary signal: the GHL embed posts messages (used to resize the
        // iframe) as soon as the form renders — event-driven, immune to
        // background-tab timer throttling.
        window.addEventListener('message', function (e) {
          if (typeof e.origin === 'string' && e.origin.indexOf('miahairtransplant.com') !== -1) {
            wrap.classList.add('loaded');
          }
        });
        var poll = setInterval(function () {
          var f = document.getElementById('inline-svnJf2EAuAwNGxMDC2Iy');
          if (f && f.style.height && f.style.height !== '1710px') {
            wrap.classList.add('loaded');
            clearInterval(poll);
          }
        }, 300);
        setTimeout(function () { wrap.classList.add('loaded'); clearInterval(poll); }, 6000);
        var script = document.createElement('script');
        script.src = 'https://app.miahairtransplant.com/js/form_embed.js';
        document.body.appendChild(script);
      }
      document.querySelectorAll('a[href="#consult"], a[href="#consult-modal"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          setOpen(true);
        });
      });
      modal.querySelector('.modal-close').addEventListener('click', function () { setOpen(false); });
      scrim.addEventListener('click', function () { setOpen(false); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('open')) setOpen(false);
      });
      if (location.hash === '#form') setOpen(true);
    })();

    // FAQ accordion: one open at a time, matching the mockup behavior.
    document.querySelectorAll('.faq-item').forEach(function (item) {
      item.querySelector('.faq-q').addEventListener('click', function () {
        var wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(function (other) {
          other.classList.remove('open');
          other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-mark').textContent = '+';
        });
        if (!wasOpen) {
          item.classList.add('open');
          this.setAttribute('aria-expanded', 'true');
          item.querySelector('.faq-mark').textContent = '−';
        }
      });
    });

    // Consultation form: show the thank-you state on submit.
    // TODO: connect to the clinic's CRM/email endpoint before launch.
    // Consultation form is the clinic's GoHighLevel embed, lazy-loaded
    // on first modal open (see loadConsultForm in the modal block).

    // Scroll reveals: position-based trigger (works where IntersectionObserver
    // never fires), visible-by-default, staggered per group, reduced-motion aware.
    (function () {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var els = Array.prototype.slice.call(document.querySelectorAll(
        '.why-card, .svc-card, .ba-item, .step, .testi-card, .faq-item, .gallery-grid img, .care-photos img, .care-copy'
      ));
      els.forEach(function (el) {
        var i = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.setProperty('--rv-d', Math.min(i, 5) * 70 + 'ms');
        el.classList.add('rv-el');
      });
      document.documentElement.classList.add('rv');
      var pending = els.slice();
      function check() {
        if (!pending.length) return;
        var limit = window.innerHeight * 0.94;
        pending = pending.filter(function (el) {
          if (el.getBoundingClientRect().top < limit) { el.classList.add('rv-in'); return false; }
          return true;
        });
      }
      // Time-based throttle (not rAF): rAF is suspended in background/throttled
      // tabs, which would leave sections unrevealed when the user returns.
      var last = 0, queued = false;
      function onScroll() {
        var now = Date.now();
        if (now - last > 90) { last = now; check(); }
        else if (!queued) {
          queued = true;
          setTimeout(function () { queued = false; last = Date.now(); check(); }, 110);
        }
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') check();
      });
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          var hit = false;
          entries.forEach(function (en) { if (en.isIntersecting) hit = true; });
          if (hit) check();
        }, { rootMargin: '0px 0px -6% 0px' });
        els.forEach(function (el) { io.observe(el); });
      }
      setTimeout(check, 60);
      setTimeout(check, 1500);
    })();

    // Case carousels (before-after page): collage first, then every angle.
    // Slides 2+ are lazy AND display:none — browsers never fetch hidden lazy
    // images, so we warm each card's photos when it nears the viewport (IO)
    // or on first touch, and show a loading state until the slide arrives.
    document.querySelectorAll('.bac').forEach(function (card) {
      var slides = Array.prototype.slice.call(card.querySelectorAll('.bac-slide'));
      var dots = Array.prototype.slice.call(card.querySelectorAll('.bac-dot'));
      if (slides.length < 2) return;
      var viewer = card.querySelector('.bac-viewer');
      var current = 0;
      var warmed = false;

      function warm() {
        if (warmed) return;
        warmed = true;
        slides.forEach(function (s) {
          if (s.loading === 'lazy') s.loading = 'eager';
          if (!s.complete) { var pre = new Image(); pre.src = s.src; }
        });
      }

      function show(next) {
        warm();
        var n = (next + slides.length) % slides.length;
        slides[current].classList.remove('active');
        dots[current].removeAttribute('aria-current');
        var target = slides[n];
        target.classList.add('active');
        dots[n].setAttribute('aria-current', 'true');
        current = n;
        if (!target.complete) {
          viewer.classList.add('is-loading');
          target.addEventListener('load', function done() {
            viewer.classList.remove('is-loading');
            target.removeEventListener('load', done);
          });
        } else {
          viewer.classList.remove('is-loading');
        }
      }

      card.querySelector('.bac-prev').addEventListener('click', function () { show(current - 1); });
      card.querySelector('.bac-next').addEventListener('click', function () { show(current + 1); });
      dots.forEach(function (dot, i) { dot.addEventListener('click', function () { show(i); }); });

      // Swipe on touch
      var x0 = null;
      viewer.addEventListener('touchstart', function (e) { warm(); x0 = e.touches[0].clientX; }, { passive: true });
      viewer.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
        x0 = null;
      }, { passive: true });
      viewer.addEventListener('pointerenter', warm, { once: true });

      // Warm as the card approaches the viewport
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.isIntersecting) { warm(); io.disconnect(); } });
        }, { rootMargin: '400px 0px' });
        io.observe(card);
      }
    });
