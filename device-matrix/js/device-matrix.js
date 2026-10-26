/* ==========================================================================
   Device Matrix: System Info — device-matrix.js
   Product-specific progressive enhancement.

   1. Scroll reveal for elements marked with data-reveal or data-reveal-group.
      All content is present in the HTML and stays readable without JavaScript.
   2. Applies the single privacy noindex switch from /device-matrix/config.js.
   3. Applies the Google Play URL from /device-matrix/config.js.
   4. Adds the mobile install bar used on Device Matrix pages. It reuses the
      shared install-bar styles and scroll-to-top clearance from global.css.
   5. Adds optional previous/next controls to the screenshot galleries. The
      tracks remain natively scrollable and keyboard reachable without JS.

   No analytics, trackers, dependencies or backend calls.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;

  /* Official Google Play icon — same artwork used by the site's other Play
     buttons. It is decorative because the link text names the destination. */
  var PLAY_ICON_SVG =
    '<svg class="btn__play-icon" viewBox="0 0 92 101" aria-hidden="true" focusable="false">' +
    '<path fill="#EA4335" d="M42.7141006,48.2030918 L0.378682653,92.5574864 C1.34201801,95.9718278 3.8294422,98.7491902 7.11735265,100.081627 C10.4052631,101.414063 14.1244454,101.151948 17.1929731,99.3715328 L64.8282049,72.2415332 L42.7141006,48.2030918 Z"/>' +
    '<path fill="#FBBC04" d="M85.5227162,40.6634756 L64.9228444,28.8650805 L41.7361587,49.2125801 L65.0174839,72.1784402 L85.4596231,60.5062311 C89.1508724,58.5735708 91.4640104,54.7514463 91.4640104,50.5848534 C91.4640104,46.4182604 89.1508724,42.5961359 85.4596231,40.6634756 L85.5227162,40.6634756 Z"/>' +
    '<path fill="#4285F4" d="M0.378682653,8.39139474 C0.122773783,9.33743897 -0.00455672329,10.3136395 3.58642309e-13,11.2936738 L3.58642309e-13,89.6552074 C0.00268414143,90.6347753 0.129891998,91.6100356 0.378682653,92.5574864 L44.1652401,49.3387662 L0.378682653,8.39139474 Z"/>' +
    '<path fill="#34A853" d="M43.0295657,50.4744406 L64.9228444,28.8650805 L17.3507056,1.60889485 C15.5610268,0.560731677 13.5255296,0.005596085 11.4515081,0 C6.30402332,-0.0101779895 1.77867801,3.40639326 0.378682653,8.35984823 L43.0295657,50.4744406 Z"/></svg>';

  /* ------------------------------------------------------------------ */
  /* 1. Scroll reveal                                                    */
  /* ------------------------------------------------------------------ */
  function setupReveal() {
    var targets = document.querySelectorAll('[data-reveal], [data-reveal-group]');

    function revealAll() {
      var i;
      for (i = 0; i < targets.length; i++) {
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

    var j;
    for (j = 0; j < targets.length; j++) {
      observer.observe(targets[j]);
    }

    root.classList.add('is-reveal-ready');
  }

  /* ------------------------------------------------------------------ */
  /* 2. Privacy noindex switch                                           */
  /* ------------------------------------------------------------------ */
  function applyPrivacyIndexing() {
    if (window.DEVICE_MATRIX_PRIVACY_NOINDEX === false) {
      var meta = document.querySelector('[data-dm-privacy-robots]');
      if (meta && meta.parentNode) {
        meta.parentNode.removeChild(meta);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* 3. Google Play links                                                */
  /* ------------------------------------------------------------------ */
  function applyPlayStoreUrl() {
    var url = window.DEVICE_MATRIX_PLAY_STORE_URL;
    var links = document.querySelectorAll('[data-dm-play]');
    var i;

    for (i = 0; i < links.length; i++) {
      if (url) {
        links[i].setAttribute('href', url);
        links[i].setAttribute('target', '_blank');
        links[i].setAttribute('rel', 'noopener noreferrer');
      } else {
        links[i].parentNode.removeChild(links[i]);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* 4. Screenshot galleries                                             */
  /* ------------------------------------------------------------------ */
  function setupGalleries() {
    var galleries = document.querySelectorAll('[data-dm-gallery]');
    var reducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var i;

    for (i = 0; i < galleries.length; i++) {
      (function (gallery) {
        var track = gallery.querySelector('.dm-gallery__track');
        var controls = gallery.querySelector('.dm-gallery__controls');
        var previous = gallery.querySelector('[data-gallery-prev]');
        var next = gallery.querySelector('[data-gallery-next]');
        var firstSlide = track && track.querySelector('.dm-gallery__slide');

        if (!track || !controls || !previous || !next || !firstSlide) {
          return;
        }

        controls.hidden = false;

        function step() {
          var styles = window.getComputedStyle(track);
          var gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
          return firstSlide.getBoundingClientRect().width + gap;
        }

        function updateButtons() {
          var maxScroll = track.scrollWidth - track.clientWidth;
          previous.disabled = track.scrollLeft <= 2;
          next.disabled = track.scrollLeft >= maxScroll - 2;
        }

        function move(direction) {
          track.scrollBy({
            left: step() * direction,
            behavior: reducedMotion ? 'auto' : 'smooth'
          });
        }

        previous.addEventListener('click', function () {
          move(-1);
        });

        next.addEventListener('click', function () {
          move(1);
        });

        var updateFrame = false;
        track.addEventListener(
          'scroll',
          function () {
            if (updateFrame) {
              return;
            }
            updateFrame = true;
            window.requestAnimationFrame(function () {
              updateFrame = false;
              updateButtons();
            });
          },
          { passive: true }
        );

        window.addEventListener('resize', updateButtons);
        updateButtons();
      })(galleries[i]);
    }
  }

  /* ------------------------------------------------------------------ */
  /* 5. Mobile install bar                                               */
  /* ------------------------------------------------------------------ */
  function setupMobileInstallBar() {
    var url = window.DEVICE_MATRIX_PLAY_STORE_URL;

    if (!url || document.getElementById('install-bar')) {
      return;
    }

    var bar = document.createElement('div');
    bar.id = 'install-bar';
    bar.className = 'install-bar';
    bar.innerHTML =
      '<img class="install-bar__icon" src="/public/assets/device-matrix/icons/app-icon.svg" alt="" width="38" height="38">' +
      '<span class="install-bar__text">' +
      '<span class="install-bar__name">Device Matrix</span>' +
      '<span class="install-bar__label">System Info App · Free</span>' +
      '</span>' +
      '<a class="install-bar__cta btn btn--play btn--sm" href="' + url + '"' +
      ' target="_blank" rel="noopener noreferrer" data-dm-play' +
      ' aria-label="Get Device Matrix on Google Play">' +
      PLAY_ICON_SVG +
      'Install</a>';
    document.body.appendChild(bar);

    /* Mark the page so the footer can reserve the bar's height and the
       scroll-to-top button can sit above it. */
    root.classList.add('has-install-bar');

    function syncBarHeight() {
      var height = bar.offsetHeight;
      if (!height) {
        return;
      }
      var value = height + 'px';
      if (root.style.getPropertyValue('--install-bar-h') !== value) {
        root.style.setProperty('--install-bar-h', value);
      }
    }

    syncBarHeight();
    window.addEventListener('resize', syncBarHeight);

    var isVisible = false;
    var framePending = false;
    var threshold = 300;

    function update() {
      framePending = false;
      var scrolled =
        window.scrollY || document.documentElement.scrollTop || 0;
      var shouldShow = scrolled > threshold;
      if (shouldShow === isVisible) {
        return;
      }
      isVisible = shouldShow;
      root.classList.toggle('install-bar-visible', isVisible);
    }

    function onScroll() {
      if (framePending) {
        return;
      }
      framePending = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  }

  setupReveal();
  applyPrivacyIndexing();
  setupGalleries();
  setupMobileInstallBar();
  applyPlayStoreUrl();
})();
