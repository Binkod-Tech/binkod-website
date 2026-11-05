/* ==========================================================================
   BINKOD Tech — home.js
   Homepage-only behaviour:
   1. Scroll reveal (content stays visible if JavaScript fails).
   2. The BINKOD Tech blog rail: native horizontal scrolling, touch swipe,
      arrow controls and keyboard support. No autoplay and no dependencies.
   3. The decorative hero phone slider: one app screen at a time, paused
      off-screen, in a hidden tab and for reduced-motion visitors.
   4. Randomised technology labels on the hero technology orbit.
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

  setupReveal();
  setupBlogRail();
  setupHeroShowcase();
  setupOrbitLabels();
})();
