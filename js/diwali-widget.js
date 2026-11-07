/* ==========================================================================
   BINKOD TECH — Diwali widget (root home page only)

   TEMPORARY FESTIVE FEATURE.
   A transparent Diwali scene: a lit diya floats in a soft, low-opacity smoke
   haze while decorated crackers slowly orbit it in a 3D ellipse. Items behind
   the diya shrink, dim and blur; items in front grow, brighten and sharpen.
   A single canvas adds embers, fountains, sparkler trails and layered
   fireworks. The panel has no background, border or box; only the close
   button and the floating diya button accept pointer events.

   The greeting opens by default, can be closed from its X button and reopened
   from the round diya button. The choice is remembered for the browser
   session. The widget expires automatically after DIWALI_DEADLINE (India
   Standard Time) and then removes itself, restoring the Device Matrix
   promotion to its normal root-page behaviour.

   To remove the festive feature completely after the festival:
   1. Delete this file, /css/diwali-widget.css and /public/assets/diwali/.
   2. Remove the two tagged lines (stylesheet + script) from index.html.
   3. Remove the block marked "Temporary Diwali coordination" in js/dm-promo.js.
   No other page or script depends on it.

   Accessibility: decorative artwork is aria-hidden, the close and reopen
   controls are real buttons with labels, Escape closes the panel, focus is
   returned to the diya button, and all effects stop under
   prefers-reduced-motion, while the tab is hidden, or after expiry.
   ========================================================================== */
