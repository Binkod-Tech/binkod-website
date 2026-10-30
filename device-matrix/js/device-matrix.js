/* ==========================================================================
   Device Matrix: System Info — device-matrix.js
   Product-specific progressive enhancement.

   1. Scroll reveal for elements marked with data-reveal or data-reveal-group.
      All content is present in the HTML and stays readable without JavaScript.
   2. Applies the single privacy noindex switch from /device-matrix/config.js.
   3. Applies the Google Play URL from /device-matrix/config.js.
   4. Adds the mobile install bar used on Device Matrix pages. It reuses the
      shared install-bar styles and scroll-to-top clearance from global.css.
   5. Builds the Device Matrix screenshot showcase from one shared screen
      map, with Light/Dark switching, arrows, dots, keyboard and touch support.
   6. Alternates the Home hero capture between Light and Dark, with manual
      controls that pause the timer briefly.

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
  /* 4. Screenshot showcase                                              */
  /* ------------------------------------------------------------------ */
  var SHOT_ROOT = '/public/assets/device-matrix/screenshots/';

  /* One shared six-screen set powers both the Features carousel and the
     homepage grid. Copy stays short enough for a card and is based on the
     captures stored in public/assets/device-matrix/screenshots. */
  var SCREENSHOTS = [
    {
      file: '01-home.webp',
      label: 'Home',
      title: 'Home dashboard',
      description:
        'A locally calculated health summary, device facts and live processor, memory, storage and battery tiles in one overview.',
      alt:
        'Device Matrix Home dashboard showing the locally calculated health score, device summary and live processor, memory, storage and battery tiles.',
      /* The newer Dark Home capture has a slightly taller 720 x 1602 frame
         than the other screenshots, so keep its intrinsic ratio explicit. */
      darkWidth: 720,
      darkHeight: 1602,
      points: [
        'Health score is calculated on the phone.',
        'Live tiles refresh while Home is open.',
        'Tiles open their matching detail screens.'
      ]
    },
    {
      file: '02-hardware.webp',
      label: 'Hardware',
      title: 'Hardware hub',
      description:
        'Device and OS, CPU and GPU, thermal, memory, storage, battery, display, camera and sensor tiles grouped in one grid.',
      alt:
        'Device Matrix Hardware hub with tiles for Device and OS, CPU and GPU, Thermal, Memory, Storage, Battery, Display, Camera and Sensors.',
      points: [
        'Device, processor and battery summaries share one hub.',
        'Camera and sensor counts appear before a detail opens.',
        'Every tile opens its matching detail screen.'
      ]
    },
    {
      file: '08-thermal.webp',
      label: 'Thermal',
      title: 'Thermal status',
      description:
        'A headroom gauge, Android thermal status and battery temperature, with readable zones shown only when the phone exposes them.',
      alt:
        'Device Matrix Thermal screen showing a thermal headroom gauge, Normal status, battery temperature and a readable-zones notice.',
      points: [
        'The gauge maps Android thermal headroom from 0 to 100%.',
        'Status and battery temperature sit in the details card.',
        'Missing thermal zones are labelled instead of guessed.'
      ]
    },
    {
      file: '10-battery.webp',
      label: 'Battery',
      title: 'Battery readings',
      description:
        'Charge level, charging source and battery-saver state, followed by voltage, current, power, cycle count and a live graph.',
      alt:
        'Device Matrix Battery screen showing charge level, charging over USB, battery stats, cycle count and a live current graph.',
      points: [
        'The live graph switches between mA, W and \u00b0C.',
        'Capacity and time to full are marked as estimates.',
        'Health, technology and plug type come from Android.'
      ]
    },
    {
      file: '11-storage.webp',
      label: 'Storage',
      title: 'Storage usage',
      description:
        'Internal storage used and free totals, a prompt for Usage Access before the per-app split, and shortcuts to storage tools.',
      alt:
        'Device Matrix Storage screen showing internal storage used and free, a Usage Access prompt and storage tool buttons.',
      points: [
        'Used and free space share one storage bar.',
        'Per-app usage waits for Android Usage Access.',
        'Clear app cache or open system storage settings.'
      ]
    },
    {
      file: '09-memory.webp',
      label: 'Memory',
      title: 'Memory usage',
      description:
        'A used-memory ring with total, available and threshold values, low-memory state, swap totals and RAM details when reported.',
      alt:
        'Device Matrix Memory screen showing a used-memory ring with total, available, threshold and swap memory details.',
      points: [
        'Used, available and total memory are shown together.',
        'Low-memory state and swap totals are included.',
        'Unsupported RAM details are marked not available.'
      ]
    }
  ];

  function padTwo(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function shotSource(item, theme) {
    return SHOT_ROOT + theme + '/' + item.file;
  }

  /* Build one image layer. Both themes stay in the card, stacked, so switching
     fades between two decoded images without changing the card dimensions. */
  function createScreenshotImage(item, theme, eager) {
    var image = document.createElement('img');
    image.className = 'dm-screen-card__shot';
    image.setAttribute('data-screen-image', theme);
    image.setAttribute('src', shotSource(item, theme));
    image.setAttribute(
      'width',
      theme === 'dark' && item.darkWidth ? String(item.darkWidth) : '720'
    );
    image.setAttribute(
      'height',
      theme === 'dark' && item.darkHeight ? String(item.darkHeight) : '1532'
    );
    image.setAttribute(
      'alt',
      (theme === 'light' ? 'Light theme: ' : 'Dark theme: ') + item.alt
    );
    image.setAttribute('loading', eager ? 'eager' : 'lazy');
    image.setAttribute('decoding', 'async');
    image.setAttribute('draggable', 'false');

    if (theme === 'light') {
      image.className += ' is-active';
      image.setAttribute('aria-hidden', 'false');
    } else {
      image.setAttribute('aria-hidden', 'true');
    }

    if (eager) {
      image.setAttribute('fetchpriority', 'high');
    }

    return image;
  }

  function createScreenCard(item, index, eager) {
    var card = document.createElement('li');
    card.className = 'dm-screen-card';
    card.setAttribute('data-screen-card', '');
    card.setAttribute('data-screen-index', String(index));
    card.setAttribute('data-screen-theme', 'light');

    var media = document.createElement('div');
    media.className = 'dm-screen-card__media';

    /* Reuse the same phone treatment as the hero and feature figures: the
       screenshots sit inside a bezel, never as bare rectangles. */
    var frame = document.createElement('div');
    frame.className = 'dm-screen-card__frame';

    var screen = document.createElement('div');
    screen.className = 'dm-screen-card__screen';
    screen.appendChild(createScreenshotImage(item, 'light', eager));
    screen.appendChild(createScreenshotImage(item, 'dark', false));

    frame.appendChild(screen);
    media.appendChild(frame);

    var controls = document.createElement('div');
    controls.className = 'dm-screen-card__controls';

    var toggle = document.createElement('div');
    toggle.className = 'dm-screen-card__toggle';
    toggle.setAttribute('role', 'group');
    toggle.setAttribute('aria-label', 'Screenshot theme for ' + item.title);

    var lightButton = document.createElement('button');
    lightButton.type = 'button';
    lightButton.className = 'is-active';
    lightButton.setAttribute('data-screenshot-theme', 'light');
    lightButton.setAttribute('aria-pressed', 'true');
    lightButton.textContent = 'Light';

    var darkButton = document.createElement('button');
    darkButton.type = 'button';
    darkButton.setAttribute('data-screenshot-theme', 'dark');
    darkButton.setAttribute('aria-pressed', 'false');
    darkButton.textContent = 'Dark';

    toggle.appendChild(lightButton);
    toggle.appendChild(darkButton);
    controls.appendChild(toggle);

    var body = document.createElement('div');
    body.className = 'dm-screen-card__body';

    var eyebrow = document.createElement('span');
    eyebrow.className = 'dm-screen-card__eyebrow';
    eyebrow.textContent = padTwo(index + 1) + ' \u00b7 ' + item.label;

    var heading = document.createElement('h3');
    heading.textContent = item.title;

    var description = document.createElement('p');
    description.textContent = item.description;

    var points = document.createElement('ul');
    points.className = 'dm-screen-card__points';
    var p;
    for (p = 0; p < item.points.length; p++) {
      var point = document.createElement('li');
      point.textContent = item.points[p];
      points.appendChild(point);
    }

    body.appendChild(eyebrow);
    body.appendChild(heading);
    body.appendChild(description);
    body.appendChild(points);

    card.appendChild(media);
    card.appendChild(controls);
    card.appendChild(body);

    return card;
  }

  function applyCardTheme(card, theme) {
    card.setAttribute('data-screen-theme', theme);

    var images = card.querySelectorAll('[data-screen-image]');
    var i;
    for (i = 0; i < images.length; i++) {
      var active = images[i].getAttribute('data-screen-image') === theme;
      images[i].classList.toggle('is-active', active);
      images[i].setAttribute('aria-hidden', active ? 'false' : 'true');
    }

    var buttons = card.querySelectorAll('[data-screenshot-theme]');
    for (i = 0; i < buttons.length; i++) {
      var selected = buttons[i].getAttribute('data-screenshot-theme') === theme;
      buttons[i].classList.toggle('is-active', selected);
      buttons[i].setAttribute('aria-pressed', selected ? 'true' : 'false');
    }
  }

  /* Theme controls are delegated so cloned carousel cards, which have no
     copied listeners, still switch the same screen in every copy. */
  function bindCardThemes(container) {
    container.addEventListener('click', function (event) {
      var button = event.target;
      while (
        button &&
        button !== container &&
        !button.hasAttribute('data-screenshot-theme')
      ) {
        button = button.parentNode;
      }
      if (!button || button === container) {
        return;
      }

      var card = button;
      while (
        card &&
        card !== container &&
        !card.hasAttribute('data-screen-card')
      ) {
        card = card.parentNode;
      }
      if (!card || card === container) {
        return;
      }

      var theme = button.getAttribute('data-screenshot-theme');
      var index = card.getAttribute('data-screen-index');
      var cards = container.querySelectorAll(
        '[data-screen-index="' + index + '"]'
      );
      for (var c = 0; c < cards.length; c++) {
        applyCardTheme(cards[c], theme);
      }
    });
  }

  function setupScreenGrids() {
    var grids = document.querySelectorAll('[data-dm-screen-grid]');
    var g;
    for (g = 0; g < grids.length; g++) {
      var grid = grids[g];
      if (grid.getAttribute('data-rendered') === 'true') {
        continue;
      }
      grid.setAttribute('data-rendered', 'true');

      var s;
      for (s = 0; s < SCREENSHOTS.length; s++) {
        grid.appendChild(createScreenCard(SCREENSHOTS[s], s, false));
      }
      bindCardThemes(grid);
    }
  }

  function prepareClone(card) {
    card.setAttribute('aria-hidden', 'true');
    card.setAttribute('data-carousel-clone', 'true');
    card.inert = true;

    var buttons = card.querySelectorAll('button');
    var b;
    for (b = 0; b < buttons.length; b++) {
      buttons[b].setAttribute('tabindex', '-1');
    }

    var images = card.querySelectorAll('img');
    var i;
    for (i = 0; i < images.length; i++) {
      images[i].setAttribute('loading', 'lazy');
      images[i].removeAttribute('fetchpriority');
    }
  }

  function setCardInteractive(card, interactive) {
    card.inert = !interactive;
    if (interactive) {
      card.removeAttribute('aria-hidden');
    } else {
      card.setAttribute('aria-hidden', 'true');
    }

    var buttons = card.querySelectorAll('button');
    var b;
    for (b = 0; b < buttons.length; b++) {
      if (interactive) {
        buttons[b].removeAttribute('tabindex');
      } else {
        buttons[b].setAttribute('tabindex', '-1');
      }
    }
  }

  function setupCarousel(carousel, reducedMotion) {
    var track = carousel.querySelector('[data-carousel-track]');
    var viewport = carousel.querySelector('[data-carousel-viewport]');
    var dotsWrap = carousel.querySelector('[data-carousel-dots]');
    var previous = carousel.querySelector('[data-carousel-prev]');
    var next = carousel.querySelector('[data-carousel-next]');
    var status = carousel.querySelector('[data-carousel-status]');

    if (
      !track ||
      !viewport ||
      !dotsWrap ||
      !previous ||
      !next ||
      track.getAttribute('data-built') === 'true'
    ) {
      return;
    }
    track.setAttribute('data-built', 'true');

    var total = SCREENSHOTS.length;
    var realCards = [];
    var dots = [];
    var i;

    for (i = 0; i < total; i++) {
      realCards.push(createScreenCard(SCREENSHOTS[i], i, i < 2));
    }

    /* A full copy of the set on each side lets the track wrap without a jump.
       Clones are hidden from assistive technology and cannot receive focus. */
    for (i = 0; i < total; i++) {
      var before = realCards[i].cloneNode(true);
      prepareClone(before);
      track.appendChild(before);
    }
    for (i = 0; i < total; i++) {
      track.appendChild(realCards[i]);
    }
    for (i = 0; i < total; i++) {
      var after = realCards[i].cloneNode(true);
      prepareClone(after);
      track.appendChild(after);
    }

    bindCardThemes(track);

    var step = 0;
    var currentLogical = 0;
    var targetLogical = 0;
    var physical = total;
    var moving = false;
    var queued = null;
    var moveTimer = null;
    var resizeFrame = null;

    function measure() {
      if (realCards.length > 1) {
        step = realCards[1].offsetLeft - realCards[0].offsetLeft;
      }
      if (!step) {
        step = realCards[0].getBoundingClientRect().width + 16;
      }
    }

    function setTransform(index, animate) {
      if (!animate) {
        track.classList.add('is-instant');
      }
      track.style.transform =
        'translate3d(' + -(index * step) + 'px, 0, 0)';
      if (!animate) {
        void track.offsetWidth;
        track.classList.remove('is-instant');
      }
    }

    function updateStatus(index) {
      if (status) {
        status.textContent =
          'Screen ' +
          (index + 1) +
          ' of ' +
          total +
          ': ' +
          SCREENSHOTS[index].title;
      }
    }

    function updateDots() {
      var d;
      for (d = 0; d < dots.length; d++) {
        var active = d === currentLogical;
        dots[d].classList.toggle('is-active', active);
        if (active) {
          dots[d].setAttribute('aria-current', 'true');
        } else {
          dots[d].removeAttribute('aria-current');
        }
      }
    }

    function updateAccessibility() {
      var viewRect = viewport.getBoundingClientRect();
      var c;
      for (c = 0; c < realCards.length; c++) {
        var rect = realCards[c].getBoundingClientRect();
        var visibleWidth =
          Math.min(rect.right, viewRect.right) -
          Math.max(rect.left, viewRect.left);
        var focused = realCards[c].contains(document.activeElement);
        setCardInteractive(
          realCards[c],
          visibleWidth > Math.min(rect.width * 0.5, 160) || focused
        );
      }
    }

    function finishMove() {
      moveTimer = null;
      currentLogical = targetLogical;

      var settled = total + currentLogical;
      if (physical !== settled) {
        physical = settled;
        setTransform(settled, false);
      }

      moving = false;
      updateDots();
      updateAccessibility();

      if (queued !== null) {
        var queuedTarget = queued;
        queued = null;
        if (queuedTarget !== currentLogical) {
          var forward = (queuedTarget - currentLogical + total) % total;
          goTo(queuedTarget, forward <= total / 2 ? 1 : -1);
        }
      }
    }

    function goTo(target, direction) {
      if (target === currentLogical && !moving) {
        return;
      }

      moving = true;
      targetLogical = target;

      var physicalTarget;
      if (direction > 0 && currentLogical === total - 1 && target === 0) {
        physicalTarget = total * 2;
      } else if (
        direction < 0 &&
        currentLogical === 0 &&
        target === total - 1
      ) {
        physicalTarget = total - 1;
      } else {
        physicalTarget = total + target;
      }

      physical = physicalTarget;
      setTransform(physicalTarget, !reducedMotion);
      updateStatus(target);

      moveTimer = window.setTimeout(
        finishMove,
        reducedMotion ? 0 : 460
      );
    }

    function directionFor(target) {
      var forward = (target - currentLogical + total) % total;
      return forward <= total / 2 ? 1 : -1;
    }

    function requestTarget(target) {
      if (target === currentLogical && !moving) {
        return;
      }
      if (moving) {
        queued = target;
        return;
      }
      goTo(target, directionFor(target));
    }

    function stepBy(direction) {
      var base = queued !== null ? queued : moving ? targetLogical : currentLogical;
      var target = (base + direction + total) % total;
      if (moving) {
        queued = target;
      } else {
        goTo(target, direction);
      }
    }

    for (i = 0; i < total; i++) {
      (function (dotIndex) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'dm-carousel__dot';
        dot.setAttribute(
          'aria-label',
          'Show screen ' +
            (dotIndex + 1) +
            ': ' +
            SCREENSHOTS[dotIndex].title
        );
        dot.addEventListener('click', function () {
          requestTarget(dotIndex);
        });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      })(i);
    }

    previous.addEventListener('click', function () {
      stepBy(-1);
    });

    next.addEventListener('click', function () {
      stepBy(1);
    });

    viewport.addEventListener('keydown', function (event) {
      if (event.target !== viewport) {
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stepBy(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepBy(1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        requestTarget(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        requestTarget(total - 1);
      }
    });

    var touchStartX = 0;
    var touchStartY = 0;
    var touching = false;

    viewport.addEventListener(
      'touchstart',
      function (event) {
        if (event.touches.length !== 1) {
          touching = false;
          return;
        }
        touching = true;
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      },
      { passive: true }
    );

    viewport.addEventListener(
      'touchend',
      function (event) {
        if (!touching) {
          return;
        }
        touching = false;
        var touch = event.changedTouches[0];
        var deltaX = touch.clientX - touchStartX;
        var deltaY = touch.clientY - touchStartY;
        if (
          Math.abs(deltaX) < 42 ||
          Math.abs(deltaX) < Math.abs(deltaY) * 1.2
        ) {
          return;
        }
        stepBy(deltaX < 0 ? 1 : -1);
      },
      { passive: true }
    );

    viewport.addEventListener(
      'touchcancel',
      function () {
        touching = false;
      },
      { passive: true }
    );

    function handleResize() {
      if (resizeFrame) {
        return;
      }
      resizeFrame = window.requestAnimationFrame(function () {
        resizeFrame = null;
        measure();
        setTransform(physical, false);
        updateAccessibility();
      });
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    function preloadLightScreens() {
      var p;
      for (p = 0; p < total; p++) {
        var image = new Image();
        image.decoding = 'async';
        image.src = shotSource(SCREENSHOTS[p], 'light');
      }
    }

    if (document.readyState === 'complete') {
      window.setTimeout(preloadLightScreens, 400);
    } else {
      window.addEventListener('load', function () {
        window.setTimeout(preloadLightScreens, 400);
      });
    }

    measure();
    setTransform(physical, false);
    updateDots();
    updateStatus(0);
    updateAccessibility();
  }

  function setupCarousels() {
    var carousels = document.querySelectorAll('[data-dm-carousel]');
    var reducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var c;
    for (c = 0; c < carousels.length; c++) {
      setupCarousel(carousels[c], reducedMotion);
    }
  }

  /* ------------------------------------------------------------------ */
  /* 4b. Home screenshot theme preview                                   */
  /* ------------------------------------------------------------------ */
  function setupHomePreview() {
    var preview = document.querySelector('[data-dm-home-preview]');
    if (!preview) {
      return;
    }

    var images = preview.querySelectorAll('[data-dm-home-image]');
    var buttons = preview.querySelectorAll('[data-dm-home-theme]');
    var controls = preview.querySelector('[data-dm-home-controls]');
    var intervalValue = parseInt(preview.getAttribute('data-preview-interval'), 10);
    var interval = intervalValue > 0 ? intervalValue : 2600;
    var resumeDelay = 9000;
    var currentTheme = 'light';
    var autoTimer = null;
    var resumeTimer = null;
    var visible = true;
    var reducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!images.length || !buttons.length) {
      return;
    }

    if (controls) {
      controls.hidden = false;
    }

    function applyTheme(targetTheme, manual) {
      currentTheme = targetTheme;
      var i;
      for (i = 0; i < images.length; i++) {
        var active =
          images[i].getAttribute('data-dm-home-image') === targetTheme;
        images[i].classList.toggle('is-active', active);
        images[i].setAttribute('aria-hidden', active ? 'false' : 'true');
      }
      for (i = 0; i < buttons.length; i++) {
        var selected =
          buttons[i].getAttribute('data-dm-home-theme') === targetTheme;
        buttons[i].setAttribute(
          'aria-pressed',
          selected ? 'true' : 'false'
        );
        buttons[i].classList.toggle('is-active', selected);
      }

      if (manual) {
        stopAuto();
        scheduleResume();
      }
    }

    function stopAuto() {
      if (autoTimer !== null) {
        window.clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    function clearResume() {
      if (resumeTimer !== null) {
        window.clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    }

    function startAuto() {
      stopAuto();
      if (reducedMotion || !visible || document.hidden) {
        return;
      }
      autoTimer = window.setInterval(function () {
        applyTheme(currentTheme === 'light' ? 'dark' : 'light', false);
      }, interval);
    }

    function scheduleResume() {
      clearResume();
      resumeTimer = window.setTimeout(function () {
        resumeTimer = null;
        startAuto();
      }, resumeDelay);
    }

    var b;
    for (b = 0; b < buttons.length; b++) {
      buttons[b].addEventListener('click', function () {
        applyTheme(this.getAttribute('data-dm-home-theme'), true);
      });
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          visible = entries[0].isIntersecting;
          if (visible) {
            startAuto();
          } else {
            stopAuto();
            clearResume();
          }
        },
        { rootMargin: '160px 0px' }
      );
      observer.observe(preview);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopAuto();
        clearResume();
      } else if (visible) {
        startAuto();
      }
    });

    window.addEventListener('pagehide', function () {
      stopAuto();
      clearResume();
    });

    startAuto();
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
      '<img class="install-bar__icon" src="/public/assets/device-matrix/logo/dm-logo.svg" alt="" width="38" height="38">' +
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

  setupScreenGrids();
  setupCarousels();
  setupReveal();
  applyPrivacyIndexing();
  setupHomePreview();
  setupMobileInstallBar();
  applyPlayStoreUrl();
})();
