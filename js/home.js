/* ==========================================================================
   BINKOD Tech — home.js
   Homepage-only behaviour:
   1. Scroll reveal (content stays visible if JavaScript fails).
   2. The BINKOD Tech blog rail: native horizontal scrolling, touch swipe,
      arrow controls and keyboard support. No autoplay and no dependencies.
   3. The decorative hero phone slider: one app screen at a time, paused
      off-screen, in a hidden tab and for reduced-motion visitors.
   4. Randomised technology labels on the hero technology orbit.
   5. The root-only Device Matrix promotion: a floating app icon and an
      on-demand ticket popup, both injected here so no other page is affected.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* 1. Scroll reveal                                                    */
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

    if (reducedMotion || !('IntersectionObserver' in window)) {
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

      root.classList.add('home-reveal-ready');
    } catch (error) {
      revealAll();
    }
  }

  /* ------------------------------------------------------------------ */
  /* 2. Blog rail                                                        */
  /* ------------------------------------------------------------------ */
  function setupBlogRail() {
    var slider = document.querySelector('[data-blog-slider]');
    if (!slider) {
      return;
    }

    var viewport = slider.querySelector('[data-blog-viewport]');
    var previous = slider.querySelector('[data-blog-prev]');
    var next = slider.querySelector('[data-blog-next]');
    if (!viewport) {
      return;
    }

    var framePending = false;

    function maxScroll() {
      return viewport.scrollWidth - viewport.clientWidth;
    }

    function updateControls() {
      var left = Math.max(0, viewport.scrollLeft || 0);
      var max = maxScroll();
      if (previous) {
        previous.disabled = left <= 2;
      }
      if (next) {
        next.disabled = left >= max - 2;
      }
    }

    function onScroll() {
      if (framePending) {
        return;
      }
      framePending = true;
      window.requestAnimationFrame(function () {
        framePending = false;
        updateControls();
      });
    }

    function step(direction) {
      var firstCard = viewport.querySelector('.post-card');
      if (!firstCard) {
        return;
      }

      var styles = window.getComputedStyle(viewport);
      var gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      var amount = firstCard.getBoundingClientRect().width + gap;
      var max = maxScroll();
      var target = viewport.scrollLeft + direction * amount;

      if (target < 0) {
        target = 0;
      }
      if (target > max) {
        target = max;
      }

      if ('scrollBehavior' in root.style) {
        viewport.scrollTo({
          left: target,
          behavior: reducedMotion ? 'auto' : 'smooth'
        });
      } else {
        viewport.scrollLeft = target;
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        step(-1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        step(1);
      });
    }

    viewport.addEventListener('scroll', onScroll, { passive: true });
    viewport.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        step(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        step(-1);
      }
    });

    window.addEventListener('resize', updateControls);
    updateControls();
  }

  /* ------------------------------------------------------------------ */
  /* 3. Hero app slider                                                  */
  /* ------------------------------------------------------------------ */
  function setupHeroShowcase() {
    var showcase = document.querySelector('[data-hero-showcase]');
    if (!showcase) {
      return;
    }

    var slides = showcase.querySelectorAll('[data-hero-slide]');
    if (slides.length < 2 || reducedMotion) {
      return;
    }

    var current = 0;
    var timer = null;
    var visible = true;

    function showNext() {
      slides[current].classList.remove('is-active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('is-active');
    }

    function start() {
      if (timer !== null || !visible || document.hidden) {
        return;
      }
      timer = window.setInterval(showNext, 4600);
    }

    function stop() {
      if (timer === null) {
        return;
      }
      window.clearInterval(timer);
      timer = null;
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) {
          start();
        } else {
          stop();
        }
      }, { rootMargin: '120px 0px' });
      observer.observe(showcase);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    start();
  }

  /* ------------------------------------------------------------------ */
  /* 4. Random technology labels on the hero tech orbit                  */
  /* ------------------------------------------------------------------ */
  function setupOrbitLabels() {
    var labels = document.querySelectorAll('[data-orbit-label]');
    if (!labels.length || reducedMotion) {
      return;
    }

    var pool = [
      '.NET',
      'Flutter',
      'Kotlin',
      'Jetpack Compose',
      'React',
      'Node.js',
      'TypeScript',
      'Python',
      'Firebase',
      'Cloud APIs',
      'SQL',
      'Git'
    ];
    var timer = null;

    function pickLabel(used) {
      var available = [];
      var i;
      for (i = 0; i < pool.length; i++) {
        if (used.indexOf(pool[i]) === -1) {
          available.push(pool[i]);
        }
      }
      if (!available.length) {
        return pool[Math.floor(Math.random() * pool.length)];
      }
      return available[Math.floor(Math.random() * available.length)];
    }

    function rotate() {
      var used = [];
      var i;
      for (i = 0; i < labels.length; i++) {
        used.push(labels[i].textContent);
      }

      for (i = 0; i < labels.length; i++) {
        (function (label) {
          var next = pickLabel(used);
          used.push(next);
          label.classList.add('is-swapping');
          window.setTimeout(function () {
            label.textContent = next;
            label.classList.remove('is-swapping');
          }, 180);
        })(labels[i]);
      }
    }

    function start() {
      if (timer !== null || document.hidden) {
        return;
      }
      timer = window.setInterval(rotate, 3400);
    }

    function stop() {
      if (timer === null) {
        return;
      }
      window.clearInterval(timer);
      timer = null;
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    start();
  }

  /* ------------------------------------------------------------------ */
  /* 5. Device Matrix promotion                                          */
  /* ------------------------------------------------------------------ */
  var DEVICE_MATRIX_PLAY_URL =
    'https://play.google.com/store/apps/details?id=com.binkod.devicematrix';

  /* Official Google Play icon, identical to the Play buttons rendered in
     the site's HTML. */
  var DM_PLAY_ICON =
    '<svg class="btn__play-icon" viewBox="0 0 92 101" aria-hidden="true" focusable="false">' +
    '<path fill="#EA4335" d="M42.7141006,48.2030918 L0.378682653,92.5574864 C1.34201801,95.9718278 3.8294422,98.7491902 7.11735265,100.081627 C10.4052631,101.414063 14.1244454,101.151948 17.1929731,99.3715328 L64.8282049,72.2415332 L42.7141006,48.2030918 Z"/>' +
    '<path fill="#FBBC04" d="M85.5227162,40.6634756 L64.9228444,28.8650805 L41.7361587,49.2125801 L65.0174839,72.1784402 L85.4596231,60.5062311 C89.1508724,58.5735708 91.4640104,54.7514463 91.4640104,50.5848534 C91.4640104,46.4182604 89.1508724,42.5961359 85.4596231,40.6634756 L85.5227162,40.6634756 Z"/>' +
    '<path fill="#4285F4" d="M0.378682653,8.39139474 C0.122773783,9.33743897 -0.00455672329,10.3136395 3.58642309e-13,11.2936738 L3.58642309e-13,89.6552074 C0.00268414143,90.6347753 0.129891998,91.6100356 0.378682653,92.5574864 L44.1652401,49.3387662 L0.378682653,8.39139474 Z"/>' +
    '<path fill="#34A853" d="M43.0295657,50.4744406 L64.9228444,28.8650805 L17.3507056,1.60889485 C15.5610268,0.560731677 13.5255296,0.005596085 11.4515081,0 C6.30402332,-0.0101779895 1.77867801,3.40639326 0.378682653,8.35984823 L43.0295657,50.4744406 Z"/></svg>';

  var DM_ICON_HARDWARE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<rect x="5" y="5" width="14" height="14" rx="2.5"></rect>' +
    '<rect x="9" y="9" width="6" height="6" rx="1"></rect>' +
    '<path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"></path></svg>';

  var DM_ICON_BATTERY =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<rect x="2.5" y="7" width="16" height="10" rx="2.5"></rect>' +
    '<path d="M21.5 10.5v3"></path>' +
    '<path d="M6 12h2.4l1.2-2.4 1.8 4.8 1.2-2.4h2.4"></path></svg>';

  var DM_ICON_STORAGE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<rect x="3" y="4" width="18" height="7" rx="2"></rect>' +
    '<rect x="3" y="13" width="18" height="7" rx="2"></rect>' +
    '<path d="M7 7.5h.01M7 16.5h.01"></path></svg>';

  function setupDeviceMatrixPromo() {
    /* Initialization guard: one trigger and one popup per page. */
    if (document.getElementById('dm-promo-fab')) {
      return;
    }

    var trigger = document.createElement('button');
    trigger.id = 'dm-promo-fab';
    trigger.className = 'dm-promo-fab';
    trigger.type = 'button';
    trigger.setAttribute('aria-label', 'Open Device Matrix promotion');
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', 'dm-promo');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML =
      '<img src="/public/assets/device-matrix/logo/dm-logo.svg" alt="" width="64" height="64" decoding="async">';

    var popup = document.createElement('div');
    popup.id = 'dm-promo';
    popup.className = 'dm-promo';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'false');
    popup.setAttribute('aria-labelledby', 'dm-promo-title');
    popup.setAttribute('aria-describedby', 'dm-promo-desc');
    popup.setAttribute('aria-hidden', 'true');
    popup.innerHTML =
      '<div class="dm-promo__ticket">' +
      '<div class="dm-promo__head">' +
      '<span class="dm-promo__logo">' +
      '<img src="/public/assets/device-matrix/logo/dm-logo.svg" alt="" width="64" height="64" decoding="async">' +
      '</span>' +
      '<span class="dm-promo__kicker">New on Google Play</span>' +
      '</div>' +
      '<h2 class="dm-promo__title" id="dm-promo-title">Device Matrix is Now Available!</h2>' +
      '<p class="dm-promo__desc" id="dm-promo-desc">Get detailed device information, hardware insights, battery health and more, right on your phone.</p>' +
      '<ul class="dm-promo__features">' +
      '<li class="dm-promo__feature">' +
      '<span class="dm-promo__feature-icon">' + DM_ICON_HARDWARE + '</span>' +
      '<span class="dm-promo__feature-copy"><strong>Hardware insights</strong><span>Processor, memory and display</span></span>' +
      '</li>' +
      '<li class="dm-promo__feature">' +
      '<span class="dm-promo__feature-icon">' + DM_ICON_BATTERY + '</span>' +
      '<span class="dm-promo__feature-copy"><strong>Battery health</strong><span>Charge status and usage</span></span>' +
      '</li>' +
      '<li class="dm-promo__feature">' +
      '<span class="dm-promo__feature-icon">' + DM_ICON_STORAGE + '</span>' +
      '<span class="dm-promo__feature-copy"><strong>Storage at a glance</strong><span>Used and free space</span></span>' +
      '</li>' +
      '</ul>' +
      '</div>' +
      '<div class="dm-promo__footer">' +
      '<a class="btn btn--light dm-promo__cta" href="' + DEVICE_MATRIX_PLAY_URL + '" target="_blank" rel="noopener noreferrer">' +
      DM_PLAY_ICON +
      '<span>Get It on Google Play</span>' +
      '</a>' +
      '</div>' +
      '<button class="dm-promo__close" type="button" aria-label="Close Device Matrix promotion">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" focusable="false">' +
      '<path d="M6 6l12 12M18 6L6 18"></path></svg>' +
      '</button>';

    document.body.appendChild(trigger);
    document.body.appendChild(popup);

    var closeButton = popup.querySelector('.dm-promo__close');
    var ticket = popup.querySelector('.dm-promo__ticket');
    var isOpen = false;

    function openPromo() {
      if (isOpen) {
        return;
      }
      isOpen = true;
      if (ticket) {
        ticket.scrollTop = 0;
      }
      popup.setAttribute('aria-hidden', 'false');
      popup.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      closeButton.focus({ preventScroll: true });
    }

    function closePromo(returnFocus) {
      if (!isOpen) {
        return;
      }
      isOpen = false;
      popup.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      if (returnFocus) {
        trigger.focus({ preventScroll: true });
      }
      popup.setAttribute('aria-hidden', 'true');
    }

    trigger.addEventListener('click', function () {
      if (isOpen) {
        closePromo(true);
      } else {
        openPromo();
      }
    });

    closeButton.addEventListener('click', function () {
      closePromo(true);
    });

    /* Following the Play listing also dismisses the ticket. The link keeps
       its normal new-tab behaviour and verified destination. */
    var playLink = popup.querySelector('.dm-promo__cta');
    if (playLink) {
      playLink.addEventListener('click', function () {
        closePromo(true);
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen) {
        closePromo(true);
      }
    });

    document.addEventListener('click', function (event) {
      if (
        isOpen &&
        !popup.contains(event.target) &&
        !trigger.contains(event.target)
      ) {
        closePromo(false);
      }
    });
  }

  setupReveal();
  setupBlogRail();
  setupHeroShowcase();
  setupOrbitLabels();
  setupDeviceMatrixPromo();
})();
