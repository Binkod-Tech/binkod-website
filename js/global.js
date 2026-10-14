/* ==========================================================================
   BINKOD Tech Web — global.js
   Shared site behavior: mobile navigation, the scroll-to-top control, the
   mobile install bar (Family Path Locator), and public link config.
   No libraries, no tracking, no external requests.
   ========================================================================== */
(function () {
  'use strict';

   /* -----------------------------------------------------------------------
      Site configuration — single source of truth for the public Play Store
      listing URL. All [data-play-link] buttons receive this URL, open in a
      new tab (target="_blank"), and use rel="noopener noreferrer".
      ----------------------------------------------------------------------- */
  var SITE_CONFIG = {
    googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.binkod.familypath'
  };

  function setupPlayLinks() {
    var links = document.querySelectorAll('[data-play-link]');
    for (var i = 0; i < links.length; i++) {
      (function (link) {
        if (SITE_CONFIG.googlePlayUrl) {
          link.setAttribute('href', SITE_CONFIG.googlePlayUrl);
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        } else {
          link.setAttribute('aria-disabled', 'true');
          link.addEventListener('click', function (event) {
            event.preventDefault();
          });
        }
      })(links[i]);
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-navigation');
    if (!toggle || !nav) {
      return;
    }

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (
        nav.classList.contains('is-open') &&
        !event.target.closest('.site-header')
      ) {
        setOpen(false);
      }
    });
  }

  /* Closes the root page "Applications" <details> menu on Escape or an
     outside click. The menu still works without JavaScript — this only
     adds expected dropdown polish. */
  function setupAppMenus() {
    var menus = document.querySelectorAll('details.nav-apps');
    if (!menus.length) {
      return;
    }

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') {
        return;
      }
      for (var i = 0; i < menus.length; i++) {
        if (menus[i].open) {
          menus[i].removeAttribute('open');
          var summary = menus[i].querySelector('summary');
          if (summary) {
            summary.focus();
          }
        }
      }
    });

    document.addEventListener('click', function (event) {
      for (var i = 0; i < menus.length; i++) {
        if (menus[i].open && !event.target.closest('details.nav-apps')) {
          menus[i].removeAttribute('open');
        }
      }
    });
  }

  /* -----------------------------------------------------------------------
     Scroll-to-top control — a single fixed button appended to <body> so no
     HTML page has to change. It stays hidden near the top of the page and
     appears once the visitor scrolls past SCROLL_TOP_THRESHOLD pixels. It is
     a real <button type="button"> with an accessible name, so activating it
     scrolls the current page back to the top without navigating, reloading or
     changing the URL. Smooth scrolling is only requested when the visitor has
     not asked for reduced motion; otherwise the jump is immediate.

     js/global.js is loaded on every page, so one implementation serves the
     Family Path Locator pages, the BINKOD ABC page, the root showcase and
     the 404 page. On short pages the threshold is simply never reached.
     ----------------------------------------------------------------------- */
  var SCROLL_TOP_THRESHOLD = 400;
  var INSTALL_BAR_THRESHOLD = 300;

  /* -----------------------------------------------------------------------
     Shared scroll plumbing — one passive listener and at most one state
     check per animation frame for every fixed scroll-driven control (the
     scroll-to-top button and the mobile install bar). Features register
     with subscribeToScroll(); the window listener is attached only once,
     however many controls the page uses, so no feature adds a second
     scroll listener of its own.
     ----------------------------------------------------------------------- */
  var scrollSubscribers = [];
  var scrollFramePending = false;

  function runScrollSubscribers() {
    scrollFramePending = false;
    var scrolled = window.scrollY || document.documentElement.scrollTop || 0;
    for (var i = 0; i < scrollSubscribers.length; i++) {
      scrollSubscribers[i](scrolled);
    }
  }

  function onScroll() {
    if (scrollFramePending) {
      return;
    }
    scrollFramePending = true;
    window.requestAnimationFrame(runScrollSubscribers);
  }

  function subscribeToScroll(handler) {
    if (scrollSubscribers.length === 0) {
      window.addEventListener('scroll', onScroll, { passive: true });
    }
    scrollSubscribers.push(handler);
  }

  function currentScrollY() {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }

  function setupScrollToTop() {
    /* Initialization guard: if this runs more than once, do not create a
       second control and do not attach a second scroll listener. */
    if (document.getElementById('scroll-top')) {
      return;
    }

    var button = document.createElement('button');
    button.id = 'scroll-top';
    button.className = 'scroll-top';
    button.type = 'button';
    button.setAttribute('aria-label', 'Back to top');
    button.innerHTML =
      '<svg class="scroll-top__icon" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<line x1="12" y1="19" x2="12" y2="5"></line>' +
      '<polyline points="5 12 12 5 19 12"></polyline>' +
      '</svg>';
    document.body.appendChild(button);

    var isVisible = false;

    /* Only touch the DOM when the visibility state actually changes.
       scrolled is supplied by the shared scroll subscriber. */
    function update(scrolled) {
      var shouldShow = scrolled > SCROLL_TOP_THRESHOLD;
      if (shouldShow === isVisible) {
        return;
      }
      isVisible = shouldShow;
      button.classList.toggle('is-visible', isVisible);
    }

    button.addEventListener('click', function () {
      var prefersReducedMotion =
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      /* CSS sets html { scroll-behavior: smooth }, but an explicit request
         here would override the reduced-motion CSS rule, so the preference
         is checked in JavaScript as well. Focus is left where it is. */
      if (!prefersReducedMotion && 'scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    });

    /* Register with the single shared scroll listener for the page. */
    subscribeToScroll(update);

    /* Browsers can restore a scroll position on load without firing a
       scroll event — settle the initial state right away. */
    update(currentScrollY());
  }

  /* -----------------------------------------------------------------------
     Mobile install bar — a compact fixed bar at the bottom of the viewport
     on Family Path Locator pages below 48em (the width cap lives in the
     .install-bar media queries in css/global.css). Like the scroll-to-top
     control it is injected here so no page HTML changes.

     Scope and safety rules:
       - Never created unless SITE_CONFIG holds the verified Play Store URL.
       - Never created off the Family Path Locator routes, so the root
         showcase, BINKOD ABC (no approved listing) and the 404 page are
         excluded by construction.
       - html.has-install-bar (added once) lets CSS reserve the bar's real
         height in the footer from first paint, so revealing the bar cannot
         shift layout or cover footer/legal links.
       - html.install-bar-visible (toggled below) reveals the bar past
         INSTALL_BAR_THRESHOLD and, in CSS, lifts the scroll-to-top control
         so the two fixed controls never overlap.
       - Scroll state arrives through the same single shared listener used
         by the scroll-to-top button; no second listener is added.
       - The CTA carries data-play-link, so setupPlayLinks() stamps the
         verified URL, target="_blank" and rel="noopener noreferrer" on it
         exactly like every other Play button on the site.
     ----------------------------------------------------------------------- */

  /* Official Google Play icon — identical markup to the existing Play
     buttons rendered in the site's HTML. */
  var PLAY_ICON_SVG =
    '<svg class="btn__play-icon" viewBox="0 0 92 101" aria-hidden="true" focusable="false">' +
    '<path fill="#EA4335" d="M42.7141006,48.2030918 L0.378682653,92.5574864 C1.34201801,95.9718278 3.8294422,98.7491902 7.11735265,100.081627 C10.4052631,101.414063 14.1244454,101.151948 17.1929731,99.3715328 L64.8282049,72.2415332 L42.7141006,48.2030918 Z"/>' +
    '<path fill="#FBBC04" d="M85.5227162,40.6634756 L64.9228444,28.8650805 L41.7361587,49.2125801 L65.0174839,72.1784402 L85.4596231,60.5062311 C89.1508724,58.5735708 91.4640104,54.7514463 91.4640104,50.5848534 C91.4640104,46.4182604 89.1508724,42.5961359 85.4596231,40.6634756 L85.5227162,40.6634756 Z"/>' +
    '<path fill="#4285F4" d="M0.378682653,8.39139474 C0.122773783,9.33743897 -0.00455672329,10.3136395 3.58642309e-13,11.2936738 L3.58642309e-13,89.6552074 C0.00268414143,90.6347753 0.129891998,91.6100356 0.378682653,92.5574864 L44.1652401,49.3387662 L0.378682653,8.39139474 Z"/>' +
    '<path fill="#34A853" d="M43.0295657,50.4744406 L64.9228444,28.8650805 L17.3507056,1.60889485 C15.5610268,0.560731677 13.5255296,0.005596085 11.4515081,0 C6.30402332,-0.0101779895 1.77867801,3.40639326 0.378682653,8.35984823 L43.0295657,50.4744406 Z"/></svg>';

  function setupInstallBar() {
    /* No verified listing URL -> no bar is created at all. */
    if (!SITE_CONFIG.googlePlayUrl) {
      return;
    }
    /* Family Path Locator site only: excludes the root showcase, BINKOD
       ABC and the 404 page. */
    if (!/^\/family-path-locator(\/|$)/.test(window.location.pathname)) {
      return;
    }
    /* Initialization guard: one bar per page even if this runs twice. */
    if (document.getElementById('install-bar')) {
      return;
    }

    var bar = document.createElement('div');
    bar.id = 'install-bar';
    bar.className = 'install-bar';
    bar.innerHTML =
      '<img class="install-bar__icon" src="/public/assets/family-path/icons/familypath.png" alt="" width="38" height="38">' +
      '<span class="install-bar__text">' +
      '<span class="install-bar__name">Family Path Locator</span>' +
      '<span class="install-bar__label">Install on Android</span>' +
      '</span>' +
      '<a class="install-bar__cta btn btn--play btn--sm" data-play-link' +
      ' aria-label="Get Family Path Locator on Google Play">' +
      PLAY_ICON_SVG +
      'Install</a>';
    document.body.appendChild(bar);

    /* Static marker: CSS uses it to reserve the bar's height inside the
       footer from first paint, so nothing shifts when the bar appears. */
    document.documentElement.classList.add('has-install-bar');

    /* Keep the reserved space equal to the bar's real rendered height
       (enlarged text, orientation changes, browser zoom). */
    function syncBarHeight() {
      var height = bar.offsetHeight;
      if (!height) {
        return;
      }
      var value = height + 'px';
      if (document.documentElement.style.getPropertyValue('--install-bar-h') !== value) {
        document.documentElement.style.setProperty('--install-bar-h', value);
      }
    }
    syncBarHeight();
    window.addEventListener('resize', syncBarHeight);

    var isVisible = false;

    /* Reveal past INSTALL_BAR_THRESHOLD; the html class also lifts the
       scroll-to-top control above the bar in CSS. */
    function update(scrolled) {
      var shouldShow = scrolled > INSTALL_BAR_THRESHOLD;
      if (shouldShow === isVisible) {
        return;
      }
      isVisible = shouldShow;
      document.documentElement.classList.toggle('install-bar-visible', shouldShow);
    }
    subscribeToScroll(update);
    update(currentScrollY());
  }

  /* setupInstallBar must run before setupPlayLinks so the injected CTA
     receives the verified URL, target and rel like every static button. */
  setupInstallBar();
  setupPlayLinks();
  setupNavigation();
  setupAppMenus();
  setupScrollToTop();
})();
