/* ==========================================================================
   BINKOD Tech homepage — home.js
   Homepage-only client-side behavior. This file is loaded by index.html
   alone, so product pages, the blogless static site and every shared
   component behave exactly as before.

   1. Header state — the header is transparent over the hero and settles
      into a glass surface once the visitor scrolls (adds html.home-scrolled,
      which css/home.css styles). Uses one passive, requestAnimationFrame-
      throttled scroll listener that touches the DOM only when the state
      actually flips.
   2. Scroll reveal — elements marked with data-home-reveal fade in as they
      enter the viewport. All content exists in the HTML and is fully
      visible without JavaScript: the inline <head> marker (html.home-js) is
      removed by index.html after three seconds unless this script reports
      readiness (html.home-reveal-ready), so a missing or failing script can
      never leave sections hidden.
    3. Hero spotlight — the compact card floating beside the hero device
      rotates through three short slides. It pauses while hovered, when the
      tab is hidden, and whenever the card is off screen. The copy column
      above carries the same Google Play link as real, keyboard-reachable
      content, so the rotating card stays decorative (tabindex="-1").
    4. Colour theme — the light/dark switch in the header. Light is the
      default; the saved choice lives in localStorage (binkod.theme) and is
      applied before first paint by an inline <head> script, so the page
      never flashes the wrong theme. The toggle swaps only the data-theme
      attribute the stylesheet keys off.

   No analytics, no trackers, no backend calls, no dependencies.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ------------------------------------------------------------------ */
  /* 1. Header state                                                     */
  /* ------------------------------------------------------------------ */
  var HEADER_SCROLLED_AT = 24; /* px of scroll before the glass surface */

  function setupHeader() {
    var header = document.getElementById('home-header');
    if (!header) {
      return;
    }

    var scrolled = false;
    var framePending = false;

    function apply(value) {
      var next = value > HEADER_SCROLLED_AT;
      if (next === scrolled) {
        return;
      }
      scrolled = next;
      root.classList.toggle('home-scrolled', scrolled);
    }

    function onScroll() {
      if (framePending) {
        return;
      }
      framePending = true;
      window.requestAnimationFrame(function () {
        framePending = false;
        apply(window.scrollY || root.scrollTop || 0);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    /* Browsers can restore a scroll position on load without firing a
       scroll event — settle the initial state right away. */
    apply(window.scrollY || root.scrollTop || 0);
  }

  /* ------------------------------------------------------------------ */
  /* 2. Scroll reveal                                                    */
  /* ------------------------------------------------------------------ */
  function setupReveal() {
    var targets = document.querySelectorAll('[data-home-reveal]');
    var i;

    function revealAll() {
      for (i = 0; i < targets.length; i++) {
        targets[i].classList.add('home-in');
      }
      root.classList.add('home-reveal-ready');
    }

    if (!targets.length) {
      root.classList.add('home-reveal-ready');
      return;
    }

    var prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Reduced motion (or no IntersectionObserver): show everything
       immediately — css/home.css also keeps [data-home-reveal] fully
       visible under prefers-reduced-motion, so this is belt and braces. */
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    try {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('home-in');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
      );

      for (i = 0; i < targets.length; i++) {
        observer.observe(targets[i]);
      }

      /* Confirms to the inline <head> marker that reveal handling is live,
         so it keeps html.home-js and does not force everything visible. */
      root.classList.add('home-reveal-ready');
    } catch (error) {
      revealAll();
    }
  }

  /* ------------------------------------------------------------------ */
  /* 3. Hero spotlight — rotating area card                              */
  /* ------------------------------------------------------------------ */
  var SPOT_INTERVAL = 2800; /* ms per slide */

  function setupSpotlight() {
    var card = document.getElementById('home-spotlight');
    if (!card) {
      return;
    }

    var lines = card.querySelectorAll('.home-spot__line');
    var icons = card.querySelectorAll('.home-spot__icon');
    var dots = card.querySelectorAll('.home-spot__dots i');
    if (lines.length < 2) {
      return;
    }

    /* global.js stamps [data-play-link] with the verified Play Store URL
       before this script runs; it doubles as the restore target whenever
       the first slide becomes active again. */
    var playHref = card.getAttribute('href') || '/family-path-locator/';
    var index = 0;
    var timer = null;
    var inView = true;
    var hovered = false;

    function apply(next) {
      for (var n = 0; n < lines.length; n++) {
        var active = n === next;
        lines[n].classList.toggle('is-active', active);
        if (icons[n]) {
          icons[n].classList.toggle('is-active', active);
        }
        if (dots[n]) {
          dots[n].classList.toggle('is-active', active);
        }
      }
      card.setAttribute('href', lines[next].getAttribute('data-href') || playHref);
    }

    function tick() {
      index = (index + 1) % lines.length;
      apply(index);
    }

    function start() {
      if (!timer) {
        timer = window.setInterval(tick, SPOT_INTERVAL);
      }
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    /* Run only while the card is on screen, not hovered and the tab is
       visible — reading a slide should never be interrupted. */
    function sync() {
      if (inView && !hovered && !document.hidden) {
        start();
      } else {
        stop();
      }
    }

    card.addEventListener('pointerenter', function () {
      hovered = true;
      sync();
    });
    card.addEventListener('pointerleave', function () {
      hovered = false;
      sync();
    });
    document.addEventListener('visibilitychange', sync);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        sync();
      }, { threshold: 0.4 }).observe(card);
    } else {
      sync();
    }
  }

  /* ------------------------------------------------------------------ */
  /* 4. Colour theme — light/dark toggle                                 */
  /* ------------------------------------------------------------------ */
  var THEME_KEY = 'binkod.theme';
  var THEME_COLOR = { dark: '#04060e', light: '#f4f7fc' };

  function setupTheme() {
    var buttons = document.querySelectorAll('[data-theme-choice]');
    if (!buttons.length) {
      return;
    }

    var meta = document.querySelector('meta[name="theme-color"]');

    function current() {
      return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function apply(theme) {
      root.setAttribute('data-theme', theme);
      if (meta) {
        meta.setAttribute('content', THEME_COLOR[theme]);
      }
      for (var n = 0; n < buttons.length; n++) {
        var choice = buttons[n].getAttribute('data-theme-choice');
        buttons[n].setAttribute('aria-pressed', String(choice === theme));
      }
    }

    function save(theme) {
      try {
        window.localStorage.setItem(THEME_KEY, theme);
      } catch (error) {
        /* Storage unavailable (private mode, blocked cookies) — the choice
           still applies for this visit. */
      }
    }

    function onClick(event) {
      var theme = event.currentTarget.getAttribute('data-theme-choice') === 'light' ? 'light' : 'dark';
      apply(theme);
      save(theme);
    }

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', onClick);
    }

    /* Sync button state with whatever the inline <head> boot script set
       before this script ran. */
    apply(current());
  }

  setupHeader();
  setupReveal();
  setupSpotlight();
  setupTheme();
})();