(function () {
  'use strict';

  /* Change this single value to move the end of the festive feature. */
  var DIWALI_DEADLINE = new Date('2026-11-10T23:59:59+05:30').getTime();

  var SESSION_KEY = 'binkod-diwali-widget';
  var ROOT_PATH = /^\/(index\.html)?$/;
  var MAX_PARTICLES = 200;
  var TAU = Math.PI * 2;
  var ASSET_ROOT = '/public/assets/diwali/';

  /* Saffron, deep orange, marigold, warm yellow, gold, with deep blue and a
     touch of magenta reserved for the firework sparks. */
  var COLORS = [
    '#ffd166',
    '#ffb347',
    '#ff8a1f',
    '#ff4fa3',
    '#e05a9c',
    '#5b8cff',
    '#8ab4ff',
    '#fff3e0'
  ];

  var SPARKLE_COLORS = [
    '#fff3e0',
    '#ffd166',
    '#ff4fa3',
    '#5b8cff',
    '#8ab4ff'
  ];

  /* Each item orbits on its own calm ellipse: a full lap takes 15-20s.
     `width` is a percentage of the panel width, `ratio` is height / width. */
  var ORBIT_ITEMS = [
    {
      key: 'anaar',
      src: ASSET_ROOT + 'anaar.svg',
      width: 13,
      ratio: 200 / 160,
      phase: 0,
      period: 16.5,
      wobble: 0.008,
      bob: 0.006,
      wobbleSpeed: 0.52,
      tiltBase: -5,
      tiltAmp: 13,
      tiltSpeed: 0.5,
      emitter: 'anaar'
    },
    {
      key: 'rocket',
      src: ASSET_ROOT + 'rocket.svg',
      width: 7,
      ratio: 280 / 90,
      phase: 0.79,
      period: 18.5,
      wobble: 0.006,
      bob: 0.007,
      wobbleSpeed: 0.44,
      tiltBase: -10,
      tiltAmp: 15,
      tiltSpeed: 0.6
    },
    {
      key: 'chakri',
      src: ASSET_ROOT + 'chakri.svg',
      width: 11,
      ratio: 1,
      phase: 1.57,
      period: 15,
      wobble: 0.007,
      bob: 0.005,
      wobbleSpeed: 0.58,
      tiltBase: 0,
      tiltAmp: 12,
      tiltSpeed: 0.55,
      emitter: 'chakri'
    },
    {
      key: 'bomb',
      src: ASSET_ROOT + 'bomb.svg',
      width: 8,
      ratio: 200 / 130,
      phase: 2.36,
      period: 19.5,
      wobble: 0.009,
      bob: 0.006,
      wobbleSpeed: 0.47,
      tiltBase: 7,
      tiltAmp: 14,
      tiltSpeed: 0.62
    },
    {
      key: 'fuljhadi',
      src: ASSET_ROOT + 'fuljhadi.svg',
      width: 6.5,
      ratio: 300 / 90,
      phase: 3.14,
      period: 17,
      wobble: 0.006,
      bob: 0.007,
      wobbleSpeed: 0.64,
      tiltBase: -8,
      tiltAmp: 18,
      tiltSpeed: 0.7,
      emitter: 'fuljhadi'
    },
    {
      key: 'fuljhadi-two',
      src: ASSET_ROOT + 'fuljhadi.svg',
      width: 5.5,
      ratio: 300 / 90,
      phase: 3.93,
      period: 20,
      wobble: 0.007,
      bob: 0.005,
      wobbleSpeed: 0.55,
      tiltBase: 9,
      tiltAmp: 16,
      tiltSpeed: 0.65,
      emitter: 'fuljhadi'
    },
    {
      key: 'star',
      src: ASSET_ROOT + 'star.svg',
      width: 6,
      ratio: 1,
      phase: 4.71,
      period: 15.5,
      wobble: 0.01,
      bob: 0.008,
      wobbleSpeed: 0.72,
      tiltBase: 0,
      tiltAmp: 22,
      tiltSpeed: 0.8
    },
    {
      key: 'star-two',
      src: ASSET_ROOT + 'star.svg',
      width: 4.5,
      ratio: 1,
      phase: 5.5,
      period: 18,
      wobble: 0.009,
      bob: 0.007,
      wobbleSpeed: 0.66,
      tiltBase: 6,
      tiltAmp: 20,
      tiltSpeed: 0.74
    }
  ];

  var isRootPage = ROOT_PATH.test(window.location.pathname);
  var isActive = isRootPage && Date.now() <= DIWALI_DEADLINE;

  /* js/dm-promo.js reads this flag: while true, the Device Matrix ticket
     stays collapsed on the root page. If this script is absent or expired,
     the flag is false/undefined and the promotion keeps its old behaviour. */
  window.BINKOD_DIWALI_ACTIVE = isActive;

  if (!isActive) {
    return;
  }

  var root = document.documentElement;
  var widget = null;
  var fab = null;
  var closeButton = null;
  var canvas = null;
  var context = null;
  var isOpen = false;

  var orbitItems = [];
  var particles = [];
  var elapsed = 0;
  var rafId = 0;
  var lastFrame = 0;
  var viewWidth = 0;
  var viewHeight = 0;
  var pixelRatio = 1;
  var emitDiya = 0;
  var burstTimer = 0.8;
  var showerTimer = 1.2;
  var popTimer = 2.4;
  var rocketTimer = 4.2;

  var expiryTimer = 0;
  var resizeFrame = 0;
  var resizeObserver = null;

  var motionQuery =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var reducedMotion = !!(motionQuery && motionQuery.matches);

  /* ------------------------------------------------------------------ */
  /* Session preference                                                 */
  /* ------------------------------------------------------------------ */
  function readPreference() {
    try {
      return window.sessionStorage.getItem(SESSION_KEY);
    } catch (error) {
      return null;
    }
  }

  function storePreference(value) {
    try {
      window.sessionStorage.setItem(SESSION_KEY, value);
    } catch (error) {
      /* Storage can be unavailable in private modes; the widget still works. */
    }
  }

  function forgetPreference() {
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      /* Ignore. */
    }
  }

  var startOpen = readPreference() !== 'closed';

  /* ------------------------------------------------------------------ */
  /* Markup                                                             */
  /* ------------------------------------------------------------------ */
  function buildWidget() {
    var panel = document.createElement('section');
    panel.id = 'diwali-widget';
    panel.className = 'diwali';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Diwali greetings');
    if (!startOpen) {
      panel.setAttribute('aria-hidden', 'true');
      panel.setAttribute('inert', '');
    }
    panel.innerHTML =
      '<div class="diwali__scene" aria-hidden="true">' +
      '<div class="diwali__haze"></div>' +
      '<div class="diwali__smoke"><span></span><span></span><span></span><span></span></div>' +
      '<div class="diwali__halo"></div>' +
      '<canvas class="diwali__canvas"></canvas>' +
      '<img class="diwali__diya" src="/public/assets/diwali/diya.svg" alt="" width="240" height="150" decoding="async" draggable="false">' +
      '<img class="diwali__flame" src="/public/assets/diwali/flame.svg" alt="" width="90" height="170" decoding="async" draggable="false">' +
      '</div>' +
      '<div class="diwali__message">' +
      '<p class="diwali__greeting-hi" lang="hi">शुभ दीपावली</p>' +
      '<p class="diwali__greeting">Happy Diwali</p>' +
      '</div>' +
      '<button class="diwali__close" type="button" aria-label="Close Diwali greetings">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true" focusable="false">' +
      '<path d="M6 6l12 12M18 6L6 18"></path></svg>' +
      '</button>';

    var button = document.createElement('button');
    button.id = 'diwali-fab';
    button.className = 'diwali-fab';
    button.type = 'button';
    button.setAttribute('aria-label', 'Open Diwali greetings');
    button.setAttribute('aria-controls', 'diwali-widget');
    button.setAttribute('aria-expanded', startOpen ? 'true' : 'false');
    button.setAttribute('title', 'Open Diwali greetings');
    button.innerHTML =
      '<img src="/public/assets/diwali/diya-icon.svg" alt="" width="48" height="48" decoding="async" draggable="false">';
    button.hidden = startOpen;

    document.body.appendChild(panel);
    document.body.appendChild(button);

    return { panel: panel, button: button };
  }

  function createOrbitItems() {
    var scene = widget.querySelector('.diwali__scene');
    var i;
    var spec;
    var item;
    var image;

    for (i = 0; i < ORBIT_ITEMS.length; i++) {
      spec = ORBIT_ITEMS[i];
      item = {};
      for (var key in spec) {
        if (Object.prototype.hasOwnProperty.call(spec, key)) {
          item[key] = spec[key];
        }
      }
      item.el = document.createElement('div');
      item.el.className =
        'diwali__orbit-item diwali__orbit-item--' + item.key;
      item.el.setAttribute('aria-hidden', 'true');
      item.el.style.width = item.width + '%';

      image = document.createElement('img');
      image.src = item.src;
      image.alt = '';
      image.decoding = 'async';
      image.draggable = false;
      if (item.key === 'chakri') {
        image.className = 'diwali__spin';
      }
      item.el.appendChild(image);

      item.accum = randomBetween(0, 0.3);
      item.height = 0;
      item.x = 0;
      item.y = 0;
      scene.appendChild(item.el);
      orbitItems.push(item);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Open / close                                                       */
  /* ------------------------------------------------------------------ */
  function updateDockHeight() {
    var height = isOpen
      ? widget.offsetHeight
      : fab.offsetHeight || 40;
    if (height > 0) {
      root.style.setProperty('--diwali-dock', height + 'px');
    }
  }

  function syncUi(open) {
    isOpen = open;
    if (open) {
      widget.classList.add('is-open');
      widget.removeAttribute('inert');
      widget.setAttribute('aria-hidden', 'false');
      fab.hidden = true;
      fab.setAttribute('aria-expanded', 'true');
    } else {
      widget.classList.remove('is-open');
      widget.setAttribute('inert', '');
      widget.setAttribute('aria-hidden', 'true');
      fab.hidden = false;
      fab.setAttribute('aria-expanded', 'false');
    }
    storePreference(open ? 'open' : 'closed');
    updateDockHeight();
    if (open) {
      startEffects();
    } else {
      stopEffects();
    }
  }

  function openWidget(moveFocus) {
    if (isOpen) {
      return;
    }
    syncUi(true);
    if (moveFocus) {
      closeButton.focus({ preventScroll: true });
    }
  }

  function closeWidget(moveFocus) {
    if (!isOpen) {
      return;
    }
    syncUi(false);
    if (moveFocus) {
      fab.focus({ preventScroll: true });
    }
  }

  function handleKeydown(event) {
    if (!isOpen || event.key !== 'Escape') {
      return;
    }
    event.preventDefault();
    closeWidget(true);
  }

  /* ------------------------------------------------------------------ */
  /* Orbit layout                                                       */
  /* ------------------------------------------------------------------ */
  function updateOrbit(time) {
    if (!orbitItems.length) {
      return;
    }
    var width = viewWidth || (widget ? widget.clientWidth : 0);
    var height = viewHeight || (widget ? widget.clientHeight : 0);
    if (!width || !height) {
      return;
    }
    var centreX = width * 0.5;
    var centreY = height * 0.67;
    var radiusX = width * 0.34;
    var radiusY = height * 0.2;
    var i;
    var item;
    var angle;
    var depth;
    var front;
    var x;
    var y;
    var scale;
    var tilt;
    var itemWidth;

    for (i = 0; i < orbitItems.length; i++) {
      item = orbitItems[i];
      angle = item.phase + time * (TAU / item.period);
      depth = Math.sin(angle);
      front = (depth + 1) / 2;

      x = centreX + Math.cos(angle) * radiusX;
      y = centreY + depth * radiusY;

      /* Small zigzag and bobbing on top of the clean ellipse. */
      x +=
        Math.sin(time * item.wobbleSpeed + item.phase * 2.3) *
        width *
        item.wobble;
      y +=
        Math.cos(time * item.wobbleSpeed * 0.83 + item.phase) *
        height *
        item.bob;

      scale = 0.5 + front * 0.8;
      tilt =
        item.tiltBase +
        Math.sin(time * item.tiltSpeed + item.phase) * item.tiltAmp;

      item.el.style.transform =
        'translate3d(' +
        x.toFixed(1) +
        'px,' +
        y.toFixed(1) +
        'px,0) translate(-50%,-100%) rotate(' +
        tilt.toFixed(1) +
        'deg) scale(' +
        scale.toFixed(3) +
        ')';
      item.el.style.opacity = (0.55 + front * 0.45).toFixed(3);
      item.el.style.filter =
        front > 0.97 ? 'none' : 'blur(' + ((1 - front) * 1.2).toFixed(2) + 'px)';
      item.el.style.zIndex = depth >= 0 ? '4' : '2';

      itemWidth = (width * item.width) / 100;
      item.height = itemWidth * item.ratio * scale;
      item.x = x;
      item.y = y;
      item.scale = scale;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Canvas particles                                                   */
  /* ------------------------------------------------------------------ */
  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function pickColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  function pickSparkleColor() {
    return SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
  }

  function addParticle(options) {
    if (particles.length >= MAX_PARTICLES) {
      return;
    }
    particles.push({
      x: options.x,
      y: options.y,
      px: options.x,
      py: options.y,
      vx: options.vx || 0,
      vy: options.vy || 0,
      life: options.life,
      maxLife: options.life,
      color: options.color || '#ffd166',
      size: options.size || 1.5,
      gravity: options.gravity || 0,
      kind: options.kind || 'spark',
      twinkle: !!options.twinkle,
      seed: Math.random() * 20
    });
  }

  function ensureCanvasSize() {
    if (!canvas || !context) {
      return false;
    }
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
    if (!width || !height) {
      return false;
    }
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    var pixelWidth = Math.round(width * pixelRatio);
    var pixelHeight = Math.round(height * pixelRatio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    viewWidth = width;
    viewHeight = height;
    return true;
  }

  function startEffects() {
    if (rafId || reducedMotion || document.hidden || !isOpen) {
      return;
    }
    if (!ensureCanvasSize()) {
      return;
    }
    updateOrbit(elapsed);
    lastFrame = 0;
    rafId = window.requestAnimationFrame(frame);
  }

  function stopEffects() {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
    particles.length = 0;
    emitDiya = 0;
    for (var i = 0; i < orbitItems.length; i++) {
      orbitItems[i].accum = 0;
    }
    if (context && viewWidth && viewHeight) {
      context.clearRect(0, 0, viewWidth, viewHeight);
    }
  }

  function spawnDiyaEmber() {
    addParticle({
      x: viewWidth * 0.5 + randomBetween(-viewWidth * 0.015, viewWidth * 0.015),
      y: viewHeight * 0.69,
      vx: randomBetween(-10, 10),
      vy: randomBetween(-48, -24),
      life: randomBetween(0.55, 1),
      color: Math.random() < 0.55 ? '#ffd166' : '#ff9f1c',
      size: randomBetween(1, 1.8),
      gravity: 18,
      kind: 'spark'
    });
  }

  function spawnAnaarSpark(item) {
    addParticle({
      x: item.x + randomBetween(-4, 4),
      y: item.y - item.height * 0.76,
      vx: randomBetween(-46, 46),
      vy: randomBetween(-260, -170),
      life: randomBetween(0.7, 1.2),
      color: Math.random() < 0.4 ? '#fff3e0' : '#ff9f1c',
      size: randomBetween(1.2, 2.2),
      gravity: 180,
      kind: 'trail'
    });
  }

  function spawnFuljhadiSpark(item) {
    addParticle({
      x: item.x + randomBetween(-3, 3),
      y: item.y - item.height * 0.74,
      vx: randomBetween(-120, 120),
      vy: randomBetween(-105, 40),
      life: randomBetween(0.32, 0.65),
      color: Math.random() < 0.5 ? '#fff3e0' : '#ffd166',
      size: randomBetween(1.1, 2),
      gravity: 120,
      kind: 'trail'
    });
  }

  function spawnChakriSpark(item) {
    var angle = randomBetween(0, TAU);
    var radius = item.height * randomBetween(0.16, 0.28);

    addParticle({
      x: item.x + Math.cos(angle) * radius,
      y: item.y - item.height * 0.5 + Math.sin(angle) * radius * 0.5,
      vx: Math.cos(angle) * randomBetween(55, 120),
      vy: Math.sin(angle) * randomBetween(25, 65) - 20,
      life: randomBetween(0.3, 0.6),
      color: Math.random() < 0.5 ? '#fff3e0' : '#ffb347',
      size: randomBetween(1, 1.8),
      gravity: 80,
      kind: 'trail'
    });
  }

  function spawnBurstAt(originX, originY, shape) {
    var unit = Math.max(
      0.55,
      Math.min(1.25, Math.min(viewWidth, viewHeight) / 350)
    );
    var count = shape === 'star' ? 12 : 16;
    var first = pickColor();
    var second = pickColor();
    var i;
    var angle;
    var speed;

    addParticle({
      x: originX,
      y: originY,
      life: 0.2,
      color: '#fff8e1',
      size: 8 * unit,
      kind: 'flash'
    });

    for (i = 0; i < count; i++) {
      angle = (TAU * i) / count + randomBetween(-0.1, 0.1);
      if (shape === 'star') {
        speed = (i % 2 === 0 ? 115 : 55) * unit * randomBetween(0.85, 1.15);
      } else {
        speed = randomBetween(60, 135) * unit;
      }
      addParticle({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: randomBetween(0.85, 1.4),
        color: i % 2 ? first : second,
        size: randomBetween(1.3, 2.6),
        gravity: 42,
        kind: 'trail'
      });
    }
  }

  function spawnSparkleShower() {
    var i;
    for (i = 0; i < 11; i++) {
      addParticle({
        x: randomBetween(viewWidth * 0.06, viewWidth * 0.94),
        y: randomBetween(viewHeight * 0.05, viewHeight * 0.68),
        vx: randomBetween(-18, 18),
        vy: randomBetween(12, 52),
        life: randomBetween(1.2, 2.2),
        color: pickSparkleColor(),
        size: randomBetween(0.8, 1.7),
        gravity: 12,
        kind: 'spark',
        twinkle: true
      });
    }
  }

  function spawnCrackerPop() {
    var candidates = [];
    var i;
    var item;
    var count;
    var angle;
    var speed;

    for (i = 0; i < orbitItems.length; i++) {
      item = orbitItems[i];
      if (!item.emitter || item.emitter === 'fuljhadi') {
        candidates.push(item);
      }
    }
    if (!candidates.length) {
      return;
    }
    item = candidates[Math.floor(Math.random() * candidates.length)];
    var originX = item.x;
    var originY = item.y - item.height * 0.5;

    addParticle({
      x: originX,
      y: originY,
      life: 0.18,
      color: '#fff8e1',
      size: 6,
      kind: 'flash'
    });

    count = 9;
    for (i = 0; i < count; i++) {
      angle = randomBetween(0, TAU);
      speed = randomBetween(24, 74);
      addParticle({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: randomBetween(0.35, 0.75),
        color: Math.random() < 0.5 ? '#ffb347' : '#ff4fa3',
        size: randomBetween(1, 2),
        gravity: 24,
        kind: 'trail'
      });
    }
  }

  function spawnRocket() {
    var unit = Math.max(
      0.55,
      Math.min(1.25, Math.min(viewWidth, viewHeight) / 350)
    );
    addParticle({
      x: viewWidth * randomBetween(0.16, 0.84),
      y: viewHeight * randomBetween(0.78, 0.88),
      vx: randomBetween(-8, 8),
      vy: randomBetween(-235, -195) * unit,
      life: randomBetween(0.95, 1.2),
      color: '#fff3e0',
      size: 2,
      gravity: 0,
      kind: 'rocket'
    });
  }

  function emitParticles(delta) {
    var i;
    var item;
    var interval;

    emitDiya += delta;
    while (emitDiya >= 0.32 && particles.length < MAX_PARTICLES) {
      emitDiya -= 0.32;
      spawnDiyaEmber();
    }

    for (i = 0; i < orbitItems.length; i++) {
      item = orbitItems[i];
      if (!item.emitter) {
        continue;
      }
      interval =
        item.emitter === 'anaar' ? 0.055 : item.emitter === 'chakri' ? 0.09 : 0.05;
      item.accum += delta;
      while (item.accum >= interval && particles.length < MAX_PARTICLES) {
        item.accum -= interval;
        if (item.emitter === 'anaar') {
          spawnAnaarSpark(item);
        } else if (item.emitter === 'chakri') {
          spawnChakriSpark(item);
        } else {
          spawnFuljhadiSpark(item);
        }
      }
    }

    burstTimer -= delta;
    if (burstTimer <= 0) {
      burstTimer = randomBetween(0.85, 1.65);
      spawnBurstAt(
        viewWidth * randomBetween(0.1, 0.9),
        viewHeight * randomBetween(0.06, 0.5),
        Math.random() < 0.5 ? 'star' : 'radial'
      );
    }

    showerTimer -= delta;
    if (showerTimer <= 0) {
      showerTimer = randomBetween(1.4, 2.6);
      spawnSparkleShower();
    }

    popTimer -= delta;
    if (popTimer <= 0) {
      popTimer = randomBetween(2.2, 3.8);
      spawnCrackerPop();
    }

    rocketTimer -= delta;
    if (rocketTimer <= 0) {
      rocketTimer = randomBetween(4, 6.5);
      spawnRocket();
    }
  }

  function updateParticles(delta) {
    var drag = Math.pow(0.988, delta * 60);
    var i;
    var particle;

    for (i = particles.length - 1; i >= 0; i--) {
      particle = particles[i];
      particle.life -= delta;
      if (particle.life <= 0) {
        particles.splice(i, 1);
        if (particle.kind === 'rocket') {
          spawnBurstAt(
            particle.x,
            particle.y,
            Math.random() < 0.5 ? 'star' : 'radial'
          );
        }
        continue;
      }
      particle.px = particle.x;
      particle.py = particle.y;
      if (particle.kind !== 'flash' && particle.kind !== 'rocket') {
        particle.vx *= drag;
        particle.vy = particle.vy * drag + particle.gravity * delta;
      }
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
    }
  }

  function drawParticles() {
    var i;
    var particle;
    var alpha;
    var radius;

    context.clearRect(0, 0, viewWidth, viewHeight);
    context.globalCompositeOperation = 'lighter';
    context.lineCap = 'round';

    for (i = 0; i < particles.length; i++) {
      particle = particles[i];
      alpha = particle.life / particle.maxLife;
      alpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;

      if (particle.kind === 'flash') {
        radius = particle.size * (1 + (1 - alpha) * 2.2);
        context.globalAlpha = alpha * 0.85;
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, radius, 0, TAU);
        context.fill();
        context.globalAlpha = alpha * 0.55;
        context.fillStyle = '#ffffff';
        context.beginPath();
        context.arc(particle.x, particle.y, radius * 0.4, 0, TAU);
        context.fill();
        continue;
      }

      if (particle.twinkle) {
        alpha *= 0.55 + 0.45 * Math.sin(particle.life * 24 + particle.seed);
        alpha = alpha < 0.08 ? 0.08 : alpha;
      }
      context.globalAlpha = alpha;

      if (particle.kind === 'trail' || particle.kind === 'rocket') {
        context.strokeStyle = particle.color;
        context.lineWidth = particle.size;
        context.beginPath();
        context.moveTo(particle.px, particle.py);
        context.lineTo(particle.x, particle.y);
        context.stroke();
      } else {
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, TAU);
        context.fill();
      }

      if (particle.kind === 'rocket') {
        context.fillStyle = '#fffdf2';
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * 1.25, 0, TAU);
        context.fill();
      }
    }

    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
  }

  function frame(time) {
    if (!rafId) {
      return;
    }
    rafId = window.requestAnimationFrame(frame);
    if (!lastFrame) {
      lastFrame = time;
      return;
    }
    var delta = Math.min((time - lastFrame) / 1000, 0.05);
    lastFrame = time;
    elapsed += delta;
    updateOrbit(elapsed);
    emitParticles(delta);
    updateParticles(delta);
    drawParticles();
  }

  /* ------------------------------------------------------------------ */
  /* Visibility, motion preference, resize                              */
  /* ------------------------------------------------------------------ */
  function handleVisibilityChange() {
    if (document.hidden) {
      widget.classList.add('is-paused');
      stopEffects();
    } else {
      widget.classList.remove('is-paused');
      if (isOpen) {
        startEffects();
      }
      checkExpiry();
    }
  }

  function handleMotionChange(event) {
    reducedMotion = event.matches;
    if (reducedMotion) {
      stopEffects();
    } else if (isOpen && !document.hidden) {
      startEffects();
    }
  }

  function handleResize() {
    if (resizeFrame) {
      return;
    }
    resizeFrame = window.requestAnimationFrame(function () {
      resizeFrame = 0;
      updateDockHeight();
      ensureCanvasSize();
      updateOrbit(elapsed);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Expiry and cleanup                                                 */
  /* ------------------------------------------------------------------ */
  function dispatchExpired() {
    var event;
    if (typeof window.CustomEvent === 'function') {
      event = new window.CustomEvent('binkod:diwali-expired');
    } else {
      event = document.createEvent('CustomEvent');
      event.initCustomEvent('binkod:diwali-expired', false, false, null);
    }
    document.dispatchEvent(event);
  }

  function destroy(expired) {
    stopEffects();
    if (expiryTimer) {
      window.clearTimeout(expiryTimer);
      expiryTimer = 0;
    }
    if (resizeFrame) {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = 0;
    }
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('keydown', handleKeydown);
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (motionQuery) {
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', handleMotionChange);
      } else if (motionQuery.removeListener) {
        motionQuery.removeListener(handleMotionChange);
      }
    }
    if (widget && widget.parentNode) {
      widget.parentNode.removeChild(widget);
    }
    if (fab && fab.parentNode) {
      fab.parentNode.removeChild(fab);
    }
    orbitItems.length = 0;
    root.classList.remove('diwali-active');
    root.style.removeProperty('--diwali-dock');
    window.BINKOD_DIWALI_ACTIVE = false;
    forgetPreference();
    if (expired) {
      dispatchExpired();
    }
  }

  function checkExpiry() {
    if (Date.now() <= DIWALI_DEADLINE) {
      return false;
    }
    destroy(true);
    return true;
  }

  function scheduleExpiry() {
    var remaining = DIWALI_DEADLINE - Date.now();
    if (remaining <= 0) {
      destroy(true);
      return;
    }
    expiryTimer = window.setTimeout(function () {
      expiryTimer = 0;
      if (!checkExpiry()) {
        scheduleExpiry();
      }
    }, Math.min(remaining + 60, 2147483647));
  }

  /* ------------------------------------------------------------------ */
  /* Setup                                                              */
  /* ------------------------------------------------------------------ */
  function setup() {
    if (checkExpiry()) {
      return;
    }

    var built = buildWidget();
    widget = built.panel;
    fab = built.button;
    isOpen = startOpen;
    closeButton = widget.querySelector('.diwali__close');
    canvas = widget.querySelector('.diwali__canvas');
    context = canvas.getContext ? canvas.getContext('2d') : null;

    createOrbitItems();
    root.classList.add('diwali-active');
    updateDockHeight();

    if (startOpen) {
      widget.classList.add('is-open');
      widget.setAttribute('aria-hidden', 'false');
    }

    ensureCanvasSize();
    updateOrbit(0);

    closeButton.addEventListener('click', function () {
      closeWidget(true);
    });
    fab.addEventListener('click', function () {
      openWidget(true);
    });

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    if (motionQuery) {
      if (motionQuery.addEventListener) {
        motionQuery.addEventListener('change', handleMotionChange);
      } else if (motionQuery.addListener) {
        motionQuery.addListener(handleMotionChange);
      }
    }

    if ('ResizeObserver' in window) {
      resizeObserver = new window.ResizeObserver(handleResize);
      resizeObserver.observe(widget);
    }

    if (startOpen) {
      startEffects();
    }

    scheduleExpiry();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
