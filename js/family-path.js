/* ==========================================================================
   Family Path Locator — family-path.js
   Family Path-specific client-side behavior.

   1. Scroll-reveal enhancement for the homepage: elements marked with
      data-reveal (block) or data-reveal-group (staggered children) fade in
      as they enter the viewport. All content exists in the HTML and remains
      fully readable without JavaScript.
   2. Hero screenshot carousel: a restrained, automatic fade slideshow inside
      the phone frame with pause/play and dot controls. Without JavaScript
      the first slide stays visible (it carries is-active in the HTML) and
      the controls stay hidden (they are gated on the html .js class). Under
      prefers-reduced-motion the slideshow does not auto-rotate until the
      visitor explicitly presses play.
   3. Feature tabs inside the phone screen: each compact tab selects the
      screenshot it maps to, and the selection stays synchronised with the
      slider in both directions (an already-pressed tab matching the visible
      slide wins, so a clicked tab is never immediately deselected). Without
      JavaScript the tabs remain as static, readable labels.

   No analytics, no trackers, no backend calls.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;

  /* ------------------------------------------------------------------ */
  /* 1. Scroll reveal                                                    */
  /* ------------------------------------------------------------------ */
  function setupReveal() {
    var targets = document.querySelectorAll('[data-reveal], [data-reveal-group]');

    function revealAll() {
      for (var i = 0; i < targets.length; i++) {
        targets[i].classList.add('is-revealed');
      }
      root.classList.add('is-reveal-ready');
    }

    if (!targets.length) {
      root.classList.add('is-reveal-ready');
      return;
    }

    var prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -8% 0px' }
    );

    for (var j = 0; j < targets.length; j++) {
      observer.observe(targets[j]);
    }

    root.classList.add('is-reveal-ready');
  }

  /* ------------------------------------------------------------------ */
  /* 2. Hero screenshot carousel                                         */
  /* ------------------------------------------------------------------ */
  var CAROUSEL_INTERVAL = 5000;

  function initCarousel(carousel) {
    var slides = carousel.querySelectorAll('.fp-carousel__slide');
    var dots = carousel.querySelectorAll('[data-carousel-dot]');
    var toggle = carousel.querySelector('[data-carousel-pause]');

    if (slides.length < 2) {
      return;
    }

    /* The status bar, identity card, slider and feature tabs share the phone
       screen: hover/focus pauses and the tab synchronisation span the whole
       frame, not just the slider element. */
    var screenEl = carousel.parentNode;
    var scope = screenEl || carousel;
    var tabs = screenEl ? screenEl.querySelectorAll('[data-feature-tab]') : [];

    var index = 0;
    var timer = null;
    var userPaused = false; /* explicit pause via the toggle */
    var motionOptIn = false; /* explicit play pressed under reduced motion */
    var pointerInside = false;
    var focusInside = false;

    var reduceQuery =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

    function prefersReducedMotion() {
      return !!(reduceQuery && reduceQuery.matches);
    }

    function show(next) {
      index = (next + slides.length) % slides.length;
      var i;
      for (i = 0; i < slides.length; i++) {
        slides[i].classList.toggle('is-active', i === index);
      }
      for (i = 0; i < dots.length; i++) {
        if (i === index) {
          dots[i].classList.add('is-active');
          dots[i].setAttribute('aria-current', 'true');
        } else {
          dots[i].classList.remove('is-active');
          dots[i].removeAttribute('aria-current');
        }
      }
      syncTabs(index);
    }

    /* Keep the feature tabs in step with the visible slide: a tab that is
       already pressed and maps to this slide keeps its selection (so a
       clicked tab wins over the default), otherwise the first tab mapping to
       the slide is selected — or none, when no tab maps to it (the family
       overview opening slide). */
    function syncTabs(next) {
      if (!tabs.length) {
        return;
      }
      var firstMatch = -1;
      var keepPressed = false;
      var t;
      for (t = 0; t < tabs.length; t++) {
        if (tabs[t].getAttribute('data-slide') === String(next)) {
          if (firstMatch < 0) {
            firstMatch = t;
          }
          if (tabs[t].getAttribute('aria-pressed') === 'true') {
            keepPressed = true;
          }
        }
      }
      for (t = 0; t < tabs.length; t++) {
        var matches = tabs[t].getAttribute('data-slide') === String(next);
        var selected =
          matches &&
          (keepPressed
            ? tabs[t].getAttribute('aria-pressed') === 'true'
            : t === firstMatch);
        tabs[t].setAttribute('aria-pressed', selected ? 'true' : 'false');
      }
    }

    /* Auto-rotation stops for: explicit pause, pointer hover, focus inside
       the phone screen, a hidden tab, reduced motion (unless the visitor
       pressed play). */
    function shouldAutoPlay() {
      if (userPaused || pointerInside || focusInside) {
        return false;
      }
      if (document.visibilityState === 'hidden') {
        return false;
      }
      if (prefersReducedMotion() && !motionOptIn) {
        return false;
      }
      return true;
    }

    /* The toggle reflects the explicit state only — transient hover/focus
       pauses are not announced on the button. */
    function isTogglePaused() {
      return userPaused || (prefersReducedMotion() && !motionOptIn);
    }

    function syncToggle() {
      if (!toggle) {
        return;
      }
      var paused = isTogglePaused();
      toggle.setAttribute('aria-pressed', paused ? 'true' : 'false');
      toggle.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    }

    function stop() {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      if (shouldAutoPlay()) {
        timer = window.setInterval(function () {
          show(index + 1);
        }, CAROUSEL_INTERVAL);
      }
    }

    function refresh() {
      start();
      syncToggle();
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        if (isTogglePaused()) {
          userPaused = false;
          motionOptIn = true; /* explicit choice wins over reduced motion */
        } else {
          userPaused = true;
          motionOptIn = false;
        }
        refresh();
      });
    }

    var d;
    for (d = 0; d < dots.length; d++) {
      (function (dot, position) {
        dot.addEventListener('click', function () {
          show(position);
          refresh();
        });
      })(dots[d], d);
    }

    /* Feature tabs: jump the slider to the feature's screenshot. The clicked
       tab is pre-selected so syncTabs inside show() keeps it pressed (an
       already-pressed matching tab wins over the first-match default). */
    var t;
    for (t = 0; t < tabs.length; t++) {
      (function (tab) {
        tab.addEventListener('click', function () {
          var target = parseInt(tab.getAttribute('data-slide'), 10);
          if (isNaN(target) || target < 0 || target >= slides.length) {
            return;
          }
          for (var k = 0; k < tabs.length; k++) {
            tabs[k].setAttribute('aria-pressed', tabs[k] === tab ? 'true' : 'false');
          }
          show(target);
          refresh();
        });
      })(tabs[t]);
    }

    scope.addEventListener('mouseenter', function () {
      pointerInside = true;
      refresh();
    });

    scope.addEventListener('mouseleave', function () {
      pointerInside = false;
      refresh();
    });

    scope.addEventListener('focusin', function () {
      focusInside = true;
      refresh();
    });

    scope.addEventListener('focusout', function () {
      window.setTimeout(function () {
        focusInside = scope.contains(document.activeElement);
        refresh();
      }, 0);
    });

    document.addEventListener('visibilitychange', refresh);

    if (reduceQuery) {
      if (reduceQuery.addEventListener) {
        reduceQuery.addEventListener('change', refresh);
      } else if (reduceQuery.addListener) {
        reduceQuery.addListener(refresh);
      }
    }

    show(0);
    refresh();
  }

  function setupCarousels() {
    var carousels = document.querySelectorAll('[data-carousel]');
    for (var i = 0; i < carousels.length; i++) {
      initCarousel(carousels[i]);
    }
  }

  setupReveal();
  setupCarousels();
})();
